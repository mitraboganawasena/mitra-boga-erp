/**
 * ERP + CRM Enterprise Manufaktur Multi Cabang
 * Main Application Entry Point with ErpProvider & Auth Routing
 */

import React from 'react';
import { ErpProvider, useErp } from './context/ErpContext.tsx';
import { LoginForm } from './modules/auth/LoginForm.tsx';
import { MainLayout } from './components/layout/MainLayout.tsx';

const AppContent: React.FC = () => {
  const { currentUser } = useErp();

  if (!currentUser) {
    return <LoginForm />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <ErpProvider>
      <AppContent />
    </ErpProvider>
  );
}
