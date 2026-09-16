// --- Definizione delle macchine ---------------------------------------
// Ogni macchina è una vera macchina di Turing: un insieme di regole
// (stato attuale, simbolo letto) -> (simbolo da scrivere, direzione,
// nuovo stato). Se per (stato, simbolo) non esiste nessuna regola, la
// macchina si ferma: è così che sa di aver finito.
//
// Tutte e tre le macchine sono state verificate esaustivamente in Node
// prima di essere inserite qui: l'incremento unario e quello binario su
// tutti i numeri da 0 a 40, il controllo di palindromia su tutte le 1023
// stringhe binarie fino a 9 caratteri (nessun errore in nessuno dei tre
// casi).

const BLANK = '_';

const MACHINES = {
    unary: {
        label: 'Incremento unario',
        defaultInput: '111',
        alphabetRegex: /^1*$/,
        alphabetHint: 'Solo il simbolo "1": un numero in unario, es. "111" significa 3.',
        initState: 'start',
        outcomeLabel: {
            HALT: 'La macchina si è fermata: il nastro ora contiene un simbolo "1" in più.'
        },
        transitions: {
            'start|1': { write: '1', move: 'R', next: 'start' },
            'start|_': { write: '1', move: 'S', next: 'HALT' },
        }
    },
    binary: {
        label: 'Incremento binario',
        defaultInput: '1011',
        alphabetRegex: /^[01]*$/,
        alphabetHint: 'Solo simboli "0" e "1": un numero scritto in binario, testina posizionata sulla cifra più a sinistra.',
        initState: 'scan',
        outcomeLabel: {
            HALT: 'La macchina si è fermata: il nastro ora contiene il numero originale più 1, in binario.'
        },
        transitions: {
            'scan|0': { write: '0', move: 'R', next: 'scan' },
            'scan|1': { write: '1', move: 'R', next: 'scan' },
            'scan|_': { write: '_', move: 'L', next: 'carry' },
            'carry|1': { write: '0', move: 'L', next: 'carry' },
            'carry|0': { write: '1', move: 'S', next: 'HALT' },
            'carry|_': { write: '1', move: 'S', next: 'HALT' },
        }
    },
    palindrome: {
        label: 'Palindromo binario',
        defaultInput: '10011001',
        alphabetRegex: /^[01]*$/,
        alphabetHint: 'Solo simboli "0" e "1". La macchina accetta se la stringa si legge uguale al contrario.',
        initState: 'start',
        outcomeLabel: {
            ACCEPT: 'ACCETTATA: la stringa è un palindromo (si legge uguale al contrario).',
            REJECT: 'RIFIUTATA: la stringa non è un palindromo.'
        },
        transitions: {
            'start|0': { write: 'X', move: 'R', next: 'find0' },
            'start|1': { write: 'Y', move: 'R', next: 'find1' },
            'start|X': { write: 'X', move: 'R', next: 'start' },
            'start|Y': { write: 'Y', move: 'R', next: 'start' },
            'start|_': { write: '_', move: 'S', next: 'ACCEPT' },

            'find0|0': { write: '0', move: 'R', next: 'find0' },
            'find0|1': { write: '1', move: 'R', next: 'find0' },
            'find0|X': { write: 'X', move: 'L', next: 'check0' },
            'find0|Y': { write: 'Y', move: 'L', next: 'check0' },
            'find0|_': { write: '_', move: 'L', next: 'check0' },

            'find1|0': { write: '0', move: 'R', next: 'find1' },
            'find1|1': { write: '1', move: 'R', next: 'find1' },
            'find1|X': { write: 'X', move: 'L', next: 'check1' },
            'find1|Y': { write: 'Y', move: 'L', next: 'check1' },
            'find1|_': { write: '_', move: 'L', next: 'check1' },

            'check0|0': { write: 'X', move: 'L', next: 'back' },
            'check0|1': { write: '1', move: 'S', next: 'REJECT' },
            'check0|X': { write: 'X', move: 'S', next: 'ACCEPT' },
            'check0|Y': { write: 'Y', move: 'S', next: 'ACCEPT' },
            'check0|_': { write: '_', move: 'S', next: 'ACCEPT' },

            'check1|1': { write: 'Y', move: 'L', next: 'back' },
            'check1|0': { write: '0', move: 'S', next: 'REJECT' },
            'check1|X': { write: 'X', move: 'S', next: 'ACCEPT' },
            'check1|Y': { write: 'Y', move: 'S', next: 'ACCEPT' },
            'check1|_': { write: '_', move: 'S', next: 'ACCEPT' },

            'back|0': { write: '0', move: 'L', next: 'back' },
            'back|1': { write: '1', move: 'L', next: 'back' },
            'back|X': { write: 'X', move: 'L', next: 'back' },
            'back|Y': { write: 'Y', move: 'L', next: 'back' },
            'back|_': { write: '_', move: 'R', next: 'start' },
        }
    }
};

const HALT_STATES = ['HALT', 'ACCEPT', 'REJECT'];

// --- Stato dell'esecuzione -----------------------------------------------

let currentMachineKey = 'unary';
let tape = new Map();
let head = 0;
let state = 'start';
let steps = 0;
let running = false;
let timer = null;
let inputError = false;

function currentMachine() {
    return MACHINES[currentMachineKey];
}

function loadInput(str) {
    tape = new Map();
    [...str].forEach((ch, i) => tape.set(i, ch));
    head = 0;
    state = currentMachine().initState;
    steps = 0;
}

function readTape(pos) {
    return tape.has(pos) ? tape.get(pos) : BLANK;
}

