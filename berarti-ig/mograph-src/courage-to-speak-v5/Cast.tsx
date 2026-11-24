import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArtiRig, BASE, C, Look, ARTI, RigPose} from './Rig';
import {B} from './theme';

export const RAKA = ARTI;
export const SARI: Look = {...C, hair: 'hijab', pocket: false, skin: '#EDB48C', skinShade: '#D89A72', hijab: '#C9826B', hijabShade: '#B06F5A',
  blazer: '#3F4E73', blazerShade: '#334061', tee: '#F3E9DA', pants: '#5B5F6B', pantsShade: '#4C505B', lip: '#A0483E'};
export const NADIA: Look = {...C, hair: 'hijab', pocket: false, skin: '#E3A47A', skinShade: '#CC8A62', hijab: '#2F4A6B', hijabShade: '#263D59',
  blazer: '#D9A441', blazerShade: '#C08F33', tee: '#FFFFFF', pants: '#3D3F48', pantsShade: '#33353D', lip: '#9A4038'};
export const BIMO: Look = {...C, hair: 'curly', pocket: true, skin: '#C98B62', skinShade: '#B0744E', blazer: '#4C6E9E', blazerShade: '#3E5C86',
  tee: '#F0EEE8', pants: '#4A4F5C', pantsShade: '#3E434E', lip: '#6E2E24'};

const idle: RigPose = {...BASE, armR: {s: 8, e: 4, h: 0, hand: 'relaxed'}, mouth: 'calm'};
export const CastTest: React.FC = () => {
  const t = useCurrentFrame() / 60;
  return <AbsoluteFill style={{background: B.stage}}>
    {[RAKA, SARI, BIMO, NADIA].map((l, i) => <ArtiRig key={i} t={t} phase={i * 0.9} pose={{...idle, mouth: i % 2 ? 'smile' : 'calm', armR: {...idle.armR, hand: i === 0 ? 'clicker' : 'relaxed'}}} look={l} x={150 + i * 260} y={420} height={1050} />)}
  </AbsoluteFill>;
};
