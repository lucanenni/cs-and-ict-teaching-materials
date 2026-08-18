const ROWS = 8;
const COLS = 14;
const START = [0, 0];
const END = [ROWS - 1, COLS - 1];

function emptyWalls() {
    return Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
}

function isStartOrEnd(r, c) {
    return (r === START[0] && c === START[1]) || (r === END[0] && c === END[1]);
}

// Esegue BFS o DFS sulla griglia e restituisce l'ordine di esplorazione più
// il percorso ricostruito (se trovato), seguendo i puntatori al "genitore"
// di ogni cella scoperta.
function search(walls, algo) {
    const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
    const parent = {};
    const key = (r, c) => r + ',' + c;
    const order = [];
    const container = [START];
    visited[START[0]][START[1]] = true;
    let found = false;

    while (container.length) {
        const cur = algo === 'bfs' ? container.shift() : container.pop();
        order.push(cur);
        if (cur[0] === END[0] && cur[1] === END[1]) { found = true; break; }

        const [r, c] = cur;
        const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
        for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && !walls[nr][nc]) {
                visited[nr][nc] = true;
                parent[key(nr, nc)] = cur;
                container.push([nr, nc]);
            }
        }
    }

    let path = [];
    if (found) {
        let cur = END;
        while (!(cur[0] === START[0] && cur[1] === START[1])) {
            path.push(cur);
            cur = parent[key(cur[0], cur[1])];
        }
        path.push(START);
        path.reverse();
    }
    return { order, path, found };
}

function buildSteps(walls, algo) {
    const { order, path, found } = search(walls, algo);
    const steps = order.map(cell => ({ type: 'visit', cell }));
    path.forEach(cell => steps.push({ type: 'path', cell }));
    steps.push({ type: 'done', found, visitedCount: order.length, pathLength: path.length });
    return steps;
}

const ALGO_EXPLAIN = {
    bfs: [
        '• Il <strong>BFS</strong> (Breadth-First Search, "in ampiezza") esplora la griglia per "onde concentriche": prima tutte le celle a distanza 1 dalla partenza, poi tutte quelle a distanza 2, e così via.',
        '• Grazie a questo, il BFS su una griglia senza pesi <strong>garantisce sempre</strong> di trovare il percorso più breve possibile.',
        '• Il prezzo da pagare è che di solito deve esplorare più celle prima di raggiungere l\'arrivo.'
    ],
    dfs: [
        '• Il <strong>DFS</strong> (Depth-First Search, "in profondità") si spinge il più lontano possibile lungo una direzione, e torna indietro solo quando si blocca.',
        '• Trova <strong>un</strong> percorso, se esiste, ma quasi mai il più breve: può "incaponirsi" a esplorare un lungo vicolo cieco prima di accorgersi che esisteva una strada più diretta.',
        '• Spesso esplora meno celle del BFS, ma senza nessuna garanzia sulla qualità del percorso trovato.'
    ]
};

let state = {
    walls: emptyWalls(),
    algo: 'bfs',
    steps: [],
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 30
};

function computeSteps() {
    state.steps = buildSteps(state.walls, state.algo);
    state.current = 0;
}

function cellClasses(r, c, visitedSet, pathSet) {
    const classes = ['cell'];
    if (r === START[0] && c === START[1]) classes.push('start');
    else if (r === END[0] && c === END[1]) classes.push('end');
    else if (pathSet.has(r + ',' + c)) classes.push('path');
    else if (visitedSet.has(r + ',' + c)) classes.push('visited');
    else if (state.walls[r][c]) classes.push('wall');
    return classes.join(' ');
}

function renderGrid() {
    const visitedSet = new Set();
    const pathSet = new Set();
    let done = null;

    for (let i = 0; i <= state.current; i++) {
        const step = state.steps[i];
        if (!step) continue;
        if (step.type === 'visit') visitedSet.add(step.cell[0] + ',' + step.cell[1]);
        if (step.type === 'path') pathSet.add(step.cell[0] + ',' + step.cell[1]);
        if (step.type === 'done') done = step;
    }

    const grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = `repeat(${COLS}, 2rem)`;
    grid.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = cellClasses(r, c, visitedSet, pathSet);
            if (r === START[0] && c === START[1]) cell.textContent = '🟢';
            if (r === END[0] && c === END[1]) cell.textContent = '🔴';
            cell.addEventListener('click', () => toggleWall(r, c));
            grid.appendChild(cell);
        }
    }

    const statsRow = document.getElementById('statsRow');
    if (done) {
        statsRow.innerHTML = done.found
            ? `Celle esplorate: <strong>${done.visitedCount}</strong> · Lunghezza del percorso trovato: <strong>${done.pathLength}</strong> passi`
            : `Celle esplorate: <strong>${done.visitedCount}</strong> · <span style="color:#b91c1c">Nessun percorso trovato: l'arrivo è isolato dai muri.</span>`;
    } else {
        statsRow.textContent = `Passo ${state.current + 1} / ${state.steps.length}`;
    }

    const playBtn = document.getElementById('playPauseBtn');
    const atEnd = state.current >= state.steps.length - 1;
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else if (atEnd) {
        playBtn.textContent = '↻ Riavvia ricerca';
    } else {
        playBtn.textContent = '▶ Avvia ricerca';
    }
    document.getElementById('stepBtn').disabled = atEnd;
}

function toggleWall(r, c) {
    if (isStartOrEnd(r, c)) return;
    if (state.isPlaying) return; // non modificare i muri mentre la ricerca è in corso
    state.walls[r][c] = !state.walls[r][c];
    computeSteps();
    renderGrid();
}

function advance() {
    if (state.current >= state.steps.length - 1) {
        stopPlaying();
        return;
    }
    state.current++;
    renderGrid();
}

function startPlaying() {
    if (state.current >= state.steps.length - 1) state.current = 0;
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    renderGrid();
    state.interval = setInterval(() => {
        advance();
        if (state.current >= state.steps.length - 1) stopPlaying();
    }, state.speed);
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
    renderGrid();
}

function playPause() {
    if (state.isPlaying) stopPlaying();
    else startPlaying();
}

function randomWalls() {
    stopPlaying();
    state.walls = emptyWalls();
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!isStartOrEnd(r, c) && Math.random() < 0.24) state.walls[r][c] = true;
        }
    }
    computeSteps();
    renderGrid();
}

function clearWalls() {
    stopPlaying();
    state.walls = emptyWalls();
    computeSteps();
    renderGrid();
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });
document.getElementById('randomWallsBtn').addEventListener('click', randomWalls);
document.getElementById('clearBtn').addEventListener('click', clearWalls);

document.getElementById('algoSelect').addEventListener('change', (e) => {
    state.algo = e.target.value;
    document.getElementById('algoExplainList').innerHTML = ALGO_EXPLAIN[state.algo].map(li => `<li>${li}</li>`).join('');
    stopPlaying();
    computeSteps();
    renderGrid();
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = state.speed + 'ms';
    if (state.isPlaying) startPlaying();
});

// Inizializzazione
document.getElementById('algoExplainList').innerHTML = ALGO_EXPLAIN[state.algo].map(li => `<li>${li}</li>`).join('');
computeSteps();
renderGrid();
