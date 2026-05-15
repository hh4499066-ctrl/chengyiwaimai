import React, { useEffect, useState } from 'react';
import { api, type Order, type RiderLobbyOrder, type RiderProfile as RiderProfileData, type RiderStats } from '../api/client';
import DeliveryMap from '../components/DeliveryMap';
import { campusMapPoints, readableCustomerAddress, type LngLat } from '../utils/amap';
import { notify } from '../utils/toast';

const defaultRiderAvatar = '/rider-avatar.png';

function RiderCardSkeleton() {
  return (
    <div className="liquid-card rounded-2xl p-md animate-pulse">
      <div className="h-6 w-24 rounded bg-outline-variant/40" />
      <div className="mt-md h-4 w-full rounded bg-outline-variant/30" />
      <div className="mt-sm h-4 w-2/3 rounded bg-outline-variant/30" />
      <div className="mt-md h-10 rounded-xl bg-outline-variant/30" />
    </div>
  );
}

function WithdrawModal({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (amount: number, accountNo: string) => void }) {
  const [amount, setAmount] = useState('50');
  const [accountNo, setAccountNo] = useState('校园卡 6222****8888');
  const parsedAmount = Number(amount);
  const canSubmit = Number.isFinite(parsedAmount) && parsedAmount > 0 && accountNo.trim().length > 0;
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 flex items-start justify-center px-md pt-[18dvh] pb-[96px] overflow-y-auto" onClick={onCancel}>
      <div className="liquid-glass modal-surface w-full max-w-[432px] rounded-3xl p-lg space-y-md motion-enter max-h-[calc(100dvh-140px)] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <h3 className="font-headline-sm text-headline-sm font-bold">申请提现</h3>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">提现金额</span>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" inputMode="decimal" />
        </label>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">提现账户</span>
          <input value={accountNo} onChange={(event) => setAccountNo(event.target.value)} className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" autoComplete="off" />
        </label>
        <div className="flex gap-sm">
          <button onClick={onCancel} className="liquid-button flex-1 rounded-full border border-outline-variant py-sm">取消</button>
          <button disabled={!canSubmit} onClick={() => onSubmit(parsedAmount, accountNo.trim())} className="liquid-button flex-1 rounded-full bg-primary text-on-primary py-sm disabled:opacity-50">提交</button>
        </div>
      </div>
    </div>
  );
}

