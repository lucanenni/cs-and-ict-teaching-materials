// --- Pipeline a 4 stadi (Fetch, Decode, Execute, Writeback) ----------------
// Più istruzioni "in volo" insieme, ciascuna in uno stadio diverso nello
// stesso ciclo di clock. La funzione pura buildPipelineSchedule calcola,
// ciclo per ciclo, in che stadio si trova ciascuna istruzione — rilevando
// ed eliminando gli hazard di dati con una bolla (stallo) quando serve.
// È stata verificata in Node (non incluso nel progetto pubblicato) su un
// programma di 5 istruzioni indipendenti (nessun hazard, 8 cicli), sullo
// stesso programma con una dipendenza fra la 2ª e la 3ª istruzione (1
// bolla, 9 cicli) e su un caso minimo di 2 istruzioni con hazard immediato.

// Regola di stallo adottata (senza forwarding/bypass): una istruzione in
// Decode può passare a Execute solo se, per ogni registro che le serve, il
// produttore di quel registro ha già completato la Writeback in un ciclo
// STRETTAMENTE precedente a quello attuale. Se non è così, l'istruzione (e
// tutto ciò che la segue) resta bloccata: Execute riceve una bolla.
function buildPipelineSchedule(instructions) {
    const n = instructions.length;
    const producedBySomeone = new Set();
    instructions.forEach(i => { if (i.produces) producedBySomeone.add(i.produces); });

    let pipeline = { F: null, D: null, E: null, W: null };
    let fetchPtr = 0;
    let cycle = 0;
    const producedAt = {};
    const schedule = [];
    const stallCycles = [];
    const safetyCap = n * 4 + 20;

    while (true) {
        cycle++;
        if (cycle > safetyCap) throw new Error('buildPipelineSchedule: troppi cicli, possibile loop infinito');

        const dInstr = pipeline.D;
        let hazard = false;
        let hazardReg = null;
        if (dInstr !== null) {
            const instr = instructions[dInstr];
            for (const reg of instr.consumes) {
                if (producedBySomeone.has(reg)) {
                    const at = producedAt[reg];
                    if (at === undefined || cycle <= at) { hazard = true; hazardReg = reg; break; }
                }
            }
        }

        const newW = pipeline.E;
        if (newW !== null) {
            const producedReg = instructions[newW].produces;
            if (producedReg) producedAt[producedReg] = cycle;
        }

        let newE, newD, newF;
        if (hazard) {
            newE = null;
            newD = dInstr;
            newF = pipeline.F;
            stallCycles.push(cycle);
        } else {
            newE = dInstr;
            newD = pipeline.F;
            newF = (fetchPtr < n) ? fetchPtr++ : null;
        }

        pipeline = { F: newF, D: newD, E: newE, W: newW };

        const allEmpty = newF === null && newD === null && newE === null && newW === null;
        if (allEmpty && fetchPtr >= n) break;

        schedule.push({ cycle, F: newF, D: newD, E: newE, W: newW, stalled: hazard, hazardReg });
    }

    return { schedule, totalCycles: schedule.length, stallCycles };
}

const PROGRAMS = {
    none: {
        label: 'Senza hazard',
        instructions: [
            { label: 'I1: LOAD R1, [100]', produces: 'R1', consumes: [] },
            { label: 'I2: LOAD R2, [104]', produces: 'R2', consumes: [] },
            { label: 'I3: LOAD R3, [108]', produces: 'R3', consumes: [] },
            { label: 'I4: LOAD R4, [112]', produces: 'R4', consumes: [] },
            { label: 'I5: LOAD R5, [116]', produces: 'R5', consumes: [] },
        ],
    },
    hazard: {
        label: 'Con hazard (stallo)',
        instructions: [
            { label: 'I1: LOAD R1, [100]', produces: 'R1', consumes: [] },
            { label: 'I2: LOAD R2, [104]', produces: 'R2', consumes: [] },
            { label: 'I3: ADD  R3, R2, R1', produces: 'R3', consumes: ['R2', 'R1'] },
            { label: 'I4: LOAD R4, [108]', produces: 'R4', consumes: [] },
            { label: 'I5: ADD  R5, R1, R3', produces: 'R5', consumes: ['R1', 'R3'] },
        ],
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildPipelineSchedule, PROGRAMS };
}

