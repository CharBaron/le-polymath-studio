// Installe whisper.cpp + modèle multilingue dans tools/whisper (une seule fois).
import path from 'node:path';
import {installWhisperCpp, downloadWhisperModel} from '@remotion/install-whisper-cpp';
const dir = path.resolve('tools/whisper');
await installWhisperCpp({to: dir, version: '1.5.5'});
await downloadWhisperModel({model: 'small', folder: dir});
console.log('whisper ok');
