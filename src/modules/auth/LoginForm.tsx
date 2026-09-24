import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext.tsx';
import { 
  Building2, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Database,
  Cpu
} from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, activeCompany, userList } = useErp();
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        if (onSuccess) onSuccess();
      }
    }, 300);
  };

  const handleUseSuperadmin = () => {
    setUsername('superadmin');
    setPassword('admin123');
    setErrorMsg(null);
  };

  // Dynamic logo from perusahaan table:
  const companyLogo = activeCompany?.logo_base64;
  const companyName = activeCompany?.nama || 'PT MITRA NIAGA ENTERPRISE';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden px-4 py-8">
      {/* Background Digital Grid & Glow Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-900/60 to-slate-900 border border-blue-500/30 shadow-xl shadow-blue-950/60 mb-4 transition-transform hover:scale-105 duration-300">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-16 h-16 object-contain rounded-xl"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-600/20 border border-blue-400/30 flex flex-col items-center justify-center text-blue-400">
                <Building2 className="w-8 h-8 text-blue-400" />
                <span className="text-[9px] font-mono tracking-wider text-blue-300 uppercase mt-0.5">ERP</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>{companyName}</span>
          </h1>
          <p className="text-xs text-blue-300/80 font-medium tracking-wide mt-1.5 flex items-center justify-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Sistem ERP & CRM Manufaktur Terintegrasi
          </p>

          {/* Indicator that logo is dynamically fetched from database */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/70 border border-blue-800/40 text-[10px] text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {companyLogo ? 'Logo Perusahaan: Dari Database' : 'Logo: Standar Sistem (Tabel Perusahaan Kosong)'}
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-900/40 rounded-2xl p-7 shadow-2xl shadow-blue-950/80">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Autentikasi Pengguna</h2>
              <p className="text-xs text-slate-400 mt-0.5">Silakan masuk dengan akun resmi perusahaan</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-blue-400/80 font-mono">Bcrypt Secured</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-xs tracking-wide transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi...
                </span>
              ) : (
                <>
                  <span>Masuk ke Dashboard ERP</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Superadmin credential shortcut */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-blue-400" />
                Kredensial Default Superadmin:
              </span>
              <button
                type="button"
                onClick={handleUseSuperadmin}
                className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2"
              >
                Gunakan
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
              <span>user: <strong className="text-blue-300">superadmin</strong></span>
              <span className="text-slate-600">|</span>
              <span>pass: <strong className="text-blue-300">admin123</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 text-[10px]">Role: Superadmin</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          <p>Multi-Branch Manufacturing ERP & CRM &bull; Versi Enterprise 2026</p>
          <p className="mt-0.5 font-mono text-[10px] text-slate-600">MySQL Database Host: aoisamin.com (Mitra Niaga)</p>
        </div>
      </div>
    </div>
  );
};
