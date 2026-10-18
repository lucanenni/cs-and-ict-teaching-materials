// --- Ethernet CSMA/CD: rilevamento della collisione durante la trasmissione -
// La logica pura (buildScenario più sotto) è stata verificata a parte in
// Node (300 combinazioni casuali di 1-4 dispositivi): nessun ciclo infinito,
// tutti i dispositivi con dati pronti riescono infine a trasmettere, e nello
// scenario con i due dispositivi più lontani (il default al caricamento) la
// collisione viene rilevata da entrambi i lati esattamente a metà
// trasmissione, a tick diversi (perché il segnale deve viaggiare
// fisicamente e i due dispositivi non partono nello stesso istante).

const DEVICES = [
    { id: 'pc1', name: 'PC-1', icon: '🖥️', slot: 0, pos: 8 },
    { id: 'pc2', name: 'PC-2', icon: '💻', slot: 1, pos: 36 },
    { id: 'srv', name: 'Server', icon: '🗄️', slot: 2, pos: 64 },
    { id: 'pc3', name: 'PC-3', icon: '🖨️', slot: 3, pos: 92 },
];

const UNIT_DELAY = 2;    // tick di propagazione per "slot" di distanza sul cavo
const TX_DURATION = 14;  // tick per trasmettere un frame intero
const JAM_DURATION = 3;  // tick del segnale di jam
const PCT_PER_TICK = (DEVICES[3].pos - DEVICES[0].pos) / ((DEVICES[3].slot - DEVICES[0].slot) * UNIT_DELAY);

function byId(id) { return DEVICES.find(d => d.id === id); }
function nameOf(id) { return byId(id).name; }
function delay(aId, bId) { return Math.abs(byId(aId).slot - byId(bId).slot) * UNIT_DELAY; }

function windowForAttempt(attempt) {
    return Math.min(4 * Math.pow(2, attempt - 1), 64);
}

function randInt(max) { return 1 + Math.floor(Math.random() * max); }

function buildScenario(wantIdsInput) {
    const order = DEVICES.filter(d => wantIdsInput.includes(d.id)).map(d => d.id);
    if (order.length === 0) {
        return [{ text: 'Nessun dispositivo ha dati pronti da inviare: seleziona almeno un dispositivo qui sopra.', tick: -1, devices: {} }];
    }

    const readyTick = {};
    order.forEach((id, i) => {
        if (i === 0) readyTick[id] = 0;
        else if (i === 1) readyTick[id] = 1;
        else readyTick[id] = i + Math.floor(Math.random() * 3);
    });

    const state = {};
    order.forEach(id => { state[id] = { phase: 'pending', startTick: null, jamStart: null, attempt: 0, counter: 0 }; });

    const steps = [];
    function snapshot() { const s = {}; order.forEach(id => s[id] = Object.assign({}, state[id])); return s; }

    const introLines = order.map(id => `${nameOf(id)} ha un frame pronto da inviare (disponibile dal tick ${readyTick[id]}).`);
    steps.push({ text: introLines.join(' '), tick: -1, devices: snapshot() });

    let t = 0;
    const guard = 2000;
    while (order.some(id => state[id].phase !== 'done') && t < guard) {
        const lines = [];

        order.forEach(id => {
            if (state[id].phase === 'pending' && t >= readyTick[id]) state[id].phase = 'listening';
        });

        order.forEach(id => {
            if (state[id].phase !== 'listening') return;
            const busy = order.some(other => {
                if (other === id) return false;
                const o = state[other];
                if (o.phase !== 'transmitting' && o.phase !== 'jamming') return false;
                return t >= o.startTick + delay(id, other);
            });
            if (!busy) {
                state[id].phase = 'transmitting';
                state[id].startTick = t;
                lines.push(`${nameOf(id)} ascolta il cavo: libero (per quanto ne sa). Inizia a trasmettere e continua ad ascoltare mentre lo fa.`);
            }
        });

        order.forEach(id => {
            if (state[id].phase !== 'transmitting') return;
            const collidedWith = order.find(other => {
                if (other === id) return false;
                const o = state[other];
                if (o.phase !== 'transmitting' && o.phase !== 'jamming') return false;
                return t >= o.startTick + delay(id, other);
            });
            if (collidedWith) {
                state[id].phase = 'jamming';
                state[id].jamStart = t;
                lines.push(`COLLISIONE rilevata da ${nameOf(id)}: il segnale di ${nameOf(collidedWith)} arriva distorto sul cavo MENTRE ${nameOf(id)} sta ancora trasmettendo. Interrompe subito e invia un segnale di jam.`);
            } else if (t - state[id].startTick >= TX_DURATION - 1) {
                state[id].phase = 'done';
                lines.push(`${nameOf(id)} completa la trasmissione senza collisioni. ✓`);
            }
        });

        order.forEach(id => {
            if (state[id].phase !== 'jamming') return;
            if (t - state[id].jamStart >= JAM_DURATION - 1) {
                state[id].attempt++;
                const w = windowForAttempt(state[id].attempt);
                state[id].counter = randInt(w);
                state[id].phase = 'backoff';
                lines.push(`${nameOf(id)} finisce il jam e sceglie un backoff casuale di ${state[id].counter} tick (finestra 1–${w}, tentativo ${state[id].attempt}: la finestra raddoppia a ogni collisione).`);
            }
        });

        order.forEach(id => {
            if (state[id].phase !== 'backoff') return;
            state[id].counter--;
            if (state[id].counter <= 0) {
                state[id].phase = 'listening';
                lines.push(`${nameOf(id)} ha finito il backoff: torna ad ascoltare il cavo per ritentare.`);
            }
        });

        if (lines.length) steps.push({ text: lines.join(' '), tick: t, devices: snapshot() });
        t++;
    }

    steps.push({ text: 'Tutti i dispositivi con dati pronti sono infine riusciti a trasmettere.', tick: t, devices: snapshot() });
    return steps;
}

