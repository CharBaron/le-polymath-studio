"""Préparation des images « Gravure » v3.1, commune à toutes les vidéos : un style visuel par vidéo.
Dans videos/<id>/prep_img.py :  from tools.pipeline.gravure_prep import run ; run(__file__, STYLE, JOBS)
Styles : or (marbre noir, sépia crème) · archive (carton kraft, registre ligné, sépia jauni) · labo (bleu nuit quadrillé, bichromie bleue)
         · grec (vernis noir, terre cuite : gravures en figures rouges) · anatomie (parchemin taché, encre brune) · atlas (nuit étoilée, parchemin).
JOBS = {nom: (type, source, recadrage, largeur max[, options])}
  carte  : recadrage x0 y0 x1 y1 (fractions), bichromie du style, bord de papier déchiré + liseré
  plein  : image plein écran 1080×1920 (recadrage = zone visée, ramenée au format 9:16), bichromie, sans bord
  rond   : médaillon (cx, cy, r en fractions de la largeur) ; detour / piece : voir la DA v2
  options : {'color': True} garde les couleurs d'origine (légèrement désaturées et réchauffées)"""
import os, math, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from scipy import ndimage as ndi

STYLES = {
    'or':       {'ink': (22, 19, 15), 'paper': (239, 230, 210), 'card': (239, 230, 210), 'rim': (201, 160, 67)},
    'archive':  {'ink': (30, 21, 12), 'paper': (236, 220, 184), 'card': (230, 212, 172), 'rim': (176, 118, 44)},
    'labo':     {'ink': (8, 20, 38), 'paper': (210, 230, 244), 'card': (222, 236, 247), 'rim': (63, 208, 255)},
    'grec':     {'ink': (18, 12, 9), 'paper': (222, 128, 74), 'card': (214, 120, 68), 'rim': (24, 16, 12)},
    'anatomie': {'ink': (44, 24, 14), 'paper': (240, 228, 202), 'card': (243, 234, 212), 'rim': (150, 32, 28)},
    'atlas':    {'ink': (14, 22, 52), 'paper': (236, 224, 192), 'card': (238, 228, 200), 'rim': (226, 177, 74)},
    'reve':     {'ink': (24, 14, 44), 'paper': (234, 226, 242), 'card': (238, 231, 245), 'rim': (185, 138, 240)},
    'deluge':   {'ink': (10, 18, 32), 'paper': (214, 224, 232), 'card': (226, 233, 238), 'rim': (90, 170, 255)},
    'optique':  {'ink': (30, 10, 10), 'paper': (242, 234, 226), 'card': (246, 240, 234), 'rim': (214, 40, 40)},
    'empire':   {'ink': (16, 26, 18), 'paper': (236, 228, 204), 'card': (240, 233, 212), 'rim': (92, 190, 120)},
    'caverne':  {'ink': (26, 16, 26), 'paper': (232, 222, 210), 'card': (238, 230, 220), 'rim': (196, 120, 230)},
}
S = dict(STYLES['or'])


def sepia(im, cut=1.0, gamma=1.0):
    """niveaux de gris contrastés → dégradé encre → papier du style"""
    g = ImageOps.autocontrast(im.convert('L'), cutoff=cut)
    a = (np.asarray(g, dtype=np.float32) / 255) ** gamma
    ink, paper = np.array(S['ink'], np.float32), np.array(S['paper'], np.float32)
    rgb = ink[None, None, :] * (1 - a[..., None]) + paper[None, None, :] * a[..., None]
    return rgb.astype(np.uint8)


def colour(im):
    """couleurs d'origine, contrastées, désaturées de 25 % et réchauffées"""
    a = np.asarray(ImageOps.autocontrast(im.convert('RGB'), cutoff=0.6), np.float32)
    g = a.mean(2, keepdims=True)
    a = g + (a - g) * 0.75
    a = a * np.array([1.04, 1.0, 0.92])
    return np.clip(a, 0, 255).astype(np.uint8)


