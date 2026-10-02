import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('scripts/screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Launch Chrome with remote debugging
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome_cdp_about_audit');

console.log('Launching headless Chrome...');
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${userDataDir}`,
  '--window-size=1536,1000',
  '--hide-scrollbars',
  'about:blank'
], { stdio: 'ignore', detached: false });

// Give Chrome a moment to open debug port
await new Promise((r) => setTimeout(r, 1500));

try {
  const versionRes = await fetch('http://127.0.0.1:9222/json/version');
  const versionData = await versionRes.json();
  console.log('Connected to Chrome:', versionData.Browser);

  const targetsRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await targetsRes.json();
  const target = targets.find((t) => t.type === 'page') || targets[0];
  const wsUrl = target.webSocketDebuggerUrl;

  console.log('Connecting to target WS:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) => {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise((r) => {
    ws.onopen = r;
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  console.log('Navigating to http://localhost:3000/about...');
  await send('Page.navigate', { url: 'http://localhost:3000/about' });

  // Wait for preloader to finish (Preloader takes ~4.4s on first visit or 3s)
  console.log('Waiting 5s for preloader to dismiss and animations to settle...');
  await new Promise((r) => setTimeout(r, 5500));

  // Capture full page height
  const docLayout = await send('Runtime.evaluate', {
    expression: 'JSON.stringify({ height: document.documentElement.scrollHeight, width: document.documentElement.clientWidth })',
    returnByValue: true,
  });
  const pageDims = JSON.parse(docLayout.result.value);
  console.log('Page dimensions:', pageDims);

  // Take full page screenshot
  console.log('Taking full page screenshot...');
  const fullPageShot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
  });
  fs.writeFileSync(path.join(outDir, '00_full_page.png'), Buffer.from(fullPageShot.data, 'base64'));

  // Define section scroll positions
  const sections = [
    { name: '01_hero', y: 0 },
    { name: '02_genesis', y: 850 },
    { name: '03_rituals_tabs_and_spotlight', y: 1750 },
    { name: '04_rituals_mini_cards', y: 2450 },
    { name: '05_transparency_ledger', y: 3100 },
    { name: '06_ingredient_sanctuary', y: 4100 },
    { name: '07_pledges', y: 5200 },
    { name: '08_closing_and_footer', y: 6000 },
  ];

  for (const sec of sections) {
    console.log(`Scrolling to ${sec.name} at y=${sec.y}...`);
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: ${sec.y}, behavior: 'instant' });`,
    });
    await new Promise((r) => setTimeout(r, 600));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, `${sec.name}.png`), Buffer.from(shot.data, 'base64'));
    console.log(`Saved ${sec.name}.png`);
  }

  // Also click tab 2 and take screenshot to verify ritual tab switching animation
  console.log('Testing ritual tab 2 click...');
  await send('Runtime.evaluate', {
    expression: `
      const btns = document.querySelectorAll('button');
      for (const b of btns) {
        if (b.innerText && b.innerText.includes('48h Natural Sprouting')) {
          b.click();
          break;
        }
      }
    `,
  });
  await new Promise((r) => setTimeout(r, 700));
  const tab2Shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, '03b_ritual_tab_2_active.png'), Buffer.from(tab2Shot.data, 'base64'));

  ws.close();
  console.log('All screenshots captured successfully!');
} catch (err) {
  console.error('Audit script error:', err);
} finally {
  chromeProc.kill('SIGTERM');
  process.exit(0);
}
