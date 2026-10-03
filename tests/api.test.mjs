import assert from 'node:assert/strict';
import {blankRecord} from '../lib/domain.ts';
const base=process.env.TEST_BASE||'http://127.0.0.1:8787';
const user='test-'+crypto.randomUUID();
async function call(path,method='GET',data,who=user,extra={}){const res=await fetch(base+path,{method,headers:{'oai-authenticated-user-id':who,...(data?{'Content-Type':'application/json'}:{}),...extra},body:data?JSON.stringify(data):undefined});const out=await res.json();return {status:res.status,...out}}
let n=0;function check(label,fn){fn();n++;console.log('PASS',label)}
const valid={...blankRecord('clue'),title:'API 测试需求',sourceNote:'测试访谈',collectedAt:'2026-10-03',evidence:'事实'};
const first=await call('/api/records','POST',valid);check('创建记录',()=>assert.equal(first.status,201));
const id=first.record.id;
const other=await call('/api/records','GET',undefined,'other-'+user);check('另一账号无法读取记录',()=>assert.ok(!other.records.some(r=>r.id===id)));
const upd=await call('/api/records','PUT',{id,version:1,data:{...valid,title:'API 更新'}});check('按版本更新',()=>assert.equal(upd.record.version,2));
const stale=await call('/api/records','PUT',{id,version:1,data:valid});check('并发冲突拒绝覆盖',()=>assert.equal(stale.status,409));
const events=await call('/api/audit');check('失败更新不增加日志',()=>assert.equal(events.events.filter(e=>e.record_id===id).length,2));
const denied=await call('/api/records','PUT',{id,version:2,data:valid},'other-'+user);check('另一账号无法修改',()=>assert.equal(denied.status,409));
const invalid=await call('/api/records','POST',{...valid,sourceUrl:'javascript:alert(1)'});check('危险链接被拒绝',()=>assert.equal(invalid.status,400));
const cross=await call('/api/records','POST',valid,user,{Origin:'https://untrusted.example'});check('跨站写入被拒绝',()=>assert.equal(cross.status,403));
const badlinks=await call('/api/records','POST',{...blankRecord('product'),relatedIds:[crypto.randomUUID()]});check('无效关联被拒绝',()=>assert.equal(badlinks.status,400));
const product=await call('/api/records','POST',{...blankRecord('product'),title:'API 商品',relatedIds:[id]});check('关联记录创建',()=>assert.equal(product.status,201));
const exported=await call('/api/export');check('导出保留关联',()=>assert.deepEqual(exported.records.find(r=>r.id===product.record.id).relatedIds,[id]));
const repeat=await call('/api/import','POST',exported);check('重复导入不复制记录',()=>assert.equal(repeat.imported,0));
const backupOwner='backup-'+user;const restored=await call('/api/import','POST',exported,backupOwner);check('备份可在另一个独立空间恢复',()=>assert.equal(restored.imported,2));
const invalidImport=await call('/api/import','POST',{schemaVersion:1,records:[null]});check('无效导入明确返回 400',()=>assert.equal(invalidImport.status,400));
const del=await call('/api/records','PATCH',{id,version:2,action:'delete'});check('软删除成功',()=>assert.equal(del.record.version,3));
const active=await call('/api/records');check('删除后不在活动列表',()=>assert.ok(!active.records.some(r=>r.id===id)));
const trash=await call('/api/records?trash=1');check('回收站可读',()=>assert.ok(trash.records.some(r=>r.id===id)));
const restore=await call('/api/records','PATCH',{id,version:3,action:'restore'});check('恢复保留内容',()=>assert.equal(restore.record.title,'API 更新'));
console.log(`${n} integration checks passed. TEST_OWNER=${user}`);
