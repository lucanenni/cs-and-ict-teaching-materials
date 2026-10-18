// --- Ricorsione ingenua vs memoization: Fibonacci e Zaino 0/1 --------------
// La logica pura di costruzione degli alberi (buildFibNaive, buildFibMemo,
// buildKnapsackNaive, buildKnapsackMemo) è stata verificata separatamente in
// Node: fib(8) naive produce 67 chiamate e il risultato corretto 21, la
// versione con memoization produce lo stesso risultato con solo 9 chiamate
// reali; fib(6) richiama fib(3) esattamente 3 volte nell'albero ingenuo; lo
// zaino 0/1 è stato verificato contro un algoritmo indipendente a forza bruta
// (enumerazione di tutti i sottoinsiemi) su più istanze, con la versione
// memoized sempre più rapida di quella ingenua. Qui la stessa logica viene
// riusata tale e quale, solo con l'aggiunta di campi `label`/`key` per la
// visualizzazione e di una funzione che genera i fotogrammi dell'animazione.

const KNAPSACK_ITEMS = [
    { name: 'Oro', weight: 3, value: 10 },
    { name: 'Libro', weight: 2, value: 4 },
    { name: 'Radio', weight: 4, value: 7 },
    { name: 'Acqua', weight: 1, value: 2 },
    { name: 'Torcia', weight: 2, value: 3 }
];
const KNAPSACK_CAPACITY = 7;

function buildFibNaive(n) {
    let idCounter = 0;
    let totalCalls = 0;
    const callCounts = {};

    function countCalls(n) {
        totalCalls++;
        callCounts[n] = (callCounts[n] || 0) + 1;
        if (n > 1) { countCalls(n - 1); countCalls(n - 2); }
    }
    countCalls(n);

    function build(n) {
        const id = idCounter++;
        const node = { id, key: 'n=' + n, label: `fib(${n})`, children: [], totalRepeats: callCounts[n] };
        if (n <= 1) {
            node.value = n;
        } else {
            const left = build(n - 1);
            const right = build(n - 2);
            node.children = [left, right];
            node.value = left.value + right.value;
        }
        return node;
    }
    const tree = build(n);
    return { tree, totalCalls, result: tree.value };
}

function buildFibMemo(n) {
    let idCounter = 0;
    let totalCalls = 0;
    const memo = {};

    function build(n) {
        const id = idCounter++;
        const key = 'n=' + n;
        if (memo[n] !== undefined) {
            return { id, key, label: `fib(${n})`, children: [], value: memo[n], cached: true };
        }
        totalCalls++;
        let node;
        if (n <= 1) {
            node = { id, key, label: `fib(${n})`, children: [], value: n, cached: false };
        } else {
            const left = build(n - 1);
            const right = build(n - 2);
            node = { id, key, label: `fib(${n})`, children: [left, right], value: left.value + right.value, cached: false };
        }
        memo[n] = node.value;
        return node;
    }
    const tree = build(n);
    return { tree, totalCalls, result: tree.value };
}

function buildKnapsackNaive(items, capacity) {
    let idCounter = 0;
    let totalCalls = 0;
    const callCounts = {};
    const key = (i, c) => i + '|' + c;

    function countCalls(i, c) {
        totalCalls++;
        const k = key(i, c);
        callCounts[k] = (callCounts[k] || 0) + 1;
        if (i < items.length) {
            countCalls(i + 1, c);
            if (items[i].weight <= c) countCalls(i + 1, c - items[i].weight);
        }
    }
    countCalls(0, capacity);

    function build(i, c) {
        const id = idCounter++;
        const k = key(i, c);
        const node = { id, key: k, label: `resto(${i},${c})`, i, c, children: [], totalRepeats: callCounts[k] };
        if (i >= items.length) {
            node.value = 0;
            return node;
        }
        const skip = build(i + 1, c);
        let take = null;
        if (items[i].weight <= c) take = build(i + 1, c - items[i].weight);
        const skipVal = skip.value;
        const takeVal = take ? take.value + items[i].value : -Infinity;
        node.children = take ? [skip, take] : [skip];
        node.value = Math.max(skipVal, takeVal);
        node.chosen = take && takeVal >= skipVal ? 'take' : 'skip';
        return node;
    }
    const tree = build(0, capacity);
    return { tree, totalCalls, result: tree.value };
}

