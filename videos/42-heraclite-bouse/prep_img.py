"""Images de la vidéo 42 (style etable : planches d'étable, paille, brun fumier) : python3 -E videos/42-heraclite-bouse/prep_img.py
Le portrait d'Héraclite (Moreelse, couleur) sert de sujet à l'animation Bouse : la bouse est dessinée en code par-dessus."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'heraclite': ('carte', 'portrait', (0.16, 0.04, 0.98, 0.96), 760, C),
    'portrait_plein': ('plein', 'portrait', (0.22, 0.08, 0.78, 0.62), 0, C),
    'pleure': ('carte', 'pleure', (0.04, 0.03, 0.96, 0.9), 640),
    'temple': ('carte', 'temple', (0.0, 0.0, 1.0, 0.86), 880),
    'osselets': ('carte', 'osselets', (0.245, 0.268, 0.735, 0.72), 640),
    'montagne': ('carte', 'montagne', (0.02, 0.02, 0.98, 0.98), 880),
    'koe': ('carte', 'koe', (0.02, 0.05, 0.98, 0.92), 860),
    'koe3': ('carte', 'koe3', (0.0, 0.0, 1.0, 1.0), 880),
    'koekop': ('carte', 'koe3', (0.05, 0.22, 0.44, 0.8), 720),
    'stal': ('carte', 'stal', (0.0, 0.0, 1.0, 1.0), 880),
    'job': ('carte', 'job', (0.0, 0.0, 1.0, 0.96), 680),
    'arts': ('carte', 'arts', (0.17, 0.14, 0.83, 0.74), 720),
    'docteurs': ('carte', 'docteurs', (0.0, 0.0, 1.0, 0.33), 880),
    'honden': ('carte', 'honden', (0.0, 0.0, 1.0, 1.0), 860),
    'honden2': ('carte', 'honden2', (0.0, 0.0, 1.0, 1.0), 860),
}
run(__file__, 'etable', JOBS)
