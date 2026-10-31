"""Bruitages du style « Survie » (références : dossier « Vidéo Zombie ») : sirène lointaine, bip d'alerte d'urgence, vibreur,
alarme de voiture, ronron de frigo, tic-tac accéléré, pas, échelle, vent, rotor lointain, coupure de courant, battement de cœur,
bip morse, râle de foule, glitch. Même forme que sfx/synth.py : listes d'échantillons mono à SR."""
import math
import random

from sfx.synth import SR, bandnoise


def _lp(x, a):
    """passe-bas un pôle (a petit = plus sombre)"""
    y, out = 0.0, []
    for v in x:
        y += a * (v - y)
        out.append(y)
    return out


def siren(dur, f0=720.0, f1=1250.0, period=4.0):
    """Sirène lointaine qui monte et descend (cycle de ~4 s), assourdie par la distance."""
    n = int(dur * SR)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        f = f0 + (f1 - f0) * (0.5 - 0.5 * math.cos(2 * math.pi * t / period))
        ph += 2 * math.pi * f / SR
        out.append(0.6 * math.sin(ph) + 0.25 * math.sin(2 * ph) + 0.1 * math.sin(3 * ph))
    out = _lp(out, 0.08)
    env = [min(1, k / (0.8 * SR), (n - k) / (0.8 * SR)) for k in range(n)]
    return [o * e * 2.2 for o, e in zip(out, env)]


def eas(beeps=3, on=0.5, off=0.12):
    """Bip d'alerte d'urgence à deux tons (853 + 960 Hz), en salves."""
    out = []
    for _ in range(beeps):
        n = int(on * SR)
        for k in range(n):
            t = k / SR
            a = min(1, k / 240, (n - k) / 240)
            out.append(a * 0.5 * (math.sin(2 * math.pi * 853 * t) + math.sin(2 * math.pi * 960 * t)))
        out += [0.0] * int(off * SR)
    return out


def buzz(dur=0.32):
    """Téléphone qui vibre sur une table : bourdon grave haché + cliquetis du bois."""
    n = int(dur * SR)
    rattle = bandnoise(n, lambda k: 900, q=0.6)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        ph += 2 * math.pi * 165 / SR
        am = 0.6 + 0.4 * math.sin(2 * math.pi * 28 * t)
        a = min(1, t / 0.01, (dur - t) / 0.03)
        out.append(a * am * (math.tanh(3 * math.sin(ph)) * 0.5 + rattle[k] * 1.6))
    return out


def car_alarm(dur=2.6):
    """Alarme de voiture : deux tons qui alternent vite, sirène qui monte, en boucle."""
    n = int(dur * SR)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        seg = int(t / 0.65) % 2
        f = (1300 if int(t * 8) % 2 else 980) if seg == 0 else 900 + 900 * ((t % 0.65) / 0.65)
        ph += 2 * math.pi * f / SR
        a = min(1, t / 0.02, (dur - t) / 0.3)
        out.append(a * math.tanh(2.5 * math.sin(ph)) * 0.6)
    return _lp(out, 0.35)


def hum(dur, f=58.0):
    """Ronron électrique (frigo, néon) : fondamentale + harmoniques, très léger."""
    n = int(dur * SR)
    out = []
    for k in range(n):
        t = k / SR
        a = min(1, t / 0.4, (dur - t) / 0.4)
        out.append(a * (0.6 * math.sin(2 * math.pi * f * t) + 0.3 * math.sin(4 * math.pi * f * t) + 0.12 * math.sin(6 * math.pi * f * t)))
    return out


def tick(f=3200.0):
    """Tic d'horloge sec."""
    n = int(0.03 * SR)
    return [math.sin(2 * math.pi * f * k / SR) * math.exp(-k / (0.004 * SR)) + random.uniform(-1, 1) * 0.4 * math.exp(-k / (0.001 * SR)) for k in range(n)]


def step(hard=True):
    """Pas sur du béton (grave + claquement)."""
    n = int(0.22 * SR)
    sl = bandnoise(n, lambda k: 1400 if hard else 600, q=0.7)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        ph += 2 * math.pi * (80 + 90 * math.exp(-t / 0.02)) / SR
        out.append(math.tanh(1.5 * (math.sin(ph) * math.exp(-t / 0.05) + sl[k] * 1.8 * math.exp(-t / 0.018))))
    return out


def clank(f=520.0):
    """Barreau d'échelle métallique : impact inharmonique court."""
    n = int(0.5 * SR)
    parts = ((1.0, 1.0, 0.12), (2.3, 0.5, 0.08), (3.9, 0.3, 0.05))
    return [sum(g * math.sin(2 * math.pi * f * r * k / SR) * math.exp(-k / (tau * SR)) for r, g, tau in parts) * 0.6 + random.uniform(-1, 1) * 0.5 * math.exp(-k / (0.003 * SR)) for k in range(n)]


