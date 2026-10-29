// Vidéo éco n°8 — « Ton Livret A rapporte vraiment ? »
// Grande page + caméra ; idée neuve : « suis la pièce » — une pièce de 1 € sort du livret, roule dans un tuyau
// jusqu'à la Caisse des dépôts et ressort en immeubles. Chiffres : videos/08-livret-a/sources.md
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, easeIn, easeInOut, easeOut, F, FPS, lerp, overshoot, POP, prog, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move} from '../rig/rig';
import {fmtFR, Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {along, B, Baguette, Bar, Basket, Bill, Building, Coin, Machine, MonthCal, Passbook, Pipe, Snowball, Temple, Thermo, vis} from '../components/Drawings';
import {camAt, WHighlight, World, WText} from '../components/Camera';

const R0 = 1360;
const DY = 2400;
const ST = {
  hook: [540, 960], reel: [1940, 960], illusion: [3340, 960], formule: [4740, 960],
  argent: [4740, 3360], caisse: [3340, 3360], quinz: [1940, 3360], lep: [540, 3360], chute: [2640, 2160],
} as const;
const PIPE: [number, number][] = [[4560, 3220], [4300, 3220], [4120, 3330], [3820, 3330], [3640, 3180], [3420, 3180]];

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
const pop = (t: number, t0: number) => sp(Math.round(t * FPS), t0, POP);

// ---------- stations ----------
const Hook: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.hook;
  const lA = 0.3 + 0.125 * prog(t, 0.2, 1.0, easeOut);
  const lP = 0.775 * prog(t, b.prix, b.prix + 1.0, easeOut);
  const gap = prog(t, b.calcul, b.calcul + 0.5, easeOut);
  const base = cy + 250;
  const yOf = (lv: number) => base - 660 * lv; // hauteur de la colonne (h=700, -40)
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={-1} size={84}>ton Livret A</Title>
      <Thermo x={cx - 330} y={base} h={700} level={lA} color={C.pen} id={1} />
      <Thermo x={cx - 80} y={base} h={700} level={lP} color={C.red} id={2} />
      <WText x={cx - 330} y={base + 160} size={46} anchor="middle">Livret A</WText>
      <WText x={cx - 80} y={base + 160} size={46} anchor="middle">les prix</WText>
      <WText x={cx - 330} y={yOf(0.425) - 20} size={58} anchor="middle" color={C.pen}>1,7 %</WText>
      <WText x={cx - 80} y={yOf(0.775) - 20} size={58} anchor="middle" color={C.red} o={prog(t, b.prix + 0.7, b.prix + 1.0, easeOut)}>3,1 %</WText>
      {gap > 0 ? (
        <g opacity={gap}>
          <path d={`M ${cx + 0} ${yOf(0.775)} L ${cx + 30} ${yOf(0.775)} L ${cx + 30} ${yOf(0.425)} L ${cx + 0} ${yOf(0.425)}`} stroke={C.red} strokeWidth={6} fill="none" />
          <WText x={cx + 60} y={(yOf(0.775) + yOf(0.425)) / 2 + 30} size={110} color={C.orange} rot={Math.sin(t * 3) * 5}>?</WText>
        </g>
      ) : null}
    </g>
  );
};

const Reel: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.reel;
  const kStamp = pop(t, b.cent + 0.3);
  const shrink = prog(t, b.cent, b.cent + 1.0, easeInOut);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.reel}>le taux réel</Title>
      <WText x={cx - 450} y={cy - 520} size={70} o={prog(t, b.reel + 0.6, b.reel + 1.0, easeOut)}>1,7 % − 3,1 %</WText>
      <WHighlight x={cx - 460} y={cy - 460} w={360} h={84} k={prog(t, b.moins + 0.5, b.moins + 0.9, easeOut)} color="rgba(224,53,43,0.25)" />
      <WText x={cx - 450} y={cy - 395} size={90} color={C.red} o={prog(t, b.moins, b.moins + 0.3, easeOut)}>= −1,4 %</WText>
      <g opacity={prog(t, b.moyen, b.moyen + 0.4, easeOut)}>
        {[0, 1, 2].map((i) => <Bill key={i} x={cx - 330 + i * 20} y={cy - 120 - i * 30} w={240} rot={-6 + i * 5} id={10 + i} />)}
        <WText x={cx - 330} y={cy + 30} size={56} anchor="middle">≈ 7 500 €</WText>
      </g>
      <g opacity={prog(t, b.cent - 0.2, b.cent + 0.2, easeOut)}>
        <Basket x={cx + 30} y={cy + 160} s={lerp(0.85, 0.62, shrink)} items={lerp(5, 3, shrink)} id={13} />
      </g>
      <Stamp x={cx - 150} y={cy + 300} k={kStamp} w={520} text="≈ −100 € / an" size={60} />
    </g>
  );
};

