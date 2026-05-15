import React, { useEffect, useMemo, useState } from 'react';
import { api, type Address, type CartItem, type Coupon, type Dish, type Merchant, type Order, type Review } from '../../api/client';
import DeliveryMap from '../../components/DeliveryMap';
import { campusMapPoints, campusPointAddresses, estimateDeliveryMinutes, readableCustomerAddress, reverseGeocode, shouldUseMappedCustomerAddress, type LngLat } from '../../utils/amap';
import { dishes as mockDishes, merchants as mockMerchants } from '../../mock/data';
import { notify } from '../../utils/toast';

type Navigate = (screen: string) => void;

const address = campusPointAddresses.customer;
const fallbackMerchantAddress = campusPointAddresses.merchant;

function readableAddress(value?: string) {
  return readableCustomerAddress(value, address);
}

function customerAddressText(item: Address | null | undefined, mappedAddress: string) {
  if (!item || shouldUseMappedCustomerAddress(item.detail)) {
    return mappedAddress;
  }
  return readableAddress(item.detail);
}

function PhoneHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="liquid-glass sticky top-0 z-50 px-md py-sm pt-safe border-b border-outline-variant/30 flex items-center gap-sm">
      {onBack && (
        <button onClick={onBack} aria-label="返回" className="liquid-button w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary active:scale-95 transition-transform">
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
    businessStatus: merchant.businessStatus || 'open',
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
    status: dish.status || 'on_sale',
    image: dish.image || fallback.image,
    category: dish.category || dish.categoryName || fallback.category,
    categoryName: dish.categoryName || dish.category || fallback.category,
  };
}

function cartItemImage(item: CartItem) {
  const itemWithImage = item as CartItem & { image?: string };
  return itemWithImage.image || mockDishes.find((dish) => dish.id === item.dishId)?.image || mockDishes[0].image;
}

