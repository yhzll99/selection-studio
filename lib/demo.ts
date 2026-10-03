import {blankRecord,type ResearchRecord,type Kind} from './domain';
const date='2026-10-03T08:00:00Z';
function demo(id:string,kind:Kind,category:'服饰'|'宠物',title:string,extra:Partial<ResearchRecord>={}):ResearchRecord{return {...blankRecord(kind,category),id,version:1,title,createdAt:date,updatedAt:date,deletedAt:null,...extra}}
export const demoRecords:ResearchRecord[]=[
 demo('demo-clue-1','clue','服饰','通勤长裤的腰围与裤长难兼顾',{body:'演示情境：腰围合适时裤长不合适。需要收集真实反馈确认发生频率。',audience:'需要通勤穿着的消费者',scenario:'日常通勤与试穿',need:'希望可以分别选择腰围与裤长',evidence:'推测',nextAction:'收集不同体型用户的尺码反馈',tags:['通勤','尺码适配']}),
 demo('demo-clue-2','clue','宠物','外出喂水时，剩余水不方便收纳',{body:'演示假设：携宠外出时，希望喂水用品更方便携带和清洁。',audience:'有日常遛狗需求的宠物主人',scenario:'短途外出',nextAction:'访谈使用过随行水杯的宠物主人',tags:['出行','清洁']}),
 demo('demo-product-1','product','服饰','可选裤长通勤裤',{status:'待拿样',audience:'通勤人群',need:'腰围与裤长分别选择',supplier:'演示报价，尚未向真实供应商确认',attributes:'分别记录腰围、裤长和洗后尺寸变化',relatedIds:['demo-clue-1'],nextAction:'安排不同尺码样品试穿',costs:{price:159,purchase:58,packaging:3,shipping:8,feePercent:5,acquisition:28,aftersale:15},tags:['通勤','多尺码']}),
 demo('demo-product-2','product','宠物','可拆洗宠物随行水杯',{status:'测试中',audience:'遛狗人群',need:'外出喂水与清洁便利',attributes:'容量、重量、密封结构、清洁死角',relatedIds:['demo-clue-2'],nextAction:'完成漏水与清洁测试',costs:{price:69,purchase:19,packaging:2,shipping:6,feePercent:5,acquisition:12,aftersale:4},tags:['户外','易清洁']}),
 demo('demo-product-3','product','宠物','可替换粘毛滚筒',{audience:'养宠家庭',need:'清理衣物上的浮毛',nextAction:'确认耗材单价与物流报价',costs:{price:39,purchase:9,packaging:2,shipping:null,feePercent:5,acquisition:null,aftersale:null},tags:['衣物清洁']}),
 demo('demo-experiment-1','experiment','宠物','随行水杯：携带与清洁验证',{status:'进行中',hypothesis:'倒置携带时不漏水，拆洗操作可独立完成',method:'记录样品倒置与反复开合表现，并邀请试用者独立拆洗',metric:'漏水次数 / 拆洗耗时',target:'在事先约定的测试条件下不漏水；记录真实拆洗时间',relatedIds:['demo-product-2'],nextAction:'记录测试条件、现象和耗时'}),
 demo('demo-wiki-1','wiki','服饰','尺码研究记录规范',{body:'这是一份演示模板，不是已验证的行业结论。\n\n1. 记录样品编号和供应商批次。\n2. 测量关键尺寸，标明测量方式。\n3. 分别记录洗前与洗后结果。\n4. 把用户反馈与对应尺码关联。\n\n适用范围：需要尺码适配研究的候选服饰。',sourceNote:'系统演示模板',tags:['研究方法','尺码']})
];
