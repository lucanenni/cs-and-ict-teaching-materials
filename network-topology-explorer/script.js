// =============================================================================
// Logica pura di instradamento per le 4 topologie (testata a parte in Node,
// vedi test-topology.js nello scratchpad di sviluppo: nessun riferimento al
// DOM qui sotto, solo dati in ingresso/uscita).
// =============================================================================
const LABELS = ['A', 'B', 'C', 'D', 'E'];

function buildTopology(type) {
    const nodes = LABELS.map((l, i) => ({ id: 'n' + i, label: l, hub: false }));
    const edges = [];
    if (type === 'bus') {
        for (let i = 0; i < nodes.length - 1; i++) {
            edges.push({ id: 'e' + i, a: nodes[i].id, b: nodes[i + 1].id });
        }
    } else if (type === 'star') {
        const hub = { id: 'hub', label: 'HUB', hub: true };
        nodes.push(hub);
        for (let i = 0; i < LABELS.length; i++) {
            edges.push({ id: 'e' + i, a: 'hub', b: nodes[i].id });
        }
    } else if (type === 'ring') {
        for (let i = 0; i < nodes.length; i++) {
            const j = (i + 1) % nodes.length;
            edges.push({ id: 'e' + i, a: nodes[i].id, b: nodes[j].id });
        }
    } else if (type === 'mesh') {
        let k = 0;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                edges.push({ id: 'e' + (k++), a: nodes[i].id, b: nodes[j].id });
            }
        }
    } else {
        throw new Error('topologia sconosciuta: ' + type);
    }
    return { nodes, edges };
}

