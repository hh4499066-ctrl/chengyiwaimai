import React, { useEffect, useMemo, useState } from 'react';
import { api, type AdminUser, type MarketingActivity, type MerchantStats, type Order, type Review, type WithdrawRecord } from '../../api/client';
import { readableCustomerAddress } from '../../utils/amap';

type Column<T> = {
  key: keyof T;
  label: string;
};

type SettingRow = { id: number; name: string; value: string; module: string };
type ActivityFormState = { id?: number; name: string; type: string; status: string; startTime: string; endTime: string };

function PageShell({ title, desc, action, onAction, children }: { title: string; desc: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <div className="liquid-stage flex-1 overflow-y-auto p-md md:p-lg bg-surface relative">
      <header className="flex items-center justify-between mb-lg gap-md motion-enter">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{title}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">{desc}</p>
        </div>
        {action && <button onClick={onAction} className="liquid-button bg-primary text-on-primary px-lg py-2 rounded-lg font-body-md font-bold shadow-sm hover:opacity-90 whitespace-nowrap">{action}</button>}
      </header>
      {children}
    </div>
  );
}

function SimpleModal({ title, body, onClose }: { title: string; body: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg">
      <div className="liquid-glass modal-surface rounded-2xl p-lg w-full max-w-2xl max-h-[86dvh] space-y-md motion-enter overflow-hidden">
        <h3 className="font-headline-sm text-headline-sm font-bold">{title}</h3>
        <div className="text-body-md text-on-surface-variant min-w-0 max-h-[64dvh] overflow-auto">{body}</div>
        <button onClick={onClose} className="liquid-button w-full bg-primary text-on-primary rounded-lg py-sm font-bold">关闭</button>
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const rows: Array<[string, React.ReactNode]> = [
    ['订单号', order.id],
    ['商家', order.merchantName],
    ['金额', `¥${Number(order.totalAmount || 0).toFixed(2)}`],
    ['状态', order.status],
    ['收货地址', readableCustomerAddress(order.address)],
    ['备注', order.remark?.trim() || '无备注'],
    ['支付方式', order.payMethod || '未记录'],
    ['支付状态', order.payStatus || '未记录'],
    ['退款状态', order.refundStatus || '未记录'],
    ['创建时间', order.createTime || '未记录'],
  ];
  return (
    <div className="grid gap-sm text-left">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[88px_1fr] gap-sm rounded-lg bg-surface-container-high/60 px-md py-sm">
          <span className="text-on-surface-variant">{label}</span>
          <span className="font-medium text-on-surface break-words">{value}</span>
        </div>
      ))}
    </div>
  );
}

function TextEntryModal({ title, label, defaultValue = '', multiline, onClose, onSubmit }: { title: string; label: string; defaultValue?: string; multiline?: boolean; onClose: () => void; onSubmit: (value: string) => void }) {
  const [value, setValue] = useState(defaultValue);
  const fieldClass = "mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary";
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg">
      <div className="liquid-glass modal-surface rounded-2xl p-lg w-full max-w-lg space-y-md motion-enter">
        <h3 className="font-headline-sm text-headline-sm font-bold">{title}</h3>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">{label}</span>
          {multiline ? (
            <textarea value={value} onChange={(event) => setValue(event.target.value)} className={`${fieldClass} min-h-28`} autoFocus />
          ) : (
            <input value={value} onChange={(event) => setValue(event.target.value)} className={fieldClass} autoFocus />
          )}
        </label>
        <div className="flex justify-end gap-sm">
          <button onClick={onClose} className="liquid-button px-md py-sm rounded-lg border border-outline-variant">取消</button>
          <button disabled={!value.trim()} onClick={() => onSubmit(value.trim())} className="liquid-button px-md py-sm rounded-lg bg-primary text-on-primary disabled:opacity-50">确认</button>
        </div>
      </div>
    </div>
  );
}

