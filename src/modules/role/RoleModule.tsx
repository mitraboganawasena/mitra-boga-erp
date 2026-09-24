import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext.tsx';
import { Role, ModuleKey } from '../../types/erp.ts';
import { RoleFormModal } from './RoleFormModal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { 
  ShieldCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Lock, 
  Check, 
  Minus,
  AlertCircle
} from 'lucide-react';

const MODULES_LIST: { key: ModuleKey; label: string }[] = [
  { key: 'perusahaan', label: 'Perusahaan' },
  { key: 'cabang', label: 'Cabang' },
  { key: 'role', label: 'Role' },
  { key: 'jabatan', label: 'Jabatan' },
  { key: 'karyawan', label: 'Karyawan' },
  { key: 'user', label: 'User' },
];

export const RoleModule: React.FC = () => {
  const { roleList, deleteRole, hasPermission } = useErp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canAdd = hasPermission('role', 'add');
  const canEdit = hasPermission('role', 'edit');
  const canDelete = hasPermission('role', 'delete');

  const filteredRoles = useMemo(() => {
    return roleList.filter((r) =>
      r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roleList, searchTerm]);

  const handleOpenAdd = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingRole) return;
    const result = deleteRole(deletingRole.id);
    if (!result.success) {
      setActionError(result.message || 'Gagal menghapus role.');
    } else {
      setActionError(null);
      setDeletingRole(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Manajemen Role & Hak Akses</h1>
              <p className="text-xs text-slate-400">
                Atur wewenang granular (View, Add, Edit, Delete) untuk tiap modul operasional
              </p>
            </div>
          </div>
        </div>

        {canAdd && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Role Baru</span>
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-rose-400 hover:text-white"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID Role atau Nama..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
          Total Role: <strong className="text-blue-400">{filteredRoles.length}</strong>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 w-28">ID Role</th>
              <th className="py-3.5 px-4">Nama Role</th>
              <th className="py-3.5 px-4">Ringkasan Hak Akses (V / A / E / D)</th>
              <th className="py-3.5 px-4 text-center w-28">Tipe</th>
              <th className="py-3.5 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRoles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  Tidak ada role yang sesuai dengan pencarian.
                </td>
              </tr>
            ) : (
              filteredRoles.map((role) => {
                const isSuperadmin = role.id === 'ROLE-SUPERADMIN' || role.permission.superadmin;

                return (
                  <tr key={role.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-400">
                      {role.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{role.nama}</span>
                        {isSuperadmin && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Root System
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isSuperadmin ? (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          <span>Akses Penuh Semua Modul (Bypass All)</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {MODULES_LIST.map((m) => {
                            const p = role.permission.modules?.[m.key];
                            const activeCount = [p?.view, p?.add, p?.edit, p?.delete].filter(Boolean).length;
                            return (
                              <div
                                key={m.key}
                                className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
                                  activeCount > 0
                                    ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                                }`}
                              >
                                <span className="font-medium">{m.label}:</span>
                                <span className="font-mono text-[9px] tracking-widest text-blue-400">
                                  {p?.view ? 'V' : '-'}
                                  {p?.add ? 'A' : '-'}
                                  {p?.edit ? 'E' : '-'}
                                  {p?.delete ? 'D' : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isSuperadmin ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                          <Lock className="w-3 h-3" />
                          Terkunci
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Kustom</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(role)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Ubah Role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && !isSuperadmin && (
                          <button
                            onClick={() => setDeletingRole(role)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                            title="Hapus Role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Role Form Modal */}
      <RoleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingRole}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingRole)}
        onClose={() => setDeletingRole(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Role Akses"
        message={`Apakah Anda yakin ingin menghapus role "${deletingRole?.nama}" (${deletingRole?.id})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Role"
      />
    </div>
  );
};
