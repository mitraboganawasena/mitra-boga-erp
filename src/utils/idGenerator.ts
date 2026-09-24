/**
 * Sequential Enterprise ID Generator
 * Implements exact ID formats requested:
 * - Perusahaan: PER-number (e.g. PER-0001)
 * - Cabang: [code]-number (e.g. PST-001)
 * - Role: ROLE-number (e.g. ROLE-001)
 * - Jabatan: JAB-number (e.g. JAB-001)
 * - Karyawan: [code cabang]-number (e.g. PST-0001)
 * - User: USER-number (e.g. USER-0001)
 */

export function generateNextId(prefix: string, existingIds: string[], padLength: number = 4): string {
  let highestNum = 0;
  const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i');

  for (const id of existingIds) {
    const match = id.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highestNum) {
        highestNum = num;
      }
    }
  }

  const nextNum = highestNum + 1;
  return `${prefix}-${String(nextNum).padStart(padLength, '0')}`;
}

export function generatePerusahaanId(existingIds: string[]): string {
  return generateNextId('PER', existingIds, 4);
}

export function generateCabangId(branchCode: string, existingIds: string[]): string {
  const code = (branchCode || 'CAB').trim().toUpperCase();
  return generateNextId(code, existingIds, 3);
}

export function generateRoleId(existingIds: string[]): string {
  return generateNextId('ROLE', existingIds, 3);
}

export function generateJabatanId(existingIds: string[]): string {
  return generateNextId('JAB', existingIds, 3);
}

export function generateKaryawanId(branchCode: string, existingIds: string[]): string {
  const code = (branchCode || 'EMP').trim().toUpperCase();
  return generateNextId(code, existingIds, 4);
}

export function generateUserId(existingIds: string[]): string {
  return generateNextId('USER', existingIds, 4);
}
