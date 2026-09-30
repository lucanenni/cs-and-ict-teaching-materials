const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');
const DOMAIN = 10; // le coordinate dei punti vanno da -DOMAIN a +DOMAIN

// Stato dell'applicazione
let state = {
    points: [],
    weights: [0, 0, 0], // w0 (bias), w1, w2
    index: 0,
    updates: 0,
    correctStreak: 0,
    converged: false,
    lastIndex: null,
    lastUpdated: false,
    isPlaying: false,
    speed: 500,
    learningRate: 0.3,
    interval: null
};

function generateDataset() {
    let best = null;
    for (let attempt = 0; attempt < 30; attempt++) {
        const angle = Math.random() * Math.PI;
        const a1 = Math.cos(angle);
        const a2 = Math.sin(angle);
        const a0 = (Math.random() - 0.5) * 4;
        const points = [];
        let tries = 0;
        while (points.length < 24 && tries < 3000) {
            tries++;
            const x = (Math.random() * 2 - 1) * (DOMAIN - 1);
            const y = (Math.random() * 2 - 1) * (DOMAIN - 1);
            const val = a0 + a1 * x + a2 * y;
            if (Math.abs(val) < 1.2) continue;
            points.push({ x, y, label: val > 0 ? 1 : -1 });
        }
        best = points;
        const pos = points.filter(p => p.label === 1).length;
        if (points.length === 24 && pos >= 8 && pos <= 16) {
            return points;
        }
    }
    return best;
}

function resetWeights() {
    state.weights = [0, 0, 0];
    state.index = 0;
    state.updates = 0;
    state.correctStreak = 0;
    state.converged = false;
    state.lastIndex = null;
    state.lastUpdated = false;
}

function newDataset() {
    stopPlaying();
    state.points = generateDataset();
    resetWeights();
    render();
}

function predict(p) {
    const z = state.weights[0] + state.weights[1] * p.x + state.weights[2] * p.y;
    return z >= 0 ? 1 : -1;
}

function accuracy() {
    if (state.points.length === 0) return 0;
    const correct = state.points.filter(p => predict(p) === p.label).length;
    return Math.round((correct / state.points.length) * 100);
}

function step() {
    if (state.converged || state.points.length === 0) return;

    const p = state.points[state.index];
    const pred = predict(p);
    let updated = false;

    if (pred !== p.label) {
        state.weights[0] += state.learningRate * p.label;
        state.weights[1] += state.learningRate * p.label * p.x;
        state.weights[2] += state.learningRate * p.label * p.y;
        state.updates++;
        state.correctStreak = 0;
        updated = true;
    } else {
        state.correctStreak++;
    }

    state.lastIndex = state.index;
    state.lastUpdated = updated;
    state.index = (state.index + 1) % state.points.length;

    if (state.correctStreak >= state.points.length) {
        state.converged = true;
        stopPlaying();
    }

    render();
}

function toCanvas(x, y) {
    const scale = Math.min(canvas.width, canvas.height) / (DOMAIN * 2 + 2);
    return {
        cx: canvas.width / 2 + x * scale,
        cy: canvas.height / 2 - y * scale
    };
}

