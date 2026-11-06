"""Planches de contrôle d'une vidéo (boucle d'amélioration) : 2 images/s, vignettes à la taille d'un téléphone, temps écrit sur chacune.
python3 -I scripts/planche.py <video.mp4> <préfixe sortie> [--fps 2] [--w 200] [--cols 11] [--rows 4] [--from s] [--to s]
→ <préfixe>-1.png, -2.png… Exemple : python3 -I scripts/planche.py videos/42-x/final.mp4 videos/42-x/qa/v2"""
import argparse, glob, os, shutil, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

a = argparse.ArgumentParser()
a.add_argument('video'); a.add_argument('out')
a.add_argument('--fps', type=float, default=2); a.add_argument('--w', type=int, default=200)
a.add_argument('--cols', type=int, default=11); a.add_argument('--rows', type=int, default=4)
a.add_argument('--from', dest='t0', type=float, default=0); a.add_argument('--to', dest='t1', type=float, default=None)
o = a.parse_args()
tmp = tempfile.mkdtemp()
cmd = ['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-ss', str(o.t0), '-i', o.video]
if o.t1 is not None: cmd += ['-t', str(o.t1 - o.t0)]
subprocess.run(cmd + ['-vf', f'fps={o.fps},scale={o.w}:-2', os.path.join(tmp, '%05d.jpg')], check=True)
files = sorted(glob.glob(os.path.join(tmp, '*.jpg')))
font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 16)
tw, th = Image.open(files[0]).size
per = o.cols * o.rows
for p in range(0, len(files), per):
    sheet = Image.new('RGB', (o.cols * tw, -(-min(per, len(files) - p) // o.cols) * th), 'black')
    for k, f in enumerate(files[p:p + per]):
        im = Image.open(f); d = ImageDraw.Draw(im)
        label = f'{o.t0 + (p + k) / o.fps:.1f}'
        d.rectangle((0, 0, 46, 20), fill='black'); d.text((4, 1), label, fill='yellow', font=font)
        sheet.paste(im, ((k % o.cols) * tw, (k // o.cols) * th))
    sheet.save(f'{o.out}-{p // per + 1}.png')
    print(f'{o.out}-{p // per + 1}.png')
shutil.rmtree(tmp)
