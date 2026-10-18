// --- Rete neurale a più strati: logica pura (verificata in Node) -----------
//
// 2 input -> 3 neuroni nascosti (ReLU) -> 1 neurone di output (sigmoide).
// Pesi e bias sono fissi e scelti per rendere i calcoli facili da seguire a
// mano; sono gli stessi usati nei test standalone.

const HIDDEN_WEIGHTS = [
    { w: [0.8, -0.6], b: 0.1 },
    { w: [-0.5, 0.9], b: -0.2 },
    { w: [0.3, 0.3], b: 0.0 }
];
const OUTPUT_WEIGHTS = { w: [1.0, -1.2, 0.5], b: -0.1 };

function relu(x) { return Math.max(0, x); }
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

function computeHidden(x1, x2, i) {
    const n = HIDDEN_WEIGHTS[i];
    const z = n.w[0] * x1 + n.w[1] * x2 + n.b;
    return { z, a: relu(z) };
}

function computeOutput(hiddenActivations) {
    const z = hiddenActivations.reduce((s, a, i) => s + a * OUTPUT_WEIGHTS.w[i], 0) + OUTPUT_WEIGHTS.b;
    return { z, a: sigmoid(z) };
}

// --- Interfaccia -------------------------------------------------------------

const canvas = document.getElementById('netCanvas');
const ctx = canvas.getContext('2d');

let state = {
    x1: 1,
    x2: 0,
    stepIndex: 0, // 0,1,2 = neuroni nascosti; 3 = output; 4 = tutto calcolato
    hidden: [null, null, null], // { z, a } una volta calcolato
    output: null,
    running: false,
    timer: null,
    speed: 1100,
    log: []
};

const STEP_LABELS = ['h1', 'h2', 'h3', 'output'];

function resizeCanvasIfNeeded() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function resetComputation() {
    stopRunning();
    state.stepIndex = 0;
    state.hidden = [null, null, null];
    state.output = null;
    state.log = [];
    document.getElementById('resultBox').classList.add('hidden');
}

function doStep() {
    if (state.stepIndex >= 4) return;

    if (state.stepIndex < 3) {
        const i = state.stepIndex;
        const n = HIDDEN_WEIGHTS[i];
        const r = computeHidden(state.x1, state.x2, i);
        state.hidden[i] = r;
        state.log.push(
            `h${i + 1}: z = ${n.w[0].toFixed(1)}×${state.x1.toFixed(2)} + (${n.w[1].toFixed(1)})×${state.x2.toFixed(2)} + ${n.b.toFixed(1)} = ${r.z.toFixed(3)} → ReLU(${r.z.toFixed(3)}) = ${r.a.toFixed(3)}`
        );
    } else {
        const acts = state.hidden.map(h => h.a);
        const r = computeOutput(acts);
        state.output = r;
        state.log.push(
            `output: z = ${OUTPUT_WEIGHTS.w[0].toFixed(1)}×${acts[0].toFixed(3)} + (${OUTPUT_WEIGHTS.w[1].toFixed(1)})×${acts[1].toFixed(3)} + ${OUTPUT_WEIGHTS.w[2].toFixed(1)}×${acts[2].toFixed(3)} + ${OUTPUT_WEIGHTS.b.toFixed(1)} = ${r.z.toFixed(3)} → sigmoide(${r.z.toFixed(3)}) = ${r.a.toFixed(3)}`
        );
        showResult(`Output finale della rete: ${r.a.toFixed(3)} (sigmoide di z = ${r.z.toFixed(3)}).`);
        stopRunning();
    }
    state.stepIndex++;
    render();
}

function showResult(text) {
    const box = document.getElementById('resultBox');
    box.textContent = text;
    box.classList.remove('hidden', 'bad');
    box.classList.add('good');
}

