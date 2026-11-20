import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MINUTES_PER_DAY, MAX_BOOKING_LENGTH } from '@/booking';
import { formatDuration, formatTimeLabel } from '@/lib/format';
import TimeInput from './TimeInput';

interface TimeSlotPickerProps {
  currentTime: number;
  onCurrentTimeChange: (minutes: number) => void;
  start: number;
  end: number;
  onStartChange: (minutes: number) => void;
  onEndChange: (minutes: number) => void;
  startError?: string;
  endError?: string;
  durationError?: string;
}

export default function TimeSlotPicker({
  currentTime,
  onCurrentTimeChange,
  start,
  end,
  onStartChange,
  onEndChange,
  startError,
  endError,
  durationError,
}: TimeSlotPickerProps) {
  const duration = end - start;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">Pick a time slot</h2>

      <div className="mb-5 flex flex-col gap-2 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="h-5 w-5 text-sky-600" />
          <div>
            <p className="text-sm font-medium text-slate-700">Current time</p>
            <p className="text-xs text-slate-400">Drag to simulate a different time of day</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={MINUTES_PER_DAY}
            step={15}
            value={currentTime}
            onChange={(e) => onCurrentTimeChange(Number(e.target.value))}
            className="w-32 accent-sky-600 sm:w-40"
          />
          <span className="w-28 rounded-lg bg-white px-3 py-1.5 text-center text-sm font-bold text-slate-800 shadow-sm tabular-nums">
            {formatTimeLabel(currentTime)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TimeInput
          label="Start time"
          value={start}
          onChange={onStartChange}
          error={startError}
        />
        <TimeInput
          label="End time"
          value={end}
          onChange={onEndChange}
          error={endError}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
          <Clock className="h-4 w-4 text-slate-400" />
          Duration: <span className="font-bold tabular-nums">{formatDuration(Math.max(0, duration))}</span>
        </span>
        {durationError ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600">
            <AlertTriangle className="h-4 w-4" />
            {durationError}
          </span>
        ) : duration > 0 && duration <= MAX_BOOKING_LENGTH ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Within {MAX_BOOKING_LENGTH}-min limit
          </span>
        ) : null}
      </div>
    </div>
  );
}
