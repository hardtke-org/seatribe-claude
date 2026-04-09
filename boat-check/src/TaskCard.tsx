import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Task, TaskStatus } from './types';
import { saveImage, getImage, deleteImage } from './imageStore';

interface Props {
  task: Task;
  onStatus: (id: string, status: TaskStatus) => void;
  onNote: (id: string, note: string) => void;
  onAddImage: (taskId: string, imageId: string) => void;
  onRemoveImage: (taskId: string, imageId: string) => void;
}

const SWIPE_THRESHOLD = 80;

export function TaskCard({ task, onStatus, onNote, onAddImage, onRemoveImage }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [editing, setEditing] = useState(false);
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const pointerId = useRef<number | null>(null);

  // Load images from IndexedDB when imageIds change
  useEffect(() => {
    const ids = task.imageIds ?? [];
    if (ids.length === 0) { setImages([]); return; }
    let cancelled = false;
    Promise.all(ids.map(async id => ({ id, url: (await getImage(id)) ?? '' })))
      .then(result => { if (!cancelled) setImages(result.filter(r => r.url)); });
    return () => { cancelled = true; };
  }, [task.imageIds]);

  function onPointerDown(e: PointerEvent) {
    if (editing) return;
    if ((e.target as HTMLElement).closest('button, textarea, input')) return;
    pointerId.current = e.pointerId;
    startX.current = e.clientX;
    startY.current = e.clientY;
    locked.current = false;
    setSwiping(false);
    ref.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (pointerId.current === null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (!locked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      locked.current = true;
      if (Math.abs(dy) > Math.abs(dx)) {
        pointerId.current = null;
        setOffsetX(0);
        return;
      }
      setSwiping(true);
    }

    if (swiping || (locked.current && Math.abs(dx) >= Math.abs(dy))) {
      setSwiping(true);
      setOffsetX(dx);
    }
  }

  function onPointerUp() {
    if (pointerId.current === null) return;
    pointerId.current = null;

    if (Math.abs(offsetX) > SWIPE_THRESHOLD) {
      if (offsetX < 0) {
        onStatus(task.id, task.status === 'done' ? 'open' : 'done');
      } else {
        onStatus(task.id, task.status === 'skip' ? 'open' : 'skip');
      }
    }

    setSwiping(false);
    setOffsetX(0);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      const id = crypto.randomUUID();
      const dataUrl = await readAsDataUrl(file);
      await saveImage(id, dataUrl);
      onAddImage(task.id, id);
    }
    e.target.value = '';
  }

  async function handleRemoveImage(imageId: string) {
    await deleteImage(imageId);
    onRemoveImage(task.id, imageId);
  }

  const statusColors: Record<TaskStatus, string> = {
    open: 'bg-white border-slate-200',
    done: 'bg-emerald-50 border-emerald-200',
    skip: 'bg-slate-50 border-slate-300',
  };

  const swipeBg =
    offsetX < -30 ? 'bg-emerald-500' :
    offsetX > 30 ? 'bg-amber-500' : 'bg-transparent';

  const swipeLabel =
    offsetX < -SWIPE_THRESHOLD / 2 ? 'Erledigt' :
    offsetX > SWIPE_THRESHOLD / 2 ? 'Übersprungen' : '';

  return (
    <>
      <div className="relative overflow-hidden rounded-xl">
        {/* Swipe background */}
        <div className={`absolute inset-0 ${swipeBg} flex items-center justify-between px-4 text-white text-sm font-semibold rounded-xl`}>
          <span>{offsetX > 0 ? swipeLabel : ''}</span>
          <span>{offsetX < 0 ? swipeLabel : ''}</span>
        </div>

        {/* Card */}
        <div
          ref={ref}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            transform: `translateX(${offsetX}px)`,
            transition: swiping ? 'none' : 'transform 0.3s ease-out',
          }}
          className={`relative border rounded-xl p-4 select-none touch-pan-y ${statusColors[task.status]} ${swiping ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className={`text-sm leading-snug break-words ${task.status === 'done' ? 'line-through text-slate-500' : ''} ${task.status === 'skip' ? 'text-slate-400' : ''}`}>
                {task.title}
              </p>

              {/* Note */}
              {editing ? (
                <textarea
                  autoFocus
                  defaultValue={task.note || ''}
                  onBlur={(e) => { onNote(task.id, e.target.value); setEditing(false); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onNote(task.id, (e.target as HTMLTextAreaElement).value);
                      setEditing(false);
                    }
                  }}
                  className="mt-2 w-full max-w-full text-base border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white leading-relaxed box-border resize-none"
                  rows={2}
                  placeholder="Notiz..."
                />
              ) : task.note ? (
                <p onClick={() => setEditing(true)} className="mt-2 text-xs text-slate-500 leading-relaxed cursor-pointer border-l-2 border-slate-300 pl-2">
                  {task.note}
                </p>
              ) : null}

              {/* Image thumbnails */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 max-w-full">
                  {images.map(img => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt=""
                        onClick={() => setLightbox(img.url)}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 cursor-pointer shadow-sm"
                      />
                      <button
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
                        title="Bild entfernen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            {/* Dokumentations-Aktionen – links */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="text-sm px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300 font-medium transition-colors"
                title="Notiz"
              >
                &#9998;
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-sm px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300 font-medium transition-colors"
                title="Foto hinzufügen"
              >
                &#128247;
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {/* Status-Aktionen – rechts, daumenfreundlich */}
            <div className="flex items-center gap-4">
              {task.status !== 'open' && (
                <button
                  onClick={() => onStatus(task.id, 'open')}
                  className="text-sm px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 font-medium transition-colors"
                  title="Zurück auf Offen"
                >
                  &#8617;
                </button>
              )}
              {task.status !== 'skip' && (
                <button
                  onClick={() => onStatus(task.id, 'skip')}
                  className="text-base px-4 py-2.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 active:bg-amber-300 font-medium transition-colors"
                  title="Nicht prüfen"
                >
                  &#10680;
                </button>
              )}
              {task.status !== 'done' && (
                <button
                  onClick={() => onStatus(task.id, 'done')}
                  className="text-base px-4 py-2.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:bg-emerald-300 font-medium transition-colors"
                  title="Erledigt"
                >
                  &#10003;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