function fallbackDishesForMerchant(merchantId: number) {
  const matched = mockDishes.filter((dish) => dish.merchantId === merchantId);
  const source = matched.length > 0 ? matched : mockDishes.map((dish) => ({ ...dish, merchantId }));
  return source.map(enrichDish);
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
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('综合排序');

  useEffect(() => {
    api
      .getMerchants()
      .then((items) => setMerchantList(items.map(enrichMerchant)))
      .catch((err) => setError(err instanceof Error ? err.message : '商家列表加载失败'));
  }, []);

  const shownMerchants = merchantList
    .filter((merchant) => keyword.trim() === '' || merchant.name.includes(keyword.trim()) || merchant.category.includes(keyword.trim()) || merchant.tags.some((tag) => tag.includes(keyword.trim())))
    .filter((merchant) => filter !== '免配送费' || merchant.deliveryFee === 0)
    .sort((a, b) => {
      if (filter === '销量优先') {
        return b.monthlySales - a.monthlySales;
      }
      if (filter === '距离最近') {
        return (Number.parseFloat(a.distance) || 999) - (Number.parseFloat(b.distance) || 999);
      }
      return b.rating - a.rating;
    });

  return (
    <div className="liquid-stage bg-surface min-h-full pb-[100px] relative overflow-hidden">
      <PhoneHeader title="搜索与筛选" onBack={onBack} />
      <main className="p-md space-y-md motion-enter">
        <ErrorBanner message={error} />
        <div className="liquid-card rounded-full px-md py-sm border border-outline-variant/40 flex items-center gap-sm shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="bg-transparent outline-none flex-1 text-body-md" placeholder="输入商家或品类" inputMode="search" autoComplete="off" aria-label="搜索商家或品类" />
          <button onClick={() => setKeyword(keyword.trim())} className="liquid-button bg-primary text-on-primary px-md py-xs rounded-full text-label-md font-bold">搜索</button>
        </div>
        <div className="flex gap-sm overflow-x-auto no-scrollbar stagger-children">
          {['综合排序', '销量优先', '距离最近', '免配送费'].map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`liquid-button px-md py-xs rounded-full text-label-md font-label-md whitespace-nowrap ${filter === item ? 'bg-primary text-on-primary motion-pulse-ring' : 'liquid-card text-on-surface-variant'}`}>{item}</button>
          ))}
        </div>
        <div className="space-y-md stagger-children">
          {shownMerchants.length === 0 && <p className="text-center py-xl text-on-surface-variant">没有找到匹配商家</p>}
          {shownMerchants.map((merchant) => (
            <button key={merchant.id} onClick={() => onMerchant(merchant.id)} className="liquid-card w-full text-left rounded-xl p-sm flex gap-sm active:scale-[0.98] transition-transform">
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDish, setSelectedDish] = useState<Required<Dish> | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
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
      .then((items) => {
        const next = items.length > 0 ? items.map(enrichDish) : fallbackDishesForMerchant(merchantId);
        setDishList(next);
        setSelectedCategory(next[0]?.category || '');
      })
      .catch((err) => {
        const next = fallbackDishesForMerchant(merchantId);
        setDishList(next);
        setSelectedCategory(next[0]?.category || '');
        setError(err instanceof Error ? err.message : '菜品加载失败');
      });
    api.getCart().then(setCartItems).catch(() => setCartItems([]));
    api.getFavoriteMerchantStatus(merchantId).then((status) => setFavorite(Boolean(status.favorite))).catch(() => setFavorite(false));
  }, [merchantId]);

  const refreshCart = () => api.getCart().then(setCartItems).catch((err) => setError(err instanceof Error ? err.message : '购物车刷新失败'));

  const addToCart = (dish: Required<Dish>) => {
    setError('');
    api
      .addCart({ dishId: dish.id, name: dish.name, quantity: 1, price: dish.price })
      .then(() => refreshCart())
      .catch((err) => setError(err instanceof Error ? err.message : '加入购物车失败'));
  };

  const toggleFavorite = () => {
    if (favoriteLoading) {
      return;
    }
    setFavoriteLoading(true);
    const action = favorite ? api.unfavoriteMerchant(merchantId) : api.favoriteMerchant(merchantId);
    action
      .then((status) => {
        setFavorite(Boolean(status.favorite));
        notify(status.favorite ? '已收藏商家' : '已取消收藏');
      })
      .catch((err) => setError(err instanceof Error ? err.message : '收藏操作失败'))
      .finally(() => setFavoriteLoading(false));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const categories = Array.from(new Set(dishList.map((dish) => dish.category)));
  const visibleDishes = selectedCategory ? dishList.filter((dish) => dish.category === selectedCategory) : dishList;
  const heroImage = merchant?.image || mockMerchants[0].image;

  return (
    <div className="liquid-stage bg-surface absolute inset-0 overflow-hidden flex flex-col">
      <button onClick={() => go('home')} aria-label="返回首页" className="liquid-button absolute left-4 top-4 z-[80] w-11 h-11 rounded-full bg-white/90 text-primary backdrop-blur flex items-center justify-center shadow-[0_12px_30px_rgba(15,23,42,0.18)] border border-white/70">
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <button onClick={toggleFavorite} disabled={favoriteLoading} aria-label={favorite ? '取消收藏商家' : '收藏商家'} className="liquid-button absolute right-4 top-4 z-[80] w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-[0_12px_30px_rgba(15,23,42,0.18)] border border-white/70 disabled:opacity-60">
        <span className={`material-symbols-outlined text-[24px] ${favorite ? 'text-error' : 'text-on-surface-variant'}`} style={favorite ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
      </button>
      <div className="relative h-[248px] shrink-0 -mt-px">
        <img src={heroImage} alt={merchant?.name || '商家'} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-surface"></div>
      </div>
      <main className="px-md -mt-xl relative z-10 space-y-md motion-enter flex-1 overflow-y-auto no-scrollbar pb-[96px]">
        <ErrorBanner message={error} />
        <section className="liquid-glass rounded-2xl p-md">
          <h1 className="font-display-lg text-display-lg text-on-surface">{merchant?.name || '商家详情'}</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">{merchant ? `${merchant.rating} 分 · 月售 ${merchant.monthlySales} · ${merchant.deliveryTime}` : '加载中'}</p>
          <div className="flex gap-xs mt-sm">{merchant?.tags.map((tag) => <span key={tag} className="bg-error-container/50 text-on-error-container text-label-md px-xs py-[2px] rounded">{tag}</span>)}</div>
        </section>
        <section className="grid grid-cols-[92px_1fr] gap-md">
          <aside className="space-y-xs stagger-children">
            {categories.map((item) => (
              <button key={item} onClick={() => setSelectedCategory(item)} className={`liquid-button w-full text-left px-sm py-sm rounded-lg text-body-md ${selectedCategory === item ? 'bg-primary text-on-primary font-bold' : 'liquid-card text-on-surface-variant'}`}>{item}</button>
            ))}
          </aside>
          <div className="space-y-md stagger-children">
            {visibleDishes.length === 0 && <p className="liquid-card rounded-xl p-md text-center text-on-surface-variant">暂无菜品，稍后再来看看。</p>}
            {visibleDishes.map((dish) => (
              <article key={dish.id} onClick={() => setSelectedDish(dish)} className="liquid-card rounded-xl p-sm flex gap-sm active:scale-[0.99] transition-transform">
                <img src={dish.image} alt={dish.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline-sm text-headline-sm font-bold truncate">{dish.name}</h3>
                  <p className="text-label-md text-on-surface-variant mt-xs line-clamp-2">{dish.desc}</p>
                  <p className="text-label-md text-on-surface-variant mt-xs">库存 {dish.sales}</p>
                  <div className="flex items-center justify-between mt-sm">
                    <span className="text-headline-sm font-bold text-primary">¥{dish.price}</span>
                    <button onClick={(event) => { event.stopPropagation(); addToCart(dish); }} aria-label={`加入${dish.name}到购物车`} className="liquid-button w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95"><span className="material-symbols-outlined text-[20px]">add</span></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <div className="liquid-glass absolute bottom-0 left-0 right-0 z-40 border-t border-outline-variant/30 px-md py-sm pb-safe flex items-center justify-between shadow-[0_-8px_24px_rgba(38,24,20,0.08)]">
        <button onClick={() => go('cart')} className="text-left"><p className="text-label-md text-on-surface-variant">已选 {cartCount} 件</p><p className="font-headline-md text-headline-md text-primary">¥{cartTotal.toFixed(1)}</p></button>
        <button disabled={cartCount === 0} onClick={() => go('checkout')} className="liquid-button bg-primary text-on-primary px-xl py-sm rounded-full font-headline-sm shadow-md active:scale-[0.98] disabled:opacity-50">去结算</button>
      </div>
      {selectedDish && (
        <div className="absolute inset-0 z-[90] bg-black/30 backdrop-blur-sm flex items-end" onClick={() => setSelectedDish(null)}>
          <div className="liquid-glass modal-surface w-full rounded-t-3xl p-md space-y-md motion-enter" onClick={(event) => event.stopPropagation()}>
            <img src={selectedDish.image} alt={selectedDish.name} className="w-full h-44 object-cover rounded-2xl" />
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold">{selectedDish.name}</h2>
              <p className="text-body-md text-on-surface-variant mt-xs">{selectedDish.description}</p>
              <p className="text-body-md text-on-surface-variant mt-xs">库存 {selectedDish.sales}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-headline-md font-bold text-primary">¥{selectedDish.price}</span>
              <button onClick={() => { addToCart(selectedDish); setSelectedDish(null); }} className="liquid-button bg-primary text-on-primary rounded-full px-lg py-sm font-bold">加入购物车</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CheckoutPage({ merchantId, setOrder, go }: { merchantId: number; setOrder: (order: Order) => void; go: Navigate }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<Address>({ receiver: 'mONESY', phone: '13800000001', detail: address, isDefault: false });
  const [couponOpen, setCouponOpen] = useState(false);
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mappedCustomerAddress, setMappedCustomerAddress] = useState('');
  const goodsAmount = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const deliveryFee = items.length > 0 ? 1.5 : 0;
  const couponAvailable = selectedCoupon ? goodsAmount >= Number(selectedCoupon.thresholdAmount) : false;
  const discountAmount = selectedCoupon && couponAvailable ? Math.min(Number(selectedCoupon.discountAmount), goodsAmount + deliveryFee) : 0;
  const total = Math.max(0, goodsAmount + deliveryFee - discountAmount);
  const mappedAddress = mappedCustomerAddress || address;
  const displayAddress = customerAddressText(selectedAddress, mappedAddress);
  const receiverName = selectedAddress?.receiver?.trim() || 'mONESY';
  const receiverPhone = selectedAddress?.phone?.trim() || '13800000001';

  useEffect(() => {
    api
      .getCart()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : '购物车加载失败'));
    api.getAddresses().then((next) => {
      setAddresses(next);
      setSelectedAddress(next[0] || null);
    }).catch(() => {
      const fallback = { receiver: 'mONESY', phone: '138****5678', detail: address, isDefault: true };
      setAddresses([fallback]);
      setSelectedAddress(fallback);
    });
    api.getCoupons().then(setCoupons).catch(() => setCoupons([]));
    reverseGeocode(campusMapPoints.customer)
      .then((nextAddress) => setMappedCustomerAddress(nextAddress || address))
      .catch(() => setMappedCustomerAddress(''));
  }, []);

  const refreshAddresses = (preferred?: Address) =>
    api.getAddresses().then((next) => {
      setAddresses(next);
      const selected = preferred?.id ? next.find((item) => item.id === preferred.id) : null;
      setSelectedAddress(selected || preferred || next[0] || null);
    });

  const openAddressForm = (item?: Address) => {
    setAddressForm({
      id: item?.id,
      receiver: item?.receiver || receiverName,
      phone: item?.phone || receiverPhone,
      detail: customerAddressText(item || null, mappedAddress),
      isDefault: item?.isDefault ?? addresses.length === 0,
    });
    setAddressFormOpen(true);
  };

  const saveCheckoutAddress = () => {
    const detail = addressForm.detail.trim();
    if (!detail) {
      return;
    }
    setError('');
    api.saveAddress({ ...addressForm, receiver: addressForm.receiver.trim() || 'mONESY', phone: addressForm.phone.trim() || '13800000001', detail })
      .then((saved) => refreshAddresses(saved))
      .then(() => {
        setAddressFormOpen(false);
        setAddressOpen(true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '地址保存失败'));
  };

  const submit = () => {
    setLoading(true);
    setError('');
    api
      .createOrder({ merchantId, address: displayAddress, remark, couponId: selectedCoupon?.id, discountAmount, items })
      .then((order) => {
        setOrder(order);
        go('pay');
      })
      .catch((err) => setError(err instanceof Error ? err.message : '创建订单失败'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="liquid-stage bg-background h-full relative overflow-hidden flex flex-col">
      <PhoneHeader title="确认订单" onBack={() => go('merchant')} />
      <main className="flex-1 overflow-y-auto p-md space-y-md motion-enter">
        <ErrorBanner message={error} />
        <button onClick={() => setAddressOpen(true)} className="liquid-card w-full text-left rounded-2xl p-md">
          <div className="flex items-start justify-between gap-sm">
            <div className="min-w-0">
              <p className="text-label-md text-primary font-bold">送达地址</p>
              <h2 className="font-headline-sm text-headline-sm mt-xs leading-snug">{displayAddress}</h2>
              <div className="mt-sm grid gap-xs text-body-md text-on-surface-variant">
                <p><span className="text-label-md font-bold text-on-surface">用户名：</span>{receiverName}</p>
                <p><span className="text-label-md font-bold text-on-surface">电话：</span>{receiverPhone}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary mt-xs">edit_location_alt</span>
          </div>
          <p className="mt-sm text-label-md text-primary">点击更换、添加或编辑地址</p>
        </button>
        <section className="liquid-card rounded-2xl p-md">
          <h2 className="font-headline-sm text-headline-sm font-bold mb-sm">订单商品</h2>
          {items.length === 0 && <p className="text-body-md text-on-surface-variant py-sm">购物车为空</p>}
          <div className="space-y-sm">
            {items.map((item) => (
              <div key={item.dishId} className="flex items-center gap-sm py-sm border-b border-outline-variant/20 last:border-0">
                <img src={cartItemImage(item)} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-surface-variant shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-body-md font-bold truncate">{item.name}</p>
                  <p className="text-label-md text-on-surface-variant mt-xs">数量 × {item.quantity}</p>
                </div>
                <span className="font-bold">¥{(item.price * item.quantity).toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="mt-sm border-t border-outline-variant/20 pt-sm space-y-sm">
            <div className="flex justify-between text-body-md text-on-surface-variant"><span>商品金额</span><span>¥{goodsAmount.toFixed(1)}</span></div>
            <div className="flex justify-between text-body-md text-on-surface-variant"><span>配送费</span><span>¥{deliveryFee.toFixed(1)}</span></div>
            <div className="flex justify-between text-body-md text-primary"><span>优惠券抵扣</span><span>-¥{discountAmount.toFixed(1)}</span></div>
          </div>
        </section>
        <button onClick={() => setCouponOpen(true)} className="liquid-card w-full flex items-center justify-between rounded-2xl p-md">
          <span className="font-headline-sm text-headline-sm font-bold">优惠券</span>
          <span className="text-primary">{selectedCoupon ? `${selectedCoupon.name} -¥${selectedCoupon.discountAmount}` : '选择优惠券'}</span>
        </button>
          <textarea value={remark} onChange={(event) => setRemark(event.target.value)} className="liquid-card w-full min-h-24 rounded-2xl p-md outline-none focus:border-primary" placeholder="订单备注，如少辣、不要香菜" aria-label="订单备注" />
      </main>
      <div className="liquid-glass shrink-0 border-t border-outline-variant/30 px-md py-sm pb-safe flex items-center justify-between">
        <div><span className="text-label-md text-on-surface-variant">合计</span><span className="ml-xs text-display-lg font-bold text-primary">¥{total.toFixed(1)}</span></div>
        <button disabled={loading || items.length === 0} onClick={submit} className="liquid-button bg-primary text-on-primary px-xl py-sm rounded-full font-headline-sm shadow-md disabled:opacity-50">{loading ? '提交中...' : '提交订单'}</button>
      </div>
      {addressOpen && (
        <div className="absolute inset-0 z-[90] bg-black/30 backdrop-blur-sm flex items-end" onClick={() => setAddressOpen(false)}>
          <div className="liquid-glass modal-surface w-full rounded-t-3xl p-md space-y-sm motion-enter" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between pb-xs">
              <h2 className="font-headline-sm text-headline-sm font-bold">选择收货地址</h2>
              <button onClick={() => openAddressForm()} className="liquid-button rounded-full bg-primary text-on-primary px-md py-xs text-label-md font-bold">新增地址</button>
            </div>
            {addresses.length === 0 && (
              <div className="rounded-xl bg-surface-container-high p-md text-on-surface-variant">
                暂无地址，请新增一个收货地址。
              </div>
            )}
            {addresses.map((item, index) => {
              const itemAddress = customerAddressText(item, mappedAddress);
              const active = selectedAddress?.id === item.id || (!selectedAddress?.id && index === 0);
              return (
                <div key={`${item.id ?? item.detail}-${index}`} className={`rounded-xl p-md bg-surface-container-high border ${active ? 'border-primary' : 'border-transparent'}`}>
                  <button onClick={() => { setSelectedAddress(item); setAddressOpen(false); }} className="liquid-button w-full text-left">
                    <div className="flex items-start justify-between gap-sm">
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface leading-snug">{itemAddress}</p>
                        <p className="text-on-surface-variant mt-xs">用户名：{item.receiver}　电话：{item.phone}</p>
                      </div>
                      {active && <span className="material-symbols-outlined text-primary">check_circle</span>}
                    </div>
                  </button>
                  <button onClick={() => openAddressForm(item)} className="liquid-button mt-sm rounded-full border border-outline-variant bg-white px-md py-xs text-label-md text-primary">编辑地址</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {addressFormOpen && (
        <div className="absolute inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-end" onClick={() => setAddressFormOpen(false)}>
          <div className="liquid-glass modal-surface w-full rounded-t-3xl p-lg space-y-md motion-enter" onClick={(event) => event.stopPropagation()}>
            <h2 className="font-headline-sm text-headline-sm font-bold">{addressForm.id ? '编辑地址' : '新增地址'}</h2>
            <label className="block">
              <span className="text-label-md font-label-md text-on-surface-variant">用户名</span>
              <input value={addressForm.receiver} onChange={(event) => setAddressForm((prev) => ({ ...prev, receiver: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="text-label-md font-label-md text-on-surface-variant">电话</span>
              <input value={addressForm.phone} onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" inputMode="numeric" autoComplete="tel" />
            </label>
            <label className="block">
              <span className="text-label-md font-label-md text-on-surface-variant">收货地址</span>
              <textarea value={addressForm.detail} onChange={(event) => setAddressForm((prev) => ({ ...prev, detail: event.target.value }))} className="mt-xs w-full min-h-24 rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" />
            </label>
            <label className="flex items-center gap-sm text-body-md text-on-surface-variant">
              <input type="checkbox" checked={Boolean(addressForm.isDefault)} onChange={(event) => setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))} />
              设为默认地址
            </label>
            <div className="flex gap-sm">
              <button onClick={() => setAddressFormOpen(false)} className="liquid-button flex-1 rounded-full border border-outline-variant bg-white text-on-surface py-sm shadow-sm">取消</button>
              <button disabled={!addressForm.detail.trim()} onClick={saveCheckoutAddress} className="liquid-button flex-1 rounded-full bg-primary text-on-primary py-sm disabled:opacity-50">保存</button>
            </div>
          </div>
        </div>
      )}
      {couponOpen && (
        <div className="absolute inset-0 z-[90] bg-black/30 backdrop-blur-sm flex items-end" onClick={() => setCouponOpen(false)}>
          <div className="liquid-glass modal-surface w-full rounded-t-3xl p-md space-y-sm motion-enter" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => { setSelectedCoupon(null); setCouponOpen(false); }} className="liquid-button w-full text-left p-md rounded-xl bg-surface-container-high">不使用优惠券</button>
            {coupons.map((item) => (
              <button key={item.id} disabled={goodsAmount < Number(item.thresholdAmount)} onClick={() => { setSelectedCoupon(item); setCouponOpen(false); }} className="liquid-button w-full text-left p-md rounded-xl bg-surface-container-high disabled:opacity-50">{item.name}<br /><span className="text-primary">满 ¥{item.thresholdAmount} 减 ¥{item.discountAmount}</span>{goodsAmount < Number(item.thresholdAmount) && <span className="block text-error text-label-md">未达到使用门槛</span>}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PayPage({ order, setOrder, go }: { order: Order | null; setOrder: (order: Order) => void; go: Navigate }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('wechat');

  const pay = () => {
    if (!order) {
      setError('请先创建订单');
      return;
    }
    setLoading(true);
    setError('');
    api
      .payOrder(order.id, payMethod)
      .then((paidOrder) => {
        setOrder(paidOrder);
        go('pay-result');
      })
      .catch((err) => setError(err instanceof Error ? err.message : '支付失败'))
      .finally(() => setLoading(false));
  };

  const cancel = () => {
    if (!order) {
      setError('请先创建订单');
      return;
    }
    setLoading(true);
    setError('');
    api.cancelOrder(order.id)
      .then((canceledOrder) => {
        setOrder(canceledOrder);
        go('orders');
      })
      .catch((err) => setError(err instanceof Error ? err.message : '取消订单失败'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="liquid-stage bg-surface min-h-full relative overflow-hidden">
      <PhoneHeader title="模拟支付" onBack={() => go('checkout')} />
      <main className="p-md space-y-lg text-center motion-enter">
        <ErrorBanner message={error} />
        <section className="liquid-glass bg-gradient-to-br from-primary-container to-primary-fixed rounded-3xl p-xl motion-float">
          <p className="text-on-primary-container text-body-md">订单金额</p>
          <div className="text-[56px] leading-none font-bold text-on-primary-container mt-sm">¥{Number(order?.totalAmount ?? 0).toFixed(2)}</div>
        </section>
        {[
          { key: 'wechat', label: '微信支付（模拟）' },
          { key: 'alipay', label: '支付宝（模拟）' },
          { key: 'campus_card', label: '校园一卡通' },
          { key: 'balance', label: '余额支付' },
        ].map((item) => (
          <button key={item.key} onClick={() => setPayMethod(item.key)} className={`liquid-button w-full p-md rounded-2xl border flex items-center justify-between ${payMethod === item.key ? 'border-primary bg-primary/10 text-primary motion-pulse-ring' : 'liquid-card'}`}>
            <span className="font-body-lg">{item.label}</span>
            <span className="material-symbols-outlined">{payMethod === item.key ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
          </button>
        ))}
        <button disabled={loading || !order} onClick={pay} className="liquid-button w-full bg-primary text-on-primary rounded-full py-md font-headline-sm shadow-md active:scale-[0.98] disabled:opacity-50">{loading ? '支付中...' : '确认支付'}</button>
        {order?.status === '待支付' && <button disabled={loading} onClick={cancel} className="liquid-button w-full border border-error text-error rounded-full py-md font-headline-sm disabled:opacity-50">取消订单</button>}
      </main>
    </div>
  );
}

export function PayResultPage({ go }: { go: Navigate }) {
  return (
    <div className="liquid-stage bg-surface min-h-full flex flex-col items-center justify-center p-xl text-center relative overflow-hidden">
      <div className="w-24 h-24 rounded-full bg-[#22C55E]/10 text-[#137333] flex items-center justify-center mb-lg motion-pulse-ring motion-enter">
        <span className="material-symbols-outlined text-[56px] fill">check_circle</span>
      </div>
      <h1 className="font-display-lg text-display-lg text-on-surface">支付成功</h1>
      <p className="text-body-md text-on-surface-variant mt-sm">商家已收到订单，正在确认备餐。</p>
      <button onClick={() => go('tracking')} className="liquid-button mt-xl w-full bg-primary text-on-primary rounded-full py-md font-headline-sm shadow-md">查看订单状态</button>
      <button onClick={() => go('home')} className="liquid-button mt-sm w-full liquid-card text-primary rounded-full py-md font-body-lg">返回首页</button>
    </div>
  );
}

const trackingSteps = [
  { status: '待商家接单', label: '订单已支付' },
  { status: '商家已接单', label: '商家已接单' },
  { status: '商家已出餐', label: '商家已出餐' },
  { status: '骑手已接单', label: '骑手已接单' },
  { status: '骑手已取餐', label: '骑手已取餐' },
  { status: '已完成', label: '已送达' },
];

function orderStepIndex(status?: string) {
  if (!status || status === '待支付') {
    return -1;
  }
  if (status === '已取消') {
    return -1;
  }
  const index = trackingSteps.findIndex((step) => step.status === status);
  return index >= 0 ? index : 0;
}

function socketUrl(orderId: string, ticket: string) {
  const configured = import.meta.env.VITE_WS_BASE_URL;
  const base = configured || `${import.meta.env.VITE_API_BASE_URL || '/api'}/ws/orders`;
  const wsBase = base.startsWith('ws')
    ? base
    : base.startsWith('http')
      ? base.replace(/^http/, 'ws')
      : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${base}`;
  const query = new URLSearchParams();
  query.set('orderId', orderId);
  query.set('ticket', ticket);
  return `${wsBase}?${query.toString()}`;
}

export function TrackingPage({ order, setOrder, go }: { order: Order | null; setOrder: (order: Order) => void; go: Navigate }) {
  const [current, setCurrent] = useState<Order | null>(order);
  const [error, setError] = useState('');
  const [locationText, setLocationText] = useState('等待骑手上报位置');
  const [riderLocation, setRiderLocation] = useState<LngLat | null>(null);
  const [merchantAddress, setMerchantAddress] = useState(fallbackMerchantAddress);
  const [customerAddress, setCustomerAddress] = useState(readableAddress(order?.address));
  const activeStep = orderStepIndex(current?.status);

  const refresh = () => {
    api
      .getOrders()
      .then((orders) => {
        const next = order ? orders.find((item) => item.id === order.id) : orders[0];
        if (next) {
          setCurrent(next);
          setOrder(next);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : '订单状态加载失败'));
    if (order?.id) {
      api.getOrderLocation(order.id)
        .then((location) => {
          if (location.available && location.longitude !== undefined && location.latitude !== undefined) {
            const nextLocation: LngLat = [location.longitude, location.latitude];
            setRiderLocation(nextLocation);
            setLocationText(`骑手位置：${location.longitude.toFixed(5)}, ${location.latitude.toFixed(5)} · 预计 ${estimateDeliveryMinutes(nextLocation, campusMapPoints.customer)} 分钟送达`);
          } else {
            setRiderLocation(null);
            setLocationText('等待骑手上报位置');
          }
        })
        .catch(() => setLocationText('WebSocket 连接失败时继续轮询订单状态'));
    }
  };

  const cancelCurrent = () => {
    if (!current) {
      return;
    }
    setError('');
    api.cancelOrder(current.id)
      .then((canceledOrder) => {
        setCurrent(canceledOrder);
        setOrder(canceledOrder);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '取消订单失败'));
  };

  useEffect(() => {
    let mounted = true;
    reverseGeocode(campusMapPoints.merchant)
      .then((nextAddress) => {
        if (mounted) {
          setMerchantAddress(nextAddress);
        }
      })
      .catch(() => {
        if (mounted) {
          setMerchantAddress(fallbackMerchantAddress);
        }
      });
    reverseGeocode(campusMapPoints.customer)
      .then((nextAddress) => {
        if (mounted) {
          setCustomerAddress(nextAddress);
        }
      })
      .catch(() => {
        if (mounted) {
          setCustomerAddress(readableAddress(current?.address || order?.address));
        }
      });
    refresh();
    const timer = window.setInterval(refresh, 10000);
    let socket: WebSocket | null = null;
    if (order?.id) {
      api.createWebSocketTicket(order.id)
        .then(({ ticket }) => {
          socket = new WebSocket(socketUrl(order.id, ticket));
          socket.onmessage = refresh;
        })
        .catch(() => {
          socket = null;
        });
    }
    return () => {
      mounted = false;
      window.clearInterval(timer);
      socket?.close();
    };
  }, [order?.id]);

  return (
    <div className="liquid-stage bg-surface min-h-full pb-[100px] relative overflow-hidden">
      <PhoneHeader title="配送跟踪" onBack={() => go('home')} />
      <DeliveryMap className="h-[260px]" riderLocation={riderLocation} title="高德实时配送跟踪" subtitle={locationText} />
      <main className="p-md -mt-lg relative z-10 space-y-md motion-enter">
        <ErrorBanner message={error} />
        <section className="liquid-glass rounded-2xl p-md">
          <h2 className="font-headline-sm text-headline-sm font-bold">{current?.status || '暂无订单'}</h2>
          {current ? (
            <div className="mt-xs space-y-[2px] text-body-md text-on-surface-variant">
              <p>商家：{current.merchantName}</p>
              <p>商家地址：{merchantAddress}</p>
              <p>收货地址：{customerAddress}</p>
            </div>
          ) : (
            <p className="text-body-md text-on-surface-variant mt-xs">请先创建并支付订单</p>
          )}
          <p className="text-label-md text-primary mt-xs">{locationText}</p>
        </section>
        <section className="liquid-card rounded-2xl p-md">
          <h2 className="font-headline-sm text-headline-sm font-bold">骑手信息</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">王师傅 · 138****2468 · 评分 4.8 · 预计 25 分钟送达</p>
          <div className="grid grid-cols-2 gap-sm mt-md">
            <button onClick={() => notify('模拟拨打骑手：138****2468')} className="liquid-button rounded-full border border-primary text-primary py-sm">联系骑手</button>
            <button onClick={() => notify(`模拟联系商家：${current?.merchantName || '商家'}`)} className="liquid-button rounded-full bg-primary text-on-primary py-sm">联系商家</button>
          </div>
        </section>
        <section className="liquid-card rounded-2xl p-md space-y-md stagger-children">
          {trackingSteps.map((step, index) => (
            <div key={step.status} className="flex gap-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${index <= activeStep ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}><span className="material-symbols-outlined text-[16px]">{index <= activeStep ? 'check' : 'radio_button_unchecked'}</span></div>
              <span className={`font-body-md ${index <= activeStep ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</span>
            </div>
          ))}
        </section>
        {current?.status === '待支付' && <button onClick={cancelCurrent} className="liquid-button w-full border border-error text-error rounded-full py-md font-headline-sm">取消订单</button>}
        <button disabled={current?.status !== '已完成'} onClick={() => go('review')} className="liquid-button w-full bg-primary text-on-primary rounded-full py-md font-headline-sm shadow-md disabled:opacity-50">评价订单</button>
      </main>
    </div>
  );
}

export function ReviewPage({ orderId, go }: { orderId: string | null; go: Navigate }) {
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const submit = () => {
    if (!orderId) {
      setError('请先完成订单');
      return;
    }
    api
      .submitReview({ orderId, rating, content: content.trim() || '本次体验不错' })
      .then(() => go('reviews'))
      .catch((err) => setError(err instanceof Error ? err.message : '提交评价失败'));
  };

  return (
    <div className="liquid-stage bg-surface min-h-full relative overflow-hidden">
      <PhoneHeader title="评价订单" onBack={() => go('tracking')} />
      <main className="p-md space-y-md motion-enter">
        <ErrorBanner message={error} />
        <section className="liquid-card rounded-2xl p-lg text-center">
          <h2 className="font-headline-sm text-headline-sm font-bold">这次用餐体验如何？</h2>
          <div className="flex justify-center gap-xs my-lg text-secondary-container">
            {[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => setRating(star)} aria-label={`评分 ${star} 星`} className={`liquid-button material-symbols-outlined text-[36px] rounded-lg ${star <= rating ? 'fill text-secondary-container motion-pulse-ring' : 'text-outline'}`}>star</button>)}
          </div>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} className="w-full min-h-32 rounded-xl border border-outline-variant bg-white/70 p-md outline-none focus:border-primary" placeholder="写下真实评价..." aria-label="评价内容" />
        </section>
        <button onClick={submit} className="liquid-button w-full bg-primary text-on-primary rounded-full py-md font-headline-sm shadow-md">提交评价</button>
      </main>
    </div>
  );
}

export function ReviewsPage({ go }: { go: Navigate }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCustomerReviews()
      .then(setReviews)
      .catch((err) => setError(err instanceof Error ? err.message : '评价加载失败'));
  }, []);

  return (
    <div className="liquid-stage bg-surface min-h-full pb-[100px] relative overflow-hidden">
      <PhoneHeader title="我的评价" onBack={() => go('profile')} />
      <main className="p-md space-y-md stagger-children">
        <ErrorBanner message={error} />
        {reviews.length === 0 && !error && (
          <section className="liquid-card rounded-2xl p-lg text-center">
            <span className="material-symbols-outlined text-[36px] text-secondary">star_rate</span>
            <h2 className="font-headline-sm text-headline-sm font-bold mt-sm">暂无评价</h2>
            <p className="text-body-md text-on-surface-variant mt-xs">完成订单后可在配送跟踪页提交评价。</p>
            <button onClick={() => go('orders')} className="liquid-button mt-md rounded-full bg-primary text-on-primary px-lg py-sm">查看历史订单</button>
          </section>
        )}
        {reviews.map((review) => (
          <article key={review.id} className="liquid-card rounded-2xl p-md">
            <div className="flex items-center justify-between gap-sm">
              <h2 className="font-headline-sm text-headline-sm font-bold">订单 {review.orderId}</h2>
              <span className="text-secondary whitespace-nowrap">{'★'.repeat(review.rating)}</span>
            </div>
            <p className="text-body-md text-on-surface mt-sm">{review.content}</p>
            {review.reply && <p className="text-body-md text-on-surface-variant mt-sm rounded-lg bg-surface-container-high p-sm">商家回复：{review.reply}</p>}
          </article>
        ))}
      </main>
    </div>
  );
}

export function FavoritesPage({ go, onMerchant }: { go: Navigate; onMerchant: (merchantId: number) => void }) {
  const [favorites, setFavorites] = useState<Required<Merchant>[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getFavoriteMerchants()
      .then((items) => setFavorites(items.map(enrichMerchant)))
      .catch((err) => setError(err instanceof Error ? err.message : '收藏加载失败'));
  }, []);

  const removeFavorite = (merchantId: number) => {
    setRemovingId(merchantId);
    api.unfavoriteMerchant(merchantId)
      .then(() => {
        setFavorites((prev) => prev.filter((merchant) => merchant.id !== merchantId));
        notify('已取消收藏');
      })
      .catch((err) => setError(err instanceof Error ? err.message : '取消收藏失败'))
      .finally(() => setRemovingId(null));
  };

  return (
    <div className="liquid-stage bg-surface min-h-full pb-[100px] relative overflow-hidden">
      <PhoneHeader title="我的收藏" onBack={() => go('profile')} />
      <main className="p-md space-y-md stagger-children">
        <ErrorBanner message={error} />
        {favorites.length === 0 && !error && (
          <div className="liquid-card rounded-2xl p-lg text-center text-on-surface-variant">
            暂无收藏商家
          </div>
        )}
        {favorites.map((merchant) => (
          <article key={merchant.id} onClick={() => onMerchant(merchant.id)} className="liquid-card w-full text-left rounded-2xl p-sm flex gap-sm items-center active:scale-[0.99] transition-transform cursor-pointer">
            <img src={merchant.image} alt={merchant.name} className="w-24 h-24 object-cover rounded-xl shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-sm">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{merchant.name}</h2>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFavorite(merchant.id);
                  }}
                  aria-label={`取消收藏${merchant.name}`}
                  disabled={removingId === merchant.id}
                  className="liquid-button w-9 h-9 rounded-full bg-error-container/40 text-error flex items-center justify-center disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </button>
              </div>
              <p className="text-label-md text-on-surface-variant mt-xs">{merchant.category} · {merchant.rating} 分</p>
              <p className="text-label-md text-on-surface-variant mt-xs">{merchant.distance} · {merchant.deliveryTime} · 起送 ¥{merchant.minOrder}</p>
              <div className="flex gap-xs mt-sm">{merchant.tags.slice(0, 2).map((tag) => <span key={tag} className="bg-primary/10 text-primary text-[10px] px-xs py-[2px] rounded">{tag}</span>)}</div>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}

export function OrdersPage({ go, setOrder }: { go: Navigate; setOrder: (order: Order) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const cancel = (order: Order) => {
    setError('');
    api.cancelOrder(order.id)
      .then(() => api.getOrders().then(setOrders))
      .catch((err) => setError(err instanceof Error ? err.message : '取消订单失败'));
  };

  useEffect(() => {
    api.getOrders().then(setOrders).catch((err) => setError(err instanceof Error ? err.message : '历史订单加载失败'));
  }, []);

  return (
    <div className="liquid-stage bg-surface min-h-full pb-[100px] relative overflow-hidden">
      <PhoneHeader title="历史订单" onBack={() => go('profile')} />
      <main className="p-md space-y-md stagger-children">
        <ErrorBanner message={error} />
        {orders.length === 0 && !error && <p className="text-body-md text-on-surface-variant">暂无订单</p>}
        {orders.map((order) => (
          <button key={order.id} onClick={() => { setOrder(order); go('tracking'); }} className="liquid-card w-full text-left rounded-2xl p-md">
            <div className="flex justify-between"><h2 className="font-headline-sm text-headline-sm font-bold">{order.merchantName}</h2><span className="text-primary text-label-md">{order.status}</span></div>
            <p className="text-body-md text-on-surface-variant mt-xs">订单号：{order.id}</p>
            <p className="font-headline-sm text-headline-sm text-primary mt-sm">¥{Number(order.totalAmount).toFixed(1)}</p>
            {order.remark && <p className="text-body-md text-on-surface-variant mt-xs">备注：{order.remark}</p>}
            {order.status === '待支付' && <span onClick={(event) => { event.stopPropagation(); cancel(order); }} className="liquid-button inline-block mt-sm rounded-full border border-error text-error px-md py-xs text-label-md">取消订单</span>}
          </button>
        ))}
      </main>
    </div>
  );
}

export function AddressPage({ go }: { go: Navigate }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ receiver: '同学', phone: '13800000000', detail: '' });
  const [mappedCustomerAddress, setMappedCustomerAddress] = useState('');
  useEffect(() => {
    api.getAddresses().then(setAddresses).catch((err) => setError(err instanceof Error ? err.message : '地址加载失败'));
    reverseGeocode(campusMapPoints.customer)
      .then((nextAddress) => setMappedCustomerAddress(nextAddress || address))
      .catch(() => setMappedCustomerAddress(''));
  }, []);
  const mappedAddress = mappedCustomerAddress || address;
  const add = () => {
    if (!form.detail.trim()) return;
    api.saveAddress({ receiver: form.receiver.trim() || '同学', phone: form.phone.trim() || '13800000000', detail: form.detail.trim(), isDefault: addresses.length === 0 })
      .then(() => api.getAddresses().then(setAddresses))
      .then(() => {
        setFormOpen(false);
        setForm({ receiver: '同学', phone: '13800000000', detail: '' });
      })
      .catch((err) => setError(err instanceof Error ? err.message : '地址保存失败'));
  };
  return (
    <div className="liquid-stage bg-surface min-h-full pb-[100px] relative overflow-hidden">
      <PhoneHeader title="我的地址" onBack={() => go('profile')} />
      <main className="p-md space-y-md stagger-children">
        <ErrorBanner message={error} />
        <button onClick={() => setFormOpen(true)} className="liquid-button w-full rounded-full bg-primary text-on-primary py-sm font-bold">新增地址</button>
        {addresses.length === 0 && <p className="text-center text-on-surface-variant py-xl">暂无地址</p>}
        {addresses.map((item, index) => <div key={item.id ?? index} className="liquid-card rounded-2xl p-md"><h3 className="font-headline-sm font-bold">{item.receiver} {item.phone}</h3><p className="text-on-surface-variant mt-xs">{customerAddressText(item, mappedAddress)}</p></div>)}
      </main>
      {formOpen && (
        <div className="absolute inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-end" onClick={() => setFormOpen(false)}>
          <div className="liquid-glass modal-surface w-full rounded-t-3xl p-lg space-y-md motion-enter" onClick={(event) => event.stopPropagation()}>
            <h2 className="font-headline-sm text-headline-sm font-bold">新增地址</h2>
            <label className="block">
              <span className="text-label-md font-label-md text-on-surface-variant">收货人</span>
              <input value={form.receiver} onChange={(event) => setForm((prev) => ({ ...prev, receiver: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="text-label-md font-label-md text-on-surface-variant">手机号</span>
              <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" inputMode="numeric" autoComplete="tel" />
            </label>
            <label className="block">
              <span className="text-label-md font-label-md text-on-surface-variant">详细地址</span>
              <textarea value={form.detail} onChange={(event) => setForm((prev) => ({ ...prev, detail: event.target.value }))} className="mt-xs w-full min-h-24 rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" />
            </label>
            <div className="flex gap-sm">
              <button onClick={() => setFormOpen(false)} className="liquid-button flex-1 rounded-full border border-outline-variant py-sm">取消</button>
              <button disabled={!form.detail.trim()} onClick={add} className="liquid-button flex-1 rounded-full bg-primary text-on-primary py-sm disabled:opacity-50">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CouponPage({ go }: { go: Navigate }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api.getCoupons().then(setCoupons).catch((err) => setError(err instanceof Error ? err.message : '优惠券加载失败'));
  }, []);
  const groupedCoupons = useMemo(() => {
    const groups = new Map<string, Coupon & { count: number }>();
    coupons.forEach((item) => {
      const key = `${item.name}-${item.thresholdAmount}-${item.discountAmount}-${item.status}`;
      const existing = groups.get(key);
      if (existing) {
        groups.set(key, { ...existing, count: existing.count + 1 });
      } else {
        groups.set(key, { ...item, count: 1 });
      }
    });
    return Array.from(groups.values());
  }, [coupons]);
  return (
    <div className="liquid-stage bg-surface min-h-full pb-[100px] relative overflow-hidden">
      <PhoneHeader title="我的优惠券" onBack={() => go('profile')} />
      <main className="p-md space-y-md stagger-children">
        <ErrorBanner message={error} />
        <div className="liquid-card rounded-2xl p-md flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">可用优惠券总数</span>
          <span className="text-headline-sm font-bold text-primary">{coupons.length} 张</span>
        </div>
        {coupons.length === 0 && <p className="text-center text-on-surface-variant py-xl">暂无可用优惠券</p>}
        {groupedCoupons.map((item) => (
          <div key={`${item.name}-${item.thresholdAmount}-${item.discountAmount}`} className="liquid-glass bg-primary-container rounded-2xl p-md text-on-primary-container motion-float">
            <div className="flex items-start justify-between gap-sm">
              <h3 className="font-headline-sm font-bold">{item.name}</h3>
              <span className="rounded-full bg-primary text-on-primary px-sm py-xs text-label-md font-bold">× {item.count}</span>
            </div>
            <p className="mt-xs">满 ¥{item.thresholdAmount} 减 ¥{item.discountAmount}</p>
            <p className="text-label-md mt-sm">{item.status === 'claimed' ? '可使用' : item.status}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
