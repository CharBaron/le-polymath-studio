// Animations sur mesure de la vidéo 31 (la tache aveugle), style optique (noir sang, planches d'anatomie).
// TacheTest : le vrai test, qui marche sur un téléphone : croix noire à gauche, point rouge à droite, sur papier clair,
//   rien ne bouge (le point doit tomber dans la tache aveugle de l'œil droit vers 15-20 cm). Consignes en haut au fil
//   de la voix. reveal : le point s'efface, il reste son contour en pointillés et « ? ». freezeAt : image figée (boucle).
// Nerf : la coupe de l'œil de Gray ; un rayon entre par la pupille et tombe sur la sortie du nerf optique, cerclée.
// Saccades : les yeux de Duchenne sautent d'un point à l'autre, l'image se coupe au noir à chaque saut ; compteurs.
import React from 'react';
import {Img} from 'remotion';
import {clamp01, easeOut, lerp, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {nums, Order, pop, RED, src} from './tests';

const CROSS = {x: 150, y: 800}, DOT = {x: 930, y: 800, r: 38};
const INK = '#F4E9DE'; // croix et consignes claires sur le fond noir du style

export const TacheTest: React.FC<AnimProps> = ({id, t: tNow, lt, p}) => {
  const at = nums(p, 'at'); // [fixe, approche]
  const reveal = !!p.reveal, patch = !!p.patch;
  const t = p.freezeAt !== undefined ? Number(p.freezeAt) : tNow;
  const live = p.freezeAt === undefined && !reveal && !patch;
  const step = live ? at.filter((a) => t >= a - 0.05).length : 0;
  const ORDERS = ["FERME L'ŒIL GAUCHE", "FIXE LA CROIX|AVEC L'ŒIL DROIT", 'APPROCHE-TOI|DOUCEMENT…'];
  const ok = live ? prog(t, step ? at[step - 1] - 0.05 : 3.0, (step ? at[step - 1] : 3.0) + 0.2, easeOut) : 0;
  const gone = reveal ? prog(lt, 0.25, 0.7, easeOut) : 0;
  const breathe = live && step >= 1 ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
  return (
    <>
      {/* consignes (le titre d'accroche occupe le haut jusqu'à 2,9 s) */}
      {live && t >= 3.0 ? <Order text={ORDERS[step]} k={ok} y={360} color={RED} size={50} /> : null}
      {live && step >= 2 ? <div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 38, letterSpacing: '0.14em', color: INK, opacity: prog(t, at[1], at[1] + 0.3)}}>↓ JUSQU'À 20 CM DE L'ÉCRAN ↓</div> : null}
      {/* la croix : grosse, nette, immobile ; un halo discret aide à la fixer */}
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        {breathe ? <circle cx={CROSS.x} cy={CROSS.y} r={62 + 6 * breathe} fill="none" stroke={`rgba(${G.goldRgb},0.35)`} strokeWidth={3} /> : null}
        <path d={`M ${CROSS.x - 40} ${CROSS.y} H ${CROSS.x + 40} M ${CROSS.x} ${CROSS.y - 40} V ${CROSS.y + 40}`} stroke={INK} strokeWidth={12} strokeLinecap="square" />
        {/* le point rouge : immobile, sans contour */}
        <defs>
          <radialGradient id="dot" cx="0.38" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#FF6B5E" /><stop offset="0.7" stopColor="#D61F1F" /><stop offset="1" stopColor="#9C0E10" />
          </radialGradient>
        </defs>
        <circle cx={DOT.x} cy={DOT.y} r={DOT.r} fill="url(#dot)" opacity={1 - gone} />
        {reveal ? <circle cx={DOT.x} cy={DOT.y} r={DOT.r + 8} fill="none" stroke={RED} strokeWidth={5} strokeDasharray="12 10" opacity={gone} /> : null}
      </svg>
      {reveal ? <div style={{position: 'absolute', left: DOT.x - 60, top: DOT.y - 66, width: 120, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 100, color: RED, opacity: gone}}>?</div> : null}
      {reveal ? <Order text="DISPARU." k={prog(lt, 0.5, 0.75, easeOut)} y={980} color={RED} size={80} /> : null}
      {/* patch : le trou (noir) puis le cerveau le comble avec du « papier » inventé */}
      {patch ? (() => {
        const hole = prog(lt, 0.1, 0.35, easeOut), fill = prog(lt, 0.9, 1.4, easeOut), r = DOT.r * 2.4;
        return (
          <>
            <div style={{position: 'absolute', left: DOT.x - r, top: DOT.y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', overflow: 'hidden', transform: `scale(${hole})`, background: '#050202', boxShadow: '0 0 40px rgba(0,0,0,0.6)'}}>
              <Img src={src(id, 'marble')} style={{position: 'absolute', left: -(DOT.x - r), top: -(DOT.y - r), width: 1080, height: 1920, clipPath: `circle(${fill * 100}% at 50% 50%)`, filter: 'brightness(1.6) contrast(1.1)'}} />
            </div>
            <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
              <circle cx={DOT.x} cy={DOT.y} r={r + 6} fill="none" stroke={RED} strokeWidth={5} strokeDasharray="12 10" opacity={hole} />
            </svg>
            <Order text="INVENTÉ PAR|TON CERVEAU" k={prog(lt, 1.2, 1.5, easeOut)} y={980} color={RED} size={60} />
          </>
        );
      })() : null}
    </>
  );
};

export const Nerf: React.FC<AnimProps> = ({id, lt, p}) => {
  const hit = Number(p.hit ?? 0.6);
  const W = 860, H = Math.round((W * 720) / 898), x0 = 540 - W / 2, y0 = 760 - H / 2;
  const P = (fx: number, fy: number) => ({x: x0 + fx * W, y: y0 + fy * H});
  const pupil = P(0.5, 0.12), disc = P(0.425, 0.86);
  const ray = prog(lt, 0.15, hit, easeOut), ring = prog(lt, hit, hit + 0.3, easeOut), lab = pop(lt, hit + 0.25);
  const rx = lerp(pupil.x, disc.x, ray), ry = lerp(pupil.y, disc.y, ray);
  return (
    <>
      <div style={{position: 'absolute', left: x0, top: y0, width: W, filter: 'drop-shadow(0 22px 34px rgba(0,0,0,0.75))'}}>
        <Img src={src(id, 'oeil')} style={{width: '100%', display: 'block'}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <line x1={pupil.x} y1={pupil.y - 260} x2={rx} y2={ry} stroke="#FFE08A" strokeWidth={10} strokeLinecap="round" opacity={0.85} />
        <line x1={pupil.x} y1={pupil.y - 260} x2={rx} y2={ry} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
        <circle cx={disc.x} cy={disc.y} r={30 + 50 * (1 - ring)} fill="rgba(214,31,31,0.25)" stroke={RED} strokeWidth={7} opacity={ring} />
        <path d={`M ${disc.x + 34} ${disc.y + 20} L ${disc.x + 150} ${disc.y + 150} H 1000`} stroke={RED} strokeWidth={5} fill="none" opacity={ring} />
      </svg>
      <div style={{position: 'absolute', left: disc.x + 160, top: disc.y + 80, fontFamily: GF.label, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: RED, opacity: lab, transform: `scale(${lab})`, transformOrigin: 'left top', textShadow: '0 3px 10px rgba(0,0,0,0.9)'}}>0 CELLULE<br />POUR VOIR</div>
    </>
  );
};

export const Saccades: React.FC<AnimProps> = ({id, lt, p}) => {
  const count = Number(p.count ?? 1.2), hour = Number(p.hour ?? 2.4);
  // sauts : toutes les 0,28 s, regard à gauche / à droite ; noir pendant 2 images après chaque saut
  const k = Math.floor(lt / 0.28), f = lt - k * 0.28;
  const black = f < 2 / 30 && k > 0;
  const gaze = (rand(k * 3.7) - 0.5) * 120;
  const n = Math.round(30000 * clamp01((lt - count) / 0.9) ** 0.6);
  const hk = pop(lt, hour);
  return (
    <>
      <div style={{position: 'absolute', left: 540 - 440, top: 470, width: 880, height: 300, overflow: 'hidden', borderRadius: 6, boxShadow: '0 22px 40px rgba(0,0,0,0.75)'}}>
        <Img src={src(id, 'yeux')} style={{position: 'absolute', left: -20 + gaze * 0.15, top: -10, width: 920, transform: `scale(1.05)`}} />
        {black ? <div style={{position: 'absolute', inset: 0, background: '#000'}} /> : null}
        <div style={{position: 'absolute', left: 18, top: 12, fontFamily: GF.label, fontWeight: 700, fontSize: 26, letterSpacing: '0.18em', color: black ? RED : 'rgba(255,255,255,0.8)'}}>{black ? '■ COUPÉ' : '● VISION'}</div>
      </div>
      {lt >= count ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center'}}>
          <div style={{fontFamily: GF.sans, fontWeight: 900, fontSize: 150, color: G.gold, lineHeight: 1, textShadow: `0 0 30px rgba(${G.goldRgb},0.5)`}}>{n.toLocaleString('fr-FR').replace(/ | /g, ' ')}{n >= 30000 ? '+' : ''}</div>
          <div style={{fontFamily: GF.label, fontWeight: 700, fontSize: 40, letterSpacing: '0.16em', color: G.text, marginTop: 10}}>COUPURES PAR JOUR</div>
        </div>
      ) : null}
      {hk > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 56, letterSpacing: '0.08em', color: RED, transform: `scale(${hk})`, textShadow: '0 4px 14px rgba(0,0,0,0.9)'}}>≈ 1 H D'AVEUGLEMENT</div> : null}
    </>
  );
};

export const OEIL = {TacheTest, Nerf, Saccades};
