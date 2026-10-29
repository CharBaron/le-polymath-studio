// Squelette 2D : bassin → colonne → cou/tête ; épaule → bras → avant-bras ; hanche → cuisse → tibia.
// Jambes en cinématique inverse 2 os, pieds ancrés au sol pendant la marche.
import {antic, clamp01, easeInOut, easeOut, prog} from '../theme';
import {mixPose, Pose, PoseName, POSES} from './poses';

export type V = [number, number];

export const BONES = {thigh: 92, shin: 92, spine: 150, neck: 18, upper: 88, fore: 82, headR: 78, hipW: 16, shoulderW: 22};

// ---------- piste d'animation ----------
export type Move = {t0: number; t1: number; x0: number; x1: number; gait?: 'marche' | 'courir'};
export type Key = {t: number; pose: PoseName; dur?: number; hold?: number};
export type Track = {
  ground: number; // y du sol (px)
  x: number; // position de départ du bassin
  facing?: 1 | -1;
  restFacing?: 1 | -1; // sens du regard à l'arrêt (ex. -1 : Pierrot à droite regarde le contenu à gauche)
  moves?: Move[];
  keys?: Key[];
  target?: V; // cible du bras « pointer »
};

const GAIT = {
  marche: {stride: 150, lift: 26, stance: 0.62, bob: 7, swing: 0.55},
  courir: {stride: 190, lift: 44, stance: 0.42, bob: 14, swing: 1.0},
};

/** Distance parcourue, mouvement actif et poids de la marche à l'instant t. */
const moveState = (tr: Track, t: number) => {
  let x = tr.x;
  let facing = tr.facing ?? 1;
  let active: Move | null = null;
  let last: Move | null = null;
  for (const m of tr.moves ?? []) {
    if (t >= m.t1) {
      x = m.x1;
      last = m;
      facing = m.x1 >= m.x0 ? 1 : -1;
    } else if (t >= m.t0) {
      // vitesse constante, petite mise en route / freinage
      const k = (t - m.t0) / (m.t1 - m.t0);
      const e = k < 0.1 ? (k * k) / 0.2 : k > 0.9 ? 1 - ((1 - k) * (1 - k)) / 0.2 : k - 0.05;
      x = m.x0 + (m.x1 - m.x0) * (e / 0.9);
      active = m;
      facing = m.x1 >= m.x0 ? 1 : -1;
      break;
    }
  }
  if (!active && tr.restFacing && (!last || t > last.t1 + 0.35)) facing = tr.restFacing;
  return {x, facing: facing as 1 | -1, active, last};
};

/** Pose blendée (anticipation + dépassement, retour au repos après `hold`). */
export const poseAt = (tr: Track, t: number): Pose => {
  const keys = [...(tr.keys ?? [])].sort((a, b) => a.t - b.t);
  // expansion des retours au repos
  const ev: {t: number; pose: PoseName; dur: number}[] = [];
  for (const k of keys) {
    ev.push({t: k.t, pose: k.pose, dur: k.dur ?? 0.45});
    if (k.hold !== undefined) ev.push({t: k.t + (k.dur ?? 0.45) + k.hold, pose: 'idle', dur: 0.5});
  }
  ev.sort((a, b) => a.t - b.t);
  let cur: Pose = POSES.idle;
  for (const e of ev) {
    if (t < e.t) break;
    const k = antic(clamp01((t - e.t) / e.dur));
    cur = mixPose(cur, POSES[e.pose], k);
  }
  return cur;
};

export type Rig = {
  facing: 1 | -1;
  pelvis: V;
  neck: V;
  head: V;
  headAngle: number;
  shoulderF: V;
  shoulderB: V;
  armF: [V, V, V];
  armB: [V, V, V];
  legF: [V, V, V];
  legB: [V, V, V];
  pose: Pose;
  ground: number;
  speed: number; // 0 au repos, 1 en marche
};

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const dir = (ang: number, len: number, f: number): V => [Math.sin(ang) * len * f, Math.cos(ang) * len];

