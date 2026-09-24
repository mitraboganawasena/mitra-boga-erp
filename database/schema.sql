-- =============================================================================
-- ERP & CRM ENTERPRISE MANUFAKTUR MULTI CABANG
-- Arsitektur Database: MySQL 8.x / MariaDB 10.x
-- Database Name: aois5856_mitraniaga01
-- Engine: InnoDB | Collation: utf8mb4_unicode_ci
-- Architect: Senior Enterprise Solution & Database Architect
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 0. TABEL RUNTIME SEQUENCE GENERATOR (Atomic ID Formatter)
-- Digunakan untuk menjamin thread-safety format penomoran:
-- - PER-0001, PER-0002...
-- - USER-0001, USER-0002...
-- - [KODE_CABANG]-0001 (misal: PST-0001, SBY-0001)...
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_sequence` (
  `sequence_key` VARCHAR(50) NOT NULL COMMENT 'Kunci sequence: PER, USER, atau kode cabang (PST, SBY, dll)',
  `current_val` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Nilai increment terakhir',
  `prefix` VARCHAR(20) NOT NULL COMMENT 'Prefix teks yang digunakan',
  `pad_length` INT NOT NULL DEFAULT 4 COMMENT 'Panjang angka zero-padding (misal 4 untuk 0001)',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sequence_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Generator Sequence ID Format Unik Enterprise';

-- -----------------------------------------------------------------------------
-- 1. TABEL PERUSAHAAN (Company / Holding Entity)
-- Format ID: PER-number (contoh: PER-0001)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `perusahaan` (
  `id` VARCHAR(30) NOT NULL COMMENT 'Format ID: PER-number (misal: PER-0001)',
  `nama` VARCHAR(255) NOT NULL COMMENT 'Nama resmi perseroan / badan usaha',
  `email` VARCHAR(150) DEFAULT NULL COMMENT 'Email resmi perusahaan',
  `telepon` VARCHAR(50) DEFAULT NULL COMMENT 'Nomor telepon kantor pusat',
  `alamat` TEXT DEFAULT NULL COMMENT 'Alamat domisili legal perusahaan',
  `npwp` VARCHAR(50) DEFAULT NULL COMMENT 'Nomor Pokok Wajib Pajak',
  `logo_base64` LONGTEXT DEFAULT NULL COMMENT 'Asset logo perusahaan dalam format Base64 data URI',
  `metode_valuasi` ENUM('Average', 'FIFO') NOT NULL DEFAULT 'Average' COMMENT 'Metode perhitungan valuasi persediaan manufaktur',
  `operasional_status` ENUM('aktif', 'non-aktif') NOT NULL DEFAULT 'aktif' COMMENT 'Status operasional badan usaha',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_perusahaan_status` (`operasional_status`),
  KEY `idx_perusahaan_nama` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Entitas Perusahaan / Holding Multi Cabang';

-- -----------------------------------------------------------------------------
-- 2. TABEL CABANG (Branch / Plant / Distribution Center)
-- Format ID: [code]-number (contoh: PST-001, SBY-001)
-- Terikat dengan entitas Perusahaan
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cabang` (
  `id` VARCHAR(30) NOT NULL COMMENT 'Format ID: [code]-number (misal: PST-001, SBY-001)',
  `id_perusahaan` VARCHAR(30) NOT NULL COMMENT 'Relasi ke entitas Perusahaan pemilik cabang',
  `code` VARCHAR(20) NOT NULL COMMENT 'Kode identitas unik cabang / pabrik (misal: PST, CKG, SBY)',
  `nama` VARCHAR(150) NOT NULL COMMENT 'Nama operasional cabang/pabrik (misal: Pabrik Cikarang)',
  `type` ENUM('Pusat', 'Cabang') NOT NULL DEFAULT 'Cabang' COMMENT 'Tipe entitas: Pusat (HQ/Main Plant) atau Cabang (Branch Plant/Depo)',
  `alamat` TEXT DEFAULT NULL COMMENT 'Alamat fisik lokasi pabrik/kantor cabang',
  `telepon` VARCHAR(50) DEFAULT NULL COMMENT 'Nomor telepon operasional cabang',
  `url_gmaps` TEXT DEFAULT NULL COMMENT 'Tautan titik lokasi Google Maps untuk integrasi logistik & visitasi CRM',
  `status` ENUM('aktif', 'non-aktif') NOT NULL DEFAULT 'aktif' COMMENT 'Status operasional cabang',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cabang_code` (`code`),
  KEY `idx_cabang_perusahaan` (`id_perusahaan`),
  KEY `idx_cabang_type` (`type`),
  KEY `idx_cabang_status` (`status`),
  CONSTRAINT `fk_cabang_perusahaan` FOREIGN KEY (`id_perusahaan`) REFERENCES `perusahaan` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master Cabang & Pabrik Manufaktur Multi Lokasi';