def wind(dur, base=420.0):
    """Vent : bruit filtré qui ondule lentement."""
    n = int(dur * SR)
    w = bandnoise(n, lambda k: base + 180 * math.sin(k / SR * 0.7) + 90 * math.sin(k / SR * 2.3), q=0.4)
    return [v * min(1, k / (0.6 * SR), (n - k) / (0.6 * SR)) * 1.4 for k, v in enumerate(w)]


def rotor(dur):
    """Hélicoptère très lointain : souffle haché à ~11 Hz, assourdi."""
    n = int(dur * SR)
    w = bandnoise(n, lambda k: 260, q=0.5)
    return [v * (0.4 + 0.6 * max(0, math.sin(2 * math.pi * 11 * k / SR)) ** 3) * min(1, k / SR, (n - k) / SR) * 1.6 for k, v in enumerate(w)]


def power_down(dur=1.4):
    """Coupure de courant : claquement + bourdon qui chute dans le grave."""
    n = int(dur * SR)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        f = 120 * math.exp(-t / 0.35) + 30
        ph += 2 * math.pi * f / SR
        snap = random.uniform(-1, 1) * math.exp(-t / 0.006)
        out.append(math.tanh(2 * (math.sin(ph) * math.exp(-t / 0.6) * 0.8 + snap)))
    return out


def heartbeat(bpm=62, dur=4.0):
    """Battement de cœur sourd (lub-dub)."""
    n = int(dur * SR)
    out = [0.0] * n
    period = 60 / bpm
    t0 = 0.0
    while t0 < dur:
        for dt, g in ((0.0, 1.0), (0.22, 0.7)):
            i0 = int((t0 + dt) * SR)
            ph = 0.0
            for k in range(int(0.18 * SR)):
                if i0 + k >= n:
                    break
                t = k / SR
                ph += 2 * math.pi * (48 + 30 * math.exp(-t / 0.02)) / SR
                out[i0 + k] += g * math.sin(ph) * math.exp(-t / 0.06)
        t0 += period
    return out


def beep(dur, f=880.0):
    """Bip morse : sinus pur aux bords adoucis."""
    n = int(dur * SR)
    return [math.sin(2 * math.pi * f * k / SR) * min(1, k / 200, (n - k) / 200) for k in range(n)]


def moan(dur=1.6, f=95.0, seed=0):
    """Râle d'infecté : voix grave rauque (formants) qui gonfle et retombe."""
    random.seed(1000 + seed)
    n = int(dur * SR)
    br = bandnoise(n, lambda k: 520 + 200 * math.sin(k / SR * 3), q=0.5)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        ph += 2 * math.pi * (f * (1 + 0.04 * math.sin(2 * math.pi * 5 * t))) / SR
        a = math.sin(math.pi * t / dur) ** 1.5
        out.append(a * (math.tanh(2.2 * math.sin(ph)) * 0.35 + br[k] * 1.4))
    return _lp(out, 0.25)


def glitch(dur=0.35):
    """Glitch numérique : bruit haché et notes carrées aléatoires."""
    n = int(dur * SR)
    out, val, hold = [], 0.0, 0
    f = 400.0
    for k in range(n):
        if hold <= 0:
            hold = random.randint(200, 1400)
            val = random.uniform(-1, 1)
            f = random.choice([220.0, 440.0, 660.0, 1320.0, 90.0])
        hold -= 1
        sq = 1 if math.sin(2 * math.pi * f * k / SR) > 0 else -1
        out.append((0.5 * val + 0.35 * sq) * (1 - k / n))
    return out


def scrape(dur):
    """Meuble traîné sur le parquet : frottement grave haché par les à-coups."""
    n = int(dur * SR)
    w = bandnoise(n, lambda k: 340 + 120 * math.sin(k / SR * 9), q=0.5)
    out = []
    for k, v in enumerate(w):
        t = k / SR
        am = 0.55 + 0.45 * max(0.0, math.sin(2 * math.pi * 2.6 * t)) ** 0.5
        out.append(v * am * min(1, t / 0.08, (dur - t) / 0.12) * 2.2)
    return out


