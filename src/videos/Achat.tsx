// Vidéo éco n°7 — « Acheter ou louer ? »
// Grande page + caméra (voir Logement.tsx) ; idée neuve : une COURSE locataire vs acheteur que la caméra suit,
// puis un levier qui bascule. Chiffres : videos/07-acheter-ou-louer/sources.md
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, easeIn, easeInOut, easeOut, F, FPS, lerp, overshoot, POP, prog, rand, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move, solve, Track as TrackT} from '../rig/rig';
import {Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {B, Bill, Hourglass, House, Lever, Passbook, Plant, PriceTag, Scissors, Track, vis, Window} from '../components/Drawings';
import {camAt, Ink, WHighlight, World, WText} from '../components/Camera';

const ORANGE = C.orange;
const R0 = 1360; // sol de la rangée du haut
const DY = 2400; // écart entre les rangées
const X0 = 2700; // départ de la course
const PPY = 168; // px par année de course
const ST = {hook: [540, 960], frais: [1940, 960], opport: [4640, 3360], levier: [3240, 3360], chute: [1840, 3360]} as const;

const Title: React.FC<{x: number; y: number; t: number; t0: number; size?: number; children: React.ReactNode}> = ({x, y, t, t0, size = 76, children}) => (
  <WText x={x} y={y + (1 - prog(t, t0, t0 + 0.4, easeOut)) * 30} size={size} anchor="middle" o={prog(t, t0, t0 + 0.4, easeOut)}>
    {children}
  </WText>
);
const Stamp: React.FC<{x: number; y: number; k: number; w: number; text: string; color?: string; size?: number; rot?: number}> = ({x, y, k, w, text, color = C.red, size = 56, rot = -7}) =>
  k > 0.01 ? (
    <g transform={`translate(${x} ${y}) rotate(${rot + (1 - k) * 18}) scale(${k})`}>
      <rect x={-w / 2} y={-size * 1.05} width={w} height={size * 2.1} rx={12} fill={C.white} stroke={color} strokeWidth={7} />
      <WText x={0} y={size * 0.35} size={size} color={color} anchor="middle">{text}</WText>
    </g>
  ) : null;

// ---------- stations ----------
const Hook: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.hook;
  const shut = prog(t, b.pas - 0.1, b.pas + 0.25, overshoot);
  const stamp = sp(Math.round(t * FPS), b.pas + 0.35, {damping: 9, stiffness: 240, mass: 0.7});
  const wx = cx - 190;
  const wy = cy - 120;
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={-1} size={84}>louer = argent jeté ?</Title>
      {/* billets qui s'envolent par la fenêtre tant qu'elle est ouverte */}
      {Array.from({length: 7}, (_, i) => {
        const u = (t * 0.7 + i / 7) % 1;
        if (t > b.pas + 0.1 && u > 0.1) return null;
        return <Bill key={i} x={wx + lerp(0, -260 + rand(i) * 140, u)} y={wy + lerp(0, -560, u) + Math.sin(u * 9 + i) * 30} w={120} rot={u * 160 - 40} id={60 + i} />;
      })}
      <Window x={wx} y={wy} w={340} shut={shut} id={1} />
      <Stamp x={cx - 160} y={cy + 300} k={stamp} w={480} text="pas si simple" />
    </g>
  );
};

