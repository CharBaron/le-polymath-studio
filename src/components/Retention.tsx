// Habillage « rétention », piloté par le front-matter de script.md (timeline.json > retention) :
//   choc: 2 100 €            → carte plein écran dès la 1re image (miniature + arrêt du scroll)
//   choc_sous: ce que coûte ton SMIC à ton patron
//   choc_fin: 1.2            → durée de la carte (s)
//   boucle: oui              → la carte revient en fondu sur la fin : dernière image ≈ première (revisionnage)
//   commente: Acheter ou louer ?  → bulle « dis-le en commentaire » avant la fin
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BoilFilter, C, clamp01, easeIn, easeOut, F, FPS, Highlight, Paper, POP, prog, sp} from '../theme';
import {Spiral} from './Ink';
import {Mascot} from '../rig/Mascot';

export type RetentionSpec = {choc?: string; sous?: string; fin?: number; boucle?: boolean; commente?: string};

const LOOP = 0.6; // fondu de bouclage (s)

const ChocCard: React.FC<{spec: RetentionSpec; opacity: number; y: number; time: number}> = ({spec, opacity, y, time}) => (
  <AbsoluteFill style={{opacity, transform: `translateY(${y}px)`}}>
    <Paper />
    <Spiral />
    <div style={{position: 'absolute', left: 70, right: 70, top: 260, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, color: C.orange, fontSize: Math.min(260, Math.floor(1500 / spec.choc!.length)), lineHeight: 1.25, whiteSpace: 'nowrap', transform: 'rotate(-3deg)'}}>
      {spec.choc}
    </div>
    {spec.sous ? (
      <div style={{position: 'absolute', left: 100, right: 100, top: 560, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: 74, lineHeight: 1.12, color: C.ink}}>
        <Highlight k={1}>{spec.sous}</Highlight>
      </div>
    ) : null}
    <svg width={1080} height={1920} style={{position: 'absolute', filter: 'url(#boil)'}}>
      <Mascot look="pierrot" id={3} track={{ground: 1360, x: 790, restFacing: -1, keys: [{t: 0, pose: 'choque', dur: 0.01}]}} time={time} />
    </svg>
    <BoilFilter />
  </AbsoluteFill>
);

export const Retention: React.FC<{spec?: RetentionSpec; duration: number}> = ({spec, duration}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (!spec) return null;
  const fin = spec.fin ?? 1.2;
  // carte d'ouverture : pleine dès l'image 0, puis glisse vers le haut ; revient en fondu sur la fin si boucle
  const out = prog(t, fin, fin + 0.35, easeIn);
  const back = spec.boucle ? prog(t, duration - LOOP, duration - 1 / FPS, easeOut) : 0;
  const showCard = spec.choc && (out < 1 || back > 0);
  // bulle commentaire : de fin−4 s jusqu'au bouclage
  const tq = duration - 4.2;
  const kq = spec.commente ? sp(frame, tq, POP) * (1 - prog(t, duration - LOOP, duration - 0.2, easeIn)) : 0;
  return (
    <>
      {kq > 0.01 ? (
        <div style={{position: 'absolute', right: 50, bottom: 1920 - 820, width: 600, transform: `scale(${kq}) rotate(${2 - (1 - kq) * 8}deg)`, transformOrigin: '75% 100%', opacity: clamp01(kq * 3)}}>
          <div style={{background: C.white, border: `6px solid ${C.ink}`, borderRadius: 34, padding: '18px 30px', boxShadow: '0 10px 0 rgba(20,19,26,0.12)', fontFamily: F.hand}}>
            <div style={{fontSize: 40, color: C.pen, fontWeight: 700}}>dis-le en commentaire :</div>
            <div style={{fontSize: 62, fontWeight: 700, lineHeight: 1.08, color: C.ink}}>{spec.commente}</div>
          </div>
          {/* queue de bulle */}
          <svg width={80} height={60} style={{position: 'absolute', right: 150, bottom: -50}}>
            <path d="M6 0 L20 52 L56 0" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <path d="M10 -6 L54 -6" stroke={C.white} strokeWidth={8} />
          </svg>
        </div>
      ) : null}
      {showCard ? <ChocCard spec={spec} opacity={back > 0 ? back : 1} y={back > 0 ? 0 : -out * 1920} time={back > 0 ? 0 : t} /> : null}
    </>
  );
};
