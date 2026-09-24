import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext.tsx';
import { Karyawan } from '../../types/erp.ts';
import { KaryawanFormModal } from './KaryawanFormModal.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { formatRupiah, formatDateIndo } from '../../utils/formatters.ts';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  MessageCircle, 
  CreditCard, 
  Building,
  AlertCircle
} from 'lucide-react';

export const KaryawanModule: React.FC = () => {
  const { karyawanList, cabangList, jabatanList, deleteKaryawan, hasPermission } = useErp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCabang, setFilterCabang] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKaryawan, setEditingKaryawan] = useState<Karyawan | null>(null);
  const [deletingKaryawan, setDeletingKaryawan] = useState<Karyawan | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canAdd = hasPermission('karyawan', 'add');
  const canEdit = hasPermission('karyawan', 'edit');
  const canDelete = hasPermission('karyawan', 'delete');

  const filteredData = useMemo(() => {
    return karyawanList.filter((item) => {
      const matchSearch =
        item.nama_karyawan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.no_wa.includes(searchTerm) ||
        (item.no_rekening && item.no_rekening.includes(searchTerm));
      const matchCabang = filterCabang === 'ALL' || item.id_cabang === filterCabang;
      return matchSearch && matchCabang;
    });
  }, [karyawanList, searchTerm, filterCabang]);

  const handleOpenAdd = () => {
    setEditingKaryawan(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Karyawan) => {
    setEditingKaryawan(item);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingKaryawan) return;
    const res = deleteKaryawan(deletingKaryawan.id);
    if (!res.success) {
      setActionError(res.message || 'Gagal menghapus karyawan.');
    } else {
      setActionError(null);
      setDeletingKaryawan(null);
    }
  };

  const getBranchCode = (idCabang: string) => {
    const c = cabangList.find((item) => item.id === idCabang);
    return c ? `[${c.code}] ${c.nama}` : idCabang;
  };

  const getJabatanName = (idJabatan: string) => {
    const j = jabatanList.find((item) => item.id === idJabatan);
    return j ? j.nama : idJabatan;
  };

  const formatWaUrl = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Data Karyawan & Payroll</h1>
              <p className="text-xs text-slate-400">
                Pengelolaan tenaga kerja multi-cabang, nomor WhatsApp, struktur gaji, dan rekening bank
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
            <span>Tambah Karyawan</span>
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
              placeholder="Cari ID, Nama, No WA, Rekening..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <select
            value={filterCabang}
            onChange={(e) => setFilterCabang(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Cabang Penempatan</option>
            {cabangList.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.code}] {c.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
          Total Karyawan: <strong className="text-blue-400">{filteredData.length}</strong>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 w-28">ID Personel</th>
              <th className="py-3.5 px-4">Nama & Jabatan</th>
              <th className="py-3.5 px-4">Penempatan Cabang</th>
              <th className="py-3.5 px-4">Kontak WhatsApp</th>
              <th className="py-3.5 px-4">Remunerasi Bruto & Bank</th>
              <th className="py-3.5 px-4 text-center w-24">Status</th>
              <th className="py-3.5 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <Users className="w-10 h-10 text-slate-600 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-300">Belum Ada Data Karyawan</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? 'Tidak ada data karyawan yang cocok dengan pencarian.'
                        : 'Daftarkan karyawan untuk mengaitkan akun login ERP dan mengelola payroll cabang.'}
                    </p>
                    {canAdd && !searchTerm && (
                      <button
                        onClick={handleOpenAdd}
                        className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Daftarkan Karyawan Pertama</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const totalSalary =
                  (item.gaji_pokok || 0) + (item.tunjangan_pokok || 0) + (item.tunjangan_lain_lain || 0);

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-400">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.nama_karyawan}</div>
                      <div className="text-[11px] text-blue-300/80 font-medium mt-0.5">
                        {getJabatanName(item.id_jabatan)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Masuk: {formatDateIndo(item.tgl_masuk)} &bull; PTKP: {item.ptkp}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 text-[11px]">
                        <Building className="w-3.5 h-3.5 text-blue-400" />
                        <span>{getBranchCode(item.id_cabang)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.no_wa ? (
                        <a
                          href={formatWaUrl(item.no_wa)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                          title="Chat via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{item.no_wa}</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-emerald-400 font-semibold text-[11px]">
                        {formatRupiah(totalSalary)}
                      </div>
                      {item.nama_bank && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          <span>
                            {item.nama_bank.split(' ')[0]} {item.no_rekening ? `(${item.no_rekening})` : ''}
                          </span>
                        </div>
                      )}
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
                            title="Ubah Karyawan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeletingKaryawan(item)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                            title="Hapus Karyawan"
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

      {/* Form Modal */}
      <KaryawanFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingKaryawan}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingKaryawan)}
        onClose={() => setDeletingKaryawan(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Karyawan"
        message={`Apakah Anda yakin ingin menghapus data "${deletingKaryawan?.nama_karyawan}" (${deletingKaryawan?.id})? Pastikan karyawan tidak memiliki akun User ERP aktif.`}
        confirmText="Hapus Karyawan"
      />
    </div>
  );
};
