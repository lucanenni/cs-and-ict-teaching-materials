const DISPLAY_W = 480, DISPLAY_H = 360;
const SOURCE_W = 800, SOURCE_H = 600;

// Palette EGA/CGA standard (i valori 0/85/170/255 sono la codifica classica
// "bassa/alta intensità" a 4 bit usata da IBM per queste schede).
const EGA_PALETTE = [
    [0, 0, 0], [0, 0, 170], [0, 170, 0], [0, 170, 170],
    [170, 0, 0], [170, 0, 170], [170, 85, 0], [170, 170, 170],
    [85, 85, 85], [85, 85, 255], [85, 255, 85], [85, 255, 255],
    [255, 85, 85], [255, 85, 255], [255, 255, 85], [255, 255, 255]
];
// CGA Palette 1, alta intensità: nero, ciano chiaro, magenta chiaro, bianco.
const CGA_PALETTE = [[0, 0, 0], [85, 255, 255], [255, 85, 255], [255, 255, 255]];

function nearestInPalette(r, g, b, palette) {
    let best = palette[0], bestDist = Infinity;
    for (const [pr, pg, pb] of palette) {
        const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
        if (dist < bestDist) { bestDist = dist; best = [pr, pg, pb]; }
    }
    return best;
}

function quantize332(r, g, b) {
    const rq = Math.round(Math.round(r / 255 * 7) / 7 * 255);
    const gq = Math.round(Math.round(g / 255 * 7) / 7 * 255);
    const bq = Math.round(Math.round(b / 255 * 3) / 3 * 255);
    return [rq, gq, bq];
}

const PRESETS = [
    { key: 'original', label: 'Originale', resW: SOURCE_W, resH: SOURCE_H, colorFn: null, colorsDesc: 'milioni di colori (24 bit)' },
    { key: 'svga', label: 'SVGA (640×480)', resW: 640, resH: 480, colorFn: null, colorsDesc: 'milioni di colori — solo la risoluzione è ridotta' },
    { key: 'vga', label: 'VGA "Mode 13h" (320×200)', resW: 320, resH: 200, colorFn: quantize332, colorsDesc: '256 colori (quantizzati)' },
    { key: 'ega', label: 'EGA (320×200)', resW: 320, resH: 200, colorFn: (r, g, b) => nearestInPalette(r, g, b, EGA_PALETTE), colorsDesc: '16 colori (palette EGA standard)' },
    { key: 'cga', label: 'CGA (320×200)', resW: 320, resH: 200, colorFn: (r, g, b) => nearestInPalette(r, g, b, CGA_PALETTE), colorsDesc: '4 colori (palette CGA, alta intensità)' }
];

const sourceCanvas = document.createElement('canvas');
sourceCanvas.width = SOURCE_W;
sourceCanvas.height = SOURCE_H;
const sourceCtx = sourceCanvas.getContext('2d');

function rand(min, max) { return min + Math.random() * (max - min); }

function drawSourceImage() {
    const w = SOURCE_W, h = SOURCE_H;
    const ctx = sourceCtx;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(0.55, '#60a5fa');
    grad.addColorStop(1, '#fef08a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(w * rand(0.6, 0.85), h * rand(0.15, 0.3), w * 0.075, 0, Math.PI * 2);
    ctx.fill();

    const mountainColors = ['#15803d', '#166534', '#14532d'];
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = mountainColors[i];
        const baseX = w * (0.05 + i * 0.28 + rand(-0.05, 0.05));
        const peakX = baseX + w * rand(0.12, 0.2);
        const peakY = h * rand(0.32, 0.55);
        ctx.beginPath();
        ctx.moveTo(baseX, h);
        ctx.lineTo(peakX, peakY);
        ctx.lineTo(baseX + w * 0.4, h);
        ctx.closePath();
        ctx.fill();
    }

    const dotColors = ['#dc2626', '#eab308', '#ec4899', '#8b5cf6', '#f97316', '#22c55e'];
    for (let i = 0; i < 60; i++) {
        ctx.fillStyle = dotColors[i % dotColors.length];
        const x = rand(0, w);
        const y = h * rand(0.82, 1);
        ctx.beginPath();
        ctx.arc(x, y, w * 0.006, 0, Math.PI * 2);
        ctx.fill();
    }
}

let currentPreset = PRESETS[0];

function renderPreset() {
    const { resW, resH, colorFn } = currentPreset;

    const small = document.createElement('canvas');
    small.width = resW;
    small.height = resH;
    const sctx = small.getContext('2d');
    sctx.imageSmoothingEnabled = true;
    sctx.drawImage(sourceCanvas, 0, 0, resW, resH);

    if (colorFn) {
        const imgData = sctx.getImageData(0, 0, resW, resH);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const [r, g, b] = colorFn(d[i], d[i + 1], d[i + 2]);
            d[i] = r; d[i + 1] = g; d[i + 2] = b;
        }
        sctx.putImageData(imgData, 0, 0);
    }

    const display = document.getElementById('displayCanvas');
    const dctx = display.getContext('2d');
    dctx.imageSmoothingEnabled = false;
    dctx.clearRect(0, 0, DISPLAY_W, DISPLAY_H);
    dctx.drawImage(small, 0, 0, resW, resH, 0, 0, DISPLAY_W, DISPLAY_H);

    const totalPixelsOriginal = SOURCE_W * SOURCE_H;
    const totalPixelsPreset = resW * resH;
    const pct = Math.round((totalPixelsPreset / totalPixelsOriginal) * 100);
    document.getElementById('infoPanel').innerHTML =
        `${resW}×${resH} pixel (${totalPixelsPreset.toLocaleString('it-IT')} in totale, il ${pct}% dei pixel dell'originale) · ${currentPreset.colorsDesc}` +
        `<span class="info-note">${currentPreset.key === 'original' ? 'Nessuna riduzione applicata.' : 'Zoom in su un dettaglio piccolo (es. il sole) per vedere l\'effetto più chiaramente.'}</span>`;
}

function renderPresetButtons() {
    const box = document.getElementById('presetToggle');
    box.innerHTML = '';
    PRESETS.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn' + (p.key === currentPreset.key ? ' active' : '');
        btn.textContent = p.label;
        btn.addEventListener('click', () => {
            currentPreset = p;
            renderPresetButtons();
            renderPreset();
        });
        box.appendChild(btn);
    });
}

document.getElementById('newImageBtn').addEventListener('click', () => {
    drawSourceImage();
    renderPreset();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non si usava sempre la massima qualità possibile? ▸'
        : 'Perché non si usava sempre la massima qualità possibile? ▾';
});

// Inizializzazione
drawSourceImage();
renderPresetButtons();
renderPreset();
