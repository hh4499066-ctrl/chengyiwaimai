/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Merchant from './pages/Merchant';
import Rider from './pages/Rider';
import Customer from './pages/Customer';

export default function App() {
  const [role, setRole] = useState('login');

  return (
    <div className="w-full min-h-screen">
      {role === 'login' && <Login setRole={setRole} />}
      {role === 'admin' && <Admin setRole={() => setRole('login')} />}
      {role === 'merchant' && <Merchant setRole={() => setRole('login')} />}
      {role === 'rider' && <Rider setRole={() => setRole('login')} />}
      {role === 'customer' && <Customer setRole={() => setRole('login')} />}
    </div>
  );
}
