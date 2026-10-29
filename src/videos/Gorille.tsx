// 19 — Le gorille invisible. Style labo / écran de test (DA « Gravure » v3.1 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {GORILLE} from '../gravure/anim/Gorille';
import {shotsOf} from './Gorille.shots';

export const Gorille = makeReel('19-gorille-invisible', shotsOf, undefined, {accent: 'electrique', label: 'plex', ornament: 'rule', overlay: 'hud', overlayLabel: 'TEST N°1 · ATTENTION SÉLECTIVE'}, GORILLE);
