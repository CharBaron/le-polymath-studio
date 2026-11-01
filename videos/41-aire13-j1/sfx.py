# Cue sheet — vidéo 41-aire13-j1 (AIRE 13, jour 1). Pas de musique : l'aire elle-même (autoroute au loin, moteurs au ralenti,
# pluie fine) en bruitages ElevenLabs aux moments qui comptent, nappe grave et sons répétitifs synthétisés ; instants = balises.
# Règles : on entend avant de voir (klaxon, moteur qui cale), un vrai silence avant chaque sursaut, un son par coupe.
import math
import os
import random
import sys

import numpy as np
import soundfile as sf

from sfx.synth import SR, blip, boom, click, drone, envelope, impact, pop, riser, thud, whoosh
from sfx.survie import glitch, heartbeat, neon_flick, power_down, wind

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'tts'))
from sfx_eleven import sfx as eleven  # noqa: E402

BUILD = os.path.join(os.path.dirname(__file__), 'build', 'sfx')
os.makedirs(BUILD, exist_ok=True)

# bruitages générés (cache dans sfx/eleven/ : relancer ne coûte rien)
GEN = {
    'aire': ('night ambience of an empty highway rest area in thick fog: distant highway traffic swooshing by, several car engines idling nearby, light rain pattering on car roofs, no voices, no music', 22, 0.45),
    'route': ('inside a car driving on the highway at night in the rain: steady road and tyre noise, windshield wipers squeaking across wet glass, muffled engine', 6, 0.5),
    'ding': ('modern car door-ajar warning chime: soft repeated dings, with the engine idling, heard from inside the car', 4, 0.6),
    'contact': ('close up of a car ignition key turned off: key click, the engine shuts down and winds to a stop, then the cabin goes silent', 2.5, 0.6),
    'claque': ('a car door closing outside in the rain, solid thunk', 1.0, 0.6),
    'pas': ('footsteps of one person walking on wet asphalt in light rain', 3.5, 0.55),
    'neon': ('fluorescent tube light buzzing and flickering with electrical crackles, inside an empty shop at night', 4.5, 0.55),
    'klaxon': ('one long car horn blast in an empty foggy parking lot at night, distant echo', 1.6, 0.6),
    'cale': ('an old car engine sputtering, coughing and stalling, then dying out', 2.0, 0.6),
    'demarre': ('car engine starter cranking twice then the engine catches and idles', 2.2, 0.6),
    'lourds': ('slow heavy dragging footsteps on wet gravel and asphalt, approaching from the distance, unnatural', 6, 0.5),
    'sursaut': ('horror jump scare hit: deep sub impact with a sharp metallic screech and a gasp of air', 1.6, 0.55),
}


def g(name):
    """bruitage généré, mono 48 kHz, crête à 0,9"""
    prompt, dur, infl = GEN[name]
    out = os.path.join(BUILD, name + '.wav')
    eleven(prompt, out, dur, infl)
    y, sr = sf.read(out)
    y = y.mean(1) if y.ndim > 1 else y
    if sr != SR:
        y = np.interp(np.arange(0, len(y) * SR / sr) * sr / SR, np.arange(len(y)), y)
    return y / (np.max(np.abs(y)) + 1e-9) * 0.9


def loop(y, dur, xf=1.5):
    """boucle sans couture (fondu enchaîné) jusqu'à `dur` secondes"""
    n, x = int(dur * SR), int(xf * SR)
    out = np.zeros(n + len(y))
    i = 0
    ramp = np.linspace(0, 1, x)
    while i < n:
        seg = y.copy()
        seg[:x] *= ramp
        seg[-x:] *= ramp[::-1]
        out[i:i + len(seg)] += seg
        i += len(seg) - x
    return out[:n]


def env_at(points, n):
    """courbe de gain linéaire par morceaux [(t, g), …] échantillonnée sur n échantillons"""
    ts = np.array([p[0] for p in points]) * SR
    gs = np.array([p[1] for p in points])
    return np.interp(np.arange(n), ts, gs)


