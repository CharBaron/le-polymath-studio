// Vidéo éco n°9 — « Les intérêts composés »
// Idée neuve : LA MONTAGNE — la page devient une pente enneigée en paliers ; la caméra descend en diagonale,
// des boules de neige grossissent (argent, dette), Pierrot dévale avec elles. Chiffres : videos/09-interets-composes/sources.md
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, easeIn, easeInOut, easeOut, F, FPS, lerp, overshoot, POP, prog, rand, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move, solve, Track} from '../rig/rig';
import {Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {B, Doc, Padlock, Panel, Parchment, Pine, Snowball, vis} from '../components/Drawings';
import {camAt, Ink, WHighlight, World, WText} from '../components/Camera';

const R0 = 1360;
const N = 8;
const STX = (i: number) => 540 + i * 1800;
const STY = (i: number) => R0 + i * 800; // sol du palier i
const HALF = 560; // demi-largeur d'un palier
/** profil de la montagne : paliers plats reliés par des pentes */
const PROFILE: [number, number][] = [[-4000, R0]];
for (let i = 0; i < N; i++) PROFILE.push([STX(i) - HALF, STY(i)], [STX(i) + HALF, STY(i)]);
PROFILE.push([STX(N - 1) + 6000, STY(N - 1)]);
const groundAt = (x: number) => {
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [x0, y0] = PROFILE[i];
    const [x1, y1] = PROFILE[i + 1];
    if (x >= x0 && x <= x1) return lerp(y0, y1, (x - x0) / Math.max(1, x1 - x0));
  }
  return PROFILE[PROFILE.length - 1][1];
};

const Title: React.FC<{x: number; y: number; t: number; t0: number; size?: number; children: React.ReactNode}> = ({x, y, t, t0, size = 76, children}) => (
  <WText x={x} y={y + (1 - prog(t, t0, t0 + 0.4, easeOut)) * 30} size={size} anchor="middle" o={prog(t, t0, t0 + 0.4, easeOut)}>{children}</WText>
);
const Stamp: React.FC<{x: number; y: number; k: number; w: number; text: string; color?: string; size?: number; rot?: number}> = ({x, y, k, w, text, color = C.red, size = 56, rot = -7}) =>
  k > 0.01 ? (
    <g transform={`translate(${x} ${y}) rotate(${rot + (1 - k) * 18}) scale(${k})`}>
      <rect x={-w / 2} y={-size * 1.05} width={w} height={size * 2.1} rx={12} fill={C.white} stroke={color} strokeWidth={7} />
      <WText x={0} y={size * 0.35} size={size} color={color} anchor="middle">{text}</WText>
    </g>
  ) : null;
const bounce = (t: number, t0: number) => sp(Math.round(t * FPS), t0, {damping: 9, stiffness: 240, mass: 0.7});
/** boule posée sur le sol à l'abscisse x, avec une étiquette */
const Ball: React.FC<{x: number; r: number; label?: string; red?: boolean; id: number; dy?: number}> = ({x, r, label, red, id, dy = 0}) => {
  const y = groundAt(x) - r + dy;
  return (
    <g>
      <Snowball x={x} y={y} r={r} rot={x * 0.6} id={id} />
      {red ? <circle cx={x} cy={y} r={r * 0.97} fill={C.red} opacity={0.55} /> : null}
      {label ? <WText x={x} y={y + r * 0.14} size={Math.max(28, r * 0.38)} anchor="middle" color={red ? C.white : C.ink}>{label}</WText> : null}
    </g>
  );
};

