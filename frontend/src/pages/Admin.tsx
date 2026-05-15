import React, { useState } from 'react';
import { AdminModule } from './management/ManagementPanels';
import { api, type AdminDashboard as AdminDashboardData, type AdminMerchant, type AdminUser } from '../api/client';
import { notify } from '../utils/toast';

// === SUBCOMPONENTS (Matching Admin HTMLs) ===

type Tone = 'primary' | 'secondary' | 'tertiary' | 'error';

const toneClasses: Record<Tone, { bar: string; icon: string; text: string }> = {
  primary: { bar: 'bg-primary', icon: 'bg-primary/10 text-primary', text: 'text-primary' },
  secondary: { bar: 'bg-secondary', icon: 'bg-secondary/10 text-secondary', text: 'text-secondary' },
  tertiary: { bar: 'bg-tertiary', icon: 'bg-tertiary/10 text-tertiary', text: 'text-tertiary' },
  error: { bar: 'bg-error', icon: 'bg-error/10 text-error', text: 'text-error' },
};

function LoadingCard() {
  return (
    <div className="liquid-card rounded-xl p-md animate-pulse">
      <div className="h-4 w-24 rounded bg-outline-variant/50" />
      <div className="mt-sm h-7 w-32 rounded bg-outline-variant/40" />
      <div className="mt-lg h-3 w-28 rounded bg-outline-variant/30" />
    </div>
  );
}

function RejectReasonModal({ title, defaultValue, onCancel, onSubmit }: { title: string; defaultValue: string; onCancel: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState(defaultValue);
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg">
      <div className="liquid-glass modal-surface rounded-2xl p-lg max-w-lg w-full space-y-md motion-enter">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">填写原因后会同步给申请方，便于补充资料后重新提交。</p>
        </div>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">驳回原因</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-xs w-full min-h-28 rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary"
          />
        </label>
        <div className="flex justify-end gap-sm">
          <button onClick={onCancel} className="liquid-button px-md py-sm rounded-lg border border-outline-variant text-on-surface-variant">取消</button>
          <button disabled={!reason.trim()} onClick={() => onSubmit(reason.trim())} className="liquid-button px-md py-sm rounded-lg bg-error text-on-error disabled:opacity-50">确认驳回</button>
        </div>
      </div>
    </div>
  );
}

