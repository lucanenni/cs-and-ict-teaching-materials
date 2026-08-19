const HELP_TEXT = {
    stack: [
        '• Una <strong>pila</strong> (stack) segue la regola <strong>LIFO</strong>: <em>Last In, First Out</em> — l\'ultimo elemento inserito è sempre il primo a uscire.',
        '• Inserimento (<strong>push</strong>) e rimozione (<strong>pop</strong>) avvengono sempre dalla stessa estremità, la "cima".',
        '• Pensa a una pila di piatti: puoi aggiungerne uno solo in cima, e puoi toglierne uno solo dalla cima — non puoi tirare fuori quello in fondo senza smontare tutta la pila.'
    ],
    queue: [
        '• Una <strong>coda</strong> (queue) segue la regola <strong>FIFO</strong>: <em>First In, First Out</em> — il primo elemento inserito è sempre il primo a uscire.',
        '• L\'inserimento (<strong>enqueue</strong>) avviene da un\'estremità (la coda), la rimozione (<strong>dequeue</strong>) dall\'altra (la testa).',
        '• Pensa alla fila alla cassa di un negozio: chi arriva si mette in fondo, e chi viene servito è sempre chi è in fila da più tempo.'
    ]
};

const HINT_TEXT = {
    stack: 'Aggiungi e rimuovi elementi e osserva: l\'ultimo che entra è sempre il primo che esce, dalla stessa estremità ("cima").',
    queue: 'Aggiungi e rimuovi elementi e osserva: il primo che entra è sempre il primo che esce — entra dalla "coda", esce dalla "testa".'
};

const RANDOM_VALUES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

let state = {
    mode: 'stack',
    stack: [],
    queue: [],
    stackLog: [],
    queueLog: []
};

function items() {
    return state.mode === 'stack' ? state.stack : state.queue;
}

function log() {
    return state.mode === 'stack' ? state.stackLog : state.queueLog;
}

function pushLog(text) {
    log().push(text);
    if (log().length > 30) log().shift();
}

function render() {
    const row = document.getElementById('structureRow');
    row.className = 'structure-row' + (state.mode === 'stack' ? ' stack-row' : '');
    row.innerHTML = '';

    const list = items();
    if (list.length === 0) {
        row.innerHTML = '<div class="structure-empty">(vuota)</div>';
    } else {
        list.forEach((val, idx) => {
            const isEdge = state.mode === 'stack' ? idx === list.length - 1 : idx === 0;
            const div = document.createElement('div');
            div.className = 'structure-item' + (state.mode === 'stack' ? ' stack-item' : '') + (isEdge ? ' top-item' : '');
            if (isEdge) {
                const tag = document.createElement('span');
                tag.className = 'item-tag';
                tag.textContent = state.mode === 'stack' ? '🔝 CIMA — esce per prima' : '⬅️ TESTA — esce per prima';
                div.appendChild(tag);
            }
            div.appendChild(document.createTextNode(val));
            row.appendChild(div);
        });
    }

    const labels = document.getElementById('structureLabels');
    labels.innerHTML = state.mode === 'queue'
        ? '<span>⬅️ Testa (esce da qui)</span><span>Coda (entra qui) ➡️</span>'
        : '';

    const logList = document.getElementById('logList');
    logList.innerHTML = log().length === 0
        ? '<span style="color:#9ca3af; font-style: italic;">Nessuna operazione ancora.</span>'
        : log().map(l => `<div>${l}</div>`).join('');

    document.getElementById('removeBtn').disabled = list.length === 0;
}

function addValue(rawValue) {
    const value = (rawValue || '').trim() || RANDOM_VALUES[Math.floor(Math.random() * RANDOM_VALUES.length)];
    items().push(value);
    const verb = state.mode === 'stack' ? 'Push' : 'Enqueue';
    pushLog(`${verb}(${value}) → [${items().join(', ')}]`);
    document.getElementById('valueInput').value = '';
    document.getElementById('removedNote').textContent = '';
    render();
}

function removeValue() {
    const list = items();
    if (list.length === 0) {
        document.getElementById('removedNote').textContent = 'La struttura è vuota: niente da togliere.';
        return;
    }
    const removed = state.mode === 'stack' ? list.pop() : list.shift();
    const verb = state.mode === 'stack' ? 'Pop' : 'Dequeue';
    pushLog(`${verb}() → tolto "${removed}", resta: [${list.join(', ')}]`);
    document.getElementById('removedNote').textContent = `Tolto: "${removed}"`;
    render();
}

function setMode(mode) {
    state.mode = mode;
    document.getElementById('stackModeBtn').classList.toggle('active', mode === 'stack');
    document.getElementById('queueModeBtn').classList.toggle('active', mode === 'queue');
    document.getElementById('hintText').textContent = HINT_TEXT[mode];
    document.getElementById('helpList').innerHTML = HELP_TEXT[mode].map(li => `<li>${li}</li>`).join('');
    document.getElementById('removedNote').textContent = '';
    render();
}

document.getElementById('stackModeBtn').addEventListener('click', () => setMode('stack'));
document.getElementById('queueModeBtn').addEventListener('click', () => setMode('queue'));

document.getElementById('addBtn').addEventListener('click', () => addValue(document.getElementById('valueInput').value));
document.getElementById('valueInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addValue(document.getElementById('valueInput').value);
});
document.getElementById('removeBtn').addEventListener('click', removeValue);
document.getElementById('randomBtn').addEventListener('click', () => addValue(''));

document.getElementById('clearBtn').addEventListener('click', () => {
    state.stack = [];
    state.queue = [];
    state.stackLog = [];
    state.queueLog = [];
    document.getElementById('removedNote').textContent = '';
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Dove si usano davvero pile e code? ▸'
        : 'Dove si usano davvero pile e code? ▾';
});

// Inizializzazione
setMode('stack');
['A', 'B', 'C'].forEach(v => addValue(v));
state.stackLog = []; // non mostrare i valori iniziali come "operazioni" nel log
render();
