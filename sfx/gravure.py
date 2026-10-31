"""Bande-son commune des vidéos « Gravure » v3 : un son par événement de build/shots.json (coupes, jump-cuts,
stroboscope des chiffres, tampons, mots qui claquent, cartes d'Asch), nappe grave + une note de piano par plan,
un seul riser + impact sur le mot-concept (balise `nom`). Tonalité : ré mineur transposé de `semis` demi-tons.
Usage dans videos/<id>/sfx.py :  from sfx.gravure import make ; score = make(__file__, 'src/videos/X.shots.ts', semis=-2)
NO_MUSIC=1 : sans nappe ni piano (version où la musique est ajoutée dans TikTok)."""
import json, os, subprocess
from sfx.synth import drone, piano, boom, whoosh, click, chime, riser, impact, scratch, blip, pop, thud

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
N0 = {'D4': 293.66, 'F4': 349.23, 'A4': 440.0, 'D5': 587.33, 'Bb3': 233.08, 'G3': 196.0, 'C4': 261.63, 'E4': 329.63, 'G4': 392.0,
      'A3': 220.0, 'Bb4': 466.16, 'F5': 698.46, 'A5': 880.0}
ARP = {'Dm': ['D4', 'F4', 'A4', 'D5'], 'Bb': ['Bb3', 'D4', 'F4', 'Bb4'], 'Gm': ['G3', 'Bb3', 'D4', 'G4'], 'A': ['A3', 'C4', 'E4', 'A4']}
ROOT_HZ = {'Dm': 73.42, 'Bb': 58.27, 'Gm': 98.0, 'A': 55.0}


def burst(mix, t, n=6, g=0.06):
    for k in range(n): mix.put(t + k * 0.028, click(180 + (k * 977) % 3300, 0.03), g, pan=-0.5 + 0.2 * k)


