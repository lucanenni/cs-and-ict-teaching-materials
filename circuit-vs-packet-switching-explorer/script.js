// =============================================================================
// Logica pura: commutazione di circuito vs di pacchetto (testata a parte in
// Node, vedi test-circuit-packet.js nello scratchpad di sviluppo: nessun
// riferimento al DOM qui sotto).
// =============================================================================
const HOPS = ['S-N1', 'N1-N2-A', 'N2-N3', 'N3-D']; // percorso fisso riservato dal circuito (usa sempre la via A)
const TURNS = ['talk', 'talk', 'silence', 'talk', 'silence', 'talk'];
const NUM_PACKETS = 5;
const OTHER_USER_PACKETS = 3;

function buildCircuitSteps(turns) {
    const steps = [];
    HOPS.forEach(h => steps.push({ phase: 'setup', link: h, text: `SETUP: riserva il collegamento ${h}.` }));
    steps.push({ phase: 'setup-done', text: 'Canale dedicato stabilito end-to-end: per tutta la sessione nessun altro traffico potrà usare questi stessi collegamenti.' });
    turns.forEach((t, i) => {
        if (t === 'talk') {
            steps.push({ phase: 'data', turn: i, active: true, text: `Turno ${i + 1}: dati in transito lungo il canale già riservato (nessun indirizzo necessario).` });
        } else {
            steps.push({ phase: 'data', turn: i, active: false, wasted: true, text: `Turno ${i + 1}: silenzio nella conversazione — il canale resta comunque riservato ed è quindi banda sprecata.` });
        }
    });
    HOPS.forEach(h => steps.push({ phase: 'teardown', link: h, text: `TEARDOWN: libera il collegamento ${h}.` }));
    return steps;
}

function circuitSummary(turns) {
    const setupHops = HOPS.length;
    const teardownHops = HOPS.length;
    const wastedTurns = turns.filter(t => t === 'silence').length;
    return { setupHops, teardownHops, wastedTurns, totalTurns: turns.length, sharable: false };
}

// I pacchetti del "nostro" utente alternano il collegamento N1-N2 tra due vie
// parallele A/B; i pacchetti dell'altro utente condividono gli stessi
// collegamenti, intrecciati nel tempo (multiplexing statistico).
function buildPacketStream(numPackets, otherUserPackets) {
    const ours = Array.from({ length: numPackets }, (_, i) => ({
        id: i + 1, owner: 'tu', link: i % 2 === 0 ? 'A' : 'B'
    }));
    const other = Array.from({ length: otherUserPackets }, (_, i) => ({
        id: i + 1, owner: 'altro', link: i % 2 === 0 ? 'B' : 'A'
    }));
    const merged = [];
    let oi = 0, ti = 0;
    while (ti < ours.length || oi < other.length) {
        if (ti < ours.length) merged.push(ours[ti++]);
        if (ti < ours.length) merged.push(ours[ti++]);
        if (oi < other.length) merged.push(other[oi++]);
    }
    return merged;
}

function buildPacketSteps(numPackets, otherUserPackets) {
    const stream = buildPacketStream(numPackets, otherUserPackets);
    return stream.map(p => ({
        phase: 'packet',
        packet: p,
        text: p.owner === 'tu'
            ? `Pacchetto #${p.id} (tuo): instradato in modo indipendente, con il proprio indirizzo di destinazione; attraversa N1→N2 via collegamento ${p.link}.`
            : `Pacchetto #${p.id} (altro utente): condivide in questo stesso istante gli stessi collegamenti, via ${p.link} — impossibile su un canale a circuito riservato.`
    }));
}

function packetSummary(numPackets, otherUserPackets) {
    const stream = buildPacketStream(numPackets, otherUserPackets);
    const linksUsed = new Set(stream.map(p => p.link));
    return {
        totalPackets: stream.length,
        ourPackets: numPackets,
        otherPackets: otherUserPackets,
        sharable: true,
        multiplePaths: linksUsed.size > 1
    };
}

if (typeof module !== 'undefined') {
    module.exports = { HOPS, TURNS, buildCircuitSteps, circuitSummary, buildPacketStream, buildPacketSteps, packetSummary };
}

// =============================================================================
// UI: diagramma, modalità, step-by-step
// =============================================================================

const NODE_POS = {
    S: { x: 40, y: 75 },
    N1: { x: 170, y: 75 },
    N2: { x: 330, y: 75 },
    N3: { x: 460, y: 75 },
    D: { x: 580, y: 75 }
};