def score(mix, tl):
    B = tl['beats']
    dur = tl['duration']
    end_t = B['fin'] + 0.35
    random.seed(41)
    n = int(dur * SR)

    # ---- nappe grave (tension) : monte aux règles, retombe dans les silences, gronde au choix
    l, r = drone(dur, [(0, 41.2), (B['dil'], 43.65), (B['toi'], 38.9), (B['pan'], 46.25), (B['klax'], 36.7), (B['ta'], 41.2), (B['choix'], 36.7), (end_t, 41.2)],
                 volume=envelope([(0, 0.8), (B['h3'], 0.9), (B['toi'], 0.45), (B['pan'], 0.7), (B['att'], 1.0), (B['klax'], 0.8), (B['avance'] - 0.5, 0.15), (B['avance'], 1.0), (B['ta'], 0.8), (B['regle'] - 0.4, 0.15), (B['regle'], 1.0), (B['choix'], 1.0), (dur, 0.3)]))
    mix.put_stereo(0, l, r, 0.09)

    # ---- l'aire : autoroute au loin, moteurs au ralenti, pluie. Pleine dans le parking, étouffée dans les voitures,
    # coupée sur l'autoroute (on roule), et presque muette juste avant les sursauts.
    aire = loop(g('aire'), dur + 0.5)[:n]
    inside = 0.32
    pts = [(0, 1), (B['h2'] - 0.02, 1), (B['h2'], inside), (B['dil'] - 0.05, inside), (B['dil'], 0.9), (B['toi'] - 0.05, 0.9), (B['toi'], 0), (B['gare'] - 0.1, 0), (B['gare'] + 0.3, inside),
           (B['coupe'] + 0.2, inside), (B['coupe'] + 0.9, 0.12), (B['sors'] - 0.05, 0.12), (B['sors'], 1), (B['cafe'] - 0.02, 1), (B['cafe'], inside), (B['pan'] - 0.02, inside), (B['pan'], 0.55),
           (B['r2'] - 0.02, 0.55), (B['r2'], 1), (B['avance'] - 0.55, 1), (B['avance'] - 0.4, 0.06), (B['avance'] - 0.02, 0.06), (B['avance'], 1), (B['regle'] - 0.5, 1),
           (B['regle'] - 0.35, 0.08), (B['regle'] - 0.02, 0.08), (B['regle'], 0.9), (end_t, 0.9), (end_t + 0.4, 0.35), (dur, 0.2)]
    aire = aire * env_at(pts, n)
    mix.put_stereo(0, list(aire * 0.9), list(np.roll(aire, int(0.013 * SR)) * 0.9), 0.55)
    mix.put(0, wind(dur, base=320), 0.035)

    # ---- 1 · accroche : un coup sourd à l'image 0, souffle sur la coupe vers le plan large
    mix.put(0, boom(1.8, 44), 0.3)
    mix.put(0.02, impact(1.0), 0.07)
    mix.put(B['h1b'] - 0.12, whoosh(0.5, 300, 1400, peak=0.6), 0.08)
    # ---- 2 · l'habitacle vide : le carillon de portière ouverte, le moteur qui tourne
    ding = g('ding')
    mix.put(B['h2'] - 0.08, list(ding[: int((B['dil'] - B['h2'] + 0.1) * SR)]), 0.32)
    mix.put(B['h2'] - 0.05, thud(), 0.12)
    # ---- 3 · titre AIRE 13 · JOUR 1 au ras du sol : gouttes dans les flaques, grosse caisse
    mix.put(B['dil'] - 0.1, whoosh(0.4, 500, 2600, peak=0.5), 0.08)
    mix.put(B['dil'] + 0.1, boom(2.2, 40), 0.3)
    for i in range(7):
        mix.put(B['dil'] + 0.2 + i * 0.33 + random.uniform(0, 0.12), blip(1900 + 400 * random.random(), 0.08, 0.025), 0.035, pan=random.uniform(-0.6, 0.6))
    # ---- 4 · sur l'autoroute : route + essuie-glaces ; tu te gares
    route = loop(g('route'), B['gare'] - B['toi'] + 0.3, xf=0.8)
    route[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))
    mix.put(B['toi'] - 0.05, list(route), 0.5)
    mix.put(B['toi'] - 0.1, whoosh(0.5, 900, 250, peak=0.4), 0.08)
    mix.put(B['toi'] + 0.4, pop(500, 900, 0.14), 0.05)  # pastille TOI
    mix.put(B['gare'] - 0.15, whoosh(0.7, 400, 120, peak=0.5), 0.12)
    mix.put(B['gare'] + 0.25, thud(), 0.12)
    # ---- 5 · la clé tourne, le moteur meurt, silence
    mix.put(B['coupe'] + 0.1, list(g('contact')), 0.55)
    mix.put(B['coupe'] + 0.42, pop(700, 350, 0.18), 0.08)  # MOTEUR → OFF
    # ---- 6 · tu sors : portière, pas mouillés jusqu'à la Clio, la portière claque derrière
    mix.put(B['sors'] - 0.05, click(900, 0.06), 0.18)
    mix.put(B['clio'] - 0.42, list(g('claque')), 0.42, pan=0.35)
    pas = g('pas')
    mix.put(B['sors'] + 0.3, list(pas[: int((B['cafe'] - B['sors'] - 0.35) * SR)]), 0.4, pan=0.15)
    mix.put(B['clio'] + 0.2, list(ding[: int(1.4 * SR)]), 0.12, pan=-0.4)
    # ---- 7 · le café : la Clio de l'intérieur, carillon lointain ; « personne » : coup grave
    mix.put(B['cafe'] - 0.05, whoosh(0.4, 700, 300, peak=0.4), 0.06)
    mix.put(B['cafe'], list(ding[int(0.5 * SR): int(2.4 * SR)]), 0.16)
    mix.put(B['pers'] - 0.03, boom(1.4, 50), 0.22)
    mix.put(B['pers'], list(ding[: int(1.0 * SR)]), 0.18)
    # ---- 8 · la boutique : néon qui grésille, la règle 1 arrachée (barres + coup sourd)
    neon = g('neon')
    mix.put(B['pan'] - 0.05, list(neon[: int((B['r2'] - B['pan'] + 0.1) * SR)]), 0.3)
    mix.put(B['pan'] - 0.05, thud(), 0.12)
    mix.put(B['arr'] - 0.02, boom(1.4, 52), 0.22)
    mix.put(B['arr'] + 0.05, glitch(0.35), 0.08)
    # ---- 9 · règles 2 et 3 : étiquette (grave) + titre (souffle) ; cœur au bout du faisceau
    for tag, at in ((B['r2'], B['r2t']), (B['r3'], B['r3t'])):
        mix.put(tag - 0.02, boom(1.4, 52), 0.22)
        mix.put(at - 0.05, whoosh(0.35, 600, 2600, peak=0.5), 0.1)
    mix.put(B['bout'] - 0.1, whoosh(1.3, 200, 900, peak=0.7), 0.1)
    mix.put(B['bout'], heartbeat(66, B['klax'] - B['bout']), 0.16)
    mix.put(B['att'] - 0.03, boom(2.0, 38), 0.32)
    mix.put(B['att'], riser(B['r3'] - B['att'], 120, 700), 0.05)
    mix.put(B['r3'] + 0.3, list(ding[: int(2.4 * SR)]), 0.14, pan=0.3)
    # ---- 10 · le klaxon (avant l'image), la berline cale, ses phares claquent ; puis silence
    mix.put(B['klax'] - 0.28, list(g('klaxon')), 0.5, pan=-0.3)
    mix.put(B['cale'] - 0.1, list(g('cale')), 0.55, pan=-0.2)
    mix.put(B['eteint'] - 0.05, power_down(1.2), 0.18)
    for i in range(6):
        if i % 2 == 0:
            mix.put(B['eteint'] + i / 16, neon_flick(), 0.1)
    # ---- 11 · il avance : un pas mouillé à chaque bond, sursaut au dernier
    lourds = g('lourds')
    for i, t in enumerate((B['avance'], B['avance'] + 0.55)):
        mix.put(t - 0.04, list(lourds[int((0.6 + i) * SR): int((1.1 + i) * SR)]), 0.5)
        mix.put(t, thud(), 0.16)
    mix.put(B['avance'] + 1.08, list(g('sursaut')), 0.75)
    mix.put(B['avance'] + 1.1, boom(2.0, 34), 0.4)
    # ---- 12 · il monte : la portière ; les phares se rallument, le moteur repart
    mix.put(B['monte'] - 0.2, list(g('claque')), 0.4, pan=-0.2)
    mix.put(B['monte'] - 0.05, whoosh(0.4, 600, 200, peak=0.4), 0.06)
    mix.put(B['rallume'] - 0.5, list(g('demarre')), 0.55, pan=-0.2)
    mix.put(B['rallume'] + 0.02, click(1400, 0.05), 0.12)
    # ---- 13 · ta voiture : cœur, ce qui marche vers elle (pas lourds au loin, à droite), puis silence avant la règle 1
    mix.put(B['ta'] - 0.05, boom(1.6, 46), 0.22)
    mix.put(B['ta'], heartbeat(80, B['regle'] - B['ta'] - 0.4), 0.18)
    mix.put(B['marche'] - 0.3, list(lourds[: int((B['regle'] - B['marche'] - 0.1) * SR)] * np.linspace(0.35, 1, int((B['regle'] - B['marche'] - 0.1) * SR))), 0.4, pan=0.55)
    mix.put(B['regle'] - 0.02, boom(2.0, 40), 0.34)
    mix.put(B['regle'] + 0.05, glitch(0.4), 0.1)
    # ---- 14 · révélation : la clé en rouge, grave + impact
    mix.put(B['r1t'] - 0.03, list(g('contact')[: int(0.6 * SR)]), 0.4)
    mix.put(B['r1t'], impact(1.4), 0.2)
    mix.put(B['r1t'], boom(2.4, 36), 0.4)
    mix.put(B['r1t'] + 0.48, whoosh(0.3, 1800, 400, peak=0.4), 0.08)
    # ---- 15 · le choix : le cœur accélère, pas lourds qui se rapprochent, pops A et B
    mix.put(B['choix'] - 0.05, boom(2.0, 38), 0.3)
    mix.put(B['choix'], heartbeat(104, end_t - B['choix']), 0.2)
    mix.put(B['choix'] + 0.4, list(lourds[int(1.5 * SR): int(min(5.8, 1.5 + end_t - B['choix'] - 0.4) * SR)]), 0.5, pan=0.5)
    mix.put(B['a'], pop(500, 900, 0.14), 0.14, pan=-0.3)
    mix.put(B['b'], pop(420, 760, 0.14), 0.14, pan=0.3)
    mix.put(B['noir'] - 0.05, riser(end_t - B['noir'] + 0.1, 150, 1400), 0.07)
    # ---- 16 · carte de fin : JOUR 1 → glitch → JOUR 2
    mix.put(end_t - 0.05, whoosh(0.5, 500, 2200, peak=0.5), 0.1)
    mix.put(B['flip'] - 0.03, glitch(0.4), 0.14)
    mix.put(B['flip'], boom(2.2, 42), 0.32)
    mix.put(B['flip'], impact(1.6), 0.12)
    mix.put(B['flip'] + 0.6, list(g('klaxon')), 0.12, pan=0.6)
