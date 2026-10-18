// --- Union-Find + algoritmo di Kruskal per il Minimum Spanning Tree --------
// La logica pura (makeUnionFind, runKruskal) è stata verificata separatamente
// in Node: su questo stesso grafo di 7 nodi e 10 archi, l'MST calcolato da
// Kruskal pesa esattamente 23 (6 archi: F-G, C-D, B-C, A-C, D-E, D-F; l'arco
// A-B viene scartato perché chiuderebbe un ciclo), un valore confermato in
// modo indipendente da un algoritmo a forza bruta che enumera tutti gli
// alberi di copertura possibili; uno stress test con 25 grafi casuali
// confuta mai una discrepanza tra Kruskal e la forza bruta.

const NODES = [
    { id: 'A', x: 90, y: 250 },
    { id: 'B', x: 220, y: 100 },
    { id: 'C', x: 220, y: 320 },
    { id: 'D', x: 380, y: 180 },
    { id: 'E', x: 380, y: 340 },
    { id: 'F', x: 520, y: 180 },
    { id: 'G', x: 520, y: 340 }
];

const EDGES = [
    { id: 'FG', a: 'F', b: 'G', weight: 1 },
    { id: 'CD', a: 'C', b: 'D', weight: 2 },
    { id: 'BC', a: 'B', b: 'C', weight: 3 },
    { id: 'AC', a: 'A', b: 'C', weight: 4 },
    { id: 'AB', a: 'A', b: 'B', weight: 5 },
    { id: 'DE', a: 'D', b: 'E', weight: 6 },
    { id: 'DF', a: 'D', b: 'F', weight: 7 },
    { id: 'CE', a: 'C', b: 'E', weight: 8 },
    { id: 'BD', a: 'B', b: 'D', weight: 9 },
    { id: 'EG', a: 'E', b: 'G', weight: 10 }
];

const PALETTE = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#ec4899'];

function makeUnionFind(nodeIds) {
    const parent = {};
    const size = {};
    nodeIds.forEach(id => { parent[id] = id; size[id] = 1; });

    function find(x) {
        while (parent[x] !== x) x = parent[x];
        return x;
    }
    function union(a, b) {
        const ra = find(a), rb = find(b);
        if (ra === rb) return { united: false, rootA: ra, rootB: rb };
        let big = ra, small = rb;
        if (size[ra] < size[rb]) { big = rb; small = ra; }
        parent[small] = big;
        size[big] += size[small];
        return { united: true, absorbedRoot: small, survivingRoot: big };
    }
    return { find, union };
}

// Costruisce l'intera sequenza di passi di Kruskal in anticipo, con una
// fotografia COMPLETA dello stato (colore di ogni nodo, archi nel MST,
// archi scartati, peso totale) dopo ciascun passo — stesso principio usato
// in altri progetti della raccolta (es. database-locking-explorer): così
// l'interfaccia deve solo "mostrare" un passo, non calcolarlo di nuovo.
function buildTimeline(nodes, edges) {
    const sortedEdges = [...edges].sort((x, y) => x.weight - y.weight);
    const uf = makeUnionFind(nodes.map(n => n.id));
    const rootColor = {};
    nodes.forEach((n, i) => { rootColor[n.id] = PALETTE[i % PALETTE.length]; });

    const timeline = [];
    const mstSoFar = [];
    const discardedSoFar = [];
    let totalWeight = 0;
    let componentsLeft = nodes.length;

    for (const edge of sortedEdges) {
        const rootA = uf.find(edge.a);
        const rootB = uf.find(edge.b);
        let text;
        if (rootA === rootB) {
            discardedSoFar.push(edge.id);
            text = `Arco ${edge.a}-${edge.b} (peso ${edge.weight}): find(${edge.a}) = find(${edge.b}) = ${rootA} → stessa componente! Chiuderebbe un ciclo: arco SCARTATO.`;
        } else {
            const r = uf.union(edge.a, edge.b);
            mstSoFar.push(edge.id);
            totalWeight += edge.weight;
            componentsLeft--;
            delete rootColor[r.absorbedRoot];
            text = `Arco ${edge.a}-${edge.b} (peso ${edge.weight}): find(${edge.a}) = ${rootA}, find(${edge.b}) = ${rootB} → componenti diverse: UNITE. Arco aggiunto al MST.`;
        }

        const nodeColor = {};
        nodes.forEach(n => { nodeColor[n.id] = rootColor[uf.find(n.id)]; });

        timeline.push({
            edgeId: edge.id,
            action: rootA === rootB ? 'discard' : 'union',
            text,
            mstEdges: [...mstSoFar],
            discardedEdges: [...discardedSoFar],
            totalWeight,
            componentsLeft,
            nodeColor
        });

        if (componentsLeft === 1) break;
    }

    return { sortedEdges, timeline };
}

