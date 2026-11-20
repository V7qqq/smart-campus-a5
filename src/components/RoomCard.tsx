import { MapPin, Users, Ban } from 'lucide-react';
import type { Room } from '@/lib/bookingLogic';

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onSelect: () => void;
}

export default function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`group relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
        room.blocked
          ? selected
            ? 'border-red-300 bg-red-50/70 shadow-md shadow-red-100'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-sm'
          : selected
            ? 'border-sky-500 bg-sky-50 shadow-md shadow-sky-100'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-base font-bold ${room.blocked ? 'text-slate-500' : selected ? 'text-sky-700' : 'text-slate-800'}`}>
          {room.name}
        </span>
        {room.blocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
            <Ban className="h-3 w-3" /> Blocked
          </span>
        ) : selected ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        ) : (
          <span className="h-5 w-5 rounded-full border-2 border-slate-300 transition group-hover:border-slate-400" />
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {room.building}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {room.capacity}
        </span>
      </div>
      {room.equipment.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {room.equipment.map((item) => (
            <span
              key={item}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-500"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
