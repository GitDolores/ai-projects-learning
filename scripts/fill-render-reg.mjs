// Fill the Render registration form with email + generated password
// Usage: node fill-render-reg.mjs
import { readFileSync } from 'fs'
import { CdpSession, getTargets } from './cdp-lib.mjs'

const pw = readFileSync('C:/Users/18205/.qwen/tmp/render-pw.txt', 'utf8').trim()

const targets = await getTargets()
const target = targets.find(t => t.type === 'page' && t.url.includes('render.com'))
if (!target) throw new Error('render tab not found')

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej) })
const sess = new CdpSession(ws)

const expr = `(() => {
  const fill = (name, val) => {
    const input = document.querySelector('input[name="' + name + '"]');
    if (!input) return 'no input: ' + name;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, val);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return input.value;
  };
  const e = fill('email', '18205138662@163.com');
  const p = fill('password', ${JSON.stringify(pw)});
  return JSON.stringify({ email: e, pwLen: p.length });
})()`

console.log(await sess.evaluate(expr))
ws.close()
process.exit(0)