def crash(dur=1.6):
    """Armoire qui s'écrase : coup sourd, craquement du bois, débris."""
    n = int(dur * SR)
    crack = bandnoise(n, lambda k: 1800 - 1200 * min(1, k / (0.2 * SR)), q=0.6)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        ph += 2 * math.pi * (60 + 80 * math.exp(-t / 0.03)) / SR
        body = math.sin(ph) * math.exp(-t / 0.35)
        deb = crack[k] * 2.4 * (math.exp(-t / 0.08) + 0.25 * math.exp(-t / 0.5) * (random.random() < 0.02))
        out.append(math.tanh(1.6 * (body + deb)))
    return out


def water(dur, bright=1.0):
    """Robinet qui coule : souffle aigu bouillonnant."""
    n = int(dur * SR)
    w = bandnoise(n, lambda k: 2600 * bright + 900 * math.sin(k / SR * 23) + 400 * math.sin(k / SR * 61), q=0.35)
    return [v * (0.7 + 0.3 * math.sin(k / SR * 37)) * min(1, k / (0.15 * SR), (n - k) / (0.4 * SR)) * 1.6 for k, v in enumerate(w)]


def glug(n_bubbles=5):
    """Bidon qui se remplit : petites bulles qui montent dans les graves."""
    out = []
    for i in range(n_bubbles):
        d = 0.09 + random.uniform(0, 0.05)
        m = int(d * SR)
        f0 = 180 + i * 25 + random.uniform(-20, 20)
        ph = 0.0
        for k in range(m):
            t = k / SR
            ph += 2 * math.pi * (f0 + 500 * t / d) / SR
            out.append(math.sin(ph) * math.sin(math.pi * t / d))
        out += [0.0] * int(random.uniform(0.02, 0.06) * SR)
    return out


def clink(f=3100.0):
    """Cuillère contre la boîte : tintement métallique très court."""
    n = int(0.25 * SR)
    parts = ((1.0, 1.0, 0.05), (2.7, 0.5, 0.03), (5.1, 0.3, 0.02))
    return [sum(g * math.sin(2 * math.pi * f * r * k / SR) * math.exp(-k / (tau * SR)) for r, g, tau in parts) for k in range(n)]


def can_open():
    """Ouverture d'une conserve : clic de la languette + souffle."""
    n = int(0.45 * SR)
    hiss = bandnoise(n, lambda k: 3200, q=0.5)
    return [(random.uniform(-1, 1) * math.exp(-k / (0.004 * SR)) * (1 if k < 0.01 * SR else 0) + hiss[k] * 1.6 * math.exp(-k / (0.12 * SR))) for k in range(n)]


def claw(dur=0.25):
    """Ongles sur le béton de la façade : grattement aigu bref."""
    n = int(dur * SR)
    w = bandnoise(n, lambda k: 3800 - 1600 * k / n, q=0.4)
    return [v * math.exp(-k / (0.08 * SR)) * 2.2 for k, v in enumerate(w)]


def glass_tap():
    """Doigt contre une vitre : toc sec + tintement du verre."""
    n = int(0.6 * SR)
    out = []
    for k in range(n):
        t = k / SR
        body = math.sin(2 * math.pi * 210 * t) * math.exp(-t / 0.03)
        ring = 0.35 * math.sin(2 * math.pi * 2900 * t) * math.exp(-t / 0.12) + 0.2 * math.sin(2 * math.pi * 4700 * t) * math.exp(-t / 0.07)
        out.append(math.tanh(1.6 * (body + ring + random.uniform(-1, 1) * math.exp(-t / 0.002))))
    return out


def knock():
    """Coup de poing sourd dans une porte en bois."""
    n = int(0.35 * SR)
    wood = bandnoise(n, lambda k: 700, q=0.6)
    out, ph = [], 0.0
    for k in range(n):
        t = k / SR
        ph += 2 * math.pi * (95 + 60 * math.exp(-t / 0.015)) / SR
        out.append(math.tanh(2.0 * (math.sin(ph) * math.exp(-t / 0.06) + wood[k] * 2.0 * math.exp(-t / 0.02))))
    return out


def tape(dur=0.45):
    """Scotch qu'on déroule et qu'on arrache : crépitement qui monte."""
    n = int(dur * SR)
    w = bandnoise(n, lambda k: 1500 + 2500 * k / n, q=0.3)
    return [v * (0.5 + 0.5 * (random.random() < 0.3)) * min(1, k / (0.02 * SR), (n - k) / (0.05 * SR)) * 2 for k, v in enumerate(w)]


def paper():
    """Feuille plaquée contre une vitre : souffle bref et claque légère."""
    n = int(0.3 * SR)
    w = bandnoise(n, lambda k: 2200, q=0.5)
    return [v * math.exp(-k / (0.05 * SR)) * 1.8 for k, v in enumerate(w)]


