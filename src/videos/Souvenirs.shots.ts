// 29 — Le mot qui n'était pas là. Montage v3.2, style rêve (accent pourpre, habillage écran de test « TEST N°2 »).
// Recette du gorille : le test DRM commence à la 1re image sans annoncer le piège (fiches bristol), quiz, rembobinage,
// Roediger & McDermott 1995, le faux souvenir (Goya reconstruit), relance, la photo truquée de 2002, les témoins, boucle.
// Au plus 3 mots qui claquent, 2 tampons, 2 stroboscopes.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

const LISTE = ['Lit', 'Drap', 'Nuit', 'Oreiller', 'Couette', 'Rêve', 'Fatigue', 'Sieste', 'Ronfler', 'Bâiller', 'Réveil'];

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const at: number[] = [];
  let a = B.liste - 0.1;
  for (const w of LISTE) { const x = wordAt(words, w, a); at.push(x); a = x + 0.05; }
  const test = {name: 'ListeMots', words: LISTE.join('|'), at, stop: B.stop};
  return [
    // --- le test : un seul plan ---
    {t0: 0, bg: 'marble', still: true, anim: test},
    // --- quiz et révélation ---
    {t0: B.q1 - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Quiz', q: [wordAt(words, 'il', B.q1 + 0.6), wordAt(words, 'chaise', B.q2), wordAt(words, 'sommeil', B.q3)], oui: B.oui}},
    {t0: B.jamais - 0.04, bg: 'velvet', tr: 'invert', still: true, anim: {name: 'Rembobine', words: LISTE.join('|'), jam: W('jamais', B.jamais) - B.jamais + 0.04}, stamp: {text: 'JAMAIS DIT', at: W('été', B.jamais) + 0.04, y: 1250, size: 92, rot: -6}},
    // --- l'expérience de 1995 ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1995', color: 'ink', label: 'WASHINGTON UNIVERSITY', strobe: true}},
    {t0: W('psychologues', B.an), bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Fiche', lines: 'ROEDIGER & McDERMOTT|LISTES DE MOTS ASSOCIÉS|MOT ABSENT : « SOMMEIL »'}},
    {t0: W('test', B.an + 3), bg: 'marble', tr: 'whip', pic: {name: 'wundt', w: 840, zoom: 0.12}},
    {t0: B.pareil - 0.04, bg: 'velvet', tr: 'slam', balance: {tilt: [-14, 0], left: 'FAUX', right: 'VRAIS'}},
    {t0: B.jure - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'goya', w: 700, zoom: 0.1}, slam: {text: '« JE CROIS »', at: W('crois', B.jure) - B.jure + 0.04, color: 'white', y: 300}},
    {t0: W('ils', B.jure + 1.5), bg: 'velvet', tr: 'slam', pic: {name: 'nightmare', w: 840, zoom: 0.14, focus: [0.3, 0.3]}, slam: {text: 'JE M’EN|SOUVIENS', at: 0.3, color: 'gold', y: 290}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LE FAUX|SOUVENIR', sub: '« false memory » · paradigme DRM · Deese 1959'}},
    {t0: B.filtre - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Reconstruit', fill: W('reconstruit', B.filtre) - B.filtre + 0.04}},
    // --- relance : l'insert farfelu (Grandville) ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'prefet', w: 840, zoom: 0.2, focus: [0.5, 0.6]}},
    // --- la photo truquée de 2002 ---
    {t0: B.ballon - 0.04, bg: 'white', tr: 'invert', num: {text: '2002', color: 'ink', label: 'PHOTO TRUQUÉE'}},
    {t0: W('photo', B.ballon), bg: 'marble', tr: 'swipe', still: true, anim: {name: 'PhotoTruquee', paste: W('montgolfière', B.ballon) - W('photo', B.ballon)}},
    {t0: B.famille - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'versailles', w: 840, zoom: 0.14, focus: [0.2, 0.2]}, stamp: {text: 'JAMAIS EU LIEU', at: W('jamais', B.famille) + 0.04, size: 96}},
    {t0: B.trois - 0.04, bg: 'velvet', tr: 'slam', num: {text: '3', color: 'gold', label: 'ENTRETIENS'}},
    {t0: B.moitie - 0.04, bg: 'velvet', tr: 'flashRed', num: {text: '50 %', color: 'gold', label: 'SE SOUVIENNENT DU VOL'}},
    {t0: W('voyage', B.moitie), bg: 'marble', tr: 'glitch', still: true, leak: true, anim: {name: 'PhotoTruquee', done: true}},
    // --- les témoins ---
    {t0: B.tribunal - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'temoin', w: 840, zoom: 0.1}},
    {t0: W('69', B.tribunal) , bg: 'velvet', tr: 'flashRed', num: {text: '69 %', color: 'gold', label: 'RECONNUS PAR UN TÉMOIN', strobe: true}},
    {t0: W('libérés', B.tribunal), bg: 'marble', tr: 'swipe', pic: {name: 'temoin', w: 840, zoom: 0.3, focus: [0.7, 0.75]}},
    {t0: W('reconnus', B.tribunal), bg: 'marble', tr: 'whip', pic: {name: 'temoin_zoom', w: 560, zoom: 0.16}, slam: {text: 'À TORT', at: B.tort - W('reconnus', B.tribunal) + 0.04, color: 'red', y: 300}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'enfant', w: 520, zoom: 0.18, focus: [0.5, 0.25]}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {...test, freezeAt: 0}},
  ];
};
