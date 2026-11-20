import type { Room, Booking } from '@/lib/bookingLogic';

export const sampleRooms: Room[] = [
  { id: 'r1', name: 'A-101', building: 'Engineering Block', capacity: 40, blocked: false, equipment: ['projector', 'whiteboard', 'computers'] },
  { id: 'r2', name: 'B-220', building: 'Science Block', capacity: 25, blocked: false, equipment: ['whiteboard', 'video call'] },
  { id: 'r3', name: 'C-305', building: 'Library Wing', capacity: 60, blocked: true, equipment: ['projector', 'whiteboard', 'video call'] },
  { id: 'r4', name: 'D-110', building: 'Arts Center', capacity: 15, blocked: false, equipment: ['whiteboard'] },
  { id: 'r5', name: 'E-201', building: 'Business Block', capacity: 35, blocked: false, equipment: ['projector', 'video call', 'computers'] },
];

export const sampleBookings: Booking[] = [
  { id: 'b1', roomId: 'r1', start: 540, end: 600, bookedBy: 'Prof. Chen' },
  { id: 'b2', roomId: 'r1', start: 720, end: 780, bookedBy: 'Prof. Lopez' },
  { id: 'b3', roomId: 'r2', start: 600, end: 660, bookedBy: 'Dr. Patel' },
  { id: 'b4', roomId: 'r4', start: 840, end: 900, bookedBy: 'Ms. Garcia' },
  { id: 'b5', roomId: 'r5', start: 480, end: 540, bookedBy: 'Dr. Kim' },
];

export const EQUIPMENT_OPTIONS = ['projector', 'whiteboard', 'video call', 'computers'];

export const FIXED_CURRENT_TIME = 480; // 08:00

export function getDefaultCurrentTime(): number {
  return FIXED_CURRENT_TIME;
}
