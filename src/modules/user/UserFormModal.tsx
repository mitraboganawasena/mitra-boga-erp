import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.tsx';
import { User, AksesSemuaCabang, OperasionalStatus } from '../../types/erp.ts';
import { useErp } from '../../context/ErpContext.tsx';
import { generateUserId } from '../../utils/idGenerator.ts';
import { UserCheck, Lock, Shield, Eye, EyeOff } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { userList, roleList, cabangList, karyawanList, addUser, updateUser } = useErp();

  const [id, setId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [idRole, setIdRole] = useState('');
  const [idCabang, setIdCabang] = useState<string>('');
  const [aksesSemuaCabang, setAksesSemuaCabang] = useState<AksesSemuaCabang>('tidak');
  const [idKaryawan, setIdKaryawan] = useState<string>('');
  const [status, setStatus] = useState<OperasionalStatus>('aktif');
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditing = Boolean(initialData);
  const isSuperadminUser = initialData?.id === 'USER-0001';

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setUsername(initialData.username);
      setPassword(''); // keep blank unless changing
      setIdRole(initialData.id_role);
      setIdCabang(initialData.id_cabang || '');
      setAksesSemuaCabang(initialData.akses_semua_cabang);
      setIdKaryawan(initialData.id_karyawan || '');
      setStatus(initialData.status);
    } else {
      const existingIds = userList.map((u) => u.id);
      setId(generateUserId(existingIds));
      setUsername('');
      setPassword('');
      setIdRole(roleList[0]?.id || 'ROLE-SUPERADMIN');
      setIdCabang(cabangList[0]?.id || '');
      setAksesSemuaCabang('tidak');
      setIdKaryawan(karyawanList[0]?.id || '');
      setStatus('aktif');
    }
    setValidationError(null);
  }, [initialData, isOpen, userList, roleList, cabangList, karyawanList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username.trim()) {
      setValidationError('Username wajib diisi.');
      return;
    }

    if (!isEditing && !password.trim()) {
      setValidationError('Password baru wajib diisi untuk pengguna baru.');
      return;
    }

    // Check duplicate username
    const duplicate = userList.some(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.id !== id
    );
    if (duplicate) {
      setValidationError('Username sudah terdaftar. Gunakan username lain.');
      return;
    }

    if (isEditing && initialData) {
      updateUser(
        initialData.id,
        {
          username: username.trim(),
          id_role: idRole,
          id_cabang: aksesSemuaCabang === 'ya' ? null : (idCabang || null),
          akses_semua_cabang: aksesSemuaCabang,
          id_karyawan: idKaryawan || null,
          status,
        },
        password.trim() ? password.trim() : undefined
      );
    } else {
      addUser(
        {
          id,
          username: username.trim(),
          password_hash: '', // will be hashed in addUser
          id_role: idRole,
          id_cabang: aksesSemuaCabang === 'ya' ? null : (idCabang || null),
          akses_semua_cabang: aksesSemuaCabang,
          id_karyawan: idKaryawan || null,
          status,
        },
        password.trim()
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Ubah Akun User: ${initialData?.username}` : 'Tambah User ERP Baru'}
      subtitle="Kredensial login, penetapan role, dan wewenang data multi-cabang"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ID User
            </label>
            <input
              type="text"
              readOnly
              value={id}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-blue-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Format: USER-number</span>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSuperadminUser}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: agus.manager, siti.finance..."
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {isEditing ? 'Ubah Password (Kosongkan jika tidak diganti)' : 'Password Akun *'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? 'Masukkan password baru...' : 'Password minimal 6 karakter...'}
              className="w-full pl-9 pr-10 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Sistem secara otomatis meng-enkripsi password menggunakan algoritma Bcrypt 10 rounds saat disimpan ke database.
          </p>
        </div>

        {/* Role & Karyawan link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Role Akses Pengguna <span className="text-rose-400">*</span>
            </label>
            <select
              required
              disabled={isSuperadminUser}
              value={idRole}
              onChange={(e) => setIdRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none disabled:opacity-60"
            >
              {roleList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama} ({r.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tautkan ke Data Karyawan
            </label>
            <select
              value={idKaryawan}
              onChange={(e) => setIdKaryawan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Tanpa Tautan Karyawan (Akun Sistem) --</option>
              {karyawanList.map((k) => (
                <option key={k.id} value={k.id}>
                  [{k.id}] {k.nama_karyawan}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Multi-Branch access control */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-blue-900/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Wewenang Jangkauan Cabang</span>
            <span className="text-[10px] font-mono text-blue-400">Data Isolation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Akses Semua Cabang?
              </label>
              <select
                value={aksesSemuaCabang}
                onChange={(e) => setAksesSemuaCabang(e.target.value as AksesSemuaCabang)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="tidak">Tidak (Dibatasi Cabang Homebase)</option>
                <option value="ya">Ya (Dapat Mengakses Seluruh Cabang)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Cabang Homebase
              </label>
              <select
                disabled={aksesSemuaCabang === 'ya'}
                value={idCabang}
                onChange={(e) => setIdCabang(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none disabled:opacity-40"
              >
                <option value="">-- Pilih Cabang --</option>
                {cabangList.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Status Akun
          </label>
          <select
            disabled={isSuperadminUser}
            value={status}
            onChange={(e) => setStatus(e.target.value as OperasionalStatus)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-blue-500 focus:outline-none disabled:opacity-60"
          >
            <option value="aktif">Aktif (Dapat Login ke Sistem)</option>
            <option value="non-aktif">Non-Aktif (Diblokir)</option>
          </select>
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
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isEditing ? 'Simpan Akun' : 'Daftarkan User'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