// Esegue un singolo passo. Ritorna true se un passo è stato eseguito,
// false se la macchina era già ferma (nessuna regola per stato+simbolo).
function step() {
    const machine = currentMachine();
    const sym = readTape(head);
    const rule = machine.transitions[state + '|' + sym];
    if (!rule) return false;
    tape.set(head, rule.write);
    if (rule.move === 'R') head += 1;
    else if (rule.move === 'L') head -= 1;
    state = rule.next;
    steps += 1;
    return true;
}

function isHalted() {
    const machine = currentMachine();
    const sym = readTape(head);
    return !machine.transitions[state + '|' + sym];
}

// --- Rendering -------------------------------------------------------------

const WINDOW_RADIUS = 9;

function renderTape() {
    const track = document.getElementById('tapeTrack');
    track.innerHTML = '';
    for (let i = head - WINDOW_RADIUS; i <= head + WINDOW_RADIUS; i++) {
        const sym = readTape(i);
        const cell = document.createElement('div');
        cell.className = 'tape-cell';
        if (sym === BLANK) cell.classList.add('blank');
        if (sym === 'X' || sym === 'Y') cell.classList.add('marked');
        if (i === head) cell.classList.add('head');
        cell.textContent = sym === BLANK ? '·' : sym;
        track.appendChild(cell);
    }
}

function renderStatus() {
    document.getElementById('stateValue').textContent = state;
    document.getElementById('stepsValue').textContent = String(steps);

    const verdict = document.getElementById('verdict');
    if (isHalted()) {
        const machine = currentMachine();
        const msg = machine.outcomeLabel[state] || `La macchina si è fermata nello stato "${state}".`;
        verdict.textContent = msg;
        verdict.className = 'verdict ' + (state === 'ACCEPT' ? 'accepted' : state === 'REJECT' ? 'rejected' : 'halted');
    } else {
        verdict.textContent = '';
        verdict.className = 'verdict';
    }
}

function renderTable() {
    const machine = currentMachine();
    const table = document.getElementById('ruleTable');
    const sym = readTape(head);
    const activeKey = state + '|' + sym;

    let html = '<tr><th>Stato</th><th>Legge</th><th>Scrive</th><th>Muove</th><th>Nuovo stato</th></tr>';
    for (const [key, rule] of Object.entries(machine.transitions)) {
        const [ruleState, ruleSym] = key.split('|');
        const isActive = key === activeKey && !isHalted();
        const moveLabel = rule.move === 'R' ? '→ destra' : rule.move === 'L' ? '← sinistra' : '⏸ ferma';
        html += `<tr class="${isActive ? 'active-rule' : ''}">` +
            `<td>${ruleState}</td>` +
            `<td>${ruleSym === BLANK ? '·' : ruleSym}</td>` +
            `<td>${rule.write === BLANK ? '·' : rule.write}</td>` +
            `<td>${moveLabel}</td>` +
            `<td>${rule.next}</td>` +
            `</tr>`;
    }
    table.innerHTML = html;
}

function renderAll() {
    renderTape();
    renderStatus();
    renderTable();
    updateControlsEnabled();
}

function updateControlsEnabled() {
    const disable = inputError || isHalted();
    document.getElementById('playPauseBtn').disabled = disable;
    document.getElementById('stepBtn').disabled = disable;
    if (disable) stopRunning();
}

// --- Controlli ---------------------------------------------------------

function doStep() {
    const moved = step();
    renderAll();
    if (!moved) stopRunning();
}

function startRunning() {
    if (running) return;
    running = true;
    document.getElementById('playPauseBtn').textContent = '⏸ Pausa';
    const speed = parseInt(document.getElementById('speedSlider').value, 10);
    timer = setInterval(doStep, speed);
}

function stopRunning() {
    running = false;
    document.getElementById('playPauseBtn').textContent = '▶ Avvia';
    if (timer) { clearInterval(timer); timer = null; }
}

function togglePlayPause() {
    if (running) stopRunning();
    else startRunning();
}

function resetMachine() {
    stopRunning();
    const input = document.getElementById('tapeInput').value;
    const machine = currentMachine();
    const errorEl = document.getElementById('tapeError');
    if (!machine.alphabetRegex.test(input)) {
        inputError = true;
        errorEl.textContent = machine.alphabetHint;
        errorEl.classList.remove('hidden');
        loadInput('');
        renderAll();
        return;
    }
    inputError = false;
    errorEl.classList.add('hidden');
    loadInput(input);
    renderAll();
}

function selectMachine(key) {
    currentMachineKey = key;
    document.querySelectorAll('.chip[data-machine]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.machine === key);
    });
    const machine = MACHINES[key];
    document.getElementById('tapeInput').value = machine.defaultInput;
    document.getElementById('tapeInputLabel').textContent =
        `Contenuto iniziale del nastro — ${machine.alphabetHint}`;
    resetMachine();
}

// --- Collegamento eventi -------------------------------------------------

document.querySelectorAll('.chip[data-machine]').forEach(btn => {
    btn.addEventListener('click', () => selectMachine(btn.dataset.machine));
});

document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
document.getElementById('stepBtn').addEventListener('click', doStep);
document.getElementById('resetBtn').addEventListener('click', resetMachine);
document.getElementById('tapeInput').addEventListener('input', resetMachine);

document.getElementById('speedSlider').addEventListener('input', (e) => {
    const ms = parseInt(e.target.value, 10);
    document.getElementById('speedValue').textContent = ms + ' ms/passo';
    if (running) { stopRunning(); startRunning(); }
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché è importante? È solo un giocattolo teorico? ▸'
        : 'Perché è importante? È solo un giocattolo teorico? ▾';
});

// Inizializzazione
document.getElementById('speedSlider').dispatchEvent(new Event('input'));
selectMachine('unary');
