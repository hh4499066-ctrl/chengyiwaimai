import React, { useEffect, useMemo, useState } from 'react';
import { api, type Order } from '../api/client';
import { MerchantModule } from './management/ManagementPanels';

function MerchantError({ message }: { message: string }) {
  if (!message) {
    return null;
  }
  return <div className="rounded-lg bg-error-container text-on-error-container px-md py-sm text-body-md">{message}</div>;
}

function statusTone(status: string) {
  if (status === '待商家接单') {
    return 'border-l-error';
  }
  if (status === '商家已接单') {
    return 'border-l-secondary-container';
  }
  if (status === '商家已出餐') {
    return 'border-l-tertiary';
  }
  return 'border-l-outline-variant';
}

function MerchantOrderCard({ order, onAction, loadingId }: { order: Order; onAction: (orderId: string, action: 'accept' | 'reject' | 'ready') => void; loadingId: string }) {
  const loading = loadingId === order.id;
  return (
    <div className={`bg-surface-container-lowest rounded-2xl p-md border border-outline-variant/30 shadow-sm relative border-l-4 ${statusTone(order.status)}`}>
      <div className="flex justify-between items-start gap-md mb-md border-b border-outline-variant/30 pb-sm">
        <div>
          <span className="bg-primary/10 text-primary font-bold font-label-md text-label-md px-2 py-0.5 rounded">{order.status}</span>
          <p className="font-label-md text-label-md text-on-surface-variant mt-xs">订单号：{order.id}</p>
        </div>
        <span className="font-headline-sm text-headline-sm font-bold text-error">¥{Number(order.totalAmount).toFixed(2)}</span>
      </div>
      <div className="space-y-xs mb-md">
        <p className="font-body-md text-body-md font-medium text-on-surface">{order.merchantName}</p>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{order.address}</p>
      </div>
      <div className="flex gap-sm">
        {order.status === '待商家接单' && (
          <>
            <button disabled={loading} onClick={() => onAction(order.id, 'reject')} className="flex-1 py-2 rounded-xl text-on-surface-variant border border-outline-variant hover:bg-surface-variant font-body-md font-medium transition-colors disabled:opacity-50">拒单</button>
            <button disabled={loading} onClick={() => onAction(order.id, 'accept')} className="flex-[2] py-2 rounded-xl bg-primary text-on-primary font-body-md font-medium shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50">接单并打印</button>
          </>
        )}
        {order.status === '商家已接单' && (
          <button disabled={loading} onClick={() => onAction(order.id, 'ready')} className="flex-1 py-2 rounded-xl bg-secondary-container text-on-secondary-container font-body-md font-medium shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50">标记出餐</button>
        )}
        {!['待商家接单', '商家已接单'].includes(order.status) && (
          <span className="text-body-md text-on-surface-variant">当前状态无需商家处理</span>
        )}
      </div>
    </div>
  );
}

