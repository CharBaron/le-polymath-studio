// Animations sur mesure de la vidéo 21 (Alexis Saint-Martin et la ficelle de Beaumont), style planche d'anatomie.
// Base : la vraie planche de l'estomac (Gray's Anatomy, fig. 1050), sur laquelle on grave :
// Estomac : mode trou = coup de mousquet (éclair, fumée hachurée), la fistule s'ouvre dans la paroi ; mode ficelle = un fil de
//   soie torsadé descend par la fistule, la viande (gravée, fibres et hachures) se dissout dans le suc gastrique entre `from` et
//   `to`, une montre de gousset compte les heures ; instant = tout est déjà en place.
// Bocal : bocal de verre (reflets, bouchon de liège, étiquette), la viande s'y dissout hors du corps.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp01, easeInOut, easeOut, lerp, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {GF} from '../Gravure';
import {InkDefs, Shade} from './ink';

const INK = '#2C1A0E';
const RED = '#A8201C';
// planche affichée : coin haut-gauche (41, 456), image utile 900 × 589 à +9 px (bord du papier)
const X = (fx: number) => 50 + 900 * fx, Y = (fy: number) => 465.5 + 589 * fy;
const HOLE = {x: X(0.955), y: Y(0.4)};
const FOOD = {x: X(0.78), y: Y(0.52)};
const TOP = {x: 1010, y: 360};

/** viande gravée : contour irrégulier, hachures, fibres ; eat 0 → 1 = dissolution */
const Meat: React.FC<{x: number; y: number; r: number; eat: number; seed: number; p: string}> = ({x, y, r, eat, seed, p}) => {
  const n = 16;
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.84 + 0.22 * rand(seed + i * 1.3) - eat * 0.45 * rand(seed + i * 7.1));
    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.78];
  });
  const d = `M ${pts.map((q) => q.join(' ')).join(' L ')} Z`;
  return (
    <g>
      <path d={d} fill={eat > 0.5 ? '#B8705A' : '#93402C'} />
      <Shade p={p} id={`m${seed}`} d={d} box={[x - r, y - r, 2 * r, 2 * r]} from={[0.9, 1]} to={[0.2, 0.1]} hatch="hd" cross />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${x - r * 0.6} ${y - r * 0.35 + i * r * 0.24} q ${r * 0.6} ${-r * 0.18} ${r * 1.2} ${r * 0.02}`} stroke="#4A160C" strokeWidth={2.2} fill="none" opacity={0.75 * (1 - eat * 0.6)} />)}
      <path d={d} fill="none" stroke={INK} strokeWidth={3.5} filter={`url(#${p}-wob)`} />
      <ellipse cx={x - r * 0.3} cy={y - r * 0.32} rx={r * 0.22} ry={r * 0.08} fill="#F4D9C8" opacity={0.55 * (1 - eat)} />
      {eat > 0 ? Array.from({length: 8}, (_, i) => {
        const a = rand(seed * 3 + i) * Math.PI * 2, dd = r * (0.9 + eat * 1.2 * rand(i + 4));
        return <circle key={i} cx={x + Math.cos(a) * dd} cy={y + Math.sin(a) * dd * 0.8} r={2 + rand(i * 5) * 4} fill="#93402C" opacity={0.7 * (1 - eat * 0.5)} />;
      }) : null}
    </g>
  );
};

/** montre de gousset gravée ; h = heures écoulées (aiguille des heures) */
const Montre: React.FC<{x: number; y: number; h: number; p: string}> = ({x, y, h, p}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -14 -122 a 14 14 0 1 1 28 0" fill="none" stroke={INK} strokeWidth={6} />
    <circle r={104} fill="#E9DDC0" stroke={INK} strokeWidth={8} />
    <Shade p={p} id="mtr" d="M -104 0 a 104 104 0 1 0 208 0 a 104 104 0 1 0 -208 0" box={[-104, -104, 208, 208]} from={[1, 1]} to={[0.4, 0.4]} hatch="hl" o={0.8} />
    <circle r={88} fill="none" stroke={INK} strokeWidth={2} />
    {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((s, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      return <text key={s} x={Math.cos(a) * 70} y={Math.sin(a) * 70 + 8} textAnchor="middle" fontFamily={GF.serif} fontSize={i % 3 ? 17 : 24} fill={INK}>{s}</text>;
    })}
    <line x1={0} y1={0} x2={Math.cos((h / 12) * Math.PI * 2 - Math.PI / 2) * 46} y2={Math.sin((h / 12) * Math.PI * 2 - Math.PI / 2) * 46} stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <line x1={0} y1={0} x2={Math.cos(h * Math.PI * 2 - Math.PI / 2) * 72} y2={Math.sin(h * Math.PI * 2 - Math.PI / 2) * 72} stroke={RED} strokeWidth={4} strokeLinecap="round" />
    <circle r={7} fill={INK} />
  </g>
);

