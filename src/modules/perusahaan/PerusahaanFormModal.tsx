import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.tsx';
import { Perusahaan, ValuasiMetode, OperasionalStatus } from '../../types/erp.ts';
import { useErp } from '../../context/ErpContext.tsx';
import { generatePerusahaanId } from '../../utils/idGenerator.ts';
import { Upload, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';

interface PerusahaanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Perusahaan | null;
}

export const PerusahaanFormModal: React.FC<PerusahaanFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { perusahaanList, addPerusahaan, updatePerusahaan } = useErp();

  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [npwp, setNpwp] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [metodeValuasi, setMetodeValuasi] = useState<ValuasiMetode>('FIFO');
  const [operasionalStatus, setOperasionalStatus] = useState<OperasionalStatus>('aktif');
  const [logoError, setLogoError] = useState<string | null>(null);

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setNama(initialData.nama);
      setEmail(initialData.email || '');
      setTelepon(initialData.telepon || '');
      setAlamat(initialData.alamat || '');
      setNpwp(initialData.npwp || '');
      setLogoBase64(initialData.logo_base64 || '');
      setMetodeValuasi(initialData.metode_valuasi || 'FIFO');
      setOperasionalStatus(initialData.operasional_status || 'aktif');
    } else {
      const existingIds = perusahaanList.map((p) => p.id);
      setId(generatePerusahaanId(existingIds));
      setNama('');
      setEmail('');
      setTelepon('');
      setAlamat('');
      setNpwp('');
      setLogoBase64('');
      setMetodeValuasi('FIFO');
      setOperasionalStatus('aktif');
    }
    setLogoError(null);
  }, [initialData, isOpen, perusahaanList]);

  // Handle Logo file upload and convert to base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('File harus berupa format gambar (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Ukuran gambar maksimal 2 MB agar database tetap ringan.');
      return;
    }

    setLogoError(null);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setLogoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoBase64('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    if (isEditing && initialData) {
      updatePerusahaan(initialData.id, {
        nama: nama.trim(),
        email: email.trim(),
        telepon: telepon.trim(),
        alamat: alamat.trim(),
        npwp: npwp.trim(),
        logo_base64: logoBase64,
        metode_valuasi: metodeValuasi,
        operasional_status: operasionalStatus,
      });
    } else {
      addPerusahaan({
        id,
        nama: nama.trim(),
        email: email.trim(),
        telepon: telepon.trim(),
        alamat: alamat.trim(),
        npwp: npwp.trim(),
        logo_base64: logoBase64,
        metode_valuasi: metodeValuasi,
        operasional_status: operasionalStatus,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Ubah Data Perusahaan: ${initialData?.nama}` : 'Tambah Perusahaan Baru'}
      subtitle="Data identitas legalitas, metode valuasi inventory, dan logo resmi perusahaan"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ID Perusahaan
            </label>
            <input
              type="text"
              readOnly
              value={id}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-blue-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Format sistem: PER-number</span>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Lengkap Perusahaan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: PT Mitra Niaga Nusantara Tbk"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Logo Upload Section - connects directly to Login page */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-blue-900/30">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-white">Logo Resmi Perusahaan (Base64)</span>
              <p className="text-[11px] text-blue-300/80">
                Logo ini akan otomatis tampil pada Halaman Login & Header Aplikasi ERP
              </p>
            </div>
            {logoBase64 && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Logo
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-3">
            {/* Logo Preview */}
            <div className="w-24 h-24 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2 overflow-hidden shrink-0">
              {logoBase64 ? (
                <img
                  src={logoBase64}
                  alt="Preview Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  <span className="text-[10px]">Belum Ada Logo</span>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1 w-full">
              <label className="flex flex-col items-center justify-center px-4 py-3 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition">
                <Upload className="w-5 h-5 text-blue-400 mb-1" />
                <span className="text-xs text-slate-300 font-medium">
                  {logoBase64 ? 'Ganti File Gambar Logo' : 'Pilih File Gambar Logo (PNG / JPG / SVG)'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Maksimal 2 MB &bull; Disimpan langsung dalam format string Base64 di database
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {logoError && <p className="text-xs text-rose-400 mt-1">{logoError}</p>}
            </div>
          </div>
        </div>

        {/* Contact & Legal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Resmi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="corporate@mitraniaga.com"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Telepon Perusahaan
            </label>
            <input
              type="text"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="021-5558900"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              NPWP (Nomor Pokok Wajib Pajak)
            </label>
            <input
              type="text"
              value={npwp}
              onChange={(e) => setNpwp(e.target.value)}
              placeholder="01.234.567.8-901.000"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Alamat Kantor Pusat / Pabrik
          </label>
          <textarea
            rows={2}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Jalan Industri Mitra Raya No. 88, Kawasan Industri Modern..."
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* Valuation & Operasional Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Metode Valuasi Persediaan (Inventory Valuation)
            </label>
            <select
              value={metodeValuasi}
              onChange={(e) => setMetodeValuasi(e.target.value as ValuasiMetode)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Average">Average (Rata-rata Tertimbang)</option>
              <option value="FIFO">FIFO (First In First Out)</option>
            </select>
            <span className="text-[10px] text-slate-500">
              Menentukan metode perhitungan HPP manufaktur
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status Operasional Perusahaan
            </label>
            <select
              value={operasionalStatus}
              onChange={(e) => setOperasionalStatus(e.target.value as OperasionalStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="aktif">Aktif (Operasional Berjalan)</option>
              <option value="non-aktif">Non-Aktif (Suspended / Tutup Buku)</option>
            </select>
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
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEditing ? 'Simpan Perubahan' : 'Daftarkan Perusahaan'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
