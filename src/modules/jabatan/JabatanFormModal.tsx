import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.tsx';
import { Jabatan, OperasionalStatus } from '../../types/erp.ts';
import { useErp } from '../../context/ErpContext.tsx';
import { generateJabatanId } from '../../utils/idGenerator.ts';

interface JabatanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Jabatan | null;
}

export const JabatanFormModal: React.FC<JabatanFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { jabatanList, addJabatan, updateJabatan } = useErp();

  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [level, setLevel] = useState<number>(3);
  const [deskripsi, setDeskripsi] = useState('');
  const [status, setStatus] = useState<OperasionalStatus>('aktif');

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setNama(initialData.nama);
      setLevel(initialData.level);
      setDeskripsi(initialData.deskripsi || '');
      setStatus(initialData.status);
    } else {
      const existingIds = jabatanList.map((j) => j.id);
      setId(generateJabatanId(existingIds));
      setNama('');
      setLevel(3);
      setDeskripsi('');
      setStatus('aktif');
    }
  }, [initialData, isOpen, jabatanList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    if (isEditing && initialData) {
      updateJabatan(initialData.id, {
        nama: nama.trim(),
        level: Number(level),
        deskripsi: deskripsi.trim(),
        status,
      });
    } else {
      addJabatan({
        id,
        nama: nama.trim(),
        level: Number(level),
        deskripsi: deskripsi.trim(),
        status,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Ubah Jabatan: ${initialData?.nama}` : 'Tambah Jabatan Baru'}
      subtitle="Struktur jenjang karier dan organisasi manufaktur"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ID Jabatan
            </label>
            <input
              type="text"
              readOnly
              value={id}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-blue-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Jabatan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Plant Manager, Kepala Gudang, Operator Bubut"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Level Hierarki Organisasi
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value={1}>Tingkat 1 - Direksi (BOD)</option>
              <option value={2}>Tingkat 2 - General Manager / VP</option>
              <option value={3}>Tingkat 3 - Manager Departemen</option>
              <option value={4}>Tingkat 4 - Supervisor / Lead</option>
              <option value={5}>Tingkat 5 - Staff / Operator Teknis</option>
            </select>
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
              <option value="aktif">Aktif</option>
              <option value="non-aktif">Non-Aktif</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Deskripsi Tugas & Tanggung Jawab
          </label>
          <textarea
            rows={3}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsi ringkas tanggung jawab posisi..."
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
          />
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
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
          >
            {isEditing ? 'Simpan Perubahan' : 'Tambahkan Jabatan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
