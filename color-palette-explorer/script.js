function normHue(h) {
    return ((h % 360) + 360) % 360;
}

function hslToRgb(h, s, l) {
    h = normHue(h); s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHex([r, g, b]) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function srgbToLinear(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relLuminance([r, g, b]) {
    const [R, G, B] = [r, g, b].map(srgbToLinear);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(rgb1, rgb2) {
    const L1 = relLuminance(rgb1), L2 = relLuminance(rgb2);
    const lighter = Math.max(L1, L2), darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
}

const HARMONIES = {
    complementary: { label: 'Complementare', build: (h) => [h, h + 180] },
    analogous: { label: 'Analoghi', build: (h) => [h - 30, h, h + 30] },
    triadic: { label: 'Triade', build: (h) => [h, h + 120, h + 240] },
    tetradic: { label: 'Tetrade', build: (h) => [h, h + 90, h + 180, h + 270] },
    monochromatic: { label: 'Monocromatica', build: () => null }
};

const HELP_TEXT = {
    complementary: [
        '• La <strong>complementare</strong> usa una tonalità e quella opposta sulla ruota dei colori (+180°): il contrasto massimo possibile tra due tinte.',
        '• Ottima per far risaltare un elemento (es. un pulsante) su uno sfondo, ma può risultare stridente se usata in parti uguali su grandi superfici.'
    ],
    analogous: [
        '• Gli <strong>analoghi</strong> sono tonalità vicine sulla ruota dei colori (±30°): producono combinazioni armoniose e naturali, spesso viste in paesaggi reali.',
        '• Meno contrasto della complementare: buona per sfondi e composizioni riposanti, meno per far risaltare un singolo elemento.'
    ],
    triadic: [
        '• La <strong>triade</strong> usa tre tonalità equidistanti (ogni 120°): un buon compromesso tra armonia e varietà.',
        '• Spesso una delle tre tinte viene usata come dominante e le altre due come accenti, per evitare che "litighino" tra loro.'
    ],
    tetradic: [
        '• La <strong>tetrade</strong> (o "quadrato") usa quattro tonalità equidistanti (ogni 90°): la palette più ricca e la più difficile da bilanciare.',
        '• Funziona meglio se una tinta domina e le altre tre fanno da accento, piuttosto che usarle tutte con lo stesso peso.'
    ],
    monochromatic: [
        '• La <strong>monocromatica</strong> usa una sola tonalità, variando solo luminosità (e a volte saturazione): sempre armoniosa per costruzione, perché è letteralmente lo stesso colore.',
        '• Ideale quando serve una gerarchia visiva chiara (titoli, sfondi, bordi) senza introdurre colori diversi.'
    ]
};

let state = {
    h: 210,
    s: 70,
    l: 50,
    harmony: 'complementary',
    palette: []
};

function computePalette() {
    if (state.harmony === 'monochromatic') {
        return [20, 35, 50, 65, 80].map(l => ({ h: state.h, s: state.s, l }));
    }
    const hues = HARMONIES[state.harmony].build(state.h);
    return hues.map(h => ({ h: normHue(h), s: state.s, l: state.l }));
}

function renderBase() {
    document.getElementById('hueValue').textContent = state.h + '°';
    document.getElementById('satValue').textContent = state.s + '%';
    document.getElementById('lightValue').textContent = state.l + '%';
    const rgb = hslToRgb(state.h, state.s, state.l);
    document.getElementById('baseSwatch').style.background = rgbToHex(rgb);
}

function renderPalette() {
    state.palette = computePalette();
    const row = document.getElementById('paletteRow');
    row.innerHTML = '';
    state.palette.forEach(c => {
        const rgb = hslToRgb(c.h, c.s, c.l);
        const hex = rgbToHex(rgb);
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch';
        swatch.innerHTML = `<div class="palette-color" style="background:${hex}"></div><div class="palette-hex">${hex}</div>`;
        row.appendChild(swatch);
    });
    renderColorSelects();
}

function allColorOptions() {
    const base = { label: `Base (${rgbToHex(hslToRgb(state.h, state.s, state.l))})`, hex: rgbToHex(hslToRgb(state.h, state.s, state.l)) };
    const paletteOptions = state.palette.map((c, i) => {
        const hex = rgbToHex(hslToRgb(c.h, c.s, c.l));
        return { label: `Palette ${i + 1} (${hex})`, hex };
    });
    return [base, ...paletteOptions,
    { label: 'Bianco (#ffffff)', hex: '#ffffff' },
    { label: 'Nero (#000000)', hex: '#000000' }];
}

function renderColorSelects() {
    const options = allColorOptions();
    const textSelect = document.getElementById('textColorSelect');
    const bgSelect = document.getElementById('bgColorSelect');
    const prevText = textSelect.value, prevBg = bgSelect.value;
    [textSelect, bgSelect].forEach(sel => {
        sel.innerHTML = options.map(o => `<option value="${o.hex}">${o.label}</option>`).join('');
    });
    textSelect.value = options.some(o => o.hex === prevText) ? prevText : '#000000';
    bgSelect.value = options.some(o => o.hex === prevBg) ? prevBg : '#ffffff';
    renderContrast();
}

function hexToRgb(hex) {
    const v = hex.replace('#', '');
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function renderContrast() {
    const textHex = document.getElementById('textColorSelect').value;
    const bgHex = document.getElementById('bgColorSelect').value;
    const preview = document.getElementById('contrastPreview');
    preview.style.color = textHex;
    preview.style.background = bgHex;

    const ratio = contrastRatio(hexToRgb(textHex), hexToRgb(bgHex));
    const ratioStr = ratio.toFixed(2);

    const checks = [
        ['AA normale (≥4.5)', ratio >= 4.5],
        ['AA testo grande (≥3.0)', ratio >= 3.0],
        ['AAA normale (≥7.0)', ratio >= 7.0],
        ['AAA testo grande (≥4.5)', ratio >= 4.5]
    ];
    document.getElementById('contrastResult').innerHTML =
        `Rapporto di contrasto: <strong>${ratioStr} : 1</strong>` +
        `<div class="badge-row">${checks.map(([label, pass]) => `<span class="badge ${pass ? 'pass' : 'fail'}">${pass ? '✓' : '✗'} ${label}</span>`).join('')}</div>`;
}

function setHarmony(h) {
    state.harmony = h;
    document.querySelectorAll('.harmony-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.harmony === h));
    document.getElementById('helpList').innerHTML = HELP_TEXT[h].map(li => `<li>${li}</li>`).join('');
    renderPalette();
}

document.getElementById('hueSlider').addEventListener('input', (e) => {
    state.h = parseInt(e.target.value, 10);
    renderBase();
    renderPalette();
});
document.getElementById('satSlider').addEventListener('input', (e) => {
    state.s = parseInt(e.target.value, 10);
    renderBase();
    renderPalette();
});
document.getElementById('lightSlider').addEventListener('input', (e) => {
    state.l = parseInt(e.target.value, 10);
    renderBase();
    renderPalette();
});

document.getElementById('harmonyToggle').addEventListener('click', (e) => {
    const btn = e.target.closest('.harmony-btn');
    if (btn) setHarmony(btn.dataset.harmony);
});

document.getElementById('textColorSelect').addEventListener('change', renderContrast);
document.getElementById('bgColorSelect').addEventListener('change', renderContrast);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché il contrasto conta più dell\'estetica? ▸'
        : 'Perché il contrasto conta più dell\'estetica? ▾';
});

// Inizializzazione
renderBase();
setHarmony('complementary');