function edgeBetween(topology, a, b) {
    return topology.edges.find(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
}

function isEdgeBroken(state, edge) {
    return !!edge && state.brokenEdges.has(edge.id);
}

function isNodeBroken(state, id) {
    return state.brokenNodes.has(id);
}

function simulateBus(topology, state, senderId, receiverId) {
    const order = topology.nodes.map(n => n.id);
    const segBroken = i => state.brokenEdges.has(topology.edges[i].id);
    const senderIdx = order.indexOf(senderId);
    let left = senderIdx;
    while (left > 0 && !segBroken(left - 1)) left--;
    let right = senderIdx;
    while (right < order.length - 1 && !segBroken(right)) right++;
    const reachableIds = order.slice(left, right + 1);
    const heard = reachableIds.filter(id => id !== senderId);
    const delivered = reachableIds.includes(receiverId);
    return { delivered, heard, reachableIds, path: delivered ? [senderId, receiverId] : [], reason: delivered ? 'ok' : 'segment-broken' };
}

function simulateStar(topology, state, senderId, receiverId) {
    const hub = topology.nodes.find(n => n.hub).id;
    if (isNodeBroken(state, hub)) return { delivered: false, reason: 'hub-broken', path: [] };
    const senderSpoke = edgeBetween(topology, hub, senderId);
    const receiverSpoke = edgeBetween(topology, hub, receiverId);
    if (isEdgeBroken(state, senderSpoke)) return { delivered: false, reason: 'sender-spoke-broken', path: [] };
    if (isEdgeBroken(state, receiverSpoke)) return { delivered: false, reason: 'receiver-spoke-broken', path: [] };
    return { delivered: true, reason: 'ok', path: [senderId, hub, receiverId] };
}

function simulateRing(topology, state, senderId, receiverId) {
    const order = topology.nodes.map(n => n.id);
    const n = order.length;
    const senderIdx = order.indexOf(senderId);
    const path = [senderId];
    let idx = senderIdx;
    for (let step = 0; step < n; step++) {
        const nextIdx = (idx + 1) % n;
        const a = order[idx], b = order[nextIdx];
        const edge = edgeBetween(topology, a, b);
        if (isEdgeBroken(state, edge) || (b !== receiverId && isNodeBroken(state, b))) {
            return { delivered: false, reason: 'blocked', path, blockedAt: edge.id };
        }
        path.push(b);
        if (b === receiverId) return { delivered: true, reason: 'ok', path };
        idx = nextIdx;
    }
    return { delivered: false, reason: 'full-circle', path };
}

function simulateMesh(topology, state, senderId, receiverId) {
    const adj = {};
    topology.nodes.forEach(n => { adj[n.id] = []; });
    topology.edges.forEach(e => {
        if (state.brokenEdges.has(e.id)) return;
        if (state.brokenNodes.has(e.a) || state.brokenNodes.has(e.b)) return;
        adj[e.a].push(e.b);
        adj[e.b].push(e.a);
    });
    const visited = new Set([senderId]);
    const prev = {};
    const queue = [senderId];
    while (queue.length) {
        const cur = queue.shift();
        if (cur === receiverId) break;
        for (const nb of adj[cur]) {
            if (!visited.has(nb)) { visited.add(nb); prev[nb] = cur; queue.push(nb); }
        }
    }
    if (!visited.has(receiverId)) return { delivered: false, reason: 'no-path', path: [] };
    const path = [receiverId];
    let cur = receiverId;
    while (cur !== senderId) { cur = prev[cur]; path.unshift(cur); }
    return { delivered: true, reason: 'ok', path };
}

function simulateMessage(topology, type, state, senderId, receiverId) {
    if (senderId === receiverId) return { delivered: false, reason: 'same', path: [] };
    if (isNodeBroken(state, senderId)) return { delivered: false, reason: 'sender-broken', path: [] };
    if (isNodeBroken(state, receiverId)) return { delivered: false, reason: 'receiver-broken', path: [] };
    if (type === 'bus') return simulateBus(topology, state, senderId, receiverId);
    if (type === 'star') return simulateStar(topology, state, senderId, receiverId);
    if (type === 'ring') return simulateRing(topology, state, senderId, receiverId);
    if (type === 'mesh') return simulateMesh(topology, state, senderId, receiverId);
    throw new Error('topologia sconosciuta: ' + type);
}

// Esporta la logica pura per i test standalone in Node (non referenziato dal
// browser: `module` non esiste lì, quindi questo blocco è un no-op).
if (typeof module !== 'undefined') {
    module.exports = { buildTopology, simulateMessage, edgeBetween, LABELS };
}

// =============================================================================
// UI: diagramma, selettori, step-by-step, guasti
// =============================================================================

const TOPOLOGIES = [
    { type: 'bus', label: 'Bus' },
    { type: 'star', label: 'Stella' },
    { type: 'ring', label: 'Anello' },
    { type: 'mesh', label: 'Mesh' }
];

const state = {
    type: 'bus',
    topology: buildTopology('bus'),
    brokenNodes: new Set(),
    brokenEdges: new Set(),
    senderId: 'n0',
    receiverId: 'n4',
    steps: [],
    current: -1,
    isPlaying: false,
    interval: null,
    speed: 1300
};

function labelOf(id) {
    if (id === 'hub') return 'HUB';
    const n = state.topology.nodes.find(n => n.id === id);
    return n ? n.label : id;
}

function edgesAlongPath(topology, path) {
    const ids = [];
    for (let i = 0; i < path.length - 1; i++) {
        const e = edgeBetween(topology, path[i], path[i + 1]);
        if (e) ids.push(e.id);
    }
    return ids;
}

// --- Costruzione dei passi testuali + evidenziazione, per ciascuna topologia -

function stepsBus(topology, result, senderId, receiverId) {
    const heard = result.heard || [];
    let activeEdges = [];
    if (result.reachableIds && result.reachableIds.length > 1) {
        activeEdges = edgesAlongPath(topology, result.reachableIds);
    }
    const steps = [];
    steps.push({
        text: `${labelOf(senderId)} trasmette: in una rete bus il segnale viaggia in <strong>broadcast</strong> su tutto il cavo condiviso, non verso un nodo specifico.`,
        highlight: { activeNodes: [senderId] }
    });
    steps.push({
        text: heard.length
            ? `Il segnale si propaga lungo il cavo e viene "sentito" da: ${heard.map(labelOf).join(', ')}.`
            : `Il segnale non raggiunge nessun altro nodo: un guasto isola completamente ${labelOf(senderId)}.`,
        highlight: { activeNodes: [senderId, ...heard], activeEdges }
    });
    if (result.delivered) {
        steps.push({
            text: `${labelOf(receiverId)} riconosce il proprio indirizzo nel messaggio e lo <strong>accetta</strong>; tutti gli altri nodi che lo hanno "sentito" lo ignorano.`,
            highlight: { activeNodes: [senderId, ...heard], activeEdges, successNodes: [receiverId] }
        });
    } else {
        steps.push({
            text: `${labelOf(receiverId)} non riceve nulla: un guasto nel cavo centrale ha diviso la rete in due metà che non comunicano più tra loro.`,
            highlight: { activeNodes: [senderId, ...heard], activeEdges, blockedNodes: [receiverId] }
        });
    }
    return steps;
}

function stepsStar(topology, result, senderId, receiverId) {
    const hub = topology.nodes.find(n => n.hub).id;
    const steps = [];
    steps.push({
        text: `${labelOf(senderId)} invia il messaggio: in una rete a stella passa sempre prima dall'<strong>hub</strong> centrale, anche per raggiungere un vicino.`,
        highlight: { activeNodes: [senderId] }
    });
    if (result.reason === 'hub-broken') {
        steps.push({
            text: `L'HUB è guasto: essendo il punto di passaggio obbligato per tutti, nessun nodo può più comunicare con nessun altro. Questo è il <strong>singolo punto di rottura totale</strong> della stella.`,
            highlight: { activeNodes: [senderId], blockedNodes: [hub] }
        });
        return steps;
    }
    if (result.reason === 'sender-spoke-broken') {
        steps.push({
            text: `Il cavo che collega ${labelOf(senderId)} all'hub è guasto: solo ${labelOf(senderId)} resta isolato, il resto della rete continua a funzionare normalmente.`,
            highlight: { blockedNodes: [senderId] }
        });
        return steps;
    }
    steps.push({
        text: `L'hub riceve il messaggio e lo rigira verso ${labelOf(receiverId)}.`,
        highlight: { activeNodes: [senderId, hub] }
    });
    if (result.reason === 'receiver-spoke-broken') {
        steps.push({
            text: `Il cavo che collega ${labelOf(receiverId)} all'hub è guasto: solo ${labelOf(receiverId)} resta isolato, il resto della rete continua a funzionare normalmente.`,
            highlight: { activeNodes: [senderId, hub], blockedNodes: [receiverId] }
        });
        return steps;
    }
    steps.push({
        text: `${labelOf(receiverId)} riceve il messaggio dall'hub.`,
        highlight: { activeNodes: [senderId, hub], successNodes: [receiverId] }
    });
    return steps;
}

function stepsRing(topology, result, senderId, receiverId) {
    const steps = [];
    const path = result.path;
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1];
        steps.push({
            text: `Il messaggio passa da ${labelOf(a)} a ${labelOf(b)} (l'anello trasmette sempre in questa unica direzione).`,
            highlight: { activeNodes: path.slice(0, i + 2), activeEdges: edgesAlongPath(topology, path.slice(0, i + 2)) }
        });
    }
    if (result.delivered) {
        steps.push({
            text: `${labelOf(receiverId)} riconosce il proprio indirizzo e accetta il messaggio.`,
            highlight: { activeNodes: path, activeEdges: edgesAlongPath(topology, path), successNodes: [receiverId] }
        });
    } else {
        const lastNode = path[path.length - 1];
        steps.push({
            text: `Il collegamento successivo a ${labelOf(lastNode)} è guasto: il messaggio si perde senza completare il giro, e ${labelOf(receiverId)} non lo riceve.`,
            highlight: { activeNodes: path, activeEdges: edgesAlongPath(topology, path), blockedEdges: [result.blockedAt], blockedNodes: [receiverId] }
        });
    }
    return steps;
}

