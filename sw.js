/* ============================================================================
 * 智慧律所管理系统 · 开源演示版 Mock Service Worker
 * ----------------------------------------------------------------------------
 * 本文件在浏览器网络层拦截 /api/** 请求，返回由浏览器内 Mock 数据库生成的演示
 * 数据（无需任何真实后端）。同时负责缓存前端静态外壳，使站点可离线访问。
 *
 * 数据信封统一为：{ success: true, code: "200", message, data, timestamp }
 * 这与前端 @vben/request 的 defaultResponseInterceptor 约定一致。
 * ==========================================================================*/

const SW_VERSION = 'demo-v1.0.2';
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
function enrich(db) {
  const syn = {
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
  };
  for (const key of Object.keys(db)) {
    const arr = db[key];
    if (!Array.isArray(arr)) continue;
    arr.forEach((rec) => {
      if (!rec || typeof rec !== 'object') return;
      for (const [t, srcs] of Object.entries(syn)) {
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
          if (rec.username === undefined) rec.username = 'emp' + rec.employeeNo;
          if (rec.departmentName === undefined) rec.departmentName = rec.deptName;
          if (rec.phone === undefined) rec.phone = '1' + String(ri(3000000000, 5999999999));
          if (rec.email === undefined) rec.email = 'e' + ri(100, 999) + '@lawfirm.demo';
          if (rec.joinDate === undefined) rec.joinDate = rec.hireDate;
          if (rec.position === undefined) rec.position = pick(POOL.position);
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
      }
    });
  }
  return db;
}

/* ---------------------------------------------------------------------------
 * 演示账号（与 lawfirm 种子账号一致）
 * ------------------------------------------------------------------------- */