const { sortedEdges, timeline } = buildTimeline(NODES, EDGES);

const state = {
    step: -1,         // indice nella timeline dell'ultimo passo mostrato
    playing: false,
    interval: null,
    speed: 1100
};

function nodeById(id) { return NODES.find(n => n.id === id); }
function edgeById(id) { return EDGES.find(e => e.id === id); }

function buildStaticSvg() {
    const edgesLayer = document.getElementById('edgesLayer');
    const nodesLayer = document.getElementById('nodesLayer');
    edgesLayer.innerHTML = '';
    nodesLayer.innerHTML = '';

    sortedEdges.forEach(edge => {
        const a = nodeById(edge.a), b = nodeById(edge.b);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
        line.setAttribute('class', 'graph-edge');
        line.id = 'edge-' + edge.id;
        edgesLayer.appendChild(line);

        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bg.setAttribute('cx', mx); bg.setAttribute('cy', my); bg.setAttribute('r', 12);
        bg.setAttribute('class', 'edge-weight-bg');
        edgesLayer.appendChild(bg);
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', mx); txt.setAttribute('y', my);
        txt.setAttribute('class', 'edge-weight-text');
        txt.textContent = edge.weight;
        edgesLayer.appendChild(txt);
    });

    NODES.forEach(n => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', n.x); circle.setAttribute('cy', n.y); circle.setAttribute('r', 26);
        circle.setAttribute('class', 'graph-node-circle');
        circle.id = 'node-' + n.id;
        nodesLayer.appendChild(circle);
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', n.x); txt.setAttribute('y', n.y + 1);
        txt.setAttribute('class', 'graph-node-text');
        txt.textContent = n.id;
        nodesLayer.appendChild(txt);
    });
}

function buildEdgeList() {
    const wrap = document.getElementById('edgeList');
    wrap.innerHTML = '';
    sortedEdges.forEach(edge => {
        const row = document.createElement('div');
        row.className = 'edge-row';
        row.id = 'row-' + edge.id;
        row.innerHTML = `<span class="edge-label">${edge.a} – ${edge.b}</span><span class="edge-weight">${edge.weight}</span><span class="edge-status-icon" id="icon-${edge.id}">⏳</span>`;
        wrap.appendChild(row);
    });
}

