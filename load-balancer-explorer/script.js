// --- Confronto Round Robin vs Least Connections -----------------------------
const SERVERS = ['A', 'B', 'C'];

// Ogni richiesta arriva a un certo tick e occupa il server per "duration"
// tick (dal tick di arrivo incluso, liberato esattamente al tick arrivo+durata).
const REQUESTS = [
    { id: 1, arrivalTick: 0, duration: 6 },
    { id: 2, arrivalTick: 1, duration: 1 },
    { id: 3, arrivalTick: 1, duration: 1 },
    { id: 4, arrivalTick: 2, duration: 1 },
    { id: 5, arrivalTick: 3, duration: 1 },
    { id: 6, arrivalTick: 4, duration: 1 },
    { id: 7, arrivalTick: 5, duration: 1 },
    { id: 8, arrivalTick: 6, duration: 1 }
];

const MAX_TICK = Math.max(...REQUESTS.map(r => r.arrivalTick)) + 2;

// Simula l'intera pianificazione con una strategia data. `pickServer(active)`
// riceve il numero di connessioni attive per ciascun server IN QUEL preciso
// istante e restituisce l'indice del server scelto.
function simulate(pickServer) {
    const activeUntil = SERVERS.map(() => []); // per server: lista di tick di fine connessione attiva
    const assignments = []; // { id, server, tick }
    const history = []; // { tick, counts: [...] } per l'animazione

    const byTick = {};
    REQUESTS.forEach(r => { (byTick[r.arrivalTick] = byTick[r.arrivalTick] || []).push(r); });

    for (let tick = 0; tick <= MAX_TICK; tick++) {
        // libera le connessioni che finiscono esattamente a questo tick
        activeUntil.forEach((list, i) => {
            activeUntil[i] = list.filter(end => end > tick);
        });

        const arrivals = (byTick[tick] || []).slice().sort((a, b) => a.id - b.id);
        arrivals.forEach(req => {
            const counts = activeUntil.map(list => list.length);
            const serverIdx = pickServer(counts);
            activeUntil[serverIdx].push(tick + req.duration);
            assignments.push({ id: req.id, server: SERVERS[serverIdx], serverIdx, tick, countsAtAssignment: counts.slice() });
        });

        history.push({ tick, counts: activeUntil.map(list => list.length) });
    }

    return { assignments, history };
}

function roundRobinPick() {
    let next = 0;
    return () => {
        const chosen = next;
        next = (next + 1) % SERVERS.length;
        return chosen;
    };
}

// Sceglie sempre un server con il minimo numero di connessioni attive. Tra
// più server in parità, ruota equamente invece di preferire sempre lo stesso
// indice: è così che si comportano i bilanciatori reali, per non far
// monopolizzare i pareggi a un solo server "fortunato".
function leastConnectionsPick() {
    let rotor = 0;
    return (counts) => {
        const min = Math.min(...counts);
        for (let offset = 0; offset < counts.length; offset++) {
            const idx = (rotor + offset) % counts.length;
            if (counts[idx] === min) {
                rotor = (idx + 1) % counts.length;
                return idx;
            }
        }
        return 0;
    };
}

function runBoth() {
    return {
        roundRobin: simulate(roundRobinPick()),
        leastConnections: simulate(leastConnectionsPick())
    };
}

// --- Interfaccia --------------------------------------------------------------

let state = { tick: -1, isPlaying: false, interval: null, speed: 900, results: null };

function renderSchedule() {
    const wrap = document.getElementById('scheduleList');
    wrap.innerHTML = REQUESTS.map(r =>
        `<span class="req-chip" id="req-${r.id}">#${r.id}: arriva a t=${r.arrivalTick}, dura ${r.duration}${r.duration > 1 ? ' tick' : ' tick'}</span>`
    ).join('');
}

function serverBoxHtml(strategyId, name, count) {
    const bars = Array.from({ length: Math.max(count, 1) }, (_, i) => i < count ? '<span class="conn-dot"></span>' : '').join('');
    return `<div class="server-box" id="${strategyId}-server-${name}">
        <div class="server-name">Server ${name}</div>
        <div class="conn-count">${count}</div>
        <div class="conn-dots">${bars}</div>
    </div>`;
}

