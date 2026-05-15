import React, { useEffect, useMemo, useState } from 'react';
import { api, type Dish, type MerchantStats, type Order } from '../api/client';
import { MerchantModule } from './management/ManagementPanels';

type Tone = 'primary' | 'secondary' | 'tertiary' | 'error';

const toneClasses: Record<Tone, { icon: string; text: string }> = {
  primary: { icon: 'bg-primary/10 text-primary', text: 'text-primary' },
  secondary: { icon: 'bg-secondary/10 text-secondary', text: 'text-secondary' },
  tertiary: { icon: 'bg-tertiary/10 text-tertiary', text: 'text-tertiary' },
  error: { icon: 'bg-error/10 text-error', text: 'text-error' },
};

type PromptConfig = {
  title: string;
  label: string;
  defaultValue: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  onSubmit: (value: string) => void;
};

function MerchantError({ message }: { message: string }) {
  if (!message) {
    return null;
  }
  return <div className="rounded-lg bg-error-container text-on-error-container px-md py-sm text-body-md">{message}</div>;
}

function OrderCardSkeleton() {
  return (
    <div className="liquid-card rounded-2xl p-md animate-pulse">
      <div className="h-5 w-24 rounded bg-outline-variant/40" />
      <div className="mt-md h-4 w-44 rounded bg-outline-variant/30" />
      <div className="mt-sm h-4 w-full rounded bg-outline-variant/30" />
      <div className="mt-md h-9 rounded-xl bg-outline-variant/30" />
    </div>
  );
}

function MerchantPromptModal({ config, onClose }: { config: PromptConfig; onClose: () => void }) {
  const [value, setValue] = useState(config.defaultValue);
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg">
      <div className="liquid-glass modal-surface rounded-2xl p-lg w-full max-w-lg space-y-md motion-enter">
        <h3 className="font-headline-sm text-headline-sm font-bold">{config.title}</h3>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">{config.label}</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary"
            inputMode={config.inputMode}
            autoFocus
          />
        </label>
        <div className="flex justify-end gap-sm">
          <button onClick={onClose} className="liquid-button px-md py-sm rounded-lg border border-outline-variant">取消</button>
          <button disabled={!value.trim()} onClick={() => config.onSubmit(value.trim())} className="liquid-button px-md py-sm rounded-lg bg-primary text-on-primary disabled:opacity-50">确认</button>
        </div>
      </div>
    </div>
  );
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

