import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.tsx';
import { Karyawan, OperasionalStatus } from '../../types/erp.ts';
import { useErp } from '../../context/ErpContext.tsx';
import { generateKaryawanId } from '../../utils/idGenerator.ts';
import { PTKP_OPTIONS, BANK_OPTIONS } from '../../utils/formatters.ts';
import { UserCheck, DollarSign, Building } from 'lucide-react';

interface KaryawanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Karyawan | null;
}

export const KaryawanFormModal: React.FC<KaryawanFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { karyawanList, cabangList, jabatanList, addKaryawan, updateKaryawan } = useErp();

  const [idCabang, setIdCabang] = useState('');
  const [id, setId] = useState('');
  const [namaKaryawan, setNamaKaryawan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noWa, setNoWa] = useState('');
  const [tglMasuk, setTglMasuk] = useState(new Date().toISOString().split('T')[0]);
  const [gajiPokok, setGajiPokok] = useState<number>(0);
  const [tunjanganPokok, setTunjanganPokok] = useState<number>(0);
  const [tunjanganLainLain, setTunjanganLainLain] = useState<number>(0);
  const [ptkp, setPtkp] = useState('TK/0');
  const [idJabatan, setIdJabatan] = useState('');
  const [namaBank, setNamaBank] = useState('BCA (Bank Central Asia)');
  const [noRekening, setNoRekening] = useState('');
  const [status, setStatus] = useState<OperasionalStatus>('aktif');

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setIdCabang(initialData.id_cabang);
      setNamaKaryawan(initialData.nama_karyawan);
      setAlamat(initialData.alamat || '');
      setNoWa(initialData.no_wa || '');
      setTglMasuk(initialData.tgl_masuk || new Date().toISOString().split('T')[0]);
      setGajiPokok(initialData.gaji_pokok || 0);
      setTunjanganPokok(initialData.tunjangan_pokok || 0);
      setTunjanganLainLain(initialData.tunjangan_lain_lain || 0);
      setPtkp(initialData.ptkp || 'TK/0');
      setIdJabatan(initialData.id_jabatan || '');
      setNamaBank(initialData.nama_bank || 'BCA (Bank Central Asia)');
      setNoRekening(initialData.no_rekening || '');
      setStatus(initialData.status);
    } else {
      const defaultBranch = cabangList[0];
      const branchId = defaultBranch?.id || '';
      const branchCode = defaultBranch?.code || 'PST';
      setIdCabang(branchId);

      const existingIds = karyawanList.map((k) => k.id);
      setId(generateKaryawanId(branchCode, existingIds));

      setNamaKaryawan('');
      setAlamat('');
      setNoWa('');
      setTglMasuk(new Date().toISOString().split('T')[0]);
      setGajiPokok(5000000);
      setTunjanganPokok(1000000);
      setTunjanganLainLain(500000);
      setPtkp('TK/0');
      setIdJabatan(jabatanList[0]?.id || '');
      setNamaBank('BCA (Bank Central Asia)');
      setNoRekening('');
      setStatus('aktif');
    }
  }, [initialData, isOpen, cabangList, jabatanList, karyawanList]);

  // Recalculate ID when branch selection changes in Add mode
  const handleBranchChange = (branchId: string) => {
    setIdCabang(branchId);
    if (!isEditing) {
      const selectedBranch = cabangList.find((c) => c.id === branchId);
      const branchCode = selectedBranch?.code || 'EMP';
      const existingIds = karyawanList.map((k) => k.id);
      setId(generateKaryawanId(branchCode, existingIds));
    }
  };

  const totalTakeHomePay = (Number(gajiPokok) || 0) + (Number(tunjanganPokok) || 0) + (Number(tunjanganLainLain) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKaryawan.trim() || !idCabang || !idJabatan) return;

    if (isEditing && initialData) {
      updateKaryawan(initialData.id, {
        id_cabang: idCabang,
        nama_karyawan: namaKaryawan.trim(),
        alamat: alamat.trim(),
        no_wa: noWa.trim(),
        tgl_masuk: tglMasuk,
        gaji_pokok: Number(gajiPokok) || 0,
        tunjangan_pokok: Number(tunjanganPokok) || 0,
        tunjangan_lain_lain: Number(tunjanganLainLain) || 0,
        ptkp,
        id_jabatan: idJabatan,
        nama_bank: namaBank,
        no_rekening: noRekening.trim(),
        status,
      });
    } else {
      addKaryawan({
        id,
        id_cabang: idCabang,
        nama_karyawan: namaKaryawan.trim(),
        alamat: alamat.trim(),
        no_wa: noWa.trim(),
        tgl_masuk: tglMasuk,
        gaji_pokok: Number(gajiPokok) || 0,
        tunjangan_pokok: Number(tunjanganPokok) || 0,
        tunjangan_lain_lain: Number(tunjanganLainLain) || 0,
        ptkp,
        id_jabatan: idJabatan,
        nama_bank: namaBank,
        no_rekening: noRekening.trim(),
        status,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Ubah Karyawan: ${initialData?.nama_karyawan}` : 'Tambah Karyawan & Payroll'}
      subtitle="Biodata personel, penempatan cabang, struktur jabatan & remunerasi"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cabang & ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Penempatan Cabang <span className="text-rose-400">*</span>
            </label>
            <select
              required
              value={idCabang}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {cabangList.length === 0 ? (
                <option value="">Belum ada cabang terdaftar</option>
              ) : (
                cabangList.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.nama}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ID Karyawan (Sistem)
            </label>
            <input
              type="text"
              readOnly
              value={id}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-blue-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Format: [code cabang]-number</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tanggal Masuk / Bergabung
            </label>
            <input
              type="date"
              required
              value={tglMasuk}
              onChange={(e) => setTglMasuk(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Biodata Personel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Lengkap Karyawan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={namaKaryawan}
              onChange={(e) => setNamaKaryawan(e.target.value)}
              placeholder="Contoh: Bambang Soedirman, S.T."
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nomor WhatsApp (Aktif) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={noWa}
              onChange={(e) => setNoWa(e.target.value)}
              placeholder="081234567890"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Alamat Domisili Karyawan
          </label>
          <textarea
            rows={2}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Alamat lengkap sesuai KTP / domisili saat ini..."
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* Jabatan, PTKP, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Jabatan / Posisi <span className="text-rose-400">*</span>
            </label>
            <select
              required
              value={idJabatan}
              onChange={(e) => setIdJabatan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {jabatanList.length === 0 ? (
                <option value="">Belum ada jabatan (Isi di Modul Jabatan)</option>
              ) : (
                jabatanList.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nama} (Lv. {j.level})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kategori PTKP (Pajak PPh 21)
            </label>
            <select
              value={ptkp}
              onChange={(e) => setPtkp(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {PTKP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status Karyawan
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OperasionalStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="aktif">Aktif Bekerja</option>
              <option value="non-aktif">Non-Aktif (Resign/Mutasi)</option>
            </select>
          </div>
        </div>

        {/* Remunerasi & Gaji (Enterprise Payroll) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-900/30 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              Struktur Remunerasi & Gaji Bulanan
            </span>
            <div className="text-xs font-mono text-slate-300">
              Total Bruto: <strong className="text-emerald-400">Rp {totalTakeHomePay.toLocaleString('id-ID')}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Gaji Pokok (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={gajiPokok}
                onChange={(e) => setGajiPokok(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Tunjangan Pokok (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={tunjanganPokok}
                onChange={(e) => setTunjanganPokok(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Tunjangan Lain-lain (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={tunjanganLainLain}
                onChange={(e) => setTunjanganLainLain(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Rekening Bank Payroll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Nama Bank Penyalur Payroll
              </label>
              <select
                value={namaBank}
                onChange={(e) => setNamaBank(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                {BANK_OPTIONS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Nomor Rekening Bank
              </label>
              <input
                type="text"
                value={noRekening}
                onChange={(e) => setNoRekening(e.target.value)}
                placeholder="Contoh: 8820192831"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={cabangList.length === 0 || jabatanList.length === 0}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isEditing ? 'Simpan Perubahan' : 'Daftarkan Karyawan'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
