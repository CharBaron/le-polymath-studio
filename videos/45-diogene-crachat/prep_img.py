"""Images de la vidéo 45 (style corinthe : terre cuite, rouille) : python3 -E videos/45-diogene-crachat/prep_img.py
Le visage de Ribera (1637) porte le hook : le crachat et l'éclaboussure sur la vitre sont dessinés en code."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
U = {'color': True, 'up': True}
JOBS = {
    'ribera_plein': ('plein', 'ribera', (0.14, 0.08, 0.86, 0.72), 0, C),
    'ribera_bouche': ('plein', 'ribera', (0.33, 0.27, 0.67, 0.62), 0, C),
    'ribera_rond': ('rond', 'ribera', (0.5, 0.33, 0.27), 560, C),
    'palais': ('plein', 'palais', (0.5, 0.05, 0.9, 0.92), 0),
    'rooster': ('carte', 'rooster', (0.0, 0.0, 1.0, 1.0), 860, {'up': True}),
    'couture_salle': ('carte', 'couture', (0.22, 0.0, 0.78, 0.42), 880, U),
    'riche': ('carte', 'slaves', (0.2, 0.33, 0.46, 0.62), 760, U),
    'giordano': ('carte', 'giordano', (0.1, 0.05, 0.9, 0.62), 760, U),
    'coin': ('rond', 'coin', (0.5, 0.5, 0.47), 460),
    'crayer_dio': ('carte', 'crayer', (0.58, 0.38, 1.0, 1.0), 860, U),
    'crayer_dio_plein': ('plein', 'crayer', (0.56, 0.3, 1.0, 1.0), 0, C),
    'crayer_alex': ('carte', 'crayer', (0.14, 0.0, 0.6, 0.9), 800, U),
    'crayer_alex_rond': ('rond', 'crayer', (0.47, 0.135, 0.075), 560, C),
    'castig': ('plein', 'castig', (0.0, 0.0, 0.56, 1.0), 0),
    'rosa': ('plein', 'rosa', (0.05, 0.3, 0.95, 0.9), 0),
    'poulet': ('carte', 'poulet', (0.0, 0.08, 0.62, 0.88), 860, U),
    'poulet_plein': ('plein', 'poulet', (0.4, 0.55, 0.74, 0.98), 0, C),
    'chiens': ('carte', 'chiens', (0.0, 0.0, 1.0, 1.0), 860, {'up': True}),
    'foule_plein': ('plein', 'slaves', (0.0, 0.76, 0.5, 1.0), 0, C),
    'vieux': ('carte', 'tonneau', (0.12, 0.05, 0.92, 0.95), 800, U),
    'pieuvre': ('carte', 'pieuvre', (0.0, 0.42, 0.72, 1.0), 640, {'up': True}),
    'mortalex': ('plein', 'mortalex', (0.1, 0.2, 0.9, 0.86), 0, C),
}
run(__file__, 'corinthe', JOBS)
