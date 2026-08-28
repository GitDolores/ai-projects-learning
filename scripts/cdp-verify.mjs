// CDP driver for repo-analysis page verification
// Usage: node cdp-verify.mjs <step> [args...]
// Steps: state | nav <url> | eval <expr> | screenshot <file> | login | analyze <repoUrl> | full <repoUrl> | report-detail

import { CdpSession, sleep, waitFor } from './cdp-lib.mjs';

// ---- Steps ----

async function stepState(sess) {
    return sess.evaluate(`(() => {
        const input = document.querySelector('.el-input__inner');
        const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('开始分析') || b.textContent.includes('分析中'));
        return {
            url: location.href,
            title: document.title,
            hasInput: !!input,
            inputPlaceholder: input ? input.placeholder : null,
            hasAnalyzeBtn: !!btn,
        };
    })()`);
}

async function stepLogin(sess) {
    await sess.evaluate(`location.href = 'http://localhost:18848/#/login'`);
    await sleep(2000);
    await waitFor(sess, 'login form', `(() => {
        const inputs = document.querySelectorAll('.el-input__inner');
        return inputs.length >= 2;
    })()`);
    const filled = await sess.evaluate(`(() => {
        const inputs = document.querySelectorAll('.el-input__inner');
        return { count: inputs.length, u: inputs[0]?.value, p: inputs[1]?.value ? inputs[1]?.value.length : 0 };
    })()`);
    console.log('Login form:', JSON.stringify(filled));
    await sess.evaluate(`(() => {
        const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '登 录' || b.textContent.trim() === '登录');
        if (btn) btn.click();
    })()`);
    await waitFor(sess, 'post-login (away from login page)', `location.hash !== '#/login' && !location.hash.includes('login')`);
    return sess.evaluate(`location.href`);
}

async function stepNav(sess, url) {
    await sess.evaluate(`location.href = ${JSON.stringify(url)}`);
    await sleep(1500);
    return stepState(sess);
}

async function fillAndClick(sess, repoUrl) {
    await waitFor(sess, 'repo input', `!!document.querySelector('.el-input__inner')`);
    await sess.evaluate(`(() => {
        const input = document.querySelector('.el-input__inner');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, ${JSON.stringify(repoUrl)});
        input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await sess.evaluate(`(() => {
        const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('开始分析'));
        if (!btn) throw new Error('开始分析 button not found');
        btn.click();
    })()`);
}

async function stepAnalyze(sess, repoUrl) {
    await fillAndClick(sess, repoUrl);
    console.log('Waiting for report...');
    const reportInfo = await waitFor(sess, 'report render', `(() => {
        const headers = [...document.querySelectorAll('.el-card__header')].map(h => h.textContent.trim());
        const hasOverview = headers.some(t => t.includes('项目概述'));
        if (!hasOverview) return null;
        const moduleNameTags = [...document.querySelectorAll('.el-collapse-item__header')].map(e => e.textContent.trim());
        return { headers, modules: moduleNameTags };
    })()`, 180000, 1500);
    return reportInfo;
}

async function shot(sess, file) {
    const r = await sess.send('Page.captureScreenshot', { format: 'png' });
    const { writeFileSync } = await import('fs');
    writeFileSync(file, Buffer.from(r.data, 'base64'));
    return file;
}

async function stepFull(sess, repoUrl) {
    await sess.evaluate(`location.hash !== '#/repo-analysis' && (location.hash = '#/repo-analysis')`);
    await fillAndClick(sess, repoUrl);
    console.log('Waiting for report...');
    await waitFor(sess, 'report render', `(() => {
        const headers = [...document.querySelectorAll('.el-card__header')].map(h => h.textContent.trim());
        return headers.some(t => t.includes('项目概述'));
    })()`, 180000, 1500);
    await sleep(600);

    const shots = [];
    shots.push(await shot(sess, 'C:\\Users\\18205\\AppData\\Local\\Temp\\repo-1-overview.png'));
    for (let i = 2; i <= 6; i++) {
        await sess.evaluate(`(() => {
            const wrap = document.querySelector('.app-main .el-scrollbar__wrap');
            if (wrap) wrap.scrollTop = wrap.scrollHeight * ${i} / 7;
        })()`);
        await sleep(400);
        shots.push(await shot(sess, 'C:\\Users\\18205\\AppData\\Local\\Temp\\repo-' + i + '-scroll.png'));
    }
    const details = await sess.evaluate(`(() => {
        const pick = (label) => {
            const headers = [...document.querySelectorAll('.el-card__header')];
            const h = headers.find(x => x.textContent.includes(label));
            if (!h) return null;
            const card = h.closest('.el-card');
            return card ? card.innerText.slice(0, 2500) : null;
        };
        return {
            overview: pick('项目概述'),
            directory: pick('目录结构'),
            coreModules: pick('核心模块'),
            dataflow: pick('数据流'),
            patterns: pick('设计模式'),
        };
    })()`);
    return { shots, details };
}

async function stepScreenshot(sess, file) {
    return 'saved: ' + (await shot(sess, file));
}

async function stepReportDetail(sess) {
    return sess.evaluate(`(() => {
        const pick = (label) => {
            const headers = [...document.querySelectorAll('.el-card__header')];
            const h = headers.find(x => x.textContent.includes(label));
            if (!h) return null;
            const card = h.closest('.el-card');
            return card ? card.innerText.slice(0, 2500) : null;
        };
        return {
            overview: pick('项目概述'),
            directory: pick('目录结构'),
            coreModules: pick('核心模块'),
            dataflow: pick('数据流'),
            patterns: pick('设计模式'),
        };
    })()`);
}

// ---- Main ----

const [step, ...args] = process.argv.slice(2);
const sess = await CdpSession.connect();
try {
    let result;
    switch (step) {
        case 'state': result = await stepState(sess); break;
        case 'login': result = await stepLogin(sess); break;
        case 'nav': result = await stepNav(sess, args[0]); break;
        case 'analyze': result = await stepAnalyze(sess, args[0]); break;
        case 'full': result = await stepFull(sess, args[0]); break;
        case 'screenshot': result = await stepScreenshot(sess, args[0]); break;
        case 'report-detail': result = await stepReportDetail(sess); break;
        case 'eval': result = await sess.evaluate(args[0]); break;
        default: throw new Error('Unknown step: ' + step);
    }
    console.log(JSON.stringify(result, null, 2));
} finally {
    sess.close();
}
