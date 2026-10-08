import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app=express(); app.use(cors()); app.use(express.json({limit:'12mb'}));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:15*1024*1024}});
const ai=new OpenAI({apiKey:process.env.OPENAI_API_KEY||'missing-key',baseURL:process.env.OPENAI_BASE_URL||undefined});
type Source={name:string;text:string};
app.get('/api/status',(_req,res)=>res.json({ready:!!process.env.OPENAI_API_KEY,web:!!process.env.TAVILY_API_KEY,model:process.env.OPENAI_MODEL||'gpt-4o-mini'}));
app.post('/api/upload',upload.array('files',8),async(req,res)=>{try{const files=req.files as Express.Multer.File[];const sources:Source[]=[];for(const f of files||[]){const ext=path.extname(f.originalname).toLowerCase();let text='';if(ext==='.pdf')text=(await pdf(f.buffer)).text;else if(ext==='.docx')text=(await mammoth.extractRawText({buffer:f.buffer})).value;else if(['.txt','.md','.csv','.json'].includes(ext))text=f.buffer.toString('utf8');else continue;sources.push({name:f.originalname,text:text.slice(0,100000)});}res.json({sources});}catch(e){res.status(400).json({error:'Could not read one of those files. Try PDF, DOCX, TXT, Markdown, CSV or JSON.'});}});
async function search(q:string){if(!process.env.TAVILY_API_KEY)return[];const r=await fetch('https://api.tavily.com/search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({api_key:process.env.TAVILY_API_KEY,query:q,search_depth:'basic',max_results:5,include_answer:false})});if(!r.ok)return[];const d=await r.json() as any;return(d.results||[]).map((x:any)=>({title:x.title,url:x.url,content:x.content}));}
app.post('/api/chat',async(req,res)=>{try{if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Add OPENAI_API_KEY to .env to enable answers.'});const {messages=[],sources=[],web=true}=req.body as {messages:{role:'user'|'assistant';content:string}[];sources:Source[];web:boolean};const question=messages.filter(m=>m.role==='user').at(-1)?.content||'';const results=web?await search(question):[];const docs=(sources||[]).map(s=>`SOURCE: ${s.name}\n${s.text}`).join('\n\n').slice(0,50000);const webctx=results.map((x:any)=>`TITLE: ${x.title}\nURL: ${x.url}\n${x.content}`).join('\n\n');const system=`You are Clarity, a precise research assistant. Answer clearly and directly. If uploaded documents are relevant, prioritize them and name the file. Clearly distinguish document facts from web findings and general knowledge. If evidence is insufficient, say so. For current facts, cite web source titles and URLs as Markdown links. Do not invent citations. If data can be summarized visually, include a compact markdown table.\n\nUPLOADED MATERIAL:\n${docs||'(none)'}\n\nLIVE WEB RESULTS:\n${webctx||'(none; live search unavailable or disabled)'}`;const response=await ai.chat.completions.create({model:process.env.OPENAI_MODEL||'gpt-4o-mini',messages:[{role:'system',content:system},...messages.slice(-12)],temperature:0.3});res.json({answer:response.choices[0]?.message?.content||'I could not generate an answer.',sources:results.map((x:any)=>({title:x.title,url:x.url}))});}catch(e){console.error(e);res.status(500).json({error:'The assistant could not complete that request. Check your model and search settings.'});}});
const __dirname=path.dirname(fileURLToPath(import.meta.url));const dist=path.resolve(__dirname,'../dist');app.use(express.static(dist));app.get('*',(req,res,next)=>req.path.startsWith('/api')?next():res.sendFile(path.join(dist,'index.html')));
app.listen(Number(process.env.PORT)||8787,()=>console.log(`Clarity server listening on http://localhost:${process.env.PORT||8787}`));
