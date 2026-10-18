// --- Logica pura del Bloom filter -------------------------------------------
// Le funzioni hash e il caso del falso positivo sono stati verificati a
// parte con uno script Node prima di essere collegati al DOM (vedi il
// README): con il filtro contenente esattamente "gatto", "luna" e "treno",
// la parola "pane" (mai aggiunta) risulta "probabilmente presente" per
// coincidenza delle posizioni hash, mentre "sole" risulta correttamente
// "sicuramente assente".

const BIT_ARRAY_SIZE = 16;

function hash1(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
    return sum % BIT_ARRAY_SIZE;
}
function hash2(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i) * (i + 1);
    return sum % BIT_ARRAY_SIZE;
}
function hash3(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i) * 31;
    return (sum * 7 + str.length * 13) % BIT_ARRAY_SIZE;
}
function hashPositions(str) {
    return [hash1(str), hash2(str), hash3(str)];
}

function hash1Explain(str) {
    const codes = Array.from(str).map(c => c.charCodeAt(0));
    const sum = codes.reduce((a, b) => a + b, 0);
    return `<strong>h1</strong>("${str}") = somma dei codici carattere, % 16 = (${codes.join(' + ')}) % 16 = ${sum} % 16 = <strong>${sum % BIT_ARRAY_SIZE}</strong>`;
}
function hash2Explain(str) {
    const terms = Array.from(str).map((c, i) => `${c.charCodeAt(0)}×${i + 1}`);
    const sum = Array.from(str).reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
    return `<strong>h2</strong>("${str}") = somma dei codici pesati per posizione, % 16 = (${terms.join(' + ')}) % 16 = ${sum} % 16 = <strong>${sum % BIT_ARRAY_SIZE}</strong>`;
}
function hash3Explain(str) {
    const sum31 = Array.from(str).reduce((a, c) => a + c.charCodeAt(0) * 31, 0);
    const total = sum31 * 7 + str.length * 13;
    return `<strong>h3</strong>("${str}") = (somma codici × 31) × 7 + lunghezza × 13, % 16 = (${sum31} × 7 + ${str.length} × 13) % 16 = ${total} % 16 = <strong>${total % BIT_ARRAY_SIZE}</strong>`;
}

function buildAddSteps(word, bits) {
    const positions = hashPositions(word);
    const explains = [hash1Explain(word), hash2Explain(word), hash3Explain(word)];
    const steps = positions.map((pos, i) => ({
        type: 'calc', highlight: [pos],
        text: `${explains[i]} → bit in posizione <strong>${pos}</strong>.`
    }));
    steps.push({
        type: 'apply', positions,
        text: `Si impostano a 1 i bit nelle posizioni ${positions.join(', ')} (se non lo erano già). "${word}" è ora rappresentata nel filtro — ma il filtro non memorizza la parola stessa, solo questi bit.`
    });
    return steps;
}

function buildCheckSteps(word, bits) {
    const positions = hashPositions(word);
    const explains = [hash1Explain(word), hash2Explain(word), hash3Explain(word)];
    let allSet = true;
    const steps = positions.map((pos, i) => {
        const bitVal = bits[pos];
        if (bitVal === 0) allSet = false;
        return {
            type: 'check', highlight: [pos], bitVal,
            text: `${explains[i]} → bit in posizione <strong>${pos}</strong> = <strong>${bitVal}</strong>.`
        };
    });
    steps.push({
        type: 'conclude', positions, result: allSet,
        text: allSet
            ? `Tutti e tre i bit controllati erano 1: il filtro risponde <strong>"✓ Probabilmente presente"</strong>.`
            : `Almeno uno dei bit controllati era 0: il filtro risponde <strong>"✗ Sicuramente assente"</strong> — è una prova certa, perché se "${word}" fosse stata davvero aggiunta quel bit sarebbe stato impostato a 1.`
    });
    return steps;
}

// --- Stato dell'applicazione -------------------------------------------------

let bits = new Array(BIT_ARRAY_SIZE).fill(0);
let addedWords = [];

const app = { steps: [], current: -1, interval: null, speed: 1100, mode: null, word: '', applied: false };

function renderBitArray(opts) {
    opts = opts || {};
    const wrap = document.getElementById('bitArray');
    wrap.innerHTML = bits.map((b, i) => {
        const classes = ['bit-value'];
        if (b === 1) classes.push('set');
        if (opts.highlight && opts.highlight.includes(i)) classes.push('highlight');
        if (opts.justSet && opts.justSet.includes(i)) classes.push('just-set');
        if (opts.checkedZero && opts.checkedZero.includes(i)) classes.push('checked-zero');
        return `<div class="bit-cell"><div class="${classes.join(' ')}">${b}</div><div class="bit-index">${i}</div></div>`;
    }).join('');
}

function stopAuto() {
    if (app.interval) clearInterval(app.interval);
    app.interval = null;
}

