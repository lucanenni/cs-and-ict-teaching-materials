// --- K-means: logica pura (verificata in Node prima di collegarla al DOM) --
//
// assignPoints: assegna ogni punto al centroide più vicino (distanza
// euclidea al quadrato, basta per il confronto).
// updateCentroids: sposta ogni centroide alla media dei punti assegnati
// (un centroide senza punti assegnati resta fermo).
// maxMovement: il più grande spostamento tra vecchi e nuovi centroidi, usato
// come criterio di convergenza.

function distance2(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
}

function assignPoints(points, centroids) {
    return points.map(p => {
        let best = 0, bestDist = Infinity;
        centroids.forEach((c, i) => {
            const d = distance2(p, c);
            if (d < bestDist) { bestDist = d; best = i; }
        });
        return best;
    });
}

function updateCentroids(points, assignments, centroids) {
    return centroids.map((c, i) => {
        const assigned = points.filter((_, idx) => assignments[idx] === i);
        if (assigned.length === 0) return { x: c.x, y: c.y };
        const sx = assigned.reduce((s, p) => s + p.x, 0);
        const sy = assigned.reduce((s, p) => s + p.y, 0);
        return { x: sx / assigned.length, y: sy / assigned.length };
    });
}

function maxMovement(oldCentroids, newCentroids) {
    return Math.max(...oldCentroids.map((c, i) => Math.sqrt(distance2(c, newCentroids[i]))));
}

// --- Interfaccia -------------------------------------------------------------

const CLUSTER_COLORS = ['#1d4ed8', '#dc2626', '#16a34a', '#d97706'];
const MOVE_THRESHOLD = 1.2; // px: sotto questo spostamento massimo, consideriamo convergenza
const MAX_ITERATIONS = 20;

const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');

let state = {
    points: [],
    k: 3,
    centroids: [],
    assignments: [],
    phase: 'assign', // prossima mossa da eseguire: 'assign' o 'update'
    iteration: 0,
    converged: false,
    running: false,
    timer: null,
    speed: 700,
    log: []
};

function resizeCanvasIfNeeded() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        return true;
    }
    return false;
}

// Box-Muller per uno scatter "a nuvola" più realistico di un rettangolo pieno.
function randNormal() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function generatePoints(width, height) {
    const numBlobs = 2 + Math.floor(Math.random() * 2); // 2 o 3 gruppi
    const margin = 55;
    const centers = [];
    for (let i = 0; i < numBlobs; i++) {
        centers.push({
            x: margin + Math.random() * Math.max(1, width - 2 * margin),
            y: margin + Math.random() * Math.max(1, height - 2 * margin)
        });
    }
    const total = 22 + Math.floor(Math.random() * 9); // 22-30 punti
    const spread = Math.min(width, height) * 0.09 + 18;
    const points = [];
    for (let i = 0; i < total; i++) {
        const c = centers[i % centers.length];
        const x = Math.max(8, Math.min(width - 8, c.x + randNormal() * spread));
        const y = Math.max(8, Math.min(height - 8, c.y + randNormal() * spread));
        points.push({ x, y });
    }
    return points;
}

