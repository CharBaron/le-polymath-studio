// Animations sur mesure de la vidéo 43 (l'effet Stroop), style imprimerie (casse de typographe, papier journal, bleu encre).
// Stroop : le vrai test. 10 mots de couleur en caractères d'imprimerie (encre qui accroche, foulage), tous écrits dans une autre
//   couleur, sur une casse en bois ; chrono gravé qui tourne de go à stop, puis « STOP. ». Le tableau ne bouge jamais pendant le test.
//   mode 'test' (go, stop) · 'reveal' : tout s'éteint sauf « ROUGE » écrit en bleu, entouré ; zoomAt = gros plan, « ROU… » en
//   rouge sous le mot · 'carres' : chaque mot devient un carré de sa couleur (la condition contrôle de Stroop) ; les carrés s'allument un par un
//   · 'loop' : le tableau au repos, chrono à zéro (dernière image = première) ; order = consigne en haut.
// Barres : les vrais temps de Stroop (1935, expérience 2) : 63,3 s pour nommer des carrés, 110,3 s pour les mots ; at = départ.
import React from 'react';
import {easeOut, lerp, overshoot, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {InkDefs} from './ink';
import {InkStroke, nums, Order, punch, RED, Stop} from './tests';

const INK = '#0C0E16';
export const COL = {rouge: '#FF4B4B', bleu: '#4A93FF', vert: '#3BD872', jaune: '#FFD43B', violet: '#BC82FF'} as const;
type C = keyof typeof COL;
// [mot écrit, couleur de l'encre] : jamais la même ; 2 colonnes × 5 lignes, lues de gauche à droite
export const WORDS: [string, C][] = [
  ['ROUGE', 'bleu'], ['VERT', 'jaune'],
  ['BLEU', 'rouge'], ['JAUNE', 'violet'],
  ['VIOLET', 'vert'], ['ROUGE', 'jaune'],
  ['VERT', 'rouge'], ['BLEU', 'violet'],
  ['JAUNE', 'bleu'], ['VIOLET', 'rouge'],
];
const KEYS = Object.keys(COL) as C[];
/** fin de vidéo : l'encre de chaque mot change au rythme de `k`, sans jamais tomber sur la couleur écrite */
const inkAt = (w: string, c: C, i: number, k: number): C => { if (k <= 0) return c; const o = KEYS.filter((x) => x !== w.toLowerCase()); return o[(o.indexOf(c) + k * (1 + (i % 3))) % o.length]; };
const COLS = [300, 735], ROW0 = 585, ROWH = 150;
const pos = (i: number) => ({x: COLS[i % 2], y: ROW0 + Math.floor(i / 2) * ROWH});
const PANEL = {x: 60, y: 480, w: 920, h: 790};

/** la casse en bois : cadre gravé, casiers, liseré d'accent */
const Casse: React.FC<{dim: number}> = ({dim}) => (
  <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
    <InkDefs p="sc" ink="#000" />
    <defs>
      <linearGradient id="sc-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2A1D12" /><stop offset="1" stopColor="#140D08" />
      </linearGradient>
      <pattern id="sc-grain" width={300} height={14} patternUnits="userSpaceOnUse">
        <path d="M 0 7 C 60 3, 120 11, 180 6 S 260 4, 300 8" fill="none" stroke="rgba(255,220,170,0.07)" strokeWidth={2} />
      </pattern>
    </defs>
    <rect x={PANEL.x - 18} y={PANEL.y - 18} width={PANEL.w + 36} height={PANEL.h + 36} rx={10} fill="url(#sc-wood)" stroke="#000" strokeWidth={4} />
    <rect x={PANEL.x - 18} y={PANEL.y - 18} width={PANEL.w + 36} height={PANEL.h + 36} rx={10} fill="url(#sc-grain)" />
    <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} fill="#0B0A0D" stroke={`rgba(${G.goldRgb},0.55)`} strokeWidth={3} />
    {/* casiers de la casse, à peine visibles derrière les lettres */}
    {[1, 2, 3, 4].map((r) => <line key={r} x1={PANEL.x} x2={PANEL.x + PANEL.w} y1={PANEL.y + r * (PANEL.h / 5)} y2={PANEL.y + r * (PANEL.h / 5)} stroke="rgba(120,90,60,0.28)" strokeWidth={4} />)}
    <line x1={540} x2={540} y1={PANEL.y} y2={PANEL.y + PANEL.h} stroke="rgba(120,90,60,0.28)" strokeWidth={4} />
    <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} fill="url(#sc-hm)" opacity={0.08} />
    <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} fill="#000" opacity={0.55 * dim} />
  </svg>
);

