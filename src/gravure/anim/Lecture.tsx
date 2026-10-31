// Animations sur mesure de la vidéo 37 (le test de lecture), style école (ardoise, cahier Seyès, bleu).
// Triangle : le panneau « J'AIME / PARIS AU / AU PRINTEMPS » (le « AU » en double est coupé par le retour à la ligne),
//   gravé : bande rouge hachurée, fond crème ombré, trait d'encre tremblé. Immobile pendant le test.
//   at = compte à rebours 3-2-1, stop ; reveal = les deux « AU » entourés ; order = consigne en haut (fin de vidéo).
// Plaque : la plaque de rue émaillée « UNE HIRONDELLE / NE FAIT PAS / PRINTEMPS » (il manque « LE »).
//   lu = le « le » que tu as lu apparaît en rouge devant PRINTEMPS ; barre = il est barré ; label = « IL N'Y EST PAS ».
import React from 'react';
import {easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {InkDefs, Shade} from './ink';
import {Countdown, InkStroke, nums, Order, RED, Stop} from './tests';

const INK = '#16110C';
const T = {ax: 540, ay: 380, by: 1120, hw: 425}; // apex, base, demi-largeur
const inner = (k: number) => {
  const cy = 874; // centre du cercle inscrit
  const p = (x: number, y: number) => `${540 + (x - 540) * k} ${cy + (y - cy) * k}`;
  return `M ${p(T.ax, T.ay)} L ${p(T.ax + T.hw, T.by)} L ${p(T.ax - T.hw, T.by)} Z`;
};

const Word: React.FC<{w: string; ring?: number}> = ({w, ring = 0}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    {w}
    {ring > 0 ? <span style={{position: 'absolute', left: -20, right: -20, top: -12, bottom: -10, border: `7px solid ${RED}`, borderRadius: '50%', opacity: ring, transform: `scale(${lerp(1.5, 1, ring)}) rotate(-4deg)`}} /> : null}
  </span>
);

const LINE: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center', transform: 'translateY(-50%)', fontFamily: GF.sans, fontWeight: 900, fontSize: 64, letterSpacing: '0.02em', color: INK, whiteSpace: 'nowrap'};

export const Triangle: React.FC<AnimProps> = ({t, lt, p}) => {
  const at = nums(p, 'at');
  const stop = Number(p.stop ?? 1e9);
  const reveal = !!p.reveal;
  const r1 = reveal ? prog(lt, 0.25, 0.5, easeOut) : 0, r2 = reveal ? prog(lt, 0.75, 1.0, easeOut) : 0;
  const outer = `M ${T.ax} ${T.ay} L ${T.ax + T.hw} ${T.by} L ${T.ax - T.hw} ${T.by} Z`;
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.7))'}} width={1080} height={1920}>
        <InkDefs p="tri" ink={INK} />
        <path d={outer} fill="#B8231C" stroke="#B8231C" strokeWidth={34} strokeLinejoin="round" />
        <Shade p="tri" id="band" d={outer} box={[115, 380, 850, 740]} from={[1, 1]} to={[0.2, 0.1]} hatch="hd" o={0.55} />
        <path d={inner(0.813)} fill="#F1EADB" stroke="#F1EADB" strokeWidth={14} strokeLinejoin="round" />
        <Shade p="tri" id="in" d={inner(0.813)} box={[195, 470, 690, 610]} from={[1, 1]} to={[0.45, 0.35]} hatch="hl" o={0.35} />
        <path d={outer} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" filter="url(#tri-wob)" />
        <path d={inner(0.813)} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" filter="url(#tri-wob)" />
      </svg>
      <div style={{...LINE, top: 790}}>J’AIME</div>
      <div style={{...LINE, top: 885}}>PARIS <Word w="AU" ring={r1} /></div>
      <div style={{...LINE, top: 985}}><Word w="AU" ring={r2} /> PRINTEMPS</div>
      {at.length && t >= 3.0 && t < stop ? <Order text="LIS À VOIX HAUTE" k={prog(t, 3.0, 3.25, easeOut)} y={316} size={44} /> : null}
      {at.length ? <Countdown t={t} at={at} stop={stop} y={1232} /> : null}
      {at.length ? <Stop t={t} at={stop} y={560} /> : null}
      {reveal ? <Order text="2 × « AU »" k={prog(lt, 1.0, 1.25, easeOut)} y={1170} color={RED} size={76} /> : null}
      {p.order ? <Order text={String(p.order)} k={prog(lt, 0.05, 0.3, easeOut)} y={1160} size={46} color={G.gold} /> : null}
    </>
  );
};

