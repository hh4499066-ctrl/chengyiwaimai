import React, { useEffect, useState } from 'react';
import { api, type Order, type RiderLobbyOrder } from '../api/client';

function RiderError({ message }: { message: string }) {
  if (!message) {
    return null;
  }
  return <div className="rounded-lg bg-error-container text-on-error-container px-md py-sm text-body-md">{message}</div>;
}

function RiderLobby({ onAccepted }: { onAccepted: () => void }) {
  const [orders, setOrders] = useState<RiderLobbyOrder[]>([]);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState('');

  const refresh = () => {
    api.getRiderLobby().then(setOrders).catch((err) => setError(err instanceof Error ? err.message : '大厅订单加载失败'));
  };

  useEffect(() => {
    refresh();
  }, []);

  const accept = (orderId: string) => {
    setLoadingId(orderId);
    setError('');
    api.riderAction(orderId, 'accept')
      .then(() => {
        refresh();
        onAccepted();
      })
      .catch((err) => setError(err instanceof Error ? err.message : '订单状态已变化，请刷新'))
      .finally(() => setLoadingId(''));
  };

  return (
    <div className="bg-surface h-screen text-on-surface overflow-y-auto no-scrollbar pb-[100px] bg-[radial-gradient(ellipse_at_top_right,_var(--color-surface-container-high),_transparent_50%)]">
      <div className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md px-md py-sm flex justify-between items-center pt-safe border-b border-surface-variant">
        <h1 className="text-headline-sm font-headline-sm text-primary">接单大厅</h1>
        <div className="flex bg-surface-variant rounded-full p-1 relative">
          <span className="px-4 py-1.5 rounded-full text-label-md font-label-md bg-primary-container text-on-primary-container z-10 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span>在线中</span>
        </div>
      </div>
      <div className="px-md py-md pt-lg pb-xl">
        <RiderError message={error} />
        <div className="flex gap-sm overflow-x-auto no-scrollbar my-md">
          <button className="px-md py-xs rounded-full bg-primary text-on-primary text-label-md font-label-md whitespace-nowrap shadow-[0_2px_8px_rgba(171,53,0,0.25)] flex items-center gap-xs">全部订单 <span className="opacity-80">{orders.length}</span></button>
          <button onClick={refresh} className="px-md py-xs rounded-full bg-surface-container-high text-on-surface-variant text-label-md font-label-md whitespace-nowrap hover:bg-surface-variant transition-colors flex items-center gap-xs">刷新</button>
        </div>
        <div className="space-y-4">
          {orders.length === 0 && <p className="text-body-md text-on-surface-variant">暂无可抢订单</p>}
          {orders.map((order) => (
            <div key={order.orderId} className="bg-surface-container-lowest rounded-2xl p-md shadow-[0_4px_16px_rgba(38,24,20,0.04)] border border-outline-variant/30 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-md">
                <div><h2 className="text-headline-sm font-headline-sm text-on-surface">¥{Number(order.income).toFixed(2)}</h2><p className="text-label-md font-label-md text-on-surface-variant mt-xs">预计收入</p></div>
                <div className="text-right"><p className="text-body-md font-body-md text-primary font-medium">{order.distance}</p><p className="text-label-md font-label-md text-on-surface-variant mt-xs">总路程</p></div>
              </div>
              <div className="relative pl-6 mb-md space-y-md">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-outline-variant"></div>
                <div className="relative">
                  <span className="absolute left-[-23px] top-1 w-2.5 h-2.5 rounded-full bg-tertiary ring-4 ring-tertiary/20"></span>
                  <p className="text-body-md font-body-md text-on-surface line-clamp-1">{order.merchant}</p>
                  <div className="flex items-center gap-xs mt-xs"><span className="material-symbols-outlined text-[14px] text-tertiary">near_me</span><p className="text-label-md font-label-md text-tertiary">订单号 {order.orderId}</p></div>
                </div>
                <div className="relative">
                  <span className="absolute left-[-23px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></span>
                  <p className="text-body-md font-body-md text-on-surface line-clamp-1">{order.address}</p>
                </div>
              </div>
              <button disabled={loadingId === order.orderId} onClick={() => accept(order.orderId)} className="w-full py-sm rounded-xl bg-primary text-on-primary text-body-lg font-body-lg font-medium shadow-[0_2px_8px_rgba(171,53,0,0.25)] hover:bg-[#832600] active:scale-[0.98] transition-all flex items-center justify-center gap-xs relative overflow-hidden disabled:opacity-50">抢单</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface h-screen text-on-surface overflow-y-auto no-scrollbar pb-[100px] bg-[radial-gradient(ellipse_at_top_right,_var(--color-surface-container-high),_transparent_50%)]">
      <div className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md px-md py-sm flex justify-between items-center pt-safe border-b border-surface-variant">
        <h1 className="text-headline-sm font-headline-sm text-primary">接单大厅</h1>
        <div className="flex bg-surface-variant rounded-full p-1 relative">
          <input type="checkbox" id="workStatus" className="peer sr-only"/>
          <label htmlFor="workStatus" className="cursor-pointer px-4 py-1.5 rounded-full text-label-md font-label-md text-on-surface-variant transition-colors peer-checked:bg-primary-container peer-checked:text-on-primary-container z-10 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-container peer-checked:bg-on-primary-container transition-colors"></span>上线中</label>
        </div>
      </div>
      <div className="px-md py-md pt-lg pb-xl">
        <div className="flex gap-sm overflow-x-auto no-scrollbar mb-md">
          <button className="px-md py-xs rounded-full bg-primary text-on-primary text-label-md font-label-md whitespace-nowrap shadow-[0_2px_8px_rgba(171,53,0,0.25)] flex items-center gap-xs">全部订单 <span className="opacity-80">12</span></button>
          <button className="px-md py-xs rounded-full bg-surface-container-high text-on-surface-variant text-label-md font-label-md whitespace-nowrap hover:bg-surface-variant transition-colors flex items-center gap-xs focus:ring-2 focus:ring-primary/20">距离最近</button>
          <button className="px-md py-xs rounded-full bg-surface-container-high text-on-surface-variant text-label-md font-label-md whitespace-nowrap hover:bg-surface-variant transition-colors flex items-center gap-xs focus:ring-2 focus:ring-primary/20">顺路最高</button>
        </div>
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-md shadow-[0_4px_16px_rgba(38,24,20,0.04)] border border-outline-variant/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-error/10 text-error px-xs py-0.5 rounded-bl-lg text-[10px] font-label-md flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px] fill">timer</span> 剩余 12:45</div>
            <div className="flex justify-between items-start mb-md">
              <div><h2 className="text-headline-sm font-headline-sm text-on-surface">¥4.50</h2><p className="text-label-md font-label-md text-on-surface-variant mt-xs">预计收入</p></div>
              <div className="text-right"><p className="text-body-md font-body-md text-primary font-medium">1.2 km</p><p className="text-label-md font-label-md text-on-surface-variant mt-xs">总路程</p></div>
            </div>
            <div className="relative pl-6 mb-md space-y-md">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-outline-variant"></div>
              <div className="relative">
                <span className="absolute left-[-23px] top-1 w-2.5 h-2.5 rounded-full bg-tertiary ring-4 ring-tertiary/20"></span>
                <p className="text-body-md font-body-md text-on-surface line-clamp-1">老王家手工水饺 (天汇广场店)</p>
                <div className="flex items-center gap-xs mt-xs"><span className="material-symbols-outlined text-[14px] text-tertiary">near_me</span><p className="text-label-md font-label-md text-tertiary">距你 240m</p></div>
              </div>
              <div className="relative">
                <span className="absolute left-[-23px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></span>
                <p className="text-body-md font-body-md text-on-surface line-clamp-1">星河湾小区 2期 4栋 1802室</p>
                <p className="text-label-md font-label-md text-on-surface-variant mt-xs">送达时间: 18:30 前</p>
              </div>
            </div>
            <button className="w-full py-sm rounded-xl bg-primary text-on-primary text-body-lg font-body-lg font-medium shadow-[0_2px_8px_rgba(171,53,0,0.25)] hover:bg-[#832600] active:scale-[0.98] transition-all flex items-center justify-center gap-xs relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>抢单
            </button>
          </div>
          
          <div className="bg-surface-container-lowest rounded-2xl p-md shadow-[0_4px_16px_rgba(38,24,20,0.04)] border border-outline-variant/30 relative overflow-hidden group opacity-80 backdrop-blur-sm grayscale-[20%]">
            <div className="absolute top-0 right-0 bg-tertiary/10 text-tertiary px-xs py-0.5 rounded-bl-lg text-[10px] font-label-md flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px] fill">route</span> 顺路单 85%</div>
            <div className="flex justify-between items-start mb-md">
              <div><h2 className="text-headline-sm font-headline-sm text-on-surface">¥3.20</h2><p className="text-label-md font-label-md text-on-surface-variant mt-xs">预计收入</p></div>
              <div className="text-right"><p className="text-body-md font-body-md text-tertiary font-medium">3.5 km</p><p className="text-label-md font-label-md text-on-surface-variant mt-xs">总路程</p></div>
            </div>
            <div className="relative pl-6 mb-md space-y-md">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-outline-variant"></div>
              <div className="relative">
                <span className="absolute left-[-23px] top-1 w-2.5 h-2.5 rounded-full bg-tertiary ring-4 ring-tertiary/20"></span>
                <p className="text-body-md font-body-md text-on-surface line-clamp-1">喜茶 (万菱汇店)</p>
                <div className="flex items-center gap-xs mt-xs"><span className="material-symbols-outlined text-[14px] text-tertiary">near_me</span><p className="text-label-md font-label-md text-tertiary">距你 1.2km</p></div>
              </div>
              <div className="relative">
                <span className="absolute left-[-23px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></span>
                <p className="text-body-md font-body-md text-on-surface line-clamp-1">珠江新城CBD 珠江国际中心 34楼</p>
                <p className="text-label-md font-label-md text-on-surface-variant mt-xs">送达时间: 18:45 前</p>
              </div>
            </div>
            <button className="w-full py-sm rounded-xl bg-surface-container-high text-on-surface-variant text-body-lg font-body-lg font-medium hover:bg-surface-variant active:scale-[0.98] transition-all flex items-center justify-center gap-xs">顺路抢单</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiderTask() {
  const [tasks, setTasks] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState('');

  const refresh = () => {
    api.getRiderTasks().then(setTasks).catch((err) => setError(err instanceof Error ? err.message : '任务加载失败'));
  };

  useEffect(() => {
    refresh();
  }, []);

  const nextAction = (order: Order): 'pickup' | 'delivered' | null => {
    if (order.status === '骑手已接单') {
      return 'pickup';
    }
    if (order.status === '骑手已取餐') {
      return 'delivered';
    }
    return null;
  };

  const actionLabel = (order: Order) => {
    if (order.status === '骑手已接单') {
      return '已到店取餐';
    }
    if (order.status === '骑手已取餐') {
      return '确认送达';
    }
    return '已完成';
  };

  const submit = (order: Order) => {
    const action = nextAction(order);
    if (!action) {
      return;
    }
    setLoadingId(order.id);
    setError('');
    api.riderAction(order.id, action)
      .then(refresh)
      .catch((err) => setError(err instanceof Error ? err.message : '订单状态已变化，请刷新'))
      .finally(() => setLoadingId(''));
  };

  return (
    <div className="bg-surface h-screen text-on-surface overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 z-0 bg-[#e3f2fd]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff_25%,transparent_25%),linear-gradient(225deg,#ffffff_25%,transparent_25%)] bg-[length:48px_48px] opacity-50"></div>
        <div className="absolute top-1/4 left-1/3 flex items-center justify-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute"></div>
            <span className="material-symbols-outlined text-primary text-[32px] drop-shadow-md fill relative">location_on</span>
        </div>
        <svg className="absolute top-1/4 left-1/3 w-1/2 h-1/4 stroke-primary/80 stroke-[4px]" fill="none" viewBox="0 0 200 100" preserveAspectRatio="none"><path strokeDasharray="8,8" d="M0,0 Q50,80 150,50 T200,100"/></svg>
        <div className="absolute top-1/2 right-1/4">
            <span className="material-symbols-outlined text-tertiary text-[28px] drop-shadow-md fill">storefront</span>
        </div>
      </div>

      <div className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md px-md py-sm flex justify-between items-center pt-safe shadow-sm">
        <h1 className="text-headline-sm font-headline-sm text-primary font-bold">配送任务</h1>
        <button onClick={refresh} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"><span className="material-symbols-outlined text-[20px]">refresh</span></button>
      </div>

      <div className="z-10 mt-auto bg-surface rounded-t-3xl shadow-[0_-4px_24px_rgba(31,41,55,0.08)] pb-[100px] flex flex-col max-h-[80vh]">
        <div className="w-full flex justify-center py-2 shrink-0"><div className="w-12 h-1.5 bg-outline-variant/50 rounded-full"></div></div>
        <div className="px-md pb-md flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-md">
            <div><h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">当前任务</h2><p className="text-label-md font-label-md text-on-surface-variant mt-xs">共 {tasks.length} 单进行中</p></div>
            <button onClick={refresh} className="p-2 rounded-full bg-primary/10 text-primary active:bg-primary/20"><span className="material-symbols-outlined text-[20px]">my_location</span></button>
          </div>
          <RiderError message={error} />
          <div className="space-y-md mt-md">
            {tasks.length === 0 && <p className="text-body-md text-on-surface-variant">暂无配送任务</p>}
            {tasks.map((task, index) => (
              <div key={task.id} className="bg-surface-container-lowest rounded-2xl p-md border border-outline-variant/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-error rounded-bl-2xl flex items-center justify-center text-on-error font-body-md font-bold">{index + 1}</div>
                <div className="flex justify-between items-start mb-sm pr-6">
                    <div className="flex gap-sm items-center"><div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary"><span className="material-symbols-outlined fill">storefront</span></div><div><h3 className="text-body-lg font-body-lg text-on-surface font-semibold line-clamp-1">{task.merchantName}</h3><p className="text-label-md font-label-md text-tertiary font-medium">订单：{task.id}</p></div></div>
                </div>
                <div className="bg-surface-variant/30 rounded-xl p-sm mb-md flex justify-between items-center"><div className="flex gap-2 items-center"><span className="material-symbols-outlined text-outline text-[18px]">payments</span><span className="text-label-md font-label-md text-on-surface-variant">金额 <strong className="text-body-md font-body-md text-on-surface mx-1">¥{Number(task.totalAmount).toFixed(2)}</strong></span></div><span className="text-label-md font-label-md text-error">{task.status}</span></div>
                <div className="bg-surface-variant/30 rounded-xl p-sm mb-md"><div className="flex gap-2 items-start"><span className="material-symbols-outlined text-outline text-[18px] mt-0.5">location_on</span><p className="text-label-md font-label-md text-on-surface-variant leading-relaxed">{task.address}</p></div></div>
                <div className="flex gap-sm">
                    <button className="flex-1 py-2.5 rounded-xl border border-primary text-primary font-body-md font-medium flex items-center justify-center gap-xs hover:bg-primary/5"><span className="material-symbols-outlined text-[18px]">phone_enabled</span>联系商家</button>
                    <button disabled={!nextAction(task) || loadingId === task.id} onClick={() => submit(task)} className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-body-md font-medium shadow-[0_2px_8px_rgba(171,53,0,0.25)] flex items-center justify-center gap-xs hover:bg-[#832600] disabled:opacity-50">{actionLabel(task)}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface h-screen text-on-surface overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 z-0 bg-[#e3f2fd]">
        <div className="w-full h-[60%] bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=23.1291,113.2644&zoom=15&size=600x600&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:road|element:geometry|color:0xffffff&style=feature:landscape|element:geometry|color:0xf5f5f5')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
        <div className="absolute top-1/4 left-1/3 flex items-center justify-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute"></div>
            <span className="material-symbols-outlined text-primary text-[32px] drop-shadow-md fill relative">location_on</span>
        </div>
        <svg className="absolute top-1/4 left-1/3 w-1/2 h-1/4 stroke-primary/80 stroke-[4px]" fill="none" viewBox="0 0 200 100" preserveAspectRatio="none"><path strokeDasharray="8,8" d="M0,0 Q50,80 150,50 T200,100"/></svg>
        <div className="absolute top-1/2 right-1/4">
            <span className="material-symbols-outlined text-tertiary text-[28px] drop-shadow-md fill">storefront</span>
        </div>
      </div>

      <div className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md px-md py-sm flex justify-between items-center pt-safe shadow-sm">
        <h1 className="text-headline-sm font-headline-sm text-primary font-bold">配送任务</h1>
        <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"><span className="material-symbols-outlined text-[20px]">sort</span></button>
      </div>

      <div className="z-10 mt-auto bg-surface rounded-t-3xl shadow-[0_-4px_24px_rgba(31,41,55,0.08)] pb-[100px] flex flex-col max-h-[80vh]">
        <div className="w-full flex justify-center py-2 shrink-0 cursor-grab active:cursor-grabbing"><div className="w-12 h-1.5 bg-outline-variant/50 rounded-full"></div></div>
        <div className="px-md pb-md flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-md">
            <div><h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">待取货任务</h2><p className="text-label-md font-label-md text-on-surface-variant mt-xs">共 2 单进行中</p></div>
            <button className="p-2 rounded-full bg-primary/10 text-primary active:bg-primary/20"><span className="material-symbols-outlined text-[20px]">my_location</span></button>
          </div>
          <div className="space-y-md">
            {/* Task 1 */}
            <div className="bg-surface-container-lowest rounded-2xl p-md border border-outline-variant/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-error rounded-bl-2xl flex items-center justify-center text-on-error font-body-md font-bold">1</div>
                <div className="flex justify-between items-start mb-sm pr-6">
                    <div className="flex gap-sm items-center"><div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary"><span className="material-symbols-outlined fill">storefront</span></div><div><h3 className="text-body-lg font-body-lg text-on-surface font-semibold line-clamp-1">老王家手工水饺 (天汇广场店)</h3><p className="text-label-md font-label-md text-tertiary font-medium">取餐号：#4521</p></div></div>
                </div>
                <div className="bg-surface-variant/30 rounded-xl p-sm mb-md flex justify-between items-center"><div className="flex gap-2 items-center"><span className="material-symbols-outlined text-outline text-[18px]">payments</span><span className="text-label-md font-label-md text-on-surface-variant">预计收入 <strong className="text-body-md font-body-md text-on-surface mx-1">¥4.50</strong></span></div><span className="text-label-md font-label-md text-error flex items-center"><span className="material-symbols-outlined text-[14px] mr-1">schedule</span>剩 12:45</span></div>
                <div className="flex gap-sm">
                    <button className="flex-1 py-2.5 rounded-xl border border-primary text-primary font-body-md font-medium flex items-center justify-center gap-xs hover:bg-primary/5"><span className="material-symbols-outlined text-[18px]">phone_enabled</span>联系商家</button>
                    <button className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-body-md font-medium shadow-[0_2px_8px_rgba(171,53,0,0.25)] flex items-center justify-center gap-xs hover:bg-[#832600]">已到店取货</button>
                </div>
            </div>
            {/* Task 2 */}
            <div className="bg-surface-container-lowest rounded-2xl p-md border border-outline-variant/30 shadow-sm relative overflow-hidden opacity-90">
                <div className="flex justify-between items-start mb-sm pr-6">
                    <div className="flex gap-sm items-center"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined fill">home</span></div><div><h3 className="text-body-lg font-body-lg text-on-surface font-semibold line-clamp-1">星河湾小区 2期 4栋 1802室</h3><p className="text-label-md font-label-md text-primary font-medium">张先生 尾号: 3942</p></div></div>
                </div>
                <div className="bg-surface-variant/30 rounded-xl p-sm mb-md"><div className="flex gap-2 items-start"><span className="material-symbols-outlined text-outline text-[18px] mt-0.5">location_on</span><p className="text-label-md font-label-md text-on-surface-variant leading-relaxed">请放到门口外卖柜第三层，到了打电话，我马上出来拿。</p></div></div>
                <div className="flex gap-sm"><button className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-body-md font-medium flex items-center justify-center gap-xs hover:bg-surface-variant"><span className="material-symbols-outlined text-[18px]">chat</span>发消息</button><button className="flex-[2] py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant font-body-md font-medium flex items-center justify-center opacity-70 cursor-not-allowed">确认送达</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiderEarnings() {
  return (
    <div className="bg-surface min-h-screen text-on-surface pb-[100px] flex flex-col font-sans">
      <div className="sticky top-0 z-50 bg-primary px-lg py-md pt-safe shadow-md rounded-b-[24px]">
        <h1 className="text-headline-md font-headline-md text-on-primary mb-xl mt-sm text-center">收入统计</h1>
        <div className="flex justify-between items-center text-primary-fixed-dim/90 mb-xs px-sm"><span className="text-label-md font-label-md">今日预估收入(元)</span><span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-white transition-colors">info</span></div>
        <div className="flex items-baseline gap-xs px-sm mb-lg"><span className="text-[48px] font-display-xl font-bold text-white leading-none">284.50</span></div>
        <div className="flex border-t border-white/20 pt-sm"><div className="flex-1 text-center py-sm border-r border-white/20"><div className="text-primary-fixed-dim text-label-md font-label-md mb-xs">今日完成(单)</div><div className="text-white text-headline-sm font-headline-sm font-semibold">42</div></div><div className="flex-1 text-center py-sm"><div className="text-primary-fixed-dim text-label-md font-label-md mb-xs">好评奖励(元)</div><div className="text-white text-headline-sm font-headline-sm font-semibold">15.00</div></div></div>
      </div>

      <div className="px-lg py-xl mt-[-24px] relative z-10 flex-1 overflow-y-auto no-scrollbar">
        <div className="bg-surface-container-lowest rounded-[20px] p-md shadow-sm border border-outline-variant/30 flex mb-lg">
          {['今日', '本周', '本月'].map((tab, i) => (
            <button key={i} className={`flex-1 py-sm text-body-md font-body-md rounded-[12px] font-medium transition-colors ${i===0 ? 'bg-primary-container text-on-primary-container shadow-sm':'text-on-surface-variant'}`}>{tab}</button>
          ))}
        </div>
        <div className="bg-surface-container-lowest rounded-[20px] p-lg shadow-sm border border-outline-variant/30 mb-lg">
          <div className="flex justify-between items-end mb-md"><h2 className="text-body-lg font-body-lg font-bold">收入趋势图</h2><span className="text-label-md font-label-md text-on-surface-variant">近七日</span></div>
          <div className="h-[180px] w-full relative flex items-end justify-between pt-md">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20"><div className="border-b border-outline-variant w-full h-[1px]"></div><div className="border-b border-outline-variant w-full h-[1px]"></div><div className="border-b border-outline-variant w-full h-[1px]"></div><div className="border-b border-outline-variant w-full h-[1px]"></div></div>
            {[120,240,180,310,210,150,284].map((v, i, arr) => {
              const max = Math.max(...arr); 
              const h = `${(v/max)*100}%`;
              return (
              <div key={i} className="flex flex-col items-center gap-xs w-8 group">
                <div className="w-full bg-primary/20 rounded-t-md relative flex items-end justify-center transition-all group-hover:bg-primary/30" style={{height: h}}>
                    <div className="w-full bg-primary rounded-t-md transition-all group-hover:brightness-110" style={{height: h}}></div>
                    <span className="absolute -top-6 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">{v}</span>
                </div>
                <span className="text-label-md font-label-md text-on-surface-variant group-hover:text-primary transition-colors">{["一","二","三","四","五","六","日"][i]}</span>
              </div>
            )})}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-md px-xs"><h2 className="text-body-lg font-body-lg font-bold">明细</h2><button className="text-label-md font-label-md text-primary flex items-center">全部明细 <span className="material-symbols-outlined text-[16px]">chevron_right</span></button></div>
          <div className="space-y-sm">
            {[ 
              { n: '完成订单收入', t: '14:32', v: '+4.50', a: '单号: 83921123', c: 'text-primary' },
              { n: '好评奖励', t: '11:15', v: '+2.00', a: '来自用户: 张先生', c: 'text-tertiary' },
              { n: '完成订单收入', t: '10:45', v: '+5.20', a: '单号: 83921098', c: 'text-primary' },
              { n: '超时扣款', t: '09:20', v: '-2.00', a: '单号: 83921012', c: 'text-error' }
            ].map((d, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-[16px] p-md flex items-center justify-between border border-outline-variant/30 shadow-[0_2px_8px_rgba(38,24,20,0.02)] active:scale-[0.98] transition-transform">
                <div className="flex gap-md items-center"><div className={`w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center ${d.c}`}><span className="material-symbols-outlined text-[20px] fill">{d.v.startsWith('-') ? 'warning' : 'payments'}</span></div><div><h3 className="text-body-md font-body-md font-bold mb-0.5">{d.n}</h3><div className="flex gap-sm items-center"><span className="text-label-md font-label-md text-on-surface-variant">{d.t}</span><span className="w-1 h-1 rounded-full bg-outline-variant"></span><span className="text-label-md font-label-md text-on-surface-variant truncate w-[100px]">{d.a}</span></div></div></div><div className={`text-headline-sm font-headline-sm font-bold ${d.v.startsWith('-') ? 'text-error' : 'text-on-surface'}`}>{d.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiderProfile() {
  return (
    <div className="bg-surface h-screen text-on-surface overflow-y-auto no-scrollbar pb-[100px]">
      <div className="bg-primary pt-safe pb-xl px-lg rounded-b-[32px] relative overflow-hidden shadow-md">
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-[-30px] left-[-20px] w-[100px] h-[100px] rounded-full bg-black/10 blur-lg"></div>
        <div className="flex justify-between items-center py-md relative z-10"><h1 className="text-headline-md font-headline-md text-on-primary font-bold">我的主页</h1><button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md hover:bg-white/30 transition-colors"><span className="material-symbols-outlined">settings</span></button></div>
        <div className="flex items-center gap-md mt-sm relative z-10">
            <div className="relative"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=rider" alt="avatar" className="w-[80px] h-[80px] rounded-full border-[3px] border-white/50 bg-primary-container object-cover shadow-sm"/><div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#137333] border-2 border-primary flex items-center justify-center"><span className="material-symbols-outlined text-[12px] text-white font-bold">check</span></div></div>
            <div><h2 className="text-headline-sm font-headline-sm text-on-primary font-bold flex items-center gap-xs">王师傅 <span className="bg-[#FFD700] text-[#B8860B] text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center">⭐ 黄金骑手</span></h2><p className="text-body-md font-body-md text-primary-fixed-dim/90 mt-xs mb-xs">RD-20231089</p>
                <div className="flex items-center gap-sm mt-1 px-3 py-1 bg-black/20 rounded-full w-fit"><span className="text-[12px] text-white">综合评分: 4.8</span><div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="w-[96%] h-full bg-[#FFD700] rounded-full"></div></div></div>
            </div>
        </div>
      </div>
      <div className="px-md -mt-lg relative z-20 space-y-md">
        <div className="bg-surface-container-lowest rounded-2xl p-md shadow-sm border border-outline-variant/30 flex justify-around">
            {[
                { l: "累计接单", v: "8,942", i: "task_alt", c: "text-primary" },
                { l: "准时率", v: "99.8%", i: "verified", c: "text-tertiary" },
                { l: "顾客好评", v: "4.9", i: "thumb_up", c: "text-secondary" }
            ].map((x, i) => (
                <div key={i} className="flex flex-col items-center gap-xs"><div className={`w-12 h-12 rounded-full bg-surface-variant/50 flex items-center justify-center ${x.c} border border-outline-variant/20`}><span className="material-symbols-outlined">{x.i}</span></div><span className="text-headline-sm font-headline-sm font-bold mt-1">{x.v}</span><span className="text-label-md font-label-md text-on-surface-variant">{x.l}</span></div>
            ))}
        </div>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
            {[
                { i: "electric_moped", t: "我的车辆", d: "已绑定 (粤A 83**)", c: "text-primary" },
                { i: "security", t: "资质认证", d: "身份证、健康证已认证", c: "text-tertiary" },
                { i: "headset_mic", t: "联系客服", d: "", c: "text-secondary" },
                { i: "help_center", t: "新手指南", d: "", c: "text-outline" }
            ].map((x, i) => (
                <button key={i} className="w-full flex items-center justify-between p-md hover:bg-surface-variant/30 transition-colors active:bg-surface-variant/50">
                    <div className="flex items-center gap-md"><div className={`w-10 h-10 rounded-full bg-surface-variant/30 flex items-center justify-center ${x.c}`}><span className="material-symbols-outlined text-[20px]">{x.i}</span></div><span className="text-body-lg font-body-lg font-medium">{x.t}</span></div>
                    <div className="flex items-center gap-xs"><span className="text-label-md font-label-md text-on-surface-variant">{x.d}</span><span className="material-symbols-outlined text-outline-variant">chevron_right</span></div>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function Rider({ setRole }: { setRole: () => void }) {
  const [view, setView] = useState('lobby');
  const logout = () => {
    localStorage.removeItem('chengyi_token');
    localStorage.removeItem('chengyi_role');
    setRole();
  };

  return (
    <div className="max-w-[448px] mx-auto w-full min-h-screen relative shadow-[0_0_40px_rgba(0,0,0,0.1)] overflow-hidden bg-surface">
      {view === 'lobby' && <RiderLobby onAccepted={() => setView('task')} />}
      {view === 'task' && <RiderTask />}
      {view === 'earnings' && <RiderEarnings />}
      {view === 'profile' && <RiderProfile />}
      
      <nav className="absolute bottom-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 pb-safe pt-xs px-md flex justify-around items-center z-50">
        {[
          { id: 'lobby', icon: 'list_alt', label: '大厅' },
          { id: 'task', icon: 'moped', label: '任务' },
          { id: 'earnings', icon: 'account_balance_wallet', label: '收入' },
          { id: 'profile', icon: 'person', label: '我的' }
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} className={`flex flex-col items-center gap-0.5 p-sm rounded-xl transition-all ${view === t.id ? 'text-primary' : 'text-on-surface-variant hover:text-primary/70'}`}>
            <span className={`material-symbols-outlined ${view === t.id ? 'fill' : ''}`}>{t.icon}</span>
            <span className="text-[10px] font-label-md font-medium">{t.label}</span>
          </button>
        ))}
      </nav>
      {/* Dev Switcher tool */}
      {import.meta.env.DEV && <button onClick={logout} className="absolute top-4 left-4 z-[99] bg-black/50 text-white rounded p-2 text-xs">← Role</button>}
    </div>
  );
}
