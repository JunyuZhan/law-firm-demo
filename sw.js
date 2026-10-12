/* ============================================================================
 * 智慧律所管理系统 · 开源演示版 Mock Service Worker
 * ----------------------------------------------------------------------------
 * 本文件在浏览器网络层拦截 /api/** 请求，返回由浏览器内 Mock 数据库生成的演示
 * 数据（无需任何真实后端）。同时负责缓存前端静态外壳，使站点可离线访问。
 *
 * 数据信封统一为：{ success: true, code: "200", message, data, timestamp }
 * 这与前端 @vben/request 的 defaultResponseInterceptor 约定一致。
 * ==========================================================================*/

const SW_VERSION = 'demo-v1.7.0';
const API_PREFIX = '/api';
const SHELL_CACHE = `lawfirm-shell-${SW_VERSION}`;
const PRECACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/_app.config.js',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/logo.png',
  '/default-avatar.svg',
];

/* ---------------------------------------------------------------------------
 * 工具：可复现的伪随机数（演示数据在每次重置后保持一致，体验更可控）
 * ------------------------------------------------------------------------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const RND = mulberry32(20261011);
const ri = (min, max) => Math.floor(RND() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(RND() * arr.length)];
const bool = () => RND() > 0.5;
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function dateTimeAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(ri(8, 19), ri(0, 59), 0, 0);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

/* 生成一张可渲染的占位验证码/滑块底图（内联 SVG，无需外部资源） */
function captchaDataUri() {
  const w = 320, h = 160;
  const colors = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1'];
  let circles = '';
  for (let i = 0; i < 18; i++) {
    const x = ri(0, w), y = ri(0, h), r = ri(6, 26), c = pick(colors);
    circles += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="0.18"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#f5f7fa"/>${circles}<text x="50%" y="52%" font-size="34" font-family="monospace" fill="#333" text-anchor="middle" dominant-baseline="middle">MOCK</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* ---------------------------------------------------------------------------
 * 中文演示数据词库
 * ------------------------------------------------------------------------- */
const POOL = {
  surname: '王李张刘陈杨黄赵周吴徐孙马朱胡郭何高林郑谢罗唐韩冯曹彭曾'.split(''),
  given: '伟芳娜秀英敏静丽强磊洋勇艳杰娟涛明超军平刚文博睿轩婷雪琳浩然嘉怡子墨'.split(''),
  company: '宏图盛世远见鑫源华信鼎峰中正博远瑞祥天成海纳九州同辉嘉禾卓越'.split(''),
  companySuffix: ['科技有限公司', '实业股份有限公司', '集团有限公司', '咨询有限公司', '贸易有限公司', '建设工程有限公司', '网络科技有限公司', '投资管理有限公司'],
  caseType: ['买卖合同纠纷', '民间借贷纠纷', '离婚纠纷', '股权转让纠纷', '劳动争议', '知识产权侵权', '建设工程施工合同纠纷', '侵权责任纠纷', '行政诉讼', '刑事辩护', '公司决议纠纷', '不当得利纠纷'],
  court: ['北京市第一中级人民法院', '上海市浦东新区人民法院', '深圳市福田区人民法院', '杭州市西湖区人民法院', '成都市武侯区人民法院', '广州市天河区人民法院', '武汉市江汉区人民法院', '南京市鼓楼区人民法院'],
  city: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆', '苏州', '厦门'],
  docType: ['起诉状', '答辩状', '代理词', '法律意见书', '合同审查意见', '证据目录', '阅卷笔录', '调解协议', '尽职调查报告', '律师函'],
  docStatus: ['草稿', '待审核', '审核中', '已通过', '已归档'],
  matterStatus: ['进行中', '已立项', '已结案', '已归档', '中止', '调解中'],
  financeStatus: ['待付款', '部分付款', '已付清', '已开票', '已作废', '审批中', '已驳回'],
  industry: ['制造业', '信息技术', '房地产', '金融', '教育培训', '医疗健康', '文化传媒', '物流运输', '能源', '零售'],
  dept: ['管委会', '民事法律事务部', '刑事法律事务部', '商事法律事务部', '知识产权部', '行政部', '财务部', '人力资源部', '客户发展部'],
  position: ['合伙人', '高级律师', '主办律师', '律师', '律师助理', '实习律师', '法务总监', '行政主管', '财务专员', '人事专员'],
  assetCategory: ['办公设备', '电子设备', '办公家具', '车辆', '软件授权', '图书资料', '办公用品'],
  expenseCategory: ['差旅费', '办公费', '业务招待费', '交通费', '通讯费', '培训费', '其他'],
  knowledgeCategory: ['实务指引', '典型案例', '法规速递', '内部培训', '文书模板', '风险提示'],
  announcementLevel: ['普通', '重要', '紧急'],
  leaveType: ['事假', '病假', '年假', '调休', '婚假', '产假', '陪产假'],
};
const fullName = () => pick(POOL.surname) + pick(POOL.given);
const companyName = () => pick(POOL.company) + pick(POOL.companySuffix);
let _seq = 1;
const nextId = () => _seq++;

/* ---------------------------------------------------------------------------
 * 字段归一化：前端各列表列（dataIndex/field）与 Mock 种子字段名不完全一致，
 * 这里做一层别名补全 + 少量生成字段，使所有列表页面都能渲染出饱满的演示数据。
 * 仅在校验目标字段为空时回填，绝不覆盖已有值。
 * ------------------------------------------------------------------------- */
const SYN = {
  statusName: ['statusName', 'status', 'statusText'],
    totalAmount: ['totalAmount', 'amount', 'contractAmount', 'feeAmount'],
    contractAmount: ['contractAmount', 'amount', 'totalAmount'],
    paidAmount: ['paidAmount', 'receivedAmount', 'collectedAmount'],
    receivedAmount: ['receivedAmount', 'paidAmount', 'amount'],
    invoiceAmount: ['invoiceAmount', 'amount'],
    userName: ['userName', 'employeeName', 'realName', 'assignee', 'ownerName', 'applicant', 'lawyerName'],
    applicantName: ['applicantName', 'applicant', 'realName', 'userName', 'ownerName'],
    ownerName: ['ownerName', 'realName', 'employeeName', 'lawyerName'],
    creatorName: ['creatorName', 'realName', 'ownerName'],
    responsibleLawyerName: ['responsibleLawyerName', 'leadLawyerName', 'lawyerName'],
    leadLawyerName: ['leadLawyerName', 'lawyerName', 'responsibleLawyerName'],
    contactPerson: ['contactPerson', 'contactName'],
    contactName: ['contactName', 'contactPerson'],
    departmentName: ['departmentName', 'deptName', 'dept', 'department'],
    deptName: ['deptName', 'departmentName', 'dept'],
    position: ['position', 'jobTitle'],
    joinDate: ['joinDate', 'hireDate', 'entryDate', 'employDate'],
    hireDate: ['hireDate', 'joinDate', 'entryDate'],
    createdAt: ['createdAt', 'createTime', 'createDate'],
    updatedAt: ['updatedAt', 'updateTime'],
    applyTime: ['applyTime', 'applyDate', 'createTime', 'createdAt'],
    signDate: ['signDate', 'contractDate', 'signingDate'],
    clientName: ['clientName', 'customerName'],
    matterName: ['matterName', 'caseName', 'projectName'],
    caseName: ['caseName', 'matterName'],
    name: ['name', 'title', 'contractName', 'templateName'],
    contractTypeName: ['contractTypeName', 'contractType'],
    businessTypeName: ['businessTypeName', 'businessType', 'typeName', 'type'],
    checkTypeName: ['checkTypeName', 'checkType', 'typeName', 'type'],
    matterTypeName: ['matterTypeName', 'matterType'],
    caseTypeName: ['caseTypeName', 'caseType'],
    feeTypeName: ['feeTypeName', 'feeType', 'typeName', 'type'],
    expenseTypeName: ['expenseTypeName', 'expenseType', 'categoryName', 'category'],
    lawTypeName: ['lawTypeName', 'lawType', 'typeName', 'type'],
    categoryName: ['categoryName', 'category'],
    sourceName: ['sourceName', 'source'],
    levelName: ['levelName', 'level'],
    deptName: ['deptName', 'departmentName', 'dept', 'orgName'],
    // —— 按前端真实 dataIndex 补的通用别名（新增键，不与上方重复）——
    employeeNo: ['employeeNo', 'employeeCode', 'empNo'],
    employeeName: ['employeeName', 'realName', 'userName', 'lawyerName'],
    realName: ['realName', 'employeeName', 'userName'],
    contractName: ['contractName', 'matterName', 'title', 'name'],
    approverName: ['approverName', 'approver', 'auditorName'],
    handlerName: ['handlerName', 'lawyerName', 'leadLawyerName'],
    counterparty: ['counterparty', 'oppositeParty', 'partyName'],
    courtName: ['courtName', 'court'],
    amount: ['amount', 'totalAmount', 'contractAmount', 'feeAmount', 'value'],
    baseSalary: ['baseSalary', 'salary', 'monthlySalary'],
    startDate: ['startDate', 'beginDate', 'effectiveDate'],
    endDate: ['endDate', 'expireDate', 'deadline'],
    applyDate: ['applyDate', 'applyTime', 'createdAt', 'createTime'],
    copies: ['copies', 'copyCount', 'quantity'],
    remark: ['remark', 'comment', 'note'],
    typeName: ['typeName', 'type', 'categoryName', 'category'],
};

/* 只对单个集合做字段归一化（懒加载：集合被首次构建时调用一次） */
function enrichCollection(key, arr) {
  if (!Array.isArray(arr)) return arr;
  arr.forEach((rec) => {
    if (!rec || typeof rec !== 'object') return;
    for (const [t, srcs] of Object.entries(SYN)) {
      if (rec[t] === undefined || rec[t] === null || rec[t] === '') {
        for (const s of srcs) {
          if (rec[s] !== undefined && rec[s] !== null && rec[s] !== '') { rec[t] = rec[s]; break; }
        }
      }
    }
    switch (key) {
      case 'crm/conflict-check':
        if (rec.checkNo === undefined) rec.checkNo = 'LC' + String(ri(10000, 99999));
        if (rec.matterName === undefined) rec.matterName = pick(POOL.caseType) + '一案';
        if (rec.checkTypeName === undefined) rec.checkTypeName = pick(['新客户', '存量客户', '关联案件', '利害关系']);
        if (rec.statusName === undefined) rec.statusName = rec.status;
        if (rec.applicantName === undefined) rec.applicantName = rec.reviewer || fullName();
        if (rec.applyTime === undefined) rec.applyTime = rec.createTime;
        break;
      case 'timesheets':
        if (rec.userName === undefined) rec.userName = rec.employeeName;
        if (rec.workType === undefined) rec.workType = pick(['诉讼', '非诉', '顾问', '法律研究', '商务谈判']);
        if (rec.workContent === undefined) rec.workContent = rec.description;
        if (rec.billable === undefined) rec.billable = bool();
        break;
      case 'document/template':
        if (rec.name === undefined) rec.name = rec.templateName;
        if (rec.templateType === undefined) rec.templateType = rec.category;
        if (rec.caseTypeName === undefined) rec.caseTypeName = pick(POOL.caseType);
        if (rec.creatorName === undefined) rec.creatorName = rec.ownerName;
        if (rec.useCount === undefined) rec.useCount = ri(0, 300);
        break;
      case 'admin/meeting-room':
        if (rec.title === undefined) rec.title = pick(['周例会', '客户洽谈', '案件研讨', '尽职调查', '内部培训']);
        if (rec.userName === undefined) rec.userName = fullName();
        if (rec.startTime === undefined) rec.startTime = daysAgo(-ri(1, 10)) + ' ' + String(ri(9, 17)).padStart(2, '0') + ':00';
        if (rec.endTime === undefined) rec.endTime = daysAgo(-ri(1, 10)) + ' ' + String(ri(18, 21)).padStart(2, '0') + ':00';
        if (rec.equipment === undefined) rec.equipment = rec.facility;
        if (rec.name === undefined) rec.name = rec.roomName;
        break;
      case 'hr/employee':
        if (rec.employeeNo === undefined) rec.employeeNo = 'EMP' + String(ri(1000, 9999));
        if (rec.employeeName === undefined) rec.employeeName = rec.realName;
        if (rec.username === undefined) rec.username = 'emp' + rec.employeeNo;
        if (rec.departmentName === undefined) rec.departmentName = rec.deptName;
        if (rec.phone === undefined) rec.phone = '1' + String(ri(3000000000, 5999999999));
        if (rec.email === undefined) rec.email = 'e' + ri(100, 999) + '@lawfirm.demo';
        if (rec.joinDate === undefined) rec.joinDate = rec.hireDate;
        if (rec.position === undefined) rec.position = pick(POOL.position);
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'workbench/approval':
        if (rec.approvalNo === undefined) rec.approvalNo = 'SP' + String(ri(100000, 999999));
        if (rec.businessTypeName === undefined) rec.businessTypeName = rec.type;
        if (rec.businessTitle === undefined) rec.businessTitle = rec.title;
        if (rec.applicantName === undefined) rec.applicantName = rec.applicant;
        if (rec.priority === undefined) rec.priority = pick(['高', '中', '低']);
        if (rec.urgency === undefined) rec.urgency = pick(['紧急', '普通', '较低']);
        if (rec.createdAt === undefined) rec.createdAt = rec.applyTime;
        break;
      case 'system/user':
        if (rec.departmentName === undefined) rec.departmentName = rec.deptName;
        if (rec.position === undefined) rec.position = rec.roleNames;
        if (rec.phone === undefined) rec.phone = '1' + String(ri(3000000000, 5999999999));
        if (rec.email === undefined) rec.email = 'u' + ri(100, 999) + '@lawfirm.demo';
        break;
      case 'finance/contract':
        if (rec.name === undefined) rec.name = rec.contractName;
        if (rec.contractTypeName === undefined) rec.contractTypeName = pick(['委托代理', '风险代理', '法律顾问', '专项服务']) + '合同';
        if (rec.totalAmount === undefined) rec.totalAmount = rec.amount;
        if (rec.paidAmount === undefined) rec.paidAmount = Math.round((rec.totalAmount || 0) * (0.3 + RND() * 0.7));
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;

      /* —— 前端列字段名与种子字段名不一致的集合，按 dataIndex 逐列补齐 —— */
      case 'ai/usage':
        if (rec.totalTokens === undefined) rec.totalTokens = rec.tokens;
        if (rec.totalCost === undefined) rec.totalCost = Number(rec.cost);
        if (rec.totalCalls === undefined) rec.totalCalls = ri(10, 900);
        if (rec.userCost === undefined) rec.userCost = Math.round(Number(rec.cost) * 0.4 * 100) / 100;
        if (rec.companyCost === undefined) rec.companyCost = Math.round(Number(rec.cost) * 0.6 * 100) / 100;
        if (rec.modelName === undefined) rec.modelName = rec.model;
        if (rec.departmentName === undefined) rec.departmentName = pick(POOL.dept);
        if (rec.requestTypeName === undefined) rec.requestTypeName = pick(['对话问答', '文书生成', '合同审查', '法规检索', '案例分析']);
        if (rec.businessTypeName === undefined) rec.businessTypeName = pick(['项目管理', '客户管理', '卷宗管理', '知识库', '行政办公']);
        if (rec.chargeRatio === undefined) rec.chargeRatio = pick(['100%', '80%', '50%', '0%']);
        if (rec.deductionStatus === undefined) rec.deductionStatus = pick(['已扣减', '待扣减', '不扣减']);
        if (rec.deductionStatusName === undefined) rec.deductionStatusName = rec.deductionStatus;
        if (rec.deductionAmount === undefined) rec.deductionAmount = rec.userCost;
        if (rec.createdAt === undefined) rec.createdAt = rec.date;
        break;
      case 'admin/asset-inventory':
        if (rec.inventoryTypeName === undefined) rec.inventoryTypeName = pick(['季度盘点', '年度盘点', '专项抽查']);
        if (rec.departmentName === undefined) rec.departmentName = pick(POOL.dept);
        if (rec.location === undefined) rec.location = pick(POOL.city) + '办公室' + ri(1, 9);
        if (rec.actualCount === undefined) rec.actualCount = rec.checkedCount;
        if (rec.surplusCount === undefined) rec.surplusCount = ri(0, 4);
        if (rec.shortageCount === undefined) rec.shortageCount = rec.diffCount;
        if (rec.assetName === undefined) rec.assetName = pick(['笔记本电脑', '台式机', '打印机', '投影仪', '办公桌椅']);
        if (rec.expectedStatus === undefined) rec.expectedStatus = '在用';
        if (rec.actualStatus === undefined) rec.actualStatus = pick(['在用', '闲置', '维修中']);
        if (rec.expectedLocation === undefined) rec.expectedLocation = rec.location;
        if (rec.actualLocation === undefined) rec.actualLocation = rec.location;
        if (rec.expectedUserName === undefined) rec.expectedUserName = fullName();
        if (rec.actualUserName === undefined) rec.actualUserName = fullName();
        if (rec.discrepancyTypeName === undefined) rec.discrepancyTypeName = pick(['无差异', '位置不符', '使用人不符', '盘亏']);
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'hr/resignation':
        if (rec.resignTypeName === undefined) rec.resignTypeName = rec.resignType;
        if (rec.resignDate === undefined) rec.resignDate = rec.lastWorkDate;
        if (rec.handoverStatusName === undefined) rec.handoverStatusName = pick(['待交接', '交接中', '已完成']);
        if (rec.approverName === undefined) rec.approverName = fullName();
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'hr/development-plan':
        if (rec.planNo === undefined) rec.planNo = 'FZ' + String(ri(100000, 999999));
        if (rec.planYear === undefined) rec.planYear = rec.period;
        if (rec.planTitle === undefined) rec.planTitle = rec.planName;
        if (rec.currentLevelName === undefined) rec.currentLevelName = pick(POOL.position);
        if (rec.targetLevelName === undefined) rec.targetLevelName = pick(POOL.position);
        if (rec.mentorName === undefined) rec.mentorName = rec.mentor || fullName();
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'finance/payment-amendment':
        if (rec.originalAmount === undefined) rec.originalAmount = ri(10, 500) * 10000;
        if (rec.amendedAmount === undefined) rec.amendedAmount = rec.originalAmount + (ri(-5, 20) * 10000);
        if (rec.diffAmount === undefined) rec.diffAmount = rec.amendedAmount - rec.originalAmount;
        if (rec.applyTime === undefined) rec.applyTime = rec.applyDate;
        if (rec.approverName === undefined) rec.approverName = fullName();
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'hr/regularization':
        if (rec.probationStart === undefined) rec.probationStart = rec.entryDate;
        if (rec.expectedRegularDate === undefined) rec.expectedRegularDate = rec.probationEnd;
        if (rec.applyDate === undefined) rec.applyDate = rec.probationEnd;
        if (rec.approverName === undefined) rec.approverName = fullName();
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/letter':
        if (rec.applicationNo === undefined) rec.applicationNo = 'HJ' + String(ri(100000, 999999));
        if (rec.letterTypeName === undefined) rec.letterTypeName = rec.title || pick(['介绍信', '公函', '调查函']);
        if (rec.deliveryTypeName === undefined) rec.deliveryTypeName = pick(['自取', '邮寄', '传真', '电子送达']);
        if (rec.matterName === undefined) rec.matterName = pick(POOL.caseType) + '一案';
        if (rec.targetUnit === undefined) rec.targetUnit = companyName();
        if (rec.lawyerNames === undefined) rec.lawyerNames = fullName();
        if (rec.copies === undefined) rec.copies = ri(1, 5);
        if (rec.applicantName === undefined) rec.applicantName = rec.applicant;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'hr/payroll':
        if (rec.payrollNo === undefined) rec.payrollNo = 'GZ' + String(rec.period || '').replace('-', '') + String(ri(100, 999));
        if (rec.deductionTotal === undefined) rec.deductionTotal = rec.totalDeduction;
        if (rec.confirmStatusName === undefined) rec.confirmStatusName = rec.confirmStatus;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'system/integration':
        if (rec.integrationCode === undefined) rec.integrationCode = ({ wecom: 'WECOM', minio: 'MINIO', office: 'ONLYOFFICE' })[rec.type] || String(rec.type || '').toUpperCase();
        if (rec.integrationName === undefined) rec.integrationName = rec.name;
        if (rec.apiUrl === undefined) rec.apiUrl = 'https://api.' + (rec.type || 'demo') + '.lawfirm.demo';
        if (rec.authTypeName === undefined) rec.authTypeName = pick(['API Key', 'OAuth2', 'Basic Auth', '签名认证']);
        if (rec.statusName === undefined) rec.statusName = rec.status === 'ENABLED' ? '启用' : '停用';
        if (rec.testResult === undefined) rec.testResult = pick(['连接正常', '连接正常', '超时']);
        break;
      case 'hr/performance':
        if (rec.taskName === undefined) rec.taskName = pick(['季度绩效评估', '年度绩效考核', '专项考核']) + '任务';
        if (rec.period === undefined) rec.period = ri(2024, 2026) + 'Q' + ri(1, 4);
        if (rec.year === undefined) rec.year = String(rec.period).slice(0, 4);
        if (rec.startDate === undefined) rec.startDate = daysAgo(ri(30, 200));
        if (rec.endDate === undefined) rec.endDate = daysAgo(-ri(1, 60));
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'document/seal-application':
        if (rec.applicationNo === undefined) rec.applicationNo = 'YY' + String(ri(100000, 999999));
        if (rec.sealName === undefined) rec.sealName = pick(['公章', '合同专用章', '财务专用章', '法人章']);
        if (rec.documentName === undefined) rec.documentName = pick(POOL.docType);
        if (rec.purpose === undefined) rec.purpose = pick(['合同签署', '函件出具', '证明文件', '立案材料']);
        if (rec.copies === undefined) rec.copies = ri(1, 5);
        if (rec.applicantName === undefined) rec.applicantName = fullName();
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/leave':
        if (rec.leaveTypeName === undefined) rec.leaveTypeName = rec.leaveType;
        if (rec.leaveDays === undefined) rec.leaveDays = rec.days;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/go-out':
        if (rec.recordNo === undefined) rec.recordNo = 'WC' + String(ri(100000, 999999));
        if (rec.goOutTime === undefined) rec.goOutTime = rec.goOutDate + ' ' + rec.startTime;
        if (rec.expectedReturnTime === undefined) rec.expectedReturnTime = rec.goOutDate + ' ' + rec.endTime;
        if (rec.actualReturnTime === undefined) rec.actualReturnTime = rec.status === '已通过' ? rec.expectedReturnTime : '';
        if (rec.goOutReason === undefined) rec.goOutReason = rec.reason;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/contract':
        if (rec.clientName === undefined) rec.clientName = companyName();
        if (rec.counterparty === undefined) rec.counterparty = rec.partyName;
        if (rec.caseTypeName === undefined) rec.caseTypeName = pick(POOL.caseType);
        if (rec.lawyerName === undefined) rec.lawyerName = fullName();
        if (rec.courtName === undefined) rec.courtName = pick(POOL.court);
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'archive/access':
        if (rec.applicationNo === undefined) rec.applicationNo = 'JY' + String(ri(100000, 999999));
        if (rec.archiveName === undefined) rec.archiveName = pick(POOL.caseType) + '卷宗';
        if (rec.accessTypeName === undefined) rec.accessTypeName = pick(['借阅', '查阅', '复制', '外借']);
        if (rec.expireTime === undefined) rec.expireTime = daysAgo(-ri(5, 60));
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/purchase':
        if (rec.applicationNo === undefined) rec.applicationNo = 'CGSQ' + String(ri(100000, 999999));
        if (rec.title === undefined) rec.title = rec.itemName + '采购申请';
        if (rec.purchaseTypeName === undefined) rec.purchaseTypeName = pick(['办公用品', '电子设备', '软件服务', '固定资产']);
        if (rec.applicantName === undefined) rec.applicantName = fullName();
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'system/role':
        if (rec.dataScope === undefined) rec.dataScope = (rec.roleCode === 'ADMIN' || rec.roleCode === 'DIRECTOR' || rec.roleCode === 'FINANCE') ? 'ALL' : (rec.roleCode === 'TEAM_LEADER' ? 'DEPT_AND_CHILD' : (rec.roleCode === 'ADMIN_STAFF' ? 'DEPT' : 'SELF'));
        if (rec.dataScopeName === undefined) rec.dataScopeName = ({ ALL: '全部数据', DEPT_AND_CHILD: '本部门及下级', DEPT: '本部门', SELF: '仅本人' })[rec.dataScope] || '仅本人';
        if (rec.statusName === undefined) rec.statusName = rec.status === 'ACTIVE' ? '启用' : rec.status;
        if (rec.sortOrder === undefined) rec.sortOrder = rec.id;
        if (rec.createdAt === undefined) rec.createdAt = daysAgo(ri(200, 900));
        break;
      case 'matter/contract':
        if (rec.contractName === undefined) rec.contractName = rec.matterName + '委托代理合同';
        if (rec.contractTypeName === undefined) rec.contractTypeName = pick(['委托代理', '风险代理', '法律顾问', '专项服务']);
        if (rec.feeTypeName === undefined) rec.feeTypeName = pick(['固定收费', '计时收费', '风险收费', '混合收费']);
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'knowledge/quality-check':
        if (rec.typeName === undefined) rec.typeName = rec.targetType;
        if (rec.projectName === undefined) rec.projectName = pick(POOL.caseType) + '一案';
        if (rec.riskLevelName === undefined) rec.riskLevelName = pick(['低', '中', '高']);
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'knowledge/quality-issue':
        if (rec.matterName === undefined) rec.matterName = pick(POOL.caseType) + '一案';
        if (rec.projectName === undefined) rec.projectName = rec.matterName;
        if (rec.typeName === undefined) rec.typeName = rec.targetType;
        if (rec.riskLevelName === undefined) rec.riskLevelName = rec.severity;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'knowledge/risk-warning':
        if (rec.levelName === undefined) rec.levelName = rec.level;
        if (rec.riskLevelName === undefined) rec.riskLevelName = rec.level;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'hr/promotion':
        if (rec.applicationNo === undefined) rec.applicationNo = 'JS' + String(ri(100000, 999999));
        if (rec.currentLevelName === undefined) rec.currentLevelName = rec.currentLevel;
        if (rec.targetLevelName === undefined) rec.targetLevelName = rec.targetLevel;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'finance/contract-amendment':
        if (rec.contractId === undefined) rec.contractId = ri(1, 9999);
        if (rec.description === undefined) rec.description = rec.reason || '双方协商一致变更合同条款。';
        if (rec.applyTime === undefined) rec.applyTime = rec.applyDate;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/asset':
        if (rec.brand === undefined) rec.brand = pick(['联想', '戴尔', '华为', '惠普', '小米']) + '/' + pick(['ThinkPad X1', 'XPS 13', 'MateBook', 'ProBook']);
        if (rec.userName === undefined) rec.userName = rec.ownerName;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'hr/contract':
        if (rec.contractNo === undefined) rec.contractNo = 'LDHT' + String(ri(100000, 999999));
        if (rec.probationMonths === undefined) rec.probationMonths = ri(0, 6);
        if (rec.employeeNo === undefined) rec.employeeNo = 'EMP' + String(ri(1000, 9999));
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'archive':
        if (rec.retentionPeriodName === undefined) rec.retentionPeriodName = rec.retentionPeriod;
        if (rec.retentionExpireDate === undefined) rec.retentionExpireDate = rec.retentionPeriod === '永久' ? '长期' : String(daysAgo(-ri(200, 2000)));
        if (rec.migrateTarget === undefined) rec.migrateTarget = pick(['本地存储', 'MinIO 对象存储', '异地灾备']);
        if (rec.pushStatus === undefined) rec.pushStatus = pick(['已推送', '待推送', '推送失败']);
        if (rec.pushTime === undefined) rec.pushTime = daysAgo(ri(1, 60));
        if (rec.pushErrorMessage === undefined) rec.pushErrorMessage = rec.pushStatus === '推送失败' ? '档案系统连接超时' : '';
        if (rec.remoteArchiveNo === undefined) rec.remoteArchiveNo = rec.pushStatus === '已推送' ? 'RA' + String(ri(100000, 999999)) : '';
        if (rec.fileTransferStatus === undefined) rec.fileTransferStatus = pick(['已传输', '待传输']);
        if (rec.fileTransferTime === undefined) rec.fileTransferTime = daysAgo(ri(1, 60));
        if (rec.cleanupStatus === undefined) rec.cleanupStatus = pick(['未清理', '已清理']);
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/overtime':
        if (rec.applicationNo === undefined) rec.applicationNo = 'JB' + String(ri(100000, 999999));
        if (rec.approverName === undefined) rec.approverName = fullName();
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/attendance':
        if (!rec.remark) rec.remark = pick(['正常出勤', '外出办事', '已报备', '调休']);
        if (rec.date === undefined) rec.date = rec.attendanceDate;
        if (rec.checkOutTime === undefined) rec.checkOutTime = rec.checkOut;
        if (rec.statusName === undefined) rec.statusName = rec.attendanceStatus;
        break;
      case 'admin/meeting-record':
        if (rec.attendees === undefined) {
          const rs = getCol('system/user') || [];
          rec.attendees = rs.slice(0, ri(3, 5)).map((u) => u.realName).filter(Boolean).join('、') || [fullName(), fullName()].join('、');
        }
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'finance/commission':
        if (rec.clientName === undefined) rec.clientName = companyName();
        if (rec.paymentAmount === undefined) rec.paymentAmount = rec.amount;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/operation-log':
        if (rec.operationType === undefined) rec.operationType = rec.operation;
        if (rec.ipAddress === undefined) rec.ipAddress = rec.ip;
        if (rec.userName === undefined) rec.userName = rec.operatorName;
        if (rec.executeTime === undefined) rec.executeTime = rec.costMs;
        if (rec.durationDisplay === undefined) rec.durationDisplay = rec.costMs + 'ms';
        if (rec.statusName === undefined) rec.statusName = rec.result;
        break;
      case 'system/department':
        if (rec.createdAt === undefined) rec.createdAt = daysAgo(ri(120, 800));
        if (rec.leaderName === undefined) rec.leaderName = rec.leader || fullName();
        break;

    }

    /* 第二轮：部分字段依赖第一轮的派生值，单独再跑一遍归一化 */
    switch (key) {
      /* —— 第二轮：按前端真实 dataIndex 精修 —— */
      case 'system/user':
        // 「员工档案 · 用户列表」页按 dataIndex=employeeNo / joinDate 取值
        if (rec.employeeNo === undefined) rec.employeeNo = 'EMP' + String(20000000 + Number(rec.id || 0)).slice(-6);
        if (rec.joinDate === undefined) rec.joinDate = rec.createdAt ? String(rec.createdAt).slice(0, 10) : daysAgo(ri(60, 900));
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'admin/purchase':
        // 采购管理页按 dataIndex=requestNo / estimatedAmount / purchaseTypeName 取值
        if (rec.requestNo === undefined) rec.requestNo = 'PUR' + String(ri(10000000, 99999999));
        if (rec.estimatedAmount === undefined) rec.estimatedAmount = rec.amount;
        if (rec.title === undefined) rec.title = (rec.itemName || '办公用品') + '采购申请';
        if (rec.purchaseTypeName === undefined) rec.purchaseTypeName = rec.itemName || pick(['办公用品', '电子设备', '软件服务', '固定资产']);
        if (rec.code === undefined) rec.code = rec.purchaseNo;
        if (rec.statusName === undefined) rec.statusName = rec.status;
        break;
      case 'document/seal-application':
        if (rec.applicationNo === undefined) rec.applicationNo = 'YY' + String(ri(100000, 999999));
        if (rec.documentName === undefined) rec.documentName = pick(POOL.docType);
        if (rec.usePurpose === undefined) rec.usePurpose = rec.purpose;
        if (rec.userDate === undefined) rec.userDate = rec.applyDate;
        if (rec.applicantDeptName === undefined) rec.applicantDeptName = pick(POOL.dept);
        break;
      case 'system/integration':
        if (rec.integrationType === undefined) rec.integrationType = 'OTHER';
        if (rec.code === undefined) rec.code = rec.integrationCode;
        if (rec.authType === undefined) rec.authType = rec.authTypeName;
        if (rec.lastTestResult === undefined) rec.lastTestResult = rec.testResult;
        if (rec.enabled === undefined) rec.enabled = rec.status === 'ENABLED';
        if (rec.active === undefined) rec.active = rec.status === 'ENABLED';
        break;
      case 'finance/payment-amendment':
        if (rec.paymentNo === undefined) rec.paymentNo = 'SK' + String(ri(100000, 999999));
        if (rec.newAmount === undefined) rec.newAmount = rec.amendedAmount;
        if (rec.amountDiff === undefined) rec.amountDiff = (rec.newAmount || 0) - (rec.originalAmount || 0);
        if (rec.requestedByName === undefined) rec.requestedByName = rec.applicantName;
        if (rec.requestedAt === undefined) rec.requestedAt = rec.applyTime;
        if (rec.approvedByName === undefined) rec.approvedByName = rec.approverName;
        break;
      case 'hr/resignation':
        if (rec.applicationNo === undefined) rec.applicationNo = 'LZ' + String(ri(100000, 999999));
        if (rec.resignationTypeName === undefined) rec.resignationTypeName = rec.resignTypeName;
        if (rec.resignationDate === undefined) rec.resignationDate = rec.lastWorkDate;
        if (rec.handoverPersonName === undefined) rec.handoverPersonName = rec.handoverName;
        break;
      case 'hr/regularization':
        if (rec.applicationNo === undefined) rec.applicationNo = 'ZZ' + String(ri(100000, 999999));
        if (rec.probationStartDate === undefined) rec.probationStartDate = rec.probationStart;
        if (rec.probationEndDate === undefined) rec.probationEndDate = rec.probationEnd;
        if (rec.applicationDate === undefined) rec.applicationDate = rec.applyDate;
        break;
      case 'admin/contract':
        if (rec.opposingParty === undefined) rec.opposingParty = rec.counterparty;
        if (rec.leadLawyerName === undefined) rec.leadLawyerName = rec.lawyerName;
        if (rec.jurisdictionCourt === undefined) rec.jurisdictionCourt = rec.courtName;
        break;
      case 'archive/access':
        if (rec.accessNo === undefined) rec.accessNo = rec.applicationNo;
        if (rec.expireAt === undefined) rec.expireAt = rec.expireTime;
        if (rec.expiredAt === undefined) rec.expiredAt = rec.expireTime;
        break;
      case 'admin/go-out':
        if (rec.outTime === undefined) rec.outTime = rec.goOutTime;
        if (rec.location === undefined) rec.location = rec.destination;
        break;
      case 'finance/contract-amendment':
        if (rec.amendmentReason === undefined) rec.amendmentReason = rec.description;
        if (rec.lawyerAmendedAt === undefined) rec.lawyerAmendedAt = rec.applyTime;
        break;
      case 'hr/performance':
        if (rec.periodTypeName === undefined) rec.periodTypeName = pick(['月度', '季度', '半年度', '年度']);
        if (rec.name === undefined) rec.name = rec.taskName;
        break;
      case 'admin/asset':
        if (rec.currentUserName === undefined) rec.currentUserName = rec.userName;
        if (rec.name === undefined) rec.name = rec.assetName;
        break;
      case 'knowledge/quality-issue':
        if (rec.issueType === undefined) rec.issueType = pick(['格式问题', '内容错误', '程序瑕疵', '材料缺漏']);
        break;
      case 'knowledge/quality-check':
        if (rec.issueType === undefined) rec.issueType = pick(['文书质量', '卷宗质量', '合同质量', '流程合规']);
        break;
      case 'hr/payroll':
        if (rec.items === undefined) {
          const gross = rec.grossSalary || 0;
          const ded = rec.totalDeduction || 0;
          rec.items = [{
            id: rec.id,
            employeeNo: rec.employeeNo,
            employeeName: rec.employeeName,
            income: rec.income,
            grossAmount: gross,
            totalGrossAmount: gross,
            deductionAmount: ded,
            totalDeductionAmount: ded,
            netAmount: rec.netSalary,
            totalNetAmount: rec.netSalary,
            confirmStatus: rec.confirmStatus,
            confirmStatusName: rec.confirmStatusName,
          }];
        }
        if (rec.totalGrossAmount === undefined) rec.totalGrossAmount = rec.grossSalary;
        if (rec.totalDeductionAmount === undefined) rec.totalDeductionAmount = rec.totalDeduction;
        if (rec.totalNetAmount === undefined) rec.totalNetAmount = rec.netSalary;
        if (rec.employeeCount === undefined) rec.employeeCount = ri(5, 40);
        if (rec.totalEmployees === undefined) rec.totalEmployees = rec.employeeCount;
        if (rec.confirmedCount === undefined) rec.confirmedCount = Math.round(rec.employeeCount * (0.5 + RND() * 0.5));
        break;
      case 'matter/contract':
        if (rec.name === undefined) rec.name = rec.contractName;
        break;
      case 'ai/usage':
        if (rec.requestType === undefined) rec.requestType = rec.requestTypeName;
        if (rec.businessType === undefined) rec.businessType = rec.businessTypeName;
        break;
    }
  });
  return arr;
}

/* ---------------------------------------------------------------------------
 * 演示账号（与生产库种子账号一致）
 * ------------------------------------------------------------------------- */
const DEMO_USERS = {
  // roles 必须是生产库的角色码（大写），前端按角色码做页面级鉴权（如工资管理页 ADMIN/DIRECTOR/FINANCE）
  admin: { userId: 1, username: 'admin', realName: '系统管理员', roles: ['ADMIN', 'DIRECTOR'], roleNames: ['超级管理员', '主任'], permissions: ['*'], deptName: '管委会', position: '主任', email: 'admin@lawfirm.demo', phone: '13800000001' },
  director: { userId: 2, username: 'director', realName: '张主任', roles: ['DIRECTOR'], roleNames: ['主任'], permissions: ['*'], deptName: '管委会', position: '主任', email: 'director@lawfirm.demo', phone: '13800000002' },
  lawyer1: { userId: 3, username: 'lawyer1', realName: '李律师', roles: ['LAWYER'], roleNames: ['主办律师'], permissions: ['matter:list', 'client:list', 'finance:contract:list', 'document:list'], deptName: '民事法律事务部', position: '主办律师', email: 'lawyer1@lawfirm.demo', phone: '13800000003' },
  leader: { userId: 4, username: 'leader', realName: '王团队负责人', roles: ['TEAM_LEADER'], roleNames: ['团队负责人'], permissions: ['matter:list', 'client:list', 'finance:contract:list'], deptName: '商事法律事务部', position: '高级律师', email: 'leader@lawfirm.demo', phone: '13800000004' },
  finance: { userId: 5, username: 'finance', realName: '赵财务', roles: ['FINANCE'], roleNames: ['财务'], permissions: ['finance:contract:list', 'finance:invoice:list', 'finance:expense:list', 'finance:commission:list'], deptName: '财务部', position: '财务专员', email: 'finance@lawfirm.demo', phone: '13800000005' },
  staff: { userId: 6, username: 'staff', realName: '钱行政', roles: ['ADMIN_STAFF'], roleNames: ['行政'], permissions: ['admin:asset:list', 'admin:meeting-room:list', 'hr:employee:list'], deptName: '行政部', position: '行政主管', email: 'staff@lawfirm.demo', phone: '13800000006' },
  trainee: { userId: 7, username: 'trainee', realName: '孙实习', roles: ['TRAINEE'], roleNames: ['实习律师'], permissions: ['matter:list'], deptName: '民事法律事务部', position: '实习律师', email: 'trainee@lawfirm.demo', phone: '13800000007' },
};

function createToken(username) {
  const payload = `${username}|${Date.now() + 3600 * 1000}`;
  return 'demo-' + btoa(payload);
}
function parseToken(token) {
  try {
    const raw = atob(token.replace(/^demo-/, ''));
    const [username, exp] = raw.split('|');
    if (Number(exp) < Date.now()) return null;
    return username;
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * 菜单树 —— 与后端 sys_menu 表 1:1 对齐（2026-10-12 从生产库导出）
 *
 * 原项目是**后端动态菜单**：`GET /system/menu/user` 由 MenuAppService 实现——
 *   SELECT DISTINCT m.* FROM sys_menu m
 *     JOIN sys_role_menu rm ON m.id = rm.menu_id
 *     JOIN sys_user_role ur ON rm.role_id = ur.role_id
 *    WHERE ur.user_id = ? AND m.deleted = false AND m.status = 'ENABLED'
 *    ORDER BY m.sort_order, m.id
 *   再剔除 BUTTON 类型，按 parent_id 建树（buildTree(0L)）。
 *
 * 演示站无后端，故把同一份数据静态化：
 *   MENU_NODES  —— 去重后的菜单节点表（键＝sys_menu.id）
 *   ROLE_MENUS  —— 每个角色可见的菜单 id 列表（按 sort_order, id 排序）
 *   buildMenu(username) 按角色重建出与后端结构、名称、顺序、路径完全一致的树。
 * 演示账号与生产库 sys_user 一一对应（admin/director/lawyer1/leader/finance/staff/trainee）。
 * ------------------------------------------------------------------------- */
const MENU_NODES = {
  "1": {n:"工作台",p:0,t:"MENU",s:1,path:"/dashboard/workspace",c:"dashboard/workspace/index",i:"DashboardOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "2": {n:"系统管理",p:0,t:"DIRECTORY",s:99,path:"/system",c:"LAYOUT",i:"SettingOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "3": {n:"客户管理",p:0,t:"DIRECTORY",s:4,path:"/crm",c:"LAYOUT",i:"TeamOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "4": {n:"项目管理",p:0,t:"DIRECTORY",s:5,path:"/matter",c:"LAYOUT",i:"FolderOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "5": {n:"财务管理",p:0,t:"DIRECTORY",s:6,path:"/finance",c:"LAYOUT",i:"MoneyCollectOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "6": {n:"卷宗管理",p:0,t:"DIRECTORY",s:7,path:"/document",c:"LAYOUT",i:"FileTextOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "8": {n:"档案管理",p:0,t:"DIRECTORY",s:8,path:"/archive",c:"LAYOUT",i:"DatabaseOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "9": {n:"行政管理",p:0,t:"DIRECTORY",s:9,path:"/admin",c:"LAYOUT",i:"BankOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "10": {n:"人力资源",p:0,t:"DIRECTORY",s:10,path:"/hr",c:"LAYOUT",i:"IdcardOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "11": {n:"知识库",p:0,t:"DIRECTORY",s:11,path:"/knowledge",c:"LAYOUT",i:"BookOutlined",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "21": {n:"用户管理",p:2,t:"MENU",s:1,path:"/system/user",c:"system/user/index",i:"UserOutlined",perm:"sys:user:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "22": {n:"角色管理",p:2,t:"MENU",s:2,path:"/system/role",c:"system/role/index",i:"SafetyCertificateOutlined",perm:"sys:role:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "23": {n:"部门管理",p:2,t:"MENU",s:3,path:"/system/dept",c:"system/dept/index",i:"ApartmentOutlined",perm:"sys:dept:list",ca:"2026-01-04T16:14:15",ua:"2026-01-06T11:40:43"},
  "24": {n:"菜单管理",p:2,t:"MENU",s:4,path:"/system/menu",c:"system/menu/index",i:"MenuOutlined",perm:"sys:menu:list",ca:"2026-01-04T16:14:15",ua:"2026-01-06T11:40:43"},
  "25": {n:"系统配置",p:2,t:"MENU",s:7,path:"/system/config",c:"system/config/index",i:"ToolOutlined",perm:"sys:config:list",ca:"2026-01-04T16:14:15",ua:"2026-01-06T11:40:43"},
  "26": {n:"操作日志",p:2,t:"MENU",s:8,path:"/system/log",c:"system/log/index",i:"FileSearchOutlined",perm:"sys:log:list",ca:"2026-01-04T16:14:15",ua:"2026-01-06T11:40:43"},
  "27": {n:"出函模板",p:9,t:"MENU",s:20,path:"/admin/letter-template",c:"admin/letter-template/index",i:"MailOutlined",perm:"sys:letter-template:list",ca:"2026-01-04T16:14:15",ua:"2026-01-06T11:40:43"},
  "28": {n:"合同模板",p:5,t:"MENU",s:20,path:"/finance/contract-template",c:"finance/contract-template/index",i:"FileProtectOutlined",perm:"sys:contract-template:list",ca:"2026-01-04T16:14:15",ua:"2026-01-06T11:40:43"},
  "29": {n:"灾备管理",p:2,t:"MENU",s:9,path:"/system/backup",c:"system/backup/index",i:"DatabaseOutlined",perm:"sys:backup:list",ca:"2026-10-10T11:00:20",ua:"2026-10-10T11:00:20"},
  "30": {n:"字典管理",p:2,t:"MENU",s:5,path:"/system/dict",c:"system/dict/index",i:"BookOutlined",perm:"sys:dict:list",ca:"2026-10-10T11:00:20",ua:"2026-10-10T11:00:20"},
  "31": {n:"客户列表",p:3,t:"MENU",s:1,path:"/crm/client",c:"crm/client/index",i:"ContactsOutlined",perm:"client:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "32": {n:"利冲审查",p:3,t:"MENU",s:2,path:"/crm/conflict",c:"crm/conflict/index",i:"SecurityScanOutlined",perm:"conflict:apply",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "33": {n:"案源管理",p:3,t:"MENU",s:3,path:"/crm/lead",c:"crm/lead/index",i:"FunnelPlotOutlined",perm:"lead:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "41": {n:"项目列表",p:4,t:"MENU",s:1,path:"/matter/list",c:"matter/list/index",i:"ProjectOutlined",perm:"matter:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "42": {n:"我的项目",p:4,t:"MENU",s:2,path:"/matter/my",c:"matter/my/index",i:"SolutionOutlined",perm:"matter:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "43": {n:"工时管理",p:4,t:"MENU",s:6,path:"/matter/timesheet",c:"matter/timesheet/index",i:"ClockCircleOutlined",perm:"timesheet:record",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "44": {n:"任务管理",p:4,t:"MENU",s:5,path:"/matter/task",c:"matter/task/index",i:"CheckSquareOutlined",perm:"task:manage",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "45": {n:"合同管理",p:4,t:"MENU",s:3,path:"/matter/contract",c:"matter/contract/index",i:"FileProtectOutlined",perm:"matter:contract:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "51": {n:"合同收款概览",p:5,t:"MENU",s:10,path:"/finance/contract",c:"finance/contract/index",i:"FileProtectOutlined",perm:"finance:contract:view",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "52": {n:"收款管理",p:5,t:"MENU",s:11,path:"/finance/payment",c:"finance/payment/index",i:"PayCircleOutlined",perm:"finance:payment:manage",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "53": {n:"提成管理",p:5,t:"MENU",s:13,path:"/finance/commission",c:"finance/commission/index",i:"PercentageOutlined",perm:"finance:commission:manage",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "54": {n:"发票管理",p:5,t:"MENU",s:15,path:"/finance/invoice",c:"finance/invoice/index",i:"ProfileOutlined",perm:"finance:invoice:manage",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "55": {n:"财务报表",p:5,t:"MENU",s:20,path:"/finance/report",c:"finance/report/index",i:"BarChartOutlined",perm:"finance:report:view",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "56": {n:"收款变更审批",p:5,t:"MENU",s:12,path:"/finance/payment-amendment",c:"finance/payment-amendment/index",i:"AuditOutlined",perm:"fee:amendment:list",ca:"2026-01-05T02:19:31",ua:"2026-01-05T02:19:31"},
  "57": {n:"我的收款",p:5,t:"MENU",s:1,path:"/finance/my-payment",c:"finance/my-payment/index",i:"WalletOutlined",perm:"finance:my:payment",ca:"2026-01-05T16:00:00",ua:"2026-01-05T16:00:00"},
  "58": {n:"我的提成",p:5,t:"MENU",s:2,path:"/finance/my-commission",c:"finance/my-commission/index",i:"DollarOutlined",perm:"finance:my:commission",ca:"2026-01-05T16:00:00",ua:"2026-01-05T16:00:00"},
  "59": {n:"费用报销",p:5,t:"MENU",s:4,path:"/finance/expense",c:"finance/expense/index",i:"AccountBookOutlined",perm:"finance:expense:apply",ca:"2026-01-05T16:00:00",ua:"2026-01-05T16:00:00"},
  "61": {n:"卷宗列表",p:6,t:"MENU",s:2,path:"/document/list",c:"document/list/index",i:"FileOutlined",perm:"doc:list",ca:"2026-01-04T16:14:15",ua:"2026-01-08T01:43:37"},
  "62": {n:"文书制作",p:6,t:"MENU",s:3,path:"/document/compose",c:"document/compose/index",i:"FileAddOutlined",perm:"doc:compose",ca:"2026-01-04T16:14:15",ua:"2026-01-08T01:43:37"},
  "63": {n:"印章管理",p:9,t:"MENU",s:11,path:"/document/seal",c:"document/seal/index",i:"SafetyOutlined",perm:"doc:seal:list",ca:"2026-01-04T16:14:15",ua:"2026-01-07T08:31:53"},
  "64": {n:"用印申请",p:9,t:"MENU",s:12,path:"/document/seal-apply",c:"document/seal-apply/index",i:"FormOutlined",perm:"doc:seal:apply",ca:"2026-01-04T16:14:15",ua:"2026-01-07T08:31:53"},
  "81": {n:"档案列表",p:8,t:"MENU",s:1,path:"/archive/list",c:"archive/list/index",i:"FolderOpenOutlined",perm:"archive:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "82": {n:"档案访问",p:8,t:"MENU",s:2,path:"/archive/access",c:"archive/access/index",i:"LinkOutlined",perm:"archive:access:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "83": {n:"档案迁移",p:8,t:"MENU",s:3,path:"/archive/destroy",c:"archive/destroy/index",i:"CloudUploadOutlined",perm:"archive:migrate:apply",ca:"2026-01-04T16:14:15",ua:"2026-01-08T03:06:03"},
  "91": {n:"考勤管理",p:9,t:"MENU",s:1,path:"/admin/attendance",c:"admin/attendance/index",i:"ClockCircleOutlined",perm:"admin:attendance:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "92": {n:"请假管理",p:9,t:"MENU",s:2,path:"/admin/leave",c:"admin/leave/index",i:"CalendarOutlined",perm:"admin:leave:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "93": {n:"会议室预约",p:9,t:"MENU",s:5,path:"/admin/meeting-room",c:"admin/meeting-room/index",i:"ScheduleOutlined",perm:"admin:meeting:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "94": {n:"资产管理",p:9,t:"MENU",s:20,path:"/admin/asset",c:"admin/asset/index",i:"ShopOutlined",perm:"admin:asset:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "95": {n:"采购管理",p:9,t:"MENU",s:22,path:"/admin/purchase",c:"admin/purchase/index",i:"ShoppingCartOutlined",perm:"admin:purchase:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "96": {n:"供应商管理",p:9,t:"MENU",s:23,path:"/admin/supplier",c:"admin/supplier/index",i:"ShopOutlined",perm:"admin:supplier:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "97": {n:"加班管理",p:9,t:"MENU",s:3,path:"/admin/overtime",c:"admin/overtime/index",i:"ClockCircleOutlined",perm:"admin:overtime:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "98": {n:"资产盘点",p:9,t:"MENU",s:21,path:"/admin/asset-inventory",c:"admin/asset-inventory/index",i:"FileSearchOutlined",perm:"admin:asset:inventory",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "99": {n:"外出管理",p:9,t:"MENU",s:4,path:"/admin/go-out",c:"admin/go-out/index",i:"ExportOutlined",perm:"admin:goout:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "100": {n:"会议记录",p:9,t:"MENU",s:6,path:"/admin/meeting-record",c:"admin/meeting-record/index",i:"FileTextOutlined",perm:"admin:meeting-record:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "101": {n:"培训管理",p:10,t:"MENU",s:2,path:"/hr/training",c:"hr/training/index",i:"ReadOutlined",perm:"hr:training:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "102": {n:"绩效考核",p:10,t:"MENU",s:3,path:"/hr/performance",c:"hr/performance/index",i:"TrophyOutlined",perm:"hr:performance:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "103": {n:"晋升管理",p:10,t:"MENU",s:5,path:"/hr/promotion",c:"hr/promotion/index",i:"RiseOutlined",perm:"hr:promotion:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "104": {n:"发展计划",p:10,t:"MENU",s:6,path:"/hr/development",c:"hr/development/index",i:"AimOutlined",perm:"hr:development:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "105": {n:"转正管理",p:10,t:"MENU",s:4,path:"/hr/regularization",c:"hr/regularization/index",i:"CheckSquareOutlined",perm:"hr:regularization:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "106": {n:"离职管理",p:10,t:"MENU",s:7,path:"/hr/resignation",c:"hr/resignation/index",i:"ExportOutlined",perm:"hr:resignation:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "107": {n:"工资管理",p:5,t:"MENU",s:14,path:"/hr/payroll",c:"hr/payroll/index",i:"DollarOutlined",perm:"payroll:list",ca:"2026-01-06T07:30:04",ua:"2026-01-06T07:30:04"},
  "108": {n:"我的工资",p:5,t:"MENU",s:3,path:"/hr/payroll/my",c:"hr/payroll/my/index",i:"WalletOutlined",perm:"payroll:my:view",ca:"2026-01-06T07:30:04",ua:"2026-01-06T07:30:04"},
  "109": {n:"员工档案",p:10,t:"MENU",s:1,path:"/hr/employee",c:"hr/employee/index",i:"UserOutlined",perm:"hr:employee:list",ca:"2026-01-06T07:30:04",ua:"2026-01-06T07:30:04"},
  "110": {n:"劳动合同",p:10,t:"MENU",s:8,path:"/hr/contract",c:"hr/contract/index",i:"FileProtectOutlined",perm:"hr:contract:list",ca:"2026-01-12T10:00:00",ua:"2026-01-12T10:00:00"},
  "111": {n:"知识文章",p:11,t:"MENU",s:1,path:"/knowledge/article",c:"knowledge/article/index",i:"FileTextOutlined",perm:"knowledge:article:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "112": {n:"案例库",p:11,t:"MENU",s:2,path:"/knowledge/case",c:"knowledge/case/index",i:"ContainerOutlined",perm:"knowledge:case:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "113": {n:"法规库",p:11,t:"MENU",s:3,path:"/knowledge/law",c:"knowledge/law/index",i:"BookOutlined",perm:"knowledge:law:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "120": {n:"出函管理",p:9,t:"MENU",s:10,path:"/admin/letter",c:"admin/letter/index",i:"MailOutlined",perm:"admin:letter:list",ca:"2026-01-04T16:14:15",ua:"2026-01-04T16:14:15"},
  "121": {n:"合同查询",p:9,t:"MENU",s:30,path:"/admin/contract",c:"admin/contract/index",i:"FileSearchOutlined",perm:"admin:contract:list",ca:"2026-01-05T02:19:57",ua:"2026-01-05T02:19:57"},
  "123": {n:"合同变更处理",p:5,t:"MENU",s:16,path:"/finance/contract-amendment",c:"finance/contract-amendment/index",i:"ant-design:diff-outlined",perm:"finance:contract:amendment:view",ca:"2026-01-05T03:55:33",ua:"2026-01-05T03:55:33"},
  "140": {n:"提成规则配置",p:2,t:"MENU",s:12,path:"/system/commission-config",c:"system/commission-config/index",i:"ant-design:percentage-outlined",perm:"sys:config:list",ca:"2026-01-05T18:00:00",ua:"2026-01-06T11:40:43"},
  "148": {n:"我的合同",p:4,t:"MENU",s:4,path:"/matter/my-contract",c:"matter/my-contract/index",i:"FileTextOutlined",perm:"matter:contract:view",ca:"2026-01-06T01:27:18",ua:"2026-01-06T01:27:18"},
  "149": {n:"日程管理",p:0,t:"MENU",s:2,path:"/workbench/schedule",c:"workbench/schedule/index",i:"CalendarOutlined",perm:"schedule:list",ca:"2026-01-06T04:02:22",ua:"2026-01-06T04:02:22"},
  "159": {n:"外部系统集成",p:2,t:"MENU",s:99,path:"/system/integration",c:"system/integration/index",i:"CloudOutlined",perm:"sys:integration:list",ca:"2026-01-08T04:48:25",ua:"2026-01-08T04:48:25"},
  "198": {n:"权限矩阵",p:2,t:"MENU",s:6,path:"/system/permission-matrix",c:"system/permission-matrix/index",i:"TableOutlined",perm:"sys:role:list",ca:"2026-01-06T11:40:43",ua:"2026-01-06T11:40:43"},
  "200": {n:"报表中心",p:0,t:"DIRECTORY",s:12,path:"/workbench/report",c:"LAYOUT",i:"BarChartOutlined",perm:"report:list",ca:"2026-01-06T14:00:00",ua:"2026-01-06T14:00:00"},
  "207": {n:"数据交接",p:0,t:"MENU",s:13,path:"/data-handover",c:"data-handover/index",i:"ant-design:swap-outlined",ca:"2026-01-06T12:36:22",ua:"2026-01-06T12:36:22"},
  "701": {n:"审批中心",p:0,t:"MENU",s:3,path:"/dashboard/approval",c:"dashboard/approval/index",i:"ant-design:audit-outlined",perm:"approval:list",ca:"2026-01-05T15:01:30",ua:"2026-01-05T15:01:30"},
  "713": {n:"文书模板",p:6,t:"MENU",s:4,path:"/document/template",c:"document/template/index",i:"FileTextOutlined",perm:"doc:template:list",ca:"2026-01-08T01:43:37",ua:"2026-01-08T01:43:37"},
  "714": {n:"我的文书",p:6,t:"MENU",s:1,path:"/document/my",c:"document/my/index",i:"FileTextOutlined",perm:"doc:my:list",ca:"2026-01-08T02:15:45",ua:"2026-01-08T02:15:45"},
  "715": {n:"卷宗模板",p:6,t:"MENU",s:5,path:"/document/dossier-template",c:"document/dossier-template/index",i:"FileProtectOutlined",perm:"doc:list",ca:"2026-01-08T01:43:37",ua:"2026-01-08T01:43:37"},
  "760": {n:"预收款管理",p:5,t:"MENU",s:17,path:"/finance/prepayment",c:"finance/prepayment/index",i:"WalletOutlined",perm:"prepayment:list",ca:"2026-01-12T10:00:00",ua:"2026-01-12T10:00:00"},
  "765": {n:"系统公告",p:2,t:"MENU",s:15,path:"/system/announcement",c:"system/announcement/index",i:"NotificationOutlined",perm:"sys:announcement:list",ca:"2026-01-12T10:00:00",ua:"2026-01-12T10:00:00"},
  "774": {n:"业务报表",p:200,t:"MENU",s:9,path:"/workbench/report/overview",c:"workbench/report/index",i:"BarChartOutlined",ca:"2026-03-31T09:00:00",ua:"2026-03-31T09:00:00"},
  "775": {n:"报表模板",p:200,t:"MENU",s:10,path:"/workbench/report-template",c:"workbench/report-template/index",i:"FileTextOutlined",perm:"report:template:list",v:0,ca:"2026-01-12T10:00:00",ua:"2026-10-10T11:00:22"},
  "780": {n:"定时报表",p:200,t:"MENU",s:11,path:"/workbench/scheduled-report",c:"workbench/scheduled-report/index",i:"ScheduleOutlined",perm:"report:scheduled:list",v:0,ca:"2026-01-12T10:00:00",ua:"2026-10-10T11:00:22"},
  "785": {n:"质量管理",p:11,t:"MENU",s:10,path:"/knowledge/quality",c:"knowledge/quality/index",i:"SafetyCertificateOutlined",perm:"knowledge:quality:list",ca:"2026-01-12T10:00:00",ua:"2026-01-12T10:00:00"},
  "5000": {n:"我的AI使用",p:0,t:"MENU",s:99,path:"/personal/ai-usage",c:"personal/ai-usage/index",i:"laptop-outlined",perm:"ai:usage:view",v:0,ca:"2026-10-10T11:00:22",ua:"2026-10-10T11:00:22"},
  "5100": {n:"AI费用账单",p:5,t:"MENU",s:60,path:"/finance/ai-billing",c:"finance/ai-billing/index",i:"MoneyCollectOutlined",perm:"ai:billing:view",ca:"2026-10-10T11:00:22",ua:"2026-10-10T11:00:22"},
  "9401": {n:"档案推送状态",p:8,t:"MENU",s:15,path:"/archive/push-status",c:"archive/push-status/index",perm:"archive:push:records",nc:1,ca:"2026-10-10T11:00:22",ua:"2026-10-10T11:00:22"}
};

const ROLE_MENUS = {
  ADMIN: [1,21,31,41,57,81,91,109,111,714,22,32,42,58,61,82,92,101,112,149,23,33,45,62,83,97,102,108,113,701,3,24,59,99,105,148,713,4,30,44,93,103,715,5,43,100,104,198,6,25,106,8,26,110,9,29,774,10,51,120,775,785,11,52,63,780,56,64,140,200,53,207,107,54,765,9401,123,760,27,28,55,94,98,95,96,121,5100,2,159,5000],
  DIRECTOR: [1,31,41,57,81,91,109,111,714,32,42,58,61,82,92,101,112,149,23,33,45,62,97,102,108,113,701,3,59,99,105,148,713,4,30,44,93,103,715,5,43,100,104,6,25,106,8,110,9,774,10,51,120,775,785,11,52,63,780,56,64,140,200,53,207,107,54,765,9401,123,760,27,28,55,94,98,95,96,121,5100,2,5000],
  TEAM_LEADER: [1,31,41,57,81,91,111,714,32,42,58,61,82,92,101,112,149,33,45,62,97,108,113,701,3,59,99,148,4,44,93,103,5,43,6,8,110,9,774,10,51,120,785,11,52,56,64,200,53,207,107,54,9401,55,5000],
  FINANCE: [1,57,81,91,111,714,58,82,92,112,149,97,108,113,701,59,99,93,5,6,8,110,9,774,10,51,11,52,56,140,200,53,207,107,54,765,9401,123,760,28,55,94,95,96,5100,2,5000],
  LAWYER: [1,31,41,57,81,91,111,714,32,42,58,61,82,92,101,112,149,33,45,62,97,108,113,701,3,59,99,148,4,44,93,103,5,43,6,8,110,9,774,10,11,64,200,207,9401,5000],
  ADMIN_STAFF: [1,81,91,109,111,714,61,82,92,101,112,149,62,97,102,108,113,701,59,99,105,713,93,103,715,5,100,104,6,106,8,110,9,10,120,11,63,64,207,765,9401,27,28,94,98,95,96,121,2,5000],
  TRAINEE: [1,31,41,57,81,91,111,714,32,42,58,61,82,92,101,112,149,45,62,97,108,113,701,3,59,99,148,4,44,93,103,5,43,6,8,110,9,774,10,11,64,200,207,9401,5000]
};

// 演示账号 → 生产库 sys_role.role_code
const DEMO_MENU_ROLE = {
  admin: 'ADMIN',
  director: 'DIRECTOR',
  lawyer1: 'LAWYER',
  leader: 'TEAM_LEADER',
  finance: 'FINANCE',
  staff: 'ADMIN_STAFF',
  trainee: 'TRAINEE',
};

const MENU_TYPE_NAME = { DIRECTORY: '目录', MENU: '菜单', BUTTON: '按钮' };

function buildMenu(username) {
  const role = DEMO_MENU_ROLE[username] || 'ADMIN';
  const ids = ROLE_MENUS[role] || ROLE_MENUS.ADMIN;
  const byParent = {};
  ids.forEach((id) => {
    const nd = MENU_NODES[id];
    if (!nd) return;
    (byParent[nd.p] = byParent[nd.p] || []).push(id);
  });
  Object.keys(byParent).forEach((k) => byParent[k].sort((a, b) => (MENU_NODES[a].s - MENU_NODES[b].s) || (a - b)));
  function toDTO(id) {
    const nd = MENU_NODES[id];
    return {
      id: Number(id),
      parentId: nd.p,
      name: nd.n,
      path: nd.path || '',
      component: nd.c || 'LAYOUT',
      redirect: null,
      icon: nd.i || '',
      menuType: nd.t,
      menuTypeName: MENU_TYPE_NAME[nd.t] || nd.t,
      permission: nd.perm || null,
      sortOrder: nd.s,
      visible: nd.v !== 0,
      status: 'ENABLED',
      isExternal: false,
      isCache: nd.nc !== 1,
      createdAt: nd.ca,
      updatedAt: nd.ua,
      children: (byParent[id] || []).map(toDTO),
    };
  }
  return (byParent[0] || []).map(toDTO);
}

/* ---------------------------------------------------------------------------
 * 种子数据生成 —— 按集合懒加载
 *
 * 系统页面极多，若一次性构建全部集合会造成明显的加载卡顿。这里把每个集合
 * 拆成独立 builder，只在某个集合被首次访问时才生成并 enrich，未访问的集合
 * 完全不消耗时间。集合间的共享数据（如案件负责人姓名池）用懒初始化单例保持。
 * ------------------------------------------------------------------------- */
/* 记录基础字段：每条种子记录的公共字段 */
const base = (extra) => {
    const createTime = dateTimeAgo(ri(1, 200));
    const updateTime = dateTimeAgo(ri(0, 30));
    return {
      id: nextId(),
      status: pick(['进行中', '已完成', '待审核', '已归档']),
      creatorName: fullName(),
      createTime,
      updateTime,
      createdAt: createTime,
      updatedAt: updateTime,
      remark: '',
      ...extra,
    };
};

/* 案件相关人员姓名池：懒初始化单例，供案件/任务/工时/日程共用，保证跨集合负责人一致 */
let _matterOwners = null;
function matterOwners() {
  if (!_matterOwners) _matterOwners = Array.from({ length: 8 }, () => fullName());
  return _matterOwners;
}

const SEED_BUILDERS = {
  'client': () => Array.from({ length: 42 }, () => {
    const cname = companyName();
    const ctype = pick(['企业', '个人']);
    const owner = fullName();
    const contact = fullName();
    return base({
      clientNo: 'KH' + String(ri(10000, 99999)),
      clientName: cname,
      name: cname,
      clientType: ctype,
      clientTypeName: ctype,
      creditCode: String(ri(100000000, 999999999)) + 'XY',
      contactName: contact,
      contactPerson: contact,
      contactPhone: '1' + String(ri(3000000000, 5999999999)),
      industry: pick(POOL.industry),
      source: pick(['官网', '转介绍', '市场活动', '自行开发', '合作渠道']),
      levelName: pick(['A类', 'B类', 'C类', 'D类']),
      categoryName: pick(['诉讼客户', '非诉客户', '顾问单位', '专项委托']),
      statusName: pick(['合作中', '潜在', '已流失']),
      originatorName: fullName(),
      ownerName: owner,
      responsibleLawyerName: owner,
    });
  }),
  'client/lead': () => Array.from({ length: 22 }, () => {
    const source = pick(['官网', '转介绍', '市场活动', '电话咨询']);
    const status = pick(['待跟进', '跟进中', '已转化', '已流失']);
    const follow = fullName();
    return base({
      leadNo: 'AY' + String(ri(10000, 99999)),
      leadName: companyName(),
      clientType: pick(['企业', '个人']),
      source,
      sourceName: source,
      intention: pick(['高', '中', '低']),
      estimatedAmount: ri(5, 500) * 10000,
      followStatus: status,
      statusName: status,
      contactName: fullName(),
      contactPhone: '1' + String(ri(3000000000, 5999999999)),
      followUpUserName: follow,
      ownerName: follow,
      nextFollowTime: daysAgo(-ri(1, 20)),
    });
  }),
  'client/conflict-check': () => Array.from({ length: 14 }, () =>
    base({
      clientName: companyName(),
      opposingParty: companyName(),
      riskLevel: pick(['HIGH', 'MEDIUM', 'LOW']),
      hasConflict: bool(),
      status: pick(['待审查', '已通过', '已豁免', '存在冲突']),
      reviewer: fullName(),
    }),
  ),
  'client/tag': () => ['VIP客户', '战略客户', '潜在客户', '风险客户', '长期合作'].map((t, i) =>
    base({ id: 1000 + i, tagName: t, color: pick(['red', 'blue', 'green', 'orange', 'purple']) }),
  ),
  'client/contact': () => Array.from({ length: 18 }, () =>
    base({ clientId: ri(1, 42), contactName: fullName(), phone: '1' + String(ri(3000000000, 5999999999)), position: pick(POOL.position), isPrimary: bool() }),
  ),
  'matter': () => Array.from({ length: 48 }, () => {
    const caseType = pick(POOL.caseType);
    const caseName = caseType + '一案';
    const caseNo = '(' + ri(2023, 2026) + ')' + pick(POOL.city) + '律民初' + String(ri(100, 999)) + '号';
    const mtype = pick(['诉讼', '非诉', '顾问', '仲裁']);
    const lead = pick(matterOwners());
    const amount = ri(10, 2000) * 10000;
    const status = pick(POOL.matterStatus);
    return base({
      caseNo,
      matterNo: caseNo,
      caseName,
      name: caseName,
      caseType,
      caseTypeName: caseType,
      matterType: mtype,
      matterTypeName: mtype,
      clientName: companyName(),
      contractNo: 'HT' + String(ri(100000, 999999)),
      lawyerName: lead,
      leadLawyerName: lead,
      counterparty: companyName(),
      courtName: pick(POOL.court),
      amount,
      contractAmount: amount,
      status,
      statusName: status,
      acceptDate: daysAgo(ri(30, 400)),
      progress: ri(0, 100),
      description: '本案系' + caseType + '，涉及标的额较大，需持续跟进。',
    });
  }),
  'matter/contract': () => Array.from({ length: 20 }, () =>
    base({ contractNo: 'MC' + String(ri(100000, 999999)), matterName: pick(POOL.caseType) + '一案', clientName: companyName(), amount: ri(5, 300) * 10000, signDate: daysAgo(ri(10, 300)), status: pick(POOL.financeStatus) }),
  ),
  'tasks': () => Array.from({ length: 26 }, () =>
    base({ title: pick(['起草答辩状', '证据整理', '客户访谈', '庭审准备', '法律检索', '合同审阅', '阅卷', '调解方案']), matterName: pick(POOL.caseType) + '一案', assignee: pick(matterOwners()), dueDate: daysAgo(-ri(1, 25)), priority: pick(['高', '中', '低']), status: pick(['待开始', '进行中', '已完成', '已逾期']) }),
  ),
  'timesheets': () => Array.from({ length: 30 }, () =>
    base({ employeeName: pick(matterOwners()), matterName: pick(POOL.caseType) + '一案', workDate: daysAgo(ri(1, 60)), hours: ri(1, 9), description: pick(['庭审', '会见', '文书', '研究', '谈判']), status: pick(['草稿', '已提交', '已审批']) }),
  ),
  'schedules': () => Array.from({ length: 16 }, () =>
    base({ title: pick(['开庭', '客户会议', '内部研讨', '尽调', '证据交换']), matterName: pick(POOL.caseType) + '一案', type: pick(['开庭', '会议', '提醒', ' deadline']), dueDate: daysAgo(-ri(1, 30)), ownerName: pick(matterOwners()), remind: bool() }),
  ),
  'document': () => Array.from({ length: 38 }, () =>
    base({ docNo: 'WD' + String(ri(10000, 99999)), docName: pick(POOL.docType) + '（' + companyName() + '）', docType: pick(POOL.docType), matterName: pick(POOL.caseType) + '一案', ownerName: fullName(), size: ri(10, 5000) + 'KB', status: pick(POOL.docStatus) }),
  ),
  'document/template': () => Array.from({ length: 12 }, () =>
    base({ templateName: pick(POOL.docType) + '模板', category: pick(['民事诉讼', '刑事诉讼', '商事', '非诉']), version: 'v' + ri(1, 5) + '.' + ri(0, 9), ownerName: fullName(), status: pick(['启用', '停用']) }),
  ),
  'document/seal-application': () => Array.from({ length: 20 }, () => {
    const d = daysAgo(ri(1, 90));
    return base({
      applicationNo: 'YY' + String(ri(100000, 999999)),
      sealName: pick(['公章', '合同专用章', '财务专用章', '发票专用章', '法人章']),
      documentName: pick(POOL.docType),
      usePurpose: pick(['合同签署', '函件出具', '证明文件', '立案材料', '投标文件']),
      copies: ri(1, 5),
      userDate: d,
      applicantName: fullName(),
      applicantDeptName: pick(POOL.dept),
      matterName: pick(POOL.caseType) + '一案',
      requestTime: d + ' 09:00:00',
      status: pick(['待审批', '已用印', '已驳回']),
    });
  }),
  'document/seal': () => Array.from({ length: 16 }, () =>
    base({ sealName: pick(['公章', '合同专用章', '财务专用章', '发票专用章', '法人章']), applyReason: pick(['合同用印', '函件用印', '证明文件']), applicant: fullName(), applyDate: daysAgo(ri(1, 60)), status: pick(['待审批', '已用印', '已驳回']) }),
  ),
  'archive': () => Array.from({ length: 24 }, () => {
    const ct = pick(POOL.caseType);
    return base({
      archiveNo: 'DA' + String(ri(10000, 99999)),
      title: ct + '卷宗',
      archiveName: ct + '卷宗',
      category: pick(['诉讼档案', '非诉档案', '顾问档案', '归档材料']),
      archiveType: pick(['诉讼档案', '非诉档案', '顾问档案']),
      matterName: ct + '一案',
      caseName: ct + '一案',
      clientName: companyName(),
      lawyerName: fullName(),
      location: pick(POOL.city) + '档案室' + ri(1, 9) + '号',
      retentionPeriod: pick(['永久', '30年', '10年']),
      closeDate: daysAgo(ri(30, 500)),
      volumeCount: ri(1, 5),
      pageCount: ri(20, 360),
      status: pick(['在库', '借阅中', '已销毁', '已移交']),
    });
  }),
  'archive/access': () => Array.from({ length: 12 }, () =>
    base({ archiveNo: 'DA' + String(ri(10000, 99999)), applicant: fullName(), reason: pick(['阅卷', '复印', '移交']), applyDate: daysAgo(ri(1, 40)), approveStatus: pick(['待审批', '已批准', '已驳回']) }),
  ),
  'finance/contract': () => Array.from({ length: 30 }, () =>
    base({ contractNo: 'HT' + String(ri(100000, 999999)), contractName: pick(POOL.caseType) + '委托代理合同', clientName: companyName(), matterName: pick(POOL.caseType) + '一案', amount: ri(5, 500) * 10000, signDate: daysAgo(ri(10, 400)), status: pick(POOL.financeStatus), ownerName: fullName() }),
  ),
  'finance/invoice': () => Array.from({ length: 24 }, () =>
    base({ invoiceNo: 'INV' + String(ri(100000, 999999)), contractNo: 'HT' + String(ri(100000, 999999)), clientName: companyName(), amount: ri(1, 200) * 10000, taxRate: pick(['1%', '3%', '6%', '9%']), issueDate: daysAgo(ri(1, 200)), type: pick(['增值税专用发票', '增值税普通发票']), status: pick(['已开具', '已作废', '已红冲']) }),
  ),
  'finance/fee': () => Array.from({ length: 20 }, () =>
    base({ feeNo: 'FY' + String(ri(100000, 999999)), clientName: companyName(), matterName: pick(POOL.caseType) + '一案', feeType: pick(['律师费', '诉讼费', '保全费', '鉴定费', '差旅费']), amount: ri(1, 100) * 10000, payable: ri(1, 100) * 10000, paid: ri(0, 80) * 10000, status: pick(POOL.financeStatus), dueDate: daysAgo(-ri(1, 60)) }),
  ),
  'finance/commission': () => Array.from({ length: 18 }, () =>
    base({ commissionNo: 'TC' + String(ri(100000, 999999)), lawyerName: fullName(), matterName: pick(POOL.caseType) + '一案', amount: ri(1, 80) * 10000, rate: pick(['15%', '20%', '25%', '30%']), status: pick(['待结算', '已审批', '已发放', '已驳回']), settleDate: daysAgo(ri(1, 120)) }),
  ),
  'finance/expense': () => Array.from({ length: 22 }, () =>
    base({ expenseNo: 'BX' + String(ri(100000, 999999)), applicantName: fullName(), category: pick(POOL.expenseCategory), amount: ri(1, 20) * 1000, status: pick(['待审批', '已通过', '已驳回', '已支付']), applyDate: daysAgo(ri(1, 90)), remark: pick(['出差报销', '客户招待', '办公采购']) }),
  ),
  'finance/payment': () => Array.from({ length: 16 }, () =>
    base({ paymentNo: 'SK' + String(ri(100000, 999999)), clientName: companyName(), contractNo: 'HT' + String(ri(100000, 999999)), amount: ri(1, 200) * 10000, payMethod: pick(['银行转账', '支票', '汇票']), payDate: daysAgo(ri(1, 150)), status: pick(['已收款', '部分收款', '待确认']) }),
  ),
  'system/user': () => {
    const sysUsers = Object.values(DEMO_USERS).map((u) =>
      base({ id: u.userId, username: u.username, realName: u.realName, deptName: u.deptName, roleNames: u.roleNames.join(','), email: u.email, phone: u.phone, status: 'ENABLED' }),
    );
    return sysUsers.concat(
      Array.from({ length: 20 }, () =>
        base({ username: 'user' + ri(100, 999), realName: fullName(), deptName: pick(POOL.dept), roleNames: pick(POOL.position), email: 'u' + ri(100, 999) + '@lawfirm.demo', phone: '1' + String(ri(3000000000, 5999999999)), status: pick(['ENABLED', 'DISABLED']) }),
      ),
    );
  },
  'system/role': () => [
    // 对齐生产：roleCode 为大写角色码；dataScope/dataScopeName 为数据范围列
    { id: 1, roleName: '超级管理员', roleCode: 'ADMIN', description: '系统最高权限，可管理所有功能和数据', dataScope: 'ALL', dataScopeName: '全部数据', status: 'ACTIVE', statusName: '启用', sortOrder: 1 },
    { id: 2, roleName: '律所主任', roleCode: 'DIRECTOR', description: '律所主任，可查看全部业务数据', dataScope: 'ALL', dataScopeName: '全部数据', status: 'ACTIVE', statusName: '启用', sortOrder: 2 },
    { id: 3, roleName: '团队负责人', roleCode: 'TEAM_LEADER', description: '团队负责人，可查看本部门及下级数据', dataScope: 'DEPT_AND_CHILD', dataScopeName: '本部门及下级', status: 'ACTIVE', statusName: '启用', sortOrder: 3 },
    { id: 4, roleName: '律师', roleCode: 'LAWYER', description: '办案律师，仅可查看本人数据', dataScope: 'SELF', dataScopeName: '仅本人', status: 'ACTIVE', statusName: '启用', sortOrder: 4 },
    { id: 5, roleName: '财务', roleCode: 'FINANCE', description: '财务管理，可查看全部财务数据', dataScope: 'ALL', dataScopeName: '全部数据', status: 'ACTIVE', statusName: '启用', sortOrder: 5 },
    { id: 6, roleName: '行政', roleCode: 'ADMIN_STAFF', description: '行政管理，可查看本部门数据', dataScope: 'DEPT', dataScopeName: '本部门', status: 'ACTIVE', statusName: '启用', sortOrder: 6 },
    { id: 7, roleName: '实习律师', roleCode: 'TRAINEE', description: '实习人员，仅可查看本人数据', dataScope: 'SELF', dataScopeName: '仅本人', status: 'ACTIVE', statusName: '启用', sortOrder: 7 },
  ],
  'system/department': () => POOL.dept.map((d, i) => ({ id: i + 1, deptName: d, parentName: i === 0 ? '无' : '管委会', leader: fullName(), memberCount: ri(3, 20), status: 'ENABLED' })),
  'system/dict': () => Array.from({ length: 16 }, (_, i) => ({ id: i + 1, dictName: pick(['案件类型', '文书类型', '费用类型', '城市', '行业', '性别', '学历', '民族']), dictCode: 'DICT_' + (i + 1), status: 'ENABLED' })),
  'system/announcement': () => Array.from({ length: 12 }, () =>
    base({ title: pick(['关于', '通知', '提醒']) + pick(['元旦放假', '年度考核', '系统升级', '培训安排', '费用报销制度']), content: '这是一条演示公告内容，用于展示公告管理模块。', publisher: fullName(), publishTime: dateTimeAgo(ri(1, 60)), level: pick(POOL.announcementLevel) }),
  ),
  'system/log': () => Array.from({ length: 30 }, () =>
    ({ id: nextId(), module: pick(['用户', '角色', '案件', '客户', '财务', '系统']), action: pick(['新增', '修改', '删除', '查询', '导出', '登录']), operator: fullName(), ip: '192.168.' + ri(1, 255) + '.' + ri(1, 255), operateTime: dateTimeAgo(ri(0, 60)), result: pick(['成功', '成功', '成功', '失败']) }),
  ),
  'system/config': () => [
    { id: 1, configKey: 'sys.title', configName: '系统标题', configValue: '智慧律所管理系统', group: '基础' },
    { id: 2, configKey: 'sys.logo', configName: '系统 Logo', configValue: '/logo.png', group: '基础' },
    { id: 3, configKey: 'sys.copyright', configName: '版权信息', configValue: '© 2026 演示版', group: '基础' },
    { id: 4, configKey: 'sys.theme', configName: '默认主题', configValue: 'dark', group: '外观' },
  ],
  'system/backup': () => Array.from({ length: 8 }, () =>
    ({ id: nextId(), backupNo: 'BK' + String(ri(100000, 999999)), type: pick(['全量', '增量']), size: ri(100, 9000) + 'MB', startTime: dateTimeAgo(ri(1, 60)), status: pick(['成功', '进行中', '失败']), operator: fullName() }),
  ),
  'system/integration': () => [
    { id: 1, name: 'AI 大模型服务', integrationName: 'AI 大模型服务', type: 'ai', integrationType: 'AI', integrationCode: 'AI_LLM', apiUrl: 'https://api.openai.com/v1', authType: 'API Key', enabled: true, status: 'ENABLED', lastTestResult: '连接正常', description: '智能文书生成、合同审查、法律检索', config: '{}' },
    { id: 2, name: '本地向量模型', integrationName: '本地向量模型', type: 'embedding', integrationType: 'AI', integrationCode: 'AI_EMBED', apiUrl: 'http://10.0.0.21:11434/v1', authType: 'Basic Auth', enabled: false, status: 'DISABLED', lastTestResult: '未启用', description: '知识库语义检索', config: '{}' },
    { id: 3, name: '档案系统对接', integrationName: '档案系统对接', type: 'archive', integrationType: 'ARCHIVE', integrationCode: 'ARCHIVE_GOV', apiUrl: 'https://archive.lawfirm.demo/api', authType: '签名认证', enabled: true, status: 'ENABLED', lastTestResult: '连接正常', description: '卷宗归档与远程档案号回写', config: '{}' },
    { id: 4, name: '客户服务系统', integrationName: '客户服务系统', type: 'crm', integrationType: 'CLIENT_SERVICE', integrationCode: 'CS_CALLBACK', apiUrl: 'https://cs.lawfirm.demo/callback', authType: 'OAuth2', enabled: true, status: 'ENABLED', lastTestResult: '超时', description: '客户工单与服务记录同步', config: '{}' },
    { id: 5, name: '企业微信', integrationName: '企业微信', type: 'wecom', integrationType: 'OTHER', integrationCode: 'WECOM', apiUrl: 'https://qyapi.weixin.qq.com', authType: 'API Key', enabled: true, status: 'ENABLED', lastTestResult: '连接正常', description: '组织架构与消息通知', config: '{}' },
    { id: 6, name: 'MinIO 对象存储', integrationName: 'MinIO 对象存储', type: 'minio', integrationType: 'OTHER', integrationCode: 'MINIO', apiUrl: 'https://minio.lawfirm.demo', authType: 'API Key', enabled: true, status: 'ENABLED', lastTestResult: '连接正常', description: '卷宗与附件存储', config: '{}' },
    { id: 7, name: 'OnlyOffice', integrationName: 'OnlyOffice', type: 'office', integrationType: 'OTHER', integrationCode: 'ONLYOFFICE', apiUrl: 'https://office.lawfirm.demo', authType: '签名认证', enabled: false, status: 'DISABLED', lastTestResult: '未启用', description: '在线文档编辑', config: '{}' },
  ],
  'hr/employee': () => Array.from({ length: 30 }, () =>
    base({ employeeNo: 'EMP' + String(ri(1000, 9999)), realName: fullName(), deptName: pick(POOL.dept), position: pick(POOL.position), hireDate: daysAgo(ri(100, 2000)), status: pick(['在职', '试用', '离职']) }),
  ),
  'hr/contract': () => Array.from({ length: 24 }, () =>
    base({ employeeName: fullName(), contractType: pick(['固定期限', '无固定期限', '实习协议']), startDate: daysAgo(ri(100, 1500)), endDate: daysAgo(-ri(100, 1000)), status: pick(['生效中', '已到期', '已解除']) }),
  ),
  'hr/attendance': () => Array.from({ length: 28 }, () =>
    ({ id: nextId(), employeeName: fullName(), date: daysAgo(ri(1, 60)), checkIn: '0' + ri(7, 9) + ':' + String(ri(0, 59)).padStart(2, '0'), checkOut: '1' + ri(7, 9) + ':' + String(ri(0, 59)).padStart(2, '0'), status: pick(['正常', '迟到', '早退', '缺勤']) }),
  ),
  'hr/leave': () => Array.from({ length: 18 }, () =>
    base({ employeeName: fullName(), leaveType: pick(POOL.leaveType), startDate: daysAgo(ri(1, 60)), endDate: daysAgo(ri(1, 55)), days: ri(1, 15), status: pick(['待审批', '已批准', '已驳回']) }),
  ),
  'hr/payroll': () => Array.from({ length: 28 }, () => {
    const d = new Date();
    d.setMonth(d.getMonth() - ri(0, 3));
    const period = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const baseSalary = ri(8, 50) * 1000;
    const bonus = ri(0, 20) * 1000;
    const deduction = ri(0, 5) * 1000;
    const name = fullName();
    return base({
      employeeNo: 'EMP' + ri(1000, 9999),
      employeeName: name,
      realName: name,
      period,
      payrollYear: d.getFullYear(),
      payrollMonth: d.getMonth() + 1,
      baseSalary,
      bonus,
      deduction,
      income: baseSalary + bonus,
      grossSalary: baseSalary + bonus,
      totalDeduction: deduction,
      netSalary: baseSalary + bonus - deduction,
      confirmStatus: pick(['已确认', '待确认']),
      status: pick(['待发放', '已发放', '已确认']),
    });
  }),
  'hr/performance': () => Array.from({ length: 14 }, () =>
    base({ employeeName: fullName(), period: ri(2024, 2026) + 'Q' + ri(1, 4), score: ri(60, 100), grade: pick(['S', 'A', 'B', 'C']), status: pick(['进行中', '已完成']) }),
  ),
  'admin/asset': () => Array.from({ length: 26 }, () =>
    base({ assetNo: 'ZC' + String(ri(10000, 99999)), assetName: pick(['笔记本电脑', '台式机', '打印机', '投影仪', '办公桌椅', '车辆', '服务器']), category: pick(POOL.assetCategory), ownerName: fullName(), location: pick(POOL.city) + '办公室' + ri(1, 9), value: ri(1, 50) * 1000, purchaseDate: daysAgo(ri(100, 1500)), status: pick(['在用', '闲置', '维修中', '已报废']) }),
  ),
  'admin/meeting-room': () => Array.from({ length: 8 }, () =>
    ({ id: nextId(), roomName: pick(POOL.city) + '会议室' + ri(1, 9), location: ri(1, 9) + '楼', capacity: ri(4, 30), facility: pick(['投影', '视频会议', '白板', '音响']), status: pick(['可用', '占用', '维护中']) }),
  ),
  'admin/letter': () => Array.from({ length: 12 }, () =>
    base({ title: pick(['介绍信', '公函', '调查函']), applicant: fullName(), purpose: pick(['立案', '调查取证', '查询档案']), applyDate: daysAgo(ri(1, 50)), status: pick(['待审批', '已开具', '已作废']) }),
  ),
  'admin/purchase': () => Array.from({ length: 14 }, () => {
    const amt = ri(1, 50) * 1000;
    const purpose = pick(['办公用品', '软件授权', '电子设备', '耗材']);
    const st = pick(['PENDING', 'APPROVED', 'REJECTED', 'PURCHASED']);
    return base({
      requestNo: 'PUR' + String(ri(10000000, 99999999)), title: purpose + '采购申请', purchaseType: ({ 办公用品: 'OFFICE', 软件授权: 'SOFTWARE', 电子设备: 'EQUIPMENT', 耗材: 'CONSUMABLE' })[purpose],
      itemName: purpose, supplier: companyName(), estimatedAmount: amt, amount: amt, applyDate: daysAgo(ri(1, 80)),
      status: st, statusName: ({ PENDING: '待审批', APPROVED: '已批准', REJECTED: '已驳回', PURCHASED: '已采购' })[st],
    });
  }),
  'admin/supplier': () => Array.from({ length: 10 }, () =>
    ({ id: nextId(), supplierName: companyName(), category: pick(['办公用品', 'IT服务', '印刷', '餐饮']), contactName: fullName(), contactPhone: '1' + String(ri(3000000000, 5999999999)), status: pick(['合作中', '待评估', '已终止']) }),
  ),
  'knowledge/article': () => Array.from({ length: 20 }, () => {
    const cat = pick(POOL.knowledgeCategory);
    const author = fullName();
    const status = pick(['草稿', '已发布', '已下线']);
    return base({ title: cat + '：' + pick(POOL.caseType) + '实务要点', author, authorName: author, category: cat, categoryName: cat, tags: pick(POOL.knowledgeCategory), views: ri(10, 2000), likes: ri(0, 300), publishTime: daysAgo(ri(1, 300)), status, statusName: status });
  }),
  'knowledge/law': () => Array.from({ length: 18 }, () => {
    const title = pick(['民法典', '民事诉讼法', '公司法', '刑法', '行政处罚法']) + '相关条款解读';
    const cat = pick(['法律', '司法解释', '行政法规']);
    const issuer = pick(['全国人大', '最高法院', '司法部']);
    const status = pick(['生效', '征求意见稿']);
    return base({ title, name: title, category: cat, categoryName: cat, lawTypeName: cat, source: issuer, issuer, issueDate: daysAgo(ri(100, 2000)), effectiveDate: daysAgo(ri(100, 2000)), status, statusName: status });
  }),
  'knowledge/case': () => Array.from({ length: 16 }, () =>
    base({ title: pick(POOL.caseType) + '典型案例评析', caseNo: '(' + ri(2020, 2025) + ')最高法民再' + ri(1, 999) + '号', courtName: pick(POOL.court), tags: pick(POOL.caseType), status: pick(['已发布', '草稿']) }),
  ),
  'workbench/approval': () => Array.from({ length: 22 }, () =>
    base({ title: pick(['用印申请', '报销申请', '请假申请', '采购申请', '结案申请']), type: pick(['用印', '报销', '请假', '采购', '结案']), applicant: fullName(), amount: ri(1, 50) * 1000, status: pick(['待审批', '已通过', '已驳回', '已撤销']), applyTime: dateTimeAgo(ri(0, 40)), currentNode: pick(['部门负责人', '财务', '主任', '已完成']) }),
  ),
  'workbench/report': () => Array.from({ length: 14 }, () =>
    base({ title: pick(POOL.caseType) + '阶段报告', matterName: pick(POOL.caseType) + '一案', author: fullName(), period: ri(2024, 2026) + '-' + String(ri(1, 12)).padStart(2, '0'), status: pick(['草稿', '已提交', '已审批']) }),
  ),
  'workbench/report-template': () => Array.from({ length: 8 }, () =>
    ({ id: nextId(), templateName: pick(POOL.caseType) + '报告模板', category: pick(['诉讼', '非诉', '顾问']), status: pick(['启用', '停用']) }),
  ),
  'workbench/scheduled-report': () => Array.from({ length: 6 }, () =>
    ({ id: nextId(), name: pick(['周报', '月报', '季报']) + '自动推送', cron: '0 9 * * 1', receivers: fullName(), status: pick(['启用', '停用']) }),
  ),
  'evidence': () => Array.from({ length: 20 }, () =>
    base({ evidenceNo: 'EVD' + String(ri(10000, 99999)), matterName: pick(POOL.caseType) + '一案', name: pick(['合同原件', '转账记录', '聊天记录', '鉴定意见', '现场勘验']), type: pick(['书证', '物证', '电子证据', '鉴定意见']), status: pick(['已采集', '待整理', '已归档']), collectDate: daysAgo(ri(1, 200)), holder: fullName() }),
  ),
  'ai/pricing': () => Array.from({ length: 8 }, () =>
    ({ id: nextId(), modelName: pick(['GPT-4o', 'Claude', '通义千问', '文心一言', '智谱GLM']), unit: pick(['千tokens', '次']), price: (ri(1, 100) / 10).toFixed(2), status: pick(['启用', '停用']), effectiveDate: daysAgo(ri(1, 200)) }),
  ),
  'ai/usage': () => Array.from({ length: 24 }, () =>
    ({ id: nextId(), userName: fullName(), model: pick(['GPT-4o', 'Claude', '通义千问']), tokens: ri(1000, 500000), cost: (ri(1, 500) / 10).toFixed(2), date: daysAgo(ri(1, 60)) }),
  ),
  'admin/meeting-record': () => {
    const rooms = getCol('admin/meeting-room');
    return Array.from({ length: 12 }, () =>
      base({
        recordNo: 'HY' + String(ri(10000, 99999)),
        roomId: pick(rooms).id,
        roomName: pick(rooms).roomName,
        title: pick(['周例会', '客户洽谈', '案件研讨', '尽职调查', '内部培训']),
        meetingDate: daysAgo(ri(1, 60)),
        startTime: String(ri(9, 17)).padStart(2, '0') + ':00',
        endTime: String(ri(18, 21)).padStart(2, '0') + ':00',
        organizerName: fullName(),
        status: pick(['已完成', '进行中', '已取消']),
      }),
    );
  },

  /* —— 行政：考勤 / 请假 / 加班 / 外出 / 资产盘点 / 行政合同 / 操作日志 —— */
  'admin/attendance': () => Array.from({ length: 20 }, () =>
    base({ employeeName: fullName(), deptName: pick(POOL.dept), attendanceDate: daysAgo(ri(0, 30)), checkIn: String(ri(8, 10)).padStart(2, '0') + ':' + String(ri(0, 59)).padStart(2, '0'), checkOut: String(ri(17, 20)).padStart(2, '0') + ':' + String(ri(0, 59)).padStart(2, '0'), attendanceStatus: pick(['正常', '迟到', '早退', '缺勤', '请假', '出差']), workHours: ri(6, 10) }),
  ),
  'admin/leave': () => Array.from({ length: 12 }, () =>
    base({ employeeName: fullName(), deptName: pick(POOL.dept), leaveType: pick(POOL.leaveType), startDate: daysAgo(ri(1, 40)), endDate: daysAgo(ri(0, 30)), days: ri(1, 7), reason: pick(['家中有事', '身体不适', '年休假安排', '婚假', '陪产假']), approverName: fullName(), applyTime: dateTimeAgo(ri(1, 40)), status: pick(['待审批', '已通过', '已驳回', '已撤销']) }),
  ),
  'admin/overtime': () => Array.from({ length: 12 }, () =>
    base({ employeeName: fullName(), deptName: pick(POOL.dept), overtimeDate: daysAgo(ri(0, 40)), startTime: '18:30', endTime: String(ri(20, 23)).padStart(2, '0') + ':00', hours: ri(1, 6), reason: pick(['开庭材料准备', '合同审核', '客户紧急需求', '项目交付']), status: pick(['待审批', '已通过', '已驳回']) }),
  ),
  'admin/go-out': () => Array.from({ length: 12 }, () =>
    base({ employeeName: fullName(), deptName: pick(POOL.dept), goOutDate: daysAgo(ri(0, 30)), startTime: '09:00', endTime: '17:00', destination: pick(POOL.city) + pick(['中级人民法院', '客户公司', '市场监督管理局', '不动产登记中心']), reason: pick(['开庭', '客户拜访', '调取档案', '办理立案']), status: pick(['待审批', '已通过', '已驳回']) }),
  ),
  'admin/asset-inventory': () => Array.from({ length: 10 }, () =>
    base({ inventoryNo: 'PD' + String(ri(10000, 99999)), inventoryDate: daysAgo(ri(1, 90)), inventoryName: pick(['季度资产盘点', '年度资产盘点', '专项抽查']), operatorName: fullName(), totalCount: ri(20, 200), checkedCount: ri(10, 200), diffCount: ri(0, 5), status: pick(['进行中', '已完成', '已作废']) }),
  ),
  'admin/contract': () => Array.from({ length: 12 }, () =>
    base({ contractNo: 'XZ' + String(ri(10000, 99999)), contractName: pick(['办公场地租赁', '物业服务', '设备采购', '软件服务', '车辆保险']) + '合同', partyName: companyName(), amount: ri(1, 200) * 10000, signDate: daysAgo(ri(1, 300)), endDate: daysAgo(-ri(30, 500)), operatorName: fullName(), status: pick(['履行中', '已到期', '已终止', '草稿']) }),
  ),
  'admin/operation-log': () => Array.from({ length: 30 }, () =>
    base({ operatorName: fullName(), module: pick(['系统管理', '客户管理', '项目管理', '财务管理', '人力资源', '行政管理']), operation: pick(['新增', '修改', '删除', '查询', '导出', '登录']), target: pick(['用户信息', '客户档案', '案件信息', '合同', '发票', '公告']), ip: '192.168.' + ri(1, 50) + '.' + ri(1, 254), result: pick(['成功', '成功', '成功', '失败']), costMs: ri(10, 900) }),
  ),

  /* —— 人力资源：晋升 / 发展计划 / 转正 / 离职 / 培训通知 —— */
  'hr/promotion': () => Array.from({ length: 12 }, () =>
    base({ employeeName: fullName(), deptName: pick(POOL.dept), currentLevel: pick(POOL.position), targetLevel: pick(POOL.position), applyDate: daysAgo(ri(1, 120)), reason: '工作表现突出，承办案件数量与质量均达到晋升标准。', approverName: fullName(), status: pick(['待审批', '已通过', '已驳回']) }),
  ),
  'hr/development-plan': () => Array.from({ length: 10 }, () =>
    base({ employeeName: fullName(), deptName: pick(POOL.dept), planName: pick(['年度能力提升计划', '青年律师培养计划', '专业方向深耕计划']), period: ri(2024, 2026) + '年度', goal: '提升独立办案能力与专业领域影响力。', mentorName: fullName(), progress: ri(0, 100), status: pick(['进行中', '已完成', '已延期']) }),
  ),
  'hr/regularization': () => Array.from({ length: 10 }, () =>
    base({ employeeName: fullName(), deptName: pick(POOL.dept), entryDate: daysAgo(ri(90, 400)), probationEnd: daysAgo(-ri(1, 60)), evaluatorName: fullName(), score: ri(60, 98), conclusion: pick(['同意转正', '延长试用期', '不予录用']), status: pick(['待审批', '已通过', '已驳回']) }),
  ),
  'hr/resignation': () => Array.from({ length: 10 }, () =>
    base({ employeeName: fullName(), deptName: pick(POOL.dept), resignType: pick(['个人原因', '家庭原因', '职业发展', '身体原因']), applyDate: daysAgo(ri(1, 200)), lastWorkDate: daysAgo(-ri(1, 60)), handoverName: fullName(), reason: '因个人职业规划调整提出离职申请。', status: pick(['待审批', '已通过', '已驳回']) }),
  ),
  'hr/training-notice': () => Array.from({ length: 12 }, () =>
    base({ title: pick(['民法典实务培训', '诉讼技巧研讨', '合规与风控', '青年律师训练营', '客户沟通技巧']), trainingType: pick(['内部培训', '外部培训', '线上课程']), trainerName: fullName(), startDate: daysAgo(-ri(1, 90)), location: pick(['大会议室', '培训室', '线上']), attendeeCount: ri(10, 80), status: pick(['报名中', '进行中', '已结束', '已取消']) }),
  ),

  /* —— 财务：付款变更 / 合同变更 / 预收款 —— */
  'finance/payment-amendment': () => Array.from({ length: 10 }, () =>
    base({ amendmentNo: 'BG' + String(ri(10000, 99999)), contractNo: 'HT' + String(ri(100000, 999999)), clientName: companyName(), originalAmount: ri(10, 500) * 10000, amendedAmount: ri(10, 500) * 10000, reason: pick(['服务范围调整', '周期延长', '税率变动', '双方协商']), applicantName: fullName(), applyDate: daysAgo(ri(1, 90)), status: pick(['待审批', '已通过', '已驳回']) }),
  ),
  'finance/contract-amendment': () => Array.from({ length: 10 }, () =>
    base({ amendmentNo: 'HTBG' + String(ri(10000, 99999)), contractNo: 'HT' + String(ri(100000, 999999)), clientName: companyName(), amendmentType: pick(['金额变更', '期限变更', '主体变更', '条款变更']), beforeValue: String(ri(10, 500) * 10000), afterValue: String(ri(10, 500) * 10000), reason: '因项目实际情况变化，双方协商一致变更。', applicantName: fullName(), applyDate: daysAgo(ri(1, 90)), status: pick(['待审批', '已通过', '已驳回']) }),
  ),
  'finance/prepayment': () => Array.from({ length: 12 }, () =>
    base({ prepayNo: 'YF' + String(ri(10000, 99999)), clientName: companyName(), matterName: pick(POOL.caseType) + '一案', amount: ri(1, 100) * 10000, usedAmount: ri(0, 50) * 10000, balance: ri(0, 50) * 10000, payDate: daysAgo(ri(1, 200)), ownerName: fullName(), status: pick(['待使用', '部分使用', '已用完', '已退款']) }),
  ),

  /* —— 系统 / 卷宗模板 / 知识库质量与风险 —— */
  'system/data-handover': () => Array.from({ length: 10 }, () =>
    base({ handoverNo: 'JJ' + String(ri(10000, 99999)), fromUserName: fullName(), toUserName: fullName(), handoverType: pick(['离职交接', '岗位调整', '项目交接']), matterCount: ri(1, 30), documentCount: ri(1, 100), handoverDate: daysAgo(ri(1, 120)), status: pick(['待交接', '交接中', '已完成']) }),
  ),
  'system/contract-template': () => Array.from({ length: 8 }, () =>
    base({ templateName: pick(['常年法律顾问合同', '民事诉讼委托代理合同', '刑事辩护委托协议', '非诉专项服务合同', '风险代理协议']), templateCode: 'TPL' + ri(100, 999), category: pick(['诉讼', '非诉', '顾问', '仲裁']), version: 'V' + ri(1, 5) + '.0', ownerName: fullName(), status: pick(['启用', '停用']) }),
  ),
  'system/notification': () => Array.from({ length: 12 }, () =>
    base({ title: pick(['审批待办提醒', '案件期限提醒', '合同到期提醒', '系统维护通知', '月度报表已生成']), content: '您有新的待办事项，请及时处理。', receiverName: fullName(), notifyType: pick(['系统', '邮件', '短信', '企业微信']), readFlag: bool(), sendTime: dateTimeAgo(ri(1, 30)), status: pick(['已读', '未读']) }),
  ),
  'dossier/template': () => Array.from({ length: 6 }, () =>
    base({ templateName: pick(['诉讼卷宗模板', '非诉卷宗模板', '执行案件卷宗模板', '仲裁案件卷宗模板']), category: pick(['诉讼', '非诉', '执行', '仲裁']), itemCount: ri(8, 30), ownerName: fullName(), status: pick(['启用', '停用']) }),
  ),
  'knowledge/quality-check': () => Array.from({ length: 10 }, () =>
    base({ checkNo: 'ZL' + String(ri(10000, 99999)), targetType: pick(['文书', '卷宗', '合同', '案件流程']), targetName: pick(POOL.docType), checkerName: fullName(), checkDate: daysAgo(ri(1, 60)), score: ri(60, 100), issueCount: ri(0, 5), status: pick(['进行中', '已完成', '待整改']) }),
  ),
  'knowledge/quality-issue': () => Array.from({ length: 10 }, () =>
    base({ issueNo: 'WT' + String(ri(10000, 99999)), targetType: pick(['文书', '卷宗', '合同']), targetName: pick(POOL.docType), description: pick(['格式不符合规范', '缺少必要附件', '事实表述有误', '法律依据引用不准确']), severity: pick(['一般', '较重', '严重']), reporterName: fullName(), ownerName: fullName(), status: pick(['待处理', '处理中', '已关闭']) }),
  ),
  'knowledge/risk-warning': () => Array.from({ length: 10 }, () =>
    base({ warningNo: 'FJ' + String(ri(10000, 99999)), riskType: pick(['期限风险', '合规风险', '利益冲突', '费用风险', '舆情风险']), matterName: pick(POOL.caseType) + '一案', level: pick(['低', '中', '高']), description: '系统检测到潜在风险，请关注并及时处理。', ownerName: fullName(), status: pick(['生效', '已解除', '已忽略']) }),
  ),
};


/* ---------------------------------------------------------------------------
 * 集合别名：部分前端接口走复数路径（/admin/assets、/admin/suppliers、
 * /admin/purchases、/admin/meeting-records），与种子集合的单数键共用同一份数据。
 * ------------------------------------------------------------------------- */
const ALIASES = {
  'admin/assets': 'admin/asset',
  'admin/suppliers': 'admin/supplier',
  'admin/purchases': 'admin/purchase',
  'admin/meeting-records': 'admin/meeting-record',
  'document/seal-applications': 'document/seal-application',
  'admin/asset-inventories': 'admin/asset-inventory',
  'admin/operation-logs': 'admin/operation-log',
  'finance/contract-amendments': 'finance/contract-amendment',
  'finance/payment-amendments': 'finance/payment-amendment',
  'hr/development-plans': 'hr/development-plan',
  'knowledge/quality-checks': 'knowledge/quality-check',
  'knowledge/quality-issues': 'knowledge/quality-issue',
  'knowledge/risk-warnings': 'knowledge/risk-warning',
};

/* ---------------------------------------------------------------------------
 * 懒加载集合访问层
 *
 * dbProxy 对上游代码保持"普通对象"的读写语义（db[key] / db[key] = v /
 * Object.keys(db)），但每个集合只在第一次被读取时才调用 SEED_BUILDERS 生成，
 * 未访问的集合完全不消耗时间——打开一个页面只付该页面的钱。
 *
 * 注意 getOwnPropertyDescriptor 刻意不返回值：Object.keys(db) 只用于取键名
 * 做路由前缀匹配，若在描述符里取值会把全部集合都构建出来，懒加载就失效了。
 * ------------------------------------------------------------------------- */
const _col = new Map(); // key -> array，已构建（或已从 IDB hydrate）的集合
let _keyOrder = null;   // 路由用的键名排序缓存（最长前缀优先）

function canonicalKey(key) {
  return Object.prototype.hasOwnProperty.call(ALIASES, key) ? ALIASES[key] : key;
}

/** 是否有对应 builder（用 hasOwnProperty，避免命中 constructor 等原型键） */
function hasBuilder(key) {
  return Object.prototype.hasOwnProperty.call(SEED_BUILDERS, key);
}

/** 取得集合；没有对应 builder 时返回 undefined（由调用方决定是否建空集合） */
function getCol(key) {
  const k = canonicalKey(key);
  if (_col.has(k)) return _col.get(k);
  if (!hasBuilder(k)) return undefined;
  const arr = enrichCollection(k, SEED_BUILDERS[k]());
  _col.set(k, arr);
  return arr;
}

/** 写入集合；别名写入会落到规范键，保证 /admin/assets 与 /admin/asset 同源 */
function setCol(key, value) {
  _col.set(canonicalKey(key), value);
  _keyOrder = null;
}

function allCollectionKeys() {
  return [...new Set([...Object.keys(SEED_BUILDERS), ...Object.keys(ALIASES), ..._col.keys()])];
}

function knownKeys() {
  if (!_keyOrder) _keyOrder = allCollectionKeys().sort((a, b) => b.length - a.length);
  return _keyOrder;
}

const dbProxy = new Proxy(
  {},
  {
    get(_t, key) {
      if (typeof key !== 'string') return undefined;
      return getCol(key);
    },
    set(_t, key, value) {
      if (typeof key === 'string') setCol(key, value);
      return true;
    },
    has(_t, key) {
      if (typeof key !== 'string') return false;
      return hasBuilder(key) || Object.prototype.hasOwnProperty.call(ALIASES, key) || _col.has(canonicalKey(key));
    },
    ownKeys() {
      return allCollectionKeys();
    },
    getOwnPropertyDescriptor(_t, key) {
      if (typeof key !== 'string') return undefined;
      if (!(hasBuilder(key) || Object.prototype.hasOwnProperty.call(ALIASES, key) || _col.has(canonicalKey(key)))) return undefined;
      return { value: undefined, enumerable: true, configurable: true, writable: true };
    },
    deleteProperty(_t, key) {
      if (typeof key === 'string') {
        _col.delete(canonicalKey(key));
        _keyOrder = null;
      }
      return true;
    },
  },
);

/* ---------------------------------------------------------------------------
 * IndexedDB 持久化（让演示数据的增删改在刷新后保留，并支持一键重置）
 *
 * v2 起按集合分键存储：每个集合一条 `col:<name>` 记录，只写入"本次会话真正
 * 构建过"的集合。这样首次访问只 hydrate 少量集合，不会把整库读进内存；
 * v1 的单 blob `db` 键在 upgrade 时删除（旧格式一次写全量，且种子结构已调整）。
 * ------------------------------------------------------------------------- */
const IDB_NAME = 'lawfirm-demo';
const IDB_VERSION = 2;
const IDB_STORE = 'kv';
const IDB_PREFIX = 'col:';
const IDB_META = 'meta:seed-version';
let _dbPromise = null;
function openIDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (ev) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      // 迁移 v1：丢弃旧的单 blob 全量数据，改为按集合懒载入
      if (ev.oldVersion < 2) {
        try {
          db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).delete('db');
        } catch {
          /* 忽略：最坏情况是多留一条无人读取的旧键 */
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      _dbPromise = null; // 失败不缓存，允许后续请求重试
      reject(req.error);
    };
    req.onblocked = () => {
      _dbPromise = null;
      reject(new Error('indexedDB blocked'));
    };
  });
  return _dbPromise;
}

/** 读取/写入单个键（用于元数据） */
async function idbGet(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, value) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** 读出所有已持久化的集合，返回 Map<key, array> */
async function idbReadCollections() {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const out = new Map();
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return;
      if (typeof cur.key === 'string' && cur.key.startsWith(IDB_PREFIX)) {
        out.set(cur.key.slice(IDB_PREFIX.length), cur.value);
      }
      cur.continue();
    };
    tx.oncomplete = () => resolve(out);
    tx.onerror = () => reject(tx.error);
    req.onerror = () => reject(req.error);
  });
}

/** 批量写入集合（key -> array） */
async function idbWriteCollections(map) {
  if (!map.size) return;
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    for (const [k, v] of map) store.put(v, IDB_PREFIX + k);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** 清空所有已持久化的集合 */
async function idbClearCollections() {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const req = tx.objectStore(IDB_STORE).openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return;
      if (typeof cur.key === 'string' && cur.key.startsWith(IDB_PREFIX)) cur.delete();
      cur.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    req.onerror = () => reject(req.error);
  });
}

let _hydrated = false;
/**
 * 返回懒加载数据库代理。首次调用时把 IDB 里已持久化的集合 hydrate 进内存，
 * 其余集合保持"未构建"，等被访问时再生成。IDB 不可用（隐私模式等）时降级为
 * 纯内存模式：增删改仍然生效，只是刷新后回到种子数据。
 */
async function getDB() {
  if (_hydrated) return dbProxy;
  try {
    // 种子版本变化时（升级了 mock 数据）丢弃旧持久化，否则老数据会盖住新种子
    const seedVersion = await idbGet(IDB_META);
    if (seedVersion !== SW_VERSION) {
      await idbClearCollections();
      await idbSet(IDB_META, SW_VERSION);
    } else {
      const stored = await idbReadCollections();
      for (const [k, v] of stored) if (Array.isArray(v)) _col.set(k, v);
    }
  } catch {
    /* IDB 不可用：纯内存降级 */
  }
  _hydrated = true;
  return dbProxy;
}

/** 把本次会话构建过的集合写回 IDB（未访问过的集合不产生任何 IO） */
async function saveDB() {
  if (!_col.size) return;
  try {
    await idbWriteCollections(_col);
  } catch {
    /* 写入失败不影响内存中的数据，页面继续可用 */
  }
}

/** 一键重置：丢弃内存与 IDB 中的全部集合，下次访问按种子重新生成 */
async function resetDB() {
  _col.clear();
  _keyOrder = null;
  _hydrated = true;
  try {
    await idbClearCollections();
    await idbSet(IDB_META, SW_VERSION);
  } catch {
    /* 忽略 */
  }
  return dbProxy;
}

/* ---------------------------------------------------------------------------
 * 通用集合路由解析
 * 支持：/x/list、/x、/x/:id、/x/:id/action、/x/sub、/x/sub/list、/x/batch
 * ------------------------------------------------------------------------- */
function findCollection(pathSegs) {
  const keys = knownKeys();
  // 从最长前缀匹配
  for (const key of keys) {
    const ksegs = key.split('/');
    if (ksegs.length <= pathSegs.length) {
      let ok = true;
      for (let i = 0; i < ksegs.length; i++) {
        if (ksegs[i] !== pathSegs[i]) {
          ok = false;
          break;
        }
      }
      if (ok) return { key, rest: pathSegs.slice(ksegs.length) };
    }
  }
  return null;
}
const LIST_SUFFIX = ['list', 'page', 'listPage', 'query'];
function resolve(path) {
  const segs = path.split('/').filter(Boolean);
  const found = findCollection(segs);
  if (!found) {
    // 未知集合：以"去掉末尾 list 后缀"的路径作为集合名；其余视为集合根
    let coll = segs.join('/');
    let rest = [];
    if (LIST_SUFFIX.includes(segs[segs.length - 1])) {
      coll = segs.slice(0, -1).join('/');
      rest = ['list'];
    }
    if (!getCol(coll)) setCol(coll, []);
    return { key: coll, rest };
  }
  return { key: found.key, rest: found.rest };
}

function paginate(arr, params) {
  const page = Number(params.get('page') || params.get('pageNum') || 1);
  const pageSize = Number(params.get('pageSize') || params.get('size') || 20);
  const keyword = (params.get('keyword') || params.get('name') || params.get('clientName') || '').trim();
  let list = arr;
  if (keyword) {
    list = arr.filter((it) =>
      Object.values(it || {}).some((v) => v != null && String(v).toLowerCase().includes(keyword.toLowerCase())),
    );
  }
  const total = list.length;
  const start = (page - 1) * pageSize;
  const slice = list.slice(start, start + pageSize);
  // 兼容前端多种分页字段名：items / list / records / rows
  return { items: slice, list: slice, records: slice, rows: slice, total, page, pageSize };
}

async function handleCollection(method, apiPath, params, body, db) {
  const { key, rest } = resolve(apiPath);
  if (!db[key]) db[key] = [];
  const coll = db[key];

  // /x/list 或 /x/page
  if (rest.length === 1 && LIST_SUFFIX.includes(rest[0])) {
    return paginate(coll, params);
  }
  // /x/select-options / tree / options
  if (rest.length === 1 && ['select-options', 'tree', 'options'].includes(rest[0])) {
    return paginate(coll, params);
  }
  // /x/batch (DELETE) 批量删除
  if (rest.length === 1 && rest[0] === 'batch') {
    if (method === 'DELETE') {
      const ids = (body && body.ids) || [];
      db[key] = coll.filter((it) => !ids.includes(it.id));
      await saveDB();
      return null;
    }
    return null;
  }
  // /x/:id 或 /x/:id/action
  if (rest.length >= 1 && /^\d+$/.test(rest[0])) {
    const id = Number(rest[0]);
    if (rest.length === 1) {
      if (method === 'GET') {
        return coll.find((it) => it.id === id) || null;
      }
      if (method === 'PUT' || method === 'POST') {
        const idx = coll.findIndex((it) => it.id === id);
        const updated = { ...(coll[idx] || {}), ...(body || {}), id };
        if (idx >= 0) coll[idx] = updated;
        else coll.push(updated);
        await saveDB();
        return updated;
      }
      if (method === 'DELETE') {
        db[key] = coll.filter((it) => it.id !== id);
        await saveDB();
        return null;
      }
    }
    // /x/:id/action —— 返回成功即可（演示中不深究副作用）
    return { success: true };
  }
  // /x (POST 新增) 或 (GET 无后缀视为列表) 或 (PUT 全量更新)
  if (rest.length === 0) {
    if (method === 'GET') return paginate(coll, params);
    if (method === 'POST') {
      const created = { ...(body || {}), id: nextId() };
      coll.unshift(created);
      await saveDB();
      return created;
    }
    if (method === 'PUT') {
      if (body && body.id != null) {
        const idx = coll.findIndex((it) => it.id === body.id);
        if (idx >= 0) coll[idx] = { ...coll[idx], ...body };
        else coll.push(body);
        await saveDB();
        return coll[idx] || body;
      }
      return null;
    }
    if (method === 'DELETE') {
      db[key] = [];
      await saveDB();
      return null;
    }
  }
  // 兜底
  return paginate(coll, params);
}

/* ---------------------------------------------------------------------------
 * 特殊接口
 * ------------------------------------------------------------------------- */
function jsonEnvelope(data, success = true, message = 'ok') {
  return new Response(
    JSON.stringify({ success, code: success ? '200' : '500', message, data, timestamp: Date.now() }),
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}
function jsonBlob(text, filename) {
  return new Response(new Blob([text], { type: 'text/plain;charset=utf-8' }), {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename || 'export.txt'}"` },
  });
}

/* ---------------------------------------------------------------------------
 * 生产实测形状对齐
 *
 * 后端对「树 / 字典 / 分类 / 下拉选项 / 我的…」这类端点返回的是**裸数组**，
 * 前端拿到后直接 forEach / map / filter / slice。Mock 早期一律包了分页壳
 * {items,list,...}，于是这些页面报 "xxx is not a function" 而白屏。
 * 下面这些常量与端点按生产真实形状返回，集合型端点仍走分页。
 * ------------------------------------------------------------------------- */
const DICT_TYPES = [
  { id: 1, name: "性别", code: "gender", description: "用户性别", status: "ENABLED", isSystem: true },
  { id: 2, name: "学历", code: "education", description: "员工学历", status: "ENABLED", isSystem: true },
  { id: 3, name: "证件类型", code: "id_type", description: "身份证件类型", status: "ENABLED", isSystem: true },
  { id: 4, name: "紧急程度", code: "priority", description: "任务紧急程度", status: "ENABLED", isSystem: true },
  { id: 5, name: "行业分类", code: "industry", description: "客户所属行业", status: "ENABLED", isSystem: false },
  { id: 6, name: "用户状态", code: "user_status", description: "系统用户状态", status: "ENABLED", isSystem: true },
  { id: 7, name: "设备类型", code: "device_type", description: "登录设备类型", status: "ENABLED", isSystem: true },
  { id: 8, name: "通知类型", code: "notification_type", description: "系统通知类型", status: "ENABLED", isSystem: true },
  { id: 9, name: "菜单类型", code: "menu_type", description: "系统菜单类型", status: "ENABLED", isSystem: true },
  { id: 10, name: "备份类型", code: "backup_type", description: "系统备份类型", status: "ENABLED", isSystem: true },
  { id: 11, name: "备份状态", code: "backup_status", description: "备份执行状态", status: "ENABLED", isSystem: true },
  { id: 12, name: "数据交接类型", code: "handover_type", description: "数据交接类型", status: "ENABLED", isSystem: true },
  { id: 13, name: "外部集成类型", code: "integration_type", description: "外部系统集成类型", status: "ENABLED", isSystem: true },
  { id: 14, name: "认证方式", code: "auth_type", description: "外部系统认证方式", status: "ENABLED", isSystem: true },
  { id: 15, name: "薪酬模式", code: "compensation_type", description: "律师薪酬模式", status: "ENABLED", isSystem: true },
  { id: 16, name: "案件类型", code: "matter_type", description: "法律案件类型分类", status: "ENABLED", isSystem: true },
  { id: 17, name: "案件状态", code: "matter_status", description: "案件进展状态", status: "ENABLED", isSystem: true },
  { id: 18, name: "客户类型", code: "client_type", description: "客户类型分类", status: "ENABLED", isSystem: true },
  { id: 19, name: "客户来源", code: "client_source", description: "客户获取渠道", status: "ENABLED", isSystem: true },
  { id: 20, name: "收费方式", code: "fee_type", description: "律师费收费方式", status: "ENABLED", isSystem: true },
  { id: 21, name: "合同类型", code: "contract_type", description: "财务合同类型", status: "ENABLED", isSystem: true },
  { id: 22, name: "合同状态", code: "contract_status", description: "财务合同状态", status: "ENABLED", isSystem: true },
  { id: 23, name: "发票类型", code: "invoice_type", description: "发票类型分类", status: "ENABLED", isSystem: true },
  { id: 24, name: "支付方式", code: "payment_method", description: "客户支付方式", status: "ENABLED", isSystem: true },
  { id: 25, name: "提成状态", code: "commission_status", description: "提成发放状态", status: "ENABLED", isSystem: true },
  { id: 26, name: "利冲审查状态", code: "conflict_check_status", description: "利益冲突审查状态", status: "ENABLED", isSystem: true },
  { id: 27, name: "合同变更类型", code: "amendment_type", description: "合同变更类型", status: "ENABLED", isSystem: true },
  { id: 28, name: "员工状态", code: "work_status", description: "员工工作状态", status: "ENABLED", isSystem: true },
  { id: 29, name: "劳动合同类型", code: "hr_contract_type", description: "员工劳动合同类型", status: "ENABLED", isSystem: true },
  { id: 30, name: "职称", code: "title", description: "律师职称", status: "ENABLED", isSystem: true },
  { id: 31, name: "考勤状态", code: "attendance_status", description: "员工考勤状态", status: "ENABLED", isSystem: true },
  { id: 32, name: "离职类型", code: "resignation_type", description: "员工离职类型", status: "ENABLED", isSystem: true },
  { id: 33, name: "培训类型", code: "training_type", description: "员工培训类型", status: "ENABLED", isSystem: true },
  { id: 34, name: "培训分类", code: "training_category", description: "培训内容分类", status: "ENABLED", isSystem: true },
  { id: 35, name: "文档状态", code: "doc_status", description: "文档状态", status: "ENABLED", isSystem: true },
  { id: 36, name: "文件分类", code: "file_category", description: "文档文件分类", status: "ENABLED", isSystem: true },
  { id: 37, name: "文档模板类型", code: "template_type", description: "文档模板类型", status: "ENABLED", isSystem: true },
  { id: 38, name: "工作类型", code: "work_type", description: "工时记录工作类型", status: "ENABLED", isSystem: true },
  { id: 39, name: "工时状态", code: "timesheet_status", description: "工时记录状态", status: "ENABLED", isSystem: true },
  { id: 40, name: "资产类别", code: "asset_category", description: "行政资产类别", status: "ENABLED", isSystem: true },
  { id: 41, name: "资产状态", code: "asset_status", description: "资产使用状态", status: "ENABLED", isSystem: true },
  { id: 42, name: "印章类型", code: "seal_type", description: "印章类型", status: "ENABLED", isSystem: true },
  { id: 43, name: "印章状态", code: "seal_status", description: "印章状态", status: "ENABLED", isSystem: true },
  { id: 44, name: "函件类型", code: "letter_type", description: "出函类型", status: "ENABLED", isSystem: true },
  { id: 45, name: "会议室状态", code: "meeting_room_status", description: "会议室状态", status: "ENABLED", isSystem: true },
  { id: 46, name: "知识文章状态", code: "article_status", description: "知识库文章状态", status: "ENABLED", isSystem: true },
  { id: 47, name: "法规状态", code: "law_status", description: "法律法规状态", status: "ENABLED", isSystem: true },
  { id: 48, name: "审批状态", code: "approval_status", description: "通用审批状态", status: "ENABLED", isSystem: true },
  { id: 49, name: "归档状态", code: "archive_status", description: "案件归档状态", status: "ENABLED", isSystem: true },
  { id: 50, name: "启用状态", code: "enable_status", description: "通用启用禁用状态", status: "ENABLED", isSystem: true },
  { id: 51, name: "民事案件代理阶段", code: "litigation_stage_civil", description: "民事案件的诉讼代理阶段", status: "ENABLED", isSystem: true },
  { id: 52, name: "刑事案件代理阶段", code: "litigation_stage_criminal", description: "刑事案件的诉讼代理阶段", status: "ENABLED", isSystem: true },
  { id: 53, name: "行政案件代理阶段", code: "litigation_stage_administrative", description: "行政案件的诉讼代理阶段", status: "ENABLED", isSystem: true },
  { id: 54, name: "劳动仲裁代理阶段", code: "litigation_stage_labor_arbitration", description: "劳动仲裁的代理阶段", status: "ENABLED", isSystem: true },
  { id: 55, name: "商事仲裁代理阶段", code: "litigation_stage_commercial_arbitration", description: "商事仲裁的代理阶段", status: "ENABLED", isSystem: true },
  { id: 56, name: "执行案件代理阶段", code: "litigation_stage_enforcement", description: "执行案件的代理阶段", status: "ENABLED", isSystem: true },
  { id: 57, name: "非诉项目服务阶段", code: "litigation_stage_default", description: "非诉项目的服务阶段", status: "ENABLED", isSystem: true },
  { id: 58, name: "行政国家赔偿代理阶段", code: "litigation_stage_state_comp_admin", description: "行政国家赔偿案件的代理阶段", status: "ENABLED", isSystem: true },
  { id: 59, name: "刑事国家赔偿代理阶段", code: "litigation_stage_state_comp_criminal", description: "刑事国家赔偿案件的代理阶段", status: "ENABLED", isSystem: true },
  { id: 60, name: "赔偿义务机关类型", code: "obligor_org_type", description: "国家赔偿案件中的赔偿义务机关类型", status: "ENABLED", isSystem: true },
  { id: 61, name: "致损行为类型", code: "damage_cause_type", description: "国家赔偿案件中的致损行为类型", status: "ENABLED", isSystem: true },
  { id: 62, name: "赔偿决定结果", code: "compensation_decision_result", description: "国家赔偿案件的决定结果类型", status: "ENABLED", isSystem: true },
  { id: 63, name: "赔偿支付状态", code: "compensation_payment_status", description: "国家赔偿金的支付状态", status: "ENABLED", isSystem: true },
  { id: 64, name: "AI请求类型", code: "ai_request_type", description: "AI调用的请求类型分类", status: "ENABLED", isSystem: true },
  { id: 65, name: "AI业务类型", code: "ai_business_type", description: "AI调用的业务类型分类", status: "ENABLED", isSystem: true },
  { id: 66, name: "AI扣减状态", code: "ai_deduction_status", description: "AI费用账单扣减状态", status: "ENABLED", isSystem: true },
  { id: 67, name: "AI集成编码", code: "ai_integration_code", description: "AI模型集成供应商编码", status: "ENABLED", isSystem: true },
  { id: 68, name: "AI计费模式", code: "ai_pricing_mode", description: "AI模型计费模式", status: "ENABLED", isSystem: true }
];

/* 法规/案例分类树（形状对齐生产 knowledge_*_categories） */
const LAW_CATEGORIES = [
  { id: 100, name: '法律法规', parentId: 0, level: 1, sortOrder: 1, description: '法律法规汇编', children: [
    { id: 101, name: '民商事法规', parentId: 100, level: 2, sortOrder: 1, description: '民商事相关法律法规', children: [] },
    { id: 102, name: '刑事法规', parentId: 100, level: 2, sortOrder: 2, description: '刑事相关法律法规', children: [] },
    { id: 103, name: '行政法规', parentId: 100, level: 2, sortOrder: 3, description: '行政相关法律法规', children: [] },
    { id: 104, name: '诉讼与非诉讼程序法', parentId: 100, level: 2, sortOrder: 4, description: '程序性法律法规', children: [] },
  ] },
  { id: 200, name: '司法解释', parentId: 0, level: 1, sortOrder: 2, description: '最高法、最高检司法解释', children: [
    { id: 201, name: '综合类司法解释', parentId: 200, level: 2, sortOrder: 1, description: '综合性司法解释', children: [] },
    { id: 202, name: '民事类司法解释', parentId: 200, level: 2, sortOrder: 2, description: '民事司法解释', children: [] },
    { id: 203, name: '刑事类司法解释', parentId: 200, level: 2, sortOrder: 3, description: '刑事司法解释', children: [] },
  ] },
  { id: 300, name: '部门规章与地方性法规', parentId: 0, level: 1, sortOrder: 3, description: '部委规章、地方法规', children: [
    { id: 301, name: '部门规章', parentId: 300, level: 2, sortOrder: 1, description: '国务院各部委规章', children: [] },
    { id: 302, name: '地方性法规', parentId: 300, level: 2, sortOrder: 2, description: '各省市区地方性法规', children: [] },
  ] },
];
const CASE_CATEGORIES = [
  { id: 1, name: '民事案例', parentId: 0, level: 1, sortOrder: 1, children: [
    { id: 11, name: '合同纠纷', parentId: 1, level: 2, sortOrder: 1, children: [] },
    { id: 12, name: '侵权责任纠纷', parentId: 1, level: 2, sortOrder: 2, children: [] },
    { id: 13, name: '婚姻家庭继承', parentId: 1, level: 2, sortOrder: 3, children: [] },
    { id: 14, name: '物权纠纷', parentId: 1, level: 2, sortOrder: 4, children: [] },
  ] },
  { id: 2, name: '刑事案例', parentId: 0, level: 1, sortOrder: 2, children: [
    { id: 21, name: '侵犯财产罪', parentId: 2, level: 2, sortOrder: 1, children: [] },
    { id: 22, name: '破坏市场经济秩序罪', parentId: 2, level: 2, sortOrder: 2, children: [] },
    { id: 23, name: '职务犯罪', parentId: 2, level: 2, sortOrder: 3, children: [] },
  ] },
  { id: 3, name: '行政案例', parentId: 0, level: 1, sortOrder: 3, children: [
    { id: 31, name: '行政处罚', parentId: 3, level: 2, sortOrder: 1, children: [] },
    { id: 32, name: '行政许可', parentId: 3, level: 2, sortOrder: 2, children: [] },
    { id: 33, name: '行政强制', parentId: 3, level: 2, sortOrder: 3, children: [] },
  ] },
  { id: 4, name: '执行与仲裁', parentId: 0, level: 1, sortOrder: 4, children: [
    { id: 41, name: '执行异议', parentId: 4, level: 2, sortOrder: 1, children: [] },
    { id: 42, name: '商事仲裁', parentId: 4, level: 2, sortOrder: 2, children: [] },
  ] },
  { id: 5, name: '非诉项目', parentId: 0, level: 1, sortOrder: 5, children: [
    { id: 51, name: '尽职调查', parentId: 5, level: 2, sortOrder: 1, children: [] },
    { id: 52, name: '并购重组', parentId: 5, level: 2, sortOrder: 2, children: [] },
  ] },
];

/* 案由树（民事/刑事/行政）：[分类码, 分类名, [[案由码, 案由名], ...]]，
 * 取自生产库 sys_cause 真实分类，压缩存储、按需展开。 */
const CAUSE_TREE_RAW = {
  civil: [["P1","人格权纠纷",[["1","生命权、身体权、健康权纠纷"],["2","姓名权纠纷"],["3","名称权纠纷"],["4","肖像权纠纷"],["5","声音保护纠纷"],["6","名誉权纠纷"]]],["P2","婚姻家庭纠纷",[["12","婚约财产纠纷"],["13","婚内夫妻财产分割纠纷"],["14","离婚纠纷"],["15","离婚后财产纠纷"],["16","离婚后损害责任纠纷"],["17","婚姻无效纠纷"]]],["P3","继承纠纷",[["29","法定继承纠纷"],["30","遗嘱继承纠纷"],["31","被继承人债务清偿纠纷"],["32","遗赠纠纷"],["33","遗赠扶养协议纠纷"],["34","非遗产继承人分配遗产纠纷"]]],["P4","物权纠纷",[["36","异议登记不当损害责任纠纷"],["37","虚假登记损害责任纠纷"],["38","物权确认纠纷"],["39","返还原物纠纷"],["40","排除妨害纠纷"],["41","消除危险纠纷"]]],["P10","合同纠纷",[["78","缔约过失责任纠纷"],["79","预约合同纠纷"],["80","确认合同效力纠纷"],["81","债权人代位权纠纷"],["82","债权人撤销权纠纷"],["83","债权转让合同纠纷"]]],["P11","不当得利纠纷",[["148","不当得利纠纷"]]],["P12","无因管理纠纷",[["149","无因管理纠纷"]]],["P13","知识产权与竞争纠纷",[["150","著作权合同纠纷"],["151","商标合同纠纷"],["152","发明专利合同纠纷"],["153","实用新型专利合同纠纷"],["154","外观设计专利合同纠纷"],["155","植物新品种合同纠纷"]]],["P17","数据、网络虚拟财产纠纷",[["199","数据权属纠纷"],["200","数据合同纠纷"],["201","侵害数据权益纠纷"]]],["P19","劳动争议",[["205","劳动合同纠纷"],["206","社会保险纠纷"],["207","福利待遇纠纷"],["208","超龄劳动者用工纠纷"],["209","承包人、被挂靠人用工主体责任纠纷"]]],["P20","人事争议",[["210","聘用合同纠纷"],["211","聘任合同纠纷"],["212","辞职纠纷"],["213","辞退纠纷"]]],["P21","新就业形态用工纠纷",[["214","新就业形态用工合同纠纷"],["215","新就业形态社会保险纠纷"],["216","新就业形态职业伤害保障纠纷"]]],["P22","海事海商纠纷",[["217","船舶碰撞损害责任纠纷"],["218","船舶触碰损害责任纠纷"],["219","船舶损坏空中设施、水下设施损害责任纠纷"],["220","船舶污染损害责任纠纷"],["221","海上、通海水域污染损害责任纠纷"],["222","海上、通海水域养殖损害责任纠纷"]]],["P23","与企业有关的纠纷",[["276","企业出资人权益确认纠纷"],["277","侵害企业出资人权益纠纷"],["278","企业公司制改造合同纠纷"],["279","企业股份合作制改造合同纠纷"],["280","企业债权转股权合同纠纷"],["281","企业分立合同纠纷"]]],["P24","与公司有关的纠纷",[["290","股东资格确认纠纷"],["291","股东名册记载纠纷"],["292","请求变更公司登记纠纷"],["293","股东出资纠纷"],["294","股东失权纠纷"],["295","新增资本认购纠纷"]]],["P25","合伙企业纠纷",[["318","入伙纠纷"],["319","退伙纠纷"],["320","合伙企业财产份额转让纠纷"]]],["P26","与农民专业合作社有关的纠纷",[["321","农民专业合作社成员资格确认纠纷"],["322","农民专业合作社成员出资纠纷"],["323","农民专业合作社合并纠纷"],["324","农民专业合作社分立纠纷"],["325","农民专业合作社解散纠纷"],["326","农民专业合作社清算纠纷"]]],["P27","与破产有关的纠纷",[["327","请求撤销个别清偿行为纠纷"],["328","请求确认债务人行为无效纠纷"],["329","对外追收债权纠纷"],["330","追收未缴出资纠纷"],["331","追收抽逃出资纠纷"],["332","追收非正常收入纠纷"]]],["P28","证券纠纷",[["340","证券权利确认纠纷"],["341","证券交易合同纠纷"],["342","金融衍生品种交易纠纷"],["343","证券承销合同纠纷"],["344","证券投资咨询纠纷"],["345","证券资信评级服务合同纠纷"]]],["P29","期货交易纠纷",[["357","期货经纪合同纠纷"],["358","期货透支交易纠纷"],["359","期货强行平仓纠纷"],["360","期货实物交割纠纷"],["361","期货保证合约纠纷"],["362","期货交易代理合同纠纷"]]],["P30","信托纠纷",[["368","民事信托纠纷"],["369","营业信托纠纷"],["370","公益信托纠纷"]]],["P31","保险纠纷",[["371","财产保险合同纠纷"],["372","人身保险合同纠纷"],["373","再保险合同纠纷"],["374","保险经纪合同纠纷"],["375","保险代理合同纠纷"],["376","进出口信用保险合同纠纷"]]],["P32","票据纠纷",[["378","票据付款请求权纠纷"],["379","票据追索权纠纷"],["380","票据交付请求权纠纷"],["381","票据返还请求权纠纷"],["382","票据损害责任纠纷"],["383","票据利益返还请求权纠纷"]]],["P33","信用证纠纷",[["389","委托开立信用证纠纷"],["390","信用证开证纠纷"],["391","信用证议付纠纷"],["392","信用证欺诈纠纷"],["393","信用证融资纠纷"],["394","信用证转让纠纷"]]],["P34","独立保函纠纷",[["395","独立保函开立纠纷"],["396","独立保函付款纠纷"],["397","独立保函追偿纠纷"],["398","独立保函欺诈纠纷"],["399","独立保函转让纠纷"],["400","独立保函通知纠纷"]]],["P35","侵权责任纠纷",[["402","监护人责任纠纷"],["403","用人单位责任纠纷"],["404","劳务派遣工作人员侵权责任纠纷"],["405","提供劳务者致害责任纠纷"],["406","提供劳务者受害责任纠纷"],["407","违反安全保障义务责任纠纷"]]],["P36","非讼程序案件",[["435","申请确定选民资格"],["436","申请宣告自然人失踪"],["437","申请撤销宣告失踪判决"],["438","申请为失踪人财产指定、变更代管人"],["439","申请宣告自然人死亡"],["440","申请撤销宣告自然人死亡判决"]]],["P56","特殊诉讼程序案件",[["500","失踪人债务支付纠纷"],["501","被撤销死亡宣告人请求返还财产纠纷"],["502","生态环境保护民事公益诉讼"],["503","文物和文化遗产保护民事公益诉讼"],["504","安全生产民事公益诉讼"],["505","英雄烈士保护民事公益诉讼"]]]],
  criminal: [["C1","危害国家安全罪",[["C101","背叛国家罪"],["C102","分裂国家罪"],["C103","煽动分裂国家罪"],["C104","武装叛乱、暴乱罪"],["C105","颠覆国家政权罪"],["C106","煽动颠覆国家政权罪"]]],["C2","危害公共安全罪",[["C201","放火罪"],["C202","决水罪"],["C203","爆炸罪"],["C204","投放危险物质罪"],["C205","以危险方法危害公共安全罪"],["C206","失火罪"]]],["C3","破坏社会主义市场经济秩序罪",[["C301","生产、销售伪劣产品罪"],["C302","生产、销售、提供假药罪"],["C303","生产、销售、提供劣药罪"],["C304","妨害药品管理罪"],["C305","生产、销售不符合安全标准的食品罪"],["C306","生产、销售有毒、有害食品罪"]]],["C4","侵犯公民人身权利、民主权利罪",[["C411","故意杀人罪"],["C412","过失致人死亡罪"],["C413","故意伤害罪"],["C414","组织出卖人体器官罪"],["C415","过失致人重伤罪"],["C416","强奸罪"]]],["C5","侵犯财产罪",[["C454","抢劫罪"],["C455","盗窃罪"],["C456","诈骗罪"],["C457","抢夺罪"],["C458","聚众哄抢罪"],["C459","侵占罪"]]],["C6","妨害社会管理秩序罪",[["C467","妨害公务罪"],["C468","袭警罪"],["C469","煽动暴力抗拒法律实施罪"],["C470","招摇撞骗罪"],["C471","伪造、变造、买卖国家机关公文、证件、印章罪"],["C472","盗窃、抢夺、毁灭国家机关公文、证件、印章罪"]]],["C7","危害国防利益罪",[["C613","阻碍军人执行职务罪"],["C614","阻碍军事行动罪"],["C615","破坏武器装备、军事设施、军事通信罪"],["C616","过失损坏武器装备、军事设施、军事通信罪"],["C617","故意提供不合格武器装备、军事设施罪"],["C618","过失提供不合格武器装备、军事设施罪"]]],["C8","贪污贿赂罪",[["C636","贪污罪"],["C637","挪用公款罪"],["C638","受贿罪"],["C639","单位受贿罪"],["C640","利用影响力受贿罪"],["C641","行贿罪"]]],["C9","渎职罪",[["C650","滥用职权罪"],["C651","玩忽职守罪"],["C652","故意泄露国家秘密罪"],["C653","过失泄露国家秘密罪"],["C654","徇私枉法罪"],["C655","民事、行政枉法裁判罪"]]],["C10","军人违反职责罪",[["C687","战时违抗命令罪"],["C688","隐瞒、谎报军情罪"],["C689","拒传、假传军令罪"],["C690","投降罪"],["C691","战时临阵脱逃罪"],["C692","擅离、玩忽军事职守罪"]]]],
  admin: [["A1","行政处罚",[["A1","行政处罚"]]],["A2","行政强制措施",[["A2","行政强制措施"]]],["A3","行政强制执行",[["A3","行政强制执行"]]],["A4","行政许可",[["A4","行政许可"]]],["A5","行政征收或者征用",[["A5","行政征收或者征用"]]],["A6","行政登记",[["A6","行政登记"]]],["A7","行政确认",[["A7","行政确认"]]],["A8","行政给付",[["A8","行政给付"]]],["A9","行政允诺",[["A9","行政允诺"]]],["A10","行政征缴",[["A10","行政征缴"]]],["A11","行政奖励",[["A11","行政奖励"]]],["A12","行政收费",[["A12","行政收费"]]],["A13","政府信息公开",[["A13","政府信息公开"]]],["A14","行政批复",[["A14","行政批复"]]],["A15","行政处理",[["A15","行政处理"]]],["A16","行政复议",[["A16","行政复议"]]],["A17","行政裁决",[["A17","行政裁决"]]],["A18","行政协议",[["A18","行政协议"]]],["A19","行政补偿",[["A19","行政补偿"]]],["A20","行政赔偿",[["A20","行政赔偿"]]],["A21","不履行法定职责",[["A21","不履行法定职责"]]],["A22","行政公益诉讼",[["A22","行政公益诉讼"]]]],
};
let _causeTreeCache = {};
function buildCauseTree(kind) {
  if (_causeTreeCache[kind]) return _causeTreeCache[kind];
  const raw = CAUSE_TREE_RAW[kind] || [];
  let cid = 1;
  const tree = raw.map(([code, name, kids]) => ({
    code, name, level: 0, categoryCode: code, categoryName: name, isLeaf: !(kids && kids.length),
    children: (kids || []).map(([cc, cn]) => ({
      id: cid++, code: cc, name: cn, level: 1, categoryCode: code, categoryName: name,
      isActive: true, isLeaf: true, children: [],
    })),
  }));
  _causeTreeCache[kind] = tree;
  return tree;
}

/* 部门树：由扁平部门集合按 parentId 组装，形状对齐生产 /system/department/tree */
function buildDeptTree() {
  const flat = getCol('system/department') || [];
  const byId = new Map();
  const nodes = flat.map((d, i) => {
    const parentId = i < 3 ? 0 : (flat[i % 3] ? flat[i % 3].id : 0);
    const name = d.deptName || d.name || '部门' + (i + 1);
    const node = { ...d, id: d.id, name, deptName: name, parentId, sortOrder: i + 1, leaderName: d.leader || '', memberCount: d.memberCount || 0, status: d.status || 'ENABLED', children: [] };
    byId.set(node.id, node);
    return node;
  });
  const roots = [];
  nodes.forEach((n) => {
    const p = byId.get(n.parentId);
    if (p && p !== n) p.children.push(n);
    else roots.push(n);
  });
  return roots;
}

/* 菜单树（管理端「菜单管理」用，含按钮级节点，形状对齐生产 /system/menu/tree） */
function buildMenuTree() {
  const byParent = {};
  Object.keys(MENU_NODES).forEach((id) => {
    const nd = MENU_NODES[id];
    (byParent[nd.p] = byParent[nd.p] || []).push(id);
  });
  Object.keys(byParent).forEach((k) => byParent[k].sort((a, b) => (MENU_NODES[a].s - MENU_NODES[b].s) || (Number(a) - Number(b))));
  function toDTO(id) {
    const nd = MENU_NODES[id];
    return {
      id: Number(id), parentId: nd.p, name: nd.n, path: nd.path || '', component: nd.c || 'LAYOUT',
      icon: nd.i || '', menuType: nd.t, menuTypeName: MENU_TYPE_NAME[nd.t] || nd.t,
      permission: nd.perm || null, sortOrder: nd.s, visible: nd.v !== 0, status: 'ENABLED',
      isExternal: false, isCache: nd.nc !== 1, createdAt: nd.ca, updatedAt: nd.ua,
      children: (byParent[id] || []).map(toDTO),
    };
  }
  return (byParent[0] || []).map(toDTO);
}

/* 下拉选项端点：前端按分页对象读取（data.list），不做裸数组转换；
 * 但补齐 label/value 字段，兼容 ApiSelect 的默认取值。 */
const SELECT_OPTION_ENDPOINTS = {
  '/system/user/select-options': ['system/user', 'realName', 'username'],
  '/client/select-options': ['client', 'clientName', 'name'],
  '/matter/select-options': ['matter', 'caseName', 'name'],
};
function buildSelectOptions(key, labelKeys, params) {
  const arr = getCol(key) || [];
  const withLabel = arr.map((r) => {
    const label = labelKeys.map((k) => r[k]).find((v) => v != null && v !== '') || '未命名';
    return { ...r, label: String(label), value: r.id, name: String(label) };
  });
  return paginate(withLabel, params);
}

/* 提成分配方案（形状对齐生产 /finance/commission/rules） */
const COMMISSION_RULES = [
  { id: 1, ruleCode: 'STANDARD', ruleName: '标准方案', firmRate: 30, leadLawyerRate: 50, assistLawyerRate: 15, supportStaffRate: 5, originatorRate: 0, allowModify: true, description: '常规案件：律所30%、主办50%、协办15%、辅助5%', isDefault: true, active: true },
  { id: 2, ruleCode: 'SOLO', ruleName: '独立办案', firmRate: 30, leadLawyerRate: 70, assistLawyerRate: 0, supportStaffRate: 0, originatorRate: 0, allowModify: true, description: '无协办和辅助：律所30%、主办70%', isDefault: false, active: true },
  { id: 3, ruleCode: 'NO_FIRM', ruleName: '律所不提成', firmRate: 0, leadLawyerRate: 70, assistLawyerRate: 20, supportStaffRate: 10, originatorRate: 0, allowModify: true, description: '律所不参与分配（如特殊约定案件）', isDefault: false, active: true },
  { id: 4, ruleCode: 'TEAM_EQUAL', ruleName: '团队均分', firmRate: 20, leadLawyerRate: 40, assistLawyerRate: 30, supportStaffRate: 10, originatorRate: 0, allowModify: true, description: '团队项目，主办协办比例接近', isDefault: false, active: true },
  { id: 5, ruleCode: 'RETAINER', ruleName: '顾问项目', firmRate: 40, leadLawyerRate: 60, assistLawyerRate: 0, supportStaffRate: 0, originatorRate: 0, allowModify: true, description: '常年法律顾问，律所比例较高', isDefault: false, active: true },
  { id: 6, ruleCode: 'CUSTOM', ruleName: '自定义方案', firmRate: 0, leadLawyerRate: 0, assistLawyerRate: 0, supportStaffRate: 0, originatorRate: 0, allowModify: true, description: '完全自定义，所有比例手动填写', isDefault: false, active: true },
];

/* 权限矩阵（形状对齐生产：{roles, permissions, matrix}） */
const PERMISSION_ROLES = [
  { id: 1, roleCode: 'ADMIN', roleName: '超级管理员', dataScope: 'ALL' },
  { id: 2, roleCode: 'DIRECTOR', roleName: '律所主任', dataScope: 'ALL' },
  { id: 3, roleCode: 'TEAM_LEADER', roleName: '团队负责人', dataScope: 'DEPT_AND_CHILD' },
  { id: 5, roleCode: 'FINANCE', roleName: '财务', dataScope: 'ALL' },
  { id: 6, roleCode: 'LAWYER', roleName: '律师', dataScope: 'SELF' },
  { id: 8, roleCode: 'ADMIN_STAFF', roleName: '行政', dataScope: 'ALL' },
  { id: 9, roleCode: 'TRAINEE', roleName: '实习律师', dataScope: 'SELF' },
];
/* 当前用户可用的权限码（生产库 sys_menu.permission，按角色过滤）。
 * 前端把 login 返回的 permissions 存进 accessCodes，用于按钮级鉴权；
 * 早期 Mock 统一返回 ['*']，会导致按权限码判断的按钮/入口全部不显示。 */
function buildAccessCodes(username) {
  const role = DEMO_MENU_ROLE[username] || 'ADMIN';
  const ids = new Set((ROLE_MENUS[role] || []).map(Number));
  const codes = ['*'];
  Object.keys(MENU_NODES).forEach((id) => {
    const nd = MENU_NODES[id];
    if (!nd.perm) return;
    if (role === 'ADMIN' || ids.has(Number(id))) codes.push(nd.perm);
  });
  return Array.from(new Set(codes));
}

function buildPermissionMatrix() {
  const roleIdSets = {};
  Object.keys(ROLE_MENUS).forEach((code) => { roleIdSets[code] = new Set((ROLE_MENUS[code] || []).map(Number)); });
  const perms = [];
  Object.keys(MENU_NODES).forEach((id) => {
    const nd = MENU_NODES[id];
    if (!nd.perm) return;
    perms.push({ id: Number(id), permissionCode: nd.perm, permissionName: nd.n, menuType: nd.t, module: String(nd.perm).split(':')[0] });
  });
  const matrix = PERMISSION_ROLES.map((r) => ({
    roleId: r.id,
    roleCode: r.roleCode,
    roleName: r.roleName,
    dataScope: r.dataScope,
    permissions: perms.map((p) => ({
      permissionCode: p.permissionCode,
      permissionName: p.permissionName,
      menuType: p.menuType,
      hasPermission: roleIdSets[r.roleCode] ? roleIdSets[r.roleCode].has(p.id) : false,
    })),
  }));
  return { roles: PERMISSION_ROLES, permissions: perms.map(({ permissionCode, permissionName, menuType, module }) => ({ permissionCode, permissionName, menuType, module })), matrix };
}

/* 生产实测返回裸数组的集合型端点（前端按 Array 直接消费） */
const ARRAY_LIST_ENDPOINTS = new Set([
  // 以下端点以生产库实测响应为准：后端确实返回裸数组（见 tables 备注）
  '/schedules', '/schedules/my/today', '/schedules/my/upcoming',
  '/admin/letter/template/all', '/admin/letter/template/list',
  '/admin/meeting-records', '/admin/meeting-room/available',
  '/admin/assets/idle', '/admin/purchases/pending',
  '/admin/go-out/current', '/admin/go-out/my', '/admin/overtime/my',
  '/archive/access/pending', '/archive/pending-matters', '/archive/data-sources',
  '/client/tag/list', '/dossier/template',
  '/document/seal-usage/stats',
  '/knowledge/article/my', '/knowledge/case-study/note/my',
  '/knowledge/case/collected', '/knowledge/law/collected',
  '/knowledge/quality-issue', '/knowledge/risk-warning/active',
  '/matter/contract/approved', '/matter/deadlines/my-upcoming',
  '/system/announcement/valid', '/system/sessions/my-sessions',
  '/system/migration/scan',
  '/ai/pricing', '/ai/usage/statistics', '/ai/usage/billing',
  '/tasks/my/todo', '/tasks/overdue',
  // 生产未采集、但本地实测前端按数组消费（原本会报 xxx is not a function）
  '/admin/letter/application/my',
  '/admin/meeting-records/range',
  '/ai/usage/my/by-model',
  '/ai/usage/statistics/department',
  '/workbench/report-template/data-sources',
  '/system/contract-template/active',
  '/system/holiday/off-days',
  '/knowledge/quality-check/in-progress',
  '/knowledge/quality-issue/pending',
  '/knowledge/risk-warning/high-risk',
  '/finance/contract-amendments/pending',
]);

async function routeApi(method, apiPath, params, body, req) {
  const db = await getDB();
  const auth = req.headers.get('Authorization') || '';
  const tokenUser = parseToken(auth.replace(/^Bearer\s*/, ''));

  // ---- 认证相关 ----
  // 滑块/图片验证码令牌：对齐前端 At() 期望的 { captchaId, captchaUrl } 形状，
  // 同时保留字段供组件读取；captchaUrl 为可渲染的占位图，避免空白/破图。
  if (apiPath === '/auth/slider/token') {
    return {
      captchaId: 'slider-demo',
      captchaUrl: captchaDataUri(),
      tokenId: 'slider-demo',
      targetPosition: ri(120, 260),
      expireSeconds: 60,
    };
  }
  if (apiPath === '/auth/slider/verify') {
    return { message: '验证通过', success: true, verifyToken: 'slider-verify-demo' };
  }
  if (apiPath === '/auth/login/status') {
    return { captchaRequired: false, failCount: 0, locked: false, lockRemainingMinutes: 0 };
  }
  if (apiPath === '/auth/captcha') {
    return { captchaId: 'cap-demo', captchaUrl: captchaDataUri() };
  }
  if (apiPath === '/auth/login') {
    const username = (body && body.username ? String(body.username) : '').toLowerCase();
    const user = DEMO_USERS[username];
    if (!user) {
      // 允许任意已存在账号大小写不敏感；未知账号回退到 admin 以便演示
      const fallback = DEMO_USERS[Object.keys(DEMO_USERS).find((k) => k.toLowerCase() === username)];
      if (!fallback) return { message: '账号或密码错误（演示账号见登录页提示）', code: 'A0001' };
    }
    const u = user || DEMO_USERS[Object.keys(DEMO_USERS).find((k) => k.toLowerCase() === username)] || DEMO_USERS.admin;
    const token = createToken(u.username);
    return {
      accessToken: token,
      refreshToken: token,
      expiresIn: 3600,
      permissions: buildAccessCodes(u.username),
      realName: u.realName,
      roles: u.roles,
      userId: u.userId,
      username: u.username,
    };
  }
  if (apiPath === '/auth/refresh') {
    const username = tokenUser || 'admin';
    const u = DEMO_USERS[username] || DEMO_USERS.admin;
    const token = createToken(u.username);
    return { accessToken: token, refreshToken: token, expiresIn: 3600, permissions: buildAccessCodes(u.username), realName: u.realName, roles: u.roles, userId: u.userId, username: u.username };
  }
  if (apiPath === '/auth/logout') {
    return null;
  }
  if (apiPath === '/auth/info') {
    const username = tokenUser || 'admin';
    const u = DEMO_USERS[username] || DEMO_USERS.admin;
    return {
      userId: u.userId,
      username: u.username,
      realName: u.realName,
      roles: u.roles,
      permissions: buildAccessCodes(u.username),
      accessCodes: buildAccessCodes(u.username),
      avatar: '/default-avatar.svg',
      homePath: '/dashboard',
      deptId: 1,
      email: u.email,
      phone: u.phone,
    };
  }

  // ---- 个人中心 ----
  if (apiPath === '/profile/info') {
    const username = tokenUser || 'admin';
    const u = DEMO_USERS[username] || DEMO_USERS.admin;
    return {
      id: u.userId,
      username: u.username,
      realName: u.realName,
      email: u.email,
      phone: u.phone,
      avatarUrl: '/default-avatar.svg',
      deptId: 1,
      departmentId: 1,
      position: u.position,
      employeeNo: 'EMP' + (1000 + u.userId),
      joinDate: '2022-03-01',
      status: 'ENABLED',
      roleCodes: u.roles,
      permissions: u.permissions,
    };
  }
  if (apiPath === '/profile/update') {
    return { ...body, id: tokenUser ? DEMO_USERS[tokenUser]?.userId : 1 };
  }
  if (apiPath === '/profile/change-password') {
    return null;
  }
  if (apiPath === '/profile/avatar') {
    return '/default-avatar.svg';
  }

  // ---- 菜单 ----
  // 按当前登录用户的角色返回真实菜单（对齐后端 MenuAppService.getUserMenuTree）
  if (apiPath === '/system/menu/user') {
    return buildMenu(tokenUser);
  }

  // ---- 工作台首页聚合（看板 / 待办 / 最近项目 / 待审批） ----
  if (apiPath === '/workbench/stats') {
    const matters = db['matter'] || [];
    const tasks = db['tasks'] || [];
    const timesheets = db['timesheets'] || [];
    const approvals = db['workbench/approval'] || [];
    return {
      matterCount: matters.length,
      clientCount: (db['client'] || []).length,
      timesheetHours: timesheets.reduce((s, t) => s + (Number(t.hours) || 0), 0),
      taskCount: tasks.filter((t) => t.status === '待开始' || t.status === '进行中').length,
      activeMatters: matters.filter((m) => m.status === '进行中').length,
      pendingApprovals: approvals.filter((a) => a.status === '待审批').length,
    };
  }
  if (apiPath === '/tasks/my/todo' || apiPath === '/tasks/upcoming' || apiPath === '/tasks/overdue') {
    let list = db['tasks'] || [];
    if (apiPath === '/tasks/my/todo') list = list.filter((t) => t.status === '待开始' || t.status === '进行中');
    if (apiPath === '/tasks/overdue') list = list.filter((t) => t.status === '已逾期');
    return list.slice(0, 10);
  }
  if (apiPath === '/matter/my') {
    const all = db['matter'] || [];
    const size = Number(params.get('pageSize') || 5);
    const list = all.slice(0, size);
    return { list, records: list, items: list, total: all.length, page: 1, pageSize: size };
  }
  if (apiPath === '/workbench/approval/pending') {
    return (db['workbench/approval'] || []).filter((a) => a.status === '待审批');
  }
  if (apiPath === '/workbench/approval/my-initiated' || apiPath === '/workbench/approval/my-history') {
    return (db['workbench/approval'] || []).slice(0, 6);
  }

  // ---- 统计中心（报表 / 数据分析页） ----
  if (apiPath === '/workbench/statistics/revenue') {
    const payments = db['finance/payment'] || [];
    const total = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0) || 2680000;
    return {
      totalRevenue: total,
      monthlyRevenue: Math.round(total * 0.12),
      yearlyRevenue: Math.round(total * 0.62),
      pendingRevenue: Math.round(total * 0.18),
      growthRate: 12.5,
      trends: Array.from({ length: 6 }, (_, i) => ({ period: `${i + 1}月`, amount: ri(20, 90) * 10000 })),
    };
  }
  if (apiPath === '/workbench/statistics/matter') {
    const matters = db['matter'] || [];
    const statusCount = {};
    const typeCount = {};
    matters.forEach((m) => {
      statusCount[m.status] = (statusCount[m.status] || 0) + 1;
      const t = m.matterType || m.caseType || '其他';
      typeCount[t] = (typeCount[t] || 0) + 1;
    });
    return {
      totalMatters: matters.length,
      activeMatters: matters.filter((m) => m.status === '进行中').length,
      completedMatters: matters.filter((m) => m.status === '已结案').length,
      statusCount,
      typeCount,
    };
  }
  if (apiPath === '/workbench/statistics/client') {
    const clients = db['client'] || [];
    const typeCount = {};
    clients.forEach((c) => { const t = c.clientType || '企业'; typeCount[t] = (typeCount[t] || 0) + 1; });
    return {
      totalClients: clients.length,
      formalClients: Math.round(clients.length * 0.72),
      potentialClients: clients.length - Math.round(clients.length * 0.72),
      newClientsThisMonth: ri(3, 12),
      typeCount,
    };
  }
  if (apiPath === '/workbench/statistics/lawyer-performance') {
    const limit = Number(params.get('limit') || 10);
    return Array.from({ length: limit }, (_, i) => ({
      rank: i + 1,
      lawyerId: i + 1,
      lawyerName: fullName(),
      revenue: ri(50, 900) * 10000,
      hours: ri(120, 2000),
      matterCount: ri(5, 60),
      commission: ri(2, 80) * 10000,
    }));
  }

  // ---- 返回数组的 "我的 / 待办 / 可用" 端点（前端按数组消费） ----
  const ARRAY_ENDPOINTS = {
    '/finance/my/expenses': 'finance/expense',
    '/finance/my/payments': 'finance/payment',
    '/finance/my/commissions': 'finance/commission',
    '/hr/payroll/my': 'hr/payroll',
    '/admin/assets/my': 'admin/asset',
    '/admin/purchases/my': 'admin/purchase',
    '/admin/go-out/my': 'admin/go-out',
    '/admin/overtime/my': 'admin/overtime',
    '/archive/access/my': 'archive/access',
    '/workbench/report/available': 'workbench/report',
    '/system/role/all': 'system/role',
    '/system/integration/all': 'system/integration',
    '/schedules/my/today': 'schedules',
    '/schedules/my/upcoming': 'schedules',
  };
  if (method === 'GET' && ARRAY_ENDPOINTS[apiPath]) {
    return (db[ARRAY_ENDPOINTS[apiPath]] || []).slice(0, 12);
  }
  if (apiPath === '/hr/payroll/items') {
    const year = params.get('year');
    const month = Number(params.get('month') || 0);
    const prefix = year && month ? `${year}-${String(month).padStart(2, '0')}` : '';
    let list = (db['hr/payroll'] || []).filter((r) => !prefix || String(r.period || '').startsWith(prefix));
    if (list.length === 0) list = (db['hr/payroll'] || []).slice(0, 12);
    // 明细行字段名与工资表批次不同（grossAmount / netAmount / confirmStatusName ...）
    return list.map((r) => ({
      ...r,
      income: r.income,
      grossAmount: r.grossSalary,
      totalGrossAmount: r.grossSalary,
      deductionAmount: r.deduction,
      totalDeductionAmount: r.totalDeduction,
      netAmount: r.netSalary,
      totalNetAmount: r.netSalary,
      employeeName: r.employeeName,
      confirmStatusName: r.confirmStatusName,
      confirmStatus: r.confirmStatus,
    }));
  }

  // ---- 仪表盘统计（演示数据） ----
  if (apiPath.startsWith('/dashboard')) {
    return {
      totalClients: (db['client'] || []).length,
      totalMatters: (db['matter'] || []).length,
      activeMatters: (db['matter'] || []).filter((m) => m.status === '进行中').length,
      totalDocuments: (db['document'] || []).length,
      pendingApprovals: (db['workbench/approval'] || []).filter((a) => a.status === '待审批').length,
      monthlyIncome: (db['finance/payment'] || []).reduce((s, p) => s + (p.amount || 0), 0),
      trend: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: ri(20, 100) })),
      caseTypeStat: POOL.caseType.slice(0, 6).map((t) => ({ name: t, value: ri(5, 40) })),
    };
  }
  if (['/finance/commission/summary', '/finance/commission/report', '/timesheets/stats', '/finance/expense/matters'].includes(apiPath)) {
    return {
      total: ri(10, 100),
      amount: ri(100, 9000) * 10000,
      items: Array.from({ length: 6 }, (_, i) => ({ name: fullName(), value: ri(1, 80) * 10000 })),
    };
  }

  // ---- 演示控制 ----
  if (apiPath === '/demo/accounts') {
    return Object.entries(DEMO_USERS).map(([k, v]) => ({ username: v.username, realName: v.realName, password: '123456', roles: v.roleNames }));
  }
  if (apiPath === '/demo/reset' && method === 'POST') {
    await resetDB();
    return { reset: true };
  }

  // ---- 集合型（其余 /api/...） ----
  // 导出 / 下载 / 模板等二进制接口：返回纯文本，避免前端下载报错
  if (/\/(export|download|import\/template|cover|export\/word)$/.test(apiPath) && method === 'GET') {
    return jsonBlob('演示导出文件内容（Mock）。', 'demo-export.txt');
  }
  // ---- 树 / 字典 / 分类 / 下拉选项：生产返回裸数组 ----
  if (apiPath === '/system/department/tree' || apiPath === '/system/department/tree-public') {
    return buildDeptTree();
  }
  if (apiPath === '/system/menu/tree') {
    return buildMenuTree();
  }
  if (apiPath === '/system/dict/types') {
    return DICT_TYPES;
  }
  if (apiPath === '/system/dict/items') {
    return (db['system/dict'] || []).slice(0, 20);
  }
  if (apiPath === '/knowledge/law/categories') return LAW_CATEGORIES;
  if (apiPath === '/knowledge/case/categories') return CASE_CATEGORIES;
  const causeMatch = /^\/causes\/(civil|criminal|admin)\/tree$/.exec(apiPath);
  if (causeMatch) return buildCauseTree(causeMatch[1]);
  if (method === 'GET' && SELECT_OPTION_ENDPOINTS[apiPath]) {
    const [key, ...labels] = SELECT_OPTION_ENDPOINTS[apiPath];
    return buildSelectOptions(key, labels, params);
  }
  if (apiPath === '/admin/leave/types') {
    return POOL.leaveType.map((t, i) => ({ id: i + 1, typeName: t, typeCode: 'LV' + (i + 1), paid: t !== '事假', maxDays: [15, 30, 10, 5, 10, 98, 15][i] || 10, status: 'ENABLED' }));
  }
  if (apiPath === '/system/version') {
    return { version: '2.4.0', buildTime: '2026-09-28 10:12:00', backend: 'Spring Boot 3', frontend: 'Vben Admin 5', dbSchema: 'v2.4' };
  }
  if (apiPath === '/system/wecom/status') return { enabled: false, corpId: '', bound: false };
  if (apiPath === '/system/notification/email-status') return { enabled: true, host: 'smtp.demo.local', port: 465, from: 'noreply@lawfirm.demo' };
  if (apiPath === '/admin/operation-logs/statistics') {
    const logs = db['admin/operation-log'] || [];
    const byModule = {};
    logs.forEach((l) => { byModule[l.module] = (byModule[l.module] || 0) + 1; });
    return { totalCount: logs.length, todayCount: Math.round(logs.length * 0.2), successCount: logs.filter((l) => l.result === '成功').length, failCount: logs.filter((l) => l.result === '失败').length, moduleCount: Object.entries(byModule).map(([name, value]) => ({ name, value })) };
  }
  if (apiPath === '/finance/payment-amendment/stats') {
    const list = db['finance/payment-amendment'] || [];
    return { total: list.length, pending: list.filter((x) => x.status === '待审批').length, approved: list.filter((x) => x.status === '已通过').length, rejected: list.filter((x) => x.status === '已驳回').length, amount: list.reduce((s, x) => s + (Number(x.amendedAmount) || 0), 0) };
  }
  if (apiPath === '/system/holiday/off-days') {
    // 返回区间内的周末，供日历/期限计算演示（生产为法定节假日接口）
    const start = params.get('startDate') || params.get('start');
    const end = params.get('endDate') || params.get('end');
    const out = [];
    if (start && end) {
      const cur = new Date(start + 'T00:00:00');
      const last = new Date(end + 'T00:00:00');
      while (cur <= last && out.length < 400) {
        const wd = cur.getDay();
        if (wd === 0 || wd === 6) out.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
      }
    }
    return out;
  }
  if (apiPath === '/finance/commission/rules') return COMMISSION_RULES;
  if (apiPath === '/system/permission-matrix') return buildPermissionMatrix();
  if (method === 'GET' && ARRAY_LIST_ENDPOINTS.has(apiPath)) {
    const { key } = resolve(apiPath);
    const arr = getCol(key) || [];
    return arr.slice(0, 200);
  }

  return await handleCollection(method, apiPath, params, body, db);
}

async function handleApi(event) {
  const req = event.request;
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  const apiPath = url.pathname.slice(API_PREFIX.length) || '/';
  let body = null;
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      const ct = req.headers.get('content-type') || '';
      if (ct.includes('application/json')) body = await req.clone().json();
      else if (ct.includes('multipart') || ct.includes('form')) body = {};
    } catch {
      body = {};
    }
  }
  // 兜底：尝试解析（部分接口可能以表单提交）
  if (!body && method !== 'GET') {
    try {
      body = await req.clone().json();
    } catch {
      body = {};
    }
  }
  const params = url.searchParams;
  try {
    const data = await routeApi(method, apiPath, params, body, req);
    // 调试用（可选）：控制台执行 `window.__apiLog = []` 后，每次 Mock 响应会记录一条
    // 「方法 路径 -> 响应形状」，便于排查某个页面到底调了哪些接口、返回的是数组还是分页对象。
    if (typeof window !== 'undefined' && window.__apiLog) {
      let d = data;
      let shape = Array.isArray(d) ? 'array[' + d.length + ']' : typeof d;
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        const keys = Object.keys(d);
        shape = 'obj{' + keys.slice(0, 10).join('|') + '}';
        for (const k of ['items', 'list', 'records', 'rows', 'total']) {
          if (Array.isArray(d[k])) shape += ' ' + k + '[' + d[k].length + ']';
        }
      }
      window.__apiLog.push(method + ' ' + apiPath + ' -> ' + shape);
    }
    return jsonEnvelope(data, true, 'ok');
  } catch (e) {
    if (typeof window !== 'undefined' && window.__apiLog) window.__apiLog.push(method + ' ' + apiPath + ' -> ERROR ' + (e && e.message));
    return jsonEnvelope(null, false, e && e.message ? e.message : 'mock error');
  }
}

/* ---------------------------------------------------------------------------
 * 静态外壳缓存
 * ------------------------------------------------------------------------- */
async function handleStatic(event) {
  const req = event.request;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    try {
      const net = await fetch(event.request);
      const cache = await caches.open(SHELL_CACHE);
      cache.put('/index.html', net.clone());
      return net;
    } catch {
      const cache = await caches.open(SHELL_CACHE);
      return (await cache.match('/index.html')) || (await cache.match('/offline.html')) || new Response('离线', { status: 503 });
    }
  }
  // 资源：缓存优先，回源并更新
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const net = await fetch(req);
    if (net && net.status === 200) cache.put(req, net.clone());
    return net;
  } catch {
    return cached || new Response('', { status: 504 });
  }
}

/* ---------------------------------------------------------------------------
 * Service Worker 生命周期
 * ------------------------------------------------------------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => {})).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // 第三方资源不拦截
  if (url.pathname.startsWith(API_PREFIX)) {
    event.respondWith(handleApi(event));
    return;
  }
  if (event.request.method !== 'GET') return;
  event.respondWith(handleStatic(event));
});
