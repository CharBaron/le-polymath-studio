"""Images de la vidéo 32 (style empire) : python3 -E videos/32-taille-napoleon/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from tools.pipeline.gravure_prep import run

C = {'color': True}
NAPO = [(600, 205), (680, 215), (735, 270), (730, 350), (710, 400), (760, 430), (840, 470), (880, 520), (910, 620), (925, 760), (925, 900), (910, 1000), (860, 1060), (820, 1120), (800, 1190), (760, 1220), (740, 1300), (730, 1430), (710, 1550), (720, 1700), (740, 1850), (760, 1900), (740, 1935), (690, 1930), (640, 1915), (590, 1935), (560, 1965), (470, 1965), (460, 1935), (540, 1890), (575, 1780), (555, 1650), (520, 1500), (505, 1400), (500, 1250), (475, 1100), (470, 960), (480, 860), (440, 800), (430, 700), (460, 580), (520, 490), (570, 440), (560, 400), (545, 330), (550, 250)]
JOBS = {
    'david_plein': ('plein', 'david', (0.3, 0.08, 0.75, 0.6), 0, C),
    'david': ('carte', 'david', (0.08, 0.05, 0.95, 0.97), 700, C),
    'napo_cut': ('poly', 'david', (420, 195, 935, 1975), 0, {'poly': NAPO, 'color': True}),
    'maniac': ('carte', 'maniac', (0.02, 0.02, 0.98, 0.98), 880),
    'maniac_zoom': ('carte', 'maniac', (0.42, 0.3, 0.85, 0.9), 700),
    'pudding': ('carte', 'pudding', (0.0, 0.06, 1.0, 1.0), 880, C),
    'pudding_boney': ('carte', 'pudding', (0.5, 0.12, 0.98, 0.95), 700, C),
    'tiddy': ('carte', 'tiddy', (0.0, 0.0, 1.0, 1.0), 880, C),
    'mort': ('carte', 'mort', (0.0, 0.0, 1.0, 1.0), 880),
    'masque': ('carte', 'masque', (0.18, 0.26, 0.82, 0.64), 640),
    'baton': ('carte', 'baton', (0.0, 0.0, 1.0, 1.0), 720),
    'baton2': ('carte', 'baton2', (0.0, 0.0, 1.0, 1.0), 720),
    'maniac_plein': ('plein', 'maniac', (0.5, 0.15, 0.8, 0.88), 0),
}
run(__file__, 'empire', JOBS)
