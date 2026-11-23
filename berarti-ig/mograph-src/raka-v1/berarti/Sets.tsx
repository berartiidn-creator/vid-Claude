import React from 'react';
import {B} from './theme';

export const Bulb: React.FC<{x: number; y: number; size?: number; on: number; opacity?: number}> = ({x, y, size = 120, on, opacity = 1}) => {
  const fill = on > 0.5 ? '#FFC23D' : '#CFC8BE';
  return <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={{position: 'absolute', left: x - size / 2, top: y - size * 0.65, opacity, overflow: 'visible'}}>
    <circle cx={50} cy={45} r={60} fill="#FFC23D" opacity={0.3 * on} />
    <path d="M50 5 C24 5 10 25 10 45 C10 62 22 72 30 82 L70 82 C78 72 90 62 90 45 C90 25 76 5 50 5 Z" fill={fill} />
    <rect x={32} y={86} width={36} height={10} rx={4} fill="#6B6F6A" />
    <rect x={35} y={99} width={30} height={10} rx={4} fill="#6B6F6A" />
  </svg>;
};

export const Clock: React.FC<{x: number; y: number; size?: number; hour: number; minute: number}> = ({x, y, size = 150, hour, minute}) => {
  const ma = minute * 6, ha = (hour % 12) * 30 + minute * 0.5;
  return <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: x - size / 2, top: y - size / 2}}>
    <circle cx={50} cy={50} r={46} fill="white" stroke={B.ink} strokeWidth={6} />
    {Array.from({length: 12}).map((_, i) => <rect key={i} x={49} y={8} width={2} height={7} fill={B.ink} transform={`rotate(${i * 30} 50 50)`} />)}
    <rect x={47.5} y={24} width={5} height={28} rx={2.5} fill={B.ink} transform={`rotate(${ha} 50 50)`} />
    <rect x={48.5} y={14} width={3} height={38} rx={1.5} fill={B.orange} transform={`rotate(${ma} 50 50)`} />
    <circle cx={50} cy={50} r={4} fill={B.ink} />
  </svg>;
};

const Window: React.FC<{x: number; y: number; w: number; h: number; night?: boolean}> = ({x, y, w, h, night}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 10, background: night ? '#1E3A5F' : B.sky, border: '14px solid #FFFFFF',
    boxShadow: '0 10px 24px #0000001a', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10, marginLeft: -5, background: 'white'}} />
    <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 10, marginTop: -5, background: 'white'}} />
    {night ? <div style={{position: 'absolute', right: 40, top: 30, width: 70, height: 70, borderRadius: 35, background: '#F8E7A8', boxShadow: '0 0 40px #F8E7A8'}} />
      : <div style={{position: 'absolute', left: -20, bottom: -30, width: w + 40, height: 90, borderRadius: '50%', background: B.leaf}} />}
  </div>
);

const ChartBoard: React.FC<{x: number; y: number}> = ({x, y}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 300, height: 210, background: 'white', borderRadius: 10, boxShadow: '0 10px 24px #0000001a', padding: 26}}>
    <div style={{width: 150, height: 12, background: B.ink, borderRadius: 6, marginBottom: 20}} />
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 16, height: 110}}>
      {[50, 70, 60, 100].map((h, i) => <div key={i} style={{width: 36, height: `${h}%`, background: i === 3 ? B.orange : '#3E4A68', borderRadius: 4}} />)}
    </div>
  </div>
);

const Plant: React.FC<{x: number; y: number}> = ({x, y}) => (
  <svg width={120} height={170} viewBox="0 0 120 170" style={{position: 'absolute', left: x, top: y}}>
    {[[-30, 0], [0, -6], [30, 0], [-15, 10], [15, 10]].map(([r, dy], i) => <ellipse key={i} cx={60} cy={60 + dy} rx={16} ry={52} fill={i % 2 ? '#5F9B69' : B.leaf} transform={`rotate(${r} 60 110)`} />)}
    <path d="M30 110 L90 110 L80 168 L40 168 Z" fill="#C86B3C" />
  </svg>
);

