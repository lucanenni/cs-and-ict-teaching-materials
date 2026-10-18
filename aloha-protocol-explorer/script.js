// =============================================================================
// Logica pura: ALOHA puro vs Slotted ALOHA (testata a parte in Node, vedi
// test-aloha.js nello scratchpad di sviluppo: nessun riferimento al DOM qui
// sotto, solo dati in ingresso/uscita).
// =============================================================================
const FRAME_DURATION = 1; // durata fissa di trasmissione di un frame

// ALOHA puro: due trasmissioni collidono se i loro intervalli [start, start+durata)
// si sovrappongono anche solo parzialmente.
function pureAlohaCollisions(frames, duration = FRAME_DURATION) {
    const collided = new Set();
    for (let i = 0; i < frames.length; i++) {
        for (let j = i + 1; j < frames.length; j++) {
            const a = frames[i], b = frames[j];
            const overlap = a.start < b.start + duration && b.start < a.start + duration;
            if (overlap) { collided.add(a.id); collided.add(b.id); }
        }
    }
    return collided;
}

// Slotted ALOHA: una stazione pronta deve aspettare l'inizio del prossimo slot
// (se arriva esattamente sul confine di uno slot, trasmette in quello slot).
function assignSlots(frames, slotDuration = FRAME_DURATION) {
    return frames.map(f => {
        const onBoundary = Math.abs(f.start % slotDuration) < 1e-9;
        const slot = onBoundary ? Math.round(f.start / slotDuration) : Math.floor(f.start / slotDuration) + 1;
        return { id: f.id, start: f.start, slot };
    });
}

// Collisione slotted: due o più stazioni scelgono lo stesso slot.
function slottedAlohaCollisions(assignedFrames) {
    const bySlot = {};
    assignedFrames.forEach(a => {
        (bySlot[a.slot] = bySlot[a.slot] || []).push(a.id);
    });
    const collided = new Set();
    Object.values(bySlot).forEach(ids => {
        if (ids.length > 1) ids.forEach(id => collided.add(id));
    });
    return collided;
}

if (typeof module !== 'undefined') {
    module.exports = { FRAME_DURATION, pureAlohaCollisions, assignSlots, slottedAlohaCollisions };
}

// =============================================================================
// UI: timeline, stepper, contatori per le due colonne (puro / slotted)
// =============================================================================

const STATIONS = ['A', 'B', 'C', 'D', 'E'];

// Sequenza di esempio fissa e nota in anticipo (stessa per entrambe le
// colonne): la stazione A invia due frame, le altre uno ciascuna.
const DEFAULT_FRAMES = [
    { id: 'A1', start: 0.0, station: 'A' },
    { id: 'B', start: 0.9, station: 'B' },
    { id: 'C', start: 1.1, station: 'C' },
    { id: 'D', start: 4.0, station: 'D' },
    { id: 'A2', start: 6.5, station: 'A' },
    { id: 'E', start: 7.0, station: 'E' }
];

function randomFrames() {
    const n = 5 + Math.floor(Math.random() * 3); // 5-7 frame
    const counts = {};
    const frames = [];
    for (let i = 0; i < n; i++) {
        const station = STATIONS[Math.floor(Math.random() * STATIONS.length)];
        counts[station] = (counts[station] || 0) + 1;
        const start = Math.round(Math.random() * 80) / 10; // 0.0 - 8.0
        frames.push({ id: station + counts[station], start, station });
    }
    frames.sort((a, b) => a.start - b.start);
    return frames;
}

// --- Geometria della timeline -------------------------------------------
const ORIGIN_X = 45, PX_PER_UNIT = 50, TOP_PAD = 26, LANE_H = 34;

function timeToX(t) { return ORIGIN_X + t * PX_PER_UNIT; }
function laneY(stationIndex) { return TOP_PAD + stationIndex * LANE_H; }
function computeMaxTime(frames) {
    const maxStart = Math.max(...frames.map(f => f.start));
    return Math.max(8, Math.ceil(maxStart + FRAME_DURATION + 1));
}

// --- Costruzione dei dati di una colonna ----------------------------------

