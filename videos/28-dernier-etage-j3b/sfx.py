# Cue sheet — vidéo 28-dernier-etage-j3b (jour 3, « je ne bouge pas »). Nappe grave + bruitages ; instants = balises.
import random

from sfx.synth import blip, boom, click, drone, envelope, impact, pop, riser, thud, whoosh
from sfx.survie import claw, drill, glitch, heartbeat, knock, scrape


def common(mix, B, end_t, flip):
    # règles 7 et 8, schéma du son
    mix.put(B['comprends'], whoosh(0.5, 400, 1600, peak=0.5), 0.1)
    mix.put(B['imitent'], glitch(0.4), 0.1)
    mix.put(B['apprennent'], blip(660, 0.3, 0.1), 0.08)
    for tag, at in ((B['r7'], B['r7t']), (B['r8'], B['r8t'])):
        mix.put(tag, boom(1.4, 52), 0.22)
        mix.put(at - 0.05, whoosh(0.35, 600, 2600, peak=0.5), 0.1)
    for i in range(6):
        t = B['vis'] + (B['tient'] + 0.4 - B['vis']) * i / 5
        mix.put(t - 0.3, drill(0.4), 0.1, pan=-0.3)
        mix.put(t, click(1400, 0.04), 0.08)
    # le compte des vivres
    mix.put(B['deux'], pop(500, 800, 0.16), 0.14)
    mix.put(B['neuf'], pop(380, 600, 0.16), 0.14)
    mix.put(B['demi'] + 0.2, whoosh(0.4, 2400, 900, peak=0.5), 0.1)
    mix.put(B['demi'] + 0.9, thud(), 0.18)
    # le voisin, puis le doute
    mix.put(B['aprem'], heartbeat(66, B['choix'] - B['aprem']), 0.12)
    mix.put(B['vrai'], glitch(0.5), 0.1)
    mix.put(B['ou'], riser(B['choix'] - B['ou'], 200, 1600), 0.08)
    mix.put(B['choix'], boom(2.0, 38), 0.26)
    mix.put(B['a'], pop(500, 900, 0.14), 0.14, pan=-0.2)
    mix.put(B['b'], pop(420, 760, 0.14), 0.14, pan=0.2)
    mix.put(end_t - 0.05, whoosh(0.5, 500, 2200, peak=0.5), 0.1)
    mix.put(flip - 0.03, glitch(0.4), 0.14)
    mix.put(flip, boom(2.2, 42), 0.30)
    mix.put(flip, impact(1.6), 0.12)


def knocks(mix, start):
    t = start
    for sym in ('...', '---', '...'):
        for c in sym:
            mix.put(t, knock(), 0.3, pan=-0.4)
            t += 0.36 if c == '-' else 0.18
        t += 0.18


def score(mix, tl):
    B = tl['beats']
    dur = tl['duration']
    end_t = B['fin'] + 0.35
    random.seed(28)
    l, r = drone(dur, [(0, 46.25), (B['voix'], 43.65), (B['matin'], 55.0), (B['aprem'], 49.0), (B['choix'], 41.2), (end_t, 55.0)],
                 volume=envelope([(0, 0.6), (B['stop'], 0.4), (B['voix'], 0.9), (B['nuit'], 1.0), (B['matin'], 0.55), (B['aprem'], 0.7), (B['choix'], 0.9), (dur, 0.3)]))
    mix.put_stereo(0, l, r, 0.10)
    knocks(mix, B['frappe'] + 0.2)
    mix.put(B['stop'], heartbeat(80, B['matin'] - B['stop']), 0.18)
    mix.put(B['voix'], riser(B['maman'] - B['voix'], 150, 900), 0.06)
    mix.put(B['maman'] - 0.1, boom(1.6, 44), 0.16)
    mix.put(B['message'], glitch(0.3), 0.08)
    mix.put(B['encore'] + 0.6, boom(1.8, 48), 0.24)
    common(mix, B, end_t, B['flip'])
