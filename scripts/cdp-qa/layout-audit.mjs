import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export function resolveChromeExecutable() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Chrome/Chromium binary not found. Set CHROME_PATH env var.');
}

export async function launchCdpSession({ port = 9242, profileTag = 'skyline_qa' } = {}) {
  const chromeBin = resolveChromeExecutable();
  const profileDir = path.join(os.tmpdir(), `${profileTag}_${process.pid}`);
  fs.mkdirSync(profileDir, { recursive: true });

  let procErr = '';
  const proc = spawn(chromeBin, [
    '--headless=new',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--disable-gpu-sandbox',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-address=127.0.0.1',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  proc.stderr?.on('data', chunk => {
    procErr = (procErr + chunk.toString()).slice(-2000);
  });

  let ws = null;
  let mid = 1;
  const pend = new Map();
  const runtimeErrors = [];

  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const target = list.find(x => x.type === 'page') || list[0];
      if (target?.webSocketDebuggerUrl) {
        ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise(r => { ws.onopen = r; });
        break;
      }
    } catch {}
    await sleep(250);
  }
  if (!ws) {
    proc.kill('SIGKILL');
    throw new Error(`Failed to connect to Chrome CDP on port ${port}${procErr ? `\nChrome stderr:\n${procErr}` : ''}`);
  }

  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) {
      pend.get(m.id).res(m.result);
      pend.delete(m.id);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push('PAGE_EX: ' + JSON.stringify(m.params.exceptionDetails?.text || m.params.exceptionDetails));
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      runtimeErrors.push('CONSOLE_ERR: ' + (m.params.args || []).map(a => a.value || a.description).join(' '));
    }
  };

  const cdp = (method, params = {}) => new Promise((res, rej) => {
    const id = mid++;
    pend.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });

  const ev = async expr => {
    const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r?.exceptionDetails) {
      runtimeErrors.push('EVAL_EX: ' + JSON.stringify(r.exceptionDetails.text || r.exceptionDetails));
    }
    return r?.result?.value;
  };

  const tapEl = async sel => {
    const pt = await ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if(!el) return null; const r = el.getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height}; })()`);
    if (!pt || pt.w === 0) throw new Error(`Missing or hidden element for touch tap: ${sel}`);
    await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: pt.x, y: pt.y }] });
    await sleep(45);
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(160);
  };

  const checkOverlaps = async selectors => {
    return await ev(`(() => {
      const sels = ${JSON.stringify(selectors)};
      const rects = [];
      for (const s of sels) {
        const el = document.querySelector(s);
        if (!el) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        rects.push({ sel: s, left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) });
      }
      const overlaps = [];
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i], b = rects[j];
          const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
          const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          if (ix > 2 && iy > 2) overlaps.push({ a: a.sel, b: b.sel, ix, iy, boxA: a, boxB: b });
        }
      }
      const oob = rects.filter(r => r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1);
      return { checked: rects.length, overlaps, oob, vw: innerWidth, vh: innerHeight };
    })()`);
  };

  await cdp('Page.enable');
  await cdp('Runtime.enable');

  const close = () => {
    try { ws.close(); } catch {}
    try { proc.kill('SIGKILL'); } catch {}
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  };

  return { cdp, ev, tapEl, checkOverlaps, runtimeErrors, close };
}
