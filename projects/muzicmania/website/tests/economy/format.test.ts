import { describe, expect, it } from 'vitest';
import { calculateAge, formatMzP, isAdultBirthDate, packageTotal } from '../../src/lib/economy/format';

describe('economy format', () => {
  it('formats MuziPoints with Spanish separators', () => {
    expect(formatMzP(16000)).toBe('16.000 MZP');
  });

  it('calculates age across birthdays', () => {
    expect(calculateAge('2000-11-05', new Date('2026-11-04T12:00:00Z'))).toBe(25);
    expect(calculateAge('2008-11-04', new Date('2026-11-04T12:00:00Z'))).toBe(18);
    expect(isAdultBirthDate('2008-11-05', new Date('2026-11-04T12:00:00Z'))).toBe(false);
  });

  it('adds package bonus', () => {
    expect(packageTotal(600, 30)).toBe(630);
  });
});
