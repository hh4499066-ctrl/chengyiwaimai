import React, { useEffect, useState } from 'react';
import { api, type Merchant } from '../api/client';
import { merchants as mockMerchants } from '../mock/data';

const merchantImages = mockMerchants.map((merchant) => merchant.image);

function enrichMerchant(merchant: Merchant, index: number): Required<Merchant> {
  const fallback = mockMerchants[index % mockMerchants.length];
  return {
    id: merchant.id,
    name: merchant.name,
    category: merchant.category || fallback.category,
    rating: Number(merchant.rating ?? fallback.rating),
    monthlySales: merchant.monthlySales ?? fallback.monthlySales,
    distance: merchant.distance || fallback.distance,
    deliveryTime: merchant.deliveryTime || fallback.deliveryTime,
    minOrder: merchant.minOrder ?? fallback.minOrder,
    deliveryFee: merchant.deliveryFee ?? fallback.deliveryFee,
    image: merchant.image || merchantImages[index % merchantImages.length],
    tags: merchant.tags?.length ? merchant.tags : fallback.tags,
  };
}

export default function Home({
  onSearch,
  onMerchantClick,
}: {
  onSearch?: () => void;
  onMerchantClick?: (merchantId: number) => void;
}) {
  const [merchantList, setMerchantList] = useState<Required<Merchant>[]>(() => mockMerchants.map(enrichMerchant));

  useEffect(() => {
    api
      .getMerchants()
      .then((items) => setMerchantList(items.map(enrichMerchant)))
      .catch(() => setMerchantList(mockMerchants.map(enrichMerchant)));
  }, []);

  const openMerchant = (merchantId: number) => onMerchantClick?.(merchantId);

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen relative pb-[80px]">
      <div className="px-md pt-lg pb-sm sticky top-0 z-40 bg-surface/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-sm">
          <div className="flex items-center gap-xs text-primary font-bold">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <span className="font-headline-sm text-headline-sm">学校东门</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined text-[24px] text-on-surface-variant">notifications</span>
            <span className="absolute top-0 right-0 w-[8px] h-[8px] bg-error rounded-full border-2 border-surface"></span>
          </div>
        </div>
        <div className="bg-surface-variant/50 rounded-full flex items-center px-md py-sm">
          <span className="material-symbols-outlined text-on-surface-variant mr-sm">search</span>
          <input onFocus={onSearch} className="bg-transparent border-none outline-none w-full text-on-surface-variant placeholder-on-surface-variant/70 font-body-md text-body-md focus:ring-0 p-0" placeholder="想吃点什么？" type="text" />
          <button onClick={onSearch} className="border-l border-outline-variant pl-sm ml-sm flex items-center gap-xs text-primary">
            <span className="font-label-md text-label-md whitespace-nowrap">搜索</span>
          </button>
        </div>
      </div>

      <main className="px-md flex flex-col gap-xl">
        <section>
          <div className="rounded-xl overflow-hidden relative h-[120px] shadow-sm">
            <img alt="Promotional Banner" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCihXBrd-0UItFM-Yiu3QOqH37n_5cNULD6qxy5fo0oUpLU3mH-TGvlIgXpB6giecj3kk_nEDqNbg_LL3U3eTKZbCrRzhbYaIzRiZa5NfvDsAWuK6NjxZgZPLUimszObbDEp0MFBYe4w8yJ9uszNzoVYVob2871RC9RhbFobXcav-CR11EZyycvY3manTDl5JWp5wa3KUwHxP4wp49IV-A6-PfOTOBf7sh2sakkKJNT7IeIr1Ur6A7K60ywGNozAeUhYMjEJiuF1g_e" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-container/90 to-transparent flex flex-col justify-center p-md">
              <span className="font-headline-md text-headline-md text-on-primary font-bold mb-xs">新人首单立减</span>
              <span className="font-body-md text-body-md text-on-primary/90 bg-on-primary-container/20 w-fit px-sm py-xs rounded-lg backdrop-blur-sm">最高可减 ¥20</span>
            </div>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-4 gap-sm">
            {[
              ['restaurant', '美食', '#FFF4E0'],
              ['local_cafe', '甜点饮品', '#FCE4EC'],
              ['fastfood', '汉堡披萨', '#EFEBE9'],
              ['local_pizza', '快餐简餐', '#FBE9E7'],
              ['ramen_dining', '日韩料理', '#E1F5FE'],
              ['local_convenience_store', '超市便利', '#F5F5DC'],
              ['cruelty_free', '生鲜果蔬', '#E8F5E9'],
              ['more_horiz', '全部分类', '#F5F5F5'],
            ].map(([icon, label, color]) => (
              <div key={label} className="flex flex-col items-center gap-xs">
                <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: color }}>
                  <span className="material-symbols-outlined text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-sm">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">附近好店推荐</h2>
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center">查看更多 <span className="material-symbols-outlined text-[16px]">chevron_right</span></span>
          </div>
          <div className="flex gap-sm overflow-x-auto hide-scrollbar pb-xs -mx-md px-md">
            {merchantList.slice(0, 4).map((merchant) => (
              <button key={merchant.id} onClick={() => openMerchant(merchant.id)} className="text-left min-w-[240px] bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden flex-shrink-0 border border-outline-variant/30 active:scale-[0.98] transition-transform">
                <div className="h-[120px] relative">
                  <img alt={merchant.name} className="w-full h-full object-cover" src={merchant.image} />
                  <div className="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur-sm px-xs py-[2px] rounded font-label-md text-label-md text-on-surface flex items-center gap-[2px]">
                    <span className="material-symbols-outlined text-[14px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {merchant.rating}
                  </div>
                </div>
                <div className="p-sm">
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">{merchant.name}</h3>
                  <div className="flex items-center gap-xs mt-xs text-on-surface-variant font-label-md text-label-md">
                    <span>起送 ¥{merchant.minOrder}</span>
                    <span className="w-[3px] h-[3px] bg-outline rounded-full"></span>
                    <span>{merchant.deliveryFee === 0 ? '免配送费' : `配送 ¥${merchant.deliveryFee}`}</span>
                    <span className="w-[3px] h-[3px] bg-outline rounded-full"></span>
                    <span>{merchant.deliveryTime}</span>
                  </div>
                  <div className="mt-sm flex gap-xs">
                    {merchant.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-primary-container/20 text-primary font-label-md text-label-md px-xs py-[2px] rounded text-[10px]">{tag}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="pb-xl">
          <div className="sticky top-[140px] bg-surface z-30 py-sm mb-sm flex gap-md border-b border-outline-variant/20">
            <button className="font-body-lg text-body-lg font-bold text-on-surface border-b-2 border-primary pb-xs">综合排序</button>
            <button className="font-body-lg text-body-lg text-on-surface-variant pb-xs">销量优先</button>
            <button className="font-body-lg text-body-lg text-on-surface-variant pb-xs">距离最近</button>
          </div>
          <div className="flex flex-col gap-md">
            {merchantList.map((merchant) => (
              <button key={merchant.id} onClick={() => openMerchant(merchant.id)} className="w-full text-left flex gap-sm p-sm bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_rgba(31,41,55,0.04)] border border-outline-variant/20 active:scale-[0.98] transition-transform">
                <div className="w-[88px] h-[88px] rounded-lg overflow-hidden flex-shrink-0">
                  <img alt={merchant.name} className="w-full h-full object-cover" src={merchant.image} />
                </div>
                <div className="flex flex-col flex-grow justify-between py-xs min-w-0">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">{merchant.name}</h3>
                    <div className="flex items-center gap-xs mt-[2px]">
                      <div className="flex items-center text-secondary-container">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-label-md text-label-md text-on-surface ml-[2px]">{merchant.rating}</span>
                      </div>
                      <span className="text-on-surface-variant font-label-md text-label-md ml-xs">月售 {merchant.monthlySales}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-sm">
                    <div className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md">
                      <span>起送 ¥{merchant.minOrder}</span>
                      <span>{merchant.deliveryFee === 0 ? '免配送费' : `配送 ¥${merchant.deliveryFee}`}</span>
                    </div>
                    <span className="text-on-surface-variant font-label-md text-label-md">{merchant.distance} | {merchant.deliveryTime}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