function startRunning() {
    if (state.running || state.stepIndex >= 4) return;
    state.running = true;
    document.getElementById('runBtn').textContent = '⏸ Pausa';
    state.timer = setInterval(() => {
        doStep();
        if (state.stepIndex >= 4) stopRunning();
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

function weightColor(w) {
    return w >= 0 ? `rgba(29,78,216,${Math.min(0.25 + Math.abs(w) * 0.4, 1)})` : `rgba(220,38,38,${Math.min(0.25 + Math.abs(w) * 0.4, 1)})`;
}

function drawEdge(x1, y1, x2, y2, weight, labelOffset) {
    ctx.strokeStyle = weightColor(weight);
    ctx.lineWidth = Math.max(1.3, Math.min(Math.abs(weight) * 2.2, 4));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const mx = x1 + (x2 - x1) * labelOffset;
    const my = y1 + (y2 - y1) * labelOffset;
    ctx.fillStyle = '#374151';
    ctx.font = '11px -apple-system, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(weight.toFixed(1), mx, my - 4);
}

function drawNode(x, y, radius, label, value, computed, justComputed) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (computed) {
        const intensity = Math.min(Math.abs(value) / 1.5, 1);
        ctx.fillStyle = `rgba(29,78,216,${0.25 + intensity * 0.6})`;
    } else {
        ctx.fillStyle = '#e5e7eb';
    }
    ctx.fill();
    ctx.strokeStyle = justComputed ? '#f59e0b' : '#1f2937';
    ctx.lineWidth = justComputed ? 4 : 2;
    ctx.stroke();

    ctx.fillStyle = computed && Math.abs(value) / 1.5 > 0.55 ? 'white' : '#1f2937';
    ctx.font = 'bold 12px -apple-system, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y - 9);
    ctx.font = '12px -apple-system, Arial, sans-serif';
    ctx.fillText(computed ? value.toFixed(3) : '?', x, y + 9);
}

function render() {
    resizeCanvasIfNeeded();
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const inputX = Math.max(55, w * 0.1);
    const hiddenX = w * 0.5;
    const outputX = Math.min(w - 55, w * 0.9);
    const inputYs = [h * 0.32, h * 0.68];
    const hiddenYs = [h * 0.18, h * 0.5, h * 0.82];
    const outputY = h * 0.5;

    // Archi input -> nascosti
    HIDDEN_WEIGHTS.forEach((n, j) => {
        inputYs.forEach((iy, i) => {
            drawEdge(inputX, iy, hiddenX, hiddenYs[j], n.w[i], 0.35 + j * 0.08);
        });
    });

    // Archi nascosti -> output
    OUTPUT_WEIGHTS.w.forEach((wt, j) => {
        drawEdge(hiddenX, hiddenYs[j], outputX, outputY, wt, 0.65);
    });

    // Nodi input
    const inputVals = [state.x1, state.x2];
    inputVals.forEach((v, i) => {
        drawNode(inputX, inputYs[i], 26, `x${i + 1}`, v, true, false);
    });

    // Nodi nascosti
    state.hidden.forEach((hv, i) => {
        const justComputed = state.stepIndex === i + 1 && hv !== null;
        drawNode(hiddenX, hiddenYs[i], 28, `h${i + 1}`, hv ? hv.a : 0, hv !== null, justComputed);
    });

    // Nodo output
    const outJustComputed = state.stepIndex === 4 && state.output !== null;
    drawNode(outputX, outputY, 30, 'out', state.output ? state.output.a : 0, state.output !== null, outJustComputed);

    renderStatus();
}

function renderStatus() {
    const panel = document.getElementById('stepPanel');
    panel.innerHTML = state.log.map((line, i) =>
        `<div class="step-line ${i === state.log.length - 1 ? 'current' : ''}">${i + 1}. ${line}</div>`
    ).join('') || '<div class="step-line">Premi "Passo singolo" o "Avvia" per calcolare h1, il primo neurone nascosto.</div>';
    panel.scrollTop = panel.scrollHeight;

    const done = state.stepIndex >= 4;
    document.getElementById('stepBtn').disabled = done;
    document.getElementById('runBtn').disabled = done;
}

// --- Eventi --------------------------------------------------------------------

document.getElementById('x1Range').addEventListener('input', (e) => {
    state.x1 = parseFloat(e.target.value);
    document.getElementById('x1Value').textContent = state.x1.toFixed(2);
    resetComputation();
    render();
});

document.getElementById('x2Range').addEventListener('input', (e) => {
    state.x2 = parseFloat(e.target.value);
    document.getElementById('x2Value').textContent = state.x2.toFixed(2);
    resetComputation();
    render();
});

document.getElementById('runBtn').addEventListener('click', toggleRun);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopRunning();
    doStep();
});
document.getElementById('resetBtn').addEventListener('click', () => {
    resetComputation();
    render();
});

window.addEventListener('resize', render);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché serve uno strato nascosto, non basta un solo neurone? ▸'
        : 'Perché serve uno strato nascosto, non basta un solo neurone? ▾';
});

// --- Inizializzazione ---------------------------------------------------------
// Lo stato iniziale (x1=1, x2=0, nessun neurone ancora calcolato) è pronto
// subito: "Passo singolo" funziona dal primo caricamento della pagina.
document.getElementById('x1Value').textContent = state.x1.toFixed(2);
document.getElementById('x2Value').textContent = state.x2.toFixed(2);
render();