-- -----------------------------------------------------------------------------
-- 3. TABEL ROLE (RBAC Permission Matrix)
-- Menyimpan hak akses granular berbasis JSON (Modul Manufaktur, CRM, Inventory, dsb.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `role` (
  `id` VARCHAR(30) NOT NULL COMMENT 'Primary Key Role (misal: ROLE-SUPERADMIN, ROLE-001)',
  `nama` VARCHAR(100) NOT NULL COMMENT 'Nama role jabatan akses (misal: Superadmin, PPIC Manager, Production Lead)',
  `permission` JSON NOT NULL COMMENT 'Struktur hak akses RBAC modular dalam format JSON',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_nama` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master Role Hak Akses Modular RBAC Enterprise';

-- -----------------------------------------------------------------------------
-- 4. TABEL JABATAN (Master Hierarki Jabatan / Posisi)
-- Referensi wajib untuk relasi id_jabatan di Tabel Karyawan
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jabatan` (
  `id` VARCHAR(30) NOT NULL COMMENT 'Format: JAB-number (misal: JAB-001, DIR, MGR)',
  `nama` VARCHAR(100) NOT NULL COMMENT 'Nama jabatan/posisi struktural',
  `level` INT NOT NULL DEFAULT 1 COMMENT 'Tingkat level hierarki (1=Direksi, 2=General Manager, 3=Manager, 4=Supervisor, 5=Staff/Operator)',
  `deskripsi` VARCHAR(255) DEFAULT NULL COMMENT 'Uraian tugas pokok jabatan',
  `status` ENUM('aktif', 'non-aktif') NOT NULL DEFAULT 'aktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_jabatan_nama` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master Jabatan & Posisi Struktural SDM Manufaktur';

-- -----------------------------------------------------------------------------
-- 5. TABEL KARYAWAN (Employee Master & Payroll Parameters)
-- Format ID: [code cabang]-number (contoh: PST-0001, SBY-0001)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `karyawan` (
  `id` VARCHAR(30) NOT NULL COMMENT 'Format ID: [code cabang]-number (misal: PST-0001, SBY-0001)',
  `id_cabang` VARCHAR(30) NOT NULL COMMENT 'Cabang penempatan utama karyawan',
  `nama_karyawan` VARCHAR(150) NOT NULL COMMENT 'Nama lengkap karyawan sesuai identitas legal',
  `alamat` TEXT DEFAULT NULL COMMENT 'Alamat tempat tinggal karyawan',
  `no_wa` VARCHAR(30) DEFAULT NULL COMMENT 'Nomor WhatsApp aktif untuk koordinasi internal & CRM',
  `tgl_masuk` DATE NOT NULL COMMENT 'Tanggal mulai bekerja / masa orientasi',
  `gaji_pokok` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Besaran gaji pokok bulanan (IDR)',
  `tunjangan_pokok` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Besaran tunjangan tetap (IDR)',
  `tunjangan_lain_lain` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Besaran tunjangan tidak tetap / variabel (IDR)',
  `ptkp` VARCHAR(20) NOT NULL DEFAULT 'TK/0' COMMENT 'Kategori Penghasilan Tidak Kena Pajak (TK/0, TK/1, K/0, K/1, K/2, K/3)',
  `id_jabatan` VARCHAR(30) DEFAULT NULL COMMENT 'Relasi ke master jabatan/posisi',
  `nama_bank` VARCHAR(100) DEFAULT NULL COMMENT 'Nama institusi bank payroll karyawan',
  `no_rekening` VARCHAR(50) DEFAULT NULL COMMENT 'Nomor rekening transfer payroll',
  `status` ENUM('aktif', 'non-aktif') NOT NULL DEFAULT 'aktif' COMMENT 'Status kepegawaian',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_karyawan_cabang` (`id_cabang`),
  KEY `idx_karyawan_jabatan` (`id_jabatan`),
  KEY `idx_karyawan_status` (`status`),
  KEY `idx_karyawan_nama` (`nama_karyawan`),
  CONSTRAINT `fk_karyawan_cabang` FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_karyawan_jabatan` FOREIGN KEY (`id_jabatan`) REFERENCES `jabatan` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master Data Karyawan & Parameter Payroll Multi Cabang';

-- -----------------------------------------------------------------------------
-- 6. TABEL USER (System Authentication & User Authorization)
-- Format ID: USER-number (contoh: USER-0001)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id` VARCHAR(30) NOT NULL COMMENT 'Format ID: USER-number (misal: USER-0001)',
  `username` VARCHAR(50) NOT NULL COMMENT 'Username login sistem ERP',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Password terenkripsi (Standar Bcrypt salted)',
  `id_role` VARCHAR(30) NOT NULL COMMENT 'Hak akses / peran pengguna',
  `id_cabang` VARCHAR(30) DEFAULT NULL COMMENT 'Cabang homebase pengguna (NULL untuk superadmin / lintas cabang)',
  `akses_semua_cabang` ENUM('ya', 'tidak') NOT NULL DEFAULT 'tidak' COMMENT 'Flag otorisasi apakah dapat melihat/memproses data seluruh cabang',
  `id_karyawan` VARCHAR(30) DEFAULT NULL COMMENT 'Tautan 1-ke-1 dengan data karyawan jika user adalah karyawan internal',
  `status` ENUM('aktif', 'non-aktif') NOT NULL DEFAULT 'aktif' COMMENT 'Status akun pengguna',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_username` (`username`),
  UNIQUE KEY `uq_user_karyawan` (`id_karyawan`),
  KEY `idx_user_role` (`id_role`),
  KEY `idx_user_cabang` (`id_cabang`),
  KEY `idx_user_status` (`status`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`id_role`) REFERENCES `role` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_user_cabang` FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_user_karyawan` FOREIGN KEY (`id_karyawan`) REFERENCES `karyawan` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Akun Pengguna Sistem ERP & CRM Multi Cabang';

-- -----------------------------------------------------------------------------
-- 7. TABEL USER_CABANG (Selective Multi-Branch Access)
-- Tabel mapping jika seorang pengguna memiliki akses ke 2 atau lebih cabang tertentu,
-- tanpa harus membuka hak akses ke seluruh cabang (akses_semua_cabang = tidak).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_cabang` (
  `id_user` VARCHAR(30) NOT NULL,
  `id_cabang` VARCHAR(30) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`, `id_cabang`),
  KEY `idx_uc_cabang` (`id_cabang`),
  CONSTRAINT `fk_uc_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_uc_cabang` FOREIGN KEY (`id_cabang`) REFERENCES `cabang` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relasi Akses Selektif Multi Cabang per Pengguna';

SET FOREIGN_KEY_CHECKS = 1;
