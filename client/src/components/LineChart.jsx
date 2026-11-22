// Simple line chart. data = [{ label: 'Jan', count: 3 }, ...]
export default function LineChart({ data }) {
  if (!data?.length) return null;

  const W = 400;
  const H = 170;
  const padX = 24;
  const padTop = 22;
  const padBottom = 28;

  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (W - padX * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => ({
    ...d,
    x: padX + i * stepX,
    y: padTop + (1 - d.count / max) * (H - padTop - padBottom),
  }));

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${points[points.length - 1].x},${H - padBottom} L${points[0].x},${H - padBottom} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Orders in the last months">
      <path d={area} fill="#243b35" opacity="0.08" />
      <path d={line} fill="none" stroke="#243b35" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#243b35" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="#243b35">
            {p.count}
          </text>
          <text x={p.x} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b7280">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}