// ---------- le décor ----------
const Mountain: React.FC = () => {
  const pts = PROFILE.map((p) => p.join(' ')).join(' L ');
  const bottom = STY(N - 1) + 4000;
  return (
    <g>
      <path d={`M ${pts} L ${PROFILE[PROFILE.length - 1][0]} ${bottom} L ${PROFILE[0][0]} ${bottom} Z`} fill="#FBFDFF" />
      {Array.from({length: 60}, (_, i) => {
        const x = -2000 + i * 300;
        return <line key={i} x1={x} y1={groundAt(x) + 60} x2={x + 140} y2={groundAt(x) + 200} stroke="#CFE3F5" strokeWidth={6} />;
      })}
      <path d={`M ${pts}`} fill="none" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
      {Array.from({length: N - 1}, (_, i) => {
        const xm = STX(i) + 900;
        return (
          <g key={i}>
            <Pine x={xm - 60} y={groundAt(xm - 60) + 4} h={260} id={80 + i} />
            <Pine x={xm + 120} y={groundAt(xm + 120) + 4} h={200} id={90 + i} />
          </g>
        );
      })}
    </g>
  );
};

// ---------- stations ----------
const Hook: React.FC<{b: B; t: number}> = ({b, t}) => {
  const cx = STX(0);
  const gy = STY(0);
  return (
    <g>
      <WText x={cx} y={gy - 1110} size={92} anchor="middle">Boston, 1790</WText>
      <Parchment x={cx - 160} y={gy - 1000} w={560} h={560} k={prog(t, 0, 0.8, easeOut) * 0.4 + 0.6} title="Testament" lines={['de Benjamin Franklin :', '1 000 livres', 'pour Boston', '« n’y touchez pas »']} id={1} />
      <Padlock x={cx + 160} y={gy - 360} s={1.1} closed={prog(t, b.consigne + 0.6, b.consigne + 1.0, overshoot)} label="200 ans" />
      <WHighlight x={cx - 450} y={gy - 230} w={600} h={76} k={prog(t, b.pourquoi + 0.8, b.pourquoi + 1.3, easeOut)} />
      <WText x={cx - 440} y={gy - 175} size={66} o={prog(t, b.pourquoi + 0.5, b.pourquoi + 0.8, easeOut)}>les intérêts composés</WText>
    </g>
  );
};

const Principe: React.FC<{b: B; t: number}> = ({b, t}) => {
  const cx = STX(1);
  const gy = STY(1);
  const k = prog(t, b.ex, b.an30 + 1.0, easeInOut);
  const x = lerp(cx - HALF - 200, cx - 230, k);
  const r = lerp(40, 140, Math.pow(k, 1.6));
  return (
    <g>
      <Title x={cx} y={gy - 1110} t={t} t0={b.principe}>des intérêts sur les intérêts</Title>
      <Panel x={cx - 380} y={gy} text="an 1 : +50 €" k={prog(t, b.an1, b.an1 + 0.4, easeOut)} />
      <Panel x={cx + 90} y={gy} text="an 30 : ≈ 4 300 €" k={prog(t, b.an30 + 0.3, b.an30 + 0.7, easeOut)} w={340} size={40} color={C.green} />
      {t > b.ex - 0.2 ? <Ball x={x} r={r} label={t < b.an30 + 0.3 ? '1 000 €' : '4 300 €'} id={10} /> : null}
      {/* la courbe qui accélère */}
      <g opacity={prog(t, b.courbe, b.courbe + 0.4, easeOut)}>
        <line x1={cx - 450} y1={gy - 620} x2={cx - 450} y2={gy - 960} stroke={C.ink} strokeWidth={5} />
        <line x1={cx - 450} y1={gy - 620} x2={cx + 120} y2={gy - 620} stroke={C.ink} strokeWidth={5} />
        <Ink pts={Array.from({length: 12}, (_, i) => [cx - 450 + i * 52, gy - 620 - 320 * (Math.pow(1.05, i * 2.7) - 1) / (Math.pow(1.05, 30) - 1)] as [number, number])} k={prog(t, b.courbe + 0.2, b.courbe + 1.4, easeInOut)} color={C.green} width={9} id={11} />
        <Ink pts={[[cx - 450, gy - 620], [cx + 120, gy - 800]]} k={prog(t, b.courbe + 0.2, b.courbe + 1.0, easeInOut)} color={C.muted} width={5} id={12} dash="14 10" />
        <WText x={cx + 130} y={gy - 930} size={46} color={C.green} o={prog(t, b.courbe + 1.2, b.courbe + 1.6, easeOut)}>accélère</WText>
      </g>
    </g>
  );
};

