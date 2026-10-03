import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { recordSchema,type ResearchRecord } from './domain';
export class ApiError extends Error{constructor(public status:number,message:string){super(message)}}
export function db(){const binding=(env as unknown as {DB:D1Database}).DB;if(!binding)throw new ApiError(503,'数据服务暂不可用，请稍后重试。');return binding}
export function owner(request:Request){const id=request.headers.get('oai-authenticated-user-id');if(id)return id;if(process.env.NODE_ENV==='development')return 'local-preview-user';throw new ApiError(401,'请登录后访问你的私有研究空间。')}
export function assertWrite(request:Request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new ApiError(403,'无法接受跨站保存请求。');if(!request.headers.get('content-type')?.includes('application/json'))throw new ApiError(415,'请使用 JSON 格式提交。')}
export async function body(request:Request){assertWrite(request);const text=await request.text();if(text.length>1_000_000)throw new ApiError(413,'单次导入不能超过 1 MB。');try{return JSON.parse(text)}catch{throw new ApiError(400,'数据格式不正确，请检查 JSON 文件。')}}
export function response(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function fail(error:unknown){if(error instanceof ApiError)return response({error:error.message},error.status);if(error instanceof z.ZodError)return response({error:error.issues.map(x=>x.message).join('；')},400);console.error('Research data operation failed',error);return response({error:'数据服务暂时不可用。你的未保存内容仍保留，请重试。'},503)}
export function mapRow(row:Record<string,unknown>):ResearchRecord{return {...JSON.parse(row.data as string),id:row.id,version:row.version,createdAt:row.created_at,updatedAt:row.updated_at,deletedAt:row.deleted_at} as ResearchRecord}
export async function listRecords(user:string,trash=false){const result=await db().prepare(`SELECT * FROM research_records WHERE owner=? AND deleted_at IS ${trash?'NOT ':''}NULL ORDER BY updated_at DESC`).bind(user).all();return result.results.map(mapRow)}
export function auditStatement(user:string,id:string,action:string,title:string,snapshot:string,now:string){return db().prepare('INSERT INTO research_audit (id,owner,record_id,action,title,snapshot,created_at) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),user,id,action,title,snapshot,now)}
export async function validateLinks(user:string,ids:string[],self?:string){if(ids.includes(self||''))throw new ApiError(400,'记录不能关联自身。');if(!ids.length)return;const placeholders=ids.map(()=>'?').join(',');const found=await db().prepare(`SELECT id FROM research_records WHERE owner=? AND deleted_at IS NULL AND id IN (${placeholders})`).bind(user,...ids).all();if(found.results.length!==new Set(ids).size)throw new ApiError(400,'部分关联记录不存在或已移入回收站，请重新选择。')}
export {recordSchema};