// --- Interfaccia -------------------------------------------------------------

if (typeof document !== 'undefined') {

const STAGE_NAMES = { F: 'Fetch', D: 'Decode', E: 'Execute', W: 'Writeback' };

let currentKey = 'none';
let schedule = [];
let totalCycles = 0;
let frameIndex = -1;
let running = false;
let timer = null;

const RESULTS = {};
for (const key of Object.keys(PROGRAMS)) {
    RESULTS[key] = buildPipelineSchedule(PROGRAMS[key].instructions);
}

function currentSpeed() {
    return parseInt(document.getElementById('speedSlider').value, 10);
}

function cellStageFor(instrIdx, cycle) {
    const row = schedule.find(r => r.cycle === cycle);
    if (!row) return null;
    if (row.F === instrIdx) return { stage: 'F', stalled: false };
    if (row.D === instrIdx) return { stage: 'D', stalled: row.stalled };
    if (row.E === instrIdx) return { stage: 'E', stalled: false };
    if (row.W === instrIdx) return { stage: 'W', stalled: false };
    return null;
}

function buildGridDom() {
    const program = PROGRAMS[currentKey];
    const n = program.instructions.length;
    const table = document.getElementById('pipelineTable');
    table.innerHTML = '';

    const headRow = document.createElement('div');
    headRow.className = 'pipe-row pipe-head';
    const corner = document.createElement('div');
    corner.className = 'pipe-cell pipe-corner';
    corner.textContent = 'Istruzione';
    headRow.appendChild(corner);
    for (let c = 1; c <= totalCycles; c++) {
        const h = document.createElement('div');
        h.className = 'pipe-cell pipe-cyclehead';
        h.dataset.cycle = c;
        h.textContent = 'T' + c;
        headRow.appendChild(h);
    }
    table.appendChild(headRow);

    for (let i = 0; i < n; i++) {
        const row = document.createElement('div');
        row.className = 'pipe-row';
        const label = document.createElement('div');
        label.className = 'pipe-cell pipe-label';
        label.textContent = program.instructions[i].label;
        row.appendChild(label);
        for (let c = 1; c <= totalCycles; c++) {
            const cell = document.createElement('div');
            cell.className = 'pipe-cell pipe-stage future';
            cell.dataset.instr = i;
            cell.dataset.cycle = c;
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}

function revealColumn(cycle) {
    const program = PROGRAMS[currentKey];
    const n = program.instructions.length;
    const row = schedule.find(r => r.cycle === cycle);
    const headCell = document.querySelector(`.pipe-cyclehead[data-cycle="${cycle}"]`);
    headCell.classList.toggle('stall-col', !!(row && row.stalled));

    for (let i = 0; i < n; i++) {
        const cell = document.querySelector(`.pipe-stage[data-instr="${i}"][data-cycle="${cycle}"]`);
        cell.classList.remove('future');
        const info = cellStageFor(i, cycle);
        if (info) {
            cell.textContent = info.stage;
            cell.classList.add('stage-' + info.stage);
            if (info.stalled) cell.classList.add('stalled-cell');
        } else {
            cell.textContent = (row && row.stalled) ? '·' : '';
            if (row && row.stalled) cell.classList.add('bubble-cell');
        }
    }
}

function describeCycle(cycle) {
    const program = PROGRAMS[currentKey];
    const row = schedule.find(r => r.cycle === cycle);
    const parts = [];
    ['F', 'D', 'E', 'W'].forEach(stage => {
        if (row[stage] !== null) {
            parts.push(`${STAGE_NAMES[stage]} → ${program.instructions[row[stage]].label.split(':')[0]}`);
        }
    });
    let text = `Ciclo ${cycle}: ` + (parts.length ? parts.join(' · ') : '(pipeline vuota)');
    if (row.stalled) {
        const stalledLabel = program.instructions[row.D].label.split(':')[0];
        text += ` — ⚠ HAZARD: ${stalledLabel} ha bisogno di ${row.hazardReg}, non ancora scritto in Writeback da una istruzione precedente. Resta bloccata in Decode: bolla in Execute.`;
    }
    return text;
}

function addStepLine(text) {
    const panel = document.getElementById('stepPanel');
    panel.querySelectorAll('.step-line.current').forEach(el => el.classList.remove('current'));
    const line = document.createElement('div');
    line.className = 'step-line current';
    text && (line.textContent = text);
    panel.appendChild(line);
    panel.scrollTop = panel.scrollHeight;
}

function updateButtons() {
    const atEnd = frameIndex >= totalCycles - 1;
    document.getElementById('stepBtn').disabled = atEnd;
    document.getElementById('runBtn').disabled = atEnd;
}

function showFinalStatus() {
    const box = document.getElementById('resultBox');
    const none = RESULTS.none.totalCycles;
    const hz = RESULTS.hazard.totalCycles;
    if (frameIndex >= totalCycles - 1) {
        box.className = 'result-box good';
        box.textContent = `✓ Programma completato in ${totalCycles} cicli di clock.`;
    }
}

function tick() {
    if (frameIndex >= totalCycles - 1) { stopAuto(); return; }
    frameIndex++;
    const cycle = frameIndex + 1;
    revealColumn(cycle);
    addStepLine(describeCycle(cycle));
    showFinalStatus();
    updateButtons();
    if (frameIndex >= totalCycles - 1) stopAuto();
}

function startAuto() {
    if (running || frameIndex >= totalCycles - 1) return;
    running = true;
    document.getElementById('runBtn').textContent = '⏸ Pausa';
    timer = setInterval(tick, currentSpeed());
}

function stopAuto() {
    running = false;
    document.getElementById('runBtn').textContent = '▶ Avvia';
    if (timer) { clearInterval(timer); timer = null; }
}

function toggleRun() {
    if (running) stopAuto(); else startAuto();
}

function loadProgram(key) {
    stopAuto();
    currentKey = key;
    schedule = RESULTS[key].schedule;
    totalCycles = RESULTS[key].totalCycles;
    frameIndex = -1;
    buildGridDom();
    document.getElementById('stepPanel').innerHTML = '';
    document.getElementById('resultBox').className = 'result-box';
    document.getElementById('resultBox').textContent = '';
    updateButtons();
}

function renderComparison() {
    const none = RESULTS.none.totalCycles;
    const hz = RESULTS.hazard.totalCycles;
    const extra = hz - none;
    document.getElementById('comparisonBox').innerHTML =
        `Cicli totali per completare le stesse 5 istruzioni — ` +
        `<strong>senza hazard: ${none}</strong> · <strong>con hazard: ${hz}</strong> ` +
        `(${extra} ciclo in più, sprecato interamente nella bolla di stallo).`;
}

document.querySelectorAll('.presets-row .chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.presets-row .chip').forEach(b => b.classList.toggle('active', b === btn));
        loadProgram(btn.dataset.program);
    });
});

document.getElementById('runBtn').addEventListener('click', toggleRun);
document.getElementById('stepBtn').addEventListener('click', tick);
document.getElementById('resetBtn').addEventListener('click', () => loadProgram(currentKey));

document.getElementById('speedSlider').addEventListener('input', (e) => {
    document.getElementById('speedValue').textContent = e.target.value + ' ms/ciclo';
    if (running) { stopAuto(); startAuto(); }
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? "Esistono soluzioni migliori di uno stallo? ▸"
        : "Esistono soluzioni migliori di uno stallo? ▾";
});

// Inizializzazione: scenario di default già pronto, Passo singolo funziona
// da subito, senza dover prima premere Avvia.
renderComparison();
document.getElementById('speedSlider').dispatchEvent(new Event('input'));
document.querySelector('.presets-row .chip[data-program="none"]').classList.add('active');
loadProgram('none');

}
