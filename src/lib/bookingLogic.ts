import { getBookingViolations, MAX_BOOKING_LENGTH } from '@/booking';
import type { Violation } from '@/booking';
import { minutesToLabel, formatTimeLabel } from '@/lib/format';

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  equipment: string[];
}

export interface Booking {
  id: string;
  roomId: string;
  start: number;
  end: number;
  bookedBy: string;
}

export type Decision = 'available' | 'unavailable';

export interface CheckResult {
  decision: Decision;
  reasons: string[];
  violations: Violation[];
}

// Re-export formatting helpers and filter logic so existing imports keep working.
export { minutesToLabel, labelToMinutes, formatDuration, formatTimeLabel } from '@/lib/format';
export { matchesRoomFilter, filterRooms } from '@/lib/filterRooms';
export type { RoomFilter } from '@/lib/filterRooms';

const INTERVAL_RULES = new Set<Violation['rule']>([
  'not-whole-minutes',
  'start-before-midnight',
  'end-after-midnight',
  'end-not-after-start',
]);

function violationReasons(
  violations: Violation[],
  start: number,
  end: number,
  currentTime: number,
  room: Room | undefined
): string[] {
  const reasons: string[] = [];
  let intervalReported = false;

  for (const v of violations) {
    if (INTERVAL_RULES.has(v.rule)) {
      if (!intervalReported) {
        reasons.push('Interval must satisfy 0 ≤ start < end ≤ 1440 minutes (00:00–24:00).');
        intervalReported = true;
      }
      continue;
    }
    switch (v.rule) {
      case 'start-not-after-now':
        reasons.push(`Start time must be after the current time (${minutesToLabel(currentTime)}).`);
        break;
      case 'too-long':
        reasons.push(
          `Booking length is ${end - start} min — exceeds the ${MAX_BOOKING_LENGTH}-minute maximum.`
        );
        break;
      case 'blocked':
        reasons.push(`Room "${room?.name}" is blocked and cannot be booked.`);
        break;
      case 'overlap':
        reasons.push(
          `Overlaps existing booking(s): ${(v.bookings ?? [])
            .map((b) => `${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`)
            .join(', ')}.`
        );
        break;
    }
  }

  return reasons;
}

export interface FieldErrors {
  start: string;
  end: string;
  duration: string;
}

/** Maps rule names to the short messages under the time inputs. The UI only renders them. */
export function getFieldErrors(
  violations: Violation[],
  start: number,
  end: number,
  currentTime: number
): FieldErrors {
  const rules = new Set(violations.map((v) => v.rule));
  return {
    start: rules.has('start-not-after-now') ? `Must be after ${formatTimeLabel(currentTime)}` : '',
    end: rules.has('end-not-after-start')
      ? 'Must be after start'
      : rules.has('end-after-midnight')
        ? 'Cannot exceed 24:00'
        : '',
    duration: rules.has('too-long')
      ? `Max is ${MAX_BOOKING_LENGTH} min — you have ${end - start} min`
      : '',
  };
}

/** Single place for filtering bookings by room. */
export function getRoomBookings(bookings: Booking[], roomId: string): Booking[] {
  return bookings.filter((b) => b.roomId === roomId);
}

export function checkAvailability(
  roomId: string,
  start: number,
  end: number,
  currentTime: number,
  rooms: Room[],
  bookings: Booking[]
): CheckResult {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return { decision: 'unavailable', reasons: ['Unknown room'], violations: [] };
  }
  const violations = getBookingViolations({
    start,
    end,
    now: currentTime,
    blocked: room.blocked,
    bookings: getRoomBookings(bookings, roomId),
  });

  return {
    decision: violations.length === 0 ? 'available' : 'unavailable',
    reasons: violationReasons(violations, start, end, currentTime, room),
    violations,
  };
}
