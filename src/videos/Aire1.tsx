import {makeEpisode} from '../survie/Episode';
import {ACam, carFront, CarSpec, Lot, Walker} from '../survie/aire';
import {AInventory, Boutique, Contact, FirstCapLow, Gobelet, Habitacle} from '../survie/aire2';
import {P, Pose} from '../survie/stick';
import {clamp01, easeInOut, easeOut, lerp, prog, rand} from '../theme';

const hm = (h: number, m: number) => h * 60 + m;
type K = [number, Partial<ACam>][];
/** caméra entre des cadrages clés (adoucie entre chaque clé) */
const camK = (T: number, base: ACam, keys: K): ACam => {
  let i = 0;
  while (i + 1 < keys.length && T >= keys[i + 1][0]) i++;
  const a = {...base, ...keys[i][1]}, nx = keys[i + 1];
  if (!nx || T < keys[i][0]) return a;
  const b = {...base, ...nx[1]}, k = prog(T, keys[i][0], nx[0], easeInOut);
  const L = (u?: number, v?: number) => (u === undefined || v === undefined ? u : lerp(u, v, k));
  return {x: L(a.x, b.x)!, y: L(a.y, b.y)!, z: L(a.z, b.z)!, pitch: L(a.pitch ?? 0, b.pitch ?? 0), F: L(a.F, b.F)!, VX: L(a.VX ?? 540, b.VX ?? 540), VY: L(a.VY ?? 960, b.VY ?? 960), roll: L(a.roll ?? 0, b.roll ?? 0)};
};
/** secousse de caméra qui retombe (impact) */
const jolt = (T: number, at: number, amp = 1) => (T < at ? 0 : Math.exp(-(T - at) * 7) * amp * (rand(Math.floor(T * 30) * 1.7) - 0.5));
/** feux qui meurent en tremblant, puis reviennent d'un coup */
const dying = (T: number, off: number, on = 999) => {
  if (T < off) return 1;
  if (T < off + 0.7) return Math.floor((T - off) * 16) % 3 === 0 ? 0.25 : 1 - (T - off) / 0.9;
  if (T < on) return 0;
  if (T < on + 0.22) return Math.floor((T - on) * 20) % 2 ? 1 : 0.2;
  return 1;
};
const STAND: Pose = {torso: 2, head: 0, aL: -9, aLb: 6, aR: 9, aRb: -6, lL: -4, lLb: 0, lR: 4, lRb: 0};
/** ceux qui attendent : debout, la tête cassée sur le côté, qui oscille à peine */
const wait = (T: number, i: number, tilt: number): Pose => ({...STAND, torso: STAND.torso + Math.sin(T * 0.5 + i) * 1.2, head: tilt + Math.sin(T * 0.7 + i * 2) * 3});
const TILT = [30, -34, 26, -38];
/** toi vu de dos ou de face : bras écartés du buste (sinon la manche noire barre le dos) */
const BACK: Pose = {torso: 0, head: 0, aL: -15, aLb: 5, aR: 15, aRb: -5, lL: -6, lLb: 0, lR: 6, lRb: 0};