def anim_sfx(mix, s, N):
    """bruitages des animations sur mesure (v3.1) : un son par événement de l'animation, calé sur ses paramètres"""
    a = s.get('anim')
    if not a: return
    t0, t1, name = s['t0'], s['t1'], a['name']
    num = lambda k, d=0.0: float(a.get(k, d))
    if name == 'QueueCoupee':
        if num('cut', 0.6) > t1 - t0: return  # rat immobile (1re et dernière image)
        c = t0 + num('cut', 0.6)
        mix.put(c - 0.02, click(4200, 0.03), 0.16); mix.put(c, scratch(0.18), 0.12); mix.put(c, pop(1800, 600, 0.1), 0.08)
        r = t0 + num('run', 1.4)
        for k in range(14): mix.put(r + k * 0.045, click(2600 + (k * 431) % 1400, 0.012), 0.05, pan=-0.4 + k * 0.06)
    elif name == 'Registre':
        f = num('fill', 1.8)
        mix.put(t0 + 0.1, scratch(f), 0.09)
        mix.put(t0 + 0.1, scratch(f), 0.06, pan=0.3)
        for k in range(int(f / 0.06)): mix.put(t0 + 0.15 + k * 0.06, click(1700 + (k * 97) % 600, 0.012), 0.035, pan=-0.3 + 0.6 * ((k * 7) % 10) / 10)
        mix.put(t0 + 0.15 + f, boom(1.2, 52), 0.12)
    elif name == 'Grouillement':
        st, mx = num('step', 0.32), num('max', 64)
        g, tt = 0, t0
        while 2 ** g <= mx and tt < t1:
            for k in range(min(4, 2 ** g)): mix.put(tt + k * 0.03, pop(2400 + 300 * k, 3400, 0.06), 0.05, pan=-0.5 + k * 0.33)
            g += 1; tt = t0 + g * st
    elif name == 'TestPasses':
        if a.get('reveal'):
            mix.put(t0, impact(1.2), 0.16); mix.put(t0 + 0.1, scratch(0.5), 0.1)
        elif a.get('freezeAt') is None:
            go, stop, P = num('go'), num('stop'), int(num('passes', 11))
            a0, b0 = go + 0.05, stop - 0.15
            for k in range(P): mix.put(a0 + (k + 0.6) * (b0 - a0) / P, thud(0.18), 0.09, pan=-0.3 + 0.3 * (k % 3))
    elif name == 'Scanner':
        mix.put(t0 + num('nodAt', 0.3), blip(N['A5'] * 2, 0.3, 0.1), 0.05)
        mix.put(t0 + num('gorAt', 1.2), blip(N['D5'] * 2, 0.5, 0.15), 0.06); mix.put(t0 + num('gorAt', 1.2), whoosh(0.6, 300, 1800, peak=0.6), 0.06)
    elif name == 'Navire':
        fr, to = num('from', 0.3), num('to', 2.5)
        if fr < 50:
            n = 32
            for k in range(n):
                tt = t0 + fr + (to - fr) * (k + 0.5) / n
                if t0 <= tt < t1: mix.put(tt, thud(0.12), 0.06, pan=-0.5 + (k % 8) / 8); mix.put(tt, click(900 + (k * 53) % 300, 0.02), 0.04)
    elif name == 'Cellules':
        fr, to = num('from', 0.2), num('to', 2.2)
        if 0 <= fr < t1 - t0:
            for k in range(16): mix.put(t0 + fr + (to - fr) * k / 16, pop(1500 + 80 * k, 2200 + 80 * k, 0.07), 0.035, pan=-0.5 + (k % 5) / 5)
        if 'neur' in a: mix.put(t0 + num('neur'), chime([N['D5'], N['F5'], N['A5']], 1.6, 0.6), 0.06)
    elif name == 'Teleporteur':
        mix.put(t0 + 0.2, riser(0.9, 300, 2600), 0.06); mix.put(t0 + 0.9, whoosh(0.9, 400, 3800, peak=0.5), 0.08); mix.put(t0 + 2.0, chime([N['D5'], N['A5']], 1.4, 0.5), 0.05)
    elif name == 'Estomac':
        if a.get('mode') == 'trou': mix.put(t0 + 0.5, thud(0.3), 0.12); mix.put(t0 + 0.5, boom(0.7, 70), 0.08)
        elif not a.get('instant'): mix.put(t0 + 0.2, scratch(num('down', 0.9)), 0.07)
        if 'from' in a:
            fr, to = num('from'), num('to', 3.0)
            for k in range(int((to - fr) / 0.18)): mix.put(t0 + fr + k * 0.18, blip(320 + (k * 37) % 200, 0.12, 0.05), 0.02, pan=-0.2 + 0.4 * (k % 3) / 3)
            if not a.get('instant'):
                for h in range(3): mix.put(t0 + fr + (to - fr) * (h + 0.6) / 3.2, click(1800, 0.03), 0.08)
    elif name == 'Bocal':
        fr, to = num('from', 0.4), num('to', 2.2)
        mix.put(t0, chime([N['D5'], N['A5']], 0.8, 0.3), 0.03)
        for k in range(int((to - fr) / 0.14)): mix.put(t0 + fr + k * 0.14, blip(380 + (k * 53) % 260, 0.1, 0.04), 0.02)
    elif name == 'Terre':
        ev = lambda k: a.get(k) is not None and float(a[k]) >= 0
        if ev('rays'): mix.put(t0 + num('rays'), chime([N['A4'], N['D5'], N['F5'], N['A5']], 1.6, 0.6), 0.05)
        if ev('well'): mix.put(t0 + num('well'), blip(N['D5'], 0.5, 0.2), 0.05)
        if ev('stick'): mix.put(t0 + num('stick'), thud(0.25), 0.12)
        if ev('shadow'): mix.put(t0 + num('shadow'), whoosh(0.5, 200, 1400, peak=0.5), 0.08); mix.put(t0 + num('shadow') + 0.4, boom(1.0, 55), 0.1)
        if ev('angle'): mix.put(t0 + num('angle'), chime([N['D5'], N['F5'], N['A5']], 1.4, 0.5), 0.06)
        if ev('zIn'): mix.put(t0 + num('zIn'), whoosh(0.7, 300, 2600, peak=0.7), 0.08)
        if ev('zOut'): mix.put(t0 + num('zOut'), whoosh(0.7, 2600, 300, peak=0.3), 0.07)
        if ev('wedges'):
            w0, w1 = num('wedges'), num('wedgesEnd', num('wedges') + 2)
            for k in range(50): mix.put(t0 + w0 + (w1 - w0) * k / 50, click(900 + k * 40, 0.015), 0.045, pan=-0.6 + 1.2 * k / 50)
            mix.put(t0 + w1, boom(1.2, 50), 0.12)
        if ev('circ'): mix.put(t0 + num('circ'), riser(1.2, 300, 3000), 0.06); mix.put(t0 + num('circ') + 1.2, chime([N['D5'], N['F5'], N['A5'], N['D5'] * 2], 2.0, 0.8), 0.06)
    elif name == 'Plate':
        mix.put(t0 + 0.6, thud(0.2), 0.1); mix.put(t0 + 0.7, thud(0.2), 0.1)
    elif name == 'ListeMots':
        if a.get('freezeAt') is not None: return
        for k, tt in enumerate(a.get('at', [])):
            mix.put(tt - 0.02, thud(0.16), 0.09, pan=-0.2 + 0.4 * (k % 2)); mix.put(tt, click(1300 + (k * 211) % 700, 0.03), 0.06)
        st = num('stop')
        mix.put(st - 0.1, whoosh(0.4, 600, 3400, peak=0.4), 0.09); mix.put(st, impact(1.2), 0.16)
    elif name == 'Quiz':
        for k, tt in enumerate(a.get('q', [])): mix.put(tt - 0.04, pop(600 + 160 * k, 900 + 160 * k, 0.12), 0.08)
        o = num('oui'); mix.put(o, boom(0.9, 70), 0.1); mix.put(o + 0.05, scratch(0.35), 0.08)
    elif name == 'Rembobine':
        mix.put(t0, scratch(1.0), 0.1); mix.put(t0, whoosh(1.0, 3200, 400, peak=0.3), 0.07)
        for k in range(11): mix.put(t0 + 0.05 + k * 0.08, click(2600 - k * 120, 0.02), 0.05, pan=-0.4 + 0.08 * k)
    elif name == 'Fiche':
        n = sum(len(x) for x in str(a.get('lines', '')).split('|'))
        for k in range(n):
            if t0 + k * 0.028 < t1: mix.put(t0 + k * 0.028, click(1900 + (k * 331) % 900, 0.015), 0.04, pan=-0.2 + 0.4 * ((k * 7) % 10) / 10)
    elif name == 'Reconstruit':
        for k in range(19): mix.put(t0 + 0.1 + k * 0.055, click(900 + (k * 173) % 1200, 0.02), 0.045, pan=-0.5 + (k % 6) / 6)
        f = num('fill', 1.6); mix.put(t0 + f, thud(0.25), 0.12); mix.put(t0 + f + 0.05, chime([N['D5'], N['F5'], N['A5']], 1.2, 0.5), 0.05)
    elif name == 'PhotoTruquee':
        if a.get('done'): mix.put(t0 + 0.1, chime([N['D5'], N['A5'], N['D5'] * 2], 1.6, 0.6), 0.05); return
        ps = num('paste', 1.0)
        for k in range(int(max(0.3, ps - 0.3) / 0.12)): mix.put(t0 + 0.15 + k * 0.12, scratch(0.08), 0.06)
        mix.put(t0 + ps, whoosh(0.35, 500, 2600, peak=0.6), 0.08); mix.put(t0 + ps + 0.35, thud(0.2), 0.12)
        mix.put(t0 + ps + 0.42, scratch(0.12), 0.07); mix.put(t0 + ps + 0.5, scratch(0.12), 0.07)
    elif name == 'QuestionPiege':
        if a.get('freezeAt') is not None: return
        for k, tt in enumerate(a.get('at', [])): mix.put(tt - 0.02, click(1500 + (k * 173) % 700, 0.02), 0.045, pan=-0.3 + 0.6 * (k % 4) / 4)
        cd = a.get('cd', [])
        for k, tt in enumerate(cd): mix.put(tt - 0.03, blip(N['A5'] if k < len(cd) - 1 else N['D5'] * 2, 0.22, 0.06), 0.07); mix.put(tt - 0.03, thud(0.15), 0.08)
        st = num('stop'); mix.put(st - 0.1, whoosh(0.4, 600, 3400, peak=0.4), 0.09); mix.put(st, impact(1.2), 0.16)
    elif name == 'Correction':
        mix.put(t0 + 0.05, pop(700, 1200, 0.12), 0.08); mix.put(t0 + 0.35, chime([N['D5'], N['A5']], 0.8, 0.3), 0.04)
        f = num('fix'); r = num('ring', f - 0.8); mix.put(r, scratch(0.4), 0.1); mix.put(f - 0.25, scratch(0.2), 0.12); mix.put(f, thud(0.2), 0.12)
    elif name == 'Repete':
        n, ev = int(num('n', 6)), num('every', 0.32)
        for k in range(n):
            if t0 + k * ev < t1: mix.put(t0 + k * ev, thud(0.14), 0.07 + 0.01 * k, pan=-0.2 + 0.4 * (k % 2)); mix.put(t0 + k * ev, click(1200 + 150 * k, 0.02), 0.05)
    elif name == 'TacheTest':
        if a.get('freezeAt') is not None: return
        if a.get('reveal'): mix.put(t0 + 0.25, whoosh(0.5, 2600, 300, peak=0.3), 0.07); mix.put(t0 + 0.55, boom(1.0, 60), 0.1); return
        if a.get('patch'):
            mix.put(t0 + 0.1, boom(0.8, 50), 0.1); mix.put(t0 + 0.9, riser(0.5, 400, 2400), 0.05); mix.put(t0 + 1.4, chime([N['D5'], N['A5']], 1.0, 0.4), 0.05); return
        for tt in a.get('at', []): mix.put(tt - 0.03, blip(N['A5'], 0.25, 0.08), 0.05)
    elif name == 'Nerf':
        h = t0 + num('hit', 0.6); mix.put(t0 + 0.15, riser(max(0.2, h - t0 - 0.15), 600, 3000), 0.05); mix.put(h, thud(0.25), 0.12); mix.put(h + 0.05, blip(N['D5'] * 2, 0.4, 0.12), 0.05)
    elif name == 'Saccades':
        k = 1
        while t0 + k * 0.28 < t1: mix.put(t0 + k * 0.28, click(700 + (k * 97) % 300, 0.02), 0.06, pan=-0.4 + 0.8 * (k % 2)); k += 1
        c = t0 + num('count', 1.2)
        for j in range(14): mix.put(c + j * 0.065, click(2200 + j * 90, 0.015), 0.04)
        mix.put(t0 + num('hour', 2.4), impact(1.0), 0.12)
    elif name == 'Toise':
        if a.get('freezeAt') is not None: return
        if a.get('reveal'):
            l = num('lift'); mix.put(l, whoosh(0.5, 300, 2400, peak=0.4), 0.08); mix.put(num('wrong'), scratch(0.3), 0.1); mix.put(num('right'), chime([N['D5'], N['F5'], N['A5']], 1.2, 0.5), 0.06); mix.put(num('right'), thud(0.2), 0.1); return
        for k, tt in enumerate(a.get('at', [])): mix.put(tt - 0.03, scratch(0.2), 0.07); mix.put(tt - 0.03, blip(N['A5'] if k < 2 else N['D5'] * 2, 0.2, 0.06), 0.05)
        st = num('stop'); mix.put(st - 0.1, whoosh(0.4, 600, 3400, peak=0.4), 0.09); mix.put(st, impact(1.2), 0.16)
    elif name == 'Pouces':
        mix.put(t0 + 0.1, scratch(0.3), 0.07); mix.put(t0 + 0.35, scratch(0.3), 0.07)
        sh = num('shrink', 99)
        if sh < t1 - t0: mix.put(t0 + sh, whoosh(0.6, 2400, 300, peak=0.3), 0.08); mix.put(t0 + sh + 0.45, impact(1.0), 0.12)
    elif name == 'Partage':
        if a.get('freezeAt') is not None: return
        if a.get('reveal'):
            mix.put(t0 + 0.05, pop(500, 300, 0.15), 0.09); b = num('burn'); mix.put(b, riser(0.8, 200, 1600), 0.06); mix.put(b + 0.1, scratch(0.8), 0.06); mix.put(b + 0.8, boom(1.0, 50), 0.1); return
        sp = num('split')
        for k in range(10): mix.put(sp + k * 0.05, scratch(0.06), 0.05, pan=-0.4 + 0.08 * k)
        mix.put(sp + 0.5, thud(0.15), 0.08)
        mix.put(num('btn'), pop(600, 1100, 0.12), 0.07); mix.put(num('acc'), blip(N['A5'], 0.2, 0.06), 0.05); mix.put(num('ref'), blip(N['D5'], 0.25, 0.08), 0.05)
        cd = a.get('cd', [])
        for k, tt in enumerate(cd): mix.put(tt - 0.03, blip(N['A5'] if k < len(cd) - 1 else N['D5'] * 2, 0.22, 0.06), 0.07); mix.put(tt - 0.03, thud(0.15), 0.08)
    elif name == 'Insula':
        g = t0 + num('glow', 0.8); mix.put(g - 0.3, riser(0.35, 300, 2200), 0.05); mix.put(g, boom(0.9, 70), 0.1); mix.put(g + 0.05, blip(N['D5'] * 2, 0.5, 0.15), 0.04)
    elif name == 'Branche':
        if a.get('freezeAt') is not None: return
        if a.get('reveal'): mix.put(t0 + 0.05, pop(500, 300, 0.15), 0.09); mix.put(t0 + 0.1, boom(0.9, 60), 0.08); return
        for k, tt in enumerate(a.get('at', [])): mix.put(tt - 0.03, blip(N['A5'] if k < 3 else N['D5'], 0.3, 0.1), 0.05); mix.put(tt - 0.03, whoosh(0.3, 800, 2600, peak=0.5), 0.05)
        mix.put(num('ask'), pop(600, 1100, 0.12), 0.07)
        cd = a.get('cd', [])
        for k, tt in enumerate(cd): mix.put(tt - 0.03, blip(N['A5'] if k < len(cd) - 1 else N['D5'] * 2, 0.22, 0.06), 0.07); mix.put(tt - 0.03, thud(0.15), 0.08)
    elif name == 'Retour':
        if a.get('mode') == 'q':
            for k in range(int(min(t1 - t0, 3.6) / 0.08)): mix.put(t0 + k * 0.08, click(1900 + (k * 331) % 900, 0.015), 0.04, pan=-0.2 + 0.4 * ((k * 7) % 10) / 10)
        else:
            mix.put(t0 + 0.15, riser(0.55, 300, 2000), 0.05); mix.put(t0 + 0.7, thud(0.2), 0.1)
            if a.get('prison'): mix.put(t0 + 0.8, impact(1.0), 0.12)
    elif name == 'Flicker':
        mode = a.get('mode', 'test')
        if a.get('freezeAt') is not None: return
        if mode == 'reveal':
            if not a.get('zoom'): mix.put(t0 + 0.05, pop(500, 300, 0.15), 0.09); mix.put(t0 + 0.1, scratch(0.4), 0.09)
            else: mix.put(t0, whoosh(0.4, 300, 2400, peak=0.5), 0.07)
            k = 0
            while t0 + 0.55 + k * 0.4 < t1 - 0.05: mix.put(t0 + 0.55 + k * 0.4, click(900 + 300 * (k % 2), 0.02), 0.04); k += 1
            return
        stop, hold = num('stop', 1e9), num('holdFrom', 1e9)
        f = int(t0 * 30) + 1
        while f / 30 < min(t1, stop, hold):  # tic de projecteur discret à chaque écran gris (aucun indice sur le changement)
            if f % 10 == 7 and mode != 'nogray': mix.put(f / 30, click(3200, 0.012), 0.012, pan=-0.2)
            if f % 20 == 0 and mode == 'nogray': mix.put(f / 30, click(1100, 0.02), 0.04)
            f += 1
        cd = a.get('at', [])
        for k, tt in enumerate(cd): mix.put(tt - 0.03, blip(N['A5'] if k < len(cd) - 1 else N['D5'] * 2, 0.22, 0.06), 0.07); mix.put(tt - 0.03, thud(0.15), 0.08)
        if stop < t1: mix.put(stop - 0.1, whoosh(0.4, 600, 3400, peak=0.4), 0.09); mix.put(stop, impact(1.2), 0.16)
    elif name == 'Porte':
        pa, pb = a.get('pass', [t0, t1])
        mix.put(pa, whoosh(pb - pa, 220, 1400, peak=0.5), 0.1, pan=-0.3); mix.put((pa + pb) / 2, thud(0.25), 0.1)
    elif name == 'Habille':
        w = num('at', t0 + 1); mix.put(w - 0.1, riser(0.4, 400, 2600), 0.05); mix.put(w, scratch(0.9), 0.08); mix.put(w + 0.9, thud(0.2), 0.1)
    elif name == 'Tetes':
        if a.get('mode') == 'jambes': mix.put(t0, whoosh(0.5, 300, 2200, peak=0.6), 0.08); mix.put(t0 + 0.5, scratch(0.4), 0.07); mix.put(t0 + 0.75, boom(1.0, 55), 0.1)
        else: mix.put(t0 + 0.1, scratch(0.45), 0.1); mix.put(t0 + 0.5, thud(0.2), 0.1)
    elif name == 'Rancon':
        mix.put(t0, pop(500, 300, 0.15), 0.08)
        for k in range(17):
            if t0 + 0.3 + k * 0.05 < t1: mix.put(t0 + 0.3 + k * 0.05, scratch(0.05), 0.05, pan=-0.4 + 0.05 * k)
    elif name == 'Triangle':
        if a.get('reveal'): mix.put(t0 + 0.3, scratch(0.3), 0.1); mix.put(t0 + 0.8, scratch(0.3), 0.1); mix.put(t0 + 1.0, thud(0.2), 0.1); return
        cd = a.get('at', [])
        for k, tt in enumerate(cd): mix.put(tt - 0.03, blip(N['A5'] if k < len(cd) - 1 else N['D5'] * 2, 0.22, 0.06), 0.07); mix.put(tt - 0.03, thud(0.15), 0.08)
        if cd: st = num('stop'); mix.put(st - 0.1, whoosh(0.4, 600, 3400, peak=0.4), 0.09); mix.put(st, impact(1.2), 0.16)
    elif name == 'Plaque':
        if a.get('static'): return
        mix.put(t0 + 0.05, thud(0.25), 0.1); mix.put(t0 + 0.08, click(900, 0.04), 0.06)
        mix.put(num('lu'), pop(700, 1100, 0.14), 0.08); mix.put(num('barre'), scratch(0.3), 0.11); mix.put(num('barre') + 0.3, boom(0.8, 60), 0.1)
    elif name == 'Colomb':
        mix.put(t0 + 0.2, chime([N['D5'], N['A5']], 1.2, 0.5), 0.05); mix.put(t0 + 1.0, boom(1.4, 46), 0.13)


