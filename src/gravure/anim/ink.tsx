// Boîte à outils « gravure » pour les animations dessinées en code : hachures (motifs SVG), trait d'encre tremblé
// (filtre), ombrage hachuré qui s'efface vers la lumière (masque en dégradé). Tout ce qui est dessiné doit avoir l'air
// gravé au burin, comme les images du domaine public à côté : jamais d'aplat seul.
import React from 'react';

/** motifs de hachures et filtre de trait tremblé, préfixés par `p` (plusieurs SVG dans la même image) */
export const InkDefs: React.FC<{p: string; ink?: string}> = ({p, ink = '#1A120A'}) => (
  <defs>
    {([['hl', 10, 1.1, 45], ['hm', 6.5, 1.4, 45], ['hd', 4.2, 1.6, 45], ['hx', 6.5, 1.3, -45], ['hh', 7, 1.2, 0], ['hv', 7, 1.2, 90]] as const).map(([id, sp, w, a]) => (
      <pattern key={id} id={`${p}-${id}`} width={sp} height={sp} patternUnits="userSpaceOnUse" patternTransform={`rotate(${a})`}>
        <line x1={0} y1={0} x2={0} y2={sp} stroke={ink} strokeWidth={w} />
      </pattern>
    ))}
    <filter id={`${p}-wob`} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
);

/** ombrage hachuré d'une forme `d` : dense du côté `from`, nul du côté `to` (fractions de la boîte [x, y, w, h]) */
export const Shade: React.FC<{p: string; id: string; d: string; box: [number, number, number, number]; from?: [number, number]; to?: [number, number]; hatch?: string; cross?: boolean; o?: number}> = ({p, id, d, box, from = [1, 1], to = [0.3, 0.2], hatch = 'hm', cross, o = 1}) => {
  const [x, y, w, h] = box;
  return (
    <g opacity={o}>
      <defs>
        <clipPath id={`${p}-c-${id}`}><path d={d} /></clipPath>
        <linearGradient id={`${p}-g-${id}`} gradientUnits="userSpaceOnUse" x1={x + from[0] * w} y1={y + from[1] * h} x2={x + to[0] * w} y2={y + to[1] * h}>
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id={`${p}-m-${id}`}><rect x={x - 20} y={y - 20} width={w + 40} height={h + 40} fill={`url(#${p}-g-${id})`} /></mask>
      </defs>
      <g clipPath={`url(#${p}-c-${id})`} mask={`url(#${p}-m-${id})`}>
        <rect x={x - 20} y={y - 20} width={w + 40} height={h + 40} fill={`url(#${p}-${hatch})`} />
        {cross ? <rect x={x - 20} y={y - 20} width={w + 40} height={h + 40} fill={`url(#${p}-hx)`} /> : null}
      </g>
    </g>
  );
};

/** forme gravée complète : fond, ombrage hachuré, contour d'encre tremblé */
export const Engraved: React.FC<{p: string; id: string; d: string; box: [number, number, number, number]; fill: string; ink?: string; stroke?: number; from?: [number, number]; to?: [number, number]; hatch?: string; cross?: boolean}> = ({p, id, d, box, fill, ink = '#1A120A', stroke = 4, from, to, hatch, cross}) => (
  <g>
    <path d={d} fill={fill} />
    <Shade p={p} id={id} d={d} box={box} from={from} to={to} hatch={hatch} cross={cross} />
    <path d={d} fill="none" stroke={ink} strokeWidth={stroke} strokeLinejoin="round" filter={`url(#${p}-wob)`} />
  </g>
);
