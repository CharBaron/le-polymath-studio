// 18 — Les rats sans queue de Hanoï (1902). Montage v3.1, style archive coloniale (accent ocre, machine à écrire).
// Structure en escalade : chaque solution empire le problème. Animations : QueueCoupee, Registre, Grouillement.
// rats sans queue → la faute des Français → égouts = paradis → peste → chasseurs : 20 000 en un jour (registre) → toujours plus
// → prime d'un centime par queue → (relance) on coupe la queue et on relâche → bébés ×64 → élevages → prime supprimée
// → la peste quand même (1903) → l'effet cobra → l'anecdote indienne → boucle « des rats sans queue ».
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- hook ---
    {t0: 0, bg: 'marble', still: true, pic: {name: 'rat', w: 860, zoom: 0}},
    {t0: 0.55, bg: 'marble', tr: 'zoom', pic: {name: 'rue_plein', w: 1080, full: true, zoom: 0.12}},
    {t0: W('rats', 0), bg: 'white', tr: 'slam', still: true, anim: {name: 'QueueCoupee', cut: W('sans', 0) - W('rats', 0) + 0.1, run: W('queue', 0) - W('rats', 0) + 0.4}},
    {t0: B.h2 - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'ratsfr', w: 880}, stamp: {text: 'FRANÇAISE', at: W('française', B.h2) + 0.05}},
    // --- les égouts, la peste ---
    {t0: B.egouts - 0.04, bg: 'white', tr: 'swipe', pic: {name: 'egouts', w: 700, focus: [0.5, 0.45]}},
    {t0: W('modernes', B.egouts), bg: 'white', tr: 'zoom', pic: {name: 'egouts_zoom', w: 880, zoom: 0.14}, brackets: {x: 380, y: 620, w: 300, h: 260, at: 0.2}},
    {t0: B.paradis - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'bouquiniste', w: 560}, slam: {text: 'LE PARADIS', at: W('paradis', B.paradis) - B.paradis + 0.04, color: 'gold', y: 300}},
    {t0: B.peste - 0.04, bg: 'velvet', tr: 'flashRed', pic: {name: 'schnabel', w: 580, focus: [0.42, 0.22], zoom: 0.3}},
    // --- les chasseurs, le registre ---
    {t0: B.chasse - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'catcher', w: 600, focus: [0.5, 0.3]}},
    {t0: B.jour - 0.04, bg: 'marble', tr: 'flash', still: true, anim: {name: 'Registre', total: 20112, fill: 2.0}},
    {t0: B.toujours - 0.04, bg: 'white', tr: 'glitch', still: true, anim: {name: 'Grouillement', max: 16, step: 0.17}},
    // --- la prime ---
    {t0: B.prime - 0.04, bg: 'marble', tr: 'shutter', pic: {name: 'expo', w: 580, focus: [0.5, 0.3]}, slam: {text: 'PAYER TOUT|LE MONDE', at: W('payer', B.prime) - B.prime + 0.04, color: 'gold', y: 300}},
    {t0: B.centime - 0.04, bg: 'white', tr: 'flash', num: {text: '1', color: 'ink', label: 'CENTIME PAR RAT'}},
    {t0: B.queue - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'rat', w: 860, focus: [0.12, 0.62], zoom: 0.35}, stamp: {text: 'LA QUEUE', at: W('queue', B.queue) + 0.05}},
    // --- relance : la triche ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'rathead', w: 600, focus: [0.4, 0.4]}, slam: {text: 'GÉNIAL.', at: W('génial', B.relance) - B.relance + 0.04, color: 'gold', y: 300}},
    {t0: B.coupe - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'catcher2', w: 680, focus: [0.5, 0.5]}},
    {t0: W('coupent', B.coupe), bg: 'white', tr: 'slam', still: true, anim: {name: 'QueueCoupee', cut: W('queue', B.coupe) - W('coupent', B.coupe) + 0.08, run: W('relâchent', B.coupe) - W('coupent', B.coupe) + 0.1}},
    {t0: B.bebes - 0.04, bg: 'white', tr: 'zoom', still: true, anim: {name: 'Grouillement', max: 64, step: 0.5}},
    // --- les élevages ---
    {t0: B.fermes - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'pavillons', w: 880, zoom: 0.12}},
    {t0: W('élevages', B.fermes), bg: 'velvet', tr: 'slam', pic: {name: 'ratsfr_zoom', w: 880}, stamp: {text: 'ÉLEVAGES', at: W('élevages', B.fermes) + 0.3}},
    {t0: B.fin_prime - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'doumer', w: 540}, stamp: {text: 'SUPPRIMÉE', at: W('supprimée', B.fin_prime) + 0.05}},
    {t0: B.peste2 - 0.04, bg: 'white', tr: 'invert', num: {text: '1903', color: 'ink', label: 'LA PESTE', strobe: true}},
    {t0: W('frappe', B.peste2), bg: 'velvet', tr: 'slam', pic: {name: 'schnabel_face', w: 640, zoom: 0.18}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'L’EFFET|COBRA', sub: '« cobra effect » · les incitations perverses'}},
    {t0: B.def - 0.04, bg: 'white', tr: 'swipe', pic: {name: 'ratskel', w: 640, zoom: 0.12}},
    {t0: B.inde - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'cobras', w: 480, focus: [0.5, 0.2]}},
    {t0: B.elevage - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'cobras', w: 520, zoom: 0.1}, slam: {text: 'ÉLEVAGES|DE COBRAS', at: W('élever', B.elevage) - B.elevage + 0.04, color: 'gold', y: 290}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'catcher_plein', w: 1080, full: true, zoom: 0.1}},
    {t0: W('fabriques', B.toi), bg: 'velvet', tr: 'slam', pic: {name: 'bouquiniste', w: 560}, slam: {text: 'TU FABRIQUES|QUOI ?', at: 0.04, color: 'gold', y: 290}},
    {t0: B.loop - 0.04, bg: 'white', tr: 'swipe', pic: {name: 'ratskel', w: 640}},
    {t0: W('ou', B.loop), bg: 'marble', tr: 'blur', still: true, pic: {name: 'rat', w: 860, zoom: 0}},
  ];
};
