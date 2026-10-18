const {spawn}=require('node:child_process');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=fs.openSync(path.join(root,'.runtime/api.out.log'),'a');
const err=fs.openSync(path.join(root,'.runtime/api.err.log'),'a');
const child=spawn(process.execPath,['app.cjs'],{cwd:path.join(root,'api'),detached:true,windowsHide:true,stdio:['ignore',out,err]});
child.unref();fs.closeSync(out);fs.closeSync(err);
fs.writeFileSync(path.join(root,'.runtime/api-process.json'),JSON.stringify({pid:child.pid}));
console.log('API launched; check http://localhost:4201/api/health');