const Frais: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.frais;
  const sn = prog(t, b.frais + 0.5, b.frais + 1.1, easeInOut);
  const open = Math.abs(Math.sin(sn * Math.PI * 2));
  const cut = prog(t, b.frais + 1.1, b.frais + 1.8, easeOut);
  const kBar = prog(t, b.impots + 0.3, b.impots + 1.3, easeInOut);
  const W = 640;
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.frais}>le jour où tu achètes</Title>
      <PriceTag x={cx - 440} y={cy - 420} w={620} frac={0.075} cut={cut} id={10} />
      {sn > 0 && sn < 1 ? <Scissors x={cx - 440 + 620 * 0.925} y={cy - 560 + sn * 140} s={0.9} open={open} rot={90} /> : null}
      <WText x={cx + 130} y={cy - 210} size={64} color={C.red} o={cut}>−7 à 8 %</WText>
      <WText x={cx - 450} y={cy - 150} size={46} weight={400} o={prog(t, b.impots, b.impots + 0.4, easeOut)}>dans ces 7-8 % :</WText>
      {/* l'essentiel = impôts (≈ 6,3 % du prix sur ≈ 7,5 %) */}
      <rect x={cx - 450} y={cy - 110} width={W * 0.84 * kBar} height={130} fill={ORANGE} opacity={0.85} stroke={C.ink} strokeWidth={6} rx={10} />
      <rect x={cx - 450 + W * 0.84} y={cy - 110} width={W * 0.16 * prog(t, b.impots + 1.1, b.impots + 1.5, easeOut)} height={130} fill="#9A968C" stroke={C.ink} strokeWidth={6} rx={10} />
      <WText x={cx - 430} y={cy - 28} size={62} color={C.white} o={kBar}>IMPÔTS</WText>
      <WText x={cx - 450 + W * 0.84 + 10} y={cy + 70} size={34} weight={400} o={prog(t, b.impots + 1.4, b.impots + 1.8, easeOut)}>notaire</WText>
      <WHighlight x={cx - 460} y={cy + 110} w={540} h={68} k={prog(t, b.dmto + 0.5, b.dmto + 1.0, easeOut)} />
      <WText x={cx - 450} y={cy + 160} size={60} o={prog(t, b.dmto + 0.3, b.dmto + 0.6, easeOut)}>droits de mutation</WText>
      <WText x={cx - 450} y={cy + 225} size={42} color={C.pen} weight={400} o={prog(t, b.dmto + 1.4, b.dmto + 1.8, easeOut)}>→ surtout pour le département</WText>
    </g>
  );
};

const Race: React.FC<{b: B; t: number}> = ({b, t}) => {
  const kMain = prog(t, b.point - 0.4, b.point + 0.6, easeOut);
  return (
    <g>
      <WText x={X0 + 600} y={R0 - 620} size={84} o={prog(t, b.point, b.point + 0.4, easeOut) * (1 - prog(t, b.paris, b.paris + 0.5, easeOut))}>le point mort</WText>
      <WText x={X0 + 12.25 * PPY} y={R0 - 560} size={72} anchor="middle" color={ORANGE} o={prog(t, b.moyenne, b.moyenne + 0.4, easeOut)}>≈ 12 ans</WText>
      <WText x={X0 - 140} y={R0 - 180} size={40} color={C.pen} weight={400} o={kMain}>louer</WText>
      <WText x={X0 - 140} y={R0 - 60} size={40} color={ORANGE} weight={400} o={kMain}>acheter</WText>
      <line x1={X0} y1={R0 - 330} x2={X0} y2={R0 + 30} stroke={C.ink} strokeWidth={6} strokeDasharray="16 10" opacity={kMain} />
      <Track x0={X0} y={R0} pxPerYear={PPY} years={25} flag={12.25} k={kMain} id={20} size={44} />
      <Track x0={X0} y={R0 - 700} pxPerYear={PPY} years={25} flag={21} flagLabel="Paris : > 20 ans" labelLeft k={prog(t, b.paris + 0.4, b.paris + 1.6, easeOut)} id={21} size={130} color={C.red} />
      <Track x0={X0} y={R0 - 1400} pxPerYear={PPY} years={25} flag={1.7} flagLabel="Mulhouse : < 2 ans" k={prog(t, b.mulhouse, b.mulhouse + 0.8, easeOut)} id={22} size={130} color={C.green} />
      <WText x={X0 + 1900} y={R0 + 420} size={200} anchor="middle" o={prog(t, b.paris + 0.6, b.paris + 1.0, easeOut) * (1 - prog(t, b.opportunite - 0.3, b.opportunite, easeIn))}>moyenne : 12 ans</WText>
    </g>
  );
};

