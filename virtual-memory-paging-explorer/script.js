// --- Paginazione virtuale con sostituzione FIFO: logica pura ---------------
// (verificata in Node prima di collegarla al DOM)
//
// Simula l'intera sequenza di accessi e produce, per ciascuno, un
// fotogramma con lo stato completo di page table e frame dopo quell'accesso
// — così l'interfaccia si limita a "fotografare" lo stato invece di
// applicare differenze passo per passo.

const NUM_PAGES = 8;
const NUM_FRAMES = 4;

function simulatePaging(sequence, numPages, numFrames) {
    const pageTable = new Array(numPages).fill(null); // frame o null (non presente)
    const frames = new Array(numFrames).fill(null); // pagina o null (libero)
    const fifoQueue = []; // pagine residenti, in ordine di caricamento
    let hits = 0, faults = 0;
    const steps = [];

    sequence.forEach(page => {
        let hit = false, evictedPage = null, frameAssigned;
        if (pageTable[page] !== null) {
            hit = true; hits++;
            frameAssigned = pageTable[page];
        } else {
            faults++;
            let freeFrame = frames.findIndex(f => f === null);
            if (freeFrame === -1) {
                // Tutti i frame occupati: si sfratta la pagina caricata più a lungo fa.
                evictedPage = fifoQueue.shift();
                freeFrame = pageTable[evictedPage];
                pageTable[evictedPage] = null;
            }
            frames[freeFrame] = page;
            pageTable[page] = freeFrame;
            fifoQueue.push(page);
            frameAssigned = freeFrame;
        }
        steps.push({
            page, hit, frameAssigned, evictedPage,
            pageTable: [...pageTable],
            frames: [...frames],
            hits, faults
        });
    });
    return steps;
}

// --- Interfaccia -------------------------------------------------------------

let sequence = [];
let steps = [];
let frameIndex = -1; // -1 = stato iniziale, prima di ogni accesso
let running = false;
let timer = null;
const SPEED = 900;
let log = [];

function recomputeSteps() {
    steps = simulatePaging(sequence, NUM_PAGES, NUM_FRAMES);
    if (frameIndex >= steps.length) frameIndex = steps.length - 1;
}

function generateRandomSequence() {
    stopRunning();
    const length = 10 + Math.floor(Math.random() * 3); // 10-12 accessi
    sequence = Array.from({ length }, () => Math.floor(Math.random() * NUM_PAGES));
    frameIndex = -1;
    log = [];
    recomputeSteps();
    document.getElementById('resultBox').classList.add('hidden');
    render();
}

function addManualAccess() {
    const input = document.getElementById('pageInput');
    let page = parseInt(input.value, 10);
    if (isNaN(page)) page = 0;
    page = Math.max(0, Math.min(NUM_PAGES - 1, page));
    input.value = String(page);
    sequence.push(page);
    recomputeSteps();
    log.push(`Accesso alla pagina ${page} aggiunto in coda alla sequenza (in attesa di essere eseguito).`);
    document.getElementById('resultBox').classList.add('hidden');
    render();
}

function describeStep(s) {
    if (s.hit) {
        return `Accesso alla pagina ${s.page}: HIT — già presente nel frame ${s.frameAssigned}, nessun caricamento necessario.`;
    }
    if (s.evictedPage !== null) {
        return `Accesso alla pagina ${s.page}: PAGE FAULT — tutti i frame sono occupati, si sfratta la pagina ${s.evictedPage} (la più vecchia, politica FIFO) dal frame ${s.frameAssigned} e si carica la pagina ${s.page} dal disco.`;
    }
    return `Accesso alla pagina ${s.page}: PAGE FAULT — non presente, caricata dal disco nel frame libero ${s.frameAssigned}.`;
}

function doStep() {
    if (frameIndex >= steps.length - 1) { stopRunning(); return; }
    frameIndex++;
    const s = steps[frameIndex];
    log.push(describeStep(s));
    if (frameIndex >= steps.length - 1) {
        stopRunning();
        showResult(`Sequenza completata: ${s.hits} hit, ${s.faults} page fault su ${steps.length} accessi.`);
    }
    render();
}

function showResult(text) {
    const box = document.getElementById('resultBox');
    box.textContent = text;
    box.classList.remove('hidden', 'bad');
    box.classList.add('good');
}

