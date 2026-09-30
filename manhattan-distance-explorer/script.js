// --- Distanza di Manhattan su una griglia -----------------------------------
// Nessun algoritmo "sofisticato" qui: la distanza è sempre |Δriga| + |Δcolonna|.
// La parte interessante è mostrare che moltissimi percorsi diversi (tutte le
// combinazioni possibili di passi verticali e orizzontali) hanno esattamente
// questa stessa lunghezza, e confrontarla con la distanza euclidea.

const ROWS = 8;
const COLS = 12;
const CELL = 36;
const GAP = 2;

let points = { A: { r: 1, c: 1 }, B: { r: 6, c: 10 } };
let selected = 'A';
let currentPath = [];

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Genera un percorso "a scala" da a a b: un passo alla volta, solo su/giù o
// sinistra/destra, mai in diagonale. L'ordine dei passi verticali e
// orizzontali è mescolato a caso: percorsi diversi, stessa lunghezza totale.
function generatePath(a, b) {
    const dr = b.r - a.r;
    const dc = b.c - a.c;
    const steps = [];
    for (let i = 0; i < Math.abs(dr); i++) steps.push('V');
    for (let i = 0; i < Math.abs(dc); i++) steps.push('H');
    shuffle(steps);

    const rSign = Math.sign(dr);
    const cSign = Math.sign(dc);
    let r = a.r, c = a.c;
    const cells = [[r, c]];
    for (const step of steps) {
        if (step === 'V') r += rSign; else c += cSign;
        cells.push([r, c]);
    }
    return cells;
}

function nCr(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let result = 1;
    for (let i = 0; i < k; i++) {
        result = (result * (n - i)) / (i + 1);
    }
    return Math.round(result);
}

function renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    const pathSet = new Set(currentPath.slice(1, -1).map(([r, c]) => r + ',' + c));

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if ((r + c) % 2 === 1) cell.classList.add('block-alt');
            if (pathSet.has(r + ',' + c)) cell.classList.add('path');

            const isA = points.A.r === r && points.A.c === c;
            const isB = points.B.r === r && points.B.c === c;
            if (isA && isB) {
                cell.classList.add('point-a');
                cell.textContent = 'A=B';
                cell.style.fontSize = '0.55rem';
            } else if (isA) {
                cell.classList.add('point-a');
                cell.textContent = 'A';
            } else if (isB) {
                cell.classList.add('point-b');
                cell.textContent = 'B';
            }

            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', () => movePoint(r, c));
            grid.appendChild(cell);
        }
    }

    grid.style.width = (COLS * (CELL + GAP) - GAP) + 'px';
    grid.style.height = (ROWS * (CELL + GAP) - GAP) + 'px';
}

function drawEuclidLine() {
    const svg = document.getElementById('euclidLine');
    const width = COLS * (CELL + GAP) - GAP;
    const height = ROWS * (CELL + GAP) - GAP;
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.innerHTML = '';

    const show = document.getElementById('euclidToggle').checked;
    const { A, B } = points;
    if (!show || (A.r === B.r && A.c === B.c)) return;

    const x1 = A.c * (CELL + GAP) + CELL / 2;
    const y1 = A.r * (CELL + GAP) + CELL / 2;
    const x2 = B.c * (CELL + GAP) + CELL / 2;
    const y2 = B.r * (CELL + GAP) + CELL / 2;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    svg.appendChild(line);
}

function updateDistances() {
    const { A, B } = points;
    const dx = Math.abs(A.c - B.c);
    const dy = Math.abs(A.r - B.r);
    const manhattan = dx + dy;
    const euclid = Math.sqrt(dx * dx + dy * dy);

    document.getElementById('manhattanValue').textContent = manhattan;
    document.getElementById('euclidValue').textContent = euclid.toFixed(2);

    const statusText = document.getElementById('statusText');
    if (manhattan === 0) {
        statusText.textContent = 'I due punti coincidono: distanza zero, in qualunque modo la si misuri.';
    } else {
        const ways = nCr(manhattan, dy);
        const waysText = ways === 1 ? 'esiste 1 solo percorso possibile' : `esistono ${ways} percorsi diversi con questa stessa lunghezza`;
        statusText.textContent = `Percorso mostrato: ${dy} passi in verticale e ${dx} in orizzontale, in un ordine a caso — ma ${waysText}.`;
    }
}

function refresh(regeneratePath) {
    if (regeneratePath) currentPath = generatePath(points.A, points.B);
    renderGrid();
    drawEuclidLine();
    updateDistances();
}

function movePoint(r, c) {
    points[selected] = { r, c };
    refresh(true);
}

function applyPreset(name) {
    if (name === 'diagonal') {
        points = { A: { r: 1, c: 1 }, B: { r: ROWS - 2, c: COLS - 2 } };
    } else if (name === 'row') {
        const r = Math.floor(ROWS / 2);
        points = { A: { r, c: 1 }, B: { r, c: COLS - 2 } };
    } else if (name === 'col') {
        const c = Math.floor(COLS / 2);
        points = { A: { r: 1, c }, B: { r: ROWS - 2, c } };
    } else if (name === 'random') {
        const rand = (max) => Math.floor(Math.random() * max);
        points = { A: { r: rand(ROWS), c: rand(COLS) }, B: { r: rand(ROWS), c: rand(COLS) } };
    }
    refresh(true);
}

document.querySelectorAll('.point-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selected = btn.dataset.point;
        document.querySelectorAll('.point-btn').forEach(b => b.classList.toggle('active', b === btn));
    });
});

document.querySelectorAll('.presets-row .chip').forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
});

document.getElementById('shuffleBtn').addEventListener('click', () => refresh(true));
document.getElementById('resetBtn').addEventListener('click', () => applyPreset('diagonal'));
document.getElementById('euclidToggle').addEventListener('change', () => drawEuclidLine());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'A cosa serve in pratica? ▸' : 'A cosa serve in pratica? ▾';
});

// Inizializzazione
refresh(true);
