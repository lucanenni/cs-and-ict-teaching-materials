// --- Routing a vettore di distanza (Bellman-Ford distribuito) --------------
// L'algoritmo è stato verificato a parte in Node (non incluso nel progetto
// pubblicato) contro un Dijkstra di riferimento su più topologie: le
// distanze finali coincidono sempre, e sono state controllate a mano anche
// le scorciatoie non ovvie (es. A->C conviene passare per B anche se esiste
// un link diretto A-C più costoso).

const NODES = ['A', 'B', 'C', 'D', 'E'];
const EDGES = [
    ['A', 'B', 1],
    ['B', 'C', 2],
    ['A', 'C', 5],
    ['C', 'D', 1],
    ['B', 'D', 4],
    ['D', 'E', 1],
    ['C', 'E', 6],
];

// Posizioni percentuali (coordinate su un viewBox 0-100) per il diagramma.
const NODE_POS = {
    A: { x: 15, y: 18 },
    B: { x: 82, y: 18 },
    C: { x: 48, y: 50 },
    D: { x: 82, y: 82 },
    E: { x: 15, y: 82 },
};

function buildNeighbors(edges) {
    const neighbors = {};
    NODES.forEach(n => (neighbors[n] = {}));
    edges.forEach(([a, b, cost]) => {
        neighbors[a][b] = cost;
        neighbors[b][a] = cost;
    });
    return neighbors;
}

function initTables(neighbors) {
    const dist = {};
    const nextHop = {};
    NODES.forEach(x => {
        dist[x] = {};
        nextHop[x] = {};
        NODES.forEach(d => {
            if (d === x) { dist[x][d] = 0; nextHop[x][d] = x; }
            else if (neighbors[x][d] !== undefined) { dist[x][d] = neighbors[x][d]; nextHop[x][d] = d; }
            else { dist[x][d] = Infinity; nextHop[x][d] = null; }
        });
    });
    return { dist, nextHop };
}

// Un round sincrono: ogni router calcola la propria nuova tabella usando le
// tabelle VECCHIE (del round precedente) dei vicini, come se le avesse
// ricevute tutte prima dell'inizio del round.
function step(neighbors, dist, nextHop) {
    const newDist = {};
    const newNextHop = {};
    const changes = [];
    NODES.forEach(x => {
        newDist[x] = { ...dist[x] };
        newNextHop[x] = { ...nextHop[x] };
        NODES.forEach(d => {
            if (d === x) return;
            let best = dist[x][d];
            let bestHop = nextHop[x][d];
            Object.keys(neighbors[x]).forEach(n => {
                const viaCost = neighbors[x][n] + dist[n][d];
                if (viaCost < best) {
                    best = viaCost;
                    bestHop = n;
                }
            });
            if (best !== dist[x][d] || bestHop !== nextHop[x][d]) {
                newDist[x][d] = best;
                newNextHop[x][d] = bestHop;
                changes.push({ node: x, dest: d });
            }
        });
    });
    return { dist: newDist, nextHop: newNextHop, changed: changes.length > 0, changes };
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function runToConvergence(edges, maxRounds = 30) {
    const neighbors = buildNeighbors(edges);
    let { dist, nextHop } = initTables(neighbors);
    const history = [{ dist: clone(dist), nextHop: clone(nextHop), changes: [] }];
    let rounds = 0;
    while (rounds < maxRounds) {
        const result = step(neighbors, dist, nextHop);
        rounds++;
        dist = result.dist;
        nextHop = result.nextHop;
        history.push({ dist: clone(dist), nextHop: clone(nextHop), changes: result.changes });
        if (!result.changed) break;
    }
    return { history, neighbors };
}

const { history, neighbors } = runToConvergence(EDGES);
const FINAL_ROUND = history.length - 1; // il round senza alcun cambiamento

let state = { current: 0, isPlaying: false, interval: null, speed: 1300 };

// --- Diagramma -------------------------------------------------------------

function buildDiagram() {
    const svg = document.getElementById('edgesSvg');
    svg.innerHTML = '';
    EDGES.forEach(([a, b, cost]) => {
        const pa = NODE_POS[a], pb = NODE_POS[b];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pa.x); line.setAttribute('y1', pa.y);
        line.setAttribute('x2', pb.x); line.setAttribute('y2', pb.y);
        line.setAttribute('class', 'net-edge-line');
        line.id = `edge-${a}-${b}`;
        svg.appendChild(line);

        const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', mx); label.setAttribute('y', my);
        label.setAttribute('class', 'net-edge-label');
        label.setAttribute('text-anchor', 'middle');
        label.textContent = cost;
        svg.appendChild(label);
    });

    const diagram = document.getElementById('networkDiagram');
    NODES.forEach(id => {
        const pos = NODE_POS[id];
        const node = document.createElement('div');
        node.className = 'net-node';
        node.id = 'node-' + id;
        node.style.left = pos.x + '%';
        node.style.top = pos.y + '%';
        node.innerHTML = `<div class="net-node-icon">${id}</div><div class="net-node-label">Router ${id}</div>`;
        diagram.appendChild(node);
    });
}

