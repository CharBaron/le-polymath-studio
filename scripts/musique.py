"""Pose un morceau sous la voix d'une vidéo finie, sans re-rendre l'image (flux vidéo copié tel quel).
python3 -I scripts/musique.py <morceau.mp3> <drop> videos/<id> [videos/<id2> …]
→ videos/<id>/final_musique.mp4. Le morceau est calé pour que <drop> (en s dans le morceau) tombe sur la relance
de la vidéo (beats.relance de timeline.json). Il est creusé là où la voix vit (2,8 et 5,5 kHz), baissé quand la voix
parle (compression déclenchée par la piste voix + bruitages), puis le tout est masterisé à -14 LUFS, crête ≤ -2 dBFS.
Encodeur AAC d'Apple (aac_at, macOS) : celui de ffmpeg fait déborder les crêtes de 2 à 4 dB sur ce genre de mix."""
import json, os, re, subprocess, sys

MUSIC_LUFS = -24.0  # morceau entier après égalisation, avant que la voix ne le baisse (~ -29 sous la voix)
TARGET = -14.0
FADE = 0.8
EQ = 'highpass=f=35,equalizer=f=2800:t=q:w=1:g=-5,equalizer=f=5500:t=q:w=1.2:g=-3'
DUCK = 'sidechaincompress=threshold=0.05:ratio=3:attack=15:release=300'


def ff(*args):
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-y', *args], capture_output=True, text=True).stderr


def loud(log):
    s = log[log.rfind('Summary:'):]
    i = float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1))
    p = re.search(r'Peak:\s+(-?[\d.]+|-inf) dBFS', s)
    return i, (float(p.group(1)) if p else None)


def probe(f):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout
    return float(out)


track, drop = sys.argv[1], float(sys.argv[2])
tlen = probe(track)
mi, _ = loud(ff('-i', track, '-af', f'{EQ},ebur128', '-f', 'null', '-'))
gain = MUSIC_LUFS - mi
print(f'morceau : {tlen:.1f} s, {mi:.1f} LUFS après égalisation → {gain:+.1f} dB')

for vdir in sys.argv[3:]:
    src = os.path.join(vdir, 'final.mp4')
    dur = probe(src)
    rel = json.load(open(os.path.join(vdir, 'timeline.json')))['beats']['relance']
    off = min(max(drop - rel, 0.0), tlen - dur - 0.05)
    music = (f'[1:a]atrim=start={off:.3f}:duration={dur:.3f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,'
             f'{EQ},volume={gain:.2f}dB,afade=t=in:d=0.03,afade=t=out:st={dur - FADE:.3f}:d={FADE}[m];'
             f'[0:a]asplit[v][k];[m][k]{DUCK}[md]')
    mix = f'{music};[v][md]amix=inputs=2:normalize=0:duration=first[mix]'
    ins = ['-i', src, '-i', track]
    vi, _ = loud(ff('-i', src, '-af', 'ebur128', '-f', 'null', '-'))
    di, _ = loud(ff(*ins, '-filter_complex', f'{music};[v]anullsink;[md]ebur128[o]', '-map', '[o]', '-f', 'null', '-'))
    xi, _ = loud(ff(*ins, '-filter_complex', f'{mix};[mix]ebur128[o]', '-map', '[o]', '-f', 'null', '-'))
    out = os.path.join(vdir, 'final_musique.mp4')
    ff(*ins, '-filter_complex', f'{mix};[mix]volume={TARGET - xi:.2f}dB,alimiter=limit=0.79:level=false:attack=5:release=60:latency=1[o]',
       '-map', '0:v', '-map', '[o]', '-c:v', 'copy', '-c:a', 'aac_at', '-b:a', '256k', '-movflags', '+faststart', out)
    fi, fp = loud(ff('-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'))
    print(f'{os.path.basename(vdir)} : morceau à {off:.2f} s (drop sur la relance {rel:.2f} s) · voix {vi:.1f} · musique sous la voix {di:.1f}'
          f' (écart {vi - di:.1f} LU) · final {fi:.1f} LUFS, crête vraie {fp:.1f} dBTP, {probe(out):.2f} s / {dur:.2f} s')
