// --- Simulatore di cache a mappatura diretta -------------------------------
// 64 indirizzi di memoria principale, blocchi da 4 indirizzi, 8 linee di
// cache. indice = (indirizzo / blocco) mod linee; tag = indirizzo / (blocco
// * linee). La logica è stata verificata in Node sui tre pattern qui sotto
// prima di essere inserita in pagina: sequenziale → 12 hit / 4 miss (75%),
// sparso → 1 hit / 15 miss (6.3%), in conflitto → 0 hit / 8 miss (0%).

const MEM_SIZE = 64;
const BLOCK_SIZE = 4;
const NUM_LINES = 8;

function indexOf(addr) { return Math.floor(addr / BLOCK_SIZE) % NUM_LINES; }
function tagOf(addr) { return Math.floor(addr / (BLOCK_SIZE * NUM_LINES)); }
function blockStart(addr) { return Math.floor(addr / BLOCK_SIZE) * BLOCK_SIZE; }

const PATTERNS = {
    sequential: {
        label: 'Sequenziale',
        sequence: Array.from({ length: 16 }, (_, i) => i),
    },
    random: {
        label: 'Sparsa',
        sequence: [3, 47, 12, 61, 8, 33, 55, 19, 2, 44, 27, 9, 58, 15, 36, 21],
    },
    conflict: {
        label: 'In conflitto',
        sequence: [0, 32, 0, 32, 0, 32, 0, 32],
    }
};

// Simula l'intera sequenza e produce un fotogramma per ogni accesso, con lo
// stato completo della cache dopo quell'accesso.
function buildFrames(sequence) {
    const cache = new Array(NUM_LINES).fill(null).map(() => ({ valid: false, tag: -1 }));
    const frames = [];
    let hits = 0, misses = 0;
    sequence.forEach((addr, i) => {
        const idx = indexOf(addr), tag = tagOf(addr);
        const hit = cache[idx].valid && cache[idx].tag === tag;
        if (hit) hits++; else { misses++; cache[idx] = { valid: true, tag }; }
        frames.push({
            step: i + 1, addr, idx, tag, hit,
            cache: cache.map(c => ({ ...c })),
            hits, misses,
        });
    });
    return frames;
}

// --- Interfaccia -------------------------------------------------------------

let currentPattern = 'sequential';
let frames = [];
let frameIndex = -1; // -1 = stato iniziale, prima di ogni accesso
let running = false;
let timer = null;

function currentSpeed() {
    return parseInt(document.getElementById('speedSlider').value, 10);
}

function loadPattern(key) {
    stopRunning();
    currentPattern = key;
    frames = buildFrames(PATTERNS[key].sequence);
    frameIndex = -1;
    render();
}

function renderMainMemory(frame) {
    const grid = document.getElementById('mainMemGrid');
    grid.innerHTML = '';
    const cachedBlocks = new Set();
    if (frame) frame.cache.forEach((line, idx) => {
        if (line.valid) cachedBlocks.add(line.tag * NUM_LINES * BLOCK_SIZE + idx * BLOCK_SIZE);
    });
    for (let addr = 0; addr < MEM_SIZE; addr++) {
        const cell = document.createElement('div');
        cell.className = 'mem-cell';
        if (addr % BLOCK_SIZE === 0) cell.classList.add('block-boundary');
        if (frame && addr === frame.addr) cell.classList.add('current');
        else if (cachedBlocks.has(blockStart(addr))) cell.classList.add('cached');
        cell.textContent = String(addr);
        grid.appendChild(cell);
    }
}

function renderCache(frame) {
    const grid = document.getElementById('cacheGrid');
    grid.innerHTML = '';
    for (let idx = 0; idx < NUM_LINES; idx++) {
        const line = frame ? frame.cache[idx] : { valid: false, tag: -1 };
        const div = document.createElement('div');
        div.className = 'cache-line' + (!line.valid ? ' empty' : '');
        if (frame && idx === frame.idx) div.classList.add('active');
        const blockLabel = line.valid
            ? `[${line.tag * NUM_LINES * BLOCK_SIZE + idx * BLOCK_SIZE}–${line.tag * NUM_LINES * BLOCK_SIZE + idx * BLOCK_SIZE + BLOCK_SIZE - 1}]`
            : '(vuota)';
        div.innerHTML = `<span class="idx">linea ${idx}</span><span class="tag">tag ${line.valid ? line.tag : '—'}</span><span class="block">${blockLabel}</span>`;
        grid.appendChild(div);
    }
}

function render() {
    const frame = frameIndex >= 0 ? frames[frameIndex] : null;

    document.getElementById('accessValue').textContent = frame ? String(frame.addr) : '—';
    const resultEl = document.getElementById('accessResult');
    if (frame) {
        resultEl.textContent = frame.hit ? '✓ HIT' : '✗ MISS';
        resultEl.className = 'access-result ' + (frame.hit ? 'hit' : 'miss');
    } else {
        resultEl.textContent = '';
        resultEl.className = 'access-result';
    }

    document.getElementById('hitsValue').textContent = frame ? String(frame.hits) : '0';
    document.getElementById('missesValue').textContent = frame ? String(frame.misses) : '0';
    const total = frame ? frame.hits + frame.misses : 0;
    document.getElementById('hitRateValue').textContent = total > 0 ? Math.round(frame.hits / total * 100) + '%' : '—';

    renderMainMemory(frame);
    renderCache(frame);

    const atEnd = frameIndex >= frames.length - 1;
    document.getElementById('playPauseBtn').disabled = atEnd;
    document.getElementById('stepBtn').disabled = atEnd;
}

function doStep() {
    if (frameIndex >= frames.length - 1) { stopRunning(); return; }
    frameIndex += 1;
    render();
    if (frameIndex >= frames.length - 1) stopRunning();
}

function startRunning() {
    if (running || frameIndex >= frames.length - 1) return;
    running = true;
    document.getElementById('playPauseBtn').textContent = '⏸ Pausa';
    timer = setInterval(doStep, currentSpeed());
}

function stopRunning() {
    running = false;
    document.getElementById('playPauseBtn').textContent = '▶ Avvia';
    if (timer) { clearInterval(timer); timer = null; }
}

function togglePlayPause() {
    if (running) stopRunning(); else startRunning();
}

document.querySelectorAll('.presets-row .chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.presets-row .chip').forEach(b => b.classList.toggle('active', b === btn));
        loadPattern(btn.dataset.pattern);
    });
});

document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
document.getElementById('stepBtn').addEventListener('click', doStep);
document.getElementById('resetBtn').addEventListener('click', () => loadPattern(currentPattern));

document.getElementById('speedSlider').addEventListener('input', (e) => {
    const ms = parseInt(e.target.value, 10);
    document.getElementById('speedValue').textContent = ms + ' ms/accesso';
    if (running) { stopRunning(); startRunning(); }
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? "Cos'è il \"thrashing\" nel pattern \"in conflitto\"? ▸"
        : "Cos'è il \"thrashing\" nel pattern \"in conflitto\"? ▾";
});

// Inizializzazione
document.getElementById('speedSlider').dispatchEvent(new Event('input'));
loadPattern('sequential');
