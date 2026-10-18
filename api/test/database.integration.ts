import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import {once} from 'node:events';
import {createEventDb,createPool} from '../src/event_db';
import {createApp} from '../src/app';

test('Real MySQL and HTTP integration in an isolated test schema',async t=>{
  const configFile=process.env.A3_TEST_CONFIG||path.resolve('../.runtime/local-db.json');
  const config=JSON.parse(fs.readFileSync(configFile,'utf8'));
  const schema='a3_verify_'+Date.now();const username='a3t'+Date.now();const password=crypto.randomBytes(20).toString('hex');
  const admin=await mysql.createConnection({...config,multipleStatements:true,timezone:'Z',dateStrings:true,decimalNumbers:true});
  let pool:ReturnType<typeof createPool>|undefined;let server:ReturnType<ReturnType<typeof createApp>['listen']>|undefined;
  try {
    await admin.query(`CREATE DATABASE \`${schema}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await admin.query(`USE \`${schema}\``);
    const sql=fs.readFileSync('database/charityevents-a3.sql','utf8').replace(/^DELIMITER.*$/gm,'').replace(/END\$\$/g,'END;');
    await admin.query(sql);
    await admin.query(`CREATE USER '${username}'@'127.0.0.1' IDENTIFIED BY ?`,[password]);
    await admin.query(`GRANT SELECT ON \`${schema}\`.* TO '${username}'@'127.0.0.1'`);
    await admin.query(`GRANT INSERT ON \`${schema}\`.registrations TO '${username}'@'127.0.0.1'`);
    pool=createPool({DB_HOST:config.host,DB_PORT:String(config.port),DB_USER:username,DB_PASSWORD:password,DB_NAME:schema});
    server=createApp(createEventDb(pool)).listen(0,'127.0.0.1');await once(server,'listening');
    const address=server.address() as {port:number};const base=`http://127.0.0.1:${address.port}/api`;
    const get=async(p:string)=>{const r=await fetch(base+p);return {status:r.status,body:await r.json() as any};};
    const submit=async(eventId:number,body:any)=>{const r=await fetch(base+`/events/${eventId}/registrations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json() as any};};
    const reg={fullName:'Integration Guest',email:'integration@example.invalid',phone:'0400000000',ticketQuantity:2};
    await t.test('seed, statuses and category lookup',async()=>{
      const r=await get('/events');assert.equal(r.status,200);assert.equal(r.body.data.length,10);assert(!r.body.data.some((e:any)=>[11,12].includes(e.id)));
      assert.equal((await get('/categories')).body.data.length,5);
      const [rows]:any=await admin.query('SELECT COUNT(*) n FROM registrations');assert.equal(rows[0].n,12);
    });
    await t.test('combined search, wildcard handling and invalid filters',async()=>{
      const r=await get('/events?date=2026-10-23&location=Sydney&category=1');assert.equal(r.body.data.length,1);assert.equal(r.body.data[0].id,1);
      assert.equal((await get('/events?location=%25')).body.data.length,0);
      assert.equal((await get('/events?date=2026-02-30')).status,400);
      assert.equal((await get('/events?category=abc')).status,400);
    });
    await t.test('detail isolates registrations, sorts newest first, and omits contact data',async()=>{
      const r=await get('/events/1');const regs=r.body.data.registrations;assert.equal(regs.length,5);assert(!JSON.stringify(regs).includes('email'));assert(!JSON.stringify(regs).includes('phone'));
      assert(regs.every((r:any,i:number)=>!i||regs[i-1].registeredAt>=r.registeredAt));
      assert.equal((await get('/events/11')).status,404);assert.equal((await get('/events/999999')).status,404);assert.equal((await get('/events/abc')).status,400);
    });
    await t.test('registration persists and shows on the detail response',async()=>{
      const r=await submit(1,reg);assert.equal(r.status,201,JSON.stringify(r));
      const detail=await get('/events/1');assert.equal(detail.body.data.registrations.length,6);assert.equal(detail.body.data.registrations[0].fullName,reg.fullName);
    });
    await t.test('same person may register for another event, but not the same event twice',async()=>{
      assert.equal((await submit(1,{...reg,email:' INTEGRATION@EXAMPLE.INVALID '})).status,409);
      assert.equal((await submit(2,reg)).status,201);
    });
    await t.test('concurrent submissions create only one registration',async()=>{
      const results=await Promise.all([submit(3,{...reg,email:'race@example.invalid'}),submit(3,{...reg,email:'race@example.invalid'})]);assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
    });
    await t.test('invalid tickets, past and suspended events are rejected',async()=>{
      for(const v of [0,-1,1.5,21])assert.equal((await submit(1,{...reg,ticketQuantity:v})).status,400);
      assert.equal((await submit(12,reg)).status,409);assert.equal((await submit(11,reg)).status,409);
    });
    await t.test('Navicat-style direct edits still enforce core constraints',async()=>{
      await assert.rejects(admin.query("INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity) VALUES (1,'Other Name',' integration@example.invalid ','0400000000',1)"),{code:'ER_DUP_ENTRY'});
      for(const quantity of [1.5,1.01])await assert.rejects(admin.query("INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity) VALUES (1,'Other Name','invalid@example.invalid','0400000000',?)",[quantity]),{code:'ER_SIGNAL_EXCEPTION'});
      await assert.rejects(admin.query('UPDATE events SET ticket_price=-1 WHERE id=1'));
      await assert.rejects(admin.query('UPDATE events SET end_at_utc=start_at_utc WHERE id=1'));
      await assert.rejects(admin.query('UPDATE events SET category_id=999 WHERE id=1'));
    });
    await t.test('direct event changes propagate to public APIs',async()=>{
      await admin.query("UPDATE events SET name='Updated through database management' WHERE id=2");assert.equal((await get('/events/2')).body.data.name,'Updated through database management');
      await admin.query('UPDATE events SET is_suspended=1 WHERE id=2');assert.equal((await get('/events/2')).status,404);
      await admin.query('UPDATE events SET is_suspended=0 WHERE id=2');assert.equal((await get('/events/2')).status,200);
    });
    await t.test('Navicat-style event creation derives the local date and is immediately readable',async()=>{
      const [created]:any=await admin.query("INSERT INTO events(organisation_id,category_id,name,start_at_utc,end_at_utc,venue,city,purpose,description,ticket_price,fundraising_goal,amount_raised,latitude,longitude) VALUES (1,1,'Database-created event','2026-10-24 23:00:00','2026-10-25 02:00:00','Community Hall','Sydney','A new gathering','Created directly through the database management workflow.',0,1000,0,-33.8688,151.2093)");
      const r=await get('/events/'+created.insertId);assert.equal(r.status,200);assert.equal(r.body.data.name,'Database-created event');
      const [rows]:any=await admin.query('SELECT start_local_date FROM events WHERE id=?',[created.insertId]);assert.equal(rows[0].start_local_date,'2026-10-25');
      await admin.query('DELETE FROM events WHERE id=?',[created.insertId]);
    });
    await t.test('deletion is blocked with registrations and allowed without them',async()=>{
      await assert.rejects(admin.query('DELETE FROM events WHERE id=1'),{code:'ER_ROW_IS_REFERENCED_2'});
      await admin.query('DELETE FROM events WHERE id=10');assert.equal((await get('/events/10')).status,404);
    });
    await t.test('Sydney local date is recomputed across daylight saving transitions',async()=>{
      const cases=[['2027-04-03 15:30:00','2027-04-04'],['2027-04-03 16:30:00','2027-04-04'],['2027-10-02 15:30:00','2027-10-03'],['2027-10-02 16:30:00','2027-10-03'],['2027-06-01 13:30:00','2027-06-01'],['2027-06-01 14:30:00','2027-06-02']];
      for(const [start,expected] of cases){await admin.query('UPDATE events SET start_at_utc=?,end_at_utc=DATE_ADD(?,INTERVAL 2 HOUR) WHERE id=9',[start,start]);const [rows]:any=await admin.query('SELECT start_local_date FROM events WHERE id=9');assert.equal(rows[0].start_local_date,expected);}
    });
    await t.test('unused admin HTTP routes are absent and application user cannot modify events',async()=>{
      assert.equal((await get('/admin/events')).status,404);
      await assert.rejects(pool!.query("UPDATE events SET name='Not allowed' WHERE id=1"),{code:'ER_TABLEACCESS_DENIED_ERROR'});
    });
  } finally {
    if(server)await new Promise<void>(resolve=>server!.close(()=>resolve()));
    if(pool)await pool.end();
    // Names are generated above, never read from user-provided input.
    if(/^a3_verify_\d+$/.test(schema))await admin.query(`DROP DATABASE IF EXISTS \`${schema}\``);
    if(/^a3t\d+$/.test(username))await admin.query(`DROP USER IF EXISTS '${username}'@'127.0.0.1'`);
    await admin.end();
  }
});