function startRunning() {
    if (running || frameIndex >= steps.length - 1) return;
    running = true;
    document.getElementById('runBtn').textContent = '⏸ Pausa';
    timer = setInterval(() => {
        doStep();
        if (frameIndex >= steps.length - 1) stopRunning();
    }, SPEED);
}

function stopRunning() {
    running = false;
    document.getElementById('runBtn').textContent = '▶ Avvia';
    if (timer) { clearInterval(timer); timer = null; }
}

function toggleRun() {
    if (running) stopRunning(); else startRunning();
}

function resetToStart() {
    stopRunning();
    frameIndex = -1;
    log = [];
    document.getElementById('resultBox').classList.add('hidden');
    render();
}

// --- Disegno -----------------------------------------------------------------

function render() {
    const s = frameIndex >= 0 ? steps[frameIndex] : null;

    renderSequence();
    renderPageTable(s);
    renderFrames(s);

    document.getElementById('hitsValue').textContent = s ? String(s.hits) : '0';
    document.getElementById('faultsValue').textContent = s ? String(s.faults) : '0';

    const panel = document.getElementById('stepPanel');
    panel.innerHTML = log.map((line, i) =>
        `<div class="step-line ${i === log.length - 1 ? 'current' : ''}">${i + 1}. ${line}</div>`
    ).join('') || '<div class="step-line">Premi "Passo singolo" o "Avvia" per iniziare la sequenza.</div>';
    panel.scrollTop = panel.scrollHeight;

    const atEnd = frameIndex >= steps.length - 1;
    document.getElementById('stepBtn').disabled = atEnd;
    document.getElementById('runBtn').disabled = atEnd;
}

function renderSequence() {
    const row = document.getElementById('sequenceRow');
    row.innerHTML = sequence.map((page, i) => {
        let cls = 'seq-chip';
        if (i < frameIndex) cls += steps[i].hit ? ' done-hit' : ' done-fault';
        else if (i === frameIndex) cls += (steps[i].hit ? ' done-hit' : ' done-fault') + ' current';
        return `<div class="${cls}">${page}</div>`;
    }).join('');
}

function renderPageTable(s) {
    const wrap = document.getElementById('pageTable');
    wrap.innerHTML = '';
    for (let page = 0; page < NUM_PAGES; page++) {
        const frame = s ? s.pageTable[page] : null;
        const row = document.createElement('div');
        let cls = 'page-row';
        if (frame !== null) cls += ' resident';
        if (s && s.page === page) cls += ' touched';
        if (s && s.evictedPage === page) cls += ' evicted';
        row.className = cls;
        row.innerHTML = `<span class="pv">pagina ${page}</span><span class="pf">${frame !== null ? `frame ${frame}` : 'non presente (su disco)'}</span>`;
        wrap.appendChild(row);
    }
}

function renderFrames(s) {
    const grid = document.getElementById('frameGrid');
    grid.innerHTML = '';
    for (let f = 0; f < NUM_FRAMES; f++) {
        const page = s ? s.frames[f] : null;
        const cell = document.createElement('div');
        let cls = 'frame-cell';
        if (page !== null) cls += ' occupied';
        if (s && s.frameAssigned === f) cls += ' current-access';
        cell.className = cls;
        cell.innerHTML = `<span>frame ${f}</span><span>${page !== null ? `pagina ${page}` : 'vuoto'}</span>`;
        grid.appendChild(cell);
    }
}

// --- Eventi --------------------------------------------------------------------

document.getElementById('genBtn').addEventListener('click', generateRandomSequence);
document.getElementById('addBtn').addEventListener('click', addManualAccess);
document.getElementById('pageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addManualAccess();
});
document.getElementById('runBtn').addEventListener('click', toggleRun);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopRunning();
    doStep();
});
document.getElementById('resetBtn').addEventListener('click', resetToStart);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'FIFO è la scelta migliore per decidere chi sfrattare? ▸'
        : 'FIFO è la scelta migliore per decidere chi sfrattare? ▾';
});

// --- Inizializzazione ---------------------------------------------------------
// Una sequenza casuale è pronta subito al caricamento della pagina: "Passo
// singolo" funziona immediatamente, senza dover prima premere "Avvia".
generateRandomSequence();
