var b=(m,n,a)=>new Promise((f,s)=>{var i=o=>{try{p(a.next(o))}catch(l){s(l)}},v=o=>{try{p(a.throw(o))}catch(l){s(l)}},p=o=>o.done?f(o.value):Promise.resolve(o.value).then(i,v);p((a=a.apply(m,n)).next())});import{ao as D,cN as I,cg as E,bB as M,bb as C}from"./bootstrap-BKAhjMte.js";import{s as L}from"./sanitize-B0NuSYzt.js";import{d as A}from"./print-formatter-nBVWo7Ze.js";import{cn as O,T as Y,b9 as w,L as $,b2 as k,ab as H,G as d,bJ as g,ae as u,m as N,ai as T}from"../jse/index-index-BBo-se1k.js";import{i as R,f as B,a as V,b as W,c as q}from"./letter-formatter-gZy4Trl4.js";import G from"./index-Iu2PmVPs.js";import{T as U}from"./index-BbW5RIVa.js";import{O as j}from"./print-DwS63wl-.js";import{u as z}from"./use-modal-rqdp9bmg.js";import"./useFlexGapSupport-DSQWxCAN.js";import"./colors-C-cp0AKe.js";import"./DialogTitle-X5rmoCNU.js";import"./x-g6IowzDi.js";const J=()=>{const m=O(),n=m.year();return{matterName:"张三诉李四民间借贷纠纷案",matterNo:`M${n}001234`,causeOfAction:"民间借贷纠纷",caseType:"民事",trialStage:"一审",procedureStage:"一审",clientName:"张三",clientRole:"PLAINTIFF",clientRoleName:"原告",clientIdNumber:"520102199001011234",clientAddress:"贵州省贵阳市云岩区中华中路123号",clientPhone:"13800138000",clientEmail:"zhangsan@example.com",clientPostcode:"550001",legalRepresentative:"张三",creditCode:"",opposingParty:"李四",opposingPartyRole:"DEFENDANT",opposingPartyRoleName:"被告",opposingLawyerName:"赵律师",opposingLawyerFirm:"某某律师事务所",lawyerNames:"王明律师、刘强律师",lawyerLicenseNo:"15200101912345678",firmName:"律师事务所",firmAddress:"",firmPhone:"",firmLicense:"",firmLegalPerson:"",firmEmail:"",firmFax:"",firmWebsite:"",firmPostcode:"",matterType:"诉讼案件",businessType:"民事诉讼",claimAmount:"100,000.00",jurisdictionCourt:"贵阳市云岩区人民法院",targetUnit:"贵阳市云岩区人民法院",targetAddress:"贵州省贵阳市云岩区中华中路456号",letterNo:`WD-HJ-${n}-0001`,date:m.format("YYYY年MM月DD日"),currentYear:String(n),currentDate:m.format("YYYY年MM月DD日"),contractNo:`${n}民代字第0001号`}},X={class:"preview-toolbar"},Z={class:"preview-container"},K={class:"preview-paper"},Q=["innerHTML"],ee={class:"preview-footer"},te=Y({__name:"PreviewModal",setup(m,{expose:n}){const a=w(""),f=w(""),s=w(0),i=w(J());function v(){return b(this,null,function*(){try{const[e,t]=yield Promise.all([I().catch(()=>({})),E().catch(()=>null)]),r=e!=null?e:{},c=[["firmName",r["firm.name"]],["firmAddress",r["firm.address"]],["firmPhone",r["firm.phone"]],["firmLicense",r["firm.license"]],["firmEmail",r["firm.email"]],["firmLegalPerson",r["firm.legal.rep"]],["firmFax",r["firm.fax"]],["firmWebsite",r["firm.website"]],["firmPostcode",r["firm.postcode"]]];for(const[F,P]of c)P&&(i.value[F]=P);t&&(t.realName&&(i.value.lawyerNames=`${t.realName}律师`),t.lawyerLicenseNo&&(i.value.lawyerLicenseNo=t.lawyerLicenseNo),t.phone)}catch(e){console.warn("加载律所信息失败，使用默认值",e)}})}const p={FILE_REVIEW:"阅 卷 函",INTRODUCTION:"介 绍 信",INVESTIGATION:"调 查 函",LEGAL_OPINION:"法 律 意 见 函",MEETING:"会 见 函",OTHER:"函 件"};function o(e){return(e.letterType?p[e.letterType]:"")||e.name||"函 件"}function l(e,t){const r=e.trim();return!r||/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/i.test(r)||/letter-preview-fallback-title/.test(r)?r:`
    <div class="letter-preview-fallback-title" style="margin-bottom: 30px; text-align: center;">
      <h2 style="margin: 0; font-family: 'FZXiaoBiaoSong-B05S', '方正小标宋简体', '方正小标宋', 'FZXBS', 'FangSong', '仿宋', serif; font-size: 22pt; font-weight: normal; letter-spacing: 2pt;">
        ${t}
      </h2>
    </div>
    ${r}
  `}function y(e){const t=e.trim();return t&&`
    <article class="letter-preview-shell">
      <div class="letter-preview-body">
        ${t}
      </div>
    </article>
  `}const[_,h]=z({footer:!1,onOpenChange(e){e||(s.value+=1,f.value="",a.value="")}});function S(){const e=window.open("","_blank");if(!e){M.error("无法打开打印窗口，请检查浏览器弹窗设置");return}e.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${f.value}</title>
      <style>
        ${j}
        
    .letter-preview-body {
      color: #111827;
    }
    .letter-preview-fallback-title {
      position: relative;
      padding-bottom: 18px;
      margin-bottom: 30px !important;
      text-align: center;
    }
    .letter-preview-fallback-title::after {
      position: absolute;
      right: 8%;
      bottom: 0;
      left: 8%;
      height: 1px;
      content: '';
      background: linear-gradient(90deg, transparent, #d9d9d9 12%, #d9d9d9 88%, transparent);
    }
    .letter-preview-body > p,
    .letter-preview-body > div > p {
      text-align: justify;
    }
    .preview-var { color: #000; font-weight: 500; }
  
      </style>
    </head>
    <body>
      ${L(a.value)}
    </body>
    </html>
  `),e.document.close(),e.print()}function x(e){return b(this,null,function*(){const t=++s.value;f.value=e.name,a.value="";const r=A(e.content||""),c=o(e);!i.value.firmAddress&&!i.value.firmPhone&&(yield v(),s.value!==t)||(R(r)?a.value=y(l(B(r,i.value),c)):V(r)?a.value=y(l(W(r,i.value),c)):a.value=y(l(q(r,i.value),c)),s.value===t&&(h.setState({title:`预览 - ${e.name}`}),h.open()))})}return $(()=>{v()}),n({open:x}),(e,t)=>(k(),H(d(_),{title:"函件预览",class:"w-[800px]"},{default:g(()=>[u("div",X,[N(d(G),null,{default:g(()=>[N(d(D),{type:"primary",onClick:S},{default:g(()=>[...t[0]||(t[0]=[T("打印 / 导出PDF",-1)])]),_:1})]),_:1})]),u("div",Z,[u("div",K,[u("div",{innerHTML:d(L)(a.value),class:"preview-content"},null,8,Q)])]),u("div",ee,[N(d(U),{color:"blue"},{default:g(()=>[...t[1]||(t[1]=[T("蓝色文字",-1)])]),_:1}),t[2]||(t[2]=T(" 表示已替换的变量值（实际函件中为正常黑色） ",-1))])]),_:1}))}}),we=C(te,[["__scopeId","data-v-4816842d"]]);export{we as default};
