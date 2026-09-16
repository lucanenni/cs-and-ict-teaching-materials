const canvas = document.getElementById('stripCanvas');
const ctx = canvas.getContext('2d');

function gaussianRandom(mean, std) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * std;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function generateData() {
    const data = [];
    for (let i = 0; i < 25; i++) {
        data.push({ score: clamp(gaussianRandom(68, 16), 0, 100), label: 'spam' });
    }
    for (let i = 0; i < 25; i++) {
        data.push({ score: clamp(gaussianRandom(32, 16), 0, 100), label: 'ham' });
    }
    return data;
}

let state = {
    data: generateData(),
    threshold: 50
};

function confusionCounts() {
    const counts = { tp: 0, fp: 0, tn: 0, fn: 0 };
    state.data.forEach(({ score, label }) => {
        const predictedSpam = score >= state.threshold;
        const isSpam = label === 'spam';
        if (predictedSpam && isSpam) counts.tp++;
        else if (predictedSpam && !isSpam) counts.fp++;
        else if (!predictedSpam && !isSpam) counts.tn++;
        else counts.fn++;
    });
    return counts;
}

function resizeCanvasIfNeeded() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function render() {
    resizeCanvasIfNeeded();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margin = 20;
    const toX = score => margin + (score / 100) * (canvas.width - margin * 2);

    // Sfondo: regione "predetto spam" a destra della soglia
    const thresholdX = toX(state.threshold);
    ctx.fillStyle = 'rgba(79, 70, 229, 0.06)';
    ctx.fillRect(thresholdX, 0, canvas.width - thresholdX, canvas.height);

    // Punti, distribuiti su più righe per non sovrapporsi troppo
    const rows = 4;
    const rowHeight = (canvas.height - 30) / rows;
    const byRow = [[], [], [], []];
    state.data.forEach((d, i) => byRow[i % rows].push(d));

    byRow.forEach((rowData, r) => {
        const y = 20 + r * rowHeight + rowHeight / 2;
        rowData.forEach(({ score, label }) => {
            const x = toX(score);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = label === 'spam' ? '#e11d48' : '#059669';
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    });

    // Linea della soglia
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(thresholdX, 0);
    ctx.lineTo(thresholdX, canvas.height);
    ctx.stroke();

    renderStats();
}

function renderStats() {
    const { tp, fp, tn, fn } = confusionCounts();
    const total = tp + fp + tn + fn;

    document.getElementById('cellTP').innerHTML = `${tp}<span class="cell-label">Vero positivo</span>`;
    document.getElementById('cellFP').innerHTML = `${fp}<span class="cell-label">Falso positivo</span>`;
    document.getElementById('cellFN').innerHTML = `${fn}<span class="cell-label">Falso negativo</span>`;
    document.getElementById('cellTN').innerHTML = `${tn}<span class="cell-label">Vero negativo</span>`;

    const accuracy = total > 0 ? (tp + tn) / total : 0;
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : null;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : null;

    setMetric('Accuracy', accuracy);
    setMetric('Precision', precision);
    setMetric('Recall', recall);
}

function setMetric(name, value) {
    const barId = 'bar' + name;
    const valueId = 'value' + name;
    const bar = document.getElementById(barId);
    const label = document.getElementById(valueId);
    if (value === null) {
        bar.style.width = '0%';
        label.textContent = 'n/d';
    } else {
        bar.style.width = Math.round(value * 100) + '%';
        label.textContent = Math.round(value * 100) + '%';
    }
}

document.getElementById('thresholdSlider').addEventListener('input', (e) => {
    state.threshold = parseInt(e.target.value);
    document.getElementById('thresholdValue').textContent = state.threshold;
    render();
});

document.getElementById('newDataBtn').addEventListener('click', () => {
    state.data = generateData();
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? "Perché non basta guardare solo l'accuratezza? ▸"
        : "Perché non basta guardare solo l'accuratezza? ▾";
});

window.addEventListener('resize', render);

render();