function buildPureColumn(frames) {
    const collided = pureAlohaCollisions(frames, FRAME_DURATION);
    const order = [...frames].sort((a, b) => a.start - b.start);
    const steps = order.map(f => ({
        text: collided.has(f.id)
            ? `Stazione ${f.station} trasmette a t=${f.start.toFixed(1)}: <strong>COLLISIONE</strong> — si sovrappone con un'altra trasmissione in corso. Entrambi i frame coinvolti sono persi e dovranno essere ritrasmessi dopo un'attesa casuale.`
            : `Stazione ${f.station} trasmette a t=${f.start.toFixed(1)}: nessuna sovrapposizione in questo istante, il frame arriva correttamente.`,
        revealIds: [f.id]
    }));
    const posOf = {}, statusOf = {};
    frames.forEach(f => {
        const x = timeToX(f.start);
        posOf[f.id] = { x, width: Math.max(timeToX(f.start + FRAME_DURATION) - x, 10) };
        statusOf[f.id] = collided.has(f.id) ? 'collision' : 'success';
    });
    return { frames, steps, posOf, statusOf, slotted: false, maxTime: computeMaxTime(frames) };
}

function buildSlottedColumn(frames) {
    const assigned = assignSlots(frames, FRAME_DURATION);
    const collided = slottedAlohaCollisions(assigned);
    const idToFrame = {};
    frames.forEach(f => { idToFrame[f.id] = f; });
    const bySlot = {};
    assigned.forEach(a => { (bySlot[a.slot] = bySlot[a.slot] || []).push(a); });
    const slotNums = Object.keys(bySlot).map(Number).sort((a, b) => a - b);
    const steps = slotNums.map(slot => {
        const group = bySlot[slot];
        const names = group.map(g => idToFrame[g.id].station);
        const hasCollision = group.length > 1;
        return {
            text: hasCollision
                ? `Slot ${slot}: le stazioni ${names.join(' e ')} trasmettono entrambe in questo stesso slot — <strong>COLLISIONE</strong>, entrambi i frame sono persi.`
                : `Slot ${slot}: la stazione ${names[0]} trasmette da sola in questo slot — successo.`,
            revealIds: group.map(g => g.id)
        };
    });
    const posOf = {}, statusOf = {};
    assigned.forEach(a => {
        posOf[a.id] = { x: timeToX(a.slot * FRAME_DURATION), width: timeToX(FRAME_DURATION) - timeToX(0) };
        statusOf[a.id] = collided.has(a.id) ? 'collision' : 'success';
    });
    return { frames, steps, posOf, statusOf, slotted: true, maxTime: computeMaxTime(frames) };
}

// --- Controller generico per una colonna (puro o slotted) -------------------

