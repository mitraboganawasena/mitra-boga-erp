/**
 * Enterprise ERP Data & Auth Context
 * Persistent repository across all modules with strict RBAC permission checking
 * NO DUMMY DATA - Only system root Superadmin initialized
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { 
  Perusahaan, 
  Cabang, 
  Role, 
  Jabatan, 
  Karyawan, 
  User, 
  CurrentUserSession, 
  ModuleKey, 
  ActionPermission,
  RolePermissions
} from '../types/erp.ts';

const STORAGE_KEYS = {
  PERUSAHAAN: 'erp_perusahaan_v1',
  CABANG: 'erp_cabang_v1',
  ROLE: 'erp_role_v1',
  JABATAN: 'erp_jabatan_v1',
  KARYAWAN: 'erp_karyawan_v1',
  USER: 'erp_user_v1',
  SESSION: 'erp_auth_session_v1',
};

// Initial Root Superadmin Role
const INITIAL_SUPERADMIN_ROLE: Role = {
  id: 'ROLE-SUPERADMIN',
  nama: 'Superadmin',
  permission: {
    superadmin: true,
    modules: {
      perusahaan: { view: true, add: true, edit: true, delete: true },
      cabang: { view: true, add: true, edit: true, delete: true },
      role: { view: true, add: true, edit: true, delete: true },
      jabatan: { view: true, add: true, edit: true, delete: true },
      karyawan: { view: true, add: true, edit: true, delete: true },
      user: { view: true, add: true, edit: true, delete: true },
    },
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Initial Root Superadmin User (password: admin123)
const INITIAL_SUPERADMIN_USER: User = {
  id: 'USER-0001',
  username: 'superadmin',
  password_hash: '$2b$10$siwX4reahkTurZkat7iM8OppYqf.rgtggJrmqQyIuuyFV6ewD/xDC',
  id_role: 'ROLE-SUPERADMIN',
  id_cabang: null,
  akses_semua_cabang: 'ya',
  id_karyawan: null,
  status: 'aktif',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface ErpContextType {
  // State
  perusahaanList: Perusahaan[];
  cabangList: Cabang[];
  roleList: Role[];
  jabatanList: Jabatan[];
  karyawanList: Karyawan[];
  userList: User[];
  currentUser: CurrentUserSession | null;
  activeCompany: Perusahaan | null;

  // Auth
  login: (username: string, passwordPlain: string) => { success: boolean; message: string };
  logout: () => void;
  hasPermission: (module: ModuleKey, action: keyof ActionPermission) => boolean;

  // CRUD Perusahaan
  addPerusahaan: (data: Omit<Perusahaan, 'created_at' | 'updated_at'>) => void;
  updatePerusahaan: (id: string, data: Partial<Perusahaan>) => void;
  deletePerusahaan: (id: string) => { success: boolean; message?: string };

  // CRUD Cabang
  addCabang: (data: Omit<Cabang, 'created_at' | 'updated_at'>) => void;
  updateCabang: (id: string, data: Partial<Cabang>) => void;
  deleteCabang: (id: string) => { success: boolean; message?: string };

  // CRUD Role
  addRole: (data: Omit<Role, 'created_at' | 'updated_at'>) => void;
  updateRole: (id: string, data: Partial<Role>) => void;
  deleteRole: (id: string) => { success: boolean; message?: string };

  // CRUD Jabatan
  addJabatan: (data: Omit<Jabatan, 'created_at' | 'updated_at'>) => void;
  updateJabatan: (id: string, data: Partial<Jabatan>) => void;
  deleteJabatan: (id: string) => { success: boolean; message?: string };

  // CRUD Karyawan
  addKaryawan: (data: Omit<Karyawan, 'created_at' | 'updated_at'>) => void;
  updateKaryawan: (id: string, data: Partial<Karyawan>) => void;
  deleteKaryawan: (id: string) => { success: boolean; message?: string };

  // CRUD User
  addUser: (data: Omit<User, 'created_at' | 'updated_at'>, plainPassword?: string) => void;
  updateUser: (id: string, data: Partial<User>, plainPassword?: string) => void;
  deleteUser: (id: string) => { success: boolean; message?: string };

  // Helper
  hashPassword: (plain: string) => string;
}

const ErpContext = createContext<ErpContextType | null>(null);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to localStorage (${key}):`, err);
  }
}

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data lists - strictly NO dummy data!
  const [perusahaanList, setPerusahaanList] = useState<Perusahaan[]>(() =>
    loadFromStorage<Perusahaan[]>(STORAGE_KEYS.PERUSAHAAN, [])
  );

  const [cabangList, setCabangList] = useState<Cabang[]>(() =>
    loadFromStorage<Cabang[]>(STORAGE_KEYS.CABANG, [])
  );

  const [roleList, setRoleList] = useState<Role[]>(() =>
    loadFromStorage<Role[]>(STORAGE_KEYS.ROLE, [INITIAL_SUPERADMIN_ROLE])
  );

  const [jabatanList, setJabatanList] = useState<Jabatan[]>(() =>
    loadFromStorage<Jabatan[]>(STORAGE_KEYS.JABATAN, [])
  );

  const [karyawanList, setKaryawanList] = useState<Karyawan[]>(() =>
    loadFromStorage<Karyawan[]>(STORAGE_KEYS.KARYAWAN, [])
  );

  const [userList, setUserList] = useState<User[]>(() =>
    loadFromStorage<User[]>(STORAGE_KEYS.USER, [INITIAL_SUPERADMIN_USER])
  );

  const [currentUser, setCurrentUser] = useState<CurrentUserSession | null>(() =>
    loadFromStorage<CurrentUserSession | null>(STORAGE_KEYS.SESSION, null)
  );

  // Sync to localStorage
  useEffect(() => saveToStorage(STORAGE_KEYS.PERUSAHAAN, perusahaanList), [perusahaanList]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CABANG, cabangList), [cabangList]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ROLE, roleList), [roleList]);
  useEffect(() => saveToStorage(STORAGE_KEYS.JABATAN, jabatanList), [jabatanList]);
  useEffect(() => saveToStorage(STORAGE_KEYS.KARYAWAN, karyawanList), [karyawanList]);
  useEffect(() => saveToStorage(STORAGE_KEYS.USER, userList), [userList]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SESSION, currentUser), [currentUser]);

  // Primary active company (used for global branding & login logo)
  const activeCompany = perusahaanList.find((p) => p.operasional_status === 'aktif') || perusahaanList[0] || null;

  // Helper for password hashing
  const hashPassword = (plain: string): string => {
    return bcrypt.hashSync(plain, 10);
  };

  // Auth Login
  const login = (username: string, passwordPlain: string): { success: boolean; message: string } => {
    const user = userList.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Username tidak ditemukan di database.' };
    }

    if (user.status !== 'aktif') {
      return { success: false, message: 'Akun Anda sedang non-aktif. Hubungi Administrator.' };
    }

    // Verify bcrypt hash (or fallback plain for edge cases)
    const isMatch = bcrypt.compareSync(passwordPlain, user.password_hash) || user.password_hash === passwordPlain;
    if (!isMatch) {
      return { success: false, message: 'Password salah. Silakan coba kembali.' };
    }

    // Resolve Role
    const role = roleList.find((r) => r.id === user.id_role) || {
      id: user.id_role,
      nama: 'Custom Role',
      permission: {
        modules: {
          perusahaan: { view: false, add: false, edit: false, delete: false },
          cabang: { view: false, add: false, edit: false, delete: false },
          role: { view: false, add: false, edit: false, delete: false },
          jabatan: { view: false, add: false, edit: false, delete: false },
          karyawan: { view: false, add: false, edit: false, delete: false },
          user: { view: false, add: false, edit: false, delete: false },
        },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const cabang = user.id_cabang ? cabangList.find((c) => c.id === user.id_cabang) : undefined;
    const karyawan = user.id_karyawan ? karyawanList.find((k) => k.id === user.id_karyawan) : undefined;

    const session: CurrentUserSession = {
      user,
      role,
      cabang,
      karyawan,
    };

    setCurrentUser(session);
    return { success: true, message: 'Login berhasil.' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  };

  // Permission Checker
  const hasPermission = (module: ModuleKey, action: keyof ActionPermission): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;

    // Superadmin has absolute bypass
    if (role.id === 'ROLE-SUPERADMIN' || role.nama.toLowerCase() === 'superadmin' || role.permission.superadmin) {
      return true;
    }

    const modPerm = role.permission.modules?.[module];
    if (!modPerm) return false;

    return Boolean(modPerm[action]);
  };

  // CRUD Perusahaan
  const addPerusahaan = (data: Omit<Perusahaan, 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newRecord: Perusahaan = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    setPerusahaanList((prev) => [newRecord, ...prev]);
  };

  const updatePerusahaan = (id: string, data: Partial<Perusahaan>) => {
    const now = new Date().toISOString();
    setPerusahaanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updated_at: now } : item))
    );
  };

  const deletePerusahaan = (id: string): { success: boolean; message?: string } => {
    // Check if referenced by any cabang
    const isReferenced = cabangList.some((c) => c.id_perusahaan === id);
    if (isReferenced) {
      return {
        success: false,
        message: 'Tidak dapat menghapus Perusahaan karena masih memiliki Cabang yang terhubung.',
      };
    }
    setPerusahaanList((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  // CRUD Cabang
  const addCabang = (data: Omit<Cabang, 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newRecord: Cabang = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    setCabangList((prev) => [newRecord, ...prev]);
  };

  const updateCabang = (id: string, data: Partial<Cabang>) => {
    const now = new Date().toISOString();
    setCabangList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updated_at: now } : item))
    );
  };

  const deleteCabang = (id: string): { success: boolean; message?: string } => {
    const hasKaryawan = karyawanList.some((k) => k.id_cabang === id);
    if (hasKaryawan) {
      return {
        success: false,
        message: 'Tidak dapat menghapus Cabang karena masih terdapat Karyawan yang bertugas di cabang ini.',
      };
    }
    const hasUser = userList.some((u) => u.id_cabang === id);
    if (hasUser) {
      return {
        success: false,
        message: 'Tidak dapat menghapus Cabang karena masih terhubung ke akun User.',
      };
    }
    setCabangList((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  // CRUD Role
  const addRole = (data: Omit<Role, 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newRecord: Role = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    setRoleList((prev) => [...prev, newRecord]);
  };

  const updateRole = (id: string, data: Partial<Role>) => {
    const now = new Date().toISOString();
    setRoleList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updated_at: now } : item))
    );

    // If currently logged in user has this role, refresh session
    if (currentUser && currentUser.role.id === id) {
      setCurrentUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          role: { ...prev.role, ...data, updated_at: now },
        };
      });
    }
  };

  const deleteRole = (id: string): { success: boolean; message?: string } => {
    if (id === 'ROLE-SUPERADMIN') {
      return { success: false, message: 'Role Superadmin sistem tidak boleh dihapus demi keamanan.' };
    }
    const isUsed = userList.some((u) => u.id_role === id);
    if (isUsed) {
      return { success: false, message: 'Role tidak dapat dihapus karena masih digunakan oleh satu atau lebih User.' };
    }
    setRoleList((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  // CRUD Jabatan
  const addJabatan = (data: Omit<Jabatan, 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newRecord: Jabatan = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    setJabatanList((prev) => [...prev, newRecord]);
  };

  const updateJabatan = (id: string, data: Partial<Jabatan>) => {
    const now = new Date().toISOString();
    setJabatanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updated_at: now } : item))
    );
  };

  const deleteJabatan = (id: string): { success: boolean; message?: string } => {
    const isUsed = karyawanList.some((k) => k.id_jabatan === id);
    if (isUsed) {
      return {
        success: false,
        message: 'Tidak dapat menghapus Jabatan karena masih diemban oleh Karyawan aktif.',
      };
    }
    setJabatanList((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  // CRUD Karyawan
  const addKaryawan = (data: Omit<Karyawan, 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newRecord: Karyawan = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    setKaryawanList((prev) => [newRecord, ...prev]);
  };

  const updateKaryawan = (id: string, data: Partial<Karyawan>) => {
    const now = new Date().toISOString();
    setKaryawanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updated_at: now } : item))
    );
  };

  const deleteKaryawan = (id: string): { success: boolean; message?: string } => {
    const hasUser = userList.some((u) => u.id_karyawan === id);
    if (hasUser) {
      return {
        success: false,
        message: 'Tidak dapat menghapus data Karyawan karena memiliki akun User ERP aktif.',
      };
    }
    setKaryawanList((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  // CRUD User
  const addUser = (data: Omit<User, 'created_at' | 'updated_at'>, plainPassword?: string) => {
    const now = new Date().toISOString();
    const password_hash = plainPassword ? hashPassword(plainPassword) : data.password_hash;
    const newRecord: User = {
      ...data,
      password_hash,
      created_at: now,
      updated_at: now,
    };
    setUserList((prev) => [newRecord, ...prev]);
  };

  const updateUser = (id: string, data: Partial<User>, plainPassword?: string) => {
    const now = new Date().toISOString();
    const updatedData = { ...data, updated_at: now };
    if (plainPassword && plainPassword.trim()) {
      updatedData.password_hash = hashPassword(plainPassword.trim());
    }
    setUserList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );

    // If current logged-in user changed their own info
    if (currentUser && currentUser.user.id === id) {
      setCurrentUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          user: { ...prev.user, ...updatedData },
        };
      });
    }
  };

  const deleteUser = (id: string): { success: boolean; message?: string } => {
    if (id === 'USER-0001' || id === currentUser?.user.id) {
      return { success: false, message: 'Tidak diizinkan menghapus akun Superadmin atau akun Anda sendiri.' };
    }
    setUserList((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  return (
    <ErpContext.Provider
      value={{
        perusahaanList,
        cabangList,
        roleList,
        jabatanList,
        karyawanList,
        userList,
        currentUser,
        activeCompany,
        login,
        logout,
        hasPermission,
        addPerusahaan,
        updatePerusahaan,
        deletePerusahaan,
        addCabang,
        updateCabang,
        deleteCabang,
        addRole,
        updateRole,
        deleteRole,
        addJabatan,
        updateJabatan,
        deleteJabatan,
        addKaryawan,
        updateKaryawan,
        deleteKaryawan,
        addUser,
        updateUser,
        deleteUser,
        hashPassword,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = (): ErpContextType => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
