// Mascotte dessinée au stylo sur le squelette de rig.ts. Trois looks (skins) partagent le même rig.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, handPath, rand} from '../theme';
import {Expr} from './poses';
import {BONES, Rig, solve, Track, V} from './rig';

export type Look = 'pierrot' | 'bic' | 'sou';

const HOOD = C.orange;
const HOOD_D = '#C9431A';
const PANTS = '#2B2D42';

const lerpV = (a: V, b: V, k: number): V => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
/** membre : os subdivisés pour que le tremblement reste souple */
const limbPts = (j: V[]) => {
  const out: [number, number][] = [];
  for (let i = 0; i < j.length - 1; i++) {
    out.push(j[i], lerpV(j[i], j[i + 1], 0.5));
  }
  out.push(j[j.length - 1]);
  return out;
};

/** trait encré : contour noir + remplissage couleur, ou simple trait */
const Stroke: React.FC<{d: string; w: number; fill?: string; ink?: string; outline?: number}> = ({d, w, fill, ink = C.ink, outline = 5}) => (
  <>
    <path d={d} stroke={ink} strokeWidth={fill ? w + outline * 2 : w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {fill ? <path d={d} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
  </>
);

// ---------- visage ----------
const EXPR: Record<Expr, {brow: number; browY: number; eye: number; mouth: number; open: number}> = {
  neutre: {brow: 0, browY: 0, eye: 1, mouth: 0.15, open: 0},
  content: {brow: -0.1, browY: -2, eye: 0.9, mouth: 0.8, open: 0},
  choque: {brow: -0.25, browY: -10, eye: 1.35, mouth: 0, open: 1},
  pense: {brow: 0.25, browY: -3, eye: 0.85, mouth: -0.1, open: 0},
  gene: {brow: -0.35, browY: -6, eye: 1, mouth: -0.35, open: 0},
  determine: {brow: 0.35, browY: 2, eye: 0.8, mouth: 0.25, open: 0},
  triste: {brow: -0.4, browY: -2, eye: 0.9, mouth: -0.6, open: 0},
};

export const Face: React.FC<{
  cx: number; cy: number; r: number; f: number; expr: Expr; look: [number, number]; talk: number; frame: number;
  eyeWhite: string; pupil: string; line: string; seed: number; glasses?: string;
}> = ({cx, cy, r, f, expr, look, talk, frame, eyeWhite, pupil, line, seed, glasses}) => {
  const E = EXPR[expr];
  // clignement toutes les ~3 s, déterministe
  const tb = (frame + seed * 17) % 97;
  const blink = tb < 4 ? Math.abs(tb - 2) / 2 : 1;
  const ox = f * r * 0.22; // visage tourné de 3/4 vers le regard
  const ex = r * 0.3;
  const eyes = [-1, 1].map((s) => {
    const x = cx + ox + s * ex * (s === f ? 1.0 : 0.82);
    const y = cy - r * 0.05;
    const ry = r * 0.17 * E.eye * blink;
    return {x, y, ry, s};
  });
  const open = Math.max(E.open, talk * 0.8);
  const mx = cx + ox + f * r * 0.05;
  const my = cy + r * 0.42;
  const mw = r * (0.24 + 0.08 * E.mouth * E.mouth) * (1 - open * 0.3);
  const curve = E.mouth * r * 0.16;
  return (
    <g>
      {eyes.map((e, i) => (
        <g key={i}>
          <ellipse cx={e.x} cy={e.y} rx={r * 0.13 * E.eye} ry={Math.max(1.5, e.ry)} fill={eyeWhite} stroke={line} strokeWidth={3} />
          {blink > 0.5 ? <circle cx={e.x + look[0] * f * r * 0.05} cy={e.y + look[1] * r * 0.06} r={r * 0.065} fill={pupil} /> : null}
          <path
            d={`M ${e.x - r * 0.14} ${e.y - r * 0.27 + E.browY + e.s * E.brow * f * r * 0.12} L ${e.x + r * 0.14} ${e.y - r * 0.27 + E.browY - e.s * E.brow * f * r * 0.12}`}
            stroke={line}
            strokeWidth={r * 0.065}
            strokeLinecap="round"
          />
          {glasses ? <circle cx={e.x} cy={e.y} r={r * 0.21} fill="none" stroke={glasses} strokeWidth={r * 0.06} /> : null}
        </g>
      ))}
      {glasses ? <path d={`M ${eyes[0].x + r * 0.21} ${eyes[0].y} Q ${(eyes[0].x + eyes[1].x) / 2} ${eyes[0].y - r * 0.06} ${eyes[1].x - r * 0.21} ${eyes[1].y}`} stroke={glasses} strokeWidth={r * 0.05} fill="none" /> : null}
      {open > 0.05 ? (
        <ellipse cx={mx} cy={my + r * 0.02} rx={mw * (0.55 + 0.25 * (1 - open))} ry={r * (0.05 + 0.17 * open)} fill={line} stroke={line} strokeWidth={3} />
      ) : (
        <path d={`M ${mx - mw} ${my - curve * 0.3} Q ${mx} ${my + curve} ${mx + mw} ${my - curve * 0.3}`} stroke={line} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

// ---------- corps ----------
const Body: React.FC<{R: Rig; look: Look; frame: number; talk: number; id: number}> = ({R, look, frame, talk, id}) => {
  const f = R.facing;
  const P = R.pose;
  const r = BONES.headR;
  const hp = (pts: [number, number][], k: number, amp = 1.4) => handPath(pts, frame, id * 100 + k, amp);
  const shadow = (
    <ellipse cx={R.pelvis[0]} cy={R.ground + 6} rx={70 - R.speed * 8} ry={12} fill="rgba(20,19,26,0.13)" />
  );
  const tilt = (R.headAngle * 180) / Math.PI;

  if (look === 'bic') {
    // bonhomme au stylo bleu + écharpe surligneur
    const pen = C.pen;
    const w = 11;
    return (
      <g>
        {shadow}
        <Stroke d={hp(limbPts(R.armB), 1)} w={w} ink={pen} />
        <Stroke d={hp(limbPts(R.legB), 2)} w={w} ink={pen} />
        <Stroke d={hp(limbPts(R.legF), 3)} w={w} ink={pen} />
        <Stroke d={hp(limbPts([R.pelvis, R.neck]), 4)} w={w + 2} ink={pen} />
        {[R.legF[2], R.legB[2]].map((p, i) => (
          <path key={i} d={hp([[p[0] - 6 * f, p[1]], [p[0] + 26 * f, p[1]]], 9 + i)} stroke={pen} strokeWidth={w} strokeLinecap="round" />
        ))}
        <g transform={`rotate(${tilt} ${R.head[0]} ${R.head[1]})`}>
          <path d={hp(circlePts(R.head, r, 14), 5, 1.8)} fill={C.white} stroke={pen} strokeWidth={8} />
          <Face cx={R.head[0]} cy={R.head[1]} r={r} f={f} expr={P.expr} look={P.look} talk={talk} frame={frame} eyeWhite={C.white} pupil={C.ink} line={C.ink} seed={id} />
        </g>
        {/* écharpe au surligneur */}
        <path d={hp([[R.neck[0] - 30, R.neck[1] - 4], [R.neck[0], R.neck[1] + 6], [R.neck[0] + 30, R.neck[1] - 4]], 6)} stroke={C.hl} strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.9} />
        <path d={hp([[R.neck[0] - 8 * f, R.neck[1] + 4], [R.neck[0] - 22 * f, R.neck[1] + 46 + Math.sin(frame / 6) * 3], [R.neck[0] - 30 * f, R.neck[1] + 70]], 7)} stroke={C.hl} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.9} />
        <Stroke d={hp(limbPts(R.armF), 8)} w={w} ink={pen} />
      </g>
    );
  }

  // pierrot et sou partagent le corps « vêtu »
  const hood = look === 'pierrot' ? HOOD : C.white;
  const hoodD = look === 'pierrot' ? HOOD_D : '#D9D2C3';
  const pants = look === 'pierrot' ? PANTS : C.ink;
  const sleeveW = look === 'pierrot' ? 30 : 12;
  const legW = look === 'pierrot' ? 32 : 13;

  const torso = (() => {
    const [px, py] = R.pelvis;
    const [nx, ny] = R.neck;
    const ux = (nx - px) / BONES.spine;
    const uy = (ny - py) / BONES.spine;
    const vx = -uy;
    const vy = ux;
    const hipW = 54;
    const shW = 58;
    const b: V = [px - ux * 18, py - uy * 18];
    const pts: [number, number][] = [
      [b[0] + vx * hipW, b[1] + vy * hipW],
      [px + ux * 80 + vx * (shW + 8), py + uy * 80 + vy * (shW + 8)],
      [nx - ux * 8 + vx * shW * 0.7, ny - uy * 8 + vy * shW * 0.7],
      [nx - ux * 8 - vx * shW * 0.7, ny - uy * 8 - vy * shW * 0.7],
      [px + ux * 80 - vx * (shW + 8), py + uy * 80 - vy * (shW + 8)],
      [b[0] - vx * hipW, b[1] - vy * hipW],
    ];
    return {pts: [...pts, pts[0]], b, ux, uy, vx, vy, hipW};
  })();

  const shoe = (p: V, k: number, col: string) => (
    <g key={k}>
      <path
        d={hp([[p[0] - 16 * f, p[1] + 2], [p[0] - 18 * f, p[1] - 16], [p[0] + 14 * f, p[1] - 14], [p[0] + 34 * f, p[1] - 2], [p[0] + 30 * f, p[1] + 4], [p[0] - 16 * f, p[1] + 4]], 20 + k)}
        fill={col}
        stroke={C.ink}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d={`M ${p[0] - 14 * f} ${p[1] - 1} L ${p[0] + 30 * f} ${p[1] - 1}`} stroke={look === 'pierrot' ? HOOD : C.pen} strokeWidth={4} />
    </g>
  );
  const hand = (p: V, k: number) =>
    look === 'sou' ? (
      <circle key={k} cx={p[0]} cy={p[1]} r={17} fill={C.white} stroke={C.ink} strokeWidth={5} />
    ) : (
      <circle key={k} cx={p[0]} cy={p[1]} r={15} fill={C.ink} />
    );

  const head = (() => {
    const [hx, hy] = R.head;
    if (look === 'sou') {
      // tête-pièce : disque doré, liseré, tranche crantée
      return (
        <g transform={`rotate(${tilt} ${hx} ${hy})`}>
          <ellipse cx={hx - 9 * f} cy={hy} rx={r} ry={r} fill="#C99A1E" stroke={C.ink} strokeWidth={6} />
          <path d={hp(circlePts([hx, hy], r, 16), 30, 1.2)} fill="#F2C230" stroke={C.ink} strokeWidth={6} />
          <path d={hp(circlePts([hx, hy], r * 0.82, 16), 31, 1)} fill="none" stroke="#C99A1E" strokeWidth={5} />
          <text x={hx + f * r * 0.22} y={hy - r * 0.42} textAnchor="middle" fontSize={r * 0.42} fontWeight={700} fill="#C99A1E" style={{fontFamily: 'serif'}}>€</text>
          <Face cx={hx} cy={hy + r * 0.12} r={r * 0.85} f={f} expr={P.expr} look={P.look} talk={talk} frame={frame} eyeWhite={C.white} pupil={C.ink} line={C.ink} seed={id} />
        </g>
      );
    }
    // pierrot : grosse tête d'encre, mèche, lunettes orange
    return (
      <g transform={`rotate(${tilt} ${hx} ${hy})`}>
        <path d={hp(circlePts([hx, hy], r, 16), 30, 1.4)} fill={C.ink} />
        <path d={hp([[hx - r * 0.2 * f, hy - r * 0.92], [hx + r * 0.25 * f, hy - r * 1.32], [hx + r * 0.45 * f, hy - r * 1.05]], 32)} stroke={C.ink} strokeWidth={r * 0.2} fill="none" strokeLinecap="round" />
        <path d={`M ${hx - r * 0.75} ${hy - r * 0.4} A ${r * 0.92} ${r * 0.92} 0 0 1 ${hx - r * 0.1} ${hy - r * 0.9}`} stroke="rgba(255,255,255,0.14)" strokeWidth={5} fill="none" />
        <Face cx={hx} cy={hy + r * 0.1} r={r * 0.9} f={f} expr={P.expr} look={P.look} talk={talk} frame={frame} eyeWhite={C.white} pupil={C.ink} line={C.white} seed={id} glasses={HOOD} />
      </g>
    );
  })();

  return (
    <g>
      {shadow}
      <Stroke d={hp(limbPts(R.armB), 1)} w={sleeveW} fill={look === 'pierrot' ? hoodD : undefined} />
      {hand(R.armB[2], 0)}
      <Stroke d={hp(limbPts(R.legB), 2)} w={legW} fill={look === 'pierrot' ? pants : undefined} />
      <Stroke d={hp(limbPts(R.legF), 3)} w={legW} fill={look === 'pierrot' ? pants : undefined} />
      {shoe(R.legB[2], 0, C.white)}
      {shoe(R.legF[2], 1, C.white)}
      {look === 'pierrot' ? (
        <>
          <ellipse cx={R.neck[0] - 18 * f} cy={R.neck[1] - 8} rx={62} ry={34} fill={hoodD} stroke={C.ink} strokeWidth={5} />
          <path d={hp(torso.pts, 4, 1.2)} fill={hood} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path
            d={`M ${torso.b[0] + torso.vx * 50 + torso.ux * 14} ${torso.b[1] + torso.vy * 50 + torso.uy * 14} L ${torso.b[0] - torso.vx * 50 + torso.ux * 14} ${torso.b[1] - torso.vy * 50 + torso.uy * 14}`}
            stroke={hoodD}
            strokeWidth={14}
          />
          <rect x={R.pelvis[0] - 34 + 6 * f} y={R.pelvis[1] - 50} width={68} height={32} rx={10} fill="none" stroke={hoodD} strokeWidth={5} />
          {[-1, 1].map((s) => (
            <path key={s} d={`M ${R.neck[0] + s * 12} ${R.neck[1] + 14} l ${s * 2 + Math.sin(frame / 7 + s) * 3} 44`} stroke={C.white} strokeWidth={5} strokeLinecap="round" />
          ))}
        </>
      ) : (
        // sou : corps trait d'encre + nœud papillon bleu
        <>
          <Stroke d={hp(limbPts([R.pelvis, R.neck]), 4)} w={14} />
          <path d={`M ${R.neck[0] - 18} ${R.neck[1] + 4} L ${R.neck[0] + 18} ${R.neck[1] + 20} L ${R.neck[0] + 18} ${R.neck[1] + 4} L ${R.neck[0] - 18} ${R.neck[1] + 20} Z`} fill={C.pen} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
        </>
      )}
      {head}
      <Stroke d={hp(limbPts(R.armF), 8)} w={sleeveW} fill={look === 'pierrot' ? hood : undefined} />
      {hand(R.armF[2], 1)}
    </g>
  );
};

const circlePts = (c: V, r: number, n: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i <= n + 1; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
  }
  return out;
};

export const Mascot: React.FC<{track: Track; look?: Look; talk?: number; scale?: number; id?: number; time?: number}> = ({
  track,
  look = 'pierrot',
  talk = 0,
  scale = 1,
  id = 1,
  time,
}) => {
  const frame = useCurrentFrame();
  const t = time ?? frame / 30;
  const x0 = solve({...track, target: undefined}, t).pelvis[0];
  const tg = track.target;
  const R = solve(tg ? {...track, target: [x0 + (tg[0] - x0) / scale, track.ground + (tg[1] - track.ground) / scale]} : track, t);
  // l'échelle est appliquée autour du point au sol pour garder les pieds ancrés
  const ox = R.pelvis[0];
  const oy = track.ground;
  return (
    <g transform={`translate(${ox} ${oy}) scale(${scale}) translate(${-ox} ${-oy})`}>
      <Body R={R} look={look} frame={frame} talk={talk} id={id + Math.floor(rand(id) * 3)} />
    </g>
  );
};
