const GRID_SIZE = 12;
const WHITE = '#ffffff';

const PALETTE = [
    '#ffffff', '#111827', '#ef4444', '#f97316', '#facc15',
    '#22c55e', '#0ea5e9', '#3b82f6', '#a855f7', '#ec4899'
];

let state = {
    grid: new Array(GRID_SIZE * GRID_SIZE).fill(WHITE),
    currentColor: PALETTE[2],
    isPainting: false
};

function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    return {
        r: parseInt(clean.substring(0, 2), 16),
        g: parseInt(clean.substring(2, 4), 16),
        b: parseInt(clean.substring(4, 6), 16)
    };
}

function renderPalette() {
    const row = document.getElementById('paletteRow');
    row.innerHTML = '';
    PALETTE.forEach(color => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'palette-swatch' + (color === state.currentColor ? ' selected' : '');
        btn.style.background = color;
        btn.title = color;
        btn.addEventListener('click', () => {
            state.currentColor = color;
            document.getElementById('customColor').value = color;
            renderPalette();
        });
        row.appendChild(btn);
    });
}

function paintCell(index) {
    state.grid[index] = state.currentColor;
    const cell = document.querySelector(`.pixel-cell[data-index="${index}"]`);
    if (cell) cell.style.background = state.grid[index];
}

function showPixelInfo(index) {
    const color = state.grid[index];
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const { r, g, b } = hexToRgb(color);
    const panel = document.getElementById('pixelInfo');
    panel.innerHTML = `
        <div class="pixel-info-swatch" style="background:${color}"></div>
        <div class="pixel-info-text">
            Pixel riga ${row + 1}, colonna ${col + 1} → <strong>RGB(${r}, ${g}, ${b})</strong><br>
            Esadecimale: <strong>${color.toUpperCase()}</strong>
        </div>
    `;
}

function renderGrid() {
    const grid = document.getElementById('pixelGrid');
    grid.innerHTML = '';
    state.grid.forEach((color, index) => {
        const cell = document.createElement('div');
        cell.className = 'pixel-cell';
        cell.dataset.index = index;
        cell.style.background = color;

        // mousedown+mouseenter abilitano il "trascina per dipingere" col
        // mouse; click resta come rete di sicurezza per un singolo tocco su
        // schermi touch, dove mousedown non è sempre affidabile.
        cell.addEventListener('mousedown', () => {
            state.isPainting = true;
            paintCell(index);
            showPixelInfo(index);
        });
        cell.addEventListener('mouseenter', () => {
            showPixelInfo(index);
            if (state.isPainting) paintCell(index);
        });
        cell.addEventListener('click', () => {
            paintCell(index);
            showPixelInfo(index);
        });

        grid.appendChild(cell);
    });
}

function renderWeight() {
    const total = GRID_SIZE * GRID_SIZE;
    document.getElementById('weightPanel').textContent =
        `Griglia ${GRID_SIZE}×${GRID_SIZE} = ${total} pixel. Peso "grezzo" (3 byte per pixel: uno per R, uno per G, uno per B): ${total} × 3 = ${total * 3} byte.`;
}

function loadPreset(pattern, colorMap) {
    const rows = pattern.trim().split('\n');
    const newGrid = new Array(GRID_SIZE * GRID_SIZE).fill(WHITE);
    rows.forEach((row, r) => {
        row.split('').forEach((ch, c) => {
            const color = colorMap[ch];
            if (color) newGrid[r * GRID_SIZE + c] = color;
        });
    });
    state.grid = newGrid;
    renderGrid();
}

const HEART_PATTERN = `
............
..RR....RR..
.RRRR..RRRR.
RRRRRRRRRRRR
RRRRRRRRRRRR
RRRRRRRRRRRR
.RRRRRRRRRR.
..RRRRRRRR..
...RRRRRR...
....RRRR....
.....RR.....
............`;

const SMILEY_PATTERN = `
....YYYY....
..YYYYYYYY..
.YYYYYYYYYY.
YYYYYYYYYYYY
YYYKYYYYKYYY
YYYYYYYYYYYY
YYYYYYYYYYYY
YYYYYYYYYYYY
YYYYYYYYYYYY
YYYKKKKKKYYY
.YYYYYYYYYY.
..YYYYYYYY..`;

document.getElementById('presetHeart').addEventListener('click', () => {
    loadPreset(HEART_PATTERN, { R: '#ef4444' });
});

document.getElementById('presetSmiley').addEventListener('click', () => {
    loadPreset(SMILEY_PATTERN, { Y: '#facc15', K: '#111827' });
});

document.getElementById('presetChecker').addEventListener('click', () => {
    const newGrid = new Array(GRID_SIZE * GRID_SIZE);
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            newGrid[r * GRID_SIZE + c] = (r + c) % 2 === 0 ? '#0ea5e9' : '#ffffff';
        }
    }
    state.grid = newGrid;
    renderGrid();
});

document.getElementById('clearGrid').addEventListener('click', () => {
    state.grid = new Array(GRID_SIZE * GRID_SIZE).fill(WHITE);
    renderGrid();
});

document.getElementById('customColor').addEventListener('input', (e) => {
    state.currentColor = e.target.value;
    renderPalette();
});

window.addEventListener('mouseup', () => { state.isPainting = false; });

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché una vera foto pesa meno di 3 byte per pixel? ▸'
        : 'Perché una vera foto pesa meno di 3 byte per pixel? ▾';
});

renderPalette();
renderGrid();
renderWeight();
