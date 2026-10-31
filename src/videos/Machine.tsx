// 34 — La machine à plaisir. Style caverne / test de philo (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {MACHINE} from '../gravure/anim/Machine';
import {shotsOf} from './Machine.shots';

export const Machine = makeReel('34-machine-experiences', shotsOf, undefined, {accent: 'pourpre', display: 'cormorant', label: 'plex', ornament: 'stars', overlay: 'hud', overlayLabel: 'TEST N°7 · PHILO'}, MACHINE);
