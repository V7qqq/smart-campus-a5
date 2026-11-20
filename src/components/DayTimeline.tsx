import type { Booking } from '@/lib/bookingLogic';
import { minutesToLabel } from '@/lib/format';
import { MINUTES_PER_DAY } from '@/booking';

interface DayTimelineProps {
  bookings: Booking[];
  requestedStart: number;
  requestedEnd: number;
  currentTime: number;
}

const DAY_START = 7 * 60; // 07:00 — visible window start
const DAY_END = 22 * 60; // 22:00 — visible window end
const WINDOW = DAY_END - DAY_START;

function pct(min: number): number {
  const clamped = Math.max(DAY_START, Math.min(DAY_END, min));
  return ((clamped - DAY_START) / WINDOW) * 100;
}

const hourTicks: number[] = [];
for (let h = 7; h <= 22; h++) hourTicks.push(h * 60);

export default function DayTimeline({
  bookings,
  requestedStart,
  requestedEnd,
  currentTime,
}: DayTimelineProps) {
  const sorted = bookings.slice().sort((a, b) => a.start - b.start);

  return (
    <div>
      {/* Hour labels */}
      <div className="relative mb-1 h-4">
        {hourTicks.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2 text-[10px] font-medium text-slate-400 tabular-nums"
            style={{ left: `${pct(t)}%` }}
          >
            {minutesToLabel(t)}
          </span>
        ))}
      </div>

      {/* Track */}
      <div className="relative h-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {/* Hour grid lines */}
        {hourTicks.map((t) => (
          <div
            key={t}
            className="absolute top-0 bottom-0 w-px bg-slate-200"
            style={{ left: `${pct(t)}%` }}
          />
        ))}

        {/* Current time marker */}
        {currentTime >= DAY_START && currentTime <= DAY_END && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
            style={{ left: `${pct(currentTime)}%` }}
            title={`Now: ${minutesToLabel(currentTime)}`}
          >
            <div className="absolute -top-0.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-400" />
          </div>
        )}

        {/* Existing bookings */}
        {sorted.map((b) => {
          const left = pct(b.start);
          const width = Math.max(2, pct(b.end) - pct(b.start));
          return (
            <div
              key={b.id}
              className="absolute top-2 bottom-2 flex items-center justify-center overflow-hidden rounded-md bg-slate-300 px-1"
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`Booked: ${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`}
            >
              {width > 12 && (
                <span className="truncate text-[9px] font-medium text-slate-600">
                  Booked
                </span>
              )}
            </div>
          );
        })}

        {/* Requested slot */}
        {requestedEnd > requestedStart && requestedStart < MINUTES_PER_DAY && (
          <div
            className="absolute top-1.5 bottom-1.5 rounded-md border-2 border-sky-500 bg-sky-200/60"
            style={{
              left: `${pct(requestedStart)}%`,
              width: `${Math.max(3, pct(requestedEnd) - pct(requestedStart))}%`,
            }}
            title={`Requested: ${minutesToLabel(requestedStart)}–${minutesToLabel(requestedEnd)}`}
          >
            <div className="flex h-full items-center justify-center">
              {pct(requestedEnd) - pct(requestedStart) > 8 && (
                <span className="text-[9px] font-bold text-sky-700">You</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-sky-500 bg-sky-200/60" /> Your slot
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-slate-300" /> Booked
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-amber-400" /> Now
        </span>
      </div>
    </div>
  );
}