function buildKnapsackMemo(items, capacity) {
    let idCounter = 0;
    let totalCalls = 0;
    const memo = {};
    const key = (i, c) => i + '|' + c;

    function build(i, c) {
        const id = idCounter++;
        const k = key(i, c);
        if (memo[k] !== undefined) {
            return { id, key: k, label: `resto(${i},${c})`, i, c, children: [], value: memo[k], cached: true };
        }
        totalCalls++;
        let node;
        if (i >= items.length) {
            node = { id, key: k, label: `resto(${i},${c})`, i, c, children: [], value: 0, cached: false };
        } else {
            const skip = build(i + 1, c);
            let take = null;
            if (items[i].weight <= c) take = build(i + 1, c - items[i].weight);
            const skipVal = skip.value;
            const takeVal = take ? take.value + items[i].value : -Infinity;
            const chosen = take && takeVal >= skipVal ? 'take' : 'skip';
            node = { id, key: k, label: `resto(${i},${c})`, i, c, children: take ? [skip, take] : [skip], value: Math.max(skipVal, takeVal), cached: false, chosen };
        }
        memo[k] = node.value;
        return node;
    }
    const tree = build(0, capacity);
    return { tree, totalCalls, result: tree.value };
}

// --- Generazione dei fotogrammi (stessa idea di recursion-tree-visualizer:
// un fotogramma per "chiamata" e uno per "ritorno", con un'istantanea dello
// stato di ogni nodo) ---------------------------------------------------

function generateFrames(root, problem) {
    const frames = [];
    const status = {};

    function markPending(node) { status[node.id] = 'pending'; node.children.forEach(markPending); }
    markPending(root);

    function describeReturn(node) {
        if (node.children.length === 0) {
            return problem === 'fib'
                ? `${node.label} = ${node.value} — caso base.`
                : `${node.label} = 0 — nessun oggetto rimasto da valutare.`;
        }
        if (problem === 'fib') {
            const [a, b] = node.children;
            return `${node.label} = ${a.label} + ${b.label} = ${a.value} + ${b.value} = ${node.value}`;
        }
        const item = KNAPSACK_ITEMS[node.i];
        if (node.children.length === 1) {
            return `${node.label} = ${node.children[0].label} (oggetto "${item.name}" troppo pesante per lo spazio residuo) = ${node.value}`;
        }
        const [skip, take] = node.children;
        const verdict = node.chosen === 'take' ? `PRENDE "${item.name}"` : `SCARTA "${item.name}"`;
        return `${node.label}: meglio ${verdict} → valore ${node.value} (scartarlo: ${skip.value}, prenderlo: ${take.value + item.value})`;
    }

    function visit(node) {
        status[node.id] = 'active';
        frames.push({ event: 'call', nodeId: node.id, key: node.key, status: { ...status }, text: `Chiamata: ${node.label}` });

        if (node.cached) {
            status[node.id] = 'cached';
            frames.push({ event: 'hit', nodeId: node.id, key: node.key, status: { ...status }, text: `${node.label}: già calcolato prima → lettura dalla tabella (valore ${node.value}), nessuna nuova chiamata.` });
            return;
        }

        node.children.forEach(visit);
        status[node.id] = 'returned';
        frames.push({ event: 'return', nodeId: node.id, key: node.key, value: node.value, status: { ...status }, text: describeReturn(node) });
    }
    visit(root);
    return frames;
}

// --- Stato e interfaccia -------------------------------------------------

const state = {
    problem: 'fib',
    n: 8,
    naive: { root: null, frames: [], nodeEls: {} },
    memo: { root: null, frames: [], nodeEls: {}, tableRows: {} },
    step: -1,
    maxStep: 0,
    playing: false,
    interval: null,
    speed: 350
};

function buildCurrentTrees() {
    if (state.problem === 'fib') {
        const naiveB = buildFibNaive(state.n);
        const memoB = buildFibMemo(state.n);
        state.naive.root = naiveB.tree;
        state.memo.root = memoB.tree;
    } else {
        const naiveB = buildKnapsackNaive(KNAPSACK_ITEMS, KNAPSACK_CAPACITY);
        const memoB = buildKnapsackMemo(KNAPSACK_ITEMS, KNAPSACK_CAPACITY);
        state.naive.root = naiveB.tree;
        state.memo.root = memoB.tree;
    }
    state.naive.frames = generateFrames(state.naive.root, state.problem);
    state.memo.frames = generateFrames(state.memo.root, state.problem);
    state.maxStep = Math.max(state.naive.frames.length, state.memo.frames.length) - 1;
    state.step = -1;
}

