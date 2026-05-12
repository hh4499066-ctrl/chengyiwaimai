import React from 'react';

export default function Message() {
  return (
    <div className="bg-background min-h-screen text-on-background pb-[90px] pt-[64px]">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-md py-sm bg-surface shadow-sm">
        <div className="text-headline-md font-headline-md font-bold text-primary">橙意外卖</div>
        <div className="flex gap-md items-center">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors scale-98 active:opacity-80 transition-transform">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors scale-98 active:opacity-80 transition-transform">
            <span className="material-symbols-outlined text-primary">shopping_cart</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-md flex flex-col gap-lg mt-md">
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">消息中心</h1>
          <button className="font-label-md text-label-md text-primary flex items-center gap-xs pb-1">
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>done_all</span>
            全部已读
          </button>
        </div>

        {/* Quick Filters (Bento Row) */}
        <div className="flex gap-sm overflow-x-auto no-scrollbar pb-xs">
          <button className="flex items-center gap-sm px-4 py-2 bg-primary-container text-on-primary-container rounded-full font-label-md text-label-md shadow-sm shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>inbox</span>
            全部消息
          </button>
          <button className="flex items-center gap-sm px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-variant transition-colors shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>local_shipping</span>
            订单动态
          </button>
          <button className="flex items-center gap-sm px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-variant transition-colors shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>campaign</span>
            系统通知
          </button>
        </div>

        {/* Unread Priority Card (Bento Style) */}
        <div className="bg-gradient-to-br from-primary-container to-surface-container-high rounded-xl p-md shadow-[0_4px_12px_rgba(255,107,53,0.15)] relative overflow-hidden active:scale-98 transition-transform">
          <div className="absolute -right-4 -top-4 opacity-10">
            <span className="material-symbols-outlined" style={{ fontSize: "100px" }}>local_shipping</span>
          </div>
          <div className="relative z-10 flex gap-md items-center">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-xs">
                <h3 className="font-headline-sm text-headline-sm text-on-primary-container font-bold">订单正在派送中</h3>
                <div className="w-2 h-2 rounded-full bg-error"></div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1">您的订单 #88291 骑手已在您楼下，请准备取餐。</p>
            </div>
          </div>
          <div className="mt-sm pt-sm border-t border-outline-variant/30 flex justify-between items-center z-10 relative">
            <span className="font-label-md text-label-md text-on-surface-variant">2分钟前</span>
            <span className="font-label-md text-label-md text-primary font-bold flex items-center">查看详情 <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span></span>
          </div>
        </div>

        {/* Standard Message List */}
        <div className="flex flex-col gap-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">近期消息</h2>
          
          {/* Message Item: Customer Service */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_2px_8px_rgba(31,41,55,0.04)] flex gap-md items-start active:scale-[0.98] transition-transform cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-xs">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">专属客服 小橙</h3>
                <span className="font-label-md text-label-md text-on-surface-variant">10:42</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">您好，关于您反馈的餐品少漏发问题，商家已经为您发起了退款申请，请注意查收微信支付通知。</p>
            </div>
          </div>

          {/* Message Item: Promotion */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_2px_8px_rgba(31,41,55,0.04)] flex gap-md items-start active:scale-[0.98] transition-transform cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-error-container" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-xs">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">周末狂欢红包</h3>
                <span className="font-label-md text-label-md text-on-surface-variant">昨天</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1">送您一张满50减20的专属周末神券，快来享受美食吧！</p>
            </div>
          </div>

          {/* Message Item: System */}
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_2px_8px_rgba(31,41,55,0.04)] flex gap-md items-start active:scale-[0.98] transition-transform cursor-pointer opacity-70">
            <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-xs">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">系统升级通知</h3>
                <span className="font-label-md text-label-md text-on-surface-variant">周二</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1">为了提供更好的服务，我们将于今晚凌晨进行系统维护升级。</p>
            </div>
          </div>
        </div>

        <div className="text-center py-md mb-xl">
          <span className="font-label-md text-label-md text-outline">没有更多消息了</span>
        </div>
      </main>
    </div>
  );
}
