import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

type Role = 'customer' | 'rider' | 'merchant' | 'admin';

const roleText: Record<Role, string> = {
  customer: '用户',
  rider: '骑手',
  merchant: '商家',
  admin: '管理员',
};

const defaultPhoneByRole: Record<Role, string> = {
  customer: '13800000001',
  rider: '13800000002',
  merchant: '13800000003',
  admin: '13800000004',
};

function Portal({ open }: { open: (mode: 'mobile' | 'pc') => void }) {
  return (
    <div className="liquid-stage bg-surface-container-low min-h-screen flex items-center justify-center relative overflow-hidden font-body-md">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface/95 to-primary-fixed/90" />
      </div>
      <main className="relative z-10 w-full max-w-5xl px-md md:px-lg py-xl flex flex-col items-center">
        <header className="text-center mb-xl flex flex-col items-center motion-enter">
          <div className="w-16 h-16 bg-primary text-on-primary rounded-lg flex items-center justify-center mb-sm shadow-[0_16px_32px_rgba(37,99,235,0.18)] motion-float">
            <span className="material-symbols-outlined text-[32px] fill">restaurant</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-normal mb-unit">橙意外卖</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">校园点餐、配送履约与商家运营一体化演示系统</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg w-full max-w-3xl stagger-children">
          <button onClick={() => open('mobile')} className="liquid-glass liquid-button text-left group rounded-lg p-lg flex flex-col">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-md group-hover:bg-primary group-hover:text-on-primary transition-colors duration-200">
              <span className="material-symbols-outlined fill">electric_moped</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">用户 / 骑手入口</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-xl">点餐下单、订单追踪、骑手抢单与收入查看</p>
            <span className="material-symbols-outlined ml-auto text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          <button onClick={() => open('pc')} className="liquid-glass liquid-button text-left group rounded-lg p-lg flex flex-col">
            <div className="w-12 h-12 bg-primary-container/15 rounded-lg flex items-center justify-center text-primary-container mb-md group-hover:bg-primary-container group-hover:text-on-primary transition-colors duration-200">
              <span className="material-symbols-outlined fill">storefront</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">商家 / 管理员入口</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-xl">店铺运营、平台审核、订单监控与经营分析</p>
            <span className="material-symbols-outlined ml-auto text-primary-container group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  );
}

function LoginCard({ role, setRole, back }: { role: Role; setRole: (role: string) => void; back: () => void }) {
  const [phone, setPhone] = useState(defaultPhoneByRole[role]);
  const [password, setPassword] = useState('Demo@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPhone(defaultPhoneByRole[role]);
    setPassword('Demo@123456');
    setError('');
  }, [role]);

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const result = await api.login(phone, role, password);
      localStorage.setItem('chengyi_token', result.token);
      localStorage.setItem('chengyi_role', result.role);
      setRole(result.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请确认后端已启动');
    } finally {
      setLoading(false);
    }
  }

  const mobile = role === 'customer' || role === 'rider';
  return (
    <div className={mobile ? 'liquid-stage bg-surface-container-low min-h-screen flex items-center justify-center p-md relative overflow-hidden' : 'liquid-stage bg-surface-container-lowest min-h-screen flex items-center justify-center p-lg relative overflow-hidden'}>
      <button onClick={back} className="absolute top-4 left-4 z-50 bg-inverse-surface/80 text-inverse-on-surface rounded-lg px-sm py-xs text-xs backdrop-blur hover:bg-inverse-surface transition-colors">返回</button>
      <main className={`${mobile ? 'w-full max-w-[375px] min-h-[720px] rounded-[28px] border-[8px]' : 'w-full max-w-[520px] rounded-lg'} liquid-glass p-xl flex flex-col justify-center motion-enter`}>
        <div className="text-center mb-xl">
          <div className="w-20 h-20 mx-auto bg-surface-container-lowest rounded-full shadow-sm flex items-center justify-center mb-md border border-surface-container-high">
            <span className="material-symbols-outlined text-[40px] text-primary fill">{role === 'merchant' ? 'storefront' : role === 'admin' ? 'admin_panel_settings' : role === 'rider' ? 'electric_moped' : 'ramen_dining'}</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">橙意外卖</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{roleText[role]}登录</p>
        </div>
        <div className="space-y-md">
          <div className="relative flex items-center h-14 bg-surface-container-lowest rounded-full px-md border border-outline-variant focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/20 shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant mr-sm">smartphone</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} className="flex-grow bg-transparent border-none p-0 font-body-lg text-body-lg text-on-surface outline-none h-full" placeholder="请输入手机号" type="tel" />
          </div>
          <div className="relative flex items-center h-14 bg-surface-container-lowest rounded-full px-md border border-outline-variant shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant mr-sm">lock</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} className="flex-grow bg-transparent border-none p-0 font-body-lg text-body-lg text-on-surface outline-none h-full" placeholder="请输入密码" type="password" />
          </div>
          {error && <div className="rounded-lg bg-error-container text-on-error-container px-md py-sm text-body-md">{error}</div>}
          <button onClick={submit} disabled={loading} className="liquid-button w-full h-14 bg-primary text-on-primary rounded-lg font-headline-sm text-headline-sm shadow-[0_12px_24px_rgba(37,99,235,0.18)] hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60">
            {loading ? '登录中...' : `进入${roleText[role]}端`}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function Login({ setRole }: { setRole: (role: string) => void }) {
  const [view, setView] = useState<'portal' | 'mobile' | 'pc'>('portal');
  const [role, setLoginRole] = useState<Role>('customer');

  if (view === 'portal') {
    return <Portal open={(mode) => { setView(mode); setLoginRole(mode === 'mobile' ? 'customer' : 'merchant'); }} />;
  }

  const roles: Role[] = view === 'mobile' ? ['customer', 'rider'] : ['merchant', 'admin'];
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-[100] flex gap-sm">
        {roles.map((item) => (
          <button key={item} onClick={() => setLoginRole(item)} className={`liquid-button px-md py-sm rounded-lg text-label-md font-bold shadow-sm transition-colors ${role === item ? 'bg-primary text-on-primary motion-pulse-ring' : 'liquid-glass text-primary hover:bg-primary/10'}`}>
            {roleText[item]}
          </button>
        ))}
      </div>
      <LoginCard role={role} setRole={setRole} back={() => setView('portal')} />
    </div>
  );
}
