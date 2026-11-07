// 46 — Cet enculé de biceps. Style écorché (DA « Gravure » v3.2, planche d'anatomie dessinée en code).
import {makeReel} from '../gravure/Reel';
import {BICEPS} from '../gravure/anim/Biceps';
import {shotsOf} from './BicepsMenteur.shots';

export const BicepsMenteur = makeReel('46-biceps-menteur', shotsOf, undefined, {accent: 'sang', display: 'fell', label: 'plex', ornament: 'rule', hookBig: 'ink'}, BICEPS);