function renderPanel(strategyId, result) {
    const wrap = document.getElementById(strategyId + 'Servers');
    const counts = state.tick >= 0 ? result.history[state.tick].counts : SERVERS.map(() => 0);
    wrap.innerHTML = SERVERS.map((name, i) => serverBoxHtml(strategyId, name, counts[i])).join('');

    const logWrap = document.getElementById(strategyId + 'Log');
    const assignedSoFar = result.assignments.filter(a => a.tick <= state.tick);
    logWrap.innerHTML = assignedSoFar.map(a => {
        const countsText = SERVERS.map((s, i) => `${s}=${a.countsAtAssignment[i]}`).join(' ');
        return `<div class="log-line">t=${a.tick}: richiesta #${a.id} → Server ${a.server} (connessioni al momento: ${countsText})</div>`;
    }).reverse().join('');
}

function peakConnections(result) {
    return SERVERS.map((name, i) => Math.max(...result.history.map(h => h.counts[i])));
}

function renderSummary() {
    const box = document.getElementById('summaryBox');
    if (state.tick < MAX_TICK) { box.innerHTML = ''; return; }
    const rrPeaks = peakConnections(state.results.roundRobin);
    const lcPeaks = peakConnections(state.results.leastConnections);
    box.innerHTML = `
        <h3 class="summary-title">Picco massimo di connessioni simultanee per server</h3>
        <div class="summary-row">
            <span class="summary-label">Round Robin</span>
            ${SERVERS.map((s, i) => `<span class="peak-badge">${s}: ${rrPeaks[i]}</span>`).join('')}
        </div>
        <div class="summary-row">
            <span class="summary-label">Least Connections</span>
            ${SERVERS.map((s, i) => `<span class="peak-badge good">${s}: ${lcPeaks[i]}</span>`).join('')}
        </div>
        <p class="summary-note">Round Robin ha continuato ad assegnare nuove richieste al Server A anche mentre era
            già occupato dalla richiesta lunga #1, semplicemente perché "toccava a lui" nel giro. Least Connections
            se n'è accorto e ha spostato le richieste successive sui server più liberi.</p>
    `;
}

function render() {
    document.getElementById('tickLabel').textContent = state.tick < 0 ? 'Non ancora avviato' : `Tick ${state.tick} di ${MAX_TICK}`;
    document.querySelectorAll('.req-chip').forEach(el => el.classList.remove('arrived'));
    if (state.tick >= 0) {
        REQUESTS.filter(r => r.arrivalTick <= state.tick).forEach(r => {
            document.getElementById('req-' + r.id).classList.add('arrived');
        });
    }
    renderPanel('rr', state.results.roundRobin);
    renderPanel('lc', state.results.leastConnections);
    renderSummary();

    const atEnd = state.tick >= MAX_TICK;
    document.getElementById('stepBtn').disabled = atEnd;
    const playBtn = document.getElementById('playBtn');
    if (state.isPlaying) playBtn.textContent = '⏸ Pausa';
    else if (atEnd) playBtn.textContent = '✓ Completato';
    else playBtn.textContent = '▶ Avvia';
}

function advance() {
    if (state.tick >= MAX_TICK) { stopPlaying(); render(); return; }
    state.tick++;
    render();
    if (state.tick >= MAX_TICK) stopPlaying();
}

function startPlaying() {
    if (state.tick >= MAX_TICK) return;
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    render();
    state.interval = setInterval(advance, state.speed);
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
}

function reset() {
    stopPlaying();
    state.tick = -1;
    state.results = runBoth();
    render();
}

document.getElementById('playBtn').addEventListener('click', () => {
    if (state.isPlaying) { stopPlaying(); render(); } else { startPlaying(); }
});
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });
document.getElementById('resetBtn').addEventListener('click', reset);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Least Connections è sempre la scelta migliore? ▸'
        : 'Least Connections è sempre la scelta migliore? ▾';
});

renderSchedule();
reset();
