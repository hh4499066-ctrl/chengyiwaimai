import React from 'react';
import { notify } from '../utils/toast';

export default function Profile({
  onLogout,
  goOrders,
  goAddress,
  goCoupons,
  goReviews,
  onSearch,
  onMessage,
  onCart,
}: {
  onLogout?: () => void;
  goOrders?: () => void;
  goAddress?: () => void;
  goCoupons?: () => void;
  goReviews?: () => void;
  onSearch?: () => void;
  onMessage?: () => void;
  onCart?: () => void;
}) {
  const tip = notify;
  return (
    <div className="liquid-stage bg-surface text-on-surface font-body-md min-h-screen pb-[100px] md:bg-surface-container-low relative overflow-hidden">
      {/* TopAppBar Shared Component */}
      <header className="liquid-glass fixed top-0 w-full z-50 flex justify-between items-center px-md py-sm md:hidden">
        <div className="text-headline-md font-headline-md font-bold text-primary">橙意外卖</div>
        <div className="flex items-center gap-sm">
          <button onClick={onSearch} aria-label="搜索" className="liquid-button text-primary dark:text-primary-fixed-dim hover:bg-surface-variant transition-colors scale-98 active:opacity-80 p-2 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button onClick={onMessage} aria-label="消息中心" className="liquid-button text-primary dark:text-primary-fixed-dim hover:bg-surface-variant transition-colors scale-98 active:opacity-80 p-2 rounded-full flex items-center justify-center relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button onClick={onCart} aria-label="购物车" className="liquid-button text-primary dark:text-primary-fixed-dim hover:bg-surface-variant transition-colors scale-98 active:opacity-80 p-2 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">shopping_cart</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="max-w-[600px] mx-auto pt-[72px] md:pt-xl px-md flex flex-col gap-xl">
        {/* User Profile Header */}
        <section onClick={() => tip('用户：mONESY，手机：138****5678')} className="liquid-card motion-enter flex items-center gap-md p-md rounded-xl cursor-pointer active:scale-[0.98] transition-transform">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-surface-variant shrink-0 border-2 border-surface">
            <img alt="用户头像" className="w-full h-full object-cover" src="/user-avatar.jpg" />
          </div>
          <div className="flex-grow flex flex-col justify-center">
            <h1 className="gold-sparkle-text font-headline-sm text-headline-sm font-bold">mONESY</h1>
            <div className="flex items-center gap-xs mt-xs">
              <span className="font-body-md text-body-md text-on-surface-variant">138****5678</span>
              <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </section>

        {/* Data Overview Bento Grid */}
        <section className="grid grid-cols-3 gap-sm stagger-children">
          <button onClick={() => tip('账户余额可用于模拟支付，演示环境不产生真实扣款。')} className="liquid-card liquid-button p-md rounded-xl flex flex-col items-center justify-center text-center active:bg-surface-variant transition-colors cursor-pointer">
            <span className="font-headline-md text-headline-md text-primary font-bold">128.5</span>
            <span className="font-label-md text-label-md text-on-surface-variant mt-xs">账户余额(元)</span>
          </button>
          <button onClick={goCoupons} className="liquid-card liquid-button p-md rounded-xl flex flex-col items-center justify-center text-center active:bg-surface-variant transition-colors cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-error text-on-error font-label-md text-[10px] px-2 py-0.5 rounded-bl-lg">即将过期</div>
            <span className="font-headline-md text-headline-md text-primary font-bold">5</span>
            <span className="font-label-md text-label-md text-on-surface-variant mt-xs">优惠券(张)</span>
          </button>
          <button onClick={() => tip('积分可用于兑换优惠券，当前演示积分 3450。')} className="liquid-card liquid-button p-md rounded-xl flex flex-col items-center justify-center text-center active:bg-surface-variant transition-colors cursor-pointer">
            <span className="font-headline-md text-headline-md text-primary font-bold">3450</span>
            <span className="font-label-md text-label-md text-on-surface-variant mt-xs">积分</span>
          </button>
        </section>

        {/* Common Functions */}
        <section className="liquid-card rounded-xl overflow-hidden">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold p-md border-b border-surface-variant">常用功能</h2>
          <div className="grid grid-cols-4 gap-sm p-sm stagger-children">
            <button onClick={goAddress} className="liquid-button flex flex-col items-center gap-sm p-sm hover:bg-surface-container transition-colors rounded-lg cursor-pointer active:scale-[0.96]">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[24px]">location_on</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">我的地址</span>
            </button>
            <button onClick={goReviews} className="liquid-button flex flex-col items-center gap-sm p-sm hover:bg-surface-container transition-colors rounded-lg cursor-pointer active:scale-[0.96]">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">star_rate</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">我的评价</span>
            </button>
            <button onClick={() => tip('我的收藏功能开发中')} className="liquid-button flex flex-col items-center gap-sm p-sm hover:bg-surface-container transition-colors rounded-lg cursor-pointer active:scale-[0.96]">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[24px]">favorite</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">我的收藏</span>
            </button>
            <button onClick={() => tip('客服电话：400-800-2026')} className="liquid-button flex flex-col items-center gap-sm p-sm hover:bg-surface-container transition-colors rounded-lg cursor-pointer active:scale-[0.96]">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">客服中心</span>
            </button>
          </div>
        </section>

        {/* Promotional Banner (Bento Style) */}
        <section onClick={() => tip('邀请码：CY2026，邀请好友下单可得模拟现金券。')} className="liquid-glass bg-gradient-to-r from-primary-container to-primary-fixed rounded-xl p-md flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform motion-float">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-primary-container font-bold">邀请好友得现金</h3>
            <p className="font-body-md text-body-md text-on-primary-container mt-xs opacity-90">最高可得 ¥50 无门槛红包</p>
          </div>
          <button onClick={(event) => { event.stopPropagation(); tip('邀请码：CY2026'); }} className="liquid-button bg-surface text-primary font-label-md text-label-md font-bold px-4 py-2 rounded-full shadow-sm hover:bg-surface-bright transition-colors">去邀请</button>
        </section>

        {/* Settings & Logout */}
        <section className="liquid-card rounded-xl overflow-hidden flex flex-col mb-xl">
          <button onClick={() => tip('系统设置：演示版暂支持消息与隐私偏好预览。')} className="liquid-button w-full flex items-center justify-between p-md border-b border-surface-variant hover:bg-surface-container transition-colors cursor-pointer active:bg-surface-variant">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
              <span className="font-body-lg text-body-lg text-on-surface">系统设置</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
          <button onClick={() => tip('帮助与反馈：可联系 400-800-2026。')} className="liquid-button w-full flex items-center justify-between p-md border-b border-surface-variant hover:bg-surface-container transition-colors cursor-pointer active:bg-surface-variant">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-on-surface-variant">help_center</span>
              <span className="font-body-lg text-body-lg text-on-surface">帮助与反馈</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
          <button onClick={onLogout} className="liquid-button flex items-center justify-center p-md hover:bg-error-container transition-colors cursor-pointer active:bg-error/10 group">
            <span className="font-body-lg text-body-lg text-error group-hover:font-bold transition-all">退出登录</span>
          </button>
        </section>
      </main>
    </div>
  );
}
