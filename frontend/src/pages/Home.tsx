import React from 'react';

export default function Home({ onSearch, onMerchantClick }: { onSearch?: () => void; onMerchantClick?: () => void }) {
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen relative pb-[80px]">
      {/* Top Location & Search Area */}
      <div className="px-md pt-lg pb-sm sticky top-0 z-40 bg-surface/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-sm">
          <div className="flex items-center gap-xs text-primary font-bold">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <span className="font-headline-sm text-headline-sm">学校东门</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </div>
          <div className="flex items-center gap-md">
            <div className="relative">
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant">notifications</span>
              <span className="absolute top-0 right-0 w-[8px] h-[8px] bg-error rounded-full border-2 border-surface"></span>
            </div>
          </div>
        </div>
        {/* Search Bar */}
        <div className="bg-surface-variant/50 rounded-full flex items-center px-md py-sm">
          <span className="material-symbols-outlined text-on-surface-variant mr-sm">search</span>
          <input onFocus={onSearch} className="bg-transparent border-none outline-none w-full text-on-surface-variant placeholder-on-surface-variant/70 font-body-md text-body-md focus:ring-0 p-0" placeholder="想吃点什么？" type="text" />
          <button onClick={onSearch} className="border-l border-outline-variant pl-sm ml-sm flex items-center gap-xs text-primary">
            <span className="font-label-md text-label-md whitespace-nowrap">搜索</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-md flex flex-col gap-xl">
        {/* Banner */}
        <section>
          <div className="rounded-xl overflow-hidden relative h-[120px] shadow-sm">
            <img alt="Promotional Banner" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCihXBrd-0UItFM-Yiu3QOqH37n_5cNULD6qxy5fo0oUpLU3mH-TGvlIgXpB6giecj3kk_nEDqNbg_LL3U3eTKZbCrRzhbYaIzRiZa5NfvDsAWuK6NjxZgZPLUimszObbDEp0MFBYe4w8yJ9uszNzoVYVob2871RC9RhbFobXcav-CR11EZyycvY3manTDl5JWp5wa3KUwHxP4wp49IV-A6-PfOTOBf7sh2sakkKJNT7IeIr1Ur6A7K60ywGNozAeUhYMjEJiuF1g_e" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-container/90 to-transparent flex flex-col justify-center p-md">
              <span className="font-headline-md text-headline-md text-on-primary font-bold mb-xs">新人首单立减</span>
              <span className="font-body-md text-body-md text-on-primary/90 bg-on-primary-container/20 w-fit px-sm py-xs rounded-lg backdrop-blur-sm">最高可减 ¥20</span>
            </div>
          </div>
        </section>

        {/* Categories (Bento Grid Style) */}
        <section>
          <div className="grid grid-cols-4 gap-sm">
            <div className="flex flex-col items-center gap-xs">
              <div className="w-[56px] h-[56px] rounded-full bg-[#FFF4E0] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">美食</span>
            </div>
            <div className="flex flex-col items-center gap-xs">
              <div className="w-[56px] h-[56px] rounded-full bg-[#FCE4EC] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_cafe</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">甜点饮品</span>
            </div>
            <div className="flex flex-col items-center gap-xs">
              <div className="w-[56px] h-[56px] rounded-full bg-[#EFEBE9] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>fastfood</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">汉堡披萨</span>
            </div>
            <div className="flex flex-col items-center gap-xs">
              <div className="w-[56px] h-[56px] rounded-full bg-[#FBE9E7] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_pizza</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">快餐简餐</span>
            </div>
            <div className="flex flex-col items-center gap-xs">
              <div className="w-[56px] h-[56px] rounded-full bg-[#E1F5FE] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>ramen_dining</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">日韩料理</span>
            </div>
            <div className="flex flex-col items-center gap-xs">
              <div className="w-[56px] h-[56px] rounded-full bg-[#F5F5DC] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_convenience_store</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">超市便利</span>
            </div>
            <div className="flex flex-col items-center gap-xs">
              <div className="w-[56px] h-[56px] rounded-full bg-[#E8F5E9] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>cruelty_free</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">生鲜果蔬</span>
            </div>
            <div className="flex flex-col items-center gap-xs">
              <div className="w-[56px] h-[56px] rounded-full bg-[#F5F5F5] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>more_horiz</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">全部分类</span>
            </div>
          </div>
        </section>

        {/* Featured / Recommendations Horizontal Scroll */}
        <section>
          <div className="flex justify-between items-end mb-sm">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">附近好店推荐</h2>
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center">查看更多 <span className="material-symbols-outlined text-[16px]">chevron_right</span></span>
          </div>
          <div className="flex gap-sm overflow-x-auto hide-scrollbar pb-xs -mx-md px-md">
            {/* Card 1 */}
            <button onClick={onMerchantClick} className="text-left min-w-[240px] bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden flex-shrink-0 border border-outline-variant/30 active:scale-[0.98] transition-transform">
              <div className="h-[120px] relative">
                <img alt="Burger Shop" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrMSNqopfZO87wwSkdCQn0Oj82WJvhQa-diF6oYbtp6S2sMyJsrWWtb-LVBIZ8YsJLOBzBWJlQIhFUwM1PoplkgK4vQAj7zC-TDaJ--6ZF78ekpeGXAjOlTr5xI6O_zvq7vvO3i3TYVUYHx49TrgkaFpYHnBBrLBJMs6gnXJWq4JNN6jKMpFsEnd0Zx6NbE-HPk2jk4YjOEIUU8DGTIDqkAuIrfFsGyqgYd_SCvK43l74V1AG-HXp3PWmjJQIAhUEGpMSfZLrEvuPh" />
                <div className="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur-sm px-xs py-[2px] rounded font-label-md text-label-md text-on-surface flex items-center gap-[2px]">
                  <span className="material-symbols-outlined text-[14px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  4.8
                </div>
              </div>
              <div className="p-sm">
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">塔斯汀中国汉堡 (大学城店)</h3>
                <div className="flex items-center gap-xs mt-xs text-on-surface-variant font-label-md text-label-md">
                  <span>起送 ¥15</span>
                  <span className="w-[3px] h-[3px] bg-outline rounded-full"></span>
                  <span>免配送费</span>
                  <span className="w-[3px] h-[3px] bg-outline rounded-full"></span>
                  <span>30分钟</span>
                </div>
                <div className="mt-sm flex gap-xs">
                  <span className="bg-error-container/50 text-on-error-container font-label-md text-label-md px-xs py-[2px] rounded text-[10px]">满30减15</span>
                  <span className="bg-primary-container/20 text-primary font-label-md text-label-md px-xs py-[2px] rounded text-[10px]">新客减2</span>
                </div>
              </div>
            </button>
            {/* Card 2 */}
            <button onClick={onMerchantClick} className="text-left min-w-[240px] bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden flex-shrink-0 border border-outline-variant/30 active:scale-[0.98] transition-transform">
              <div className="h-[120px] relative">
                <img alt="Bubble Tea" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAeODuNSnvbxJUjyXxqfTJW0BIKwrkh-NhHBrbKw3FIrzQEh8ZbHJoLNO7Gu4v1IXnNMT05A_Q3UcejE3exbVwmlmvBcaNCe98MIizd4m-Npu81cNZwDzKTFpqe7lX019PJS9UT7vn5NA6sIP3vOTa5gS0in2ub_CKfofmmB2ie_rB2aqZ_lfSJ2mlhhbtpdq7qJlex063LIEd3IY8qcAvWASiejTIjh48ZX2i6p23RD3QUTnBCY95eHb_r0MZMNhzQUI0p0oZ0kiV" />
                <div className="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur-sm px-xs py-[2px] rounded font-label-md text-label-md text-on-surface flex items-center gap-[2px]">
                  <span className="material-symbols-outlined text-[14px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  4.9
                </div>
              </div>
              <div className="p-sm">
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">霸王茶姬 (步行街店)</h3>
                <div className="flex items-center gap-xs mt-xs text-on-surface-variant font-label-md text-label-md">
                  <span>起送 ¥20</span>
                  <span className="w-[3px] h-[3px] bg-outline rounded-full"></span>
                  <span>配送 ¥2</span>
                  <span className="w-[3px] h-[3px] bg-outline rounded-full"></span>
                  <span>45分钟</span>
                </div>
                <div className="mt-sm flex gap-xs">
                  <span className="bg-error-container/50 text-on-error-container font-label-md text-label-md px-xs py-[2px] rounded text-[10px]">返2元代金券</span>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Vertical List for Nearby Merchants */}
        <section className="pb-xl">
          <div className="sticky top-[140px] bg-surface z-30 py-sm mb-sm flex gap-md border-b border-outline-variant/20">
            <button className="font-body-lg text-body-lg font-bold text-on-surface border-b-2 border-primary pb-xs">综合排序</button>
            <button className="font-body-lg text-body-lg text-on-surface-variant pb-xs">销量优先</button>
            <button className="font-body-lg text-body-lg text-on-surface-variant pb-xs">距离最近</button>
          </div>
          <div className="flex flex-col gap-md">
            {/* List Item 1 */}
            <button onClick={onMerchantClick} className="w-full text-left flex gap-sm p-sm bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_rgba(31,41,55,0.04)] border border-outline-variant/20 active:scale-[0.98] transition-transform">
              <div className="w-[88px] h-[88px] rounded-lg overflow-hidden flex-shrink-0">
                <img alt="Sushi" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzMf6ymZqz6A5tCV0CeKkrt8KSCROEGgeq9_stje2jxwyuZRieeq0YOyBgzwlp0syYDv_DuzA7WCs0lIrQirD2AFRYGHH1CmT-5oMqwk4ZqGRpCxLLsutea0roFswyVQQuKPGLm8jbfBitQ0SXBr9uYhwnnM5V-lUOllgi-79mAEy5sjSUc-NEHG057RrS1lkpbkxdfvuZ6-3D0IKJ-MJzTrbGGVT1WOUw3Bhxt467bbIGZIuuilOKb1W_uw5QguIhq-6SUYPCUBQ2" />
              </div>
              <div className="flex flex-col flex-grow justify-between py-xs">
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">鲜の味寿司刺身</h3>
                  <div className="flex items-center gap-xs mt-[2px]">
                    <div className="flex items-center text-secondary-container">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label-md text-label-md text-on-surface ml-[2px]">4.7</span>
                    </div>
                    <span className="text-on-surface-variant font-label-md text-label-md ml-xs">月售 1000+</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-sm">
                  <div className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md">
                    <span>起送 ¥30</span>
                    <span>免配送费</span>
                  </div>
                  <span className="text-on-surface-variant font-label-md text-label-md">1.2km | 40分钟</span>
                </div>
              </div>
            </button>
            {/* List Item 2 */}
            <button onClick={onMerchantClick} className="w-full text-left flex gap-sm p-sm bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_rgba(31,41,55,0.04)] border border-outline-variant/20 active:scale-[0.98] transition-transform">
              <div className="w-[88px] h-[88px] rounded-lg overflow-hidden flex-shrink-0">
                <img alt="Noodles" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEhVvVsMpD-DJ0TIFCh3VqE0M7GDUMvQXIGDcnItg9G1wbU-LhTul4DiChtan8a71um7sVpfI-tiR3_kSkWdrbg3gggYpYO6yC-31Ya-NrCSU7DKUdguCWZ17kTK9s7qm1ynPNMpCE8uwNmzzzjFJ1inDJz8qX95_E6a7_B0iZaycFt0wR1hQgkIBGfCwytU7NFnar2Z3wmMKzmiK1Wx1sT6ZPCteK3ONzOE27PUJSWSYh4FRrKrG0K7w4KuTLjVscMFHpSQJ2oEot" />
              </div>
              <div className="flex flex-col flex-grow justify-between py-xs">
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">老李家兰州牛肉面</h3>
                  <div className="flex items-center gap-xs mt-[2px]">
                    <div className="flex items-center text-secondary-container">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label-md text-label-md text-on-surface ml-[2px]">4.5</span>
                    </div>
                    <span className="text-on-surface-variant font-label-md text-label-md ml-xs">月售 800+</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-sm">
                  <div className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md">
                    <span>起送 ¥15</span>
                    <span>配送 ¥1.5</span>
                  </div>
                  <span className="text-on-surface-variant font-label-md text-label-md">800m | 25分钟</span>
                </div>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
