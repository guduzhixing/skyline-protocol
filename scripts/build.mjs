import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MOBILE_PATCHES } from '../src/modules/mobile-input-aim.js';
import { TABLETOP_PATCHES } from '../src/modules/tabletop-engine.js';
import { BIONIC_CATHARSIS_PATCHES } from '../src/modules/bionic-hound-and-catharsis.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function parseMode() {
  const arg = process.argv.find(a => a.startsWith('--mode='));
  const mode = arg ? arg.split('=')[1] : 'showcase';
  if (mode !== 'showcase' && mode !== 'pure') {
    throw new Error(`Unsupported build mode "${mode}". Use --mode=showcase or --mode=pure.`);
  }
  return mode;
}

function replaceExact(source, target, replacement, label) {
  const idx = source.indexOf(target);
  if (idx === -1) {
    throw new Error(`Anchor not found [${label}]: ${target.slice(0, 120)}`);
  }
  const idx2 = source.indexOf(target, idx + target.length);
  if (idx2 !== -1) {
    throw new Error(`Anchor not unique [${label}]`);
  }
  return {
    text: source.slice(0, idx) + replacement + source.slice(idx + target.length),
    offset: idx
  };
}

function buildAssetMapFromShowcase(presetPath) {
  const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
  const out = {};
  for (const [key, relPath] of Object.entries(preset.assets)) {
    const abs = path.resolve(ROOT, relPath);
    if (!fs.existsSync(abs)) {
      throw new Error(`Missing showcase PNG asset [${key}]: ${abs}`);
    }
    const b64 = fs.readFileSync(abs).toString('base64');
    out[key] = `data:image/png;base64,${b64}`;
  }
  return out;
}

function replaceSAAssets(html, assetMap) {
  const startMarker = 'const SA_ASSETS={';
  const endMarker = '};function bindSAImgs';
  const sIdx = html.indexOf(startMarker);
  const eIdx = html.indexOf(endMarker, sIdx);
  if (sIdx === -1 || eIdx === -1) {
    throw new Error('Could not locate SA_ASSETS initializer block in engine-base.html');
  }
  const serialized = `const SA_ASSETS=${JSON.stringify(assetMap)}`;
  return html.slice(0, sIdx) + serialized + html.slice(eIdx + 1);
}

function applyPureNeutralPreset(html, neutralPath) {
  const preset = JSON.parse(fs.readFileSync(neutralPath, 'utf8'));
  let out = replaceSAAssets(html, preset.svgAssets);
  for (const [from, to] of preset.replacements) {
    if (!from) continue;
    out = out.split(from).join(to);
  }
  return out;
}

function main() {
  const mode = parseMode();
  const basePath = path.join(ROOT, 'src', 'core', 'engine-base.html');
  let html = fs.readFileSync(basePath, 'utf8');

  // 1. Re-embed fresh assets for showcase preset (verifies binary assets match index.html)
  if (mode === 'showcase') {
    const assetMap = buildAssetMapFromShowcase(path.join(ROOT, 'src', 'presets', 'superacme-showcase.json'));
    html = replaceSAAssets(html, assetMap);
  }

  // 2. Compose modular responsive CSS + Tabletop UI CSS
  const mobileCss = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'mobile-responsive.css'), 'utf8').trim();
  const tabletopCss = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'tabletop-ui.css'), 'utf8').trim();
  const combinedCss = `${mobileCss}\n\n${tabletopCss}`;

  const cssAnchor = '@media (max-width: 760px) { .m-missions, .m-roles, .m-sp-grid { grid-template-columns: 1fr; } .h-map, .h-score { display: none; } .h-tac { transform: translateX(-50%) scale(.82); bottom: calc(8px + var(--sab)); } .m-medals { grid-template-columns: repeat(2, 1fr); } }\n</style>';
  const cssRes = replaceExact(html, cssAnchor, combinedCss, 'v3-modular-css');
  html = cssRes.text;

  // 3. Inject Mobile Runtime + Aim-Assist slots, Tabletop Wargame Engine slots, and Bionic Hound + Catharsis slots
  const patches = [...MOBILE_PATCHES, ...TABLETOP_PATCHES, ...BIONIC_CATHARSIS_PATCHES];
  for (const p of patches) {
    const res = replaceExact(html, p.target, p.replacement, p.label);
    html = res.text;
  }

  // 4. Emit target build outputs
  fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
  if (mode === 'showcase') {
    const rootOut = path.join(ROOT, 'index.html');
    const distOut = path.join(ROOT, 'dist', 'skyline-protocol-standalone.html');
    fs.writeFileSync(rootOut, html, 'utf8');
    fs.writeFileSync(distOut, html, 'utf8');
    console.log(`[build:showcase] Built index.html + dist/skyline-protocol-standalone.html (${Buffer.byteLength(html)} bytes, ${patches.length + 1} slots)`);
  } else {
    html = applyPureNeutralPreset(html, path.join(ROOT, 'src', 'presets', 'open-neutral.json'));
    const pureOut = path.join(ROOT, 'dist', 'skyline-protocol-open.html');
    fs.writeFileSync(pureOut, html, 'utf8');
    console.log(`[build:pure] Built dist/skyline-protocol-open.html (${Buffer.byteLength(html)} bytes, zero third-party logos)`);
  }
}

main();
