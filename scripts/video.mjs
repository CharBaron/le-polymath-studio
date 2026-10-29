#!/usr/bin/env node
// npm run video -- videos/<dossier> [--from étape] [--only étape] [--draft] [--cloud]
// --cloud : l'étape render tourne sur GitHub Actions (scripts/cloud.mjs) au lieu du Mac
// script.md → voix → whisper → captions.json → timeline (cue sheet) → audio −14 LUFS → rendu MP4 1080×1920 30 i/s
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {transcribe} from '@remotion/install-whisper-cpp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (n) => {
  const i = argv.indexOf(`--${n}`);
  if (i === -1) return null;
  const v = argv[i + 1];
  argv.splice(i, 2);
  return v;
};
const from = flag('from');
const only = flag('only');
const draft = argv.includes('--draft');
const cloud = argv.includes('--cloud');
const dirArg = argv.find((a) => !a.startsWith('--'));
if (!dirArg) {
  console.error('usage : npm run video -- videos/<dossier> [--from voice|whisper|align|audio|render] [--only …] [--draft]');
  process.exit(1);
}
const vdir = path.resolve(dirArg.includes('/') ? dirArg : path.join('videos', dirArg));
const id = path.basename(vdir);
// scène sur mesure si le dossier est enregistré dans src/videos/index.ts, sinon le kit générique
const compId = fs.readFileSync(path.join(ROOT, 'src/videos/index.ts'), 'utf8').includes(`'${id}'`) ? id : 'kit';
const build = path.join(vdir, 'build');
const PY = path.join(ROOT, 'tools/tts/bin/python');
const STEPS = ['parse', 'voice', 'whisper', 'align', 'audio', 'render', 'check'];
const start = only ? STEPS.indexOf(only) : from ? STEPS.indexOf(from) : 0;
const end = only ? start : STEPS.length - 1;
const run = (cmd, args) => execFileSync(cmd, args, {stdio: 'inherit', cwd: ROOT});
const t0 = Date.now();

for (const step of STEPS.slice(start, end + 1)) {
  const ts = Date.now();
  console.log(`\n▶ ${step}`);
  if (['parse', 'voice', 'align', 'audio'].includes(step)) run(PY, [path.join(ROOT, 'tools/pipeline/steps.py'), step, vdir]);
  if (step === 'whisper') {
    const res = await transcribe({
      inputPath: path.join(build, 'voice16k.wav'),
      whisperPath: path.join(ROOT, 'tools/whisper'),
      whisperCppVersion: '1.5.5',
      model: 'small',
      language: 'fr',
      tokenLevelTimestamps: true,
      splitOnWord: true,
      printOutput: false,
    });
    fs.writeFileSync(path.join(build, 'whisper.json'), JSON.stringify(res));
    console.log(`whisper: ${res.transcription.length} segments`);
  }
  if (step === 'render' && cloud) run('node', [path.join(ROOT, 'scripts/cloud.mjs'), vdir, ...(draft ? ['--draft'] : [])]);
  else if (step === 'render') {
    const out = path.join(vdir, draft ? 'draft.mp4' : 'final.mp4');
    const args = ['remotion', 'render', compId, out, `--props=${JSON.stringify({id})}`, '--concurrency=2'];
    if (draft) args.push('--scale=0.5', '--crf=28');
    else args.push('--crf=20', '--audio-codec=aac', '--audio-bitrate=256k');
    run('npx', args);
  }
  if (step === 'check') run(PY, [path.join(ROOT, 'tools/pipeline/steps.py'), 'check', vdir, draft ? 'draft.mp4' : 'final.mp4']);
  console.log(`  ${((Date.now() - ts) / 1000).toFixed(1)} s`);
}
console.log(`\n✔ ${id} en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