function findNode(root, id) {
    if (root.id === id) return root;
    for (const c of root.children) {
        const f = findNode(c, id);
        if (f) return f;
    }
    return null;
}

function buildDom(node, nodeEls) {
    const li = document.createElement('li');
    const box = document.createElement('div');
    box.className = 'dp-node';

    if (node.totalRepeats && node.totalRepeats > 1) {
        const badge = document.createElement('span');
        badge.className = 'dup-badge';
        badge.textContent = '×' + node.totalRepeats;
        badge.title = `Questo identico sottoproblema (${node.label}) viene calcolato ${node.totalRepeats} volte in totale in questo albero`;
        box.appendChild(badge);
    }

    const lbl = document.createElement('div');
    lbl.className = 'dp-node-label';
    lbl.textContent = node.label;
    box.appendChild(lbl);

    const val = document.createElement('div');
    val.className = 'dp-node-value';
    box.appendChild(val);

    li.appendChild(box);
    nodeEls[node.id] = { li, box, val };

    if (node.children.length > 0) {
        const ul = document.createElement('ul');
        node.children.forEach(c => ul.appendChild(buildDom(c, nodeEls)));
        li.appendChild(ul);
    }
    return li;
}

function centerScroll(wrap) {
    // Gli alberi ricorsivi possono essere molto più larghi della colonna
    // (specie quello ingenuo): centriamo lo scroll orizzontale così la
    // radice è visibile fin da subito, invece che fuori vista a destra.
    requestAnimationFrame(() => {
        wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2;
    });
}

function renderStaticTrees() {
    state.naive.nodeEls = {};
    state.memo.nodeEls = {};
    const naiveRoot = document.getElementById('naiveTree');
    naiveRoot.innerHTML = '';
    naiveRoot.appendChild(buildDom(state.naive.root, state.naive.nodeEls));
    const memoRoot = document.getElementById('memoTree');
    memoRoot.innerHTML = '';
    memoRoot.appendChild(buildDom(state.memo.root, state.memo.nodeEls));
    centerScroll(naiveRoot.parentElement);
    centerScroll(memoRoot.parentElement);
}

function renderSide(sideKey, upToStep) {
    const side = state[sideKey];
    const frames = side.frames;
    const lastIdx = Math.min(upToStep, frames.length - 1);

    // Reset visuale
    Object.values(side.nodeEls).forEach(({ box, val }) => {
        box.classList.remove('active', 'returned', 'base', 'cached');
        val.textContent = '';
    });

    if (lastIdx < 0) return { callsSoFar: 0, hitsSoFar: 0, lastText: null };

    const frame = frames[lastIdx];
    Object.entries(frame.status).forEach(([id, s]) => {
        const els = side.nodeEls[id];
        if (!els) return;
        if (s === 'active') { els.box.classList.add('active'); }
        else if (s === 'cached') {
            els.box.classList.add('cached');
            const node = findNode(side.root, Number(id));
            els.val.textContent = '= ' + node.value;
        } else if (s === 'returned') {
            els.box.classList.add('returned');
            const node = findNode(side.root, Number(id));
            if (node.children.length === 0) els.box.classList.add('base');
            els.val.textContent = '= ' + node.value;
        }
    });

    const callsSoFar = frames.slice(0, lastIdx + 1).filter(f => f.event === 'call' && !isCachedCall(side, f)).length;
    const hitsSoFar = frames.slice(0, lastIdx + 1).filter(f => f.event === 'hit').length;
    return { callsSoFar, hitsSoFar, lastText: frame.text, frame };
}

// Una chiamata 'call' seguita subito da 'hit' sullo stesso nodo non conta
// come "calcolo reale": per saperlo basta controllare se quel nodo è cached.
function isCachedCall(side, frame) {
    const node = findNode(side.root, frame.nodeId);
    return !!(node && node.cached);
}

