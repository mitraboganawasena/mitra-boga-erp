/**
 * TypeScript Data Definitions for Enterprise ERP + CRM Manufaktur
 * Strict alignment with MySQL Schema: aois5856_mitraniaga01
 */

export type ValuasiMetode = 'Average' | 'FIFO';
export type OperasionalStatus = 'aktif' | 'non-aktif';
export type CabangType = 'Pusat' | 'Cabang';
export type AksesSemuaCabang = 'ya' | 'tidak';

export interface ActionPermission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export type ModuleKey = 
  | 'perusahaan' 
  | 'cabang' 
  | 'role' 
  | 'jabatan' 
  | 'karyawan' 
  | 'user';

export interface RolePermissions {
  superadmin?: boolean;
  modules: Record<ModuleKey, ActionPermission>;
}

export interface Perusahaan {
  id: string; // format: PER-0001
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  npwp: string;
  logo_base64: string; // Base64 data string
  metode_valuasi: ValuasiMetode;
  operasional_status: OperasionalStatus;
  created_at: string;
  updated_at: string;
}

export interface Cabang {
  id: string; // format: [code]-001 (e.g. PST-001)
  id_perusahaan: string;
  code: string;
  nama: string;
  type: CabangType;
  alamat: string;
  telepon: string;
  url_gmaps: string;
  status: OperasionalStatus;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string; // format: ROLE-SUPERADMIN, ROLE-001
  nama: string;
  permission: RolePermissions;
  created_at: string;
  updated_at: string;
}

export interface Jabatan {
  id: string; // format: JAB-001
  nama: string;
  level: number; // 1: Direksi, 2: GM, 3: Manager, 4: Supervisor, 5: Staff
  deskripsi: string;
  status: OperasionalStatus;
  created_at: string;
  updated_at: string;
}

export interface Karyawan {
  id: string; // format: [code cabang]-0001 (e.g. PST-0001)
  id_cabang: string;
  nama_karyawan: string;
  alamat: string;
  no_wa: string;
  tgl_masuk: string;
  gaji_pokok: number;
  tunjangan_pokok: number;
  tunjangan_lain_lain: number;
  ptkp: string; // e.g. TK/0, TK/1, K/0, K/1, K/2, K/3
  id_jabatan: string;
  nama_bank: string;
  no_rekening: string;
  status: OperasionalStatus;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string; // format: USER-0001
  username: string;
  password_hash: string;
  id_role: string;
  id_cabang: string | null;
  akses_semua_cabang: AksesSemuaCabang;
  id_karyawan: string | null;
  status: OperasionalStatus;
  created_at: string;
  updated_at: string;
}

export interface CurrentUserSession {
  user: User;
  role: Role;
  cabang?: Cabang;
  karyawan?: Karyawan;
}
