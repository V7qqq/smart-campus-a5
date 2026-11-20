import { describe, it, expect } from 'vitest';
import { canBook } from './booking';
import { checkAvailability, filterRooms, matchesRoomFilter } from './lib/bookingLogic';
import { sampleRooms, sampleBookings, getDefaultCurrentTime, FIXED_CURRENT_TIME } from './lib/sampleData';

const NOW_MORNING = 480;

describe('AC1: interval validity', () => {
  it('rejects a start time that is already in the past', () => {
    expect(canBook({ start: 500, end: 530, now: 540, blocked: false, bookings: [] })).toBe(false);
  });

  it('rejects a reversed interval (end before start)', () => {
    expect(canBook({ start: 750, end: 720, now: 540, blocked: false, bookings: [] })).toBe(false);
  });

  it('reports the past-time reason in the UI result', () => {
    const r = checkAvailability('r1', 420, 470, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('unavailable');
    expect(r.reasons).toContain('Start time must be after the current time (08:00).');
  });

  it('reports the reversed-interval reason in the UI result', () => {
    const r = checkAvailability('r1', 750, 720, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('unavailable');
    expect(r.reasons.some((m) => m.startsWith('Interval must satisfy'))).toBe(true);
  });
});

describe('AC2: duration cap of 120 minutes', () => {
  it('rejects a 121-minute booking', () => {
    expect(canBook({ start: 720, end: 841, now: 540, blocked: false, bookings: [] })).toBe(false);
  });

  it('reports the 121-minute length in the UI result', () => {
    const r = checkAvailability('r1', 900, 1021, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('unavailable');
    expect(r.reasons.some((m) => m.startsWith('Booking length is 121 min'))).toBe(true);
  });
});

describe('AC3: blocked rooms', () => {
  it('rejects any slot when the room is blocked', () => {
    expect(canBook({ start: 660, end: 720, now: 540, blocked: true, bookings: [] })).toBe(false);
  });

  it('reports the blocked room in the UI result (sample room C-305 is blocked)', () => {
    const r = checkAvailability('r3', 600, 660, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('unavailable');
    expect(r.reasons).toContain('Room "C-305" is blocked and cannot be booked.');
  });
});

describe('AC4: overlap', () => {
  it('rejects a slot that overlaps an existing booking', () => {
    expect(canBook({ start: 630, end: 690, now: 540, blocked: false, bookings: [{ start: 600, end: 660 }] })).toBe(false);
  });

  it('reports the overlapping booking in the UI result', () => {
    const r = checkAvailability('r1', 570, 630, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('unavailable');
    expect(r.reasons).toContain('Overlaps existing booking(s): 09:00–10:00.');
  });

  it('only checks bookings for the selected room', () => {
    const r = checkAvailability('r2', 570, 630, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('unavailable');
    expect(r.reasons.some((m) => m.startsWith('Overlaps'))).toBe(true);
    const other = checkAvailability('r4', 570, 630, NOW_MORNING, sampleRooms, sampleBookings);
    expect(other.decision).toBe('available');
  });
});

describe('Touching endpoints are allowed', () => {
  it('allows a slot that ends exactly when an existing booking starts', () => {
    expect(canBook({ start: 540, end: 600, now: 0, blocked: false, bookings: [{ start: 600, end: 660 }] })).toBe(true);
  });

  it('allows a slot that starts exactly when an existing booking ends', () => {
    expect(canBook({ start: 660, end: 720, now: 540, blocked: false, bookings: [{ start: 600, end: 660 }] })).toBe(true);
  });

  it('shows Available for a gap between two sample bookings in room A-101', () => {
    const r = checkAvailability('r1', 600, 720, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('available');
    expect(r.reasons).toEqual([]);
  });
});

describe('AC5: booking data is never mutated', () => {
  it('leaves the bookings array unchanged after an Available decision', () => {
    const bookings = [{ start: 600, end: 660 }];
    const before = JSON.stringify(bookings);
    canBook({ start: 660, end: 720, now: 540, blocked: false, bookings });
    expect(JSON.stringify(bookings)).toBe(before);
  });

  it('leaves the sample fixtures unchanged after checking availability', () => {
    const before = JSON.stringify(sampleBookings);
    checkAvailability('r1', 600, 720, NOW_MORNING, sampleRooms, sampleBookings);
    checkAvailability('r1', 570, 630, NOW_MORNING, sampleRooms, sampleBookings);
    expect(JSON.stringify(sampleBookings)).toBe(before);
  });
});

describe('Fixture data is stable', () => {
  it('keeps the sample rooms exactly as defined', () => {
    expect(sampleRooms).toEqual([
      { id: 'r1', name: 'A-101', building: 'Engineering Block', capacity: 40, blocked: false, equipment: ['projector', 'whiteboard', 'computers'] },
      { id: 'r2', name: 'B-220', building: 'Science Block', capacity: 25, blocked: false, equipment: ['whiteboard', 'video call'] },
      { id: 'r3', name: 'C-305', building: 'Library Wing', capacity: 60, blocked: true, equipment: ['projector', 'whiteboard', 'video call'] },
      { id: 'r4', name: 'D-110', building: 'Arts Center', capacity: 15, blocked: false, equipment: ['whiteboard'] },
      { id: 'r5', name: 'E-201', building: 'Business Block', capacity: 35, blocked: false, equipment: ['projector', 'video call', 'computers'] },
    ]);
  });

  it('keeps the sample bookings exactly as defined', () => {
    expect(sampleBookings).toEqual([
      { id: 'b1', roomId: 'r1', start: 540, end: 600, bookedBy: 'Prof. Chen' },
      { id: 'b2', roomId: 'r1', start: 720, end: 780, bookedBy: 'Prof. Lopez' },
      { id: 'b3', roomId: 'r2', start: 600, end: 660, bookedBy: 'Dr. Patel' },
      { id: 'b4', roomId: 'r4', start: 840, end: 900, bookedBy: 'Ms. Garcia' },
      { id: 'b5', roomId: 'r5', start: 480, end: 540, bookedBy: 'Dr. Kim' },
    ]);
  });
});

describe('F1: capacity >= attendees', () => {
  it('includes a room whose capacity meets the attendee count', () => {
    expect(matchesRoomFilter(sampleRooms[0], { attendees: 40, equipment: [] })).toBe(true);
  });

  it('excludes a room whose capacity is below the attendee count', () => {
    expect(matchesRoomFilter(sampleRooms[3], { attendees: 20, equipment: [] })).toBe(false);
  });

  it('filters out only rooms that are too small', () => {
    const matches = filterRooms(sampleRooms, { attendees: 30, equipment: [] });
    expect(matches.map((r) => r.id)).toEqual(['r1', 'r3', 'r5']);
  });
});

describe('F2: room must have ALL selected equipment', () => {
  it('includes a room that has every selected equipment item', () => {
    expect(matchesRoomFilter(sampleRooms[0], { attendees: 1, equipment: ['projector', 'whiteboard'] })).toBe(true);
  });

  it('excludes a room that is missing one selected equipment item', () => {
    expect(matchesRoomFilter(sampleRooms[3], { attendees: 1, equipment: ['projector'] })).toBe(false);
  });

  it('filters to only rooms with projector and video call', () => {
    const matches = filterRooms(sampleRooms, { attendees: 1, equipment: ['projector', 'video call'] });
    expect(matches.map((r) => r.id)).toEqual(['r3', 'r5']);
  });
});

describe('F3: blocked room is shown but never reported Available', () => {
  it('filterRooms keeps blocked rooms in the list (they are shown)', () => {
    const matches = filterRooms(sampleRooms, { attendees: 1, equipment: [] });
    expect(matches.some((r) => r.id === 'r3' && r.blocked)).toBe(true);
  });

  it('checkAvailability reports a blocked room as unavailable even with a valid slot', () => {
    const r = checkAvailability('r3', 660, 720, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('unavailable');
    expect(r.reasons).toContain('Room "C-305" is blocked and cannot be booked.');
  });
});

describe('F4: empty state when no room matches', () => {
  it('returns an empty array when no room meets the capacity', () => {
    expect(filterRooms(sampleRooms, { attendees: 100, equipment: [] })).toEqual([]);
  });

  it('returns an empty array when no room has all the equipment', () => {
    expect(filterRooms(sampleRooms, { attendees: 1, equipment: ['projector', 'whiteboard', 'video call', 'computers', 'stage'] })).toEqual([]);
  });
});

describe('F5: result uses only the selected room bookings', () => {
  it('reports Available for a room whose own bookings do not overlap, ignoring other rooms', () => {
    const r = checkAvailability('r2', 660, 720, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('available');
    expect(r.reasons).toEqual([]);
  });

  it('reports Unavailable with the selected room booking time, not another room time', () => {
    const r = checkAvailability('r1', 570, 630, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r.decision).toBe('unavailable');
    expect(r.reasons).toContain('Overlaps existing booking(s): 09:00–10:00.');
  });

  it('changing the room id changes which bookings are checked', () => {
    const r1 = checkAvailability('r1', 570, 630, NOW_MORNING, sampleRooms, sampleBookings);
    const r4 = checkAvailability('r4', 570, 630, NOW_MORNING, sampleRooms, sampleBookings);
    expect(r1.decision).toBe('unavailable');
    expect(r4.decision).toBe('available');
  });
});

describe('Fixed current time', () => {
  it('getDefaultCurrentTime returns the fixed 08:00 (480 min)', () => {
    expect(getDefaultCurrentTime()).toBe(480);
    expect(FIXED_CURRENT_TIME).toBe(480);
  });
});
