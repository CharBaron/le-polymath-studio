# Cue sheet — vidéo 40-dernier-etage-j4b (jour 4, « tu te tais »). Nappe grave + bruitages ; instants = balises.
# Les coups du pied-de-biche tombent sur les mêmes instants que l'image (src/videos/DernierEtage4B.tsx).
import random

from sfx.synth import boom, click, drone, envelope, impact, pop, riser, thud, whoosh
from sfx.survie import clank, crash, glitch, glug, heartbeat, knock, scrape, static, step, water


def score(mix, tl):
    B = tl['beats']
    dur = tl['duration']
    end_t = B['fin'] + 0.35
    random.seed(40)
    l, r = drone(dur, [(0, 41.2), (B['dil'], 46.25), (B['jour'], 49.0), (B['glou'], 43.65), (B['nuit'], 41.2), (B['choix'], 38.9), (end_t, 55.0)],
                 volume=envelope([(0, 0.9), (B['dil'], 0.6), (B['jour'], 0.55), (B['glou'], 0.7), (B['nuit'], 0.9), (B['choix'], 1.0), (dur, 0.3)]))
    mix.put_stereo(0, l, r, 0.10)
    pries = [0.5, 1.7, 2.9, 4.0, B['biche'] + 0.1, B['biche'] + 0.9, B['craque'], B['craque'] + 1.3, B['radio'] + 1.6, B['choix'] + 0.3, B['choix'] + 1.4, B['q'] + 0.9, B['a'] + 0.8, B['b'] + 0.9]
    for t in pries:
        mix.put(t - 0.15, scrape(0.4), 0.08, pan=-0.3)
        mix.put(t, knock(), 0.3, pan=-0.3)
        mix.put(t, thud(), 0.12)
    mix.put(0.0, boom(1.8, 44), 0.22)
    mix.put(0.6, static(1.6), 0.06)
    mix.put(2.3, crash(0.8), 0.08)
    mix.put(B['dil'], whoosh(0.6, 300, 1400, peak=0.5), 0.1)
    # la matinée : il appelle, tu ne bouges pas
    mix.put(B['rien'], heartbeat(64, B['glou'] - B['rien']), 0.14)
    mix.put(B['mort'] + 1.2, boom(1.4, 50), 0.16)
    # le ballon qui se vide, la vanne
    mix.put(B['glou'], glug(6), 0.22)
    mix.put(B['baisse'], water(B['vanne'] - B['baisse'] + 0.4, 0.7), 0.08)
    mix.put(B['dessous'], water(B['vanne'] - B['dessous'] + 0.4, 1.2), 0.08, pan=0.2)
    mix.put(B['vide'], riser(B['vanne'] - B['vide'], 200, 1400), 0.06)
    mix.put(B['vanne'], clank(420), 0.3)
    mix.put(B['vanne'] + 0.1, glug(3), 0.14)
    mix.put(B['r9'], boom(1.4, 52), 0.22)
    mix.put(B['r9t'] - 0.05, whoosh(0.35, 600, 2600, peak=0.5), 0.1)
    mix.put(B['perdu'], pop(380, 600, 0.16), 0.14)
    # minuit : des pas, le pied-de-biche, la radio dans sa poche
    for i in range(5):
        mix.put(B['nuit'] + 0.3 + i * 0.42, step(True), 0.14, pan=-0.2)
    mix.put(B['biche'], click(700, 0.06), 0.1)
    mix.put(B['craque'], crash(1.0), 0.18)
    mix.put(B['craque'], boom(1.4, 50), 0.2)
    mix.put(B['radio'], static(B['ami'] - B['radio']), 0.08)
    mix.put(B['ami'] - 0.05, glitch(0.3), 0.1)
    mix.put(B['fente'], heartbeat(92, B['choix'] - B['fente']), 0.16)
    mix.put(B['fente'], static(1.2), 0.05)
    mix.put(B['nom'] + 0.4, boom(1.8, 46), 0.26)
    mix.put(B['nom'] + 0.4, impact(1.4), 0.1)
    # le choix
    mix.put(B['trompe'], riser(B['q'] - B['trompe'], 200, 1600), 0.08)
    mix.put(B['q'], boom(2.0, 38), 0.26)
    mix.put(B['a'], pop(500, 900, 0.14), 0.14, pan=-0.2)
    mix.put(B['b'], pop(420, 760, 0.14), 0.14, pan=0.2)
    mix.put(end_t - 0.05, whoosh(0.5, 500, 2200, peak=0.5), 0.1)
    mix.put(B['flip'] - 0.03, glitch(0.4), 0.14)
    mix.put(B['flip'], boom(2.2, 42), 0.30)
    mix.put(B['flip'], impact(1.6), 0.12)
