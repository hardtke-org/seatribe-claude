import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const IC: Record<string, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  id: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M6 16c.6-1.6 5.4-1.6 6 0M15 10h3M15 14h3" /></>,
  play: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9.5v5l4.5-2.5z" /></>,
  doc: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></>,
  pen: <><path d="M4 20l1-4L16 5l3 3L8 19z" /><path d="M14 7l3 3" /></>,
  clip: <><rect x="6" y="5" width="12" height="16" rx="2" /><path d="M9 5V3h6v2M9 11l1.5 1.5L13 10M9 16h6" /></>,
  key: <><circle cx="8" cy="14" r="3.5" /><path d="M10.5 11.5L19 3M15 7l3 3" /></>,
  users: <><circle cx="9" cy="9" r="3" /><path d="M3 19c.8-4 11.2-4 12 0" /><circle cx="17" cy="8" r="2.3" /><path d="M17 13c2.4 0 3.6 1.4 4 3.5" /></>,
  anchor: <><circle cx="12" cy="5" r="2" /><path d="M12 7v13M8 11h8M5 14c.5 4 3.5 6 7 6s6.5-2 7-6" /></>,
  alert: <><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17v.5" /></>,
  flag: <path d="M6 21V4M6 5h11l-2 3.5 2 3.5H6" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  euro: <path d="M17 6.5A6.5 6.5 0 1 0 17 17.5M4 10.5h9M4 13.5h9" />,
  chev: <path d="M9 6l6 6-6 6" />,
  left: <path d="M15 6l-6 6 6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

export function Icon({ n, className }: { n: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {IC[n]}
    </svg>
  );
}

export function Top() {
  return (
    <header className="top">
      <img src="/logo-192.png" alt="Seatribe Deliveries" />
      <div>
        <div className="name">Skipper App</div>
        <div className="tag">Seatribe Deliveries</div>
      </div>
    </header>
  );
}

export function Nav({ to, label, konto = true, right }: { to: string; label: string; konto?: boolean; right?: ReactNode }) {
  return (
    <div className="nav">
      <Link className="back" to={to}><Icon n="left" />{label}</Link>
      {right ?? (konto && <Link className="back" to="/konto">Mein Konto</Link>)}
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  unit?: string;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
}

export function Field({ id, label, value, onChange, hint, unit, type = 'text', ...rest }: FieldProps) {
  const input = (
    <input id={id} className={unit ? undefined : 'inp'} type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
  );
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {unit ? <span className="unit">{input}<b>{unit}</b></span> : input}
      {hint && <small>{hint}</small>}
    </label>
  );
}

interface OptProps { name: string; value: string; checked: boolean; onChange: () => void; title: string; sub: string; type?: 'radio' | 'checkbox' }

export function Opt({ name, value, checked, onChange, title, sub, type = 'radio' }: OptProps) {
  const id = `${name}-${value}`;
  return (
    <label className="opt" htmlFor={id}>
      <input type={type} id={id} name={name} value={value} checked={checked} onChange={onChange} />
      <span><span className="ot">{title}</span><br /><span className="os">{sub}</span></span>
    </label>
  );
}
