// 29 — Le mot qui n'était pas là. Style rêve / test de mémoire (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {SOUVENIRS} from '../gravure/anim/Souvenirs';
import {shotsOf} from './Souvenirs.shots';

export const Souvenirs = makeReel('29-faux-souvenirs', shotsOf, undefined, {accent: 'pourpre', display: 'cormorant', label: 'plex', ornament: 'stars', overlay: 'hud', overlayLabel: 'TEST N°2 · MÉMOIRE'}, SOUVENIRS);