const Opport: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.opport;
  const kBag = sp(Math.round(t * FPS), b.cache + 0.4, POP);
  const kA = prog(t, b.ailleurs + 0.2, b.ailleurs + 1.0, easeInOut);
  const kP = prog(t, b.ailleurs + 0.8, b.ailleurs + 2.6, easeOut);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.cache}>le coût caché : ton apport</Title>
      <g transform={`translate(${cx - 180} ${cy - 360}) scale(${kBag})`}>
        <path d="M -110 60 Q -150 -60 -40 -90 L -60 -130 L 60 -130 L 40 -90 Q 150 -60 110 60 Q 0 110 -110 60 Z" fill="#E0C27A" stroke={C.ink} strokeWidth={7} />
        <text x={0} y={30} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={64} fill={C.ink}>€</text>
        <text x={0} y={150} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={50} fill={C.ink}>apport</text>
      </g>
      <Ink pts={[[cx - 260, cy - 180], [cx - 360, cy], [cx - 330, cy + 120]]} k={kA} color={ORANGE} width={7} id={30} dash={kA >= 1 ? '18 12' : undefined} />
      <Ink pts={[[cx - 100, cy - 180], [cx + 0, cy], [cx - 30, cy + 120]]} k={kA} color={C.green} width={7} id={31} dash={kA >= 1 ? '18 12' : undefined} />
      <g opacity={kA}>
        <House x={cx - 330} y={cy + 320} s={0.9} id={32} />
      </g>
      <WText x={cx - 330} y={cy + 400} size={40} anchor="middle" weight={400} o={kA}>tu achètes</WText>
      <Plant x={cx - 20} y={cy + 240} h={260} k={kP} id={33} />
      <WText x={cx - 20} y={cy + 400} size={40} anchor="middle" weight={400} o={kA}>tu loues : il rapporte</WText>
      <WHighlight x={cx - 460} y={cy - 610} w={560} h={66} k={prog(t, b.nom + 0.8, b.nom + 1.3, easeOut)} />
      <WText x={cx - 450} y={cy - 562} size={58} o={prog(t, b.nom + 0.5, b.nom + 0.8, easeOut)}>le coût d’opportunité</WText>
    </g>
  );
};

const LevierSt: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.levier;
  const tilt = lerp(lerp(lerp(0, 12, prog(t, b.arme + 0.4, b.arme + 1.2, overshoot)), 20, prog(t, b.gain, b.gain + 0.8, overshoot)), -16, prog(t, b.perte + 0.2, b.perte + 1.0, overshoot));
  const back = prog(t, b.bonus + 0.2, b.bonus + 1.0, overshoot);
  const tl = lerp(tilt, 20, back);
  const stamp = sp(Math.round(t * FPS), b.zero - 0.2, {damping: 9, stiffness: 240, mass: 0.7});
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.arme}>l’effet de levier</Title>
      <Lever
        x={cx - 140}
        y={cy + 140}
        len={720}
        tilt={tl}
        left={
          <g>
            <circle cx={0} cy={-34} r={34} fill={C.hl} stroke={C.ink} strokeWidth={5} />
            <text x={0} y={-22} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={34} fill={C.ink}>€</text>
          </g>
        }
        right={<House x={50} y={0} s={0.85} id={40} />}
        id={41}
      />
      <WText x={cx - 470} y={cy + 330} size={40} color={C.pen} weight={400} o={prog(t, b.banque, b.banque + 0.4, easeOut)}>ta mise</WText>
      <WText x={cx - 300} y={cy + 390} size={40} color={C.pen} weight={400} o={prog(t, b.banque + 0.3, b.banque + 0.7, easeOut)}>+ l’argent de la banque</WText>
      <WText x={cx - 460} y={cy - 420} size={70} color={C.green} o={prog(t, b.gain + 0.6, b.gain + 1.0, easeOut) * (1 - prog(t, b.perte, b.perte + 0.3, easeOut))}>+ gain : pour toi</WText>
      <WText x={cx - 460} y={cy - 420} size={70} color={C.red} o={prog(t, b.perte + 0.6, b.perte + 1.0, easeOut) * (1 - prog(t, b.bonus, b.bonus + 0.3, easeOut))}>− perte : pour toi</WText>
      <WHighlight x={cx - 460} y={cy - 610} w={560} h={66} k={prog(t, b.bonus + 1.4, b.bonus + 1.9, easeOut)} />
      <WText x={cx - 450} y={cy - 562} size={56} o={prog(t, b.bonus + 1.2, b.bonus + 1.5, easeOut)}>résidence principale</WText>
      <Stamp x={cx - 150} y={cy - 300} k={stamp} w={620} text="plus-value : 0 € d’impôt" color={C.green} size={52} rot={-5} />
    </g>
  );
};

