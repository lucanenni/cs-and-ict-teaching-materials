let nodeIdCounter = 0;

function buildFrequencies(text) {
    const freq = {};
    for (const ch of text) freq[ch] = (freq[ch] || 0) + 1;
    return freq;
}

function buildHuffmanSteps(freq) {
    nodeIdCounter = 0;
    const initialLeaves = Object.entries(freq).map(([ch, f]) => ({ id: nodeIdCounter++, char: ch, freq: f, left: null, right: null }));
    let queue = [...initialLeaves];
    queue.sort((a, b) => a.freq - b.freq || a.id - b.id);
    const steps = [];

    if (queue.length === 1) {
        const only = queue[0];
        const root = { id: nodeIdCounter++, char: null, freq: only.freq, left: only, right: null };
        steps.push({ a: only, b: null, parent: root, queueAfter: [root] });
        return { steps, root, initialLeaves };
    }

    while (queue.length > 1) {
        queue.sort((a, b) => a.freq - b.freq || a.id - b.id);
        const a = queue.shift();
        const b = queue.shift();
        const parent = { id: nodeIdCounter++, char: null, freq: a.freq + b.freq, left: a, right: b };
        queue.push(parent);
        const queueAfter = [...queue].sort((x, y) => x.freq - y.freq || x.id - y.id);
        steps.push({ a, b, parent, queueAfter });
    }
    return { steps, root: queue[0], initialLeaves };
}

function assignCodes(root) {
    const codes = {};
    function walk(node, path) {
        if (!node) return;
        if (node.char !== null) {
            codes[node.char] = path.length ? path : '0';
            return;
        }
        walk(node.left, path + '0');
        walk(node.right, path + '1');
    }
    walk(root, '');
    return codes;
}

function displayChar(ch) {
    return ch === ' ' ? '␣' : ch;
}

let state = {
    text: '',
    freq: {},
    steps: [],
    root: null,
    initialLeaves: [],
    current: -1,
    isPlaying: false,
    interval: null,
    speed: 900,
    codes: {}
};

function renderFreq() {
    const box = document.getElementById('freqBox');
    box.innerHTML = '';
    const entries = Object.entries(state.freq).sort((a, b) => b[1] - a[1]);
    entries.forEach(([ch, f]) => {
        const chip = document.createElement('span');
        chip.className = 'freq-chip';
        chip.textContent = `"${displayChar(ch)}": ${f}`;
        box.appendChild(chip);
    });
}

function nodeBox(node, extraClass) {
    const box = document.createElement('div');
    box.className = 'node-box' + (node.char !== null ? ' leaf' : '') + (extraClass ? ' ' + extraClass : '');
    const charEl = document.createElement('span');
    charEl.className = 'node-char';
    charEl.textContent = node.char !== null ? `"${displayChar(node.char)}"` : '•';
    const freqEl = document.createElement('span');
    freqEl.className = 'node-freq';
    freqEl.textContent = node.freq;
    box.appendChild(charEl);
    box.appendChild(freqEl);
    return box;
}

function buildTreeDom(node, edgeSide) {
    const li = document.createElement('li');
    if (edgeSide) {
        const label = document.createElement('span');
        label.className = 'edge-label ' + edgeSide;
        label.textContent = edgeSide === 'left' ? '0' : '1';
        li.appendChild(label);
    }
    li.appendChild(nodeBox(node));
    if (node.left || node.right) {
        const ul = document.createElement('ul');
        if (node.left) ul.appendChild(buildTreeDom(node.left, 'left'));
        if (node.right) ul.appendChild(buildTreeDom(node.right, 'right'));
        li.appendChild(ul);
    }
    return li;
}

function currentForest() {
    if (state.current === -1) return [...state.initialLeaves].sort((a, b) => a.freq - b.freq || a.id - b.id);
    return state.steps[state.current].queueAfter;
}

function renderQueueAndForest() {
    const forest = currentForest();

    const queueRow = document.getElementById('queueRow');
    queueRow.innerHTML = '';
    forest.forEach(node => {
        const chip = document.createElement('span');
        chip.className = 'queue-chip';
        chip.textContent = node.char !== null ? `"${displayChar(node.char)}": ${node.freq}` : `•: ${node.freq}`;
        queueRow.appendChild(chip);
    });

    const forestRow = document.getElementById('forestRow');
    forestRow.innerHTML = '';
    forest.forEach(node => {
        const ul = document.createElement('ul');
        ul.className = 'tree';
        ul.appendChild(buildTreeDom(node, null));
        forestRow.appendChild(ul);
    });
}

