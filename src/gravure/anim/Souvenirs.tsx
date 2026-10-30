// Animations sur mesure de la vidéo 29 (le mot qui n'était pas là), style rêve (nuit violette, papier lilas).
// ListeMots : le test DRM. Un paquet de fiches bristol face cachée (1re et dernière image) ; à chaque mot dit, une fiche
//   tombe sur la pile avec le mot écrit ; derrière, une gravure du sommeil change tous les deux mots (Füssli, Goya,
//   Grandville, Van Gogh, Messerschmidt, Endymion). « STOP. » : les fiches s'envolent.
// Quiz : « Réponds vite » : LIT ? CHAISE ? SOMMEIL ? avec OUI / NON ; le OUI de SOMMEIL est entouré à l'encre.
// Rembobine : la cassette rembobine, les 11 fiches reviennent dans l'ordre inverse, la 12e case (SOMMEIL) reste vide.
// Fiche : la fiche de l'expérience tapée à la machine. Reconstruit : la gravure de Goya revient en morceaux, un morceau
//   manque et la mémoire le comble avec un morceau d'une autre gravure (Grandville). PhotoTruquee : la vraie photo
//   d'enfance découpée aux ciseaux et collée dans la nacelle d'une montgolfière de 1783.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp01, easeInOut, easeOut, lerp, overshoot, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';

const src = (id: string, f: string) => staticFile(`v/${id}/img/${f}.webp`);
const INK = '#24142C';
const list = (p: AnimProps['p'], k: string) => String(p[k] ?? '').split('|').filter(Boolean);
const nums = (p: AnimProps['p'], k: string) => (Array.isArray(p[k]) ? (p[k] as number[]) : []);

