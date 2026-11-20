import { SearchX } from 'lucide-react';
import type { Room } from '@/lib/bookingLogic';
import RoomCard from './RoomCard';

interface RoomListProps {
  rooms: Room[];
  visibleRooms: Room[];
  selectedRoomId: string;
  onSelect: (id: string) => void;
}

export default function RoomList({ rooms, visibleRooms, selectedRoomId, onSelect }: RoomListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">Choose a room</h2>
      <p className="mb-4 text-sm text-slate-500">
        Showing {visibleRooms.length} of {rooms.length} rooms. Tap a room to select it.
      </p>

      {visibleRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
          <SearchX className="h-8 w-8 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">No rooms match your filters</p>
          <p className="text-xs text-slate-400">Try lowering the attendee count or removing equipment requirements.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleRooms.map((r) => (
            <RoomCard
              key={r.id}
              room={r}
              selected={r.id === selectedRoomId}
              onSelect={() => onSelect(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
