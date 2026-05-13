import React, { useState } from 'react';
import { AdminModule } from './management/ManagementPanels';
import { api, type AdminDashboard as AdminDashboardData, type AdminMerchant, type AdminUser } from '../api/client';

// === SUBCOMPONENTS (Matching Admin HTMLs) ===

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData>({ todayGmv: 0, todayOrders: 0, activeUsers: 0, todayExceptionOrders: 0, totalGmv: 0, totalOrders: 0, totalExceptionOrders: 0 });
  const [scope, setScope] = useState<'today' | 'total'>('today');
  const [chartRange, setChartRange] = useState<'month' | 'week'>('month');

  React.useEffect(() => {
    api.getAdminDashboard().then(setDashboard).catch(() => undefined);
  }, []);

  const exportCsv = () => {
    const rows = [
      ['metric', 'value'],
      ['gmv', scope === 'today' ? dashboard.todayGmv : dashboard.totalGmv ?? dashboard.todayGmv],
      ['orders', scope === 'today' ? dashboard.todayOrders : dashboard.totalOrders ?? dashboard.todayOrders],
      ['activeUsers', dashboard.activeUsers],
      ['exceptionOrders', scope === 'today' ? dashboard.todayExceptionOrders ?? 0 : dashboard.totalExceptionOrders ?? 0],
    ];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `chengyi-dashboard-${scope}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-md md:p-lg pt-[80px] md:pt-lg bg-surface">
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">全局数据看板</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">平台实时运营状态监控</p>
        </div>
        <div className="hidden md:flex items-center gap-md">
          <button onClick={() => setScope((value) => value === 'today' ? 'total' : 'today')} className="bg-surface-container-high text-on-surface-variant px-md py-sm rounded-lg font-body-md text-body-md flex items-center gap-sm hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-sm">calendar_month</span>{scope === 'today' ? '今日数据' : '累计数据'}<span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
          <button onClick={exportCsv} className="bg-primary text-on-primary px-md py-sm rounded-lg font-body-md text-body-md flex items-center gap-sm hover:opacity-90 transition-opacity shadow-sm">
            <span className="material-symbols-outlined text-sm">download</span>导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {/* Metric Cards */}
        {[
          { title: scope === 'today' ? "今日GMV" : "累计GMV", value: `¥ ${Number(scope === 'today' ? dashboard.todayGmv : dashboard.totalGmv ?? dashboard.todayGmv).toFixed(2)}`, m: "真实接口", c: "primary", icon: "account_balance_wallet" },
          { title: scope === 'today' ? "今日订单" : "累计订单", value: String(scope === 'today' ? dashboard.todayOrders : dashboard.totalOrders ?? dashboard.todayOrders), m: "真实接口", c: "secondary", icon: "receipt_long" },
          { title: "活跃用户数", value: String(dashboard.activeUsers), m: "状态正常用户", c: "tertiary", icon: "group" },
        ].map((item, idx) => (
          <div key={idx} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_16px_rgba(31,41,55,0.04)] border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group">
            <div className={`absolute left-0 top-0 bottom-0 w-[4px] bg-${item.c}`}></div>
            <div className="flex justify-between items-start z-10 pl-sm">
              <div>
                <p className="font-body-md text-body-md text-on-surface-variant">{item.title}</p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-xs">{item.value}</h3>
              </div>
              <div className={`bg-${item.c}/10 p-sm rounded-lg text-${item.c}`}>
                <span className="material-symbols-outlined fill">{item.icon}</span>
              </div>
            </div>
            <div className="mt-lg z-10 pl-sm flex items-center gap-xs">
              <span className={`material-symbols-outlined text-${item.c} text-sm`}>trending_up</span>
              <span className={`font-label-md text-label-md text-${item.c}`}>{item.m}</span>
              <span className="font-label-md text-label-md text-on-surface-variant ml-xs">较昨日</span>
            </div>
          </div>
        ))}
        {/* Alert Metric */}
        <div className="bg-error-container rounded-xl p-md shadow-[0_4px_16px_rgba(31,41,55,0.04)] border border-error/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-error"></div>
          <div className="flex justify-between items-start z-10 pl-sm">
            <div>
              <p className="font-body-md text-body-md text-on-error-container">异常订单预警</p>
              <h3 className="font-headline-md text-headline-md text-error mt-xs">{scope === 'today' ? dashboard.todayExceptionOrders ?? 0 : dashboard.totalExceptionOrders ?? 0}</h3>
            </div>
            <div className="bg-error/10 p-sm rounded-lg text-error">
              <span className="material-symbols-outlined fill">warning</span>
            </div>
          </div>
          <div className="mt-lg z-10 pl-sm flex items-center gap-xs">
            <span className="font-label-md text-label-md text-error">需立即介入处理</span>
            <button onClick={() => window.alert('已打开异常订单筛选：已取消/异常订单')} className="material-symbols-outlined text-error text-sm ml-auto cursor-pointer">arrow_forward</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl mb-xl">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_16px_rgba(31,41,55,0.04)] border border-outline-variant/30 flex flex-col">
          <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">平台近一个月交易额增长曲线</h3>
            <div className="flex gap-sm">
              <button onClick={() => setChartRange('month')} className={`font-label-md text-label-md px-sm py-xs rounded ${chartRange === 'month' ? 'bg-surface-variant text-on-surface' : 'text-on-surface-variant hover:bg-surface-variant'}`}>近30天</button>
              <button onClick={() => setChartRange('week')} className={`font-label-md text-label-md px-sm py-xs rounded ${chartRange === 'week' ? 'bg-surface-variant text-on-surface' : 'text-on-surface-variant hover:bg-surface-variant'}`}>本周</button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] relative mt-md flex items-end">
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-on-surface-variant font-label-md text-label-md pb-[30px]">
              <span>1.5M</span><span>1.0M</span><span>0.5M</span><span>0</span>
            </div>
            <div className="absolute left-[40px] right-0 top-0 bottom-[30px] flex flex-col justify-between">
              {[...Array(4)].map((_,i)=><div key={i} className="border-b border-outline-variant/30 w-full h-[1px]"></div>)}
            </div>
            <div className="absolute left-[40px] right-0 bottom-[30px] top-[20px] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-t from-primary/20 to-transparent" style={{ clipPath: "polygon(0 100%, 0 80%, 10% 70%, 20% 75%, 30% 60%, 40% 50%, 50% 55%, 60% 40%, 70% 45%, 80% 30%, 90% 20%, 100% 10%, 100% 100%)"}}></div>
              <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 L10,70 L20,75 L30,60 L40,50 L50,55 L60,40 L70,45 L80,30 L90,20 L100,10" fill="none" stroke="#ab3500" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
              </svg>
            </div>
            <div className="absolute bottom-0 left-[40px] right-0 flex justify-between text-on-surface-variant font-label-md text-label-md pt-sm">
              <span>10/01</span><span>10/07</span><span>10/14</span><span>10/21</span><span>10/28</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-md">
          {/* Leaderboard 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_16px_rgba(31,41,55,0.04)] border border-outline-variant/30 flex-1 flex flex-col">
            <div className="flex items-center gap-sm mb-md pb-sm border-b border-outline-variant">
              <span className="material-symbols-outlined text-secondary-container fill">local_fire_department</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">成交额最高商家榜</h3>
            </div>
            <div className="flex flex-col gap-sm flex-1">
              {[
                { n: "金牌烤鸭店", o: "1,204", v: "¥ 45,890", c: "primary" },
                { n: "川香人家", o: "980", v: "¥ 38,200", c: "secondary-container" },
                { n: "绿叶轻食", o: "856", v: "¥ 29,450", c: "outline" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-sm group hover:bg-surface-variant/50 rounded-lg px-sm -mx-sm transition-colors">
                  <div className="flex items-center gap-sm">
                    <span className={`font-headline-sm text-headline-sm text-${item.c} w-[24px]`}>{idx+1}</span>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface font-semibold">{item.n}</p>
                      <p className="font-label-md text-label-md text-on-surface-variant">订单量: {item.o}</p>
                    </div>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">{item.v}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Leaderboard 2 */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_16px_rgba(31,41,55,0.04)] border border-outline-variant/30 flex-1 flex flex-col">
            <div className="flex items-center gap-sm mb-md pb-sm border-b border-outline-variant">
              <span className="material-symbols-outlined text-tertiary fill">electric_moped</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">派单效率最高骑手榜</h3>
            </div>
            <div className="flex flex-col gap-sm flex-1">
              {[
                { name: "王师傅", r: "99.8%", val: "128单", char:"王" },
                { name: "李师傅", r: "99.5%", val: "115单", char:"李" }
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between py-sm group hover:bg-surface-variant/50 rounded-lg px-sm -mx-sm transition-colors">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-tertiary-container/30 flex items-center justify-center text-on-surface font-semibold">{r.char}</div>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface font-semibold">{r.name}</p>
                      <p className="font-label-md text-label-md text-on-surface-variant">准时率: {r.r}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">{r.val}</span>
                    <p className="font-label-md text-label-md text-tertiary">日均</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-xl md:hidden"></div>
    </div>
  );
}

function AdminMerchantAuditLive() {
  const [items, setItems] = useState<AdminMerchant[]>([]);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const refresh = () => api.getAdminMerchants().then(setItems).catch(() => setItems([]));
  React.useEffect(() => { refresh(); }, []);
  const shown = items.filter((item) => !keyword || item.name.includes(keyword) || item.category.includes(keyword));
  const audit = (item: AdminMerchant, status: string) => api.adminAudit('merchants', item.id, status).then(refresh);
  return (
    <div className="flex-1 overflow-y-auto p-lg bg-surface space-y-md">
      <header><h1 className="font-headline-md text-headline-md font-bold">商家入驻审核</h1><p className="text-on-surface-variant">真实读取商家列表，支持筛选、查看、通过和驳回。</p></header>
      <section className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/20 flex gap-sm">
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="flex-1 rounded-lg border border-outline-variant p-sm" placeholder="商家名称 / 类别" />
        <button onClick={() => setKeyword('')} className="px-md py-sm rounded-lg border border-primary/30 text-primary">重置条件</button>
      </section>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead><tr className="bg-surface-container-low text-on-surface-variant"><th className="p-md">商家</th><th className="p-md">类别</th><th className="p-md">电话</th><th className="p-md">审核</th><th className="p-md text-right">操作</th></tr></thead>
          <tbody>{shown.map((item) => <tr key={item.id} className="border-t border-outline-variant/20"><td className="p-md">{item.name}</td><td className="p-md">{item.category}</td><td className="p-md">{item.phone}</td><td className="p-md">{item.auditStatus}</td><td className="p-md text-right"><button onClick={() => setModal(JSON.stringify(item, null, 2))} className="text-primary mr-sm">查看资料</button><button onClick={() => audit(item, 'approved')} className="text-tertiary mr-sm">通过</button><button onClick={() => audit(item, 'rejected')} className="text-error">驳回</button></td></tr>)}</tbody>
        </table>
      </div>
      {modal && <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-lg"><div className="bg-surface rounded-2xl p-lg max-w-lg w-full"><pre className="whitespace-pre-wrap">{modal}</pre><button onClick={() => setModal(null)} className="mt-md w-full bg-primary text-on-primary rounded-lg py-sm">关闭</button></div></div>}
    </div>
  );
}

function AdminRiderAuditLive() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const refresh = () => api.getAdminRiders().then(setItems).catch(() => setItems([]));
  React.useEffect(() => { refresh(); }, []);
  const shown = items.filter((item) => !keyword || item.name.includes(keyword) || item.phone.includes(keyword));
  const audit = (item: AdminUser, status: string) => api.adminAudit('riders', item.id, status).then(refresh);
  return (
    <div className="flex-1 overflow-y-auto p-lg bg-surface space-y-md">
      <header><h1 className="font-headline-md text-headline-md font-bold">骑手审核</h1><p className="text-on-surface-variant">真实读取骑手账号，支持查询、查看原件、通过和标记违规。</p></header>
      <section className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/20 flex gap-sm">
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="flex-1 rounded-lg border border-outline-variant p-sm" placeholder="骑手姓名 / 手机号" />
        <button onClick={() => setKeyword('')} className="px-md py-sm rounded-lg border border-primary/30 text-primary">重置</button>
      </section>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead><tr className="bg-surface-container-low text-on-surface-variant"><th className="p-md">骑手</th><th className="p-md">手机号</th><th className="p-md">角色</th><th className="p-md">状态</th><th className="p-md text-right">操作</th></tr></thead>
          <tbody>{shown.map((item) => <tr key={item.id} className="border-t border-outline-variant/20"><td className="p-md">{item.name}</td><td className="p-md">{item.phone}</td><td className="p-md">{item.role}</td><td className="p-md">{item.status}</td><td className="p-md text-right"><button onClick={() => setModal(JSON.stringify(item, null, 2))} className="text-primary mr-sm">查看原件</button><button onClick={() => audit(item, 'approved')} className="text-tertiary mr-sm">通过审核</button><button onClick={() => audit(item, 'disabled')} className="text-error">标记违规</button></td></tr>)}</tbody>
        </table>
      </div>
      {modal && <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-lg"><div className="bg-surface rounded-2xl p-lg max-w-lg w-full"><pre className="whitespace-pre-wrap">{modal}</pre><button onClick={() => setModal(null)} className="mt-md w-full bg-primary text-on-primary rounded-lg py-sm">关闭</button></div></div>}
    </div>
  );
}

// === MAIN ADMIN COMPONENT ===

export default function Admin({ setRole }: { setRole: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const logout = () => {
    localStorage.removeItem('chengyi_token');
    localStorage.removeItem('chengyi_role');
    setRole();
  };

  return (
    <div className="bg-surface text-on-surface h-screen flex overflow-hidden w-full">
      <nav className="hidden md:flex flex-col h-screen sticky top-0 p-md bg-surface-container-low h-full w-[240px] flex-shrink-0 border-r border-outline-variant">
        <div className="mb-lg">
          <h1 className="font-headline-sm text-headline-sm text-primary font-bold">橙意外卖后台管理端</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">超级管理员模式</p>
        </div>
        <div className="flex flex-col gap-sm flex-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: 'dashboard', label: '数据看板' },
            { id: 'merchant_audit', icon: 'storefront', label: '商家审核' },
            { id: 'rider_audit', icon: 'sports_motorsports', label: '骑手审核' },
            { id: 'users', icon: 'group', label: '用户管理' },
            { id: 'orders', icon: 'monitor', label: '订单监控' },
            { id: 'marketing', icon: 'campaign', label: '营销管理' },
            { id: 'settings', icon: 'settings', label: '系统设置' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-md px-md py-sm rounded-lg font-body-md text-body-md transition-all ${
                activeTab === t.id ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === t.id ? 'fill' : ''}`}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-auto pt-md border-t border-outline-variant">
          <button onClick={logout} className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant hover:text-on-surface hover:bg-primary/10 hover:text-primary transition-all rounded-lg font-body-md text-body-md">
            <span className="material-symbols-outlined">logout</span>
            退出登录
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-md py-sm bg-surface shadow-sm">
          <span className="text-headline-md font-headline-md font-bold text-primary">橙意外卖 Admin</span>
          <button onClick={logout} className="material-symbols-outlined text-primary">logout</button>
        </header>
        
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'merchant_audit' && <AdminMerchantAuditLive />}
        {activeTab === 'rider_audit' && <AdminRiderAuditLive />}
        {['users', 'orders', 'marketing', 'settings'].includes(activeTab) && <AdminModule type={activeTab} />}
      </div>
    </div>
  );
}
