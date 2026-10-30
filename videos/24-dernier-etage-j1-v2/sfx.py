# Cue sheet — vidéo 24-dernier-etage-j1-v2 (style « Survie », V2 du jour 1). Comme les références : pas de musique, une nappe
# grave continue et des bruitages d'ambiance ; en plus de la V1 : fiche, plan, barricade, eau, rations, repas. Instants = balises.
import random

from sfx.synth import blip, boom, click, drone, envelope, impact, pop, riser, thud, whoosh
from sfx.survie import (beep, buzz, can_open, car_alarm, clank, clink, crash, eas, glitch, glug, heartbeat, moan,
                        power_down, scrape, siren, step, tick, water, wind)


def score(mix, tl):
    B = tl['beats']
    dur = tl['duration']
    end_t = B['fin'] + 0.35
    random.seed(24)
    roots = [(0, 55.0), (B['tel'], 58.27), (B['toi'], 52.0), (B['r1'], 55.0), (B['soir'], 49.0), (B['braque'], 46.25), (B['choix'], 41.2), (end_t, 55.0)]
    vol = envelope([(0, 0.25), (B['h2'], 0.18), (B['tel'] - 0.2, 0.18), (B['tel'], 0.7), (B['toi'], 0.6), (B['r1'], 0.7), (B['soir'], 0.75), (B['minuit'], 0.55), (B['tetes'], 0.8), (B['cent'], 1.0), (B['choix'], 0.9), (end_t, 0.6), (dur, 0.3)])
    l, r = drone(dur, roots, volume=vol)
    mix.put_stereo(0, l, r, 0.10)
    # ouverture
    mix.put(0.0, wind(7.0, 300), 0.05)
    mix.put(2.55, whoosh(1.5, 300, 2400, peak=0.6), 0.16)
    mix.put(B['h2'] + 0.08, boom(1.8, 48), 0.30)
    mix.put(B['h2'] + 0.08, impact(1.4), 0.10)
    # téléphone, alerte
    for dt in (0.12, 0.62, 1.1, 1.55):
        mix.put(B['tel'] + dt, buzz(), 0.22, pan=-0.1)
    mix.put(B['alerte'] - 0.12, buzz(0.5), 0.26)
    mix.put(B['alerte'] + 0.22, whoosh(0.3, 800, 3000, peak=0.5), 0.12)
    mix.put(B['alerte'] + 0.28, eas(3), 0.11)
    mix.put(B['lum'], eas(2, 0.35, 0.1), 0.05)
    # dehors : sirène, fuite, alarme de voiture
    mix.put(B['dehors'], siren(B['toi'] - B['dehors']), 0.05, pan=0.4)
    mix.put(B['bas'] - 0.1, whoosh(0.5, 2600, 400, peak=0.4), 0.14)
    for i in range(24):
        mix.put(B['bas'] + 0.2 + i * 0.19 + random.uniform(-0.04, 0.04), step(False), 0.035, pan=random.uniform(-0.6, 0.6))
    for i, t in enumerate([B['chasse'], B['chasse'] + 0.9, B['chasse'] + 1.6]):
        mix.put(t, moan(1.5, 85 + 12 * i, seed=i), 0.07, pan=-0.5 + 0.3 * i)
    mix.put(B['alarme'] + 0.6, car_alarm(B['toi'] - B['alarme'] - 0.4), 0.12, pan=-0.2)
    for i in range(5):
        mix.put(B['tous'] + i * 0.3, moan(1.3, 90 + 8 * i, seed=10 + i), 0.06, pan=random.uniform(-0.6, 0.6))
    # fiche, plan, coupe
    mix.put(B['toi'] - 0.05, whoosh(0.5, 400, 1800, peak=0.5), 0.12)
    for t in (B['toi'] + 0.6, B['appart'] + 1.0, B['appart'] + 1.9):
        mix.put(t, blip(880, 0.2, 0.06), 0.08)
    mix.put(B['appart'] + 2.1, thud(), 0.16)
    mix.put(B['porte'] - 0.35, whoosh(1.0, 300, 1200, peak=0.4), 0.07)
    mix.put(B['porte'], blip(440, 0.4, 0.15), 0.12)
    for i in range(3):
        mix.put(B['fen'] + i * 0.22, blip(1320, 0.25, 0.08), 0.09, pan=-0.4 + 0.4 * i)
    mix.put(B['esc'] - 0.15, whoosh(0.8, 1600, 300, peak=0.5), 0.1)
    mix.put(B['esc'] + 0.35, riser(1.15, 300, 1800), 0.06)
    # règles
    for tag, at in ((B['r1'], B['r1t']), (B['r2'] + 0.05, B['r2t']), (B['r3'] + 0.05, B['r3t'])):
        mix.put(tag, boom(1.4, 52), 0.22)
        mix.put(at - 0.05, whoosh(0.35, 600, 2600, peak=0.5), 0.1)
    # règle 1 : le canapé traîné, l'armoire qui s'écrase, les objets empilés
    t = B['r1'] - 0.05
    while t < B['r1'] + 0.55:
        mix.put(t, step(False), 0.06)
        t += 0.3
    mix.put(B['r1'] + 0.55, scrape(B['cana'] + 0.25 - B['r1'] - 0.55), 0.12)
    mix.put(B['armoire'] + 0.47, crash(), 0.26)
    for i in range(4):
        mix.put(B['lourd'] + 0.1 + i * 0.27 + 0.32, thud(), 0.16, pan=-0.4 + 0.2 * i)
    # règle 2 : le robinet, les casseroles, les bidons
    mix.put(B['r2t'] - 0.15, click(900, 0.05), 0.1)
    mix.put(B['r2t'] - 0.1, water(B['sec'] + 1.8 - B['r2t']), 0.08)
    for i in range(3):
        mix.put(B['bain'] + 0.75 + i * 0.25, clank(700 + 60 * i), 0.06, pan=0.5)
    for i in range(7):
        mix.put(B['bain'] + 1.3 + i * 0.22, glug(4), 0.05, pan=-0.6 + 0.2 * i)
    for i in range(4):
        mix.put(B['sec'] + 1.8 + i * 0.77, blip(1500, 0.15, 0.04), 0.05)
    # règle 3 : les vivres glissent dans les colonnes
    m0 = B['jours'] + 0.15
    stp = min(0.34, (B['frais'] - 0.2 - m0) / 10)
    for i in range(10):
        mix.put(m0 + i * stp, whoosh(0.22, 900, 400, peak=0.4), 0.05, pan=-0.5 + 0.1 * i)
        mix.put(m0 + i * stp + stp * 0.9, thud(), 0.05)
    for i in range(4):
        mix.put(B['jours'] + 0.1 + i * 0.12, pop(600 + 80 * i, 900, 0.12), 0.08)
        mix.put(B['fois'] + 0.2 + i * 0.18, tick(2400), 0.05)
    mix.put(B['frais'], thud(), 0.14)
    mix.put(B['frais'] + 1.15, thud(), 0.14)
    mix.put(B['jours'] + 1.3, pop(700, 1100, 0.14), 0.1)
    # le soir : la ville s'éteint ; la ration dans le noir
    mix.put(B['fenetres'] - 0.1, power_down(1.6), 0.2)
    for i in range(14):
        mix.put(B['fenetres'] + i * 0.11 + random.uniform(0, 0.05), click(1200 + random.uniform(-300, 300), 0.03), 0.05, pan=random.uniform(-0.8, 0.8))
    mix.put(B['ration'] + 0.05, can_open(), 0.12)
    t = B['ration'] + 0.6
    while t < B['minuit'] + 0.3:
        mix.put(t, clink(), 0.04, pan=-0.3)
        t += 1.33
    mix.put(B['ration'] + 1.6, pop(600, 400, 0.14), 0.08)
    # minuit : le cœur, la lumière d'en face
    mix.put(B['minuit'], heartbeat(60, B['sos'] - B['minuit']), 0.20)
    mix.put(B['allume'] + 0.38, click(2200, 0.04), 0.12, pan=-0.3)
    mix.put(B['face'] - 0.1, whoosh(1.4, 400, 1600, peak=0.4), 0.08)
    mix.put(B['jum'] + 0.25, whoosh(0.5, 900, 300, peak=0.4), 0.07)
    # jumelles : S O S
    mix.put(B['signal'] + 0.1, click(2600, 0.04), 0.1)
    for g0, on, off in ((B['m1'] + 0.02, 0.11, 0.09), (B['m2'] + 0.02, 0.2, 0.08), (B['m3'] + 0.02, 0.11, 0.09)):
        for i in range(3):
            mix.put(g0 + i * (on + off), beep(on, 880), 0.09)
    mix.put(B['sos'], boom(1.6, 60), 0.18)
    # règle 4
    mix.put(B['r4'], boom(1.4, 46), 0.24)
    mix.put(B['r4'] + 0.05, glitch(0.8), 0.05)
    mix.put(B['r4x'] - 0.02, glitch(0.25), 0.12)
    mix.put(B['r4x'], impact(1.2), 0.12)
    # la lampe braquée, les têtes
    mix.put(B['braque'], riser(B['tafen'] - B['braque'], 200, 3000), 0.10)
    mix.put(B['tafen'], boom(1.8, 44), 0.30)
    mix.put(B['tafen'], whoosh(0.6, 3000, 300, peak=0.6), 0.12)
    mix.put(B['tetes'], heartbeat(78, B['choix'] - B['tetes']), 0.16)
    mix.put(B['une'], moan(1.6, 80, seed=40), 0.12)
    for i in range(10):
        mix.put(B['dix'] + i * 0.05, moan(1.8, 75 + 5 * i, seed=50 + i), 0.035, pan=random.uniform(-0.7, 0.7))
    for i in range(24):
        mix.put(B['cent'] - 0.1 + i * 0.04, moan(2.2, 60 + 3 * i, seed=70 + i), 0.022, pan=random.uniform(-0.9, 0.9))
    # choix, fin
    mix.put(B['choix'], boom(2.0, 38), 0.26)
    mix.put(B['a'], pop(500, 900, 0.14), 0.14, pan=-0.2)
    mix.put(B['b'], pop(420, 760, 0.14), 0.14, pan=0.2)
    mix.put(end_t - 0.05, whoosh(0.5, 500, 2200, peak=0.5), 0.1)
    flip = B['fin'] + 1.55
    mix.put(flip - 0.03, glitch(0.4), 0.14)
    mix.put(flip, boom(2.2, 42), 0.30)
    mix.put(flip, impact(1.6), 0.12)

