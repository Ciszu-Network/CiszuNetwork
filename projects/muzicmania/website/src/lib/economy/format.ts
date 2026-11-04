export function formatMzP(value: number): string {
  return `${Math.max(0, Math.trunc(value)).toLocaleString('es-VE')} MZP`;
}

export function calculateAge(birthDate: string, today = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return 0;
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const month = today.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && today.getUTCDate() < birth.getUTCDate())) age -= 1;
  return Math.max(0, age);
}

export function isAdultBirthDate(birthDate: string, today = new Date()): boolean {
  return calculateAge(birthDate, today) >= 18;
}

export function packageTotal(pointsBase: number, bonus: number): number {
  return Math.max(0, Math.trunc(pointsBase)) + Math.max(0, Math.trunc(bonus));
}