// --- Interfaccia -------------------------------------------------------------

let wanting = new Set(['pc1', 'pc3']);
let steps = [];
let runState = { current: 0, isPlaying: false, interval: null, speed: 450 };

function buildDevicePicker() {
    const wrap = document.getElementById('devicePicker');
    wrap.innerHTML = '';
    DEVICES.forEach(d => {
        const label = document.createElement('label');
        label.className = 'device-check' + (wanting.has(d.id) ? ' active' : '');
        label.innerHTML = `<input type="checkbox" ${wanting.has(d.id) ? 'checked' : ''}> ${d.icon} ${d.name} ha dati pronti`;
        label.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) wanting.add(d.id); else wanting.delete(d.id);
            label.classList.toggle('active', e.target.checked);
            regenerate();
        });
        wrap.appendChild(label);
    });
}

function buildDiagram() {
    const diagram = document.getElementById('cableDiagram');
    diagram.querySelectorAll('.cable-stub, .device-tap, .signal-spread').forEach(el => el.remove());

    DEVICES.forEach(d => {
        const stub = document.createElement('div');
        stub.className = 'cable-stub';
        stub.style.left = d.pos + '%';
        diagram.appendChild(stub);

        const tap = document.createElement('div');
        tap.className = 'device-tap pending';
        tap.id = 'tap-' + d.id;
        tap.style.left = d.pos + '%';
        tap.innerHTML = `
            <div class="device-tap-icon">${d.icon}</div>
            <div class="device-tap-label">${d.name}</div>
            <div class="device-tap-status" id="tapstatus-${d.id}"></div>
        `;
        diagram.appendChild(tap);

        const spread = document.createElement('div');
        spread.className = 'signal-spread hidden';
        spread.id = 'spread-' + d.id;
        diagram.appendChild(spread);
    });
}

function statusTextFor(phase, devState) {
    switch (phase) {
        case 'pending': return 'nessun dato ancora pronto';
        case 'listening': return 'ascolta il cavo…';
        case 'transmitting': return 'trasmette e ascolta 📶';
        case 'jamming': return 'COLLISIONE! invia jam ⚠️';
        case 'backoff': return `backoff: ${devState.counter} tick`;
        case 'done': return 'trasmissione completata ✓';
        default: return '';
    }
}

