// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { canBook } from './booking';
import { checkAvailability, getRoomBookings } from './lib/bookingLogic';
import { filterRooms, matchesRoomFilter } from './lib/filterRooms';
import { sampleRooms, sampleBookings } from './data/rooms';
import RoomChecker from './components/RoomChecker';

const NOW = 480; // 08:00 — fixed current time

// ─────────────────────────────────────────────
// AC regression — AC1–AC5 via canBook / checkAvailability
// ─────────────────────────────────────────────

describe('AC regression', () => {
  describe('AC1: interval validity', () => {
    it('start equal to now is unavailable', () => {
      expect(canBook({ start: 480, end: 540, now: 480, blocked: false, bookings: [] })).toBe(false);
    });

    it('reversed interval (end before start) is unavailable', () => {
      expect(canBook({ start: 750, end: 720, now: 480, blocked: false, bookings: [] })).toBe(false);
    });
  });

  describe('AC2: duration cap boundary', () => {
    it('exactly 120 minutes is available', () => {
      expect(canBook({ start: 500, end: 620, now: 480, blocked: false, bookings: [] })).toBe(true);
    });

    it('121 minutes is unavailable', () => {
      expect(canBook({ start: 500, end: 621, now: 480, blocked: false, bookings: [] })).toBe(false);
    });
  });

  describe('AC3: blocked room', () => {
    it('blocked room is unavailable even with a free time slot', () => {
      expect(canBook({ start: 660, end: 720, now: 480, blocked: true, bookings: [] })).toBe(false);
    });

    it('checkAvailability reports blocked room r3 (C-305) as unavailable', () => {
      const r = checkAvailability('r3', 660, 720, NOW, sampleRooms, sampleBookings);
      expect(r.decision).toBe('unavailable');
      expect(r.reasons).toContain('Room "C-305" is blocked and cannot be booked.');
    });

    it('unknown room id is unavailable with an Unknown room reason', () => {
      const r = checkAvailability('missing', 660, 720, NOW, sampleRooms, sampleBookings);
      expect(r.decision).toBe('unavailable');
      expect(r.reasons).toEqual(['Unknown room']);
    });
  });

  describe('AC4: overlap boundary', () => {
    it('touching interval (starts exactly when a booking ends) is available', () => {
      expect(canBook({ start: 660, end: 720, now: 480, blocked: false, bookings: [{ start: 600, end: 660 }] })).toBe(true);
    });

    it('overlapping by 1 minute is unavailable', () => {
      expect(canBook({ start: 659, end: 720, now: 480, blocked: false, bookings: [{ start: 600, end: 660 }] })).toBe(false);
    });
  });

  describe('AC5: data immutability', () => {
    it('room data is unchanged after checkAvailability', () => {
      const before = JSON.stringify(sampleRooms);
      checkAvailability('r1', 500, 620, NOW, sampleRooms, sampleBookings);
      checkAvailability('r3', 660, 720, NOW, sampleRooms, sampleBookings);
      expect(JSON.stringify(sampleRooms)).toBe(before);
    });

    it('booking data is unchanged after checkAvailability', () => {
      const before = JSON.stringify(sampleBookings);
      checkAvailability('r1', 500, 620, NOW, sampleRooms, sampleBookings);
      checkAvailability('r2', 660, 720, NOW, sampleRooms, sampleBookings);
      expect(JSON.stringify(sampleBookings)).toBe(before);
    });
  });
});

// ─────────────────────────────────────────────
// New feature tests — F1–F5 via filterRooms and room data
// ─────────────────────────────────────────────

