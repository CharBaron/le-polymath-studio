// 33 — La proposition indécente (le jeu de l'ultimatum). Montage v3.2, style or (habillage « TEST N°6 »).
// Recette du gorille : le partage à la 1re image (10 billets, 90 / 10, ACCEPTER / REFUSER, 3-2-1), « t'as refusé »
// (les billets brûlent), Güth 1982, la théorie contre la vraie vie, le concept, relance, Princeton 2003 (l'insula
// du dégoût), les chimpanzés qui acceptent tout, boucle. Budget : 2 mots qui claquent, 3 tampons, 2 stroboscopes.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const cd = [W('trois', B.stop - 0.2), W('deux', B.stop + 0.5), W('un', B.stop + 1.2)];
  const test = {name: 'Partage', show: -0.3, split: W('garde', B.cent), btn: B.regle - 0.04, acc: W('acceptes', B.regle), ref: W('refuses', B.regle + 1), ask: B.choix - 0.04, cd};
  return [
    // --- le test : le partage ---
    {t0: 0, bg: 'marble', still: true, anim: test},
    {t0: B.refuse - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Partage', reveal: true, burn: W('jeter', B.jete)}},
    {t0: B.juste - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'couple', w: 880, zoom: 0.25, focus: [0.62, 0.35]}},
    // --- Güth, 1982 ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1982', color: 'ink', label: 'WERNER GÜTH · COLOGNE', strobe: true}},
    {t0: W('invente', B.an + 1), bg: 'marble', tr: 'swipe', pic: {name: 'preteur', w: 820, zoom: 0.14, focus: [0.3, 0.5]}},
    {t0: B.theorie - 0.04, bg: 'velvet', tr: 'slam', balance: {tilt: [0, -16], left: '10 €', right: '0 €'}},
    {t0: W('dix', B.theorie + 2), bg: 'marble', tr: 'whip', pic: {name: 'pieces', w: 880, zoom: 0.16, focus: [0.3, 0.5]}},
    {t0: B.vrai - 0.04, bg: 'velvet', tr: 'flashRed', num: {text: '30 %', color: 'gold', label: 'EN DESSOUS : SOUVENT REFUSÉ'}},
    {t0: W('refusées', B.vrai), bg: 'marble', tr: 'swipe', pic: {name: 'couple_main', w: 760, zoom: 0.12}, stamp: {text: 'REFUSÉ', at: W('refusées', B.vrai) + 0.15, size: 130, y: 1150, rot: -7}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'L’AVERSION|À L’INJUSTICE', sub: '« inequity aversion » · Fehr & Schmidt, 1999'}},
    {t0: B.filtre - 0.04, bg: 'velvet', tr: 'zoom', pic: {name: 'couple', w: 880, zoom: 0.2, focus: [0.35, 0.4]}, slam: {text: 'TE FAIRE AVOIR', at: W('avoir', B.filtre) - B.filtre + 0.04, color: 'gold', y: 430, size: 92}},
    // --- relance ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'preteur_plein', w: 1080, full: true, zoom: 0.14, focus: [0.5, 0.35]}},
    // --- Princeton, 2003 : l'insula ---
    {t0: B.scanner - 0.04, bg: 'white', tr: 'invert', num: {text: '2003', color: 'ink', label: 'PRINCETON · IRM', strobe: true}},
    {t0: W('scanner', B.scanner + 1), bg: 'marble', tr: 'swipe', pic: {name: 'insula', w: 880, zoom: 0.12}},
    {t0: B.insula - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Insula', glow: W('allume', B.insula) - B.insula + 0.04}},
    {t0: B.pourri - 0.04, bg: 'velvet', tr: 'flashRed', pic: {name: 'pieces', w: 880, zoom: 0.3, focus: [0.75, 0.5]}, stamp: {text: 'POURRI', at: W('pourrie', B.pourri) + 0.04, size: 130, y: 1150, rot: 6}},
    // --- les chimpanzés ---
    {t0: B.chimp - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'chimp', w: 640, zoom: 0.1}},
    {t0: B.tout - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'chimp_zoom', w: 640, zoom: 0.14}, stamp: {text: 'ACCEPTE TOUT', at: W('tout', B.tout) + 0.04, size: 96, y: 1100, rot: -5}},
    {t0: B.rationnel - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'preteur', w: 820, zoom: 0.3, focus: [0.3, 0.3]}},
    {t0: B.pas - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'chimp_zoom', w: 640, zoom: 0.25, focus: [0.5, 0.35]}, slam: {text: 'PAS L’HOMME', at: W('homme', B.pas) - B.pas + 0.04, color: 'red', y: 430}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'couple', w: 880, zoom: 0.35, focus: [0.25, 0.85]}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {...test, freezeAt: 0}},
  ];
};
