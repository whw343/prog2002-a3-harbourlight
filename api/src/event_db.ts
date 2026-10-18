import mysql, {RowDataPacket,ResultSetHeader} from 'mysql2/promise';
import {DateTime} from 'luxon';
import {ApiError,EventInput,RegistrationInput} from './validation';

export function createPool(config=process.env) {
  return mysql.createPool({host:config.DB_HOST||'127.0.0.1',port:Number(config.DB_PORT||3306),user:config.DB_USER,password:config.DB_PASSWORD,database:config.DB_NAME||'charityevents_a3',connectionLimit:8,timezone:'Z',dateStrings:true,decimalNumbers:true,multipleStatements:false});
}
const columns=`e.*, c.name category_name, o.name organisation_name`;
const tables=`FROM events e JOIN categories c ON c.id=e.category_id JOIN organisations o ON o.id=e.organisation_id`;
function iso(raw:string) {return raw.replace(' ','T')+'Z';}
function event(row:any) {
  const past=Date.parse(iso(row.end_at_utc))<=Date.now();
  return {id:row.id,name:row.name,startAt:iso(row.start_at_utc),endAt:iso(row.end_at_utc),venue:row.venue,city:row.city,purpose:row.purpose,description:row.description,ticketPrice:Number(row.ticket_price),fundraisingGoal:Number(row.fundraising_goal),amountRaised:Number(row.amount_raised),category:{id:row.category_id,name:row.category_name},organisation:{id:row.organisation_id,name:row.organisation_name},isSuspended:!!row.is_suspended,status:row.is_suspended?'Suspended':past?'Past':'Active',canRegister:!row.is_suspended&&!past,latitude:Number(row.latitude),longitude:Number(row.longitude),imagePath:row.image_path};
}
function sqlTime(value:string) {return DateTime.fromISO(value).toUTC().toFormat('yyyy-MM-dd HH:mm:ss');}
export function createEventDb(pool:mysql.Pool) {
  async function detail(eventId:number,admin=false) {
    const [rows]=await pool.execute<RowDataPacket[]>(`SELECT ${columns} ${tables} WHERE e.id=? ${admin?'':'AND e.is_suspended=0'}`,[eventId]);
    if(!rows.length) throw new ApiError(404,'NOT_FOUND','Event not found.');
    const contact=admin?',email,phone':'';
    const [registrations]=await pool.execute<RowDataPacket[]>(`SELECT id,full_name,ticket_quantity,registered_at${contact} FROM registrations WHERE event_id=? ORDER BY registered_at DESC,id DESC`,[eventId]);
    return {...event(rows[0]),registrations:registrations.map(r=>({id:r.id,fullName:r.full_name,ticketQuantity:Number(r.ticket_quantity),registeredAt:iso(r.registered_at),...(admin?{email:r.email,phone:r.phone}:{})}))};
  }
  return {
    async listEvents(f:{date?:string;location?:string;category?:number}={},admin=false) {
      const conditions=admin?['1=1']:['e.is_suspended=0','e.end_at_utc>UTC_TIMESTAMP()'];
      const args:any[]=[];
      if(f.date){conditions.push('e.start_local_date=?');args.push(f.date);}
      if(f.category){conditions.push('e.category_id=?');args.push(f.category);}
      if(f.location){conditions.push("(e.venue LIKE ? ESCAPE '!' OR e.city LIKE ? ESCAPE '!')");const q='%'+f.location.replace(/[!%_]/g,'!$&')+'%';args.push(q,q);}
      const [rows]=await pool.execute<RowDataPacket[]>(`SELECT ${columns},(SELECT COUNT(*) FROM registrations r WHERE r.event_id=e.id) registration_count ${tables} WHERE ${conditions.join(' AND ')} ORDER BY e.start_at_utc,e.id`,args);
      return rows.map(r=>({...event(r),registrationCount:r.registration_count}));
    },
    async categories(){const [rows]=await pool.execute('SELECT id,name FROM categories ORDER BY name');return rows;},
    async organisations(){const [rows]=await pool.execute('SELECT id,name FROM organisations ORDER BY name');return rows;},
    detail,
    async register(eventId:number,input:RegistrationInput) {
      const connection=await pool.getConnection();
      try {
        await connection.beginTransaction();
        // Serialize eligibility checks with event updates and deletion.
        const [rows]=await connection.execute<RowDataPacket[]>('SELECT id FROM events WHERE id=? AND is_suspended=0 AND end_at_utc>UTC_TIMESTAMP() FOR UPDATE',[eventId]);
        if(!rows.length) throw new ApiError(409,'REGISTRATION_CLOSED','This event is unavailable or registration has closed.');
        const [result]=await connection.execute<ResultSetHeader>('INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity) VALUES(?,?,?,?,?)',[eventId,input.fullName,input.email,input.phone,input.ticketQuantity]);
        await connection.commit();
        return {id:result.insertId,eventId,ticketQuantity:input.ticketQuantity,message:'Registration confirmed. This demonstration does not take payment.'};
      } catch(error:any) {
        await connection.rollback();
        if(error.code==='ER_DUP_ENTRY') throw new ApiError(409,'ALREADY_REGISTERED','This email is already registered for this event.');
        throw error;
      } finally {connection.release();}
    },
    async save(input:EventInput,eventId?:number) {
      const values=[input.organisationId,input.categoryId,input.name,sqlTime(input.startAt),sqlTime(input.endAt),DateTime.fromISO(input.startAt).setZone('Australia/Sydney').toISODate(),input.venue,input.city,input.purpose,input.description,input.ticketPrice,input.fundraisingGoal,input.amountRaised,input.isSuspended,input.latitude,input.longitude,input.imagePath];
      const fields=['organisation_id','category_id','name','start_at_utc','end_at_utc','start_local_date','venue','city','purpose','description','ticket_price','fundraising_goal','amount_raised','is_suspended','latitude','longitude','image_path'];
      try {
        if(eventId){
          // Lock existence instead of relying on affectedRows for unchanged edits.
          const c=await pool.getConnection();
          try {await c.beginTransaction();const [rows]=await c.execute<RowDataPacket[]>('SELECT id FROM events WHERE id=? FOR UPDATE',[eventId]);if(!rows.length) throw new ApiError(404,'NOT_FOUND','Event not found.');await c.execute(`UPDATE events SET ${fields.map(f=>f+'=?').join(',')} WHERE id=?`,[...values,eventId]);await c.commit();}catch(e){await c.rollback();throw e;}finally{c.release();}
          return await detail(eventId,true);
        }
        const [result]=await pool.execute<ResultSetHeader>(`INSERT INTO events(${fields.join(',')}) VALUES(${fields.map(()=>'?').join(',')})`,values);
        return await detail(result.insertId,true);
      }catch(e:any){if(e.code==='ER_NO_REFERENCED_ROW_2')throw new ApiError(400,'INVALID_REFERENCE','Choose an existing category and organisation.');throw e;}
    },
    async remove(eventId:number) {
      try {const [result]=await pool.execute<ResultSetHeader>('DELETE FROM events WHERE id=?',[eventId]);if(!result.affectedRows)throw new ApiError(404,'NOT_FOUND','Event not found.');}
      catch(e:any){if(e.code==='ER_ROW_IS_REFERENCED_2')throw new ApiError(409,'HAS_REGISTRATIONS','This event has registrations and cannot be deleted. Suspend it instead.');throw e;}
    }
  };
}