/** un mot en caractères d'imprimerie : encre de couleur qui accroche (moucheté), foulage sombre décalé, léger halo */
const TypeWord: React.FC<{w: string; c: C; x: number; y: number; o?: number; s?: number; id: number}> = ({w, c, x, y, o = 1, s = 1, id}) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
    <text x={3} y={5} textAnchor="middle" dominantBaseline="central" fontFamily={GF.sans} fontWeight={900} fontSize={w.length > 5 ? 84 : 94} letterSpacing={3} fill="#000" opacity={0.85}>{w}</text>
    <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fontFamily={GF.sans} fontWeight={900} fontSize={w.length > 5 ? 84 : 94} letterSpacing={3} fill={COL[c]} filter={`url(#st-ink${id % 3})`}>{w}</text>
  </g>
);

const InkFilters: React.FC = () => (
  <defs>
    {[0, 1, 2].map((k) => (
      <filter key={k} id={`st-ink${k}`} x="-10%" y="-20%" width="120%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed={k * 7 + 2} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 6.2" result="spk" />
        <feComposite in="SourceGraphic" in2="spk" operator="in" result="inked" />
        <feGaussianBlur in="inked" stdDeviation="0.4" />
      </filter>
    ))}
  </defs>
);

/** chrono : boîtier de montre gravé (aiguille qui tourne) + chiffres */
const Chrono: React.FC<{sec: number; state: 'idle' | 'run' | 'stop'}> = ({sec, state}) => {
  const c = state === 'stop' ? RED : state === 'run' ? G.goldHi : 'rgba(246,241,230,0.55)';
  const cs = Math.floor(sec * 100);
  const txt = `00:${String(Math.floor(cs / 100)).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 318, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26}}>
      <svg width={104} height={120} viewBox="-52 -64 104 120">
        <rect x={-10} y={-62} width={20} height={14} rx={3} fill="none" stroke={c} strokeWidth={5} />
        <circle r={44} fill="rgba(8,6,4,0.75)" stroke={c} strokeWidth={6} />
        {Array.from({length: 12}, (_, i) => <line key={i} x1={0} y1={-36} x2={0} y2={-30} stroke={c} strokeWidth={3} transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={6} x2={0} y2={-32} stroke={c} strokeWidth={4} strokeLinecap="round" transform={`rotate(${sec * 360})`} />
        <circle r={5} fill={c} />
      </svg>
      <div style={{fontFamily: GF.label, fontWeight: 700, fontSize: 88, letterSpacing: '0.04em', color: c, textShadow: state === 'run' ? `0 0 24px rgba(${G.goldRgb},0.5)` : '0 6px 18px rgba(0,0,0,0.9)', fontVariantNumeric: 'tabular-nums'}}>{txt}</div>
    </div>
  );
};

export const Stroop: React.FC<AnimProps> = ({t, lt, t1, p}) => {
  const mode = String(p.mode ?? 'test');
  const go = Number(p.go ?? 1e9), stop = Number(p.stop ?? 1e9);
  const zoomAt = Number(p.zoomAt ?? 1e9);
  const reveal = mode === 'reveal', carres = mode === 'carres';
  const dimOthers = reveal ? prog(lt, 0.05, 0.35, easeOut) : 0;
  const zk = reveal ? prog(t, zoomAt, zoomAt + 0.4, easeOut) : 0;
  const rouAt = Number(p.rouAt ?? 1e9);
  const push = mode === 'test' ? 1 + 0.04 * prog(t, 0.5, Math.min(go, 5), easeOut) : 1; // avant « Vas-y » seulement : le tableau est fixe pendant le test
  const open = Number(p.open ?? 0); // ouverture : les encres s'affolent et le tableau recule jusqu'à `open`, puis tout se pose pour le test
  const shuffle = p.shuffle ? 1 + Math.floor(lt / 0.42) : mode === 'test' && t > 0.07 && t < open ? 1 + Math.floor(t / 0.13) : 0;
  const crash = mode === 'test' ? 1 + 0.4 * (1 - prog(t, 0, 0.5, easeOut)) : mode === 'loop' && !p.order ? 1 + 0.4 * prog(t, t1 - 0.45, t1 - 0.03, easeOut) : 1;
  const beat = punch(t, nums(p, 'hits'));
  const P0 = pos(0);
  const sz = 1 + 0.9 * zk;
  const stopped = mode === 'test' && t >= stop;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${P0.x}px ${P0.y}px`, transform: `translate(${(540 - P0.x) * zk}px, ${(800 - P0.y) * zk}px) scale(${sz * push * beat * crash})`}}>
        <Casse dim={stopped ? 0.5 * prog(t, stop, stop + 0.2) : 0} />
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
          <InkFilters />
          <InkDefs p="sq" />
          {WORDS.map(([w, c], i) => {
            const {x, y} = pos(i);
            const m = carres ? prog(lt, 0.1 + i * 0.035, 0.45 + i * 0.035, easeOut) : 0;
            const o = (reveal && i > 0 ? 1 - 0.8 * dimOthers - 0.17 * zk : 1) * (stopped ? 1 - 0.72 * prog(t, stop, stop + 0.2) : 1);
            const bw = 230, bh = 104;
            const lit = carres && lt > 0.55 ? Math.max(0, 1 - Math.abs(lt - 0.55 - i * 0.11) / 0.1) : 0;
            return (
              <g key={i}>
                {m < 1 ? <TypeWord w={w} c={inkAt(w, c, i, shuffle)} x={x} y={y} o={o * (1 - m)} s={1 - 0.3 * m} id={i} /> : null}
                {m > 0 ? (
                  <g opacity={m} transform={`translate(${x} ${y}) scale(${lerp(0.6, 1, overshoot(m)) * (1 + 0.14 * lit)})`}>
                    <rect x={-bw / 2 + 4} y={-bh / 2 + 6} width={bw} height={bh} rx={12} fill="#000" opacity={0.8} />
                    <rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={12} fill={COL[c]} filter={`url(#st-ink${i % 3})`} />
                    <rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={12} fill="url(#sq-hl)" opacity={0.35} />
                    <rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={12} fill="none" stroke={INK} strokeWidth={4} filter="url(#sq-wob)" />
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
        {reveal ? <InkStroke d={`M ${P0.x - 190} ${P0.y - 8} C ${P0.x - 200} ${P0.y - 90}, ${P0.x + 190} ${P0.y - 96}, ${P0.x + 200} ${P0.y - 6} C ${P0.x + 206} ${P0.y + 80}, ${P0.x - 180} ${P0.y + 92}, ${P0.x - 196} ${P0.y + 4}`} k={prog(lt, 0.2, 0.6, easeOut)} w={8} /> : null}
      </div>
      {reveal ? (
        <>
          <div style={{position: 'absolute', left: 60, right: 60, top: zk > 0.5 ? 960 : 1290, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 54, letterSpacing: '0.06em', color: G.text, background: 'transparent', padding: '10px 0', opacity: prog(lt, 0.5, 0.75) * (1 - zk) + zk * prog(t, zoomAt + 0.3, zoomAt + 0.5), textShadow: '0 4px 14px rgba(0,0,0,0.9)'}}>
            {zk > 0.5 ? <>TA BOUCHE A DIT</> : <>ÉCRIT <span style={{color: RED}}>ROUGE</span> · ENCRE <span style={{color: COL.bleu}}>BLEUE</span></>}
          </div>
        </>
      ) : null}
      {reveal && t >= rouAt ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1035, textAlign: 'center', fontFamily: GF.sans, fontWeight: 900, fontSize: 250, lineHeight: 1, color: RED, letterSpacing: '0.02em', textShadow: '0 10px 30px rgba(0,0,0,0.9)', transform: `scale(${lerp(1.5, 1, prog(t, rouAt, rouAt + 0.16, easeOut))})`}}>
          {'ROU…'.slice(0, Math.min(4, 1 + Math.floor((t - rouAt) / 0.11)))}
        </div>
      ) : null}
      {/* le chrono laisse la place au titre d'accroche (début, et fin de la boucle) et à la consigne finale */}
      {(mode === 'test' || mode === 'loop') && !p.order ? <div style={{opacity: Math.min(prog(t, 2.85, 3.15), mode === 'loop' ? 1 - prog(t, t1 - 0.62, t1 - 0.32) : 1)}}><Chrono sec={mode === 'test' && t >= go ? Math.min(t, stop) - go : 0} state={mode === 'test' && t >= stop ? 'stop' : mode === 'test' && t >= go ? 'run' : 'idle'} /></div> : null}
      {mode === 'test' && t >= 2.9 && t < stop ? <Order text="LA COULEUR · PAS LE MOT" k={prog(t, 2.9, 3.15, easeOut)} y={1292} size={50} color={G.goldHi} /> : null}
      {mode === 'test' ? <Stop t={t} at={stop} y={760} /> : null}
      {p.order ? <Order text={String(p.order)} k={prog(lt, 0.05, 0.3, easeOut)} y={330} size={48} color={G.goldHi} /> : null}
    </>
  );
};

/** les vrais temps de Stroop (1935, exp. 2, 100 étudiants) */
export const Barres: React.FC<AnimProps> = ({t, lt, p}) => {
  const at = Number(p.at ?? 0.2);
  const rows: [string, number, string][] = [['CARRÉS', 63.3, COL.vert], ['MOTS', 110.3, COL.rouge]];
  const X0 = 110, WMAX = 760;
  return (
    <>
      <Order text="100 ÉTUDIANTS · 2 ÉPREUVES" k={prog(lt, 0, 0.25, easeOut)} y={440} size={48} color={G.goldHi} />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <InkDefs p="ba" />
        {rows.map(([lab, v, c], i) => {
          const k = prog(t, at + i * 0.35, at + i * 0.35 + 0.8, easeOut);
          const y = 640 + i * 340, w = (v / 110.3) * WMAX * k;
          const d = `M ${X0} ${y} L ${X0 + w} ${y + 3} L ${X0 + w + 4} ${y + 190} L ${X0} ${y + 188} Z`;
          return (
            <g key={i}>
              <text x={X0} y={y - 26} fontFamily={GF.label} fontWeight={700} fontSize={64} letterSpacing={4} fill={G.text}>{lab}</text>
              <path d={d} fill={c} opacity={0.92} />
              <path d={d} fill="url(#ba-hd)" opacity={0.45} />
              <path d={d} fill="none" stroke={INK} strokeWidth={5} filter="url(#ba-wob)" />
              <text x={Math.max(X0 + 20, X0 + w - 20)} y={y + 125} textAnchor={w > 330 ? 'end' : 'start'} fontFamily={GF.serif} fontWeight={900} fontSize={100} fill={INK}>{`${(v * k).toFixed(0)} s`}</text>
            </g>
          );
        })}
      </svg>
    </>
  );
};

export const STROOP = {Stroop, Barres};
