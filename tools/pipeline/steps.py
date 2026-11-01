"""Étapes Python du pipeline vidéo.  tools/tts/bin/python tools/pipeline/steps.py <étape> <dossier vidéo>
  parse  : script.md → build/script.json (sections, jetons affichés/dits, balises, mots clés)
  voice  : script.json → public/v/<id>/voice.wav (TTS phrase par phrase, cache, chaîne ffmpeg)
  align  : build/whisper.json + script.json → captions.json, timeline.json, talk.json
  audio  : sfx.py (cue sheet) + voix → mix.wav masterisé −14 LUFS

Syntaxe de script.md :
  front-matter  ---\nvoice: henri\nrate: 1.0\n---
  # id          nouvelle section (balise `id` au premier mot)
  {@nom}        balise au mot suivant (timeline.json > beats.nom)
  [affiché|dit] texte des sous-titres ≠ texte prononcé (chiffres en sous-titres, lettres à la voix)
  *mot*         mot clé (surligné et en bleu dans les sous-titres)
  > note        ligne ignorée (indications de mise en scène)
  {=maman} … {=}  réplique dite par un autre perso (voix dans `cast:` du front-matter), {=} = retour au narrateur
  {!scared}     indication de jeu pour la voix (ElevenLabs v3/v4 : envoyée en [scared] au mot suivant, jamais sous-titrée)
  front-matter  cast: maman=eleven:<voice_id>, ferrand=eleven:<voice_id>
"""
import hashlib, json, os, re, subprocess, sys, unicodedata
import numpy as np, soundfile as sf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PY = os.path.join(ROOT, 'tools', 'tts', 'bin', 'python')
FPS = 30
SR = 48000


def paths(vdir):
    vid = os.path.basename(os.path.normpath(vdir))
    pub = os.path.join(ROOT, 'public', 'v', vid)
    build = os.path.join(vdir, 'build')
    os.makedirs(pub, exist_ok=True); os.makedirs(build, exist_ok=True)
    return vid, pub, build


def norm(w):
    w = unicodedata.normalize('NFD', w.lower())
    w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r"[^a-z0-9]+", '', w)


# ---------------- parse ----------------
def fold(s):
    """minuscules sans accents, pour comparer un mot-clé au texte"""
    import unicodedata
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')


def check_keyword(meta, secs):
    """`motcle:` doit être dit dans la 1re phrase et visible à l'écran au début (choc / choc_sous / titre du hook)"""
    kw = meta.get('motcle')
    if not kw or not secs:
        if not kw: print('⚠ parse: pas de `motcle:` dans le front-matter (mot que les gens tapent dans la recherche TikTok)')
        return
    s0 = secs[0]
    first = ' '.join(s0['tokens'][i]['spoken'] for i in s0['sentences'][0]) if s0['sentences'] else ''
    screen = ' '.join([meta.get('choc', ''), meta.get('choc_sous', ''), (s0.get('scene') or {}).get('titre', '')])
    ok_voice, ok_screen = fold(kw) in fold(first), fold(kw) in fold(screen)
    print(f"parse: mot-clé « {kw} » — 1re phrase {'✓' if ok_voice else '✗'}, écran d'ouverture {'✓' if ok_screen else '✗'}")
    if not ok_voice: print(f'⚠ mets « {kw} » dans la 1re phrase : « {first} »')
    if not ok_screen: print(f'⚠ mets « {kw} » dans choc_sous ou le titre du hook')