const Chute: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.chute;
  const hk = prog(t, b.question, b.question + 3.0, easeInOut);
  const swap = prog(t, b.next + 0.2, b.next + 0.7, easeInOut);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.question}>combien de temps tu restes ?</Title>
      <g opacity={1 - swap} transform={`rotate(${prog(t, b.question + 0.2, b.question + 0.8, overshoot) * 180} ${cx - 200} ${cy - 120})`}>
        <Hourglass x={cx - 200} y={cy - 120} h={620} k={1 - hk} t={t} id={50} />
      </g>
      <g opacity={swap} transform={`translate(${cx - 200} ${cy - 120}) scale(${0.6 + 0.4 * swap}) translate(${-(cx - 200)} ${-(cy - 120)})`}>
        <Passbook x={cx - 200} y={cy - 120} w={400} title="LIVRET A" open={prog(t, b.next + 1.2, b.next + 2.0, easeInOut)} id={51} />
        <WText x={cx + 80} y={cy - 280} size={220} color={ORANGE} o={prog(t, b.next + 1.0, b.next + 1.3, easeOut)}>?</WText>
      </g>
    </g>
  );
};

// ---------- les coureurs ----------
const pierrotTrack = (b: B, end: number): TrackT => {
  const run = (t0: number, t1: number, x0: number, x1: number): Move => ({t0, t1, x0, x1, gait: 'courir'});
  const moves: Move[] = [
    run(b.frais, b.frais + 1.3, 900, 2300),
    run(b.point + 0.5, b.moyenne + 0.7, 2300, 5000), // part en retard, rattrape au drapeau
    run(b.levier, b.levier + 1.4, 5000, 3600),
    run(b.chute, b.chute + 1.4, 3600, 2200),
  ];
  const keys: Key[] = [
    {t: 0, pose: 'content', dur: 0.01},
    {t: b.pas + 0.3, pose: 'hausser', hold: 0.6},
    {t: b.frais + 1.4, pose: 'choque', hold: 0.8},
    {t: b.impots + 0.6, pose: 'pointer', hold: 2.2},
    {t: b.dmto + 0.6, pose: 'reflechir', hold: 1.8},
    {t: b.moyenne + 0.9, pose: 'content', hold: 1.0},
    {t: b.opportunite + 1.0, pose: 'choque', hold: 0.6},
    {t: b.ailleurs + 0.4, pose: 'pointer', hold: 2.0},
    {t: b.nom + 0.6, pose: 'reflechir', hold: 1.6},
    {t: b.banque + 0.2, pose: 'pointer', hold: 1.8},
    {t: b.gain + 0.6, pose: 'content', hold: 1.4},
    {t: b.perte + 0.6, pose: 'choque', hold: 1.2},
    {t: b.zero, pose: 'content', hold: 1.4},
    {t: b.question + 1.5, pose: 'reflechir', hold: 2.0},
    {t: b.next + 1.0, pose: 'pointer', hold: end - b.next - 1.0},
  ];
  return {ground: R0, x: 900, restFacing: -1, moves, keys};
};
const renterTrack = (b: B): TrackT => ({
  ground: R0 - 120,
  x: 2700,
  moves: [{t0: b.point + 0.2, t1: b.moyenne + 0.5, x0: 2700, x1: 4880, gait: 'courir'}],
  keys: [{t: 0, pose: 'content', dur: 0.01}, {t: b.moyenne + 0.7, pose: 'choque', hold: 1.2}],
});
const pierrotDy = (b: B, t: number) => prog(t, b.opportunite, b.opportunite + 1.0, easeIn) * DY;

