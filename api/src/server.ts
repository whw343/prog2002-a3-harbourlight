import 'dotenv/config';
import {createPool,createEventDb} from './event_db';
import {createApp} from './app';
const pool=createPool();
async function main(){await pool.query('SELECT 1');const server=createApp(createEventDb(pool)).listen(Number(process.env.PORT||4201),'0.0.0.0',()=>console.log('Harbourlight API ready.'));process.on('SIGTERM',()=>server.close(()=>{void pool.end();}));}
main().catch(e=>{console.error('Startup failed:',e.code||e.name);void pool.end();process.exitCode=1;});
