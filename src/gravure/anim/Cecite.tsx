// Animations sur mesure de la vidéo 35 (la cécité au changement), style labo (bleu nuit, bichromie bleue).
// Flicker : le vrai test de Rensink, O'Regan & Clark (1997), calé sur le numéro d'image absolu : A, A, A', A'… chaque image
//   7 images (0,23 s) puis un écran gris de 3 images (0,1 s) ; A' = la même carte sans la flèche du beffroi. La carte ne bouge
//   jamais. Consigne, compte à rebours 5-4-3-2-1 (at = balises), « STOP. » (stop) puis image figée sur A.
//   mode 'reveal' : plus de gris, A / A' alternent toutes les 0,4 s, la tour est entourée à l'encre rouge (zoom : gros plan).
//   mode 'nogray' : le même rythme que le test, sans le gris : la flèche saute aux yeux.
//   holdFrom : à partir de cet instant, image figée sur A (dernière image = première, pour la boucle).
// Porte : l'expérience de Simons & Levin (1998) : un homme, une porte qui passe devant, un autre homme derrière.
import React from 'react';
import {Img} from 'remotion';
import {clamp01, easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {Countdown, InkStroke, nums, Order, RED, src, Stop} from './tests';

const CW = 898, CH = 580, CX = 540, CY = 720; // carte de la place (prep_img.py), centrée
const TOWER = {x: 295, y: 106, rx: 64, ry: 98}; // zone de la flèche dans la carte
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

/** quelle image du test à l'instant t : 'a' | 'b' | 'gris' (rythme de Rensink : A, A, A', A', 7 images + 3 de gris) */
export const flickerAt = (t: number, gray = true): 'a' | 'b' | 'gris' => {
  const f = Math.floor(t * 30 + 1e-4);
  const k = Math.floor(f / 10);
  if (gray && f % 10 >= 7) return 'gris';
  return Math.floor(k / 2) % 2 === 0 ? 'a' : 'b';
};

const ellipse = (cx: number, cy: number, rx: number, ry: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = -Math.PI * 0.62 + (i / 48) * Math.PI * 2.12;
    const w = 1 + 0.05 * Math.sin(a * 3 + 1);
    pts.push(`${(cx + rx * w * Math.cos(a)).toFixed(1)} ${(cy + ry * w * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
};

const Card: React.FC<{id: string; show: 'a' | 'b' | 'gris'}> = ({id, show}) => (
  <div style={{position: 'absolute', left: CX - CW / 2, top: CY - CH / 2, width: CW, height: CH, filter: 'drop-shadow(0 22px 34px rgba(0,0,0,0.75))'}}>
    {(['a', 'b', 'gris'] as const).map((k) => (
      <Img key={k} src={src(id, `ville_${k}`)} style={{position: 'absolute', left: 0, top: 0, width: CW, height: CH, opacity: show === k ? 1 : 0}} />
    ))}
  </div>
);

export const Flicker: React.FC<AnimProps> = ({id, t, lt, p}) => {
  const mode = String(p.mode ?? 'test');
  const at = nums(p, 'at');
  const stop = Number(p.stop ?? 1e9), hold = Number(p.holdFrom ?? 1e9);
  const frozen = p.freezeAt !== undefined || t >= hold;
  if (mode === 'reveal') {
    const zoom = p.zoom ? prog(lt, 0, 0.45, easeOut) : 0;
    const s = 1 + 1.25 * zoom;
    const ox = CX - CW / 2 + TOWER.x, oy = CY - CH / 2 + TOWER.y;
    const blink = lt < 0.55 ? 'a' : Math.floor((lt - 0.55) / 0.4) % 2 === 0 ? 'b' : 'a';
    const ring = p.zoom ? 1 : prog(lt, 0.08, 0.5, easeOut);
    return (
      <>
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `translate(${(540 - ox) * zoom}px, ${(700 - oy) * zoom}px) scale(${s})`}}>
          <Card id={id} show={blink} />
          <InkStroke d={ellipse(ox, oy, TOWER.rx, TOWER.ry)} k={ring} w={7 / s + 2} />
        </div>
        <Order text={String(p.label ?? 'LA TOUR')} k={p.label === '' ? 0 : prog(lt, 0.3, 0.55, easeOut)} y={p.zoom ? 1235 : 1080} color={RED} size={72} />
      </>
    );
  }
  const show = frozen ? 'a' : t >= stop ? 'a' : flickerAt(t, mode !== 'nogray');
  return (
    <>
      <Card id={id} show={show} />
      {mode === 'test' && !frozen && t >= 3.0 && t < stop ? <Order text="TROUVE CE QUI CHANGE" k={prog(t, 3.0, 3.25, easeOut)} y={330} size={46} /> : null}
      {mode === 'test' && !frozen ? <Countdown t={t} at={at} stop={stop} y={1165} /> : null}
      {mode === 'test' && !frozen ? <Stop t={t} at={stop} y={600} /> : null}
      {mode === 'nogray' ? <Order text="SANS LE FLASH GRIS" k={prog(lt, 0.1, 0.35, easeOut)} y={1090} color={G.gold} size={60} /> : null}
      {p.order && !frozen ? <Order text={String(p.order)} k={prog(lt, 0.05, 0.3, easeOut)} y={322} size={42} color={G.gold} /> : null}
    </>
  );
};

export const Porte: React.FC<AnimProps> = ({id, t, p}) => {
  const [a, b] = nums(p, 'pass'); // la porte entre à gauche à a, sort à droite à b
  const u = easeInOut(clamp01((t - a) / (b - a)));
  const DW = 820, DH = Math.round((DW * 905) / 760); // porte double (prep_img.py)
  const dx = lerp(-DW / 2 - 40, 1080 + DW / 2 + 40, u);
  const swap = t >= a + (b - a) / 2;
  const MW = 470;
  return (
    <>
      <div style={{position: 'absolute', left: 540 - MW / 2, top: 400, width: MW, filter: 'drop-shadow(0 22px 34px rgba(0,0,0,0.75))'}}>
        <Img src={src(id, 'homme1')} style={{width: '100%', display: swap ? 'none' : 'block'}} />
        <Img src={src(id, 'homme2')} style={{width: '100%', display: swap ? 'block' : 'none', marginTop: 40}} />
      </div>
      {t > a && t < b ? (
        <div style={{position: 'absolute', left: dx - DW / 2, top: 300, width: DW, height: DH, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.85))', transform: `rotate(${(u - 0.5) * 3}deg)`}}>
          <Img src={src(id, 'porte')} style={{width: DW, height: DH}} />
        </div>
      ) : null}
    </>
  );
};

export const CECITE = {Flicker, Porte};
