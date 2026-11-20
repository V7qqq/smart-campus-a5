// A5 Task 7 regression tests.
// M1 (R1): start/end must be whole minutes. NaN, decimals, Infinity and strings are Unavailable.
import { describe, it, expect } from 'vitest';
import { canBook, getBookingViolations } from './booking';
import { checkAvailability } from './lib/bookingLogic';
import { sampleRooms, sampleBookings } from './data/rooms';

const base = { now: 480, blocked: false, bookings: [{ start: 540, end: 600 }] };

describe('M1: whole minutes only (AC1)', () => {
  const bad: Array<[string, unknown, unknown]> = [
    ['NaN start', NaN, 660],
    ['NaN end', 600, NaN],
    ['NaN both', NaN, NaN],
    ['decimal start 600.5', 600.5, 660],
    ['Infinity end', 600, Infinity],
    ['string start "600"', '600', 660],
  ];
  for (const [name, start, end] of bad) {
    it(`${name} is unavailable`, () => {
      const args = { ...base, start: start as number, end: end as number };
      expect(canBook(args)).toBe(false);
      expect(getBookingViolations(args).map((v) => v.rule)).toContain('not-whole-minutes');
    });
  }

  it('valid whole minutes still available (no change for normal input)', () => {
    expect(canBook({ ...base, start: 600, end: 660 })).toBe(true);
    expect(canBook({ ...base, start: 720, end: 840 })).toBe(true); // exactly 120
  });

  it('checkAvailability gives Unavailable with interval reason and does not change data', () => {
    const before = JSON.stringify({ sampleRooms, sampleBookings });
    const result = checkAvailability('r2', NaN, 780, 480, sampleRooms, sampleBookings);
    expect(result.decision).toBe('unavailable');
    expect(result.reasons).toEqual(['Interval must satisfy 0 ≤ start < end ≤ 1440 minutes (00:00–24:00).']);
    expect(JSON.stringify({ sampleRooms, sampleBookings })).toBe(before);
  });
});
