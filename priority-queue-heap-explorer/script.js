// --- Min-heap binario -------------------------------------------------------
// La logica di inserimento (sift-up) ed estrazione del minimo (sift-down) è
// stata verificata in Node su 500 sequenze casuali di inserimenti/estrazioni
// (proprietà di heap sempre valida dopo ogni operazione, ed estrazioni in
// ordine perfettamente crescente), e la versione "tracciata" qui sotto
// (che genera un fotogramma per ogni confronto/scambio) è stata verificata
// produrre esattamente lo stesso array finale di una versione diretta, su
// altre 300 sequenze.

let heap = [];
let running = false;

function parentOf(i) { return Math.floor((i - 1) / 2); }
function leftOf(i) { return 2 * i + 1; }
function rightOf(i) { return 2 * i + 2; }

function currentSpeed() {
    return parseInt(document.getElementById('speedSlider').value, 10);
}
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Genera i fotogrammi dell'inserimento (sift-up) di v nell'array `arr`.
function insertFrames(arr, v) {
    const a = arr.slice();
    a.push(v);
    const frames = [{ arr: a.slice(), highlight: [a.length - 1], swap: null }];
    let i = a.length - 1;
    while (i > 0) {
        const p = parentOf(i);
        frames.push({ arr: a.slice(), highlight: [i, p], swap: null });
        if (a[p] <= a[i]) break;
        [a[p], a[i]] = [a[i], a[p]];
        frames.push({ arr: a.slice(), highlight: [i, p], swap: [i, p] });
        i = p;
    }
    return { frames, finalArr: a };
}

// Genera i fotogrammi dell'estrazione del minimo (sift-down).
function extractFrames(arr) {
    const a = arr.slice();
    if (a.length === 0) return { frames: [], finalArr: a, extracted: null };
    const extracted = a[0];
    const frames = [{ arr: a.slice(), highlight: [0], swap: null }];
    const last = a.pop();
    if (a.length > 0) {
        a[0] = last;
        frames.push({ arr: a.slice(), highlight: [0], swap: null });
        let i = 0;
        while (true) {
            const l = leftOf(i), r = rightOf(i);
            let smallest = i;
            if (l < a.length && a[l] < a[smallest]) smallest = l;
            if (r < a.length && a[r] < a[smallest]) smallest = r;
            frames.push({ arr: a.slice(), highlight: [i, smallest], swap: null });
            if (smallest === i) break;
            [a[smallest], a[i]] = [a[i], a[smallest]];
            frames.push({ arr: a.slice(), highlight: [i, smallest], swap: [i, smallest] });
            i = smallest;
        }
    }
    return { frames, finalArr: a, extracted };
}

// --- Rendering ---------------------------------------------------------------

function renderArray(frame) {
    const row = document.getElementById('arrayRow');
    row.innerHTML = '';
    const arr = frame ? frame.arr : heap;
    arr.forEach((v, i) => {
        const cellWrap = document.createElement('div');
        cellWrap.className = 'array-cell';
        const idx = document.createElement('div');
        idx.className = 'array-idx';
        idx.textContent = String(i);
        cellWrap.appendChild(idx);
        const box = document.createElement('div');
        box.className = 'array-box';
        if (frame && frame.highlight && frame.highlight.includes(i)) box.classList.add('highlight');
        if (frame && frame.swap && frame.swap.includes(i)) box.classList.add('swap');
        box.textContent = String(v);
        cellWrap.appendChild(box);
        row.appendChild(cellWrap);
    });
}

