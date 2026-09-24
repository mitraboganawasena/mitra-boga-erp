import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext.tsx';
import { User } from '../../types/erp.ts';
import { UserFormModal } from './UserFormModal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { 
  UserCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Shield, 
  Building, 
  Globe2, 
  Lock,
  AlertCircle
} from 'lucide-react';

export const UserModule: React.FC = () => {
  const { userList, roleList, cabangList, karyawanList, deleteUser, hasPermission } = useErp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canAdd = hasPermission('user', 'add');
  const canEdit = hasPermission('user', 'edit');
  const canDelete = hasPermission('user', 'delete');

  const filteredData = useMemo(() => {
    return userList.filter((item) => {
      const matchSearch =
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole === 'ALL' || item.id_role === filterRole;
      return matchSearch && matchRole;
    });
  }, [userList, searchTerm, filterRole]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: User) => {
    setEditingUser(item);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    const res = deleteUser(deletingUser.id);
    if (!res.success) {
      setActionError(res.message || 'Gagal menghapus user.');
    } else {
      setActionError(null);
      setDeletingUser(null);
    }
  };

  const getRoleName = (idRole: string) => {
    const r = roleList.find((item) => item.id === idRole);
    return r ? r.nama : idRole;
  };

  const getCabangLabel = (item: User) => {
    if (item.akses_semua_cabang === 'ya') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-medium">
          <Globe2 className="w-3.5 h-3.5" />
          <span>Semua Cabang (Global)</span>
        </span>
      );
    }
    const c = cabangList.find((cab) => cab.id === item.id_cabang);
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
        <Building className="w-3 h-3 text-slate-500" />
        <span>{c ? `[${c.code}] ${c.nama}` : 'Cabang Belum Diset'}</span>
      </span>
    );
  };

  const getKaryawanName = (idKaryawan: string | null) => {
    if (!idKaryawan) return <span className="text-slate-600 text-[11px] italic">Tidak ditautkan</span>;
    const k = karyawanList.find((item) => item.id === idKaryawan);
    return (
      <span className="text-slate-300 text-[11px] font-medium">
        {k ? k.nama_karyawan : idKaryawan}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Manajemen User ERP & Keamanan</h1>
              <p className="text-xs text-slate-400">
                Pengaturan akun login, role otorisasi, relasi karyawan, dan pembatasan isolasi cabang
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
            <span>Tambah User Baru</span>
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

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Username atau ID User..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Role</option>
            {roleList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
          Total Akun: <strong className="text-blue-400">{filteredData.length}</strong>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 w-28">ID User</th>
              <th className="py-3.5 px-4">Username & Tautan Personel</th>
              <th className="py-3.5 px-4">Role Hak Akses</th>
              <th className="py-3.5 px-4">Jangkauan Cabang</th>
              <th className="py-3.5 px-4 text-center w-24">Status</th>
              <th className="py-3.5 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredData.map((item) => {
              const isSuperadmin = item.id === 'USER-0001' || item.username === 'superadmin';

              return (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-400">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{item.username}</span>
                      {isSuperadmin && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                          <Lock className="w-3 h-3" />
                          Master
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5">
                      {getKaryawanName(item.id_karyawan)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[11px] font-medium">
                      <Shield className="w-3 h-3 text-blue-400" />
                      <span>{getRoleName(item.id_role)}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {getCabangLabel(item)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        item.status === 'aktif'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'aktif' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Ubah User & Reset Password"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && !isSuperadmin && (
                        <button
                          onClick={() => setDeletingUser(item)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          title="Hapus User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingUser}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${deletingUser?.username}" (${deletingUser?.id})? Akun ini tidak akan dapat login lagi.`}
        confirmText="Hapus Akun"
      />
    </div>
  );
};
