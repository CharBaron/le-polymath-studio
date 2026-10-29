# Cue sheet — vidéo 13 « L'expérience d'Asch » (DA Gravure v3, montage rapide). Tonalité : ré mineur.
# Les plans viennent de build/shots.json (exporté de src/videos/Asch.shots.ts par scripts/shots.mjs) : chaque coupe,
# jump-cut, chiffre du stroboscope, tampon et mot qui claque a son son, sans recopier les temps ici.
# NO_MUSIC=1 : pas de nappe ni de piano (version où la musique est ajoutée dans TikTok).
import json, os, subprocess
from sfx.synth import drone, piano, boom, whoosh, click, chime, riser, impact, scratch, blip, pop, thud

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..')
MUSIC = os.environ.get('NO_MUSIC') != '1'
N = {'D4': 293.66, 'F4': 349.23, 'A4': 440.0, 'D5': 587.33, 'Bb3': 233.08, 'G3': 196.0, 'C4': 261.63, 'E4': 329.63, 'G4': 392.0,
     'A3': 220.0, 'Bb4': 466.16, 'F5': 698.46, 'A5': 880.0}
ARP = {'Dm': ['D4', 'F4', 'A4', 'D5'], 'Bb': ['Bb3', 'D4', 'F4', 'Bb4'], 'Gm': ['G3', 'Bb3', 'D4', 'G4'], 'A': ['A3', 'C4', 'E4', 'A4']}


def burst(mix, t, n=6, g=0.06):
    for k in range(n): mix.put(t + k * 0.028, click(180 + (k * 977) % 3300, 0.03), g, pan=-0.5 + 0.2 * k)


def score(mix, tl):
    b = tl['beats']; dur = tl['duration']
    subprocess.run(['node', 'scripts/shots.mjs', os.path.relpath(HERE, ROOT), 'src/videos/Asch.shots.ts'], cwd=ROOT, check=True)
    shots = json.load(open(os.path.join(HERE, 'build', 'shots.json')))

    harm = [(0, 'Dm'), (b['exp'], 'Bb'), (b['piege'], 'Gm'), (b['nom'], 'Dm'), (b['allie'], 'Bb'), (b['seneque'], 'Gm'), (b['fin'], 'A'), (b['loop'], 'Dm')]
    root = {'Dm': 73.42, 'Bb': 58.27, 'Gm': 98.0, 'A': 55.0}
    chord_at = lambda t: [h for h in harm if h[0] <= t + 0.06][-1][1]
    if MUSIC:
        l, r = drone(dur, [(t, root[c]) for t, c in harm], lambda t: 0.85 + 0.15 * min(1, max(0, (t - b['piege']) / 2)) if t < b['nom'] else 0.9)
        mix.put_stereo(0, l, r, 0.075)
        mix.put(0, piano(N['D4'], 2.4), 0.06)

    for i, s in enumerate(shots):
        t, tr = s['t0'], s['tr']
        if tr is None: continue
        if MUSIC: mix.put(t, piano(N[ARP[chord_at(t)][i % 4]], 1.6), 0.045, pan=-0.35 if i % 2 else 0.35)
        if tr == 'zoom': mix.put(t - 0.25, whoosh(0.45, 300, 2600, peak=0.85), 0.09)
        elif tr == 'flash': mix.put(t, blip(N['D5'] * 2, 0.4, 0.15), 0.035); mix.put(t - 0.1, whoosh(0.25, 800, 3000, peak=0.6), 0.05)
        elif tr == 'flashRed': mix.put(t, boom(0.9, 70), 0.09); mix.put(t - 0.15, whoosh(0.3, 500, 2600, peak=0.7), 0.07)
        elif tr == 'glitch': burst(mix, t)
        elif tr == 'slam': mix.put(t - 0.12, whoosh(0.18, 900, 3800, peak=0.85), 0.08); mix.put(t, boom(0.8, 62), 0.13); mix.put(t, thud(), 0.12)
        elif tr == 'swipe': mix.put(t - 0.12, whoosh(0.38, 350, 3200, peak=0.5), 0.09, pan=0.2)
        elif tr == 'spin': mix.put(t - 0.2, whoosh(0.5, 250, 2200, peak=0.7), 0.09, pan=-0.3)
        elif tr == 'invert': burst(mix, t, 4, 0.07); mix.put(t, boom(0.6, 85), 0.08)
        elif tr == 'shutter': mix.put(t, thud(), 0.12); mix.put(t + 0.1, click(1200, 0.04), 0.08)
        elif tr == 'whip': mix.put(t - 0.1, whoosh(0.22, 700, 3600, peak=0.8), 0.09, pan=0.4)
        else: mix.put(t - 0.12, whoosh(0.3, 600, 2400, peak=0.6), 0.055)

        # jump-cuts : petit claquement sec (pas de note : la voix porte l'accent)
        for j in s['jumps']:
            mix.put(j - 0.01, click(1500, 0.025), 0.05, pan=0.15); mix.put(j - 0.01, thud(0.15), 0.05)
        # stroboscope : un coup par chiffre, puis le nombre se pose (boum + trait de lumière)
        for k, tt in enumerate(s['strobe']):
            mix.put(tt, thud(0.2), 0.11); mix.put(tt, click(2200 + 300 * k, 0.03), 0.07, pan=-0.3 + 0.2 * k)
        if s['num']:
            land = s['num']['land']
            if s['strobe']: mix.put(land - 0.05, whoosh(0.3, 1200, 4200, peak=0.3), 0.07); mix.put(land + 0.02, boom(1.4, 50), 0.15)
            else:
                tt, j = land + 0.04, 0
                stop = land + 0.32 + (s['num']['digits'] - 1) * 0.11
                while tt < stop - 0.02: mix.put(tt, click(2400 + (j * 263) % 900, 0.02), 0.045, pan=-0.2 + 0.4 * (j % 2)); tt += 0.045; j += 1
                mix.put(stop, boom(1.4, 50), 0.15)
        if s['stampAt'] is not None: mix.put(s['stampAt'], thud(), 0.16); mix.put(s['stampAt'], boom(0.6, 80), 0.1)
        if s['slamAt'] is not None: mix.put(s['slamAt'] - 0.08, whoosh(0.15, 1000, 4000, peak=0.85), 0.06); mix.put(s['slamAt'] + 0.1, boom(0.8, 58), 0.12)
        ln = s['lines']
        if ln:
            if not ln.get('full'): mix.put(t, scratch(0.9), 0.07)
            pa = ln.get('pickAt', 0)
            if ln.get('votes') and pa >= 0:
                n = ln['votes']
                for v in range(n): mix.put(t + pa + (v + 1) / (n + 2) * 0.25 + 0.02, pop(520, 364, 0.12), 0.08, pan=-0.6 + v * 0.18)
            if ln.get('pick') == 2 and pa >= 0: mix.put(t + pa + 0.1, chime([N['D5'], N['F5'], N['A5']], 1.2, 0.5), 0.05)
        if s['rays'] == 'gold': mix.put(t + 0.15, chime([N['D5'], N['F5'], N['A5']], 1.4, 0.6), 0.035)

    # le nom : seul riser + impact ; mot-concept tapé
    mix.put(b['nom'] - 1.25, riser(1.2, 240, 3800), 0.09)
    mix.put(b['nom'] - 0.03, impact(1.4), 0.2)
    for g in range(19):
        mix.put(b['nom'] + 0.05 + g * 0.045, click(2600, 0.015), 0.03)
    mix.put(b['seneque'] + 0.2, chime([N['G4'], N['Bb4'], N['D5']], 1.8, 0.7), 0.06)
