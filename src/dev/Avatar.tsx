// Photo de profil (1080×1080, recadrée en rond par TikTok) : Pierrot en buste sur le carnet.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BoilFilter, C, F, Paper} from '../theme';
import {Mascot} from '../rig/Mascot';
import {PoseName} from '../rig/poses';

export const Avatar: React.FC<{pose?: PoseName; scale?: number; ground?: number; x?: number}> = ({pose = 'reflechir', scale = 2.8, ground = 1660, x = 525}) => (
  <AbsoluteFill>
    <Paper />
    <BoilFilter />
    <svg width={1080} height={1080} style={{position: 'absolute'}}>
      {/* pastille surligneur derrière la tête */}
      <circle cx={540} cy={500} r={370} fill={C.hlSoft} />
      <Mascot look="pierrot" id={1} scale={scale} track={{ground, x, target: [900, 160], keys: [{t: 0, pose, dur: 0.01}]}} time={1.2} />
    </svg>
    {/* pièce « € » visée par Pierrot */}
    <div style={{position: 'absolute', left: 175, top: 200, width: 150, height: 150, borderRadius: 75, background: C.orange, border: `8px solid ${C.ink}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: 104, color: C.white, transform: 'rotate(10deg)'}}>€</div>
  </AbsoluteFill>
);
