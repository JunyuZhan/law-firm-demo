var G=(X,U,L)=>new Promise((K,M)=>{var i=N=>{try{T(L.next(N))}catch(I){M(I)}},m=N=>{try{T(L.throw(N))}catch(I){M(I)}},T=N=>N.done?K(N.value):Promise.resolve(N.value).then(i,m);T((L=L.apply(X,U)).next())});import{bu as je,b7 as He,ao as P,bJ as V,c9 as Ue,bB as k,cL as qe,bb as Ve}from"./bootstrap-BKAhjMte.js";import{b as Ye}from"./index-27-ZPfVC.js";import{downloadDocument as We,previewDocument as Je,downloadDocumentsAsZip as Ke}from"./index-9RXlvN44.js";import{u as Ze}from"./usePermission-D0mmkUiC.js";import{S as Qe}from"./index-BjRadMO3.js";import{A as Z}from"./index-BW2oKRfH.js";import{C as Q}from"./index-DeG2299F.js";import{D as Y,a as p}from"./index-DEb_ixFZ.js";import{T as B}from"./index-BbW5RIVa.js";import fe from"./index-Iu2PmVPs.js";import{R as Xe,C as et}from"./index-BNKqLQ0T.js";import{S as tt}from"./index-CFegMuqu.js";import{T as at,a as R}from"./index-DOQ9ddte.js";import{T as j}from"./index-QX59iNB-.js";import{M as lt,a as ve}from"./index-CcTnLHbT.js";import he from"./index-CesMLKJi.js";import{T as nt}from"./index-DfI2QDnI.js";import{_ as ot}from"./page.vue_vue_type_script_setup_true_lang-DIc2LY-W.js";import{T as it,b9 as F,aa as W,M as rt,L as st,b2 as f,ab as w,bJ as a,m as n,G as e,ae as v,ai as s,ad as $,bp as d,ac as x,F as H,bb as J,aR as dt}from"../jse/index-index-BBo-se1k.js";import"./isPlainObject-0VgL4BNS.js";import"./Skeleton-CDbHjciw.js";import"./responsiveObserve-DuGZEQrH.js";import"./colors-C-cp0AKe.js";import"./useFlexGapSupport-DSQWxCAN.js";import"./Col-Cycm1Hc6.js";import"./Dropdown-Ch37G9wa.js";import"./Trigger-BNmmN1KC.js";import"./ResizeObserver.es-CDE7jhPe.js";import"./index-CXgga6Gz.js";import"./useRefs-B5_5SWEa.js";import"./hasIn-CPFCJ0oR.js";import"./_baseAssignValue-Bw_cd2rN.js";import"./isSymbol-0bs_rLcS.js";import"./isMobile-8sZ0LT6r.js";import"./useMergedState-BlxRNvy8.js";import"./slide-Dg3Q9Dj0.js";import"./eagerComputed-P44xTRli.js";import"./collapseMotion-CSTBMdqz.js";import"./css-BPcmMxJM.js";import"./index-B5QGtqQC.js";import"./LeftOutlined-Ben_oAz5.js";import"./RightOutlined-DlnZYeW4.js";import"./index-D98B7seV.js";import"./index-DhnMwgWA.js";import"./BaseInput-BPWUxefb.js";import"./Overflow-CKmSJ11O.js";import"./createRef-CUnV3TOs.js";import"./DownOutlined-r-B6U8oy.js";import"./CheckOutlined-6HzjV1KS.js";import"./SearchOutlined-D_tLIbIY.js";import"./move-DE44ucSV.js";import"./List-DRNX56cY.js";import"./useMemo-DtBC0BQD.js";import"./FormItemContext-x6DHag3N.js";import"./statusUtils-CkRa-FA3.js";import"./useBreakpoint-BvaBGvDf.js";import"./index-C8OqGPaW.js";import"./useMaxLevel-8mF59nrK.js";import"./index-DuQ_3X9n.js";import"./roundedArrow-EYTrNAJt.js";import"./index-BgVvuXe3.js";import"./Checkbox-DB9xOn-s.js";import"./index-aVf-jFLI.js";import"./EyeOutlined-BX5m5LUc.js";import"./index-DszPviNj.js";import"./index-CpRoXv4b.js";import"./index-DyT22j5x.js";import"./debounce-BophuJ7v.js";import"./shallowequal-DHfwK5t7.js";import"./_arrayIncludes-B8uzE354.js";const ut={key:0,style:{"margin-left":"8px"}},mt={key:0,style:{"margin-left":"16px"}},ct={key:1,style:{"margin-left":"16px"}},pt={key:0,style:{"margin-top":"16px"}},ft={class:"dossier-view"},vt={class:"dossier-sidebar"},ht={class:"sidebar-header"},_t={class:"dossier-content"},gt={class:"content-header"},yt={style:{display:"flex",gap:"12px","align-items":"center"}},bt={class:"folder-title"},xt={class:"doc-count"},kt={key:0,class:"empty-state"},wt={key:1,class:"document-list"},$t={class:"doc-icon"},It={class:"doc-info"},Dt={class:"doc-name"},St={class:"doc-meta"},Nt={key:0,style:{margin:"0 8px"}},Ct={class:"doc-actions"},Et={key:0,style:{padding:"24px",color:"#999","text-align":"center"}},Tt=it({name:"ArchiveDetail",__name:"index",setup(X){const U=je(),L=He(),{hasPermission:K}=Ze(),M=F(!1),i=F(null),m=F(null),T=F(0),N=F("info"),I=F("all"),_=F([]),q=W(()=>Number(U.params.id)),_e=K("archive:access:apply"),ge=l=>{if(!l)return null;try{return JSON.parse(l)}catch(t){return null}};function ee(){return G(this,null,function*(){if(!q.value){k.error("无效的档案ID");return}const l=++T.value;M.value=!0;try{const t=yield Ye(q.value);if(T.value!==l)return;i.value=t,m.value=ge(t==null?void 0:t.archiveSnapshot),N.value="info",I.value="all",_.value=[]}catch(t){if(T.value!==l)return;k.error(t.message||"加载档案详情失败")}finally{T.value===l&&(M.value=!1)}})}rt(()=>U.params.id,()=>{_.value=[],I.value="all",ee()});function ye(){q.value&&L.push({path:"/archive/access",query:{archiveId:String(q.value),apply:"1"}})}function be(l){return{PENDING:"blue",PENDING_STORE:"orange",STORED:"green",PENDING_MIGRATE:"purple",MIGRATED:"cyan",DESTROYED:"red"}[l||""]||"default"}function xe(l){return{PUSHED:"green",PUSHING:"blue",PUSH_FAILED:"red"}[l||""]||"default"}function ke(l){return{PUSHED:"推送成功",PUSHING:"推送中",PUSH_FAILED:"推送失败"}[l||""]||l||"-"}function we(l){return{TRANSFERRED:"已转移",PARTIAL:"部分转移",TRANSFERRING:"转移中",FAILED:"转移失败",PENDING:"待转移"}[l||""]||l||"-"}function $e(l){return{客户数:"客户",团队成员数:"团队成员",合同数:"合同",收费记录数:"收费记录",工时记录数:"工时记录",文档数:"文档",证据数:"证据",审批记录数:"审批",任务数:"任务"}[l]||l}function Ie(){L.push("/archive/list")}function De(l){return G(this,null,function*(){var t;if((t=i.value)!=null&&t.filesDeleted){k.warning("文件已迁移至档案系统，请前往档案系统下载");return}try{const u=yield We(l.id);qe({source:u,fileName:l.file_name||"document"})}catch(u){k.error(u.message||"下载失败")}})}function Se(l){return G(this,null,function*(){var t;if((t=i.value)!=null&&t.filesDeleted){k.warning("文件已迁移至档案系统，请前往档案系统查看");return}try{const u=yield Je(l.id);u?window.open(u,"_blank"):k.warning("无法预览此文件")}catch(u){k.error(u.message||"预览失败")}})}function Ne(l){const t=_.value.indexOf(l);t===-1?_.value.push(l):_.value.splice(t,1)}function Ce(){const l=O.value;l.every(u=>_.value.includes(u.id))?l.forEach(u=>{const y=_.value.indexOf(u.id);y!==-1&&_.value.splice(y,1)}):l.forEach(u=>{_.value.includes(u.id)||_.value.push(u.id)})}const Ee=W(()=>{const l=O.value;return l.length>0&&l.every(t=>_.value.includes(t.id))});function Te(){return G(this,null,function*(){var l,t;if((l=i.value)!=null&&l.filesDeleted){k.warning("文件已迁移至档案系统，请前往档案系统下载");return}if(_.value.length===0){k.warning("请先选择要下载的文档");return}try{yield Ke(_.value,`档案文档_${((t=i.value)==null?void 0:t.archiveNo)||""}.zip`),k.success("下载成功")}catch(u){k.error(u.message||"下载失败")}})}function ze(){var S;if(_.value.length===0){k.warning("请先选择要打印的文档");return}const t=(((S=m.value)==null?void 0:S.documents)||[]).filter(D=>_.value.includes(D.id)),u=window.open("","_blank","width=800,height=600");if(!u){k.error("无法打开打印窗口");return}const y=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>选中文档清单</title>
      <style>
        body { font-family: "SimSun", serif; padding: 40px; font-size: 14px; }
        h1 { text-align: center; font-size: 18px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background: #e0e0e0; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>选中文档清单（共 ${t.length} 份）</h1>
      <table>
        <thead>
          <tr><th width="50">序号</th><th>文件名称</th><th>所属目录</th><th width="100">上传日期</th></tr>
        </thead>
        <tbody>
          ${t.map((D,C)=>{var o;return`
            <tr>
              <td>${C+1}</td>
              <td>${D.file_name||"-"}</td>
              <td>${D.dossier_folder_name||"-"}</td>
              <td>${((o=D.created_at)==null?void 0:o.split("T")[0])||"-"}</td>
            </tr>
          `}).join("")}
        </tbody>
      </table>
      <div style="margin-top: 30px; text-align: right; color: #666;">
        打印时间：${new Date().toLocaleString()}
      </div>
    </body>
    </html>
  `;u.document.write(y),u.document.close(),u.addEventListener("load",()=>u.print())}function Ae(){var o,r,h,c,b,E,z,A,ne,oe,ie,re,se,de,ue,me,ce;const l=window.open("","_blank","width=800,height=1000");if(!l){k.error("无法打开打印窗口");return}const t=((o=m.value)==null?void 0:o.matterInfo)||{},u=((r=m.value)==null?void 0:r.clientInfo)||[],y=((h=m.value)==null?void 0:h.participants)||[],S=((c=m.value)==null?void 0:c.contractInfo)||[],D=((b=m.value)==null?void 0:b.documents)||[],C=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>档案详情 - ${((E=i.value)==null?void 0:E.archiveNo)||""}</title>
      <style>
        body { font-family: "SimSun", serif; padding: 40px; font-size: 14px; }
        h1 { text-align: center; font-size: 20px; margin-bottom: 30px; }
        h2 { font-size: 16px; border-bottom: 1px solid #333; padding-bottom: 5px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background: #f0f0f0; width: 120px; }
        .section { margin-bottom: 30px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>档案详情</h1>
      
      <div class="section">
        <h2>基本信息</h2>
        <table>
          <tr><th>档案编号</th><td>${((z=i.value)==null?void 0:z.archiveNo)||"-"}</td><th>档案状态</th><td>${((A=i.value)==null?void 0:A.statusName)||"-"}</td></tr>
          <tr><th>项目编号</th><td>${((ne=i.value)==null?void 0:ne.matterNo)||"-"}</td><th>项目名称</th><td>${((oe=i.value)==null?void 0:oe.matterName)||"-"}</td></tr>
          <tr><th>委托人</th><td>${((ie=i.value)==null?void 0:ie.clientName)||"-"}</td><th>承办律师</th><td>${((re=i.value)==null?void 0:re.mainLawyerName)||"-"}</td></tr>
          <tr><th>案件类型</th><td>${t.case_type_name||t.case_type||"-"}</td><th>结案日期</th><td>${((se=i.value)==null?void 0:se.caseCloseDate)||"-"}</td></tr>
          <tr><th>保管期限</th><td>${((de=i.value)==null?void 0:de.retentionPeriodName)||"-"}</td><th>到期日期</th><td>${((ue=i.value)==null?void 0:ue.retentionExpireDate)||"-"}</td></tr>
          <tr><th>卷数</th><td>${((me=i.value)==null?void 0:me.volumeCount)||"-"}</td><th>页数</th><td>${((ce=i.value)==null?void 0:ce.pageCount)||"-"}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>委托人信息</h2>
        <table>
          <tr><th>姓名/名称</th><th>类型</th><th>联系电话</th><th>证件号码</th></tr>
          ${u.map(g=>`<tr><td>${g.name||"-"}</td><td>${g.client_type||"-"}</td><td>${g.phone||"-"}</td><td>${g.id_number||"-"}</td></tr>`).join("")||'<tr><td colspan="4">无</td></tr>'}
        </table>
      </div>

      <div class="section">
        <h2>团队成员</h2>
        <table>
          <tr><th>姓名</th><th>角色</th><th>电话</th><th>邮箱</th></tr>
          ${y.map(g=>`<tr><td>${g.real_name||"-"}</td><td>${g.role||"-"}</td><td>${g.phone||"-"}</td><td>${g.email||"-"}</td></tr>`).join("")||'<tr><td colspan="4">无</td></tr>'}
        </table>
      </div>

      <div class="section">
        <h2>合同信息</h2>
        <table>
          <tr><th>合同编号</th><th>合同名称</th><th>合同金额</th><th>签订日期</th></tr>
          ${S.map(g=>`<tr><td>${g.contract_no||"-"}</td><td>${g.contract_name||"-"}</td><td>${g.amount?`¥${Number(g.amount).toLocaleString()}`:"-"}</td><td>${g.sign_date||"-"}</td></tr>`).join("")||'<tr><td colspan="4">无</td></tr>'}
        </table>
      </div>

      <div class="section">
        <h2>文档清单（共 ${D.length} 份）</h2>
        <table>
          <tr><th>序号</th><th>文件名称</th><th>所属目录</th><th>上传日期</th></tr>
          ${D.map((g,Ge)=>{var pe;return`<tr><td>${Ge+1}</td><td>${g.file_name||"-"}</td><td>${g.dossier_folder_name||"-"}</td><td>${((pe=g.created_at)==null?void 0:pe.split("T")[0])||"-"}</td></tr>`}).join("")||'<tr><td colspan="4">无</td></tr>'}
        </table>
      </div>

      <div style="margin-top: 40px; text-align: right; color: #666;">
        打印时间：${new Date().toLocaleString()}
      </div>
    </body>
    </html>
  `;l.document.write(C),l.document.close(),l.addEventListener("load",()=>{l.print()})}function Pe(){var C,o,r,h;const l=window.open("","_blank","width=800,height=1000");if(!l){k.error("无法打开打印窗口");return}const t=((C=m.value)==null?void 0:C.documents)||[],u={};t.forEach(c=>{const b=c.dossier_folder_name||"未分类";u[b]||(u[b]=[]),u[b].push(c)});let y="",S=0;Object.entries(u).forEach(([c,b])=>{y+=`<tr style="background: #f5f5f5;"><td colspan="5" style="font-weight: bold;">${c}（${b.length} 份）</td></tr>`,b.forEach(E=>{var z,A;S++,y+=`<tr>
        <td>${S}</td>
        <td>${E.file_name||"-"}</td>
        <td>${ae(E.file_size)}</td>
        <td>${((z=E.created_at)==null?void 0:z.split("T")[0])||"-"}</td>
        <td>${(A=i.value)!=null&&A.filesDeleted?"已迁移":"可访问"}</td>
      </tr>`})});const D=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>文档清单 - ${((o=i.value)==null?void 0:o.archiveNo)||""}</title>
      <style>
        body { font-family: "SimSun", serif; padding: 40px; font-size: 14px; }
        h1 { text-align: center; font-size: 20px; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background: #e0e0e0; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>档案文档清单</h1>
      <div class="subtitle">
        档案编号：${((r=i.value)==null?void 0:r.archiveNo)||"-"} | 
        项目名称：${((h=i.value)==null?void 0:h.matterName)||"-"} | 
        文档总数：${t.length} 份
      </div>
      
      <table>
        <thead>
          <tr><th width="50">序号</th><th>文件名称</th><th width="80">大小</th><th width="100">上传日期</th><th width="80">状态</th></tr>
        </thead>
        <tbody>
          ${y||'<tr><td colspan="5" style="text-align: center;">暂无文档</td></tr>'}
        </tbody>
      </table>

      <div style="margin-top: 40px; text-align: right; color: #666;">
        打印时间：${new Date().toLocaleString()}
      </div>
    </body>
    </html>
  `;l.document.write(D),l.document.close(),l.addEventListener("load",()=>{l.print()})}const te=W(()=>{var t;if(!((t=m.value)!=null&&t.dossierItems))return[];const l=m.value.documents||[];return m.value.dossierItems.map(u=>{const y=l.filter(S=>S.dossier_item_id===u.id).length;return{id:u.id,name:u.name,sortOrder:u.sort_order||0,docCount:y}}).toSorted((u,y)=>u.sortOrder-y.sortOrder)}),O=W(()=>{var t;const l=((t=m.value)==null?void 0:t.documents)||[];return I.value==="all"?l:l.filter(u=>u.dossier_item_id===I.value)});function Re(l){var u;if(!l)return"ant-design:file-outlined";switch((u=l.split(".").pop())==null?void 0:u.toLowerCase()){case"bmp":case"gif":case"jpeg":case"jpg":case"png":return"ant-design:file-image-outlined";case"doc":case"docx":return"ant-design:file-word-outlined";case"pdf":return"ant-design:file-pdf-outlined";case"xls":case"xlsx":return"ant-design:file-excel-outlined";default:return"ant-design:file-outlined"}}function ae(l){return l?l<1024?`${l} B`:l<1024*1024?`${(l/1024).toFixed(1)} KB`:`${(l/1024/1024).toFixed(1)} MB`:"-"}function le(l){I.value=l}const Le=[{title:"合同编号",dataIndex:"contract_no",key:"contract_no"},{title:"合同名称",dataIndex:"contract_name",key:"contract_name",ellipsis:!0},{title:"合同金额",dataIndex:"contract_amount",key:"contract_amount",customRender:({text:l})=>l?`¥${Number(l).toLocaleString()}`:"-"},{title:"签订日期",dataIndex:"sign_date",key:"sign_date"},{title:"状态",dataIndex:"status",key:"status"}],Me=[{title:"日期",dataIndex:"work_date",key:"work_date"},{title:"工作人员",dataIndex:"user_name",key:"user_name"},{title:"工时(小时)",dataIndex:"hours",key:"hours"},{title:"工作内容",dataIndex:"description",key:"description",ellipsis:!0}],Be=[{title:"姓名",dataIndex:"real_name",key:"real_name"},{title:"角色",dataIndex:"role",key:"role"},{title:"电话",dataIndex:"phone",key:"phone"},{title:"邮箱",dataIndex:"email",key:"email"}],Fe=[{title:"收费项目",dataIndex:"fee_name",key:"fee_name"},{title:"金额",dataIndex:"amount",key:"amount",customRender:({text:l})=>l?`¥${Number(l).toLocaleString()}`:"-"},{title:"收费日期",dataIndex:"fee_date",key:"fee_date"},{title:"状态",dataIndex:"status",key:"status"}],Oe=[{title:"证据名称",dataIndex:"name",key:"name",ellipsis:!0},{title:"证据类型",dataIndex:"evidence_type",key:"evidence_type"},{title:"证明目的",dataIndex:"purpose",key:"purpose",ellipsis:!0},{title:"来源",dataIndex:"source",key:"source"}];return st(()=>{ee()}),(l,t)=>{var u,y;return f(),w(e(ot),{title:((u=i.value)==null?void 0:u.archiveName)||"档案详情",description:`档案编号：${((y=i.value)==null?void 0:y.archiveNo)||"-"}`},{default:a(()=>[n(e(Qe),{spinning:M.value},{default:a(()=>{var S,D,C;return[(S=i.value)!=null&&S.filesDeleted?(f(),w(e(Z),{key:0,type:"warning","show-icon":"",style:{"margin-bottom":"16px"}},{message:a(()=>[...t[2]||(t[2]=[v("span",{style:{"font-weight":"500"}},"电子文件已迁移至档案系统",-1)])]),description:a(()=>{var o;return[v("div",null,[t[3]||(t[3]=s(" 本系统的电子文件已清理，如需查看原始文件，请前往档案系统查阅。 ",-1)),(o=i.value)!=null&&o.remoteArchiveNo?(f(),$("span",ut,[v("strong",null,"档案系统编号："+d(i.value.remoteArchiveNo),1)])):x("",!0)])]}),_:1})):x("",!0),((D=i.value)==null?void 0:D.status)==="MIGRATED"&&!((C=i.value)!=null&&C.filesDeleted)?(f(),w(e(Z),{key:1,type:"info","show-icon":"",style:{"margin-bottom":"16px"}},{message:a(()=>{var o;return[v("span",null,"档案已迁移至 "+d(((o=i.value)==null?void 0:o.migrateTarget)||"档案系统"),1)]}),description:a(()=>{var o,r,h;return[v("div",null,[s(" 迁移原因："+d(((o=i.value)==null?void 0:o.migrateReason)||"-")+" ",1),(r=i.value)!=null&&r.migrateDate?(f(),$("span",mt," 迁移日期："+d(i.value.migrateDate),1)):x("",!0),(h=i.value)!=null&&h.remoteArchiveNo?(f(),$("span",ct," 远程档案编号："+d(i.value.remoteArchiveNo),1)):x("",!0)])]}),_:1})):x("",!0),n(e(Q),{title:"档案信息",style:{"margin-bottom":"16px"}},{extra:a(()=>[n(e(fe),null,{default:a(()=>{var o;return[n(e(B),{color:be((o=i.value)==null?void 0:o.status)},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.statusName)||"-"),1)]}),_:1},8,["color"]),e(_e)?(f(),w(e(P),{key:0,type:"primary",onClick:ye},{default:a(()=>[...t[4]||(t[4]=[s(" 申请电子借阅 ",-1)])]),_:1})):x("",!0),n(e(P),{onClick:Ae},{default:a(()=>[...t[5]||(t[5]=[s("打印档案详情",-1)])]),_:1}),n(e(P),{onClick:Pe},{default:a(()=>[...t[6]||(t[6]=[s("打印文档清单",-1)])]),_:1}),n(e(P),{onClick:Ie},{default:a(()=>[...t[7]||(t[7]=[s("返回列表",-1)])]),_:1})]}),_:1})]),default:a(()=>{var o;return[n(e(Y),{column:{xs:1,sm:2,md:3},bordered:"",size:"small"},{default:a(()=>[n(e(p),{label:"档案编号"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.archiveNo)||"-"),1)]}),_:1}),n(e(p),{label:"项目编号"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.matterNo)||"-"),1)]}),_:1}),n(e(p),{label:"项目名称"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.matterName)||"-"),1)]}),_:1}),n(e(p),{label:"档案类型"},{default:a(()=>{var r,h;return[s(d(((r=i.value)==null?void 0:r.archiveTypeName)||((h=i.value)==null?void 0:h.archiveType)||"-"),1)]}),_:1}),n(e(p),{label:"委托人"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.clientName)||"-"),1)]}),_:1}),n(e(p),{label:"承办律师"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.mainLawyerName)||"-"),1)]}),_:1}),n(e(p),{label:"结案日期"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.caseCloseDate)||"-"),1)]}),_:1}),n(e(p),{label:"保管期限"},{default:a(()=>{var r,h;return[s(d(((r=i.value)==null?void 0:r.retentionPeriodName)||((h=i.value)==null?void 0:h.retentionPeriod)||"-"),1)]}),_:1}),n(e(p),{label:"到期日期"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.retentionExpireDate)||"-"),1)]}),_:1}),n(e(p),{label:"卷数"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.volumeCount)||"-"),1)]}),_:1}),n(e(p),{label:"页数"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.pageCount)||"-"),1)]}),_:1}),n(e(p),{label:"入库时间"},{default:a(()=>{var r;return[s(d(((r=i.value)==null?void 0:r.storedAt)||"-"),1)]}),_:1})]),_:1}),(o=i.value)!=null&&o.pushStatus?(f(),$("div",pt,[n(e(Y),{column:{xs:1,sm:2,md:4},size:"small",title:"档案系统同步状态"},{default:a(()=>[n(e(p),{label:"推送状态"},{default:a(()=>[n(e(B),{color:xe(i.value.pushStatus)},{default:a(()=>[s(d(ke(i.value.pushStatus)),1)]),_:1},8,["color"])]),_:1}),n(e(p),{label:"文件转移状态"},{default:a(()=>[s(d(we(i.value.fileTransferStatus)),1)]),_:1}),n(e(p),{label:"档案系统编号"},{default:a(()=>[s(d(i.value.remoteArchiveNo||"-"),1)]),_:1})]),_:1})])):x("",!0)]}),_:1}),m.value?(f(),w(e(Q),{key:2,title:"归档数据"},{default:a(()=>[n(e(Xe),{gutter:16,style:{"margin-bottom":"16px"}},{default:a(()=>[(f(!0),$(H,null,J(m.value.statistics,(o,r)=>(f(),w(e(et),{key:r,xs:12,sm:8,md:4},{default:a(()=>[n(e(tt),{title:$e(String(r)),value:o},null,8,["title","value"])]),_:2},1024))),128))]),_:1}),n(e(at),{"active-key":N.value,"onUpdate:activeKey":t[1]||(t[1]=o=>N.value=o)},{default:a(()=>[n(e(R),{key:"info",tab:"项目信息"},{default:a(()=>[n(e(Y),{column:{xs:1,sm:2},bordered:"",size:"small"},{default:a(()=>[n(e(p),{label:"项目编号"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.matter_no)||"-"),1)]}),_:1}),n(e(p),{label:"项目名称"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.name)||"-"),1)]}),_:1}),n(e(p),{label:"项目类型"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.matter_type)||"-"),1)]}),_:1}),n(e(p),{label:"案件类型"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.case_type)||"-"),1)]}),_:1}),n(e(p),{label:"案由"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.cause_of_action)||"-"),1)]}),_:1}),n(e(p),{label:"负责律师"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.lead_lawyer_name)||"-"),1)]}),_:1}),n(e(p),{label:"案源人"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.originator_name)||"-"),1)]}),_:1}),n(e(p),{label:"部门"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.department_name)||"-"),1)]}),_:1}),n(e(p),{label:"立案日期"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.filing_date)||"-"),1)]}),_:1}),n(e(p),{label:"结案日期"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.actual_closing_date)||"-"),1)]}),_:1}),n(e(p),{label:"案件结果"},{default:a(()=>{var o;return[s(d(((o=m.value.matterInfo)==null?void 0:o.outcome)||"-"),1)]}),_:1})]),_:1})]),_:1}),n(e(R),{key:"team",tab:"团队成员"},{default:a(()=>[n(e(j),{columns:Be,"data-source":m.value.participants||[],pagination:!1,size:"small","row-key":"id"},null,8,["data-source"])]),_:1}),n(e(R),{key:"documents",tab:"卷宗文档"},{default:a(()=>{var o,r,h;return[(o=i.value)!=null&&o.filesDeleted?(f(),w(e(Z),{key:0,type:"warning",message:"电子文件已迁移至档案系统，以下为归档时的文档快照记录",style:{"margin-bottom":"12px"}})):x("",!0),v("div",ft,[v("div",vt,[v("div",ht,[n(e(V),{icon:"ant-design:folder-outlined",size:16,style:{"margin-right":"8px"}}),t[8]||(t[8]=v("span",null,"卷宗目录",-1))]),n(e(lt),{"selected-keys":[String(I.value)],mode:"inline",class:"dossier-menu"},{default:a(()=>[n(e(ve),{key:"all",onClick:t[0]||(t[0]=c=>le("all"))},{icon:a(()=>[n(e(V),{icon:"ant-design:folder-open-outlined",size:14})]),default:a(()=>[t[9]||(t[9]=v("span",null,"全部文档",-1)),n(e(B),{size:"small",style:{"margin-left":"8px"}},{default:a(()=>{var c,b;return[s(d(((b=(c=m.value)==null?void 0:c.documents)==null?void 0:b.length)||0),1)]}),_:1})]),_:1}),(f(!0),$(H,null,J(te.value,c=>(f(),w(e(ve),{key:String(c.id),onClick:b=>le(c.id)},{icon:a(()=>[n(e(V),{icon:"ant-design:folder-outlined",size:14})]),default:a(()=>[v("span",null,d(c.name),1),c.docCount>0?(f(),w(e(B),{key:0,size:"small",color:"blue",style:{"margin-left":"8px"}},{default:a(()=>[s(d(c.docCount),1)]),_:2},1024)):x("",!0)]),_:2},1032,["onClick"]))),128))]),_:1},8,["selected-keys"])]),v("div",_t,[v("div",gt,[v("div",yt,[O.value.length>0&&!((r=i.value)!=null&&r.filesDeleted)?(f(),w(e(he),{key:0,checked:Ee.value,onChange:Ce},{default:a(()=>[...t[10]||(t[10]=[s(" 全选 ",-1)])]),_:1},8,["checked"])):x("",!0),v("span",bt,d(I.value==="all"?"全部文档":((h=te.value.find(c=>c.id===I.value))==null?void 0:h.name)||"文档"),1),v("span",xt,"共 "+d(O.value.length)+" 个文件",1)]),_.value.length>0?(f(),w(e(fe),{key:0},{default:a(()=>[n(e(B),{color:"blue"},{default:a(()=>[s("已选 "+d(_.value.length)+" 个",1)]),_:1}),n(e(P),{size:"small",onClick:Te},{default:a(()=>[...t[11]||(t[11]=[s(" 批量下载 ",-1)])]),_:1}),n(e(P),{size:"small",onClick:ze},{default:a(()=>[...t[12]||(t[12]=[s(" 打印清单 ",-1)])]),_:1})]),_:1})):x("",!0)]),O.value.length===0?(f(),$("div",kt,[n(e(Ue),{description:"该目录下暂无文档"})])):(f(),$("div",wt,[(f(!0),$(H,null,J(O.value,c=>{var b,E,z;return f(),$("div",{key:c.id,class:dt(["document-item",{selected:_.value.includes(c.id)}])},[(b=i.value)!=null&&b.filesDeleted?x("",!0):(f(),w(e(he),{key:0,checked:_.value.includes(c.id),onChange:A=>Ne(c.id),style:{"margin-right":"12px"}},null,8,["checked","onChange"])),v("div",$t,[n(e(V),{icon:Re(c.file_name),size:24,color:"#1890ff"},null,8,["icon"])]),v("div",It,[v("div",Dt,[n(e(nt),{title:c.file_name},{default:a(()=>[s(d(c.file_name||c.title||"-"),1)]),_:2},1032,["title"])]),v("div",St,[v("span",null,d(ae(c.file_size)),1),t[13]||(t[13]=v("span",{style:{margin:"0 8px"}},"|",-1)),v("span",null,d(((E=c.created_at)==null?void 0:E.split("T")[0])||"-"),1),c.dossier_folder_name&&I.value==="all"?(f(),$("span",Nt,"|")):x("",!0),c.dossier_folder_name&&I.value==="all"?(f(),w(e(B),{key:1,size:"small"},{default:a(()=>[s(d(c.dossier_folder_name),1)]),_:2},1024)):x("",!0)])]),v("div",Ct,[(z=i.value)!=null&&z.filesDeleted?(f(),w(e(B),{key:0,color:"orange",size:"small"},{default:a(()=>[...t[14]||(t[14]=[s("已迁移",-1)])]),_:1})):(f(),$(H,{key:1},[n(e(P),{type:"link",size:"small",onClick:A=>Se(c)},{default:a(()=>[...t[15]||(t[15]=[s(" 预览 ",-1)])]),_:1},8,["onClick"]),n(e(P),{type:"link",size:"small",onClick:A=>De(c)},{default:a(()=>[...t[16]||(t[16]=[s(" 下载 ",-1)])]),_:1},8,["onClick"])],64))])],2)}),128))]))])])]}),_:1}),n(e(R),{key:"contracts",tab:"合同"},{default:a(()=>[n(e(j),{columns:Le,"data-source":m.value.contractInfo||[],pagination:!1,size:"small","row-key":"id"},null,8,["data-source"])]),_:1}),n(e(R),{key:"fees",tab:"收费"},{default:a(()=>[n(e(j),{columns:Fe,"data-source":m.value.feeRecords||[],pagination:!1,size:"small","row-key":"id"},null,8,["data-source"])]),_:1}),n(e(R),{key:"timesheets",tab:"工时"},{default:a(()=>[n(e(j),{columns:Me,"data-source":m.value.timesheets||[],pagination:{pageSize:10},size:"small","row-key":"id"},null,8,["data-source"])]),_:1}),n(e(R),{key:"evidences",tab:"证据"},{default:a(()=>[n(e(j),{columns:Oe,"data-source":m.value.evidences||[],pagination:!1,size:"small","row-key":"id"},null,8,["data-source"])]),_:1}),n(e(R),{key:"clients",tab:"客户"},{default:a(()=>{var o;return[(f(!0),$(H,null,J(m.value.clientInfo,(r,h)=>(f(),$("div",{key:h,style:{"margin-bottom":"16px"}},[n(e(Y),{column:{xs:1,sm:2},bordered:"",size:"small",title:`客户 ${h+1}`},{default:a(()=>[n(e(p),{label:"客户名称"},{default:a(()=>[s(d(r.client_name||"-"),1)]),_:2},1024),n(e(p),{label:"联系人"},{default:a(()=>[s(d(r.contact_person||"-"),1)]),_:2},1024),n(e(p),{label:"电话"},{default:a(()=>[s(d(r.phone||"-"),1)]),_:2},1024),n(e(p),{label:"邮箱"},{default:a(()=>[s(d(r.email||"-"),1)]),_:2},1024),n(e(p),{label:"地址",span:2},{default:a(()=>[s(d(r.address||"-"),1)]),_:2},1024)]),_:2},1032,["title"])]))),128)),(o=m.value.clientInfo)!=null&&o.length?x("",!0):(f(),$("div",Et," 暂无客户信息 "))]}),_:1})]),_:1},8,["active-key"])]),_:1})):!M.value&&i.value?(f(),w(e(Q),{key:3},{default:a(()=>[...t[17]||(t[17]=[v("div",{style:{padding:"48px",color:"#999","text-align":"center"}}," 暂无归档数据快照 ",-1)])]),_:1})):x("",!0)]}),_:1},8,["spinning"])]),_:1},8,["title","description"])}}}),Ja=Ve(Tt,[["__scopeId","data-v-cfadc78f"]]);export{Ja as default};