const Illusion: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.illusion;
  const k = prog(t, b.solde + 0.3, b.euros + 1.5, easeInOut);
  const euros = 7500 * (1 + 0.017 * k);
  const lost = Math.floor(k * 2.99);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.solde}>ce que tu vois… et ce qui est</Title>
      <line x1={cx - 100} y1={cy - 520} x2={cx - 100} y2={cy + 300} stroke={C.ink} strokeWidth={5} strokeDasharray="16 12" opacity={prog(t, b.solde, b.solde + 0.4, easeOut)} />
      <WText x={cx - 290} y={cy - 440} size={42} anchor="middle" color={C.pen} o={prog(t, b.solde, b.solde + 0.4, easeOut)}>ton solde</WText>
      <WText x={cx - 290} y={cy - 300} size={86} anchor="middle" o={prog(t, b.solde, b.solde + 0.4, easeOut)}>{fmtFR(euros)} €</WText>
      <WText x={cx - 290} y={cy - 200} size={80} anchor="middle" color={C.green} o={prog(t, b.solde + 0.6, b.solde + 1.0, easeOut)}>↑</WText>
      <WText x={cx + 80} y={cy - 440} size={42} anchor="middle" color={C.red} o={prog(t, b.solde + 0.5, b.solde + 0.9, easeOut)}>ce qu’il achète</WText>
      {Array.from({length: 6}, (_, i) => (
        <g key={i} opacity={(i < 6 - lost ? 1 : 0.15) * prog(t, b.solde + 0.5 + i * 0.1, b.solde + 0.8 + i * 0.1, easeOut)}>
          <Baguette x={cx + 80} y={cy - 330 + i * 70} len={230} rot={-6} id={20 + i} />
        </g>
      ))}
      <WText x={cx + 80} y={cy + 160} size={80} anchor="middle" color={C.red} o={prog(t, b.solde + 1.2, b.solde + 1.6, easeOut)}>↓</WText>
      <WHighlight x={cx - 450} y={cy + 200} w={560} h={68} k={prog(t, b.fisher + 1.0, b.fisher + 1.5, easeOut)} />
      <WText x={cx - 440} y={cy + 250} size={60} o={prog(t, b.fisher + 0.8, b.fisher + 1.1, easeOut)}>l’illusion monétaire</WText>
      <WText x={cx - 440} y={cy + 320} size={40} color={C.pen} weight={400} o={prog(t, b.fisher + 0.2, b.fisher + 0.6, easeOut)}>Irving Fisher, 1928</WText>
    </g>
  );
};

const Formule: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.formule;
  const out = prog(t, b.fevrier, b.fevrier + 0.8, easeOut);
  const kSt = sp(Math.round(t * FPS), b.arrondi + 0.3, {damping: 9, stiffness: 240, mass: 0.7});
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.formule}>une formule</Title>
      <g opacity={prog(t, b.formule, b.formule + 0.5, easeOut)}>
        <Machine x={cx - 200} y={cy - 220} w={460} left="inflation" right="taux BCE" ticket="1,4 %" out={out} t={t} id={30} />
      </g>
      <WText x={cx - 200} y={cy + 250} size={40} anchor="middle" weight={400} color={C.pen} o={prog(t, b.formule + 1.0, b.formule + 1.4, easeOut)}>moyenne des deux, révisée 2 fois par an</WText>
      <Stamp x={cx - 90} y={cy + 110} k={kSt} w={240} text="1,5 %" size={70} rot={-12} />
      <WText x={cx - 450} y={cy + 330} size={46} color={C.red} o={prog(t, b.arrondi + 0.8, b.arrondi + 1.2, easeOut)} rot={-3}>arrondi par le gouvernement</WText>
    </g>
  );
};

