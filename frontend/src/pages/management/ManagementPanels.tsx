import React from 'react';

type Column = {
  key: string;
  label: string;
};

function DataTable({ columns, rows }: { columns: Column[]; rows: Record<string, React.ReactNode>[] }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md">
            {columns.map((column) => <th key={column.key} className="p-md font-medium">{column.label}</th>)}
            <th className="p-md font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20 font-body-md">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-surface-variant/20 transition-colors">
              {columns.map((column) => <td key={column.key} className="p-md">{row[column.key]}</td>)}
              <td className="p-md text-right whitespace-nowrap">
                <button className="text-primary font-medium hover:underline mr-md">查看</button>
                <button className="text-on-surface-variant font-medium hover:underline">编辑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PageShell({ title, desc, action, children }: { title: string; desc: string; action?: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto p-md md:p-lg bg-surface">
      <header className="flex items-center justify-between mb-lg">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{title}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">{desc}</p>
        </div>
        {action && <button className="bg-primary text-on-primary px-lg py-2 rounded-lg font-body-md font-bold shadow-sm hover:opacity-90">{action}</button>}
      </header>
      {children}
    </div>
  );
}

export function MerchantModule({ type }: { type: string }) {
  if (type === 'reviews') {
    return (
      <PageShell title="评价管理" desc="查看用户评价并及时回复，提升店铺口碑。">
        <DataTable
          columns={[{ key: 'order', label: '订单' }, { key: 'rating', label: '评分' }, { key: 'content', label: '评价内容' }, { key: 'status', label: '状态' }]}
          rows={[
            { order: '#CY202605120001', rating: '5 星', content: '味道不错，配送很快。', status: <span className="text-tertiary">已回复</span> },
            { order: '#CY202605120002', rating: '4 星', content: '包装完整，汤面还很热。', status: <span className="text-secondary">待回复</span> },
          ]}
        />
      </PageShell>
    );
  }
  if (type === 'finance') {
    return (
      <PageShell title="财务结算" desc="统计营业收入、退款、平台服务费与可提现余额。" action="申请提现">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
          {[
            ['今日收入', '¥2,840.50'],
            ['可提现余额', '¥18,642.30'],
            ['平台服务费', '¥284.05'],
            ['退款订单', '2 单'],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
              <p className="text-body-md text-on-surface-variant">{label}</p>
              <p className="text-headline-md font-bold text-primary mt-sm">{value}</p>
            </div>
          ))}
        </div>
        <DataTable
          columns={[{ key: 'date', label: '日期' }, { key: 'income', label: '收入' }, { key: 'fee', label: '服务费' }, { key: 'settle', label: '结算状态' }]}
          rows={[
            { date: '2026-05-12', income: '¥2,840.50', fee: '¥284.05', settle: '待结算' },
            { date: '2026-05-11', income: '¥2,510.00', fee: '¥251.00', settle: '已结算' },
          ]}
        />
      </PageShell>
    );
  }
  return (
    <PageShell title="营销中心" desc="配置满减、优惠券和新客活动，提高下单转化。" action="新建活动">
      <DataTable
        columns={[{ key: 'name', label: '活动名称' }, { key: 'type', label: '类型' }, { key: 'time', label: '有效期' }, { key: 'status', label: '状态' }]}
        rows={[
          { name: '新客首单立减', type: '优惠券', time: '05-12 至 06-12', status: <span className="text-tertiary">进行中</span> },
          { name: '午餐满 30 减 5', type: '满减', time: '长期', status: <span className="text-tertiary">进行中</span> },
        ]}
      />
    </PageShell>
  );
}

export function AdminModule({ type }: { type: string }) {
  const configs: Record<string, { title: string; desc: string; action: string; columns: Column[]; rows: Record<string, React.ReactNode>[] }> = {
    users: {
      title: '用户管理',
      desc: '查看用户账户、余额、订单与状态。',
      action: '新增用户',
      columns: [{ key: 'name', label: '用户' }, { key: 'phone', label: '手机号' }, { key: 'orders', label: '订单数' }, { key: 'status', label: '状态' }],
      rows: [
        { name: '张同学', phone: '138****0001', orders: 18, status: '正常' },
        { name: '李同学', phone: '139****0002', orders: 9, status: '正常' },
      ],
    },
    orders: {
      title: '订单管理',
      desc: '监控订单状态、异常订单和售后处理。',
      action: '导出订单',
      columns: [{ key: 'id', label: '订单号' }, { key: 'merchant', label: '商家' }, { key: 'amount', label: '金额' }, { key: 'status', label: '状态' }],
      rows: [
        { id: 'CY202605120001', merchant: '老刘家招牌牛肉面', amount: '¥43.00', status: '骑手配送中' },
        { id: 'CY202605120002', merchant: '橙意轻食研究所', amount: '¥36.00', status: '已完成' },
      ],
    },
    marketing: {
      title: '营销活动配置',
      desc: '统一配置平台优惠券、满减和运营活动。',
      action: '新建活动',
      columns: [{ key: 'name', label: '活动' }, { key: 'type', label: '类型' }, { key: 'scope', label: '范围' }, { key: 'status', label: '状态' }],
      rows: [
        { name: '新人首单立减', type: '优惠券', scope: '全平台', status: '启用' },
        { name: '校园夜宵补贴', type: '满减', scope: '用户端', status: '启用' },
      ],
    },
    settings: {
      title: '系统配置',
      desc: '管理配送规则、权限、字典和平台参数。',
      action: '保存配置',
      columns: [{ key: 'key', label: '配置项' }, { key: 'value', label: '当前值' }, { key: 'module', label: '模块' }, { key: 'status', label: '状态' }],
      rows: [
        { key: '配送超时时间', value: '45 分钟', module: '订单', status: '生效中' },
        { key: '骑手接单半径', value: '5 公里', module: '骑手', status: '生效中' },
      ],
    },
  };
  const config = configs[type] ?? configs.users;
  return (
    <PageShell title={config.title} desc={config.desc} action={config.action}>
      <DataTable columns={config.columns} rows={config.rows} />
    </PageShell>
  );
}
