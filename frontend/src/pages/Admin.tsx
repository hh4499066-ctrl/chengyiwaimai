import React, { useState } from 'react';
import { AdminModule } from './management/ManagementPanels';

// === SUBCOMPONENTS (Matching Admin HTMLs) ===

function AdminDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-md md:p-lg pt-[80px] md:pt-lg bg-surface">
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">全局数据看板</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">平台实时运营状态监控</p>
        </div>
        <div className="hidden md:flex items-center gap-md">
          <button className="bg-surface-container-high text-on-surface-variant px-md py-sm rounded-lg font-body-md text-body-md flex items-center gap-sm hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-sm">calendar_month</span>今日数据<span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
          <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-body-md text-body-md flex items-center gap-sm hover:opacity-90 transition-opacity shadow-sm">
            <span className="material-symbols-outlined text-sm">download</span>导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {/* Metric Cards */}
        {[
          { title: "平台总流水 (今日)", value: "¥ 1,248,590", m: "+12.5%", c: "primary", icon: "account_balance_wallet" },
          { title: "今日订单总数", value: "45,210", m: "+8.2%", c: "secondary", icon: "receipt_long" },
          { title: "活跃用户数", value: "128,400", m: "+5.1%", c: "tertiary", icon: "group" },
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
              <h3 className="font-headline-md text-headline-md text-error mt-xs">84</h3>
            </div>
            <div className="bg-error/10 p-sm rounded-lg text-error">
              <span className="material-symbols-outlined fill">warning</span>
            </div>
          </div>
          <div className="mt-lg z-10 pl-sm flex items-center gap-xs">
            <span className="font-label-md text-label-md text-error">需立即介入处理</span>
            <span className="material-symbols-outlined text-error text-sm ml-auto cursor-pointer">arrow_forward</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl mb-xl">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_16px_rgba(31,41,55,0.04)] border border-outline-variant/30 flex flex-col">
          <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">平台近一个月交易额增长曲线</h3>
            <div className="flex gap-sm">
              <button className="font-label-md text-label-md px-sm py-xs rounded bg-surface-variant text-on-surface">近30天</button>
              <button className="font-label-md text-label-md px-sm py-xs rounded text-on-surface-variant hover:bg-surface-variant">本周</button>
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

function AdminMerchantAudit() {
  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto p-lg bg-surface flex flex-col gap-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-1">商家入驻审核</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">管理并审核新商家的入驻申请与资质资料。</p>
        </div>
      </div>
      <section className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_24px_rgba(31,41,55,0.02)] border border-outline-variant/20 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md text-on-surface-variant">搜索商家</label>
            <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span><input className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="商家名称 / 申请ID" type="text"/></div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md text-on-surface-variant">申请时间</label>
            <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_today</span><select className="w-full pl-9 pr-8 py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-colors"><option>全部时间</option></select></div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md text-on-surface-variant">商家类别</label>
            <div className="relative"><select className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none appearance-none"><option>全部类别</option></select></div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md text-on-surface-variant">审核状态</label>
            <div className="relative"><select className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none appearance-none"><option>全部状态</option></select></div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <button className="px-5 py-2 rounded-lg font-label-md text-primary border border-primary/30 hover:bg-primary/5 transition-colors">重置条件</button>
          <button className="px-5 py-2 rounded-lg font-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm scale-98 active:opacity-80">筛选结果</button>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(31,41,55,0.02)] border border-outline-variant/20 overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/40">
                {['申请 ID', '商家名称', '负责人', '联系方式', '提交时间', '状态', '操作'].map((th, i) => (
                  <th key={i} className={`p-4 font-label-md text-on-surface-variant font-medium ${i===6?'text-right':''}`}>{th}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body-md text-on-surface divide-y divide-outline-variant/20">
              <tr className="hover:bg-surface-variant/20 transition-colors group">
                <td className="p-4 font-mono text-sm text-on-surface-variant">#REQ-8832</td>
                <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary-container"><span className="material-symbols-outlined text-[18px]">local_dining</span></div><span className="font-medium text-on-surface">老王家手工水饺 (天河店)</span></div></td>
                <td className="p-4">王建国</td><td className="p-4">138****9921</td><td className="p-4 text-on-surface-variant">2023-10-24 14:30</td>
                <td className="p-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary-fixed-dim font-label-md"><span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span>待审核</span></td>
                <td className="p-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button className="px-3 py-1.5 rounded text-primary hover:bg-primary/10 font-label-md transition-colors">查看资料</button><button className="px-3 py-1.5 rounded bg-primary text-on-primary font-label-md shadow-sm hover:bg-primary/90 transition-colors">立即审核</button></div></td>
              </tr>
              <tr className="hover:bg-surface-variant/20 transition-colors bg-surface-bright group">
                <td className="p-4 font-mono text-sm text-on-surface-variant">#REQ-8829</td>
                <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">coffee</span></div><span className="font-medium text-on-surface">星语咖啡馆</span></div></td>
                <td className="p-4">李芳</td><td className="p-4">139****4455</td><td className="p-4 text-on-surface-variant">2023-10-23 09:15</td>
                <td className="p-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error font-label-md"><span className="w-1.5 h-1.5 rounded-full bg-error"></span>已驳回</span></td>
                <td className="p-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button className="px-3 py-1.5 rounded text-on-surface-variant hover:bg-surface-variant font-label-md transition-colors">查看详情</button><button className="px-3 py-1.5 rounded text-primary hover:bg-primary/10 font-label-md transition-colors">重新审核</button></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AdminRiderAudit() {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-surface relative">
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md px-lg py-md flex items-center justify-between shadow-sm">
        <h2 className="font-headline-md text-on-background">骑手审核</h2>
      </header>
      <div className="p-lg space-y-lg max-w-container-max-pc mx-auto w-full">
        <section className="bg-surface-container-lowest rounded-xl p-md shadow-[rgba(31,41,55,0.04)_0_4px_12px_0] border border-outline-variant/20 flex flex-wrap gap-md items-end">
          <div className="flex flex-col gap-xs flex-1 min-w-[200px]"><label className="font-label-md text-on-surface-variant">骑手姓名</label><input className="w-full rounded-lg border-outline-variant/50 bg-surface focus:border-primary-container px-3 py-2" placeholder="输入真实姓名"/></div>
          <div className="flex flex-col gap-xs flex-1 min-w-[200px]"><label className="font-label-md text-on-surface-variant">注册手机号</label><input className="w-full rounded-lg border-outline-variant/50 bg-surface px-3 py-2" placeholder="输入手机号码"/></div>
          <div className="flex gap-sm"><button className="px-lg py-2 bg-primary-container text-on-primary rounded-lg font-body-md shadow-sm">查询</button><button className="px-lg py-2 bg-primary/10 text-primary rounded-lg font-body-md">重置</button></div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl shadow-[rgba(31,41,55,0.04)_0_4px_12px_0] border border-outline-variant/20 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary"></div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface border-b border-outline-variant/30">
                  <th className="font-label-md text-on-surface-variant py-md px-lg font-semibold pl-xl">骑手 ID</th><th className="font-label-md text-on-surface-variant py-md px-md font-semibold">姓名</th><th className="font-label-md text-on-surface-variant py-md px-md font-semibold">注册时间</th><th className="font-label-md text-on-surface-variant py-md px-md font-semibold">身份证</th><th className="font-label-md text-on-surface-variant py-md px-md font-semibold">驾驶证</th><th className="font-label-md text-on-surface-variant py-md px-lg font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="font-body-md">
                <tr className="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
                  <td className="py-sm px-lg pl-xl text-on-surface">RD-20231001</td><td className="py-sm px-md text-on-surface font-medium">张三</td><td className="py-sm px-md text-on-surface-variant">2023-10-24 09:30</td>
                  <td className="py-sm px-md"><span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 待审核</span></td>
                  <td className="py-sm px-md"><span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 待审核</span></td>
                  <td className="py-sm px-lg text-right space-x-2"><button className="text-primary hover:underline font-body-md">查看原件</button><button className="text-tertiary hover:underline font-body-md">通过审核</button><button className="text-error hover:underline font-body-md">标记违规</button></td>
                </tr>
                <tr className="bg-surface-bright border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
                  <td className="py-sm px-lg pl-xl text-on-surface">RD-20231002</td><td className="py-sm px-md text-on-surface font-medium">李四</td><td className="py-sm px-md text-on-surface-variant">2023-10-23 14:15</td>
                  <td className="py-sm px-md"><span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-[#E6F4EA] text-[#137333] font-label-md"><span className="w-1.5 h-1.5 rounded-full bg-[#137333]"></span> 已认证</span></td>
                  <td className="py-sm px-md"><span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-[#E6F4EA] text-[#137333] font-label-md"><span className="w-1.5 h-1.5 rounded-full bg-[#137333]"></span> 已认证</span></td>
                  <td className="py-sm px-lg text-right space-x-2"><button className="text-primary hover:underline font-body-md">查看原件</button><button className="text-on-surface-variant opacity-50 cursor-not-allowed font-body-md" disabled>已通过</button><button className="text-error hover:underline font-body-md">标记违规</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
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
        {activeTab === 'merchant_audit' && <AdminMerchantAudit />}
        {activeTab === 'rider_audit' && <AdminRiderAudit />}
        {['users', 'orders', 'marketing', 'settings'].includes(activeTab) && <AdminModule type={activeTab} />}
      </div>
    </div>
  );
}
