import React, { useMemo, useState } from 'react';

type MessageType = 'all' | 'order' | 'system';

type MessageItem = {
  id: number;
  type: Exclude<MessageType, 'all'>;
  title: string;
  content: string;
  time: string;
  unread: boolean;
  icon: string;
};

const initialMessages: MessageItem[] = [
  { id: 1, type: 'order', title: '订单正在配送中', content: '您的订单 #88291 骑手已在楼下，请准备取餐。', time: '2分钟前', unread: true, icon: 'local_shipping' },
  { id: 2, type: 'order', title: '商家已接单', content: '商家正在准备餐品，预计 25 分钟送达。', time: '10:42', unread: true, icon: 'receipt_long' },
  { id: 3, type: 'system', title: '周末红包到账', content: '送您一张满 50 减 10 的专属优惠券。', time: '昨天', unread: false, icon: 'redeem' },
  { id: 4, type: 'system', title: '系统升级通知', content: '今晚凌晨将进行系统维护升级，不影响已支付订单配送。', time: '周二', unread: false, icon: 'campaign' },
];

export default function Message({ onCart, onTracking }: { onCart?: () => void; onTracking?: () => void }) {
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState<MessageType>('all');
  const [selected, setSelected] = useState<MessageItem | null>(null);
  const shownMessages = useMemo(() => messages.filter((item) => filter === 'all' || item.type === filter), [filter, messages]);

  const markAllRead = () => setMessages((items) => items.map((item) => ({ ...item, unread: false })));
  const openMessage = (message: MessageItem) => {
    setMessages((items) => items.map((item) => item.id === message.id ? { ...item, unread: false } : item));
    setSelected({ ...message, unread: false });
  };

  return (
    <div className="liquid-stage bg-background min-h-screen text-on-background pb-[90px] pt-[64px] relative overflow-hidden">
      <header className="liquid-glass fixed top-0 w-full z-50 flex justify-between items-center px-md py-sm">
        <div className="text-headline-md font-headline-md font-bold text-primary">橙意外卖</div>
        <div className="flex gap-md items-center">
          <button onClick={() => setMessages((items) => [...items])} aria-label="刷新消息" className="liquid-button w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors scale-98 active:opacity-80">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
          <button onClick={onCart} aria-label="打开购物车" className="liquid-button w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors scale-98 active:opacity-80">
            <span className="material-symbols-outlined text-primary">shopping_cart</span>
          </button>
        </div>
      </header>

      <main className="px-md flex flex-col gap-lg mt-md">
        <div className="flex justify-between items-end motion-enter">
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">消息中心</h1>
          <button onClick={markAllRead} className="font-label-md text-label-md text-primary flex items-center gap-xs pb-1">
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            全部已读
          </button>
        </div>

        <div className="flex gap-sm overflow-x-auto no-scrollbar pb-xs stagger-children">
          {[
            { key: 'all', label: '全部消息', icon: 'inbox' },
            { key: 'order', label: '订单动态', icon: 'local_shipping' },
            { key: 'system', label: '系统通知', icon: 'campaign' },
          ].map((item) => (
            <button key={item.key} onClick={() => setFilter(item.key as MessageType)} className={`liquid-button flex items-center gap-sm px-4 py-2 rounded-full font-label-md text-label-md shadow-sm shrink-0 ${filter === item.key ? 'bg-primary-container text-on-primary-container motion-pulse-ring' : 'liquid-card text-on-surface-variant hover:bg-surface-variant'}`}>
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-sm stagger-children">
          {shownMessages.map((message) => (
            <button key={message.id} onClick={() => openMessage(message)} className="liquid-card text-left p-md rounded-xl flex gap-md items-start active:scale-[0.98]">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">{message.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{message.title}</h3>
                  <span className="font-label-md text-label-md text-on-surface-variant">{message.time}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{message.content}</p>
              </div>
              {message.unread && <span className="w-2 h-2 rounded-full bg-error mt-2"></span>}
            </button>
          ))}
          {shownMessages.length === 0 && <p className="text-center py-xl text-on-surface-variant">暂无消息</p>}
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm flex items-end" onClick={() => setSelected(null)}>
          <div className="liquid-glass w-full rounded-t-3xl p-lg space-y-sm motion-enter" onClick={(event) => event.stopPropagation()}>
            <h2 className="font-headline-sm text-headline-sm font-bold">{selected.title}</h2>
            <p className="text-body-md text-on-surface-variant">{selected.content}</p>
            {selected.type === 'order' && <button onClick={() => { setSelected(null); onTracking?.(); }} className="liquid-button w-full mt-md bg-primary text-on-primary rounded-full py-sm font-bold">查看订单状态</button>}
            <button onClick={() => setSelected(null)} className="liquid-button w-full mt-md bg-primary text-on-primary rounded-full py-sm font-bold">知道了</button>
          </div>
        </div>
      )}
    </div>
  );
}
