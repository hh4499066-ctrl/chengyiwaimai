import React, { useState } from 'react';
import Home from './Home';
import Cart from './Cart';
import Message from './Message';
import Profile from './Profile';
import { CheckoutPage, MerchantDetailPage, OrdersPage, PayPage, PayResultPage, ReviewPage, SearchPage, TrackingPage } from './customer/FlowPages';
import type { Order } from '../api/client';

export default function Customer({ setRole }: { setRole: () => void }) {
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState('home');
  const [selectedMerchantId, setSelectedMerchantId] = useState(1);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const go = (next: string) => {
    setScreen(next);
    if (['home', 'cart', 'message', 'profile'].includes(next)) {
      setActiveTab(next);
    }
  };

  const openMerchant = (merchantId: number) => {
    setSelectedMerchantId(merchantId);
    go('merchant');
  };

  const logout = () => {
    localStorage.removeItem('chengyi_token');
    localStorage.removeItem('chengyi_role');
    setRole();
  };

  return (
    <div className="max-w-[448px] mx-auto w-full h-[100dvh] relative shadow-[0_0_40px_rgba(0,0,0,0.1)] overflow-hidden bg-surface flex flex-col">
      <div className="flex-1 overflow-y-auto w-full relative pb-safe">
        {screen === 'home' && activeTab === 'home' && <Home onSearch={() => go('search')} onMessage={() => go('message')} onMerchantClick={openMerchant} />}
        {screen === 'cart' && activeTab === 'cart' && <Cart onCheckout={() => go('checkout')} onSearch={() => go('search')} onMessage={() => go('message')} onMerchant={() => go('merchant')} />}
        {screen === 'message' && activeTab === 'message' && <Message onCart={() => go('cart')} onTracking={() => go('tracking')} />}
        {screen === 'profile' && activeTab === 'profile' && <Profile onLogout={logout} goOrders={() => go('orders')} goAddress={() => window.alert('地址管理请在确认订单页选择或新增')} goCoupons={() => window.alert('优惠券列表会在确认订单页展示')} goReviews={() => go('orders')} />}
        {screen === 'search' && <SearchPage onBack={() => go('home')} onMerchant={openMerchant} />}
        {screen === 'merchant' && <MerchantDetailPage merchantId={selectedMerchantId} go={go} />}
        {screen === 'checkout' && <CheckoutPage merchantId={selectedMerchantId} setOrder={setCurrentOrder} go={go} />}
        {screen === 'pay' && <PayPage order={currentOrder} setOrder={setCurrentOrder} go={go} />}
        {screen === 'pay-result' && <PayResultPage go={go} />}
        {screen === 'tracking' && <TrackingPage order={currentOrder} setOrder={setCurrentOrder} go={go} />}
        {screen === 'review' && <ReviewPage orderId={currentOrder?.id ?? null} go={go} />}
        {screen === 'orders' && <OrdersPage go={go} setOrder={setCurrentOrder} />}
      </div>

      <nav className="shrink-0 w-full bg-surface border-t border-outline-variant/30 pb-safe pt-xs px-md flex justify-around items-center z-50">
        <button
          onClick={() => go('home')}
          className={`flex flex-col items-center gap-0.5 p-sm rounded-xl transition-all ${activeTab === 'home' ? 'text-primary' : 'text-on-surface-variant hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'home' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
          <span className="text-[10px] font-label-md font-medium">首页</span>
        </button>
        <button
          onClick={() => go('cart')}
          className={`flex flex-col items-center gap-0.5 p-sm rounded-xl transition-all ${activeTab === 'cart' ? 'text-primary' : 'text-on-surface-variant hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'cart' ? { fontVariationSettings: "'FILL' 1" } : {}}>shopping_cart</span>
          <span className="text-[10px] font-label-md font-medium">购物车</span>
        </button>
        <button
          onClick={() => go('message')}
          className={`flex flex-col items-center gap-0.5 p-sm rounded-xl transition-all ${activeTab === 'message' ? 'text-primary' : 'text-on-surface-variant hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'message' ? { fontVariationSettings: "'FILL' 1" } : {}}>chat</span>
          <span className="text-[10px] font-label-md font-medium">消息中心</span>
        </button>
        <button
          onClick={() => go('profile')}
          className={`flex flex-col items-center gap-0.5 p-sm rounded-xl transition-all ${activeTab === 'profile' ? 'text-primary' : 'text-on-surface-variant hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'profile' ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
          <span className="text-[10px] font-label-md font-medium">个人中心</span>
        </button>
      </nav>

      {import.meta.env.DEV && <button onClick={logout} className="absolute top-4 left-4 z-[99] bg-black/50 text-white rounded p-2 text-xs backdrop-blur">→ Role</button>}
    </div>
  );
}
