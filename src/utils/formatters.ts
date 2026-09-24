/**
 * Utility Formatters for Enterprise ERP
 */

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getJabatanLevelName(level: number): string {
  switch (level) {
    case 1:
      return 'Tingkat 1 - Direksi (Executive Board)';
    case 2:
      return 'Tingkat 2 - General Manager / VP';
    case 3:
      return 'Tingkat 3 - Manager Departemen';
    case 4:
      return 'Tingkat 4 - Supervisor / Team Lead';
    case 5:
      return 'Tingkat 5 - Staff / Operator Lapangan';
    default:
      return `Tingkat ${level}`;
  }
}

export const PTKP_OPTIONS = [
  { value: 'TK/0', label: 'TK/0 - Tidak Kawin, 0 Tanggungan (Rp 54.000.000)' },
  { value: 'TK/1', label: 'TK/1 - Tidak Kawin, 1 Tanggungan (Rp 58.500.000)' },
  { value: 'TK/2', label: 'TK/2 - Tidak Kawin, 2 Tanggungan (Rp 63.000.000)' },
  { value: 'TK/3', label: 'TK/3 - Tidak Kawin, 3 Tanggungan (Rp 67.500.000)' },
  { value: 'K/0', label: 'K/0 - Kawin, 0 Tanggungan (Rp 58.500.000)' },
  { value: 'K/1', label: 'K/1 - Kawin, 1 Tanggungan (Rp 63.000.000)' },
  { value: 'K/2', label: 'K/2 - Kawin, 2 Tanggungan (Rp 67.500.000)' },
  { value: 'K/3', label: 'K/3 - Kawin, 3 Tanggungan (Rp 72.000.000)' },
];

export const BANK_OPTIONS = [
  'BCA (Bank Central Asia)',
  'Bank Mandiri',
  'BNI (Bank Negara Indonesia)',
  'BRI (Bank Rakyat Indonesia)',
  'Bank Danamon',
  'CIMB Niaga',
  'BSI (Bank Syariah Indonesia)',
  'Permata Bank',
  'Bank OCBC NISP',
  'Bank Mega',
];
