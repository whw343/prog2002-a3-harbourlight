import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import {createEventDb} from './event_db';
import {ApiError,filters,id,registration} from './validation';
import {weather} from './weather';
type Db=ReturnType<typeof createEventDb>;
export function createApp(db:Db) {
  const app=express();app.disable('x-powered-by');
  const origins=(process.env.CLIENT_ORIGINS||'').split(',').map(x=>x.trim());
  app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Referrer-Policy','strict-origin-when-cross-origin');if(origins.includes(req.get('Origin')||'!')){res.set('Access-Control-Allow-Origin',req.get('Origin'));res.vary('Origin');res.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.set('Access-Control-Allow-Headers','Content-Type');}if(req.method==='OPTIONS'){res.sendStatus(204);return;}next();});
  app.use('/api',(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
  app.use(express.json({limit:'32kb'}));
  app.get('/api/health',async(_req,res)=>{await db.categories();res.json({data:{status:'ok'}});});
  app.get('/api/categories',async(_req,res)=>res.json({data:await db.categories()}));
  app.get('/api/organisations',async(_req,res)=>res.json({data:await db.organisations()}));
  app.get('/api/events',async(req,res)=>res.json({data:await db.listEvents(filters(req.query))}));
  app.get('/api/events/:id/weather',async(req,res)=>res.json({data:await weather(await db.detail(id(req.params.id)))}));
  app.get('/api/events/:id',async(req,res)=>res.json({data:await db.detail(id(req.params.id))}));
  app.post('/api/events/:id/registrations',async(req,res)=>res.status(201).json({data:await db.register(id(req.params.id),registration(req.body))}));
  app.use('/api',(_req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'Endpoint not found.'}}));
  // Optional single-server local setup: copy the built public frontend to public/.
  const publicDir=path.resolve(__dirname,'../../clientside/dist/browser');
  if(fs.existsSync(publicDir)) {app.use(express.static(publicDir));app.get('/{*rest}',(_req,res)=>res.sendFile(path.join(publicDir,'index.html')));}
  app.use((error:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
    if(error instanceof ApiError){res.status(error.status).json({error:{code:error.code,message:error.message}});return;}
    if(error.type==='entity.parse.failed'||error.type==='entity.too.large'){res.status(400).json({error:{code:'INVALID_BODY',message:'Request must contain valid JSON within 32 KB.'}});return;}
    console.error('API request failed:',error.code||error.name);res.status(500).json({error:{code:'SERVER_ERROR',message:'The service could not complete the request. Please try again.'}});
  });return app;
}
