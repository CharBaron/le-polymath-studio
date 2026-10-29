// Rendu dans le cloud (GitHub Actions, gratuit) au lieu du Mac : node scripts/cloud.mjs videos/<id> [--draft]
// 1. pousse le code et les fichiers de public/v/<id> (audio, images) ; 2. lance le workflow « render » ;
// 3. attend la fin ; 4. télécharge le mp4 dans videos/<id>/final.mp4 (ou draft.mp4).
// Les étapes parse → audio restent sur le Mac (voix, whisper, mix) : ou tout d'un coup : `npm run video -- videos/<id> --cloud`.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GH = process.env.GH || path.join(os.homedir(), 'bin', 'gh');
const vdir = path.resolve(process.argv[2]);
const draft = process.argv.includes('--draft');
const id = path.basename(vdir);
const compId = fs.readFileSync(path.join(ROOT, 'src/videos/index.ts'), 'utf8').includes(`'${id}'`) ? id : 'kit';
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, {cwd: ROOT, encoding: 'utf8', stdio: opts.quiet ? 'pipe' : 'inherit', ...opts});
const t0 = Date.now();

sh('git', ['add', '-A']);
if (sh('git', ['status', '--porcelain'], {quiet: true}).trim()) sh('git', ['commit', '-q', '-m', `rendu ${id}`]);
sh('git', ['push', '-q', 'origin', 'main']);
const before = sh(GH, ['run', 'list', '--workflow', 'render.yml', '-L', '1', '--json', 'databaseId', '-q', '.[0].databaseId'], {quiet: true}).trim();
sh(GH, ['workflow', 'run', 'render.yml', '-f', `id=${id}`, '-f', `comp=${compId}`, '-f', `draft=${draft}`]);
let run = before;
for (let k = 0; k < 30 && run === before; k++) {
  execFileSync('sleep', ['2']);
  run = sh(GH, ['run', 'list', '--workflow', 'render.yml', '-L', '1', '--json', 'databaseId', '-q', '.[0].databaseId'], {quiet: true}).trim();
}
console.log(`☁ rendu ${id} lancé (run ${run})`);
sh(GH, ['run', 'watch', run, '--exit-status', '--interval', '15']);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'render-'));
sh(GH, ['run', 'download', run, '-n', 'final', '-D', tmp]);
const out = path.join(vdir, draft ? 'draft.mp4' : 'final.mp4');
fs.copyFileSync(path.join(tmp, 'final.mp4'), out);
fs.rmSync(tmp, {recursive: true, force: true});
console.log(`✔ ${path.relative(ROOT, out)} en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
