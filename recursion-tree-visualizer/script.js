// -----------------------------------------------------------------------
// Costruzione dell'albero delle chiamate ricorsive.
//
// Prima costruiamo l'intero albero (ogni nodo = una chiamata di funzione),
// poi lo "eseguiamo" simulando l'ordine reale con cui una vera ricorsione
// chiama ed esce dalle funzioni (in profondità, da sinistra a destra), e
// registriamo ogni evento di chiamata/ritorno come un fotogramma. La
// riproduzione poi si limita a scorrere questa lista di fotogrammi, come
// negli altri visualizzatori di questa raccolta.
// -----------------------------------------------------------------------

let nodeIdCounter = 0;

function buildFactorialTree(n) {
    const isBase = n <= 1;
    const node = { id: nodeIdCounter++, kind: 'factorial', n, isBase, children: [] };
    if (!isBase) {
        node.children.push(buildFactorialTree(n - 1));
    }
    return node;
}

function buildFibonacciTree(n) {
    const isBase = n <= 1;
    const node = { id: nodeIdCounter++, kind: 'fibonacci', n, isBase, children: [] };
    if (!isBase) {
        node.children.push(buildFibonacciTree(n - 1));
        node.children.push(buildFibonacciTree(n - 2));
    }
    return node;
}

function computeValues(node) {
    if (node.isBase) {
        node.value = node.kind === 'factorial' ? 1 : node.n; // fattoriale(0/1)=1, fibonacci(0/1)=n
        return node.value;
    }
    if (node.kind === 'factorial') {
        node.value = node.n * computeValues(node.children[0]);
    } else {
        node.value = computeValues(node.children[0]) + computeValues(node.children[1]);
    }
    return node.value;
}

// Conta quante volte, nell'intero albero, compare una chiamata con lo
// stesso identico n — per evidenziare quanto la ricorsione ingenua di
// Fibonacci rifà da capo lo stesso lavoro.
function countOccurrences(node, counts) {
    counts[node.n] = (counts[node.n] || 0) + 1;
    node.children.forEach(child => countOccurrences(child, counts));
}

function label(node) {
    return (node.kind === 'factorial' ? 'fattoriale(' : 'fibonacci(') + node.n + ')';
}

function callText(node) {
    return `Chiamata: ${label(node)}`;
}

function returnText(node) {
    if (node.isBase) {
        return `${label(node)} = ${node.value} — caso base, nessun'altra chiamata necessaria.`;
    }
    if (node.kind === 'factorial') {
        const c = node.children[0];
        return `${label(node)} = ${node.n} × ${label(c)} = ${node.n} × ${c.value} = ${node.value}`;
    }
    const [a, b] = node.children;
    return `${label(node)} = ${label(a)} + ${label(b)} = ${a.value} + ${b.value} = ${node.value}`;
}

function generateFrames(root) {
    const frames = [];
    const status = {};
    const stack = [];

    function markPending(node) {
        status[node.id] = 'pending';
        node.children.forEach(markPending);
    }
    markPending(root);

    function visit(node) {
        status[node.id] = 'active';
        stack.push(label(node));
        frames.push({
            event: 'call', nodeId: node.id,
            status: { ...status }, stack: [...stack], text: callText(node)
        });
        node.children.forEach(visit);
        status[node.id] = 'returned';
        stack.pop();
        frames.push({
            event: 'return', nodeId: node.id,
            status: { ...status }, stack: [...stack], text: returnText(node)
        });
    }
    visit(root);
    return frames;
}

const FUNCTIONS = {
    factorial: {
        build: buildFactorialTree,
        explain: [
            '• <code>fattoriale(n)</code> restituisce 1 se n è 0 o 1 (il <strong>caso base</strong>), altrimenti restituisce n moltiplicato per <code>fattoriale(n-1)</code>.',
            '• Ogni chiamata genera una sola chiamata "figlia": l\'albero è quindi una semplice catena verticale, non ramificata.',
            '• Il risultato si ottiene "srotolando" la catena dal basso verso l\'alto: prima si risolve il caso base, poi ogni chiamata in attesa moltiplica il proprio n per il risultato ricevuto.'
        ]
    },
    fibonacci: {
        build: buildFibonacciTree,
        explain: [
            '• <code>fibonacci(n)</code> restituisce n se n è 0 o 1 (il <strong>caso base</strong>), altrimenti restituisce <code>fibonacci(n-1) + fibonacci(n-2)</code>.',
            '• Ogni chiamata genera <strong>due</strong> chiamate figlie: l\'albero si ramifica, e la stessa chiamata (es. fibonacci(3)) può ripetersi molte volte in punti diversi dell\'albero.',
            '• Guarda il badge arancione: mostra quante volte quella specifica chiamata viene rifatta da zero in tutto l\'albero, anche se il risultato sarebbe sempre lo stesso.'
        ]
    }
};

let state = {
    fn: 'factorial',
    n: 5,
    root: null,
    frames: [],
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 400,
    nodeEls: {},
    occurrences: {}
};

function buildAndRender() {
    nodeIdCounter = 0;
    state.root = FUNCTIONS[state.fn].build(state.n);
    computeValues(state.root);
    state.occurrences = {};
    countOccurrences(state.root, state.occurrences);
    state.frames = generateFrames(state.root);
    state.current = 0;
    state.nodeEls = {};

    const treeRoot = document.getElementById('treeRoot');
    treeRoot.innerHTML = '';
    treeRoot.appendChild(buildDom(state.root));

    renderFrame();
}