/** fiche bristol : papier lilas texturé, lignes bleues, filet rouge en tête, ombre portée ; face cachée = dos velours */
const Bristol: React.FC<{id: string; x: number; y: number; w: number; h: number; rot: number; s?: number; o?: number; back?: boolean; children?: React.ReactNode}> = ({id, x, y, w, h, rot, s = 1, o = 1, back, children}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o, transform: `rotate(${rot}deg) scale(${s})`, borderRadius: 6, overflow: 'hidden', boxShadow: '0 18px 34px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.15) inset'}}>
    <Img src={src(id, back ? 'velvet' : 'marble_white')} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${-((x * 7) % 300)}px, ${-((y * 3) % 900)}px)`}} />
    {back ? (
      <>
        <div style={{position: 'absolute', inset: 14, border: `3px solid rgba(${G.goldRgb},0.7)`, borderRadius: 4}} />
        <div style={{position: 'absolute', inset: 26, border: `1px solid rgba(${G.goldRgb},0.45)`, borderRadius: 3}} />
      </>
    ) : (
      <>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 43px, rgba(70,110,190,0.38) 43px, rgba(70,110,190,0.38) 45px)', backgroundPosition: `0 ${h * 0.28}px`}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.24, height: 3, background: 'rgba(190,40,50,0.7)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25), rgba(60,30,80,0.18) 80%)'}} />
      </>
    )}
    {children}
  </div>
);

const BGS = ['nightmare_plein', 'nightmare_plein', 'goya_plein', 'goya_plein', 'prefet_plein', 'prefet_plein', 'sieste_plein', 'sieste_plein', 'gahner_plein', 'gahner_plein', 'endymion_plein'];
const tilt = (i: number) => (rand(i * 7.3 + 1) - 0.5) * 9;

export const ListeMots: React.FC<AnimProps> = ({id, t: tNow, p}) => {
  const W = list(p, 'words'), at = nums(p, 'at'), stop = Number(p.stop);
  const t = p.freezeAt !== undefined ? Number(p.freezeAt) : tNow;
  let k = -1;
  for (let i = 0; i < at.length; i++) if (t >= at[i] - 0.04) k = i;
  const gone = prog(t, stop - 0.02, stop + 0.35, easeInOut); // « Stop. » : tout s'envole
  const bg = k < 0 ? 'goya_plein' : BGS[Math.min(k, BGS.length - 1)];
  const since = k < 0 ? t : t - at[k];
  const live = p.freezeAt === undefined && t > 3.0 && t < stop + 0.4;
  const CW = 760, CH = 330, CX = 540, CY = 800;
  return (
    <>
      {/* gravure du sommeil, assombrie, qui pousse lentement ; coupe franche tous les deux mots */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.3 * (1 - gone * 0.6), transform: `scale(${1.04 + 0.05 * clamp01(since / 2)})`}}>
        <Img src={src(id, bg)} style={{width: '100%', height: '100%'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, rgba(14,9,30,0) 20%, rgba(14,9,30,0.8) 85%)'}} />
      {/* paquet face cachée (avant le 1er mot) */}
      {[3, 2, 1, 0].map((j) => (
        <Bristol key={`d${j}`} id={id} back x={CX + j * 6} y={CY + j * 9 + 1100 * gone} w={CW} h={CH} rot={-2 + j * 1.6} o={k < 0 ? 1 : clamp01(1 - (t - at[0]) / 0.25)}>
          {j === 0 ? <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: G.goldHi, fontFamily: GF.label, fontSize: 44, letterSpacing: '0.24em'}}>
            <div style={{fontFamily: GF.sans, fontWeight: 900, fontSize: 112, lineHeight: 1, letterSpacing: '0.02em'}}>{W.length}</div>
            <div>MOTS</div>
          </div> : null}
        </Bristol>
      ))}
      {/* la pile : les fiches déjà vues, de plus en plus décalées */}
      {W.map((w, i) => {
        if (i > k) return null;
        const age = k - i;
        if (age > 4) return null;
        const lt = t - at[i];
        const drop = prog(lt, -0.04, 0.16, overshoot);
        const fly = gone * (i % 2 ? 1 : -1);
        const x = CX + (rand(i * 3.1) - 0.5) * 60 * Math.min(1, age) + fly * 900;
        const y = lerp(CY - 520, CY, drop) + age * 14 + gone * (300 + i * 40);
        return (
          <Bristol key={w} id={id} x={x} y={y} w={CW} h={CH} rot={tilt(i) + fly * 30} s={lerp(1.25, 1, drop) * (1 - age * 0.02)} o={drop * (age ? 0.95 - age * 0.12 : 1)}>
            <div style={{position: 'absolute', left: 0, right: 0, top: CH * 0.32, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: Math.min(150, 1300 / Math.max(4, w.length)), color: INK, lineHeight: 1}}>{w}</div>
            <div style={{position: 'absolute', right: 26, bottom: 16, fontFamily: GF.label, fontSize: 26, color: 'rgba(36,20,44,0.55)', letterSpacing: '0.1em'}}>{String(i + 1).padStart(2, '0')}</div>
          </Bristol>
        );
      })}
      {live ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 305, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 44, lineHeight: 1.3, letterSpacing: '0.12em', color: G.gold, opacity: 1 - gone}}>RETIENS CES MOTS</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 44, letterSpacing: '0.2em', color: `rgba(${G.goldRgb},0.9)`, opacity: k < 0 ? 0 : 1 - gone}}>
            MOT {String(k + 1).padStart(2, '0')} / {String(W.length).padStart(2, '0')}
          </div>
          {/* points de progression */}
          <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
            {W.map((_, i) => <circle key={i} cx={540 + (i - (W.length - 1) / 2) * 44} cy={1130} r={i <= k ? 10 : 7} fill={i <= k ? G.gold : 'none'} stroke={`rgba(${G.goldRgb},0.6)`} strokeWidth={2.5} opacity={1 - gone} />)}
          </svg>
        </>
      ) : null}
      {gone > 0 && p.freezeAt === undefined ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 230, color: '#FF4A5E', transform: `scale(${lerp(1.6, 1, prog(t, stop, stop + 0.14, easeOut))})`, opacity: prog(t, stop, stop + 0.08), textShadow: '0 0 40px rgba(255,60,80,0.55), 0 10px 30px rgba(0,0,0,0.9)'}}>STOP.</div>
      ) : null}
    </>
  );
};

/** pastille OUI / NON au trait d'encre, sur papier */
const Pill: React.FC<{x: number; y: number; text: string; on: number; pulse: number}> = ({x, y, text, on, pulse}) => (
  <div style={{position: 'absolute', left: x - 95, top: y - 50, width: 190, height: 100, borderRadius: 50, border: `5px solid rgba(${G.goldRgb},${0.55 + 0.45 * Math.max(on, pulse)})`, background: on ? `rgba(${G.goldRgb},${0.85 * on})` : 'rgba(20,12,36,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 52, letterSpacing: '0.12em', color: on > 0.5 ? '#1A0E26' : G.text, transform: `scale(${1 + 0.05 * pulse})`, boxShadow: on ? `0 0 34px rgba(${G.goldRgb},${0.7 * on})` : 'none'}}>{text}</div>
);

export const Quiz: React.FC<AnimProps> = ({id, t, lt, p}) => {
  const q = nums(p, 'q'), oui = Number(p.oui);
  const W = ['LIT', 'CHAISE', 'SOMMEIL'];
  const ouiK = prog(t, oui, oui + 0.2, easeOut);
  const circle = prog(t, oui + 0.05, oui + 0.45, easeOut);
  const timer = 1 - clamp01((t - q[0]) / Math.max(0.5, oui - q[0]));
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 50, letterSpacing: '0.16em', color: G.gold, opacity: prog(lt, 0, 0.15)}}>RÉPONDS VITE</div>
      <div style={{position: 'absolute', left: 190, top: 384, width: 700, height: 10, borderRadius: 5, background: `rgba(${G.goldRgb},0.2)`}}>
        <div style={{width: `${timer * 100}%`, height: '100%', borderRadius: 5, background: timer < 0.3 ? '#FF4A5E' : G.gold}} />
      </div>
      {W.map((w, i) => {
        const k = prog(t, q[i] - 0.06, q[i] + 0.16, overshoot);
        if (t < q[i] - 0.06) return null;
        const y = 600 + i * 180;
        const cur = t >= q[i] && (i === 2 || t < q[i + 1]);
        const pulse = cur && !(i === 2 && t >= oui) ? 0.5 + 0.5 * Math.sin((t - q[i]) * 14) : 0;
        return (
          <div key={w} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translateX(${(1 - k) * -700}px)`, opacity: clamp01(k * 2) * (cur || i === 2 ? 1 : 0.45)}}>
            <Bristol id={id} x={285} y={y} w={430} h={140} rot={-1.5 + i}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: w.length > 6 ? 76 : 88, color: INK, lineHeight: 1}}>{w}<span style={{fontSize: 64}}>{' '}?</span></div>
            </Bristol>
            {/* OUI / NON côte à côte, à gauche de x = 960 (zone de l'interface TikTok) */}
            <Pill x={625} y={y} text="OUI" on={i === 2 ? ouiK : 0} pulse={pulse} />
            <Pill x={835} y={y} text="NON" on={0} pulse={pulse * 0.6} />
          </div>
        );
      })}
      {circle > 0 ? (
        <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
          <path d="M 520 945 C 535 880, 680 868, 740 900 C 790 930, 760 1028, 640 1036 C 545 1042, 500 1000, 512 950 C 520 915, 560 895, 600 890" fill="none" stroke="#FF4A5E" strokeWidth={9} strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 * (1 - circle)} />
        </svg>
      ) : null}
    </>
  );
};

