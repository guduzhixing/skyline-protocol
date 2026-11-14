import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { launchCdpSession, sleep } from './layout-audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const SHOWCASE_URL = pathToFileURL(path.join(ROOT, 'index.html')).href;
const PURE_URL = pathToFileURL(path.join(ROOT, 'dist', 'skyline-protocol-open.html')).href;
const REPORT_PATH = path.join(ROOT, 'docs', 'benchmarks', 'latest-qa-report.json');
const HUD_SELECTORS = [
  '.h-obj', '#h-map', '.h-score', '.h-compass', '.t-pause', '#t-assist-btn',
  '.h-health', '.h-ammo', '.h-tac', '.t-fire', '.t-ads', '.t-jump', '.t-reload', '.t-stick-idle'
];

async function waitEngineReady(ev) {
  for (let i = 0; i < 80; i++) {
    if (await ev('Boolean(window.__ready && window.__frames > 4)')) return;
    await sleep(250);
  }
  throw new Error('Engine timed out waiting for window.__ready && window.__frames > 4');
}

async function waitUntil(ev, expr, msg, maxMs = 8000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (await ev(expr)) return;
    await sleep(150);
  }
  throw new Error(`Timed out after ${maxMs}ms waiting for: ${msg}`);
}

async function run() {
  const session = await launchCdpSession({ port: 9242 });
  const { cdp, ev, tapEl, checkOverlaps, runtimeErrors, close } = session;
  const t0 = Date.now();
  const report = {
    executedAt: new Date().toISOString(),
    targetShowcase: 'index.html',
    targetPure: 'dist/skyline-protocol-open.html',
    matrices: {}
  };

  try {
    // ==================== MATRIX 1: MOBILE PORTRAIT 390x844 ====================
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await cdp('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
    });
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await cdp('Page.navigate', { url: SHOWCASE_URL });
    await waitEngineReady(ev);
    await sleep(350);

    const portraitTitle = await ev(`(() => {
      const dep = document.querySelector('[data-act="deploy"]').getBoundingClientRect();
      const modes = [...document.querySelectorAll('.m-mode')];
      return {
        cl: [...document.documentElement.classList],
        fatal: window.__fatal,
        deploy: { top: Math.round(dep.top), bottom: Math.round(dep.bottom), vw: innerWidth, vh: innerHeight },
        modesCount: modes.length
      };
    })()`);
    assert.equal(portraitTitle.fatal, null);
    assert.equal(portraitTitle.modesCount, 3);
    assert.ok(portraitTitle.cl.includes('is-touch') && portraitTitle.cl.includes('is-portrait'), 'Expected is-touch & is-portrait classes');
    assert.ok(portraitTitle.deploy.bottom <= portraitTitle.deploy.vh, 'Deploy button must fit inside portrait fold');
    report.matrices.portraitTitle = portraitTitle;

    // Deploy FPS & test touch swipe + aim assist + auto-fire toggle
    await tapEl('[data-act="deploy"]');
    await sleep(300);
    await ev('window.__G.game.start({skipIntro:true, quick:true})');
    await sleep(300);
    await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 2, x: 300, y: 360 }] });
    await sleep(40);
    await cdp('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 2, x: 260, y: 350 }] });
    await sleep(40);
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(300);

    const portHudCheck = await checkOverlaps(HUD_SELECTORS);
    const portFpsState = await ev(`(() => ({
      state: window.__G.game.state,
      isTouch: window.__G.input.touch,
      hasFindAssist: typeof window.__G.findAssistTarget === 'function',
      hasLockPrompt: (document.querySelector('.comms')?.textContent || '').includes('鼠标捕获不可用'),
      assistText: document.querySelector('#t-assist-btn')?.textContent || ''
    }))()`);
    await tapEl('#t-assist-btn');
    const afterToggle = await ev(`document.querySelector('#t-assist-btn')?.textContent`);
    await tapEl('#t-assist-btn');
    assert.equal(portFpsState.state, 'playing');
    assert.equal(portFpsState.isTouch, true);
    assert.equal(portFpsState.hasFindAssist, true);
    assert.equal(portFpsState.hasLockPrompt, false);
    assert.equal(portHudCheck.overlaps.length, 0, `Portrait HUD overlap: ${JSON.stringify(portHudCheck.overlaps)}`);
    assert.equal(portHudCheck.oob.length, 0, `Portrait HUD OOB: ${JSON.stringify(portHudCheck.oob)}`);
    assert.equal(afterToggle, '仅手控:关');
    report.matrices.portraitFPS = { ...portFpsState, afterToggle, checkedElements: portHudCheck.checked, overlaps: portHudCheck.overlaps, oob: portHudCheck.oob };

    // ==================== MATRIX 2: MOBILE LANDSCAPE 844x390 ====================
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 844, height: 390, deviceScaleFactor: 2, mobile: true,
      screenOrientation: { type: 'landscapePrimary', angle: 90 }
    });
    await waitUntil(ev, `innerWidth === 844 && innerHeight === 390 && document.documentElement.classList.contains('is-landscape')`, 'landscape viewport & is-landscape class');
    await sleep(250);
    const landHudCheck = await checkOverlaps(HUD_SELECTORS);
    const landClasses = await ev('[...document.documentElement.classList]');
    assert.ok(landClasses.includes('is-landscape'), 'Expected is-landscape class');
    assert.equal(landHudCheck.overlaps.length, 0, `Landscape HUD overlap: ${JSON.stringify(landHudCheck.overlaps)}`);
    assert.equal(landHudCheck.oob.length, 0, `Landscape HUD OOB: ${JSON.stringify(landHudCheck.oob)}`);
    report.matrices.landscapeFPS = { classes: landClasses, checkedElements: landHudCheck.checked, overlaps: landHudCheck.overlaps, oob: landHudCheck.oob };

    // ==================== MATRIX 3: TABLETOP 1P & 2P FACE-TO-FACE ====================
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
      screenOrientation: { type: 'portraitPrimary', angle: 0 }
    });
    await waitUntil(ev, `innerWidth === 390 && document.documentElement.classList.contains('is-portrait')`, 'portrait restore before tabletop');
    await tapEl('.t-pause');
    await tapEl('[data-s="paused"] [data-act="backtitle"]');
    await sleep(300);
    const titleStateAfterBack = await ev('window.__G.game.state');
    assert.equal(titleStateAfterBack, 'title');

    await tapEl('[data-pmode="tt1p"]');
    await tapEl('[data-act="deploy"]');
    await sleep(450);

    const tt1pStart = await ev(`(() => {
      const st = window.__G.tabletop.getState();
      const markers = [...document.querySelectorAll('#tt-markers .tt-nbtn')].map(el => ({ id: el.dataset.nd, cls: el.className, r: el.getBoundingClientRect() }));
      const topBar = document.querySelector('.tt-top-wrap').getBoundingClientRect();
      const dock = document.querySelector('.tt-dock').getBoundingClientRect();
      const markerCollisions = markers.filter(m => m.r.top < topBar.bottom - 2 || m.r.bottom > dock.top + 2);
      return { gameState: window.__G.game.state, st, markersCount: markers.length, reachCount: markers.filter(m => m.cls.includes('reach')).length, markerCollisions: markerCollisions.length };
    })()`);
    assert.equal(tt1pStart.gameState, 'tabletop');
    assert.equal(tt1pStart.markersCount, 11);
    assert.equal(tt1pStart.markerCollisions, 0);

    await tapEl('#tt-markers .tt-nbtn.reach');
    await tapEl('#tt-cards-row [data-cid="emp"]');
    await sleep(250);
    const tt1pAfterAct = await ev('({ st: window.__G.tabletop.getState() })');
    assert.equal(tt1pAfterAct.st.ap, 1);
    report.matrices.tabletop1P = { titleStateAfterBack, tt1pStart, tt1pAfterAct };

    // Switch to Mission 1 + 2P Face-to-Face Tabletop
    await tapEl('#tt-pause-btn');
    await tapEl('[data-s="paused"] [data-act="backtitle"]');
    await sleep(300);
    await tapEl('[data-mid="1"]');
    await sleep(700);
    await tapEl('[data-pmode="tt2p"]');
    await tapEl('[data-act="deploy"]');
    await sleep(350);
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 844, height: 390, deviceScaleFactor: 2, mobile: true,
      screenOrientation: { type: 'landscapePrimary', angle: 90 }
    });
    await waitUntil(ev, `innerWidth === 844 && document.documentElement.classList.contains('is-landscape')`, 'tabletop 2P landscape');
    await sleep(250);

    const beforeCam = await ev('({ yaw: Math.atan2(window.__G.camera.position.x, window.__G.camera.position.z), target: window.__G.tabletop.getState().camTargetYaw })');
    await tapEl('#tt-endturn-btn');
    await sleep(250);
    const handoffShown = await ev(`document.querySelector('#tt-handoff').classList.contains('on')`);
    await tapEl('#tt-ho-go');
    await waitUntil(ev, `(() => { const st = window.__G.tabletop.getState(); return Math.abs(st.camTargetYaw - st.camYaw) < 0.12; })()`, 'tabletop 180-deg camera flip settle', 9000);
    const afterCam = await ev('({ yaw: Math.atan2(window.__G.camera.position.x, window.__G.camera.position.z), target: window.__G.tabletop.getState().camTargetYaw })');
    let yawDelta = Math.abs(afterCam.yaw - beforeCam.yaw);
    if (yawDelta > Math.PI) yawDelta = Math.abs(yawDelta - 2 * Math.PI);
    const targetDelta = +(afterCam.target - beforeCam.target).toFixed(3);
    assert.equal(handoffShown, true);
    assert.ok(Math.abs(targetDelta - Math.PI) < 0.02, `Expected 180-deg flip targetDelta ~ 3.142, got ${targetDelta}`);
    report.matrices.tabletop2P = { handoffShown, yawDeltaRad: +yawDelta.toFixed(3), targetDelta, missionId: await ev('window.__G.missionId') };

    // Complete 2P Tabletop match and verify debrief protection + board cleanup
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: false });
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await sleep(300);
    for (let step = 0; step < 8; step++) {
      if ((await ev('window.__G.game.state')) === 'complete') break;
      await ev(`(() => {
        if (document.querySelector('#tt-handoff')?.classList.contains('on')) document.querySelector('#tt-ho-go').click();
        document.querySelector('#tt-cards-row [data-cid="emp"]:not(.disabled)')?.click();
        document.querySelector('#tt-markers .tt-nbtn.target')?.click();
        document.querySelector('#tt-endturn-btn')?.click();
      })()`);
      await sleep(160);
    }
    for (let step = 0; step < 8; step++) {
      if ((await ev('window.__G.game.state')) === 'complete') break;
      await ev(`(() => {
        if (document.querySelector('#tt-handoff')?.classList.contains('on')) document.querySelector('#tt-ho-go').click();
        document.querySelector('#tt-endturn-btn')?.click();
      })()`);
      await sleep(130);
    }
    await sleep(350);
    const tabletopDebrief = await ev(`(() => {
      const backBtn = document.querySelector('[data-s="complete"] [data-act="backtitle"]')?.getBoundingClientRect();
      return {
        gameState: window.__G.game.state,
        kicker: document.querySelector('#m-debrief-k')?.textContent,
        title: document.querySelector('#m-debrief-h')?.textContent,
        backBtnBot: Math.round(backBtn?.bottom || 9999),
        vh: innerHeight,
        ttRem: window.__G.scene?.getObjectByName('tabletop-board')?.children.length ?? -1
      };
    })()`);
    assert.equal(tabletopDebrief.gameState, 'complete');
    assert.equal(tabletopDebrief.ttRem, 0);
    assert.ok(tabletopDebrief.kicker.includes('2P 双人面对面战棋简报'), 'Debrief kicker must preserve tabletop title');
    report.matrices.tabletopDebrief = tabletopDebrief;

    // ==================== MATRIX 4: DESKTOP 1440x900 REGRESSION ====================
    await cdp('Emulation.setUserAgentOverride', { userAgent: '' });
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: false });
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp('Page.navigate', { url: SHOWCASE_URL });
    await waitEngineReady(ev);
    await sleep(350);

    const desktopRegression = await ev(`(() => ({
      state: window.__G.game.state,
      isTouchClass: document.documentElement.classList.contains('is-touch'),
      inputTouch: window.__G.input.touch,
      eyebrowTop: Math.round(document.querySelector('.m-eyebrow')?.getBoundingClientRect().top || -1),
      deployBot: Math.round(document.querySelector('[data-act="deploy"]')?.getBoundingClientRect().bottom || 9999),
      vh: innerHeight,
      fatal: window.__fatal
    }))()`);
    await ev(`document.querySelector('[data-act="deploy"]').click(); window.__G.game.start({skipIntro:true, quick:true});`);
    await sleep(300);
    desktopRegression.fpsState = await ev('window.__G.game.state');
    desktopRegression.billboardsAfterDeploy = await ev(`window.__G.scene?.getObjectByName('superacme-billboards')?.children.length || 0`);
    assert.equal(desktopRegression.fatal, null);
    assert.equal(desktopRegression.isTouchClass, false);
    assert.equal(desktopRegression.fpsState, 'playing');
    assert.equal(desktopRegression.billboardsAfterDeploy, 3);
    report.matrices.desktopRegression = desktopRegression;

    // ==================== MATRIX 5: PURE NEUTRAL OPEN BUILD BOOT CHECK ====================
    await cdp('Page.navigate', { url: PURE_URL });
    await waitEngineReady(ev);
    await sleep(300);
    const pureOpenBoot = await ev(`(() => ({
      title: document.title,
      fatal: window.__fatal,
      state: window.__G.game.state,
      brandHitsInDOM: (document.body.innerText.match(/CINMOORE|SuperACME|神眸|研极/gi) || []).length
    }))()`);
    assert.equal(pureOpenBoot.fatal, null);
    assert.equal(pureOpenBoot.brandHitsInDOM, 0);
    report.matrices.pureOpenBoot = pureOpenBoot;

    assert.equal(runtimeErrors.length, 0, `Runtime errors detected: ${JSON.stringify(runtimeErrors)}`);
    report.runtimeErrors = runtimeErrors;
    report.durationMs = Date.now() - t0;

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
    console.log(`[cdp-qa] ALL 5 MATRICES PASSED in ${report.durationMs}ms! Telemetry -> ${REPORT_PATH}`);
  } finally {
    close();
  }
}

run().catch(err => {
  console.error('[cdp-qa] FAILED:', err);
  process.exit(1);
});