function buildDom(node) {
    const li = document.createElement('li');

    const box = document.createElement('div');
    box.className = 'node-box';

    const dupCount = state.occurrences[node.n] || 1;
    if (node.kind === 'fibonacci' && dupCount > 1) {
        const badge = document.createElement('span');
        badge.className = 'dup-badge';
        badge.textContent = '×' + dupCount;
        badge.title = `fibonacci(${node.n}) viene chiamata ${dupCount} volte in totale in questo albero`;
        box.appendChild(badge);
    }

    const lbl = document.createElement('div');
    lbl.className = 'node-label';
    lbl.textContent = label(node);
    box.appendChild(lbl);

    const val = document.createElement('div');
    val.className = 'node-value';
    box.appendChild(val);

    li.appendChild(box);
    state.nodeEls[node.id] = { li, box, val };

    if (node.children.length > 0) {
        const ul = document.createElement('ul');
        node.children.forEach(child => ul.appendChild(buildDom(child)));
        li.appendChild(ul);
    }

    return li;
}

function renderFrame() {
    const frame = state.frames[state.current];

    Object.entries(frame.status).forEach(([id, s]) => {
        const els = state.nodeEls[id];
        if (!els) return;
        els.box.classList.remove('active', 'returned', 'base', 'current');
        if (s === 'active') {
            els.box.classList.add('active');
            els.val.textContent = '';
        } else if (s === 'returned') {
            els.box.classList.add('returned');
            const node = findNode(state.root, Number(id));
            if (node.isBase) els.box.classList.add('base');
            els.val.textContent = '= ' + node.value;
        } else {
            els.val.textContent = '';
        }
    });
    const currentEls = state.nodeEls[frame.nodeId];
    if (currentEls) currentEls.box.classList.add('current');

    document.getElementById('stepCaption').textContent = frame.text;

    const stackRow = document.getElementById('stackRow');
    if (frame.stack.length === 0) {
        stackRow.innerHTML = '<span class="stack-empty">(vuota)</span>';
    } else {
        stackRow.innerHTML = frame.stack.map(s => `<span class="stack-frame">${s}</span>`).join('<span>→</span>');
    }

    const callsSoFar = state.frames.slice(0, state.current + 1).filter(f => f.event === 'call').length;
    const totalCalls = state.frames.filter(f => f.event === 'call').length;
    let statsHtml = `Passo ${state.current + 1} / ${state.frames.length} · Chiamate finora: <span>${callsSoFar}</span> / ${totalCalls}`;
    if (state.fn === 'fibonacci') {
        statsHtml += ` · Con un ciclo basterebbero circa ${state.n + 1} passi, non ${totalCalls}`;
    }
    if (state.current >= state.frames.length - 1) {
        statsHtml += ' · <span style="color:#16a34a">✓ Calcolo completato!</span>';
    }
    document.getElementById('statsRow').innerHTML = statsHtml;

    const playBtn = document.getElementById('playPauseBtn');
    const atEnd = state.current >= state.frames.length - 1;
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else if (atEnd) {
        playBtn.textContent = '↻ Riavvia';
    } else {
        playBtn.textContent = '▶ Avvia';
    }
    document.getElementById('stepBtn').disabled = atEnd;
}

function findNode(node, id) {
    if (node.id === id) return node;
    for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
    }
    return null;
}

function advance() {
    if (state.current >= state.frames.length - 1) {
        stopPlaying();
        return;
    }
    state.current++;
    renderFrame();
}

function startPlaying() {
    if (state.current >= state.frames.length - 1) {
        state.current = 0;
    }
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    renderFrame();
    state.interval = setInterval(() => {
        advance();
        if (state.current >= state.frames.length - 1) stopPlaying();
    }, state.speed);
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
    renderFrame();
}

function playPause() {
    if (state.isPlaying) {
        stopPlaying();
    } else {
        startPlaying();
    }
}

function resetPlayback() {
    stopPlaying();
    state.current = 0;
    renderFrame();
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    advance();
});
document.getElementById('resetBtn').addEventListener('click', resetPlayback);

document.getElementById('fnSelect').addEventListener('change', (e) => {
    state.fn = e.target.value;
    const slider = document.getElementById('nSlider');
    if (state.fn === 'fibonacci' && state.n < 2) {
        state.n = 2;
        slider.value = 2;
        document.getElementById('nValue').textContent = 2;
    }
    document.getElementById('fnExplainList').innerHTML =
        FUNCTIONS[state.fn].explain.map(li => `<li>${li}</li>`).join('');
    stopPlaying();
    buildAndRender();
});

document.getElementById('nSlider').addEventListener('input', (e) => {
    state.n = parseInt(e.target.value);
    document.getElementById('nValue').textContent = state.n;
    stopPlaying();
    buildAndRender();
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = state.speed + 'ms';
    if (state.isPlaying) startPlaying();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché Fibonacci ricorsivo è così lento? ▸'
        : 'Perché Fibonacci ricorsivo è così lento? ▾';
});

// Inizializzazione
document.getElementById('fnExplainList').innerHTML =
    FUNCTIONS[state.fn].explain.map(li => `<li>${li}</li>`).join('');
buildAndRender();