function MerchantOrderCard({ order, onAction, loadingId }: { key?: React.Key; order: Order; onAction: (orderId: string, action: 'accept' | 'reject' | 'ready') => void; loadingId: string }) {
  const loading = loadingId === order.id;
  return (
    <div className={`liquid-card motion-border-glow rounded-2xl p-md border border-outline-variant/30 shadow-sm relative border-l-4 ${statusTone(order.status)}`}>
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
        <p className="font-label-md text-label-md text-on-surface-variant">备注：{order.remark?.trim() || '无备注'}</p>
        {order.payMethod && <p className="font-label-md text-label-md text-on-surface-variant">支付方式：{order.payMethod}</p>}
      </div>
      <div className="flex gap-sm">
        {order.status === '待商家接单' && (
          <>
            <button disabled={loading} onClick={() => onAction(order.id, 'reject')} className="flex-1 py-2 rounded-xl text-on-surface-variant border border-outline-variant hover:bg-surface-variant font-body-md font-medium transition-colors disabled:opacity-50">拒单</button>
            <button disabled={loading} onClick={() => onAction(order.id, 'accept')} className="liquid-button flex-[2] py-2 rounded-xl bg-primary text-on-primary font-body-md font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50">接单并打印</button>
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

function MerchantWorkbench({ onViewAllOrders }: { onViewAllOrders: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [serverStats, setServerStats] = useState<MerchantStats | null>(null);
  const [businessStatus, setBusinessStatus] = useState('open');

  const refreshOrders = () => {
    setLoadingOrders(true);
    return api.getMerchantOrders().then(setOrders).catch((err) => setError(err instanceof Error ? err.message : '订单加载失败')).finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    refreshOrders();
    api.getMerchantStats().then(setServerStats).catch(() => undefined);
    api.getBusinessSettings().then((data) => setBusinessStatus(String(data.businessStatus || 'open'))).catch(() => undefined);
  }, []);

  const pendingOrders = orders.filter((order) => order.status === '待商家接单' || order.status === '商家已接单').slice(0, 6);
  const stats = useMemo(() => ({
    todayIncome: Number(serverStats?.todayIncome ?? orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)),
    todayOrders: Number(serverStats?.todayOrders ?? orders.length),
    pending: orders.filter((order) => order.status === '待商家接单').length,
    ready: orders.filter((order) => order.status === '商家已出餐').length,
  }), [orders, serverStats]);

  const action = (orderId: string, nextAction: 'accept' | 'reject' | 'ready') => {
    setLoadingId(orderId);
    setError('');
    api.merchantAction(orderId, nextAction)
      .then(refreshOrders)
      .catch((err) => setError(err instanceof Error ? err.message : '订单状态已变化，请刷新'))
      .finally(() => setLoadingId(''));
  };

  const toggleBusinessStatus = () => {
    const next = businessStatus === 'open' ? 'paused' : 'open';
    api.saveBusinessSettings({ businessStatus: next })
      .then((data) => setBusinessStatus(String(data.businessStatus || next)))
      .catch((err) => setError(err instanceof Error ? err.message : '营业状态保存失败'));
  };

  return (
    <div className="liquid-stage flex-1 overflow-y-auto p-md md:p-lg bg-surface relative">
      <div className="liquid-glass motion-border-glow flex justify-between items-center mb-xl p-md rounded-2xl motion-enter">
        <div className="flex items-center gap-md">
          <div className="w-16 h-16 rounded-xl bg-surface-variant flex-shrink-0 overflow-hidden border border-outline-variant/50">
             <img src="https://images.unsplash.com/photo-1555126634-323283e090f1?auto=format&fit=crop&w=150&h=150" alt="logo" className="w-full h-full object-cover"/>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">川香小厨 (天河总店)</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">ID: 80921102 · 普通外卖商家</p>
          </div>
        </div>
        <button onClick={toggleBusinessStatus} className="liquid-button motion-pulse-ring flex items-center gap-sm bg-primary/10 px-md py-sm rounded-full border border-primary/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">{businessStatus === 'open' ? '营业中' : '暂停接单'}</span>
            <div className={`ml-md w-[40px] h-[24px] rounded-full relative cursor-pointer shadow-inner ${businessStatus === 'open' ? 'bg-primary' : 'bg-outline-variant'}`}>
                <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full shadow-sm ${businessStatus === 'open' ? 'right-1' : 'left-1'}`}></div>
            </div>
        </button>
      </div>

      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md font-bold">今日营业数据</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl stagger-children">
        {[
          { title: "今日预计收入", value: `¥ ${stats.todayIncome.toFixed(2)}`, m: "实时订单汇总", c: "primary" as Tone, icon: "account_balance_wallet" },
          { title: "今日有效订单", value: String(stats.todayOrders), m: "来自真实订单", c: "secondary" as Tone, icon: "receipt_long" },
          { title: "待接订单", value: String(stats.pending), m: "需尽快处理", c: "tertiary" as Tone, icon: "storefront" },
          { title: "待骑手取餐", value: String(stats.ready), m: "已进入骑手大厅", c: "error" as Tone, icon: "warning" },
        ].map((item, idx) => (
          <div key={idx} className={`liquid-card motion-border-glow rounded-xl p-md flex flex-col relative overflow-hidden group ${item.c === 'error' ? 'border-error/30 bg-error-container/30' : ''}`}>
            <div className="flex justify-between items-start z-10 mb-sm">
                <p className="font-body-md text-body-md text-on-surface-variant">{item.title}</p>
                <div className={`${toneClasses[item.c].icon} p-1.5 rounded-lg`}>
                  <span className="material-symbols-outlined text-[20px] fill">{item.icon}</span>
                </div>
            </div>
            <h3 className={`font-headline-md text-headline-md font-bold ${item.c === 'error' ? 'text-error' : 'text-on-surface'}`}>{item.value}</h3>
            <p className={`font-label-md text-label-md mt-sm ${item.c === 'error' ? 'text-error' : 'text-on-surface-variant'}`}>{item.m}</p>
          </div>
        ))}
      </div>

      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md font-bold flex items-center justify-between">实时单况 <button onClick={onViewAllOrders} className="text-primary font-body-md text-body-md font-medium hover:underline flex items-center">查看全部 <span className="material-symbols-outlined text-[18px]">chevron_right</span></button></h3>
      <MerchantError message={error} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md stagger-children">
         {loadingOrders && [...Array(3)].map((_, index) => <OrderCardSkeleton key={index} />)}
         {!loadingOrders && pendingOrders.length === 0 && <p className="text-body-md text-on-surface-variant">暂无待处理订单</p>}
         {!loadingOrders && pendingOrders.map((order) => <MerchantOrderCard key={order.id} order={order} onAction={action} loadingId={loadingId} />)}
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
  const [loading, setLoading] = useState(true);
  const statuses = ['全部', '待商家接单', '商家已接单', '商家已出餐', '骑手已接单', '骑手已取餐', '已完成', '已取消'];
  const shownOrders = activeStatus === '全部' ? orders : orders.filter((order) => order.status === activeStatus);

  const refreshOrders = () => {
    setLoading(true);
    return api.getMerchantOrders().then(setOrders).catch((err) => setError(err instanceof Error ? err.message : '订单加载失败')).finally(() => setLoading(false));
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
    <div className="liquid-stage flex-1 flex flex-col h-screen overflow-hidden bg-surface relative">
      <header className="liquid-glass px-lg py-md border-b border-outline-variant/30 z-10 shrink-0 motion-enter">
         <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">订单管理</h2>
         <div className="flex gap-md overflow-x-auto no-scrollbar stagger-children">
             {statuses.map((status) => (
                 <button key={status} onClick={() => setActiveStatus(status)} className={`whitespace-nowrap font-body-md text-body-md font-medium pb-sm border-b-2 transition-colors ${activeStatus === status ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'}`}>{status}</button>
             ))}
         </div>
      </header>
      <div className="flex-1 overflow-y-auto p-md md:p-lg space-y-md bg-surface-container-low stagger-children">
          <MerchantError message={error} />
          {loading && [...Array(4)].map((_, index) => <OrderCardSkeleton key={index} />)}
          {!loading && shownOrders.length === 0 && <p className="text-body-md text-on-surface-variant">暂无订单</p>}
          {!loading && shownOrders.map((order) => <MerchantOrderCard key={order.id} order={order} onAction={action} loadingId={loadingId} />)}
      </div>
    </div>
  );

}

function MerchantMenuLive() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState(['全部', '招牌推荐', '热销单品', '饮品']);
  const [categoryRows, setCategoryRows] = useState<Array<{ id: number; merchantId: number; name: string; sort: number }>>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [form, setForm] = useState({ name: '', description: '', price: '18', sales: '99', categoryName: '招牌推荐', status: 'on_sale' });
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => api.getMerchantDishes().then(setDishes).catch((err) => setError(err instanceof Error ? err.message : '商品加载失败')).finally(() => setLoading(false));
  const refreshCategories = () => api.getMerchantCategories().then((rows) => {
    setCategoryRows(rows);
    setCategories(['全部', ...rows.map((row) => row.name)]);
    if (rows.length > 0 && !rows.some((row) => row.name === form.categoryName)) {
      setForm((prev) => ({ ...prev, categoryName: rows[0].name }));
    }
  }).catch((err) => setError(err instanceof Error ? err.message : '分类加载失败'));

  useEffect(() => {
    refresh();
    refreshCategories();
  }, []);

  const openForm = (dish?: Dish) => {
    setEditing(dish || null);
    setForm({
      name: dish?.name || '',
      description: dish?.description || dish?.desc || '',
      price: String(dish?.price ?? 18),
      sales: String(dish?.sales ?? 99),
      categoryName: dish?.categoryName || dish?.category || '招牌推荐',
      status: dish?.status || 'on_sale',
    });
    setFormOpen(true);
  };

  const save = () => {
    const payload = {
      ...(editing?.id ? { id: editing.id } : {}),
      ...(editing?.merchantId ? { merchantId: editing.merchantId } : {}),
      name: form.name,
      description: form.description,
      price: Number(form.price),
      sales: Number(form.sales),
      categoryName: form.categoryName,
      status: form.status,
    };
    api.saveMerchantDish(payload).then(() => {
      setMessage('保存成功');
      setFormOpen(false);
      refresh();
    }).catch((err) => setError(err instanceof Error ? err.message : '保存失败'));
  };

  const toggleStatus = (dish: Dish) => {
    api.updateMerchantDishStatus(dish.id, dish.status === 'on_sale' ? 'off_sale' : 'on_sale').then(refresh).catch((err) => setError(err instanceof Error ? err.message : '状态更新失败'));
  };

  const restock = (dish: Dish) => {
    setPromptConfig({
      title: '补充库存',
      label: `${dish.name} 新库存`,
      defaultValue: String(dish.sales ?? 99),
      inputMode: 'numeric',
      onSubmit: (value) => {
        const next = Number(value);
        if (Number.isFinite(next) && next >= 0) {
          api.updateMerchantDishStock(dish.id, next).then(refresh).catch((err) => setError(err instanceof Error ? err.message : '库存更新失败'));
          setPromptConfig(null);
        }
      },
    });
  };
  const shownDishes = activeCategory === '全部' ? dishes : dishes.filter((dish) => (dish.categoryName || dish.category) === activeCategory);

  const addCategory = () => {
    setPromptConfig({
      title: '新增分类',
      label: '分类名称',
      defaultValue: '',
      onSubmit: (name) => {
        api.saveMerchantCategory({ name, sort: categoryRows.length + 1 }).then(() => {
          setMessage('分类已保存');
          refreshCategories();
        }).catch((err) => setError(err instanceof Error ? err.message : '分类保存失败'));
        setPromptConfig(null);
      },
    });
  };

  const editCategory = () => {
    if (activeCategory === '全部') return;
    setPromptConfig({
      title: '编辑分类',
      label: '分类名称',
      defaultValue: activeCategory,
      onSubmit: (name) => {
        const row = categoryRows.find((item) => item.name === activeCategory);
        if (!row) return;
        api.updateMerchantCategory(row.id, { name, sort: row.sort }).then(() => {
          setActiveCategory(name);
          refreshCategories();
          refresh();
        }).catch((err) => setError(err instanceof Error ? err.message : '分类编辑失败'));
        setPromptConfig(null);
      },
    });
  };

  const deleteCategory = () => {
    if (activeCategory === '全部') return;
    const row = categoryRows.find((item) => item.name === activeCategory);
    if (!row) return;
    api.deleteMerchantCategory(row.id).then(() => {
      setActiveCategory('全部');
      refreshCategories();
    }).catch((err) => setError(err instanceof Error ? err.message : '分类删除失败'));
  };

  return (
    <div className="liquid-stage flex-1 flex flex-col h-screen overflow-hidden bg-surface relative">
      <header className="liquid-glass px-lg py-md border-b border-outline-variant/30 flex justify-between items-center z-10 shrink-0 motion-enter">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">商品管理</h2>
          <p className="font-label-md text-label-md text-on-surface-variant">真实联动菜品、价格、库存和上下架状态。</p>
        </div>
        <button onClick={() => openForm()} className="liquid-button bg-primary text-on-primary px-lg py-2 rounded-lg font-body-md font-bold flex items-center gap-xs shadow-sm"><span className="material-symbols-outlined text-[20px]">add</span>新建商品</button>
      </header>
      <div className="flex-1 overflow-y-auto p-md md:p-lg space-y-md">
        <MerchantError message={error} />
        {message && <div className="rounded-lg bg-primary/10 text-primary px-md py-sm">{message}</div>}
        <div className="flex flex-wrap gap-sm items-center stagger-children">
          {categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`liquid-button px-md py-xs rounded-full ${activeCategory === category ? 'bg-primary text-on-primary motion-pulse-ring' : 'liquid-card text-on-surface-variant'}`}>{category}</button>)}
          <button onClick={addCategory} className="liquid-button px-md py-xs rounded-full border border-primary text-primary">新增分类</button>
          <button onClick={editCategory} className="liquid-button px-md py-xs rounded-full border border-outline-variant">编辑分类</button>
          <button onClick={deleteCategory} className="liquid-button px-md py-xs rounded-full border border-error text-error">删除分类</button>
        </div>
        <div className="liquid-card motion-border-glow rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md"><th className="p-md">商品信息</th><th className="p-md">价格</th><th className="p-md">库存/状态</th><th className="p-md text-right">操作</th></tr></thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md stagger-children">
              {loading && [...Array(4)].map((_, index) => (
                <tr key={index}>
                  <td className="p-md" colSpan={4}><div className="h-5 rounded bg-outline-variant/30 animate-pulse" /></td>
                </tr>
              ))}
              {!loading && shownDishes.map((dish) => (
                <tr key={dish.id} className="hover:bg-surface-variant/20 transition-colors">
                  <td className="p-md"><p className="font-bold">{dish.name}</p><p className="text-on-surface-variant">{dish.categoryName || dish.category}</p></td>
                  <td className="p-md font-bold">¥{Number(dish.price).toFixed(2)}</td>
                  <td className="p-md">{dish.status === 'on_sale' ? '售卖中' : '已下架'} · {dish.sales ?? 0}</td>
                  <td className="p-md text-right whitespace-nowrap"><button onClick={() => openForm(dish)} className="text-primary mr-md">编辑</button><button onClick={() => toggleStatus(dish)} className="text-on-surface-variant mr-md">{dish.status === 'on_sale' ? '下架' : '上架'}</button><button onClick={() => restock(dish)} className="text-primary">补库存</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && shownDishes.length === 0 && <p className="p-lg text-center text-on-surface-variant">暂无商品</p>}
        </div>
      </div>
      {formOpen && (
        <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg">
          <div className="liquid-glass modal-surface rounded-2xl p-lg w-full max-w-xl space-y-md motion-enter">
            <h3 className="font-headline-sm text-headline-sm font-bold">{editing ? '编辑商品' : '新建商品'}</h3>
            {([
              ['name', '商品名称', undefined],
              ['description', '商品描述', undefined],
              ['price', '价格', 'decimal'],
              ['sales', '库存', 'numeric'],
              ['categoryName', '分类', undefined],
            ] as const).map(([key, label, inputMode]) => (
              <label key={key} className="block">
                <span className="text-label-md font-label-md text-on-surface-variant">{label}</span>
                <input value={form[key]} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant p-sm" placeholder={label} inputMode={inputMode} />
              </label>
            ))}
            <label className="block">
              <span className="text-label-md font-label-md text-on-surface-variant">售卖状态</span>
              <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant p-sm"><option value="on_sale">上架</option><option value="off_sale">下架</option></select>
            </label>
            <div className="flex justify-end gap-sm"><button onClick={() => setFormOpen(false)} className="liquid-button px-md py-sm rounded-lg border">取消</button><button onClick={save} className="liquid-button px-md py-sm rounded-lg bg-primary text-on-primary">保存</button></div>
          </div>
        </div>
      )}
      {promptConfig && <MerchantPromptModal config={promptConfig} onClose={() => setPromptConfig(null)} />}
    </div>
  );
}

