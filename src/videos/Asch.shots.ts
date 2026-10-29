// 13 — L'expérience d'Asch (1951), montage v3 : une image par nom prononcé (~1 s), chiffres en stroboscope,
// inserts « farfelus » de Grandville (animaux habillés à la mode, brebis qui se confesse au loup) pour faire réagir.
// 3 sur 4 ont nié l'évidence → les cartes → seuls < 1 % → complices (les loups) → 74 % / un tiers → influence normative
// → un seul allié : < 10 % → un quart n'a jamais cédé → Sénèque et le troupeau → boucle « fais-tu partie des trois ? ».
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- hook ---
    {t0: 0, bg: 'marble', still: true, lines: {full: true, pick: 1, wrong: true, pickAt: -1}},
    {t0: W('quatre', 0), bg: 'velvet', tr: 'glitch', lines: {full: true, pick: 1, wrong: true, votes: 3, pickAt: -1}, stamp: {text: 'FAUX', at: W('évidence', 0)}},
    {t0: B.h2 - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'fashion', w: 640, zoom: 0.08}},
    // --- l'expérience ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1951', color: 'ink', label: 'SOLOMON ASCH', strobe: true}},
    {t0: W('psychologue', B.an), bg: 'marble', tr: 'whip', leak: true, pic: {name: 'amphi', w: 840}, beam: true},
    {t0: W('cartes', B.an), bg: 'marble', tr: 'zoom', lines: {}},
    {t0: W('étudiants', B.an), bg: 'marble', tr: 'swipe', pic: {name: 'amphi', w: 840, zoom: 0.1}, brackets: {x: 300, y: 650, w: 300, h: 220, at: 0.15}},
    {t0: B.question - 0.04, bg: 'marble', tr: 'slam', lines: {full: true}},
    {t0: B.facile - 0.04, bg: 'marble', tr: 'flash', rays: 'gold', lines: {full: true, pick: 2, pickAt: 0.1}},
    {t0: B.seul - 0.04, bg: 'marble', tr: 'spin', pic: {name: 'laughing', w: 520, y: 800}},
    {t0: W('moins', B.seul), bg: 'marble', tr: 'flash', rays: 'gold', num: {text: '< 1 %', color: 'gold', label: 'D’ERREURS, SEULS', strobe: true}},
    // --- le piège ---
    {t0: B.piege - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'amphi', w: 840}, brackets: {x: 270, y: 640, w: 330, h: 240, at: 0.3}},
    {t0: W('autres', B.piege), bg: 'marble', tr: 'glitch', pic: {name: 'wolves', w: 780}, stamp: {text: 'COMPLICES', at: W('complices', B.piege) + 0.1, size: 104}},
    {t0: W('donnent', B.faux), bg: 'velvet', tr: 'flashRed', lines: {full: true, pick: 1, wrong: true, pickAt: 0.15, votes: 7}, slam: {text: 'MÊME ERREUR', at: 1.0, color: 'red', y: 300}},
    // --- les chiffres ---
    {t0: B.p74 - 0.04, bg: 'velvet', tr: 'invert', num: {text: '74 %', color: 'gold', label: 'ONT CÉDÉ AU MOINS UNE FOIS', strobe: true}},
    {t0: W('suivent', B.p74), bg: 'marble', tr: 'swipe', pic: {name: 'flock', w: 840, zoom: 0.12}},
    {t0: W('moins', B.p74 + 2), bg: 'marble', tr: 'whip', pic: {name: 'sheep', w: 820}},
    {t0: B.tiers - 0.04, bg: 'white', tr: 'flash', num: {text: '1/3', color: 'ink', label: 'DES RÉPONSES FAUSSES', strobe: true}},
    {t0: W('fausses', B.tiers), bg: 'velvet', tr: 'glitch', lines: {full: true, pick: 3, wrong: true, pickAt: -1}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'NORMATIVE INFLUENCE', sub: '« l’influence normative » · Deutsch & Gerard, 1955'}},
    {t0: B.peur - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'confess', w: 600, zoom: 0.08}, stamp: {text: 'TORT', at: W('tort', B.peur) + 0.05}},
    {t0: W('raison', B.peur), bg: 'marble', tr: 'swipe', pic: {name: 'laughing', w: 480, y: 800}, slam: {text: 'SEUL', at: 0.45, color: 'gold', y: 330}},
    // --- sauf que : un seul allié ---
    {t0: B.sauf - 0.04, bg: 'marble', tr: 'glitch', lines: {full: true, pick: 1, wrong: true, votes: 6}},
    {t0: B.allie - 0.04, bg: 'marble', tr: 'slam', rays: 'gold', lines: {full: true, pick: 2, pickAt: 0.1, votes: 1}},
    {t0: B.chute - 0.04, bg: 'marble', tr: 'flash', num: {text: '< 10 %', color: 'gold', label: 'DE CONFORMISME', strobe: true}},
    {t0: B.quart - 0.04, bg: 'marble', tr: 'swipe', rays: 'gold', pic: {name: 'laughing', w: 520, y: 820}, crown: {at: 0.3, y: 490, w: 240}, stamp: {text: 'JAMAIS', at: W('jamais', B.quart) + 0.05, y: 1060, rot: -9}},
    // --- Sénèque ---
    {t0: B.siecles - 0.04, bg: 'white', tr: 'invert', num: {text: '2 000', color: 'ink', label: 'ANS', strobe: true}},
    {t0: B.seneque - 0.04, bg: 'marble', tr: 'zoom', pic: {name: 'seneque', w: 560, y: 840}, laurel: {cy: 840, r: 400, at: 0.2}, title: 'SÉNÈQUE'},
    {t0: B.quote - 0.04, bg: 'velvet', tr: 'flashRed', quote: {lines: ['« Ne suis pas', 'le troupeau… »'], sign: '— SÉNÈQUE, DE LA VIE HEUREUSE'}},
    {t0: W('troupeau', B.quote), bg: 'marble', tr: 'swipe', pic: {name: 'flock', w: 840, zoom: 0.1}},
    {t0: W('mouton', B.quote), bg: 'velvet', tr: 'slam', pic: {name: 'sheep', w: 820}},
    {t0: W('va', B.quote), bg: 'velvet', tr: 'flashRed', quote: {lines: ['« Va où il faut aller,', 'pas où l’on va. »'], sign: '— D’APRÈS SÉNÈQUE, DE LA VIE HEUREUSE, I'}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'marble', tr: 'glitch', leak: true, pic: {name: 'panic', w: 840}},
    {t0: W('monde', B.toi), bg: 'marble', tr: 'spin', pic: {name: 'fashion', w: 600}},
    {t0: B.regarde - 0.04, bg: 'marble', tr: 'zoom', lines: {full: true, pick: 2, pickAt: 0.2}, brackets: {x: 520, y: 450, w: 420, h: 660, at: 0.1}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, lines: {full: true, pick: 1, wrong: true, pickAt: -1}},
  ];
};
