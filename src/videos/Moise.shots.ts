// 30 — La question piège (l'illusion de Moïse). Montage v3.2, style déluge (accent bleu, habillage « TEST N°3 »).
// Recette du gorille : la question à la 1re image sans annoncer le piège (fiche + arche de Doré), 1 · 2 · 7, 3-2-1,
// correction (MOÏSE barré → NOÉ), Erickson & Mattson 1981, le concept, relance, Cologne 2021 (12 €, −16 %),
// l'illusion de vérité (la phrase répétée), la Grande Muraille, le renard de La Fontaine, boucle.
// Budget : 3 mots qui claquent, 3 tampons, 2 stroboscopes.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

const Q = ['COMBIEN', 'D’ANIMAUX', 'DE', 'CHAQUE', 'ESPÈCE', 'MOÏSE', 'A-T-IL', 'FAIT', 'MONTER', 'DANS', 'SON', 'ARCHE ?'];

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  // la question s'écrit au rythme des mots dits entre {@q} et {@timer}
  const toks = words.filter((w) => w.startMs / 1000 >= B.q - 0.08 && w.startMs / 1000 < B.timer - 0.08).map((w) => w.startMs / 1000);
  const at = Q.map((_, i) => (toks.length ? toks[Math.min(toks.length - 1, Math.round((i * (toks.length - 1)) / (Q.length - 1)))] : B.q + i * 0.25));
  const cd = [W('trois', B.timer), W('deux', B.timer + 0.3), W('un', B.timer + 0.6)];
  const test = {name: 'QuestionPiege', words: Q.join('|'), at, cd, stop: B.stop};
  return [
    // --- la question : un seul plan ---
    {t0: 0, bg: 'marble', still: true, anim: test},
    // --- la correction ---
    {t0: B.deux - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Correction', words: Q.join('|'), fix: W('noé', B.noe)}},
    {t0: B.moise - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'moise', w: 760, zoom: 0.12, focus: [0.4, 0.3]}, stamp: {text: 'PERSONNE', at: W('personne', B.moise) + 0.04, size: 110, y: 1180, rot: -7}},
    {t0: B.savais - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'paires', w: 880, zoom: 0.16, focus: [0.6, 0.6]}},
    // --- l'expérience de 1981 ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1981', color: 'ink', label: 'ERICKSON & MATTSON', strobe: true}},
    {t0: W('posent', B.an), bg: 'marble', tr: 'swipe', pic: {name: 'brueghel', w: 880, zoom: 0.18, focus: [0.55, 0.6]}},
    {t0: B.previens - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'colombe', w: 840, zoom: 0.1}, title: 'ATTENTION AU PIÈGE'},
    {t0: B.dedans - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'deluge', w: 760, zoom: 0.16, focus: [0.4, 0.45]}, slam: {text: 'QUAND MÊME', at: W('même', B.dedans) - B.dedans + 0.04, color: 'red', y: 290}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'L’ILLUSION|DE MOÏSE', sub: '« Moses illusion » · Erickson & Mattson, 1981'}},
    {t0: B.filtre - 0.04, bg: 'marble', tr: 'zoom', pic: {name: 'renard_zoom', w: 640, zoom: 0.12, focus: [0.5, 0.35]}},
    {t0: W('vérifie', B.filtre + 1.2), bg: 'velvet', tr: 'whip', pic: {name: 'renard', w: 760, zoom: 0.1}, slam: {text: 'ÇA SONNE|JUSTE', at: W('sonne', B.filtre + 1.2) - W('vérifie', B.filtre + 1.2) + 0.04, color: 'gold', y: 280}},
    // --- relance ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'moise_zoom', w: 760, zoom: 0.2, focus: [0.35, 0.3]}},
    // --- Cologne 2021 : payés pour trouver l'erreur ---
    {t0: B.argent - 0.04, bg: 'white', tr: 'invert', num: {text: '2021', color: 'ink', label: 'UNIVERSITÉ DE COLOGNE'}},
    {t0: W('paient', B.argent), bg: 'marble', tr: 'swipe', pic: {name: 'hicks', w: 880, zoom: 0.14, focus: [0.4, 0.4]}, stamp: {text: 'PAYÉS', at: W('paient', B.argent) + 0.12, size: 120, y: 1150, rot: 6}},
    {t0: B.douze - 0.04, bg: 'velvet', tr: 'slam', num: {text: '+12 €', color: 'gold', label: 'POUR TROUVER L’ERREUR'}},
    {t0: B.seize - 0.04, bg: 'velvet', tr: 'flashRed', num: {text: '−16 %', color: 'gold', label: 'D’ILLUSION, SEULEMENT', strobe: true}},
    // --- l'illusion de vérité ---
    {t0: B.pire - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Repete', text: 'LA GRANDE MURAILLE SE VOIT DE L’ESPACE.', n: 6, every: 0.42}},
    {t0: B.meme - 0.04, bg: 'velvet', tr: 'slam', balance: {tilt: [-14, 12], left: 'SAVOIR', right: 'ENTENDRE'}},
    {t0: B.muraille - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'muraille', w: 880, zoom: 0.12, focus: [0.5, 0.35]}, stamp: {text: 'FAUX', at: W('faux', B.muraille) + 0.04, size: 150, y: 1150, rot: -8}},
    {t0: W('pourtant', B.muraille), bg: 'velvet', tr: 'zoom', pic: {name: 'muraille', w: 880, zoom: 0.35, focus: [0.25, 0.75]}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'renard', w: 700, zoom: 0.25, focus: [0.75, 0.15]}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {...test, freezeAt: 0}},
  ];
};