const Regle: React.FC<{b: B; t: number}> = ({b, t}) => {
  const cx = STX(2);
  const gy = STY(2);
  const kL = prog(t, b.livret + 0.6, b.livret + 2.6, easeInOut);
  return (
    <g>
      <Title x={cx} y={gy - 1110} t={t} t0={b.regle72}>la règle de 72</Title>
      <WHighlight x={cx - 450} y={gy - 1000} w={620} h={96} k={prog(t, b.divise + 0.8, b.divise + 1.3, easeOut)} />
      <WText x={cx - 440} y={gy - 930} size={80} o={prog(t, b.divise, b.divise + 0.4, easeOut)}>72 ÷ taux = ans</WText>
      <WText x={cx - 440} y={gy - 850} size={44} color={C.pen} weight={400} o={prog(t, b.divise + 0.6, b.divise + 1.0, easeOut)}>… pour que ton argent double</WText>
      <WText x={cx - 440} y={gy - 640} size={70} color={C.pen} o={prog(t, b.livret, b.livret + 0.4, easeOut)}>Livret A : 72 ÷ 1,7 ≈ 42 ans</WText>
      {t > b.livret ? (
        <>
          <Ball x={lerp(cx - 420, cx - 160, kL)} r={60} label="×1" id={20} />
          <Ball x={lerp(cx - 420, cx + 60, kL)} r={lerp(30, 85, kL)} label={kL > 0.95 ? '×2' : ''} id={21} />
        </>
      ) : null}
      <WText x={cx - 100} y={gy - 300} size={42} weight={400} color={C.muted} o={kL} anchor="middle">… très lentement</WText>
    </g>
  );
};

const Temps: React.FC<{b: B; t: number}> = ({b, t}) => {
  const cx = STX(3);
  const gy = STY(3);
  // petite colline intérieure : départs à des hauteurs différentes
  const top: [number, number] = [cx - 470, gy - 760];
  const bot: [number, number] = [cx - 40, gy - 60];
  const on = (u: number): [number, number] => [lerp(top[0], bot[0], u), lerp(top[1], bot[1], u)];
  const kA = prog(t, b.vingt + 0.4, b.total1 + 0.4, easeIn);
  const kB = prog(t, b.trente + 0.2, b.total2 + 0.4, easeIn);
  const rA = lerp(30, 140, kA);
  const rB = lerp(30, 95, kB);
  const [ax, ay] = kA < 1 ? on(kA) : [bot[0] + 10, bot[1]];
  const [bx, by] = kB < 1 ? on(lerp(0.4, 1, kB)) : [bot[0] + 230, bot[1]];
  return (
    <g>
      <Title x={cx} y={gy - 1110} t={t} t0={b.temps}>le carburant : le temps</Title>
      <path d={`M ${top[0] - 20} ${top[1] - 10} L ${bot[0]} ${bot[1]} L ${bot[0] + 380} ${bot[1]}`} stroke={C.pen} strokeWidth={7} fill="none" opacity={prog(t, b.temps, b.temps + 0.5, easeOut)} />
      <WText x={top[0]} y={top[1] - 50} size={44} color={C.pen} o={prog(t, b.vingt, b.vingt + 0.4, easeOut)}>25 ans</WText>
      <WText x={on(0.4)[0] + 20} y={on(0.4)[1] - 50} size={44} color={C.orange} o={prog(t, b.trente, b.trente + 0.4, easeOut)}>35 ans</WText>
      <WText x={cx - 460} y={gy - 960} size={42} weight={400} color={C.muted} o={prog(t, b.vingt, b.vingt + 0.4, easeOut)}>100 €/mois à 4 % (exemple)</WText>
      {t > b.vingt ? (
        <g>
          <Snowball x={ax} y={ay - rA} r={rA} rot={kA * 900} id={30} />
          {kA >= 1 ? <WText x={ax} y={ay - rA + 14} size={44} anchor="middle">118 000 €</WText> : null}
        </g>
      ) : null}
      {t > b.trente ? (
        <g>
          <Snowball x={bx} y={by - rB} r={rB} rot={kB * 900} id={31} />
          {kB >= 1 ? <WText x={bx} y={by - rB + 12} size={36} anchor="middle" color={C.orange}>69 000 €</WText> : null}
        </g>
      ) : null}
      <Stamp x={cx - 120} y={gy - 380} k={bounce(t, b.ecart + 0.3)} w={360} text="−40 %" size={70} />
    </g>
  );
};