function RiderProfileEditModal({
  profile,
  onCancel,
  onSubmit,
}: {
  profile: RiderProfileData;
  onCancel: () => void;
  onSubmit: (payload: { nickname: string; avatarFile?: File }) => void;
}) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState(profile.avatarUrl || defaultRiderAvatar);
  const canSubmit = nickname.trim().length > 0;
  const chooseAvatar = (file?: File) => {
    if (!file) {
      return;
    }
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  return (
    <div className="absolute inset-0 z-[100] bg-black/30 flex items-end" onClick={onCancel}>
      <div className="liquid-glass modal-surface w-full rounded-t-3xl p-lg space-y-md motion-enter" onClick={(event) => event.stopPropagation()}>
        <h3 className="font-headline-sm text-headline-sm font-bold">编辑骑手资料</h3>
        <div className="flex items-center gap-md">
          <img src={previewUrl} alt="骑手头像预览" className="w-16 h-16 rounded-full border border-outline-variant bg-primary-container object-cover" />
          <label className="liquid-button rounded-full bg-primary text-on-primary px-md py-sm text-label-md font-bold cursor-pointer">
            选择头像
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => chooseAvatar(event.target.files?.[0])} />
          </label>
        </div>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">用户名</span>
          <input value={nickname} onChange={(event) => setNickname(event.target.value)} className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" maxLength={30} />
        </label>
        <p className="text-label-md text-on-surface-variant">{avatarFile ? `已选择：${avatarFile.name}` : '支持 JPG、PNG、WebP、GIF，最大 2MB。'}</p>
        <div className="flex gap-sm">
          <button onClick={onCancel} className="liquid-button flex-1 rounded-full border border-outline-variant bg-white text-on-surface py-sm shadow-sm">取消</button>
          <button disabled={!canSubmit} onClick={() => onSubmit({ nickname: nickname.trim(), avatarFile })} className="liquid-button flex-1 rounded-full bg-primary text-on-primary py-sm disabled:opacity-50">保存</button>
        </div>
      </div>
    </div>
  );
}

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
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    return api.getRiderLobby().then(setOrders).catch((err) => setError(err instanceof Error ? err.message : '大厅订单加载失败')).finally(() => setLoading(false));
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
          {online && loading && [...Array(3)].map((_, index) => <RiderCardSkeleton key={index} />)}
          {online && !loading && orders.length === 0 && <p className="text-body-md text-on-surface-variant">暂无可抢订单</p>}
          {online && !loading && orders.map((order) => (
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
                  <p className="text-body-md font-body-md text-on-surface line-clamp-1">{readableCustomerAddress(order.address)}</p>
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
  const [loading, setLoading] = useState(true);
  const [riderPosition, setRiderPosition] = useState<LngLat>(campusMapPoints.riderFallback);

  const refresh = () => {
    setLoading(true);
    return api.getRiderTasks().then(setTasks).catch((err) => setError(err instanceof Error ? err.message : '任务加载失败')).finally(() => setLoading(false));
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
    const submitLocation = (position: LngLat) => {
      setRiderPosition(position);
      api.reportRiderLocation({ orderId: task.id, longitude: position[0], latitude: position[1] })
        .then(() => setError('位置已上报，用户端地图会实时刷新'))
        .catch((err) => setError(err instanceof Error ? err.message : '位置上报失败'));
    };
    if (!navigator.geolocation) {
      submitLocation(riderPosition);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => submitLocation([position.coords.longitude, position.coords.latitude]),
      () => submitLocation(riderPosition),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 15000 },
    );
  };

  return (
    <div className="liquid-stage bg-surface h-full text-on-surface overflow-hidden flex flex-col relative">
      <div className="liquid-glass sticky top-0 z-50 px-md py-sm flex justify-between items-center pt-safe shadow-sm">
        <h1 className="text-headline-sm font-headline-sm text-primary font-bold">配送任务</h1>
        <button onClick={refresh} aria-label="刷新任务" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"><span className="material-symbols-outlined text-[20px]">refresh</span></button>
      </div>

      <DeliveryMap className="relative z-10 h-[430px] shrink-0" riderLocation={riderPosition} title="骑手配送导航" />

      <div className="liquid-glass z-30 -mt-8 rounded-t-3xl shadow-[0_-4px_24px_rgba(31,41,55,0.08)] pb-md flex flex-col max-h-[80vh] motion-enter">
        <div className="w-full flex justify-center py-2 shrink-0"><div className="w-12 h-1.5 bg-outline-variant/50 rounded-full"></div></div>
        <div className="px-md pb-md flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-md">
            <div><h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">当前任务</h2><p className="text-label-md font-label-md text-on-surface-variant mt-xs">共 {tasks.length} 单进行中</p></div>
            <button onClick={reportLocation} aria-label="上报当前位置" className="p-2 rounded-full bg-primary/10 text-primary active:bg-primary/20"><span className="material-symbols-outlined text-[20px]">my_location</span></button>
          </div>
          <RiderError message={error} />
          <div className="space-y-md mt-md stagger-children">
            {loading && [...Array(2)].map((_, index) => <RiderCardSkeleton key={index} />)}
            {!loading && tasks.length === 0 && <p className="text-body-md text-on-surface-variant">暂无配送任务</p>}
            {!loading && tasks.map((task, index) => (
              <div key={task.id} className="liquid-card motion-border-glow rounded-2xl p-md border border-outline-variant/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-error rounded-bl-2xl flex items-center justify-center text-on-error font-body-md font-bold">{index + 1}</div>
                <div className="flex justify-between items-start mb-sm pr-6">
                    <div className="flex gap-sm items-center"><div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary"><span className="material-symbols-outlined fill">storefront</span></div><div><h3 className="text-body-lg font-body-lg text-on-surface font-semibold line-clamp-1">{task.merchantName}</h3><p className="text-label-md font-label-md text-tertiary font-medium">订单：{task.id}</p></div></div>
                </div>
                <div className="bg-surface-variant/30 rounded-xl p-sm mb-md flex justify-between items-center"><div className="flex gap-2 items-center"><span className="material-symbols-outlined text-outline text-[18px]">payments</span><span className="text-label-md font-label-md text-on-surface-variant">金额 <strong className="text-body-md font-body-md text-on-surface mx-1">¥{Number(task.totalAmount).toFixed(2)}</strong></span></div><span className="text-label-md font-label-md text-error">{task.status}</span></div>
                <div className="bg-surface-variant/30 rounded-xl p-sm mb-md"><div className="flex gap-2 items-start"><span className="material-symbols-outlined text-outline text-[18px] mt-0.5">location_on</span><p className="text-label-md font-label-md text-on-surface-variant leading-relaxed">{readableCustomerAddress(task.address)}</p></div></div>
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
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const todayIncome = Number(stats.todayIncome || 0);
  const totalIncome = Number(stats.totalIncome || 0);
  const todayOrders = Number(stats.todayOrders || 0);
  const trendValues = todayIncome > 0 ? [0, 0, 0, 0, 0, 0, todayIncome] : [0, 0, 0, 0, 0, 0, 0];
  const maxTrend = Math.max(...trendValues, 1);
  const detailRows = todayIncome > 0 || todayOrders > 0
    ? [
      { n: '完成订单收入', t: '14:32', v: `+${Math.max(todayIncome, 0).toFixed(2)}`, a: `今日完成 ${todayOrders} 单`, c: 'text-primary' },
    ]
    : [];

  useEffect(() => {
    api.getRiderIncome().then(setStats).catch(() => undefined);
  }, []);

  const submitWithdraw = () => {
    setWithdrawOpen(true);
  };

  const confirmWithdraw = (amount: number, accountNo: string) => {
    api.withdraw(amount, accountNo)
      .then(() => {
        setMessage('提现申请已提交');
        setWithdrawOpen(false);
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : '提现失败'));
  };

  return (
    <div className="liquid-stage bg-surface h-full text-on-surface pb-xl flex flex-col font-sans relative overflow-hidden">
      <div className="sticky top-0 z-50 bg-primary px-lg py-md pt-safe shadow-md rounded-b-[24px] motion-enter">
        <h1 className="text-headline-md font-headline-md text-on-primary mb-xl mt-sm text-center">收入统计</h1>
        <div className="flex justify-between items-center text-primary-fixed mb-xs px-sm"><span className="text-label-md font-label-md">今日预估收入(元)</span><span className="material-symbols-outlined text-[18px] cursor-pointer text-primary-fixed">info</span></div>
        <div className="flex items-baseline gap-xs px-sm mb-lg"><span className="text-[48px] font-display-xl font-bold text-on-primary leading-none">{todayIncome.toFixed(2)}</span></div>
        <div className="flex border-t border-white/25 pt-sm"><div className="flex-1 text-center py-sm border-r border-white/25"><div className="text-primary-fixed text-label-md font-label-md mb-xs">今日完成(单)</div><div className="text-on-primary text-headline-sm font-headline-sm font-semibold">{todayOrders}</div></div><div className="flex-1 text-center py-sm"><div className="text-primary-fixed text-label-md font-label-md mb-xs">累计收入</div><div className="text-on-primary text-headline-sm font-headline-sm font-semibold">{totalIncome.toFixed(2)}</div></div></div>
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
            {trendValues.map((v, i) => {
              const h = v > 0 ? `${Math.max(18, (v / maxTrend) * 100)}%` : '6px';
              return (
              <div key={i} className="flex flex-col items-center gap-xs w-8 group">
                <div className="w-full min-h-[6px] bg-primary/10 rounded-t-md relative flex items-end justify-center transition-all group-hover:bg-primary/20" style={{ height: h }}>
                    <div className={`motion-rise-bar w-full rounded-t-md transition-all group-hover:brightness-110 ${v > 0 ? 'bg-primary' : 'bg-outline-variant'}`} style={{ height: '100%', animationDelay: `${i * 70}ms` }}></div>
                    <span className="absolute -top-6 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">{v.toFixed(2)}</span>
                </div>
                <span className="text-label-md font-label-md text-on-surface-variant group-hover:text-primary transition-colors">{["一","二","三","四","五","六","日"][i]}</span>
              </div>
            )})}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-md px-xs"><h2 className="text-body-lg font-body-lg font-bold">{range}明细</h2><button onClick={() => setMessage(`已打开${range}全部明细`)} className="text-label-md font-label-md text-primary flex items-center">全部明细 <span className="material-symbols-outlined text-[16px]">chevron_right</span></button></div>
          <div className="space-y-sm stagger-children">
            {detailRows.length === 0 && (
              <div className="liquid-card rounded-[16px] p-lg border border-outline-variant/30 text-center">
                <div className="mx-auto mb-sm flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined">account_balance_wallet</span></div>
                <h3 className="text-body-lg font-body-lg font-bold">暂无收入明细</h3>
                <p className="mt-xs text-label-md font-label-md text-on-surface-variant">当前收入为 ¥0.00，完成配送后会生成明细。</p>
              </div>
            )}
            {detailRows.map((d, i) => (
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
      {withdrawOpen && <WithdrawModal onCancel={() => setWithdrawOpen(false)} onSubmit={confirmWithdraw} />}
    </div>
  );
}

function RiderProfile({ onLogout }: { onLogout: () => void }) {
  const tip = notify;
  const fallbackProfile: RiderProfileData = {
    userId: 0,
    nickname: '王师傅',
    phone: '13800000002',
    avatarUrl: defaultRiderAvatar,
    level: '新手骑手',
    score: null,
    completedOrders: 0,
    nextLevelNeed: 10,
    progressPercent: 0,
  };
  const [profile, setProfile] = useState<RiderProfileData>(fallbackProfile);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    api.getRiderProfile().then((data) => setProfile({ ...fallbackProfile, ...data })).catch(() => undefined);
  }, []);

  const saveProfile = (payload: { nickname: string; avatarFile?: File }) => {
    const action = payload.avatarFile
      ? api.uploadRiderAvatar(payload.avatarFile, payload.nickname)
      : api.updateRiderProfile({ nickname: payload.nickname });
    action
      .then((data) => {
        setProfile((prev) => ({ ...prev, ...data }));
        setEditOpen(false);
        tip('骑手资料已保存');
      })
      .catch((err) => tip(err instanceof Error ? err.message : '骑手资料保存失败'));
  };
  const completedOrdersText = Number(profile.completedOrders || 0).toLocaleString('zh-CN');
  const nextLevelText = profile.nextLevelNeed > 0 ? `距下一级还差 ${profile.nextLevelNeed} 单` : '已达最高等级';
  const hasCompletedOrders = Number(profile.completedOrders || 0) > 0;
  const scoreText = hasCompletedOrders && profile.score ? String(profile.score) : '暂无';
  const onTimeRateText = hasCompletedOrders ? '99.8%' : '暂无';

  return (
    <div className="liquid-stage bg-surface h-full text-on-surface overflow-y-auto no-scrollbar pb-xl relative">
      <div className="liquid-glass bg-primary/95 pt-safe pb-xl px-lg rounded-b-[32px] relative overflow-hidden shadow-md motion-enter">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22),transparent_42%,rgba(255,255,255,0.12))] opacity-70"></div>
        <div className="flex justify-between items-center py-md relative z-10"><h1 className="text-headline-md font-headline-md text-slate-900 font-bold">我的主页</h1><button onClick={() => setEditOpen(true)} aria-label="编辑骑手资料" className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-primary backdrop-blur-md hover:bg-white transition-colors shadow-sm"><span className="material-symbols-outlined">edit</span></button></div>
        <div className="flex items-center gap-md mt-sm relative z-10">
            <button onClick={() => setEditOpen(true)} aria-label="编辑头像" className="relative active:scale-95 transition-transform"><img src={profile.avatarUrl || fallbackProfile.avatarUrl} alt="骑手头像" className="w-[80px] h-[80px] rounded-full border-[3px] border-white/50 bg-primary-container object-cover shadow-sm"/><div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#137333] border-2 border-primary flex items-center justify-center"><span className="material-symbols-outlined text-[12px] text-white font-bold">check</span></div></button>
            <div><h2 className="text-headline-sm font-headline-sm text-slate-950 font-bold flex items-center gap-xs">{profile.nickname} <span className="bg-[#FFD700] text-[#7A4D00] text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center">{profile.level}</span></h2><p className="text-body-md font-body-md text-primary font-semibold mt-xs mb-xs">RD-{String(profile.userId || 20231089).padStart(8, '0')}</p>
                <div className="flex items-center gap-sm mt-1 px-3 py-1 bg-slate-900/20 rounded-full w-fit"><span className="text-[12px] text-slate-900 font-semibold">综合评分: {scoreText}</span><div className="w-16 h-1.5 bg-white/60 rounded-full overflow-hidden"><div className="h-full bg-[#FFD700] rounded-full" style={{ width: `${hasCompletedOrders ? Math.max(0, Math.min(100, Number(profile.progressPercent || 0))) : 0}%` }}></div></div></div>
            </div>
        </div>
      </div>
      <div className="px-md -mt-lg relative z-20 space-y-md">
        <div className="liquid-card rounded-2xl p-md border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-body-md font-bold text-on-surface">等级进度</span>
            <span className="text-label-md text-primary font-bold">{nextLevelText}</span>
          </div>
          <div className="mt-sm h-2.5 rounded-full bg-surface-variant overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, Number(profile.progressPercent || 0)))}%` }} />
          </div>
        </div>
        <div className="liquid-card motion-border-glow rounded-2xl p-md shadow-sm border border-outline-variant/30 flex justify-around stagger-children">
            {[
                { l: "累计接单", v: completedOrdersText, i: "task_alt", c: "text-primary" },
                { l: "准时率", v: onTimeRateText, i: "verified", c: "text-tertiary" },
                { l: "顾客好评", v: scoreText, i: "thumb_up", c: "text-secondary" }
            ].map((x, i) => (
                <div key={i} className="flex flex-col items-center gap-xs"><div className={`w-12 h-12 rounded-full bg-surface-variant/50 flex items-center justify-center ${x.c} border border-outline-variant/20`}><span className="material-symbols-outlined">{x.i}</span></div><span className="text-headline-sm font-headline-sm font-bold mt-1">{x.v}</span><span className="text-label-md font-label-md text-on-surface-variant">{x.l}</span></div>
            ))}
        </div>
        <div className="liquid-card rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20 stagger-children">
            {[
                { i: "electric_moped", t: "我的车辆", d: "已绑定 (粤A 83**)", c: "text-primary", action: () => tip('车辆信息：电动车 粤A 83**，电池健康 92%。') },
                { i: "security", t: "资质认证", d: "身份证、健康证已认证", c: "text-tertiary", action: () => tip('资质认证：实名认证、健康证、骑手培训均已通过。') },
                { i: "payments", t: "提现记录", d: "查看最近申请", c: "text-primary", action: () => tip('最近提现申请已提交，等待平台审核。') },
                { i: "star", t: "评分评价", d: hasCompletedOrders ? `综合评分 ${scoreText}` : "暂无评分", c: "text-tertiary", action: () => tip(hasCompletedOrders ? '暂无新的差评，继续保持准时配送。' : '完成订单后会生成准时率和顾客好评。') },
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
      {editOpen && <RiderProfileEditModal profile={profile} onCancel={() => setEditOpen(false)} onSubmit={saveProfile} />}
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
