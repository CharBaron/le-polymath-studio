// Animations sur mesure de la vidéo 44 (« Ma femme et ma belle-mère », W. E. Hill, 1915), style boudoir.
// Hill : le dessin, avec une caméra et des repères exprimés dans ses coordonnées (image de 1280 px : boîte 190,175 → 1110,1150).
//   Or = la jeune fille, rouge = la vieille : les mêmes traits changent de nom.
//   mode 'test' (at = 3-2-1, stop, hits) · 'lecture' (vingt, jeune, quatre, vieille, meme) · 'detail' (focus ear|chin, swap, from, to)
//   · 'loop' (order, hits ; dernière image = première).
// Flash : le dessin 0,5 s sur noir, comme dans l'expérience · Foule : 393 vignettes · Ages : la règle 34 / 46.
import React from 'react';
import {Img} from 'remotion';
import {clamp01, easeOut, lerp, overshoot, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {Countdown, InkStroke, nums, Order, pop, punch, RED, src, Stop} from './tests';

const OR = '#FFC94D', K0 = 860 / 920;
const BOX = {x: 190, y: 175, w: 920, h: 975};
type Cam = {ox: number; oy: number; sx: number; sy: number; z: number};
const BASE: Cam = {ox: 650, oy: 662, sx: 520, sy: 870, z: 1};
const CLOSE: Cam = {ox: 672, oy: 720, sx: 520, sy: 830, z: 2.7};
const EAR: Cam = {ox: 685, oy: 618, sx: 520, sy: 800, z: 4.5};
const CHIN: Cam = {ox: 622, oy: 748, sx: 520, sy: 800, z: 3.8};
const NECK: Cam = {ox: 725, oy: 796, sx: 520, sy: 800, z: 3.5};
const mix = (a: Cam, b: Cam, k: number): Cam => ({ox: lerp(a.ox, b.ox, k), oy: lerp(a.oy, b.oy, k), sx: lerp(a.sx, b.sx, k), sy: lerp(a.sy, b.sy, k), z: a.z * Math.pow(b.z / a.z, k)});
const at = (c: Cam, x: number, y: number): [number, number] => [c.sx + (x - c.ox) * K0 * c.z, c.sy + (y - c.oy) * K0 * c.z];
/** courbe lissée passant par les points (repères du dessin → écran) */
const curve = (c: Cam, pts: [number, number][]) => {
  const q = pts.map(([x, y]) => at(c, x, y));
  let d = `M ${q[0][0]} ${q[0][1]}`;
  for (let i = 0; i < q.length - 1; i++) {
    const p0 = q[i - 1] ?? q[i], p1 = q[i], p2 = q[i + 1], p3 = q[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};
// les traits du dessin : la joue et le menton de l'une sont le nez de l'autre
const PROFIL: [number, number][] = [[600, 640], [598, 680], [604, 725], [613, 752], [628, 759], [650, 748], [680, 716], [700, 696]];
const COLLIER: [number, number][] = [[688, 801], [722, 796], [762, 790]];
const MENTON_V: [number, number][] = [[668, 842], [655, 878], [668, 904], [706, 900]];
const NUQUE: [number, number][] = [[720, 650], [716, 690], [740, 730], [762, 780]];

const Dessin: React.FC<{id: string; c: Cam; tint?: string; tintK?: number; win: {x: number; y: number; w: number; h: number}}> = ({id, c, tint, tintK = 0, win}) => {
  const [x, y] = at(c, BOX.x, BOX.y);
  return (
    <div style={{position: 'absolute', left: win.x, top: win.y, width: win.w, height: win.h, overflow: 'hidden', boxShadow: `0 26px 50px rgba(0,0,0,0.75), 0 0 0 3px rgba(${G.goldRgb},0.5)`, background: '#120814'}}>
      <Img src={src(id, 'hill_face')} style={{position: 'absolute', left: x - win.x, top: y - win.y, width: BOX.w * K0 * c.z, height: BOX.h * K0 * c.z}} />
      {tint ? <div style={{position: 'absolute', inset: 0, background: tint, mixBlendMode: 'multiply', opacity: tintK}} /> : null}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(10,4,12,0.55) 100%)'}} />
    </div>
  );
};
const WIN0 = {x: 90, y: 414, w: 860, h: 912};
const WIN1 = {x: 0, y: 330, w: 1080, h: 990};
const winAt = (k: number) => ({x: lerp(WIN0.x, WIN1.x, k), y: lerp(WIN0.y, WIN1.y, k), w: lerp(WIN0.w, WIN1.w, k), h: lerp(WIN0.h, WIN1.h, k)});

/** étiquette d'un repère : pastille de papier, trait jusqu'au point */
const Tag: React.FC<{text: string; x: number; y: number; px: number; py: number; col: string; k: number}> = ({text, x, y, px, py, col, k}) => k <= 0 ? null : (
  <>
    <svg style={{position: 'absolute', left: 0, top: 0, opacity: k}} width={1080} height={1920}>
      <line x1={x} y1={y} x2={px} y2={py} stroke={col} strokeWidth={5} />
      <circle cx={px} cy={py} r={11} fill={col} stroke="#120814" strokeWidth={3} />
    </svg>
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${lerp(0.7, 1, k)})`, fontFamily: GF.label, fontWeight: 700, fontSize: 54, letterSpacing: '0.06em', color: '#120814', background: col, padding: '6px 20px', borderRadius: 6, boxShadow: '0 8px 18px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{text}</div>
  </>
);
const Age: React.FC<{text: string; col: string; k: number}> = ({text, col, k}) => k <= 0 ? null : (
  <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: text.length > 8 ? 106 : 138, color: col, opacity: Math.min(1, k * 2), transform: `scale(${lerp(1.3, 1, k)})`, textShadow: '0 8px 24px rgba(0,0,0,0.9)'}}>{text}</div>
);

export const Hill: React.FC<AnimProps> = ({id, t, lt, t1, p}) => {
  const mode = String(p.mode ?? 'test');
  const hits = nums(p, 'hits');
  if (mode === 'test' || mode === 'loop') {
    const stop = Number(p.stop ?? 1e9);
    // ouverture : le dessin arrive de très près (la tête) et recule d'un coup ; la dernière image revient à ce cadre pour la boucle
    const crash = mode === 'test' ? 1 - prog(t, 0, 0.55, easeOut) : !p.order ? prog(t, t1 - 0.45, t1 - 0.03, easeOut) : 0;
    const push = mode === 'test' ? 1 + 0.07 * prog(t, 0.55, Math.min(stop, 5), easeOut) : 1;
    const c0 = mix(BASE, {...CLOSE, oy: 660, z: 2}, crash);
    const c = {...c0, z: c0.z * push * punch(t, hits, 0.09)};
    const shut = mode === 'test' ? prog(t, stop - 0.02, stop + 0.1, easeOut) : 0;
    const tintOn = p.order ? Math.floor(lt / 0.5) % 2 : -1; // pendant « Envoie-la » : la jeune, la vieille, la jeune…
    return (
      <>
        <Dessin id={id} c={c} win={WIN0} tint={tintOn < 0 ? undefined : tintOn ? '#FF9A8E' : '#FFD98A'} tintK={tintOn < 0 ? 0 : 0.85} />
        {mode === 'test' ? <Countdown t={t} at={nums(p, 'at')} stop={stop} y={1130} /> : null}
        {shut > 0 ? <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 960 * shut, background: '#0C060E'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 960 * shut, background: '#0C060E'}} />
        </> : null}
        {mode === 'test' && t < stop ? <Order text="QUEL ÂGE ?" k={prog(t, Number(p.ask ?? 1e9), Number(p.ask ?? 1e9) + 0.15, overshoot)} y={1236} size={84} color={G.goldHi} /> : null}
        {mode === 'test' ? <Stop t={t} at={stop} y={700} /> : null}
        {mode === 'test' && t > stop ? <Order text="GARDE TON CHIFFRE" k={prog(t, stop + 0.2, stop + 0.4, easeOut)} y={940} size={66} color={G.goldHi} /> : null}
        {p.order ? <Order text={String(p.order)} k={prog(lt, 0.05, 0.3, easeOut)} y={230} size={52} color={G.goldHi} /> : null}
      </>
    );
  }
  if (mode === 'lecture') {
    const jeune = Number(p.jeune), quatre = Number(p.quatre), vieille = Number(p.vieille), meme = Number(p.meme);
    const zk = prog(t, jeune - 0.9, jeune, easeOut);
    const c = mix(BASE, CLOSE, zk);
    // 0 = la jeune, 1 = la vieille ; sur « le même trait », ça bascule très vite
    const who = t >= meme ? Math.floor((t - meme) / 0.17) % 2 : t >= vieille ? 1 : 0;
    const col = who ? RED : OR;
    const on = prog(t, jeune, jeune + 0.2, easeOut);
    const k = t >= vieille && t < meme ? prog(t, vieille, vieille + 0.16, easeOut) : on;
    const shake = t >= meme ? Math.sin(t * 70) * 5 : 0;
    const [ex, ey] = at(c, 685, 618), [cx, cy] = at(c, 615, 755), [nx, ny] = at(c, 725, 796), [mx, my] = at(c, 672, 890);
    const stroke = (pts: [number, number][]) => <InkStroke d={curve(c, pts)} k={k} w={9} color={col} />;
    return (
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
        <Dessin id={id} c={c} win={winAt(zk)} tint={who ? '#FF9A8E' : '#FFD98A'} tintK={0.85 * on} />
        {stroke(PROFIL)}{stroke(COLLIER)}{who ? stroke(MENTON_V) : stroke(NUQUE)}
        <svg style={{position: 'absolute', left: 0, top: 0, opacity: k}} width={1080} height={1920}><circle cx={ex} cy={ey} r={46} fill="none" stroke={col} strokeWidth={8} /></svg>
        <Tag text={who ? 'ŒIL' : 'OREILLE'} x={800} y={500} px={ex + 30} py={ey - 34} col={col} k={k} />
        <Tag text={who ? 'NEZ' : 'MENTON'} x={210} y={1110} px={cx} py={cy} col={col} k={k} />
        <Tag text={who ? 'BOUCHE' : 'COLLIER'} x={800} y={1180} px={nx} py={ny} col={col} k={k} />
        {who ? <Tag text="MENTON" x={460} y={1262} px={mx} py={my} col={col} k={k} /> : null}
        {t < quatre ? <Age text="20 ANS" col={OR} k={prog(t, Number(p.vingt) + 0.05, Number(p.vingt) + 0.3, easeOut)} /> : t < meme ? <Age text="80 ANS" col={RED} k={prog(t, quatre + 0.05, quatre + 0.25, easeOut)} /> : <Age text={String(p.label ?? 'LE MÊME')} col={G.goldHi} k={prog(t, meme, meme + 0.15, easeOut)} />}
      </div>
    );
  }
  // détail : très gros plan, un mot barré, l'autre arrive
  const ear = p.focus === 'ear', neck = p.focus === 'neck';
  const swap = Number(p.swap);
  const c = mix(CLOSE, ear ? EAR : neck ? NECK : CHIN, prog(lt, 0, 0.35, easeOut));
  c.z *= 1 + 0.03 * clamp01(lt / 2);
  const s = prog(t, swap - 0.03, swap + 0.14, easeOut);
  const a = String(p.from), b = String(p.to);
  const [px, py] = ear ? at(c, 685, 618) : neck ? at(c, 725, 796) : at(c, 615, 757);
  return (
    <>
      <Dessin id={id} c={c} win={WIN1} tint={s > 0.5 ? '#FF9A8E' : '#FFD98A'} tintK={0.8} />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <circle cx={px} cy={py} r={ear ? 120 : neck ? 170 : 96} fill="none" stroke={s > 0.5 ? RED : OR} strokeWidth={10} strokeDasharray="1000" strokeDashoffset={1000 * (1 - prog(lt, 0.2, 0.55, easeOut))} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 120, lineHeight: 1, whiteSpace: 'nowrap'}}>
        {s < 0.5 ? <span style={{color: OR}}>{a}</span> : <span style={{color: RED, display: 'inline-block', transform: `scale(${lerp(1.5, 1, s)})`}}>{b}</span>}
      </div>
    </>
  );
};

/** l'expérience : le dessin 0,5 s sur noir, puis plus rien */
export const Flash: React.FC<AnimProps> = ({id, t, p}) => {
  const a = Number(p.at);
  const on = t >= a && t < a + 0.5;
  const after = prog(t, a + 0.5, a + 0.7, easeOut);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#07030A'}} />
      {on ? <><Dessin id={id} c={BASE} win={WIN0} /><Order text="0,5 SECONDE" k={1} y={250} size={84} color={G.goldHi} /></> : null}
      {t < a ? <Order text="REGARDE" k={1} y={830} size={120} color={G.goldHi} /> : null}
      {after > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 250, color: G.goldHi, transform: `scale(${lerp(1.4, 1, after)})`, textShadow: `0 0 40px rgba(${G.goldRgb},0.5)`}}>0,5 s</div> : null}
    </>
  );
};

/** les 393 participants : un petit dessin chacun, qui arrive en vague ; le compteur suit */
export const Foule: React.FC<AnimProps> = ({id, lt, t1, t0}) => {
  const N = 393, COLS = 19, CW = 46, CH = 45, X0 = 540 - (COLS * CW) / 2 - 30, Y0 = 470;
  const dur = Math.min(1.1, (t1 - t0) * 0.7);
  const shown = Math.floor(clamp01(lt / dur) * N);
  return (
    <>
      {Array.from({length: N}, (_, i) => {
        const on = i < shown;
        return on ? <Img key={i} src={src(id, 'hill_mini')} style={{position: 'absolute', left: X0 + (i % COLS) * CW, top: Y0 + Math.floor(i / COLS) * CH, width: CW - 4, height: CH - 3, borderRadius: 3, opacity: 0.9}} /> : null;
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 190, lineHeight: 1, color: G.goldHi, textShadow: '0 8px 24px rgba(0,0,0,0.9)', fontVariantNumeric: 'tabular-nums'}}>{shown}</div>
    </>
  );
};

/** la règle des âges : les 10 % les plus jeunes (18-22 ans) lui donnent 34 ans, les 10 % les plus âgés (49-68 ans) 46 */
export const Ages: React.FC<AnimProps> = ({id, t, p}) => {
  const a = Number(p.a), b = Number(p.b);
  const X = (v: number) => 110 + ((v - 30) / 20) * 800, Y = 1060;
  const ka = pop(t, a, 0.22), kb = pop(t, b, 0.22), kd = prog(t, b + 0.45, b + 0.65, overshoot);
  const col = (v: number, c: string, k: number, who: string) => k <= 0 ? null : (
    <div style={{position: 'absolute', left: X(v), top: Y - 400, width: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * 40}px)`}}>
      <div style={{fontFamily: GF.serif, fontWeight: 900, fontSize: 270, lineHeight: 1, color: c, textShadow: '0 8px 24px rgba(0,0,0,0.9)'}}>{v}</div>
      <div style={{fontFamily: GF.label, fontWeight: 700, fontSize: 52, color: G.text, whiteSpace: 'nowrap', marginTop: 6}}>{who}</div>
      <div style={{width: 8, height: 62, background: c, marginTop: 8}} />
    </div>
  );
  return (
    <>
      <div style={{position: 'absolute', left: 410, top: 300, width: 260, height: 300, overflow: 'hidden', boxShadow: `0 20px 40px rgba(0,0,0,0.7), 0 0 0 3px rgba(${G.goldRgb},0.5)`}}>
        <Img src={src(id, 'hill_mini')} style={{position: 'absolute', left: 0, top: 0, width: 260, height: 300}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <line x1={X(30)} y1={Y} x2={X(50)} y2={Y} stroke={G.text} strokeWidth={6} />
        {Array.from({length: 5}, (_, i) => <line key={i} x1={X(30 + i * 5)} y1={Y - 14} x2={X(30 + i * 5)} y2={Y + 14} stroke={G.text} strokeWidth={4} />)}
        {kd > 0 ? <path d={`M ${X(34)} ${Y + 40} v 34 H ${X(46)} v -34`} fill="none" stroke={G.goldHi} strokeWidth={7} opacity={Math.min(1, kd)} /> : null}
      </svg>
      {col(34, OR, ka, '18-22 ANS')}{col(46, RED, kb, '49-68 ANS')}
      {kd > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: Y + 92, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 96, color: G.goldHi, transform: `scale(${kd})`}}>12 ANS D’ÉCART</div> : null}
    </>
  );
};

export const HILL = {Hill, Flash, Foule, Ages};
