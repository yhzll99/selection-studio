import { z } from 'zod';
export const kinds = ['clue','product','experiment','wiki'] as const;
export type Kind = typeof kinds[number];
export const labels: Record<Kind,string> = {clue:'需求线索',product:'候选商品',experiment:'验证记录',wiki:'经验 Wiki'};
export const stages: Record<Kind,string[]> = {clue:['待研究','已核实','已转候选'],product:['待研究','待拿样','测试中','可推进','已放弃'],experiment:['待开始','进行中','已完成'],wiki:['草稿','已验证']};
const short=z.string().trim().max(500).default('');
const long=z.string().trim().max(15000).default('');
const date=z.string().refine(s=>!s || (/^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s),'日期格式应为 YYYY-MM-DD').default('');
const money=z.number().finite().min(0).max(10000000).nullable().default(null);
export const costSchema=z.object({price:money,purchase:money,packaging:money,shipping:money,feePercent:z.number().finite().min(0).max(100).nullable().default(null),acquisition:money,aftersale:money});
export const costLabels:Record<string,string>={price:'实际到手售价',purchase:'采购成本',packaging:'包装成本',shipping:'物流成本',feePercent:'平台费率 (%)',acquisition:'单笔获客成本',aftersale:'单笔预计售后损失'};
export const recordSchema=z.object({
 kind:z.enum(kinds),category:z.enum(['服饰','宠物']),title:z.string().trim().min(1,'请填写标题').max(150),status:z.string().max(30),
 body:long,sourceUrl:z.string().trim().max(2000).refine(v=>!v||(/^https?:\/\//i.test(v)&&URL.canParse(v)),'来源链接仅支持完整的 http/https 网址').default(''),sourceNote:short,collectedAt:date,
 evidence:z.enum(['待验证','事实','推测']).default('待验证'),ownerName:short,audience:short,scenario:short,need:long,competitor:long,supplier:long,attributes:long,
 hypothesis:long,method:long,metric:short,target:short,result:long,decision:long,nextAction:short,dueDate:date,
 tags:z.array(z.string().trim().min(1).max(30)).max(12).default([]),relatedIds:z.array(z.string().max(100)).max(30).default([]),costs:costSchema.default({}),
}).strict().superRefine((r,c)=>{
 if(!stages[r.kind].includes(r.status))c.addIssue({code:'custom',path:['status'],message:'该状态不适用于当前记录类型'});
 if(r.evidence==='事实'&&(!r.collectedAt||(!r.sourceUrl&&!r.sourceNote)))c.addIssue({code:'custom',path:['evidence'],message:'事实需要填写来源和采集日期'});
 if(r.kind==='experiment'&&r.status==='已完成'&&!r.result)c.addIssue({code:'custom',path:['result'],message:'完成验证前请填写实际结果'});
 if(r.kind==='product'&&['可推进','已放弃'].includes(r.status)&&!r.decision)c.addIssue({code:'custom',path:['decision'],message:'请记录推进或放弃的判断依据'});
 if(r.kind==='wiki'&&r.status==='已验证'&&(!r.body||(!r.sourceUrl&&!r.sourceNote&&!r.relatedIds.length)))c.addIssue({code:'custom',path:['body'],message:'已验证经验需要正文及来源或关联记录'});
});
export type RecordData=z.infer<typeof recordSchema>;
export type ResearchRecord=RecordData&{id:string;version:number;createdAt:string;updatedAt:string;deletedAt:string|null};
export function blankRecord(kind:Kind,category:'服饰'|'宠物'='服饰'):RecordData{return recordSchema.parse({kind,category,title:'新记录',status:stages[kind][0]})}
export function payloadOf(r:ResearchRecord|RecordData):RecordData{const {id,version,createdAt,updatedAt,deletedAt,...p}=r as ResearchRecord;return p;}
export function economics(costs:RecordData['costs']){
 const missing=Object.keys(costLabels).filter(k=>costs[k as keyof typeof costs]===null);
 if(missing.length)return {complete:false,missing,profit:null,margin:null,breakEven:null,fee:null,total:null};
 const cents=(n:number)=>Math.round(n*100);
 const price=cents(costs.price!),fee=Math.round(price*costs.feePercent!/100);
 const base=['purchase','packaging','shipping','aftersale'].reduce((s,k)=>s+cents(costs[k as keyof typeof costs]!),fee);
 const total=base+cents(costs.acquisition!);const profit=(price-total)/100;
 return {complete:true,missing,profit,margin:price>0?profit/(price/100)*100:null,breakEven:(price-base)/100,fee:fee/100,total:total/100};
}
export function gaps(r:RecordData){const items:string[]=[];if(!r.sourceUrl&&!r.sourceNote)items.push('补充原始来源');if(!r.collectedAt)items.push('记录采集日期');if(r.kind==='product'){if(!r.audience)items.push('明确目标客户');if(!r.need)items.push('补充需求证据');if(!r.supplier)items.push('确认供应信息');if(!economics(r.costs).complete)items.push('补齐成本测算')}if(r.kind==='experiment'){if(!r.method)items.push('确定验证方法');if(!r.metric||!r.target)items.push('设置指标与通过标准')}if(!r.nextAction&&!['已完成','已验证','已放弃'].includes(r.status))items.push('写明下一步动作');return items}
export function moneyText(n:number|null){return n===null?'待确认':new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY',maximumFractionDigits:2}).format(n)}
export function csvCell(value:unknown){let s=String(value??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