def shards(dur=1.4):
    """Éclats de verre qui tintent (vitre brisée)."""
    n = int(dur * SR)
    out = [0.0] * n
    for _ in range(26):
        i0 = int(random.uniform(0, dur * 0.7) * SR)
        f = random.uniform(2400, 6200)
        for k in range(int(0.15 * SR)):
            if i0 + k >= n:
                break
            out[i0 + k] += 0.25 * math.sin(2 * math.pi * f * k / SR) * math.exp(-k / (0.03 * SR))
    return out


def drill(dur=0.5):
    """Visseuse : moteur aigu qui monte, cliquetis de l'embrayage."""
    n = int(dur * SR)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        f = 380 + 260 * min(1, t / 0.12)
        ph += 2 * math.pi * f / SR
        a = min(1, t / 0.02, (dur - t) / 0.05)
        out.append(a * (0.5 * math.tanh(3 * math.sin(ph)) + 0.25 * math.sin(3 * ph) + 0.2 * random.uniform(-1, 1) * (math.sin(2 * math.pi * 30 * t) > 0.6)))
    return out


# ---------------- métro (série « TERMINUS ») ----------------
def rumble(dur, f=46.0):
    """Rame à l'arrêt : compresseur et moteur au ralenti, grondement grave qui pulse, très sourd."""
    n = int(dur * SR)
    low = bandnoise(n, lambda k: 90, q=0.5)
    out = []
    for k in range(n):
        t = k / SR
        am = 0.75 + 0.25 * math.sin(2 * math.pi * 0.9 * t) * math.sin(2 * math.pi * 0.23 * t)
        a = min(1, t / 0.8, (dur - t) / 0.8)
        out.append(a * am * (0.5 * math.sin(2 * math.pi * f * t) + 0.22 * math.sin(2 * math.pi * 2 * f * t + 0.4) + low[k] * 2.4))
    return out


def brakes(dur=2.4):
    """Freins de métro : crissement aigu qui ondule et descend, frottement métallique, puis le « pschhh » de l'air."""
    n = int(dur * SR)
    grind = bandnoise(n, lambda k: 1800 - 900 * k / n, q=0.35)
    hiss = bandnoise(n, lambda k: 5200, q=0.6)
    ph1 = ph2 = 0.0
    out = []
    for k in range(n):
        t = k / SR
        u = t / dur
        f1 = 3150 - 900 * u + 60 * math.sin(2 * math.pi * 7.3 * t)
        f2 = 2380 - 600 * u + 45 * math.sin(2 * math.pi * 5.1 * t + 1)
        ph1 += 2 * math.pi * f1 / SR
        ph2 += 2 * math.pi * f2 / SR
        sq = min(1, t / 0.15) * max(0, 1 - max(0, u - 0.72) / 0.12)
        air = max(0, min(1, (u - 0.78) / 0.04)) * math.exp(-max(0, u - 0.82) * 7)
        out.append(sq * (0.32 * math.sin(ph1) + 0.22 * math.sin(ph2) + grind[k] * 1.1 * (0.6 + 0.4 * math.sin(2 * math.pi * 13 * t))) + air * hiss[k] * 2.6)
    return out


def neon_buzz(dur, f=100.0):
    """Néon : bourdonnement à 100 Hz riche en harmoniques, un peu de grésillement."""
    n = int(dur * SR)
    fizz = bandnoise(n, lambda k: 3800, q=0.7)
    out = []
    for k in range(n):
        t = k / SR
        a = min(1, t / 0.05, (dur - t) / 0.05)
        s = math.sin(2 * math.pi * f * t)
        out.append(a * (0.35 * math.copysign(abs(s) ** 0.4, s) + 0.12 * math.sin(2 * math.pi * 3 * f * t) + fizz[k] * 0.35 * (0.5 + 0.5 * math.sin(2 * math.pi * 50 * t))))
    return out


def neon_flick():
    """Néon qui grésille : claquement électrique sec et bref."""
    n = int(0.09 * SR)
    hp = bandnoise(n, lambda k: 4200, q=0.5)
    return [hp[k] * 3.2 * math.exp(-k / (0.012 * SR)) + random.uniform(-1, 1) * 0.6 * math.exp(-k / (0.002 * SR)) for k in range(n)]


def neon_pop():
    """Le tube qui claque : pop électrique + tintement du verre, puis plus rien."""
    n = int(0.9 * SR)
    hp = bandnoise(n, lambda k: 2600, q=0.4)
    out = []
    for k in range(n):
        t = k / SR
        glass = sum(g * math.sin(2 * math.pi * fr * t) * math.exp(-t / tau) for fr, g, tau in ((3420, 0.3, 0.18), (5130, 0.18, 0.1), (7260, 0.1, 0.06)))
        out.append(math.tanh(2.5 * (hp[k] * 2.2 * math.exp(-t / 0.03) + random.uniform(-1, 1) * math.exp(-t / 0.004))) * 0.8 + glass)
    return out