def parse(vdir):
    _, _, build = paths(vdir)
    src = open(os.path.join(vdir, 'script.md'), encoding='utf-8').read()
    meta = {}
    m = re.match(r'^---\n(.*?)\n---\n', src, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ':' in line:
                k, v = line.split(':', 1); meta[k.strip()] = v.strip()
        src = src[m.end():]
    sections, cur = [], None
    for line in src.splitlines():
        s = line.strip()
        # kit de scènes : `>> type` ouvre la scène de la section, puis `> clé: valeur` la paramètre
        if s.startswith('>>') and cur is not None:
            cur['scene'] = {'type': s[2:].strip()}; continue
        if s.startswith('>') and cur is not None and cur.get('scene') and re.match(r'^>\s*[\w-]+\s*:', s):
            k, v = s[1:].split(':', 1); cur['scene'][k.strip()] = v.strip(); continue
        if not s or s.startswith('>'):
            continue
        if s.startswith('#'):
            cur = {'id': s.lstrip('#').strip(), 'text': ''}; sections.append(cur); continue
        if cur is None:
            cur = {'id': 'intro', 'text': ''}; sections.append(cur)
        cur['text'] += ' ' + s
    out = []
    for sec in sections:
        tokens, pending, who, tag = [], [], '', ''
        # découpe en éléments : [a|b], {@x}, {=perso}, {!jeu}, mots
        # un préfixe/suffixe collé ([d'][a|b][,]) reste attaché au mot affiché et dit
        for m in re.finditer(r"([^\s\[{]*)\[([^\]|]+)\|([^\]]+)\]([^\s\[{]*)|\{@([\w-]+)\}|\{=([\w-]*)\}|\{!([^}]*)\}|(\S+)", sec['text']):
            if m.group(5):
                pending.append(m.group(5)); continue
            if m.group(6) is not None:
                who = m.group(6); continue
            if m.group(7) is not None:
                tag = (tag + ', ' if tag else '') + m.group(7).strip(); continue
            if m.group(2):
                pre, post = m.group(1), m.group(4)
                disp, spoken = pre + m.group(2).strip() + post, pre + m.group(3).strip() + post
            else:
                disp = spoken = m.group(8)
            if tokens and not pending and re.fullmatch(r'[.,;:!?…»)]+', disp):
                tokens[-1]['display'] += disp; tokens[-1]['spoken'] += spoken; continue
            key = '*' in disp
            disp = disp.replace('*', ''); spoken = spoken.replace('*', '')
            tokens.append({'display': disp, 'spoken': spoken, 'key': key, 'beats': pending, **({'who': who} if who else {}), **({'tag': tag} if tag else {})})
            pending, tag = [], ''
        if tokens:
            tokens[0]['beats'] = [sec['id']] + tokens[0]['beats']
        if pending and tokens:
            tokens[-1].setdefault('beatsAfter', []).extend(pending)
        spoken = ' '.join(t['spoken'] for t in tokens)
        # phrases (pour la TTS) : coupure après . ! ? …
        sents, curs = [], []
        for i, t in enumerate(tokens):
            curs.append(i)
            if re.search(r'[.!?…]["»)]?$', t['spoken']):
                sents.append(curs); curs = []
        if curs: sents.append(curs)
        out.append({'id': sec['id'], 'tokens': tokens, 'sentences': sents, 'spoken': spoken, 'scene': sec.get('scene')})
    data = {'meta': meta, 'sections': out}
    check_keyword(meta, out)
    json.dump(data, open(os.path.join(build, 'script.json'), 'w'), ensure_ascii=False, indent=1)
    n = sum(len(s['tokens']) for s in out)
    print(f'parse: {len(out)} sections, {n} mots')


# ---------------- voice ----------------
CHAIN = ('highpass=f=70,deesser=i=0.3,acompressor=threshold=-20dB:ratio=2.2:attack=10:release=120:makeup=1.5,'
         'equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=3500:t=q:w=1.2:g=1.2,aresample=48000')
# salles par perso (`voicefx:` du front-matter) : haut-parleur de quai carrelé, interphone de cabine
VOICE_FX = {
    'pa': ('highpass=f=330,lowpass=f=3900,equalizer=f=1700:t=q:w=1.4:g=4,'
           'acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=2,'
           'aecho=0.85:0.55:62|131|243|397:0.34|0.22|0.14|0.08,volume=5dB,apad=pad_dur=0.5'),
    'radio': ('highpass=f=520,lowpass=f=3000,equalizer=f=1400:t=q:w=1:g=5,'
              'acrusher=bits=9:mode=log:aa=1:mix=0.35,acompressor=threshold=-26dB:ratio=6:attack=2:release=60:makeup=3'),
}


def trim(y, sr, thr_db=-45):
    fr = int(0.01 * sr)
    if len(y) < fr * 3: return y
    e = np.sqrt(np.convolve(y ** 2, np.ones(fr) / fr, mode='same') + 1e-12)
    on = np.where(20 * np.log10(e) > thr_db)[0]
    if len(on) == 0: return y
    a = max(0, on[0] - int(0.015 * sr)); b = min(len(y), on[-1] + int(0.05 * sr))
    y = y[a:b].copy(); n = int(0.006 * sr); y[:n] *= np.linspace(0, 1, n); y[-n:] *= np.linspace(1, 0, n)
    return y


def voice(vdir):
    vid, pub, build = paths(vdir)
    data = json.load(open(os.path.join(build, 'script.json')))
    eng = data['meta'].get('voice', 'henri'); rate = float(data['meta'].get('rate', '1.0'))
    cache = os.path.join(build, 'tts'); os.makedirs(cache, exist_ok=True)
    user = os.path.join(vdir, 'voice-user.wav')  # sa propre voix : remplace la TTS
    chunks, sents_t, t, hold_at = [], [], 0.25, []
    chunks.append(np.zeros(int(0.25 * SR)))
    if os.path.exists(user):
        y, sr = sf.read(user); y = y.mean(1) if y.ndim > 1 else y
        y = resample(y, sr); chunks.append(y); t += len(y) / SR
    else:
        # découpage des prises : gemini = tout le script d'un coup (quota gratuit : 10 requêtes/jour, et la voix garde son élan),
        # eleven = une prise par section, voix locales = une prise par phrase. Forçable avec `chunk: all|section|sentence`.
        kind = eng.split(':')[0]
        # `cast:` (une voix par perso) : chaque section est découpée en répliques, une prise par réplique
        cast = dict(kv.strip().split('=', 1) for kv in data['meta'].get('cast', '').split(',') if '=' in kv)
        mode = data['meta'].get('chunk') or ('section' if cast else 'all' if kind.startswith('gemini') else 'section' if kind == 'eleven' else 'sentence')
        say_ = lambda toks: ' '.join((f"[{tk['tag']}] " if tk.get('tag') else '') + tk['spoken'] for tk in toks)
        n_all = sum(len(sec['tokens']) for sec in data['sections'])
        # `voicefx:` (une salle par perso) : annonce=pa, conducteur=radio → la prise passe par VOICE_FX avant le montage
        vfx = dict(kv.strip().split('=', 1) for kv in data['meta'].get('voicefx', '').split(',') if '=' in kv)
        plan = []  # (texte, indices globaux, est-ce la fin d'une section, moteur, perso)
        off = 0
        if mode == 'all':
            text = '\n\n'.join(say_(sec['tokens']) for sec in data['sections'])
            plan.append((text, list(range(n_all)), True, eng, ''))
        else:
            for sec in data['sections']:
                groups_s = [list(range(len(sec['tokens'])))] if mode == 'section' else sec['sentences']
                # coupe aussi à chaque changement de perso
                runs = []
                for idx in groups_s:
                    for i in idx:
                        w = sec['tokens'][i].get('who', '')
                        if runs and runs[-1][0] == w and runs[-1][2] is idx: runs[-1][1].append(i)
                        else: runs.append((w, [i], idx))
                for sj, (w, idx, _) in enumerate(runs):
                    if w and w not in cast: sys.exit(f'voice: perso « {w} » absent de `cast:`')
                    plan.append((say_([sec['tokens'][i] for i in idx]), [off + i for i in idx], sj == len(runs) - 1, cast.get(w, eng), w))
                off += len(sec['tokens'])
        json.dump([p[1] for p in plan], open(os.path.join(build, 'units.json'), 'w'))
        # `silence: hook=6.5` : silence ajouté après la section (temps de faire le test), jamais raccourci par `pauses:`
        holds = {k.strip(): float(v) for k, v in (kv.split('=', 1) for kv in data['meta'].get('silence', '').split(',') if '=' in kv)}
        sec_of, o = {}, 0
        for sec in data['sections']:
            for i in range(len(sec['tokens'])): sec_of[o + i] = sec['id']
            o += len(sec['tokens'])
        for text, gidx, end_sec, e, who in plan:
            if True:
                h = hashlib.sha1(f'{e}|{rate}|{text}'.encode()).hexdigest()[:12]
                f = os.path.join(cache, h + '.wav')
                if not os.path.exists(f):
                    subprocess.run([PY, os.path.join(ROOT, 'tools', 'tts', 'say.py'), e, text, f, str(rate)], check=True)
                fx = vfx.get(who)
                if fx:
                    if fx not in VOICE_FX: sys.exit(f'voicefx: effet « {fx} » inconnu ({", ".join(VOICE_FX)})')
                    g = os.path.join(cache, f'{h}.{fx}.wav')
                    if not os.path.exists(g):
                        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f, '-af', VOICE_FX[fx], g], check=True)
                    f = g
                y, sr = sf.read(f); y = y.mean(1) if y.ndim > 1 else y
                y = trim(resample(y, sr), SR)
                sents_t.append({'start': t, 'end': t + len(y) / SR, 'mode': mode})
                chunks.append(y); t += len(y) / SR
                last = text.rstrip()[-1]
                pause = 0.42 if end_sec else (0.3 if last in '.!?…' else 0.15)
                chunks.append(np.zeros(int(pause * SR))); t += pause
                if end_sec and sec_of.get(gidx[-1]) in holds: hold_at.append((t - pause + 0.05, holds[sec_of[gidx[-1]]]))
    raw = os.path.join(build, 'voice_raw.wav')
    yall = np.concatenate(chunks)
    # `pauses:` (front-matter, s) : plafonne chaque silence de la voix (Gemini étire parfois les pauses « dramatiques »)
    cap = float(data['meta'].get('pauses', '0'))
    if cap > 0:
        yall, tmap = cap_pauses(yall, cap)
        sents_t = [{**u, 'start': tmap(u['start']), 'end': tmap(u['end'])} for u in sents_t]
        hold_at = [(tmap(h), d) for h, d in hold_at]
    for h, d in sorted(hold_at, reverse=True):  # silences de `silence:` insérés après le plafonnement
        i = int(h * SR); yall = np.concatenate([yall[:i], np.zeros(int(d * SR)), yall[i:]])
        sents_t = [{**u, 'start': u['start'] + (d if u['start'] >= h else 0), 'end': u['end'] + (d if u['end'] > h else 0)} for u in sents_t]
    sf.write(raw, yall, SR)
    out = os.path.join(pub, 'voice.wav')
    # `tempo:` (front-matter) accélère la voix sans changer sa hauteur (1.03 à 1.12 conseillé)
    tempo = float(data['meta'].get('tempo', '1.0'))
    chain = (f'atempo={tempo},' if abs(tempo - 1) > 1e-3 else '') + CHAIN
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', chain, '-ac', '1', out], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', out, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', os.path.join(build, 'voice16k.wav')], check=True)
    sents_t = [{**u, 'start': u['start'] / tempo, 'end': u['end'] / tempo} for u in sents_t]  # bornes dans le temps accéléré
    json.dump(sents_t, open(os.path.join(build, 'sentences.json'), 'w'), indent=1)
    print(f'voice: {len(yall) / SR / tempo:.1f} s ({eng}, tempo {tempo}, pauses ≤ {cap or "∞"} s)')


