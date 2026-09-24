import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.tsx';
import { Role, ModuleKey, ActionPermission } from '../../types/erp.ts';
import { useErp } from '../../context/ErpContext.tsx';
import { generateRoleId } from '../../utils/idGenerator.ts';
import { Shield, CheckSquare, Square, Check } from 'lucide-react';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Role | null;
}

const MODULE_DEFINITIONS: { key: ModuleKey; label: string; desc: string }[] = [
  { key: 'perusahaan', label: 'Perusahaan', desc: 'Profil induk, NPWP, valuasi & logo' },
  { key: 'cabang', label: 'Cabang & Lokasi', desc: 'Kantor pusat, pabrik & cabang gudang' },
  { key: 'role', label: 'Role & Hak Akses', desc: 'Pengaturan matriks wewenang modul' },
  { key: 'jabatan', label: 'Struktur Jabatan', desc: 'Tingkatan hierarki organisasi' },
  { key: 'karyawan', label: 'Karyawan & Payroll', desc: 'Biodata, no WA, bank & komponen gaji' },
  { key: 'user', label: 'User & Akun ERP', desc: 'Manajemen login & wewenang cabang' },
];

const DEFAULT_ACTIONS: ActionPermission = { view: false, add: false, edit: false, delete: false };

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { roleList, addRole, updateRole } = useErp();
  const [roleId, setRoleId] = useState('');
  const [nama, setNama] = useState('');
  const [permissions, setPermissions] = useState<Record<ModuleKey, ActionPermission>>({
    perusahaan: { ...DEFAULT_ACTIONS },
    cabang: { ...DEFAULT_ACTIONS },
    role: { ...DEFAULT_ACTIONS },
    jabatan: { ...DEFAULT_ACTIONS },
    karyawan: { ...DEFAULT_ACTIONS },
    user: { ...DEFAULT_ACTIONS },
  });

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setRoleId(initialData.id);
      setNama(initialData.nama);
      setPermissions({
        perusahaan: initialData.permission.modules.perusahaan || { ...DEFAULT_ACTIONS },
        cabang: initialData.permission.modules.cabang || { ...DEFAULT_ACTIONS },
        role: initialData.permission.modules.role || { ...DEFAULT_ACTIONS },
        jabatan: initialData.permission.modules.jabatan || { ...DEFAULT_ACTIONS },
        karyawan: initialData.permission.modules.karyawan || { ...DEFAULT_ACTIONS },
        user: initialData.permission.modules.user || { ...DEFAULT_ACTIONS },
      });
    } else {
      const existingIds = roleList.map((r) => r.id);
      setRoleId(generateRoleId(existingIds));
      setNama('');
      setPermissions({
        perusahaan: { ...DEFAULT_ACTIONS },
        cabang: { ...DEFAULT_ACTIONS },
        role: { ...DEFAULT_ACTIONS },
        jabatan: { ...DEFAULT_ACTIONS },
        karyawan: { ...DEFAULT_ACTIONS },
        user: { ...DEFAULT_ACTIONS },
      });
    }
  }, [initialData, isOpen, roleList]);

  const handleToggle = (moduleKey: ModuleKey, action: keyof ActionPermission) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [action]: !prev[moduleKey][action],
      },
    }));
  };

  const handleToggleRow = (moduleKey: ModuleKey) => {
    const current = permissions[moduleKey];
    const allChecked = current.view && current.add && current.edit && current.delete;
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        view: !allChecked,
        add: !allChecked,
        edit: !allChecked,
        delete: !allChecked,
      },
    }));
  };

  const handleToggleColumn = (action: keyof ActionPermission) => {
    const allChecked = MODULE_DEFINITIONS.every((m) => permissions[m.key][action]);
    setPermissions((prev) => {
      const next = { ...prev };
      MODULE_DEFINITIONS.forEach((m) => {
        next[m.key] = {
          ...next[m.key],
          [action]: !allChecked,
        };
      });
      return next;
    });
  };

  const handleCheckAll = (value: boolean) => {
    const next: Record<ModuleKey, ActionPermission> = {
      perusahaan: { view: value, add: value, edit: value, delete: value },
      cabang: { view: value, add: value, edit: value, delete: value },
      role: { view: value, add: value, edit: value, delete: value },
      jabatan: { view: value, add: value, edit: value, delete: value },
      karyawan: { view: value, add: value, edit: value, delete: value },
      user: { view: value, add: value, edit: value, delete: value },
    };
    setPermissions(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    if (isEditing && initialData) {
      updateRole(initialData.id, {
        nama: nama.trim(),
        permission: {
          superadmin: initialData.id === 'ROLE-SUPERADMIN',
          modules: permissions,
        },
      });
    } else {
      addRole({
        id: roleId,
        nama: nama.trim(),
        permission: {
          superadmin: false,
          modules: permissions,
        },
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Ubah Role: ${initialData?.nama}` : 'Tambah Role Akses Baru'}
      subtitle="Definisikan matriks izin akses (View, Add, Edit, Delete) secara presisi"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ID Role
            </label>
            <input
              type="text"
              readOnly
              value={roleId}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-blue-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Format sistem: ROLE-number</span>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Role <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Manager Operasional, Supervisor Produksi..."
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Permission Matrix Controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Matriks Hak Akses Modul
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleCheckAll(true)}
                className="px-2.5 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 hover:bg-blue-900 transition"
              >
                Pilih Semua
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCheckAll(false);
                  MODULE_DEFINITIONS.forEach((m) => {
                    setPermissions((prev) => ({
                      ...prev,
                      [m.key]: { view: true, add: false, edit: false, delete: false },
                    }));
                  });
                }}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Hanya View
              </button>
              <button
                type="button"
                onClick={() => handleCheckAll(false)}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-white transition"
              >
                Reset Kosong
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-semibold">
                  <th className="py-2.5 px-4 w-5/12">Modul Sistem</th>
                  <th className="py-2.5 px-3 text-center w-1/12">
                    <button
                      type="button"
                      onClick={() => handleToggleColumn('view')}
                      className="hover:text-blue-400 transition inline-flex items-center gap-1"
                      title="Klik untuk centang semua kolom View"
                    >
                      View
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-center w-1/12">
                    <button
                      type="button"
                      onClick={() => handleToggleColumn('add')}
                      className="hover:text-blue-400 transition inline-flex items-center gap-1"
                      title="Klik untuk centang semua kolom Add"
                    >
                      Add
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-center w-1/12">
                    <button
                      type="button"
                      onClick={() => handleToggleColumn('edit')}
                      className="hover:text-blue-400 transition inline-flex items-center gap-1"
                      title="Klik untuk centang semua kolom Edit"
                    >
                      Edit
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-center w-1/12">
                    <button
                      type="button"
                      onClick={() => handleToggleColumn('delete')}
                      className="hover:text-blue-400 transition inline-flex items-center gap-1"
                      title="Klik untuk centang semua kolom Delete"
                    >
                      Delete
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-center w-1/12">Baris</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {MODULE_DEFINITIONS.map((mod) => {
                  const perm = permissions[mod.key];
                  const allInRow = perm.view && perm.add && perm.edit && perm.delete;

                  return (
                    <tr key={mod.key} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{mod.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{mod.desc}</div>
                      </td>

                      {/* View Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(mod.key, 'view')}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition ${
                            perm.view
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-700 text-transparent hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </td>

                      {/* Add Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(mod.key, 'add')}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition ${
                            perm.add
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-900 border-slate-700 text-transparent hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </td>

                      {/* Edit Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(mod.key, 'edit')}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition ${
                            perm.edit
                              ? 'bg-amber-600 border-amber-500 text-white'
                              : 'bg-slate-900 border-slate-700 text-transparent hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </td>

                      {/* Delete Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(mod.key, 'delete')}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition ${
                            perm.delete
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-slate-900 border-slate-700 text-transparent hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </td>

                      {/* Quick row toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleRow(mod.key)}
                          className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800"
                        >
                          {allInRow ? 'Batal' : 'Semua'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
          >
            {isEditing ? 'Simpan Perubahan' : 'Tambahkan Role'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
