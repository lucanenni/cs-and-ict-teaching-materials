// --- Replicazione primario/repliche: scritture, propagazione e lag --------
const INITIAL_VALUE = 'In elaborazione';

function makeReplicationState() {
    return {
        clock: 0,
        primaryValue: INITIAL_VALUE,
        replicas: [
            { name: 'Replica 1 (stesso datacenter)', lagTicks: 2, value: INITIAL_VALUE, lastAppliedTick: 0 },
            { name: 'Replica 2 (altro continente)', lagTicks: 4, value: INITIAL_VALUE, lastAppliedTick: 0 }
        ],
        pending: [], // { replicaIdx, value, applyAtTick }
        readLog: []  // { tick, source, value, fresh }
    };
}

function applyDuePending(state) {
    state.pending = state.pending.filter(p => {
        if (p.applyAtTick <= state.clock) {
            const replica = state.replicas[p.replicaIdx];
            replica.value = p.value;
            replica.lastAppliedTick = state.clock;
            return false; // rimossa dalla coda, applicata
        }
        return true; // resta in coda
    });
}

function write(state, newValue) {
    state.clock += 1;
    state.primaryValue = newValue;
    state.replicas.forEach((replica, idx) => {
        state.pending.push({ replicaIdx: idx, value: newValue, applyAtTick: state.clock + replica.lagTicks });
    });
    applyDuePending(state);
}

function advanceClock(state, ticks) {
    for (let i = 0; i < ticks; i++) {
        state.clock += 1;
        applyDuePending(state);
    }
}

// source: 'primary' oppure l'indice della replica (0, 1, ...)
function read(state, source) {
    const value = source === 'primary' ? state.primaryValue : state.replicas[source].value;
    const fresh = value === state.primaryValue;
    const entry = { tick: state.clock, source: source === 'primary' ? 'Primario' : state.replicas[source].name, value, fresh };
    state.readLog.push(entry);
    return entry;
}

// --- Interfaccia --------------------------------------------------------------

let state = makeReplicationState();

function renderClock() {
    document.getElementById('clockValue').textContent = state.clock;
}

function renderNodes() {
    document.getElementById('primaryValue').textContent = state.primaryValue;

    const wrap = document.getElementById('replicasGrid');
    wrap.innerHTML = state.replicas.map((r, idx) => {
        const isStale = r.value !== state.primaryValue;
        const pendingForThis = state.pending.find(p => p.replicaIdx === idx);
        return `
            <div class="replica-card ${isStale ? 'stale' : 'fresh'}">
                <div class="replica-name">${r.name}</div>
                <div class="replica-value">${r.value}</div>
                <div class="replica-status">${isStale
                ? `⏳ In ritardo${pendingForThis ? ` — si aggiornerà a t=${pendingForThis.applyAtTick}` : ''}`
                : '✓ Sincronizzata col primario'}</div>
                <button class="btn btn-secondary read-btn" data-source="${idx}">Leggi da qui</button>
            </div>
        `;
    }).join('');

    wrap.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', () => doRead(Number(btn.dataset.source)));
    });
}

function renderLog() {
    const body = document.getElementById('logBody');
    body.innerHTML = state.readLog.slice().reverse().map(e => `
        <tr>
            <td>t=${e.tick}</td>
            <td>${e.source}</td>
            <td>${e.value}</td>
            <td class="${e.fresh ? 'fresh-badge' : 'stale-badge'}">${e.fresh ? 'AGGIORNATA' : 'STANTIA'}</td>
        </tr>
    `).join('');
    document.getElementById('emptyLogText').classList.toggle('hidden', state.readLog.length > 0);
}

function renderAll() {
    renderClock();
    renderNodes();
    renderLog();
}

function doWrite() {
    const input = document.getElementById('valueInput');
    const value = input.value.trim() || 'Nuovo valore';
    write(state, value);
    renderAll();
}

function doRead(source) {
    read(state, source);
    renderAll();
}

function doAdvance() {
    advanceClock(state, 1);
    renderAll();
}

function doReset() {
    state = makeReplicationState();
    renderAll();
}

document.getElementById('writeBtn').addEventListener('click', doWrite);
document.getElementById('readPrimaryBtn').addEventListener('click', () => doRead('primary'));
document.getElementById('advanceBtn').addEventListener('click', doAdvance);
document.getElementById('resetBtn').addEventListener('click', doReset);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non aspettare sempre che tutte le repliche siano aggiornate? ▸'
        : 'Perché non aspettare sempre che tutte le repliche siano aggiornate? ▾';
});

renderAll();
