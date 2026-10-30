# Cue sheet — vidéo 23-dernier-etage-j1 (style « Survie »). Comme les références : pas de musique, une nappe grave continue
# et des bruitages d'ambiance (sirène, alerte, vibreur, alarme, pas, vent, cœur, morse, râles, glitch). Instants = balises.
import random

from sfx.synth import boom, click, drone, envelope, impact, pop, riser, whoosh
from sfx.survie import beep, buzz, car_alarm, clank, eas, glitch, heartbeat, hum, moan, power_down, rotor, siren, step, tick, wind


def score(mix, tl):
    B = tl['beats']
    dur = tl['duration']
    end_t = B['fin'] + 0.35
    random.seed(23)
    # nappe : presque rien sur « plus aucun bruit », plus sombre la nuit, gonfle sur les têtes
    roots = [(0, 55.0), (B['tel'], 58.27), (B['r1'], 55.0), (B['soir'], 49.0), (B['braque'], 46.25), (B['choix'], 41.2), (end_t, 55.0)]
    vol = envelope([(0, 0.25), (B['h2'], 0.18), (B['tel'] - 0.2, 0.18), (B['tel'], 0.7), (B['soir'], 0.75), (B['minuit'], 0.55), (B['tetes'], 0.8), (B['cent'], 1.0), (B['choix'], 0.9), (end_t, 0.6), (dur, 0.3)])
    l, r = drone(dur, roots, volume=vol)
    mix.put_stereo(0, l, r, 0.10)
    # ouverture : vent, dézoom, titre
    mix.put(0.0, wind(7.0, 300), 0.05)
    mix.put(2.3, whoosh(1.5, 300, 2400, peak=0.6), 0.16)
    mix.put(B['h2'] + 0.06, boom(1.8, 48), 0.30)
    mix.put(B['h2'] + 0.06, impact(1.4), 0.10)
    # téléphone : vibreur à chaque notification, puis l'alerte
    for dt in (0.15, 0.7, 1.2, 1.65):
        mix.put(B['tel'] + dt, buzz(), 0.22, pan=-0.1)
    mix.put(B['alerte'] - 0.12, buzz(0.5), 0.26)
    mix.put(B['alerte'] + 0.22, whoosh(0.3, 800, 3000, peak=0.5), 0.12)
    mix.put(B['alerte'] + 0.28, eas(3), 0.11)
    mix.put(B['lum'], eas(2, 0.35, 0.1), 0.05)
    # dehors : sirène lointaine, râles, foule qui court
    mix.put(B['dehors'], siren(B['r2'] - B['dehors']), 0.05, pan=0.4)
    mix.put(B['bas'] - 0.1, whoosh(0.5, 2600, 400, peak=0.4), 0.14)
    for i in range(26):
        t = B['bas'] + 0.2 + i * 0.19 + random.uniform(-0.04, 0.04)
        mix.put(t, step(False), 0.035, pan=random.uniform(-0.6, 0.6))
    for i, t in enumerate([B['chasse'], B['chasse'] + 0.9, B['chasse'] + 1.7, B['r1'] + 0.6]):
        mix.put(t, moan(1.5, 85 + 12 * i, seed=i), 0.07, pan=-0.5 + 0.3 * i)
    # règles : coup grave sur l'étiquette, souffle sur le titre
    for tag, at in ((B['r1'], B['r1t']), (B['r2'] + 0.05, B['r2t']), (B['r3'] + 0.05, B['r3t'])):
        mix.put(tag, boom(1.4, 52), 0.22)
        mix.put(at - 0.05, whoosh(0.35, 600, 2600, peak=0.5), 0.1)
    # règle 1 : l'alarme de voiture attire tout le monde
    mix.put(B['r1y'] - 0.15, car_alarm(B['r2'] - B['r1y']), 0.12, pan=-0.2)
    for i in range(5):
        mix.put(B['r1y'] + 0.6 + i * 0.35, moan(1.3, 90 + 8 * i, seed=10 + i), 0.06, pan=random.uniform(-0.6, 0.6))
    # cuisine : frigo, tic-tac qui s'emballe pendant l'ellipse, le courant faiblit
    mix.put(B['r2'], hum(B['r3'] - B['r2'], 58), 0.035)
    ff0, ff1 = B['r2x'], B['r3'] - 0.4
    t, gap = ff0, 0.32
    while t < ff1:
        mix.put(t, tick(), 0.06)
        t += gap
        gap = max(0.05, gap * 0.86)
    mix.put(ff1 - 0.25, click(400, 0.08), 0.12)
    # escalier : pas sur le béton, échelle, trappe, vent du toit, rotor au loin
    lad = B['r3x'] - 0.1
    t = B['r3'] + 0.2
    while t < lad:
        mix.put(t, step(True), 0.08, pan=-0.2)
        t += 0.42
    for i in range(4):
        mix.put(lad + 0.1 + i * 0.27, clank(480 + 40 * i), 0.07, pan=0.3)
    mix.put(B['r3x'] + 1.05, boom(0.8, 70), 0.14)
    mix.put(B['r3x'] + 1.05, wind(B['soir'] - B['r3x'] - 1.0, 520), 0.07)
    mix.put(B['r3y'], rotor(B['soir'] - B['r3y']), 0.05, pan=-0.5)
    # le soir : la ville s'éteint
    mix.put(B['fenetres'] - 0.1, power_down(1.6), 0.2)
    for i in range(14):
        mix.put(B['fenetres'] + i * 0.11 + random.uniform(0, 0.05), click(1200 + random.uniform(-300, 300), 0.03), 0.05, pan=random.uniform(-0.8, 0.8))
    # minuit : le cœur, la lumière d'en face
    mix.put(B['minuit'], heartbeat(60, B['sos'] - B['minuit']), 0.20)
    mix.put(B['allume'] + 0.38, click(2200, 0.04), 0.12, pan=-0.3)
    mix.put(B['face'] - 0.1, whoosh(1.4, 400, 1600, peak=0.4), 0.08)
    mix.put(B['jum'] + 0.25, whoosh(0.5, 900, 300, peak=0.4), 0.07)
    # jumelles : la lampe en morse (S O S)
    mix.put(B['signal'] + 0.1, click(2600, 0.04), 0.1)
    for g0, on, off in ((B['m1'] + 0.02, 0.11, 0.09), (B['m2'] + 0.02, 0.2, 0.08), (B['m3'] + 0.02, 0.11, 0.09)):
        for i in range(3):
            mix.put(g0 + i * (on + off), beep(on, 880), 0.09)
    mix.put(B['sos'], boom(1.6, 60), 0.18)
    # règle 4 : censure qui grésille, révélation
    mix.put(B['r4'], boom(1.4, 46), 0.24)
    mix.put(B['r4'] + 0.05, glitch(0.8), 0.05)
    mix.put(B['r4x'] - 0.02, glitch(0.25), 0.12)
    mix.put(B['r4x'], impact(1.2), 0.12)
    # la lampe braquée sur ta fenêtre : montée, flash
    mix.put(B['braque'], riser(B['tafen'] - B['braque'], 200, 3000), 0.10)
    mix.put(B['tafen'], boom(1.8, 44), 0.30)
    mix.put(B['tafen'], whoosh(0.6, 3000, 300, peak=0.6), 0.12)
    # les têtes se lèvent : une, dix, cent
    mix.put(B['tetes'], heartbeat(78, B['choix'] - B['tetes']), 0.16)
    mix.put(B['une'], moan(1.6, 80, seed=40), 0.12)
    for i in range(10):
        mix.put(B['dix'] + i * 0.05, moan(1.8, 75 + 5 * i, seed=50 + i), 0.035, pan=random.uniform(-0.7, 0.7))
    for i in range(24):
        mix.put(B['cent'] - 0.1 + i * 0.04, moan(2.2, 60 + 3 * i, seed=70 + i), 0.022, pan=random.uniform(-0.9, 0.9))
    # choix
    mix.put(B['choix'], boom(2.0, 38), 0.26)
    mix.put(B['a'], pop(500, 900, 0.14), 0.14, pan=-0.2)
    mix.put(B['b'], pop(420, 760, 0.14), 0.14, pan=0.2)
    # fin : JOUR 1 → glitch → JOUR 2
    mix.put(end_t - 0.05, whoosh(0.5, 500, 2200, peak=0.5), 0.1)
    flip = B['fin'] + 1.62
    mix.put(flip - 0.03, glitch(0.4), 0.14)
    mix.put(flip, boom(2.2, 42), 0.30)
    mix.put(flip, impact(1.6), 0.12)
