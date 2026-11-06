"""Images de la vidéo 44 (style boudoir : damas prune, papier 1915) : python3 -E videos/44-double-lecture/prep_img.py
hill_face : le dessin en haute définition, recadré tête + fourrure, sans bord, pour que les repères de src/gravure/anim/Hill.tsx tombent juste
(coordonnées dans une image de 1280 px de large : boîte 190,175 → 1110,1150). hill_mini : la tête, pour les 393 vignettes."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from PIL import Image, ImageOps
from tools.pipeline.gravure_prep import run

JOBS = {'vanity': ('carte', 'vanity', (0.0, 0.0, 1.0, 1.0), 860)}
run(__file__, 'boudoir', JOBS)
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, '..', '..', 'public', 'v', os.path.basename(here), 'img')
im = Image.open(os.path.join(here, 'img_src', 'hill_hd.jpg')).convert('L')
K = im.width / 1280
hd = ImageOps.autocontrast(im.crop((int(190 * K), int(175 * K), int(1110 * K), int(1150 * K))), cutoff=0.5)
col = ImageOps.colorize(hd, black=(18, 8, 20), white=(244, 236, 220), mid=(128, 112, 112))
col.save(os.path.join(out, 'hill_face.webp'), 'WEBP', quality=88, method=6)
col.crop((int(300 * K), int(130 * K), int(700 * K), int(560 * K))).resize((88, 96), Image.LANCZOS).save(os.path.join(out, 'hill_mini.webp'), 'WEBP', quality=80)
print('hill_face', col.size)