function MerchantSettings() {
  const [settings, setSettings] = useState({ status: 'open', deliveryFee: '1.5', minOrder: '20', announcement: '欢迎光临橙意外卖' });
  const [message, setMessage] = useState('');
  const settingText = (value: unknown, fallback: string) => value === undefined || value === null || value === '' ? fallback : String(value);
  useEffect(() => {
    api.getBusinessSettings()
      .then((data) => setSettings((prev) => ({
        status: settingText(data.businessStatus ?? data.status, prev.status),
        deliveryFee: settingText(data.deliveryFee, prev.deliveryFee),
        minOrder: settingText(data.minOrder, prev.minOrder),
        announcement: settingText(data.announcement, prev.announcement),
      })))
      .catch((err) => setMessage(err instanceof Error ? err.message : '营业设置加载失败'));
  }, []);
  const save = () => {
    api.saveBusinessSettings({ ...settings, businessStatus: settings.status })
      .then((data) => {
        setSettings((prev) => ({ ...prev, status: String(data.businessStatus || prev.status) }));
        setMessage('营业设置已保存');
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : '保存失败'));
  };
  return (
    <div className="liquid-stage flex-1 overflow-y-auto p-md md:p-lg bg-surface space-y-md relative">
      <header className="motion-enter"><h2 className="font-headline-md text-headline-md font-bold">营业设置</h2><p className="text-on-surface-variant">读取当前营业状态后再保存配置。</p></header>
      {message && <div className="rounded-lg bg-primary/10 text-primary px-md py-sm">{message}</div>}
      <div className="liquid-card motion-border-glow rounded-xl p-lg space-y-md max-w-2xl">
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">营业状态</span>
          <select value={settings.status} onChange={(event) => setSettings((prev) => ({ ...prev, status: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant p-sm">
          <option value="open">营业中</option><option value="closed">休息中</option><option value="paused">暂停接单</option>
          </select>
        </label>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">配送费</span>
          <input value={settings.deliveryFee} onChange={(event) => setSettings((prev) => ({ ...prev, deliveryFee: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant p-sm" placeholder="配送费" inputMode="decimal" />
        </label>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">起送价</span>
          <input value={settings.minOrder} onChange={(event) => setSettings((prev) => ({ ...prev, minOrder: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant p-sm" placeholder="起送价" inputMode="decimal" />
        </label>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">店铺公告</span>
          <textarea value={settings.announcement} onChange={(event) => setSettings((prev) => ({ ...prev, announcement: event.target.value }))} className="mt-xs w-full rounded-lg border border-outline-variant p-sm min-h-28" placeholder="店铺公告" />
        </label>
        <button onClick={save} className="liquid-button bg-primary text-on-primary px-lg py-sm rounded-lg font-bold">保存配置</button>
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
    <div className="liquid-stage bg-surface text-on-surface h-screen flex overflow-hidden w-full relative">
      {/* Desktop Sidebar */}
      <nav className="liquid-glass hidden md:flex flex-col h-screen sticky top-0 p-md w-[240px] flex-shrink-0 border-r border-outline-variant/60 shadow-[8px_0_30px_rgba(15,23,42,0.04)]">
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
            { id: 'settings', icon: 'settings', label: '营业设置' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-md px-md py-sm rounded-lg font-body-md text-body-md transition-all ${
                activeTab === t.id ? 'bg-primary text-on-primary shadow-md motion-pulse-ring' : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === t.id ? 'fill' : ''}`}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-auto pt-md border-t border-outline-variant">
          <button onClick={logout} className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all rounded-lg font-body-md text-body-md">
            <span className="material-symbols-outlined">logout</span>
            退出登录
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden sticky top-0 w-full z-50 flex justify-between items-center px-md py-sm bg-surface shadow-sm pt-safe">
          <span className="text-headline-md font-headline-md font-bold text-primary">商家中心</span>
          <button onClick={logout} aria-label="退出登录" className="material-symbols-outlined text-primary">logout</button>
        </header>

        {activeTab === 'workbench' && <MerchantWorkbench onViewAllOrders={() => setActiveTab('orders')} />}
        {activeTab === 'orders' && <MerchantOrders />}
        {activeTab === 'menu' && <MerchantMenuLive />}
        {activeTab === 'settings' && <MerchantSettings />}
        {['reviews', 'finance', 'marketing'].includes(activeTab) && <MerchantModule type={activeTab} />}

        {/* Mobile Bottom Navigation */}
        <nav className="liquid-glass md:hidden absolute bottom-0 w-full border-t border-outline-variant/50 pb-safe pt-xs px-md flex justify-around items-center z-50 shadow-[0_-8px_24px_rgba(15,23,42,0.05)]">
          {[
            { id: 'workbench', icon: 'dashboard', label: '首页' },
            { id: 'orders', icon: 'receipt_long', label: '订单' },
            { id: 'menu', icon: 'restaurant_menu', label: '菜单' },
            { id: 'finance', icon: 'account_balance_wallet', label: '财务' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`liquid-button flex flex-col items-center gap-0.5 px-sm py-xs rounded-lg transition-all ${activeTab === t.id ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined ${activeTab === t.id ? 'fill' : ''}`}>{t.icon}</span>
              <span className="text-[10px] font-label-md font-medium">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
