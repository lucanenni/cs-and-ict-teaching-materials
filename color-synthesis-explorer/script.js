const stageBox = document.getElementById('stageBox');
const circles = [document.getElementById('circle1'), document.getElementById('circle2'), document.getElementById('circle3')];
const sliders = [document.getElementById('slider1'), document.getElementById('slider2'), document.getElementById('slider3')];
const sliderLabels = [document.getElementById('slider1Label'), document.getElementById('slider2Label'), document.getElementById('slider3Label')];

// screen(a,b) approssima la sintesi ADDITIVA (luce): parte dal nero, i canali
// si sommano verso il bianco. multiply(a,b) approssima la sintesi
// SOTTRATTIVA (pigmenti): parte dal bianco, i canali si "assorbono" verso il
// nero. Sono le stesse formule usate nei software di grafica per lo stesso
// scopo, quindi il risultato visivo è davvero accurato, non solo simbolico.
function screenBlend(a, b) {
    return 255 - ((255 - a) * (255 - b)) / 255;
}

function multiplyBlend(a, b) {
    return (a * b) / 255;
}

function blendChannel(mode, a, b) {
    return Math.round(mode === 'additive' ? screenBlend(a, b) : multiplyBlend(a, b));
}

function blendColors(mode, c1, c2) {
    return [0, 1, 2].map(i => blendChannel(mode, c1[i], c2[i]));
}

function toRgbString([r, g, b]) {
    return `rgb(${r}, ${g}, ${b})`;
}

const modes = {
    additive: {
        stageBackground: '#0a0a0a',
        blendMode: 'screen',
        names: ['Rosso', 'Verde', 'Blu'],
        // colore del cerchio a intensità piena (v=255) per ciascun canale
        baseChannel: (v, i) => {
            const c = [0, 0, 0];
            c[i] = v;
            return c;
        },
        hint: 'La luce parte dal buio: più colori accendi, più il risultato si avvicina al bianco. È così che funziona ogni schermo — i tuoi occhi mescolano minuscoli pixel rossi, verdi e blu.',
        help: [
            '• Ogni pixel di uno schermo è in realtà composto da tre sotto-pixel: rosso, verde e blu.',
            '• Se non è acceso nessun colore, il pixel è nero: la sintesi additiva parte dal buio e <strong>aggiunge</strong> luce.',
            '• Accendendo tutti e tre al massimo si ottiene il bianco.',
            '• Sposta gli slider e guarda le zone di sovrapposizione cambiare colore in tempo reale.'
        ],
        pairLabels: ['Rosso + Verde', 'Verde + Blu', 'Rosso + Blu'],
        allLabel: 'Rosso + Verde + Blu'
    },
    subtractive: {
        stageBackground: '#ffffff',
        blendMode: 'multiply',
        names: ['Ciano', 'Magenta', 'Giallo'],
        baseChannel: (v, i) => {
            // A intensità piena il pigmento assorbe tutto tranne il proprio
            // colore: ciano pieno = (0,255,255), ecc. A v=0 sparisce nel
            // bianco dello sfondo.
            const c = [255, 255, 255];
            c[i] = 255 - v;
            return c;
        },
        hint: 'L\'inchiostro parte dal bianco della carta e "assorbe" la luce: più pigmento aggiungi, più il risultato si avvicina al nero. È così che funziona la stampa a colori.',
        help: [
            '• Un foglio bianco riflette tutta la luce che lo colpisce.',
            '• Ogni pigmento assorbe (sottrae) una parte dello spettro: il ciano assorbe il rosso, il magenta il verde, il giallo il blu.',
            '• Senza inchiostro il foglio resta bianco: la sintesi sottrattiva parte dalla luce piena e la <strong>toglie</strong> via via.',
            '• Mescolando ciano, magenta e giallo al massimo si ottiene (quasi) nero.'
        ],
        pairLabels: ['Ciano + Magenta', 'Magenta + Giallo', 'Ciano + Giallo'],
        allLabel: 'Ciano + Magenta + Giallo'
    }
};

let state = {
    mode: 'additive',
    values: [255, 255, 255]
};

function currentColors() {
    const cfg = modes[state.mode];
    return state.values.map((v, i) => cfg.baseChannel(v, i));
}

function layoutCircles() {
    const w = stageBox.clientWidth;
    const size = w * 0.44;
    const positions = [
        { x: w * 0.5, y: size * 0.52 },
        { x: w * 0.5 - size * 0.4, y: size * 0.52 + size * 0.62 },
        { x: w * 0.5 + size * 0.4, y: size * 0.52 + size * 0.62 }
    ];
    const stageHeight = size * 0.52 + size * 0.62 + size * 0.52;
    stageBox.style.height = stageHeight + 'px';
    circles.forEach((el, i) => {
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.left = (positions[i].x - size / 2) + 'px';
        el.style.top = (positions[i].y - size / 2) + 'px';
    });
}

function render() {
    const cfg = modes[state.mode];
    stageBox.style.backgroundColor = cfg.stageBackground;

    const colors = currentColors();
    circles.forEach((el, i) => {
        el.style.backgroundColor = toRgbString(colors[i]);
        el.style.mixBlendMode = cfg.blendMode;
    });

    sliders.forEach((slider, i) => {
        slider.value = state.values[i];
    });

    sliderLabels.forEach((label, i) => {
        const dotColor = toRgbString(cfg.baseChannel(255, i));
        label.innerHTML = `<span class="swatch-dot" style="display:inline-block;width:0.9rem;height:0.9rem;border-radius:50%;background:${dotColor};border:1px solid #d1d5db;"></span> ${cfg.names[i]}: ${state.values[i]}`;
    });

    document.getElementById('hintText').textContent = cfg.hint;
    document.getElementById('helpList').innerHTML = cfg.help.map(li => `<li>${li}</li>`).join('');

    renderLegend(cfg, colors);
}

function renderLegend(cfg, colors) {
    const pairs = [[0, 1], [1, 2], [0, 2]];
    const legend = document.getElementById('overlapLegend');
    let html = '';
    pairs.forEach(([a, b], idx) => {
        const blended = blendColors(state.mode, colors[a], colors[b]);
        html += legendItem(cfg.pairLabels[idx], blended);
    });
    const allBlended = blendColors(state.mode, blendColors(state.mode, colors[0], colors[1]), colors[2]);
    html += legendItem(cfg.allLabel, allBlended);
    legend.innerHTML = html;
}

function legendItem(label, color) {
    const rgbStr = toRgbString(color);
    return `
        <div class="overlap-item">
            <span class="swatch" style="background:${rgbStr}"></span>
            <span class="overlap-label">${label}</span>
            <span class="overlap-value">${rgbStr}</span>
        </div>
    `;
}

function setMode(mode) {
    state.mode = mode;
    document.getElementById('additiveModeBtn').classList.toggle('active', mode === 'additive');
    document.getElementById('subtractiveModeBtn').classList.toggle('active', mode === 'subtractive');
    render();
}

sliders.forEach((slider, i) => {
    slider.addEventListener('input', (e) => {
        state.values[i] = parseInt(e.target.value);
        render();
    });
});

document.getElementById('additiveModeBtn').addEventListener('click', () => setMode('additive'));
document.getElementById('subtractiveModeBtn').addEventListener('click', () => setMode('subtractive'));

document.getElementById('resetBtn').addEventListener('click', () => {
    state.values = [255, 255, 255];
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché le stampanti usano anche il nero (CMYK)? ▸'
        : 'Perché le stampanti usano anche il nero (CMYK)? ▾';
});

window.addEventListener('resize', layoutCircles);

layoutCircles();
render();
