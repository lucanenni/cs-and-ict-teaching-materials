const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');

// Un paesaggio con due valli: una più profonda (minimo globale, a sinistra)
// e una meno profonda (minimo locale, a destra), separate da una piccola
// collina. Dove la pallina si ferma dipende da dove parte e da quanto è
// grande il tasso di apprendimento.
const X_MIN = -3.2;
const X_MAX = 3.2;
const WATERSHED_X = 0.13; // approssimativamente lo spartiacque tra le due valli

function f(x) {
    return 0.15 * x ** 4 - 1.2 * x ** 2 + 0.3 * x + 5;
}

function fPrime(x) {
    return 0.6 * x ** 3 - 2.4 * x + 0.3;
}

// Calcola il range verticale della funzione nel dominio visibile, per
// disegnare il grafico riempiendo bene lo spazio disponibile.
let Y_MIN = Infinity, Y_MAX = -Infinity;
for (let x = X_MIN; x <= X_MAX; x += 0.02) {
    const y = f(x);
    if (y < Y_MIN) Y_MIN = y;
    if (y > Y_MAX) Y_MAX = y;
}
Y_MIN -= 0.4;
Y_MAX += 0.4;

let state = {
    x: 2.6,
    trail: [],
    steps: 0,
    isPlaying: false,
    speed: 400,
    learningRate: 0.05,
    interval: null,
    diverged: false
};

function toCanvasX(x) {
    const margin = 25;
    return margin + ((x - X_MIN) / (X_MAX - X_MIN)) * (canvas.width - margin * 2);
}

function toCanvasY(y) {
    const margin = 20;
    return canvas.height - margin - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (canvas.height - margin * 2);
}

function fromCanvasX(px) {
    const margin = 25;
    const ratio = (px - margin) / (canvas.width - margin * 2);
    return X_MIN + ratio * (X_MAX - X_MIN);
}

function resizeCanvasIfNeeded() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function isConverged() {
    return !state.diverged && Math.abs(fPrime(state.x)) < 0.05;
}

function step() {
    if (state.diverged || isConverged()) return;

    const grad = fPrime(state.x);
    const newX = state.x - state.learningRate * grad;

    state.trail.push(state.x);
    if (state.trail.length > 60) state.trail.shift();

    state.x = newX;
    state.steps++;

    if (Math.abs(state.x) > X_MAX + 1.5 || !isFinite(state.x)) {
        state.diverged = true;
        stopPlaying();
    } else if (isConverged()) {
        stopPlaying();
    }

    render();
}

function render() {
    resizeCanvasIfNeeded();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Curva della funzione
    ctx.strokeStyle = '#0e7490';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = X_MIN; x <= X_MAX; x += 0.02) {
        const px = toCanvasX(x);
        const py = toCanvasY(f(x));
        if (x === X_MIN) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Scia dei passi precedenti
    state.trail.forEach((tx, i) => {
        const px = toCanvasX(tx);
        const py = toCanvasY(f(tx));
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(8, 145, 178, ${0.15 + (i / state.trail.length) * 0.35})`;
        ctx.fill();
    });

    // Pallina (posizione disegnata "agganciata" al bordo se fuori dal dominio visibile)
    const clampedX = Math.max(X_MIN, Math.min(X_MAX, state.x));
    const bx = toCanvasX(clampedX);
    const by = toCanvasY(f(clampedX));
    ctx.beginPath();
    ctx.arc(bx, by, 8, 0, Math.PI * 2);
    ctx.fillStyle = state.diverged ? '#dc2626' : '#0891b2';
    ctx.fill();
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    renderInfo();
}

function renderInfo() {
    const info = document.getElementById('infoContent');
    const grad = fPrime(state.x);
    let html = `Posizione: <strong>x = ${state.x.toFixed(2)}</strong>, errore f(x) = <strong>${f(state.x).toFixed(2)}</strong><br>`;
    html += `Pendenza (gradiente): <strong>${grad.toFixed(2)}</strong> · Passi fatti: <strong>${state.steps}</strong>`;

    if (state.diverged) {
        html += '<br><span class="info-warning">⚠ La pallina è uscita dal grafico: il tasso di apprendimento è troppo alto, prova ad abbassarlo.</span>';
    } else if (isConverged()) {
        const basin = state.x < WATERSHED_X
            ? 'nel minimo globale (il punto più basso possibile!)'
            : 'in un minimo locale (non il più basso possibile — prova a ripartire più a sinistra)';
        html += `<br><span class="info-converged">✓ Convergenza raggiunta: la pallina si è fermata ${basin}.</span>`;
    }

    info.innerHTML = html;

    const playBtn = document.getElementById('playPauseBtn');
    const stopped = state.diverged || isConverged();
    playBtn.disabled = stopped;
    document.getElementById('stepBtn').disabled = stopped;
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else {
        playBtn.textContent = '▶ Avvia';
    }
}

function startPlaying() {
    if (state.diverged || isConverged()) return;
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    state.interval = setInterval(() => {
        if (state.diverged || isConverged()) {
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
    if (state.diverged || isConverged()) return;
    if (state.isPlaying) {
        stopPlaying();
        render();
    } else {
        startPlaying();
    }
}

function resetTo(x) {
    stopPlaying();
    state.x = x;
    state.trail = [];
    state.steps = 0;
    state.diverged = false;
    render();
}

// Event listeners
document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    step();
});
document.getElementById('resetBtn').addEventListener('click', () => resetTo(state.trail.length ? state.trail[0] : state.x));

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const x = Math.max(X_MIN, Math.min(X_MAX, fromCanvasX(px)));
    resetTo(x);
});

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
    document.getElementById('rateLabel').textContent = `Tasso di apprendimento: ${state.learningRate.toFixed(2)}`;
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
render();
