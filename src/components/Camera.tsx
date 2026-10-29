// Mise en scène « grande page » : tout le décor vit dans un monde plus grand que l'écran,
// une caméra glisse et zoome de station en station. Réutilisable pour toute vidéo.
//   const cam = camAt(t, [{t: 0, x: 540, y: 960, z: 1}, {t: b.tunnel, x: 1620, y: 960}, …]);
//   <World cam={cam} width={3240} height={3840}> …dessins en coordonnées monde… </World>
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {C, clamp01, easeInOut, F, handPath, lerp} from '../theme';

export type Cam = {x: number; y: number; z: number};
export type CamKey = {t: number; x: number; y: number; z?: number; dur?: number};

/** Position de la caméra : chaque clé démarre un déplacement de `dur` s (1,1 par défaut) vers sa cible. */
export const camAt = (t: number, keys: CamKey[]): Cam => {
  const ks = [...keys].sort((a, b) => a.t - b.t);
  let cur: Cam = {x: ks[0].x, y: ks[0].y, z: ks[0].z ?? 1};
  for (const k of ks) {
    if (t < k.t) break;
    const e = easeInOut(clamp01((t - k.t) / (k.dur ?? 1.1)));
    const to = {x: k.x, y: k.y, z: k.z ?? cur.z};
    cur = {x: lerp(cur.x, to.x, e), y: lerp(cur.y, to.y, e), z: lerp(cur.z, to.z, e)};
  }
  return cur;
};

/** Le monde : papier quadrillé infini + contenu, transformé par la caméra. */
export const World: React.FC<{cam: Cam; width: number; height: number; children: React.ReactNode; boil?: boolean}> = ({cam, width, height, children, boil = true}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <pattern id="wgrid" width={54} height={54} patternUnits="userSpaceOnUse">
          <path d="M 54 0 L 0 0 0 54" fill="none" stroke={C.grid} strokeWidth={2} />
        </pattern>
      </defs>
      <g transform={`translate(540 960) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>
        <rect x={-4000} y={-4000} width={width + 8000} height={height + 8000} fill={C.paper} />
        <rect x={-4000} y={-4000} width={width + 8000} height={height + 8000} fill="url(#wgrid)" />
        {/* bord du carnet : marge rouge + spirale */}
        <line x1={96} y1={-4000} x2={96} y2={height + 4000} stroke={C.margin} strokeWidth={3} />
        {Array.from({length: Math.ceil(height / 78) + 2}, (_, i) => (
          <g key={i}>
            <circle cx={30} cy={40 + i * 78} r={9} fill={C.paperShade} stroke="rgba(20,19,26,0.35)" strokeWidth={2} />
            <path d={`M 4 ${34 + i * 78} Q 22 ${20 + i * 78} 32 ${40 + i * 78}`} stroke="#8A8A92" strokeWidth={7} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <g style={{filter: boil ? 'url(#boil)' : undefined}}>{children}</g>
      </g>
    </svg>
  </AbsoluteFill>
);

/** Trait qui se dessine au stylo (k 0→1), avec tremblement. */
export const Ink: React.FC<{pts: [number, number][]; k: number; color?: string; width?: number; id?: number; fill?: string; dash?: string}> = ({pts, k, color = C.ink, width = 7, id = 1, fill, dash}) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  const d = handPath(pts, frame, id, 1.2);
  const e = evolvePath(clamp01(k), d);
  return (
    <>
      {fill && k >= 1 ? <path d={d} fill={fill} stroke="none" /> : null}
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ?? e.strokeDasharray} strokeDashoffset={dash ? 0 : e.strokeDashoffset} />
    </>
  );
};

/** Texte monde (SVG) manuscrit. */
export const WText: React.FC<{x: number; y: number; size?: number; color?: string; weight?: 400 | 700; anchor?: 'start' | 'middle' | 'end'; o?: number; rot?: number; children: React.ReactNode}> = ({
  x, y, size = 56, color = C.ink, weight = 700, anchor = 'start', o = 1, rot = 0, children,
}) => (
  <text x={x} y={y} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor} opacity={o} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} style={{fontFamily: F.hand}}>
    {children}
  </text>
);

/** Surligneur en SVG derrière une zone (k 0→1 de gauche à droite). */
export const WHighlight: React.FC<{x: number; y: number; w: number; h: number; k: number; color?: string}> = ({x, y, w, h, k, color = C.hlSoft}) =>
  k > 0 ? <rect x={x} y={y} width={w * clamp01(k)} height={h} rx={h * 0.25} fill={color} transform={`rotate(-1.5 ${x} ${y})`} style={{mixBlendMode: 'multiply'}} /> : null;
