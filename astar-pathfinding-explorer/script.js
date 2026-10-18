// --- Dijkstra vs A* sulla stessa griglia -----------------------------------
// Griglia a costo uniforme (1 per cella, muri invalicabili): qui l'unica
// differenza fra i due algoritmi è l'euristica. Entrambi condividono lo
// STESSO codice di ricerca (runSearch): Dijkstra lo chiama con h=0 sempre,
// A* con h = distanza di Manhattan dalla cella all'arrivo. Essendo la stessa
// funzione, è impossibile che "sbaglino" in modi diversi: l'unica differenza
// possibile è l'ordine in cui espandono le celle.
//
// La logica (runSearch) è stata verificata in Node, PRIMA di collegarla alla
// UI, su: una griglia vuota, un labirinto con un solo varco, una destinazione
// isolata da muri, e 50 griglie casuali con muri sparsi — controllando ogni
// volta che il costo finale di A* coincida esattamente con quello di
// Dijkstra, e che A* non espanda mai più celle di Dijkstra (spesso molte di
// meno). Vedi scripts di test nel repository di sviluppo.

const ROWS = 10;
const COLS = 14;
const START = [0, 0];
const END = [6, 10];

function cellKey(r, c) { return r * COLS + c; }

function neighborsOf(r, c) {
    const out = [];
    if (r > 0) out.push([r - 1, c]);
    if (r < ROWS - 1) out.push([r + 1, c]);
    if (c > 0) out.push([r, c - 1]);
    if (c < COLS - 1) out.push([r, c + 1]);
    return out;
}

function manhattan(r, c) {
    return Math.abs(r - END[0]) + Math.abs(c - END[1]);
}

// Ricerca su griglia a costo uniforme con coda a priorità (scansione
// lineare: la griglia è piccola, quindi niente heap — resta più facile da
// leggere e verificare a mano). useHeuristic=false → Dijkstra puro (h=0
// sempre, nessuna informazione sulla direzione dell'arrivo). useHeuristic
// =true → A* (h = distanza di Manhattan, che su una griglia a costo 1 senza
// muri non sovrastima MAI il costo reale rimanente: è ammissibile).
function runSearch(walls, useHeuristic) {
    const h = (r, c) => useHeuristic ? manhattan(r, c) : 0;
    const gScore = new Map();
    const visited = new Set();
    const parent = new Map();
    const open = [];
    const startKey = cellKey(START[0], START[1]);
    gScore.set(startKey, 0);
    open.push({ r: START[0], c: START[1], g: 0, f: h(START[0], START[1]) });
    const visitOrder = [];

    while (open.length) {
        // Trova nella coda l'elemento con f minimo (a parità, g minimo):
        // è la cella "più promettente" da espandere ora.
        let bi = 0;
        for (let i = 1; i < open.length; i++) {
            if (open[i].f < open[bi].f - 1e-9 ||
                (Math.abs(open[i].f - open[bi].f) < 1e-9 && open[i].g < open[bi].g)) bi = i;
        }
        const cur = open.splice(bi, 1)[0];
        const k = cellKey(cur.r, cur.c);
        if (visited.has(k)) continue;
        visited.add(k);
        visitOrder.push({ r: cur.r, c: cur.c, g: cur.g, f: cur.f });
        if (cur.r === END[0] && cur.c === END[1]) break;
        for (const [nr, nc] of neighborsOf(cur.r, cur.c)) {
            const nk = cellKey(nr, nc);
            if (walls.has(nk)) continue;
            const ng = cur.g + 1;
            if (!gScore.has(nk) || ng < gScore.get(nk)) {
                gScore.set(nk, ng);
                parent.set(nk, [cur.r, cur.c]);
                open.push({ r: nr, c: nc, g: ng, f: ng + h(nr, nc) });
            }
        }
    }

    const endKey = cellKey(END[0], END[1]);
    let path = null, cost = Infinity;
    if (gScore.has(endKey)) {
        cost = gScore.get(endKey);
        path = [];
        let cur = END;
        while (true) {
            path.push(cur);
            if (cur[0] === START[0] && cur[1] === START[1]) break;
            cur = parent.get(cellKey(cur[0], cur[1]));
        }
        path.reverse();
    }
    return { visitOrder, path, cost, expanded: visitOrder.length };
}