const Argent: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.argent;
  const [kx, ky] = ST.caisse;
  const kPipe = prog(t, b.dort + 0.3, b.dort + 0.8, easeOut);
  const u = prog(t, b.caisse, b.hlm, easeInOut);
  const [coX, coY] = u > 0 ? along(PIPE, u) : [cx - 200 - 40 * prog(t, b.dort + 0.4, b.dort + 1.0, overshoot), cy - 260 - 120 * Math.sin(Math.PI * prog(t, b.dort + 0.4, b.dort + 1.0, easeOut))];
  const showCoin = t > b.dort + 0.3 && t < b.hlm + 0.3;
  const kTemple = prog(t, b.caisse + 0.4, b.caisse + 1.0, easeOut);
  const bld = (i: number) => prog(t, b.neufs + i * 0.35, b.neufs + i * 0.35 + 0.9, overshoot);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.dort}>ton argent ne dort pas</Title>
      <Passbook x={cx - 220} y={cy - 120} w={300} title="LIVRET A" open={prog(t, b.dort, b.dort + 0.5, easeOut)} id={40} />
      <Pipe pts={PIPE} k={kPipe} />
      <WText x={4300} y={3110} size={64} color={C.orange} o={prog(t, b.caisse + 0.3, b.caisse + 0.7, easeOut)}>≈ 60 %</WText>
      {/* la Caisse des dépôts et les immeubles financés */}
      <Title x={kx} y={ky - 700} t={t} t0={b.hlm - 0.2}>la Caisse des dépôts</Title>
      <g opacity={kTemple}>
        <Temple x={kx - 140} y={ky - 80} w={380} label="CAISSE DES DÉPÔTS" labelSize={28} k={kTemple} id={41} />
      </g>
      {[0, 1, 2].map((i) => (bld(i) > 0 ? <Building key={i} x={kx - 380 + i * 190} y={ky + 330} w={150} h={180 + 90 * i * bld(i) + 120 * bld(i)} id={42 + i} lit={0.9} /> : null))}
      <WText x={kx - 200} y={ky - 520} size={84} anchor="middle" o={prog(t, b.neufs, b.neufs + 0.3, easeOut)}>{fmtFR(123000 * prog(t, b.neufs, b.neufs + 1.4, easeOut))}</WText>
      <WText x={kx - 200} y={ky - 450} size={42} anchor="middle" weight={400} color={C.pen} o={prog(t, b.neufs + 0.6, b.neufs + 1.0, easeOut)}>logements sociaux neufs (2025)</WText>
      {showCoin ? <Coin x={coX} y={coY} r={44} rot={t * 400} /> : null}
    </g>
  );
};

const Quinz: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.quinz;
  const kZ = sp(Math.round(t * FPS), b.zero, {damping: 9, stiffness: 240, mass: 0.7});
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.detail}>la règle des quinzaines</Title>
      <MonthCal x={cx - 470} y={cy - 470} cell={90} k={prog(t, b.detail + 0.6, b.detail + 1.6, easeOut)} id={50} marks={[
        {day: 2, color: C.green, label: 'dépôt', k: prog(t, b.depot, b.depot + 0.4, easeOut)},
        {day: 28, color: C.red, label: 'retrait', k: prog(t, b.depot + 1.0, b.depot + 1.4, easeOut)},
      ]} />
      <WText x={cx - 470} y={cy + 100} size={40} weight={400} color={C.pen} o={prog(t, b.detail + 0.8, b.detail + 1.2, easeOut)}>1er → 15 | 16 → fin du mois</WText>
      <Stamp x={cx - 150} y={cy + 260} k={kZ} w={420} text="0 € d’intérêts" size={64} />
    </g>
  );
};

