import { describe, it, expect } from 'vitest';
import { canBook } from './booking';

// Fresh fixture per test (re-created inside each `it` so no test can leak state).
const makeFixture = () => ({
  now: 540,
  blocked: false,
  bookings: [{ start: 600, end: 660 }],
});

describe('canBook', () => {
  // T01 — slot just after the existing booking, within duration limit
  it('T01: 660-720 → true', () => {
    const f = makeFixture();
    expect(canBook({ start: 660, end: 720, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(true);
  });

  // T02 — start equals now (not strictly after)
  it('T02: 540-570 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 540, end: 570, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T03 — zero-length slot
  it('T03: 720-720 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 720, end: 720, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T04 — end before start
  it('T04: 750-720 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 750, end: 720, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T05 — end exceeds 1440
  it('T05: 1380-1441 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 1380, end: 1441, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T06 — exactly 120 min (boundary allowed)
  it('T06: 720-840 → true', () => {
    const f = makeFixture();
    expect(canBook({ start: 720, end: 840, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(true);
  });

  // T07 — 121 min (boundary exceeded)
  it('T07: 720-841 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 720, end: 841, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T08 — touching the existing booking at its start (allowed)
  it('T08: 570-600 → true', () => {
    const f = makeFixture();
    expect(canBook({ start: 570, end: 600, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(true);
  });

  // T09 — fully inside the existing booking
  it('T09: 630-690 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 630, end: 690, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T10 — overlaps the existing booking (start before, end inside)
  it('T10: 570-690 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 570, end: 690, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T11 — overlaps the existing booking (start inside, end after)
  it('T11: 615-645 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 615, end: 645, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T12 — exactly the existing booking
  it('T12: 600-660 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 600, end: 660, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T13 — blocked room overrides everything
  it('T13: 660-720 blocked → false', () => {
    const f = makeFixture();
    expect(canBook({ start: 660, end: 720, now: f.now, blocked: true, bookings: f.bookings })).toBe(false);
  });

  // T14 — with no existing bookings, a valid slot is available
  it('T14: 630-690 bookings=[] → true', () => {
    const f = makeFixture();
    expect(canBook({ start: 630, end: 690, now: f.now, blocked: f.blocked, bookings: [] })).toBe(true);
  });

  // T15 — negative start and end, now in the past
  it('T15: -30..30 now=-60 → false', () => {
    const f = makeFixture();
    expect(canBook({ start: -30, end: 30, now: -60, blocked: f.blocked, bookings: f.bookings })).toBe(false);
  });

  // T16 — exactly up to 24:00 (1440)
  it('T16: 1380-1440 → true', () => {
    const f = makeFixture();
    expect(canBook({ start: 1380, end: 1440, now: f.now, blocked: f.blocked, bookings: f.bookings })).toBe(true);
  });

  // T17 — bookings JSON unchanged after an Available decision
  it('T17: bookings unchanged after Available (660-720)', () => {
    const f = makeFixture();
    const before = JSON.stringify(f.bookings);
    canBook({ start: 660, end: 720, now: f.now, blocked: f.blocked, bookings: f.bookings });
    expect(JSON.stringify(f.bookings)).toBe(before);
  });

  // T18 — bookings JSON unchanged after an Unavailable decision
  it('T18: bookings unchanged after Unavailable (630-690)', () => {
    const f = makeFixture();
    const before = JSON.stringify(f.bookings);
    canBook({ start: 630, end: 690, now: f.now, blocked: f.blocked, bookings: f.bookings });
    expect(JSON.stringify(f.bookings)).toBe(before);
  });
});