export const Rembobine: React.FC<AnimProps> = ({id, lt, t, p}) => {
  const W = list(p, 'words'), jam = Number(p.jam ?? 1.4);
  const n = W.length;
  const slot = (i: number) => ({x: i % 2 ? 745 : 335, y: 440 + Math.floor(i / 2) * 128});
  const rw = clamp01(lt / 1.0);
  const jk = prog(lt, jam, jam + 0.3, easeOut);
  const scan = (Math.floor(t * 30) % 7) * 0.13;
  return (
    <>
      {/* bandes de rembobinage VHS */}
      {rw < 1 ? [0, 1, 2].map((b) => <div key={b} style={{position: 'absolute', left: 0, right: 0, top: ((scan + b * 0.33) % 1) * 1920, height: 26, background: 'rgba(255,255,255,0.12)', filter: 'blur(2px)'}} />) : null}
      <div style={{position: 'absolute', left: 90, top: 318, fontFamily: GF.label, fontWeight: 700, fontSize: 46, letterSpacing: '0.1em', color: G.text, opacity: rw < 1 ? (Math.floor(t * 4) % 2 ? 0.4 : 1) : 0.75}}>◀◀ {rw < 1 ? 'REMBOBINAGE' : 'LA LISTE'}</div>
      {W.map((w, i) => {
        const r = n - 1 - i; // ordre inverse : le dernier mot revient en premier
        const k = prog(rw, r / (n + 2), r / (n + 2) + 0.25, easeOut);
        if (k <= 0) return null;
        const s = slot(i);
        return (
          <Bristol key={w} id={id} x={lerp(540, s.x, k)} y={lerp(1700, s.y, k)} w={380} h={112} rot={lerp(25, (rand(i) - 0.5) * 3, k)} o={k}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 58, color: INK, lineHeight: 1}}>{w.toLowerCase()}</div>
          </Bristol>
        );
      })}
      {/* la case vide */}
      {rw >= 0.85 ? (
        <>
          <div style={{position: 'absolute', left: slot(n).x - 190, top: slot(n).y - 56, width: 380, height: 112, borderRadius: 6, border: `4px dashed rgba(255,74,94,${0.5 + 0.5 * jk})`, opacity: prog(rw, 0.85, 1)}} />
          <div style={{position: 'absolute', left: slot(n).x - 190, top: slot(n).y - 34, width: 380, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 58, color: '#FF4A5E', opacity: 0.25 + 0.75 * jk, textDecoration: jk > 0.5 ? 'line-through' : 'none', textDecorationThickness: 6}}>sommeil</div>
        </>
      ) : null}
    </>
  );
};