describe('New feature tests', () => {
  describe('F1: capacity >= attendees', () => {
    it('attendees equal to capacity -> room is shown', () => {
      // r2 has capacity 25
      expect(matchesRoomFilter(sampleRooms[1], { attendees: 25, equipment: [] })).toBe(true);
      expect(filterRooms(sampleRooms, { attendees: 25, equipment: [] }).some((r) => r.id === 'r2')).toBe(true);
    });

    it('attendees = capacity + 1 -> room is hidden', () => {
      expect(matchesRoomFilter(sampleRooms[1], { attendees: 26, equipment: [] })).toBe(false);
      expect(filterRooms(sampleRooms, { attendees: 26, equipment: [] }).some((r) => r.id === 'r2')).toBe(false);
    });
  });

  describe('F2: room must have ALL selected equipment', () => {
    it('room with only one of two selected equipment items is hidden', () => {
      // r2 has ['whiteboard', 'video call'] — missing 'projector'
      expect(matchesRoomFilter(sampleRooms[1], { attendees: 1, equipment: ['whiteboard', 'projector'] })).toBe(false);
    });

    it('room with all selected equipment items is shown', () => {
      // r1 has ['projector', 'whiteboard', 'computers']
      expect(matchesRoomFilter(sampleRooms[0], { attendees: 1, equipment: ['projector', 'whiteboard'] })).toBe(true);
    });
  });

  describe('F3: blocked room passing filters is never Available', () => {
    it('blocked room r3 passes a low-attendees filter', () => {
      const matches = filterRooms(sampleRooms, { attendees: 1, equipment: [] });
      expect(matches.some((r) => r.id === 'r3')).toBe(true);
    });

    it('blocked room r3 is never Available even with a valid free slot', () => {
      const r = checkAvailability('r3', 660, 720, NOW, sampleRooms, sampleBookings);
      expect(r.decision).toBe('unavailable');
    });
  });

  describe('F4: no matching room returns empty list', () => {
    it('attendees exceeding all capacities returns an empty list', () => {
      expect(filterRooms(sampleRooms, { attendees: 999, equipment: [] })).toEqual([]);
    });

    it('nonexistent equipment returns an empty list', () => {
      expect(filterRooms(sampleRooms, { attendees: 1, equipment: ['helipad'] })).toEqual([]);
    });
  });

  describe('F5: each room uses only its own bookings', () => {
    it('same time slot gives different results for r1 and r2', () => {
      // Slot 570–630 overlaps r1 booking 540–600 but only touches r2 booking 600–660
      const r1 = checkAvailability('r1', 570, 630, NOW, sampleRooms, sampleBookings);
      const r2 = checkAvailability('r2', 570, 630, NOW, sampleRooms, sampleBookings);
      expect(r1.decision).toBe('unavailable');
      expect(r2.decision).toBe('unavailable');
      // r1 overlaps its 09:00–10:00 booking
      expect(r1.reasons.some((m) => m.includes('09:00–10:00'))).toBe(true);
      // r2 overlaps its 10:00–11:00 booking
      expect(r2.reasons.some((m) => m.includes('10:00–11:00'))).toBe(true);
    });

    it('getRoomBookings returns only the bookings for the given room', () => {
      const r1Bookings = getRoomBookings(sampleBookings, 'r1');
      const r2Bookings = getRoomBookings(sampleBookings, 'r2');
      expect(r1Bookings).toHaveLength(2);
      expect(r2Bookings).toHaveLength(1);
      expect(r1Bookings.every((b) => b.roomId === 'r1')).toBe(true);
      expect(r2Bookings.every((b) => b.roomId === 'r2')).toBe(true);
    });

    it('r4 is available for a slot that overlaps r1 but not r4', () => {
      // Slot 570–630 overlaps r1 (540–600) but r4 only has 840–900
      const r1 = checkAvailability('r1', 570, 630, NOW, sampleRooms, sampleBookings);
      const r4 = checkAvailability('r4', 570, 630, NOW, sampleRooms, sampleBookings);
      expect(r1.decision).toBe('unavailable');
      expect(r4.decision).toBe('available');
    });
  });
});

// ─────────────────────────────────────────────
// UI behavior tests — render RoomChecker with jsdom
// ─────────────────────────────────────────────

describe('UI behavior', () => {
  it('shows the empty state when attendees exceed all room capacities', () => {
    render(<RoomChecker />);
    // Type a large number into the attendees input
    const attendeesInput = screen.getByDisplayValue('1');
    fireEvent.change(attendeesInput, { target: { value: '999' } });
    // F4 empty state text should be visible in the result area
    expect(screen.getAllByText(/No rooms match your filters/).length).toBeGreaterThan(0);
  });

  it('clicking another room changes the result and existing bookings list', () => {
    render(<RoomChecker />);
    // Default selected room is r1 (A-101) which is unavailable for the default slot
    // Click room r2 (B-220)
    const r2Button = screen.getByText('B-220').closest('button')!;
    fireEvent.click(r2Button);
    // The "Existing bookings" heading should now say B-220
    expect(screen.getByText(/Existing bookings — B-220/)).toBeInTheDocument();
    // The timeline heading should also say B-220
    expect(screen.getByText(/Today's schedule — B-220/)).toBeInTheDocument();
  });
});