export const Achat: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const end = tl.duration;
  const PT = pierrotTrack(b, end);
  const RT = renterTrack(b);
  // caméra : stations + suivi de la course, puis vue d'ensemble des 3 pistes
  const base = camAt(t, [
    {t: 0, x: ST.hook[0], y: ST.hook[1], z: 1},
    {t: b.frais, x: ST.frais[0], y: ST.frais[1], dur: 1.3},
    {t: b.opportunite, x: ST.opport[0], y: ST.opport[1], z: 1, dur: 1.0},
    {t: b.levier, x: ST.levier[0], y: ST.levier[1], dur: 1.4},
    {t: b.chute, x: ST.chute[0], y: ST.chute[1], dur: 1.4},
  ]);
  const px = solve(PT, t).pelvis[0];
  const rx = solve(RT, t).pelvis[0];
  const follow = {x: Math.max(ST.frais[0], (px + rx) / 2 + 60), y: 960, z: 1};
  const overview = {x: X0 + 1900, y: R0 - 520, z: 0.28};
  const wIn = prog(t, b.point - 0.2, b.point + 0.8, easeInOut);
  const wOv = prog(t, b.paris, b.paris + 1.4, easeInOut);
  const wOut = prog(t, b.opportunite, b.opportunite + 1.0, easeInOut);
  const race = {x: lerp(follow.x, overview.x, wOv), y: lerp(follow.y, overview.y, wOv), z: lerp(follow.z, overview.z, wOv)};
  const cam = wOut > 0 ? {x: lerp(race.x, base.x, wOut), y: lerp(race.y, base.y, wOut), z: lerp(race.z, base.z, wOut)} : {x: lerp(base.x, race.x, wIn), y: lerp(base.y, race.y, wIn), z: lerp(base.z, race.z, wIn)};
  const dy = pierrotDy(b, t);
  const target: [number, number] = [cam.x - 260, cam.y - 320 - dy];
  const sources: [number, number, string][] = [
    [b.frais, b.point, 'Meilleurtaux (frais de notaire) · Service-Public (droits de mutation 2025)'],
    [b.point, b.opportunite, 'Meilleurtaux, « Acheter ou louer ? », 12e édition (oct. 2025)'],
    [b.opportunite, b.levier, 'Meilleurtaux (rendement de l’apport intégré au calcul)'],
    [b.levier, b.chute, 'IGF-CGEDD (2021), effet de levier · Service-Public (plus-value)'],
  ];
  const next = sp(frame, b.next + 1.6, POP);
  return (
    <>
      <World cam={cam} width={7200} height={4320}>
        <Hook b={b} t={t} />
        <Frais b={b} t={t} />
        <Race b={b} t={t} />
        <Opport b={b} t={t} />
        <LevierSt b={b} t={t} />
        <Chute b={b} t={t} />
        <Mascot look="bic" id={70} scale={0.85} track={RT} />
        <g transform={`translate(0 ${dy})`}>
          {/* sac de frais accroché à Pierrot pendant la course */}
          {t > b.point && t < b.moyenne + 0.8 ? (
            <g transform={`translate(${px - 80} ${R0 - 150 + Math.sin(t * 14) * 6})`}>
              <path d="M -40 30 Q -60 -20 -15 -35 L -25 -55 L 25 -55 L 15 -35 Q 60 -20 40 30 Q 0 50 -40 30 Z" fill="#E0C27A" stroke={C.ink} strokeWidth={5} />
              <text x={0} y={18} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={26} fill={C.red}>−8 %</text>
            </g>
          ) : null}
          <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={t < b.frais ? 1.1 : 0.95} track={{...PT, target}} />
        </g>
      </World>
      {sources.map(([a, z, s], i) => (
        <AbsoluteFill key={i} style={{opacity: vis(t, a, z)}}>
          <div style={{position: 'absolute', left: 110, top: 1378, width: 680, fontFamily: F.note, fontSize: 27, color: C.muted, lineHeight: 1.1}}>Source : {s}</div>
        </AbsoluteFill>
      ))}
      {next > 0.01 ? (
        <div style={{position: 'absolute', left: 110, top: 1050, maxWidth: 600}}>
          <Sticker k={next} rotate={-3}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 52, color: C.pen, lineHeight: 1.1, display: 'block'}}>
              la suite :<br />le Livret A →
            </span>
          </Sticker>
        </div>
      ) : null}
    </>
  );
};