/** fil de soie torsadé le long d'une polyligne */
const Fil: React.FC<{pts: {x: number; y: number}[]}> = ({pts}) => {
  const d = `M ${pts.map((q) => `${q.x} ${q.y}`).join(' L ')}`;
  return (
    <g>
      <path d={d} stroke="#F1E6C9" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={d} stroke={INK} strokeWidth={7} fill="none" strokeDasharray="3 6" strokeLinecap="round" opacity={0.75} />
      <path d={d} stroke={INK} strokeWidth={1.2} fill="none" />
    </g>
  );
};

export const Estomac: React.FC<AnimProps> = ({id, lt: lt0, t, p}) => {
  const mode = String(p.mode ?? 'ficelle');
  const lt = p.instant ? lt0 + 10 : lt0;
  const plate = prog(lt, 0, 0.35, easeOut);
  const shot = mode === 'trou' ? 0.45 : -1;
  const holeK = mode === 'trou' ? prog(lt, shot + 0.05, shot + 0.4, easeOut) : 1;
  const blast = mode === 'trou' ? 1 - clamp01((lt - shot) / 0.25) : 0;
  const smoke = mode === 'trou' ? clamp01((lt - shot) / 1.4) : 0;
  const down = Number(p.down ?? 0.9), from = Number(p.from ?? 1.0), to = Number(p.to ?? 3.0);
  const d = easeOut(clamp01((lt - 0.25) / down));
  const eat = p.instant && p.from === undefined ? 0 : clamp01((lt0 - from) / (to - from));
  const seg1 = clamp01(d * 2), seg2 = clamp01(d * 2 - 1);
  const p1 = {x: lerp(TOP.x, HOLE.x, seg1), y: lerp(TOP.y, HOLE.y, seg1)};
  const p2 = {x: lerp(HOLE.x, FOOD.x, seg2), y: lerp(HOLE.y, FOOD.y, seg2)};
  const meat = seg1 >= 1 ? p2 : p1;
  const acid = mode === 'trou' ? 0 : prog(lt, 0.3, 1.2) * (0.92 + 0.08 * Math.sin(t * 2));
  const hours = eat * 3;
  return (
    <>
      <div style={{position: 'absolute', left: 41, top: 456.5, width: 918, opacity: plate}}>
        <Img src={staticFile(`v/${id}/img/estomac_grand.webp`)} style={{width: '100%', display: 'block'}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
        <InkDefs p="es" ink={INK} />
        <defs>
          <pattern id="es-red" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><line x1={0} y1={0} x2={0} y2={6} stroke={RED} strokeWidth={1.8} /></pattern>
          <clipPath id="es-cav"><ellipse cx={X(0.76)} cy={Y(0.6)} rx={190} ry={160} /></clipPath>
        </defs>
        {/* suc gastrique : lavis d'encre rouge hachuré qui monte dans la cavité */}
        {acid > 0 ? (
          <g clipPath="url(#es-cav)">
            <rect x={X(0.5)} y={lerp(Y(0.98), Y(0.42), acid)} width={500} height={500} fill={RED} opacity={0.16} />
            <rect x={X(0.5)} y={lerp(Y(0.98), Y(0.42), acid)} width={500} height={500} fill="url(#es-red)" opacity={0.7} />
            <path d={`M ${X(0.5)} ${lerp(Y(0.98), Y(0.42), acid)} ${Array.from({length: 12}, (_, i) => `q 22 ${i % 2 ? 7 : -7} 44 0`).join(' ')}`} stroke={RED} strokeWidth={3} fill="none" transform={`translate(${Math.sin(t * 2) * 10} 0)`} />
          </g>
        ) : null}
        {/* la fistule : trou dans la paroi, bords déchiquetés hachurés */}
        {holeK > 0 ? (
          <g transform={`translate(${HOLE.x} ${HOLE.y}) scale(${holeK})`}>
            <path d="M -40 -8 C -36 -30, -8 -36, 8 -30 C 30 -28, 42 -12, 38 6 C 34 26, 10 34, -10 30 C -30 28, -44 12, -40 -8 Z" fill="#1A0D06" />
            <path d="M -40 -8 C -36 -30, -8 -36, 8 -30 C 30 -28, 42 -12, 38 6 C 34 26, 10 34, -10 30 C -30 28, -44 12, -40 -8 Z" fill="none" stroke={RED} strokeWidth={6} filter="url(#es-wob)" />
            {Array.from({length: 14}, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 44} y1={Math.sin(a) * 34} x2={Math.cos(a) * 58} y2={Math.sin(a) * 46} stroke={INK} strokeWidth={2} />;
            })}
          </g>
        ) : null}
        {blast > 0 ? Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={HOLE.x + Math.cos(a) * 20} y1={HOLE.y + Math.sin(a) * 20} x2={HOLE.x + Math.cos(a) * (80 + 160 * (1 - blast))} y2={HOLE.y + Math.sin(a) * (80 + 160 * (1 - blast))} stroke="#F2C14E" strokeWidth={8} opacity={blast} />;
        }) : null}
        {smoke > 0 && smoke < 1 ? [0, 1, 2, 3].map((i) => {
          const r = 22 + i * 9 + smoke * 46, cx = HOLE.x - 30 - i * 46 - smoke * 120, cy = HOLE.y - 40 - i * 34 - smoke * 150;
          return (
            <g key={i} opacity={(1 - smoke) * 0.75}>
              <circle cx={cx} cy={cy} r={r} fill="#EFE6D0" stroke={INK} strokeWidth={1.6} filter="url(#es-wob)" />
              <Shade p="es" id={`sm${i}`} d={`M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`} box={[cx - r, cy - r, 2 * r, 2 * r]} from={[0.8, 1]} to={[0.2, 0.1]} hatch="hm" />
            </g>
          );
        }) : null}
        {mode !== 'trou' ? (
          <>
            <Fil pts={[TOP, p1, ...(seg1 >= 1 ? [p2] : [])]} />
            <Meat x={meat.x} y={meat.y + 34} r={62 * (1 - eat * 0.8)} eat={eat} seed={3} p="es" />
            {eat > 0 ? Array.from({length: 12}, (_, i) => {
              const ph = (t * 0.7 + rand(i)) % 1;
              return <circle key={i} cx={FOOD.x - 120 + rand(i * 3) * 240} cy={Y(0.85) - ph * 220} r={4 + rand(i * 5) * 7} fill="#F6EEDC" stroke={INK} strokeWidth={2} opacity={(1 - ph) * 0.9} />;
            }) : null}
          </>
        ) : null}
        {/* légendes à la plume, hors de la planche */}
        <path d={`M ${HOLE.x - 30} ${HOLE.y - 40} C ${HOLE.x - 60} 560, 780 430, 700 420`} stroke={RED} strokeWidth={3} fill="none" opacity={holeK} />
        {mode !== 'trou' && acid > 0.3 ? <path d={`M ${X(0.66)} ${Y(0.82)} C ${X(0.6)} 1080, 560 1090, 480 1110`} stroke={RED} strokeWidth={3} fill="none" /> : null}
        {mode !== 'trou' && eat > 0 ? <Montre x={210} y={340} h={hours} p="es" /> : null}
      </svg>
      <div style={{position: 'absolute', left: 430, top: 368, fontFamily: GF.serif, fontStyle: 'italic', fontSize: 60, color: RED, opacity: holeK}}>la fistule</div>
      {mode !== 'trou' && acid > 0.3 ? <div style={{position: 'absolute', left: 120, top: 1080, fontFamily: GF.serif, fontStyle: 'italic', fontSize: 58, color: RED}}>suc gastrique</div> : null}
      {mode !== 'trou' && eat > 0 ? <div style={{position: 'absolute', left: 330, top: 300, fontFamily: GF.serif, fontSize: 74, color: INK}}>{Math.min(3, Math.floor(hours) + 1)} h</div> : null}
    </>
  );
};

