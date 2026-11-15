import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function extractMainScript(html, fileLabel) {
  const start = html.lastIndexOf('<script>');
  const end = html.lastIndexOf('</script>');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`[verify] Missing <script> tag in ${fileLabel}`);
  }
  return html.slice(start + 8, end);
}

function checkJsSyntax(code, tag) {
  const tmp = path.join(os.tmpdir(), `skyline_check_${tag}_${process.pid}.mjs`);
  fs.writeFileSync(tmp, code, 'utf8');
  try {
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

function verifyHtmlFile(relPath, { pure = false } = {}) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`[verify] File not found: ${relPath}`);
  }
  const html = fs.readFileSync(fullPath, 'utf8');
  const script = extractMainScript(html, relPath);
  checkJsSyntax(script, path.basename(relPath, '.html'));

  const requiredAnchors = [
    'tabletop-board',
    'TT_MAPS',
    'findMobAssistTarget',
    'IS_TOUCH_DEV',
    'window.__ready',
    'east_sea_mega_bridge',
    'skyline.career.v2',
    'buildBionicHoundRig',
    'triggerPulseStrike',
    'h-popups',
    'h-streak',
    'tt-popups'
  ];
  for (const anchor of requiredAnchors) {
    if (!html.includes(anchor)) {
      throw new Error(`[verify] Missing required anchor "${anchor}" in ${relPath}`);
    }
  }

  const forbiddenLegacy = ['几猫', 'Jimao', 'JIMAO', 'UniUbi', 'UNIUBI', 'uniubi', '宇泛', 'Cyvet', 'CYVET'];
  for (const tok of forbiddenLegacy) {
    if (html.includes(tok)) {
      throw new Error(`[verify] Legacy forbidden string "${tok}" found in ${relPath}`);
    }
  }

  if (pure) {
    const brandTokens = ['CINMOORE', 'SuperACME', '杭州研极微', '研极微', '研极芯', '神眸', 'PT2C', 'BC4', 'BC6V', 'BC22', 'superacme.com'];
    const hits = brandTokens.filter(t => html.includes(t));
    if (hits.length > 0) {
      throw new Error(`[verify:pure] Third-party brand tokens still present in ${relPath}: ${hits.join(', ')}`);
    }
    if (html.includes('data:image/png;base64,')) {
      throw new Error(`[verify:pure] Unexpected raster PNG data URL present in ${relPath}`);
    }
  }

  return {
    file: relPath,
    utf8Bytes: Buffer.byteLength(html, 'utf8'),
    scriptBytes: Buffer.byteLength(script, 'utf8'),
    anchorsOk: requiredAnchors.length,
    pureNeutralOk: pure ? true : 'n/a'
  };
}

function verifyStaticPages() {
  const distIndex = path.join(ROOT, 'dist', 'index.html');
  if (!fs.existsSync(distIndex)) {
    throw new Error('[verify] Missing dist/index.html launcher portal');
  }
  const distHtml = fs.readFileSync(distIndex, 'utf8');
  for (const href of ['./skyline-protocol-standalone.html', './skyline-protocol-open.html']) {
    if (!distHtml.includes(href)) {
      throw new Error(`[verify] dist/index.html missing link to ${href}`);
    }
  }
  const promoPath = path.join(ROOT, 'docs', 'showcase', 'promo.html');
  if (fs.existsSync(promoPath)) {
    const promoHtml = fs.readFileSync(promoPath, 'utf8');
    checkJsSyntax(extractMainScript(promoHtml, 'docs/showcase/promo.html'), 'promo');
    if (promoHtml.includes("getElementById('soundInlineToggle')") && !promoHtml.includes('id="soundInlineToggle"')) {
      throw new Error('[verify] docs/showcase/promo.html references #soundInlineToggle in JS without matching DOM element');
    }
  }
}

function main() {
  const results = [];
  results.push(verifyHtmlFile('index.html', { pure: false }));
  results.push(verifyHtmlFile('dist/skyline-protocol-standalone.html', { pure: false }));
  results.push(verifyHtmlFile('dist/skyline-protocol-open.html', { pure: true }));
  verifyStaticPages();

  // Also syntax-check source JS modules directly
  for (const mod of ['src/modules/mobile-input-aim.js', 'src/modules/tabletop-engine.js', 'scripts/cdp-qa/layout-audit.mjs', 'scripts/cdp-qa/run-4matrix-qa.mjs']) {
    const abs = path.join(ROOT, mod);
    if (fs.existsSync(abs)) {
      execFileSync(process.execPath, ['--check', abs], { stdio: 'pipe' });
    }
  }
  console.log('[verify-build] ALL CHECKS PASSED:');
  console.table(results);
}

main();
