// Shared CDP library for verification scripts
export const CDP_HTTP = 'http://127.0.0.1:9222';

export async function getTargets() {
    const res = await fetch(CDP_HTTP + '/json');
    return res.json();
}

export async function findPageTarget() {
    const targets = await getTargets();
    return targets.find(t => t.type === 'page' && t.url.includes('localhost:18848'));
}

export class CdpSession {
    constructor(ws) {
        this.ws = ws;
        this.id = 0;
        this.pending = new Map();
        this.events = [];
        ws.addEventListener('message', (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.id !== undefined && this.pending.has(msg.id)) {
                const { resolve, reject } = this.pending.get(msg.id);
                this.pending.delete(msg.id);
                if (msg.error) reject(new Error(msg.error.message));
                else resolve(msg.result);
            } else if (msg.method) {
                this.events.push(msg);
            }
        });
    }

    static async connect() {
        const target = await findPageTarget();
        if (!target) throw new Error('No page target found for localhost:18848');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
            ws.addEventListener('open', resolve);
            ws.addEventListener('error', reject);
        });
        return new CdpSession(ws);
    }

    send(method, params = {}) {
        const id = ++this.id;
        this.ws.send(JSON.stringify({ id, method, params }));
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id);
                    reject(new Error('CDP timeout: ' + method));
                }
            }, 30000);
        });
    }

    async evaluate(expression) {
        const r = await this.send('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true,
        });
        if (r.exceptionDetails) throw new Error('JS error: ' + JSON.stringify(r.exceptionDetails));
        return r.result?.value;
    }

    close() {
        this.ws.close();
    }
}

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function waitFor(sess, desc, fn, timeoutMs = 60000, interval = 500) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const v = await sess.evaluate(fn);
            if (v) return v;
        } catch (e) {
            // ignore during polling
        }
        await sleep(interval);
    }
    throw new Error('Timeout waiting for: ' + desc);
}
