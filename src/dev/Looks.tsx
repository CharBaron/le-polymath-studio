// Planche de choix : les 3 looks de mascotte sur le même rig.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BoilFilter, C, F, Paper} from '../theme';
import {Look, Mascot} from '../rig/Mascot';
import {PoseName} from '../rig/poses';

const LOOKS: {look: Look; name: string; desc: string; pose: PoseName}[] = [
  {look: 'pierrot', name: 'A · Pierrot', desc: 'sweat orange, tête d’encre', pose: 'pointer'},
  {look: 'bic', name: 'B · Bic', desc: 'bonhomme stylo bleu', pose: 'content'},
  {look: 'sou', name: 'C · Sou', desc: 'tête-pièce, trait d’encre', pose: 'reflechir'},
];

export const Looks: React.FC<{pose?: PoseName}> = ({pose}) => (
  <AbsoluteFill>
    <Paper />
    <BoilFilter />
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      {LOOKS.map((l, i) => {
        const x = 330 + i * 630;
        return (
          <Mascot key={l.look} look={l.look} id={i + 1} track={{ground: 900, x, target: [x + 260, 380], keys: [{t: 0, pose: pose ?? l.pose, dur: 0.01}]}} time={1.2} />
        );
      })}
    </svg>
    {LOOKS.map((l, i) => (
      <div key={l.look} style={{position: 'absolute', left: 330 + i * 630 - 280, width: 560, top: 935, textAlign: 'center', fontFamily: F.hand}}>
        <div style={{fontSize: 56, fontWeight: 700, color: C.ink}}>{l.name}</div>
        <div style={{fontSize: 34, color: C.pen}}>{l.desc}</div>
      </div>
    ))}
  </AbsoluteFill>
);
