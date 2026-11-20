import { minutesToLabel, labelToMinutes, formatTimeLabel } from '@/lib/format';

interface TimeInputProps {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
  error?: string;
  accentClass?: string;
}

export default function TimeInput({
  label,
  value,
  onChange,
  error,
  accentClass = 'text-sky-600 border-sky-400',
}: TimeInputProps) {
  const isError = !!error;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={minutesToLabel(value)}
          onChange={(e) => {
            if (e.target.value) onChange(labelToMinutes(e.target.value));
          }}
          className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:ring-2 focus:outline-none ${
            isError
              ? 'border-red-300 focus:ring-red-200'
              : accentClass + ' focus:ring-sky-200'
          }`}
        />
        <span className="shrink-0 text-xs font-medium text-slate-400 tabular-nums">
          {formatTimeLabel(value)}
        </span>
      </div>
      {isError && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
