// Original machine helper. Portable setup instructions are in each package README.
const fs=require('node:fs');const path=require('node:path');const net=require('node:net');const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
async function listening(port){return new Promise(resolve=>{const socket=net.connect({host:'127.0.0.1',port});socket.once('connect',()=>{socket.destroy();resolve(true)});socket.once('error',()=>resolve(false))});}
function launch(exe,args,cwd,label){const out=fs.openSync(path.join(root,'.runtime',label+'.out.log'),'a');const err=fs.openSync(path.join(root,'.runtime',label+'.err.log'),'a');const p=spawn(exe,args,{cwd,detached:true,windowsHide:true,stdio:['ignore',out,err]});p.unref();fs.closeSync(out);fs.closeSync(err);return p.pid;}
async function main(){
 if(!fs.existsSync(path.join(root,'.runtime/local-db.json')))throw Error('Local database configuration is missing. Follow the portable README.');
 if(!await listening(4338)){
  const exe='D:/phpstudy_pro/Extensions/MySQL5.7.26/bin/mysqld.exe';if(!fs.existsSync(exe))throw Error('Original MySQL executable is missing.');
  launch(exe,['--no-defaults','--basedir=D:/phpstudy_pro/Extensions/MySQL5.7.26','--datadir='+path.join(root,'.runtime/mysql-data'),'--port=4338','--bind-address=127.0.0.1','--character-set-server=utf8mb4','--explicit_defaults_for_timestamp=1','--log_syslog=0','--console'],root,'mysql-a3');
  for(let n=0;n<30&&!await listening(4338);n++)await new Promise(r=>setTimeout(r,250));
  if(!await listening(4338))throw Error('MySQL did not start. Check .runtime/mysql-a3.err.log');
 }
 if(!await listening(4201)){const pid=launch(process.execPath,['app.cjs'],path.join(root,'api'),'api');fs.writeFileSync(path.join(root,'.runtime/api-process.json'),JSON.stringify({pid}));}
 for(let n=0;n<30;n++){
  try{const r=await fetch('http://localhost:4201/api/health');if(r.ok){console.log('Harbourlight ready: http://localhost:4201/');return;}}catch{}
  await new Promise(r=>setTimeout(r,250));
 }
 throw Error('API health check failed. Check .runtime/api.err.log');
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
