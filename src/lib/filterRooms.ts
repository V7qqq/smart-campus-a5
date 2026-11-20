import type { Room } from '@/lib/bookingLogic';

export interface RoomFilter {
  attendees: number;
  equipment: string[];
}

/**
 * F1: capacity >= attendees.
 * F2: room has ALL selected equipment.
 * Blocked rooms are still returned so the UI can show them; the
 * availability check (F3) keeps them from ever being reported as Available.
 */
export function matchesRoomFilter(room: Room, filter: RoomFilter): boolean {
  if (room.capacity < filter.attendees) return false;
  if (filter.equipment.length > 0) {
    const roomSet = new Set(room.equipment);
    for (const item of filter.equipment) {
      if (!roomSet.has(item)) return false;
    }
  }
  return true;
}

export function filterRooms(rooms: Room[], filter: RoomFilter): Room[] {
  return rooms.filter((r) => matchesRoomFilter(r, filter));
}
