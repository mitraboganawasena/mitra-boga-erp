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
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Server,
  FileCode,
  CheckCircle2
} from 'lucide-react';

interface OverviewModuleProps {
  onNavigate: (module: ModuleKey) => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({ onNavigate }) => {
  const { 
    perusahaanList, 
    cabangList, 
    roleList, 
    jabatanList, 
    karyawanList, 
    userList,
    activeCompany,
    currentUser
  } = useErp();

  const cards = [
    {
      key: 'perusahaan' as ModuleKey,
      title: 'Perusahaan Induk',
      count: perusahaanList.length,
      unit: 'Entitas Legal',
      desc: 'NPWP, metode FIFO/Average & Logo sistem',
      icon: Building2,
      color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 text-blue-400',
    },
    {
      key: 'cabang' as ModuleKey,
      title: 'Cabang & Pabrik',
      count: cabangList.length,
      unit: 'Lokasi Operasional',
      desc: 'Pusat, depo gudang & tautan Google Maps',
      icon: GitBranch,
      color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400',
    },
    {
      key: 'role' as ModuleKey,
      title: 'Role & Hak Akses',
      count: roleList.length,
      unit: 'Tingkat Otorisasi',
      desc: 'Matriks izin granular (View, Add, Edit, Delete)',
      icon: ShieldCheck,
      color: 'from-indigo-600/20 to-indigo-900/10 border-indigo-500/30 text-indigo-400',
    },
    {
      key: 'jabatan' as ModuleKey,
      title: 'Struktur Jabatan',
      count: jabatanList.length,
      unit: 'Tingkat Hierarki',
      desc: 'Level 1 s/d 5 (Direksi s/d Staff Operasional)',
      icon: Briefcase,
      color: 'from-sky-600/20 to-sky-900/10 border-sky-500/30 text-sky-400',
    },
    {
      key: 'karyawan' as ModuleKey,
      title: 'Karyawan & Payroll',
      count: karyawanList.length,
      unit: 'Tenaga Kerja',
      desc: 'Biodata, WA aktif, payroll gaji & PTKP',
      icon: Users,
      color: 'from-teal-600/20 to-teal-900/10 border-teal-500/30 text-teal-400',
    },
    {
      key: 'user' as ModuleKey,
      title: 'Pengguna ERP',
      count: userList.length,
      unit: 'Akun Terdaftar',
      desc: 'Bcrypt credentials & scope multi-cabang',
      icon: UserCheck,
      color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 text-blue-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Digital Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900/60 border border-blue-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,#2563eb30,transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono mb-3">
            <Cpu className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Digitalisasi Manufaktur Multi-Cabang v2026</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Selamat Datang di Portal Enterprise ERP & CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Arsitektur modular dengan tata kelola hak akses berbasis matriks wewenang granular (View, Add, Edit, Delete),
            manajemen multi-cabang terisolasi, serta struktur kompensasi dan payroll karyawan terintegrasi.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>DB: aois5856_mitraniaga01</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Host: aoisamin.com:3306</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data Asli: Bebas Dummy Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className="group cursor-pointer rounded-2xl p-5 bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-300 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
                    {card.count}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                  {card.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-medium">
                <span>Kelola Data {card.title}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dynamic Logo Extraction Explanation */}
        <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Kustomisasi Identitas & Logo Perusahaan</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sesuai spesifikasi, logo sistem pada <strong className="text-blue-300">Form Login</strong> dan <strong className="text-blue-300">Header Dashboard</strong> diambil langsung dari field <code className="text-blue-400 font-mono">logo_base64</code> pada tabel <strong className="text-slate-200">perusahaan</strong>.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              {activeCompany?.logo_base64 ? (
                <img src={activeCompany.logo_base64} alt="Company Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-6 h-6 text-slate-600" />
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">
                {activeCompany?.nama || 'Belum Didaftarkan'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {activeCompany ? `ID: ${activeCompany.id} • Valuasi: ${activeCompany.metode_valuasi}` : 'Buka Modul Perusahaan untuk mengunggah logo'}
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Role System Explanation */}
        <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Matriks Akses Granular (V / A / E / D)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Modul Role dilengkapi dengan checklist matriks lengkap untuk mengontrol izin <strong className="text-blue-300">View (Lihat)</strong>, <strong className="text-emerald-300">Add (Tambah)</strong>, <strong className="text-amber-300">Edit (Ubah)</strong>, dan <strong className="text-rose-300">Delete (Hapus)</strong> per modul sistem.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-300">Role Pengguna Saat Ini:</span>
            </div>
            <span className="text-blue-400 font-bold">{currentUser?.role.nama}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
