// Updates only image paths of the known seeded events, preserving names and registrations.
const fs=require('node:fs');const path=require('node:path');const mysql=require('../api/node_modules/mysql2/promise');
async function main(){
 const root=path.resolve(__dirname,'..');
 const config=JSON.parse(fs.readFileSync(path.join(root,'.runtime/local-db.json'),'utf8'));
 const photos=JSON.parse(fs.readFileSync(path.join(root,'clientside/public/photo-manifest.json'),'utf8'));
 const connection=await mysql.createConnection(config);
 try{
  await connection.beginTransaction();
  for(const photo of photos)if(photo.eventId)await connection.execute('UPDATE events SET image_path=? WHERE id=? AND (image_path IS NULL OR image_path LIKE ? OR image_path=?)',[photo.path,photo.eventId,'assets/%.svg',photo.path]);
  await connection.commit();
  const [rows]=await connection.query('SELECT id,name,image_path FROM events ORDER BY id');
  console.log(JSON.stringify(rows,null,2));
 }catch(e){await connection.rollback();throw e;}finally{await connection.end();}
}
main().catch(e=>{console.error(e.code||e.message);process.exitCode=1});
