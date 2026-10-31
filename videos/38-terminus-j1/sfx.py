# Cue sheet — vidéo 38-terminus-j1 (TERMINUS, jour 1). Pas de musique : nappe grave, quai, rame, néons ; instants = balises.
# Les claquements de néon tombent sur les mêmes coupures que l'image (même `flicker` que src/survie/terminus.tsx).
import math
import random

from sfx.synth import blip, boom, click, drone, envelope, impact, pop, riser, thud, whoosh
from sfx.survie import (brakes, chime_pa, door_beep, doors_open, drip, glitch, heartbeat, neon_buzz, neon_flick, neon_pop,
                        power_down, rumble, static, step, wet_step, whisper, wind)


def rnd(n):
    x = math.sin(n * 127.1 + 311.7) * 43758.5453
    return x - math.floor(x)


def flicker(T, seed, rate=0.22):
    f = math.floor(T * 24)
    if rnd(math.floor(T * 1.7) * 13 + seed) >= rate * 2.2:
        return 0.92 + 0.08 * rnd(f + seed * 7)
    return 0.08 if rnd(f * 3 + seed) < 0.55 else 0.95


def offs(t0, t1, seed, rate):
    """instants où le néon passe d'allumé à éteint (balayage image par image)"""
    out, prev, t = [], True, t0
    while t < t1:
        on = flicker(t, seed, rate) > 0.5
        if prev and not on:
            out.append(t)
        prev, t = on, t + 1 / 30
    return out