function stepsMesh(topology, result, senderId, receiverId) {
    const steps = [];
    if (!result.delivered) {
        steps.push({
            text: `Nessun percorso disponibile tra ${labelOf(senderId)} e ${labelOf(receiverId)}: servono guasti multipli per isolare una parte di una mesh, ma qui sono bastati a bloccare proprio questa coppia.`,
            highlight: { blockedNodes: [senderId, receiverId] }
        });
        return steps;
    }
    const path = result.path;
    steps.push({
        text: `Viene calcolato il percorso più breve disponibile tra ${labelOf(senderId)} e ${labelOf(receiverId)}: con tanti collegamenti ridondanti, la mesh ha spesso diverse vie alternative tra cui scegliere.`,
        highlight: { activeNodes: [senderId] }
    });
    for (let i = 0; i < path.length - 1; i++) {
        const slice = path.slice(0, i + 2);
        steps.push({
            text: `Passa per ${labelOf(path[i + 1])}.`,
            highlight: { activeNodes: slice, activeEdges: edgesAlongPath(topology, slice) }
        });
    }
    steps[steps.length - 1].highlight.successNodes = [receiverId];
    return steps;
}

function buildStepsFor(type, topology, result, senderId, receiverId) {
    if (type === 'bus') return stepsBus(topology, result, senderId, receiverId);
    if (type === 'star') return stepsStar(topology, result, senderId, receiverId);
    if (type === 'ring') return stepsRing(topology, result, senderId, receiverId);
    if (type === 'mesh') return stepsMesh(topology, result, senderId, receiverId);
    return [];
}

