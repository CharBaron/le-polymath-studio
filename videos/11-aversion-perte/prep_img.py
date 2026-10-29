"""Prépare les images de la DA « Gravure » : img_src/*.jpg → public/v/11-aversion-perte/img/*.webp
  carte  : recadrage, sépia crème, bord de papier déchiré + liseré doré (gravures, tableaux)
  détour : objet détouré sur fond uni, bord crème + liseré doré (mug) ; pièce : disque ajusté (ombre portée ignorée)
  rond   : médaillon découpé en cercle
Lancer : python3 -E videos/11-aversion-perte/prep_img.py"""
import os, math, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'img_src')
OUT = os.path.join(HERE, '..', '..', 'public', 'v', os.path.basename(HERE), 'img')
INK, PAPER, GOLD = np.array([22, 19, 15]), np.array([239, 230, 210]), (201, 160, 67)

# nom → (type, source, recadrage x0 y0 x1 y1 en fractions, largeur max)
JOBS = {
    'coin_face': ('piece', 'coin_face', None, 820),
    'coin_pile': ('piece', 'coin_pile', None, 820),
    'mug': ('carte', 'mug', (0.04, 0.14, 0.97, 0.92), 820),
    'panic': ('carte', 'panic', (0.0, 0.25, 1.0, 0.89), 980),
    'brain': ('carte', 'brain', (0.45, 0.06, 0.99, 0.80), 820),
    'philosophers': ('carte', 'philosophers', (0.0, 0.0, 1.0, 0.64), 980),
    'democritus': ('carte', 'philosophers', (0.0, 0.08, 0.5, 0.64), 760),
    'heraclitus': ('carte', 'philosophers', (0.5, 0.08, 1.0, 0.64), 760),
    'amphi': ('carte', 'amphi', (0.02, 0.05, 0.98, 0.92), 980),
    'bourse': ('carte', 'bourse', (0.0, 0.0, 1.0, 0.98), 980),
    'ship': ('carte', 'ship', (0.04, 0.02, 0.94, 0.83), 980),
    'adam': ('carte', 'adam', (0.2, 0.26, 0.56, 0.62), 980),
    'laocoon': ('carte', 'laocoon', (0.06, 0.02, 0.94, 0.70), 820),
    'laughing': ('carte', 'laughing', (0.06, 0.2, 0.94, 0.98), 760),
    'epictete': ('rond', 'epictete', (265 / 520, 340 / 800, 236 / 520), 760),
}


def sepia(im, cut=1.0, gamma=1.0):
    """niveaux de gris contrastés → dégradé encre → papier crème"""
    g = ImageOps.autocontrast(im.convert('L'), cutoff=cut)
    a = (np.asarray(g, dtype=np.float32) / 255) ** gamma
    rgb = INK[None, None, :] * (1 - a[..., None]) + PAPER[None, None, :] * a[..., None]
    return rgb.astype(np.uint8)


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
    out[ring] = (*GOLD, 255)
    out[cream] = (*PAPER, 255)
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


def textures():
    """marbre noir veiné, velours rouge, grain de film"""
    H, W = 1920, 1080
    n1, n2 = fbm(H, W, 3), fbm(H, W, 7, 6, 160)
    veins = np.exp(-((np.abs(np.sin((n1 * 7 + n2 * 3) * math.pi)) / 0.035) ** 2))
    veins2 = np.exp(-((np.abs(np.sin((n2 * 11 + n1 * 2) * math.pi)) / 0.02) ** 2)) * 0.5
    base = np.array([15, 14, 13], np.float32)
    lum = 1 + 0.35 * (fbm(H, W, 11, 4, 300) - 0.5) + 0.55 * veins + 0.3 * veins2
    marble = np.clip(base[None, None] * lum[..., None] + np.array([4, 3, 1]) * veins[..., None] * 2.2, 0, 255)
    Image.fromarray(marble.astype(np.uint8)).save(os.path.join(OUT, 'marble.webp'), 'WEBP', quality=90)
    rng = np.random.default_rng(5)
    folds = fbm(H, W, 21, 4, 260)
    grain = ndi.gaussian_filter(rng.normal(0, 1, (H, W)).astype(np.float32), 0.7)
    red = np.array([86, 14, 16], np.float32)
    v = red[None, None] * (0.72 + 0.55 * folds[..., None]) + grain[..., None] * np.array([7, 2, 2])
    Image.fromarray(np.clip(v, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'velvet.webp'), 'WEBP', quality=90)
    g = np.clip(128 + rng.normal(0, 46, (512, 512)), 0, 255).astype(np.uint8)
    Image.fromarray(g).save(os.path.join(OUT, 'grain.png'))
    w1 = fbm(H, W, 31, 5, 240); w2 = fbm(H, W, 37, 6, 150)
    vw = np.exp(-((np.abs(np.sin((w1 * 6 + w2 * 2.5) * math.pi)) / 0.03) ** 2)) + 0.45 * np.exp(-((np.abs(np.sin((w2 * 9 + w1) * math.pi)) / 0.018) ** 2))
    wl = 226 + 14 * (fbm(H, W, 41, 4, 320) - 0.5) - 70 * vw
    white = np.stack([wl, wl * 0.985, wl * 0.955], -1)
    Image.fromarray(np.clip(white, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'marble_white.webp'), 'WEBP', quality=90)
    print('textures : marble, marble_white, velvet, grain')


def main():
    os.makedirs(OUT, exist_ok=True)
    textures()
    sizes = {}
    for name, (kind, src, crop, wmax) in JOBS.items():
        im = Image.open(os.path.join(SRC, src + '.jpg'))
        if kind in ('detour', 'piece'):
            box, m = piece(im) if kind == 'piece' else detour(im, crop or ())
            im, m = im.crop(box), m.crop(box)
            im, m = fit(im, wmax), fit(m, wmax)
            rgb = sepia(im, 0.5, 0.95)
            out = sticker(rgb, np.asarray(m, np.float32), 7, 3)
        elif kind == 'rond':
            cx, cy, r = crop[0] * im.width, crop[1] * im.height, crop[2] * im.width
            im = im.crop((round(cx - r), round(cy - r), round(cx + r), round(cy + r)))
            im = fit(im, wmax)
            mk = Image.new('L', im.size, 0); ImageDraw.Draw(mk).ellipse((2, 2, im.width - 3, im.height - 3), fill=255)
            out = sticker(sepia(im, 1.0, 1.0), np.asarray(mk.filter(ImageFilter.GaussianBlur(0.8)), np.float32), 6, 3)
        else:
            x0, y0, x1, y1 = crop
            im = im.crop((round(x0 * im.width), round(y0 * im.height), round(x1 * im.width), round(y1 * im.height)))
            im = fit(im, wmax)
            w, h = im.size
            seed = sum(map(ord, name))
            paper = torn(w, h, seed, 7, 0)                  # papier (bord crème)
            pic = torn(w, h, seed + 1, 4, 14)               # image, un peu en retrait
            rgb = sepia(im, 1.0, 1.0).astype(np.float32)
            pa = np.asarray(pic, np.float32)[..., None] / 255
            base = PAPER[None, None, :] * (1 - pa) + rgb * pa
            out = sticker(base, np.asarray(paper, np.float32), 0, 3)
        out.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=88, method=6)
        sizes[name] = list(out.size)
        print(f'{name:13} {kind:6} {out.size[0]}×{out.size[1]}')
    json.dump(sizes, open(os.path.join(OUT, 'sizes.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
