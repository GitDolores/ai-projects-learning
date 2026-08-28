// Poll report render status with short CDP calls
import { CdpSession, sleep } from './cdp-lib.mjs';

const sess = await CdpSession.connect();
try {
    const start = Date.now();
    while (Date.now() - start < 150000) {
        const state = await sess.evaluate(`(() => {
            const headers = [...document.querySelectorAll('.el-card__header')].map(h => h.textContent.trim());
            const analyzing = [...document.querySelectorAll('button')].some(b => b.textContent.includes('分析中'));
            const logs = [...document.querySelectorAll('.el-timeline-item')].slice(-3).map(l => l.textContent.trim().slice(0, 80));
            return JSON.stringify({ done: headers.some(t => t.includes('项目概述')), analyzing, cards: headers.length, logs });
        })()`);
        console.log(new Date().toISOString().slice(11, 19), state);
        if (JSON.parse(state).done) {
            console.log('REPORT RENDERED');
            break;
        }
        await sleep(3000);
    }
} finally {
    sess.close();
}
