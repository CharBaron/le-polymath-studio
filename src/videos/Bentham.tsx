// 36 — Jeremy Bentham, le philosophe empaillé. Style cabinet (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {BENTHAM} from '../gravure/anim/Bentham';
import {shotsOf} from './Bentham.shots';

export const Bentham = makeReel('36-bentham', shotsOf, undefined, {accent: 'pourpre', display: 'playfair', label: 'cinzel', ornament: 'greek'}, BENTHAM);