def cap_pauses(y, cap, thr_db=-38):
    """raccourcit à `cap` s les silences plus longs ; renvoie (signal, fonction temps ancien → nouveau)"""
    fr = int(0.01 * SR)
    e = np.array([np.sqrt(np.mean(y[i:i + fr] ** 2) + 1e-12) for i in range(0, len(y) - fr, fr)])
    quiet = 20 * np.log10(e / (np.percentile(e, 95) + 1e-9) + 1e-9) < thr_db
    cuts, i = [], 0  # (début, fin) en échantillons des tronçons retirés
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) * 0.01 > cap:
                keep = int(cap * SR); a = i * fr + keep // 2; b = j * fr - (keep - keep // 2)
                if b > a: cuts.append((a, b))
            i = j
        else: i += 1
    parts, last = [], 0
    for a, b in cuts:
        parts.append(y[last:a]); last = b
    parts.append(y[last:])
    def tmap(t):
        n = int(t * SR); removed = sum(min(b, n) - a for a, b in cuts if a < n)
        return (n - removed) / SR
    return np.concatenate(parts), tmap


def resample(y, sr):
    if sr == SR: return y
    from scipy.signal import resample_poly
    from math import gcd
    g = gcd(SR, sr); return resample_poly(y, SR // g, sr // g)


# ---------------- align ----------------
UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize',
         'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
TENS = {2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante'}


def fr_int(n):
    """entier → toutes lettres (« 150 » → cent cinquante), jusqu'à 999 999"""
    if n < 20: return UNITS[n]
    if n < 70: return TENS[n // 10] + ('-et-un' if n % 10 == 1 else '-' + UNITS[n % 10] if n % 10 else '')
    if n < 80: return 'soixante-' + ('et-onze' if n == 71 else UNITS[n - 60])
    if n < 100: return 'quatre-vingt' + ('s' if n == 80 else '-' + UNITS[n - 80])
    if n < 1000:
        c, r = divmod(n, 100)
        head = 'cent' if c == 1 else UNITS[c] + (' cents' if r == 0 else ' cent')
        return head + (' ' + fr_int(r) if r else '')
    k, r = divmod(n, 1000)
    return ('mille' if k == 1 else fr_int(k) + ' mille') + (' ' + fr_int(r) if r else '')


def said(tok):
    """mot de whisper → mots prononcés : whisper écrit « 150 € » quand la voix dit « cent cinquante euros »"""
    t = tok.strip('.,;:!?…«»()"')
    if re.fullmatch(r'\d{1,6}', t.replace(' ', '').replace('\xa0', '')):
        return re.split(r"[\s-]+", fr_int(int(t.replace(' ', '').replace('\xa0', ''))))
    m = re.fullmatch(r'(\d+)[,.](\d+)', t)
    if m: return re.split(r"[\s-]+", fr_int(int(m.group(1)))) + ['virgule'] + re.split(r"[\s-]+", fr_int(int(m.group(2))))
    sym = {'€': ['euros'], '$': ['dollars'], '%': ['pour', 'cent']}
    if t in sym: return sym[t]
    return [tok]


def align(vdir):
    import difflib
    vid, pub, build = paths(vdir)
    data = json.load(open(os.path.join(build, 'script.json')))
    wj = json.load(open(os.path.join(build, 'whisper.json')))
    # mots whisper (les jetons sans espace initial se collent au mot précédent)
    ww = []
    for item in wj['transcription']:
        for tk in item.get('tokens', []):
            txt = tk['text']
            if txt.startswith('[_') or txt.startswith('<|'): continue
            a, b = tk['offsets']['from'] / 1000, tk['offsets']['to'] / 1000
            if ww and not txt.startswith(' ') and norm(txt):
                ww[-1]['text'] += txt; ww[-1]['end'] = b
            elif norm(txt):
                ww.append({'text': txt.strip(), 'start': a, 'end': b})
    # mots dits du script, rattachés à leur jeton affiché
    sw, owner = [], []
    toks = [t for s in data['sections'] for t in s['tokens']]
    for ti, t in enumerate(toks):
        for w in re.split(r"[\s'’-]+", t['spoken']):
            if norm(w): sw.append(norm(w)); owner.append(ti)
    wn = []
    wown = []
    for wi, w in enumerate(ww):
        for p in re.split(r"[\s'’-]+", w['text']):
            for q in said(p):
                if norm(q): wn.append(norm(q)); wown.append(wi)
    sm = difflib.SequenceMatcher(None, sw, wn, autojunk=False)
    t_of = [None] * len(sw)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            w = ww[wown[b + k]]; t_of[a + k] = (w['start'], w['end'])
    # interpolation des mots non reconnus
    known = [i for i, v in enumerate(t_of) if v]
    dur_voice = sf.info(os.path.join(pub, 'voice.wav')).duration
    for i in range(len(sw)):
        if t_of[i]: continue
        prev = max([k for k in known if k < i], default=None); nxt = min([k for k in known if k > i], default=None)
        t0 = t_of[prev][1] if prev is not None else 0.25
        t1 = t_of[nxt][0] if nxt is not None else dur_voice
        gap_n = (nxt if nxt is not None else len(sw)) - (prev if prev is not None else -1)
        pos = i - (prev if prev is not None else -1)
        a = t0 + (t1 - t0) * (pos - 1) / gap_n; b = t0 + (t1 - t0) * pos / gap_n
        t_of[i] = (a, b)
    matched = len(known) / max(1, len(sw))
    # temps par jeton affiché
    tt = {}
    for i, ti in enumerate(owner):
        a, b = t_of[i]
        if ti in tt: tt[ti] = (min(tt[ti][0], a), max(tt[ti][1], b))
        else: tt[ti] = (a, b)
    # recalage : chaque phrase TTS a des bornes exactes (sentences.json) → on y ramène les temps whisper
    sp_path = os.path.join(build, 'sentences.json')
    sents = json.load(open(sp_path)) if os.path.exists(sp_path) else []
    up = os.path.join(build, 'units.json')
    groups = json.load(open(up)) if os.path.exists(up) else [[sum(len(s2['tokens']) for s2 in data['sections'][:si]) + i for i in idx] for si, sec in enumerate(data['sections']) for idx in sec['sentences']]
    if len(sents) == len(groups):
        for g, se in zip(groups, sents):
            g = [ti for ti in g if ti in tt]
            if not g: continue
            w0 = min(tt[ti][0] for ti in g); w1 = max(min(tt[ti][1], tt[ti][0] + 0.7) for ti in g)  # un mot whisper qui déborde sur un long silence ne compte pas
            sc = (se['end'] - se['start']) / max(0.05, w1 - w0)
            for ti in g:
                a0, b0 = tt[ti]; tt[ti] = (se['start'] + (a0 - w0) * sc, se['start'] + (b0 - w0) * sc)
        print('align: recalé sur', len(sents), 'blocs de voix')
    # `snap: non` : on garde les temps whisper recalés sur les prises (utile quand un long `silence:` trompe le calage sur les pauses)
    if sents and sents[0].get('mode') in ('all', 'section') and data['meta'].get('snap', 'oui') != 'non':
        y, sr = sf.read(os.path.join(pub, 'voice.wav')); y = y.mean(1) if y.ndim > 1 else y
        fr = int(0.01 * sr)
        e = np.array([np.sqrt(np.mean(y[i:i + fr] ** 2) + 1e-12) for i in range(0, len(y) - fr, fr)])
        db = 20 * np.log10(e / (np.percentile(e, 95) + 1e-9) + 1e-9)
        quiet = db < -35
        sil = []  # fins de silences ≥ 150 ms (en s)
        i = 0
        while i < len(quiet):
            if quiet[i]:
                j = i
                while j < len(quiet) and quiet[j]: j += 1
                if j - i >= 15: sil.append((j * 0.01, (j - i) * 0.01))
                i = j
            else: i += 1
        # pauses attendues : chaque mot qui suit une ponctuation. On les associe dans l'ordre aux silences détectés
        # (programmation dynamique, comme une distance d'édition) : robuste quand whisper est en avance OU en retard,
        # et une pause « … » au milieu d'une phrase n'est plus prise pour le début de la suivante.
        pts, strong = [], []
        off = 0
        for sec in data['sections']:
            for i, tk in enumerate(sec['tokens']):
                prv = sec['tokens'][i - 1]['display'] if i else '.'
                if re.search(r'[.,;:!?…]$', prv):
                    pts.append(off + i); strong.append(bool(re.search(r'[.!?…]$', prv)))
            off += len(sec['tokens'])
        def est(k):
            ti = pts[k]; nxt = pts[k + 1] if k + 1 < len(pts) else len(toks)
            tj = next((j for j in range(ti, nxt) if j in tt), None)
            return None if tj is None else tt[tj][0] - 0.28 * (tj - ti)
        E = [est(k) for k in range(len(pts))]
        n, m, INF = len(pts), len(sil), 1e9
        U = lambda k: 0.9 if strong[k] else 0.3                  # pause attendue mais inaudible
        SK = lambda j: 0.15 + 0.8 * sil[j][1]                     # silence sans ponctuation
        def MC(k, j):
            if E[k] is None: return 0.45
            d = abs(sil[j][0] - E[k])
            return INF if d > 1.6 else d
        D = [[0.0] * (m + 1) for _ in range(n + 1)]
        for j in range(1, m + 1): D[0][j] = D[0][j - 1] + SK(j - 1)
        for k in range(1, n + 1):
            D[k][0] = D[k - 1][0] + U(k - 1)
            for j in range(1, m + 1):
                D[k][j] = min(D[k - 1][j] + U(k - 1), D[k][j - 1] + SK(j - 1), D[k - 1][j - 1] + MC(k - 1, j - 1))
        match, k, j = {}, n, m
        while k > 0 and j > 0:
            if abs(D[k][j] - (D[k - 1][j - 1] + MC(k - 1, j - 1))) < 1e-9: match[k - 1] = sil[j - 1][0]; k -= 1; j -= 1
            elif abs(D[k][j] - (D[k - 1][j] + U(k - 1))) < 1e-9: k -= 1
            else: j -= 1
        # début de chaque proposition : silence associé, sinon estimation whisper décalée comme la précédente
        T, dprev = [], 0.0
        for k in range(len(pts)):
            if k in match and E[k] is not None: T.append(match[k] - 0.02); dprev = T[-1] - E[k]
            else: T.append(None if E[k] is None else E[k] + dprev)
        for k in range(len(pts)):
            if T[k] is None: continue
            ti = pts[k]; nxt = pts[k + 1] if k + 1 < len(pts) else len(toks)
            own = [j for j in range(ti, nxt) if j in tt]
            nT = next((T[q] for q in range(k + 1, len(pts)) if T[q] is not None), None)
            # chaque proposition tient dans son créneau [début, début de la suivante] (whisper étire parfois les mots)
            span = max((tt[j][1] for j in own), default=E[k]) - E[k]
            sc = min(1.0, (nT - 0.06 - T[k]) / max(0.05, span)) if nT is not None and span > 0 else 1.0
            sc = max(0.3, sc)
            for j in own: tt[j] = (T[k] + (tt[j][0] - E[k]) * sc, T[k] + (tt[j][1] - E[k]) * sc)
            if ti not in tt: tt[ti] = (T[k], T[k] + 0.25)
        snapped, starts = len(match), pts
        # temps toujours croissants (un décalage de phrase ne doit pas chevaucher la suivante)
        last = -1.0
        for ti in sorted(tt):
            a, b = tt[ti]
            if a < last + 0.02: a = last + 0.02
            tt[ti] = (a, max(a, b))
            last = a
        print(f'align: {snapped}/{len(starts)} pauses du script calées sur les silences de la voix')
    words, beats = [], {}
    for ti, t in enumerate(toks):
        a, b = tt.get(ti, (words[-1]['endMs'] / 1000 if words else 0.25,) * 2)
        # whisper finit souvent les mots trop tôt : on prolonge jusqu'au suivant (max 0.6 s)
        words.append({'text': ' ' + t['display'], 'startMs': round(a * 1000), 'endMs': round(b * 1000), 'timestampMs': round(a * 1000), 'confidence': 1, 'key': t['key']})
        for bn in t['beats']: beats[bn] = round(a, 3)
        for bn in t.get('beatsAfter', []): beats[bn] = round(b, 3)
    for i in range(len(words) - 1):
        words[i]['endMs'] = max(words[i]['endMs'], min(words[i + 1]['startMs'], words[i]['endMs'] + 600))
    words[0]['text'] = words[0]['text'].lstrip()
    tail = float(data['meta'].get('tail', '1.2'))
    duration = round(dur_voice + tail, 3)
    sections = []
    ids = [s['id'] for s in data['sections']]
    for i, sid in enumerate(ids):
        sec_d = data['sections'][i]
        own = [bn for tk in sec_d['tokens'] for bn in tk['beats'] + tk.get('beatsAfter', []) if bn != sid]
        sections.append({'id': sid, 't0': beats[sid], 't1': beats[ids[i + 1]] if i + 1 < len(ids) else duration,
                         'scene': sec_d.get('scene'), 'beats': own})
    tl = {'fps': FPS, 'duration': duration, 'frames': int(round(duration * FPS)), 'beats': beats, 'sections': sections, 'title': data['meta'].get('title', vid)}
    M = data['meta']
    if M.get('hook'): tl['hook'] = M['hook']  # titre d'accroche écrit dès l'image 0 (DA Gravure)
    if M.get('choc') or M.get('commente'):
        tl['retention'] = {'choc': M.get('choc'), 'sous': M.get('choc_sous'), 'fin': float(M.get('choc_fin', '1.2')),
                           'boucle': M.get('boucle', 'oui' if M.get('choc') else 'non') != 'non', 'commente': M.get('commente')}
    json.dump(words, open(os.path.join(pub, 'captions.json'), 'w'), ensure_ascii=False)
    json.dump(tl, open(os.path.join(pub, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(tl, open(os.path.join(vdir, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    # enveloppe de parole par image (bouche)
    y, sr = sf.read(os.path.join(pub, 'voice.wav')); y = y.mean(1) if y.ndim > 1 else y
    hop = sr // FPS; n = tl['frames']
    env = np.array([np.sqrt(np.mean(y[i * hop:(i + 1) * hop] ** 2)) if i * hop < len(y) else 0 for i in range(n)])
    ref = np.percentile(env[env > 1e-4], 90) if np.any(env > 1e-4) else 1
    talk = np.clip((20 * np.log10(env / ref + 1e-6) + 30) / 30, 0, 1)
    talk = np.convolve(talk, [0.25, 0.5, 0.25], mode='same')
    json.dump([round(float(v), 2) for v in talk], open(os.path.join(pub, 'talk.json'), 'w'))
    print(f'align: {len(words)} mots, {matched * 100:.0f} % reconnus par whisper, durée {duration} s, {len(beats)} balises')
    if matched < 0.7: print('⚠ alignement faible : vérifier la voix / la langue')


# ---------------- audio ----------------
def audio(vdir):
    vid, pub, build = paths(vdir)
    sys.path.insert(0, ROOT)
    import importlib.util
    from sfx.mix import Mix
    tl = json.load(open(os.path.join(pub, 'timeline.json')))
    mix = Mix(tl['duration'], seed=11)
    cue = os.path.join(vdir, 'sfx.py')
    if os.path.exists(cue):
        spec = importlib.util.spec_from_file_location('cues', cue); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        m.score(mix, tl)
    else:
        default_score(mix, tl)
    fx = np.stack([np.array(mix.left), np.array(mix.right)], 1)
    v, sr = sf.read(os.path.join(pub, 'voice.wav')); v = v.mean(1) if v.ndim > 1 else v
    n = max(len(fx), len(v)); fx = np.pad(fx, ((0, n - len(fx)), (0, 0))); v = np.pad(v, (0, n - len(v)))
    # ducking : la musique et les bruitages baissent de ~5 dB sous la voix
    win = int(0.05 * SR)
    env = np.sqrt(np.convolve(v ** 2, np.ones(win) / win, mode='same'))
    speak = np.clip(env / (np.percentile(env, 80) + 1e-9), 0, 1)
    att = int(0.12 * SR); speak = np.convolve(speak, np.ones(att) / att, mode='same')
    duck = 1 - 0.45 * speak
    vref = np.sqrt(np.mean(v[np.abs(v) > 1e-3] ** 2)) if np.any(np.abs(v) > 1e-3) else 0.1
    fref = np.sqrt(np.mean(fx ** 2)) + 1e-9
    # niveau musique + bruitages : FX_LEVEL, sinon `fx:` du front-matter de script.md, sinon 0.32
    meta = json.load(open(os.path.join(build, 'script.json'))).get('meta', {}) if os.path.exists(os.path.join(build, 'script.json')) else {}
    level = float(os.environ.get('FX_LEVEL') or meta.get('fx') or 0.32)
    fx = fx * (vref / fref) * level * duck[:, None] if fref > 1e-6 else fx
    out = np.stack([v, v], 1) + fx
    fade = int(0.3 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    pre = os.path.join(build, 'mix_pre.wav'); sf.write(pre, out / (np.max(np.abs(out)) + 1e-9) * 0.7, SR)
    # loudnorm en 2 passes → −14 LUFS, crête vraie ≤ −2 dBTP (marge pour l'AAC)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', pre, '-af', 'loudnorm=I=-14:TP=-2:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    st = json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr)[-1])
    af = (f"loudnorm=I=-14:TP=-2:LRA=11:measured_I={st['input_i']}:measured_TP={st['input_tp']}:measured_LRA={st['input_lra']}"
          f":measured_thresh={st['input_thresh']}:offset={st['target_offset']}:linear=true,aresample=48000")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', pre, '-af', af, '-c:a', 'pcm_s16le', os.path.join(pub, 'mix.wav')], check=True)
    print(f'audio: {mix.count} sons, mix → public/v/{vid}/mix.wav')


def default_score(mix, tl):
    """Bande-son automatique (vidéos du kit sans sfx.py) : nappe + pulsation douce, pop sur chaque balise,
    whoosh sur les pages qui tournent, impact sur la 2e section (promesse), carillon sur la dernière balise."""
    from sfx.synth import pad, pop, whoosh, blip, chime, impact
    dur = tl['duration']; secs = tl['sections']
    PROG = [[146.83, 185.0, 220.0], [196.0, 246.94, 293.66], [164.81, 196.0, 246.94], [220.0, 277.18, 329.63]]  # ré, sol, mi m, la
    chords = [(s['t0'] if i else 0, PROG[i % len(PROG)]) for i, s in enumerate(secs)]
    l, r = pad(dur, chords, detune=0.8); mix.put_stereo(0, l, r, 0.06)
    t, k = 0.0, 0
    while t < dur - 1:
        root = [c for c in chords if c[0] <= t][-1][1]
        mix.put(t, blip(root[k % 3] * 2, 0.25, 0.07), 0.035 if k % 2 else 0.05, pan=-0.3 if k % 2 else 0.3); t += 0.5; k += 1
    for i, s in enumerate(secs):
        sc = s.get('scene') or {}
        if sc.get('transition') == 'page': mix.put(s['t0'] - 0.05, whoosh(0.7, 3000, 500, peak=0.35), 0.25)
        elif i: mix.put(s['t0'], whoosh(0.35, 700, 2200, peak=0.5), 0.08)
        if i == 1: mix.put(s['t0'] + 0.3, impact(0.7), 0.12)
        for j, bn in enumerate(s.get('beats', [])):
            if bn in tl['beats']: mix.put(tl['beats'][bn] + 0.1, pop(500 + j * 150, 1200 + j * 220, 0.14), 0.15, pan=-0.4 + 0.25 * (j % 4))
    last = max(tl['beats'].values()) if tl['beats'] else dur - 2
    mix.put(min(last + 0.3, dur - 2.2), chime([293.66, 369.99, 440.0, 587.33], 2.0, 0.8), 0.18)


def publication(vdir):
    """publication.txt : description (mot-clé en tête, 3-5 hashtags) + commentaire épinglé (question + sources)"""
    data = json.load(open(os.path.join(vdir, 'build', 'script.json')))
    M = data['meta']
    kw, title = M.get('motcle', ''), M.get('title', '')
    desc = M.get('description') or title
    if kw and fold(kw) not in fold(desc):
        desc = f'{kw[0].upper() + kw[1:]} : {desc}'
    tags = M.get('hashtags', '#economie #argent #apprendresurtiktok')
    urls = []
    sp = os.path.join(vdir, 'sources.md')
    if os.path.exists(sp):
        for u in re.findall(r'https?://[^\s)|»]+', open(sp, encoding='utf-8').read()):
            d = re.sub(r'^https?://(www\.)?', '', u).split('/')[0]
            if d not in urls: urls.append(d)
    q = M.get('commente', '')
    txt = (f"DESCRIPTION\n{desc}\n{tags}\n\n"
           f"COMMENTAIRE ÉPINGLÉ\n{(q + ' 👇') if q else ''}\n"
           f"Sources : {', '.join(urls[:5]) if urls else '(voir sources.md)'}\n")
    open(os.path.join(vdir, 'publication.txt'), 'w', encoding='utf-8').write(txt)
    print('publication.txt écrit')


# ---------------- check ----------------
def check(vdir, name='final.mp4'):
    f = os.path.join(vdir, name)
    pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', f], capture_output=True, text=True).stdout)
    v = next(s for s in pr['streams'] if s['codec_type'] == 'video')
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    summ = r[r.rfind('Summary:'):]
    I = re.search(r'I:\s+(-?[\d.]+) LUFS', summ); TP = re.search(r'Peak:\s+(-?[\d.]+) dBFS', summ)
    fz = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-vf', 'freezedetect=n=0.002:d=2.5', '-map', '0:v', '-f', 'null', '-'], capture_output=True, text=True).stderr
    nfz = fz.count('freeze_start')
    publication(vdir)
    print(f"check: {v['width']}×{v['height']} {v['r_frame_rate']} i/s, {float(pr['format']['duration']):.1f} s, "
          f"{I.group(1) if I else '?'} LUFS, crête vraie {TP.group(1) if TP else '?'} dBTP, {nfz} image(s) figée(s) > 2,5 s")


if __name__ == '__main__':
    fn = {'parse': parse, 'voice': voice, 'align': align, 'audio': audio, 'check': check, 'publication': publication}[sys.argv[1]]
    fn(os.path.abspath(sys.argv[2]), *sys.argv[3:])