/** bocal de suc gastrique : la viande s'y dissout hors du corps (from → to) */
export const Bocal: React.FC<AnimProps> = ({lt, t, p}) => {
  const from = Number(p.from ?? 0.4), to = Number(p.to ?? 2.2);
  const eat = clamp01((lt - from) / (to - from));
  const k = prog(lt, 0, 0.5, easeOut);
  const jar = 'M 400 600 L 400 640 C 320 680, 300 740, 300 800 L 300 1150 C 300 1214, 344 1244, 410 1244 L 670 1244 C 736 1244, 780 1214, 780 1150 L 780 800 C 780 740, 760 680, 680 640 L 680 600 Z';
  const lvl = 860 + Math.sin(t * 2) * 5;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} opacity={k}>
      <InkDefs p="bc" ink={INK} />
      <defs><clipPath id="bc-in"><path d={jar} /></clipPath></defs>
      {/* liquide hachuré */}
      <g clipPath="url(#bc-in)">
        <path d={`M 290 ${lvl} C 420 ${lvl - 14}, 640 ${lvl + 14}, 790 ${lvl} L 790 1260 L 290 1260 Z`} fill={RED} opacity={0.18} />
        <rect x={290} y={lvl} width={500} height={420} fill="url(#bc-hh)" opacity={0.35} />
        <Shade p="bc" id="liq" d={`M 290 ${lvl} L 790 ${lvl} L 790 1260 L 290 1260 Z`} box={[290, lvl, 500, 400]} from={[1, 1]} to={[0.4, 0.2]} hatch="hd" o={0.6} />
        <Meat x={540} y={1110} r={86 * (1 - eat * 0.82)} eat={eat} seed={11} p="bc" />
        {Array.from({length: 14}, (_, i) => {
          const ph = (t * 0.6 + rand(i * 2.1)) % 1;
          return <circle key={i} cx={360 + rand(i * 3.3) * 360} cy={1200 - ph * 330} r={4 + rand(i * 5.5) * 8} fill="#F6EEDC" stroke={INK} strokeWidth={2} opacity={(1 - ph) * 0.85 * clamp01(eat * 4)} />;
        })}
      </g>
      {/* verre : contour double, reflets */}
      <path d={jar} fill="none" stroke={INK} strokeWidth={7} filter="url(#bc-wob)" />
      <path d="M 322 760 C 312 860, 312 1020, 324 1150" stroke="#FFFFFF" strokeWidth={14} opacity={0.5} fill="none" strokeLinecap="round" />
      <path d="M 350 760 C 344 840, 344 900, 350 960" stroke="#FFFFFF" strokeWidth={5} opacity={0.45} fill="none" strokeLinecap="round" />
      <path d="M 752 800 C 760 900, 760 1040, 750 1150" stroke={INK} strokeWidth={3} opacity={0.35} fill="none" />
      {/* bouchon de liège */}
      <path d="M 410 548 L 670 548 L 660 606 L 420 606 Z" fill="#B48A55" stroke={INK} strokeWidth={5} />
      <Shade p="bc" id="lg" d="M 410 548 L 670 548 L 660 606 L 420 606 Z" box={[410, 548, 260, 58]} from={[1, 1]} to={[0, 0]} hatch="hm" cross />
      {Array.from({length: 18}, (_, i) => <circle key={i} cx={430 + rand(i) * 220} cy={560 + rand(i * 3) * 38} r={2.2} fill={INK} opacity={0.6} />)}
      {/* étiquette nouée au col */}
      <path d="M 520 640 C 470 700, 400 700, 380 740" stroke={INK} strokeWidth={3} fill="none" />
      <g transform="rotate(-8 330 760)">
        <rect x={190} y={730} width={290} height={82} fill="#F2E8CF" stroke={INK} strokeWidth={4} />
        <text x={335} y={768} textAnchor="middle" fontFamily={GF.serif} fontStyle="italic" fontSize={30} fill={RED}>Suc gastrique</text>
        <text x={335} y={800} textAnchor="middle" fontFamily={GF.serif} fontSize={22} fill={INK}>W. B. — 1833</text>
      </g>
      <text x={540} y={1305} textAnchor="middle" fontFamily={GF.serif} fontStyle="italic" fontSize={56} fill={RED}>hors du corps</text>
    </svg>
  );
};

export const ESTOMAC = {Estomac, Bocal};
void easeInOut;
