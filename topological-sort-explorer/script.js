// -----------------------------------------------------------------------
// Logica pura dell'ordinamento topologico con l'algoritmo di Kahn (nessun
// riferimento al DOM). Il grafo è un piccolo DAG di "compiti" con
// dipendenze. L'intera sequenza di passi viene calcolata in anticipo
// (come un'unica lista di "fotogrammi"), così l'interfaccia si limita a
// scorrerla, esattamente come negli altri visualizzatori della raccolta.
// -----------------------------------------------------------------------

const NODES = [
    { id: 'requisiti', label: 'Scrivi i requisiti' },
    { id: 'codice', label: 'Scrivi il codice' },
    { id: 'doc', label: 'Scrivi la documentazione' },
    { id: 'test_scritti', label: 'Scrivi i test' },
    { id: 'ambiente', label: "Configura l'ambiente di staging" },
    { id: 'test_eseguiti', label: 'Esegui i test' },
    { id: 'distribuisci', label: 'Distribuisci' },
    { id: 'monitora', label: 'Monitora produzione' }
];

// [da, a] significa "da" deve precedere "a" (cioè "a" dipende da "da").
const BASE_EDGES = [
    ['requisiti', 'codice'],
    ['requisiti', 'doc'],
    ['requisiti', 'ambiente'],
    ['codice', 'test_scritti'],
    ['codice', 'test_eseguiti'],
    ['test_scritti', 'test_eseguiti'],
    ['test_eseguiti', 'distribuisci'],
    ['doc', 'distribuisci'],
    ['ambiente', 'distribuisci'],
    ['distribuisci', 'monitora']
];

// Arco "incidentale" che crea un ciclo: "Scrivi il codice" dipende (anche)
// da "Esegui i test", che a sua volta dipende, indirettamente, da
// "Scrivi il codice" (codice → test_scritti → test_eseguiti → codice).
const CYCLE_EDGE = ['test_eseguiti', 'codice'];

function labelOf(id) {
    const n = NODES.find(n => n.id === id);
    return n ? n.label : id;
}

function dependenciesOf(id, edges) {
    return edges.filter(([, v]) => v === id).map(([u]) => u);
}

// Livelli usati solo per il LAYOUT del diagramma (calcolati sul grafo base,
// senza l'arco del ciclo, così la disposizione dei nodi resta stabile in
// entrambi gli scenari): livello 0 = nessuna dipendenza, livello k+1 = un
// passo dopo la dipendenza più "lontana".
function computeLayoutLevels() {
    const level = {};
    NODES.forEach(n => { level[n.id] = 0; });
    let changed = true;
    let guard = 0;
    while (changed && guard++ < NODES.length + 1) {
        changed = false;
        BASE_EDGES.forEach(([u, v]) => {
            if (level[u] + 1 > level[v]) {
                level[v] = level[u] + 1;
                changed = true;
            }
        });
    }
    return level;
}

// Algoritmo di Kahn: (1) grado entrante di ogni nodo; (2) coda dei nodi con
// grado 0; (3) estrai, aggiungi all'ordine finale, decrementa il grado dei
// nodi dipendenti, e se qualcuno arriva a 0 aggiungilo alla coda.
function runKahn(edges) {
    const ids = NODES.map(n => n.id);
    const indegree = {};
    ids.forEach(id => { indegree[id] = 0; });
    edges.forEach(([, v]) => { indegree[v]++; });

    const adjacency = {};
    ids.forEach(id => { adjacency[id] = []; });
    edges.forEach(([u, v]) => { adjacency[u].push(v); });

    const frames = [];
    const order = [];
    const startQueue = ids.filter(id => indegree[id] === 0);
    const liveIndegree = { ...indegree };
    const q = startQueue.slice();

    frames.push({
        type: 'init', indegree: { ...liveIndegree }, queue: q.slice(), order: [],
        text: `Grado entrante iniziale calcolato per ogni compito. Compiti senza dipendenze, pronti subito: ${startQueue.length ? startQueue.map(labelOf).join(', ') : '(nessuno)'}.`
    });

    while (q.length > 0) {
        const u = q.shift();
        order.push(u);
        frames.push({
            type: 'dequeue', node: u, order: order.slice(), queue: q.slice(), indegree: { ...liveIndegree },
            text: `Estraggo "${labelOf(u)}" dalla coda e lo aggiungo all'ordine finale.`
        });
        adjacency[u].slice().forEach(v => {
            liveIndegree[v]--;
            frames.push({
                type: 'decrement', node: v, from: u, order: order.slice(), queue: q.slice(), indegree: { ...liveIndegree },
                text: `"${labelOf(v)}" aveva una dipendenza da "${labelOf(u)}", ora soddisfatta: grado entrante → ${liveIndegree[v]}.`
            });
            if (liveIndegree[v] === 0) {
                q.push(v);
                frames.push({
                    type: 'enqueue', node: v, order: order.slice(), queue: q.slice(), indegree: { ...liveIndegree },
                    text: `"${labelOf(v)}" non ha più dipendenze in sospeso: entra in coda.`
                });
            }
        });
    }

    const complete = order.length === ids.length;
    const stuckNodes = ids.filter(id => !order.includes(id));
    frames.push({
        type: complete ? 'done' : 'stuck', order: order.slice(), queue: [], indegree: { ...liveIndegree }, stuckNodes,
        text: complete
            ? `Ordinamento completato: tutti i ${ids.length} compiti sono stati ordinati.`
            : `BLOCCATO: la coda si è svuotata ma ${stuckNodes.length} compiti non sono mai stati processati (il loro grado entrante non è mai arrivato a 0) — segno che il grafo contiene un ciclo tra: ${stuckNodes.map(labelOf).join(', ')}.`
    });

    return { frames, order, complete, stuckNodes, finalIndegree: liveIndegree };
}

