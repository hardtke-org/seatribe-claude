interface Props {
  done: number;
  total: number;
  percent: number;
  label: string;
}

export function ProgressBar({ percent, label }: Props) {
  const color =
    percent === 100 ? 'bg-emerald-500' :
    percent >= 60 ? 'bg-blue-500' :
    percent >= 30 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{percent}%</span>
      </div>
      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