const Twist: React.FC<{b: B; t: number}> = ({b, t}) => {
  const cx = STX(4);
  const gy = STY(4);
  // la boule « dette » dévale depuis la pente et poursuit Pierrot
  const kIn = prog(t, b.usure, b.double + 0.2, easeIn);
  const kChase = prog(t, b.double + 0.3, b.double + 1.9, easeIn);
  const x = kChase > 0 ? lerp(cx + 40, cx + HALF + 500, kChase) : lerp(cx - HALF - 500, cx + 40, kIn);
  const r = lerp(40, 130, prog(t, b.usure, b.double + 0.6, easeOut));
  return (
    <g>
      <Title x={cx} y={gy - 1110} t={t} t0={b.contre}>ça marche aussi contre toi</Title>
      <WText x={cx - 440} y={gy - 960} size={70} color={C.red} o={prog(t, b.usure, b.usure + 0.4, easeOut)}>crédit conso : jusqu’à 23,6 %</WText>
      <WText x={cx - 440} y={gy - 880} size={42} weight={400} color={C.muted} o={prog(t, b.usure + 0.4, b.usure + 0.8, easeOut)}>taux maximum légal, prêts ≤ 3 000 €</WText>
      <WHighlight x={cx - 450} y={gy - 760} w={600} h={76} k={prog(t, b.double + 0.6, b.double + 1.1, easeOut)} color="rgba(224,53,43,0.25)" />
      <WText x={cx - 440} y={gy - 705} size={64} o={prog(t, b.double, b.double + 0.4, easeOut)}>×2 en ≈ 3 ans</WText>
      {t > b.usure && t < b.double + 2.0 ? <Ball x={x} r={r} label="dette" red id={40} /> : null}
    </g>
  );
};

const Einstein: React.FC<{b: B; t: number}> = ({b, t}) => {
  const cx = STX(5);
  const gy = STY(5);
  const kF = prog(t, b.einstein, b.einstein + 0.5, easeOut);
  return (
    <g>
      <Title x={cx} y={gy - 1110} t={t} t0={b.einstein}>« la 8e merveille du monde »</Title>
      <g opacity={kF}>
        <rect x={cx - 450} y={gy - 960} width={300} height={380} fill="#C9A06A" stroke={C.ink} strokeWidth={8} />
        <rect x={cx - 420} y={gy - 930} width={240} height={320} fill={C.paperShade} stroke={C.ink} strokeWidth={4} />
        <WText x={cx - 300} y={gy - 720} size={190} anchor="middle" color={C.muted}>?</WText>
        <WText x={cx - 300} y={gy - 530} size={42} anchor="middle" weight={400}>Einstein ?</WText>
        <path d={`M ${cx - 120} ${gy - 900} Q ${cx + 100} ${gy - 980} ${cx + 230} ${gy - 880} Q ${cx + 260} ${gy - 790} ${cx + 60} ${gy - 760} L ${cx - 60} ${gy - 700} L ${cx - 40} ${gy - 770} Q ${cx - 160} ${gy - 800} ${cx - 120} ${gy - 900} Z`} fill={C.white} stroke={C.ink} strokeWidth={6} />
        <WText x={cx + 60} y={gy - 845} size={36} anchor="middle">8e merveille…</WText>
      </g>
      <Stamp x={cx - 150} y={gy - 560} k={bounce(t, b.faux + 0.2)} w={480} text="sans doute jamais dit" size={48} />
      <g opacity={prog(t, b.pub, b.pub + 0.5, easeOut)}>
        <Doc x={cx - 440} y={gy - 420} w={520} h={300} title="PUBLICITÉ — 1925" lines={['« The Eighth Wonder', 'of the World… »']} k={prog(t, b.pub, b.pub + 1.0, easeOut)} id={50} rot={-3} size={38} />
      </g>
    </g>
  );
};

