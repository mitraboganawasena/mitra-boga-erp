import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext.tsx';
import { Perusahaan } from '../../types/erp.ts';
import { PerusahaanFormModal } from './PerusahaanFormModal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { formatDateIndo } from '../../utils/formatters.ts';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Layers,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const PerusahaanModule: React.FC = () => {
  const { perusahaanList, deletePerusahaan, hasPermission } = useErp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerusahaan, setEditingPerusahaan] = useState<Perusahaan | null>(null);
  const [deletingPerusahaan, setDeletingPerusahaan] = useState<Perusahaan | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canAdd = hasPermission('perusahaan', 'add');
  const canEdit = hasPermission('perusahaan', 'edit');
  const canDelete = hasPermission('perusahaan', 'delete');

  const filteredData = useMemo(() => {
    return perusahaanList.filter((item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.npwp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [perusahaanList, searchTerm]);

  const handleOpenAdd = () => {
    setEditingPerusahaan(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Perusahaan) => {
    setEditingPerusahaan(item);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingPerusahaan) return;
    const result = deletePerusahaan(deletingPerusahaan.id);
    if (!result.success) {
      setActionError(result.message || 'Gagal menghapus data perusahaan.');
    } else {
      setActionError(null);
      setDeletingPerusahaan(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Master Data Perusahaan</h1>
              <p className="text-xs text-slate-400">
                Entitas badan usaha, NPWP, metode valuasi inventory, dan logo resmi sistem
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
            <span>Tambah Perusahaan</span>
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

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID, Nama, NPWP, atau Email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
          Total Entitas: <strong className="text-blue-400">{filteredData.length}</strong>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 w-28">ID Entitas</th>
              <th className="py-3.5 px-4">Perusahaan & Logo</th>
              <th className="py-3.5 px-4">Kontak & NPWP</th>
              <th className="py-3.5 px-4">Valuasi Persediaan</th>
              <th className="py-3.5 px-4 text-center w-28">Status</th>
              <th className="py-3.5 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <Building2 className="w-10 h-10 text-slate-600 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-300">Belum Ada Data Perusahaan</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? 'Tidak ditemukan data sesuai kata kunci pencarian.'
                        : 'Daftarkan entitas perusahaan pertama Anda untuk menampilkan logo di form login dan header.'}
                    </p>
                    {canAdd && !searchTerm && (
                      <button
                        onClick={handleOpenAdd}
                        className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Daftarkan Perusahaan Pertama</span>
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
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        {item.logo_base64 ? (
                          <img
                            src={item.logo_base64}
                            alt={item.nama}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{item.nama}</div>
                        {item.alamat && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{item.alamat}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5">
                    {item.npwp && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                        <FileText className="w-3 h-3 text-blue-400" />
                        <span>{item.npwp}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      {item.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {item.email}
                        </span>
                      )}
                      {item.telepon && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {item.telepon}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-950/80 border border-blue-800/60 text-blue-300 font-mono">
                      <Layers className="w-3 h-3" />
                      {item.metode_valuasi}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        item.operasional_status === 'aktif'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.operasional_status === 'aktif' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {item.operasional_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Ubah Data Perusahaan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingPerusahaan(item)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          title="Hapus Data Perusahaan"
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
      <PerusahaanFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingPerusahaan}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingPerusahaan)}
        onClose={() => setDeletingPerusahaan(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Perusahaan"
        message={`Apakah Anda yakin ingin menghapus "${deletingPerusahaan?.nama}" (${deletingPerusahaan?.id})? Pastikan tidak ada cabang yang terhubung.`}
        confirmText="Hapus Perusahaan"
      />
    </div>
  );
};