/** IK 2 os : renvoie l'articulation intermédiaire. bend = +1 → le genou part vers +x. */
export const ik2 = (root: V, target: V, a: number, b: number, bend: number): V => {
  const dx = target[0] - root[0];
  const dy = target[1] - root[1];
  const d = Math.min(Math.hypot(dx, dy), a + b - 0.5);
  const base = Math.atan2(dy, dx);
  const cosA = (a * a + d * d - b * b) / (2 * a * d);
  const off = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const c1: V = [root[0] + Math.cos(base + off) * a, root[1] + Math.sin(base + off) * a];
  const c2: V = [root[0] + Math.cos(base - off) * a, root[1] + Math.sin(base - off) * a];
  return (c1[0] - c2[0]) * bend >= 0 ? c1 : c2;
};

/** Pied (position au sol + levée) pour la jambe `leg` (0 ou 1). */
const footGait = (d: number, leg: number, g: (typeof GAIT)['marche']) => {
  const L = g.stride;
  const ph = d / L + leg * 0.5;
  const n = Math.floor(ph);
  const u = ph - n;
  const plant = (c: number) => (c + g.stance / 2 - leg * 0.5) * L;
  if (u < g.stance) return {x: plant(n), lift: 0};
  const w = (u - g.stance) / (1 - g.stance);
  return {x: plant(n) + L * easeInOut(w), lift: Math.sin(Math.PI * w) * g.lift};
};

