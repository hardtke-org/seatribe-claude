import { useMemo, useState, useEffect } from 'react';

import type { SkipperInfo } from './types';
import { useStore, getProgress } from './useStore';
import { TaskCard } from './TaskCard';
import { ProgressBar } from './ProgressBar';
import { SkipperForm } from './SkipperForm';
import { generatePdf } from './generatePdf';

type Filter = 'open' | 'done' | 'skip' | 'all' | 'notes';

const TABS: { key: Filter; label: string }[] = [
  { key: 'open', label: 'Offen' },
  { key: 'done', label: 'Erledigt' },
  { key: 'skip', label: 'Übersprungen' },
  { key: 'all', label: 'Alle' },
  { key: 'notes', label: 'Anmerkungen' },
];


export default function App() {
  const { store, setTaskStatus, setTaskNote, addTaskImage, removeTaskImage, resetToSeed } = useStore();
  const [filter, setFilter] = useState<Filter>('open');
  const [search, setSearch] = useState('');
  const [skipperInfo, setSkipperInfo] = useState<SkipperInfo | null>(() => {
    try {
      const s = localStorage.getItem('skipper-info');
      return s ? (JSON.parse(s) as SkipperInfo) : null;
    } catch { return null; }
  });
  const [editingSkipper, setEditingSkipper] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Persist skipperInfo to localStorage
  useEffect(() => {
    if (skipperInfo) {
      localStorage.setItem('skipper-info', JSON.stringify(skipperInfo));
    } else {
      localStorage.removeItem('skipper-info');
    }
  }, [skipperInfo]);

  // Scroll to top when entering checklist
  useEffect(() => {
    if (!skipperInfo) return;
    window.scrollTo(0, 0);
  }, [skipperInfo]);

  const allDone = store.tasks.every(t => t.status !== 'open');

  async function handleSubmit() {
    if (!skipperInfo || !allDone) return;
    setSubmitting(true);
    try {
      const filename = `check-${skipperInfo.auftragId}-${skipperInfo.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;

      // 1. Generate PDF client-side
      const pdfBase64 = await generatePdf(store, skipperInfo, true);
      const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

      // 2. Upload PDF as binary through Vercel to Google Drive
      const uploadRes = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          'X-Filename': filename,
        },
        body: pdfBytes,
      });
      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Drive-Upload fehlgeschlagen (${uploadRes.status}): ${errText}`);
      }
      const { driveLink } = await uploadRes.json();

      // 4. Send email with Drive link
      const sendRes = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipper: skipperInfo, clusters: store.clusters, tasks: store.tasks, driveLink }),
      });
      const json = await sendRes.json();
      if (!sendRes.ok) throw new Error(json.error ?? sendRes.status);
      setSubmitted(true);
    } catch (err) {
      alert('Fehler: ' + String(err));
    } finally {
      setSubmitting(false);
    }
  }

  const progress = useMemo(() => getProgress(store.tasks), [store.tasks]);

  const tasksWithNotes = useMemo(() => store.tasks.filter(t => t.note), [store.tasks]);

  const searchLower = search.toLowerCase();

  const filteredTasks = useMemo(() => {
    return store.tasks.filter(t => {
      if (filter !== 'all' && t.status !== filter) return false;
      if (searchLower && !t.title.toLowerCase().includes(searchLower)) return false;
      return true;
    });
  }, [store.tasks, filter, searchLower]);

  const grouped = useMemo(() => {
    const clusters = [...store.clusters].sort((a, b) => a.order - b.order);
    return clusters
      .map(c => ({
        cluster: c,
        tasks: filteredTasks
          .filter(t => t.clusterId === c.id)
          .sort((a, b) => a.order - b.order),
      }))
      .filter(g => g.tasks.length > 0);
  }, [store.clusters, filteredTasks]);

  function handleReset() {
    if (confirm('Alle Daten zurücksetzen? Aktuelle Daten gehen verloren.')) {
      resetToSeed();
      setFilter('open');
      setSearch('');
    }
  }


  if (!skipperInfo || editingSkipper) return (
    <SkipperForm
      initial={skipperInfo}
      onSubmit={info => { setSkipperInfo(info); setEditingSkipper(false); }}
    />
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Erfolgreich eingereicht</h1>
          <p className="text-slate-500 text-sm mb-6">Die Checkliste wurde als PDF an Seatribe Deliveries gesendet.</p>
          <button
            onClick={() => { resetToSeed(); setSubmitted(false); setSkipperInfo(null); setFilter('open'); }}
            className="px-6 py-2.5 text-sm font-medium rounded-xl bg-brand-primary text-white hover:brightness-110 transition-all"
          >
            Neue Checkliste starten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto overflow-x-hidden">
      {/* Header – full width */}
      <div className="bg-brand-primary px-5 sm:px-8 pt-5 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-dark">Bootsübernahme-Check</h1>
        <img src="/logo.png" alt="Seatribe" className="h-12 w-12 object-contain brightness-0 invert" />
      </div>

      <div className="px-5 sm:px-8 pb-28 pt-5">

      {/* Buttons */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setEditingSkipper(true)}
          className="flex-1 py-2 text-sm font-medium rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition-colors"
        >
          Boots-Informationen
        </button>
        <button
          onClick={handleReset}
          className="flex-1 py-2 text-sm font-medium rounded-xl bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300 transition-colors"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <ProgressBar {...progress} />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Suche..."
          className="w-full px-3 py-2 text-base border border-ui-border rounded-xl bg-ui-card focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-inset focus:ring-brand-primary/30 transition-colors duration-150"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-5 bg-slate-200 rounded-xl p-1" role="tablist" aria-label="Status-Filter">
        {TABS.map(tab => {
          const count = tab.key === 'all'
            ? store.tasks.length
            : tab.key === 'notes'
            ? tasksWithNotes.length
            : store.tasks.filter(t => t.status === tab.key).length;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={filter === tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 text-xs font-medium py-2 px-1 rounded-lg transition-colors ${
                filter === tab.key
                  ? 'bg-white text-brand-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Task Board */}
      {filter === 'notes' ? (
        tasksWithNotes.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">Keine Anmerkungen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasksWithNotes.map(task => {
              const statusConfig = {
                open:  { label: 'Offen',        cls: 'bg-slate-100 text-slate-500' },
                done:  { label: 'Erledigt',      cls: 'bg-emerald-100 text-emerald-700' },
                skip:  { label: 'Übersprungen',  cls: 'bg-amber-100 text-amber-700' },
              }[task.status];
              return (
                <div key={task.id} className="border border-slate-200 rounded-xl p-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${task.status === 'done' ? 'line-through text-slate-500' : ''} ${task.status === 'skip' ? 'text-slate-400' : ''}`}>
                      {task.title}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusConfig.cls}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 italic">{task.note}</p>
                </div>
              );
            })}
          </div>
        )
      ) : grouped.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">Keine Tasks gefunden</p>
          <p className="text-sm mt-1">
            {filter !== 'all' ? 'Anderen Filter wählen oder Suche anpassen.' : 'Suche anpassen.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ cluster, tasks }) => {
            const clusterProgress = getProgress(store.tasks.filter(t => t.clusterId === cluster.id));
            return (
              <section key={cluster.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide">
                      {cluster.title}
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">
                      {clusterProgress.done}/{clusterProgress.total}
                    </span>
                  </div>
                </div>
                <div className="sm:columns-2 sm:gap-3">
                  {tasks.map(task => (
                    <div key={task.id} className="mb-3 break-inside-avoid">
                      <TaskCard
                        task={task}
                        onStatus={setTaskStatus}
                        onNote={setTaskNote}
                        onAddImage={addTaskImage}
                        onRemoveImage={removeTaskImage}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Floating progress / Absenden */}
      {!allDone && progress.percent > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          {progress.percent}% erledigt
        </div>
      )}
      {allDone && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg transition-colors disabled:opacity-60"
          >
            {submitting ? 'Bericht wird gespeichert…' : 'Absenden'}
          </button>
        </div>
      )}
      </div>{/* end content */}
    </div>
  );
}
