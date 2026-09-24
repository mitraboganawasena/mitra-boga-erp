-- =============================================================================
-- INTI SEED AWAL SISTEM (BUKAN DUMMY DATA)
-- Hanya mendaftarkan entitas dasar & kredensial Superadmin yang diminta
-- Username : superadmin
-- Password : admin123 (Terenkripsi Bcrypt Salted)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Inisialisasi Sequence Generator
INSERT INTO `app_sequence` (`sequence_key`, `current_val`, `prefix`, `pad_length`)
VALUES 
  ('PER', 1, 'PER', 4),
  ('USER', 1, 'USER', 4)
ON DUPLICATE KEY UPDATE `sequence_key` = `sequence_key`;

-- 2. Inisialisasi Role Superadmin
INSERT INTO `role` (`id`, `nama`, `permission`, `created_at`, `updated_at`)
VALUES (
  'ROLE-SUPERADMIN',
  'Superadmin',
  JSON_OBJECT(
    'superadmin', true,
    'full_access', true,
    'modules', JSON_ARRAY(
      'perusahaan',
      'cabang',
      'role',
      'user',
      'karyawan',
      'jabatan',
      'inventory',
      'manufacturing',
      'sales_crm',
      'purchasing',
      'finance',
      'payroll',
      'audit_log'
    ),
    'actions', JSON_ARRAY('create', 'read', 'update', 'delete', 'approve', 'export', 'import')
  ),
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE 
  `nama` = VALUES(`nama`),
  `permission` = VALUES(`permission`);

-- 3. Inisialisasi Akun Superadmin
-- Password hash untuk 'admin123' terverifikasi via bcrypt standard (cost 10)
INSERT INTO `user` (
  `id`,
  `username`,
  `password_hash`,
  `id_role`,
  `id_cabang`,
  `akses_semua_cabang`,
  `id_karyawan`,
  `status`,
  `created_at`,
  `updated_at`
) VALUES (
  'USER-0001',
  'superadmin',
  '$2b$10$siwX4reahkTurZkat7iM8OppYqf.rgtggJrmqQyIuuyFV6ewD/xDC',
  'ROLE-SUPERADMIN',
  NULL,
  'ya',
  NULL,
  'aktif',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `password_hash` = VALUES(`password_hash`),
  `id_role` = VALUES(`id_role`),
  `akses_semua_cabang` = 'ya',
  `status` = 'aktif';

SET FOREIGN_KEY_CHECKS = 1;