function buildComparison(walls) {
    const dRes = runSearch(walls, false);
    const aRes = runSearch(walls, true);
    const totalTicks = Math.max(dRes.visitOrder.length, aRes.visitOrder.length);
    return { dRes, aRes, totalTicks };
}

// Esporta le funzioni pure per i test standalone in Node (in un browser
// `module` non esiste, quindi questo blocco non ha alcun effetto).
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ROWS, COLS, START, END, cellKey, neighborsOf, manhattan, runSearch, buildComparison };
}

// --- Interfaccia -------------------------------------------------------------

if (typeof document !== 'undefined') {

let walls = new Set();
let comparison = buildComparison(walls);
let currentTick = -1;
let running = false;
let timer = null;
let dDone = false, aDone = false;

function isStartOrEnd(r, c) {
    return (r === START[0] && c === START[1]) || (r === END[0] && c === END[1]);
}

function buildGridDom(prefix) {
    const grid = document.getElementById(prefix + 'Grid');
    grid.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'astar-cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            if (r === START[0] && c === START[1]) { cell.classList.add('start'); cell.textContent = 'A'; }
            else if (r === END[0] && c === END[1]) { cell.classList.add('end'); cell.textContent = 'B'; }
            cell.addEventListener('click', () => paintCell(r, c));
            grid.appendChild(cell);
        }
    }
}

function cellEl(prefix, r, c) {
    return document.querySelector(`#${prefix}Grid .astar-cell[data-r="${r}"][data-c="${c}"]`);
}

function refreshWallClasses() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const isWall = walls.has(cellKey(r, c));
            cellEl('d', r, c).classList.toggle('wall', isWall);
            cellEl('a', r, c).classList.toggle('wall', isWall);
        }
    }
}

function paintCell(r, c) {
    if (running || isStartOrEnd(r, c)) return;
    const k = cellKey(r, c);
    if (walls.has(k)) walls.delete(k); else walls.add(k);
    rebuild();
}

function applyPreset(name) {
    if (running) return;
    walls = new Set();
    if (name === 'wall-gap') {
        for (let r = 0; r < ROWS; r++) {
            if (r !== 4) walls.add(cellKey(r, 6));
        }
    } else if (name === 'maze') {
        for (let r = 1; r < 9; r++) {
            if (r !== 2) walls.add(cellKey(r, 3));
        }
        for (let r = 0; r < 7; r++) {
            if (r !== 5) walls.add(cellKey(r, 8));
        }
    } else if (name === 'box') {
        walls.add(cellKey(5, 10));
        walls.add(cellKey(7, 10));
        walls.add(cellKey(6, 9));
        walls.add(cellKey(6, 11));
    }
    rebuild();
}

function rebuild() {
    stopAuto();
    comparison = buildComparison(walls);
    currentTick = -1;
    dDone = false;
    aDone = false;
    refreshWallClasses();
    document.querySelectorAll('.astar-cell').forEach(el => el.classList.remove('visited-d', 'visited-a', 'path'));
    document.getElementById('stepPanel').innerHTML = '';
    document.getElementById('resultBox').className = 'result-box';
    document.getElementById('resultBox').textContent = '';
    document.getElementById('liveStats').textContent = 'Celle espanse — Dijkstra: 0 · A*: 0';
    updateButtons();
}

function currentSpeed() {
    return parseInt(document.getElementById('speedSlider').value, 10);
}

function addStepLine(text) {
    const panel = document.getElementById('stepPanel');
    panel.querySelectorAll('.step-line.current').forEach(el => el.classList.remove('current'));
    const line = document.createElement('div');
    line.className = 'step-line current';
    line.textContent = text;
    panel.appendChild(line);
    panel.scrollTop = panel.scrollHeight;
}

function finalizeSide(prefix, res) {
    if (res.path) {
        for (const [r, c] of res.path) {
            if (isStartOrEnd(r, c)) continue;
            cellEl(prefix, r, c).classList.add('path');
        }
    }
}

