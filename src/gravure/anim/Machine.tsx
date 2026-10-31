// Animations sur mesure de la vidéo 34 (la machine à expériences de Nozick), style caverne (roche, feu, pourpre).
// Branche : l'homme aux deux écouteurs (gravure de 1880) devant la caverne de Platon (Saenredam, 1604) ; les promesses de la
//   machine s'écrivent au fil de la voix (la dernière en rouge : « RIEN NE SERA VRAI ») ; JE ME BRANCHE / NON ; 3-2-1.
//   reveal : NON s'allume. freezeAt : image figée (boucle).
// Retour : l'expérience de De Brigard (2010). mode q : la fiche tapée « TU ES DÉJÀ BRANCHÉ. / TU VEUX REVENIR AU RÉEL ? » ;
//   mode bars : RESTENT / REVIENNENT (46 / 54 %), et avec prison : 87 / 13 %.
import React from 'react';
import {Img} from 'remotion';
import {easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {Choice, Countdown, list, nums, Order, Paper, pop, RED, src} from './tests';

export const Branche: React.FC<AnimProps> = ({id, t: tNow, lt, p}) => {
  const reveal = !!p.reveal;
  const t = p.freezeAt !== undefined ? Number(p.freezeAt) : tNow;
  const live = p.freezeAt === undefined && !reveal;
  const L = list(p, 'lines'), at = nums(p, 'at'), cd = nums(p, 'cd');
  const ask = reveal ? -1e9 : Number(p.ask ?? 1e9);
  let k = -1;
  for (let i = 0; i < at.length; i++) if (t >= at[i] - 0.05) k = i;
  const lk = k >= 0 ? prog(t, at[k] - 0.05, at[k] + 0.2, easeOut) : 0;
  const glow = 0.5 + 0.5 * Math.sin(t * 4);
  const no = reveal ? prog(lt, 0.05, 0.25) : 0;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 0.38, transform: `scale(${1.04 + 0.05 * Math.min(1, t / 12)})`}}>
        <Img src={src(id, 'caverne_plein')} style={{width: '100%', height: '100%'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(16,8,18,0.1) 25%, rgba(16,8,18,0.9) 85%)'}} />
      <div style={{position: 'absolute', left: 540 - 300, top: 420, width: 600, filter: `drop-shadow(0 0 ${20 + 20 * glow}px rgba(${G.goldRgb},0.55)) drop-shadow(0 22px 30px rgba(0,0,0,0.8))`, transform: `scale(${lerp(1.05, 1, prog(t, 0, 0.3, easeOut))})`}}>
        <Img src={src(id, 'tel')} style={{width: '100%', display: 'block'}} />
      </div>
      {live && k >= 0 ? <Order text={L[k]} k={lk} y={1060} size={k === L.length - 1 ? 62 : 54} color={k === L.length - 1 ? RED : G.gold} /> : null}
      <Choice x={330} y={1210} w={400} text="JE ME BRANCHE" o={prog(t, ask, ask + 0.2)} pulse={live && t > ask ? 0.5 + 0.5 * Math.sin(t * 9) : 0} size={40} />
      <Choice x={760} y={1210} w={260} text="NON" red o={prog(t, ask, ask + 0.2)} on={no} pulse={live && t > ask ? 0.5 + 0.5 * Math.sin(t * 9 + 1.5) : 0} size={44} />
      {live ? <Countdown t={t} at={cd} stop={cd.length ? cd[cd.length - 1] + 0.7 : 0} y={1570} /> : null}
    </>
  );
};

export const Retour: React.FC<AnimProps> = ({id, t, lt, p}) => {
  const mode = String(p.mode ?? 'q');
  if (mode === 'q') {
    const veux = Number(p.veux ?? 1e9);
    const l1 = 'TU ES DÉJÀ BRANCHÉ.', l2 = 'TA VIE EST UNE SIMULATION.', l3 = 'TU VEUX REVENIR AU RÉEL ?';
    const n1 = Math.floor(lt / 0.04), n2 = Math.floor((lt - 1.2) / 0.04), n3 = Math.floor((t - veux) / 0.04);
    const line = (s: string, n: number, y: number, col: string, size = 52) => (n > 0 ? <div style={{position: 'absolute', left: 50, right: 40, top: y, fontFamily: '"Special Elite", "Courier New", monospace', fontWeight: 700, fontSize: size, color: col, whiteSpace: 'nowrap'}}>{s.slice(0, n)}{n < s.length && Math.floor(lt * 8) % 2 ? '▍' : ''}</div> : null);
    return (
      <Paper id={id} x={540} y={780} w={920} h={520} rot={-1.5} s={lerp(1.06, 1, prog(lt, 0, 0.2, easeOut))}>
        <div style={{position: 'absolute', left: 50, top: 22, fontFamily: GF.label, fontWeight: 700, fontSize: 28, letterSpacing: '0.24em', color: `rgba(${G.goldRgb},1)`}}>DE BRIGARD · 2010</div>
        {line(l1, n1, 120, '#1A0E1E')}
        {line(l2, n2, 210, '#1A0E1E', 44)}
        {line(l3, n3, 340, '#B0182A', 50)}
      </Paper>
    );
  }
  const prison = !!p.prison;
  const k = prog(lt, 0.15, 0.7, easeOut);
  const stay = lerp(0, prison ? 87 : 46, k), back = lerp(0, prison ? 13 : 54, k);
  const Bar = ({y, label, v, col}: {y: number; label: string; v: number; col: string}) => (
    <>
      <div style={{position: 'absolute', left: 110, top: y - 60, fontFamily: GF.label, fontWeight: 700, fontSize: 40, letterSpacing: '0.12em', color: col}}>{label}</div>
      <div style={{position: 'absolute', left: 110, top: y, width: 760, height: 70, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: `2px solid rgba(${G.goldRgb},0.4)`}}>
        <div style={{width: `${v}%`, height: '100%', borderRadius: 6, background: col, boxShadow: `0 0 24px ${col}`}} />
      </div>
      <div style={{position: 'absolute', left: 110 + 7.6 * v + 20, top: y + 4, fontFamily: GF.sans, fontWeight: 900, fontSize: 56, color: G.text}}>{Math.round(v)} %</div>
    </>
  );
  return (
    <>
      <Order text={prison ? 'SI LE RÉEL EST UNE PRISON' : 'TU VEUX REVENIR AU RÉEL ?'} k={prog(lt, 0, 0.2, easeOut)} y={440} size={50} color={prison ? RED : G.gold} />
      <Bar y={680} label="RESTENT BRANCHÉS" v={stay} col={G.gold} />
      <Bar y={900} label="REVIENNENT AU RÉEL" v={back} col="#8FA3B8" />
      {prison ? <div style={{position: 'absolute', left: 0, right: 0, top: 1050, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 46, letterSpacing: '0.1em', color: RED, opacity: pop(lt, 0.8)}}>87 % RESTENT DANS LE FAUX</div> : null}
    </>
  );
};

export const MACHINE = {Branche, Retour};