const DEMO_USERS = {
  admin: { userId: 1, username: 'admin', realName: '系统管理员', roles: ['admin', 'director'], roleNames: ['超级管理员', '主任'], permissions: ['*'], deptName: '管委会', position: '主任', email: 'admin@lawfirm.demo', phone: '13800000001' },
  director: { userId: 2, username: 'director', realName: '张主任', roles: ['director'], roleNames: ['主任'], permissions: ['*'], deptName: '管委会', position: '主任', email: 'director@lawfirm.demo', phone: '13800000002' },
  lawyer1: { userId: 3, username: 'lawyer1', realName: '李律师', roles: ['lawyer'], roleNames: ['主办律师'], permissions: ['matter:list', 'client:list', 'finance:contract:list', 'document:list'], deptName: '民事法律事务部', position: '主办律师', email: 'lawyer1@lawfirm.demo', phone: '13800000003' },
  leader: { userId: 4, username: 'leader', realName: '王团队负责人', roles: ['leader'], roleNames: ['团队负责人'], permissions: ['matter:list', 'client:list', 'finance:contract:list'], deptName: '商事法律事务部', position: '高级律师', email: 'leader@lawfirm.demo', phone: '13800000004' },
  finance: { userId: 5, username: 'finance', realName: '赵财务', roles: ['finance'], roleNames: ['财务'], permissions: ['finance:contract:list', 'finance:invoice:list', 'finance:expense:list', 'finance:commission:list'], deptName: '财务部', position: '财务专员', email: 'finance@lawfirm.demo', phone: '13800000005' },
  staff: { userId: 6, username: 'staff', realName: '钱行政', roles: ['staff'], roleNames: ['行政'], permissions: ['admin:asset:list', 'admin:meeting-room:list', 'hr:employee:list'], deptName: '行政部', position: '行政主管', email: 'staff@lawfirm.demo', phone: '13800000006' },
  trainee: { userId: 7, username: 'trainee', realName: '孙实习', roles: ['trainee'], roleNames: ['实习律师'], permissions: ['matter:list'], deptName: '民事法律事务部', position: '实习律师', email: 'trainee@lawfirm.demo', phone: '13800000007' },
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
 * 菜单树 —— 指向 src/views 下真实存在的视图组件，保证每个菜单都能打开页面
 * 故后端菜单模式：前端路由完全由该树生成
 * ------------------------------------------------------------------------- */
let _mid = 1;
function node(name, path, icon, component, menuType, children, opts = {}) {
  return {
    id: _mid++,
    name,
    path,
    icon,
    menuType: menuType || 'MENU',
    component: component || 'LAYOUT',
    parentId: 0,
    sortOrder: _mid,
    status: 'ENABLED',
    visible: opts.visible !== false,
    isCache: opts.isCache !== false,
    permission: opts.permission || undefined,
    redirect: opts.redirect || undefined,
    children: children && children.length ? children : null,
  };
}
function dir(name, path, icon, children, opts) {
  return node(name, path, icon, 'LAYOUT', 'DIRECTORY', children, opts);
}

function buildMenu() {
  _mid = 1;
  const detail = (name, path, component) =>
    node(name, path, undefined, component, 'MENU', null, { visible: false, isCache: true });

  return [
    dir('工作台', '/dashboard', 'DashboardOutlined', [
      node('工作台首页', '/dashboard', 'DashboardOutlined', 'dashboard/index/index'),
      node('数据分析', '/dashboard/analytics', 'BarChartOutlined', 'dashboard/analytics/index'),
      node('审批概览', '/dashboard/approval', 'CheckSquareOutlined', 'dashboard/approval/index'),
      node('我的工作区', '/dashboard/workspace', 'ProjectOutlined', 'dashboard/workspace/index'),
    ]),
    dir('客户管理', '/crm', 'TeamOutlined', [
      node('客户列表', '/crm/client', 'IdcardOutlined', 'crm/client/index'),
      node('案源管理', '/crm/lead', 'ContactsOutlined', 'crm/lead/index'),
      node('利益冲突审查', '/crm/conflict', 'SecurityScanOutlined', 'crm/conflict/index'),
      detail('客户详情', '/crm/client/detail/:id', 'crm/client/index'),
    ]),
    dir('案件管理', '/matter', 'FolderOutlined', [
      node('案件列表', '/matter/list', 'FolderOpenOutlined', 'matter/list/index'),
      node('我的案件', '/matter/my', 'SolutionOutlined', 'matter/my/index'),
      node('案件合同', '/matter/contract', 'FileTextOutlined', 'matter/contract/index'),
      node('任务管理', '/matter/task', 'CheckSquareOutlined', 'matter/task/index'),
      node('工时记录', '/matter/timesheet', 'ClockCircleOutlined', 'matter/timesheet/index'),
      detail('案件详情', '/matter/detail/:id', 'matter/detail/index'),
    ]),
    dir('文书管理', '/document', 'FileTextOutlined', [
      node('文书列表', '/document/list', 'FileOutlined', 'document/list/index'),
      node('我的文书', '/document/my', 'FileAddOutlined', 'document/my/index'),
      node('文书模板', '/document/template', 'FileProtectOutlined', 'document/template/index'),
      node('用印管理', '/document/seal', 'SafetyOutlined', 'document/seal/index'),
      node('用印申请', '/document/seal-apply', 'FormOutlined', 'document/seal-apply/index'),
      node('文书创作', '/document/compose', 'EditOutlined', 'document/compose/index'),
      node('卷宗模板', '/document/dossier-template', 'ContainerOutlined', 'document/dossier-template/index'),
      detail('文书详情', '/document/detail/:id', 'document/list/index'),
    ]),
    dir('档案管理', '/archive', 'DatabaseOutlined', [
      node('档案列表', '/archive/list', 'ContainerOutlined', 'archive/list/index'),
      node('借阅管理', '/archive/access', 'ReadOutlined', 'archive/access/index'),
      node('销毁管理', '/archive/destroy', 'DeleteOutlined', 'archive/destroy/index'),
      node('推送状态', '/archive/push-status', 'CloudUploadOutlined', 'archive/push-status/index'),
      detail('档案详情', '/archive/detail/:id', 'archive/detail/index'),
    ]),
    dir('财务管理', '/finance', 'MoneyCollectOutlined', [
      node('合同管理', '/finance/contract', 'FileTextOutlined', 'finance/contract/index'),
      node('合同模板', '/finance/contract-template', 'FileProtectOutlined', 'finance/contract-template/index'),
      node('合同变更', '/finance/contract-amendment', 'SwapOutlined', 'finance/contract-amendment/index'),
      node('发票管理', '/finance/invoice', 'PayCircleOutlined', 'finance/invoice/index'),
      node('收款管理', '/finance/payment', 'WalletOutlined', 'finance/payment/index'),
      node('预收管理', '/finance/prepayment', 'AccountBookOutlined', 'finance/prepayment/index'),
      node('付款管理', '/finance/payment-amendment', 'DollarOutlined', 'finance/payment-amendment/index'),
      node('报销管理', '/finance/expense', 'ProfileOutlined', 'finance/expense/index'),
      node('提成管理', '/finance/commission', 'PercentageOutlined', 'finance/commission/index'),
      node('我的提成', '/finance/my-commission', 'TrophyOutlined', 'finance/my-commission/index'),
      node('我的收款', '/finance/my-payment', 'RiseOutlined', 'finance/my-payment/index'),
      node('AI 计费', '/finance/ai-billing', 'AimOutlined', 'finance/ai-billing/index'),
      node('财务报表', '/finance/report', 'BarChartOutlined', 'finance/report/index'),
    ]),
    dir('行政管理', '/admin', 'ToolOutlined', [
      node('资产管理', '/admin/asset', 'BankOutlined', 'admin/asset/index'),
      node('资产盘点', '/admin/asset-inventory', 'FunnelPlotOutlined', 'admin/asset-inventory/index'),
      node('考勤管理', '/admin/attendance', 'ClockCircleOutlined', 'admin/attendance/index'),
      node('用章合同', '/admin/contract', 'FileTextOutlined', 'admin/contract/index'),
      node('外出管理', '/admin/go-out', 'ExportOutlined', 'admin/go-out/index'),
      node('请假管理', '/admin/leave', 'CalendarOutlined', 'admin/leave/index'),
      node('介绍信', '/admin/letter', 'MailOutlined', 'admin/letter/index'),
      node('会议纪要', '/admin/meeting-record', 'FileSearchOutlined', 'admin/meeting-record/index'),
      node('会议室', '/admin/meeting-room', 'ShopOutlined', 'admin/meeting-room/index'),
      node('加班管理', '/admin/overtime', 'ClockCircleOutlined', 'admin/overtime/index'),
      node('采购管理', '/admin/purchase', 'ShoppingCartOutlined', 'admin/purchase/index'),
      node('供应商', '/admin/supplier', 'ApartmentOutlined', 'admin/supplier/index'),
    ]),
    dir('人事管理', '/hr', 'UserOutlined', [
      node('员工管理', '/hr/employee', 'IdcardOutlined', 'hr/employee/index'),
      node('人事合同', '/hr/contract', 'FileTextOutlined', 'hr/contract/index'),
      node('考勤记录', '/hr/attendance', 'ClockCircleOutlined', 'hr/attendance/index'),
      node('请假管理', '/hr/leave', 'CalendarOutlined', 'hr/leave/index'),
      node('薪资管理', '/hr/payroll', 'WalletOutlined', 'hr/payroll/index'),
      node('我的薪资', '/hr/payroll/my', 'DollarOutlined', 'hr/payroll/my/index'),
      node('绩效管理', '/hr/performance', 'TrophyOutlined', 'hr/performance/index'),
      node('晋升管理', '/hr/promotion', 'RiseOutlined', 'hr/promotion/index'),
      node('转正管理', '/hr/regularization', 'CheckSquareOutlined', 'hr/regularization/index'),
      node('离职管理', '/hr/resignation', 'LogoutOutlined', 'hr/resignation/index'),
      node('培训管理', '/hr/training', 'ReadOutlined', 'hr/training/index'),
      node('发展计划', '/hr/development', 'AimOutlined', 'hr/development/index'),
    ]),
    dir('知识库', '/knowledge', 'BookOutlined', [
      node('文章', '/knowledge/article', 'ReadOutlined', 'knowledge/article/index'),
      node('案例', '/knowledge/case', 'FileSearchOutlined', 'knowledge/case/index'),
      node('法规', '/knowledge/law', 'SafetyCertificateOutlined', 'knowledge/law/index'),
      node('质检标准', '/knowledge/quality', 'AuditOutlined', 'knowledge/quality/index'),
    ]),
    dir('工作流', '/workbench', 'ScheduleOutlined', [
      node('审批中心', '/workbench/approval', 'CheckSquareOutlined', 'workbench/approval/index'),
      node('报告管理', '/workbench/report', 'FileTextOutlined', 'workbench/report/index'),
      node('报告模板', '/workbench/report-template', 'FileProtectOutlined', 'workbench/report-template/index'),
      node('日程管理', '/workbench/schedule', 'CalendarOutlined', 'workbench/schedule/index'),
      node('定时报告', '/workbench/scheduled-report', 'ClockCircleOutlined', 'workbench/scheduled-report/index'),
    ]),
    dir('系统管理', '/system', 'SettingOutlined', [
      node('用户管理', '/system/user', 'UserOutlined', 'system/user/index'),
      node('角色管理', '/system/role', 'SafetyOutlined', 'system/role/index'),
      node('部门管理', '/system/dept', 'ApartmentOutlined', 'system/dept/index'),
      node('字典管理', '/system/dict', 'DatabaseOutlined', 'system/dict/index'),
      node('菜单管理', '/system/menu', 'MenuOutlined', 'system/menu/index'),
      node('系统配置', '/system/config', 'ToolOutlined', 'system/config/index'),
      node('操作日志', '/system/log', 'FileSearchOutlined', 'system/log/index'),
      node('公告管理', '/system/announcement', 'NotificationOutlined', 'system/announcement/index'),
      node('数据备份', '/system/backup', 'CloudUploadOutlined', 'system/backup/index'),
      node('提成配置', '/system/commission-config', 'PercentageOutlined', 'system/commission-config/index'),
      node('系统集成', '/system/integration', 'ApiOutlined', 'system/integration/index'),
      node('数据迁移', '/system/migration', 'SwapOutlined', 'system/migration/index'),
      node('权限矩阵', '/system/permission-matrix', 'AuditOutlined', 'system/permission-matrix/index'),
    ]),
    dir('个人中心', '/personal', 'IdcardOutlined', [
      node('AI 用量', '/personal/ai-usage', 'AimOutlined', 'personal/ai-usage/index'),
    ]),
    dir('其他', '/misc', 'AppstoreOutlined', [
      node('数据交接', '/data-handover', 'SwapOutlined', 'data-handover/index'),
      node('文档预览', '/office-preview', 'EyeOutlined', 'office-preview/index'),
    ]),
  ];
}

/* ---------------------------------------------------------------------------
 * 种子数据生成
 * ------------------------------------------------------------------------- */
function buildSeed() {
  const db = {};
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

  // 客户
  db['client'] = Array.from({ length: 42 }, () => {
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
  });
  // 案源
  db['client/lead'] = Array.from({ length: 22 }, () => {
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
  });
  // 利冲审查
  db['client/conflict-check'] = Array.from({ length: 14 }, () =>
    base({
      clientName: companyName(),
      opposingParty: companyName(),
      riskLevel: pick(['HIGH', 'MEDIUM', 'LOW']),
      hasConflict: bool(),
      status: pick(['待审查', '已通过', '已豁免', '存在冲突']),
      reviewer: fullName(),
    }),
  );
  // 客户子资源（少量，演示用）
  db['client/tag'] = ['VIP客户', '战略客户', '潜在客户', '风险客户', '长期合作'].map((t, i) =>
    base({ id: 1000 + i, tagName: t, color: pick(['red', 'blue', 'green', 'orange', 'purple']) }),
  );
  db['client/contact'] = Array.from({ length: 18 }, () =>
    base({ clientId: ri(1, 42), contactName: fullName(), phone: '1' + String(ri(3000000000, 5999999999)), position: pick(POOL.position), isPrimary: bool() }),
  );

  // 案件
  const matterOwners = Array.from({ length: 8 }, () => fullName());
  db['matter'] = Array.from({ length: 48 }, () => {
    const caseType = pick(POOL.caseType);
    const caseName = caseType + '一案';
    const caseNo = '(' + ri(2023, 2026) + ')' + pick(POOL.city) + '律民初' + String(ri(100, 999)) + '号';
    const mtype = pick(['诉讼', '非诉', '顾问', '仲裁']);
    const lead = pick(matterOwners);
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
  });
  db['matter/contract'] = Array.from({ length: 20 }, () =>
    base({ contractNo: 'MC' + String(ri(100000, 999999)), matterName: pick(POOL.caseType) + '一案', clientName: companyName(), amount: ri(5, 300) * 10000, signDate: daysAgo(ri(10, 300)), status: pick(POOL.financeStatus) }),
  );
  db['tasks'] = Array.from({ length: 26 }, () =>
    base({ title: pick(['起草答辩状', '证据整理', '客户访谈', '庭审准备', '法律检索', '合同审阅', '阅卷', '调解方案']), matterName: pick(POOL.caseType) + '一案', assignee: pick(matterOwners), dueDate: daysAgo(-ri(1, 25)), priority: pick(['高', '中', '低']), status: pick(['待开始', '进行中', '已完成', '已逾期']) }),
  );
  db['timesheets'] = Array.from({ length: 30 }, () =>
    base({ employeeName: pick(matterOwners), matterName: pick(POOL.caseType) + '一案', workDate: daysAgo(ri(1, 60)), hours: ri(1, 9), description: pick(['庭审', '会见', '文书', '研究', '谈判']), status: pick(['草稿', '已提交', '已审批']) }),
  );
  db['schedules'] = Array.from({ length: 16 }, () =>
    base({ title: pick(['开庭', '客户会议', '内部研讨', '尽调', '证据交换']), matterName: pick(POOL.caseType) + '一案', type: pick(['开庭', '会议', '提醒', ' deadline']), dueDate: daysAgo(-ri(1, 30)), ownerName: pick(matterOwners), remind: bool() }),
  );

  // 文书
  db['document'] = Array.from({ length: 38 }, () =>
    base({ docNo: 'WD' + String(ri(10000, 99999)), docName: pick(POOL.docType) + '（' + companyName() + '）', docType: pick(POOL.docType), matterName: pick(POOL.caseType) + '一案', ownerName: fullName(), size: ri(10, 5000) + 'KB', status: pick(POOL.docStatus) }),
  );
  db['document/template'] = Array.from({ length: 12 }, () =>
    base({ templateName: pick(POOL.docType) + '模板', category: pick(['民事诉讼', '刑事诉讼', '商事', '非诉']), version: 'v' + ri(1, 5) + '.' + ri(0, 9), ownerName: fullName(), status: pick(['启用', '停用']) }),
  );
  db['document/seal'] = Array.from({ length: 16 }, () =>
    base({ sealName: pick(['公章', '合同专用章', '财务专用章', '发票专用章', '法人章']), applyReason: pick(['合同用印', '函件用印', '证明文件']), applicant: fullName(), applyDate: daysAgo(ri(1, 60)), status: pick(['待审批', '已用印', '已驳回']) }),
  );

  // 档案
  db['archive'] = Array.from({ length: 24 }, () => {
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
  });
  db['archive/access'] = Array.from({ length: 12 }, () =>
    base({ archiveNo: 'DA' + String(ri(10000, 99999)), applicant: fullName(), reason: pick(['阅卷', '复印', '移交']), applyDate: daysAgo(ri(1, 40)), approveStatus: pick(['待审批', '已批准', '已驳回']) }),
  );

  // 财务
  db['finance/contract'] = Array.from({ length: 30 }, () =>
    base({ contractNo: 'HT' + String(ri(100000, 999999)), contractName: pick(POOL.caseType) + '委托代理合同', clientName: companyName(), matterName: pick(POOL.caseType) + '一案', amount: ri(5, 500) * 10000, signDate: daysAgo(ri(10, 400)), status: pick(POOL.financeStatus), ownerName: fullName() }),
  );
  db['finance/invoice'] = Array.from({ length: 24 }, () =>
    base({ invoiceNo: 'INV' + String(ri(100000, 999999)), contractNo: 'HT' + String(ri(100000, 999999)), clientName: companyName(), amount: ri(1, 200) * 10000, taxRate: pick(['1%', '3%', '6%', '9%']), issueDate: daysAgo(ri(1, 200)), type: pick(['增值税专用发票', '增值税普通发票']), status: pick(['已开具', '已作废', '已红冲']) }),
  );
  db['finance/fee'] = Array.from({ length: 20 }, () =>
    base({ feeNo: 'FY' + String(ri(100000, 999999)), clientName: companyName(), matterName: pick(POOL.caseType) + '一案', feeType: pick(['律师费', '诉讼费', '保全费', '鉴定费', '差旅费']), amount: ri(1, 100) * 10000, payable: ri(1, 100) * 10000, paid: ri(0, 80) * 10000, status: pick(POOL.financeStatus), dueDate: daysAgo(-ri(1, 60)) }),
  );
  db['finance/commission'] = Array.from({ length: 18 }, () =>
    base({ commissionNo: 'TC' + String(ri(100000, 999999)), lawyerName: fullName(), matterName: pick(POOL.caseType) + '一案', amount: ri(1, 80) * 10000, rate: pick(['15%', '20%', '25%', '30%']), status: pick(['待结算', '已审批', '已发放', '已驳回']), settleDate: daysAgo(ri(1, 120)) }),
  );
  db['finance/expense'] = Array.from({ length: 22 }, () =>
    base({ expenseNo: 'BX' + String(ri(100000, 999999)), applicantName: fullName(), category: pick(POOL.expenseCategory), amount: ri(1, 20) * 1000, status: pick(['待审批', '已通过', '已驳回', '已支付']), applyDate: daysAgo(ri(1, 90)), remark: pick(['出差报销', '客户招待', '办公采购']) }),
  );
  db['finance/payment'] = Array.from({ length: 16 }, () =>
    base({ paymentNo: 'SK' + String(ri(100000, 999999)), clientName: companyName(), contractNo: 'HT' + String(ri(100000, 999999)), amount: ri(1, 200) * 10000, payMethod: pick(['银行转账', '支票', '汇票']), payDate: daysAgo(ri(1, 150)), status: pick(['已收款', '部分收款', '待确认']) }),
  );

  // 系统
  const sysUsers = Object.values(DEMO_USERS).map((u) =>
    base({ id: u.userId, username: u.username, realName: u.realName, deptName: u.deptName, roleNames: u.roleNames.join(','), email: u.email, phone: u.phone, status: 'ENABLED' }),
  );
  db['system/user'] = sysUsers.concat(
    Array.from({ length: 20 }, () =>
      base({ username: 'user' + ri(100, 999), realName: fullName(), deptName: pick(POOL.dept), roleNames: pick(POOL.position), email: 'u' + ri(100, 999) + '@lawfirm.demo', phone: '1' + String(ri(3000000000, 5999999999)), status: pick(['ENABLED', 'DISABLED']) }),
    ),
  );
  db['system/role'] = [
    { id: 1, roleName: '超级管理员', roleCode: 'admin', description: '系统最高权限', status: 'ENABLED' },
    { id: 2, roleName: '主任', roleCode: 'director', description: '律所主任', status: 'ENABLED' },
    { id: 3, roleName: '主办律师', roleCode: 'lawyer', description: '办案律师', status: 'ENABLED' },
    { id: 4, roleName: '团队负责人', roleCode: 'leader', description: '团队管理', status: 'ENABLED' },
    { id: 5, roleName: '财务', roleCode: 'finance', description: '财务管理', status: 'ENABLED' },
    { id: 6, roleName: '行政', roleCode: 'staff', description: '行政管理', status: 'ENABLED' },
    { id: 7, roleName: '实习律师', roleCode: 'trainee', description: '实习人员', status: 'ENABLED' },
  ];
  db['system/department'] = POOL.dept.map((d, i) => ({ id: i + 1, deptName: d, parentName: i === 0 ? '无' : '管委会', leader: fullName(), memberCount: ri(3, 20), status: 'ENABLED' }));
  db['system/dict'] = Array.from({ length: 16 }, (_, i) => ({ id: i + 1, dictName: pick(['案件类型', '文书类型', '费用类型', '城市', '行业', '性别', '学历', '民族']), dictCode: 'DICT_' + (i + 1), status: 'ENABLED' }));
  db['system/announcement'] = Array.from({ length: 12 }, () =>
    base({ title: pick(['关于', '通知', '提醒']) + pick(['元旦放假', '年度考核', '系统升级', '培训安排', '费用报销制度']), content: '这是一条演示公告内容，用于展示公告管理模块。', publisher: fullName(), publishTime: dateTimeAgo(ri(1, 60)), level: pick(POOL.announcementLevel) }),
  );
  db['system/log'] = Array.from({ length: 30 }, () =>
    ({ id: nextId(), module: pick(['用户', '角色', '案件', '客户', '财务', '系统']), action: pick(['新增', '修改', '删除', '查询', '导出', '登录']), operator: fullName(), ip: '192.168.' + ri(1, 255) + '.' + ri(1, 255), operateTime: dateTimeAgo(ri(0, 60)), result: pick(['成功', '成功', '成功', '失败']) }),
  );
  db['system/config'] = [
    { id: 1, configKey: 'sys.title', configName: '系统标题', configValue: '智慧律所管理系统', group: '基础' },
    { id: 2, configKey: 'sys.logo', configName: '系统 Logo', configValue: '/logo.png', group: '基础' },
    { id: 3, configKey: 'sys.copyright', configName: '版权信息', configValue: '© 2026 演示版', group: '基础' },
    { id: 4, configKey: 'sys.theme', configName: '默认主题', configValue: 'dark', group: '外观' },
  ];
  db['system/backup'] = Array.from({ length: 8 }, () =>
    ({ id: nextId(), backupNo: 'BK' + String(ri(100000, 999999)), type: pick(['全量', '增量']), size: ri(100, 9000) + 'MB', startTime: dateTimeAgo(ri(1, 60)), status: pick(['成功', '进行中', '失败']), operator: fullName() }),
  );
  db['system/integration'] = [
    { id: 1, name: '企业微信', type: 'wecom', status: 'ENABLED', config: '{}' },
    { id: 2, name: 'MinIO 对象存储', type: 'minio', status: 'ENABLED', config: '{}' },
    { id: 3, name: 'OnlyOffice', type: 'office', status: 'DISABLED', config: '{}' },
  ];

  // 人事
  db['hr/employee'] = Array.from({ length: 30 }, () =>
    base({ employeeNo: 'EMP' + String(ri(1000, 9999)), realName: fullName(), deptName: pick(POOL.dept), position: pick(POOL.position), hireDate: daysAgo(ri(100, 2000)), status: pick(['在职', '试用', '离职']) }),
  );
  db['hr/contract'] = Array.from({ length: 24 }, () =>
    base({ employeeName: fullName(), contractType: pick(['固定期限', '无固定期限', '实习协议']), startDate: daysAgo(ri(100, 1500)), endDate: daysAgo(-ri(100, 1000)), status: pick(['生效中', '已到期', '已解除']) }),
  );
  db['hr/attendance'] = Array.from({ length: 28 }, () =>
    ({ id: nextId(), employeeName: fullName(), date: daysAgo(ri(1, 60)), checkIn: '0' + ri(7, 9) + ':' + String(ri(0, 59)).padStart(2, '0'), checkOut: '1' + ri(7, 9) + ':' + String(ri(0, 59)).padStart(2, '0'), status: pick(['正常', '迟到', '早退', '缺勤']) }),
  );
  db['hr/leave'] = Array.from({ length: 18 }, () =>
    base({ employeeName: fullName(), leaveType: pick(POOL.leaveType), startDate: daysAgo(ri(1, 60)), endDate: daysAgo(ri(1, 55)), days: ri(1, 15), status: pick(['待审批', '已批准', '已驳回']) }),
  );
  db['hr/payroll'] = Array.from({ length: 28 }, () => {
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
  });
  db['hr/performance'] = Array.from({ length: 14 }, () =>
    base({ employeeName: fullName(), period: ri(2024, 2026) + 'Q' + ri(1, 4), score: ri(60, 100), grade: pick(['S', 'A', 'B', 'C']), status: pick(['进行中', '已完成']) }),
  );

  // 行政
  db['admin/asset'] = Array.from({ length: 26 }, () =>
    base({ assetNo: 'ZC' + String(ri(10000, 99999)), assetName: pick(['笔记本电脑', '台式机', '打印机', '投影仪', '办公桌椅', '车辆', '服务器']), category: pick(POOL.assetCategory), ownerName: fullName(), location: pick(POOL.city) + '办公室' + ri(1, 9), value: ri(1, 50) * 1000, purchaseDate: daysAgo(ri(100, 1500)), status: pick(['在用', '闲置', '维修中', '已报废']) }),
  );
  db['admin/meeting-room'] = Array.from({ length: 8 }, () =>
    ({ id: nextId(), roomName: pick(POOL.city) + '会议室' + ri(1, 9), location: ri(1, 9) + '楼', capacity: ri(4, 30), facility: pick(['投影', '视频会议', '白板', '音响']), status: pick(['可用', '占用', '维护中']) }),
  );
  db['admin/letter'] = Array.from({ length: 12 }, () =>
    base({ title: pick(['介绍信', '公函', '调查函']), applicant: fullName(), purpose: pick(['立案', '调查取证', '查询档案']), applyDate: daysAgo(ri(1, 50)), status: pick(['待审批', '已开具', '已作废']) }),
  );
  db['admin/purchase'] = Array.from({ length: 14 }, () =>
    base({ purchaseNo: 'CG' + String(ri(100000, 999999)), itemName: pick(['办公用品', '软件授权', '设备', '耗材']), supplier: companyName(), amount: ri(1, 50) * 1000, applyDate: daysAgo(ri(1, 80)), status: pick(['待审批', '已采购', '已驳回']) }),
  );
  db['admin/supplier'] = Array.from({ length: 10 }, () =>
    ({ id: nextId(), supplierName: companyName(), category: pick(['办公用品', 'IT服务', '印刷', '餐饮']), contactName: fullName(), contactPhone: '1' + String(ri(3000000000, 5999999999)), status: pick(['合作中', '待评估', '已终止']) }),
  );

  // 知识库
  db['knowledge/article'] = Array.from({ length: 20 }, () => {
    const cat = pick(POOL.knowledgeCategory);
    const author = fullName();
    const status = pick(['草稿', '已发布', '已下线']);
    return base({ title: cat + '：' + pick(POOL.caseType) + '实务要点', author, authorName: author, category: cat, categoryName: cat, tags: pick(POOL.knowledgeCategory), views: ri(10, 2000), likes: ri(0, 300), publishTime: daysAgo(ri(1, 300)), status, statusName: status });
  });
  db['knowledge/law'] = Array.from({ length: 18 }, () => {
    const title = pick(['民法典', '民事诉讼法', '公司法', '刑法', '行政处罚法']) + '相关条款解读';
    const cat = pick(['法律', '司法解释', '行政法规']);
    const issuer = pick(['全国人大', '最高法院', '司法部']);
    const status = pick(['生效', '征求意见稿']);
    return base({ title, name: title, category: cat, categoryName: cat, lawTypeName: cat, source: issuer, issuer, issueDate: daysAgo(ri(100, 2000)), effectiveDate: daysAgo(ri(100, 2000)), status, statusName: status });
  });
  db['knowledge/case'] = Array.from({ length: 16 }, () =>
    base({ title: pick(POOL.caseType) + '典型案例评析', caseNo: '(' + ri(2020, 2025) + ')最高法民再' + ri(1, 999) + '号', courtName: pick(POOL.court), tags: pick(POOL.caseType), status: pick(['已发布', '草稿']) }),
  );

  // 工作流
  db['workbench/approval'] = Array.from({ length: 22 }, () =>
    base({ title: pick(['用印申请', '报销申请', '请假申请', '采购申请', '结案申请']), type: pick(['用印', '报销', '请假', '采购', '结案']), applicant: fullName(), amount: ri(1, 50) * 1000, status: pick(['待审批', '已通过', '已驳回', '已撤销']), applyTime: dateTimeAgo(ri(0, 40)), currentNode: pick(['部门负责人', '财务', '主任', '已完成']) }),
  );
  db['workbench/report'] = Array.from({ length: 14 }, () =>
    base({ title: pick(POOL.caseType) + '阶段报告', matterName: pick(POOL.caseType) + '一案', author: fullName(), period: ri(2024, 2026) + '-' + String(ri(1, 12)).padStart(2, '0'), status: pick(['草稿', '已提交', '已审批']) }),
  );
  db['workbench/report-template'] = Array.from({ length: 8 }, () =>
    ({ id: nextId(), templateName: pick(POOL.caseType) + '报告模板', category: pick(['诉讼', '非诉', '顾问']), status: pick(['启用', '停用']) }),
  );
  db['workbench/scheduled-report'] = Array.from({ length: 6 }, () =>
    ({ id: nextId(), name: pick(['周报', '月报', '季报']) + '自动推送', cron: '0 9 * * 1', receivers: fullName(), status: pick(['启用', '停用']) }),
  );

  // 证据
  db['evidence'] = Array.from({ length: 20 }, () =>
    base({ evidenceNo: 'EVD' + String(ri(10000, 99999)), matterName: pick(POOL.caseType) + '一案', name: pick(['合同原件', '转账记录', '聊天记录', '鉴定意见', '现场勘验']), type: pick(['书证', '物证', '电子证据', '鉴定意见']), status: pick(['已采集', '待整理', '已归档']), collectDate: daysAgo(ri(1, 200)), holder: fullName() }),
  );

  // AI
  db['ai/pricing'] = Array.from({ length: 8 }, () =>
    ({ id: nextId(), modelName: pick(['GPT-4o', 'Claude', '通义千问', '文心一言', '智谱GLM']), unit: pick(['千tokens', '次']), price: (ri(1, 100) / 10).toFixed(2), status: pick(['启用', '停用']), effectiveDate: daysAgo(ri(1, 200)) }),
  );
  db['ai/usage'] = Array.from({ length: 24 }, () =>
    ({ id: nextId(), userName: fullName(), model: pick(['GPT-4o', 'Claude', '通义千问']), tokens: ri(1000, 500000), cost: (ri(1, 500) / 10).toFixed(2), date: daysAgo(ri(1, 60)) }),
  );

  // 复数端点别名：部分前端接口使用复数路径（/admin/assets、/admin/suppliers、
  // /admin/purchases、/admin/meeting-records），与种子集合的单数键对齐。
  db['admin/assets'] = db['admin/asset'];
  db['admin/suppliers'] = db['admin/supplier'];
  db['admin/purchases'] = db['admin/purchase'];
  db['admin/meeting-records'] = db['admin/meeting-record'];

  return enrich(db);
}

/* ---------------------------------------------------------------------------
 * IndexedDB 持久化（让演示数据的增删改在刷新后保留，并支持一键重置）
 * ------------------------------------------------------------------------- */
const IDB_NAME = 'lawfirm-demo';
const IDB_STORE = 'kv';
const IDB_KEY = 'db';
let _dbPromise = null;
function openIDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}
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
async function idbDelete(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

let _cache = null; // 内存缓存，避免每次请求都读 IDB
async function getDB() {
  if (_cache) return _cache;
  const stored = await idbGet(IDB_KEY);
  if (stored && stored.version === SW_VERSION) {
    _cache = stored.data;
  } else {
    _cache = buildSeed();
    await idbSet(IDB_KEY, { version: SW_VERSION, data: _cache });
  }
  return _cache;
}
async function saveDB() {
  if (_cache) await idbSet(IDB_KEY, { version: SW_VERSION, data: _cache });
}
async function resetDB() {
  _cache = buildSeed();
  await idbSet(IDB_KEY, { version: SW_VERSION, data: _cache });
  return _cache;
}

/* ---------------------------------------------------------------------------
 * 通用集合路由解析
 * 支持：/x/list、/x、/x/:id、/x/:id/action、/x/sub、/x/sub/list、/x/batch
 * ------------------------------------------------------------------------- */
function knownKeys(db) {
  return Object.keys(db).sort((a, b) => b.length - a.length);
}
function findCollection(db, pathSegs) {
  const keys = knownKeys(db);
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
function resolve(db, path) {
  const segs = path.split('/').filter(Boolean);
  const found = findCollection(db, segs);
  if (!found) {
    // 未知集合：以"去掉末尾 list 后缀"的路径作为集合名；其余视为集合根
    let coll = segs.join('/');
    let rest = [];
    if (LIST_SUFFIX.includes(segs[segs.length - 1])) {
      coll = segs.slice(0, -1).join('/');
      rest = ['list'];
    }
    if (!db[coll]) db[coll] = [];
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
  const { key, rest } = resolve(db, apiPath);
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
      permissions: u.permissions,
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
    return { accessToken: token, refreshToken: token, expiresIn: 3600, permissions: u.permissions, realName: u.realName, roles: u.roles, userId: u.userId, username: u.username };
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
      permissions: u.permissions,
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
  if (apiPath === '/system/menu/user') {
    return buildMenu();
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
    return list;
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
    return jsonEnvelope(data, true, 'ok');
  } catch (e) {
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
