// Animations sur mesure de la vidéo 21 (Alexis Saint-Martin et la ficelle de Beaumont), style planche d'anatomie :
// Estomac : estomac dessiné à l'encre (hachures), la fistule ouverte dans la paroi et la peau ; la ficelle descend par
//   le trou (`down` s), la viande se dissout dans le suc gastrique entre `from` et `to`, horloge « 1 h, 2 h, 3 h » ;
//   mode trou : seulement l'estomac et la fistule qui s'ouvre (chapitre un).
// Bocal : la même viande se dissout dans un bocal de suc gastrique, hors du corps.
import React from 'react';
import {clamp01, easeInOut, easeOut, lerp, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {GF} from '../Gravure';

const INK = '#2C1A0E';
const RED = '#A8201C';
const PAPER = '#F0E4C8';

const STOMACH = 'M 500 430 C 500 520, 486 580, 456 630 C 372 700, 334 830, 386 940 C 446 1066, 618 1104, 744 1036 C 824 990, 862 912, 850 846 C 912 816, 972 806, 1010 812 L 1010 768 C 960 760, 896 768, 852 790 C 806 812, 730 870, 652 850 C 574 830, 548 744, 548 640 C 548 576, 552 510, 556 430 Z';
const HOLE = {x: 372, y: 820};

/** morceau de viande irrégulier, rayon r, dents qui s'accentuent quand il fond (eat 0 → 1) */
const Meat: React.FC<{x: number; y: number; r: number; eat: number; seed: number}> = ({x, y, r, eat, seed}) => {
  const n = 14;
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.82 + 0.25 * rand(seed + i * 1.3) - eat * 0.35 * rand(seed + i * 7.1));
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr * 0.8}`;
  });
  return (
    <g>
      <polygon points={pts.join(' ')} fill="#8E3B2C" stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${x - r * 0.5} ${y - r * 0.3 + i * r * 0.3} q ${r * 0.5} ${-r * 0.15} ${r} 0`} stroke="#5A1E16" strokeWidth={3} fill="none" opacity={0.7} />)}
    </g>
  );
};

const Hatch: React.FC<{clip: string}> = ({clip}) => (
  <g clipPath={`url(#${clip})`}>
    {Array.from({length: 60}, (_, i) => <line key={i} x1={300 + i * 14} y1={420} x2={150 + i * 14} y2={1120} stroke={INK} strokeWidth={1.4} opacity={0.35} />)}
  </g>
);

