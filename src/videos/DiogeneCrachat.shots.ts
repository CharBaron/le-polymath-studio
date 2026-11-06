// 45 — Ce fils de pute de Diogène (Diogène Laërce VI ; hook insulte, règle 21). Le spectateur est le riche : le crachat s'écrase sur la vitre
// à la 1re seconde. Monte : le crachat → faussaire, jarre → lampe → poulet → les os → RELANCE esclave qui choisit son maître → Alexandre →
// sa mort, le même jour → ce que tu as peur de perdre → boucle : le visage de Ribera revient au cadre de l'image 0.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const crache = W('craché', 0);
  return [
    // --- hook : il crache sur toi ---
    {t0: 0, bg: 'marble', still: true, anim: {name: 'Crachat', spit: crache + 0.1, hit: crache + 0.52, z0: 1.3, z1: 1.04}},
    {t0: B.h2 - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'couture_plein', w: 1080, full: true, zoom: 0.12}, slam: {text: 'CHEZ LUI', at: 0.08, color: 'gold', y: 520, size: 170}},
    // --- le crachat ---
    {t0: B.regle - 0.04, bg: 'velvet', tr: 'swipe', pic: {name: 'riche', w: 760, y: 800, zoom: 0.14, focus: [0.5, 0.3]}, title: 'LE RICHE'},
    {t0: W('ici', B.regle), bg: 'marble', tr: 'whip', pic: {name: 'couture_salle', w: 880, y: 800, zoom: 0.3, focus: [0.5, 0.75]}, slam: {text: 'ICI, ON NE|CRACHE PAS', at: 0.1, color: 'white', y: 300, size: 110}},
    {t0: B.racle - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Crachat', img: 'ribera_bouche', z0: 1.0, z1: 1.16, rumble: [B.racle, W('crache', B.racle)], spit: W('crache', B.racle) - 0.3, hit: W('crache', B.racle) + 0.12}},
    {t0: B.pire - 0.04, bg: 'velvet', tr: 'flashRed', pic: {name: 'riche', w: 760, y: 800, zoom: 0.5, focus: [0.5, 0.26]}, stamp: {text: 'LE PLUS SALE', at: W('sale', B.pire) + 0.04, y: 1130, size: 96}},
    // --- faussaire, jarre ---
    {t0: B.qui - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'giordano', w: 800, y: 800, zoom: 0.14, focus: [0.62, 0.4]}, pics: [{name: 'coin', w: 340, x: 240, y: 1060, rot: -8, at: 0.9}], title: 'ANCIEN FAUSSAIRE'},
    {t0: B.jarre - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'crayer_dio', w: 860, y: 780, zoom: 0.2, focus: [0.55, 0.45]}, title: 'SA MAISON'},
    // --- la lampe ---
    {t0: B.lampe - 0.04, bg: 'marble', tr: 'shutter', still: true, anim: {name: 'Lanterne'}, slam: {text: 'EN PLEIN JOUR', at: 0.25, color: 'gold', y: 300, size: 110}},
    {t0: B.homme - 0.04, bg: 'marble', tr: 'zoom', pic: {name: 'vieux', w: 800, y: 790, zoom: 0.5, focus: [0.2, 0.74]}, slam: {text: 'UN HOMME', at: 0.5, color: 'gold', y: 300, size: 150}},
    // --- le poulet ---
    {t0: B.platon - 0.04, bg: 'velvet', tr: 'swipe', pic: {name: 'poulet', w: 760, y: 790, zoom: 0.5, focus: [0.3, 0.32]}, title: 'PLATON'},
    {t0: W('bipède', B.platon), bg: 'marble', tr: 'whip', pic: {name: 'poulet', w: 760, y: 790, zoom: 0.25, focus: [0.3, 0.4]}, stamp: {text: 'SANS PLUMES', at: W('plumes', B.platon) + 0.06, y: 1110, size: 96}},
    {t0: B.poulet - 0.04, bg: 'marble', tr: 'slam', still: true, anim: {name: 'Plumes', at: W('poulet', B.poulet) + 0.02}},
    // --- les os ---
    {t0: B.os - 0.04, bg: 'velvet', tr: 'swipe', still: true, anim: {name: 'Os', at: [B.os + 0.2, W('os', B.os) - 0.1, W('chien', B.os) - 0.25, W('chien', B.os) + 0.1]}},
    {t0: B.pisse - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'chiens', w: 880, y: 800, zoom: 0.5, focus: [0.72, 0.6]}, slam: {text: 'IL LEUR PISSE|DESSUS', at: 0.12, color: 'gold', y: 290, size: 120}},
    // --- relance ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'glitch', leak: true, slam: {text: 'MAIS LE|PLUS FOU…', at: 0.08, color: 'gold', y: 640, size: 190}},
    {t0: B.pirates - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'foule_plein', w: 1080, full: true, zoom: 0.2, focus: [0.4, 0.3]}, stamp: {text: 'ESCLAVE', at: W('esclave', B.pirates) + 0.05, y: 1020}},
    {t0: B.metier - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Crachat', z0: 1.1, z1: 1.26}, slam: {text: 'TU SAIS FAIRE|QUOI ?', at: 0.08, color: 'white', y: 300, size: 120}},
    {t0: B.commander - 0.04, bg: 'velvet', tr: 'slam', rays: 'gold', slam: {text: 'COMMANDER', at: 0.04, color: 'gold', y: 680, size: 168}},
    {t0: B.acheteur - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'foule_plein', w: 1080, full: true, zoom: 0.55, focus: [0.75, 0.85]}},
    {t0: W('vendezmoi', B.acheteur), bg: 'velvet', tr: 'zoom', pic: {name: 'riche', w: 760, y: 800, zoom: 0.2, focus: [0.5, 0.3]}, brackets: {x: 260, y: 400, w: 560, h: 560, at: 0.1}},
    {t0: W('besoin', B.acheteur) - 0.3, bg: 'velvet', tr: 'slam', slam: {text: 'UN MAÎTRE', at: W('maitre', B.acheteur) - W('besoin', B.acheteur) + 0.3, color: 'gold', y: 680, size: 190}, rays: 'dark'},
    {t0: B.achete - 0.04, bg: 'marble', tr: 'swipe', pics: [{name: 'coin', w: 420, x: 380, y: 700, rot: -10, at: 0.05}, {name: 'coin', w: 420, x: 680, y: 900, rot: 12, at: 0.28}, {name: 'coin', w: 420, x: 420, y: 1090, rot: 4, at: 0.52}], stamp: {text: 'VENDU', at: B.achete + 0.45, y: 500}},
    {t0: B.enfants - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'vieux', w: 780, y: 790, zoom: 0.22, focus: [0.4, 0.28]}, title: 'LE PRÉCEPTEUR'},
    // --- Alexandre ---
    {t0: B.alex - 0.04, bg: 'velvet', tr: 'spin', leak: true, pic: {name: 'crayer_alex', w: 720, y: 800, zoom: 0.16, focus: [0.5, 0.2]}, title: 'ALEXANDRE', crown: {at: 0.5, y: 215, w: 240}},
    {t0: B.demande - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'rosa', w: 1080, full: true, zoom: 0.2, focus: [0.4, 0.5]}},
    {t0: B.ombre - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Ombre', at: W('poussetoi', B.ombre) + 0.1}, slam: {text: 'POUSSE-TOI', at: 0.14, color: 'gold', y: 300, size: 142}},
    // --- la mort ---
    {t0: B.ans - 0.04, bg: 'velvet', tr: 'flash', num: {text: '90', color: 'gold', label: 'ANS, OU PRESQUE', strobe: true}},
    {t0: B.versions - 0.04, bg: 'velvet', tr: 'swipe', still: true, anim: {name: 'Versions', at: [W('pieuvre', B.versions), W('morsure', B.versions), W('souffle', B.versions)]}, stamp: {text: '?', at: W('sait', B.versions), y: 760, size: 300, rot: 8}},
    {t0: B.jour - 0.04, bg: 'marble', tr: 'shutter', pic: {name: 'crayer_dio', w: 840, y: 780, zoom: 0.5, focus: [0.6, 0.35]}, stamp: {text: 'SOURCE ANTIQUE', at: W('antique', B.jour) + 0.05, y: 1110, size: 84}},
    {t0: B.babylone - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'mortalex', w: 1080, full: true, zoom: 0.16, focus: [0.5, 0.42]}, slam: {text: 'BABYLONE', at: 0.1, color: 'white', y: 290, size: 130}},
    {t0: B.meurt - 0.04, bg: 'velvet', tr: 'flashRed', pic: {name: 'mortalex', w: 1080, full: true, zoom: 0.8, focus: [0.48, 0.44]}, stamp: {text: 'MORT', at: W('meurt', B.meurt) + 0.04, y: 1120}},
    // --- fin ---
    {t0: B.pareil - 0.04, bg: 'velvet', tr: 'swipe', still: true, anim: {name: 'Duo', at: [B.pareil + 0.15, W('jarre', B.pareil) - 0.45], hits: [W('jour', B.pareil)]}, stamp: {text: 'MÊME JOUR', at: W('jour', B.pareil) + 0.04, y: 770, size: 110}},
    {t0: B.toi - 0.04, bg: 'marble', tr: 'whip', still: true, anim: {name: 'Liste', lines: 'TA MAISON|TON FRIC|TON IMAGE', at: [B.toi + 0.7, B.toi + 1.5, B.toi + 2.3]}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'couture_plein', w: 1080, full: true, zoom: 0.35, focus: [0.5, 0.6]}, slam: {text: 'MÉFIE-TOI', at: W('mefietoi', B.loop) - B.loop + 0.08, color: 'gold', y: 520, size: 160}},
    {t0: W('parce', B.loop), bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Crachat', z0: 1.02, z1: 1.3}},
  ];
};
