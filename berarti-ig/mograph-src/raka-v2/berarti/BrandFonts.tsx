import React from 'react';
import {staticFile} from 'remotion';
// Archivo and Poppins (SIL OFL, licences in public/fonts/brand).
export const BrandFonts: React.FC = () => (
  <style>{`
    @font-face {font-family:'Brand Head';src:url('${staticFile('fonts/brand/archivo-latin-800-normal.woff2')}') format('woff2');font-weight:700 800;}
    @font-face {font-family:'Brand Head';src:url('${staticFile('fonts/brand/archivo-latin-900-normal.woff2')}') format('woff2');font-weight:900;}
    @font-face {font-family:'Brand Body';src:url('${staticFile('fonts/brand/poppins-latin-500-normal.woff2')}') format('woff2');font-weight:400 500;}
    @font-face {font-family:'Brand Body';src:url('${staticFile('fonts/brand/poppins-latin-600-normal.woff2')}') format('woff2');font-weight:600;}
    @font-face {font-family:'Brand Body';src:url('${staticFile('fonts/brand/poppins-latin-700-normal.woff2')}') format('woff2');font-weight:700 800;}
    @font-face {font-family:'Brand Black';src:url('${staticFile('fonts/brand/archivo-black-latin-400-normal.woff2')}') format('woff2');font-weight:400 900;}
  `}</style>
);
