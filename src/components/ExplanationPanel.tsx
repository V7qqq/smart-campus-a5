import { useState } from 'react';
import { explainAvailability, mockAdapter } from '@/lib/explanation';
import type { ExplanationInput, ExplanationResult, Mode } from '@/lib/explanation';

export default function ExplanationPanel({input}: {input: ExplanationInput}) {
  const [mode, setMode] = useState<Mode>('mock');
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function explain() {
    setBusy(true); setResult(null); setError('');
    try { setResult(await explainAvailability(input, mockAdapter(mode))); }
    catch { setError('Cannot explain invalid input. Check the room and time values.'); }
    finally { setBusy(false); }
  }
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="font-semibold text-slate-800">Availability explanation</h2>
    <p className="mt-1 text-xs text-slate-500">Mock AI adapter. The rule checker above decides availability; no booking is created.</p>
    <button onClick={explain} disabled={busy} className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Explaining...' : 'Explain availability'}</button>
    <div role="status" aria-live="polite" className="mt-3 text-sm text-slate-700">
      {result && <><p className="mb-1 text-xs font-semibold text-sky-700">{result.source === 'mock' ? 'Mock explanation' : 'Deterministic fallback'}</p><p>{result.explanation}</p><p className="mt-1 text-xs text-slate-500">{result.detail}</p></>}
      {error && <p>{error}</p>}
    </div>
    <details className="mt-3 text-xs text-slate-500"><summary>Classroom failure simulation</summary><label className="mt-2 block">Adapter mode <select aria-label="Adapter mode" value={mode} onChange={e=>{setMode(e.target.value as Mode); setResult(null);}} className="ml-2 rounded border p-1">
      <option value="mock">Normal mock</option><option value="timeout">Simulated timeout</option><option value="error">Simulated API failure</option><option value="missing-key">Missing key</option><option value="malformed">Malformed response</option>
    </select></label></details>
  </div>;
}
