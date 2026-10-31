// Animations sur mesure de la vidéo 36 (Jeremy Bentham, l'auto-icône), style cabinet (acajou, velours pourpre).
// Habille : le squelette d'Albinus, puis la vraie photo de l'auto-icône le recouvre de bas en haut (les vêtements), au mot `at`.
// Tetes : la photo de l'auto-icône ; mode 'cire' = la tête entourée « CIRE » ; mode 'jambes' = gros plan entre les pieds,
//   cercle en pointillés « LA VRAIE TÊTE » (elle y a reposé pendant des années).
// Rancon : lettre de rançon en lettres découpées (« LA TÊTE / CONTRE / 100 £ »), une lettre toutes les 0,05 s.
import React from 'react';
import {Img} from 'remotion';
import {easeOut, lerp, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {InkStroke, Order, Paper, RED, src} from './tests';

const SHADOW = 'drop-shadow(0 22px 34px rgba(0,0,0,0.75))';

export const Habille: React.FC<AnimProps> = ({id, t, lt, p}) => {
  const at = Number(p.at ?? 1);
  const k = prog(t, at, at + 0.9, (x) => x * x * (3 - 2 * x));
  const H = 820, sw = Math.round((H * 618) / 874), iw = Math.round((H * 638) / 1101), top = 800 - H / 2;
  const edge = top + H * (1 - k);
  return (
    <>
      <div style={{position: 'absolute', left: 540 - sw / 2, top, width: sw, height: H, filter: SHADOW, opacity: 1 - 0.85 * k, transform: `scale(${1 + 0.02 * lt})`}}>
        <Img src={src(id, 'squelette')} style={{width: sw, height: H}} />
      </div>
      <div style={{position: 'absolute', left: 540 - iw / 2, top, width: iw, height: H, filter: SHADOW, clipPath: `inset(${(1 - k) * 100}% 0 0 0)`}}>
        <Img src={src(id, 'icone')} style={{width: iw, height: H}} />
      </div>
      {k > 0 && k < 1 ? <div style={{position: 'absolute', left: 540 - iw / 2 - 40, width: iw + 80, top: edge - 3, height: 6, background: G.goldHi, boxShadow: `0 0 24px 6px rgba(${G.goldRgb},0.8)`, borderRadius: 3}} /> : null}
    </>
  );
};

// repères dans la carte « icone » (fractions de la carte) : visage et sol entre les pieds
const FACE = {x: 0.45, y: 0.17}, FLOOR = {x: 0.53, y: 0.845};
const IW = 560, IH = Math.round((IW * 1101) / 638), IX = 540 - IW / 2, IY = 840 - IH / 2;

export const Tetes: React.FC<AnimProps> = ({id, lt, p}) => {
  const jambes = p.mode === 'jambes';
  const z = jambes ? prog(lt, 0, 0.5, easeOut) : 0;
  const s = 1 + 0.9 * z;
  const fx = IX + FLOOR.x * IW, fy = IY + FLOOR.y * IH;
  const hx = IX + FACE.x * IW, hy = IY + FACE.y * IH;
  const ring = prog(lt, jambes ? 0.45 : 0.1, jambes ? 0.95 : 0.55, easeOut);
  const circle = (cx: number, cy: number, r: number) => `M ${cx} ${cy - r} A ${r} ${r * 0.85} 0 1 1 ${cx - 0.01} ${cy - r}`;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${fx}px ${fy}px`, transform: `translate(${(540 - fx) * z}px, ${(900 - fy) * z}px) scale(${s})`}}>
        <div style={{position: 'absolute', left: IX, top: IY, width: IW, height: IH, filter: SHADOW}}>
          <Img src={src(id, 'icone')} style={{width: IW, height: IH}} />
        </div>
        {jambes ? (
          <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
            <ellipse cx={fx} cy={fy - 10} rx={70} ry={48} fill={`rgba(${G.goldRgb},${0.12 * ring})`} stroke={G.goldHi} strokeWidth={5 / s} strokeDasharray={`${14 / s} ${10 / s}`} opacity={ring} />
          </svg>
        ) : (
          <InkStroke d={circle(hx, hy + 10, 120)} k={ring} w={9} />
        )}
      </div>
      {jambes ? <Order text="LA VRAIE TÊTE|ÉTAIT LÀ" k={prog(lt, 0.7, 1.0, easeOut)} y={330} size={58} color={G.goldHi} /> : <Order text="CIRE" k={prog(lt, 0.45, 0.7, easeOut)} y={230} size={80} color={RED} />}
    </>
  );
};

const FONTS = [GF.serif, GF.sans, GF.label, 'Courier New, monospace', 'Georgia, serif'];
const PAPERS = ['#F3EEE2', '#FFFFFF', '#E9DFC6', '#DCD3BE', '#F7E7A6', '#1C1A18'];

export const Rancon: React.FC<AnimProps> = ({id, lt}) => {
  const lines = ['LA TÊTE', 'CONTRE', '100 £'];
  let n = 0;
  const k = prog(lt, 0, 0.3, easeOut);
  return (
    <Paper id={id} x={540} y={780} w={820} h={640} rot={lerp(-6, -2, k)} s={lerp(0.85, 1, k)} o={k}>
      {lines.map((ln, li) => (
        <div key={li} style={{position: 'absolute', left: 0, right: 0, top: 70 + li * 185, display: 'flex', justifyContent: 'center', gap: 6}}>
          {[...ln].map((ch, ci) => {
            const i = n++;
            if (ch === ' ') return <div key={ci} style={{width: 36}} />;
            const show = prog(lt, 0.3 + i * 0.05, 0.36 + i * 0.05, easeOut);
            const bg = PAPERS[Math.floor(rand(i * 7.1) * PAPERS.length)];
            const dark = bg === '#1C1A18';
            const big = li === 2;
            return (
              <div key={ci} style={{opacity: show, transform: `rotate(${(rand(i * 3.3) - 0.5) * 14}deg) scale(${lerp(1.6, 1, show)}) translateY(${(rand(i * 5.9) - 0.5) * 18}px)`, background: bg, padding: '4px 10px', boxShadow: '2px 3px 0 rgba(0,0,0,0.35)', fontFamily: FONTS[Math.floor(rand(i * 1.7) * FONTS.length)], fontWeight: rand(i * 2.9) > 0.4 ? 900 : 400, fontStyle: rand(i * 4.1) > 0.7 ? 'italic' : 'normal', fontSize: (big ? 132 : 100) * (0.85 + 0.3 * rand(i * 8.3)), lineHeight: 1, color: big ? RED : dark ? '#F3EEE2' : '#16120E'}}>
                {ch}
              </div>
            );
          })}
        </div>
      ))}
    </Paper>
  );
};

export const BENTHAM = {Habille, Tetes, Rancon};
