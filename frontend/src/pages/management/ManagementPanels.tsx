import React, { useEffect, useMemo, useState } from 'react';
import { api, type AdminUser, type MarketingActivity, type Order, type Review } from '../../api/client';

type Column<T> = {
  key: keyof T;
  label: string;
};

type LocalActivity = { id: number; name: string; type: string; status: string };
type SettingRow = { id: number; name: string; value: string; module: string };

function PageShell({ title, desc, action, onAction, children }: { title: string; desc: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto p-md md:p-lg bg-surface">
      <header className="flex items-center justify-between mb-lg">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{title}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">{desc}</p>
        </div>
        {action && <button onClick={onAction} className="bg-primary text-on-primary px-lg py-2 rounded-lg font-body-md font-bold shadow-sm hover:opacity-90">{action}</button>}
      </header>
      {children}
    </div>
  );
}

function SimpleModal({ title, body, onClose }: { title: string; body: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-lg">
      <div className="bg-surface rounded-2xl p-lg w-full max-w-lg space-y-md">
        <h3 className="font-headline-sm text-headline-sm font-bold">{title}</h3>
        <div className="text-body-md text-on-surface-variant">{body}</div>
        <button onClick={onClose} className="w-full bg-primary text-on-primary rounded-lg py-sm font-bold">关闭</button>
      </div>
    </div>
  );
}

function DataTable<T extends { id?: number | string }>({ columns, rows, onView, onEdit }: { columns: Column<T>[]; rows: T[]; onView: (row: T) => void; onEdit: (row: T) => void }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md">
            {columns.map((column) => <th key={String(column.key)} className="p-md font-medium">{column.label}</th>)}
            <th className="p-md font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20 font-body-md">
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="hover:bg-surface-variant/20 transition-colors">
              {columns.map((column) => <td key={String(column.key)} className="p-md">{String(row[column.key] ?? '')}</td>)}
              <td className="p-md text-right whitespace-nowrap">
                <button onClick={() => onView(row)} className="text-primary font-medium hover:underline mr-md">查看</button>
                <button onClick={() => onEdit(row)} className="text-on-surface-variant font-medium hover:underline">编辑</button>
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
  const [modal, setModal] = useState<{ title: string; body: React.ReactNode } | null>(null);

  useEffect(() => {
    if (type === 'reviews') {
      api.getMerchantReviews().then(setReviews).catch(() => setReviews([]));
    }
  }, [type]);

  if (type === 'reviews') {
    const reply = (review: Review) => {
      const content = window.prompt('回复内容', review.reply || '感谢支持，欢迎再次光临');
      if (content) {
        api.replyMerchantReview(review.id, content).then(() => api.getMerchantReviews().then(setReviews));
      }
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
      </PageShell>
    );
  }

  if (type === 'finance') {
    return (
      <PageShell title="财务结算" desc="统计营业收入和提现申请。" action="申请提现" onAction={() => setModal({ title: '提现申请', body: '提现申请已提交，演示模式不产生真实资金流。' })}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          {['今日收入', '可提现余额', '平台服务费', '退款订单'].map((label, index) => (
            <div key={label} className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm"><p className="text-body-md text-on-surface-variant">{label}</p><p className="text-headline-md font-bold text-primary mt-sm">{index === 3 ? '0 单' : `¥${(2840 - index * 320).toFixed(2)}`}</p></div>
          ))}
        </div>
        {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
      </PageShell>
    );
  }

  return (
    <PageShell title="营销中心" desc="配置满减、优惠券和新客活动。" action="新建活动" onAction={() => setModal({ title: '新建活动', body: '演示活动已创建，可在后台营销管理中查看。' })}>
      <DataTable<LocalActivity>
        columns={[{ key: 'name', label: '活动名称' }, { key: 'type', label: '类型' }, { key: 'status', label: '状态' }]}
        rows={[{ id: 1, name: '新客首单立减', type: '优惠券', status: '进行中' }, { id: 2, name: '午餐满30减5', type: '满减', status: '进行中' }]}
        onView={(row) => setModal({ title: '活动详情', body: <pre className="whitespace-pre-wrap">{JSON.stringify(row, null, 2)}</pre> })}
        onEdit={(row) => setModal({ title: '编辑活动', body: `${row.name} 已进入演示编辑模式。` })}
      />
      {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
    </PageShell>
  );
}

export function AdminModule({ type }: { type: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [marketing, setMarketing] = useState<MarketingActivity[]>([]);
  const [statusFilter, setStatusFilter] = useState('全部');
  const [modal, setModal] = useState<{ title: string; body: React.ReactNode } | null>(null);
  const shownOrders = useMemo(() => statusFilter === '全部' ? orders : orders.filter((order) => order.status === statusFilter), [orders, statusFilter]);
  const statuses = useMemo(() => ['全部', ...Array.from(new Set(orders.map((order) => order.status)))], [orders]);

  useEffect(() => {
    if (type === 'users') {
      api.getAdminUsers().then(setUsers).catch(() => setUsers([]));
    }
    if (type === 'orders') {
      api.getAdminOrders().then(setOrders).catch(() => setOrders([]));
    }
    if (type === 'marketing') {
      api.getAdminMarketing().then(setMarketing).catch(() => setMarketing([]));
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

  if (type === 'users') {
    return (
      <PageShell title="用户管理" desc="查看真实用户账号、角色和状态。" action="新增用户" onAction={() => setModal({ title: '新增用户', body: '演示版暂不支持新增用户。' })}>
        <DataTable<AdminUser> columns={[{ key: 'name', label: '用户' }, { key: 'phone', label: '手机号' }, { key: 'role', label: '角色' }, { key: 'status', label: '状态' }]} rows={users} onView={(row) => setModal({ title: '用户详情', body: <pre>{JSON.stringify(row, null, 2)}</pre> })} onEdit={(row) => setModal({ title: '编辑用户', body: `${row.name} 的编辑能力为演示模式。` })} />
        {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
      </PageShell>
    );
  }

  if (type === 'orders') {
    return (
      <PageShell title="订单管理" desc="展示真实订单并支持状态筛选。" action="导出订单" onAction={exportOrders}>
        <div className="flex gap-sm mb-md overflow-x-auto">{statuses.map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`px-md py-xs rounded-full ${statusFilter === status ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>{status}</button>)}</div>
        <DataTable<Order> columns={[{ key: 'id', label: '订单号' }, { key: 'merchantName', label: '商家' }, { key: 'totalAmount', label: '金额' }, { key: 'status', label: '状态' }]} rows={shownOrders} onView={(row) => setModal({ title: '订单详情', body: <pre>{JSON.stringify(row, null, 2)}</pre> })} onEdit={(row) => setModal({ title: '异常处理', body: `${row.id} 已进入演示处理弹窗。` })} />
        {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
      </PageShell>
    );
  }

  if (type === 'marketing') {
    return (
      <PageShell title="营销活动配置" desc="读取后台营销活动列表。" action="新建活动" onAction={() => api.adminCreate('marketing', { name: '演示活动', type: 'coupon', status: 'enabled' }).then(() => setModal({ title: '新建活动', body: '演示活动已创建。' }))}>
        <DataTable<MarketingActivity> columns={[{ key: 'name', label: '活动' }, { key: 'type', label: '类型' }, { key: 'status', label: '状态' }]} rows={marketing} onView={(row) => setModal({ title: '活动详情', body: <pre>{JSON.stringify(row, null, 2)}</pre> })} onEdit={(row) => setModal({ title: '编辑活动', body: `${row.name} 已进入演示编辑模式。` })} />
        {modal && <SimpleModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
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