const Lep: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.lep;
  const kA = prog(t, b.lep + 0.2, b.lep + 0.9, easeOut);
  const kL = prog(t, b.lep + 0.6, b.lep + 1.6, overshoot);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.lep}>revenus modestes : le LEP</Title>
      <Passbook x={cx - 330} y={cy - 360} w={210} title="LIVRET A" id={60} />
      <Passbook x={cx - 70} y={cy - 360} w={210} title="LEP" id={61} />
      <Bar x={cx - 400} base={cy + 300} w={140} h={1.7 * 150} k={kA} color={C.pen} id={62} />
      <Bar x={cx - 140} base={cy + 300} w={140} h={2.5 * 150} k={kL} color={C.green} id={63} />
      <WText x={cx - 330} y={cy + 360} size={52} anchor="middle" color={C.pen} o={kA}>1,7 %</WText>
      <WText x={cx - 70} y={cy + 360} size={52} anchor="middle" color={C.green} o={prog(t, b.lep + 1.2, b.lep + 1.6, easeOut)}>2,5 %</WText>
      <WText x={cx - 40} y={cy - 40} size={52} color={C.green} o={prog(t, b.plus, b.plus + 0.4, easeOut)} rot={-6}>≈ +50 %</WText>
    </g>
  );
};

const Chute: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.chute;
  const roll = prog(t, b.grossir, b.grossir + 3.0, easeInOut);
  const r = lerp(40, 190, roll);
  const kSt = sp(Math.round(t * FPS), b['1818'] + 0.2, {damping: 9, stiffness: 240, mass: 0.7});
  return (
    <g>
      <Stamp x={cx - 220} y={cy - 360} k={kSt} w={330} text="depuis 1818" size={58} color={C.pen} rot={-8} />
      <line x1={cx - 480} y1={cy + 60} x2={cx + 160} y2={cy + 60} stroke={C.ink} strokeWidth={6} opacity={prog(t, b.grossir - 0.3, b.grossir, easeOut)} />
      {roll > 0 ? <Snowball x={lerp(cx - 440, cx - 200, roll)} y={cy + 60 - r} r={r} rot={roll * 720} id={70} /> : null}
      <WText x={cx + 120} y={cy - 140} size={200} color={C.orange} o={prog(t, b.grossir + 1.6, b.grossir + 2.0, easeOut)} rot={Math.sin(t * 3) * 6}>?</WText>
    </g>
  );
};

// ---------- Pierrot ----------
const pierrot = (b: B, end: number) => {
  const run = (t0: number, x0: number, x1: number, d = 1.3): Move => ({t0, t1: t0 + d, x0, x1, gait: 'courir'});
  const moves: Move[] = [
    run(b.reel, 900, 2300),
    run(b.solde, 2300, 3700),
    run(b.formule, 3700, 5100),
    {t0: b.caisse, t1: b.hlm, x0: 5100, x1: 3700, gait: 'courir'}, // court derrière la pièce
    run(b.detail, 3700, 2300),
    run(b.lep, 2300, 900),
    run(b['1818'], 900, 2900, 1.5),
  ];
  const keys: Key[] = [
    {t: 0, pose: 'content', dur: 0.01},
    {t: b.prix + 0.8, pose: 'choque', hold: 0.8},
    {t: b.calcul, pose: 'reflechir', hold: 1.0},
    {t: b.moins + 0.2, pose: 'pointer', hold: 1.4},
    {t: b.cent + 0.4, pose: 'choque', hold: 1.0},
    {t: b.fisher + 0.8, pose: 'pointer', hold: 1.8},
    {t: b.fevrier + 0.4, pose: 'pointer', hold: 1.2},
    {t: b.arrondi + 0.4, pose: 'hausser', hold: 1.2},
    {t: b.dort + 1.0, pose: 'choque', hold: 0.5},
    {t: b.neufs + 0.6, pose: 'content', hold: 1.6},
    {t: b.depot + 0.2, pose: 'pointer', hold: 1.8},
    {t: b.zero, pose: 'choque', hold: 1.0},
    {t: b.plus, pose: 'content', hold: 1.4},
    {t: b.grossir + 1.6, pose: 'reflechir', hold: end - b.grossir - 1.6},
  ];
  return {moves, keys};
};
const pierrotDy = (b: B, t: number) => {
  const fall = prog(t, b.dort, b.dort + 1.0, easeIn) * DY;
  const climb = prog(t, b['1818'], b['1818'] + 1.5, easeInOut) * (DY - (ST.chute[1] + 230 - R0));
  return fall - climb;
};