def make(cue_file, shots_module, semis=0):
    here = os.path.dirname(os.path.abspath(cue_file))
    tr_ = 2 ** (semis / 12)
    N = {k: v * tr_ for k, v in N0.items()}

    def score(mix, tl):
        music = os.environ.get('NO_MUSIC') != '1'
        b = tl['beats']; dur = tl['duration']
        subprocess.run(['node', 'scripts/shots.mjs', os.path.relpath(here, ROOT), shots_module], cwd=ROOT, check=True)
        shots = json.load(open(os.path.join(here, 'build', 'shots.json')))
        nom, fin, loop = b['nom'], b.get('toi', b.get('fin', dur - 6)), b['loop']
        harm = sorted([(0, 'Dm'), (nom * 0.33, 'Bb'), (nom * 0.66, 'Gm'), (nom, 'Dm'), (nom + (fin - nom) * 0.4, 'Bb'), (nom + (fin - nom) * 0.75, 'Gm'), (fin, 'A'), (loop, 'Dm')])
        chord_at = lambda t: [h for h in harm if h[0] <= t + 0.06][-1][1]
        if music:
            l, r = drone(dur, [(t, ROOT_HZ[c] * tr_) for t, c in harm], lambda t: 0.85 + 0.15 * min(1, max(0, (t - nom * 0.5) / 2)) if t < nom else 0.9)
            mix.put_stereo(0, l, r, 0.075)
            mix.put(0, piano(N['D4'], 2.4), 0.06)
        for i, s in enumerate(shots):
            t, tr = s['t0'], s['tr']
            if tr is not None:
                if music: mix.put(t, piano(N[ARP[chord_at(t)][i % 4]], 1.6), 0.045, pan=-0.35 if i % 2 else 0.35)
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
            for j in s['jumps']:
                mix.put(j - 0.01, click(1500, 0.025), 0.05, pan=0.15); mix.put(j - 0.01, thud(0.15), 0.05)
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
            for pt in s['pops']: mix.put(pt, pop(700, 1100, 0.14), 0.07)
            ln = s['lines']
            if ln:
                if not ln.get('full'): mix.put(t, scratch(0.9), 0.07)
                pa = ln.get('pickAt', 0)
                if ln.get('votes') and pa >= 0:
                    n = ln['votes']
                    for v in range(n): mix.put(t + pa + (v + 1) / (n + 2) * 0.25 + 0.02, pop(520, 364, 0.12), 0.08, pan=-0.6 + v * 0.18)
                if ln.get('pick') == 2 and pa >= 0: mix.put(t + pa + 0.1, chime([N['D5'], N['F5'], N['A5']], 1.2, 0.5), 0.05)
            if s['rays'] == 'gold' and tr is not None: mix.put(t + 0.15, chime([N['D5'], N['F5'], N['A5']], 1.4, 0.6), 0.035)
            if s['card']: mix.put(t - 0.03, boom(1.6, 46), 0.1)
            anim_sfx(mix, s, N)
        # le nom : seul riser + impact ; mot-concept tapé
        mix.put(nom - 1.25, riser(1.2, 240, 3800), 0.09)
        mix.put(nom - 0.03, impact(1.4), 0.2)
        for g in range(14):
            mix.put(nom + 0.05 + g * 0.045, click(2600, 0.015), 0.03)
    return score