function formatShortMoney(value: number) {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(1)}万`;
  }
  return `¥${value.toFixed(0)}`;
}

function buildLinePoints(values: number[], maxValue: number) {
  if (values.length <= 1) {
    return values.length === 1 ? `0,${100 - (values[0] / maxValue) * 90}` : '';
  }
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 90;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData>({ todayGmv: 0, todayOrders: 0, activeUsers: 0, todayExceptionOrders: 0, totalGmv: 0, totalOrders: 0, totalExceptionOrders: 0 });
  const [scope, setScope] = useState<'today' | 'total'>('today');
  const [chartRange, setChartRange] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    api.getAdminDashboard().then(setDashboard).catch(() => undefined).finally(() => setLoading(false));
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
  const trend = chartRange === 'week' ? (dashboard.dailyTrend || []).slice(-7) : dashboard.dailyTrend || [];
  const trendValues = trend.map((item) => Number(item.gmv || 0));
  const maxGmv = Math.max(1, ...trendValues);
  const linePoints = buildLinePoints(trendValues, maxGmv);
  const areaPoints = linePoints ? `0,100 ${linePoints} 100,100` : '';
  const yLabels = [maxGmv, maxGmv * 2 / 3, maxGmv / 3, 0].map(formatShortMoney);
  const xLabels = trend.filter((_, index) => trend.length <= 7 || index % Math.max(1, Math.floor(trend.length / 4)) === 0 || index === trend.length - 1);
  const merchantRanking = dashboard.merchantRanking || [];
  const riderRanking = dashboard.riderRanking || [];

  return (
    <div className="liquid-stage flex-1 overflow-y-auto p-md md:p-lg pt-[80px] md:pt-lg bg-surface relative">
      <div className="flex justify-between items-end mb-xl motion-enter">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">全局数据看板</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">平台实时运营状态监控</p>
        </div>
        <div className="hidden md:flex items-center gap-md">
          <button onClick={() => setScope((value) => value === 'today' ? 'total' : 'today')} className="liquid-button liquid-card text-on-surface-variant px-md py-sm rounded-lg font-body-md text-body-md flex items-center gap-sm hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-sm">calendar_month</span>{scope === 'today' ? '今日数据' : '累计数据'}<span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
          <button onClick={exportCsv} className="liquid-button bg-primary text-on-primary px-md py-sm rounded-lg font-body-md text-body-md flex items-center gap-sm hover:opacity-90 transition-opacity shadow-sm">
            <span className="material-symbols-outlined text-sm">download</span>导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl stagger-children">
        {/* Metric Cards */}
        {loading && [...Array(3)].map((_, index) => <LoadingCard key={index} />)}
        {!loading && ([
          { title: scope === 'today' ? "今日GMV" : "累计GMV", value: `¥ ${Number(scope === 'today' ? dashboard.todayGmv : dashboard.totalGmv ?? dashboard.todayGmv).toFixed(2)}`, m: "真实接口", c: "primary" as Tone, icon: "account_balance_wallet" },
          { title: scope === 'today' ? "今日订单" : "累计订单", value: String(scope === 'today' ? dashboard.todayOrders : dashboard.totalOrders ?? dashboard.todayOrders), m: "真实接口", c: "secondary" as Tone, icon: "receipt_long" },
          { title: "活跃用户数", value: String(dashboard.activeUsers), m: "状态正常用户", c: "tertiary" as Tone, icon: "group" },
        ]).map((item, idx) => (
          <div key={idx} className="liquid-card motion-border-glow rounded-xl p-md flex flex-col justify-between relative overflow-hidden group">
            <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${toneClasses[item.c].bar}`}></div>
            <div className="flex justify-between items-start z-10 pl-sm">
              <div>
                <p className="font-body-md text-body-md text-on-surface-variant">{item.title}</p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-xs">{item.value}</h3>
              </div>
              <div className={`${toneClasses[item.c].icon} p-sm rounded-lg`}>
                <span className="material-symbols-outlined fill">{item.icon}</span>
              </div>
            </div>
            <div className="mt-lg z-10 pl-sm flex items-center gap-xs">
              <span className={`material-symbols-outlined ${toneClasses[item.c].text} text-sm`}>trending_up</span>
              <span className={`font-label-md text-label-md ${toneClasses[item.c].text}`}>{item.m}</span>
              <span className="font-label-md text-label-md text-on-surface-variant ml-xs">较昨日</span>
            </div>
          </div>
        ))}
        {/* Alert Metric */}
        <div className="liquid-card motion-border-glow bg-error-container/80 rounded-xl p-md border border-error/20 flex flex-col justify-between relative overflow-hidden group">
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
            <button onClick={() => notify('已打开异常订单筛选：已取消/异常订单')} aria-label="查看异常订单" className="material-symbols-outlined text-error text-sm ml-auto cursor-pointer">arrow_forward</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl mb-xl">
        <div className="liquid-card motion-border-glow lg:col-span-2 rounded-xl p-lg flex flex-col motion-enter">
          <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">平台交易额趋势</h3>
            <div className="flex gap-sm">
              <button onClick={() => setChartRange('month')} className={`font-label-md text-label-md px-sm py-xs rounded ${chartRange === 'month' ? 'bg-surface-variant text-on-surface' : 'text-on-surface-variant hover:bg-surface-variant'}`}>近30天</button>
              <button onClick={() => setChartRange('week')} className={`font-label-md text-label-md px-sm py-xs rounded ${chartRange === 'week' ? 'bg-surface-variant text-on-surface' : 'text-on-surface-variant hover:bg-surface-variant'}`}>本周</button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] relative mt-md flex items-end">
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-on-surface-variant font-label-md text-label-md pb-[30px]">
              {yLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
            </div>
            <div className="absolute left-[40px] right-0 top-0 bottom-[30px] flex flex-col justify-between">
              {[...Array(4)].map((_,i)=><div key={i} className="border-b border-outline-variant/30 w-full h-[1px]"></div>)}
            </div>
            <div className="absolute left-[40px] right-0 bottom-[30px] top-[20px] overflow-hidden">
              {linePoints ? (
                <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polygon points={areaPoints} fill="rgba(37,99,235,0.16)" />
                  <polyline className="motion-trace" points={linePoints} fill="none" stroke="#2563eb" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  {trendValues.map((value, index) => {
                    const x = trendValues.length <= 1 ? 0 : (index / (trendValues.length - 1)) * 100;
                    const y = 100 - (value / maxGmv) * 90;
                    return <circle key={`${trend[index]?.date}-${index}`} cx={x} cy={y} r="1.8" fill="#2563eb" />;
                  })}
                </svg>
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant">暂无交易数据</div>
              )}
            </div>
            <div className="absolute bottom-0 left-[40px] right-0 flex justify-between text-on-surface-variant font-label-md text-label-md pt-sm">
              {xLabels.map((item, index) => <span key={`${item.date}-${index}`}>{item.label}</span>)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-md">
          {/* Leaderboard 1 */}
          <div className="liquid-card motion-border-glow rounded-xl p-md flex-1 flex flex-col">
            <div className="flex items-center gap-sm mb-md pb-sm border-b border-outline-variant">
              <span className="material-symbols-outlined text-secondary-container fill">local_fire_department</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">成交额最高商家榜</h3>
            </div>
            <div className="flex flex-col gap-sm flex-1 stagger-children">
              {merchantRanking.length === 0 && <p className="text-on-surface-variant text-body-md">暂无成交数据</p>}
              {merchantRanking.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-sm group hover:bg-surface-variant/50 rounded-lg px-sm -mx-sm transition-colors">
                  <div className="flex items-center gap-sm">
                    <span className="font-headline-sm text-headline-sm text-primary w-[24px]">{idx+1}</span>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface font-semibold">{item.name}</p>
                      <p className="font-label-md text-label-md text-on-surface-variant">订单量: {item.orders}</p>
                    </div>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">¥ {Number(item.gmv).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Leaderboard 2 */}
          <div className="liquid-card motion-border-glow rounded-xl p-md flex-1 flex flex-col">
            <div className="flex items-center gap-sm mb-md pb-sm border-b border-outline-variant">
              <span className="material-symbols-outlined text-tertiary fill">electric_moped</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">派单效率最高骑手榜</h3>
            </div>
            <div className="flex flex-col gap-sm flex-1 stagger-children">
              {riderRanking.length === 0 && <p className="text-on-surface-variant text-body-md">暂无完成订单数据</p>}
              {riderRanking.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-sm group hover:bg-surface-variant/50 rounded-lg px-sm -mx-sm transition-colors">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-tertiary-container/30 flex items-center justify-center text-on-surface font-semibold">{r.name.slice(0, 1)}</div>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface font-semibold">{r.name}</p>
                      <p className="font-label-md text-label-md text-on-surface-variant">配送收入: ¥ {Number(r.income).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">{r.completedOrders}单</span>
                    <p className="font-label-md text-label-md text-tertiary">已完成</p>
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
  const [rejecting, setRejecting] = useState<AdminMerchant | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = () => api.getAdminMerchants().then(setItems).catch(() => setItems([]));
  React.useEffect(() => { refresh().finally(() => setLoading(false)); }, []);
  const shown = items.filter((item) => !keyword || item.name.includes(keyword) || item.category.includes(keyword));
  const audit = (item: AdminMerchant, status: string, rejectReason = '') => api.adminAudit('merchants', item.id, status, rejectReason).then(refresh);
  return (
    <div className="liquid-stage flex-1 overflow-y-auto p-lg bg-surface space-y-md relative">
      <header className="motion-enter"><h1 className="font-headline-md text-headline-md font-bold">商家入驻审核</h1><p className="text-on-surface-variant">真实读取商家列表，支持筛选、查看、通过和驳回。</p></header>
      <section className="liquid-card motion-border-glow rounded-xl p-md flex gap-sm">
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="flex-1 rounded-lg border border-outline-variant p-sm" placeholder="商家名称 / 类别" aria-label="筛选商家名称或类别" />
        <button onClick={() => setKeyword('')} className="liquid-button px-md py-sm rounded-lg border border-primary/30 text-primary">重置条件</button>
      </section>
      <div className="liquid-card motion-border-glow rounded-xl overflow-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead><tr className="bg-surface-container-low text-on-surface-variant"><th className="p-md">商家</th><th className="p-md">类别</th><th className="p-md">电话</th><th className="p-md">审核</th><th className="p-md text-right">操作</th></tr></thead>
          <tbody className="stagger-children">
            {loading && [...Array(3)].map((_, index) => <tr key={index} className="border-t border-outline-variant/20"><td className="p-md" colSpan={5}><div className="h-5 rounded bg-outline-variant/30 animate-pulse" /></td></tr>)}
            {!loading && shown.map((item) => <tr key={item.id} className="border-t border-outline-variant/20 hover:bg-surface-variant/20 transition-colors"><td className="p-md">{item.name}</td><td className="p-md">{item.category}</td><td className="p-md">{item.phone}</td><td className="p-md">{item.auditStatus}</td><td className="p-md text-right"><button onClick={() => setModal(JSON.stringify(item, null, 2))} className="text-primary mr-sm">查看资料</button><button onClick={() => audit(item, 'approved')} className="text-tertiary mr-sm">通过</button><button onClick={() => setRejecting(item)} className="text-error">驳回</button></td></tr>)}
          </tbody>
        </table>
        {!loading && shown.length === 0 && <p className="p-lg text-center text-on-surface-variant">暂无匹配商家</p>}
      </div>
      {modal && <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg"><div className="liquid-glass modal-surface rounded-2xl p-lg max-w-lg w-full motion-enter"><pre className="whitespace-pre-wrap">{modal}</pre><button onClick={() => setModal(null)} className="liquid-button mt-md w-full bg-primary text-on-primary rounded-lg py-sm">关闭</button></div></div>}
      {rejecting && <RejectReasonModal title={`驳回 ${rejecting.name}`} defaultValue="资料不完整，请补充后重新提交" onCancel={() => setRejecting(null)} onSubmit={(reason) => audit(rejecting, 'rejected', reason).then(() => setRejecting(null))} />}
    </div>
  );
}

function AdminRiderAuditLive() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = () => api.getAdminRiders().then(setItems).catch(() => setItems([]));
  React.useEffect(() => { refresh().finally(() => setLoading(false)); }, []);
  const shown = items.filter((item) => !keyword || item.name.includes(keyword) || item.phone.includes(keyword));
  const audit = (item: AdminUser, status: string, rejectReason = '') => api.adminAudit('riders', item.id, status, rejectReason).then(refresh);
  return (
    <div className="liquid-stage flex-1 overflow-y-auto p-lg bg-surface space-y-md relative">
      <header className="motion-enter"><h1 className="font-headline-md text-headline-md font-bold">骑手审核</h1><p className="text-on-surface-variant">真实读取骑手账号，支持查询、查看原件、通过和标记违规。</p></header>
      <section className="liquid-card motion-border-glow rounded-xl p-md flex gap-sm">
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="flex-1 rounded-lg border border-outline-variant p-sm" placeholder="骑手姓名 / 手机号" aria-label="筛选骑手姓名或手机号" inputMode="search" />
        <button onClick={() => setKeyword('')} className="liquid-button px-md py-sm rounded-lg border border-primary/30 text-primary">重置</button>
      </section>
      <div className="liquid-card motion-border-glow rounded-xl overflow-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead><tr className="bg-surface-container-low text-on-surface-variant"><th className="p-md">骑手</th><th className="p-md">手机号</th><th className="p-md">角色</th><th className="p-md">状态</th><th className="p-md text-right">操作</th></tr></thead>
          <tbody className="stagger-children">
            {loading && [...Array(3)].map((_, index) => <tr key={index} className="border-t border-outline-variant/20"><td className="p-md" colSpan={5}><div className="h-5 rounded bg-outline-variant/30 animate-pulse" /></td></tr>)}
            {!loading && shown.map((item) => <tr key={item.id} className="border-t border-outline-variant/20 hover:bg-surface-variant/20 transition-colors"><td className="p-md">{item.name}</td><td className="p-md">{item.phone}</td><td className="p-md">{item.role}</td><td className="p-md">{item.status}</td><td className="p-md text-right"><button onClick={() => setModal(JSON.stringify(item, null, 2))} className="text-primary mr-sm">查看原件</button><button onClick={() => audit(item, 'approved')} className="text-tertiary mr-sm">通过审核</button><button onClick={() => setRejecting(item)} className="text-error">驳回</button></td></tr>)}
          </tbody>
        </table>
        {!loading && shown.length === 0 && <p className="p-lg text-center text-on-surface-variant">暂无匹配骑手</p>}
      </div>
      {modal && <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg"><div className="liquid-glass modal-surface rounded-2xl p-lg max-w-lg w-full motion-enter"><pre className="whitespace-pre-wrap">{modal}</pre><button onClick={() => setModal(null)} className="liquid-button mt-md w-full bg-primary text-on-primary rounded-lg py-sm">关闭</button></div></div>}
      {rejecting && <RejectReasonModal title={`驳回 ${rejecting.name}`} defaultValue="认证资料不完整，请补充后重新提交" onCancel={() => setRejecting(null)} onSubmit={(reason) => audit(rejecting, 'rejected', reason).then(() => setRejecting(null))} />}
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
    <div className="liquid-stage bg-surface text-on-surface h-screen flex overflow-hidden w-full relative">
      <nav className="liquid-glass hidden md:flex flex-col h-screen sticky top-0 p-md h-full w-[240px] flex-shrink-0 border-r border-outline-variant/60 shadow-[8px_0_30px_rgba(15,23,42,0.04)]">
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
                activeTab === t.id ? 'bg-primary text-on-primary shadow-md motion-pulse-ring' : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === t.id ? 'fill' : ''}`}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-auto pt-md border-t border-outline-variant">
          <button onClick={logout} className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all rounded-lg font-body-md text-body-md">
            <span className="material-symbols-outlined">logout</span>
            退出登录
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-md py-sm bg-surface shadow-sm">
          <span className="text-headline-md font-headline-md font-bold text-primary">橙意外卖 Admin</span>
          <button onClick={logout} aria-label="退出登录" className="material-symbols-outlined text-primary">logout</button>
        </header>
        
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'merchant_audit' && <AdminMerchantAuditLive />}
        {activeTab === 'rider_audit' && <AdminRiderAuditLive />}
        {['users', 'orders', 'marketing', 'settings'].includes(activeTab) && <AdminModule type={activeTab} />}
      </div>
    </div>
  );
}
