# Cue sheet — vidéo 46-biceps-menteur : bande-son commune sfx/gravure.py, calée sur build/shots.json, plus les bruitages ElevenLabs
# (muscle qui se tend, vis, coup de feu, décharge, os qui casse, foule du bras de fer).
import json
import os
import sys

import numpy as np
import soundfile as sf

from sfx.gravure import make
from sfx.synth import SR, boom, click, impact, riser, whoosh

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'tts'))
from sfx_eleven import sfx as eleven  # noqa: E402

BUILD = os.path.join(HERE, 'build', 'sfx')
os.makedirs(BUILD, exist_ok=True)
GEN = {
    'tendu': ('a thick rubber band being stretched tight, tense creak of leather, muscle tension', 0.9, 0.6),
    'vis': ('a screwdriver turning a metal screw into wood, ratcheting creak', 1.6, 0.6),
    'pan': ('a single old black powder pistol gunshot, loud crack with short echo', 1.2, 0.75),
    'zap': ('a short electric shock zap, high voltage arc crackling', 0.7, 0.7),
    'crac': ('a bone snapping, loud dry crack, gross and close up', 0.6, 0.75),
    'bdf': ('two men straining in an arm wrestling match, table creaking, crowd muttering', 1.6, 0.5),
}


def g(name):
    prompt, dur, infl = GEN[name]
    out = os.path.join(BUILD, name + '.wav')
    if not os.path.exists(out): eleven(prompt, out, dur, infl)
    y, sr = sf.read(out)
    y = y.mean(1) if y.ndim > 1 else y
    if sr != SR: y = np.interp(np.arange(0, len(y) * SR / sr) * sr / SR, np.arange(len(y)), y)
    return list(y / (np.max(np.abs(y)) + 1e-9) * 0.9)


base = make(__file__, 'src/videos/BicepsMenteur.shots.ts', semis=-1)


def score(mix, tl):
    base(mix, tl)
    shots = json.load(open(os.path.join(HERE, 'build', 'shots.json')))
    S = {k: g(k) for k in GEN}
    b = tl['beats']
    for s in shots:
        a, t0, t1 = s.get('anim') or {}, s['t0'], s['t1']
        n = a.get('name')
        if n == 'Vis': mix.put(t0 + 0.05, S['vis'], 0.2)
        elif n == 'Jauge' and a.get('shot') is not None:
            sh = a['shot']
            mix.put(sh, S['pan'], 0.5); mix.put(sh, boom(1.0, 60), 0.14)
        elif n == 'Crack' and a['at'] < t1:
            mix.put(a['at'], S['crac'], 0.42); mix.put(a['at'], impact(0.9), 0.14)
        elif n == 'Eclair':
            for tt in a['at']: mix.put(tt, S['zap'], 0.24)
    mix.put(b['dur'], S['tendu'], 0.26)
    mix.put(b['bdf'], S['bdf'], 0.16)
    mix.put(0.0, impact(0.8), 0.1); mix.put(0.0, S['tendu'], 0.18)