/** Meeting room: wall, window, chart, clock, table edge at y=1180. Characters go between back and front layers. */
export const RoomBack: React.FC<{clock?: [number, number]; dim?: number}> = ({clock, dim = 0}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${B.wall}, ${B.wallDark})`}} />
    <Window x={60} y={680} w={300} h={260} />
    <ChartBoard x={700} y={690} />
    {clock && <Clock x={540} y={720} size={130} hour={clock[0]} minute={clock[1]} />}
    <Plant x={930} y={1010} />
    {dim > 0 && <div style={{position: 'absolute', inset: 0, background: '#171A18', opacity: dim}} />}
  </>
);
export const RoomTable: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: -40, right: -40, top: 1180, height: 34, background: B.woodTop, borderRadius: 8}} />
    <div style={{position: 'absolute', left: -40, right: -40, top: 1212, height: 260, background: B.wood}} />
    {[200, 540, 880].map((x) => <div key={x} style={{position: 'absolute', left: x - 70, top: 1150, width: 140, height: 40, background: '#D9D5CF', borderRadius: '8px 8px 2px 2px'}} />)}
  </>
);

export const Office: React.FC = () => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(#F4ECE1, #E9DDCC)`}} />
    <Window x={640} y={700} w={330} h={280} />
    <div style={{position: 'absolute', left: 80, top: 760, width: 300, height: 18, background: B.wood, borderRadius: 4}} />
    {['#C0583A', '#3E4A68', B.floor, '#D9A441', '#7E5C9A'].map((c, i) => <div key={i} style={{position: 'absolute', left: 100 + i * 46, top: 660 + (i % 2) * 14, width: 36, height: 100 - (i % 2) * 14, background: c, borderRadius: 4}} />)}
  </>
);
export const OfficeDesk: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 120, right: 120, top: 1180, height: 30, background: B.woodTop, borderRadius: 8}} />
    <div style={{position: 'absolute', left: 150, right: 150, top: 1208, height: 262, background: B.wood}} />
    <div style={{position: 'absolute', left: 620, top: 1040, width: 230, height: 140, background: '#2B2F36', borderRadius: '12px 12px 0 0'}} />
    <div style={{position: 'absolute', left: 600, top: 1172, width: 270, height: 14, background: '#454A52', borderRadius: 4}} />
    <div style={{position: 'absolute', left: 250, top: 1130, width: 170, height: 52, background: 'white', borderRadius: 6, transform: 'rotate(-6deg)'}} />
  </>
);

export const Bedroom: React.FC = () => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${B.night}, #0B1A13)`}} />
    <Window x={620} y={560} w={330} h={300} night />
    <div style={{position: 'absolute', left: 90, top: 980, width: 110, height: 200, background: '#2D4A3B', borderRadius: 10}} />
    <div style={{position: 'absolute', left: 70, top: 900, width: 150, height: 110, background: '#F3D9A0', borderRadius: '60px 60px 10px 10px', boxShadow: '0 0 120px 40px #F3D9A055'}} />
    <div style={{position: 'absolute', left: 760, top: 1190, width: 230, height: 90, background: '#E9E4DA', borderRadius: 40}} />
  </>
);
export const BedFront: React.FC = () => (
  <div style={{position: 'absolute', left: 200, right: 60, top: 1250, height: 220, background: '#3D5E8C', borderRadius: '30px 30px 0 0'}} />
);

export const StageBg: React.FC = () => <div style={{position: 'absolute', inset: 0, background: B.stage}} />;

export const Stairs: React.FC<{p: number}> = ({p}) => (
  <>
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 300 + i * 220, width: 900 - (300 + i * 220) + 200, top: 1470 - (i + 1) * 120 * p,
      height: (i + 1) * 120 * p, background: B.floor, borderTop: `6px solid ${B.orange}`}} />)}
  </>
);
