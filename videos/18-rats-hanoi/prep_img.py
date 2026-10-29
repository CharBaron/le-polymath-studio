"""Images de la vidéo 18 (style archive coloniale) : python3 -E videos/18-rats-hanoi/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'paulbert': ('carte', 'paulbert', (0.03, 0.03, 0.97, 0.86), 860),
    'changeurs': ('carte', 'changeurs', (0.02, 0.03, 0.98, 0.80), 860),
    'pavillons': ('carte', 'pavillons', (0.02, 0.03, 0.98, 0.82), 860),
    'rue_plein': ('plein', 'paulbert', (0.25, 0.05, 0.7, 0.86), 0),
    'expo': ('carte', 'expo', (0.04, 0.03, 0.96, 0.92), 600, C),
    'egouts': ('carte', 'egouts', (0.0, 0.0, 1.0, 1.0), 720),
    'egouts_zoom': ('carte', 'egouts', (0.12, 0.12, 0.72, 0.6), 860),
    'doumer': ('carte', 'doumer', (0.05, 0.02, 0.95, 0.85), 540),
    'catcher': ('carte', 'ratcatcher', (0.03, 0.02, 0.97, 0.95), 600),
    'catcher_plein': ('plein', 'ratcatcher', (0.05, 0.0, 0.95, 0.9), 0),
    'catcher2': ('carte', 'ratcatcher2', (0.02, 0.02, 0.98, 0.98), 680),
    'rathead': ('carte', 'rathead', (0.02, 0.02, 0.98, 0.98), 620),
    'ratsfr': ('carte', 'ratsfr', (0.02, 0.02, 0.98, 0.88), 860),
    'ratsfr_zoom': ('carte', 'ratsfr', (0.28, 0.4, 0.72, 0.84), 860),
    'bouquiniste': ('carte', 'bouquiniste', (0.02, 0.02, 0.98, 0.92), 580, C),
    'rat': ('carte', 'ratskel', (0.05, 0.1, 0.95, 0.5), 780),
    'ratskel': ('carte', 'ratskel', (0.12, 0.55, 0.88, 0.93), 640),
    'cobras': ('carte', 'cobras', (0.05, 0.02, 0.95, 0.98), 500),
    'schnabel': ('carte', 'schnabel', (0.02, 0.02, 0.98, 0.98), 580),
    'schnabel_face': ('carte', 'schnabel', (0.12, 0.05, 0.62, 0.42), 600),
}
run(__file__, 'archive', JOBS)
