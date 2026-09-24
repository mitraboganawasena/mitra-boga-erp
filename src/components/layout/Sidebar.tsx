import React from 'react';
import { useErp } from '../../context/ErpContext.tsx';
import { ModuleKey } from '../../types/erp.ts';
import { 
  Building2, 
  GitBranch, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  UserCheck, 
  ChevronRight, 
  Cpu,
  Layers,
  Database
} from 'lucide-react';

interface SidebarProps {
  activeModule: ModuleKey | 'dashboard';
  setActiveModule: (m: ModuleKey | 'dashboard') => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ModuleKey | 'dashboard';
  label: string;
  icon: React.ElementType;
  moduleKey?: ModuleKey;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Overview & Arsitektur',
    icon: Layers,
    description: 'Ringkasan sistem & database',
  },
  {
    id: 'perusahaan',
    label: 'Master Perusahaan',
    icon: Building2,
    moduleKey: 'perusahaan',
    description: 'Profil legal, valuasi & logo',
  },
  {
    id: 'cabang',
    label: 'Master Cabang',
    icon: GitBranch,
    moduleKey: 'cabang',
    description: 'Pusat, pabrik & gudang',
  },
  {
    id: 'role',
    label: 'Role & Hak Akses',
    icon: ShieldCheck,
    moduleKey: 'role',
    description: 'Matriks izin V / A / E / D',
  },
  {
    id: 'jabatan',
    label: 'Struktur Jabatan',
    icon: Briefcase,
    moduleKey: 'jabatan',
    description: 'Hierarki organisasi & posisi',
  },
  {
    id: 'karyawan',
    label: 'Karyawan & Payroll',
    icon: Users,
    moduleKey: 'karyawan',
    description: 'Tenaga kerja, WA & gaji',
  },
  {
    id: 'user',
    label: 'Manajemen User ERP',
    icon: UserCheck,
    moduleKey: 'user',
    description: 'Akun login & hak cabang',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { hasPermission, activeCompany } = useErp();

  const handleSelect = (id: ModuleKey | 'dashboard') => {
    setActiveModule(id);
    onCloseMobile();
  };

  const companyLogo = activeCompany?.logo_base64;
  const companyName = activeCompany?.nama || 'MITRA NIAGA ERP';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-blue-900/30 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-lg shadow-blue-950">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-white tracking-wide truncate">
              {companyName}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-mono mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ERP + CRM Cloud</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Modul Utama ERP
          </div>

          {NAV_ITEMS.map((item) => {
            // Check permission: if module requires permission and user cannot view it, hide or disable
            if (item.moduleKey && !hasPermission(item.moduleKey, 'view')) {
              return null;
            }

            const isActive = activeModule === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition group ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`p-1.5 rounded-lg transition ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-blue-400 group-hover:text-blue-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="truncate">
                    <div className="truncate">{item.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-blue-100/80' : 'text-slate-500'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Database Connection Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-blue-400" />
              MySQL Host:
            </span>
            <span className="text-slate-300">aoisamin.com</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span>Database:</span>
            <span className="text-blue-300">mitraniaga01</span>
          </div>
        </div>
      </aside>
    </>
  );
};
