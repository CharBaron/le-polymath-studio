// 31 — Le trou dans ton œil. Style optique / test de vision (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {OEIL} from '../gravure/anim/Oeil';
import {shotsOf} from './Oeil.shots';

export const Oeil = makeReel('31-tache-aveugle', shotsOf, undefined, {accent: 'sang', display: 'playfair', label: 'plex', ornament: 'rule', overlay: 'hud', overlayLabel: 'TEST N°4 · TON ŒIL'}, OEIL);