function renderMemoTable() {
    const wrap = document.getElementById('memoTable');
    const frames = state.memo.frames.slice(0, state.step + 1);
    const rows = {}; // key -> { label, value }
    let order = [];
    frames.forEach(f => {
        if (f.event === 'return') {
            rows[f.key] = { label: f.key, value: f.value };
            if (!order.includes(f.key)) order.push(f.key);
        }
    });
    // Evidenzia solo la riga appena letta dalla cache nel fotogramma corrente
    // (così il lampeggio corrisponde esattamente al passo mostrato).
    const currentFrame = frames[frames.length - 1];
    const justHitKey = (currentFrame && currentFrame.event === 'hit') ? currentFrame.key : null;

    if (order.length === 0) {
        wrap.innerHTML = '<div class="memo-empty">(ancora vuota)</div>';
        return;
    }
    const rowsHtml = order.map(k => {
        const r = rows[k];
        return `<tr class="${k === justHitKey ? 'memo-row-hit' : ''}"><td>${r.label}</td><td>${r.value}</td></tr>`;
    }).join('');
    wrap.innerHTML = `<table><thead><tr><th>Sottoproblema</th><th>Valore salvato</th></tr></thead><tbody>${rowsHtml}</tbody></table>`;
}

function render() {
    const naiveInfo = renderSide('naive', state.step);
    const memoInfo = renderSide('memo', state.step);
    renderMemoTable();

    document.getElementById('naiveCount').textContent = naiveInfo.callsSoFar;
    document.getElementById('memoCount').textContent = memoInfo.callsSoFar;
    document.getElementById('memoHits').textContent = memoInfo.hitsSoFar;

    const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let captionHtml;
    if (state.step < 0) {
        captionHtml = 'Premi "Avvia" o "Passo singolo" per iniziare a costruire i due alberi delle chiamate.';
    } else {
        const parts = [];
        if (naiveInfo.lastText) parts.push('<strong>Ricorsione ingenua</strong> — ' + escapeHtml(naiveInfo.lastText));
        if (memoInfo.lastText) parts.push('<strong>Memoization</strong> — ' + escapeHtml(memoInfo.lastText));
        captionHtml = parts.join('<br>');
    }
    document.getElementById('stepCaption').innerHTML = captionHtml;

    const atEnd = state.step >= state.maxStep;
    document.getElementById('stepBtn').disabled = atEnd;
    const playBtn = document.getElementById('playPauseBtn');
    if (state.playing) playBtn.textContent = '⏸ Pausa';
    else if (atEnd && state.step >= 0) playBtn.textContent = '↻ Riavvia';
    else playBtn.textContent = '▶ Avvia';
}

function advance() {
    if (state.step >= state.maxStep) { stopPlaying(); return; }
    state.step++;
    render();
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.playing = false;
    render();
}

function startPlaying() {
    if (state.step >= state.maxStep) { rebuildAndRender(); }
    if (state.interval) clearInterval(state.interval);
    state.playing = true;
    render();
    state.interval = setInterval(() => {
        advance();
        if (state.step >= state.maxStep) stopPlaying();
    }, state.speed);
}

function playPause() {
    if (state.playing) stopPlaying();
    else startPlaying();
}

function rebuildAndRender() {
    stopPlaying();
    buildCurrentTrees();
    renderStaticTrees();
    render();
}

function setupKnapsackPanel() {
    const wrap = document.getElementById('knapsackItems');
    const rows = KNAPSACK_ITEMS.map(it => `<tr><td>${it.name}</td><td>${it.weight} kg</td><td>${it.value}</td></tr>`).join('');
    wrap.innerHTML = `
        <strong>Oggetti disponibili (capacità zaino: ${KNAPSACK_CAPACITY} kg):</strong>
        <table>
            <thead><tr><th>Oggetto</th><th>Peso</th><th>Valore</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:0.5rem; color:#6b7280;">Per ogni oggetto si decide: prenderlo o scartarlo (0/1), per massimizzare il valore totale senza superare il peso massimo.</p>
    `;
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });
document.getElementById('resetBtn').addEventListener('click', rebuildAndRender);

document.getElementById('problemSelect').addEventListener('change', (e) => {
    state.problem = e.target.value;
    document.getElementById('fibSettingGroup').classList.toggle('hidden', state.problem !== 'fib');
    document.getElementById('knapsackItems').classList.toggle('hidden', state.problem !== 'knapsack');
    rebuildAndRender();
});

document.getElementById('nSlider').addEventListener('input', (e) => {
    state.n = parseInt(e.target.value, 10);
    document.getElementById('nValue').textContent = state.n;
    rebuildAndRender();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché "pseudo-polinomiale" e non semplicemente "polinomiale"? ▸'
        : 'Perché "pseudo-polinomiale" e non semplicemente "polinomiale"? ▾';
});

// Inizializzazione — costruzione e primo render qui, non solo dentro
// "Avvia", così "Passo singolo" funziona fin da subito.
setupKnapsackPanel();
buildCurrentTrees();
renderStaticTrees();
render();