def fit(im, wmax):
    if im.width > wmax: im = im.resize((wmax, round(im.height * wmax / im.width)), Image.LANCZOS)
    return im


def torn(w, h, seed, amp=7.0, inset=0):
    """polygone de papier déchiré : bruit grossier + dents fines le long des 4 bords"""
    rng = np.random.default_rng(seed)
    pts = []
    def edge(n, f):
        coarse = ndi.gaussian_filter1d(rng.normal(0, 1, n), 9) * amp * 2.2
        fine = rng.normal(0, amp * 0.28, n)
        for i in range(n):
            pts.append(f(i / (n - 1), coarse[i] + fine[i]))
    m = inset + amp * 1.6
    edge(max(8, w // 6), lambda t, d: (m + t * (w - 2 * m), m + d))
    edge(max(8, h // 6), lambda t, d: (w - m + d, m + t * (h - 2 * m)))
    edge(max(8, w // 6), lambda t, d: (w - m - t * (w - 2 * m), h - m + d))
    edge(max(8, h // 6), lambda t, d: (m + d, h - m - t * (h - 2 * m)))
    mk = Image.new('L', (w, h), 0); ImageDraw.Draw(mk).polygon(pts, fill=255)
    return mk.filter(ImageFilter.GaussianBlur(0.7))


def sticker(rgb, mask, border, gold=3):
    """objet + bord crème (border px) + liseré doré (gold px) ; renvoie RGBA agrandi"""
    pad = border + gold + 6
    h, w = mask.shape
    M = np.zeros((h + 2 * pad, w + 2 * pad), bool); M[pad:pad + h, pad:pad + w] = mask > 127
    disk = lambda r: np.hypot(*np.mgrid[-r:r + 1, -r:r + 1]) <= r
    cream = ndi.binary_dilation(M, disk(border)) if border else M
    ring = ndi.binary_dilation(cream, disk(gold))
    out = np.zeros(M.shape + (4,), np.float32)
    out[ring] = (*S['rim'], 255)
    out[cream] = (*S['card'], 255)
    body = np.zeros(M.shape + (3,), np.float32); body[pad:pad + h, pad:pad + w] = rgb
    a = np.zeros(M.shape, np.float32); a[pad:pad + h, pad:pad + w] = mask / 255
    out[..., :3] = out[..., :3] * (1 - a[..., None]) + body * a[..., None]
    out[..., 3] = np.maximum(out[..., 3], a * 255)
    # bords adoucis
    alpha = ndi.gaussian_filter(out[..., 3], 0.8)
    out[..., 3] = alpha
    return Image.fromarray(out.astype(np.uint8))


def piece(im):
    """pièce sur fond gris : métal clair → disque plein, puis cercle de même aire centré sur le métal"""
    a = np.asarray(im.convert('RGB'), dtype=np.float32); lum = a.mean(2)
    h, w = lum.shape; e = max(4, w // 25)
    bg = np.median(np.concatenate([lum[:e].ravel(), lum[-e:].ravel(), lum[:, :e].ravel(), lum[:, -e:].ravel()]))
    m = ndi.binary_fill_holes(ndi.binary_closing(lum > bg + 14, iterations=6))
    lab, n = ndi.label(m); m = lab == (1 + int(np.argmax(ndi.sum(m, lab, range(1, n + 1)))))
    cy, cx = ndi.center_of_mass(m); r = math.sqrt(m.sum() / math.pi) * 1.01
    yy, xx = np.mgrid[:h, :w]
    disk = (np.hypot(yy - cy, xx - cx) <= r).astype(np.uint8) * 255
    box = (round(cx - r - 2), round(cy - r - 2), round(cx + r + 2), round(cy + r + 2))
    return box, Image.fromarray(disk).filter(ImageFilter.GaussianBlur(1.0))


def detour(im, seeds=()):
    """fond uni (gris dégradé) → masque de l'objet ; les trous fermés couleur de fond (anse : `seeds`) deviennent transparents"""
    a = np.asarray(im.convert('RGB'), dtype=np.float32)
    lum = a.mean(2); sat = a.max(2) - a.min(2)
    h, w = lum.shape; e = max(4, w // 25)
    bg_row = np.median(np.concatenate([lum[:, :e], lum[:, -e:]], 1), 1)
    diff = np.abs(lum - bg_row[:, None])
    bgl = (diff < 9) & (sat < 14)
    lab, n = ndi.label(bgl)
    border_ids = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border_ids))
    hole = np.zeros_like(bg)
    for fx, fy in seeds:
        y, x = round(fy * h), round(fx * w)
        loose = (diff < 16) & (sat < 20)
        lab2, _ = ndi.label(loose)
        if lab2[y, x]:
            near = np.zeros_like(bg); near[max(0, y - h // 6):y + h // 6, max(0, x - w // 8):x + w // 8] = True
            hole |= (lab2 == lab2[y, x]) & near
    fg = ~bg
    fg = ndi.binary_opening(fg, iterations=2)
    lab2, n2 = ndi.label(fg)
    if n2:
        sizes = ndi.sum(fg, lab2, range(1, n2 + 1)); fg = lab2 == (1 + int(np.argmax(sizes)))
    # ombre portée : sous le bas de l'objet clair (porcelaine), on ne garde rien
    bright = ndi.binary_opening(lum > bg_row[:, None] + 10, iterations=3) & fg
    rows = np.where(bright.any(1))[0]
    if len(rows): fg[rows.max() + 1:] = False
    # fermeture par un disque (rayon ≈ 3 % de la largeur) : bouche les encoches d'ombre le long du contour
    r = 0.03 * w; pad = int(r) + 4
    F = np.pad(fg, pad)
    F = ndi.distance_transform_edt(ndi.distance_transform_edt(~F) <= r) > r
    fg = ndi.binary_fill_holes(F[pad:-pad, pad:-pad]) & ~ndi.binary_dilation(hole, iterations=1)
    # bas de l'objet (sous l'anse) : chaque ligne pleine entre ses bords, pour boucher les encoches d'ombre
    for y in range(int(0.72 * h), h):
        xs_ = np.where(fg[y])[0]
        if len(xs_): fg[y, xs_.min():xs_.max() + 1] = True
    ys, xs = np.where(fg)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    m = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
    return box, m


def fbm(h, w, seed, octaves=5, base=220):
    """bruit fractal [0,1] (somme de bruits gaussiens filtrés)"""
    rng = np.random.default_rng(seed); acc = np.zeros((h, w), np.float32); amp, tot = 1.0, 0.0
    for o in range(octaves):
        sig = base / (2 ** o)
        n = ndi.gaussian_filter(rng.normal(0, 1, (h // 4, w // 4)).astype(np.float32), sig / 4)
        n = np.asarray(Image.fromarray(n).resize((w, h), Image.BICUBIC))
        acc += amp * n / (n.std() + 1e-6); tot += amp; amp *= 0.55
    acc /= tot
    return (acc - acc.min()) / (acc.max() - acc.min())



def _save(arr, path):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(path, 'WEBP', quality=90)


def textures(out, style):
    """fonds de la vidéo : marble.webp (fond principal), marble_white.webp (fond clair), velvet.webp (fond d'insistance), grain.png"""
    H, W = 1920, 1080
    rng = np.random.default_rng(5)
    n1, n2 = fbm(H, W, 3), fbm(H, W, 7, 6, 160)
    grain = ndi.gaussian_filter(rng.normal(0, 1, (H, W)).astype(np.float32), 0.7)
    yy, xx = np.mgrid[:H, :W]
    def cloth(rgb, seed):
        folds = fbm(H, W, seed, 4, 260)
        return np.array(rgb, np.float32)[None, None] * (0.72 + 0.55 * folds[..., None]) + grain[..., None] * 6
    if style == 'or':
        veins = np.exp(-((np.abs(np.sin((n1 * 7 + n2 * 3) * math.pi)) / 0.035) ** 2))
        lum = 1 + 0.35 * (fbm(H, W, 11, 4, 300) - 0.5) + 0.55 * veins
        base = np.array([15, 14, 13], np.float32)[None, None] * lum[..., None] + np.array([4, 3, 1]) * veins[..., None] * 2.2
        light = np.stack([226 + 14 * (n1 - 0.5)] * 3, -1) * np.array([1, 0.985, 0.955])
        vel = cloth((86, 14, 16), 21)
    elif style == 'archive':   # carton d'archives kraft, registre ligné, velours ocre
        fib = ndi.gaussian_filter(rng.normal(0, 1, (H, W)).astype(np.float32), (0.6, 6))
        base = np.array([58, 42, 26], np.float32)[None, None] * (0.8 + 0.4 * n1[..., None]) + fib[..., None] * 5
        light = np.array([234, 219, 184], np.float32)[None, None] * (0.94 + 0.1 * n2[..., None]) - 26 * np.clip((fbm(H, W, 13, 4, 160)[..., None] - 0.72) / 0.28, 0, 1) * np.array([0.6, 0.9, 1.3])
        rules = ((yy % 64) < 2) & (yy > 300)
        light[rules] = light[rules] * 0.82 + np.array([90, 120, 170]) * 0.18
        margin = (np.abs(xx - 150) < 2)
        light[margin] = light[margin] * 0.5 + np.array([190, 50, 40]) * 0.5
        vel = cloth((112, 70, 24), 21)
    elif style == 'labo':      # écran bleu nuit quadrillé, papier millimétré, bleu profond
        base = np.array([7, 15, 30], np.float32)[None, None] * (0.85 + 0.35 * n1[..., None])
        for step, a in ((60, 0.10), (300, 0.22)):
            gl = ((yy % step) < 2) | ((xx % step) < 2)
            base[gl] += np.array([40, 140, 200]) * a
        light = np.array([226, 234, 240], np.float32)[None, None] * (0.95 + 0.06 * n2[..., None])
        gl = ((yy % 40) < 1) | ((xx % 40) < 1); light[gl] = light[gl] * 0.88 + np.array([120, 170, 210]) * 0.12
        vel = cloth((10, 40, 92), 21)
    elif style == 'grec':      # vernis noir lustré, argile claire, terre cuite
        sheen = np.exp(-(((xx - 380) / 520) ** 2 + ((yy - 620) / 900) ** 2))
        crack = np.exp(-((np.abs(np.sin((n1 * 9 + n2 * 4) * math.pi)) / 0.015) ** 2)) * 0.25
        base = np.array([17, 13, 11], np.float32)[None, None] * (1 + 0.9 * sheen[..., None]) + crack[..., None] * 20
        light = np.array([226, 192, 150], np.float32)[None, None] * (0.92 + 0.12 * n2[..., None])
        vel = cloth((172, 78, 38), 21)
    elif style == 'anatomie':  # parchemin taché (rousseurs), papier clair, velours cramoisi
        stains = fbm(H, W, 17, 5, 200)
        fox = (fbm(H, W, 19, 3, 40) > 0.86).astype(np.float32)
        base = np.array([228, 212, 178], np.float32)[None, None] * (0.9 + 0.14 * n1[..., None]) - stains[..., None] * np.array([18, 26, 40]) - fox[..., None] * np.array([20, 34, 46])
        light = np.array([240, 230, 206], np.float32)[None, None] * (0.95 + 0.07 * n2[..., None])
        vel = cloth((72, 12, 14), 21)
    elif style == 'reve':      # nuit violette, halo de lune en haut, brume, rares étoiles ; papier lilas ; velours prune
        moon = np.exp(-(((xx - 760) / 520) ** 2 + ((yy - 380) / 480) ** 2))
        mist = fbm(H, W, 23, 5, 340)
        base = np.array([14, 9, 30], np.float32)[None, None] * (0.75 + 0.5 * n1[..., None]) + moon[..., None] * np.array([46, 30, 78]) + (mist[..., None] - 0.5) * np.array([10, 6, 22])
        stars = rng.random((H, W)) > 0.9993
        base[stars] = np.array([214, 200, 240]) * rng.uniform(0.3, 0.8, (stars.sum(), 1))
        light = np.array([232, 224, 238], np.float32)[None, None] * (0.94 + 0.08 * n2[..., None])
        vel = cloth((58, 20, 86), 21)
    elif style == 'deluge':    # mer de nuit sous la pluie : bleu noir, pluie oblique, écume ; papier gris bleu ; velours marine
        rain = ndi.gaussian_filter((rng.random((H, W)) > 0.9965).astype(np.float32), (9, 0.6))
        rain = ndi.rotate(rain, -12, reshape=False, order=1)
        swell = np.exp(-((yy - 1500) / 600) ** 2) * fbm(H, W, 29, 4, 120)
        base = np.array([6, 12, 24], np.float32)[None, None] * (0.75 + 0.5 * n1[..., None]) + swell[..., None] * np.array([10, 26, 44]) + rain[..., None] * np.array([90, 130, 170]) * 1.4
        light = np.array([220, 228, 234], np.float32)[None, None] * (0.94 + 0.08 * n2[..., None])
        vel = cloth((12, 30, 70), 21)
    elif style == 'optique':   # cabinet d'ophtalmo : noir sang, cercles d'iris concentriques ; papier d'optotype ; velours cramoisi
        r = np.hypot(xx - 540, yy - 820)
        rings = (np.abs(np.sin(r / 18)) < 0.04) * np.clip(1 - r / 1100, 0, 1) * 0.5
        fibres = np.abs(np.sin(np.arctan2(yy - 820, xx - 540) * 90 + n1 * 6)) ** 12 * np.exp(-((r - 300) / 220) ** 2) * 0.35
        base = np.array([20, 7, 8], np.float32)[None, None] * (0.8 + 0.45 * n1[..., None]) + (rings + fibres)[..., None] * np.array([150, 40, 36])
        light = np.array([244, 238, 230], np.float32)[None, None] * (0.95 + 0.06 * n2[..., None])
        vel = cloth((96, 10, 16), 21)
    elif style == 'empire':    # vert bouteille impérial, abeilles d'or semées (points) ; papier de pamphlet ; velours vert
        seed_ = ((yy % 160 < 5) & (xx % 160 < 5)) | (((yy + 80) % 160 < 5) & ((xx + 80) % 160 < 5))
        base = np.array([10, 26, 16], np.float32)[None, None] * (0.75 + 0.5 * n1[..., None])
        base[ndi.binary_dilation(seed_, iterations=2)] = base[ndi.binary_dilation(seed_, iterations=2)] * 0.5 + np.array([180, 150, 70]) * 0.5 * 0.45
        light = np.array([238, 229, 204], np.float32)[None, None] * (0.93 + 0.1 * n2[..., None]) - 20 * np.clip((fbm(H, W, 31, 4, 160)[..., None] - 0.7) / 0.3, 0, 1) * np.array([0.6, 0.9, 1.3])
        vel = cloth((18, 70, 40), 21)
    elif style == 'caverne':   # roche de caverne éclairée par un feu en bas ; papier crayeux ; velours pourpre
        rock = fbm(H, W, 37, 6, 90)
        fire = np.exp(-(((xx - 540) / 700) ** 2 + ((yy - 2000) / 900) ** 2))
        base = np.array([16, 12, 16], np.float32)[None, None] * (0.6 + 0.8 * rock[..., None]) + fire[..., None] * np.array([120, 58, 24]) * (0.6 + 0.6 * rock[..., None])
        light = np.array([234, 224, 212], np.float32)[None, None] * (0.93 + 0.1 * n2[..., None])
        vel = cloth((60, 18, 72), 21)
    else:                      # atlas : nuit étoilée, parchemin, indigo
        base = np.array([9, 15, 38], np.float32)[None, None] * (0.8 + 0.45 * n1[..., None])
        stars = rng.random((H, W)) > 0.9985
        big = ndi.binary_dilation(rng.random((H, W)) > 0.99985, iterations=2)
        base[stars] = np.array([200, 205, 225]) * rng.uniform(0.4, 1, (stars.sum(), 1))
        base[big] = np.array([235, 225, 190])
        for r in (420, 640, 860):  # cercles d'une carte céleste
            ring = np.abs(np.hypot(xx - 540, yy - 820) - r) < 1.2
            base[ring] = base[ring] * 0.6 + np.array([226, 177, 74]) * 0.4 * 0.35
        light = np.array([236, 224, 192], np.float32)[None, None] * (0.93 + 0.1 * n2[..., None])
        vel = cloth((28, 24, 78), 21)
    _save(base, os.path.join(out, 'marble.webp'))
    _save(light, os.path.join(out, 'marble_white.webp'))
    _save(vel, os.path.join(out, 'velvet.webp'))
    g = np.clip(128 + rng.normal(0, 46, (512, 512)), 0, 255).astype(np.uint8)
    Image.fromarray(g).save(os.path.join(out, 'grain.png'))
    print(f'textures ({style}) : marble, marble_white, velvet, grain')


def plein(im, crop, opts):
    """plein écran 1080×1920 : la zone visée est élargie au format 9:16 puis recadrée, bichromie du style"""
    W0, H0 = im.size
    x0, y0, x1, y1 = crop
    cx, cy = (x0 + x1) / 2 * W0, (y0 + y1) / 2 * H0
    w, h = (x1 - x0) * W0, (y1 - y0) * H0
    if w / h > 9 / 16: h = w * 16 / 9
    else: w = h * 9 / 16
    if w > W0: w = W0; h = w * 16 / 9
    if h > H0: h = H0; w = h * 9 / 16
    cx = min(max(cx, w / 2), W0 - w / 2); cy = min(max(cy, h / 2), H0 - h / 2)
    im = im.crop((round(cx - w / 2), round(cy - h / 2), round(cx + w / 2), round(cy + h / 2))).resize((1080, 1920), Image.LANCZOS)
    rgb = colour(im) if opts.get('color') else sepia(im, 0.8, 1.0)
    return Image.fromarray(rgb)


def run(cue, style, jobs):
    here = os.path.dirname(os.path.abspath(cue))
    src = os.path.join(here, 'img_src')
    out = os.path.join(here, '..', '..', 'public', 'v', os.path.basename(here), 'img')
    os.makedirs(out, exist_ok=True)
    S.clear(); S.update(STYLES[style])
    textures(out, style)
    sizes = {}
    for name, job in jobs.items():
        kind, sname, crop, wmax = job[:4]
        opts = job[4] if len(job) > 4 else {}
        p = next(os.path.join(src, sname + e) for e in ('.jpg', '.png') if os.path.exists(os.path.join(src, sname + e)))
        im = Image.open(p).convert('RGB')
        if kind == 'poly':
            # découpe à la main : crop = boîte (px de l'image source) ; options poly = contour (px), tube = ligne
            # centrale [(x, y, épaisseur)] (queue…), bg = couleur de fond à effacer dans la découpe, tol = sa tolérance
            x0, y0, x1, y1 = crop
            mk = Image.new('L', im.size, 0); dr = ImageDraw.Draw(mk)
            if opts.get('poly'): dr.polygon([tuple(q) for q in opts['poly']], fill=255)
            tb = opts.get('tube') or []
            for (xa, ya, wa), (xb, yb, wb) in zip(tb, tb[1:]):
                for k in range(12):
                    u = k / 11; x, y, w_ = xa + (xb - xa) * u, ya + (yb - ya) * u, wa + (wb - wa) * u
                    dr.ellipse((x - w_ / 2, y - w_ / 2, x + w_ / 2, y + w_ / 2), fill=255)
            a_ = np.asarray(mk, np.float32)
            px = np.asarray(im, np.float32)
            if opts.get('bg'):  # le fond n'est effacé que sur une bande le long du contour (le ventre blanc reste)
                d = np.sqrt(((px - np.array(opts['bg'], np.float32)) ** 2).sum(2))
                inner = np.asarray(mk.filter(ImageFilter.MinFilter(2 * opts.get('edge', 14) + 1)), np.float32) > 127
                a_ = np.where(inner, a_, a_ * np.clip((d - opts.get('tol', 28)) / 18, 0, 1))
            if opts.get('nogreen'):  # herbe sous la queue : on garde ce qui n'est pas vert
                a_ = a_ * np.clip((px[..., 0] - px[..., 1] - 6) / 18, 0, 1)
            mk = Image.fromarray(a_.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
            im2, mk2 = im.crop((x0, y0, x1, y1)), mk.crop((x0, y0, x1, y1))
            if wmax and im2.width > wmax: im2, mk2 = fit(im2, wmax), fit(mk2, wmax)
            rgb = colour(im2) if opts.get('color') else sepia(im2, 0.6, 1.0)
            res = Image.fromarray(np.dstack([rgb, np.asarray(mk2)]).astype(np.uint8), 'RGBA')
            res.save(os.path.join(out, name + '.webp'), 'WEBP', quality=90, method=6)
            sizes[name] = list(res.size); print(f'{name:13} poly   {res.size[0]}×{res.size[1]}'); continue
        if kind == 'plein':
            res = plein(im, crop, opts)
            res.save(os.path.join(out, name + '.webp'), 'WEBP', quality=86, method=6)
            sizes[name] = [1080, 1920]; print(f'{name:13} plein  1080×1920'); continue
        if kind in ('detour', 'piece'):
            box, m = piece(im) if kind == 'piece' else detour(im, crop or ())
            im, m = im.crop(box), m.crop(box)
            im, m = fit(im, wmax), fit(m, wmax)
            res = sticker(colour(im) if opts.get('color') else sepia(im, 0.5, 0.95), np.asarray(m, np.float32), 7, 3)
        elif kind == 'rond':
            cx, cy, r = crop[0] * im.width, crop[1] * im.height, crop[2] * im.width
            im = fit(im.crop((round(cx - r), round(cy - r), round(cx + r), round(cy + r))), wmax)
            mk = Image.new('L', im.size, 0); ImageDraw.Draw(mk).ellipse((2, 2, im.width - 3, im.height - 3), fill=255)
            res = sticker(colour(im) if opts.get('color') else sepia(im), np.asarray(mk.filter(ImageFilter.GaussianBlur(0.8)), np.float32), 6, 3)
        else:
            x0, y0, x1, y1 = crop
            im = fit(im.crop((round(x0 * im.width), round(y0 * im.height), round(x1 * im.width), round(y1 * im.height))), wmax)
            if opts.get('up') and im.width < wmax:  # petite planche au trait : agrandie puis renforcée
                im = im.resize((wmax, round(im.height * wmax / im.width)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 120, 2))
            w, h = im.size
            seed = sum(map(ord, name))
            paper = torn(w, h, seed, 7, 0)
            pic = torn(w, h, seed + 1, 4, 14)
            rgb = (colour(im) if opts.get('color') else sepia(im, 1.0, 1.0)).astype(np.float32)
            pa = np.asarray(pic, np.float32)[..., None] / 255
            base = np.array(S['card'], np.float32)[None, None, :] * (1 - pa) + rgb * pa
            res = sticker(base, np.asarray(paper, np.float32), 0, 3)
        res.save(os.path.join(out, name + '.webp'), 'WEBP', quality=88, method=6)
        sizes[name] = list(res.size)
        print(f'{name:13} {kind:6} {res.size[0]}×{res.size[1]}')
    json.dump(sizes, open(os.path.join(out, 'sizes.json'), 'w'), indent=1)