// Inizializzazione "Forgy": i centroidi di partenza sono K punti del dataset
// scelti a caso (senza ripetizioni) — è proprio questa scelta casuale che fa
// sì che partenze diverse portino a raggruppamenti finali diversi.
function pickRandomCentroids(points, k) {
    const idxs = Array.from({ length: points.length }, (_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    return idxs.slice(0, k).map(i => ({ x: points[i].x, y: points[i].y }));
}

function resetAlgorithmState(keepLog) {
    stopRunning();
    state.assignments = state.points.map(() => -1);
    state.phase = 'assign';
    state.iteration = 0;
    state.converged = false;
    if (!keepLog) state.log = [];
    document.getElementById('resultBox').classList.add('hidden');
}

function newPointsAndCentroids() {
    resizeCanvasIfNeeded();
    const w = canvas.width || canvas.clientWidth || 600;
    const h = canvas.height || canvas.clientHeight || 380;
    state.points = generatePoints(w, h);
    state.centroids = pickRandomCentroids(state.points, state.k);
    resetAlgorithmState(false);
    render();
}

function reinitCentroidsOnly() {
    state.centroids = pickRandomCentroids(state.points, state.k);
    resetAlgorithmState(false);
    state.log.push("Nuovi centroidi iniziali scelti a caso tra i punti esistenti.");
    render();
}

function logStep(text) {
    state.log.push(text);
}

function doStep() {
    if (state.converged) return;

    if (state.phase === 'assign') {
        state.assignments = assignPoints(state.points, state.centroids);
        logStep('Assegnazione: ogni punto prende il colore del centroide più vicino (distanza euclidea).');
        state.phase = 'update';
    } else {
        const newCentroids = updateCentroids(state.points, state.assignments, state.centroids);
        const move = maxMovement(state.centroids, newCentroids);
        state.centroids = newCentroids;
        state.iteration++;
        logStep(`Aggiornamento — iterazione ${state.iteration}: ogni centroide si sposta alla media dei punti assegnati (spostamento massimo: ${move.toFixed(1)} px).`);
        state.phase = 'assign';

        if (move < MOVE_THRESHOLD) {
            state.converged = true;
            stopRunning();
            logStep(`Convergenza raggiunta all'iterazione ${state.iteration}: i centroidi non si muovono più.`);
            showResult(`Convergenza raggiunta all'iterazione ${state.iteration}. I centroidi si sono stabilizzati: questa è una possibile soluzione finale, ma non necessariamente la migliore in assoluto (vedi il pannello di approfondimento).`, true);
        } else if (state.iteration >= MAX_ITERATIONS) {
            state.converged = true;
            stopRunning();
            logStep(`Raggiunto il numero massimo di iterazioni di sicurezza (${MAX_ITERATIONS}) senza piena convergenza.`);
            showResult(`Fermato dopo ${MAX_ITERATIONS} iterazioni (limite di sicurezza) senza convergenza completa.`, false);
        }
    }
    render();
}

function showResult(text, good) {
    const box = document.getElementById('resultBox');
    box.textContent = text;
    box.classList.remove('hidden', 'good', 'bad');
    box.classList.add(good ? 'good' : 'bad');
}

function startRunning() {
    if (state.running || state.converged) return;
    state.running = true;
    document.getElementById('runBtn').textContent = '⏸ Pausa';
    state.timer = setInterval(() => {
        doStep();
        if (state.converged) stopRunning();
    }, state.speed);
}

function stopRunning() {
    state.running = false;
    document.getElementById('runBtn').textContent = '▶ Avvia';
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
}

function toggleRun() {
    if (state.running) stopRunning(); else startRunning();
}

// --- Disegno -----------------------------------------------------------------

function render() {
    resizeCanvasIfNeeded();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Punti
    state.points.forEach((p, i) => {
        const clusterIdx = state.assignments[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = clusterIdx >= 0 ? CLUSTER_COLORS[clusterIdx] : '#9ca3af';
        ctx.fill();
        ctx.strokeStyle = 'rgba(31,41,55,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Centroidi (quadrati, bordo scuro, un colore per cluster)
    state.centroids.forEach((c, i) => {
        const size = 15;
        ctx.fillStyle = CLUSTER_COLORS[i];
        ctx.fillRect(c.x - size / 2, c.y - size / 2, size, size);
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.strokeRect(c.x - size / 2, c.y - size / 2, size, size);
    });

    renderStatus();
}

function renderStatus() {
    document.getElementById('phaseValue').textContent = state.converged
        ? 'Completato'
        : (state.phase === 'assign' ? 'Assegnazione' : 'Aggiornamento');
    document.getElementById('iterValue').textContent = String(state.iteration);

    const panel = document.getElementById('stepPanel');
    panel.innerHTML = state.log.map((line, i) =>
        `<div class="step-line ${i === state.log.length - 1 ? 'current' : ''}">${i + 1}. ${line}</div>`
    ).join('') || '<div class="step-line">Premi "Passo singolo" o "Avvia" per iniziare.</div>';
    panel.scrollTop = panel.scrollHeight;

    document.getElementById('stepBtn').disabled = state.converged;
    document.getElementById('runBtn').disabled = state.converged;
}

// --- Eventi --------------------------------------------------------------------

document.getElementById('kSelect').addEventListener('change', (e) => {
    state.k = parseInt(e.target.value, 10);
    state.centroids = pickRandomCentroids(state.points, state.k);
    resetAlgorithmState(false);
    render();
});

document.getElementById('newPointsBtn').addEventListener('click', newPointsAndCentroids);
document.getElementById('reinitBtn').addEventListener('click', reinitCentroidsOnly);
document.getElementById('runBtn').addEventListener('click', toggleRun);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopRunning();
    doStep();
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    state.points.push({ x, y });
    state.centroids = pickRandomCentroids(state.points, state.k);
    resetAlgorithmState(false);
    state.log.push('Nuovo punto aggiunto a mano: l\'algoritmo riparte con nuovi centroidi casuali.');
    render();
});

window.addEventListener('resize', () => {
    // Se la finestra cambia dimensione non ridisegniamo i punti esistenti in
    // scala (manterrebbe la logica semplice): ci limitiamo a far sì che il
    // canvas non si deformi.
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? "Perché risultati diversi se l'algoritmo è lo stesso? ▸"
        : "Perché risultati diversi se l'algoritmo è lo stesso? ▾";
});

// --- Inizializzazione ---------------------------------------------------------
// Punti e centroidi sono pronti subito al caricamento della pagina: "Passo
// singolo" funziona immediatamente, senza dover prima premere "Avvia".
newPointsAndCentroids();