export const solve = (tr: Track, t: number): Rig => {
  const {x, facing: f, active, last} = moveState(tr, t);
  const pose = poseAt(tr, t);
  const B = BONES;
  const legLen = B.thigh + B.shin;
  const standY = tr.ground - legLen * 0.97;

  // poids de la marche : monte au départ, descend à l'arrivée
  let w = 0;
  let g = GAIT.marche;
  let d = 0;
  let moveX0 = x;
  let runDir = 1;
  const m = active ?? last;
  if (m) {
    g = GAIT[m.gait ?? 'marche'];
    const D = Math.abs(m.x1 - m.x0);
    const n = Math.max(1, Math.round(D / g.stride));
    g = {...g, stride: D / n}; // le dernier pas tombe juste
    d = Math.abs(x - m.x0);
    moveX0 = m.x0;
    runDir = m.x1 >= m.x0 ? 1 : -1;
    w = active ? prog(t, m.t0, m.t0 + 0.2, easeOut) : 1 - prog(t, m.t1, m.t1 + 0.32, easeInOut);
  }
  const gaitPose = POSES[m?.gait ?? 'marche'];
  const P = w > 0 ? mixPose(pose, gaitPose, w * (active ? 1 : 0.999)) : pose;
  P.expr = w > 0.5 && active ? gaitPose.expr : pose.expr;
  if (w > 0.5 && active) P.look = gaitPose.look;

  const phase = d / g.stride;
  const bob = -Math.abs(Math.cos(phase * Math.PI * 2)) * g.bob * w; // le bassin monte à mi-pas
  const breath = Math.sin(t * 2.4) * 2.2 * (1 - w);
  // à grande foulée, le bassin descend pour que les pieds restent à portée (jamais de jambe étirée)
  const reachY = Math.sqrt(Math.max(0, (legLen * 0.97) ** 2 - (g.stride * 0.55) ** 2));
  const gaitDrop = Math.max(0, tr.ground - reachY - standY) * w;
  const pelvis: V = [x, standY + P.crouch + bob + g.bob * w * 0.6 + breath * 0.4 + gaitDrop];

  // colonne / tête
  const lean = P.lean + Math.sin(phase * Math.PI * 4) * 0.015 * w;
  const neck = add(pelvis, [Math.sin(lean) * B.spine * f, -Math.cos(lean) * B.spine + breath]);
  const headAngle = P.head * f;
  const head = add(neck, [Math.sin(lean + P.head * 0.5) * (B.neck + B.headR * 0.92) * f, -Math.cos(lean) * (B.neck + B.headR * 0.92)]);

  // épaules
  const sh = add(neck, [-Math.sin(lean) * 26 * f, Math.cos(lean) * 26 - P.shrug]);
  const shoulderF: V = add(sh, [B.shoulderW * 0.4 * f, 0]);
  const shoulderB: V = add(sh, [-B.shoulderW * 0.4 * f, 0]);

  // bras (FK, balancier de marche en opposition des jambes)
  const swing = Math.sin(phase * Math.PI * 2) * g.swing * w;
  const arm = (s: V, a: [number, number], sgn: number): [V, V, V] => {
    const a1 = a[0] + sgn * swing;
    const e = add(s, dir(a1, B.upper, f));
    const hnd = add(e, dir(a1 + a[1], B.fore, f));
    return [s, e, hnd];
  };
  let armF = arm(shoulderF, P.armF, -1);
  const armB = arm(shoulderB, P.armB, 1);
  if (P.point && tr.target) {
    // bras tendu vers la cible, coude à peine plié
    const reach = Math.min(Math.hypot(tr.target[0] - shoulderF[0], tr.target[1] - shoulderF[1]), (B.upper + B.fore) * 0.97);
    const ang = Math.atan2(tr.target[1] - shoulderF[1], tr.target[0] - shoulderF[0]);
    const tgt: V = [shoulderF[0] + Math.cos(ang) * reach, shoulderF[1] + Math.sin(ang) * reach];
    const pk = clamp01((P.armF[0] - 0.12) / (1.9 - 0.12)); // part de « pointer » dans le mix
    const e = ik2(shoulderF, tgt, B.upper, B.fore, -f);
    armF = [shoulderF, [armF[1][0] + (e[0] - armF[1][0]) * pk, armF[1][1] + (e[1] - armF[1][1]) * pk], [armF[2][0] + (tgt[0] - armF[2][0]) * pk, armF[2][1] + (tgt[1] - armF[2][1]) * pk]];
  }
  if (P.chin) {
    const chin: V = add(head, [B.headR * 0.35 * f, B.headR * 0.95]);
    const e = ik2(shoulderF, chin, B.upper, B.fore, f);
    armF = [shoulderF, e, chin];
  }

  // jambes (IK) : pieds plantés pendant la marche, sinon position de repos
  const hipF = add(pelvis, [B.hipW * 0.5 * f, 0]);
  const hipB = add(pelvis, [-B.hipW * 0.5 * f, 0]);
  const legs = [0, 1].map((leg) => {
    const rest: V = [x + (leg === 0 ? 14 : -14) * f, tr.ground];
    if (w <= 0) return rest;
    const fg = footGait(d, leg, g);
    const walkFoot: V = [moveX0 + fg.x * runDir, tr.ground - fg.lift];
    // en entrée / sortie de marche : pas de fermeture avec petite levée
    const lift = w < 1 ? Math.sin(Math.PI * w) * 10 : 0;
    return [rest[0] + (walkFoot[0] - rest[0]) * w, rest[1] + (walkFoot[1] - rest[1]) * w - lift] as V;
  });
  // sécurité : un pied hors de portée est ramené le long de la jambe tendue
  const reach = (hip: V, foot: V): V => {
    const dx = foot[0] - hip[0];
    const dy = foot[1] - hip[1];
    const dd = Math.hypot(dx, dy);
    const max = (B.thigh + B.shin) * 0.995;
    return dd > max ? [hip[0] + (dx / dd) * max, hip[1] + (dy / dd) * max] : foot;
  };
  const fF = reach(hipF, legs[0]);
  const fB = reach(hipB, legs[1]);
  const legF: [V, V, V] = [hipF, ik2(hipF, fF, B.thigh, B.shin, f), fF];
  const legB: [V, V, V] = [hipB, ik2(hipB, fB, B.thigh, B.shin, f), fB];

  return {facing: f, pelvis, neck, head, headAngle, shoulderF, shoulderB, armF, armB, legF, legB, pose: P, ground: tr.ground, speed: w};
};