def score(mix, tl):
    B = tl['beats']
    dur = tl['duration']
    end_t = B['fin'] + 0.35
    random.seed(38)
    l, r = drone(dur, [(0, 41.2), (B['dil'], 43.65), (B['portes'], 38.9), (B['r3'], 46.25), (B['clac'], 36.7), (B['revient'], 41.2), (B['inter'], 43.65), (B['choix'], 36.7), (end_t, 41.2)],
                 volume=envelope([(0, 0.75), (B['h3'], 0.9), (B['toi'], 0.5), (B['portes'], 0.7), (B['r2'], 0.8), (B['clac'], 1.0), (B['noir'], 0.45), (B['revient'], 0.9), (B['inter'], 0.8), (B['choix'], 1.0), (dur, 0.3)]))
    mix.put_stereo(0, l, r, 0.10)
    # la station : souffle du tunnel, gouttes, la rame au ralenti jusqu'à la fermeture des portes
    mix.put(0, wind(dur, base=300), 0.05)
    mix.put(0, rumble(min(dur, B['ferme'] + 1.5)), 0.16)
    for _ in range(14):
        mix.put(random.uniform(0.3, dur - 2), drip(), random.uniform(0.04, 0.08), pan=random.uniform(-0.8, 0.8))
    # accroche : le néon au-dessus de la silhouette grésille
    mix.put(0, neon_buzz(B['h3'] - 0.15), 0.05, pan=0.3)
    for t in offs(0, B['h3'] - 0.15, 11, 0.3):
        mix.put(t, neon_flick(), 0.09, pan=0.25)
    # « ta rame s'arrête » : les freins, puis la secousse sur le plan de ligne ; le voyant qui clignote
    mix.put(B['h2'] - 0.3, brakes(2.4), 0.07, pan=-0.3)
    mix.put(B['h3'] - 0.15, thud(), 0.22)
    mix.put(B['h3'] - 0.15, boom(1.2, 48), 0.14)
    stop = B['h3'] + 0.85
    m = math.ceil((stop * 5 - 1) / 2)
    while (2 * m + 1) / 5 < B['dil'] - 0.1:
        mix.put((2 * m + 1) / 5, blip(1320, 0.12, 0.04), 0.05)
        m += 1
    # titre de série, pastille « TOI »
    mix.put(B['dil'] + 0.1, whoosh(0.6, 300, 2400, peak=0.7), 0.12)
    mix.put(B['dil'] + 0.1, boom(2.0, 41), 0.26)
    mix.put(B['voix'] - 0.3, pop(500, 900, 0.14), 0.1)
    # dans la voiture : le téléphone, pas de réseau, vous êtes trois
    mix.put(B['toi'] - 0.1, whoosh(0.5, 900, 300, peak=0.3), 0.06)
    mix.put(B['batt'], click(2400, 0.04), 0.1)
    mix.put(B['batt'] + 0.12, click(2600, 0.04), 0.08)
    mix.put(B['reseau'], blip(520, 0.2, 0.06), 0.08)
    mix.put(B['reseau'] + 0.18, blip(390, 0.25, 0.08), 0.08)
    mix.put(B['trois'], pop(400, 700, 0.16), 0.12)
    # les portes s'ouvrent, le carillon, l'annonce ; néon du quai qui grésille
    mix.put(B['portes'] + 0.08, doors_open(), 0.16)
    mix.put(B['hp'] - 0.85, chime_pa(), 0.16, pan=-0.4)
    mix.put(B['portes'], neon_buzz(B['r2'] - B['portes']), 0.03, pan=0.2)
    for t in offs(B['portes'], B['r2'], 21, 0.14):
        mix.put(t, neon_flick(), 0.06, pan=0.2)
    for tag, at in ((B['r1'], B['r1t']), (B['r2'], B['r2t']), (B['r3'], B['r3t'])):
        mix.put(tag, boom(1.4, 52), 0.2)
        mix.put(at - 0.05, whoosh(0.35, 600, 2600, peak=0.5), 0.1)
    # les traces mouillées, une à une jusqu'à ta porte
    for i in range(1, 7):
        t = B['traces'] + (B['porte'] + 0.4 - B['traces']) * i / 6.99
        mix.put(t, wet_step(), 0.13, pan=-0.6 + 0.2 * i)
    # dans la vitre : quelqu'un approche, par bonds, à chaque coupure du néon
    mix.put(B['yeux'], heartbeat(72, B['r3'] - B['yeux']), 0.14)
    for t, f in ((B['vitre'], 62), (B['approche'], 56), (B['approche'] + 0.85, 48)):
        mix.put(t - 0.12, neon_flick(), 0.12)
        mix.put(t, boom(1.0, f), 0.14)
    mix.put(B['approche'] + 0.85, impact(1.0), 0.1)
    # on se compte : un, deux, trois
    for i, k in enumerate(('un', 'deux', 'trois2')):
        mix.put(B[k], pop(420 + 120 * i, 700 + 160 * i, 0.16), 0.14)
    # le néon claque, noir total, des pas, la lumière revient : vous êtes quatre
    off = B['clac'] + 0.05
    mix.put(off, neon_pop(), 0.22)
    mix.put(off, power_down(1.4), 0.2)
    for i in range(8):
        if i % 3 == 0:
            mix.put(off + i / 18, neon_flick(), 0.08)
    mix.put(B['noir'], heartbeat(88, B['revient'] - B['noir'] + 1.5), 0.2)
    for i in range(5):
        mix.put(B['pas'] - 0.1 + (B['revient'] - B['pas']) * (i + 0.5) / 5, step(True), 0.16, pan=0.6 - 0.25 * i)
    for i in range(5):
        mix.put(B['revient'] + i * 0.125, neon_flick(), 0.1)
    mix.put(B['revient'] + 0.6, neon_buzz(B['inter'] - B['revient'] - 0.6), 0.025)
    mix.put(B['quatre'], boom(2.0, 36), 0.3)
    mix.put(B['quatre'], glitch(0.4), 0.1)
    mix.put(B['quatre'] + 0.1, pop(300, 520, 0.2), 0.12)
    # on murmure ton prénom ; rappel de la règle 3
    mix.put(B['prenom'] - 0.2, whisper(1.6), 0.06, pan=-0.5)
    mix.put(B['prenom'] + 0.4, boom(1.4, 52), 0.2)
    mix.put(B['prenom'] + 1.15, glitch(0.35), 0.12)
    mix.put(B['prenom'] + 0.3, riser(B['inter'] - B['prenom'] - 0.3, 150, 1200), 0.06)
    # « le conducteur » à l'interphone
    mix.put(B['inter'] - 0.08, click(900, 0.05), 0.15)
    mix.put(B['inter'] - 0.05, static(B['ferme'] - B['inter']), 0.06)
    mix.put(B['desc'], impact(1.2), 0.12)
    mix.put(B['ferme'] - 0.1, click(700, 0.05), 0.12)
    # les portes se ferment : le signal, les vantaux, la main sur la barre
    m = math.ceil((B['ferme'] * 4 - 1) / 2)
    while (2 * m + 1) / 4 < end_t:
        mix.put((2 * m + 1) / 4, door_beep(), 0.09)
        m += 1
    mix.put(B['ferme'], whoosh(end_t - B['ferme'], 220, 120, peak=0.5), 0.05)
    mix.put(B['choix'] - 0.2, boom(1.6, 44), 0.14)
    mix.put(B['choix'] - 0.2, heartbeat(96, end_t - B['choix'] + 0.2), 0.14)
    mix.put(B['qui'] - 0.05, boom(2.0, 38), 0.26)
    mix.put(B['a'], pop(500, 900, 0.14), 0.14, pan=-0.2)
    mix.put(B['b'], pop(420, 760, 0.14), 0.14, pan=0.2)
    # carte de fin : JOUR 1 → glitch → JOUR 2, le néon grésille sous la carte
    mix.put(end_t - 0.05, whoosh(0.5, 500, 2200, peak=0.5), 0.1)
    flip = B['flip']
    mix.put(flip - 0.03, glitch(0.4), 0.14)
    mix.put(flip, boom(2.2, 42), 0.30)
    mix.put(flip, impact(1.6), 0.12)
    for t in offs(end_t, dur, 77, 0.3):
        mix.put(t, neon_flick(), 0.06)
