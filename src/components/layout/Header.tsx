import React from 'react';
import { useErp } from '../../context/ErpContext.tsx';
import { 
  Menu, 
  LogOut, 
  Shield, 
  Building2, 
  Globe2, 
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  activeModuleName: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  activeModuleName,
}) => {
  const { currentUser, logout, activeCompany } = useErp();

  if (!currentUser) return null;

  const { user, role, cabang, karyawan } = currentUser;
  const companyLogo = activeCompany?.logo_base64;
  const isSuperadmin = role.id === 'ROLE-SUPERADMIN' || role.permission.superadmin;

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-blue-900/30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Company logo icon (small) */}
        {companyLogo && (
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 p-0.5 items-center justify-center shrink-0">
            <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}

        {/* Active Title Breadcrumb */}
        <div>
          <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-mono">
            <span>ERP MANUFAKTUR</span>
            <span>/</span>
            <span className="text-slate-400">{activeCompany?.nama || 'PT MITRA NIAGA'}</span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight">{activeModuleName}</h2>
        </div>
      </div>

      {/* Right section: User Status, Branch Scope, Logout */}
      <div className="flex items-center gap-3">
        {/* Branch Context Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
          {user.akses_semua_cabang === 'ya' ? (
            <>
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-300 font-medium">Semua Cabang (Global)</span>
            </>
          ) : (
            <>
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300 font-medium">
                {cabang ? `[${cabang.code}] ${cabang.nama}` : 'Cabang Utama'}
              </span>
            </>
          )}
        </div>

        {/* Role & User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs uppercase">
            {user.username.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white leading-none flex items-center gap-1.5">
              <span>{user.username}</span>
              {isSuperadmin && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Superadmin" />
              )}
            </div>
            <div className="text-[10px] text-blue-300/80 font-mono mt-0.5">
              {role.nama}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          title="Keluar dari Sistem (Logout)"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