function highlightChangedNodes(changes) {
    NODES.forEach(id => document.getElementById('node-' + id).classList.remove('changed'));
    const touched = new Set(changes.map(c => c.node));
    touched.forEach(id => document.getElementById('node-' + id).classList.add('changed'));
}

// --- Tabelle di routing ------------------------------------------------------

function buildRouterGrid() {
    const grid = document.getElementById('routerGrid');
    grid.innerHTML = '';
    NODES.forEach(x => {
        const card = document.createElement('div');
        card.className = 'router-card';
        card.innerHTML = `
            <div class="router-card-title">Router ${x}</div>
            <table class="router-table">
                <thead><tr><th>Dest.</th><th>Costo</th><th>Salto</th></tr></thead>
                <tbody id="routerBody-${x}"></tbody>
            </table>
        `;
        grid.appendChild(card);
    });
}

function renderRouterTables(snapshot, changes) {
    const changedSet = new Set(changes.map(c => c.node + '>' + c.dest));
    NODES.forEach(x => {
        const body = document.getElementById('routerBody-' + x);
        body.innerHTML = NODES.map(d => {
            const costVal = snapshot.dist[x][d];
            const cost = costVal === Infinity ? '∞' : costVal;
            const hop = snapshot.nextHop[x][d] || '—';
            const isSelf = d === x;
            const isChanged = changedSet.has(x + '>' + d);
            return `<tr class="${isSelf ? 'self' : ''} ${isChanged ? 'changed' : ''}">
                <td>${d}</td><td>${cost}</td><td>${isSelf ? '—' : hop}</td>
            </tr>`;
        }).join('');
    });
}

// --- Render principale -------------------------------------------------------

function render() {
    const snapshot = history[state.current];
    const atLast = state.current >= FINAL_ROUND;
    const converged = state.current === FINAL_ROUND && FINAL_ROUND > 0;

    document.getElementById('roundLabel').textContent = state.current === 0
        ? 'Round 0 — stato iniziale (solo i vicini diretti)'
        : `Round ${state.current}`;

    highlightChangedNodes(snapshot.changes);
    renderRouterTables(snapshot, snapshot.changes);

    const panel = document.getElementById('stepPanel');
    if (state.current === 0) {
        panel.innerHTML = '<div class="step-line current">Ogni router conosce solo il costo verso i vicini direttamente collegati; tutte le altre distanze sono "infinite" perché ancora nessuno gliele ha raccontate.</div>';
    } else if (snapshot.changes.length === 0) {
        panel.innerHTML = `<div class="step-line current">Round ${state.current}: ogni router ha ricevuto le tabelle dei vicini, ma nessuna distanza è migliorata. Le tabelle sono stabili.</div>`;
    } else {
        const lines = snapshot.changes.map(c =>
            `Router ${c.node} aggiorna la distanza verso <strong>${c.dest}</strong> a <strong>${snapshot.dist[c.node][c.dest]}</strong> (prossimo salto: ${snapshot.nextHop[c.node][c.dest]})`
        );
        panel.innerHTML = `<div class="step-line current">Round ${state.current}: i router si scambiano le tabelle e aggiornano ${snapshot.changes.length} voci:</div>` +
            lines.map(l => `<div class="step-line">${l}</div>`).join('');
    }

    const convBox = document.getElementById('convergenceBox');
    if (converged) {
        convBox.classList.remove('hidden');
        convBox.textContent = `✓ Convergenza raggiunta dopo ${FINAL_ROUND - 1} round: nel round ${FINAL_ROUND} nessuna tabella è più cambiata.`;
    } else {
        convBox.classList.add('hidden');
    }

    document.getElementById('stepBtn').disabled = atLast;
    document.getElementById('playBtn').disabled = atLast;
    document.getElementById('playBtn').textContent = state.isPlaying ? '⏸ Pausa' : (atLast ? '✓ Convergenza' : '▶ Avvia');
}

function stopAuto() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
}

function advance() {
    if (state.current >= FINAL_ROUND) { stopAuto(); render(); return; }
    state.current++;
    render();
    if (state.current >= FINAL_ROUND) stopAuto();
}

function startAuto() {
    if (state.current >= FINAL_ROUND) return;
    stopAuto();
    state.isPlaying = true;
    render();
    state.interval = setInterval(advance, state.speed);
}

function resetAll() {
    stopAuto();
    state.current = 0;
    render();
}

document.getElementById('playBtn').addEventListener('click', () => {
    if (state.isPlaying) { stopAuto(); render(); } else { startAuto(); }
});
document.getElementById('stepBtn').addEventListener('click', () => { stopAuto(); advance(); });
document.getElementById('resetBtn').addEventListener('click', resetAll);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Cosa succede se un link si rompe? ▸' : 'Cosa succede se un link si rompe? ▾';
});

// Inizializzazione: il diagramma, la griglia e il primo render devono
// esistere SUBITO al caricamento, così "Passo singolo" funziona fin da
// subito senza dover prima premere "Avvia".
buildDiagram();
buildRouterGrid();
render();
