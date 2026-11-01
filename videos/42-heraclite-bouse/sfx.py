# Cue sheet — vidéo 42-heraclite-bouse (DA Gravure v3.2) : bande-son commune sfx/gravure.py, calée sur build/shots.json,
# plus des bruitages ElevenLabs sur les moments qui comptent (mottes qui s'écrasent, mouches, eau, chiens, la vache).
import json
import os
import sys

import numpy as np
import soundfile as sf

from sfx.gravure import make
from sfx.synth import SR

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'tts'))
from sfx_eleven import sfx as eleven  # noqa: E402

BUILD = os.path.join(HERE, 'build', 'sfx')
os.makedirs(BUILD, exist_ok=True)
GEN = {
    'splat': ('a heavy wet lump of cow dung slapping down onto a pile of manure, thick squelch, close up, no reverb', 1.0, 0.6),
    'mouches': ('several flies buzzing around close to the microphone in a barn, circling, no other sound', 6, 0.55),
    'osselets': ('five small bone knucklebones thrown and clattering onto a stone floor, children game', 1.4, 0.6),
    'eau': ('water slowly filling a vessel, deep bubbling and gurgling, muffled underwater sound', 2.5, 0.5),
    'pluie': ('short burst of heavy rain falling on a roof then stopping abruptly', 2.0, 0.5),
    'vapeur': ('soft steam hissing out of hot manure in a cold barn, gentle fizz', 3.0, 0.5),
    'craque': ('dry mud cracking and crumbling, crisp crackles', 1.2, 0.6),
    'chiens': ('two dogs snarling and growling viciously while tearing at something, close, aggressive', 2.0, 0.55),
    'clavier': ('fast typing on a laptop keyboard, about twenty key presses', 1.4, 0.6),
    'meuh': ('a single loud cow moo, close up, in a barn', 1.8, 0.65),
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


base = make(__file__, 'src/videos/Heraclite.shots.ts', semis=-4)


def score(mix, tl):
    base(mix, tl)
    shots = json.load(open(os.path.join(HERE, 'build', 'shots.json')))
    S = {k: g(k) for k in GEN}
    for s in shots:
        a, t0, t1 = s.get('anim') or {}, s['t0'], s['t1']
        n = a.get('name')
        if n == 'Bouse':
            mode = a.get('mode', 'hook')
            if mode != 'dry': mix.put(t0, S['mouches'][: int((t1 - t0) * SR)], 0.05, pan=0.2)
            for sp in a.get('splats', []): mix.put(sp - 0.02, S['splat'], 0.3)
            if mode == 'cover':
                c0, c1 = a['cover']
                for k in range(6): mix.put(c0 + (c1 - c0) * k / 5 - 0.03, S['splat'], 0.22, pan=-0.4 + 0.16 * k)
                mix.put(a['heat'], S['vapeur'], 0.16); mix.put(a['heat'] + 0.3, S['eau'][: int(1.4 * SR)], 0.08)
            if mode == 'dry': mix.put(a['crack'] + 0.1, S['craque'], 0.22)
        elif n == 'Osselets': mix.put(a['at'] + 0.55, S['osselets'], 0.25)
        elif n == 'Gonfle': mix.put(t0 + 0.1, S['eau'], 0.2)
        elif n == 'Enigme': mix.put(t0, S['pluie'][: int((a['at'] + 0.55 - t0) * SR)], 0.14)
        elif n == 'Recherche': mix.put(t0 + 0.25, S['clavier'], 0.16)
    b = tl['beats']
    mix.put(b['chiens'] - 0.1, S['chiens'], 0.26)
    mix.put(b['vache'] + 0.05, S['meuh'], 0.24)
