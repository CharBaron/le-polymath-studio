# Cue sheet — vidéo 19-gorille-invisible (DA Gravure v3.1) : bande-son commune sfx/gravure.py (coupes, chiffres, tampons et bruitages
# des animations sur mesure), calée sur build/shots.json.
from sfx.gravure import make

score = make(__file__, 'src/videos/Gorille.shots.ts', semis=1)