function MerchantWorkbench() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState('');

  const refreshOrders = () => {
    api.getMerchantOrders().then(setOrders).catch((err) => setError(err instanceof Error ? err.message : '订单加载失败'));
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const pendingOrders = orders.filter((order) => order.status === '待商家接单' || order.status === '商家已接单').slice(0, 6);
  const stats = useMemo(() => ({
    todayIncome: orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    todayOrders: orders.length,
    pending: orders.filter((order) => order.status === '待商家接单').length,
    ready: orders.filter((order) => order.status === '商家已出餐').length,
  }), [orders]);

  const action = (orderId: string, nextAction: 'accept' | 'reject' | 'ready') => {
    setLoadingId(orderId);
    setError('');
    api.merchantAction(orderId, nextAction)
      .then(refreshOrders)
      .catch((err) => setError(err instanceof Error ? err.message : '订单状态已变化，请刷新'))
      .finally(() => setLoadingId(''));
  };

  return (
    <div className="flex-1 overflow-y-auto p-md md:p-lg bg-surface">
      <div className="flex justify-between items-center mb-xl bg-surface-container-lowest p-md rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-md">
          <div className="w-16 h-16 rounded-xl bg-surface-variant flex-shrink-0 overflow-hidden border border-outline-variant/50">
             <img src="https://images.unsplash.com/photo-1555126634-323283e090f1?auto=format&fit=crop&w=150&h=150" alt="logo" className="w-full h-full object-cover"/>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">川香小厨 (天河总店)</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">ID: 80921102 · 普通外卖商家</p>
          </div>
        </div>
        <div className="flex items-center gap-sm bg-primary/10 px-md py-sm rounded-full border border-primary/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">营业中</span>
            <div className="ml-md w-[40px] h-[24px] bg-primary rounded-full relative cursor-pointer shadow-inner">
                <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full shadow-sm"></div>
            </div>
        </div>
      </div>

      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md font-bold">今日营业数据</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { title: "今日预计收入", value: `¥ ${stats.todayIncome.toFixed(2)}`, m: "实时订单汇总", c: "primary", icon: "account_balance_wallet" },
          { title: "今日有效订单", value: String(stats.todayOrders), m: "来自真实订单", c: "secondary", icon: "receipt_long" },
          { title: "待接订单", value: String(stats.pending), m: "需尽快处理", c: "tertiary", icon: "storefront" },
          { title: "待骑手取餐", value: String(stats.ready), m: "已进入骑手大厅", c: "error", icon: "warning" },
        ].map((item, idx) => (
          <div key={idx} className={`bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30 flex flex-col relative overflow-hidden group ${item.c === 'error' ? 'border-error/30 bg-error-container/10' : ''}`}>
            <div className="flex justify-between items-start z-10 mb-sm">
                <p className="font-body-md text-body-md text-on-surface-variant">{item.title}</p>
                <div className={`bg-${item.c}/10 p-1.5 rounded-lg text-${item.c}`}>
                  <span className="material-symbols-outlined text-[20px] fill">{item.icon}</span>
                </div>
            </div>
            <h3 className={`font-headline-md text-headline-md font-bold ${item.c === 'error' ? 'text-error' : 'text-on-surface'}`}>{item.value}</h3>
            <p className={`font-label-md text-label-md mt-sm ${item.c === 'error' ? 'text-error' : 'text-on-surface-variant'}`}>{item.m}</p>
          </div>
        ))}
      </div>

      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md font-bold flex items-center justify-between">实时单况 <button className="text-primary font-body-md text-body-md font-medium hover:underline flex items-center">查看全部 <span className="material-symbols-outlined text-[18px]">chevron_right</span></button></h3>
      <MerchantError message={error} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
         {pendingOrders.length === 0 && <p className="text-body-md text-on-surface-variant">暂无待处理订单</p>}
         {pendingOrders.map((order) => <MerchantOrderCard key={order.id} order={order} onAction={action} loadingId={loadingId} />)}
      </div>
      <div className="h-xl md:hidden"></div>
    </div>
  );
}

function MerchantOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState('全部');
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState('');
  const statuses = ['全部', '待商家接单', '商家已接单', '商家已出餐', '骑手已接单', '骑手已取餐', '已完成', '已取消'];
  const shownOrders = activeStatus === '全部' ? orders : orders.filter((order) => order.status === activeStatus);

  const refreshOrders = () => {
    api.getMerchantOrders().then(setOrders).catch((err) => setError(err instanceof Error ? err.message : '订单加载失败'));
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const action = (orderId: string, nextAction: 'accept' | 'reject' | 'ready') => {
    setLoadingId(orderId);
    setError('');
    api.merchantAction(orderId, nextAction)
      .then(refreshOrders)
      .catch((err) => setError(err instanceof Error ? err.message : '订单状态已变化，请刷新'))
      .finally(() => setLoadingId(''));
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-surface relative">
      <header className="px-lg py-md border-b border-outline-variant/30 bg-surface z-10 shrink-0">
         <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">订单管理</h2>
         <div className="flex gap-md overflow-x-auto no-scrollbar">
             {statuses.map((status) => (
                 <button key={status} onClick={() => setActiveStatus(status)} className={`whitespace-nowrap font-body-md text-body-md font-medium pb-sm border-b-2 transition-colors ${activeStatus === status ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'}`}>{status}</button>
             ))}
         </div>
      </header>
      <div className="flex-1 overflow-y-auto p-md md:p-lg space-y-md bg-surface-container-low">
          <MerchantError message={error} />
          {shownOrders.length === 0 && <p className="text-body-md text-on-surface-variant">暂无订单</p>}
          {shownOrders.map((order) => <MerchantOrderCard key={order.id} order={order} onAction={action} loadingId={loadingId} />)}
      </div>
    </div>
  );

}

