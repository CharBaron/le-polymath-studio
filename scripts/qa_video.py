"""Contrôle chiffré d'une vidéo finie (boucle d'amélioration, voir ../BOUCLE D'AMÉLIORATION.md).
python3 -I scripts/qa_video.py <fichier.mp4> [autres…]  → une ligne par vidéo, ajoutée à ../Vidéo Prête et Publication/qa-videos.csv
Mesures : coupes/10 s, 1re coupe, plus long plan figé, luminosité de la 1re image et des 3 premières secondes, volume.
Le seuil d'échec est dans SEUILS : il se met à jour quand les stats réelles montrent mieux."""
import csv, datetime, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT = os.path.join(ROOT, 'Vidéo Prête et Publication', 'qa-videos.csv')
COLS = ['date', 'video', 'duree_s', 'coupes_10s', 'premiere_coupe_s', 'fige_max_s', 'luma_img0', 'luma_3s', 'lufs', 'alertes']
# luma de 0 à 255. luma_img0 < 40 : l'ouverture de TERMINUS (tunnel presque noir, jugée illisible sur téléphone).
SEUILS = {'coupes_10s': 4.0, 'premiere_coupe_s': 2.5, 'fige_max_s': 2.5, 'luma_img0': 40, 'lufs': (-15.0, -13.0)}

def ff(args):
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', *args], capture_output=True, text=True).stderr

def mesure(path):
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                               capture_output=True, text=True).stdout)
    log = ff(['-i', path, '-an', '-vf', "scale=270:-2,select='gt(scene,0.2)',showinfo", '-f', 'null', '-'])
    cuts = [float(t) for t in re.findall(r'pts_time:([\d.]+)', log)]
    log = ff(['-i', path, '-an', '-vf', 'scale=270:-2,freezedetect=n=0.002:d=1', '-f', 'null', '-'])
    frozen = [float(t) for t in re.findall(r'freeze_duration: ([\d.]+)', log)]
    def luma(start, length):
        log = ff(['-ss', str(start), '-t', str(length), '-i', path, '-an', '-vf', 'scale=270:-2,signalstats,metadata=print:key=lavfi.signalstats.YAVG',
                  '-f', 'null', '-'])
        v = [float(x) for x in re.findall(r'YAVG=([\d.]+)', log)]
        return sum(v) / len(v) if v else 0.0
    log = ff(['-i', path, '-vn', '-af', 'ebur128', '-f', 'null', '-'])
    lufs = re.findall(r'I:\s+(-?[\d.]+) LUFS', log)
    return {'duree_s': round(dur, 1), 'coupes_10s': round(len(cuts) / dur * 10, 1), 'premiere_coupe_s': round(cuts[0], 2) if cuts else dur,
            'fige_max_s': round(max(frozen), 1) if frozen else 0.0, 'luma_img0': round(luma(0, 0.1)), 'luma_3s': round(luma(0, 3)),
            'lufs': float(lufs[-1]) if lufs else 0.0}

def alertes(m):
    a = []
    if m['coupes_10s'] < SEUILS['coupes_10s']: a.append('rythme lent')
    if m['premiere_coupe_s'] > SEUILS['premiere_coupe_s']: a.append('1re coupe tardive')
    if m['fige_max_s'] > SEUILS['fige_max_s']: a.append('plan figé')
    if m['luma_img0'] < SEUILS['luma_img0']: a.append('ouverture trop sombre')
    lo, hi = SEUILS['lufs']
    if not lo <= m['lufs'] <= hi: a.append('volume hors cible')
    return ' + '.join(a) or 'ok'

if __name__ == '__main__':
    new = not os.path.exists(OUT)
    with open(OUT, 'a', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, COLS)
        if new: w.writeheader()
        for p in sys.argv[1:]:
            m = mesure(p)
            row = {'date': datetime.date.today().isoformat(), 'video': os.path.basename(p)[:-4], **m, 'alertes': alertes(m)}
            w.writerow(row); print(row)