function FinanceWithdrawModal({ defaultAmount, onClose, onSubmit }: { defaultAmount: string; onClose: () => void; onSubmit: (amount: number, accountNo: string) => void }) {
  const [amount, setAmount] = useState(defaultAmount);
  const [accountNo, setAccountNo] = useState('对公账户 6222****8888');
  const parsedAmount = Number(amount);
  const canSubmit = Number.isFinite(parsedAmount) && parsedAmount > 0 && accountNo.trim().length > 0;
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg">
      <div className="liquid-glass modal-surface rounded-2xl p-lg w-full max-w-lg space-y-md motion-enter">
        <h3 className="font-headline-sm text-headline-sm font-bold">申请提现</h3>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">提现金额</span>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" inputMode="decimal" />
        </label>
        <label className="block">
          <span className="text-label-md font-label-md text-on-surface-variant">提现账户</span>
          <input value={accountNo} onChange={(event) => setAccountNo(event.target.value)} className="mt-xs w-full rounded-lg border border-outline-variant bg-white/80 p-sm outline-none focus:border-primary" autoComplete="off" />
        </label>
        <div className="flex justify-end gap-sm">
          <button onClick={onClose} className="liquid-button px-md py-sm rounded-lg border border-outline-variant">取消</button>
          <button disabled={!canSubmit} onClick={() => onSubmit(parsedAmount, accountNo.trim())} className="liquid-button px-md py-sm rounded-lg bg-primary text-on-primary disabled:opacity-50">提交</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, body, onCancel, onConfirm }: { title: string; body: React.ReactNode; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg">
      <div className="liquid-glass modal-surface rounded-2xl p-lg w-full max-w-lg space-y-md motion-enter">
        <h3 className="font-headline-sm text-headline-sm font-bold">{title}</h3>
        <div className="text-body-md text-on-surface-variant">{body}</div>
        <div className="flex justify-end gap-sm">
          <button onClick={onCancel} className="liquid-button px-md py-sm rounded-lg border border-outline-variant">取消</button>
          <button onClick={onConfirm} className="liquid-button px-md py-sm rounded-lg bg-error text-on-error">确认删除</button>
        </div>
      </div>
    </div>
  );
}

function toDateTimeInput(value?: string) {
  if (!value) {
    return '';
  }
  return String(value).replace(' ', 'T').slice(0, 16);
}

function activityToForm(activity?: MarketingActivity): ActivityFormState {
  return {
    id: activity?.id,
    name: activity?.name || '',
    type: activity?.type || 'coupon',
    status: activity?.status || 'enabled',
    startTime: toDateTimeInput(activity?.startTime),
    endTime: toDateTimeInput(activity?.endTime),
  };
}

function activityPayload(form: ActivityFormState) {
  return {
    name: form.name.trim(),
    type: form.type,
    status: form.status,
    startTime: form.startTime,
    endTime: form.endTime,
  };
}

function isDisabledStatus(status: string) {
  return status === '禁用' || status === 'disabled' || status === '0' || status === 'rejected';
}

function money(value: unknown) {
  return `¥${Number(value ?? 0).toFixed(2)}`;
}

function ActivityFormModal({
  title,
  form,
  saving,
  onChange,
  onSave,
  onClose,
}: {
  title: string;
  form: ActivityFormState;
  saving: boolean;
  onChange: React.Dispatch<React.SetStateAction<ActivityFormState | null>>;
  onSave: () => void;
  onClose: () => void;
}) {
  const update = (key: keyof ActivityFormState, value: string) => onChange((prev) => prev ? { ...prev, [key]: value } : prev);
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-lg">
      <div className="liquid-glass modal-surface rounded-2xl p-lg w-full max-w-xl space-y-md motion-enter">
        <h3 className="font-headline-sm text-headline-sm font-bold">{title}</h3>
        <input value={form.name} onChange={(event) => update('name', event.target.value)} className="w-full rounded-lg border border-outline-variant p-sm" placeholder="活动名称" />
        <select value={form.type} onChange={(event) => update('type', event.target.value)} className="w-full rounded-lg border border-outline-variant p-sm">
          <option value="coupon">优惠券</option>
          <option value="discount">满减</option>
          <option value="delivery_fee">免配送费</option>
        </select>
        <select value={form.status} onChange={(event) => update('status', event.target.value)} className="w-full rounded-lg border border-outline-variant p-sm">
          <option value="enabled">启用</option>
          <option value="disabled">停用</option>
        </select>
        <input type="datetime-local" value={form.startTime} onChange={(event) => update('startTime', event.target.value)} className="w-full rounded-lg border border-outline-variant p-sm" />
        <input type="datetime-local" value={form.endTime} onChange={(event) => update('endTime', event.target.value)} className="w-full rounded-lg border border-outline-variant p-sm" />
        <div className="flex justify-end gap-sm">
          <button onClick={onClose} className="liquid-button px-md py-sm rounded-lg border border-outline-variant">取消</button>
          <button disabled={saving || !form.name.trim()} onClick={onSave} className="liquid-button px-md py-sm rounded-lg bg-primary text-on-primary disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
        </div>
      </div>
    </div>
  );
}