function MerchantMenu() {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-surface relative">
      <header className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center bg-surface z-10 shrink-0">
          <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">商品管理</h2>
              <p className="font-label-md text-label-md text-on-surface-variant">管理菜单、价格及库存状态</p>
          </div>
          <button className="bg-primary text-on-primary px-lg py-2 rounded-lg font-body-md font-bold flex items-center gap-xs shadow-sm hover:opacity-90 transition-opacity"><span className="material-symbols-outlined text-[20px]">add</span>新建商品</button>
      </header>
      <div className="flex-1 flex overflow-hidden">
          <div className="w-[120px] md:w-[200px] border-r border-outline-variant/30 bg-surface-container-low overflow-y-auto">
              {['招牌推荐', '热销套餐', '经典炒菜', '凉菜系列', '酒水饮料', '主食'].map((c, i) => (
                  <button key={i} className={`w-full text-left px-md py-md font-body-md font-medium transition-colors relative ${i===0 ? 'bg-surface text-primary border-r-2 border-primary' : 'text-on-surface hover:bg-surface-variant'}`}>{c}</button>
              ))}
              <button className="w-full text-left px-md py-md font-body-md text-on-surface-variant hover:bg-surface-variant flex items-center gap-xs"><span className="material-symbols-outlined text-[18px]">add</span>新建分类</button>
          </div>
          <div className="flex-1 bg-surface overflow-y-auto p-md md:p-lg space-y-md">
              <div className="flex justify-between items-center bg-surface-container-lowest p-sm border border-outline-variant/30 rounded-lg">
                  <div className="flex items-center gap-sm px-sm"><span className="material-symbols-outlined text-on-surface-variant">search</span><input type="text" placeholder="搜索商品名称..." className="bg-transparent border-none outline-none font-body-md text-on-surface w-[200px] md:w-[300px]"/></div>
                  <div className="flex gap-sm">
                      <select className="bg-surface border border-outline-variant rounded p-1 text-sm outline-none"><option>全部状态</option><option>售卖中</option><option>已售罄</option></select>
                  </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md">
                              <th className="p-md font-medium">商品信息</th><th className="p-md font-medium hidden md:table-cell">价格</th><th className="p-md font-medium">库存</th><th className="p-md font-medium text-right">操作</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 font-body-md">
                          <tr className="hover:bg-surface-variant/20 transition-colors">
                              <td className="p-md flex items-center gap-md">
                                  <div className="w-16 h-16 rounded bg-surface-variant overflow-hidden flex-shrink-0"><img src="https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?fit=crop&w=150&h=150" className="w-full h-full object-cover" alt="food"/></div>
                                  <div>
                                      <p className="font-bold text-on-surface line-clamp-1">招牌麻婆豆腐</p>
                                      <p className="font-label-md text-on-surface-variant mt-1">销量: 1240 | 赞: 98%</p>
                                  </div>
                              </td>
                              <td className="p-md font-bold text-on-surface hidden md:table-cell">¥18.00</td>
                              <td className="p-md">
                                  <div className="flex items-center gap-xs text-secondary-fixed-dim font-medium"><span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span>售卖中</div>
                              </td>
                              <td className="p-md text-right whitespace-nowrap">
                                  <button className="text-primary font-medium hover:underline mr-md">编辑</button>
                                  <button className="text-on-surface-variant font-medium hover:underline">下架</button>
                              </td>
                          </tr>
                          <tr className="hover:bg-surface-variant/20 transition-colors opacity-60">
                              <td className="p-md flex items-center gap-md">
                                  <div className="w-16 h-16 rounded bg-surface-variant overflow-hidden flex-shrink-0 grayscale"><img src="https://images.unsplash.com/photo-1512058564366-18510be2db19?fit=crop&w=150&h=150" className="w-full h-full object-cover" alt="food"/></div>
                                  <div>
                                      <p className="font-bold text-on-surface line-clamp-1">秘制烤鱼 (大份)</p>
                                      <p className="font-label-md text-on-surface-variant mt-1">销量: 890 | 赞: 95%</p>
                                  </div>
                              </td>
                              <td className="p-md font-bold text-on-surface hidden md:table-cell">¥98.00</td>
                              <td className="p-md">
                                  <div className="flex items-center gap-xs text-error font-medium"><span className="w-2 h-2 rounded-full bg-error"></span>已售罄</div>
                              </td>
                              <td className="p-md text-right whitespace-nowrap">
                                  <button className="text-primary font-medium hover:underline mr-md">编辑</button>
                                  <button className="text-primary font-medium hover:underline">补库存</button>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
}