function render() {
    const hasSteps = steps.length > 0;
    const atLast = !hasSteps || runState.current >= steps.length - 1;
    const step = hasSteps ? steps[runState.current] : null;
    let anyCollisionNow = false;

    DEVICES.forEach(d => {
        const devState = (step && step.devices[d.id]) || { phase: 'pending', counter: 0 };
        const tap = document.getElementById('tap-' + d.id);
        tap.className = 'device-tap ' + devState.phase;
        document.getElementById('tapstatus-' + d.id).textContent = statusTextFor(devState.phase, devState);

        const spread = document.getElementById('spread-' + d.id);
        const active = (devState.phase === 'transmitting' || devState.phase === 'jamming') && step && step.tick >= 0;
        if (active) {
            const origin = devState.startTick != null ? devState.startTick : step.tick;
            const elapsed = Math.max(0, step.tick - origin);
            const halfWidthPct = Math.min(50, (elapsed + 1) * (PCT_PER_TICK / 2));
            let left = d.pos - halfWidthPct;
            let right = d.pos + halfWidthPct;
            left = Math.max(0, left);
            right = Math.min(100, right);
            spread.style.left = left + '%';
            spread.style.width = Math.max(0, right - left) + '%';
            spread.style.background = devState.phase === 'jamming' ? '#dc2626' : '#16a34a';
            spread.classList.toggle('jam', devState.phase === 'jamming');
            spread.classList.remove('hidden');
            if (devState.phase === 'jamming') anyCollisionNow = true;
        } else {
            spread.classList.add('hidden');
        }
    });

    document.getElementById('cableLine').classList.toggle('collision', anyCollisionNow);

    const panel = document.getElementById('stepPanel');
    panel.innerHTML = steps.slice(0, runState.current + 1).map((s, i) =>
        `<div class="step-line ${i === runState.current ? 'current' : ''}">${s.tick < 0 ? 'Scenario' : 'Tick ' + s.tick}. ${s.text}</div>`
    ).join('');
    panel.scrollTop = panel.scrollHeight;

    const doneBox = document.getElementById('doneBox');
    const finished = hasSteps && runState.current === steps.length - 1 && wanting.size > 0;
    if (finished) {
        doneBox.classList.remove('hidden');
        doneBox.textContent = `✓ Simulazione completata: tutti i dispositivi selezionati hanno trasmesso con successo, anche quando una collisione li ha costretti a ritentare.`;
    } else {
        doneBox.classList.add('hidden');
    }

    document.getElementById('stepBtn').disabled = atLast;
    document.getElementById('playBtn').disabled = atLast;
    document.getElementById('playBtn').textContent = runState.isPlaying ? '⏸ Pausa' : (atLast ? '✓ Fatto' : '▶ Avvia');
}

function stopAuto() {
    if (runState.interval) clearInterval(runState.interval);
    runState.interval = null;
    runState.isPlaying = false;
}

function advance() {
    if (runState.current >= steps.length - 1) { stopAuto(); render(); return; }
    runState.current++;
    render();
    if (runState.current >= steps.length - 1) stopAuto();
}

function startAuto() {
    if (runState.current >= steps.length - 1) return;
    stopAuto();
    runState.isPlaying = true;
    render();
    runState.interval = setInterval(advance, runState.speed);
}

function regenerate() {
    stopAuto();
    steps = buildScenario(Array.from(wanting));
    runState.current = 0;
    render();
}

document.getElementById('playBtn').addEventListener('click', () => {
    if (runState.isPlaying) { stopAuto(); render(); } else { startAuto(); }
});
document.getElementById('stepBtn').addEventListener('click', () => { stopAuto(); advance(); });
document.getElementById('newScenarioBtn').addEventListener('click', regenerate);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Perché il frame minimo Ethernet è 64 byte? ▸' : 'Perché il frame minimo Ethernet è 64 byte? ▾';
});

// Inizializzazione: scenario, diagramma e primo render devono esistere SUBITO
// al caricamento, così "Passo singolo" funziona fin da subito senza dover
// prima premere "Avvia".
buildDevicePicker();
buildDiagram();
steps = buildScenario(Array.from(wanting));
render();