function maybeShowFinalResult() {
    if (!dDone || !aDone) return;
    const { dRes, aRes } = comparison;
    const box = document.getElementById('resultBox');
    if (dRes.cost === Infinity) {
        box.className = 'result-box bad';
        box.textContent = '✗ Nessun percorso possibile: l\'arrivo è isolato dai muri disegnati.';
        return;
    }
    const saved = dRes.expanded - aRes.expanded;
    const pct = dRes.expanded > 0 ? Math.round(100 * saved / dRes.expanded) : 0;
    box.className = 'result-box good';
    box.textContent = `✓ Percorso trovato — costo totale: ${dRes.cost} (identico per entrambi gli algoritmi). ` +
        `Celle espanse — Dijkstra: ${dRes.expanded}, A*: ${aRes.expanded} ` +
        (saved > 0 ? `(A* ne ha espanse ${saved} di meno, -${pct}%).` : '(stesso numero di celle in questo scenario).');
}

function tick() {
    const { dRes, aRes, totalTicks } = comparison;
    if (currentTick >= totalTicks - 1) { stopAuto(); return; }
    currentTick++;

    const parts = [];
    if (!dDone) {
        if (currentTick < dRes.visitOrder.length) {
            const v = dRes.visitOrder[currentTick];
            if (!isStartOrEnd(v.r, v.c)) cellEl('d', v.r, v.c).classList.add('visited-d');
            parts.push(`Dijkstra espande (riga ${v.r + 1}, col ${v.c + 1}) — g=${v.g}`);
            if (currentTick === dRes.visitOrder.length - 1) {
                dDone = true;
                finalizeSide('d', dRes);
            }
        }
    } else {
        parts.push(`Dijkstra ha già finito (${dRes.expanded} celle espanse in tutto)`);
    }
    if (!aDone) {
        if (currentTick < aRes.visitOrder.length) {
            const v = aRes.visitOrder[currentTick];
            if (!isStartOrEnd(v.r, v.c)) cellEl('a', v.r, v.c).classList.add('visited-a');
            parts.push(`A* espande (riga ${v.r + 1}, col ${v.c + 1}) — g=${v.g}, h=${v.f - v.g}, f=${v.f}`);
            if (currentTick === aRes.visitOrder.length - 1) {
                aDone = true;
                finalizeSide('a', aRes);
            }
        }
    } else {
        parts.push(`A* ha già finito (${aRes.expanded} celle espanse in tutto)`);
    }

    addStepLine(`Passo ${currentTick + 1}: ` + parts.join('  |  '));
    document.getElementById('liveStats').textContent =
        `Celle espanse — Dijkstra: ${Math.min(currentTick + 1, dRes.expanded)} · A*: ${Math.min(currentTick + 1, aRes.expanded)}`;

    maybeShowFinalResult();
    updateButtons();
    if (currentTick >= totalTicks - 1) stopAuto();
}

function updateButtons() {
    const atEnd = currentTick >= comparison.totalTicks - 1;
    document.getElementById('stepBtn').disabled = atEnd;
    document.getElementById('runBtn').disabled = atEnd;
}

function startAuto() {
    if (running || currentTick >= comparison.totalTicks - 1) return;
    running = true;
    document.getElementById('runBtn').textContent = '⏸ Pausa';
    timer = setInterval(tick, currentSpeed());
}

function stopAuto() {
    running = false;
    document.getElementById('runBtn').textContent = '▶ Avvia';
    if (timer) { clearInterval(timer); timer = null; }
}

function toggleRun() {
    if (running) stopAuto(); else startAuto();
}

document.querySelectorAll('.presets-row .chip').forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
});

document.getElementById('runBtn').addEventListener('click', toggleRun);
document.getElementById('stepBtn').addEventListener('click', tick);
document.getElementById('resetBtn').addEventListener('click', () => applyPreset('empty'));

document.getElementById('speedSlider').addEventListener('input', (e) => {
    document.getElementById('speedValue').textContent = e.target.value + ' ms/passo';
    if (running) { stopAuto(); startAuto(); }
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché una euristica che sovrastima sarebbe un problema? ▸'
        : 'Perché una euristica che sovrastima sarebbe un problema? ▾';
});

// Inizializzazione: griglia vuota già pronta, Passo singolo funziona da
// subito, senza dover prima premere Avvia.
buildGridDom('d');
buildGridDom('a');
refreshWallClasses();
document.getElementById('speedSlider').dispatchEvent(new Event('input'));
document.getElementById('liveStats').textContent = 'Celle espanse — Dijkstra: 0 · A*: 0';
updateButtons();

}
