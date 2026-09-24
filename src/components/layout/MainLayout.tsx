import React, { useState } from 'react';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { ModuleKey } from '../../types/erp.ts';
import { OverviewModule } from '../../modules/dashboard/OverviewModule.tsx';
import { PerusahaanModule } from '../../modules/perusahaan/PerusahaanModule.tsx';
import { CabangModule } from '../../modules/cabang/CabangModule.tsx';
import { RoleModule } from '../../modules/role/RoleModule.tsx';
import { JabatanModule } from '../../modules/jabatan/JabatanModule.tsx';
import { KaryawanModule } from '../../modules/karyawan/KaryawanModule.tsx';
import { UserModule } from '../../modules/user/UserModule.tsx';

const MODULE_TITLES: Record<ModuleKey | 'dashboard', string> = {
  dashboard: 'Overview & Ringkasan Sistem',
  perusahaan: 'Master Entitas Perusahaan',
  cabang: 'Master Cabang & Fasilitas Pabrik',
  role: 'Manajemen Role & Hak Akses (Matriks)',
  jabatan: 'Master Struktur Hierarki Jabatan',
  karyawan: 'Data Karyawan & Kompensasi Payroll',
  user: 'Manajemen User & Autentikasi ERP',
};

export const MainLayout: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleKey | 'dashboard'>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <OverviewModule onNavigate={(mod) => setActiveModule(mod)} />;
      case 'perusahaan':
        return <PerusahaanModule />;
      case 'cabang':
        return <CabangModule />;
      case 'role':
        return <RoleModule />;
      case 'jabatan':
        return <JabatanModule />;
      case 'karyawan':
        return <KaryawanModule />;
      case 'user':
        return <UserModule />;
      default:
        return <OverviewModule onNavigate={(mod) => setActiveModule(mod)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Viewport Container with lg:pl-64 offset */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        <Header
          onToggleMobileMenu={() => setIsOpenMobile(true)}
          activeModuleName={MODULE_TITLES[activeModule]}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
};
