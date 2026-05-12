import React from 'react';

export default function Cart({ onCheckout }: { onCheckout?: () => void }) {
  return (
    <div className="antialiased bg-background text-on-background min-h-full flex flex-col">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-surface-dim shadow-sm sticky top-0 w-full z-50 flex justify-between items-center px-md py-sm h-[72px] shrink-0">
        <div className="flex items-center gap-sm">
          <span className="text-headline-md font-headline-md font-bold text-primary">橙意外卖</span>
        </div>
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer scale-98 active:opacity-80 transition-transform">search</span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer scale-98 active:opacity-80 transition-transform">notifications</span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer scale-98 active:opacity-80 transition-transform">shopping_cart</span>
        </div>
      </header>

      {/* Main Content: Cart Groups */}
      <main className="px-md flex flex-col gap-md max-w-container-max-pc mx-auto w-full flex-1 py-md">
        {/* Cart Group 1 */}
        <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(31,41,55,0.04)] p-md flex flex-col gap-sm border border-surface-variant/30">
          {/* Merchant Header */}
          <div className="flex items-center justify-between border-b border-surface-variant/20 pb-sm">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">storefront</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">老刘家招牌牛肉面</h2>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
            </div>
          </div>

          {/* Item List */}
          <div className="flex flex-col gap-md pt-sm">
            {/* Item 1 */}
            <div className="flex gap-sm items-start">
              <div className="w-20 h-20 rounded-lg bg-surface-container overflow-hidden shrink-0 shadow-sm">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjhddn4-UF7tkwx1LPbkF1rTLmeROde5tRBZredp1XcIEMwVr4UbezTRnaC7-9OHSYLshLjJUkzqJ0em4Jspdz9NqiHJSNTQmzKAHxKK-eiRf-Al_8rfmD36ogxHWRHCpqeGXPFAD6bOY1ebtvaVS2IQ7yz8VyMmnxRQRkFnUEPuWQ8nP1Mbaz03nB24IC_QOzvmJCXQf2PcnBs2gyn3PmkJIl5Q_xvLsvk7w6vD4szNfHNpX1UaeYnY41sDTiNtcgePR8tsaxA_XM')" }}></div>
              </div>
              <div className="flex flex-col flex-grow justify-between min-h-[80px]">
                <div>
                  <h3 className="font-body-lg text-body-lg text-on-surface font-semibold">招牌红烧牛肉面</h3>
                  <p className="font-label-md text-label-md text-on-surface-variant mt-1">大份 / 微辣</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-headline-sm text-headline-sm text-primary">¥28.5</span>
                  <div className="flex items-center gap-xs">
                    <button className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="font-body-md text-body-md w-6 text-center">1</span>
                    <button className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:opacity-90 transition-opacity">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="flex flex-col gap-xs pt-sm border-t border-surface-variant/20 mt-xs">
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">包装费</span>
              <span className="font-body-md text-body-md text-on-surface">¥2.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">配送费</span>
              <span className="font-body-md text-body-md text-on-surface">¥3.5</span>
            </div>
          </div>
        </section>

        {/* Cart Group 2 */}
        <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(31,41,55,0.04)] p-md flex flex-col gap-sm border border-surface-variant/30">
          {/* Merchant Header */}
          <div className="flex items-center justify-between border-b border-surface-variant/20 pb-sm">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">storefront</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">COFFEE SPACE 咖啡空间</h2>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
            </div>
          </div>

          {/* Item List */}
          <div className="flex flex-col gap-md pt-sm">
            {/* Item 1 */}
            <div className="flex gap-sm items-start">
              <div className="w-20 h-20 rounded-lg bg-surface-container overflow-hidden shrink-0 shadow-sm">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbxGPkrE1Ogr30S8HpeMPfxBsO_L1E6T8_rOP_nxgGFu08ImKxcxlmbfy8Em1S1VUHhJ7xuoRwfN_47Cxq9H4OiMYMvNS_QYuw95rsNdOuGMphbmPUc9-XT7OvUzazsxK2kdQKM1Bgr1_XbnDPDH8RYv3aAuAQzplxcKOjDWBeUFoLccsztiiRORrkBuUqZOR5u3jTNb_KaSTJG4g57zR9Hlgp6u_B75aXlXAtk36npSYewA9OsAHEJ6TJwxgAbGqBKWPzBvl8gfR3')" }}></div>
              </div>
              <div className="flex flex-col flex-grow justify-between min-h-[80px]">
                <div>
                  <h3 className="font-body-lg text-body-lg text-on-surface font-semibold">冰生椰拿铁</h3>
                  <p className="font-label-md text-label-md text-on-surface-variant mt-1">标准冰 / 半糖</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-headline-sm text-headline-sm text-primary">¥19.0</span>
                  <div className="flex items-center gap-xs">
                    <button className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="font-body-md text-body-md w-6 text-center">2</span>
                    <button className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:opacity-90 transition-opacity">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="flex flex-col gap-xs pt-sm border-t border-surface-variant/20 mt-xs">
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">包装费</span>
              <span className="font-body-md text-body-md text-on-surface">¥1.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">配送费</span>
              <span className="font-body-md text-body-md text-on-surface">¥0.0 <span className="text-xs text-primary bg-primary/10 px-1 rounded ml-1">免外送费</span></span>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Checkout Bar */}
      <div className="sticky bottom-0 w-full bg-surface-container-lowest border-t border-surface-variant shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-md py-sm flex justify-between items-center z-40 shrink-0 mt-auto">
        <div className="flex items-end gap-xs">
          <span className="font-body-md text-body-md text-on-surface-variant mb-1">合计:</span>
          <span className="font-display-lg text-display-lg text-primary leading-none">¥73.0</span>
        </div>
        <button onClick={onCheckout} className="bg-primary-container text-on-primary text-headline-sm font-headline-sm px-xl py-sm rounded-full shadow-md scale-98 active:opacity-80 transition-transform">
          去结算(3)
        </button>
      </div>
    </div>
  );
}
