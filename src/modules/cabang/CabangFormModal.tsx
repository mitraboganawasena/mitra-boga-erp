import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.tsx';
import { Cabang, CabangType, OperasionalStatus } from '../../types/erp.ts';
import { useErp } from '../../context/ErpContext.tsx';
import { generateCabangId } from '../../utils/idGenerator.ts';
import { MapPin, ExternalLink, Building } from 'lucide-react';

interface CabangFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Cabang | null;
}

export const CabangFormModal: React.FC<CabangFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { cabangList, perusahaanList, addCabang, updateCabang } = useErp();

  const [idPerusahaan, setIdPerusahaan] = useState('');
  const [code, setCode] = useState('');
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [type, setType] = useState<CabangType>('Cabang');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [urlGmaps, setUrlGmaps] = useState('');
  const [status, setStatus] = useState<OperasionalStatus>('aktif');

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setIdPerusahaan(initialData.id_perusahaan);
      setCode(initialData.code);
      setNama(initialData.nama);
      setType(initialData.type);
      setAlamat(initialData.alamat || '');
      setTelepon(initialData.telepon || '');
      setUrlGmaps(initialData.url_gmaps || '');
      setStatus(initialData.status);
    } else {
      const defaultCompany = perusahaanList[0]?.id || '';
      setIdPerusahaan(defaultCompany);
      setCode('PST');
      const existingIds = cabangList.map((c) => c.id);
      setId(generateCabangId('PST', existingIds));
      setNama('');
      setType('Pusat');
      setAlamat('');
      setTelepon('');
      setUrlGmaps('');
      setStatus('aktif');
    }
  }, [initialData, isOpen, cabangList, perusahaanList]);

  // Recalculate ID when code changes in add mode
  const handleCodeChange = (newCode: string) => {
    const clean = newCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(clean);
    if (!isEditing) {
      const existingIds = cabangList.map((c) => c.id);
      setId(generateCabangId(clean || 'CAB', existingIds));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !nama.trim() || !idPerusahaan) return;

    if (isEditing && initialData) {
      updateCabang(initialData.id, {
        id_perusahaan: idPerusahaan,
        code: code.trim(),
        nama: nama.trim(),
        type,
        alamat: alamat.trim(),
        telepon: telepon.trim(),
        url_gmaps: urlGmaps.trim(),
        status,
      });
    } else {
      addCabang({
        id,
        id_perusahaan: idPerusahaan,
        code: code.trim(),
        nama: nama.trim(),
        type,
        alamat: alamat.trim(),
        telepon: telepon.trim(),
        url_gmaps: urlGmaps.trim(),
        status,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Ubah Data Cabang: ${initialData?.nama}` : 'Tambah Cabang / Pabrik Baru'}
      subtitle="Unit kerja, kantor pusat, pabrik manufaktur, atau gudang distribusi multi-wilayah"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Parent Company selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Induk Perusahaan <span className="text-rose-400">*</span>
          </label>
          <select
            required
            value={idPerusahaan}
            onChange={(e) => setIdPerusahaan(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            {perusahaanList.length === 0 ? (
              <option value="">Belum ada perusahaan terdaftar (Mohon buat di Modul Perusahaan)</option>
            ) : (
              perusahaanList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.id})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kode Cabang <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="PST, CKG, SBY"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono font-semibold uppercase text-blue-300 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Maks. 10 huruf</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ID Cabang (Sistem)
            </label>
            <input
              type="text"
              readOnly
              value={id}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-blue-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Format: [code]-number</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tipe Lokasi
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CabangType)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Pusat">Pusat (Headquarter / Main Plant)</option>
              <option value="Cabang">Cabang (Branch / Warehouse / Depo)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Cabang / Plant <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Pabrik Cikarang Utama"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Telepon Cabang
            </label>
            <input
              type="text"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="021-8980001"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Alamat Lengkap Cabang
          </label>
          <textarea
            rows={2}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Kawasan Industri GIIC Blok AA No. 1, Cikarang Pusat..."
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL Google Maps Lokasi
            </label>
            <div className="relative">
              <input
                type="url"
                value={urlGmaps}
                onChange={(e) => setUrlGmaps(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full pl-3 pr-8 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              {urlGmaps && (
                <a
                  href={urlGmaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300"
                  title="Uji Tautan Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <span className="text-[10px] text-slate-500">Tautan pin lokasi pabrik / kantor di Google Maps</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status Operasional
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OperasionalStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="aktif">Aktif (Operasional)</option>
              <option value="non-aktif">Non-Aktif (Tutup)</option>
            </select>
          </div>
        </div>

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
            disabled={perusahaanList.length === 0}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
          >
            {isEditing ? 'Simpan Perubahan' : 'Tambahkan Cabang'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
