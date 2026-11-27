import React from 'react';
import {staticFile} from 'remotion';

// Archivo Black for display type, Montserrat for everything else (both SIL OFL, bundled in public/fonts).
export const FontFaces: React.FC = () => (
  <style>{`
    @font-face {font-family:'Archivo Black';src:url('${staticFile('fonts/ArchivoBlack.woff2')}') format('woff2');font-weight:400;}
    @font-face {font-family:'Montserrat';src:url('${staticFile('fonts/Montserrat-500.woff2')}') format('woff2');font-weight:500;}
    @font-face {font-family:'Montserrat';src:url('${staticFile('fonts/Montserrat-600.woff2')}') format('woff2');font-weight:600;}
    @font-face {font-family:'Montserrat';src:url('${staticFile('fonts/Montserrat-700.woff2')}') format('woff2');font-weight:700;}
    @font-face {font-family:'Montserrat';src:url('${staticFile('fonts/Montserrat-800.woff2')}') format('woff2');font-weight:800;}
    @font-face {font-family:'Mograph Mono';src:url('${staticFile('fonts/DejaVuSansMono.ttf')}') format('truetype');font-weight:400 800;}
  `}</style>
);
