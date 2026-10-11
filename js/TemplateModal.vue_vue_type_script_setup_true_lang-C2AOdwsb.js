var z=(F,x,u)=>new Promise((b,m)=>{var r=s=>{try{t(u.next(s))}catch(y){m(y)}},p=s=>{try{t(u.throw(s))}catch(y){m(y)}},t=s=>s.done?b(s.value):Promise.resolve(s.value).then(r,p);t((u=u.apply(F,x)).next())});import{bB as g,ao as d}from"./bootstrap-BKAhjMte.js";import{u as E,c as R}from"./letter-g0w9bLbW.js";import{R as V}from"./index-BZWaydKo.js";import{d as k}from"./print-formatter-nBVWo7Ze.js";import{g as A,d as P,e as D,i as X}from"./letter-formatter-gZy4Trl4.js";import Z from"./StructuredLetterEditor-OH9eiAHn.js";import{R as M,C as T}from"./index-BNKqLQ0T.js";import{a as N,F as j}from"./index-CF5N-ydQ.js";import q,{Textarea as H}from"./index-aVf-jFLI.js";import J from"./index-D98B7seV.js";import W from"./index-CYOCVLBJ.js";import w from"./index-Iu2PmVPs.js";import{A as S}from"./index-BW2oKRfH.js";import{T as Y,b9 as h,b7 as K,b2 as v,ab as B,G as n,bJ as a,m as i,ae as $,ai as f,ad as G}from"../jse/index-index-BBo-se1k.js";import{u as Q}from"./use-modal-rqdp9bmg.js";const ee={style:{"margin-bottom":"12px"}},te={key:2},ne={key:3},ie={style:{"margin-bottom":"12px"}},be=Y({__name:"TemplateModal",emits:["success"],setup(F,{expose:x,emit:u}){const b=u,m=h(null),r=h(!0),p=h(!1),t=K({name:"",letterType:"INTRODUCTION",content:"",description:""});function s(){m.value=null,p.value=!1,r.value=!0,Object.assign(t,{name:"",letterType:"INTRODUCTION",content:P({letterType:"INTRODUCTION"}),description:""})}const y=[{label:"项目名称",value:"matterName",description:"委托项目/案件名称"},{label:"项目编号",value:"matterNo",description:"案件编号"},{label:"合同编号",value:"contractNo",description:"关联合同编号"},{label:"案由",value:"causeOfAction",description:"案件案由"},{label:"案件类型",value:"caseType",description:"民事/刑事/行政等"},{label:"案件阶段",value:"trialStage",description:"案件审理阶段（一审、二审、再审等）"},{label:"程序阶段",value:"procedureStage",description:"程序阶段（一审、二审、再审等，与案件阶段同义）"},{label:"对方当事人",value:"opposingParty",description:"对方当事人姓名"},{label:"对方诉讼地位",value:"opposingPartyRoleName",description:"对方当事人在诉讼中的地位（原告、被告、申请人等）"},{label:"对方律师",value:"opposingLawyerName",description:"对方律师姓名"},{label:"对方律所",value:"opposingLawyerFirm",description:"对方律师所在律所"},{label:"标的金额",value:"claimAmount",description:"诉讼标的金额"},{label:"咨询事项",value:"consultationMatter",description:"法律意见事项或咨询事项描述"},{label:"调查事项",value:"investigationItems",description:"调查事项描述"},{label:"案件描述",value:"matterDescription",description:"案件争议或事实描述"},{label:"委托人姓名",value:"clientName",description:"委托人/当事人姓名"},{label:"委托人诉讼地位",value:"clientRoleName",description:"委托人在诉讼中的地位（原告、被告、申请人等）"},{label:"委托人身份证号",value:"clientIdNumber",description:"委托人身份证号码"},{label:"委托人地址",value:"clientAddress",description:"委托人联系地址"},{label:"委托人电话",value:"clientPhone",description:"委托人联系电话"},{label:"委托人邮箱",value:"clientEmail",description:"委托人邮箱"},{label:"法定代表人",value:"legalRepresentative",description:"企业法定代表人"},{label:"统一社会信用代码",value:"creditCode",description:"企业统一社会信用代码"},{label:"承办律师",value:"lawyerNames",description:"承办律师姓名（多人逗号分隔）"},{label:"承办律师电话",value:"lawyerPhone",description:"承办律师联系电话"},{label:"律师执业证号",value:"lawyerLicenseNo",description:"承办律师执业证号"},{label:"律所名称",value:"firmName",description:"律师事务所全称"},{label:"律所地址",value:"firmAddress",description:"律师事务所地址"},{label:"律所电话",value:"firmPhone",description:"律师事务所电话"},{label:"律所执业许可证",value:"firmLicense",description:"律师事务所执业许可证号"},{label:"律所负责人",value:"firmLegalPerson",description:"律师事务所负责人"},{label:"目标单位",value:"targetUnit",description:"函件送达单位"},{label:"目标地址",value:"targetAddress",description:"函件送达地址"},{label:"接收单位",value:"recipientUnit",description:"函件接收单位别名"},{label:"接收对象",value:"recipientName",description:"函件接收对象名称"},{label:"看守所/羁押场所",value:"detentionCenter",description:"会见函接收单位别名"},{label:"法院/检察院",value:"courtOrProcuratorate",description:"阅卷函接收单位别名"},{label:"函件编号",value:"letterNo",description:"出函编号"},{label:"出函日期",value:"date",description:"出函日期"},{label:"当前年份",value:"currentYear",description:"当前年份"},{label:"当前日期",value:"currentDate",description:"当前完整日期"}],C=[{label:"介绍信",value:"INTRODUCTION"},{label:"会见函",value:"MEETING"},{label:"调查函",value:"INVESTIGATION"},{label:"阅卷函",value:"FILE_REVIEW"},{label:"法律意见函",value:"LEGAL_OPINION"},{label:"其他",value:"OTHER"}],[I,c]=Q({onConfirm(){return z(this,null,function*(){if(!t.name){g.error("请输入模板名称");return}if(!t.content){g.error("请输入模板内容");return}const o=A(t.content);if(o.length>0){g.error(`模板中包含未支持的变量：${o.join(", ")}`);return}try{m.value?(yield E(m.value,t),g.success("模板更新成功")):(yield R(t),g.success("模板创建成功")),c.close(),b("success")}catch(e){const l=e;g.error(l.message||"保存失败")}})},onOpenChange(o){o||s()}});function _(o){const e={introduction:`
<div style="text-align: center; margin-bottom: 30px;">
  <h2 style="text-align: center; font-family: 'FZXiaoBiaoSong-B05S', '方正小标宋', 'FZXBS', serif; font-size: 22pt; font-weight: normal; letter-spacing: 2pt; margin: 0 0 10px 0;">介 绍 信</h2>
  <p style="text-align: center; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; margin: 0;">编号：\${letterNo}</p>
</div>

<p style="text-indent: 0; margin-bottom: 20px; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;"><strong>\${targetUnit}：</strong></p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">兹介绍本所律师<strong>\${lawyerNames}</strong>（执业证号：\${lawyerLicenseNo}）前往贵处，就<strong>\${clientName}</strong>与<strong>\${opposingParty}</strong>\${causeOfAction}一案，进行会见、调查取证、阅卷等相关工作，请予接洽为盼。</p>

<p style="text-indent: 0; margin: 20px 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">此致</p>

<div style="text-align: right; margin-top: 40px; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">
  <p style="text-indent: 0; margin: 0 0 8px 0;">\${firmName}</p>
  <p style="text-indent: 0; margin: 0;">\${date}</p>
</div>
    `,meeting:`
<div style="text-align: center; margin-bottom: 30px;">
  <h2 style="text-align: center; font-family: 'FZXiaoBiaoSong-B05S', '方正小标宋', 'FZXBS', serif; font-size: 22pt; font-weight: normal; letter-spacing: 2pt; margin: 0 0 10px 0;">会 见 函</h2>
  <p style="text-align: center; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; margin: 0;">编号：\${letterNo}</p>
</div>

<p style="text-indent: 0; margin-bottom: 20px; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;"><strong>\${targetUnit}：</strong></p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">本所接受<strong>\${clientName}</strong>（身份证号：\${clientIdNumber}）的委托，指派<strong>\${lawyerNames}</strong>律师（执业证号：\${lawyerLicenseNo}）担任其涉嫌<strong>\${causeOfAction}</strong>一案的辩护人/诉讼代理人。</p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">现因案件办理需要，特申请会见犯罪嫌疑人/被告人<strong>\${clientName}</strong>。根据《中华人民共和国刑事诉讼法》第三十九条之规定，请予安排会见时间和地点。</p>

<p style="text-indent: 0; margin: 20px 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">此致</p>

<div style="text-align: right; margin-top: 40px; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">
  <p style="text-indent: 0; margin: 0 0 8px 0;">承办律师：\${lawyerNames}</p>
  <p style="text-indent: 0; margin: 0 0 8px 0;">\${firmName}</p>
  <p style="text-indent: 0; margin: 0;">\${date}</p>
</div>
    `,fileReview:`
<div style="text-align: center; margin-bottom: 30px;">
  <h2 style="text-align: center; font-family: 'FZXiaoBiaoSong-B05S', '方正小标宋', 'FZXBS', serif; font-size: 22pt; font-weight: normal; letter-spacing: 2pt; margin: 0 0 10px 0;">阅 卷 函</h2>
  <p style="text-align: center; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; margin: 0;">编号：\${letterNo}</p>
</div>

<p style="text-indent: 0; margin-bottom: 20px; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;"><strong>\${targetUnit}：</strong></p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">本所接受<strong>\${clientName}</strong>的委托，指派<strong>\${lawyerNames}</strong>律师担任<strong>\${matterName}</strong>案件的诉讼代理人/辩护人。</p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">根据《中华人民共和国刑事诉讼法》及相关法律规定，辩护律师自人民检察院对案件审查起诉之日起，可以查阅、摘抄、复制本案的案卷材料。</p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">现因案件办理需要，特申请查阅本案全部案卷材料，请予安排。</p>

<p style="text-indent: 0; margin: 20px 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">此致</p>

<div style="text-align: right; margin-top: 40px; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">
  <p style="text-indent: 0; margin: 0 0 8px 0;">承办律师：\${lawyerNames}</p>
  <p style="text-indent: 0; margin: 0 0 8px 0;">\${firmName}</p>
  <p style="text-indent: 0; margin: 0;">\${date}</p>
</div>
    `,investigation:`
<div style="text-align: center; margin-bottom: 30px;">
  <h2 style="text-align: center; font-family: 'FZXiaoBiaoSong-B05S', '方正小标宋', 'FZXBS', serif; font-size: 22pt; font-weight: normal; letter-spacing: 2pt; margin: 0 0 10px 0;">调 查 函</h2>
  <p style="text-align: center; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; margin: 0;">编号：\${letterNo}</p>
</div>

<p style="text-indent: 0; margin-bottom: 20px; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;"><strong>\${targetUnit}：</strong></p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">本所接受<strong>\${clientName}</strong>的委托，指派<strong>\${lawyerNames}</strong>律师办理<strong>\${matterName}</strong>法律事务。</p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">现因案件办理需要，需向贵单位调取以下材料/了解以下情况：</p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">1. _______________________</p>
<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">2. _______________________</p>
<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">3. _______________________</p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">根据《中华人民共和国律师法》第三十五条之规定，律师自行调查取证的，凭律师执业证书和律师事务所证明，可以向有关单位或者个人调查与承办法律事务有关的情况。</p>

<p style="text-indent: 2em; margin: 0; padding: 0; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">请贵单位予以协助配合，谢谢！</p>

<div style="text-align: right; margin-top: 40px; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 16pt; line-height: 28pt;">
  <p style="text-indent: 0; margin: 0 0 8px 0;">承办律师：\${lawyerNames}</p>
  <p style="text-indent: 0; margin: 0 0 8px 0;">联系电话：\${firmPhone}</p>
  <p style="text-indent: 0; margin: 0 0 8px 0;">\${firmName}</p>
  <p style="text-indent: 0; margin: 0;">\${date}</p>
</div>
    `};t.content=e[o]||""}function O(){t.content=D(t.content,{letterType:t.letterType,templateName:t.name}),p.value=!1,r.value=!0,g.success("已切换为分块模板，请继续调整内容区块")}function L(){s(),c.setState({title:"新增出函模板"}),c.open()}function U(o){const e=k(o.content||"");m.value=o.id,p.value=!X(e),r.value=!p.value,Object.assign(t,{name:o.name,letterType:o.letterType,content:e,description:o.description||""}),c.setState({title:"编辑出函模板"}),c.open()}return x({openCreate:L,openEdit:U}),(o,e)=>(v(),B(n(I),{class:"w-[1000px]","confirm-text":"保存模板"},{default:a(()=>[i(n(j),{"label-col":{span:4},"wrapper-col":{span:19}},{default:a(()=>[i(n(M),{gutter:16},{default:a(()=>[i(n(T),{span:12},{default:a(()=>[i(n(N),{label:"模板名称",required:"","label-col":{span:8},"wrapper-col":{span:16}},{default:a(()=>[i(n(q),{value:t.name,"onUpdate:value":e[0]||(e[0]=l=>t.name=l),placeholder:"如：律师介绍信"},null,8,["value"])]),_:1})]),_:1}),i(n(T),{span:12},{default:a(()=>[i(n(N),{label:"函件类型",required:"","label-col":{span:6},"wrapper-col":{span:18}},{default:a(()=>[i(n(J),{value:t.letterType,"onUpdate:value":e[1]||(e[1]=l=>t.letterType=l),options:C,style:{width:"200px"}},null,8,["value"])]),_:1})]),_:1})]),_:1}),i(n(N),{label:"描述"},{default:a(()=>[i(n(H),{value:t.description,"onUpdate:value":e[2]||(e[2]=l=>t.description=l),rows:2,placeholder:"模板用途说明"},null,8,["value"])]),_:1})]),_:1}),i(n(W),{style:{margin:"12px 0"}}),$("div",ee,[i(n(w),null,{default:a(()=>[i(n(d),{type:r.value?"primary":"default",size:"small",onClick:e[3]||(e[3]=l=>r.value=!0)},{default:a(()=>[...e[11]||(e[11]=[f(" 📝 分块编辑（推荐） ",-1)])]),_:1},8,["type"]),i(n(d),{type:r.value?"default":"primary",size:"small",disabled:!p.value,onClick:e[4]||(e[4]=l=>r.value=!1)},{default:a(()=>[...e[12]||(e[12]=[f(" 📄 兼容模式 ",-1)])]),_:1},8,["type","disabled"])]),_:1})]),p.value?(v(),B(n(S),{key:1,message:"当前模板为旧版富文本模板",description:"旧模板仍可在兼容模式下编辑，但不再推荐继续维护格式。建议先迁移为分块模板，后续只维护内容区块，由系统统一排版。",type:"warning","show-icon":"",style:{"margin-bottom":"12px"}},{action:a(()=>[i(n(d),{size:"small",type:"primary",onClick:O},{default:a(()=>[...e[13]||(e[13]=[f(" 迁移为分块模板 ",-1)])]),_:1})]),_:1})):(v(),B(n(S),{key:0,message:"推荐使用分块模板",description:"管理员只维护标题、编号、收件单位、正文、落款等内容区块，打印和 PDF 的排版由系统统一控制。",type:"success","show-icon":"",style:{"margin-bottom":"12px"}})),r.value?(v(),G("div",te,[i(Z,{modelValue:t.content,"onUpdate:modelValue":e[5]||(e[5]=l=>t.content=l),variables:y},null,8,["modelValue"])])):(v(),G("div",ne,[i(n(S),{message:"兼容模式仅用于维护旧模板",description:"该模式保留给历史富文本模板，后续新增模板请统一使用分块编辑。",type:"info","show-icon":"",style:{"margin-bottom":"12px"}}),$("div",ie,[e[18]||(e[18]=$("span",{style:{"margin-right":"12px","font-size":"13px",color:"#666"}},"快速加载模板：",-1)),i(n(w),null,{default:a(()=>[i(n(d),{size:"small",onClick:e[6]||(e[6]=l=>_("introduction"))},{default:a(()=>[...e[14]||(e[14]=[f(" 介绍信 ",-1)])]),_:1}),i(n(d),{size:"small",onClick:e[7]||(e[7]=l=>_("meeting"))},{default:a(()=>[...e[15]||(e[15]=[f(" 会见函 ",-1)])]),_:1}),i(n(d),{size:"small",onClick:e[8]||(e[8]=l=>_("fileReview"))},{default:a(()=>[...e[16]||(e[16]=[f(" 阅卷函 ",-1)])]),_:1}),i(n(d),{size:"small",onClick:e[9]||(e[9]=l=>_("investigation"))},{default:a(()=>[...e[17]||(e[17]=[f(" 调查函 ",-1)])]),_:1})]),_:1})]),i(V,{modelValue:t.content,"onUpdate:modelValue":e[10]||(e[10]=l=>t.content=l),height:"400px",placeholder:"请输入函件模板内容...",variables:y,"show-variables":!0},null,8,["modelValue"])]))]),_:1}))}});export{be as _};