function render() {
    resizeCanvasIfNeeded();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sfondo diviso dalle due regioni di decisione (solo se la retta esiste davvero)
    const [w0, w1, w2] = state.weights;
    if (w1 !== 0 || w2 !== 0) {
        const step = 8;
        for (let px = 0; px < canvas.width; px += step) {
            for (let py = 0; py < canvas.height; py += step) {
                const scale = Math.min(canvas.width, canvas.height) / (DOMAIN * 2 + 2);
                const x = (px - canvas.width / 2) / scale;
                const y = -(py - canvas.height / 2) / scale;
                const z = w0 + w1 * x + w2 * y;
                ctx.fillStyle = z >= 0 ? 'rgba(5, 150, 105, 0.06)' : 'rgba(217, 119, 6, 0.06)';
                ctx.fillRect(px, py, step, step);
            }
        }
    }

    // Assi
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const origin = toCanvas(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, origin.cy);
    ctx.lineTo(canvas.width, origin.cy);
    ctx.moveTo(origin.cx, 0);
    ctx.lineTo(origin.cx, canvas.height);
    ctx.stroke();

    // Retta di separazione: w0 + w1*x + w2*y = 0
    if (w2 !== 0 || w1 !== 0) {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (Math.abs(w2) > 1e-6) {
            const y1 = -(w0 + w1 * -DOMAIN) / w2;
            const y2 = -(w0 + w1 * DOMAIN) / w2;
            const p1 = toCanvas(-DOMAIN, y1);
            const p2 = toCanvas(DOMAIN, y2);
            ctx.moveTo(p1.cx, p1.cy);
            ctx.lineTo(p2.cx, p2.cy);
        } else {
            const x0 = -w0 / w1;
            const p1 = toCanvas(x0, -DOMAIN);
            const p2 = toCanvas(x0, DOMAIN);
            ctx.moveTo(p1.cx, p1.cy);
            ctx.lineTo(p2.cx, p2.cy);
        }
        ctx.stroke();
    }

    // Punti
    state.points.forEach((p, i) => {
        const { cx, cy } = toCanvas(p.x, p.y);
        const isLast = i === state.lastIndex;

        if (isLast) {
            ctx.beginPath();
            ctx.arc(cx, cy, 12, 0, Math.PI * 2);
            ctx.strokeStyle = state.lastUpdated ? '#dc2626' : '#059669';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = p.label === 1 ? '#059669' : '#d97706';
        ctx.fill();
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Info testuale
    const infoContent = document.getElementById('infoContent');
    let html = `Pesi attuali: <strong>w₀=${state.weights[0].toFixed(2)}, w₁=${state.weights[1].toFixed(2)}, w₂=${state.weights[2].toFixed(2)}</strong><br>`;
    html += `Aggiornamenti effettuati: <strong>${state.updates}</strong> · Accuratezza: <strong>${accuracy()}%</strong>`;
    if (state.converged) {
        html += '<br><span class="info-converged">✓ Convergenza raggiunta: la retta separa correttamente tutti i punti!</span>';
    } else if (state.lastIndex !== null) {
        html += `<br>Ultimo punto valutato: ${state.lastUpdated ? 'classificato male → pesi aggiornati' : 'già corretto → nessuna modifica'}`;
    }
    infoContent.innerHTML = html;

    const playBtn = document.getElementById('playPauseBtn');
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else if (state.converged) {
        playBtn.textContent = '▶ Avvia';
        playBtn.disabled = true;
    } else {
        playBtn.textContent = '▶ Avvia';
        playBtn.disabled = false;
    }

    document.getElementById('stepBtn').disabled = state.converged;
}

function resizeCanvasIfNeeded() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function startPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    state.interval = setInterval(() => {
        if (state.converged) {
            stopPlaying();
            return;
        }
        step();
    }, state.speed);
    render();
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
}

function playPause() {
    if (state.converged) return;
    if (state.isPlaying) {
        stopPlaying();
        render();
    } else {
        startPlaying();
    }
}

// Event listeners
document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    step();
});
document.getElementById('resetBtn').addEventListener('click', () => {
    stopPlaying();
    resetWeights();
    render();
});
document.getElementById('newDatasetBtn').addEventListener('click', newDataset);

document.getElementById('settingsBtn').addEventListener('click', () => {
    const panel = document.getElementById('settingsPanel');
    const isHidden = panel.classList.toggle('hidden');
    document.getElementById('settingsBtn').setAttribute('aria-expanded', String(!isHidden));
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value);
    document.getElementById('speedLabel').textContent = `Velocità di generazione: ${state.speed}ms`;
    if (state.isPlaying) startPlaying();
});

document.getElementById('rateSlider').addEventListener('input', (e) => {
    state.learningRate = parseFloat(e.target.value);
    document.getElementById('rateLabel').textContent = `Tasso di apprendimento: ${state.learningRate.toFixed(1)}`;
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? "Qual è la formula dell'aggiornamento? ▸"
        : "Qual è la formula dell'aggiornamento? ▾";
});

window.addEventListener('resize', render);

// Inizializzazione
newDataset();
