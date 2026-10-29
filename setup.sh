#!/bin/bash
# Installe tout ce qu'il faut pour relancer les vidéos (macOS ou Linux). Lancer une fois : bash setup.sh
set -e
cd "$(dirname "$0")"
pip3 install piper-tts numpy scipy praat-parselmouth
npm install playwright && npx playwright install chromium
command -v ffmpeg >/dev/null || echo "⚠ installe ffmpeg (macOS : brew install ffmpeg)"
# remet les modèles de voix à leur place
for d in serie/ep1 serie/ep2 serie/ep3 concepts/ic concepts/dette; do mkdir -p $d/voice/raw $d/voice/user; cp voices/fr_FR-tom-medium.onnx* voices/fr_FR-gilles-low.onnx* $d/voice/; done
mkdir -p tts/vits-piper-fr_FR-upmc-medium && cp voices/fr_FR-upmc-medium.onnx* tts/vits-piper-fr_FR-upmc-medium/
echo "ok — voir CLAUDE.md"
