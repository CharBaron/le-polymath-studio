// 34 — La machine à plaisir (la machine à expériences de Nozick). Montage v3.2, style caverne (accent pourpre, « TEST N°7 »).
// Recette du gorille : la proposition à la 1re image (l'homme branché devant le Jardin des délices), JE ME BRANCHE / NON,
// « t'as dit non », Nozick 1974, le concept, relance, De Brigard 2010 (tu es déjà branché : 46 %, et 87 % si le réel
// est une prison), la caverne de Platon, « ce téléphone », boucle. Budget : 2 mots qui claquent, 2 tampons, 2 stroboscopes.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const cd = [W('trois', B.stop - 0.2), W('deux', B.stop + 0.4), W('un', B.stop + 0.9)];
  const test = {name: 'Branche', lines: 'PLAISIR ILLIMITÉ|TOUTE TA VIE|L’AMOUR · LA GLOIRE · LE SUCCÈS|RIEN NE SERA VRAI', at: [0.3, B.toute, B.reves, W('rien', B.faux)], ask: B.choix - 0.04, cd};
  return [
    // --- le test : la machine ---
    {t0: 0, bg: 'marble', still: true, anim: test},
    {t0: B.non - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Branche', reveal: true}},
    {t0: B.fier - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'duchenne_zoom', w: 700, zoom: 0.2, focus: [0.5, 0.35]}},
    // --- Nozick, 1974 ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1974', color: 'ink', label: 'ROBERT NOZICK', strobe: true}},
    {t0: W('philosophe', B.an), bg: 'marble', tr: 'swipe', pic: {name: 'caverne_ombres', w: 760, zoom: 0.14, focus: [0.5, 0.4]}},
    {t0: W('invente', B.an + 1), bg: 'velvet', tr: 'whip', pic: {name: 'bosch_zoom', w: 860, zoom: 0.2, focus: [0.3, 0.5]}},
    {t0: B.preuve - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'duchenne', w: 640, zoom: 0.12, focus: [0.5, 0.4]}},
    {t0: B.reel - 0.04, bg: 'velvet', tr: 'slam', balance: {tilt: [0, 14], left: 'JOIE', right: 'VRAI'}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LA MACHINE|À EXPÉRIENCES', sub: '« experience machine » · Robert Nozick, 1974'}},
    {t0: B.filtre - 0.04, bg: 'marble', tr: 'zoom', pic: {name: 'caverne', w: 880, zoom: 0.16, focus: [0.6, 0.4]}, slam: {text: 'DU RÉEL', at: W('réel', B.filtre + 1) - B.filtre + 0.04, color: 'gold', y: 450}},
    // --- relance ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'caverne_plein', w: 1080, full: true, zoom: 0.14, focus: [0.5, 0.4]}},
    // --- De Brigard, 2010 ---
    {t0: B.an2 - 0.04, bg: 'white', tr: 'invert', num: {text: '2010', color: 'ink', label: 'FELIPE DE BRIGARD', strobe: true}},
    {t0: W('felipe', B.an2), bg: 'marble', tr: 'swipe', pic: {name: 'tel', w: 640, zoom: 0.12}},
    {t0: W('étudiants', B.an2 + 1), bg: 'velvet', tr: 'whip', pic: {name: 'caverne', w: 880, zoom: 0.25, focus: [0.6, 0.6]}},
    {t0: B.deja - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Retour', mode: 'q', veux: B.veux}},
    {t0: B.moitie - 0.04, bg: 'velvet', tr: 'slam', still: true, anim: {name: 'Retour', mode: 'bars'}},
    {t0: B.prison - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'prison_plein', w: 1080, full: true, zoom: 0.14, focus: [0.5, 0.4]}, stamp: {text: 'PRISON', at: W('prison', B.prison) + 0.04, size: 140, y: 1100, rot: -6}},
    {t0: B.p87 - 0.04, bg: 'velvet', tr: 'flashRed', still: true, anim: {name: 'Retour', mode: 'bars', prison: true}},
    {t0: B.statu - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'caverne_ombres', w: 760, zoom: 0.2, focus: [0.4, 0.6]}},
    {t0: W('garde', B.statu), bg: 'velvet', tr: 'whip', pic: {name: 'caverne', w: 880, zoom: 0.3, focus: [0.75, 0.45]}, slam: {text: 'DÉJÀ', at: W('déjà', B.statu + 1) - W('garde', B.statu) + 0.04, color: 'red', y: 450}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'tel', w: 640, zoom: 0.3, focus: [0.5, 0.25]}, stamp: {text: 'DÉJÀ BRANCHÉ ?', at: W('branché', B.toi + 1) + 0.04, size: 90, y: 1120, rot: -5}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {...test, freezeAt: 0}},
  ];
};
