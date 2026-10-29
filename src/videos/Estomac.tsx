// 21 — L'homme au trou dans l'estomac. Style planche d'anatomie (DA « Gravure » v3.1 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {ESTOMAC} from '../gravure/anim/Estomac';
import {shotsOf} from './Estomac.shots';

export const Estomac = makeReel('21-estomac-ficelle', shotsOf, undefined, {accent: 'encre', display: 'fell', label: 'fell', base: 'light', ornament: 'rule'}, ESTOMAC);
