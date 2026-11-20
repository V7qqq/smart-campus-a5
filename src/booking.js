// Core booking rules. Pure functions: never mutate `bookings`.
// All times are minutes after midnight.
//
// Rules:
//   AC1 — interval validity: reject if start or end is not a whole number,
//         start < 0, end > 1440, start >= end, or start <= now.
//   AC2 — duration cap: reject if end - start > 120.
//   AC3 — blocked: reject if blocked is true.
//   AC4 — overlap: reject if any booking overlaps (start < b.end && end > b.start);
//         touching endpoints (end === b.start or start === b.end) are allowed.
//   AC5 — purity: the bookings array is never modified.
//
// Returns true (Available) or false (Unavailable).

export const MINUTES_PER_DAY = 1440;
export const MAX_BOOKING_LENGTH = 120;

/**
 * @typedef {{ start: number, end: number }} Interval
 * @typedef {'not-whole-minutes' | 'start-before-midnight' | 'end-after-midnight' | 'end-not-after-start' | 'start-not-after-now' | 'too-long' | 'blocked' | 'overlap'} RuleName
 * @typedef {{ rule: RuleName, bookings?: Array<Interval> }} Violation
 */

/**
 * @param {{ start: number, end: number, now: number, blocked: boolean, bookings: Array<Interval> }} args
 * @returns {Array<Violation>}
 */
export function getBookingViolations({ start, end, now, blocked, bookings }) {
  /** @type {Array<Violation>} */
  const violations = [];

  // AC1 — interval validity (NaN, decimals, Infinity and strings are rejected)
  if (!Number.isInteger(start) || !Number.isInteger(end)) violations.push({ rule: 'not-whole-minutes' });
  if (start < 0) violations.push({ rule: 'start-before-midnight' });
  if (end > MINUTES_PER_DAY) violations.push({ rule: 'end-after-midnight' });
  if (start >= end) violations.push({ rule: 'end-not-after-start' });
  if (start <= now) violations.push({ rule: 'start-not-after-now' });

  // AC2 — duration cap
  if (end - start > MAX_BOOKING_LENGTH) violations.push({ rule: 'too-long' });

  // AC3 — blocked room
  if (blocked) violations.push({ rule: 'blocked' });

  // AC4 — overlap (touching endpoints allowed)
  const overlapping = bookings.filter((b) => start < b.end && end > b.start);
  if (overlapping.length > 0) violations.push({ rule: 'overlap', bookings: overlapping });

  return violations;
}

/**
 * @param {{ start: number, end: number, now: number, blocked: boolean, bookings: Array<Interval> }} args
 * @returns {boolean}
 */
export function canBook(args) {
  return getBookingViolations(args).length === 0;
}