def chime_pa(notes=(784.0, 659.25, 523.25), gap=0.32):
    """Carillon d'annonce de quai : trois notes de cloche qui descendent, avec l'écho du carrelage."""
    dur = gap * len(notes) + 1.6
    n = int(dur * SR)
    dry = [0.0] * n
    for i, f in enumerate(notes):
        k0 = int(i * gap * SR)
        for k in range(n - k0):
            t = k / SR
            dry[k0 + k] += (0.55 * math.sin(2 * math.pi * f * t) + 0.18 * math.sin(2 * math.pi * 2.01 * f * t) + 0.08 * math.sin(2 * math.pi * 3.02 * f * t)) * math.exp(-t / 0.55) * min(1, t / 0.004)
    out = list(dry)
    for d, g in ((0.083, 0.42), (0.171, 0.28), (0.29, 0.18), (0.43, 0.1)):
        dk = int(d * SR)
        for k in range(dk, n):
            out[k] += dry[k - dk] * g
    return [v * 0.8 for v in out]


def doors_open():
    """Portes de métro qui s'ouvrent : souffle d'air comprimé, roulement des vantaux, butée."""
    n = int(1.1 * SR)
    air = bandnoise(n, lambda k: 3000 - 1800 * k / n, q=0.55)
    roll = bandnoise(n, lambda k: 220, q=0.6)
    out = []
    for k in range(n):
        t = k / SR
        a = math.exp(-t / 0.35) * min(1, t / 0.02)
        r = (0.5 + 0.5 * math.sin(2 * math.pi * 38 * t)) * (1 if 0.1 < t < 0.75 else 0.2)
        stop = math.sin(2 * math.pi * 90 * t) * math.exp(-max(0, t - 0.76) / 0.05) if t > 0.76 else 0
        out.append(air[k] * 2.4 * a + roll[k] * 2.0 * r * 0.5 + stop * 0.8)
    return out


def door_beep():
    """Signal de fermeture des portes : bip électronique aigu et sec."""
    n = int(0.16 * SR)
    return [0.5 * (math.sin(2 * math.pi * 1180 * k / SR) + 0.35 * math.sin(2 * math.pi * 3540 * k / SR)) * min(1, k / 120, (n - k) / 240) for k in range(n)]


def static(dur):
    """Interphone : souffle radio haché, craquements."""
    n = int(dur * SR)
    hiss = bandnoise(n, lambda k: 2400, q=0.3)
    out = []
    for k in range(n):
        t = k / SR
        gate = 1.0 if math.sin(t * 61.3) * math.sin(t * 17.9) > 0.2 else 0.35
        crack = random.uniform(-1, 1) * 2.5 if random.random() < 0.0009 else 0
        a = min(1, t / 0.05, (dur - t) / 0.08)
        out.append(a * (hiss[k] * 1.8 * gate + crack))
    return out


def drip():
    """Goutte qui tombe dans une flaque : « plip » qui monte, très court."""
    n = int(0.12 * SR)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        ph += 2 * math.pi * (900 + 1600 * (t / 0.12)) / SR
        out.append(math.sin(ph) * math.exp(-t / 0.025) * 0.7)
    return out


def wet_step():
    """Pas mouillé sur le carrelage : claquement mat + petit clapotis."""
    n = int(0.3 * SR)
    sl = bandnoise(n, lambda k: 900, q=0.6)
    sp = bandnoise(n, lambda k: 3200, q=0.5)
    return [math.tanh(1.4 * (sl[k] * 2.2 * math.exp(-k / (0.02 * SR)) + sp[k] * 1.4 * math.exp(-max(0, k - 0.03 * SR) / (0.05 * SR)) * (k > 0.03 * SR))) for k in range(n)]


def whisper(dur, seed=3):
    """Murmure inintelligible : souffle aigu qui forme des syllabes."""
    rnd = random.Random(seed)
    n = int(dur * SR)
    w = bandnoise(n, lambda k: 2600 + 900 * math.sin(k / SR * 9.1), q=0.35)
    rate = [rnd.uniform(5, 8) for _ in range(4)]
    out = []
    for k in range(n):
        t = k / SR
        syl = max(0, math.sin(2 * math.pi * rate[int(t * 2) % 4] * t)) ** 1.5
        a = min(1, t / 0.15, (dur - t) / 0.2)
        out.append(w[k] * 2.2 * syl * a)
    return out
