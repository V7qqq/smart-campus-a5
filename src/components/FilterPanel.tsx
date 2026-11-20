import { Users, Filter } from 'lucide-react';
import { EQUIPMENT_OPTIONS } from '@/data/rooms';

interface FilterPanelProps {
  attendees: number;
  selectedEquipment: string[];
  onAttendeesChange: (value: number) => void;
  onToggleEquipment: (item: string) => void;
}

export default function FilterPanel({
  attendees,
  selectedEquipment,
  onAttendeesChange,
  onToggleEquipment,
}: FilterPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-800">
        <Filter className="h-5 w-5 text-sky-600" /> Filter rooms
      </h2>
      <p className="mb-4 text-sm text-slate-500">Narrow the catalog by capacity and equipment.</p>

      <div className="mb-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Users className="h-4 w-4 text-slate-400" /> Attendees
        </label>
        <input
          type="number"
          min={1}
          max={999}
          value={attendees}
          onChange={(e) => onAttendeesChange(Math.max(1, Number(e.target.value) || 1))}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-slate-700">Equipment</span>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((item) => {
            const active = selectedEquipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggleEquipment(item)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
                aria-pressed={active}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300'
                  }`}
                >
                  {active && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="capitalize">{item}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