function DataTable<T extends { id?: number | string }>({
  columns,
  rows,
  onView,
  onEdit,
  renderActions,
}: {
  columns: Column<T>[];
  rows: T[];
  onView: (row: T) => void;
  onEdit?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
}) {
  return (
    <div className="liquid-card motion-border-glow rounded-xl overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md">
            {columns.map((column) => <th key={String(column.key)} className="p-md font-medium">{column.label}</th>)}
            <th className="p-md font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20 font-body-md stagger-children">
          {rows.map((row, index) => (
          <tr key={String(row.id ?? index)} className="hover:bg-surface-variant/20 transition-colors motion-enter">
              {columns.map((column) => <td key={String(column.key)} className="p-md">{String(row[column.key] ?? '')}</td>)}
              <td className="p-md text-right whitespace-nowrap">
                {renderActions ? renderActions(row) : (
                  <>
                    <button onClick={() => onView(row)} className="text-primary font-medium hover:underline mr-md">查看</button>
                    {onEdit && <button onClick={() => onEdit(row)} className="text-on-surface-variant font-medium hover:underline">编辑</button>}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="p-lg text-center text-on-surface-variant">暂无数据</p>}
    </div>
  );
}

export function MerchantModule({ type }: { type: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [withdrawRecords, setWithdrawRecords] = useState<WithdrawRecord[]>([]);
  const [marketing, setMarketing] = useState<MarketingActivity[]>([]);
  const [activityForm, setActivityForm] = useState<ActivityFormState | null>(null);
  const [savingActivity, setSavingActivity] = useState(false);
  const [modal, setModal] = useState<{ title: string; body: React.ReactNode } | null>(null);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const refreshMarketing = () => api.getMerchantMarketing().then(setMarketing).catch(() => setMarketing([]));
  const refreshWithdrawRecords = () => api.getMerchantWithdrawRecords().then(setWithdrawRecords).catch(() => setWithdrawRecords([]));

  useEffect(() => {
    if (type === 'reviews') {
      api.getMerchantReviews().then(setReviews).catch(() => setReviews([]));
    }
    if (type === 'finance') {
      api.getMerchantStats().then(setStats).catch(() => setStats(null));
      refreshWithdrawRecords();
    }
    if (type === 'marketing') {
      refreshMarketing();
    }
  }, [type]);

  const saveMerchantActivity = () => {
    if (!activityForm) {
      return;
    }
    setSavingActivity(true);
    const request = activityForm.id
      ? api.updateMerchantMarketing(activityForm.id, activityPayload(activityForm))
      : api.saveMerchantMarketing(activityPayload(activityForm));
    request
      .then(() => refreshMarketing())
      .then(() => {
        setActivityForm(null);
        setModal({ title: '活动已保存', body: '营销活动已保存并刷新列表。' });
      })
      .catch((err) => setModal({ title: '保存失败', body: err instanceof Error ? err.message : '营销活动保存失败' }))
      .finally(() => setSavingActivity(false));
  };

  if (type === 'reviews') {
    const reply = (review: Review) => setReplyTarget(review);
    const submitReply = (content: string) => {
      if (!replyTarget) {
        return;
      }
      api.replyMerchantReview(replyTarget.id, content)
        .then(() => api.getMerchantReviews().then(setReviews))
        .then(() => setReplyTarget(null))
        .catch((err) => setModal({ title: '回复失败', body: err instanceof Error ? err.message : '评价回复失败' }));
    };
    return (
      <PageShell title="评价管理" desc="查看用户评价并及时回复。">
        <DataTable<Review>
          columns={[{ key: 'orderId', label: '订单' }, { key: 'rating', label: '评分' }, { key: 'content', label: '评价内容' }, { key: 'reply', label: '商家回复' }]}
          rows={reviews}
          onView={(row) => setModal({ title: '评价详情', body: <pre className="whitespace-pre-wrap">{JSON.stringify(row, null, 2)}</pre> })}
          onEdit={reply}
        />
        {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
        {replyTarget && <TextEntryModal title="回复评价" label="回复内容" defaultValue={replyTarget.reply || '感谢支持，欢迎再次光临'} multiline onClose={() => setReplyTarget(null)} onSubmit={submitReply} />}
      </PageShell>
    );
  }

  if (type === 'finance') {
    const todayIncome = Number(stats?.todayIncome ?? 0);
    const grossIncome = Number(stats?.grossIncome ?? stats?.totalIncome ?? todayIncome);
    const availableBalance = Number(stats?.availableBalance ?? 0);
    const serviceFee = Number(stats?.platformServiceFee ?? 0);
    const pendingWithdrawAmount = Number(stats?.pendingWithdrawAmount ?? 0);
    const withdrawnAmount = Number(stats?.withdrawnAmount ?? 0);
    const financeCards = [
      { label: '今日收入', value: money(todayIncome) },
      { label: '今日订单', value: `${Number(stats?.todayOrders ?? 0)} 单` },
      { label: '可提现余额', value: money(availableBalance) },
      { label: '累计有效收入', value: money(grossIncome) },
      { label: '平台服务费', value: money(serviceFee) },
      { label: '待处理提现', value: money(pendingWithdrawAmount) },
      { label: '已提现金额', value: money(withdrawnAmount) },
    ];
    const submitWithdraw = (amount: number, accountNo: string) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        setModal({ title: '提现失败', body: '提现金额必须大于 0。' });
        return;
      }
      api.merchantWithdraw(amount, accountNo)
        .then(() => refreshWithdrawRecords())
        .then(() => {
          setWithdrawOpen(false);
          setModal({ title: '提现申请已提交', body: '提现申请已写入数据库并刷新记录。' });
        })
        .catch((err) => setModal({ title: '提现失败', body: err instanceof Error ? err.message : '提现申请提交失败' }));
    };
    return (
      <PageShell title="财务结算" desc="统计真实营业收入、订单和退款数据。" action="申请提现" onAction={() => setWithdrawOpen(true)}>
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-md stagger-children">
          {financeCards.map((item) => (
            <div key={item.label} className="liquid-card motion-border-glow rounded-xl p-md">
              <p className="text-body-md text-on-surface-variant">{item.label}</p>
              <p className="text-headline-md font-bold text-primary mt-sm">{item.value}</p>
            </div>
          ))}
        </div>
        <section className="liquid-card motion-border-glow mt-lg rounded-xl overflow-hidden">
          <div className="p-md border-b border-outline-variant/20 flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm font-bold">提现记录</h3>
            <button onClick={refreshWithdrawRecords} className="text-primary text-body-md">刷新</button>
          </div>
          {withdrawRecords.length === 0 ? (
            <p className="p-lg text-center text-on-surface-variant">暂无提现记录</p>
          ) : (
            <table className="w-full text-left">
              <thead><tr className="bg-surface-container-low text-on-surface-variant"><th className="p-md">金额</th><th className="p-md">账户</th><th className="p-md">状态</th><th className="p-md">时间</th></tr></thead>
              <tbody className="divide-y divide-outline-variant/20 stagger-children">
                {withdrawRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="p-md font-bold text-primary">{money(record.amount)}</td>
                    <td className="p-md">{record.accountNoMasked || record.accountNo}</td>
                    <td className="p-md">{record.status}</td>
                    <td className="p-md">{record.createTime || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
        {withdrawOpen && <FinanceWithdrawModal defaultAmount={availableBalance.toFixed(2)} onClose={() => setWithdrawOpen(false)} onSubmit={submitWithdraw} />}
      </PageShell>
    );
  }

  return (
    <PageShell title="营销中心" desc="配置并保存本商家的满减、优惠券和新客活动。" action="新建活动" onAction={() => setActivityForm(activityToForm())}>
      <DataTable<MarketingActivity>
        columns={[{ key: 'name', label: '活动名称' }, { key: 'type', label: '类型' }, { key: 'status', label: '状态' }]}
        rows={marketing}
        onView={(row) => setModal({ title: '活动详情', body: <pre className="whitespace-pre-wrap">{JSON.stringify(row, null, 2)}</pre> })}
        onEdit={(row) => setActivityForm(activityToForm(row))}
      />
      {activityForm && <ActivityFormModal title={activityForm.id ? '编辑活动' : '新建活动'} form={activityForm} saving={savingActivity} onChange={setActivityForm} onSave={saveMerchantActivity} onClose={() => setActivityForm(null)} />}
      {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
    </PageShell>
  );
}

export function AdminModule({ type }: { type: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [marketing, setMarketing] = useState<MarketingActivity[]>([]);
  const [statusFilter, setStatusFilter] = useState('全部');
  const [activityForm, setActivityForm] = useState<ActivityFormState | null>(null);
  const [savingActivity, setSavingActivity] = useState(false);
  const [modal, setModal] = useState<{ title: string; body: React.ReactNode } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarketingActivity | null>(null);
  const shownOrders = useMemo(() => statusFilter === '全部' ? orders : orders.filter((order) => order.status === statusFilter), [orders, statusFilter]);
  const statuses = useMemo(() => ['全部', ...Array.from(new Set(orders.map((order) => order.status)))], [orders]);

  const refreshUsers = () => api.getAdminUsers().then(setUsers).catch(() => setUsers([]));
  const refreshMarketing = () => api.getAdminMarketing().then(setMarketing).catch(() => setMarketing([]));

  useEffect(() => {
    if (type === 'users') {
      refreshUsers();
    }
    if (type === 'orders') {
      api.getAdminOrders().then(setOrders).catch(() => setOrders([]));
    }
    if (type === 'marketing') {
      refreshMarketing();
    }
  }, [type]);

  const exportOrders = () => {
    const rows = [['id', 'merchantName', 'amount', 'status'], ...orders.map((order) => [order.id, order.merchantName, String(order.totalAmount), order.status])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chengyi-orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleUserStatus = (user: AdminUser) => {
    const nextStatus = isDisabledStatus(user.status) ? 'enabled' : 'disabled';
    api.updateAdminUserStatus(user.id, nextStatus)
      .then(() => refreshUsers())
      .then(() => setModal({ title: '状态已更新', body: `${user.name || user.phone} 已${nextStatus === 'enabled' ? '启用' : '禁用'}。` }))
      .catch((err) => setModal({ title: '状态更新失败', body: err instanceof Error ? err.message : '用户状态更新失败' }));
  };

  const saveAdminActivity = () => {
    if (!activityForm) {
      return;
    }
    setSavingActivity(true);
    const request = activityForm.id
      ? api.adminUpdate('marketing', activityForm.id, activityPayload(activityForm))
      : api.adminCreate('marketing', activityPayload(activityForm));
    request
      .then(() => refreshMarketing())
      .then(() => {
        setActivityForm(null);
        setModal({ title: '活动已保存', body: '活动已保存并刷新列表。' });
      })
      .catch((err) => setModal({ title: '保存失败', body: err instanceof Error ? err.message : '营销活动保存失败' }))
      .finally(() => setSavingActivity(false));
  };

  const deleteAdminActivity = (activity: MarketingActivity) => {
    setDeleteTarget(activity);
  };

  const confirmDeleteAdminActivity = () => {
    if (!deleteTarget) return;
    api.adminDelete('marketing', deleteTarget.id)
      .then(() => refreshMarketing())
      .then(() => {
        setDeleteTarget(null);
        setModal({ title: '活动已删除', body: '活动已删除并刷新列表。' });
      })
      .catch((err) => setModal({ title: '删除失败', body: err instanceof Error ? err.message : '营销活动删除失败' }));
  };

  if (type === 'users') {
    return (
      <PageShell title="用户管理" desc="查看真实用户账号、角色和状态。" action="新增用户" onAction={() => setModal({ title: '新增用户', body: '演示版暂不支持新增用户。' })}>
        <DataTable<AdminUser>
          columns={[{ key: 'name', label: '用户' }, { key: 'phone', label: '手机号' }, { key: 'role', label: '角色' }, { key: 'status', label: '状态' }]}
          rows={users}
          onView={(row) => setModal({ title: '用户详情', body: <pre>{JSON.stringify(row, null, 2)}</pre> })}
          renderActions={(row) => (
            <>
              <button onClick={() => setModal({ title: '用户详情', body: <pre>{JSON.stringify(row, null, 2)}</pre> })} className="text-primary font-medium hover:underline mr-md">查看</button>
              <button onClick={() => toggleUserStatus(row)} className={isDisabledStatus(row.status) ? 'text-tertiary font-medium hover:underline' : 'text-error font-medium hover:underline'}>{isDisabledStatus(row.status) ? '启用' : '禁用'}</button>
            </>
          )}
        />
        {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
      </PageShell>
    );
  }

  if (type === 'orders') {
    return (
      <PageShell title="订单管理" desc="展示真实订单并支持状态筛选。" action="导出订单" onAction={exportOrders}>
        <div className="flex gap-sm mb-md overflow-x-auto stagger-children">{statuses.map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`liquid-button px-md py-xs rounded-full ${statusFilter === status ? 'bg-primary text-on-primary motion-pulse-ring' : 'bg-surface-container-high text-on-surface-variant'}`}>{status}</button>)}</div>
        <DataTable<Order> columns={[{ key: 'id', label: '订单号' }, { key: 'merchantName', label: '商家' }, { key: 'totalAmount', label: '金额' }, { key: 'status', label: '状态' }]} rows={shownOrders} onView={(row) => setModal({ title: '订单详情', body: <OrderDetail order={row} /> })} onEdit={(row) => setModal({ title: '异常处理', body: `${row.id} 已进入演示处理弹窗。` })} />
        {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
      </PageShell>
    );
  }

  if (type === 'marketing') {
    return (
      <PageShell title="营销活动配置" desc="读取并维护后台平台营销活动列表。" action="新建活动" onAction={() => setActivityForm(activityToForm())}>
        <DataTable<MarketingActivity>
          columns={[{ key: 'name', label: '活动' }, { key: 'type', label: '类型' }, { key: 'status', label: '状态' }]}
          rows={marketing}
          onView={(row) => setModal({ title: '活动详情', body: <pre>{JSON.stringify(row, null, 2)}</pre> })}
          renderActions={(row) => (
            <>
              <button onClick={() => setModal({ title: '活动详情', body: <pre>{JSON.stringify(row, null, 2)}</pre> })} className="text-primary font-medium hover:underline mr-md">查看</button>
              <button onClick={() => setActivityForm(activityToForm(row))} className="text-on-surface-variant font-medium hover:underline mr-md">编辑</button>
              <button onClick={() => deleteAdminActivity(row)} className="text-error font-medium hover:underline">删除</button>
            </>
          )}
        />
        {activityForm && <ActivityFormModal title={activityForm.id ? '编辑活动' : '新建活动'} form={activityForm} saving={savingActivity} onChange={setActivityForm} onSave={saveAdminActivity} onClose={() => setActivityForm(null)} />}
        {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
        {deleteTarget && <ConfirmModal title="删除活动" body={`确认删除活动：${deleteTarget.name}？此操作会同步到后台营销配置。`} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDeleteAdminActivity} />}
      </PageShell>
    );
  }

  return (
    <PageShell title="系统配置" desc="配送超时、接单半径等演示配置。" action="保存配置" onAction={() => setModal({ title: '配置保存', body: '演示配置已保存。' })}>
      <DataTable<SettingRow> columns={[{ key: 'name', label: '配置项' }, { key: 'value', label: '当前值' }, { key: 'module', label: '模块' }]} rows={[{ id: 1, name: '配送超时时间', value: '45 分钟', module: '订单' }, { id: 2, name: '骑手接单半径', value: '5 公里', module: '骑手' }]} onView={(row) => setModal({ title: '配置详情', body: <pre>{JSON.stringify(row, null, 2)}</pre> })} onEdit={(row) => setModal({ title: '编辑配置', body: `${row.name} 已进入本地编辑。` })} />
      {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
    </PageShell>
  );
}
