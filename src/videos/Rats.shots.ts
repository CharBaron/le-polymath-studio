// 18 — Les rats sans queue de Hanoï (1902). Montage v3.2, style archive coloniale (accent ocre, machine à écrire).
// Hook à double sens (« payés pour chaque queue »), révélé à 8 s. Structure en escalade. Animations : QueueCoupee (rat de
// Schreber + ciseaux), Registre (plume), Grouillement (rats de Schreber). Au plus 3 mots qui claquent, 3 tampons, 2 stroboscopes.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const rat = {name: 'QueueCoupee', cut: 99, run: 99}; // le rat entier, immobile (1re et dernière image)
  return [
    // --- hook : « payés pour chaque queue » ---
    {t0: 0, bg: 'white', still: true, anim: rat},
    {t0: 0.58, bg: 'marble', tr: 'zoom', pic: {name: 'rue_plein', w: 1080, full: true, zoom: 0.12}},
    {t0: W('française', 0), bg: 'marble', tr: 'whip', pic: {name: 'doumer', w: 560, focus: [0.5, 0.3], zoom: 0.16}},
    {t0: W('hommes…', 0), bg: 'marble', tr: 'swipe', pic: {name: 'catcher', w: 600, focus: [0.5, 0.25]}},
    {t0: W('queue', 0), bg: 'velvet', tr: 'slam', slam: {text: 'CHAQUE|QUEUE', at: 0.02, color: 'gold', y: 760, size: 170}},
    {t0: W('rapportaient', 0), bg: 'marble', tr: 'whip', pic: {name: 'paulbert', w: 880, zoom: 0.12}},
    {t0: B.h2 - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'expo', w: 580, focus: [0.5, 0.35]}, stamp: {text: 'TROP', at: W('trop', B.h2) + 0.05, size: 150}},
    {t0: B.rats - 0.04, bg: 'white', tr: 'slam', still: true, anim: rat},
    // --- les égouts, la peste ---
    {t0: B.egouts - 0.04, bg: 'white', tr: 'invert', num: {text: '1902', color: 'ink', label: 'HANOÏ', strobe: true}},
    {t0: W('égouts', B.egouts), bg: 'white', tr: 'swipe', pic: {name: 'egouts', w: 700, focus: [0.5, 0.45]}},
    {t0: W('quartier', B.egouts), bg: 'white', tr: 'zoom', pic: {name: 'egouts_zoom', w: 880, zoom: 0.14}, brackets: {x: 380, y: 620, w: 300, h: 260, at: 0.15}},
    {t0: B.paradis - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'bouquiniste', w: 580}},
    {t0: B.peste - 0.04, bg: 'velvet', tr: 'flashRed', pic: {name: 'schnabel', w: 580, focus: [0.42, 0.22], zoom: 0.3}},
    // --- les chasseurs, le registre ---
    {t0: B.chasse - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'catcher_plein', w: 1080, full: true, zoom: 0.1}},
    {t0: W('rats', B.chasse), bg: 'marble', tr: 'swipe', pic: {name: 'catcher2', w: 680, focus: [0.5, 0.5]}},
    {t0: B.jour - 0.04, bg: 'marble', tr: 'flash', still: true, anim: {name: 'Registre', total: 20112, fill: B.toujours - B.jour - 1.0}},
    {t0: B.toujours - 0.04, bg: 'white', tr: 'glitch', still: true, anim: {name: 'Grouillement', max: 16, step: 0.22}},
    // --- la prime ---
    {t0: B.prime - 0.04, bg: 'marble', tr: 'shutter', pic: {name: 'expo', w: 580, focus: [0.5, 0.25], zoom: 0.2}},
    {t0: B.centime - 0.04, bg: 'white', tr: 'flash', num: {text: '1', color: 'ink', label: 'CENTIME PAR RAT'}},
    {t0: B.queue - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'rat_hero', w: 880, focus: [0.14, 0.72], zoom: 0.38}, stamp: {text: 'LA QUEUE', at: W('queue', B.queue) + 0.05}},
    // --- relance : la triche ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'rathead', w: 620, focus: [0.4, 0.4]}},
    {t0: B.coupe - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'paulbert', w: 880, focus: [0.6, 0.5], zoom: 0.2}},
    {t0: W('coupent', B.coupe), bg: 'white', tr: 'slam', still: true, anim: {name: 'QueueCoupee', cut: W('queue…', B.coupe) - W('coupent', B.coupe) + 0.12, run: W('relâchent', B.coupe) - W('coupent', B.coupe) + 0.1}},
    {t0: B.bebes - 0.04, bg: 'white', tr: 'zoom', still: true, anim: {name: 'Grouillement', max: 64, step: (B.fermes - B.bebes) / 7.5}},
    // --- les élevages ---
    {t0: B.fermes - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'pavillons', w: 880, zoom: 0.12}},
    {t0: W('élevages', B.fermes), bg: 'velvet', tr: 'slam', pic: {name: 'ratsfr_zoom', w: 880}, stamp: {text: 'ÉLEVAGES', at: W('rats', B.fermes + 2) + 0.05}},
    {t0: B.fin_prime - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'doumer', w: 540}},
    {t0: B.peste2 - 0.04, bg: 'white', tr: 'invert', num: {text: '1903', color: 'ink', label: 'LA PESTE', strobe: true}},
    {t0: W('frappe', B.peste2), bg: 'velvet', tr: 'slam', pic: {name: 'schnabel_face', w: 640, zoom: 0.18}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'L’EFFET|COBRA', sub: '« cobra effect » · les incitations perverses'}},
    {t0: B.def - 0.04, bg: 'white', tr: 'swipe', pic: {name: 'ratskel', w: 640, zoom: 0.12}},
    {t0: B.inde - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'cobras', w: 480, focus: [0.5, 0.2], zoom: 0.25}},
    {t0: B.elevage - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'cobras', w: 520, zoom: 0.1}, slam: {text: 'ÉLEVAGES|DE COBRAS', at: W('élever', B.elevage) - B.elevage + 0.04, color: 'gold', y: 290}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'rue_plein', w: 1080, full: true, focus: [0.5, 0.6], zoom: 0.2}},
    {t0: W('fabriques', B.toi), bg: 'velvet', tr: 'slam', pic: {name: 'bouquiniste', w: 560}, slam: {text: 'TU FABRIQUES|QUOI ?', at: 0.04, color: 'gold', y: 290}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'flash', still: true, anim: {name: 'Registre', total: 20112, fill: 0.9}},
    {t0: W('queues', B.loop), bg: 'white', tr: 'blur', still: true, anim: rat},
  ];
};