const LINK_DEFS = [
    { id: 'S-N1', from: 'S', to: 'N1', shape: 'line' },
    { id: 'N1-N2-A', from: 'N1', to: 'N2', shape: 'arc-up' },
    { id: 'N1-N2-B', from: 'N1', to: 'N2', shape: 'arc-down' },
    { id: 'N2-N3', from: 'N2', to: 'N3', shape: 'line' },
    { id: 'N3-D', from: 'N3', to: 'D', shape: 'line' }
];

const MODES = [
    { type: 'circuit', label: 'Commutazione di circuito' },
    { type: 'packet', label: 'Commutazione di pacchetto' }
];

const LEGEND = {
    circuit: [
        { cls: 'reserved', label: 'canale riservato (inattivo)' },
        { cls: 'flowing', label: 'dati in transito' },
        { cls: 'idle-reserved', label: 'riservato ma in silenzio (spreco)' }
    ],
    packet: [
        { cls: 'packet-mine', label: 'pacchetto tuo' },
        { cls: 'packet-other', label: 'pacchetto di un altro utente' }
    ]
};

function annotateCircuitSteps(rawSteps) {
    return rawSteps.map(step => {
        const linksState = {};
        if (step.phase === 'setup') {
            const upto = HOPS.indexOf(step.link);
            HOPS.forEach((id, i) => { linksState[id] = i <= upto ? 'reserved' : 'none'; });
        } else if (step.phase === 'setup-done') {
            HOPS.forEach(id => { linksState[id] = 'reserved'; });
        } else if (step.phase === 'data') {
            HOPS.forEach(id => { linksState[id] = step.active ? 'flowing' : 'idle-reserved'; });
        } else if (step.phase === 'teardown') {
            const upto = HOPS.indexOf(step.link);
            HOPS.forEach((id, i) => { linksState[id] = i <= upto ? 'none' : 'reserved'; });
        }
        return { text: step.text, linksState };
    });
}

function annotatePacketSteps(rawSteps) {
    return rawSteps.map(step => {
        const p = step.packet;
        const altLink = p.link === 'A' ? 'B' : 'A';
        const cls = p.owner === 'tu' ? 'packet-mine' : 'packet-other';
        const linksState = {
            'S-N1': cls,
            ['N1-N2-' + p.link]: cls,
            ['N1-N2-' + altLink]: 'none',
            'N2-N3': cls,
            'N3-D': cls
        };
        return { text: step.text, linksState };
    });
}

const state = {
    mode: 'circuit',
    uiSteps: [],
    current: -1,
    isPlaying: false,
    interval: null,
    speed: 1100
};

function buildStepsForMode(mode) {
    if (mode === 'circuit') return annotateCircuitSteps(buildCircuitSteps(TURNS));
    return annotatePacketSteps(buildPacketSteps(NUM_PACKETS, OTHER_USER_PACKETS));
}

function linkPathD(def) {
    const a = NODE_POS[def.from], b = NODE_POS[def.to];
    if (def.shape === 'line') return `M${a.x},${a.y} L${b.x},${b.y}`;
    const midX = (a.x + b.x) / 2;
    const ctrlY = def.shape === 'arc-up' ? a.y - 45 : a.y + 45;
    return `M${a.x},${a.y} Q${midX},${ctrlY} ${b.x},${b.y}`;
}

function renderDiagram(linksState) {
    linksState = linksState || {};
    let html = '';
    LINK_DEFS.forEach(def => {
        const st = linksState[def.id] || 'none';
        const cls = 'net-link' + (st !== 'none' ? ' ' + st : '');
        html += `<path class="${cls}" d="${linkPathD(def)}" fill="none"></path>`;
    });
    Object.entries(NODE_POS).forEach(([label, p]) => {
        const isEndpoint = label === 'S' || label === 'D';
        let activeNode = false;
        LINK_DEFS.forEach(def => {
            if ((def.from === label || def.to === label) && linksState[def.id] && linksState[def.id] !== 'none') activeNode = true;
        });
        const cls = 'net-node' + (isEndpoint ? ' endpoint' : '') + (activeNode ? ' active' : '');
        const name = label === 'S' ? 'Mittente' : label === 'D' ? 'Destinatario' : label;
        html += `
            <g class="${cls}">
                <circle cx="${p.x}" cy="${p.y}" r="${isEndpoint ? 24 : 20}"></circle>
                <text x="${p.x}" y="${p.y - (isEndpoint ? 34 : 30)}" text-anchor="middle">${name}</text>
            </g>`;
    });
    document.getElementById('netSvg').innerHTML = html;
}