function render() {
    const panel = document.getElementById('stepPanel');
    const runBtn = document.getElementById('runBtn');
    const stepBtn = document.getElementById('stepBtn');
    const resultBox = document.getElementById('resultBox');

    if (!app.steps.length) {
        renderBitArray();
        panel.innerHTML = '<span class="step-line">Inserisci una parola e premi "Aggiungi elemento" o "Verifica presenza".</span>';
        runBtn.disabled = true;
        stepBtn.disabled = true;
        resultBox.className = 'result-box';
        resultBox.textContent = '';
        return;
    }

    runBtn.disabled = false;

    if (app.current < 0) {
        renderBitArray();
        const verb = app.mode === 'add' ? 'aggiungere' : 'verificare';
        panel.innerHTML = `<span class="step-line">Pronto a ${verb} "${app.word}". Premi "Avvia" o "Passo singolo" per calcolare le posizioni hash passo per passo.</span>`;
        stepBtn.disabled = false;
        resultBox.className = 'result-box';
        resultBox.textContent = '';
        return;
    }

    const step = app.steps[app.current];
    const opts = {};
    if (step.type === 'calc' || step.type === 'check') opts.highlight = step.highlight;
    if (step.type === 'check' && step.bitVal === 0) opts.checkedZero = step.highlight;
    if (step.type === 'apply') {
        step.positions.forEach(p => { bits[p] = 1; });
        opts.justSet = step.positions;
    }
    renderBitArray(opts);

    panel.innerHTML = app.steps.slice(0, app.current + 1).map((s, i) =>
        `<div class="step-line ${i === app.current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
    ).join('');
    panel.scrollTop = panel.scrollHeight;

    stepBtn.disabled = app.current >= app.steps.length - 1;

    if (app.current >= app.steps.length - 1 && !app.applied) applyFinal();
}

function applyFinal() {
    app.applied = true;
    const resultBox = document.getElementById('resultBox');
    if (app.mode === 'add') {
        if (!addedWords.includes(app.word)) addedWords.push(app.word);
        document.getElementById('addedList').textContent = addedWords.join(', ') || '(nessuno)';
        resultBox.className = 'result-box good';
        resultBox.textContent = `✓ "${app.word}" aggiunta al filtro.`;
    } else {
        const lastStep = app.steps[app.steps.length - 1];
        resultBox.className = 'result-box ' + (lastStep.result ? 'good' : 'bad');
        resultBox.textContent = (lastStep.result ? '✓ Probabilmente presente' : '✗ Sicuramente assente') + ` — parola verificata: "${app.word}".`;
    }
}

function prepareOperation(mode, word) {
    stopAuto();
    app.mode = mode;
    app.word = word;
    app.current = -1;
    app.applied = false;
    app.steps = word
        ? (mode === 'add' ? buildAddSteps(word, bits) : buildCheckSteps(word, bits))
        : [];
    render();
}

function advance() {
    if (app.current >= app.steps.length - 1) { stopAuto(); return; }
    app.current++;
    render();
    if (app.current >= app.steps.length - 1) stopAuto();
}

function startAuto() {
    stopAuto();
    if (app.steps.length === 0) return;
    if (app.current >= app.steps.length - 1) { app.current = -1; app.applied = false; }
    render();
    app.interval = setInterval(advance, app.speed);
}

function stepOnce() {
    stopAuto();
    advance();
}

document.getElementById('addBtn').addEventListener('click', () => {
    const word = document.getElementById('wordInput').value.trim();
    if (word) prepareOperation('add', word);
});

document.getElementById('checkBtn').addEventListener('click', () => {
    const word = document.getElementById('wordInput').value.trim();
    if (word) prepareOperation('check', word);
});

document.getElementById('runBtn').addEventListener('click', startAuto);
document.getElementById('stepBtn').addEventListener('click', stepOnce);

document.getElementById('resetBtn').addEventListener('click', () => {
    stopAuto();
    bits = new Array(BIT_ARRAY_SIZE).fill(0);
    addedWords = [];
    document.getElementById('addedList').textContent = '(nessuno)';
    prepareOperation(app.mode || 'check', app.word || document.getElementById('wordInput').value.trim() || 'gatto');
});

document.getElementById('demoSetupBtn').addEventListener('click', () => {
    stopAuto();
    bits = new Array(BIT_ARRAY_SIZE).fill(0);
    addedWords = [];
    ['gatto', 'luna', 'treno'].forEach(w => {
        hashPositions(w).forEach(p => { bits[p] = 1; });
        addedWords.push(w);
    });
    document.getElementById('addedList').textContent = addedWords.join(', ');
    document.getElementById('wordInput').value = 'pane';
    prepareOperation('check', 'pane');
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché usarlo, visto che può sbagliare? ▸'
        : 'Perché usarlo, visto che può sbagliare? ▾';
});

prepareOperation('check', document.getElementById('wordInput').value.trim());
