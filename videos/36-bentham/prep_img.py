"""Images de la vidéo 36 (style cabinet : vitrine de musée en acajou, velours pourpre) : python3 -E videos/36-bentham/prep_img.py
Les photos de l'auto-icône (CC0) gardent leurs couleurs : c'est la preuve que tout est vrai."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'icone': ('carte', 'icone', (0.0, 0.08, 0.68, 0.97), 620, C),
    'icone_plein': ('plein', 'icone', (0.02, 0.1, 0.66, 0.96), 0, C),
    'icone_tete': ('carte', 'icone', (0.1, 0.1, 0.5, 0.36), 600, C),
    'profil': ('carte', 'profil', (0.1, 0.05, 0.8, 0.98), 600, C),
    'vitrine': ('carte', 'vitrine', (0.04, 0.12, 0.96, 0.98), 560, C),
    'portrait': ('carte', 'portrait', (0.05, 0.05, 0.95, 0.68), 640),
    'carica': ('carte', 'carica', (0.0, 0.0, 1.0, 0.95), 600),
    'tulp': ('carte', 'tulp', (0.0, 0.0, 1.0, 1.0), 880, C),
    'tulp_zoom': ('carte', 'tulp', (0.08, 0.05, 0.62, 0.62), 760, C),
    'squelette': ('carte', 'squelette', (0.08, 0.08, 0.92, 0.95), 600),
    'rhino': ('carte', 'rhino', (0.02, 0.02, 0.98, 0.98), 640),
    'conseil': ('carte', 'conseil', (0.02, 0.02, 0.98, 0.98), 880),
    'conseil_zoom': ('carte', 'conseil', (0.1, 0.3, 0.75, 0.82), 820),
    'courtiers': ('carte', 'courtiers', (0.05, 0.1, 0.95, 0.85), 880),
    'sommeil': ('carte', 'sommeil', (0.03, 0.03, 0.97, 0.9), 640),
    'sommeil_zoom': ('carte', 'sommeil', (0.0, 0.42, 0.62, 0.86), 760),
}
run(__file__, 'cabinet', JOBS)
