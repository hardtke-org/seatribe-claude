import { useRef, useState, type PointerEvent } from 'react';
import type { Task, TaskStatus } from './types';

interface Props {
  task: Task;
  onStatus: (id: string, status: TaskStatus) => void;
  onNote: (id: string, note: string) => void;
}

const SWIPE_THRESHOLD = 80;

export function TaskCard({ task, onStatus, onNote }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [editing, setEditing] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const pointerId = useRef<number | null>(null);

  function onPointerDown(e: PointerEvent) {
    if (editing) return;
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

    // Lock direction after 10px movement
    if (!locked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      locked.current = true;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical scroll - abort swipe
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
        // Swipe left = done
        onStatus(task.id, task.status === 'done' ? 'open' : 'done');
      } else {
        // Swipe right = skip
        onStatus(task.id, task.status === 'skip' ? 'open' : 'skip');
      }
    }

    setSwiping(false);
    setOffsetX(0);
  }

  const statusColors: Record<TaskStatus, string> = {
    open: 'bg-white border-slate-200',
    done: 'bg-emerald-50 border-emerald-300',
    skip: 'bg-slate-100 border-slate-300 opacity-60',
  };

  const swipeBg =
    offsetX < -30 ? 'bg-emerald-500' :
    offsetX > 30 ? 'bg-amber-500' : 'bg-transparent';

  const swipeLabel =
    offsetX < -SWIPE_THRESHOLD / 2 ? 'Erledigt' :
    offsetX > SWIPE_THRESHOLD / 2 ? 'Übersprungen' : '';

  return (
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
        className={`relative border rounded-xl p-3 select-none touch-pan-y ${statusColors[task.status]} ${swiping ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Status badge */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-snug ${task.status === 'done' ? 'line-through text-slate-500' : ''} ${task.status === 'skip' ? 'text-slate-400' : ''}`}>
              {task.title}
            </p>

            {/* Note display / edit */}
            {editing ? (
              <textarea
                autoFocus
                defaultValue={task.note || ''}
                onBlur={(e) => {
                  onNote(task.id, e.target.value);
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onNote(task.id, (e.target as HTMLTextAreaElement).value);
                    setEditing(false);
                  }
                }}
                className="mt-2 w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                rows={2}
                placeholder="Notiz..."
              />
            ) : task.note ? (
              <p
                onClick={() => setEditing(true)}
                className="mt-1 text-xs text-slate-500 italic cursor-pointer"
              >
                {task.note}
              </p>
            ) : null}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 mt-2">
          {task.status !== 'done' && (
            <button
              onClick={() => onStatus(task.id, 'done')}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:bg-emerald-300 font-medium transition-colors"
              title="Erledigt"
            >
              &#10003;
            </button>
          )}
          {task.status !== 'skip' && (
            <button
              onClick={() => onStatus(task.id, 'skip')}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 active:bg-amber-300 font-medium transition-colors"
              title="Nicht prüfen"
            >
              &#10680;
            </button>
          )}
          {task.status !== 'open' && (
            <button
              onClick={() => onStatus(task.id, 'open')}
              className="text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 font-medium transition-colors"
              title="Zurück auf Offen"
            >
              &#8617;
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300 font-medium transition-colors ml-auto"
            title="Notiz"
          >
            &#9998;
          </button>
        </div>
      </div>
    </div>
  );
}