export const Fiche: React.FC<AnimProps> = ({id, lt, p}) => {
  const L = list(p, 'lines');
  const n = Math.floor(lt / 0.028);
  let used = 0;
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 760, width: 860, transform: 'translate(-50%, -50%) rotate(-2deg) scale(0.92)', opacity: 0.55}}>
        <Img src={src(id, 'goya')} style={{width: 420, position: 'absolute', left: 470, top: -330, transform: 'rotate(7deg)'}} />
      </div>
      <Bristol id={id} x={520} y={800} w={880} h={520} rot={-2.5} s={lerp(1.08, 1, prog(lt, 0, 0.18, easeOut))}>
        <div style={{position: 'absolute', left: 50, top: 18, fontFamily: GF.label, fontSize: 30, letterSpacing: '0.2em', color: 'rgba(190,40,50,0.85)'}}>EXPÉRIENCE N°2</div>
        {L.map((ln, i) => {
          const show = Math.max(0, Math.min(ln.length, n - used));
          used += ln.length;
          return <div key={i} style={{position: 'absolute', left: 50, top: 150 + i * 90, fontFamily: '"Special Elite", "Courier New", monospace', fontSize: i === 0 ? 50 : 40, color: INK, whiteSpace: 'nowrap'}}>{ln.slice(0, show)}{show < ln.length && show > 0 && Math.floor(lt * 8) % 2 ? '▍' : ''}</div>;
        })}
      </Bristol>
    </>
  );
};

/** la gravure de Goya revient en tuiles ; une tuile manque, comblée par un morceau d'une autre gravure */
export const Reconstruit: React.FC<AnimProps> = ({id, lt, p}) => {
  const fill = Number(p.fill ?? 1.6);
  const C = 4, R = 5, w = 700, h = Math.round((w * 961) / 778), tw = w / C, th = h / R;
  const x0 = 540 - w / 2, y0 = 770 - h / 2;
  const MISS = 1 * C + 1; // la tête du dormeur
  const fk = prog(lt, fill, fill + 0.3, overshoot);
  const glow = prog(lt, fill + 0.1, fill + 0.5);
  return (
    <>
      {Array.from({length: C * R}, (_, i) => {
        const c = i % C, r = Math.floor(i / C);
        const miss = i === MISS;
        const a = 0.05 + rand(i * 5.7) * 0.9;
        const k = miss ? fk : prog(lt, a, a + 0.35, easeOut);
        if (k <= 0) return null;
        const fx = (rand(i * 2.3) - 0.5) * 1400, fy = (rand(i * 9.1) - 0.5) * 1800;
        const x = x0 + c * tw + (1 - k) * fx, y = y0 + r * th + (1 - k) * fy;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: tw + 1, height: th + 1, overflow: 'hidden', transform: `rotate(${(1 - k) * (rand(i) - 0.5) * 90}deg)`, outline: miss ? `5px solid rgba(${G.goldRgb},${glow})` : undefined, boxShadow: miss ? `0 0 40px rgba(${G.goldRgb},${0.8 * glow})` : '0 0 0 1px rgba(14,9,30,0.35)', zIndex: miss ? 2 : 1}}>
            <Img src={src(id, miss ? 'prefet' : 'goya')} style={miss ? {position: 'absolute', left: -260, top: -170, width: 812} : {position: 'absolute', left: -c * tw, top: -r * th, width: w, height: h}} />
          </div>
        );
      })}
      {lt < fill ? <div style={{position: 'absolute', left: x0 + (MISS % C) * tw, top: y0 + Math.floor(MISS / C) * th, width: tw, height: th, border: '4px dashed rgba(255,74,94,0.8)', opacity: prog(lt, 1.0, 1.2)}} /> : null}
    </>
  );
};