export const Estomac: React.FC<AnimProps> = ({lt: lt0, t, p}) => {
  const mode = String(p.mode ?? 'ficelle');
  // instant : planche déjà dessinée, ficelle déjà descendue (seule la dissolution `from` → `to` reste animée)
  const lt = p.instant ? lt0 + 10 : lt0;
  const eatT = p.instant ? lt0 : lt0;
  const draw = easeInOut(clamp01(lt / 0.8));
  const holeK = prog(lt, mode === 'trou' ? 0.5 : 0, mode === 'trou' ? 0.9 : 0.01, easeOut);
  const down = Number(p.down ?? 0.9), from = Number(p.from ?? 1.0), to = Number(p.to ?? 3.0);
  const d = easeOut(clamp01((lt - 0.2) / down));
  const eat = p.instant && p.from === undefined ? 0 : clamp01((eatT - from) / (to - from));
  const hours = Math.min(3, Math.floor(eat * 3.2) + (eat > 0 ? 1 : 0));
  // la ficelle : du haut, jusqu'au trou, puis dans l'estomac jusqu'à la viande
  const top = {x: 250, y: 300}, food = {x: 560, y: 930};
  const seg1 = clamp01(d * 2), seg2 = clamp01(d * 2 - 1);
  const p1 = {x: lerp(top.x, HOLE.x, seg1), y: lerp(top.y, HOLE.y, seg1)};
  const p2 = {x: lerp(HOLE.x, food.x, seg2), y: lerp(HOLE.y, food.y, seg2)};
  const meat = seg2 >= 1 ? food : seg1 >= 1 ? p2 : p1;
  const acid = mode === 'trou' ? 0 : prog(lt, 0.3, 1.2) * (0.55 + 0.1 * Math.sin(t * 2));
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <defs><clipPath id="stc"><path d={STOMACH} /></clipPath></defs>
        {/* suc gastrique au fond */}
        <g clipPath="url(#stc)"><rect x={300} y={lerp(1120, 900, acid)} width={760} height={400} fill={RED} opacity={0.22} /></g>
        <Hatch clip="stc" />
        <path d={STOMACH} fill="none" stroke={INK} strokeWidth={6} pathLength={1} strokeDasharray={`${draw} 1`} />
        {/* peau (paroi du ventre) */}
        <path d="M 300 560 C 290 680, 316 760, 300 880 C 290 980, 306 1050, 300 1110" stroke={INK} strokeWidth={4} fill="none" strokeDasharray="10 8" opacity={draw} />
        {/* fistule : le trou qui traverse peau et paroi */}
        <ellipse cx={HOLE.x - 30} cy={HOLE.y} rx={46 * holeK} ry={24 * holeK} fill={INK} />
        <ellipse cx={HOLE.x - 30} cy={HOLE.y} rx={46 * holeK} ry={24 * holeK} fill="none" stroke={RED} strokeWidth={5} />
        {mode !== 'trou' ? (
          <>
            <polyline points={`${top.x},${top.y} ${p1.x},${p1.y}${seg1 >= 1 ? ` ${p2.x},${p2.y}` : ''}`} stroke="#D8C9A6" strokeWidth={4} fill="none" />
            <polyline points={`${top.x},${top.y} ${p1.x},${p1.y}${seg1 >= 1 ? ` ${p2.x},${p2.y}` : ''}`} stroke={INK} strokeWidth={1.6} fill="none" strokeDasharray="6 4" />
            <Meat x={meat.x} y={meat.y + 30} r={62 * (1 - eat * 0.78)} eat={eat} seed={3} />
            {eat > 0 ? Array.from({length: 10}, (_, i) => {
              const ph = (t * 0.8 + rand(i) ) % 1;
              return <circle key={i} cx={food.x - 80 + rand(i * 3) * 160} cy={food.y + 70 - ph * 180} r={4 + rand(i * 5) * 6} fill="none" stroke={RED} strokeWidth={2.5} opacity={(1 - ph) * 0.8} />;
            }) : null}
          </>
        ) : null}
        {/* légendes à la plume */}
        <path d={`M ${HOLE.x - 76} ${HOLE.y} L 200 760 H 120`} stroke={RED} strokeWidth={2.5} fill="none" opacity={holeK} />
        {mode !== 'trou' ? <path d="M 760 1000 L 860 1080 H 950" stroke={RED} strokeWidth={2.5} fill="none" opacity={acid > 0.3 ? 1 : 0} /> : null}
      </svg>
      <div style={{position: 'absolute', left: 90, top: 712, fontFamily: GF.serif, fontStyle: 'italic', fontSize: 40, color: RED, opacity: holeK}}>la fistule</div>
      <div style={{position: 'absolute', left: 250, top: 1120, fontFamily: GF.serif, fontStyle: 'italic', fontSize: 34, color: INK, opacity: draw * 0.8}}>la peau</div>
      {mode !== 'trou' ? <div style={{position: 'absolute', left: 800, top: 1086, fontFamily: GF.serif, fontStyle: 'italic', fontSize: 38, color: RED, opacity: acid > 0.3 ? 1 : 0}}>suc gastrique</div> : null}
      {mode !== 'trou' && eat > 0 ? <div style={{position: 'absolute', right: 110, top: 330, fontFamily: GF.serif, fontSize: 120, color: INK}}>{hours} h</div> : null}
    </>
  );
};

/** bocal de suc gastrique : la viande s'y dissout hors du corps (from → to) */
export const Bocal: React.FC<AnimProps> = ({lt, t, p}) => {
  const from = Number(p.from ?? 0.4), to = Number(p.to ?? 2.2);
  const eat = clamp01((lt - from) / (to - from));
  const k = prog(lt, 0, 0.5, easeOut);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} opacity={k}>
      <rect x={380} y={520} width={320} height={60} rx={12} fill="#B9A27A" stroke={INK} strokeWidth={5} />
      <path d="M 400 580 L 400 600 C 330 640, 320 700, 320 760 L 320 1120 C 320 1180, 360 1210, 420 1210 L 660 1210 C 720 1210, 760 1180, 760 1120 L 760 760 C 760 700, 750 640, 680 600 L 680 580 Z" fill={PAPER} fillOpacity={0.35} stroke={INK} strokeWidth={6} />
      <path d={`M 324 ${820 + Math.sin(t * 2) * 6} C 450 ${800 - Math.sin(t * 2) * 8}, 620 ${840 + Math.sin(t * 2) * 8}, 756 ${816} L 756 1120 C 756 1176, 720 1206, 660 1206 L 420 1206 C 360 1206, 324 1176, 324 1120 Z`} fill={RED} opacity={0.3} />
      <path d="M 350 700 C 340 800, 340 980, 352 1120" stroke="#FFFFFF" strokeWidth={10} opacity={0.35} fill="none" strokeLinecap="round" />
      <Meat x={540} y={1060} r={80 * (1 - eat * 0.8)} eat={eat} seed={11} />
      {Array.from({length: 12}, (_, i) => {
        const ph = (t * 0.7 + rand(i * 2.1)) % 1;
        return <circle key={i} cx={400 + rand(i * 3.3) * 280} cy={1150 - ph * 320} r={4 + rand(i * 5.5) * 7} fill="none" stroke={RED} strokeWidth={2.5} opacity={(1 - ph) * 0.7 * clamp01(eat * 4)} />;
      })}
      <text x={540} y={500} textAnchor="middle" fontFamily={GF.serif} fontStyle="italic" fontSize={44} fill={RED}>suc gastrique, hors du corps</text>
    </svg>
  );
};

export const ESTOMAC = {Estomac, Bocal};
