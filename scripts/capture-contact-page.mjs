import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('scripts/screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome_cdp_about_audit');

const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${userDataDir}`,
  '--window-size=1536,1000',
  '--hide-scrollbars',
  'about:blank'
], { stdio: 'ignore' });

await new Promise((r) => setTimeout(r, 1500));

try {
  const targetsRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await targetsRes.json();
  const target = targets.find((t) => t.type === 'page') || targets[0];
  const wsUrl = target.webSocketDebuggerUrl;

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

  await new Promise((r) => { ws.onopen = r; });
  await send('Page.enable');
  await send('Runtime.enable');

  // 1. Capture Contact Page
  console.log('Navigating to http://localhost:3000/contact...');
  await send('Page.navigate', { url: 'http://localhost:3000/contact' });
  await new Promise((r) => setTimeout(r, 4500));

  console.log('Capturing contact page...');
  const contactShot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'contact_hero_and_channels.png'), Buffer.from(contactShot1.data, 'base64'));

  await send('Runtime.evaluate', { expression: "window.scrollTo({ top: 900, behavior: 'instant' });" });
  await new Promise((r) => setTimeout(r, 600));
  const contactShot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'contact_form_and_faqs.png'), Buffer.from(contactShot2.data, 'base64'));

  // 2. Capture updated bottom of About page
  console.log('Navigating to http://localhost:3000/about to verify removed sections...');
  await send('Page.navigate', { url: 'http://localhost:3000/about' });
  await new Promise((r) => setTimeout(r, 4500));
  await send('Runtime.evaluate', { expression: "window.scrollTo({ top: 4300, behavior: 'instant' });" });
  await new Promise((r) => setTimeout(r, 600));
  const aboutBottom = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'about_updated_bottom.png'), Buffer.from(aboutBottom.data, 'base64'));

  ws.close();
  console.log('Screenshots captured successfully!');
} catch (err) {
  console.error('Capture error:', err);
} finally {
  chromeProc.kill('SIGTERM');
  process.exit(0);
}