// Verifica indipendente: l'ordine prodotto rispetta davvero ogni "da deve
// precedere a" per gli archi il cui ordine include entrambi gli estremi.
function respectsDependencies(order, edges) {
    const pos = {};
    order.forEach((id, i) => { pos[id] = i; });
    return edges.every(([u, v]) => {
        if (!(u in pos) || !(v in pos)) return true; // non entrambi processati: non verificabile/non applicabile
        return pos[u] < pos[v];
    });
}

// -----------------------------------------------------------------------
// Interfaccia
// -----------------------------------------------------------------------

if (typeof document !== 'undefined') {

    let state = {
        hasCycle: false,
        trace: null,
        current: -1,
        isPlaying: false,
        interval: null,
        speed: 900,
        nodeEls: {}
    };

    const LEVELS = computeLayoutLevels();

    function currentEdges() {
        return state.hasCycle ? BASE_EDGES.concat([CYCLE_EDGE]) : BASE_EDGES.slice();
    }

    function buildAndRender() {
        stopPlaying();
        const edges = currentEdges();
        state.trace = runKahn(edges);
        state.current = -1;
        buildGraphDom(edges);
        renderFrame();
    }

    function buildGraphDom(edges) {
        const graph = document.getElementById('graph');
        graph.innerHTML = '';
        state.nodeEls = {};

        const maxLevel = Math.max(...Object.values(LEVELS));
        for (let lvl = 0; lvl <= maxLevel; lvl++) {
            const col = document.createElement('div');
            col.className = 'graph-col';
            NODES.filter(n => LEVELS[n.id] === lvl).forEach(n => {
                const deps = dependenciesOf(n.id, edges);
                const box = document.createElement('div');
                box.className = 'node-box';
                box.innerHTML = `
                    <div class="node-badge" data-role="badge">0</div>
                    <div class="node-label">${n.label}</div>
                    <div class="node-deps">${deps.length ? 'da: ' + deps.map(labelOf).join(', ') : '(nessuna dipendenza)'}</div>
                `;
                col.appendChild(box);
                state.nodeEls[n.id] = { box, badge: box.querySelector('[data-role="badge"]') };
            });
            graph.appendChild(col);
        }
    }

    function renderFrame() {
        const frame = state.current >= 0 ? state.trace.frames[state.current] : state.trace.frames[0];
        const order = frame.order || [];
        const indeg = frame.indegree;
        const q = frame.queue || [];

        NODES.forEach(n => {
            const els = state.nodeEls[n.id];
            if (!els) return;
            els.box.classList.remove('waiting', 'ready', 'processed', 'current', 'stuck');
            const degree = indeg[n.id];
            els.badge.textContent = degree;
            if (order.includes(n.id)) {
                els.box.classList.add('processed');
            } else if (q.includes(n.id)) {
                els.box.classList.add('ready');
            } else {
                els.box.classList.add('waiting');
            }
            if (frame.node === n.id) els.box.classList.add('current');
            if (frame.type === 'stuck' && frame.stuckNodes && frame.stuckNodes.includes(n.id)) els.box.classList.add('stuck');
        });

        document.getElementById('queueRow').innerHTML = q.length
            ? q.map(id => `<span class="chip-tag queue-chip">${labelOf(id)}</span>`).join('')
            : '<span class="chip-placeholder">vuota</span>';

        document.getElementById('orderRow').innerHTML = order.length
            ? order.map((id, i) => `<span class="chip-tag order-chip">${i + 1}. ${labelOf(id)}</span>`).join('')
            : '<span class="chip-placeholder">ancora vuoto</span>';

        const panel = document.getElementById('stepPanel');
        if (state.current < 0) {
            panel.innerHTML = '<div class="step-line current">Premi "Avvia" o "Passo singolo" per iniziare l\'algoritmo di Kahn.</div>';
        } else {
            const start = Math.max(0, state.current - 6);
            panel.innerHTML = state.trace.frames.slice(start, state.current + 1).map((f, i) => {
                const realIndex = start + i;
                const cls = ['step-line'];
                if (realIndex === state.current) cls.push('current');
                if (f.type === 'stuck') cls.push('stuck-line');
                return `<div class="${cls.join(' ')}">${realIndex + 1}. ${f.text}</div>`;
            }).join('');
            panel.scrollTop = panel.scrollHeight;
        }

        const atEnd = state.current >= state.trace.frames.length - 1;
        document.getElementById('stepCounter').textContent = state.current >= 0
            ? `Passo ${state.current + 1} / ${state.trace.frames.length}`
            : `Pronto · ${state.trace.frames.length} passi totali`;

        const resultBox = document.getElementById('resultBox');
        if (atEnd && frame.type === 'done') {
            resultBox.classList.remove('hidden', 'bad');
            resultBox.classList.add('good');
            resultBox.textContent = `✓ Ordine topologico completo (${order.length}/${NODES.length} compiti): ${order.map(labelOf).join(' → ')}`;
        } else if (atEnd && frame.type === 'stuck') {
            resultBox.classList.remove('hidden', 'good');
            resultBox.classList.add('bad');
            resultBox.textContent = `✗ Ciclo rilevato: solo ${order.length}/${NODES.length} compiti ordinati. Bloccati: ${frame.stuckNodes.map(labelOf).join(', ')}.`;
        } else {
            resultBox.classList.add('hidden');
        }

        document.getElementById('stepBtn').disabled = atEnd;
        document.getElementById('playBtn').textContent = state.isPlaying ? '⏸ Pausa' : (atEnd ? '↻ Riavvia' : '▶ Avvia');
    }

    function advance() {
        if (state.current >= state.trace.frames.length - 1) {
            stopPlaying();
            return;
        }
        state.current++;
        renderFrame();
    }

    function startPlaying() {
        if (state.current >= state.trace.frames.length - 1) state.current = -1;
        stopPlaying();
        state.isPlaying = true;
        renderFrame();
        state.interval = setInterval(() => {
            advance();
            if (state.current >= state.trace.frames.length - 1) stopPlaying();
        }, state.speed);
    }

    function stopPlaying() {
        if (state.interval) clearInterval(state.interval);
        state.interval = null;
        state.isPlaying = false;
    }

    document.getElementById('playBtn').addEventListener('click', () => {
        if (state.isPlaying) {
            stopPlaying();
            renderFrame();
        } else {
            startPlaying();
        }
    });
    document.getElementById('stepBtn').addEventListener('click', () => {
        stopPlaying();
        advance();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        state.current = -1;
        stopPlaying();
        renderFrame();
    });
    document.getElementById('cycleBtn').addEventListener('click', () => {
        state.hasCycle = !state.hasCycle;
        document.getElementById('cycleBtn').textContent = state.hasCycle
            ? '✓ Dipendenza circolare introdotta (clic per rimuoverla)'
            : 'Introduci una dipendenza circolare';
        document.getElementById('cycleNote').classList.toggle('hidden', !state.hasCycle);
        buildAndRender();
    });

    document.getElementById('deepDiveBtn').addEventListener('click', () => {
        const panel = document.getElementById('deepDivePanel');
        const isHidden = panel.classList.toggle('hidden');
        const btn = document.getElementById('deepDiveBtn');
        btn.setAttribute('aria-expanded', String(!isHidden));
        btn.textContent = isHidden
            ? "Perché la coda non si riempie più se c'è un ciclo? ▸"
            : "Perché la coda non si riempie più se c'è un ciclo? ▾";
    });

    // Inizializzazione: il grafo di default (senza ciclo) è pronto e
    // "Passo singolo" funziona subito, senza bisogno di premere "Avvia" prima.
    buildAndRender();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NODES, BASE_EDGES, CYCLE_EDGE, labelOf, dependenciesOf, computeLayoutLevels, runKahn, respectsDependencies };
}
