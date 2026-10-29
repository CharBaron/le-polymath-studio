// Prototype 10 s : Pierrot entre en marchant, s'arrête, pointe un chiffre qui s'anime, puis réagit.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, F, POP, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Circle, Counter, Note} from '../components/Ink';
import {talkAt} from '../components/Captions';

export const Proto: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const b = tl.beats;
  const k = sp(frame, b.count - 0.15, POP);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: 92, color: C.ink, opacity: 1 - sp(frame, b.point - 0.3)}}>
        1 million chacun ?
      </div>
      <Note x={150} y={290} t0={b.point} size={72} color={C.pen}>regarde bien ↓</Note>
      <div style={{position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'flex-start', paddingLeft: 140, transform: `scale(${k})`, opacity: k > 0.01 ? 1 : 0}}>
        <Counter from={0} to={1000000} t0={b.count} t1={b.count + 1.1} size={150} suffix=" €" />
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', filter: 'url(#boil)'}}>
        <Circle cx={490} cy={480} rx={430} ry={110} t0={b.spoiler} />
        <Mascot
          look="pierrot"
          talk={talkAt(talk, frame)}
          scale={1.35}
          track={{
            ground: 1360,
            x: 980,
            target: [300, 760],
            moves: [{t0: 0.0, t1: b.point - 0.1, x0: 980, x1: 770}],
            keys: [
              {t: b.point, pose: 'pointer', hold: b.shock - b.point - 0.6},
              {t: b.shock, pose: 'choque', hold: 0.9},
              {t: b.spoiler + 0.2, pose: 'hausser', hold: 1.4},
            ],
          }}
        />
      </svg>
    </>
  );
};
