// 19 — Le gorille invisible. Montage v3.2, style labo (accent bleu électrique, habillage écran de test).
// Le test commence à la 1re image, sans annoncer de piège (« un seul essai ») : vrais joueurs de 1894 détourés, un gorille gravé
// assombri qui se fond dans l'équipe noire. Puis révélation, l'expérience de 1999, la cécité d'inattention, (relance) les
// radiologues de 2013. Au plus 3 mots qui claquent, 2 stroboscopes.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const go = 0.6, stop = B.stop;
  return [
    // --- le test : un seul plan, sans coupe ---
    {t0: 0, bg: 'marble', still: true, anim: {name: 'TestPasses', go, stop, passes: 11}},
    // --- la révélation ---
    {t0: B.combien - 0.04, bg: 'velvet', tr: 'slam', num: {text: '11', color: 'gold', label: 'PASSES BLANCHES'}},
    {t0: W('bravo', B.combien), bg: 'marble', tr: 'whip', pic: {name: 'basket1', w: 880, zoom: 0.12}},
    {t0: B.gorille - 0.04, bg: 'velvet', tr: 'shutter', slam: {text: 'SOIS|HONNÊTE…', at: 0.04, color: 'gold', y: 760, size: 120}},
    {t0: B.vu - 0.04, bg: 'marble', tr: 'invert', still: true, anim: {name: 'TestPasses', go, stop, passes: 11, reveal: true}},
    {t0: B.milieu - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'gorilla_plein', w: 1080, full: true, focus: [0.55, 0.35], zoom: 0.18}},
    // --- l'expérience de 1999 ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1999', color: 'ink', label: 'HARVARD', strobe: true}},
    {t0: W('psychologues', B.an), bg: 'marble', tr: 'swipe', pic: {name: 'basket2', w: 880, zoom: 0.1}},
    {t0: W('test', B.an + 3), bg: 'marble', tr: 'whip', pic: {name: 'basket_zoom', w: 760, focus: [0.5, 0.4]}},
    {t0: W('gorille', B.an), bg: 'velvet', tr: 'slam', pic: {name: 'gorillas', w: 600, zoom: 0.12}},
    {t0: B.moitie - 0.04, bg: 'velvet', tr: 'flashRed', num: {text: '50 %', color: 'gold', label: 'NE LE VOIENT PAS'}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LA CÉCITÉ|D’INATTENTION', sub: '« inattentional blindness » · Simons & Chabris'}},
    {t0: B.filtre - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'basket_zoom', w: 760, zoom: 0.14}, brackets: {x: 300, y: 560, w: 420, h: 380, at: 0.4}},
    {t0: W('cherches', B.filtre), bg: 'velvet', tr: 'slam', pic: {name: 'gorilla_face', w: 600}, slam: {text: 'CE QUE TU|CHERCHES', at: 0.04, color: 'gold', y: 290}},
    // --- relance : les experts ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'chair', w: 500, focus: [0.5, 0.3], zoom: 0.2}},
    {t0: B.radio - 0.04, bg: 'white', tr: 'invert', num: {text: '2013', color: 'ink', label: 'RADIOLOGUES', strobe: true}},
    {t0: W('scanners', B.radio), bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Scanner', gorAt: W('gorille', B.taille) - W('scanners', B.radio), nodAt: W('tumeur', B.taille) - W('scanners', B.radio)}},
    {t0: B.experts - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'machine', w: 560, zoom: 0.1}},
    {t0: W('détail', B.experts), bg: 'marble', tr: 'whip', pic: {name: 'xray', w: 880, focus: [0.3, 0.45], zoom: 0.3}},
    {t0: B.p83 - 0.04, bg: 'velvet', tr: 'flashRed', num: {text: '83 %', color: 'gold', label: 'NE VOIENT PAS LE GORILLE'}},
    {t0: B.yeux - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Scanner', gorAt: 0.1, nodAt: 0.1}},
    {t0: W('plupart', B.yeux), bg: 'velvet', tr: 'zoom', pic: {name: 'gorilla_face', w: 620, zoom: 0.2}, brackets: {x: 330, y: 570, w: 420, h: 380, at: 0.2}, slam: {text: 'PILE DESSUS', at: W('pile', B.yeux) - W('plupart', B.yeux) + 0.04, color: 'red', y: 300}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'leopard', w: 600, zoom: 0.12}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {name: 'TestPasses', go, stop, passes: 11, freezeAt: 0}},
  ];
};