// --- Posizionamento e disegno SVG -------------------------------------------

function computePositions(type, outerIds) {
    const cx = 300, cy = 170, r = 120;
    const pos = {};
    if (type === 'bus') {
        outerIds.forEach((id, i) => { pos[id] = { x: 70 + i * 115, y: 170 }; });
        return pos;
    }
    outerIds.forEach((id, i) => {
        const angle = -Math.PI / 2 + i * (2 * Math.PI / outerIds.length);
        pos[id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    if (type === 'star') pos['hub'] = { x: cx, y: cy };
    return pos;
}

function renderDiagram(highlight) {
    highlight = highlight || {};
    const topo = state.topology;
    const outerIds = topo.nodes.filter(n => !n.hub).map(n => n.id);
    const pos = computePositions(state.type, outerIds);

    let edgesHtml = '';
    topo.edges.forEach(e => {
        const pa = pos[e.a], pb = pos[e.b];
        const broken = state.brokenEdges.has(e.id);
        const active = (highlight.activeEdges || []).includes(e.id);
        const blocked = (highlight.blockedEdges || []).includes(e.id);
        let cls = 'topo-edge';
        if (broken) cls += ' broken';
        else if (blocked) cls += ' blocked-flash';
        else if (active) cls += ' active';
        edgesHtml += `<line class="${cls}" data-edge="${e.id}" x1="${pa.x}" y1="${pa.y}" x2="${pb.x}" y2="${pb.y}"></line>`;
        if (broken) {
            const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
            edgesHtml += `<text class="topo-break-mark" x="${mx}" y="${my + 4}" text-anchor="middle">✕</text>`;
        }
    });

    let nodesHtml = '';
    topo.nodes.forEach(n => {
        const p = pos[n.id];
        const brokenN = state.brokenNodes.has(n.id);
        let cls = 'topo-node' + (n.hub ? ' hub' : '');
        if (brokenN) cls += ' broken';
        if ((highlight.activeNodes || []).includes(n.id)) cls += ' active';
        if ((highlight.successNodes || []).includes(n.id)) cls += ' success';
        if ((highlight.blockedNodes || []).includes(n.id)) cls += ' blocked-flash';
        if (!n.hub && n.id === state.senderId) cls += ' sender';
        if (!n.hub && n.id === state.receiverId) cls += ' receiver';
        const radius = n.hub ? 26 : 22;
        nodesHtml += `
            <g class="${cls}" data-node="${n.id}">
                <circle cx="${p.x}" cy="${p.y}" r="${radius}"></circle>
                <text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${n.label}</text>
            </g>`;
    });

    const svg = document.getElementById('topoSvg');
    svg.innerHTML = edgesHtml + nodesHtml;

    svg.querySelectorAll('[data-edge]').forEach(el => {
        el.addEventListener('click', () => toggleEdge(el.getAttribute('data-edge')));
    });
    svg.querySelectorAll('[data-node]').forEach(el => {
        el.addEventListener('click', () => toggleNode(el.getAttribute('data-node')));
    });
}

// --- Guasti ------------------------------------------------------------------

function toggleEdge(id) {
    if (state.brokenEdges.has(id)) state.brokenEdges.delete(id);
    else state.brokenEdges.add(id);
    afterTopologyEdit();
}

function toggleNode(id) {
    if (state.brokenNodes.has(id)) state.brokenNodes.delete(id);
    else state.brokenNodes.add(id);
    afterTopologyEdit();
}

function afterTopologyEdit() {
    stopPlaying();
    renderDiagram(null);
    document.getElementById('stepPanel').innerHTML =
        '<div class="step-line current">Rete modificata: premi "📨 Invia messaggio" per vedere l\'effetto del guasto.</div>';
    document.getElementById('resultBox').className = 'result-box';
    document.getElementById('resultBox').textContent = '';
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('playBtn').disabled = true;
}

// --- Selettori mittente/destinatario -----------------------------------------

function renderSelects() {
    const outer = state.topology.nodes.filter(n => !n.hub);
    const senderSelect = document.getElementById('senderSelect');
    const receiverSelect = document.getElementById('receiverSelect');
    senderSelect.innerHTML = outer.map(n => `<option value="${n.id}">${n.label}</option>`).join('');
    receiverSelect.innerHTML = outer.map(n => `<option value="${n.id}">${n.label}</option>`).join('');
    senderSelect.value = state.senderId;
    receiverSelect.value = state.receiverId;
}

function renderChips() {
    const wrap = document.getElementById('topoChips');
    wrap.innerHTML = '';
    TOPOLOGIES.forEach(t => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'topo-chip' + (t.type === state.type ? ' active' : '');
        chip.textContent = t.label;
        chip.addEventListener('click', () => {
            if (state.type === t.type) return;
            state.type = t.type;
            state.topology = buildTopology(t.type);
            state.brokenNodes = new Set();
            state.brokenEdges = new Set();
            const outer = state.topology.nodes.filter(n => !n.hub);
            state.senderId = outer[0].id;
            state.receiverId = outer[outer.length - 1].id;
            renderChips();
            renderSelects();
            sendMessage();
        });
        wrap.appendChild(chip);
    });
}

// --- Stepper ------------------------------------------------------------------

function renderStepPanel() {
    const panel = document.getElementById('stepPanel');
    panel.innerHTML = state.steps.slice(0, state.current + 1).map((s, i) =>
        `<div class="step-line ${i === state.current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
    ).join('');
    panel.scrollTop = panel.scrollHeight;
}

function renderResultBox() {
    const box = document.getElementById('resultBox');
    const atEnd = state.steps.length > 0 && state.current >= state.steps.length - 1;
    if (!atEnd) {
        box.className = 'result-box';
        box.textContent = state.steps.length ? 'Procedi con i passi per vedere l\'esito finale…' : '';
        return;
    }
    const result = state.result;
    if (result.delivered) {
        box.className = 'result-box good';
        box.textContent = `✓ Consegnato: il messaggio da ${labelOf(state.senderId)} è arrivato a ${labelOf(state.receiverId)}.`;
    } else {
        box.className = 'result-box bad';
        box.textContent = `✗ Non consegnato: il messaggio da ${labelOf(state.senderId)} non è arrivato a ${labelOf(state.receiverId)}.`;
    }
}

function render() {
    const highlight = state.current >= 0 && state.steps[state.current] ? state.steps[state.current].highlight : null;
    renderDiagram(highlight);
    renderStepPanel();
    renderResultBox();
    const atEnd = state.steps.length === 0 || state.current >= state.steps.length - 1;
    document.getElementById('stepBtn').disabled = atEnd;
    const playBtn = document.getElementById('playBtn');
    playBtn.disabled = atEnd;
    playBtn.textContent = state.isPlaying ? '⏸ Pausa' : (atEnd && state.steps.length ? '✓ Completato' : '▶ Avvia');
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
}

function advance() {
    if (state.current >= state.steps.length - 1) { stopPlaying(); return; }
    state.current++;
    render();
    if (state.current >= state.steps.length - 1) stopPlaying();
}

function startPlaying() {
    if (state.current >= state.steps.length - 1) return;
    stopPlaying();
    state.isPlaying = true;
    render();
    state.interval = setInterval(advance, state.speed);
}

function playPause() {
    if (state.isPlaying) { stopPlaying(); render(); }
    else startPlaying();
}

function sendMessage() {
    stopPlaying();
    state.senderId = document.getElementById('senderSelect').value;
    state.receiverId = document.getElementById('receiverSelect').value;
    const result = simulateMessage(state.topology, state.type,
        { brokenNodes: state.brokenNodes, brokenEdges: state.brokenEdges },
        state.senderId, state.receiverId);
    state.result = result;
    state.steps = buildStepsFor(state.type, state.topology, result, state.senderId, state.receiverId);
    state.current = -1;
    render();
}

function resetFaults() {
    state.brokenNodes = new Set();
    state.brokenEdges = new Set();
    sendMessage();
}

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('resetFaultsBtn').addEventListener('click', resetFaults);
document.getElementById('playBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché Internet non è una mesh completa, se è così resistente? ▸'
        : 'Perché Internet non è una mesh completa, se è così resistente? ▾';
});

renderChips();
renderSelects();
sendMessage();
