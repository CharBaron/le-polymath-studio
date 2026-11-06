# Cue sheet, vidéo 44-double-lecture (DA Gravure v3.2) : bande-son commune sfx/gravure.py, plus le test (tic à chaque chiffre, rideau qui
# claque sur STOP), la bascule or/rouge, le flash de 0,5 s (déclic d'obturateur), les 393 vignettes et la règle des âges.
import json
import os
import sys

import numpy as np
import soundfile as sf

from sfx.gravure import make
from sfx.synth import SR, boom, click, impact, pop, scratch, thud, whoosh

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'tts'))
from sfx_eleven import sfx as eleven  # noqa: E402

BUILD = os.path.join(HERE, 'build', 'sfx')
os.makedirs(BUILD, exist_ok=True)
GEN = {
    'stop': ('a mechanical stopwatch button pressed to stop, hard metallic click followed by a small bell ding', 1.0, 0.65),
    'declic': ('an old large format camera shutter firing, single crisp mechanical click with a soft flash pop', 0.8, 0.65),
    'plume': ('a dip pen nib scratching quickly on thick paper, one short stroke', 0.7, 0.6),
}


def g(name):
    prompt, dur, infl = GEN[name]
    out = os.path.join(BUILD, name + '.wav')
    eleven(prompt, out, dur, infl)
    y, sr = sf.read(out)
    y = y.mean(1) if y.ndim > 1 else y
    if sr != SR:
        y = np.interp(np.arange(0, len(y) * SR / sr) * sr / SR, np.arange(len(y)), y)
    return list(y / (np.max(np.abs(y)) + 1e-9) * 0.9)


base = make(__file__, 'src/videos/DoubleLecture.shots.ts', semis=2)


def score(mix, tl):
    base(mix, tl)
    shots = json.load(open(os.path.join(HERE, 'build', 'shots.json')))
    S = {k: g(k) for k in GEN}
    for s in shots:
        a, t0, t1 = s.get('anim') or {}, s['t0'], s['t1']
        n, mode = a.get('name'), a.get('mode')
        if n == 'Hill' and mode == 'test':
            for c in a['at']: mix.put(c, click(2400, 0.03), 0.12); mix.put(c, thud(0.2), 0.08)
            mix.put(a['stop'] - 0.03, S['stop'], 0.3); mix.put(a['stop'], impact(1.0), 0.14)
        elif n == 'Hill' and mode == 'lecture':
            mix.put(a['jeune'], whoosh(0.5, 900, 3200, peak=0.5), 0.09); mix.put(a['jeune'] + 0.05, S['plume'], 0.14)
            mix.put(a['vieille'], boom(0.9, 58), 0.12); mix.put(a['vieille'] + 0.05, S['plume'], 0.14)
            k = 0
            while a['meme'] + k * 0.17 < t1 - 0.05:
                mix.put(a['meme'] + k * 0.17, click(1500 if k % 2 else 900, 0.02), 0.09, pan=-0.3 if k % 2 else 0.3); k += 1
        elif n == 'Hill' and mode == 'detail':
            mix.put(t0 + 0.2, S['plume'], 0.14); mix.put(a['swap'], pop(700, 1400, 0.12), 0.1); mix.put(a['swap'], scratch(0.25), 0.1)
        elif n == 'Flash':
            mix.put(a['at'] - 0.02, S['declic'], 0.3); mix.put(a['at'] + 0.5, thud(0.2), 0.1)
        elif n == 'Foule':
            for k in range(30): mix.put(t0 + k * 0.035, click(1400 + (k * 271) % 1800, 0.012), 0.05, pan=-0.5 + (k % 10) / 10)
        elif n == 'Ages':
            mix.put(a['a'], thud(0.3), 0.14); mix.put(a['b'], thud(0.3), 0.16); mix.put(a['b'] + 0.45, impact(0.8), 0.1)