const Franklin: React.FC<{b: B; t: number}> = ({b, t}) => {
  const cx = STX(6);
  const gy = STY(6);
  const kB = prog(t, b.boston, b.boston + 1.2, easeOut);
  const r = lerp(60, 330, kB);
  const x = lerp(cx - HALF - 400, cx - 130, kB);
  return (
    <g>
      <Title x={cx} y={gy - 1110} t={t} t0={b.pari}>le pari de Franklin</Title>
      <Parchment x={cx - 220} y={gy - 1000} w={420} h={300} k={prog(t, b.pari, b.pari + 0.6, easeOut)} title="1790" lines={['1 000 livres']} id={60} />
      {t > b.boston - 0.1 ? <Ball x={x} r={r} id={61} /> : null}
      {kB > 0.6 ? <WText x={x} y={groundAt(x) - r + 30} size={96} anchor="middle" color={C.green}>≈ 4,5 M$</WText> : null}
      <WText x={cx + 30} y={gy - 880} size={52} color={C.pen} o={prog(t, b.boston + 0.2, b.boston + 0.6, easeOut)}>Boston, 1990 :</WText>
    </g>
  );
};

const Chute: React.FC<{b: B; t: number}> = ({b, t}) => {
  const cx = STX(7);
  const gy = STY(7);
  const zig: [number, number][] = Array.from({length: 14}, (_, i) => [cx - 450 + i * 45, gy - 560 - i * 22 + (rand(i * 3.7) - 0.5) * 220]);
  return (
    <g>
      <Title x={cx} y={gy - 1110} t={t} t0={b.risques} size={64}>d’où viennent ces rendements ?</Title>
      <line x1={cx - 450} y1={gy - 300} x2={cx + 180} y2={gy - 300} stroke={C.ink} strokeWidth={5} opacity={prog(t, b.risques, b.risques + 0.4, easeOut)} />
      <Ink pts={zig} k={prog(t, b.risques + 0.4, b.risques + 2.2, easeInOut)} color={C.pen} width={8} id={70} />
      <WText x={cx + 60} y={gy - 600} size={220} color={C.orange} o={prog(t, b.next, b.next + 0.4, easeOut)} rot={Math.sin(t * 3) * 6}>?</WText>
    </g>
  );
};

// ---------- Pierrot ----------
const PX = (i: number) => STX(i) + 360;
const pierrotTrack = (b: B, end: number): Track => {
  const run = (t0: number, i0: number, i1: number, d = 1.7): Move => ({t0, t1: t0 + d, x0: PX(i0), x1: PX(i1), gait: 'courir'});
  const moves: Move[] = [
    run(b.principe, 0, 1),
    run(b.regle72, 1, 2),
    run(b.temps, 2, 3),
    run(b.contre, 3, 4),
    run(b.double + 0.3, 4, 5, 1.6), // il fuit la dette… jusqu'à la station suivante
    run(b.pari, 5, 6),
    run(b.risques, 6, 7),
  ];
  const keys: Key[] = [
    {t: 0, pose: 'reflechir', dur: 0.01},
    {t: b.consigne + 0.6, pose: 'choque', hold: 1.0},
    {t: b.pourquoi + 0.6, pose: 'pointer', hold: 1.4},
    {t: b.an30 + 0.4, pose: 'choque', hold: 1.0},
    {t: b.courbe + 0.8, pose: 'pointer', hold: 1.4},
    {t: b.divise + 0.3, pose: 'pointer', hold: 1.8},
    {t: b.livret + 1.0, pose: 'hausser', hold: 1.2},
    {t: b.total1 + 0.4, pose: 'content', hold: 1.0},
    {t: b.ecart + 0.3, pose: 'choque', hold: 1.0},
    {t: b.usure + 0.4, pose: 'choque', hold: 1.0},
    {t: b.faux + 0.2, pose: 'hausser', hold: 1.4},
    {t: b.boston + 0.8, pose: 'choque', hold: 1.4},
    {t: b.next, pose: 'reflechir', hold: end - b.next},
  ];
  return {ground: R0, x: PX(0), restFacing: -1, moves, keys};
};

