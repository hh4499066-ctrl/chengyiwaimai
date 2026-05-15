import React, { useState } from 'react';
import Home from './Home';
import Cart from './Cart';
import Message from './Message';
import Profile from './Profile';
import { AddressPage, CheckoutPage, CouponPage, MerchantDetailPage, OrdersPage, PayPage, PayResultPage, ReviewPage, ReviewsPage, SearchPage, TrackingPage } from './customer/FlowPages';
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
    <div className="app-phone-shell liquid-stage max-w-[448px] mx-auto w-full h-[100dvh] relative shadow-[0_24px_70px_rgba(15,23,42,0.16)] overflow-hidden bg-surface flex flex-col md:my-0 md:border-x md:border-outline-variant/50">
      <div className="flex-1 overflow-y-auto w-full relative pb-safe">
        {screen === 'home' && activeTab === 'home' && <Home onSearch={() => go('search')} onMessage={() => go('message')} onMerchantClick={openMerchant} />}
        {screen === 'cart' && activeTab === 'cart' && <Cart onCheckout={() => go('checkout')} onSearch={() => go('search')} onMessage={() => go('message')} onMerchant={(merchantId) => merchantId ? openMerchant(merchantId) : go('merchant')} />}
        {screen === 'message' && activeTab === 'message' && <Message onCart={() => go('cart')} onTracking={() => go('tracking')} />}
        {screen === 'profile' && activeTab === 'profile' && <Profile onLogout={logout} goOrders={() => go('orders')} goAddress={() => go('address')} goCoupons={() => go('coupons')} goReviews={() => go('reviews')} onSearch={() => go('search')} onMessage={() => go('message')} onCart={() => go('cart')} />}
        {screen === 'search' && <SearchPage onBack={() => go('home')} onMerchant={openMerchant} />}
        {screen === 'merchant' && <MerchantDetailPage merchantId={selectedMerchantId} go={go} />}
        {screen === 'checkout' && <CheckoutPage merchantId={selectedMerchantId} setOrder={setCurrentOrder} go={go} />}
        {screen === 'pay' && <PayPage order={currentOrder} setOrder={setCurrentOrder} go={go} />}
        {screen === 'pay-result' && <PayResultPage go={go} />}
        {screen === 'tracking' && <TrackingPage order={currentOrder} setOrder={setCurrentOrder} go={go} />}
        {screen === 'review' && <ReviewPage orderId={currentOrder?.id ?? null} go={go} />}
        {screen === 'reviews' && <ReviewsPage go={go} />}
        {screen === 'orders' && <OrdersPage go={go} setOrder={setCurrentOrder} />}
        {screen === 'address' && <AddressPage go={go} />}
        {screen === 'coupons' && <CouponPage go={go} />}
      </div>

      <nav className="liquid-glass shrink-0 w-full border-t border-outline-variant/50 pb-safe pt-xs px-md flex justify-around items-center z-50 shadow-[0_-8px_24px_rgba(15,23,42,0.05)]">
        <button
          onClick={() => go('home')}
          className={`liquid-button flex flex-col items-center gap-0.5 px-sm py-xs rounded-lg transition-all ${activeTab === 'home' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'home' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
          <span className="text-[10px] font-label-md font-medium">首页</span>
        </button>
        <button
          onClick={() => go('cart')}
          className={`liquid-button flex flex-col items-center gap-0.5 px-sm py-xs rounded-lg transition-all ${activeTab === 'cart' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'cart' ? { fontVariationSettings: "'FILL' 1" } : {}}>shopping_cart</span>
          <span className="text-[10px] font-label-md font-medium">购物车</span>
        </button>
        <button
          onClick={() => go('message')}
          className={`liquid-button flex flex-col items-center gap-0.5 px-sm py-xs rounded-lg transition-all ${activeTab === 'message' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'message' ? { fontVariationSettings: "'FILL' 1" } : {}}>chat</span>
          <span className="text-[10px] font-label-md font-medium">消息中心</span>
        </button>
        <button
          onClick={() => go('profile')}
          className={`liquid-button flex flex-col items-center gap-0.5 px-sm py-xs rounded-lg transition-all ${activeTab === 'profile' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'profile' ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
          <span className="text-[10px] font-label-md font-medium">个人中心</span>
        </button>
      </nav>
    </div>
  );
}
