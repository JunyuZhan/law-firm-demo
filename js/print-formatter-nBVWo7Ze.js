const d=e=>`\${${e}}`,O=`甲方：${d("clientName")}`,L=`乙方：${d("firmName")}`,E="甲方（签章）：",I="乙方（签章）：",P=`签订日期：${d("signDate")}`;function w(e,c){if(c&&c.trim())return c.trim();switch(e){case"ADMINISTRATIVE_PROXY":return"行政委托代理合同";case"CRIMINAL_DEFENSE":return"刑事委托辩护合同";case"CUSTOM":return"法律服务合同";case"LEGAL_COUNSEL":return"常年法律顾问合同";case"NON_LITIGATION":return"非诉法律服务合同";default:return"民事委托代理合同"}}function B(e){return JSON.stringify({_structured:!0,_version:1,blocks:{title:{contractName:w(e==null?void 0:e.templateType,e==null?void 0:e.templateName)},parties:{partyA:O,partyB:L},clauses:"",signature:{partyASign:E,partyBSign:I,signInfo:P}}})}function m(e){if(!e)return e;const c={"&quot;":'"',"&amp;":"&","&lt;":"<","&gt;":">","&apos;":"'","&#39;":"'","&#x27;":"'","&nbsp;":" "};let r=e;for(const[t,a]of Object.entries(c))r=r.split(t).join(a);return r=r.replaceAll(/&#(\d+);/g,(t,a)=>String.fromCodePoint(Number.parseInt(a,10))),r=r.replaceAll(/&#x([0-9a-fA-F]+);/g,(t,a)=>String.fromCodePoint(Number.parseInt(a,16))),r}function C(e){if(!e||typeof e!="string")return!1;const c=m(e);try{const r=JSON.parse(c);if(r&&typeof r=="object"&&r._structured===!0)return!0}catch(r){}try{const r=c.trim();if(r.startsWith("{")&&r.endsWith("}")){const t=JSON.parse(r);if(t&&typeof t=="object"&&t._structured===!0)return!0}if(r.startsWith('"')&&r.endsWith('"'))try{const t=JSON.parse(r);if(typeof t=="string"){const a=JSON.parse(t);if(a&&typeof a=="object"&&a._structured===!0)return!0}}catch(t){}}catch(r){}return!1}function W(e){if(!e||typeof e!="string")return null;const c=m(e);try{const r=JSON.parse(c);if(r&&typeof r=="object"&&r._structured===!0)return r}catch(r){}try{const r=c.trim();if(r.startsWith("{")&&r.endsWith("}"))try{const t=JSON.parse(r);if(t&&typeof t=="object"&&t._structured===!0)return t}catch(t){}if(r.startsWith('"')&&r.endsWith('"'))try{const t=JSON.parse(r);if(typeof t=="string"){const a=JSON.parse(t);if(a&&typeof a=="object"&&a._structured===!0)return a}}catch(t){}}catch(r){}return null}function j(e){return m(e).replaceAll(/<br\s*\/?>/gi,`
`).replaceAll(/<\/(?:p|div|h[1-6]|li|tr|table)>/gi,`
`).replaceAll(/<[^>]+>/g,"").replaceAll("\r","").split(`
`).map(t=>t.trim()).filter(t=>t.length>0)}function $(e){return e.includes("合同编号")||e.includes("编号")&&e.includes("字第")}function _(e){return e.startsWith("甲方")||e.startsWith("委托方")}function T(e){return e.startsWith("乙方")||e.startsWith("受托方")}function F(e){return e.includes("签章")||e.includes("盖章")||e.includes("签字")||e.includes("签订日期")||e.includes("签订地点")||/^\d{4}年\d{1,2}月\d{1,2}日/.test(e)}function R(e,c){var o,s,u,f,y,h,S,x,b,A;if(C(e))return e;const r=j(e),t=JSON.parse(B(c));if(r.length===0)return JSON.stringify(t);let a=0;!$((o=r[0])!=null?o:"")&&!_((s=r[0])!=null?s:"")&&!T((u=r[0])!=null?u:"")&&(t.blocks.title.contractName=(f=r[0])!=null?f:t.blocks.title.contractName,a=1),$((y=r[a])!=null?y:"")&&(a+=1),_((h=r[a])!=null?h:"")&&(t.blocks.parties.partyA=(S=r[a])!=null?S:O,a+=1),T((x=r[a])!=null?x:"")&&(t.blocks.parties.partyB=(b=r[a])!=null?b:L,a+=1);let n=r.length;for(let p=r.length-1;p>=a;p--){if(F((A=r[p])!=null?A:"")){n=p;continue}break}t.blocks.clauses=r.slice(a,n).join(`

`);const i=r.slice(n);if(i.length>0){const p=i.find(l=>l.includes("甲方")),g=i.find(l=>l.includes("乙方")),N=i.filter(l=>l!==p&&l!==g);p&&(t.blocks.signature.partyASign=p),g&&(t.blocks.signature.partyBSign=g),N.length>0&&(t.blocks.signature.signInfo=N.join(`
`))}return JSON.stringify(t)}function J(e,c=!0){return e?e.split(`
`).filter(t=>t.trim()).map(t=>{const a=t.trim();return/^[一二三四五六七八九十]+、/.test(a)||/^第[一二三四五六七八九十]+条/.test(a)||/^\d+[.、]/.test(a)?`<p style="text-indent: 0; margin-top: 1em; font-weight: 600;">${a}</p>`:`<p style="${c?"text-indent: 2em;":""}">${a}</p>`}).join(`
`):""}function k(e,c={}){if(!e||e.trim()==="")return"<p>模板内容为空</p>";const r=W(e);if(!r)return console.warn("内容不是结构化格式，尝试作为纯文本处理"),D(e,c);const{blocks:t}=r;if(!t||typeof t!="object")return console.error("结构化内容格式错误：blocks 不存在或格式不正确"),'<p style="color: red;">⚠️ 模板内容格式错误：缺少 blocks 字段</p>';const a=i=>{if(!i)return"";let o=i;return Object.entries(c).forEach(([s,u])=>{const f=s.replaceAll(/[.*+?^${}()|[\]\\]/g,String.raw`\$&`);o=o.replaceAll(new RegExp(String.raw`\$\{${f}\}`,"g"),u||`[${s}]`)}),o};let n="";if(t.title&&t.title.contractName){const i=String(t.title.contractName||"").trim();i&&(n+=`<h2 style="text-align: center; font-size: 22pt; font-weight: bold; letter-spacing: 0.2em; margin-bottom: 8px;">${a(i)}</h2>
`)}if(c.contractNo&&(n+=`<p style="text-align: right; font-size: 12pt; margin-bottom: 20px;">合同编号：${c.contractNo}</p>
`),t.parties&&(t.parties.partyA||t.parties.partyB)){if(n+=`<div style="margin: 20px 0;">
`,t.parties.partyA){const i=String(t.parties.partyA||"").trim();i&&i.split(`
`).filter(s=>s.trim()).forEach(s=>{n+=`<p style="text-indent: 2em; margin: 4px 0;">${a(s.trim())}</p>
`})}if(t.parties.partyB){const i=String(t.parties.partyB||"").trim();i&&i.split(`
`).filter(s=>s.trim()).forEach(s=>{n+=`<p style="text-indent: 2em; margin: 4px 0;">${a(s.trim())}</p>
`})}n+=`</div>
`}if(t.clauses){const i=String(t.clauses||"").trim();i&&(n+=`<div style="margin: 24px 0;">
`,n+=J(a(i),!0),n+=`</div>
`)}if(t.signature){if(n+=`<div style="margin-top: 48px;">
`,n+=`<table style="width: 100%; border: none;">
`,n+=`<tr>
`,n+=`<td style="width: 50%; vertical-align: top; border: none; padding-right: 20px;">
`,t.signature.partyASign){const i=String(t.signature.partyASign||"").trim();i?i.split(`
`).filter(s=>s.trim()).forEach(s=>{n+=`<p style="margin: 8px 0;">${a(s.trim())}</p>
`}):(n+=`<p style="margin: 8px 0;"><strong>甲方（签章）：</strong></p>
`,n+=`<p style="margin: 8px 0;">&nbsp;</p>
`)}else n+=`<p style="margin: 8px 0;"><strong>甲方（签章）：</strong></p>
`,n+=`<p style="margin: 8px 0;">&nbsp;</p>
`;if(n+=`</td>
`,n+=`<td style="width: 50%; vertical-align: top; border: none; padding-left: 20px;">
`,t.signature.partyBSign){const i=String(t.signature.partyBSign||"").trim();i?i.split(`
`).filter(s=>s.trim()).forEach(s=>{n+=`<p style="margin: 8px 0;">${a(s.trim())}</p>
`}):(n+=`<p style="margin: 8px 0;"><strong>乙方（签章）：</strong></p>
`,n+=`<p style="margin: 8px 0;">&nbsp;</p>
`)}else n+=`<p style="margin: 8px 0;"><strong>乙方（签章）：</strong></p>
`,n+=`<p style="margin: 8px 0;">&nbsp;</p>
`;if(n+=`</td>
`,n+=`</tr>
`,n+=`</table>
`,t.signature.signInfo){const i=String(t.signature.signInfo||"").trim();i&&(n+=`<p style="text-align: center; margin-top: 32px;">${a(i)}</p>
`)}n+=`</div>
`}return!n||n.trim()===""?'<p style="color: orange;">⚠️ 模板内容为空，请填写至少一个区块的内容</p>':n}function D(e,c={}){if(!e)return"";const r=e.trim();if(r.startsWith("{")&&r.endsWith("}")||r.startsWith("[")&&r.endsWith("]"))try{let i=JSON.parse(e);if(typeof i=="string")try{i=JSON.parse(i)}catch(o){}if(i&&typeof i=="object"&&i._structured===!0&&i.blocks)return console.warn("formatPlainTextForPrint: 检测到结构化内容但未被 isStructuredContent 识别，尝试重新格式化"),k(typeof i=="string"?i:e,c)}catch(i){console.warn("formatPlainTextForPrint: JSON 解析失败，作为纯文本处理",i)}let t=e;if(Object.entries(c).forEach(([i,o])=>{const s=i.replaceAll(/[.*+?^${}()|[\]\\]/g,String.raw`\$&`);t=t.replaceAll(new RegExp(String.raw`\$\{${s}\}`,"g"),o||`[${i}]`)}),/<[^>]+>/.test(t))return t;const a=t.split(`
`);let n="";return a.forEach((i,o)=>{const s=i.trim();if(!s){n+=`<p>&nbsp;</p>
`;return}if(o===0||s.includes("合同")&&s.length<30&&!s.includes("：")){n+=`<h2 style="text-align: center; font-size: 22pt; font-weight: bold; letter-spacing: 0.2em; margin: 16px 0;">${s}</h2>
`;return}if(s.includes("合同编号")||s.includes("编号")&&s.includes("字第")){n+=`<p style="text-align: right; margin: 8px 0 16px;">${s}</p>
`;return}if(/^[一二三四五六七八九十]+[、．.]/.test(s)||/^第[一二三四五六七八九十]+条/.test(s)){n+=`<h3 style="font-size: 14pt; font-weight: 600; margin: 1.5em 0 0.5em; text-indent: 0;">${s}</h3>
`;return}if(s.includes("签章")||s.includes("盖章")||s.includes("签字")){n+=`<p style="margin: 8px 0; font-weight: 500;">${s}</p>
`;return}if(/^\d{4}年\d{1,2}月\d{1,2}日/.test(s)||s.includes("签订日期")){n+=`<p style="text-align: center; margin-top: 24px;">${s}</p>
`;return}n+=`<p style="text-indent: 2em; margin: 4px 0;">${s}</p>
`}),n}export{D as a,R as b,B as c,m as d,k as f,C as i};
