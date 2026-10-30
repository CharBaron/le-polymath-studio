import random

from sfx.synth import blip, boom, click, drone, envelope, impact, pop, riser, thud, whoosh
from sfx.survie import beep, buzz, claw, eas, glass_tap, glitch, heartbeat, knock, moan, paper, power_down, shards, tape, wind

# Cue sheet — vidéo 26-dernier-etage-j2b (jour 2, branche B). Nappe grave + bruitages ; instants = balises de timeline.json.

def rules_and_phone(mix, B):
    # règle 4 (rappel), 5 (occulter), 6 (batterie)
    mix.put(B['comprends'], boom(1.4, 46), 0.2)
    mix.put(B['certains'], glitch(0.25), 0.08)
    for tag, at in ((B['r5'], B['r5t']), (B['r6'], B['r6t'])):
        mix.put(tag, boom(1.4, 52), 0.22)
        mix.put(at - 0.05, whoosh(0.35, 600, 2600, peak=0.5), 0.1)
    for i in range(4):
        t = B['r5'] + 1.3 + i * (B['rayon'] - 1.0 - B['r5'] - 1.3) / 3
        mix.put(t, tape(), 0.08, pan=-0.4 + 0.27 * i)
        mix.put(t + 0.35, thud(), 0.08)
    mix.put(B['rayon'] - 0.6, whoosh(0.6, 400, 200, peak=0.4), 0.1)
    mix.put(B['avion'], click(1800, 0.04), 0.1)
    mix.put(B['minute'], click(1500, 0.04), 0.1)
    mix.put(B['vocal'], buzz(0.3), 0.18)
    mix.put(B['vocal'] + 0.05, blip(1100, 0.3, 0.1), 0.06)


def knocks_and_end(mix, B, end_t, flip):
    mix.put(B['nuit'], heartbeat(64, B['choix'] - B['nuit']), 0.14)
    starts = [B['k1'] + 0.05, B['k2'] + 0.05, B['k3'] + 0.05]
    for s, gap in zip(starts, (0.18, 0.36, 0.18)):
        for i in range(3):
            mix.put(s + i * gap, knock(), 0.3, pan=-0.4)
    mix.put(B['sos'], boom(1.6, 50), 0.16)
    mix.put(B['choix'], boom(2.0, 38), 0.26)
    mix.put(B['a'], pop(500, 900, 0.14), 0.14, pan=-0.2)
    mix.put(B['b'], pop(420, 760, 0.14), 0.14, pan=0.2)
    mix.put(end_t - 0.05, whoosh(0.5, 500, 2200, peak=0.5), 0.1)
    mix.put(flip - 0.03, glitch(0.4), 0.14)
    mix.put(flip, boom(2.2, 42), 0.30)
    mix.put(flip, impact(1.6), 0.12)


def score(mix, tl):
    B = tl['beats']
    dur = tl['duration']
    end_t = B['fin'] + 0.35
    random.seed(26)
    roots = [(0, 46.25), (B['vitre'], 43.65), (B['matin'], 55.0), (B['nuit'], 46.25), (B['choix'], 41.2), (end_t, 55.0)]
    vol = envelope([(0, 0.5), (B['tombe'], 0.7), (B['vitre'], 0.9), (B['matin'], 0.55), (B['ilgrimpe'], 0.9), (B['comprends'], 0.6), (B['nuit'], 0.75), (B['choix'], 0.9), (dur, 0.3)])
    l, r = drone(dur, roots, volume=vol)
    mix.put_stereo(0, l, r, 0.10)
    # sa lampe qui insiste (S O S ×2), puis qui tombe
    for grp, u in (([B['insiste'] + 0.1, B['insiste'] + 0.74, B['insiste'] + 1.86], 0.08), ([B['s1'] + 0.05, B['s1'] + 1.25, B['s1'] + 2.35], 0.1)):
        for s, sym in zip(grp, ['...', '---', '...']):
            t = s
            for c in sym:
                d = 3 * u if c == '-' else u
                mix.put(t, beep(d, 980), 0.06, pan=-0.3)
                t += d + u
    mix.put(B['tombe'] + 0.2, thud(), 0.16, pan=-0.4)
    mix.put(B['tombe'] + 0.45, glass_tap(), 0.05, pan=-0.4)
    mix.put(B['eteint'], click(700, 0.05), 0.08, pan=-0.4)
    # la vitre : les doigts, toc toc toc
    mix.put(B['vitre'], claw(0.4), 0.12)
    mix.put(B['vitre'] + 1.3, boom(1.4, 40), 0.18)
    mix.put(B['vitre'], heartbeat(78, B['matin'] - B['vitre']), 0.16)
    for t in (B['toc'], B['toc'] + 0.97, B['toc'] + 1.88):
        mix.put(t, glass_tap(), 0.32)
    mix.put(B['toc'] + 2.3, boom(1.8, 48), 0.24)
    mix.put(B['matin'] - 0.05, whoosh(0.6, 300, 2400, peak=0.5), 0.1)
    # sa fenêtre brisée, IL GRIMPE
    mix.put(B['brisee'], shards(), 0.12, pan=-0.3)
    mix.put(B['brisee'], wind(B['comprends'] - B['brisee'], 520), 0.07)
    mix.put(B['mur'] + 0.2, riser(B['ilgrimpe'] - B['mur'] - 0.2, 200, 1800), 0.08)
    mix.put(B['ilgrimpe'], boom(2.0, 40), 0.3)
    mix.put(B['ilgrimpe'], impact(1.6), 0.12)
    rules_and_phone(mix, B)
    # l'alerte d'évacuation
    mix.put(B['alerte'], eas(2, 0.4, 0.12), 0.08)
    mix.put(B['dix'], pop(600, 1000, 0.14), 0.12)
    mix.put(B['sous'] - 0.05, whoosh(0.6, 300, 1500, peak=0.5), 0.1)
    mix.put(B['sous'] + 0.4, riser(1.4, 300, 2000), 0.06)
    knocks_and_end(mix, B, end_t, 98.48)
    mix.put(B['signal'], whoosh(0.4, 900, 300, peak=0.4), 0.08)
