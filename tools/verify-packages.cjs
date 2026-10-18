const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');const {once}=require('node:events');
const root=path.resolve(__dirname,'..');const folder=process.argv[2];if(!folder)throw Error('Provide an extracted sibling-package folder.');
const target=path.resolve(folder);const mysql=require('../api/node_modules/mysql2/promise');
const results=[];function run(cwd,args){const r=spawnSync(process.execPath,['D:/node_modules/npm/bin/npm-cli.js',...args,'--cache',path.join(root,'.npm-cache')],{cwd,encoding:'utf8',windowsHide:true,env:{...process.env,PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH}});if(r.status!==0)throw Error((r.stdout||'')+(r.stderr||''));results.push({command:args.join(' '),directory:path.basename(cwd),status:'passed'});}
async function main(){
 for(const part of ['api','clientside'])run(path.join(target,part),['ci','--offline','--no-audit','--no-fund']);
 for(const part of ['api','clientside'])run(path.join(target,part),['run','build']);
 const config=JSON.parse(fs.readFileSync(path.join(root,'.runtime/local-db.json'),'utf8'));
 const connection=await mysql.createConnection({...config,multipleStatements:true});const schema='a3_unpack_'+Date.now();let pool,server;
 try {
  await connection.query('CREATE DATABASE '+mysql.escapeId(schema)+' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');await connection.query('USE '+mysql.escapeId(schema));
  const sql=fs.readFileSync(path.join(target,'api/database/charityevents-a3.sql'),'utf8');const adminSql=fs.readFileSync(path.join(target,'adminside/charityevents-a3.sql'),'utf8');if(sql!==adminSql)throw Error('SQL differs between packages');
  await connection.query(sql.replace(/^DELIMITER.*$/gm,'').replace(/END\$\$/g,'END;'));results.push({name:'Fresh import of extracted final SQL',status:'passed'});
  const {createPool,createEventDb}=require(path.join(target,'api/dist/event_db.js'));const {createApp}=require(path.join(target,'api/dist/app.js'));
  pool=createPool({DB_HOST:config.host,DB_PORT:String(config.port),DB_USER:config.user,DB_PASSWORD:config.password,DB_NAME:schema});
  server=createApp(createEventDb(pool)).listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
  const response=await fetch(base+'/');const html=await response.text();if(response.status!==200||!html.includes('<app-root>'))throw Error('Extracted frontend not served');
  const asset=html.match(/src="(main-[^"]+\.js)"/);if(!asset||(await fetch(base+'/'+asset[1])).status!==200)throw Error('Built frontend asset unavailable');
  const events=await (await fetch(base+'/api/events')).json();if(events.data.length!==10)throw Error('Event list mismatch');
  for(const event of events.data){const image=await fetch(base+'/'+event.imagePath);const bytes=new Uint8Array(await image.arrayBuffer());if(!image.ok||bytes[0]!==255||bytes[1]!==216)throw Error('Extracted event photo missing: '+event.imagePath);}
  const credits=await fetch(base+'/photo-credits.html');if(!credits.ok||!(await credits.text()).includes('Photo credits &amp; sources'))throw Error('Photo credits missing');
  results.push({name:'Extracted event photographs and attribution page',status:'passed'});
  const registration=await fetch(base+'/api/events/1/registrations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fullName:'Extracted Package Test',email:'extracted@example.invalid',phone:'0400000000',ticketQuantity:2})});if(registration.status!==201)throw Error('Extracted registration failed');
  const detail=await (await fetch(base+'/api/events/1')).json();if(detail.data.registrations.length!==6)throw Error('Extracted detail mismatch');
  const duplicate=await fetch(base+'/api/events/1/registrations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fullName:'Extracted Package Test',email:'extracted@example.invalid',phone:'0400000000',ticketQuantity:2})});if(duplicate.status!==409)throw Error('Duplicate protection failed');
  results.push({name:'Extracted frontend assets + MySQL API + successful registration + duplicate rejection',status:'passed'});
 } finally {
  if(server)await new Promise(resolve=>server.close(resolve));if(pool)await pool.end();
  if(/^a3_unpack_\d+$/.test(schema))await connection.query('DROP DATABASE IF EXISTS '+mysql.escapeId(schema));await connection.end();
 }
 fs.writeFileSync(path.join(root,'docs/PACKAGE-VERIFICATION.json'),JSON.stringify({date:new Date().toISOString(),node:process.version,source:'Extracted whw343 packages; second member package contents compared separately',results},null,2));console.log(JSON.stringify(results,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
