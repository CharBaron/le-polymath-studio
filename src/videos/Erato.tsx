// 22 — Ératosthène mesure la Terre. Style atlas céleste (DA « Gravure » v3.1 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {ERATO} from '../gravure/anim/Erato';
import {shotsOf} from './Erato.shots';

export const Erato = makeReel('22-eratosthene', shotsOf, undefined, {accent: 'or', display: 'cormorant', label: 'cinzel', ornament: 'stars'}, ERATO);
