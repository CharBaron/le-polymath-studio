// 21 — L'homme au trou dans l'estomac (Alexis Saint-Martin et William Beaumont, 1822-1833). Montage v3.1, style planche
// d'anatomie (parchemin, encre rouge, IM Fell). Structure : quatre chapitres. Animations : Estomac (fistule, ficelle,
// dissolution heure par heure), Bocal (le suc gastrique dissout la viande hors du corps).
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- hook ---
    {t0: 0, bg: 'marble', still: true, anim: {name: 'Estomac', instant: true}},
    {t0: W('années', 0), bg: 'marble', tr: 'zoom', pic: {name: 'estomac', w: 760, focus: [0.6, 0.5], zoom: 0.2}},
    {t0: W('médecin', 0), bg: 'marble', tr: 'swipe', pic: {name: 'beaumont', w: 540}},
    {t0: W('viande', 0), bg: 'marble', tr: 'slam', still: true, anim: {name: 'Estomac', down: 1.6}},
    {t0: B.h2 + 0.9, bg: 'marble', tr: 'glitch', pic: {name: 'stmartin', w: 560, focus: [0.5, 0.35], zoom: 0.16}, stamp: {text: 'VIVANT', at: W('vivant', B.h2) + 0.05}},
    // --- chapitre un ---
    {t0: B.ch1 - 0.04, bg: 'white', tr: 'flash', card: {}},
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1822', color: 'ink', label: 'MICHIGAN', strobe: true}},
    {t0: W('trappeur', B.an), bg: 'marble', tr: 'swipe', pic: {name: 'canoe', w: 880, zoom: 0.12}},
    {t0: W('saint-martin', B.an), bg: 'marble', tr: 'zoom', pic: {name: 'stmartin', w: 560, focus: [0.5, 0.3], zoom: 0.24}},
    {t0: W('mousquet', B.an), bg: 'velvet', tr: 'flashRed', pic: {name: 'mousquet', w: 540}, stamp: {text: 'BOUT PORTANT', at: W('portant', B.an) + 0.05, size: 92}},
    {t0: B.trou - 0.04, bg: 'marble', tr: 'slam', still: true, anim: {name: 'Estomac', mode: 'trou'}, slam: {text: 'UN TROU', at: W('trou', B.trou) - B.trou + 0.04, color: 'red', y: 300}},
    {t0: W('jusqu’à', B.trou), bg: 'marble', tr: 'zoom', pic: {name: 'estomac', w: 760, focus: [0.15, 0.45], zoom: 0.3}},
    // --- chapitre deux ---
    {t0: B.ch2 - 0.04, bg: 'white', tr: 'flash', card: {}},
    {t0: B.beaumont - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'beaumont_face', w: 600, zoom: 0.16}},
    {t0: W('digestion', B.beaumont), bg: 'marble', tr: 'zoom', pic: {name: 'estomac', w: 760, zoom: 0.14}},
    {t0: W('viande', B.ficelle), bg: 'velvet', tr: 'slam', slam: {text: 'VIANDE', at: 0.02, color: 'gold', y: 760, size: 200}},
    {t0: W('pain', B.ficelle), bg: 'marble', tr: 'slam', slam: {text: 'PAIN', at: 0.02, color: 'white', y: 760, size: 220}},
    {t0: W('chou', B.ficelle), bg: 'velvet', tr: 'slam', slam: {text: 'CHOU', at: 0.02, color: 'gold', y: 760, size: 220}},
    {t0: W('fil', B.ficelle), bg: 'marble', tr: 'zoom', pic: {name: 'brevet', w: 820, focus: [0.5, 0.4], zoom: 0.12}},
    {t0: B.descend - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Estomac', down: 1.0, from: 1.3, to: B.nom - B.descend - 0.1}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LA DIGESTION|CHIMIQUE', sub: 'Beaumont, 1833 · le suc gastrique'}},
    {t0: B.acide - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Estomac', instant: true, from: 0.6, to: B.bocal - B.acide}},
    {t0: B.bocal - 0.04, bg: 'white', tr: 'swipe', still: true, anim: {name: 'Bocal', from: 0.3, to: B.relance - B.bocal - 0.2}},
    // --- relance ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'stmartin_vieux', w: 540, focus: [0.5, 0.3], zoom: 0.18}, slam: {text: 'LE PLUS|ÉTRANGE…', at: 0.1, color: 'gold', y: 290}},
    // --- chapitre trois ---
    {t0: B.ch3 - 0.04, bg: 'white', tr: 'flash', card: {}},
    {t0: B.fuit - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'canoe_zoom', w: 880, zoom: 0.14}},
    {t0: W('marie', B.fuit), bg: 'marble', tr: 'swipe', pic: {name: 'couple', w: 760, zoom: 0.1}},
    {t0: B.revient - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'beaumont', w: 540, focus: [0.5, 0.3]}},
    {t0: B.exp - 0.04, bg: 'white', tr: 'invert', num: {text: '238', color: 'ink', label: 'EXPÉRIENCES EN 8 ANS', strobe: true}},
    // --- chapitre quatre ---
    {t0: B.ch4 - 0.04, bg: 'white', tr: 'flash', card: {}},
    {t0: B.survit - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'stmartin_vieux', w: 540, zoom: 0.12}},
    {t0: W('vingt-sept', B.survit), bg: 'white', tr: 'flash', num: {text: '+27', color: 'ink', label: 'ANS DE PLUS QUE SON MÉDECIN'}},
    {t0: B.famille - 0.04, bg: 'marble', tr: 'zoom', pic: {name: 'couple_plein', w: 1080, full: true, zoom: 0.12}},
    {t0: W('décomposer', B.famille), bg: 'velvet', tr: 'glitch', pic: {name: 'stmartin_vieux', w: 520}, stamp: {text: 'PAS D’AUTOPSIE', at: W('enterrer', B.famille) + 0.05, size: 84}},
    {t0: B.voler - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'estomac', w: 760, zoom: 0.16}, slam: {text: 'SON ESTOMAC', at: W('estomac', B.voler) - B.voler + 0.02, color: 'red', y: 300}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Estomac', instant: true, from: 0.3, to: B.loop - B.toi}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'stmartin_vieux', w: 540, zoom: 0.12}},
    {t0: W('ficelle', B.loop), bg: 'marble', tr: 'blur', still: true, anim: {name: 'Estomac', instant: true}},
  ];
};
