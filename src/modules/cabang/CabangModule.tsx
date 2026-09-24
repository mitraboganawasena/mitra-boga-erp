import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext.tsx';
import { Cabang } from '../../types/erp.ts';
import { CabangFormModal } from './CabangFormModal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { 
  GitBranch, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  MapPin, 
  Phone, 
  ExternalLink,
  Building,
  AlertCircle
} from 'lucide-react';

export const CabangModule: React.FC = () => {
  const { cabangList, perusahaanList, deleteCabang, hasPermission } = useErp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCabang, setEditingCabang] = useState<Cabang | null>(null);
  const [deletingCabang, setDeletingCabang] = useState<Cabang | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canAdd = hasPermission('cabang', 'add');
  const canEdit = hasPermission('cabang', 'edit');
  const canDelete = hasPermission('cabang', 'delete');

  const filteredData = useMemo(() => {
    return cabangList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.alamat && item.alamat.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = filterType === 'ALL' || item.type === filterType;
      return matchSearch && matchType;
    });
  }, [cabangList, searchTerm, filterType]);

  const handleOpenAdd = () => {
    setEditingCabang(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Cabang) => {
    setEditingCabang(item);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingCabang) return;
    const res = deleteCabang(deletingCabang.id);
    if (!res.success) {
      setActionError(res.message || 'Gagal menghapus cabang.');
    } else {
      setActionError(null);
      setDeletingCabang(null);
    }
  };

  // Find parent company name helper
  const getCompanyName = (idPerusahaan: string) => {
    const p = perusahaanList.find((item) => item.id === idPerusahaan);
    return p ? p.nama : idPerusahaan;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Master Cabang & Fasilitas</h1>
              <p className="text-xs text-slate-400">
                Pusat operasional, pabrik manufaktur, gudang logistik, dan unit cabang regional
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
            <span>Tambah Cabang Baru</span>
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
              placeholder="Cari Kode, Nama, Alamat Cabang..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Tipe (Pusat & Cabang)</option>
            <option value="Pusat">Hanya Pusat / HQ</option>
            <option value="Cabang">Hanya Cabang / Pabrik</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
          Total Cabang: <strong className="text-blue-400">{filteredData.length}</strong>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 w-28">ID Cabang</th>
              <th className="py-3.5 px-4 w-20">Kode</th>
              <th className="py-3.5 px-4">Nama & Lokasi</th>
              <th className="py-3.5 px-4">Induk Perusahaan</th>
              <th className="py-3.5 px-4 text-center w-24">Tipe</th>
              <th className="py-3.5 px-4 text-center w-24">Status</th>
              <th className="py-3.5 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <GitBranch className="w-10 h-10 text-slate-600 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-300">Belum Ada Cabang Terdaftar</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? 'Tidak ada cabang yang cocok dengan pencarian.'
                        : 'Tambahkan kantor pusat dan cabang manufaktur untuk mengelola karyawan dan wewenang pengguna.'}
                    </p>
                    {canAdd && !searchTerm && (
                      <button
                        onClick={handleOpenAdd}
                        className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Daftarkan Cabang Pertama</span>
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
                    <span className="font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300 font-bold text-[11px]">
                      {item.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{item.nama}</div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      {item.alamat && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="line-clamp-1">{item.alamat}</span>
                        </span>
                      )}
                      {item.telepon && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {item.telepon}
                        </span>
                      )}
                      {item.url_gmaps && (
                        <a
                          href={item.url_gmaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Google Maps</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{getCompanyName(item.id_perusahaan)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.type === 'Pusat'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      }`}
                    >
                      {item.type}
                    </span>
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
                          title="Ubah Cabang"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingCabang(item)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          title="Hapus Cabang"
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
      <CabangFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingCabang}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCabang)}
        onClose={() => setDeletingCabang(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Cabang / Lokasi"
        message={`Apakah Anda yakin ingin menghapus "${deletingCabang?.nama}" (${deletingCabang?.id})? Pastikan tidak ada data karyawan atau user yang tertaut ke cabang ini.`}
        confirmText="Hapus Cabang"
      />
    </div>
  );
};
