import React, { useEffect, useState } from 'react';
import { api, type Order, type RiderLobbyOrder, type RiderStats } from '../api/client';
import { notify } from '../utils/toast';

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
  const [online, setOnline] = useState(true);

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
    <div className="liquid-stage bg-surface h-full text-on-surface overflow-y-auto no-scrollbar pb-xl relative">
      <div className="liquid-glass sticky top-0 z-50 px-md py-sm flex justify-between items-center pt-safe border-b border-surface-variant motion-enter">
        <h1 className="text-headline-sm font-headline-sm text-primary">接单大厅</h1>
        <button onClick={() => setOnline((value) => !value)} className="liquid-button flex bg-surface-variant rounded-full p-1 relative">
          <span className={`px-4 py-1.5 rounded-full text-label-md font-label-md z-10 flex items-center gap-1 ${online ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}><span className={`w-2 h-2 rounded-full ${online ? 'bg-primary' : 'bg-outline'}`}></span>{online ? '在线中' : '离线中'}</span>
        </button>
      </div>
      <div className="px-md py-md pt-lg pb-xl">
        <RiderError message={error} />
        <div className="flex gap-sm overflow-x-auto no-scrollbar my-md">
          <button className="liquid-button px-md py-xs rounded-full bg-primary text-on-primary text-label-md font-label-md whitespace-nowrap shadow-[0_2px_8px_rgba(37,99,235,0.25)] flex items-center gap-xs">全部订单 <span className="opacity-80">{orders.length}</span></button>
          <button onClick={refresh} className="liquid-button px-md py-xs rounded-full bg-surface-container-high text-on-surface-variant text-label-md font-label-md whitespace-nowrap hover:bg-surface-variant transition-colors flex items-center gap-xs">刷新</button>
        </div>
        <div className="space-y-4 stagger-children">
          {!online && <p className="text-body-md text-on-surface-variant">离线时不展示可接订单，请先上线。</p>}
          {online && orders.length === 0 && <p className="text-body-md text-on-surface-variant">暂无可抢订单</p>}
          {online && orders.map((order) => (
            <div key={order.orderId} className="liquid-card motion-border-glow rounded-2xl p-md relative overflow-hidden group">
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
              <button disabled={!online || loadingId === order.orderId} onClick={() => accept(order.orderId)} className="liquid-button w-full py-sm rounded-xl bg-primary text-on-primary text-body-lg font-body-lg font-medium shadow-[0_2px_8px_rgba(37,99,235,0.25)] hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-xs relative overflow-hidden disabled:opacity-50">抢单</button>
            </div>
          ))}
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

  const reportLocation = () => {
    const task = tasks[0];
    if (!task) {
      setError('暂无任务可上报位置');
      return;
    }
    api.reportRiderLocation({ orderId: task.id, longitude: 113.3245, latitude: 23.1064 })
      .then(() => setError('位置已上报'))
      .catch((err) => setError(err instanceof Error ? err.message : '位置上报失败'));
  };

  return (
    <div className="liquid-stage bg-surface h-full text-on-surface overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 z-0 bg-[#e3f2fd]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff_25%,transparent_25%),linear-gradient(225deg,#ffffff_25%,transparent_25%)] bg-[length:48px_48px] opacity-50"></div>
        <div className="absolute top-1/4 left-1/3 flex items-center justify-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute"></div>
            <span className="material-symbols-outlined text-primary text-[32px] drop-shadow-md fill relative">location_on</span>
        </div>
        <svg className="absolute top-1/4 left-1/3 w-1/2 h-1/4 stroke-primary/80 stroke-[4px]" fill="none" viewBox="0 0 200 100" preserveAspectRatio="none"><path className="motion-trace" strokeDasharray="8,8" d="M0,0 Q50,80 150,50 T200,100"/></svg>
        <div className="absolute top-1/2 right-1/4">
            <span className="material-symbols-outlined text-tertiary text-[28px] drop-shadow-md fill">storefront</span>
        </div>
      </div>

      <div className="liquid-glass sticky top-0 z-50 px-md py-sm flex justify-between items-center pt-safe shadow-sm">
        <h1 className="text-headline-sm font-headline-sm text-primary font-bold">配送任务</h1>
        <button onClick={refresh} aria-label="刷新任务" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"><span className="material-symbols-outlined text-[20px]">refresh</span></button>
      </div>

      <div className="liquid-glass z-10 mt-auto rounded-t-3xl shadow-[0_-4px_24px_rgba(31,41,55,0.08)] pb-md flex flex-col max-h-[80vh] motion-enter">
        <div className="w-full flex justify-center py-2 shrink-0"><div className="w-12 h-1.5 bg-outline-variant/50 rounded-full"></div></div>
        <div className="px-md pb-md flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-md">
            <div><h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">当前任务</h2><p className="text-label-md font-label-md text-on-surface-variant mt-xs">共 {tasks.length} 单进行中</p></div>
            <button onClick={reportLocation} aria-label="上报当前位置" className="p-2 rounded-full bg-primary/10 text-primary active:bg-primary/20"><span className="material-symbols-outlined text-[20px]">my_location</span></button>
          </div>
          <RiderError message={error} />
          <div className="space-y-md mt-md stagger-children">
            {tasks.length === 0 && <p className="text-body-md text-on-surface-variant">暂无配送任务</p>}
            {tasks.map((task, index) => (
              <div key={task.id} className="liquid-card motion-border-glow rounded-2xl p-md border border-outline-variant/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-error rounded-bl-2xl flex items-center justify-center text-on-error font-body-md font-bold">{index + 1}</div>
                <div className="flex justify-between items-start mb-sm pr-6">
                    <div className="flex gap-sm items-center"><div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary"><span className="material-symbols-outlined fill">storefront</span></div><div><h3 className="text-body-lg font-body-lg text-on-surface font-semibold line-clamp-1">{task.merchantName}</h3><p className="text-label-md font-label-md text-tertiary font-medium">订单：{task.id}</p></div></div>
                </div>
                <div className="bg-surface-variant/30 rounded-xl p-sm mb-md flex justify-between items-center"><div className="flex gap-2 items-center"><span className="material-symbols-outlined text-outline text-[18px]">payments</span><span className="text-label-md font-label-md text-on-surface-variant">金额 <strong className="text-body-md font-body-md text-on-surface mx-1">¥{Number(task.totalAmount).toFixed(2)}</strong></span></div><span className="text-label-md font-label-md text-error">{task.status}</span></div>
                <div className="bg-surface-variant/30 rounded-xl p-sm mb-md"><div className="flex gap-2 items-start"><span className="material-symbols-outlined text-outline text-[18px] mt-0.5">location_on</span><p className="text-label-md font-label-md text-on-surface-variant leading-relaxed">{task.address}</p></div></div>
                <div className="flex gap-sm">
                    <button onClick={() => notify(`模拟拨打商家电话：${task.merchantName} 020-88886666`)} className="liquid-button flex-1 py-2.5 rounded-xl border border-primary text-primary font-body-md font-medium flex items-center justify-center gap-xs hover:bg-primary/5"><span className="material-symbols-outlined text-[18px]">phone_enabled</span>联系商家</button>
                    <button disabled={!nextAction(task) || loadingId === task.id} onClick={() => submit(task)} className="liquid-button flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-body-md font-medium shadow-[0_2px_8px_rgba(37,99,235,0.25)] flex items-center justify-center gap-xs hover:bg-primary/90 disabled:opacity-50">{actionLabel(task)}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

}

function RiderEarnings() {
  const [stats, setStats] = useState<RiderStats>({ todayIncome: 0, todayOrders: 0, totalIncome: 0, totalOrders: 0, level: '黄金骑手', score: '4.8', onTimeRate: '99.8%' });
  const [message, setMessage] = useState('');
  const [range, setRange] = useState('今日');
  const [detail, setDetail] = useState<{ n: string; t: string; v: string; a: string } | null>(null);

  useEffect(() => {
    api.getRiderIncome().then(setStats).catch(() => undefined);
  }, []);

  const submitWithdraw = () => {
    const amount = Number(window.prompt('提现金额', '50'));
    const accountNo = window.prompt('提现账户', '校园卡 6222****8888') || '';
    if (amount > 0 && accountNo) {
      api.withdraw(amount, accountNo).then(() => setMessage('提现申请已提交')).catch((err) => setMessage(err instanceof Error ? err.message : '提现失败'));
    }
  };

  return (
    <div className="liquid-stage bg-surface h-full text-on-surface pb-xl flex flex-col font-sans relative overflow-hidden">
      <div className="liquid-glass sticky top-0 z-50 bg-primary/95 px-lg py-md pt-safe shadow-md rounded-b-[24px] motion-enter">
        <h1 className="text-headline-md font-headline-md text-on-primary mb-xl mt-sm text-center">收入统计</h1>
        <div className="flex justify-between items-center text-primary-fixed-dim/90 mb-xs px-sm"><span className="text-label-md font-label-md">今日预估收入(元)</span><span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-white transition-colors">info</span></div>
        <div className="flex items-baseline gap-xs px-sm mb-lg"><span className="text-[48px] font-display-xl font-bold text-white leading-none">{Number(stats.todayIncome).toFixed(2)}</span></div>
        <div className="flex border-t border-white/20 pt-sm"><div className="flex-1 text-center py-sm border-r border-white/20"><div className="text-primary-fixed-dim text-label-md font-label-md mb-xs">今日完成(单)</div><div className="text-white text-headline-sm font-headline-sm font-semibold">{stats.todayOrders}</div></div><div className="flex-1 text-center py-sm"><div className="text-primary-fixed-dim text-label-md font-label-md mb-xs">累计收入</div><div className="text-white text-headline-sm font-headline-sm font-semibold">{Number(stats.totalIncome).toFixed(2)}</div></div></div>
      </div>

      <div className="px-lg py-xl mt-[-24px] relative z-10 flex-1 overflow-y-auto no-scrollbar">
        {message && <div className="mb-md rounded-lg bg-primary/10 text-primary px-md py-sm">{message}</div>}
        <button onClick={submitWithdraw} className="liquid-button w-full mb-md bg-primary text-on-primary rounded-full py-sm font-bold">申请提现</button>
        <div className="liquid-card rounded-[20px] p-md shadow-sm border border-outline-variant/30 flex mb-lg">
          {['今日', '本周', '本月'].map((tab, i) => (
            <button key={i} onClick={() => setRange(tab)} className={`flex-1 py-sm text-body-md font-body-md rounded-[12px] font-medium transition-colors ${range === tab ? 'bg-primary-container text-on-primary-container shadow-sm':'text-on-surface-variant'}`}>{tab}</button>
          ))}
        </div>
        <div className="liquid-card motion-border-glow rounded-[20px] p-lg shadow-sm border border-outline-variant/30 mb-lg">
          <div className="flex justify-between items-end mb-md"><h2 className="text-body-lg font-body-lg font-bold">收入趋势图</h2><span className="text-label-md font-label-md text-on-surface-variant">近七日</span></div>
          <div className="h-[180px] w-full relative flex items-end justify-between pt-md">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20"><div className="border-b border-outline-variant w-full h-[1px]"></div><div className="border-b border-outline-variant w-full h-[1px]"></div><div className="border-b border-outline-variant w-full h-[1px]"></div><div className="border-b border-outline-variant w-full h-[1px]"></div></div>
            {[120,240,180,310,210,150,284].map((v, i, arr) => {
              const max = Math.max(...arr); 
              const h = `${(v/max)*100}%`;
              return (
              <div key={i} className="flex flex-col items-center gap-xs w-8 group">
                <div className="w-full bg-primary/20 rounded-t-md relative flex items-end justify-center transition-all group-hover:bg-primary/30" style={{height: h}}>
                    <div className="motion-rise-bar w-full bg-primary rounded-t-md transition-all group-hover:brightness-110" style={{height: h, animationDelay: `${i * 70}ms`}}></div>
                    <span className="absolute -top-6 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">{v}</span>
                </div>
                <span className="text-label-md font-label-md text-on-surface-variant group-hover:text-primary transition-colors">{["一","二","三","四","五","六","日"][i]}</span>
              </div>
            )})}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-md px-xs"><h2 className="text-body-lg font-body-lg font-bold">{range}明细</h2><button onClick={() => setMessage(`已打开${range}全部明细`)} className="text-label-md font-label-md text-primary flex items-center">全部明细 <span className="material-symbols-outlined text-[16px]">chevron_right</span></button></div>
          <div className="space-y-sm stagger-children">
            {[ 
              { n: '完成订单收入', t: '14:32', v: '+4.50', a: '单号: 83921123', c: 'text-primary' },
              { n: '好评奖励', t: '11:15', v: '+2.00', a: '来自用户: 张先生', c: 'text-tertiary' },
              { n: '完成订单收入', t: '10:45', v: '+5.20', a: '单号: 83921098', c: 'text-primary' },
              { n: '超时扣款', t: '09:20', v: '-2.00', a: '单号: 83921012', c: 'text-error' }
            ].map((d, i) => (
              <button key={i} onClick={() => setDetail(d)} className="liquid-card motion-border-glow w-full text-left rounded-[16px] p-md flex items-center justify-between border border-outline-variant/30 shadow-[0_2px_8px_rgba(38,24,20,0.02)] active:scale-[0.98] transition-transform">
                <div className="flex gap-md items-center"><div className={`w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center ${d.c}`}><span className="material-symbols-outlined text-[20px] fill">{d.v.startsWith('-') ? 'warning' : 'payments'}</span></div><div><h3 className="text-body-md font-body-md font-bold mb-0.5">{d.n}</h3><div className="flex gap-sm items-center"><span className="text-label-md font-label-md text-on-surface-variant">{d.t}</span><span className="w-1 h-1 rounded-full bg-outline-variant"></span><span className="text-label-md font-label-md text-on-surface-variant truncate w-[100px]">{d.a}</span></div></div></div><div className={`text-headline-sm font-headline-sm font-bold ${d.v.startsWith('-') ? 'text-error' : 'text-on-surface'}`}>{d.v}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {detail && (
        <div className="absolute inset-0 z-[100] bg-black/30 flex items-end" onClick={() => setDetail(null)}>
          <div className="liquid-glass modal-surface w-full rounded-t-3xl p-lg space-y-sm motion-enter" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-headline-sm font-bold">{detail.n}</h3>
            <p className="text-on-surface-variant">订单/来源：{detail.a}</p>
            <p className="text-on-surface-variant">时间：{detail.t}</p>
            <p className="text-primary font-bold">金额：{detail.v}</p>
            <button onClick={() => setDetail(null)} className="liquid-button w-full bg-primary text-on-primary rounded-full py-sm">关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RiderProfile({ onLogout }: { onLogout: () => void }) {
  const tip = notify;
  return (
    <div className="liquid-stage bg-surface h-full text-on-surface overflow-y-auto no-scrollbar pb-xl relative">
      <div className="liquid-glass bg-primary/95 pt-safe pb-xl px-lg rounded-b-[32px] relative overflow-hidden shadow-md motion-enter">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22),transparent_42%,rgba(255,255,255,0.12))] opacity-70"></div>
        <div className="flex justify-between items-center py-md relative z-10"><h1 className="text-headline-md font-headline-md text-on-primary font-bold">我的主页</h1><button onClick={() => tip('骑手设置已打开（演示）')} aria-label="骑手设置" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md hover:bg-white/30 transition-colors"><span className="material-symbols-outlined">settings</span></button></div>
        <div className="flex items-center gap-md mt-sm relative z-10">
            <div className="relative"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=rider" alt="avatar" className="w-[80px] h-[80px] rounded-full border-[3px] border-white/50 bg-primary-container object-cover shadow-sm"/><div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#137333] border-2 border-primary flex items-center justify-center"><span className="material-symbols-outlined text-[12px] text-white font-bold">check</span></div></div>
            <div><h2 className="text-headline-sm font-headline-sm text-on-primary font-bold flex items-center gap-xs">王师傅 <span className="bg-[#FFD700] text-[#B8860B] text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center">⭐ 黄金骑手</span></h2><p className="text-body-md font-body-md text-primary-fixed-dim/90 mt-xs mb-xs">RD-20231089</p>
                <div className="flex items-center gap-sm mt-1 px-3 py-1 bg-black/20 rounded-full w-fit"><span className="text-[12px] text-white">综合评分: 4.8</span><div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="w-[96%] h-full bg-[#FFD700] rounded-full"></div></div></div>
            </div>
        </div>
      </div>
      <div className="px-md -mt-lg relative z-20 space-y-md">
        <div className="liquid-card motion-border-glow rounded-2xl p-md shadow-sm border border-outline-variant/30 flex justify-around stagger-children">
            {[
                { l: "累计接单", v: "8,942", i: "task_alt", c: "text-primary" },
                { l: "准时率", v: "99.8%", i: "verified", c: "text-tertiary" },
                { l: "顾客好评", v: "4.9", i: "thumb_up", c: "text-secondary" }
            ].map((x, i) => (
                <div key={i} className="flex flex-col items-center gap-xs"><div className={`w-12 h-12 rounded-full bg-surface-variant/50 flex items-center justify-center ${x.c} border border-outline-variant/20`}><span className="material-symbols-outlined">{x.i}</span></div><span className="text-headline-sm font-headline-sm font-bold mt-1">{x.v}</span><span className="text-label-md font-label-md text-on-surface-variant">{x.l}</span></div>
            ))}
        </div>
        <div className="liquid-card rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20 stagger-children">
            {[
                { i: "electric_moped", t: "我的车辆", d: "已绑定 (粤A 83**)", c: "text-primary", action: () => tip('车辆信息：电动车 粤A 83**，电池健康 92%。') },
                { i: "security", t: "资质认证", d: "身份证、健康证已认证", c: "text-tertiary", action: () => tip('资质认证：实名认证、健康证、骑手培训均已通过。') },
                { i: "payments", t: "提现记录", d: "查看最近申请", c: "text-primary", action: () => tip('最近提现申请已提交，等待平台审核。') },
                { i: "star", t: "评分评价", d: "综合评分 4.8", c: "text-tertiary", action: () => tip('暂无新的差评，继续保持准时配送。') },
                { i: "headset_mic", t: "联系客服", d: "", c: "text-secondary", action: () => tip('骑手客服：400-800-2026') },
                { i: "logout", t: "退出登录", d: "", c: "text-error", action: onLogout }
            ].map((x, i) => (
                <button key={i} onClick={x.action} className="liquid-button w-full flex items-center justify-between p-md hover:bg-surface-variant/30 transition-colors active:bg-surface-variant/50">
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
    <div className="app-phone-shell liquid-stage max-w-[448px] mx-auto w-full h-[100dvh] relative shadow-[0_24px_70px_rgba(15,23,42,0.16)] overflow-hidden bg-surface flex flex-col md:my-0 md:border-x md:border-outline-variant/50">
      <div className="flex-1 overflow-hidden w-full relative">
        {view === 'lobby' && <RiderLobby onAccepted={() => setView('task')} />}
        {view === 'task' && <RiderTask />}
        {view === 'earnings' && <RiderEarnings />}
        {view === 'profile' && <RiderProfile onLogout={logout} />}
      </div>
      
      <nav className="liquid-glass shrink-0 w-full border-t border-outline-variant/50 pb-safe pt-xs px-md flex justify-around items-center z-50">
        {[
          { id: 'lobby', icon: 'list_alt', label: '大厅' },
          { id: 'task', icon: 'moped', label: '任务' },
          { id: 'earnings', icon: 'account_balance_wallet', label: '收入' },
          { id: 'profile', icon: 'person', label: '我的' }
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} className={`liquid-button flex flex-col items-center gap-0.5 px-sm py-xs rounded-lg transition-all ${view === t.id ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary/70'}`}>
            <span className={`material-symbols-outlined ${view === t.id ? 'fill' : ''}`}>{t.icon}</span>
            <span className="text-[10px] font-label-md font-medium">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