function makeColumnController(prefix, initialData) {
    let data = initialData;
    let current = -1;
    let interval = null;

    function renderTimeline() {
        const revealed = new Set();
        for (let i = 0; i <= current; i++) data.steps[i].revealIds.forEach(id => revealed.add(id));

        let html = '';
        const bottomY = TOP_PAD + STATIONS.length * LANE_H;

        if (data.slotted) {
            const slots = Math.ceil(data.maxTime / FRAME_DURATION);
            for (let s = 0; s < slots; s++) {
                const x0 = timeToX(s * FRAME_DURATION), x1 = timeToX((s + 1) * FRAME_DURATION);
                html += `<rect class="slot-band${s % 2 ? ' odd' : ''}" x="${x0}" y="${TOP_PAD - 6}" width="${x1 - x0}" height="${STATIONS.length * LANE_H + 10}"></rect>`;
            }
        }

        for (let t = 0; t <= Math.ceil(data.maxTime); t++) {
            const x = timeToX(t);
            html += `<line class="tick-line" x1="${x}" y1="${TOP_PAD - 6}" x2="${x}" y2="${bottomY + 4}"></line>`;
            html += `<text class="tick-label" x="${x}" y="${bottomY + 16}" text-anchor="middle">${t}</text>`;
        }

        STATIONS.forEach((s, i) => {
            html += `<text class="lane-label" x="6" y="${laneY(i) + 15}">${s}</text>`;
        });

        data.frames.forEach(f => {
            const laneIdx = STATIONS.indexOf(f.station);
            const p = data.posOf[f.id];
            const status = revealed.has(f.id) ? data.statusOf[f.id] : 'pending';
            html += `<rect class="frame-rect ${status}" x="${p.x}" y="${laneY(laneIdx) + 4}" width="${p.width}" height="22" rx="3"></rect>`;
            html += `<text x="${p.x + 4}" y="${laneY(laneIdx) + 19}" font-size="9" fill="#374151">${f.id}</text>`;
        });

        document.getElementById(prefix + 'Svg').innerHTML = html;
    }

    function renderCounters() {
        const revealed = new Set();
        for (let i = 0; i <= current; i++) data.steps[i].revealIds.forEach(id => revealed.add(id));
        const attempted = revealed.size;
        let succeeded = 0;
        revealed.forEach(id => { if (data.statusOf[id] === 'success') succeeded++; });
        const efficiency = attempted ? Math.round((succeeded / attempted) * 1000) / 10 : 0;
        document.getElementById(prefix + 'Counters').innerHTML = `
            <span class="counter-pill">tentati: <strong>${attempted}</strong></span>
            <span class="counter-pill">riusciti: <strong>${succeeded}</strong></span>
            <span class="counter-pill">efficienza: <strong>${efficiency}%</strong></span>`;
    }

    function renderStepPanel() {
        const panel = document.getElementById(prefix + 'StepPanel');
        panel.innerHTML = data.steps.slice(0, current + 1).map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
        ).join('');
        panel.scrollTop = panel.scrollHeight;
    }

    function render() {
        renderTimeline();
        renderCounters();
        renderStepPanel();
        const atEnd = data.steps.length === 0 || current >= data.steps.length - 1;
        document.getElementById(prefix + 'StepBtn').disabled = atEnd;
        const runBtn = document.getElementById(prefix + 'RunBtn');
        runBtn.disabled = atEnd;
        runBtn.textContent = interval ? '⏸ Pausa' : (atEnd && data.steps.length ? '✓ Completato' : '▶ Avvia');
    }

    function stopAuto() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    function advance() {
        if (current >= data.steps.length - 1) { stopAuto(); return; }
        current++;
        render();
        if (current >= data.steps.length - 1) stopAuto();
    }

    // IMPORTANTE: il primo render avviene subito alla creazione, con current
    // = -1, PRIMA di qualunque click. "Passo singolo" è già abilitato e
    // funzionante da qui in poi senza bisogno di premere prima "Avvia".
    render();

    return {
        stepOnce() { stopAuto(); advance(); },
        playPause() {
            if (interval) { stopAuto(); render(); return; }
            if (current >= data.steps.length - 1) return;
            interval = setInterval(advance, 900);
            render();
        },
        reset(newData) {
            stopAuto();
            data = newData;
            current = -1;
            render();
        }
    };
}

const pureCtrl = makeColumnController('pure', buildPureColumn(DEFAULT_FRAMES));
const slottedCtrl = makeColumnController('slotted', buildSlottedColumn(DEFAULT_FRAMES));

document.getElementById('pureRunBtn').addEventListener('click', () => pureCtrl.playPause());
document.getElementById('pureStepBtn').addEventListener('click', () => pureCtrl.stepOnce());
document.getElementById('slottedRunBtn').addEventListener('click', () => slottedCtrl.playPause());
document.getElementById('slottedStepBtn').addEventListener('click', () => slottedCtrl.stepOnce());

document.getElementById('newTrafficBtn').addEventListener('click', () => {
    const frames = randomFrames();
    pureCtrl.reset(buildPureColumn(frames));
    slottedCtrl.reset(buildSlottedColumn(frames));
});

document.getElementById('defaultTrafficBtn').addEventListener('click', () => {
    pureCtrl.reset(buildPureColumn(DEFAULT_FRAMES));
    slottedCtrl.reset(buildSlottedColumn(DEFAULT_FRAMES));
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non arrivare semplicemente al 100% riducendo ancora lo slot? ▸'
        : 'Perché non arrivare semplicemente al 100% riducendo ancora lo slot? ▾';
});
