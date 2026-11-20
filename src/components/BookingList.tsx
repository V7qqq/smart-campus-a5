import type { Booking } from '@/lib/bookingLogic';
import { formatTimeLabel } from '@/lib/format';

interface BookingListProps {
  roomName: string;
  bookings: Booking[];
}

export default function BookingList({ roomName, bookings }: BookingListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        Existing bookings — {roomName}
      </h2>
      {bookings.length === 0 ? (
        <p className="py-3 text-sm text-slate-400">No bookings for this room.</p>
      ) : (
        <ul className="space-y-2">
          {bookings
            .slice()
            .sort((a, b) => a.start - b.start)
            .map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium tabular-nums text-slate-700">
                  {formatTimeLabel(b.start)} – {formatTimeLabel(b.end)}
                </span>
                <span className="text-xs text-slate-400">Booked</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
