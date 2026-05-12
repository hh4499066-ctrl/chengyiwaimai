import React, { useEffect, useMemo, useState } from 'react';
import { api, type CartItem, type Dish, type Merchant, type Order } from '../../api/client';
import { demoOrder, dishes as mockDishes, merchants as mockMerchants } from '../../mock/data';

type Navigate = (screen: string) => void;

const address = '学校东门 3 号宿舍楼 502';

function PhoneHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md px-md py-sm pt-safe border-b border-outline-variant/30 flex items-center gap-sm">
      {onBack && (
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary active:scale-95 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      )}
      <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h1>
    </header>
  );
}

function imageFor(index: number) {
  return mockMerchants[index % mockMerchants.length].image;
}

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
    image: merchant.image || imageFor(index),
    tags: merchant.tags?.length ? merchant.tags : fallback.tags,
  };
}

function enrichDish(dish: Dish, index: number): Required<Dish> {
  const fallback = mockDishes[index % mockDishes.length];
  return {
    id: dish.id,
    merchantId: dish.merchantId,
    name: dish.name,
    desc: dish.desc || dish.description || fallback.desc,
    description: dish.description || dish.desc || fallback.desc,
    price: Number(dish.price),
    sales: dish.sales ?? fallback.sales,
    image: dish.image || fallback.image,
    category: dish.category || dish.categoryName || fallback.category,
    categoryName: dish.categoryName || dish.category || fallback.category,
  };
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) {
    return null;
  }
  return <div className="rounded-lg bg-error-container text-on-error-container px-md py-sm text-body-md">{message}</div>;
}

