"""Images de la vidéo 35 (style labo) : python3 -E videos/35-cecite-changement/prep_img.py
Le test « flicker » (Rensink, O'Regan & Clark, 1997) : ville_a = la place de Vredeman de Vries, ville_b = la même carte où la
flèche du beffroi est effacée (ciel recopié sur la même ligne, 112 px à droite : les hachures horizontales continuent),
ville_gris = l'écran gris (même silhouette de carte, couleur moyenne de l'image : le flash masque le changement sans
éblouir). A et B viennent de la même carte décodée et sont enregistrées sans perte : rien d'autre ne bouge entre les deux."""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

JOBS = {
    'ville': ('carte', 'ville', (0.0, 0.0, 1.0, 0.94), 880),
    'homme1': ('carte', 'homme1', (0.1, 0.06, 0.92, 0.86), 640),
    'homme2': ('carte', 'homme2', (0.04, 0.04, 0.96, 0.9), 640),
    'porte': ('poly', 'porte', (190, 625, 950, 1530), 0, {'poly': [(190, 625), (950, 625), (950, 1530), (190, 1530)]}),  # porte double
}
run(__file__, 'labo', JOBS)

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'v', '35-cecite-changement', 'img')
SC, PAD = 880 / 1280, 9          # source → carte : (x - 0) * SC + PAD (sticker : bord 0 + liseré 3 + 6)
X0, X1, Y0, Y1, DX = 364, 468, 26, 248, 112   # flèche, lanterne et pinacles du beffroi (px de la source)
A = np.asarray(Image.open(os.path.join(OUT, 'ville.webp')).convert('RGBA')).astype(np.float32)
h, w = A.shape[:2]
cx0, cx1, cy0, cy1 = X0 * SC + PAD, X1 * SC + PAD, 33, Y1 * SC + PAD   # y 33 : sous le filet du cadre (le bord déchiré ne bouge pas)
yy, xx = np.mgrid[:h, :w].astype(np.float32)
ramp = lambda v, a, b, f: np.clip((v - a) / f + 0.5, 0, 1) * np.clip((b - v) / f + 0.5, 0, 1)
M = (ramp(xx, cx0, cx1, 10) * (yy >= cy0) * ramp(yy, -99, cy1, 1.5))[..., None]
# ciel recopié sur la même ligne (les hachures sont horizontales) ; pour chaque ligne, le décalage (80 à 118 px à droite)
# dont les deux bords raccordent le mieux, lissé sur 5 lignes
L, R, k = int(cx0) - 14, int(cx1) + 2, 12
lum = A[..., :3].mean(2)
dxs = np.arange(80, 119)   # ≥ largeur de la zone (sinon on recopie la tour), ≤ 118 (au-delà : la loggia)
cost = np.array([[np.abs(lum[y, L:L + k] - lum[y, L + d:L + d + k]).sum() + np.abs(lum[y, R:R + k] - lum[y, R + d:R + d + k]).sum() for d in dxs] for y in range(h)])
cost = np.apply_along_axis(lambda c: np.convolve(c, np.ones(5), 'same'), 0, cost)
B = A.copy()
for y in range(int(cy0), int(cy1) + 3):
    d = int(dxs[np.argmin(cost[y])])
    B[y, :, :3] = A[y, :, :3] * (1 - M[y]) + np.roll(A[y], -d, axis=0)[:, :3] * M[y]
alpha = A[..., 3:] / 255
mean = (A[..., :3] * alpha).sum((0, 1)) / alpha.sum()
G = np.concatenate([np.broadcast_to(mean, A[..., :3].shape), A[..., 3:]], 2)
for name, arr in (('ville_a', A), ('ville_b', B), ('ville_gris', G)):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name + '.webp'), 'WEBP', lossless=True)
print(f'ville_a / ville_b / ville_gris : {w}×{h}, flèche effacée x {cx0:.0f}-{cx1:.0f}, y {cy0}-{cy1:.0f} (carte), gris {mean.round()}')
