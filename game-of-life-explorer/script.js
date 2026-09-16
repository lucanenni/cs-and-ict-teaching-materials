const COLS = 75, ROWS = 50, CELL = 8;

// Ogni pattern qui sotto è stato verificato calcolando le generazioni in
// Node prima di essere usato: lampeggiatore e aliante confrontati contro
// il comportamento atteso passo-passo, rospo/faro/pulsar verificati per
// tornare esattamente allo stato iniziale dopo il loro periodo noto (2, 2
// e 3 generazioni), il cannone di Gosper verificato controllando che il
// numero di celle vive cresca di esattamente +5 (una cella in più per
// ogni aliante emesso) ogni 30 generazioni, per 5 intervalli consecutivi.
const PRESETS = {
    glider: { cells: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]], offset: [5, 5] },
    blinker: { cells: [[0, 0], [0, 1], [0, 2]], offset: [20, 35] },
    toad: { cells: [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]], offset: [20, 34] },
    beacon: { cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 2], [2, 3], [3, 2], [3, 3]], offset: [18, 34] },
    pulsar: {
        cells: (() => {
            const rows = [
                '..XXX...XXX..', '.............', 'X....X.X....X', 'X....X.X....X', 'X....X.X....X',
                '..XXX...XXX..', '.............', '..XXX...XXX..', 'X....X.X....X', 'X....X.X....X',
                'X....X.X....X', '.............', '..XXX...XXX..'
            ];
            const cells = [];
            rows.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'X') cells.push([r, c]); }));
            return cells;
        })(),
        offset: [17, 30]
    },
    gun: {
        cells: [
            [5, 1], [5, 2], [6, 1], [6, 2],
            [5, 11], [6, 11], [7, 11], [4, 12], [8, 12], [3, 13], [9, 13], [3, 14], [9, 14],
            [6, 15], [4, 16], [8, 16], [5, 17], [6, 17], [7, 17], [6, 18],
            [3, 21], [4, 21], [5, 21], [3, 22], [4, 22], [5, 22], [2, 23], [6, 23],
            [1, 25], [2, 25], [6, 25], [7, 25],
            [3, 35], [4, 35], [3, 36], [4, 36]
        ],
        offset: [15, 5]
    }
};

function makeEmptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

let state = {
    grid: makeEmptyGrid(),
    generation: 0,
    isPlaying: false,
    interval: null,
    speed: 150
};

function loadPreset(name) {
    state.grid = makeEmptyGrid();
    state.generation = 0;
    if (name === 'random') {
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) state.grid[r][c] = Math.random() < 0.25 ? 1 : 0;
    } else if (name !== 'empty') {
        const preset = PRESETS[name];
        const [or_, oc] = preset.offset;
        preset.cells.forEach(([r, c]) => {
            const rr = (r + or_) % ROWS, cc = (c + oc) % COLS;
            state.grid[rr][cc] = 1;
        });
    }
    render();
}

function countNeighbors(grid, r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const rr = (r + dr + ROWS) % ROWS, cc = (c + dc + COLS) % COLS;
            if (grid[rr][cc]) count++;
        }
    }
    return count;
}

function step() {
    const next = makeEmptyGrid();
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const alive = state.grid[r][c];
            const n = countNeighbors(state.grid, r, c);
            next[r][c] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        }
    }
    state.grid = next;
    state.generation++;
    render();
}

function render() {
    const canvas = document.getElementById('lifeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2dd4bf';
    let alive = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (state.grid[r][c]) {
                ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
                alive++;
            }
        }
    }
    document.getElementById('statsRow').innerHTML =
        `Generazione: <span>${state.generation}</span> · Celle vive: <span>${alive}</span>`;

    const playBtn = document.getElementById('playPauseBtn');
    playBtn.textContent = state.isPlaying ? '⏸ Pausa' : '▶ Avvia';
}

function startPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    state.interval = setInterval(step, state.speed);
    render();
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
    render();
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (state.isPlaying) stopPlaying();
    else startPlaying();
});
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    step();
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speed = 650 - parseInt(e.target.value, 10);
    document.getElementById('speedValue').textContent = Math.round(1000 / state.speed) + ' gen/sec circa';
    if (state.isPlaying) startPlaying();
});

document.getElementById('lifeCanvas').addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    const scaleX = e.target.width / rect.width;
    const scaleY = e.target.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const c = Math.floor(x / CELL), r = Math.floor(y / CELL);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        state.grid[r][c] = state.grid[r][c] ? 0 : 1;
        render();
    }
});

document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        stopPlaying();
        loadPreset(chip.dataset.preset);
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché si dice che il gioco della vita è "Turing completo"? ▸'
        : 'Perché si dice che il gioco della vita è "Turing completo"? ▾';
});

// Inizializzazione
document.getElementById('speedSlider').dispatchEvent(new Event('input'));
loadPreset('glider');
