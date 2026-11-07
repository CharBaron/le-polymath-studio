// 46 — Cet enculé de biceps (Basmajian & Latif 1957, Ikai & Steinhaus 1961, Polatin 1939, Ogawa & Ui 1997, Ranganathan 2004).
// Hook insulte (règle 21) sur le bras écorché qui pompe, puis un test sur le bras qui tient le téléphone (mou → dur), le brachial caché,
// la force retenue (coup de feu, hypnose, décharge), RELANCE : le frein te protège (colonnes, humérus), il se desserre en imaginant, boucle.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const pump = {name: 'Bras', pump: true, flex: [0, 0.78], z: 0.03};
  return [
    // --- hook : le bras qui pompe, ment ---
    {t0: 0, bg: 'white', still: true, anim: pump, stamp: {text: 'MENTEUR', at: W('ment', 0) + 0.05, y: 1250, size: 118}},
    {t0: B.h2 - 0.04, bg: 'white', tr: 'slam', still: true, anim: {name: 'Bras', flex: [B.h2, 0.5, B.h2 + 0.6, 0.95, B.h2 + 1.2, 0.5], off: [B.h2, 0.9], z: 0.08}, stamp: {text: 'PAS LUI', at: W('pas', B.h2) + 0.06, y: 1250, size: 118}},
    // --- le test, sur le bras qui tient le téléphone ---
    {t0: B.tel - 0.04, bg: 'white', tr: 'swipe', still: true, anim: {name: 'Bras', phone: true, flex: [B.tel, 0.62, B.tel + 0.6, 0.82], z: 0.04}, slam: {text: 'CE BRAS-LÀ', at: 0.5, color: 'red', y: 1215, size: 96}},
    {t0: B.touche - 0.04, bg: 'white', tr: 'zoom', still: true, anim: {name: 'Bras', phone: true, flex: [B.touche, 0.82], ring: B.touche + 0.1, wob: B.mou, z: 0.45, ox: 34, oy: 46}},
    {t0: B.mou - 0.04, bg: 'white', tr: 'zoom', still: true, anim: {name: 'Bras', phone: true, flex: [B.mou, 0.82], wob: B.mou, ring: B.mou, z: 0.25, ox: 34, oy: 50}, slam: {text: 'MOU', at: 0.2, color: 'red', y: 1200, size: 170}},
    {t0: B.tourne - 0.04, bg: 'white', tr: 'whip', still: true, anim: {name: 'Bras', phone: true, arrow: true, flex: [B.tourne, 0.82], twist: [B.tourne + 0.6, 0, B.dur, 1.0], hard: [B.tourne + 1.6, 0, B.dur + 0.1, 0.5], z: 0.3, ox: 52, oy: 30}},
    {t0: W('tournevis', B.tourne) - 0.1, bg: 'white', tr: 'zoom', still: true, anim: {name: 'Vis'}},
    {t0: B.dur - 0.04, bg: 'white', tr: 'slam', still: true, anim: {name: 'Bras', flex: [B.dur, 0.82, B.dur + 0.3, 0.92], hard: [B.dur, 0.3, B.dur + 0.18, 1], twist: [B.dur, 1], z: 0.1, hits: [B.dur + 0.1]}, slam: {text: 'DUR', at: 0.14, color: 'red', y: 1190, size: 190}},
    // --- le brachial ---
    {t0: B.brachial - 0.04, bg: 'white', tr: 'swipe', still: true, anim: {name: 'Bras', flex: [B.brachial, 0.86], peel: [W('dessous', B.brachial) - 0.2, 0, W('dessous', B.brachial) + 0.5, 1], tag: 'LE BRACHIAL', tagAt: W('brachial', B.brachial) - 0.1, tx: 380, ty: 600, ax: 560, ay: 1060, z: 0.06}},
    {t0: B.eteint - 0.04, bg: 'white', tr: 'zoom', still: true, anim: {name: 'Bras', flex: [B.eteint, 0.45, B.eteint + 1.1, 0.92, B.eteint + 2.2, 0.45], off: [B.eteint, 1], z: 0.05}, stamp: {text: 'ÉTEINT', at: W('eteint', B.eteint) + 0.05, y: 1250, size: 120}},
    {t0: B.visse - 0.04, bg: 'white', tr: 'whip', still: true, anim: {name: 'Vis'}, slam: {text: 'VISSER', at: 0.7, color: 'red', y: 460, size: 170}},
    // --- la force retenue ---
    {t0: B.force - 0.04, bg: 'velvet', tr: 'swipe', pic: {name: 'vesale_plein', w: 1080, full: true, zoom: 0.2, focus: [0.3, 0.42]}, slam: {text: 'SA FORCE', at: W('force', B.force) - B.force + 0.06, color: 'red', y: 460, size: 170}},
    {t0: B.chicago - 0.04, bg: 'white', tr: 'shutter', still: true, anim: {name: 'Bras', pump: true, flex: [B.chicago, 0.7], hard: [B.chicago, 0.8], z: 0.12}, slam: {text: '1961', at: 0.05, color: 'red', y: 1210, size: 150}},
    {t0: W('forces', B.chicago) - 0.5, bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Jauge', val: [W('forces', B.chicago) - 0.5, 90, W('forces', B.chicago) + 0.6, 100]}},
    {t0: B.pan - 0.04, bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Jauge', val: [B.pan, 100, W('feu', B.pan) + 0.05, 100, W('feu', B.pan) + 0.9, 107], shot: W('feu', B.pan) + 0.02}, topLabel: 'SANS PRÉVENIR'},
    {t0: B.monte - 0.04, bg: 'velvet', still: true, anim: {name: 'Jauge', val: [B.monte, 107, B.monte + 0.8, 112]}, topLabel: 'ELLE MONTE'},
    {t0: B.hypnose - 0.04, bg: 'white', tr: 'whip', pic: {name: 'salpe', w: 800, y: 780, zoom: 0.34, focus: [0.5, 0.4]}, title: 'HYPNOSE'},
    {t0: W('jusqua', B.hypnose) , bg: 'velvet', tr: 'flash', still: true, anim: {name: 'Jauge', val: [W('jusqua', B.hypnose), 112, W('vingtsix', B.hypnose) + 0.2, 126]}, topLabel: 'JUSQU’À +26 %'},
    {t0: B.cerveau - 0.04, bg: 'white', tr: 'slam', pic: {name: 'cerveau', w: 860, y: 760, zoom: 0.14, focus: [0.42, 0.5]}, stamp: {text: 'FREIN', at: W('gardait', B.cerveau) + 0.04, y: 1130}},
    {t0: B.decharge - 0.04, bg: 'velvet', tr: 'glitch', still: true, anim: {name: 'Eclair', at: [W('decharge', B.decharge), W('decharge', B.decharge) + 0.34, W('effort', B.decharge), W('revele', B.decharge), W('cachee', B.decharge), W('cachee', B.decharge) + 0.3]}, slam: {text: 'ET IL EN RESTE', at: W('revele', B.decharge) - B.decharge, color: 'gold', y: 460, size: 112}},
    // --- relance ---
    {t0: W('mais', B.relance - 0.6), bg: 'velvet', tr: 'glitch', leak: true, still: true, slam: {text: 'MAIS LE|PLUS FOU…', at: 0.08, color: 'gold', y: 640, size: 180}},
    {t0: B.protege - 0.04, bg: 'white', tr: 'swipe', pic: {name: 'dos_plein', w: 1080, full: true, zoom: 0.18, focus: [0.5, 0.35]}, slam: {text: 'DE TOI-MÊME', at: W('toimeme', B.protege) - B.protege + 0.06, color: 'red', y: 460, size: 132}},
    {t0: B.an39 - 0.04, bg: 'white', tr: 'flash', num: {text: '1939', color: 'red', label: 'CONVULSIONS', strobe: true}},
    {t0: W('patients', B.an39) - 0.1, bg: 'velvet', tr: 'whip', pic: {name: 'salpe', w: 800, y: 780, zoom: 0.4, focus: [0.6, 0.4]}},
    {t0: W('aucun', B.an39) - 0.3, bg: 'white', tr: 'zoom', still: true, anim: {name: 'Crack', img: 'colonne', w: 330, h: 1086, y: 760, fy: 0.62, at: B.frac + 2.0}, slam: {text: 'PLUS DE FREIN', at: 0.1, color: 'red', y: 460, size: 110}},
    {t0: B.frac - 0.04, bg: 'white', tr: 'flashRed', num: {text: '43 %', color: 'red', label: 'COLONNE FRACTURÉE', strobe: true}},
    {t0: W('fracturee', B.frac) + 0.1, bg: 'white', tr: 'slam', still: true, anim: {name: 'Crack', img: 'colonne', w: 330, h: 1086, y: 760, fy: 0.62, at: W('fracturee', B.frac) + 0.25}},
    {t0: B.leurs - 0.04, bg: 'white', tr: 'whip', pic: {name: 'vesale_plein', w: 1080, full: true, zoom: 0.6, focus: [0.5, 0.45]}, stamp: {text: 'LEURS MUSCLES', at: W('muscles', B.leurs) + 0.04, y: 1120, size: 92}},
    {t0: B.bdf - 0.04, bg: 'velvet', tr: 'swipe', pic: {name: 'szabo', w: 880, y: 780, zoom: 0.3, focus: [0.42, 0.52]}, title: 'BRAS DE FER'},
    {t0: W('lhumerus', B.bdf) - 0.14, bg: 'white', tr: 'flashRed', still: true, anim: {name: 'Crack', img: 'humerus', w: 300, h: 1123, y: 750, fy: 0.5, at: W('lhumerus', B.bdf) + 0.3}},
    {t0: B.personne - 0.04, bg: 'velvet', tr: 'zoom', pic: {name: 'szabo', w: 880, y: 780, zoom: 0.7, focus: [0.4, 0.5]}, slam: {text: 'PERSONNE', at: W('personne', B.personne) - B.personne + 0.05, color: 'red', y: 1110, size: 140}},
    // --- l'esprit ---
    {t0: B.serrer - 0.04, bg: 'white', tr: 'swipe', pic: {name: 'cerveau', w: 860, y: 760, zoom: 0.4, focus: [0.42, 0.5]}, slam: {text: 'DESSERRE-LE', at: W('desserrer', B.serrer) - B.serrer + 0.04, color: 'red', y: 460, size: 118}},
    {t0: B.clev - 0.04, bg: 'white', tr: 'flash', num: {text: '2004', color: 'red', label: '15 MIN PAR JOUR'}},
    {t0: B.imagine - 0.04, bg: 'white', tr: 'zoom', still: true, anim: {name: 'Bras', flex: [B.imagine, 0.55], ghost: [B.imagine], z: 0.06}, slam: {text: 'IMAGINER', at: W('imaginent', B.imagine) - B.imagine + 0.05, color: 'red', y: 460, size: 138}},
    {t0: B.bouge - 0.04, bg: 'white', tr: 'slam', still: true, anim: {name: 'Bras', flex: [B.bouge, 0.55], ghost: [B.bouge], z: 0.1}, slam: {text: 'SANS BOUGER', at: W('bouger', B.bouge) - B.bouge + 0.03, color: 'red', y: 1220, size: 110}},
    {t0: B.pct - 0.04, bg: 'white', tr: 'flashRed', num: {text: '+13,5 %', color: 'red', label: 'DE FORCE, EN 12 SEMAINES', strobe: true}},
    {t0: W('force', B.pct) - 0.1, bg: 'white', tr: 'zoom', still: true, anim: {name: 'Bras', flex: [B.pct, 0.55], ghost: [B.pct], hard: [B.pct, 0.9], z: 0.1}, slam: {text: '+13,5 %', at: 0.05, color: 'red', y: 1220, size: 130}},
    {t0: B.gramme - 0.04, bg: 'white', tr: 'whip', still: true, anim: {name: 'Bras', flex: [B.gramme, 0.55, B.gramme + 1.4, 0.7], hard: [B.gramme, 0.8], z: 0.08, hits: [W('muscu', B.gramme), W('gramme', B.gramme)]}, slam: {text: '0 GRAMME', at: W('gramme', B.gramme) - B.gramme + 0.05, color: 'red', y: 460, size: 160}},
    // --- fin ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'swipe', pic: {name: 'vesale_tete', w: 1080, full: true, zoom: 0.26, focus: [0.5, 0.3]}, slam: {text: 'DANS TA TÊTE', at: W('tete', B.toi) - B.toi + 0.06, color: 'gold', y: 460, size: 128}},
    {t0: B.loop - 0.04, bg: 'white', tr: 'slam', still: true, anim: pump},
  ];
};
