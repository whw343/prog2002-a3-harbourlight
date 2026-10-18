// Creates a new isolated A3 database only. Never drops an existing database.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const mysql=require('../api/node_modules/mysql2/promise');
async function main(){
  const root=path.resolve(__dirname,'..');
  const dbName='harbourlight_a3_'+Date.now();
  const password=crypto.randomBytes(24).toString('hex');
  const rootPassword=crypto.randomBytes(24).toString('hex');
  const connection=await mysql.createConnection({host:'127.0.0.1',port:4338,user:'root',password:JSON.parse(fs.readFileSync(path.join(root,'.runtime/bootstrap-root.json'),'utf8')).password,multipleStatements:true});
  await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${dbName}\``);
  // mysql CLI DELIMITER directives are removed; the driver sends all statements together.
  const sql=fs.readFileSync(path.join(root,'api/database/charityevents-a3.sql'),'utf8').replace(/^DELIMITER.*$/gm,'').replace(/END\$\$/g,'END;');
  await connection.query(sql);
  await connection.query("CREATE USER 'a3_app'@'127.0.0.1' IDENTIFIED BY ?",[password]);
  await connection.query(`GRANT SELECT ON \`${dbName}\`.* TO 'a3_app'@'127.0.0.1'`);
  await connection.query(`GRANT INSERT ON \`${dbName}\`.registrations TO 'a3_app'@'127.0.0.1'`);
  await connection.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?",[rootPassword]);
  fs.writeFileSync(path.join(root,'api/.env'),`PORT=4201\nDB_HOST=127.0.0.1\nDB_PORT=4338\nDB_NAME=${dbName}\nDB_USER=a3_app\nDB_PASSWORD=${password}\nCLIENT_ORIGINS=http://localhost:4200\n`);
  fs.writeFileSync(path.join(root,'.runtime/local-db.json'),JSON.stringify({host:'127.0.0.1',port:4338,user:'root',password:rootPassword,database:dbName},null,2));
  const [rows]=await connection.query('SELECT (SELECT COUNT(*) FROM events) events,(SELECT COUNT(*) FROM registrations) registrations');
  console.log('Isolated database imported:',rows[0]);
  await connection.end();
}
main().catch(e=>{console.error('Local setup failed:',e.code||e.name,e.sqlMessage||e.message);process.exitCode=1;});
