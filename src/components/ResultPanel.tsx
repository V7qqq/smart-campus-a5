import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { CheckResult, Room } from '@/lib/bookingLogic';
import { formatTimeLabel } from '@/lib/format';

interface ResultPanelProps {
  room: Room;
  start: number;
  end: number;
  isAvailable: boolean;
  result: CheckResult;
}

export default function ResultPanel({ room, start, end, isAvailable, result }: ResultPanelProps) {
  return (
    <div
      className={`rounded-2xl border-2 p-5 shadow-sm transition-all sm:p-6 ${
        isAvailable
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {isAvailable ? (
          <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-8 w-8 shrink-0 text-red-600" />
        )}
        <div className="w-full">
          <p className={`text-xl font-bold ${isAvailable ? 'text-emerald-700' : 'text-red-700'}`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </p>
          {isAvailable ? (
            <p className="mt-0.5 text-sm text-emerald-600">
              {room.name} is free from{' '}
              <span className="font-semibold">{formatTimeLabel(start)}</span> to{' '}
              <span className="font-semibold">{formatTimeLabel(end)}</span>.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-sm text-red-600">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
