import {db,owner,response,fail} from '@/lib/server';
export async function GET(request:Request){try{const user=owner(request);const rows=await db().prepare('SELECT id,record_id,action,title,created_at FROM research_audit WHERE owner=? ORDER BY created_at DESC LIMIT 200').bind(user).all();return response({events:rows.results})}catch(e){return fail(e)}}
