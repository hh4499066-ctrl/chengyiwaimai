import React from 'react';

export default function Profile() {
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen pb-[100px] md:bg-surface-container-low">
      {/* TopAppBar Shared Component */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-md py-sm bg-surface dark:bg-surface-dim shadow-sm md:hidden">
        <div className="text-headline-md font-headline-md font-bold text-primary">橙意外卖</div>
        <div className="flex items-center gap-sm">
          <button className="text-primary dark:text-primary-fixed-dim hover:bg-surface-variant transition-colors scale-98 active:opacity-80 p-2 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="text-primary dark:text-primary-fixed-dim hover:bg-surface-variant transition-colors scale-98 active:opacity-80 p-2 rounded-full flex items-center justify-center relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="text-primary dark:text-primary-fixed-dim hover:bg-surface-variant transition-colors scale-98 active:opacity-80 p-2 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">shopping_cart</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="max-w-[600px] mx-auto pt-[72px] md:pt-xl px-md flex flex-col gap-xl">
        {/* User Profile Header */}
        <section className="flex items-center gap-md p-md rounded-xl bg-surface-container-lowest shadow-[0_4px_16px_rgba(171,53,0,0.04)] cursor-pointer active:scale-[0.98] transition-transform">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-surface-variant shrink-0 border-2 border-surface">
            <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqTBjewwX8_IlzAdREkDmGzJk5C_Ap3wRFHJ62oQydrpw1p5tKVOvB-fNTxDEDaq79Uk5Toefyhg2jbN6N6rYXjo0Hz7P9RLoxrUPc8Ux_ShkOgeXbNos2Lvql3VvEBVAKMjWoVk6i4cvWQtSFeKYPyL0p8Y_SahCBujllWIEKwdLkRyOeZQWuBp65802C8sRpfmM82vmKl9atWFupINo89stEt_S0RdUG8B_qZ4QrbAgLWSMbFdoPH_-xYfAUQxmwXC3DaJF9ICx9" />
          </div>
          <div className="flex-grow flex flex-col justify-center">
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">美食探索家</h1>
            <div className="flex items-center gap-xs mt-xs">
              <span className="font-body-md text-body-md text-on-surface-variant">138****5678</span>
              <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </section>

        {/* Data Overview Bento Grid */}
        <section className="grid grid-cols-3 gap-sm">
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_4px_12px_rgba(171,53,0,0.03)] flex flex-col items-center justify-center text-center active:bg-surface-variant transition-colors cursor-pointer">
            <span className="font-headline-md text-headline-md text-primary font-bold">128.5</span>
            <span className="font-label-md text-label-md text-on-surface-variant mt-xs">账户余额(元)</span>
          </div>
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_4px_12px_rgba(171,53,0,0.03)] flex flex-col items-center justify-center text-center active:bg-surface-variant transition-colors cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-error text-on-error font-label-md text-[10px] px-2 py-0.5 rounded-bl-lg">即将过期</div>
            <span className="font-headline-md text-headline-md text-primary font-bold">5</span>
            <span className="font-label-md text-label-md text-on-surface-variant mt-xs">优惠券(张)</span>
          </div>
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_4px_12px_rgba(171,53,0,0.03)] flex flex-col items-center justify-center text-center active:bg-surface-variant transition-colors cursor-pointer">
            <span className="font-headline-md text-headline-md text-primary font-bold">3450</span>
            <span className="font-label-md text-label-md text-on-surface-variant mt-xs">积分</span>
          </div>
        </section>

        {/* Common Functions */}
        <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(171,53,0,0.03)] overflow-hidden">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold p-md border-b border-surface-variant">常用功能</h2>
          <div className="grid grid-cols-4 gap-sm p-sm">
            <div className="flex flex-col items-center gap-sm p-sm hover:bg-surface-container transition-colors rounded-lg cursor-pointer active:scale-[0.96]">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[24px]">location_on</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">我的地址</span>
            </div>
            <div className="flex flex-col items-center gap-sm p-sm hover:bg-surface-container transition-colors rounded-lg cursor-pointer active:scale-[0.96]">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">star_rate</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">我的评价</span>
            </div>
            <div className="flex flex-col items-center gap-sm p-sm hover:bg-surface-container transition-colors rounded-lg cursor-pointer active:scale-[0.96]">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[24px]">favorite</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">我的收藏</span>
            </div>
            <div className="flex flex-col items-center gap-sm p-sm hover:bg-surface-container transition-colors rounded-lg cursor-pointer active:scale-[0.96]">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">客服中心</span>
            </div>
          </div>
        </section>

        {/* Promotional Banner (Bento Style) */}
        <section className="bg-gradient-to-r from-primary-container to-primary-fixed rounded-xl p-md flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-primary-container font-bold">邀请好友得现金</h3>
            <p className="font-body-md text-body-md text-on-primary-container mt-xs opacity-90">最高可得 ¥50 无门槛红包</p>
          </div>
          <button className="bg-surface text-primary font-label-md text-label-md font-bold px-4 py-2 rounded-full shadow-sm hover:bg-surface-bright transition-colors">去邀请</button>
        </section>

        {/* Settings & Logout */}
        <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(171,53,0,0.03)] overflow-hidden flex flex-col mb-xl">
          <div className="flex items-center justify-between p-md border-b border-surface-variant hover:bg-surface-container transition-colors cursor-pointer active:bg-surface-variant">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
              <span className="font-body-lg text-body-lg text-on-surface">系统设置</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </div>
          <div className="flex items-center justify-between p-md border-b border-surface-variant hover:bg-surface-container transition-colors cursor-pointer active:bg-surface-variant">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-on-surface-variant">help_center</span>
              <span className="font-body-lg text-body-lg text-on-surface">帮助与反馈</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </div>
          <div className="flex items-center justify-center p-md hover:bg-error-container transition-colors cursor-pointer active:bg-error/10 group">
            <span className="font-body-lg text-body-lg text-error group-hover:font-bold transition-all">退出登录</span>
          </div>
        </section>
      </main>
    </div>
  );
}