export const LivretA: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const end = tl.duration;
  const P = pierrot(b, end);
  const cam = camAt(t, [
    {t: 0, x: ST.hook[0], y: ST.hook[1], z: 1},
    {t: b.reel, x: ST.reel[0], y: ST.reel[1], dur: 1.3},
    {t: b.solde, x: ST.illusion[0], y: ST.illusion[1], dur: 1.3},
    {t: b.formule, x: ST.formule[0], y: ST.formule[1], dur: 1.3},
    {t: b.dort, x: ST.argent[0], y: ST.argent[1], dur: 1.0},
    {t: b.caisse, x: ST.caisse[0], y: ST.caisse[1], dur: b.hlm - b.caisse},
    {t: b.detail, x: ST.quinz[0], y: ST.quinz[1], dur: 1.3},
    {t: b.lep, x: ST.lep[0], y: ST.lep[1], dur: 1.3},
    {t: b['1818'], x: 2640, y: 2160, z: 0.2, dur: 1.5},
    {t: b.grossir - 0.2, x: ST.chute[0], y: ST.chute[1] - 40, z: 1, dur: 1.2},
  ]);
  const dy = pierrotDy(b, t);
  const target: [number, number] = [cam.x - 260, cam.y - 320 - dy];
  const sources: [number, number, string][] = [
    [0, b.solde, 'info.gouv.fr (taux au 1er août 2026) · INSEE (inflation sept. 2026) · La finance pour tous'],
    [b.solde, b.formule, 'I. Fisher, « The Money Illusion » (1928)'],
    [b.formule, b.dort, 'info.gouv.fr · La finance pour tous (formule) · MeilleureSCPI (février 2026)'],
    [b.dort, b.detail, 'Caisse des Dépôts, rapport 2025 du Fonds d’épargne'],
    [b.detail, b.lep, 'La finance pour tous (art. R221-4 du Code monétaire et financier)'],
    [b.lep, b['1818'], 'info.gouv.fr (LEP au 1er août 2026)'],
  ];
  const next = sp(frame, b.next + 1.0, POP);
  const fadeOthers = 1 - prog(t, b.grossir - 0.2, b.grossir + 0.8, easeInOut);
  return (
    <>
      <World cam={cam} width={5300} height={4320}>
        <g opacity={fadeOthers}>
          <Hook b={b} t={t} />
          <Reel b={b} t={t} />
          <Illusion b={b} t={t} />
          <Formule b={b} t={t} />
          <Argent b={b} t={t} />
          <Quinz b={b} t={t} />
          <Lep b={b} t={t} />
        </g>
        <g opacity={prog(t, b['1818'] - 0.2, b['1818'] + 0.4, easeOut)}>
          <Chute b={b} t={t} />
        </g>
        <g transform={`translate(0 ${dy})`}>
          <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={t < b.reel ? 1.1 : 0.95} track={{ground: R0, x: 900, restFacing: -1, target, moves: P.moves, keys: P.keys}} />
        </g>
      </World>
      {sources.map(([a, z, s], i) => (
        <AbsoluteFill key={i} style={{opacity: vis(t, a, z)}}>
          <div style={{position: 'absolute', left: 110, top: 1378, width: 680, fontFamily: F.note, fontSize: 27, color: C.muted, lineHeight: 1.1}}>Source : {s}</div>
        </AbsoluteFill>
      ))}
      {next > 0.01 ? (
        <div style={{position: 'absolute', left: 110, top: 1060, maxWidth: 620}}>
          <Sticker k={next} rotate={-3}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 52, color: C.pen, lineHeight: 1.1, display: 'block'}}>
              la suite :<br />les intérêts composés →
            </span>
          </Sticker>
        </div>
      ) : null}
    </>
  );
};