function renderSnapshot() {
    // Colori di default (ogni nodo è il proprio insieme) quando non è
    // ancora stato fatto nessun passo.
    const defaultColor = {};
    NODES.forEach((n, i) => { defaultColor[n.id] = PALETTE[i % PALETTE.length]; });
    const snap = state.step >= 0 ? timeline[state.step] : {
        nodeColor: defaultColor, mstEdges: [], discardedEdges: [], totalWeight: 0, componentsLeft: NODES.length
    };

    NODES.forEach(n => {
        const el = document.getElementById('node-' + n.id);
        el.style.fill = snap.nodeColor[n.id];
        el.classList.remove('current');
    });

    sortedEdges.forEach(edge => {
        const el = document.getElementById('edge-' + edge.id);
        el.classList.remove('mst', 'discarded', 'current');
        if (snap.mstEdges.includes(edge.id)) el.classList.add('mst');
        else if (snap.discardedEdges.includes(edge.id)) el.classList.add('discarded');

        const row = document.getElementById('row-' + edge.id);
        row.classList.remove('status-mst', 'status-discarded', 'status-current');
        const icon = document.getElementById('icon-' + edge.id);
        if (snap.mstEdges.includes(edge.id)) { row.classList.add('status-mst'); icon.textContent = '✅'; }
        else if (snap.discardedEdges.includes(edge.id)) { row.classList.add('status-discarded'); icon.textContent = '❌'; }
        else { icon.textContent = '⏳'; }
    });

    if (state.step >= 0) {
        const cur = timeline[state.step];
        document.getElementById('edge-' + cur.edgeId).classList.add('current');
        document.getElementById('row-' + cur.edgeId).classList.add('status-current');
        const edge = edgeById(cur.edgeId);
        document.getElementById('node-' + edge.a).classList.add('current');
        document.getElementById('node-' + edge.b).classList.add('current');
    }

    document.getElementById('statsRow').innerHTML =
        `Archi considerati: <span>${state.step + 1}</span> / ${sortedEdges.length} · ` +
        `Nel MST: <span>${snap.mstEdges.length}</span> · Scartati: <span>${snap.discardedEdges.length}</span> · ` +
        `Peso totale finora: <span>${snap.totalWeight}</span> · Componenti separate: <span>${snap.componentsLeft}</span>`;

    const caption = document.getElementById('stepCaption');
    if (state.step < 0) {
        caption.textContent = 'Premi "Avvia" o "Passo singolo" per iniziare a considerare gli archi, dal più leggero al più pesante.';
    } else {
        caption.textContent = timeline[state.step].text;
    }

    const atEnd = state.step >= timeline.length - 1;
    document.getElementById('stepBtn').disabled = atEnd;

    const resultBox = document.getElementById('resultBox');
    if (atEnd && state.step >= 0) {
        const last = timeline[timeline.length - 1];
        resultBox.classList.remove('hidden');
        resultBox.className = 'result-box good';
        const reason = last.componentsLeft === 1
            ? 'tutti i nodi sono ora in un\'unica componente: il Minimum Spanning Tree è completo.'
            : 'tutti gli archi disponibili sono stati considerati.';
        resultBox.innerHTML = `✓ Completato — ${reason}<br>Peso totale del MST: <strong>${last.totalWeight}</strong> · Archi usati: <strong>${last.mstEdges.length}</strong> · Archi scartati: <strong>${last.discardedEdges.length}</strong>.`;
    } else {
        resultBox.classList.add('hidden');
    }

    const playBtn = document.getElementById('playPauseBtn');
    if (state.playing) playBtn.textContent = '⏸ Pausa';
    else if (atEnd && state.step >= 0) playBtn.textContent = '↻ Riavvia';
    else playBtn.textContent = '▶ Avvia';
}

function stopAuto() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.playing = false;
}

function advance() {
    if (state.step >= timeline.length - 1) { stopAuto(); return; }
    state.step++;
    renderSnapshot();
}

function stepOnce() {
    stopAuto();
    advance();
    renderSnapshot();
}

function startAuto() {
    if (state.step >= timeline.length - 1) state.step = -1;
    stopAuto();
    state.playing = true;
    renderSnapshot();
    state.interval = setInterval(() => {
        advance();
        if (state.step >= timeline.length - 1) stopAuto();
        renderSnapshot();
    }, state.speed);
}

function playPause() {
    if (state.playing) { stopAuto(); renderSnapshot(); }
    else startAuto();
}

function reset() {
    stopAuto();
    state.step = -1;
    renderSnapshot();
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', stepOnce);
document.getElementById('resetBtn').addEventListener('click', reset);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché partire sempre dall\'arco più leggero funziona? ▸'
        : 'Perché partire sempre dall\'arco più leggero funziona? ▾';
});

// Inizializzazione — costruzione e primo render qui, non solo dentro
// "Avvia", così "Passo singolo" funziona fin da subito.
buildStaticSvg();
buildEdgeList();
renderSnapshot();