const STATION_AT = (b: B): [number, number][] => [
  [0, 0], [b.principe, 1], [b.regle72, 2], [b.temps, 3], [b.contre, 4], [b.einstein, 5], [b.pari, 6], [b.risques, 7],
];

export const Interets: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const end = tl.duration;
  const PT = pierrotTrack(b, end);
  const px = solve(PT, t).pelvis[0];
  const dy = groundAt(px) - R0;
  const cam = camAt(t, STATION_AT(b).map(([t0, i]) => ({t: t0, x: STX(i), y: STY(i) - 400, z: 1, dur: 1.7})));
  const target: [number, number] = [cam.x - 260, cam.y - 320 - dy];
  const sources: [number, number, string][] = [
    [0, b.principe, 'Education Week, 25/04/1990'],
    [b.principe, b.temps, 'calculs à taux hypothétique · Livret A : info.gouv.fr (1,7 %)'],
    [b.temps, b.contre, 'calcul : 100 €/mois, 4 %/an, capitalisation mensuelle'],
    [b.contre, b.einstein, 'Banque de France, taux d’usure au 1er octobre 2026'],
    [b.einstein, b.pari, 'Quote Investigator (2019) · The Ultimate Quotable Einstein'],
    [b.pari, b.risques, 'Education Week, 25/04/1990'],
  ];
  const next = sp(frame, b.next + 0.8, POP);
  // flocons (écran)
  const flakes = Array.from({length: 26}, (_, i) => {
    const sx = rand(i * 1.7) * 1080 + Math.sin(t * 0.8 + i) * 30;
    const sy = ((rand(i * 3.1) * 1920 + t * (40 + rand(i) * 60)) % 1960) - 20;
    return <circle key={i} cx={sx} cy={sy} r={3 + rand(i * 5.3) * 5} fill={C.white} stroke="rgba(31,63,191,0.25)" strokeWidth={1.5} />;
  });
  return (
    <>
      <World cam={cam} width={STX(N - 1) + 1200} height={STY(N - 1) + 1200}>
        <Mountain />
        <Hook b={b} t={t} />
        <Principe b={b} t={t} />
        <Regle b={b} t={t} />
        <Temps b={b} t={t} />
        <Twist b={b} t={t} />
        <Einstein b={b} t={t} />
        <Franklin b={b} t={t} />
        <Chute b={b} t={t} />
        <g transform={`translate(0 ${dy})`}>
          <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={t < b.principe ? 1.1 : 0.95} track={{...PT, target}} />
        </g>
      </World>
      <svg width={1080} height={1920} style={{position: 'absolute', pointerEvents: 'none'}}>{flakes}</svg>
      {sources.map(([a, z, s], i) => (
        <AbsoluteFill key={i} style={{opacity: vis(t, a, z)}}>
          <div style={{position: 'absolute', left: 110, top: 1378, width: 680, fontFamily: F.note, fontSize: 27, color: C.muted, lineHeight: 1.1}}>Source : {s}</div>
        </AbsoluteFill>
      ))}
      {next > 0.01 ? (
        <div style={{position: 'absolute', left: 110, top: 1060, maxWidth: 620}}>
          <Sticker k={next} rotate={-3}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 52, color: C.pen, lineHeight: 1.1, display: 'block'}}>
              la suite :<br />la Bourse →
            </span>
          </Sticker>
        </div>
      ) : null}
    </>
  );
};

