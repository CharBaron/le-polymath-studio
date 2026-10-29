// 17 — Phineas Gage (1848). Montage v3, accent rouge sang (corps humain).
// la barre traverse le crâne, il parle → 1848, explosifs → 1 m, 6 kg → 25 m plus loin → « du travail pour vous »
// → une demi-tasse de cerveau → 12 ans avec la barre → plus le même → cortex préfrontal → le Chili → Harvard
// → boucle « à une barre de fer ».
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- hook ---
    {t0: 0, bg: 'marble', still: true, pic: {name: 'skullfront', w: 560}},
    {t0: W('crâne', 0), bg: 'velvet', tr: 'glitch', pic: {name: 'skullside', w: 600}},
    {t0: W('parle', B.h2), bg: 'marble', tr: 'slam', pic: {name: 'gage', w: 540}, stamp: {text: 'VIVANT', at: W('parle', B.h2) + 0.15}},
    // --- l'accident ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1848', color: 'ink', label: 'PHINEAS GAGE', strobe: true}},
    {t0: W('explosifs', B.an), bg: 'velvet', tr: 'flashRed', pic: {name: 'explosion', w: 840}},
    {t0: B.barre - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'gage', w: 560, zoom: 0.1}, brackets: {x: 640, y: 560, w: 200, h: 560, at: 0.2}},
    {t0: W('mètre', B.barre), bg: 'marble', tr: 'flash', num: {text: '1 m', color: 'gold', label: 'DE LONG', strobe: true}},
    {t0: W('six', B.barre), bg: 'white', tr: 'flash', num: {text: '6 kg', color: 'ink', label: 'DE FER', strobe: true}},
    {t0: B.explose - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'explosion', w: 840, zoom: 0.16}},
    {t0: B.traverse - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'skull1868', w: 560}, brackets: {x: 420, y: 760, w: 220, h: 220, at: 0.3}},
    {t0: W('crâne', B.traverse), bg: 'marble', tr: 'zoom', pic: {name: 'skullfront', w: 560, zoom: 0.1}},
    {t0: B.metres - 0.04, bg: 'velvet', tr: 'whip', num: {text: '25 m', color: 'gold', label: 'PLUS LOIN', strobe: true}},
    // --- vivant ---
    {t0: B.vivant - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'gageface', w: 500}, stamp: {text: 'VIVANT', at: W('pas', B.vivant) + 0.05}},
    {t0: B.charrette - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'malleposte', w: 760}},
    {t0: W('voilà', B.charrette), bg: 'velvet', tr: 'zoom', pic: {name: 'gage', w: 520}, slam: {text: '« DU TRAVAIL|POUR VOUS »', at: 0.5, color: 'gold', y: 290}},
    // --- le cerveau ---
    {t0: B.vomit - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'brain', w: 680}},
    {t0: W('demi-tasse', B.demi), bg: 'velvet', tr: 'flashRed', pic: {name: 'brain', w: 680, zoom: 0.16}, slam: {text: 'DEMI-TASSE|DE CERVEAU', at: 0.1, color: 'red', y: 300}},
    {t0: B.douze - 0.04, bg: 'white', tr: 'invert', num: {text: '12', color: 'ink', label: 'ANS DE PLUS', strobe: true}},
    {t0: B.garde - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'gage', w: 560}, brackets: {x: 640, y: 560, w: 200, h: 560, at: 0.4}},
    // --- plus le même ---
    {t0: B.sauf - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'gageface', w: 500}, stamp: {text: 'PLUS LE MÊME', at: W('même', B.sauf) + 0.05, size: 96}},
    {t0: W('impulsif', B.grossier), bg: 'marble', tr: 'slam', pic: {name: 'gageface', w: 460, zoom: 0.1}, slam: {text: 'IMPULSIF', at: 0.02, color: 'red'}},
    {t0: W('grossier', B.grossier), bg: 'velvet', tr: 'invert', pic: {name: 'gageface', w: 460}, slam: {text: 'GROSSIER', at: 0.02, color: 'white'}},
    {t0: W('incapable', B.grossier), bg: 'marble', tr: 'slam', pic: {name: 'gageface', w: 460, zoom: 0.14}, slam: {text: 'INCAPABLE', at: 0.02, color: 'gold'}},
    {t0: B.amis - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'gage', w: 540}, stamp: {text: 'PLUS GAGE', at: W('gage', B.amis) + 0.05}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'PREFRONTAL CORTEX', sub: '« le cortex préfrontal »'}},
    {t0: B.frein - 0.04, bg: 'marble', tr: 'zoom', pic: {name: 'brain', w: 700}, brackets: {x: 300, y: 600, w: 300, h: 280, at: 0.3}},
    // --- mais : le Chili ---
    {t0: B.mais - 0.04, bg: 'white', tr: 'glitch', pic: {name: 'sciam', w: 760}},
    {t0: B.chili - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'coach', w: 840, zoom: 0.1}},
    {t0: W('six', B.chili), bg: 'velvet', tr: 'flash', num: {text: '6', color: 'gold', label: 'CHEVAUX', strobe: true}},
    {t0: W('chili', B.chili), bg: 'marble', tr: 'whip', pic: {name: 'malleposte', w: 760}, slam: {text: 'CHILI', at: 0.04, color: 'gold'}},
    {t0: B.cerveau - 0.04, bg: 'marble', tr: 'zoom', rays: 'gold', pic: {name: 'brain', w: 660}, stamp: {text: 'RÉORGANISÉ', at: W('réorganisé', B.cerveau) + 0.05, size: 100}},
    {t0: B.crane - 0.04, bg: 'marble', tr: 'spin', pic: {name: 'skullside', w: 600, y: 820}, title: 'HARVARD'},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'brain', w: 680}},
    {t0: W('centimètres', B.toi), bg: 'marble', tr: 'slam', pic: {name: 'skull1868', w: 560}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, pic: {name: 'skullfront', w: 560}},
  ];
};
