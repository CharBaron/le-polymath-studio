// 42 — Héraclite, enterré dans la bouse. Style étable (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {HERACLITE} from '../gravure/anim/Heraclite';
import {shotsOf} from './Heraclite.shots';

export const Heraclite = makeReel('42-heraclite-bouse', shotsOf, undefined, {accent: 'ocre', display: 'fell', label: 'cinzel', ornament: 'greek'}, HERACLITE);