function renderLegend() {
    const wrap = document.getElementById('legendRow');
    wrap.innerHTML = LEGEND[state.mode].map(item =>
        `<span class="counter-pill"><span style="display:inline-block;width:0.8rem;height:0.5rem;border-radius:2px;background:${legendColor(item.cls)}"></span> ${item.label}</span>`
    ).join('');
}

function legendColor(cls) {
    switch (cls) {
        case 'reserved': return '#93c5fd';
        case 'flowing': return '#2563eb';
        case 'idle-reserved': return '#fbbf24';
        case 'packet-mine': return '#16a34a';
        case 'packet-other': return '#d97706';
        default: return '#e5e7eb';
    }
}

function renderChips() {
    const wrap = document.getElementById('modeChips');
    wrap.innerHTML = '';
    MODES.forEach(m => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'mode-chip' + (m.type === state.mode ? ' active' : '');
        chip.textContent = m.label;
        chip.addEventListener('click', () => {
            if (state.mode === m.type) return;
            state.mode = m.type;
            renderChips();
            startNewRun();
        });
        wrap.appendChild(chip);
    });
}

function renderStepPanel() {
    const panel = document.getElementById('stepPanel');
    panel.innerHTML = state.uiSteps.slice(0, state.current + 1).map((s, i) =>
        `<div class="step-line ${i === state.current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
    ).join('');
    panel.scrollTop = panel.scrollHeight;
}

function renderResultBox() {
    const box = document.getElementById('resultBox');
    const atEnd = state.uiSteps.length > 0 && state.current >= state.uiSteps.length - 1;
    if (!atEnd) {
        box.className = 'result-box';
        box.textContent = 'Procedi con i passi per vedere l\'esito finale…';
        return;
    }
    if (state.mode === 'circuit') {
        const s = circuitSummary(TURNS);
        box.className = 'result-box bad';
        box.textContent = `Sessione conclusa: ${s.setupHops} passi di setup + ${s.teardownHops} di teardown, e ${s.wastedTurns} turni su ${s.totalTurns} con il canale riservato ma inutilizzato (silenzio).`;
    } else {
        const s = packetSummary(NUM_PACKETS, OTHER_USER_PACKETS);
        box.className = 'result-box good';
        box.textContent = `Trasmessi ${s.totalPackets} pacchetti (${s.ourPackets} tuoi + ${s.otherPackets} di un altro utente) condividendo gli stessi collegamenti in parallelo, senza nessun setup né teardown.`;
    }
}

function render() {
    const step = state.current >= 0 ? state.uiSteps[state.current] : null;
    renderDiagram(step ? step.linksState : null);
    renderStepPanel();
    renderResultBox();
    const atEnd = state.uiSteps.length === 0 || state.current >= state.uiSteps.length - 1;
    document.getElementById('stepBtn').disabled = atEnd;
    const playBtn = document.getElementById('playBtn');
    playBtn.disabled = atEnd;
    playBtn.textContent = state.isPlaying ? '⏸ Pausa' : (atEnd && state.uiSteps.length ? '✓ Completato' : '▶ Avvia');
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
}

function advance() {
    if (state.current >= state.uiSteps.length - 1) { stopPlaying(); return; }
    state.current++;
    render();
    if (state.current >= state.uiSteps.length - 1) stopPlaying();
}

function startPlaying() {
    if (state.current >= state.uiSteps.length - 1) return;
    stopPlaying();
    state.isPlaying = true;
    render();
    state.interval = setInterval(advance, state.speed);
}

function playPause() {
    if (state.isPlaying) { stopPlaying(); render(); }
    else startPlaying();
}

function startNewRun() {
    stopPlaying();
    state.uiSteps = buildStepsForMode(state.mode);
    state.current = -1;
    renderLegend();
    render();
}

document.getElementById('playBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });
document.getElementById('resetBtn').addEventListener('click', startNewRun);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché allora alcune applicazioni (voce, videochiamate) sembrano comunque "a canale dedicato"? ▸'
        : 'Perché allora alcune applicazioni (voce, videochiamate) sembrano comunque "a canale dedicato"? ▾';
});

renderChips();
startNewRun();
