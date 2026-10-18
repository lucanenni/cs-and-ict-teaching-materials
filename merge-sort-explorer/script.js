// -----------------------------------------------------------------------
// Logica pura del merge sort (nessun riferimento al DOM): costruisce
// l'intero albero di divisione e l'intera sequenza di passi di unione in
// anticipo, come negli altri visualizzatori della raccolta. L'interfaccia
// si limita a "riprodurre" questa lista di fotogrammi (frames), ognuno con
// una fotografia completa dello stato di ogni nodo dell'albero.
// -----------------------------------------------------------------------

// Generatore pseudo-casuale con seed fisso (mulberry32): a differenza di
// Math.random(), partendo dallo stesso seed produce sempre la stessa
// sequenza di numeri. Lo usiamo una volta per sessione e ogni click su
// "Nuovo array casuale" pesca semplicemente il prossimo blocco di numeri
// dalla stessa sequenza deterministica, così un test automatico che clicca
// lo stesso numero di volte vede sempre gli stessi array.
function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function makeRandomArray(rng, length, min, max) {
    const out = [];
    for (let i = 0; i < length; i++) {
        out.push(min + Math.floor(rng() * (max - min + 1)));
    }
    return out;
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Costruisce l'intero albero di divisione (fase 1, in ampiezza, livello per
// livello) e poi l'intera sequenza di unioni (fase 2, dal basso verso la
// radice), registrando un fotogramma per ogni passo elementare:
// - una divisione di un nodo in due metà;
// - il riconoscimento di un sotto-array di un solo elemento (già ordinato);
// - un singolo confronto durante un'unione;
// - la copia del resto di un lato quando l'altro si esaurisce;
// - il completamento di un'unione.
//
// Ogni fotogramma porta anche uno "snapshot" completo di come va mostrato
// ogni nodo dell'albero in quel preciso istante, così il renderer non deve
// ricalcolare nulla: legge semplicemente lo snapshot del fotogramma corrente.
function buildMergeSortTrace(inputArray) {
    let idCounter = 0;
    const nodes = {};
    const creationOrder = [];

    const root = { id: idCounter++, parentId: null, leftId: null, rightId: null, array: inputArray.slice(), isLeaf: inputArray.length <= 1, sorted: null };
    nodes[root.id] = root;
    creationOrder.push(root.id);

    // display[id] = come va mostrato il nodo "a regime" (prima che un
    // fotogramma lo marchi "current", che viene aggiunto solo nella copia
    // usata per quello specifico fotogramma, non nello stato persistente).
    const display = {};
    display[root.id] = { revealed: true, resolved: false, content: root.array.slice(), leftRemaining: null, rightRemaining: null, resultSoFar: null };

    const frames = [];
    let comparisons = 0;

    function pushFrame(nodeId, text, extra) {
        const snap = deepClone(display);
        if (snap[nodeId]) snap[nodeId].current = true;
        frames.push(Object.assign({ nodeId, text, comparisons, snapshot: snap }, extra || {}));
    }

    const initialSnapshot = deepClone(display);

    // ---- Fase 1: divisione, livello per livello (ampiezza) ----
    const queue = [root.id];
    while (queue.length > 0) {
        const id = queue.shift();
        const node = nodes[id];
        if (node.array.length <= 1) {
            node.isLeaf = true;
            node.sorted = node.array.slice();
            display[id].resolved = true;
            display[id].content = node.sorted.slice();
            pushFrame(id, node.array.length === 1
                ? `[${node.array[0]}] è un sotto-array di un solo elemento: è già ordinato, non c'è nulla da fare.`
                : 'Sotto-array vuoto.', { type: 'leaf', phase: 'divide' });
            continue;
        }
        const mid = Math.floor(node.array.length / 2);
        const leftArr = node.array.slice(0, mid);
        const rightArr = node.array.slice(mid);
        const leftNode = { id: idCounter++, parentId: id, leftId: null, rightId: null, array: leftArr, isLeaf: leftArr.length <= 1, sorted: null };
        const rightNode = { id: idCounter++, parentId: id, leftId: null, rightId: null, array: rightArr, isLeaf: rightArr.length <= 1, sorted: null };
        nodes[leftNode.id] = leftNode;
        nodes[rightNode.id] = rightNode;
        creationOrder.push(leftNode.id, rightNode.id);
        node.leftId = leftNode.id;
        node.rightId = rightNode.id;

        display[leftNode.id] = { revealed: true, resolved: false, content: leftArr.slice(), leftRemaining: null, rightRemaining: null, resultSoFar: null };
        display[rightNode.id] = { revealed: true, resolved: false, content: rightArr.slice(), leftRemaining: null, rightRemaining: null, resultSoFar: null };

        pushFrame(id, `[${node.array.join(', ')}] si divide in [${leftArr.join(', ')}] e [${rightArr.join(', ')}].`, { type: 'split', phase: 'divide', leftId: leftNode.id, rightId: rightNode.id });
        queue.push(leftNode.id, rightNode.id);
    }

    // ---- Fase 2: unione, dal basso verso la radice (ordine inverso di creazione) ----
    for (let i = creationOrder.length - 1; i >= 0; i--) {
        const node = nodes[creationOrder[i]];
        if (node.isLeaf) continue;
        const left = nodes[node.leftId];
        const right = nodes[node.rightId];
        const L = left.sorted;
        const R = right.sorted;
        let a = 0, b = 0;
        const result = [];

        while (a < L.length && b < R.length) {
            comparisons++;
            const takeLeft = L[a] <= R[b];
            const chosenVal = takeLeft ? L[a] : R[b];
            display[node.id].leftRemaining = L.slice(a);
            display[node.id].rightRemaining = R.slice(b);
            display[node.id].resultSoFar = result.slice();
            pushFrame(node.id,
                `Confronto tra ${L[a]} (sinistra) e ${R[b]} (destra): ${chosenVal} è il più piccolo, passa nell'array unito.`,
                { type: 'compare', phase: 'merge', leftVal: L[a], rightVal: R[b], chosen: takeLeft ? 'left' : 'right' });
            if (takeLeft) { result.push(L[a]); a++; } else { result.push(R[b]); b++; }
        }
        if (a < L.length) {
            const rest = L.slice(a);
            result.push(...rest);
            display[node.id].leftRemaining = [];
            display[node.id].rightRemaining = [];
            display[node.id].resultSoFar = result.slice();
            pushFrame(node.id, `Il sotto-array di destra è esaurito: si copia direttamente il resto della sinistra (${rest.join(', ')}).`, { type: 'copy-rest', phase: 'merge', side: 'left', rest });
        } else if (b < R.length) {
            const rest = R.slice(b);
            result.push(...rest);
            display[node.id].leftRemaining = [];
            display[node.id].rightRemaining = [];
            display[node.id].resultSoFar = result.slice();
            pushFrame(node.id, `Il sotto-array di sinistra è esaurito: si copia direttamente il resto della destra (${rest.join(', ')}).`, { type: 'copy-rest', phase: 'merge', side: 'right', rest });
        }

        node.sorted = result;
        display[node.id].resolved = true;
        display[node.id].content = result.slice();
        display[node.id].leftRemaining = null;
        display[node.id].rightRemaining = null;
        display[node.id].resultSoFar = null;
        pushFrame(node.id, `Unione completata: [${result.join(', ')}].`, { type: 'done', phase: 'merge', result: result.slice() });
    }

    return {
        nodes,
        rootId: root.id,
        frames,
        initialSnapshot,
        totalComparisons: comparisons,
        sortedArray: nodes[root.id].sorted
    };
}

// -----------------------------------------------------------------------
// Interfaccia
// -----------------------------------------------------------------------

if (typeof document !== 'undefined') {

    const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10];
    const RNG_SEED = 20261017; // seed fisso: la sequenza è sempre la stessa
    const rng = mulberry32(RNG_SEED);

    let state = {
        array: DEFAULT_ARRAY.slice(),
        trace: null,
        current: -1,
        isPlaying: false,
        interval: null,
        speed: 900,
        nodeEls: {}
    };

    function buildAndRender() {
        stopPlaying();
        state.trace = buildMergeSortTrace(state.array);
        state.current = -1;
        state.nodeEls = {};

        const treeRoot = document.getElementById('treeRoot');
        treeRoot.innerHTML = '';
        treeRoot.appendChild(buildDom(state.trace.rootId));

        document.getElementById('arrayCaption').textContent = `Array di partenza: [${state.array.join(', ')}]`;

        renderFrame();
    }

    function buildDom(nodeId) {
        const node = state.trace.nodes[nodeId];
        const li = document.createElement('li');
        const box = document.createElement('div');
        box.className = 'node-box';
        const arr = document.createElement('div');
        arr.className = 'node-array';
        box.appendChild(arr);
        li.appendChild(box);
        state.nodeEls[nodeId] = { box, arr };
        if (node.leftId != null) {
            const ul = document.createElement('ul');
            ul.appendChild(buildDom(node.leftId));
            ul.appendChild(buildDom(node.rightId));
            li.appendChild(ul);
        }
        return li;
    }

    function chip(value, extraClass) {
        return `<span class="chip${extraClass ? ' ' + extraClass : ''}">${value}</span>`;
    }

    function renderNodeContent(d) {
        if (!d.revealed) {
            return '<span class="chip-placeholder">in attesa…</span>';
        }
        if (d.leftRemaining || d.rightRemaining || d.resultSoFar) {
            const leftRow = d.leftRemaining.map((v, i) => chip(v, i === 0 ? 'compare-chip' : '')).join('') || '<span class="chip-placeholder">—</span>';
            const rightRow = d.rightRemaining.map((v, i) => chip(v, i === 0 ? 'compare-chip' : '')).join('') || '<span class="chip-placeholder">—</span>';
            const resultRow = d.resultSoFar.map(v => chip(v, 'result-chip')).join('') || '<span class="chip-placeholder">—</span>';
            return `
                <div class="merge-row"><span class="merge-row-label">Sx</span>${leftRow}</div>
                <div class="merge-row"><span class="merge-row-label">Dx</span>${rightRow}</div>
                <div class="merge-row"><span class="merge-row-label">→</span>${resultRow}</div>
            `;
        }
        return (d.content || []).map(v => chip(v)).join('');
    }

    function renderFrame() {
        const frame = state.current >= 0 ? state.trace.frames[state.current] : null;
        const snap = frame ? frame.snapshot : state.trace.initialSnapshot;

        Object.entries(snap).forEach(([id, d]) => {
            const els = state.nodeEls[id];
            if (!els) return;
            els.box.classList.remove('pending', 'revealed', 'current', 'done', 'merging');
            if (!d.revealed) {
                els.box.classList.add('pending');
            } else {
                els.box.classList.add(d.resolved ? 'done' : 'revealed');
                if (d.leftRemaining || d.rightRemaining || d.resultSoFar) els.box.classList.add('merging');
            }
            if (d.current) els.box.classList.add('current');
            els.arr.innerHTML = renderNodeContent(d);
        });

        const panel = document.getElementById('stepPanel');
        if (!frame) {
            panel.innerHTML = '<div class="step-line current">Premi "Avvia" o "Passo singolo" per iniziare: prima la divisione, poi l\'unione.</div>';
        } else {
            const start = Math.max(0, state.current - 5);
            panel.innerHTML = state.trace.frames.slice(start, state.current + 1).map((f, i) => {
                const realIndex = start + i;
                const tag = f.phase === 'divide' ? '✂️ Divisione' : '🔀 Unione';
                return `<div class="step-line ${realIndex === state.current ? 'current' : ''}">${realIndex + 1}. [${tag}] ${f.text}</div>`;
            }).join('');
            panel.scrollTop = panel.scrollHeight;
        }

        const comparisons = frame ? frame.comparisons : 0;
        document.getElementById('comparisonsCount').textContent = comparisons;
        const atEnd = state.current >= state.trace.frames.length - 1;
        document.getElementById('stepCounter').textContent = frame
            ? `Passo ${state.current + 1} / ${state.trace.frames.length}`
            : `Pronto · ${state.trace.frames.length} passi totali`;

        const resultBox = document.getElementById('resultBox');
        if (atEnd) {
            resultBox.classList.remove('hidden');
            resultBox.classList.add('good');
            resultBox.textContent = `✓ Ordinamento completato in ${comparisons} confronti: [${state.trace.sortedArray.join(', ')}]`;
        } else {
            resultBox.classList.add('hidden');
        }

        document.getElementById('stepBtn').disabled = atEnd;
        document.getElementById('playBtn').textContent = state.isPlaying ? '⏸ Pausa' : (atEnd ? '↻ Riavvia' : '▶ Avvia');
    }

    function advance() {
        if (state.current >= state.trace.frames.length - 1) {
            stopPlaying();
            return;
        }
        state.current++;
        renderFrame();
    }

    function startPlaying() {
        if (state.current >= state.trace.frames.length - 1) state.current = -1;
        stopPlaying();
        state.isPlaying = true;
        renderFrame();
        state.interval = setInterval(() => {
            advance();
            if (state.current >= state.trace.frames.length - 1) stopPlaying();
        }, state.speed);
    }

    function stopPlaying() {
        if (state.interval) clearInterval(state.interval);
        state.interval = null;
        state.isPlaying = false;
    }

    document.getElementById('playBtn').addEventListener('click', () => {
        if (state.isPlaying) {
            stopPlaying();
            renderFrame();
        } else {
            startPlaying();
        }
    });
    document.getElementById('stepBtn').addEventListener('click', () => {
        stopPlaying();
        advance();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        state.current = -1;
        stopPlaying();
        renderFrame();
    });
    document.getElementById('randomBtn').addEventListener('click', () => {
        state.array = makeRandomArray(rng, 7 + Math.floor(rng() * 3), 1, 99);
        buildAndRender();
    });
    document.getElementById('defaultBtn').addEventListener('click', () => {
        state.array = DEFAULT_ARRAY.slice();
        buildAndRender();
    });

    document.getElementById('deepDiveBtn').addEventListener('click', () => {
        const panel = document.getElementById('deepDivePanel');
        const isHidden = panel.classList.toggle('hidden');
        const btn = document.getElementById('deepDiveBtn');
        btn.setAttribute('aria-expanded', String(!isHidden));
        btn.textContent = isHidden
            ? 'Perché "dividi e unisci" batte il confronto di ogni coppia? ▸'
            : 'Perché "dividi e unisci" batte il confronto di ogni coppia? ▾';
    });

    // Inizializzazione: l'array di default è pronto e "Passo singolo"
    // funziona subito, senza bisogno di premere "Avvia" prima.
    buildAndRender();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mulberry32, makeRandomArray, buildMergeSortTrace };
}
