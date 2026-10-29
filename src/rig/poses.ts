// Poses nommées. Angles en radians ; + = vers l'avant (sens du regard).
// épaule : 0 = bras pendant ; coude : pliure relative (+ = avant-bras qui remonte vers l'avant).
export type Expr = 'neutre' | 'content' | 'choque' | 'pense' | 'gene' | 'determine' | 'triste';

export type Pose = {
  lean: number; // inclinaison de la colonne
  head: number; // inclinaison de la tête
  shrug: number; // épaules relevées (px)
  crouch: number; // bassin qui descend (px)
  armF: [number, number]; // bras avant [épaule, coude]
  armB: [number, number]; // bras arrière
  point?: boolean; // bras avant tendu vers la cible (IK)
  chin?: boolean; // main avant au menton
  expr: Expr;
  look: [number, number]; // direction du regard (-1..1)
};

export type PoseName = 'idle' | 'marche' | 'pointer' | 'choque' | 'reflechir' | 'hausser' | 'courir' | 'content';

export const POSES: Record<PoseName, Pose> = {
  idle: {lean: 0.03, head: 0, shrug: 0, crouch: 0, armF: [0.12, 0.25], armB: [-0.08, 0.2], expr: 'neutre', look: [0.3, 0]},
  marche: {lean: 0.07, head: -0.02, shrug: 0, crouch: 4, armF: [0, 0.35], armB: [0, 0.35], expr: 'content', look: [1, 0]},
  courir: {lean: 0.28, head: -0.12, shrug: 0, crouch: 14, armF: [0, 1.5], armB: [0, 1.5], expr: 'determine', look: [1, 0]},
  pointer: {lean: -0.02, head: -0.1, shrug: 0, crouch: 0, armF: [1.9, 0.08], armB: [-0.1, 0.3], point: true, expr: 'content', look: [1, -0.4]},
  choque: {lean: -0.16, head: -0.18, shrug: 14, crouch: -10, armF: [2.6, 0.5], armB: [-2.5, -0.5], expr: 'choque', look: [0, -0.2]},
  reflechir: {lean: 0.02, head: 0.16, shrug: 0, crouch: 0, armF: [0.55, 2.4], armB: [0.35, 1.7], chin: true, expr: 'pense', look: [-0.4, -0.8]},
  hausser: {lean: -0.02, head: 0.14, shrug: 22, crouch: 0, armF: [0.55, 1.75], armB: [-0.55, -1.75], expr: 'gene', look: [0, 0]},
  content: {lean: 0, head: -0.06, shrug: 4, crouch: 0, armF: [0.4, 1.3], armB: [-0.4, -1.3], expr: 'content', look: [0, 0]},
};

export const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  const l = (x: number, y: number) => x + (y - x) * k;
  const h = k < 0.5 ? a : b; // champs discrets : bascule à mi-chemin
  return {
    lean: l(a.lean, b.lean),
    head: l(a.head, b.head),
    shrug: l(a.shrug, b.shrug),
    crouch: l(a.crouch, b.crouch),
    armF: [l(a.armF[0], b.armF[0]), l(a.armF[1], b.armF[1])],
    armB: [l(a.armB[0], b.armB[0]), l(a.armB[1], b.armB[1])],
    point: h.point,
    chin: h.chin,
    expr: h.expr,
    look: [l(a.look[0], b.look[0]), l(a.look[1], b.look[1])],
  };
};
