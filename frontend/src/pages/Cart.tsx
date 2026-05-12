import React, { useEffect, useMemo, useState } from 'react';
import { api, type CartItem } from '../api/client';
import { dishes, merchants } from '../mock/data';

const fallbackCart: CartItem[] = dishes.slice(0, 2).map((dish) => ({
  dishId: dish.id,
  name: dish.name,
  quantity: 1,
  price: dish.price,
}));

export default function Cart({ onCheckout }: { onCheckout?: () => void }) {
  const [items, setItems] = useState<CartItem[]>(fallbackCart);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const deliveryFee = items.length > 0 ? 1.5 : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    api
      .getCart()
      .then((cartItems) => setItems(cartItems.length ? cartItems : fallbackCart))
      .catch(() => setItems(fallbackCart));
  }, []);

  return (
    <div className="antialiased bg-background text-on-background min-h-full flex flex-col">
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

      <main className="px-md flex flex-col gap-md max-w-container-max-pc mx-auto w-full flex-1 py-md">
        <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(31,41,55,0.04)] p-md flex flex-col gap-sm border border-surface-variant/30">
          <div className="flex items-center justify-between border-b border-surface-variant/20 pb-sm">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">storefront</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{merchants[0].name}</h2>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
            </div>
          </div>

          <div className="flex flex-col gap-md pt-sm">
            {items.map((item) => (
              <div key={item.dishId} className="flex gap-sm items-start">
                <div className="w-20 h-20 rounded-lg bg-surface-container overflow-hidden shrink-0 shadow-sm">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${dishes.find((dish) => dish.id === item.dishId)?.image || dishes[0].image}')` }}></div>
                </div>
                <div className="flex flex-col flex-grow justify-between min-h-[80px]">
                  <div>
                    <h3 className="font-body-lg text-body-lg text-on-surface font-semibold">{item.name}</h3>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">标准规格</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-headline-sm text-headline-sm text-primary">¥{item.price}</span>
                    <div className="flex items-center gap-xs">
                      <button className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="font-body-md text-body-md w-6 text-center">{item.quantity}</span>
                      <button className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-xs pt-sm border-t border-surface-variant/20 mt-xs">
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">包装费</span>
              <span className="font-body-md text-body-md text-on-surface">¥0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">配送费</span>
              <span className="font-body-md text-body-md text-on-surface">¥{deliveryFee.toFixed(1)}</span>
            </div>
          </div>
        </section>
      </main>

      <div className="sticky bottom-0 w-full bg-surface-container-lowest border-t border-surface-variant shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-md py-sm flex justify-between items-center z-40 shrink-0 mt-auto">
        <div className="flex items-end gap-xs">
          <span className="font-body-md text-body-md text-on-surface-variant mb-1">合计:</span>
          <span className="font-display-lg text-display-lg text-primary leading-none">¥{total.toFixed(1)}</span>
        </div>
        <button onClick={onCheckout} className="bg-primary-container text-on-primary text-headline-sm font-headline-sm px-xl py-sm rounded-full shadow-md scale-98 active:opacity-80 transition-transform">
          去结算({items.length})
        </button>
      </div>
    </div>
  );
}
