import { useMemo, useRef, useState } from 'react';
import type { AppData, SkipperInfo, TaskStatus } from './types';
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
  const { store, setTaskStatus, setTaskNote, addTaskImage, removeTaskImage, resetToSeed, importData, exportData } = useStore();
  const [filter, setFilter] = useState<Filter>('open');
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [skipperInfo, setSkipperInfo] = useState<SkipperInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allDone = store.tasks.every(t => t.status !== 'open');

  async function handleSubmit() {
    if (!skipperInfo || !allDone) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipper: skipperInfo, clusters: store.clusters, tasks: store.tasks }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? res.status);
      setSubmitted(true);
    } catch (err) {
      alert('Fehler: ' + String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadPdf() {
    if (!skipperInfo) return;
    const pdf = await generatePdf(store, skipperInfo, true); // mit Bildern
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdf}`;
    link.download = `check-${skipperInfo.auftragId}-${skipperInfo.name.replace(/\s+/g, '-')}.pdf`;
    link.click();
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

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boat-check-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  }

  function handleImport() {
    fileRef.current?.click();
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string) as AppData;
        if (imported.clusters?.length && imported.tasks?.length) {
          importData(imported);
          setShowMenu(false);
        } else {
          alert('Ungültige Datei: clusters oder tasks fehlen.');
        }
      } catch {
        alert('Datei konnte nicht gelesen werden.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (confirm('Alle Daten zurücksetzen? Aktuelle Daten gehen verloren.')) {
      resetToSeed();
      setFilter('open');
      setSearch('');
      setShowMenu(false);
    }
  }

  function setAllClusterStatus(clusterId: string, status: TaskStatus) {
    store.tasks
      .filter(t => t.clusterId === clusterId && t.status !== status)
      .forEach(t => setTaskStatus(t.id, status));
  }

  if (!skipperInfo) return <SkipperForm onSubmit={setSkipperInfo} />;

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Erfolgreich eingereicht</h1>
          <p className="text-slate-500 text-sm mb-6">Die Checkliste wurde als PDF an Seatribe Deliveries gesendet.</p>
          <button
            onClick={() => { resetToSeed(); setSubmitted(false); setSkipperInfo(null); setFilter('open'); }}
            className="px-6 py-2.5 text-sm font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition-colors"
          >
            Neue Checkliste starten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bootsübernahme-Check</h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-colors text-slate-600"
            aria-label="Menü"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 z-20 py-1">
                <button onClick={handleExport} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 active:bg-slate-100">
                  Export JSON
                </button>
                <button onClick={handleImport} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 active:bg-slate-100">
                  Import JSON
                </button>
                <hr className="my-1 border-slate-100" />
                <button onClick={handleReset} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 active:bg-red-100">
                  Reset auf Seed
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <input type="file" ref={fileRef} accept=".json" onChange={onFileSelected} className="hidden" />

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full mb-3 py-2 text-sm font-medium rounded-xl bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300 transition-colors"
      >
        Zurücksetzen
      </button>

      {/* Progress */}
      <div className="mb-4">
        <ProgressBar {...progress} />
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Suche..."
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-200 rounded-xl p-1" role="tablist" aria-label="Status-Filter">
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
                  ? 'bg-white text-slate-900 shadow-sm'
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
        <div className="space-y-6">
          {grouped.map(({ cluster, tasks }) => {
            const clusterProgress = getProgress(store.tasks.filter(t => t.clusterId === cluster.id));
            return (
              <section key={cluster.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      {cluster.title}
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">
                      {clusterProgress.done}/{clusterProgress.total}
                    </span>
                  </div>
                  {filter === 'open' && tasks.length > 0 && (
                    <button
                      onClick={() => setAllClusterStatus(cluster.id, 'done')}
                      className="text-xs px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:bg-emerald-300 font-medium transition-colors"
                      title="Alle in dieser Gruppe erledigen"
                    >
                      Alle &#10003;
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatus={setTaskStatus}
                      onNote={setTaskNote}
                      onAddImage={addTaskImage}
                      onRemoveImage={removeTaskImage}
                    />
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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          <button
            onClick={handleDownloadPdf}
            className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg transition-colors"
          >
            PDF herunterladen
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg transition-colors disabled:opacity-60"
          >
            {submitting ? 'Wird gesendet…' : 'Absenden'}
          </button>
        </div>
      )}
    </div>
  );
}