export const Plaque: React.FC<AnimProps> = ({t, lt, p}) => {
  const lu = Number(p.lu ?? 1e9), barre = Number(p.barre ?? 1e9);
  const W = 900, H = 500, x0 = 540 - W / 2, y0 = 760 - H / 2;
  const box = `M ${x0} ${y0} H ${x0 + W} V ${y0 + H} H ${x0} Z`;
  const k = p.static ? 1 : prog(lt, 0, 0.25, easeOut);
  const ghost = prog(t, lu, lu + 0.2, easeOut), cut = prog(t, barre, barre + 0.3, easeOut);
  const L: React.CSSProperties = {...LINE, color: '#F4F1E8', fontSize: 70, letterSpacing: '0.04em'};
  return (
    <div style={{position: 'absolute', inset: 0, opacity: k, transform: `scale(${lerp(0.92, 1, k)})`, transformOrigin: '540px 760px'}}>
      <svg style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.7))'}} width={1080} height={1920}>
        <InkDefs p="pl" ink="#06102A" />
        <path d={box} fill="#1C3F8F" />
        <Shade p="pl" id="emaille" d={box} box={[x0, y0, W, H]} from={[1, 1]} to={[0.3, 0.1]} hatch="hm" o={0.5} />
        <rect x={x0 + 22} y={y0 + 22} width={W - 44} height={H - 44} rx={18} fill="none" stroke="#F4F1E8" strokeWidth={7} />
        <rect x={x0 + 4} y={y0 + 4} width={W - 8} height={H - 8} rx={10} fill="none" stroke="#2E7D4F" strokeWidth={8} />
        <path d={box} fill="none" stroke="#06102A" strokeWidth={5} filter="url(#pl-wob)" />
        {[[x0 + 46, y0 + 46], [x0 + W - 46, y0 + 46], [x0 + 46, y0 + H - 46], [x0 + W - 46, y0 + H - 46]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={9} fill="#B9B4A6" stroke="#06102A" strokeWidth={3} />)}
      </svg>
      <div style={{...L, top: 645}}>UNE HIRONDELLE</div>
      <div style={{...L, top: 760}}>NE FAIT PAS</div>
      <div style={{...L, top: 875}}>
        <span style={{position: 'relative', display: 'inline-block'}}>
          {ghost > 0 ? (
            <span style={{position: 'absolute', right: '100%', marginRight: 18, top: -6, fontFamily: GF.serif, fontStyle: 'italic', fontWeight: 900, fontSize: 84, color: RED, opacity: ghost, transform: `scale(${lerp(1.6, 1, ghost)}) rotate(-6deg)`, textShadow: '0 3px 10px rgba(0,0,0,0.6)'}}>
              le
              {cut > 0 ? <span style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 9, background: '#FFD9D2', transform: `scaleX(${cut}) rotate(-8deg)`, transformOrigin: 'left center', borderRadius: 4, boxShadow: '0 0 10px rgba(0,0,0,0.6)'}} /> : null}
            </span>
          ) : null}
          PRINTEMPS
        </span>
      </div>
      {ghost > 0 ? <InkStroke d="M 236 958 L 260 932 L 284 958" k={ghost} w={7} /> : null}
      {p.label && cut > 0 ? <Order text={String(p.label)} k={prog(t, barre + 0.2, barre + 0.45, easeOut)} y={1080} color={RED} size={64} /> : null}
    </div>
  );
};

export const LECTURE = {Triangle, Plaque};
