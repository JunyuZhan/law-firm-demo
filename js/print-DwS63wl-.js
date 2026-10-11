const S=["起诉状","答辩状","上诉状","法律意见书","律师函","代理词","辩护词","公函","介绍信","函件","申请书","申诉状","再审申请书"];function x(t){return t?S.some(e=>t.includes(e)||e.includes(t)):!1}function d(t){if(!t)return t;const e={"&quot;":'"',"&amp;":"&","&lt;":"<","&gt;":">","&apos;":"'","&#39;":"'","&#x27;":"'","&nbsp;":" "};let n=t;for(const[l,i]of Object.entries(e))n=n.split(l).join(i);return n=n.replaceAll(/&#(\d+);/g,(l,i)=>String.fromCodePoint(Number.parseInt(i,10))),n=n.replaceAll(/&#x([0-9a-fA-F]+);/g,(l,i)=>String.fromCodePoint(Number.parseInt(i,16))),n}const v=`
  @page { 
    size: A4;
    margin-top: 3.7cm;
    margin-bottom: 3.5cm;
    margin-left: 2.8cm;
    margin-right: 2.6cm;
  }
  body { 
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif; 
    font-size: 16pt; 
    line-height: 28pt;
    color: #000;
    padding: 0;
    margin: 0;
  }
  * {
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif;
  }
  h1, h2, h3 { 
    text-align: center; 
    font-family: "FZXiaoBiaoSong-B05S", "方正小标宋", "FZXBS", serif;
    font-size: 22pt;
    font-weight: normal;
    letter-spacing: 2pt;
    margin: 20pt 0 10pt;
  }
  p { 
    text-indent: 2em; 
    margin: 0; 
    padding: 0;
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif; 
    font-size: 16pt;
    line-height: 28pt;
  }
  .no-indent {
    text-indent: 0;
  }
  .signature { 
    text-align: right; 
    margin-top: 40pt; 
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif; 
    font-size: 16pt;
    line-height: 28pt;
  }
  .header {
    text-align: center;
    margin-bottom: 30pt;
  }
  .title {
    font-size: 22pt;
    font-weight: normal;
    font-family: "FZXiaoBiaoSong-B05S", "方正小标宋", "FZXBS", serif;
    letter-spacing: 2pt;
    margin-bottom: 10pt;
  }
  .letter-no {
    margin-top: 10pt;
    font-size: 16pt;
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif;
  }
  .recipient {
    margin-bottom: 20pt;
    font-size: 16pt;
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif;
    line-height: 28pt;
  }
  .content {
    text-indent: 2em;
    text-align: justify;
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif;
    font-size: 16pt;
    line-height: 28pt;
  }
  .content p {
    margin: 0;
    padding: 0;
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif;
    font-size: 16pt;
    line-height: 28pt;
    text-indent: 2em;
  }
  .footer {
    margin-top: 40pt;
    text-align: right;
    padding-right: 0;
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif;
  }
  .footer-item {
    margin-bottom: 8pt;
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif;
    font-size: 16pt;
    line-height: 28pt;
  }
  .seal-area {
    margin-top: 20pt;
    font-size: 16pt;
    color: #666;
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif;
  }
  .letter-content {
    --letter-title-size: 22pt;
    --letter-body-size: 16pt;
    --letter-line-height: 28pt;
    --letter-recipient-gap: 20pt;
    --letter-signature-gap: 28pt;
    --letter-signature-line-gap: 6pt;
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif !important;
    font-size: var(--letter-body-size) !important;
    line-height: var(--letter-line-height) !important;
    color: #000;
  }
  .letter-content *:not(style) {
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif !important;
  }
  .letter-content p {
    font-size: var(--letter-body-size) !important;
    line-height: var(--letter-line-height) !important;
    text-indent: 2em !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .letter-content .recipient {
    text-indent: 0 !important;
    margin-bottom: var(--letter-recipient-gap) !important;
    font-weight: 600 !important;
  }
  .letter-content .signature {
    margin-top: var(--letter-signature-gap) !important;
    text-align: right !important;
  }
  .letter-content .signature p {
    text-indent: 0 !important;
    margin-bottom: var(--letter-signature-line-gap) !important;
    text-align: right !important;
  }
  .letter-content h2 {
    font-family: "FZXiaoBiaoSong-B05S", "方正小标宋", "FZXBS", serif !important;
    font-size: var(--letter-title-size) !important;
    font-weight: normal !important;
    letter-spacing: 2pt !important;
    text-align: center !important;
    margin: 20pt 0 10pt !important;
  }
  .letter-content div[style*="text-align: center"] {
    text-align: center !important;
  }
  .letter-content div[style*="text-align: right"] {
    text-align: right !important;
  }
  .letter-page {
    --letter-qr-size: 80pt;
    --letter-bottom-reserve: 120pt;
    position: relative;
    box-sizing: border-box;
    height: calc(297mm - 3.7cm - 3.5cm);
    overflow: hidden;
  }
  .letter-page__content {
    box-sizing: border-box;
    height: 100%;
  }
  .letter-page--with-qr .letter-page__content {
    padding-bottom: var(--letter-bottom-reserve);
  }
  .letter-page--compact-1 {
    --letter-line-height: 26pt;
    --letter-recipient-gap: 16pt;
    --letter-signature-gap: 22pt;
    --letter-signature-line-gap: 4pt;
    --letter-qr-size: 72pt;
    --letter-bottom-reserve: 105pt;
  }
  .letter-page--compact-2 {
    --letter-title-size: 20pt;
    --letter-body-size: 15pt;
    --letter-line-height: 24pt;
    --letter-recipient-gap: 12pt;
    --letter-signature-gap: 18pt;
    --letter-signature-line-gap: 3pt;
    --letter-qr-size: 64pt;
    --letter-bottom-reserve: 96pt;
  }
  .letter-page--compact-3 {
    --letter-title-size: 18pt;
    --letter-body-size: 14pt;
    --letter-line-height: 22pt;
    --letter-recipient-gap: 10pt;
    --letter-signature-gap: 14pt;
    --letter-signature-line-gap: 2pt;
    --letter-qr-size: 56pt;
    --letter-bottom-reserve: 88pt;
  }
  .qr-code-area {
    font-family: "FangSong", "仿宋_GB2312", "仿宋", serif !important;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 92pt;
    text-align: center;
  }
  .qr-code-area img {
    width: var(--letter-qr-size) !important;
    height: var(--letter-qr-size) !important;
  }
  @media print {
    body { padding: 0; margin: 0; }
  }
`,z=`
  @page { 
    size: A4;
    margin: 2cm;
  }
  body { 
    font-family: "SimSun", "宋体", serif; 
    font-size: 14pt; 
    line-height: 1.8;
    color: #000;
    padding: 20px;
    margin: 0;
  }
  * {
    font-family: "SimSun", "宋体", serif;
  }
  h1, h2, h3 { 
    text-align: center; 
    font-family: "SimHei", "黑体", sans-serif;
    font-size: 18pt;
    font-weight: bold;
    margin: 20pt 0 10pt;
  }
  p { 
    margin: 0; 
    padding: 0;
    font-family: "SimSun", "宋体", serif; 
    font-size: 14pt;
    line-height: 1.8;
  }
  .content {
    text-align: justify;
    font-family: "SimSun", "宋体", serif;
    font-size: 14pt;
    line-height: 1.8;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  table th,
  table td {
    border: 1px solid #333;
    padding: 8px;
    font-size: 14pt;
  }
  table th {
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: center;
  }
  @media print {
    body { padding: 20px; margin: 0; }
  }
`,_=`
  @page { 
    size: A4;
    margin: 1.5cm;
  }
  body { 
    font-family: "SimSun", "宋体", serif; 
    font-size: 12pt; 
    line-height: 1.6;
    color: #000;
    padding: 15px;
    margin: 0;
  }
  * {
    font-family: "SimSun", "宋体", serif;
  }
  h1, h2, h3 { 
    text-align: center; 
    font-family: "SimHei", "黑体", sans-serif;
    font-size: 16pt;
    font-weight: bold;
    margin: 15pt 0 8pt;
  }
  p { 
    margin: 0; 
    padding: 0;
    font-family: "SimSun", "宋体", serif; 
    font-size: 12pt;
    line-height: 1.6;
  }
  .content {
    text-align: justify;
    font-family: "SimSun", "宋体", serif;
    font-size: 12pt;
    line-height: 1.6;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }
  table th,
  table td {
    border: 1px solid #333;
    padding: 6px;
    font-size: 12pt;
  }
  table th {
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: center;
  }
  @media print {
    body { padding: 15px; margin: 0; }
  }
`;function y(t){const{title:e="文档打印",content:n,useOfficialFormat:l=!0,internalFontSize:i="size4",customStyles:r=""}=t,o=window.open("","_blank");if(!o)throw new Error("无法打开打印窗口，请检查浏览器弹窗设置");let s="";l?s=v:s=i==="small4"?_:z,r&&(s+=r);const m=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${e}</title>
      <style>
        ${s}
      </style>
    </head>
    <body>
      ${n}
    </body>
    </html>
  `;o.document.write(m),o.document.close();let a=!1,p=null,g=null;const h=()=>{!a&&o&&!o.closed&&(a=!0,p&&clearTimeout(p),g&&clearTimeout(g),o.print())},u=()=>{a=!0,p&&clearTimeout(p),g&&clearTimeout(g)};o.addEventListener("load",()=>{p=setTimeout(h,250)}),p=setTimeout(()=>{!a&&o&&!o.closed&&(o.document.readyState==="complete"?h():g=setTimeout(()=>{!a&&o&&!o.closed&&h()},200))},500),o.addEventListener("beforeunload",u);let f=null;f=()=>{a&&(u(),f&&o.removeEventListener("focus",f))},o.addEventListener("focus",f)}function c(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function $(t){const n=d(t).split(`
`).map(a=>a.trimEnd()).map(a=>a.trim()).filter(a=>a.length>0),l=w(n);let i="";const r=[],o=[];n.forEach((a,p)=>{if(b(a)){i=`<p class="recipient"><strong>${c(a)}</strong></p>`;return}if(p>=l){o.push(`<p>${c(a)}</p>`);return}r.push(`<p>${c(a)}</p>`)});const s=r.join(""),m=o.length>0?`<div class="signature">${o.join("")}</div>`:"";return`<div class="letter-content">${i}${s}${m}</div>`}function b(t){return t.startsWith("致：")||t.startsWith("致:")||t.startsWith("收件人：")}function F(t){return t.includes("律师事务所")||t.includes("律所")||/^\d{4}年\d{1,2}月\d{1,2}日$/.test(t)||/^\d{4}-\d{1,2}-\d{1,2}$/.test(t)||t.startsWith("联系电话：")||t.startsWith("联系电话:")||t.startsWith("电话：")||t.startsWith("地址：")||t.startsWith("承办律师：")||t.includes("（签章）")||t.includes("（盖章）")}function w(t){var l,i;let e=-1;for(let r=t.length-1;r>=0;r--){const o=(l=t[r])!=null?l:"";if(o.includes("特此")||o.includes("此致")||o.includes("敬礼")){e=r+1;break}if(b(o))break}if(e>0&&e<t.length)return e;let n=0;for(let r=t.length-1;r>=0;r--){if(F((i=t[r])!=null?i:"")){n++;continue}break}return n>0?t.length-n:t.length}function A(t){const e=t.templateName||t.letterTypeName||"介绍信",n=t.qrCodeBase64?`
    <div class="qr-code-area">
      <div style="font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 12pt; color: #000; margin-bottom: 6pt; line-height: 18pt;">扫码核验</div>
      <img src="${t.qrCodeBase64}" alt="验证二维码" style="width: 80pt; height: 80pt; display: inline-block;" />
      <div style="font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif; font-size: 12pt; color: #000; margin-top: 6pt; line-height: 18pt;">编号：${t.applicationNo}</div>
    </div>
    `:"";if(t.content&&t.content.trim()){const l=d(t.content),r=/<(?:div|p|h[1-6]|span|strong|em|br|table|ul|ol|li)[^>]*>/i.test(l)?l:$(l);return[`<div class="letter-page${t.qrCodeBase64?" letter-page--with-qr":""}">`,'<div class="letter-page__content">',r,"</div>",n,"</div>"].join("")}return`
    <div class="letter-page${t.qrCodeBase64?" letter-page--with-qr":""}">
    <div class="letter-page__content">
    <div class="header">
      <div class="title">${c(e)}</div>
      <div class="letter-no">编号：${c(t.applicationNo)}</div>
    </div>
    <div class="recipient">${c(t.targetUnit)}：</div>
    <div class="content">${c(t.content||"")}</div>
    <div class="footer">
      <div class="footer-item">出函律师：${c(t.lawyerNames||"-")}</div>
      <div class="footer-item" style="margin-top: 20pt;">${c(t.firmName)}</div>
      <div class="footer-item">${c(t.date)}</div>
      <div class="seal-area">（盖章处）</div>
    </div>
    </div>
    ${n}
    </div>
  `}function T(t,e=""){return t.replace(/class="([^"]*\bletter-page\b[^"]*)"/,(n,l)=>{const i=l.split(/\s+/).filter(r=>r&&!r.startsWith("letter-page--compact-"));return e&&i.push(e),`class="${i.join(" ")}"`})}function B(t){if(typeof document=="undefined"||!document.body)return t;const e=["","letter-page--compact-1","letter-page--compact-2","letter-page--compact-3"];for(const n of e){const l=T(t,n),i=document.createElement("div");i.style.cssText="position:fixed;left:-100000px;top:0;width:156mm;visibility:hidden;pointer-events:none;z-index:-1;",i.innerHTML=`<style>${v}</style>${l}`,document.body.append(i);try{const r=i.querySelector(".letter-page");if(r&&r.scrollHeight<=r.clientHeight+2)return l}finally{i.remove()}}throw new Error("函件内容超出单页A4范围，系统已自动压缩版式但仍无法放入一页")}function L(t){const e=B(A(t));y({title:`${t.templateName||t.letterTypeName} - ${t.applicationNo}`,content:e,useOfficialFormat:!0})}function E(t){if(!t)return"";let e=t;return e=e.replaceAll(/```[\s\S]*?```/g,""),e=e.replaceAll(/`([^`]+)`/g,"$1"),e=e.replaceAll(/\*\*([^*]+)\*\*/g,"$1"),e=e.replaceAll(/__([^_]+)__/g,"$1"),e=e.replaceAll(new RegExp("(?<!\\*)\\*([^*]+)\\*(?!\\*)","g"),"$1"),e=e.replaceAll(new RegExp("(?<!_)_([^_]+)_(?!_)","g"),"$1"),e=e.replaceAll(/\[([^\]]+)\]\([^)]+\)/g,"$1"),e=e.replaceAll(/^#{1,6}\s+/gm,""),e=e.replaceAll(/^\s*[-*+]\s+/gm,""),e=e.replaceAll(/^\s*\d+\.\s+/gm,""),e=e.replaceAll("|"," "),e=e.replaceAll(/^\s*[-:]+\s*$/gm,""),e=e.replaceAll(/\n{3,}/g,`

`),e.trim()}function C(t){const{title:e,content:n,preserveFormat:l=!1}=t;let i=d(n);const r=e?d(e):"";/\*\*|__|[`#>|]|\[[^\]]+\]\(/.test(i)&&!l&&(i=E(i));let s="";if(r&&(s+=`<div class="header"><div class="title">${r}</div></div>`),l)s+=`<div class="content" style="white-space: pre-wrap; font-family: 'FangSong', '仿宋_GB2312', '仿宋', serif;">${i}</div>`;else{const m=i.split(`
`).filter(a=>a.trim());s+='<div class="content">',m.forEach((a,p)=>{s+=`<p class="${p===0?"no-indent":""}">${a}</p>`}),s+="</div>"}return s}function q(t){const e=C(t),n=!t.forceInternal&&x(t.documentType);y({title:t.title||"文书打印",content:e,useOfficialFormat:n,internalFontSize:t.internalFontSize||"size4"})}export{v as O,q as a,L as p};
