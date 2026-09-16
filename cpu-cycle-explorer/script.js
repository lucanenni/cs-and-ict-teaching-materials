// --- Macchina ad accumulatore, architettura di von Neumann ----------------
// La stessa memoria contiene sia istruzioni sia dati. Ogni istruzione viene
// eseguita in tre fasi (fetch, decode, execute), ciascuna registrata come un
// "fotogramma" separato per poterle mostrare passo dopo passo. La logica è
// stata verificata in Node confrontando il risultato finale (ACC, memoria,
// output) della versione "tracciata" con quello di una versione diretta
// dello stesso interprete, su entrambi i programmi di esempio.

const MEM_SIZE = 16;

const PROGRAMS = {
    add: {
        label: 'Somma due numeri',
        cells: {
            0: { type: 'instr', op: 'LDA', arg: 8 },
            1: { type: 'instr', op: 'ADD', arg: 9 },
            2: { type: 'instr', op: 'STA', arg: 10 },
            3: { type: 'instr', op: 'HALT' },
            8: { type: 'data', value: 4 },
            9: { type: 'data', value: 7 },
            10: { type: 'data', value: 0 },
        }
    },
    countdown: {
        label: 'Conto alla rovescia (con salto)',
        cells: {
            0: { type: 'instr', op: 'LDA', arg: 8 },
            1: { type: 'instr', op: 'OUT' },
            2: { type: 'instr', op: 'SUB', arg: 9 },
            3: { type: 'instr', op: 'JZ', arg: 6 },
            4: { type: 'instr', op: 'JMP', arg: 1 },
            6: { type: 'instr', op: 'HALT' },
            8: { type: 'data', value: 3 },
            9: { type: 'data', value: 1 },
        }
    }
};

function makeMemory(cells) {
    const mem = new Array(MEM_SIZE).fill(null).map(() => ({ type: 'data', value: 0 }));
    for (const [addr, cell] of Object.entries(cells)) mem[addr] = { ...cell };
    return mem;
}

function opLabel(ir) {
    if (!ir) return '—';
    return ir.arg !== undefined ? `${ir.op} ${ir.arg}` : ir.op;
}

// Genera l'intera traccia di fotogrammi per un programma, fase per fase.
function buildFrames(cells, maxCycles) {
    let mem = makeMemory(cells);
    let pc = 0, acc = 0, halted = false, cycles = 0;
    const output = [];
    const frames = [];
    const snap = (extra) => frames.push({
        pc, acc, halted,
        mem: mem.map(c => ({ ...c })),
        output: output.slice(),
        ...extra,
    });

    snap({ phase: 'START', highlight: -1 });

    while (!halted && cycles < maxCycles) {
        const fetchAddr = pc;
        const cell = mem[fetchAddr];
        if (!cell || cell.type !== 'instr') {
            snap({ phase: 'ERRORE', highlight: fetchAddr });
            break;
        }
        snap({ phase: 'FETCH', highlight: fetchAddr, ir: null });
        const ir = { op: cell.op, arg: cell.arg };
        pc = fetchAddr + 1;
        snap({ phase: 'DECODE', highlight: fetchAddr, ir });

        switch (ir.op) {
            case 'LDA': acc = mem[ir.arg].value; break;
            case 'STA': mem[ir.arg] = { type: 'data', value: acc }; break;
            case 'ADD': acc += mem[ir.arg].value; break;
            case 'SUB': acc -= mem[ir.arg].value; break;
            case 'JMP': pc = ir.arg; break;
            case 'JZ': if (acc === 0) pc = ir.arg; break;
            case 'OUT': output.push(acc); break;
            case 'HALT': halted = true; break;
        }
        snap({
            phase: 'EXECUTE', ir,
            highlight: ir.arg !== undefined ? ir.arg : fetchAddr,
            pc, acc, halted,
            mem: mem.map(c => ({ ...c })),
            output: output.slice(),
        });
        cycles++;
    }
    return frames;
}

// --- Stato dell'interfaccia -------------------------------------------------

