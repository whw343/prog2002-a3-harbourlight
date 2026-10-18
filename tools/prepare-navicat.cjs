const fs=require('node:fs');const crypto=require('node:crypto');const path=require('node:path');
const mysql=require('../api/node_modules/mysql2/promise');
async function main(){
 const root=path.resolve(__dirname,'..');
 const local=JSON.parse(fs.readFileSync(path.join(root,'.runtime/local-db.json'),'utf8'));
 const db=await mysql.createConnection(local);
 const password=crypto.randomBytes(24).toString('hex');
 await db.query("CREATE USER IF NOT EXISTS 'a3_manager'@'127.0.0.1' IDENTIFIED BY ?",[password]);
 await db.query("ALTER USER 'a3_manager'@'127.0.0.1' IDENTIFIED BY ?",[password]);
 await db.query('GRANT ALL PRIVILEGES ON '+mysql.escapeId(local.database)+".* TO 'a3_manager'@'127.0.0.1'");
 fs.writeFileSync(path.join(root,'.runtime/navicat-local.json'),JSON.stringify({host:local.host,port:local.port,user:'a3_manager',password,database:local.database},null,2));
 await db.end();console.log('Dedicated A3 database manager prepared; credentials remain local.');
}
main().catch(e=>{console.error(e.code||e.message);process.exitCode=1});
