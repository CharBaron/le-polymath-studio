// 22 — Ératosthène mesure la Terre (v. 240 av. J.-C.). Montage v3.2, style atlas céleste (or sur bleu nuit, Cormorant).
// Hook à double sens (« il lui a suffi d'un bâton… et d'un trou »). Démonstration en trois étapes. Animations : Terre (soleil de
// Flammarion, puits, obélisque, ombre, angle, ×50, circonférence, zoom), Plate, Colomb. 2 stroboscopes.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const done = {rays: -9, well: -9, stick: -9, shadow: -9, angle: -9}; // schéma déjà tracé
  return [
    // --- hook ---
    {t0: 0, bg: 'marble', still: true, anim: {name: 'Terre', ...done}},
    {t0: W('terre', 0), bg: 'marble', tr: 'zoom', pic: {name: 'strozzi_plein', w: 1080, full: true, focus: [0.4, 0.3], zoom: 0.14}},
    {t0: W('suffi', 0), bg: 'marble', tr: 'glitch', pic: {name: 'flammarion_plein', w: 1080, full: true, focus: [0.3, 0.55], zoom: 0.2}},
    {t0: W('bâton…', 0), bg: 'marble', tr: 'slam', still: true, anim: {name: 'Terre', rays: -9, zIn: -9, stick: 0.05}},
    {t0: W('trou', 0), bg: 'marble', tr: 'flash', still: true, anim: {name: 'Terre', rays: -9, well: 0.05}},
    {t0: W('tombé', 0), bg: 'marble', tr: 'swipe', pic: {name: 'ptolemaic', w: 760, zoom: 0.12}, stamp: {text: 'PRESQUE JUSTE', at: W('juste', 0) + 0.05, size: 90}},
    // --- le puits de Syène ---
    {t0: B.biblio - 0.04, bg: 'white', tr: 'invert', num: {text: '2 200', color: 'ink', label: 'ANS', strobe: true}},
    {t0: W('ératosthène', B.biblio), bg: 'marble', tr: 'whip', pic: {name: 'strozzi', w: 860, zoom: 0.12}},
    {t0: W('bibliothèque', B.biblio), bg: 'marble', tr: 'swipe', pic: {name: 'scholars', w: 600, focus: [0.5, 0.4]}},
    {t0: W('d’alexandrie', B.biblio), bg: 'marble', tr: 'zoom', pic: {name: 'pharos', w: 880, focus: [0.25, 0.4], zoom: 0.2}},
    {t0: B.lit - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'pharos2', w: 880, focus: [0.6, 0.5]}, topLabel: 'SYÈNE, AU SUD'},
    {t0: W('soleil', B.lit), bg: 'marble', tr: 'flash', still: true, anim: {name: 'Terre', rays: 0.05, well: W('puits', B.lit) - W('soleil', B.lit)}},
    {t0: B.pasombre - 0.04, bg: 'marble', tr: 'slam', anim: {name: 'Terre', rays: -9, well: -9}},
    // --- étape un ---
    {t0: B.etape1 - 0.04, bg: 'velvet', tr: 'shutter', slam: {text: 'ÉTAPE 1', at: 0.02, color: 'gold', y: 760, size: 160}},
    {t0: W('jour', B.etape1), bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Terre', rays: -9, well: -9, zIn: 0.2, stick: W('plante', B.etape1) - W('jour', B.etape1)}},
    {t0: B.ombre - 0.04, bg: 'marble', tr: 'flash', still: true, anim: {name: 'Terre', rays: -9, well: -9, zIn: -9, stick: -9, shadow: W('ombre', B.ombre) - B.ombre}},
    // --- étape deux ---
    {t0: B.etape2 - 0.04, bg: 'velvet', tr: 'shutter', slam: {text: 'ÉTAPE 2', at: 0.02, color: 'gold', y: 760, size: 160}},
    {t0: W('sur', B.etape2), bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Plate'}},
    {t0: B.courbe - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Terre', rays: -9, well: -9, stick: -9, shadow: -9, zIn: -9, zOut: 0.1, angle: W('l’angle', B.courbe) - B.courbe}},
    {t0: W('cinquantième', B.courbe), bg: 'velvet', tr: 'slam', num: {text: '1/50', color: 'gold', label: 'DE CERCLE : 7,2°'}},
    // --- étape trois ---
    {t0: B.etape3 - 0.04, bg: 'velvet', tr: 'shutter', slam: {text: 'ÉTAPE 3', at: 0.02, color: 'gold', y: 760, size: 160}},
    {t0: W('distance', B.etape3), bg: 'marble', tr: 'swipe', num: {text: '5 000', color: 'gold', label: 'STADES ENTRE LES DEUX VILLES'}},
    {t0: B.fois - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Terre', ...done, wedges: 0.15, wedgesEnd: B.km - B.fois - 0.4}},
    {t0: B.km - 0.04, bg: 'marble', tr: 'flash', still: true, anim: {name: 'Terre', ...done, wedges: -9, wedgesEnd: -8, circ: 0.1}},
    {t0: B.vrai - 0.04, bg: 'white', tr: 'invert', num: {text: '40 075', color: 'ink', label: 'KM · LA VRAIE VALEUR', strobe: true}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LA GÉODÉSIE', sub: '« mesurer la Terre » · Ératosthène, v. 240 av. J.-C.'}},
    {t0: B.science - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'cellarius', w: 760, focus: [0.5, 0.5], zoom: 0.22}},
    // --- relance : Colomb ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'armillaire', w: 480, focus: [0.5, 0.4], zoom: 0.2}},
    {t0: B.colomb - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'columbus', w: 560, focus: [0.5, 0.25], zoom: 0.16}},
    {t0: W('calculs', B.colomb), bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Colomb'}},
    {t0: W('kilomètres', B.asie), bg: 'marble', tr: 'whip', pic: {name: 'ships', w: 880, zoom: 0.12}},
    {t0: B.amerique - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'landing', w: 860}, stamp: {text: 'L’AMÉRIQUE', at: W('l’amérique', B.amerique) + 0.1}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Terre', ...done, wedges: 0.2, wedgesEnd: 1.6}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {name: 'Terre', ...done}},
  ];
};