let currentProgram = 'add';
let frames = [];
let frameIndex = 0;
let running = false;
let timer = null;

function currentSpeed() {
    return parseInt(document.getElementById('speedSlider').value, 10);
}

function loadProgram(key) {
    stopRunning();
    currentProgram = key;
    frames = buildFrames(PROGRAMS[key].cells, 200);
    frameIndex = 0;
    render();
}

function renderMemory(frame) {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    frame.mem.forEach((cell, addr) => {
        const div = document.createElement('div');
        div.className = 'mem-cell';
        if (addr === frame.pc) div.classList.add('pc');
        if (addr === frame.highlight && frame.phase === 'EXECUTE') div.classList.add('executing');
        else if (addr === frame.highlight) div.classList.add('highlight');

        const addrEl = document.createElement('div');
        addrEl.className = 'mem-addr';
        addrEl.textContent = String(addr);
        div.appendChild(addrEl);

        const valEl = document.createElement('div');
        valEl.className = 'mem-value';
        valEl.textContent = cell.type === 'instr' ? opLabel(cell) : String(cell.value);
        div.appendChild(valEl);

        grid.appendChild(div);
    });
}

function render() {
    const frame = frames[frameIndex];
    document.querySelectorAll('.phase-box').forEach(box => {
        box.classList.toggle('active', box.dataset.phase === frame.phase);
    });
    document.getElementById('pcValue').textContent = String(frame.pc);
    document.getElementById('irValue').textContent = opLabel(frame.ir);
    document.getElementById('accValue').textContent = String(frame.acc);
    document.getElementById('outputValue').textContent = frame.output.length ? frame.output.join(', ') : '—';
    renderMemory(frame);

    const status = document.getElementById('statusText');
    if (frame.phase === 'START') {
        status.textContent = 'Pronto. Premi Avvia o Passo singolo per iniziare.';
    } else if (frame.phase === 'ERRORE') {
        status.textContent = `⚠️ Il PC punta a una cella che contiene dati, non un'istruzione: la CPU si ferma.`;
    } else if (frame.halted && frame.phase === 'EXECUTE') {
        status.textContent = '✓ Programma terminato (HALT).';
    } else {
        status.textContent = '';
    }

    const atEnd = frameIndex >= frames.length - 1;
    document.getElementById('playPauseBtn').disabled = atEnd;
    document.getElementById('stepBtn').disabled = atEnd;
}

function doStep() {
    if (frameIndex >= frames.length - 1) { stopRunning(); return; }
    frameIndex += 1;
    render();
    if (frameIndex >= frames.length - 1) stopRunning();
}

function startRunning() {
    if (running || frameIndex >= frames.length - 1) return;
    running = true;
    document.getElementById('playPauseBtn').textContent = '⏸ Pausa';
    timer = setInterval(doStep, currentSpeed());
}

function stopRunning() {
    running = false;
    document.getElementById('playPauseBtn').textContent = '▶ Avvia';
    if (timer) { clearInterval(timer); timer = null; }
}

function togglePlayPause() {
    if (running) stopRunning(); else startRunning();
}

function resetProgram() {
    loadProgram(currentProgram);
}

document.querySelectorAll('.presets-row .chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.presets-row .chip').forEach(b => b.classList.toggle('active', b === btn));
        loadProgram(btn.dataset.program);
    });
});

document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
document.getElementById('stepBtn').addEventListener('click', doStep);
document.getElementById('resetBtn').addEventListener('click', resetProgram);

document.getElementById('speedSlider').addEventListener('input', (e) => {
    const ms = parseInt(e.target.value, 10);
    document.getElementById('speedValue').textContent = ms + ' ms/fase';
    if (running) { stopRunning(); startRunning(); }
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché istruzioni e dati stanno nella stessa memoria? ▸'
        : 'Perché istruzioni e dati stanno nella stessa memoria? ▾';
});

// Inizializzazione
document.getElementById('speedSlider').dispatchEvent(new Event('input'));
loadProgram('add');