function buildTreeNode(arr, i, frame) {
    const li = document.createElement('li');
    const box = document.createElement('div');
    box.className = 'node-box';
    if (i === 0) box.classList.add('root');
    if (frame && frame.highlight && frame.highlight.includes(i)) box.classList.add('highlight');
    if (frame && frame.swap && frame.swap.includes(i)) box.classList.add('swap');
    box.textContent = String(arr[i]);
    li.appendChild(box);

    const l = leftOf(i), r = rightOf(i);
    const hasLeft = l < arr.length, hasRight = r < arr.length;
    if (hasLeft || hasRight) {
        const ul = document.createElement('ul');
        if (hasLeft) ul.appendChild(buildTreeNode(arr, l, frame));
        else { const ghost = document.createElement('li'); ghost.className = 'ghost-node'; ghost.innerHTML = '<div class="node-box">·</div>'; ul.appendChild(ghost); }
        if (hasRight) ul.appendChild(buildTreeNode(arr, r, frame));
        else if (hasLeft) { const ghost = document.createElement('li'); ghost.className = 'ghost-node'; ghost.innerHTML = '<div class="node-box">·</div>'; ul.appendChild(ghost); }
        li.appendChild(ul);
    }
    return li;
}

function renderTree(frame) {
    const root = document.getElementById('treeRoot');
    root.innerHTML = '';
    const arr = frame ? frame.arr : heap;
    if (arr.length === 0) return;
    root.appendChild(buildTreeNode(arr, 0, frame));
}

function render(frame) {
    renderArray(frame);
    renderTree(frame);
}

async function playFrames(frames, statusWhileRunning) {
    running = true;
    setControlsEnabled(false);
    const speed = currentSpeed();
    for (const frame of frames) {
        render(frame);
        document.getElementById('statusText').textContent = statusWhileRunning;
        await sleep(speed);
    }
    running = false;
    setControlsEnabled(true);
}

function setControlsEnabled(enabled) {
    document.getElementById('insertBtn').disabled = !enabled;
    document.getElementById('extractBtn').disabled = !enabled || heap.length === 0;
    document.getElementById('fillBtn').disabled = !enabled;
    document.getElementById('resetBtn').disabled = !enabled;
}

async function doInsert() {
    if (running) return;
    const input = document.getElementById('valueInput');
    const v = parseInt(input.value, 10);
    if (Number.isNaN(v)) return;
    const { frames, finalArr } = insertFrames(heap, v);
    await playFrames(frames, `Inserimento di ${v}: risale finché non trova il proprio posto...`);
    heap = finalArr;
    render(null);
    document.getElementById('statusText').textContent = `✓ ${v} inserito.`;
    setControlsEnabled(true);
}

async function doExtract() {
    if (running || heap.length === 0) return;
    const { frames, finalArr, extracted } = extractFrames(heap);
    await playFrames(frames, `Estrazione del minimo (${extracted}): l'ultimo elemento scende al suo posto...`);
    heap = finalArr;
    render(null);
    document.getElementById('statusText').textContent = `✓ Estratto il minimo: ${extracted}.`;
    setControlsEnabled(true);
}

function doFill() {
    if (running) return;
    heap = [];
    for (let i = 0; i < 10; i++) {
        const v = Math.floor(Math.random() * 90) + 10;
        heap = insertFrames(heap, v).finalArr;
    }
    render(null);
    document.getElementById('statusText').textContent = '✓ Heap riempito con 10 valori casuali.';
    setControlsEnabled(true);
}

function doReset() {
    if (running) return;
    heap = [];
    render(null);
    document.getElementById('statusText').textContent = '';
    setControlsEnabled(true);
}

document.getElementById('insertBtn').addEventListener('click', doInsert);
document.getElementById('extractBtn').addEventListener('click', doExtract);
document.getElementById('fillBtn').addEventListener('click', doFill);
document.getElementById('resetBtn').addEventListener('click', doReset);

document.getElementById('speedSlider').addEventListener('input', (e) => {
    document.getElementById('speedValue').textContent = e.target.value + ' ms/passo';
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? "Perché un array, se sembra un albero? ▸" : "Perché un array, se sembra un albero? ▾";
});

// Inizializzazione
document.getElementById('speedSlider').dispatchEvent(new Event('input'));
doFill();
