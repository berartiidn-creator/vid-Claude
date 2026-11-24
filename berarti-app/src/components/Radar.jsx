import { DIMS } from '../../shared/index-model.js';
// 6-axis radar in SVG (no chart library)
export default function Radar({ scores, size = 300, labels = true, color = '#FF5500' }) {
  const c = size / 2, R = size * (labels ? .29 : .44), n = DIMS.length;
  const pt = (i, v) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v]; };
  const poly = DIMS.map((d, i) => pt(i, (scores[d.id] || 0) / 100).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size, overflow: 'visible' }} role="img" aria-label="Radar 6 dimensi">
      {[.25, .5, .75, 1].map(k => <polygon key={k} points={DIMS.map((_, i) => pt(i, k).join(',')).join(' ')} fill="none" stroke="#E3D6C8" strokeWidth="1.5" />)}
      {DIMS.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#E3D6C8" strokeWidth="1.5" />; })}
      <polygon points={poly} fill={color} fillOpacity=".28" stroke={color} strokeWidth="3" strokeLinejoin="round" />
      {DIMS.map((d, i) => { const [x, y] = pt(i, (scores[d.id] || 0) / 100); return <circle key={d.id} cx={x} cy={y} r="4.5" fill={color} />; })}
      {labels && DIMS.map((d, i) => { const [x, y] = pt(i, 1.3); return <text key={d.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size * .037} fontWeight="600" fill="#33372F" fontFamily="Poppins, sans-serif">{d.name}</text>; })}
    </svg>
  );
}
