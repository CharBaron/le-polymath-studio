# Cue sheet — vidéo 39-dernier-etage-j4a (jour 4, « tu lui réponds »). Nappe grave + bruitages ; instants = balises.
# Les coups tombent sur les mêmes instants que l'image (src/videos/DernierEtage4A.tsx).
import random

from sfx.synth import blip, boom, click, drone, envelope, impact, pop, riser, thud, whoosh
from sfx.survie import clank, glitch, glug, heartbeat, knock, scrape, static, water


def score(mix, tl):
    B = tl['beats']
    dur = tl['duration']
    end_t = B['fin'] + 0.35
    random.seed(39)
    l, r = drone(dur, [(0, 46.25), (B['test'], 49.0), (B['corde'], 55.0), (B['glou'], 43.65), (B['nuit'], 41.2), (B['choix'], 38.9), (end_t, 55.0)],
                 volume=envelope([(0, 0.8), (B['dil'], 0.7), (B['corde'], 0.5), (B['glou'], 0.7), (B['nuit'], 0.9), (B['choix'], 1.0), (dur, 0.3)]))
    mix.put_stereo(0, l, r, 0.10)
    # l'œil sous la grille
    mix.put(0.0, boom(1.8, 44), 0.22)
    mix.put(1.7, click(900, 0.05), 0.06)
    mix.put(B['dil'], whoosh(0.5, 300, 1400, peak=0.5), 0.1)
    mix.put(B['dil'] + 0.2, heartbeat(70, B['test'] - B['dil']), 0.12)
    # le test : tes coups (à gauche, proches), les siens (en dessous, étouffés)
    for t in (B['un'] + 0.12, B['trois'], B['trois'] + 0.2, B['trois'] + 0.4):
        mix.put(t, knock(), 0.36, pan=-0.2)
        mix.put(t, thud(), 0.12)
    for t in (B['deux'] - 0.3, B['deux'] - 0.08, B['quatre'], B['quatre'] + 0.18, B['quatre'] + 0.36, B['quatre'] + 0.54):
        mix.put(t, knock(), 0.2, pan=0.25)
    mix.put(B['rep'], glitch(0.4), 0.1)
    mix.put(B['compte'], blip(660, 0.3, 0.1), 0.08)
    mix.put(B['homme'], boom(1.4, 52), 0.22)
    mix.put(B['homme'], impact(1.2), 0.08)
    # le marché par la corde
    mix.put(B['corde'], whoosh(0.8, 200, 900, peak=0.4), 0.1)
    mix.put(B['descend'], scrape(1.6), 0.06, pan=0.1)
    mix.put(B['descend'] + 1.6, thud(), 0.12)
    mix.put(B['monte'], scrape(1.5), 0.06, pan=-0.1)
    mix.put(B['balle'] - 0.15, thud(), 0.16)
    for i in range(4):
        mix.put(B['balle'] + 0.05 + i * 0.13, clank(1500 + 300 * i), 0.05)
    mix.put(B['balle'], boom(1.6, 48), 0.2)
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
    # minuit : la radio de Lina à la grille
    mix.put(B['nuit'], static(1.4), 0.08)
    mix.put(B['radio'], static(B['ami'] - B['radio']), 0.07)
    mix.put(B['ami'] - 0.05, glitch(0.3), 0.1)
    mix.put(B['prix'], heartbeat(88, B['choix'] - B['prix']), 0.16)
    mix.put(B['colle'], thud(), 0.2)
    mix.put(B['colle'], static(0.8), 0.08)
    mix.put(B['nom'] + 0.4, boom(1.8, 46), 0.26)
    mix.put(B['nom'] + 0.4, impact(1.4), 0.1)
    # le choix
    mix.put(B['choix'], riser(B['q'] - B['choix'], 200, 1600), 0.08)
    mix.put(B['q'], boom(2.0, 38), 0.26)
    mix.put(B['a'], pop(500, 900, 0.14), 0.14, pan=-0.2)
    mix.put(B['b'], pop(420, 760, 0.14), 0.14, pan=0.2)
    mix.put(end_t - 0.05, whoosh(0.5, 500, 2200, peak=0.5), 0.1)
    mix.put(B['flip'] - 0.03, glitch(0.4), 0.14)
    mix.put(B['flip'], boom(2.2, 42), 0.30)
    mix.put(B['flip'], impact(1.6), 0.12)