export default function Merchant({ setRole }: { setRole: () => void }) {
  const [activeTab, setActiveTab] = useState('workbench');
  const logout = () => {
    localStorage.removeItem('chengyi_token');
    localStorage.removeItem('chengyi_role');
    setRole();
  };

  return (
    <div className="bg-surface text-on-surface h-screen flex overflow-hidden w-full">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col h-screen sticky top-0 p-md bg-surface-container-low w-[240px] flex-shrink-0 border-r border-outline-variant">
        <div className="mb-lg px-sm">
          <h1 className="font-headline-sm text-headline-sm text-primary font-bold">商家中心</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">川香小厨</p>
        </div>
        <div className="flex flex-col gap-sm flex-1 overflow-y-auto">
          {[
            { id: 'workbench', icon: 'dashboard', label: '工作台' },
            { id: 'orders', icon: 'receipt_long', label: '订单管理' },
            { id: 'menu', icon: 'restaurant_menu', label: '商品管理' },
            { id: 'reviews', icon: 'star', label: '评价管理' },
            { id: 'finance', icon: 'account_balance_wallet', label: '财务结算' },
            { id: 'marketing', icon: 'campaign', label: '营销中心' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-md px-md py-sm rounded-lg font-body-md text-body-md transition-all ${
                activeTab === t.id ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === t.id ? 'fill' : ''}`}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-auto pt-md border-t border-outline-variant">
          <button onClick={logout} className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-all rounded-lg font-body-md text-body-md">
            <span className="material-symbols-outlined">logout</span>
            退出登录
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden sticky top-0 w-full z-50 flex justify-between items-center px-md py-sm bg-surface shadow-sm pt-safe">
          <span className="text-headline-md font-headline-md font-bold text-primary">商家中心</span>
          <button onClick={logout} className="material-symbols-outlined text-primary">logout</button>
        </header>

        {activeTab === 'workbench' && <MerchantWorkbench />}
        {activeTab === 'orders' && <MerchantOrders />}
        {activeTab === 'menu' && <MerchantMenu />}
        {['reviews', 'finance', 'marketing'].includes(activeTab) && <MerchantModule type={activeTab} />}

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden absolute bottom-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 pb-safe pt-xs px-md flex justify-around items-center z-50">
          {[
            { id: 'workbench', icon: 'dashboard', label: '首页' },
            { id: 'orders', icon: 'receipt_long', label: '订单' },
            { id: 'menu', icon: 'restaurant_menu', label: '菜单' },
            { id: 'finance', icon: 'account_balance_wallet', label: '财务' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex flex-col items-center gap-0.5 p-sm rounded-xl transition-all ${activeTab === t.id ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className={`material-symbols-outlined ${activeTab === t.id ? 'fill' : ''}`}>{t.icon}</span>
              <span className="text-[10px] font-label-md font-medium">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Dev Switcher tool (Desktop) */}
      {import.meta.env.DEV && <button onClick={logout} className="hidden md:block absolute top-4 right-4 z-[99] bg-black/50 text-white rounded p-2 text-xs backdrop-blur font-mono border border-white/20 hover:bg-black/70 transition-colors">← Switch Role</button>}
    </div>
  );
}