function updateCaption() {
    const caption = document.getElementById('stepCaption');
    if (state.current === -1) {
        caption.textContent = `${state.initialLeaves.length} caratteri diversi da unire. Premi "Costruisci l'albero" o "Passo singolo" per iniziare.`;
        return;
    }
    const step = state.steps[state.current];
    if (state.current === state.steps.length - 1) {
        caption.textContent = step.b
            ? `Ultima unione: "${displayChar(step.a.char || '•')}"(${step.a.freq}) + nodo(${step.b.freq}) → radice con frequenza ${step.parent.freq}. Albero completo!`
            : `Un solo carattere: la radice ha frequenza ${step.parent.freq}. Albero completo!`;
    } else {
        const aLabel = step.a.char !== null ? `"${displayChar(step.a.char)}"(${step.a.freq})` : `nodo(${step.a.freq})`;
        const bLabel = step.b.char !== null ? `"${displayChar(step.b.char)}"(${step.b.freq})` : `nodo(${step.b.freq})`;
        caption.textContent = `Unisco i due nodi meno frequenti: ${aLabel} e ${bLabel} → nuovo nodo con frequenza ${step.parent.freq}.`;
    }
}

function updateControls() {
    const atEnd = state.current >= state.steps.length - 1;
    const playBtn = document.getElementById('playPauseBtn');
    if (state.isPlaying) playBtn.textContent = '⏸ Pausa';
    else if (atEnd) playBtn.textContent = '↻ Riavvia';
    else playBtn.textContent = "▶ Costruisci l'albero";
    document.getElementById('stepBtn').disabled = atEnd;

    if (atEnd) showResults();
    else document.getElementById('codeSection').classList.add('hidden');
}

function showResults() {
    const section = document.getElementById('codeSection');
    section.classList.remove('hidden');

    const table = document.getElementById('codeTable');
    const entries = Object.entries(state.codes).sort((a, b) => a[1].length - b[1].length);
    let html = '<tr><th>Carattere</th><th>Frequenza</th><th>Codice</th><th>Bit</th></tr>';
    entries.forEach(([ch, code]) => {
        html += `<tr><td>"${displayChar(ch)}"</td><td>${state.freq[ch]}</td><td>${code}</td><td>${code.length}</td></tr>`;
    });
    table.innerHTML = html;

    const encodedBox = document.getElementById('encodedBox');
    encodedBox.innerHTML = [...state.text].map(ch => `<span class="char-group">${state.codes[ch]}</span>`).join(' ');

    const totalBits = [...state.text].reduce((sum, ch) => sum + state.codes[ch].length, 0);
    const baselineBits = state.text.length * 8;
    const savedPct = Math.round((1 - totalBits / baselineBits) * 100);
    document.getElementById('totalsPanel').innerHTML =
        `${state.text.length} caratteri → ${totalBits} bit con Huffman, invece di ${baselineBits} bit a 8 bit fissi per carattere` +
        `<span class="totals-note">${savedPct > 0
            ? `Risparmio del ${savedPct}% — e nessuna informazione persa: si può decodificare esattamente al testo originale.`
            : `Con un testo così corto o con caratteri equamente frequenti, Huffman non guadagna molto (o nulla) rispetto a una larghezza fissa: il vantaggio cresce con testi più lunghi e frequenze più sbilanciate.`
        }</span>`;
}

function setup() {
    state.text = document.getElementById('textInput').value || ' ';
    state.freq = buildFrequencies(state.text);
    const { steps, root, initialLeaves } = buildHuffmanSteps(state.freq);
    state.steps = steps;
    state.root = root;
    state.initialLeaves = initialLeaves;
    state.current = -1;
    state.codes = assignCodes(root);

    renderFreq();
    renderQueueAndForest();
    updateCaption();
    updateControls();
    stopPlaying();
}

function advance() {
    if (state.current >= state.steps.length - 1) {
        stopPlaying();
        return;
    }
    state.current++;
    renderQueueAndForest();
    updateCaption();
    updateControls();
}

function startPlaying() {
    if (state.current >= state.steps.length - 1) state.current = -1;
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    renderQueueAndForest();
    updateCaption();
    updateControls();
    state.interval = setInterval(() => {
        advance();
        if (state.current >= state.steps.length - 1) stopPlaying();
    }, state.speed);
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
    updateControls();
}

function playPause() {
    if (state.isPlaying) stopPlaying();
    else startPlaying();
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    advance();
});
document.getElementById('resetBtn').addEventListener('click', setup);

document.getElementById('textInput').addEventListener('input', setup);
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.getElementById('textInput').value = chip.dataset.text;
        setup();
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché nessun codice è "prefisso" di un altro? ▸'
        : 'Perché nessun codice è "prefisso" di un altro? ▾';
});

// Inizializzazione
setup();
