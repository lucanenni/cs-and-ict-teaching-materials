const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');
const SCORE_RANGE = 10; // competenza ed esperienza vanno da 0 a 10
const THRESHOLD = 7; // punteggio minimo per essere assunti
const CITY_A_BOOST = 2; // vantaggio storico ingiustificato per la Città A
const CITY_B_PENALTY = -1;

let state = {
    pairs: [],
    useCity: true
};

function generatePairs() {
    // Ogni coppia rappresenta due candidati con ESATTAMENTE lo stesso merito
    // (competenza ed esperienza) — uno di Città A, uno di Città B. Vengono
    // disegnati come un unico pallino diviso a metà nella STESSA posizione,
    // invece di due pallini vicini ma separati: prima li scostavamo
    // leggermente per non farli coincidere a schermo, ma anche con una
    // direzione casuale per coppia restavano visivamente "appiccicati",
    // suggerendo un accoppiamento innaturale. Un solo simbolo bicolore nella
    // posizione esatta comunica meglio "stesso identico merito".
    const pairs = [];
    for (let i = 0; i < 12; i++) {
        const competenza = 3 + Math.random() * 7;
        const esperienza = 3 + Math.random() * 7;
        pairs.push({ competenza, esperienza });
    }
    return pairs;
}

function historicalScore(c) {
    const base = (c.competenza + c.esperienza) / 2;
    return base + (c.city === 'A' ? CITY_A_BOOST : CITY_B_PENALTY);
}

function modelScore(c) {
    const base = (c.competenza + c.esperienza) / 2;
    if (!state.useCity) return base;
    return base + (c.city === 'A' ? CITY_A_BOOST : CITY_B_PENALTY);
}

function hiredByModel(c) {
    return modelScore(c) >= THRESHOLD;
}

function toCanvasCoords(competenza, esperienza) {
    const margin = 30;
    const plotW = canvas.width - margin * 2;
    const plotH = canvas.height - margin * 2;
    return {
        cx: margin + (competenza / SCORE_RANGE) * plotW,
        cy: canvas.height - margin - (esperienza / SCORE_RANGE) * plotH
    };
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

    const margin = 30;

    // Assi
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Competenza →', canvas.width / 2, canvas.height - 8);
    ctx.save();
    ctx.translate(12, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Esperienza →', 0, 0);
    ctx.restore();

    // Ogni coppia è un solo pallino diviso a metà, nella posizione esatta del
    // loro (identico) merito: metà sinistra = Città A, metà destra = Città B.
    // Niente scarti né posizioni approssimate: la stessa identica competenza
    // ed esperienza restano un solo punto sul grafico.
    const r = 8;
    state.pairs.forEach(p => {
        const { cx, cy } = toCanvasCoords(p.competenza, p.esperienza);
        const hiredA = hiredByModel({ ...p, city: 'A' });
        const hiredB = hiredByModel({ ...p, city: 'B' });

        drawHalfCircle(cx, cy, r, Math.PI / 2, Math.PI * 1.5, '#2563eb', hiredA); // sinistra: Città A
        drawHalfCircle(cx, cy, r, -Math.PI / 2, Math.PI / 2, '#d97706', hiredB); // destra: Città B

        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx, cy + r);
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    renderStats();
}

function drawHalfCircle(cx, cy, r, startAngle, endAngle, color, filled) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function renderStats() {
    const hiredA = state.pairs.filter(p => hiredByModel({ ...p, city: 'A' })).length;
    const hiredB = state.pairs.filter(p => hiredByModel({ ...p, city: 'B' })).length;
    const rateA = Math.round((hiredA / state.pairs.length) * 100);
    const rateB = Math.round((hiredB / state.pairs.length) * 100);

    document.getElementById('barA').style.width = rateA + '%';
    document.getElementById('barB').style.width = rateB + '%';
    document.getElementById('valueA').textContent = rateA + '%';
    document.getElementById('valueB').textContent = rateB + '%';

    const gap = Math.abs(rateA - rateB);
    const note = document.getElementById('statsNote');
    if (gap <= 5) {
        note.textContent = `✓ Divario minimo (${gap} punti): le due città vengono trattate in modo pressoché equo.`;
        note.style.color = '#15803d';
    } else {
        note.textContent = `⚠ Divario di ${gap} punti percentuali tra le due città, a parità di merito medio.`;
        note.style.color = '#b45309';
    }
}

function newCandidates() {
    state.pairs = generatePairs();
    render();
}

document.getElementById('useCityToggle').addEventListener('change', (e) => {
    state.useCity = e.target.checked;
    render();
});

document.getElementById('newCandidatesBtn').addEventListener('click', newCandidates);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? "Basta togliere l'informazione sensibile per risolvere il problema? ▸"
        : "Basta togliere l'informazione sensibile per risolvere il problema? ▾";
});

window.addEventListener('resize', render);

// Inizializzazione
newCandidates();
