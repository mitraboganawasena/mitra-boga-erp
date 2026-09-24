import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext.tsx';
import { Jabatan } from '../../types/erp.ts';
import { JabatanFormModal } from './JabatanFormModal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { getJabatanLevelName } from '../../utils/formatters.ts';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Award,
  AlertCircle
} from 'lucide-react';

export const JabatanModule: React.FC = () => {
  const { jabatanList, deleteJabatan, hasPermission } = useErp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJabatan, setEditingJabatan] = useState<Jabatan | null>(null);
  const [deletingJabatan, setDeletingJabatan] = useState<Jabatan | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canAdd = hasPermission('jabatan', 'add');
  const canEdit = hasPermission('jabatan', 'edit');
  const canDelete = hasPermission('jabatan', 'delete');

  const filteredData = useMemo(() => {
    return jabatanList.filter((item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [jabatanList, searchTerm]);

  const handleOpenAdd = () => {
    setEditingJabatan(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Jabatan) => {
    setEditingJabatan(item);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingJabatan) return;
    const res = deleteJabatan(deletingJabatan.id);
    if (!res.success) {
      setActionError(res.message || 'Gagal menghapus jabatan.');
    } else {
      setActionError(null);
      setDeletingJabatan(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Master Struktur Jabatan</h1>
              <p className="text-xs text-slate-400">
                Hierarki jabatan organisasi, level wewenang, dan job profile manufaktur
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
            <span>Tambah Jabatan</span>
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

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID, Nama Jabatan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
          Total Posisi: <strong className="text-blue-400">{filteredData.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 w-28">ID Jabatan</th>
              <th className="py-3.5 px-4">Nama Posisi & Deskripsi</th>
              <th className="py-3.5 px-4">Tingkat Hierarki (Level)</th>
              <th className="py-3.5 px-4 text-center w-24">Status</th>
              <th className="py-3.5 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <Briefcase className="w-10 h-10 text-slate-600 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-300">Belum Ada Jabatan</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? 'Tidak ada posisi yang cocok dengan kata kunci.'
                        : 'Tambahkan jabatan struktural perusahaan untuk mengaitkannya ke data karyawan dan payroll.'}
                    </p>
                    {canAdd && !searchTerm && (
                      <button
                        onClick={handleOpenAdd}
                        className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Buat Jabatan Pertama</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-400">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{item.nama}</div>
                    {item.deskripsi && (
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.deskripsi}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-blue-400" />
                      <span>{getJabatanLevelName(item.level)}</span>
                    </div>
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
                          title="Ubah Jabatan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingJabatan(item)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          title="Hapus Jabatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <JabatanFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingJabatan}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingJabatan)}
        onClose={() => setDeletingJabatan(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Jabatan"
        message={`Apakah Anda yakin ingin menghapus jabatan "${deletingJabatan?.nama}" (${deletingJabatan?.id})? Pastikan tidak ada karyawan yang sedang menjabat posisi ini.`}
        confirmText="Hapus Jabatan"
      />
    </div>
  );
};