export function SearchPage({ onBack, onMerchant }: { onBack: () => void; onMerchant: (merchantId: number) => void }) {
  const [merchantList, setMerchantList] = useState<Required<Merchant>[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getMerchants()
      .then((items) => setMerchantList(items.map(enrichMerchant)))
      .catch((err) => setError(err instanceof Error ? err.message : '商家列表加载失败'));
  }, []);

  return (
    <div className="bg-surface min-h-full pb-[100px]">
      <PhoneHeader title="搜索与筛选" onBack={onBack} />
      <main className="p-md space-y-md">
        <ErrorBanner message={error} />
        <div className="bg-surface-container-lowest rounded-full px-md py-sm border border-outline-variant/40 flex items-center gap-sm shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input className="bg-transparent outline-none flex-1 text-body-md" defaultValue="牛肉面" />
          <button className="bg-primary text-on-primary px-md py-xs rounded-full text-label-md font-bold">搜索</button>
        </div>
        <div className="flex gap-sm overflow-x-auto no-scrollbar">
          {['综合排序', '销量优先', '距离最近', '免配送费'].map((item, index) => (
            <button key={item} className={`px-md py-xs rounded-full text-label-md font-label-md whitespace-nowrap ${index === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>{item}</button>
          ))}
        </div>
        <div className="space-y-md">
          {merchantList.map((merchant) => (
            <button key={merchant.id} onClick={() => onMerchant(merchant.id)} className="w-full text-left bg-surface-container-lowest rounded-xl p-sm border border-outline-variant/30 shadow-sm flex gap-sm active:scale-[0.98] transition-transform">
              <img src={merchant.image} alt={merchant.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{merchant.name}</h2>
                <p className="text-label-md text-on-surface-variant mt-xs">{merchant.category} · 月售 {merchant.monthlySales}</p>
                <p className="text-label-md text-on-surface-variant mt-xs">{merchant.distance} · {merchant.deliveryTime} · 起送 ¥{merchant.minOrder}</p>
                <div className="flex gap-xs mt-sm">{merchant.tags.map((tag) => <span key={tag} className="bg-primary/10 text-primary text-[10px] px-xs py-[2px] rounded">{tag}</span>)}</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export function MerchantDetailPage({ merchantId, go }: { merchantId: number; go: Navigate }) {
  const [merchant, setMerchant] = useState<Required<Merchant> | null>(null);
  const [dishList, setDishList] = useState<Required<Dish>[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api
      .getMerchants()
      .then((items) => {
        const foundIndex = items.findIndex((item) => item.id === merchantId);
        if (foundIndex >= 0) {
          setMerchant(enrichMerchant(items[foundIndex], foundIndex));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : '商家信息加载失败'));

    api
      .getDishes(merchantId)
      .then((items) => setDishList(items.map(enrichDish)))
      .catch((err) => setError(err instanceof Error ? err.message : '菜品加载失败'));
  }, [merchantId]);

  const addToCart = (dish: Required<Dish>) => {
    setError('');
    api
      .addCart({ dishId: dish.id, name: dish.name, quantity: 1, price: dish.price })
      .then(() => go('cart'))
      .catch((err) => setError(err instanceof Error ? err.message : '加入购物车失败'));
  };

  const total = dishList.slice(0, 2).reduce((sum, dish) => sum + dish.price, 0);
  const heroImage = merchant?.image || mockMerchants[0].image;

  return (
    <div className="bg-surface min-h-full pb-[112px]">
      <div className="relative h-[220px]">
        <img src={heroImage} alt={merchant?.name || '商家'} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-surface"></div>
        <button onClick={() => go('home')} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>
      <main className="px-md -mt-xl relative z-10 space-y-md">
        <ErrorBanner message={error} />
        <section className="bg-surface-container-lowest rounded-2xl p-md shadow-[0_8px_28px_rgba(38,24,20,0.08)] border border-outline-variant/30">
          <h1 className="font-display-lg text-display-lg text-on-surface">{merchant?.name || '商家详情'}</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">{merchant ? `${merchant.rating} 分 · 月售 ${merchant.monthlySales} · ${merchant.deliveryTime}` : '加载中'}</p>
          <div className="flex gap-xs mt-sm">{merchant?.tags.map((tag) => <span key={tag} className="bg-error-container/50 text-on-error-container text-label-md px-xs py-[2px] rounded">{tag}</span>)}</div>
        </section>
        <section className="grid grid-cols-[92px_1fr] gap-md">
          <aside className="space-y-xs">
            {Array.from(new Set(dishList.map((dish) => dish.category))).map((item, index) => (
              <button key={item} className={`w-full text-left px-sm py-sm rounded-lg text-body-md ${index === 0 ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-high text-on-surface-variant'}`}>{item}</button>
            ))}
          </aside>
          <div className="space-y-md">
            {dishList.map((dish) => (
              <article key={dish.id} className="bg-surface-container-lowest rounded-xl p-sm border border-outline-variant/30 shadow-sm flex gap-sm">
                <img src={dish.image} alt={dish.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline-sm text-headline-sm font-bold truncate">{dish.name}</h3>
                  <p className="text-label-md text-on-surface-variant mt-xs line-clamp-2">{dish.desc}</p>
                  <p className="text-label-md text-on-surface-variant mt-xs">库存 {dish.sales}</p>
                  <div className="flex items-center justify-between mt-sm">
                    <span className="text-headline-sm font-bold text-primary">¥{dish.price}</span>
                    <button onClick={() => addToCart(dish)} className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95"><span className="material-symbols-outlined text-[20px]">add</span></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <div className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/30 px-md py-sm pb-safe flex items-center justify-between shadow-[0_-8px_24px_rgba(38,24,20,0.08)]">
        <div><p className="text-label-md text-on-surface-variant">已选 {Math.min(2, dishList.length)} 件</p><p className="font-headline-md text-headline-md text-primary">¥{total.toFixed(1)}</p></div>
        <button onClick={() => go('checkout')} className="bg-primary text-on-primary px-xl py-sm rounded-full font-headline-sm shadow-md active:scale-[0.98]">去结算</button>
      </div>
    </div>
  );
}

export function CheckoutPage({ merchantId, setOrder, go }: { merchantId: number; setOrder: (order: Order) => void; go: Navigate }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0) + (items.length > 0 ? 1.5 : 0), [items]);

  useEffect(() => {
    api
      .getCart()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : '购物车加载失败'));
  }, []);

  const submit = () => {
    setLoading(true);
    setError('');
    api
      .createOrder({ merchantId, address, items })
      .then((order) => {
        setOrder(order);
        go('pay');
      })
      .catch((err) => setError(err instanceof Error ? err.message : '创建订单失败'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-background min-h-full pb-[104px]">
      <PhoneHeader title="确认订单" onBack={() => go('merchant')} />
      <main className="p-md space-y-md">
        <ErrorBanner message={error} />
        <section className="bg-surface-container-lowest rounded-2xl p-md shadow-sm border border-outline-variant/30">
          <p className="text-label-md text-primary font-bold">送达地址</p>
          <h2 className="font-headline-sm text-headline-sm mt-xs">{address}</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">张同学 138****5678</p>
        </section>
        <section className="bg-surface-container-lowest rounded-2xl p-md shadow-sm border border-outline-variant/30">
          <h2 className="font-headline-sm text-headline-sm font-bold mb-sm">订单商品</h2>
          {items.length === 0 && <p className="text-body-md text-on-surface-variant py-sm">购物车为空</p>}
          {items.map((item) => (
            <div key={item.dishId} className="flex justify-between py-sm border-b border-outline-variant/20 last:border-0">
              <span className="text-body-md">{item.name} × {item.quantity}</span>
              <span className="font-bold">¥{(item.price * item.quantity).toFixed(1)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-sm text-body-md text-on-surface-variant"><span>配送费</span><span>¥{items.length > 0 ? '1.5' : '0.0'}</span></div>
        </section>
      </main>
      <div className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/30 px-md py-sm pb-safe flex items-center justify-between">
        <div><span className="text-label-md text-on-surface-variant">合计</span><span className="ml-xs text-display-lg font-bold text-primary">¥{total.toFixed(1)}</span></div>
        <button disabled={loading || items.length === 0} onClick={submit} className="bg-primary text-on-primary px-xl py-sm rounded-full font-headline-sm shadow-md disabled:opacity-50">{loading ? '提交中...' : '提交订单'}</button>
      </div>
    </div>
  );
}

export function PayPage({ order, setOrder, go }: { order: Order | null; setOrder: (order: Order) => void; go: Navigate }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pay = () => {
    if (!order) {
      setError('请先创建订单');
      return;
    }
    setLoading(true);
    setError('');
    api
      .payOrder(order.id)
      .then((paidOrder) => {
        setOrder(paidOrder);
        go('pay-result');
      })
      .catch((err) => setError(err instanceof Error ? err.message : '支付失败'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-surface min-h-full">
      <PhoneHeader title="模拟支付" onBack={() => go('checkout')} />
      <main className="p-md space-y-lg text-center">
        <ErrorBanner message={error} />
        <section className="bg-gradient-to-br from-primary-container to-primary-fixed rounded-3xl p-xl shadow-sm">
          <p className="text-on-primary-container text-body-md">订单金额</p>
          <div className="text-[56px] leading-none font-bold text-on-primary-container mt-sm">¥{Number(order?.totalAmount ?? 0).toFixed(2)}</div>
        </section>
        {['微信支付（模拟）', '支付宝（模拟）', '校园一卡通（模拟）'].map((item, index) => (
          <button key={item} className={`w-full p-md rounded-2xl border flex items-center justify-between ${index === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container-lowest'}`}>
            <span className="font-body-lg">{item}</span>
            <span className="material-symbols-outlined">{index === 0 ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
          </button>
        ))}
        <button disabled={loading || !order} onClick={pay} className="w-full bg-primary text-on-primary rounded-full py-md font-headline-sm shadow-md active:scale-[0.98] disabled:opacity-50">{loading ? '支付中...' : '确认支付'}</button>
      </main>
    </div>
  );
}

export function PayResultPage({ go }: { go: Navigate }) {
  return (
    <div className="bg-surface min-h-full flex flex-col items-center justify-center p-xl text-center">
      <div className="w-24 h-24 rounded-full bg-[#22C55E]/10 text-[#137333] flex items-center justify-center mb-lg">
        <span className="material-symbols-outlined text-[56px] fill">check_circle</span>
      </div>
      <h1 className="font-display-lg text-display-lg text-on-surface">支付成功</h1>
      <p className="text-body-md text-on-surface-variant mt-sm">商家已收到订单，正在确认备餐。</p>
      <button onClick={() => go('tracking')} className="mt-xl w-full bg-primary text-on-primary rounded-full py-md font-headline-sm shadow-md">查看订单状态</button>
      <button onClick={() => go('home')} className="mt-sm w-full bg-surface-container-high text-primary rounded-full py-md font-body-lg">返回首页</button>
    </div>
  );
}

export function TrackingPage({ go }: { go: Navigate }) {
  const steps = ['订单已支付', '商家已接单', '商家已出餐', '骑手已取餐', '正在配送'];
  return (
    <div className="bg-surface min-h-full pb-[100px]">
      <PhoneHeader title="配送跟踪" onBack={() => go('home')} />
      <div className="h-[260px] bg-[#e3f2fd] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff_25%,transparent_25%),linear-gradient(225deg,#ffffff_25%,transparent_25%)] bg-[length:48px_48px] opacity-40"></div>
        <div className="absolute left-20 top-24 text-primary"><span className="material-symbols-outlined text-[44px] fill">location_on</span></div>
        <div className="absolute right-24 bottom-20 text-tertiary"><span className="material-symbols-outlined text-[40px] fill">electric_moped</span></div>
      </div>
      <main className="p-md -mt-lg relative z-10 space-y-md">
        <section className="bg-surface-container-lowest rounded-2xl p-md shadow-sm border border-outline-variant/30">
          <h2 className="font-headline-sm text-headline-sm font-bold">{demoOrder.status}</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">{demoOrder.riderName} 正在送往 {demoOrder.address}</p>
        </section>
        <section className="bg-surface-container-lowest rounded-2xl p-md shadow-sm border border-outline-variant/30 space-y-md">
          {steps.map((step) => (
            <div key={step} className="flex gap-sm">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-on-primary"><span className="material-symbols-outlined text-[16px]">check</span></div>
              <span className="font-body-md text-on-surface">{step}</span>
            </div>
          ))}
        </section>
        <button onClick={() => go('review')} className="w-full bg-primary text-on-primary rounded-full py-md font-headline-sm shadow-md">模拟送达并评价</button>
      </main>
    </div>
  );
}

export function ReviewPage({ orderId, go }: { orderId: string | null; go: Navigate }) {
  const [error, setError] = useState('');
  const submit = () => {
    if (!orderId) {
      setError('请先完成订单');
      return;
    }
    api
      .submitReview({ orderId, rating: 5, content: '味道不错，配送很快，包装也很完整。' })
      .then(() => go('orders'))
      .catch((err) => setError(err instanceof Error ? err.message : '提交评价失败'));
  };

  return (
    <div className="bg-surface min-h-full">
      <PhoneHeader title="评价订单" onBack={() => go('tracking')} />
      <main className="p-md space-y-md">
        <ErrorBanner message={error} />
        <section className="bg-surface-container-lowest rounded-2xl p-lg shadow-sm border border-outline-variant/30 text-center">
          <h2 className="font-headline-sm text-headline-sm font-bold">这次用餐体验如何？</h2>
          <div className="flex justify-center gap-xs my-lg text-secondary-container">
            {[1, 2, 3, 4, 5].map((star) => <span key={star} className="material-symbols-outlined text-[36px] fill">star</span>)}
          </div>
          <textarea className="w-full min-h-32 rounded-xl border border-outline-variant bg-surface p-md outline-none focus:border-primary" placeholder="味道不错，配送很快..." defaultValue="味道不错，配送很快，包装也很完整。" />
        </section>
        <button onClick={submit} className="w-full bg-primary text-on-primary rounded-full py-md font-headline-sm shadow-md">提交评价</button>
      </main>
    </div>
  );
}

export function OrdersPage({ go }: { go: Navigate }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrders().then(setOrders).catch((err) => setError(err instanceof Error ? err.message : '历史订单加载失败'));
  }, []);

  return (
    <div className="bg-surface min-h-full pb-[100px]">
      <PhoneHeader title="历史订单" />
      <main className="p-md space-y-md">
        <ErrorBanner message={error} />
        {orders.length === 0 && !error && <p className="text-body-md text-on-surface-variant">暂无订单</p>}
        {orders.map((order) => (
          <button key={order.id} onClick={() => go('tracking')} className="w-full text-left bg-surface-container-lowest rounded-2xl p-md shadow-sm border border-outline-variant/30">
            <div className="flex justify-between"><h2 className="font-headline-sm text-headline-sm font-bold">{order.merchantName}</h2><span className="text-primary text-label-md">{order.status}</span></div>
            <p className="text-body-md text-on-surface-variant mt-xs">订单号：{order.id}</p>
            <p className="font-headline-sm text-headline-sm text-primary mt-sm">¥{Number(order.totalAmount).toFixed(1)}</p>
          </button>
        ))}
      </main>
    </div>
  );
}