// 41 — « AIRE 13 », jour 1 (pilote kairos, 61,6 s). 2 h du matin, une aire d'autoroute dans le brouillard : toutes les voitures
// tournent, personne dedans. Un panneau : règle 1 arrachée, 2 « restez dans la lumière des phares », 3 « ne montez dans aucun
// autre véhicule ». Une voiture cale, celui qui attendait au bout de son faisceau monte au volant et les phares se rallument.
// Ta voiture est éteinte : la règle 1, c'était « ne coupe jamais ton moteur ». A : la Clio (règle 3) ou B : courir dans le noir (règle 2).
export const Aire1 = makeEpisode((B) => {
  const endT = B.fin + 0.35;
  const sedL = (T: number) => dying(T, B.eteint, B.rallume);
  const sedEx = (T: number) => (T < B.cale + 0.35 ? 1 : T < B.rallume ? 0 : 1);
  const sedShake = (T: number) => (T > B.cale && T < B.cale + 0.7 ? 1 - (T - B.cale) / 0.7 : T > B.rallume && T < B.rallume + 0.5 ? 0.8 : 0);
  // ta voiture : arrive à « tu te gares », éteinte, portière qui s'ouvre quand tu sors puis claque
  const mineDoor = (T: number) => prog(T, B.sors - 0.1, B.sors + 0.3, easeOut) * (1 - prog(T, B.clio - 0.5, B.clio - 0.3, easeInOut));
  const ROW = (T: number, o: {mine?: boolean; blur?: Record<string, number>; clioDome?: number} = {}): CarSpec[] => {
    const cars: CarSpec[] = [
      {id: 'van', x: -6, z: 6, color: '#D9DCDD', kind: 'van', lights: 1},
      {id: 'sedan', x: -3, z: 6.2, color: '#22252B', kind: 'sedan', lights: sedL(T), exhaust: sedEx(T), tail: sedL(T), shake: sedShake(T), driver: T > B.monte - 0.1 ? 1 : 0, hole: 1},
      {id: 'clio', x: 0, z: 6.1, color: '#E6E6E1', kind: 'hatch', lights: 1, door: 1, dome: o.clioDome ?? 1},
      {id: 'break', x: 3, z: 5.9, color: '#2F5D8C', kind: 'break', lights: 1},
    ];
    if (o.mine) cars.push({id: 'mine', x: 6, z: 6.0, color: '#1F4A35', kind: 'hatch', lights: 0, tail: 0, exhaust: 0, rim: 0.35, door: mineDoor(T), dome: 0.6, hole: 1});
    return cars.map((c) => ({...c, blur: o.blur?.[c.id]}));
  };
  const endOf = (id: string) => {
    const c = {van: -6, sedan: -3, clio: 0, break: 3}[id as 'van'] ?? 0;
    return c;
  };
  // le sedan : où est celui qui attendait au bout de son faisceau (il avance par bonds dans le noir, puis disparaît dans la voiture)
  const sedZ0 = carFront({id: '', x: 0, z: 6.2, color: '', kind: 'sedan', lights: 1}) + 8.4;
  const sedAtt = (T: number): Walker | null => {
    if (T > B.monte - 0.12) return null;
    const jumps: [number, number][] = [[0, sedZ0], [B.avance, 15.2], [B.avance + 0.55, 12.9], [B.avance + 1.12, 11.3]];
    let z = sedZ0;
    jumps.forEach(([t, zz]) => { if (T >= t) z = zz; });
    const lean = T >= B.avance ? 1 : 0;
    const snap = lerp(TILT[1], -66, prog(T, 1.15, 1.24, easeOut)); // la tête casse d'un coup pendant l'accroche
    return {x: -3 + (z < 14 ? 0.15 : 0), z, p: lean ? {...wait(T, 1, -44), torso: 9, aL: -2, aR: 16} : wait(T, 1, snap), view: 'front'};
  };
  const THEM = (T: number, skip: string[] = []): Walker[] => {
    const out: Walker[] = [];
    (['van', 'sedan', 'clio', 'break'] as const).forEach((id, i) => {
      if (skip.includes(id)) return;
      if (id === 'sedan') { const w = sedAtt(T); if (w) out.push(w); return; }
      out.push({x: endOf(id) + (i % 2 ? 0.2 : -0.15), z: 18.3 + (i % 2) * 0.6, p: wait(T, i, TILT[i]), view: 'front'});
    });
    return out;
  };
  // ce qui marche vers ta voiture (à partir de « quelque chose marche vers elle »)
  const stalker = (T: number): Walker | null => {
    if (T < B.marche - 0.2) return null;
    const z = lerp(17, 9.2, easeOut(clamp01((T - B.marche) / (endT - B.marche))));
    const ph = T * 0.9;
    return {x: 7.1, z, h: 1.95, light: {amb: 0.9, tint: '#1E2838', rim: 'rgba(200,218,255,0.8)'}, p: {...STAND, torso: 6, head: 28 + Math.sin(ph * Math.PI * 2) * 4, lL: -4 + 7 * Math.sin(ph * Math.PI * 2), lR: 4 - 7 * Math.sin(ph * Math.PI * 2), aL: -9 - 3 * Math.sin(ph * Math.PI * 2), aR: 9 + 3 * Math.sin(ph * Math.PI * 2)}, view: 'front', o: prog(T, B.marche - 0.2, B.marche + 0.6)};
  };
  const warm = {amb: 1, tint: '#2A2018', rim: 'rgba(255,214,160,0.42)'};
  const cold = {amb: 0.72, tint: '#1E2838', rim: 'rgba(140,170,220,0.22)'};
  const CLOCK: [number, number, boolean?][] = [[0, hm(2, 0)], [B.gare, hm(2, 1)], [B.pan, hm(2, 2)], [B.r3, hm(2, 3)], [B.klax, hm(2, 4)], [B.ta, hm(2, 5)], [B.choix, hm(2, 6)]];
  return {
    scenes: [
      // 1 · l'accroche : derrière la berline noire, les faisceaux, une silhouette au bout de chacun
      {t0: 0, render: (p) => (
        <Lot uid="s1" T={p.T} cam={camK(p.T, {x: -2.85, y: 2.35, z: -1.4, pitch: 4, F: 2400, VY: 960}, [[0, {}], [B.h1b, {z: 0.5, y: 2.2, F: 2650, VY: 1030}]])} cars={ROW(p.T)} them={THEM(p.T)} />
      )},
      // 2 · plan large : l'aire, la boutique, le pylône, la rangée de voitures
      {t0: B.h1b, tr: 'cut', render: (p) => (
        <Lot uid="s2" T={p.T} cam={camK(p.T, {x: -2.5, y: 10, z: -7, pitch: 25, F: 1250, VY: 1010}, [[B.h1b, {}], [B.h2, {x: -0.8, y: 9.4, z: -6.2}]])} cars={ROW(p.T)} them={THEM(p.T)} />
      )},
      // 3 · habitacle vide, portière ouverte, plafonnier, clé qui balance ; au bout du faisceau, quelqu'un
      {t0: B.h2, tr: 'cut', render: (p) => (
        <Habitacle uid="s3" T={p.T} mode="lot" dash={1} dome={0.55} door att={1} shake={0.4} cam={{x: 540, y: lerp(990, 1010, prog(p.T, B.h2, B.h3)), z: lerp(1.0, 1.1, prog(p.T, B.h2, B.h3))}} />
      )},
      {t0: B.h3, tr: 'cut', render: (p) => (
        <Habitacle uid="s3b" T={p.T} mode="lot" dash={1} dome={0.55} door att={1} shake={0.4} cam={{x: 548, y: lerp(800, 790, prog(p.T, B.h3, B.dil)), z: lerp(2.3, 2.6, prog(p.T, B.h3, B.dil, easeInOut))}} />
      )},
      // 4 · au ras du bitume entre deux pare-chocs : flaques, gaz d'échappement ; titre AIRE 13 · JOUR 1
      {t0: B.dil, tr: 'fade', d: 0.25, render: (p) => (
        <Lot uid="s4" T={p.T} cam={camK(p.T, {x: -1.5, y: 0.75, z: 2.4, pitch: 1, F: 1250, VY: 1060}, [[B.dil, {}], [B.toi, {z: 3.2, x: -1.35}]])} cars={ROW(p.T, {blur: {sedan: 2, clio: 2}})} them={THEM(p.T)} ripples />
      )},
      // 5 · toi au volant sur l'autoroute, puis tu te gares (le parking dans le pare-brise)
      {t0: B.toi, tr: 'black', render: (p) => (
        <Habitacle uid="s5" T={p.T} mode="road" dash={1} toi wipers speed={1} shake={0.6} cam={{x: 520, y: lerp(1000, 990, prog(p.T, B.toi, B.gare)), z: lerp(1.0, 1.08, prog(p.T, B.toi, B.gare))}} />
      )},
      {t0: B.gare, tr: 'cut', render: (p) => (
        <Habitacle uid="s5b" T={p.T} mode="lot" dash={1} toi wipers={p.T < B.gare + 1.2} shake={0.4} att={0} brake={prog(p.T, B.gare, B.gare + 0.25, easeOut) * (1 - prog(p.T, B.gare + 0.25, B.gare + 0.8, easeInOut))} cam={{x: 520, y: 990, z: lerp(1.08, 1.16, prog(p.T, B.gare, B.coupe))}} />
      )},
      // 6 · gros plan : la clé tourne, le tableau de bord meurt
      {t0: B.coupe - 0.05, tr: 'cut', render: (p) => <Contact uid="s6" T={p.T} turn={B.coupe + 0.18} />},
      // 7 · tu sors et tu marches vers la Clio
      {t0: B.sors, tr: 'cut', render: (p) => {
        const k = clamp01((p.T - (B.sors + 0.35)) / (B.cafe - B.sors - 0.35));
        const x = lerp(4.85, 1.25, k), ph = (p.T - B.sors) * 1.05;
        const pose = k > 0 && k < 1 ? walkP(ph) : P.standArmsDown;
        return (
          <Lot uid="s7" T={p.T} cam={camK(p.T, {x: 4.9, y: 1.85, z: 0.6, pitch: 3, F: 1450, VY: 980}, [[B.sors, {}], [B.clio, {x: 2.6, z: 1.0}], [B.cafe, {x: 0.6, z: 1.6}]])} cars={ROW(p.T, {mine: true})} them={THEM(p.T)}
            toi={{x, z: 4.7 - 0.3 * k, p: pose, flip: true, light: x < 4 ? warm : cold}} />
        );
      }},
      // 8 · le gobelet qui fume encore, puis le siège vide
      {t0: B.cafe, tr: 'cut', render: (p) => <Gobelet uid="s8" T={p.T} t0={B.cafe} />},
      {t0: B.pers, tr: 'cut', render: (p) => (
        <Habitacle uid="s8b" T={p.T} mode="lot" dash={1} dome={1} door att={1} shake={0.4} cam={{x: 420, y: lerp(1180, 1160, prog(p.T, B.pers, B.pan)), z: lerp(1.5, 1.62, prog(p.T, B.pers, B.pan))}} />
      )},
      // 9 · la porte de la boutique, le panneau, la règle 1 arrachée
      {t0: B.pan, tr: 'cut', render: (p) => <Boutique uid="s9" T={p.T} t0={B.pan} push={[B.pan + 0.3, B.arr + 0.6]} />},
      // 10 · règle 2 : toi debout dans le faisceau de la Clio, éclairé de dos, ton ombre file vers le fond
      {t0: B.r2, tr: 'cut', render: (p) => (
        <Lot uid="s10" T={p.T} cam={camK(p.T, {x: 2.3, y: 2.3, z: 2.2, pitch: 5, F: 2500, VX: 780, VY: 900}, [[B.r2, {}], [B.bout, {z: 3.2, y: 2.2}]])} cars={ROW(p.T, {mine: true})} them={THEM(p.T)}
          toi={{x: 0.45, z: 12.4, p: {...BACK, head: 4 + Math.sin(p.T * 1.6) * 2}, view: 'back', light: warm, cast: 5.5}} pylon={false} />
      )},
      // 11 · le long du faisceau du break jusqu'au bout, puis la silhouette en gros plan
      {t0: B.bout, tr: 'cut', render: (p) => (
        <Lot uid="s11" T={p.T} cam={camK(p.T, {x: 3.05, y: 1.75, z: 11.2, pitch: 1, F: 1500, VY: 990}, [[B.bout, {}], [B.att - 0.05, {z: 13.4}]])} cars={ROW(p.T, {mine: true})} them={THEM(p.T)} pylon={false} />
      )},
      {t0: B.att, tr: 'cut', render: (p) => (
        <Lot uid="s12" T={p.T} cam={camK(p.T, {x: 3.2, y: 1.75, z: 15.3, pitch: 6, F: 1500, VY: 1000}, [[B.att, {}], [B.r3, {z: 15.6}]])} cars={ROW(p.T, {mine: true})}
          them={THEM(p.T).map((w) => (Math.abs(w.x - 3.2) < 0.5 ? {...w, light: {amb: 1, tint: '#1E2430', rim: 'rgba(240,228,205,0.5)'}, p: {...w.p, aLb: 14, aRb: -14, head: lerp(lerp(TILT[3], -48, prog(p.T, B.att, B.att + 0.8, easeInOut)), -74, prog(p.T, B.att + 0.85, B.att + 0.93, easeOut))}} : w))} pylon={false} />
      )},
      // 12 · règle 3 : toi à la portière ouverte de la Clio, la main sur le montant, il la retire
      {t0: B.r3, tr: 'cut', render: (p) => {
        const reach = prog(p.T, B.r3 + 0.3, B.r3 + 1.1, easeInOut) * (1 - prog(p.T, B.r3t + 0.2, B.r3t + 0.7, easeInOut));
        const pose: Pose = {...P.standArmsDown, torso: 6 * reach, head: 8 + 10 * reach, aR: lerp(8, 82, reach), aRb: lerp(-4, 18, reach), lL: -5, lR: 6};
        return (
          <Lot uid="s13" T={p.T} cam={camK(p.T, {x: -2.2, y: 1.7, z: 3.0, pitch: 3, F: 1500, VX: 470, VY: 960}, [[B.r3, {}], [B.klax, {z: 3.7}]])} cars={ROW(p.T, {mine: true})} them={THEM(p.T)}
            pylon={false} toi={{x: lerp(-1.3, -1.45, 1 - reach), z: 7.75, p: pose, flip: false, light: {amb: 1, tint: '#2A2018', rim: 'rgba(255,196,130,0.45)'}}} />
        );
      }},
      // 13 · un klaxon, la berline cale, ses phares meurent ; au bout, celui qui attendait est dans le noir
      {t0: B.klax, tr: 'cut', render: (p) => (
        <Lot uid="s14" T={p.T} cam={camK(p.T, {x: -3.0, y: 3.4, z: -2.2, pitch: 9, F: 1900, VY: 1000}, [[B.klax, {}], [B.eteint, {z: -1.6}], [B.avance, {z: -0.6}]])} cars={ROW(p.T, {mine: true})} them={THEM(p.T)} />
      )},
      // 14 · il avance par bonds dans le faisceau mort, jusqu'au capot
      {t0: B.avance, tr: 'cut', render: (p) => {
        const j = jolt(p.T, B.avance + 1.12, 0.28) + jolt(p.T, B.avance + 0.55, 0.08);
        const punch = p.T >= B.avance + 1.12 ? 1 : 0;
        return <Lot uid="s15" T={p.T} cam={{x: -2.85 + j, y: 2.15 + j, z: -0.2, pitch: 4, F: punch ? 3900 : 2400, VY: punch ? 1010 : 980}} cars={ROW(p.T, {mine: true})} them={THEM(p.T)} pylon={false} />;
      }},
      // 14 bis · flash blanc d'une fraction de seconde sur le dernier bond (même plan)
      {t0: B.avance + 1.12, tr: 'white', d: 0.1, render: (p) => {
        const j = jolt(p.T, B.avance + 1.12, 0.28);
        return <Lot uid="s15b" T={p.T} cam={{x: -2.85 + j, y: 2.15 + j, z: -0.2, pitch: 4, F: 3900, VY: 1010}} cars={ROW(p.T, {mine: true})} them={THEM(p.T)} pylon={false} />;
      }},
      // 15 · il est au volant (la tête trop haute dans la lunette arrière) ; les phares se rallument, plus personne au bout
      {t0: B.monte, tr: 'black', d: 0.2, render: (p) => (
        <Lot uid="s16" T={p.T} cam={camK(p.T, {x: -2.95, y: 1.55, z: 2.5, pitch: 2, F: 1700, VY: 1000}, [[B.monte, {}], [B.rallume, {z: 2.3}], [B.ta, {z: 0.8, y: 1.9, F: 1900}]])} cars={ROW(p.T, {mine: true})} them={THEM(p.T)} />
      )},
      // 16 · ta voiture, éteinte ; dans le brouillard, quelque chose marche vers elle
      {t0: B.ta, tr: 'cut', render: (p) => <Twist T={p.T} uid="s17" />},
      // 17 · rappel éclair : la clé que tu as tournée en arrivant (rouge)
      {t0: B.r1t, tr: 'cut', render: (p) => <Contact uid="s18" T={p.T} turn={B.r1t + 0.05} red={1} />},
      {t0: B.r1t + 0.5, tr: 'cut', render: (p) => <Twist T={p.T} uid="s18b" />},
      // 18 · le choix : la Clio chaude à gauche, ta voiture noire à droite, ce qui approche
      {t0: B.choix, tr: 'cut', render: (p) => {
        const look = p.T < B.a ? 0 : p.T < B.b ? -1 : 1;
        return (
          <Lot uid="s19" T={p.T} cam={camK(p.T, {x: 3.0, y: 1.25, z: -0.9, pitch: 1, F: 920, VY: 1120}, [[B.choix, {}], [endT, {z: -0.5, F: 960}]])} cars={ROW(p.T, {mine: true})} them={[...THEM(p.T), ...((): Walker[] => { const st = stalker(p.T); return st ? [st] : []; })()]} pylon={false}
            toi={{x: 3.0, z: 1.7, p: {...BACK, torso: look * 3, head: look * 10 + Math.sin(p.T * 2) * 2}, view: 'back', light: {amb: 0.85, tint: '#20242E', rim: 'rgba(255,214,160,0.35)'}}} />
        );
      }},
      // 19 · carte de fin sur l'aire assombrie
      {t0: endT, tr: 'black', render: (p) => (
        <Lot uid="s20" T={p.T} cam={{x: -2.5, y: 10, z: -7, pitch: 25, F: 1250, VY: 1010}} cars={ROW(p.T, {mine: true})} them={THEM(p.T)} expo={0.45} haze={0.5} />
      )},
    ],
    hud: {day: 'JOUR 1', floor: 'AIRE 13 · AUTOROUTE', t0: B.h1 - 0.05, t1: endT - 0.25, clock: CLOCK},
    series: {name: 'AIRE 13', day: 'JOUR 1', y: 290, t0: B.dil + 0.1, t1: B.toi - 0.35},
    pin: {text: 'TOI · 6 H DE ROUTE', x: 386, y: 1000, t0: B.toi + 0.35, t1: B.gare - 0.2},
    rules: [
      {n: 1, title: 'ARRACHÉE', redacted: true, tag: B.arr, at: 999, end: B.r2 - 0.15},
      {n: 2, title: 'RESTE DANS LA LUMIÈRE', tag: B.r2, at: B.r2t, shrink: B.bout, end: B.r3 - 0.15},
      {n: 3, title: 'AUCUNE AUTRE VOITURE', tag: B.r3, at: B.r3t, shrink: B.klax - 0.6, end: B.klax - 0.1},
      {n: 1, title: 'NE COUPE JAMAIS TON MOTEUR', redacted: true, tag: B.regle, at: B.r1t, end: B.choix - 0.15},
    ],
    choice: {q: 'TU BRISES QUELLE RÈGLE ?', a: 'A · JE MONTE DANS LA CLIO', b: 'B · JE COURS À MA VOITURE', tq: B.choix - 0.05, ta: B.a, tb: B.b, tc: B.b + 0.4, t1: endT - 0.45},
    end: {name: 'AIRE 13', day: 1, time0: '02:06', time1: '02:07', cta: 'ABONNE-TOI POUR LE JOUR 2', t0: endT, flip: B.flip},
    hideCaps: [[endT, 999]],
    extra: (
      <>
        <FirstCapLow text="IMAGINE…" until={B.h - 0.03} />
        <AInventory t0={B.toi + 0.2} t1={endT - 0.25} fuel={[[0, 4], [B.gare, 3]]} batt={[[0, 23], [B.pan, 22], [B.choix, 21]]} motor={[[0, 1], [B.coupe + 0.42, 0]]} alarm={[B.regle, B.choix]} />
      </>
    ),
  };

  // le retournement : derrière toi, ta voiture noire au bout de la rangée, ce qui marche vers elle
  function Twist({T, uid}: {T: number; uid: string}) {
    const quiet = prog(T, B.regle - 0.4, B.regle, easeInOut) * (1 - prog(T, B.r1t + 0.5, B.r1t + 0.9));
    const st = stalker(T);
    const cam = camK(T, {x: 4.6, y: 1.75, z: -0.4, pitch: 2, F: 1300, VY: 960}, [[B.ta, {}], [B.marche, {z: 0.2, F: 1380}], [B.choix, {z: 0.9, F: 1500}]]);
    return (
      <Lot uid={uid} T={T} cam={cam} cars={ROW(T, {mine: true})} them={[...THEM(T), ...(st ? [st] : [])]} expo={1 - 0.15 * quiet}
        toi={{x: 4.25, z: 2.9, p: {...BACK, head: 6 + Math.sin(T * 2.4) * 2, torso: 2}, view: 'back', light: cold}} pylon={false} />
    );
  }
});

/** marche (vue de profil) avec léger rebond */
const walkP = (ph: number): Pose => {
  const a = ph * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
  return {torso: 4, head: 2, lL: 22 * s, lLb: -Math.max(0, -c) * 30, lR: -22 * s, lRb: -Math.max(0, c) * 30, aL: -6 - 18 * s, aLb: 12, aR: 6 + 18 * s, aRb: -12};
};