/** la photo d'enfance découpée et collée dans la nacelle ; done : composition finale (le « souvenir ») */
export const PhotoTruquee: React.FC<AnimProps> = ({id, lt, p}) => {
  const paste = p.done ? -1 : Number(p.paste ?? 1.0);
  const cut = p.done ? 1 : prog(lt, 0.15, Math.max(0.4, paste - 0.15));
  const fly = p.done ? 1 : prog(lt, paste, paste + 0.35, easeInOut);
  const tape = p.done ? 1 : prog(lt, paste + 0.35, paste + 0.55, easeOut);
  const BW = 600, BH = Math.round((BW * 839) / 658), bx = 570, by = 760;
  const rail = by - BH / 2 + BH * 0.868; // haut de la galerie de la montgolfière
  const cw = 210, ch = (cw * 310) / 250;
  const cx = lerp(250, bx + 6, fly), cy = lerp(1200, rail - ch * 0.42, fly);
  const glow = p.done ? 0.5 + 0.5 * Math.sin(lt * 3) : 0;
  return (
    <>
      <div style={{position: 'absolute', left: bx - BW / 2, top: by - BH / 2, width: BW, filter: p.done ? `drop-shadow(0 0 ${30 + 20 * glow}px rgba(${G.goldRgb},0.55))` : 'drop-shadow(0 22px 34px rgba(0,0,0,0.75))'}}>
        <Img src={src(id, 'montgolfier')} style={{width: '100%', display: 'block'}} />
      </div>
      {/* la photo d'origine, au coin, pointillés de découpe */}
      {!p.done ? (
        <div style={{position: 'absolute', left: 250 - 140, top: 1200 - 220, width: 280, transform: `rotate(-8deg)`, opacity: 1 - prog(lt, paste, paste + 0.2) * 0.6}}>
          <Img src={src(id, 'enfant')} style={{width: '100%', display: 'block', boxShadow: '0 16px 30px rgba(0,0,0,0.7)'}} />
          <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={280} height={444}>
            <path d="M 140 40 C 185 40, 190 110, 175 140 C 225 150, 240 200, 240 330 L 40 330 C 40 200, 55 150, 105 140 C 90 110, 95 40, 140 40 Z" fill="none" stroke="#FF4A5E" strokeWidth={4} strokeDasharray="14 10" pathLength={1000} strokeDashoffset={0} opacity={cut} style={{strokeDasharray: `${1000 * cut} 1000`}} />
          </svg>
        </div>
      ) : null}
      {/* l'enfant découpé : caché sous la rambarde de la nacelle une fois collé */}
      {fly > 0 ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: fly >= 1 ? rail + 4 : 1920, overflow: 'hidden'}}>
          <Img src={src(id, 'enfant_cut')} style={{position: 'absolute', left: cx - cw / 2, top: cy - ch / 2, width: cw, transform: `rotate(${lerp(-8, 0, fly)}deg) scale(${lerp(1.8, 1, fly)})`, filter: 'contrast(1.08) drop-shadow(0 6px 10px rgba(0,0,0,0.6))'}} />
        </div>
      ) : null}
      {/* deux bouts de scotch */}
      {tape > 0 ? [[-62, -28, -24], [58, -8, 30]].map(([dx, dy, r], i) => (
        <div key={i} style={{position: 'absolute', left: bx + dx - 46, top: rail - ch * 0.5 + dy, width: 92, height: 30, background: 'rgba(240,232,210,0.55)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transform: `rotate(${r}deg) scale(${lerp(1.4, 1, tape)})`, opacity: tape, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 2px, rgba(0,0,0,0) 2px 7px)'}} />
      )) : null}
    </>
  );
};

export const SOUVENIRS = {ListeMots, Quiz, Rembobine, Fiche, Reconstruit, PhotoTruquee};
