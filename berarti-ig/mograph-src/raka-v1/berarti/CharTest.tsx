import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character, RAKA} from './Character';
export const CharTest: React.FC = () => {
  const t = useCurrentFrame() / 60;
  const poses = ['stand', 'present', 'offer', 'raise', 'think', 'hold'] as const;
  const moods = ['smile', 'nervous', 'sad', 'think', 'surprised', 'talk'] as const;
  return <AbsoluteFill style={{background: '#FAF3ED'}}>
    {poses.map((p, i) => <Character key={p} t={t} x={180 + (i % 3) * 360} y={60 + Math.floor(i / 3) * 620} height={560} pose={p} mood={moods[i]} />)}
    <Character t={t} x={180} y={1300} height={560} seated mood="nervous" pose="hold" />
    <Character t={t} x={540} y={1300} height={560} look={{hair: 'hijab', hijab: '#B5835A', top: '#C9A27E', topDark: '#A88360', blazer: false, clicker: false, skin: '#E9B892', pants: '#5A4636'}} mood="smile" />
    <Character t={t} x={900} y={1300} height={560} look={{hair: 'curly', hairColor: '#1F1712', top: '#3F4A6B', topDark: '#323B57', blazer: false, clicker: false, skin: '#B97F58', pants: '#2F3646', glasses: true}} mood="talk" />
  </AbsoluteFill>;
};
