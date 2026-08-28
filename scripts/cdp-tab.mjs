// Connect to a specific CDP target (by URL substring) and eval / screenshot / print text
// Usage: node cdp-tab.mjs <urlSubstring> <eval|text|url> [expression] [--screenshot <file>]
import { getTargets, CdpSession, sleep } from './cdp-lib.mjs';

const [sub, action, expr, shotFlag, shotFile] = process.argv.slice(2);
const targets = await getTargets();
const target = targets.find(t => t.type === 'page' && t.url.includes(sub));
if (!target) {
    console.error('No target matching: ' + sub);
    process.exit(1);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
const sess = new CdpSession(ws);

if (action === 'eval') {
    console.log(JSON.stringify(await sess.evaluate(expr)));
} else if (action === 'text') {
    console.log(await sess.evaluate('document.body.innerText.slice(0, 3000)'));
} else if (action === 'url') {
    console.log(await sess.evaluate('location.href'));
} else if (action === 'screenshot' && shotFlag === '--file') {
    const r = await sess.send('Page.captureScreenshot', { format: 'png' });
    const { writeFileSync } = await import('fs');
    writeFileSync(shotFile, Buffer.from(r.data, 'base64'));
    console.log('saved: ' + shotFile);
}
ws.close();
process.exit(0);
