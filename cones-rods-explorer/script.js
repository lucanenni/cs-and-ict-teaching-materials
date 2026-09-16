// Curve di sensibilità dei coni approssimate con gaussiane — una
// semplificazione didattica, non i dati fisiologici precisi.
function gaussian(x, peak, sigma) {
    return Math.exp(-0.5 * Math.pow((x - peak) / sigma, 2));
}

function wavelengthToLMS(wl) {
    return {
        L: gaussian(wl, 560, 45),
        M: gaussian(wl, 530, 40),
        S: gaussian(wl, 440, 30)
    };
}

// Lunghezze d'onda approssimative dei primari di uno schermo tipico.
const PRIMARY_WL = { R: 610, G: 545, B: 460 };

function rgbToLMS(r, g, b) {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const pr = wavelengthToLMS(PRIMARY_WL.R);
    const pg = wavelengthToLMS(PRIMARY_WL.G);
    const pb = wavelengthToLMS(PRIMARY_WL.B);
    return {
        L: rn * pr.L + gn * pg.L + bn * pb.L,
        M: rn * pr.M + gn * pg.M + bn * pb.M,
        S: rn * pr.S + gn * pg.S + bn * pb.S
    };
}

function lmsToBars(lms) {
    const max = Math.max(lms.L, lms.M, lms.S, 0.0001);
    return { L: lms.L / max * 100, M: lms.M / max * 100, S: lms.S / max * 100 };
}

// Approssimazione classica (dominio pubblico, Dan Bruton) per convertire una
// lunghezza d'onda visibile in un colore RGB indicativo da mostrare a schermo.
function wavelengthToRGB(wl) {
    let r = 0, g = 0, b = 0;
    if (wl >= 380 && wl < 440) { r = -(wl - 440) / (440 - 380); g = 0; b = 1; }
    else if (wl >= 440 && wl < 490) { r = 0; g = (wl - 440) / (490 - 440); b = 1; }
    else if (wl >= 490 && wl < 510) { r = 0; g = 1; b = -(wl - 510) / (510 - 490); }
    else if (wl >= 510 && wl < 580) { r = (wl - 510) / (580 - 510); g = 1; b = 0; }
    else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / (645 - 580); b = 0; }
    else if (wl >= 645 && wl <= 780) { r = 1; g = 0; b = 0; }
    const clamp = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255);
    return [clamp(r), clamp(g), clamp(b)];
}

function renderBars(id, bars) {
    const box = document.getElementById(id);
    box.innerHTML = '';
    [['L', '#dc2626'], ['M', '#16a34a'], ['S', '#2563eb']].forEach(([k, color]) => {
        const col = document.createElement('div');
        col.className = 'cone-bar-col';
        const bar = document.createElement('div');
        bar.className = 'cone-bar';
        bar.style.height = bars[k] + '%';
        bar.style.background = color;
        col.appendChild(bar);
        const label = document.createElement('div');
        label.className = 'cone-bar-label';
        label.textContent = k;
        col.appendChild(label);
        box.appendChild(col);
    });
}

function renderMetamerism() {
    const wl = parseInt(document.getElementById('wavelengthSlider').value, 10);
    document.getElementById('wavelengthValue').textContent = wl + ' nm';
    const [pr, pg, pb] = wavelengthToRGB(wl);
    document.getElementById('pureSwatch').style.background = `rgb(${pr},${pg},${pb})`;
    const pureLMS = lmsToBars(wavelengthToLMS(wl));
    renderBars('pureBars', pureLMS);

    const r = parseInt(document.getElementById('rSlider').value, 10);
    const g = parseInt(document.getElementById('gSlider').value, 10);
    const b = parseInt(document.getElementById('bSlider').value, 10);
    document.getElementById('rValue').textContent = r;
    document.getElementById('gValue').textContent = g;
    document.getElementById('bValue').textContent = b;
    document.getElementById('rgbSwatch').style.background = `rgb(${r},${g},${b})`;
    const rgbLMS = lmsToBars(rgbToLMS(r, g, b));
    renderBars('rgbBars', rgbLMS);

    const diff = Math.abs(pureLMS.L - rgbLMS.L) + Math.abs(pureLMS.M - rgbLMS.M) + Math.abs(pureLMS.S - rgbLMS.S);
    const note = document.getElementById('matchNote');
    if (diff < 15) {
        note.textContent = '✓ Stimolazione quasi identica: al cervello sembrerebbero lo stesso colore, pur essendo luce fisicamente diversa (metamerismo).';
        note.style.color = '#15803d';
    } else {
        note.textContent = 'Continua a regolare R, G, B finché le due serie di barre non si assomigliano.';
        note.style.color = '#9f1239';
    }
}

function renderDensityChart() {
    const svg = document.getElementById('densitySvg');
    svg.innerHTML = '';
    const NS = 'http://www.w3.org/2000/svg';
    const W = 600, H = 260, mL = 50, mR = 15, mT = 15, mB = 35;
    const plotW = W - mL - mR, plotH = H - mT - mB, plotBottom = H - mB;
    const xScale = (e) => mL + (e + 90) / 180 * plotW;
    const yScale = (v) => plotBottom - (Math.min(v, 100) / 100) * plotH;

    const xAxis = document.createElementNS(NS, 'line');
    xAxis.setAttribute('x1', mL); xAxis.setAttribute('x2', W - mR);
    xAxis.setAttribute('y1', plotBottom); xAxis.setAttribute('y2', plotBottom);
    xAxis.setAttribute('stroke', '#cbd5e1');
    svg.appendChild(xAxis);

    [-90, -45, 0, 45, 90].forEach(e => {
        const x = xScale(e);
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', x); t.setAttribute('y', plotBottom + 16);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('class', 'axis-label');
        t.textContent = e + '°';
        svg.appendChild(t);
    });
    const xTitle = document.createElementNS(NS, 'text');
    xTitle.setAttribute('x', mL + plotW / 2); xTitle.setAttribute('y', H - 2);
    xTitle.setAttribute('text-anchor', 'middle'); xTitle.setAttribute('class', 'axis-label');
    xTitle.textContent = 'gradi dal centro dello sguardo (fovea = 0°)';
    svg.appendChild(xTitle);

    let coneD = '', rodD = '';
    for (let e = -90; e <= 90; e += 2) {
        const cd = 100 * gaussian(e, 0, 3);
        const rd = 90 * gaussian(e, 17, 14) + 90 * gaussian(e, -17, 14);
        coneD += (e === -90 ? 'M' : 'L') + xScale(e).toFixed(1) + ',' + yScale(cd).toFixed(1) + ' ';
        rodD += (e === -90 ? 'M' : 'L') + xScale(e).toFixed(1) + ',' + yScale(rd).toFixed(1) + ' ';
    }
    const rodPath = document.createElementNS(NS, 'path');
    rodPath.setAttribute('d', rodD.trim());
    rodPath.setAttribute('fill', 'none');
    rodPath.setAttribute('stroke', '#6b7280');
    rodPath.setAttribute('stroke-width', 2.5);
    svg.appendChild(rodPath);

    const conePath = document.createElementNS(NS, 'path');
    conePath.setAttribute('d', coneD.trim());
    conePath.setAttribute('fill', 'none');
    conePath.setAttribute('stroke', '#e11d48');
    conePath.setAttribute('stroke-width', 2.5);
    svg.appendChild(conePath);

    const legendItems = [['Coni (colore)', '#e11d48'], ['Bastoncelli (buio/luce)', '#6b7280']];
    legendItems.forEach(([label, color], i) => {
        const y = mT + i * 16;
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', W - mR - 100); dot.setAttribute('cy', y);
        dot.setAttribute('r', 4); dot.setAttribute('fill', color);
        svg.appendChild(dot);
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', W - mR - 90); t.setAttribute('y', y + 3);
        t.setAttribute('class', 'axis-label'); t.setAttribute('fill', '#374151');
        t.textContent = label;
        svg.appendChild(t);
    });
}

const CB_MATRICES = {
    protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
    deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
    tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525]
};

function clamp255(v) {
    return Math.max(0, Math.min(255, Math.round(v)));
}

function applyFilter(ctx, w, h, m) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        d[i] = clamp255(m[0] * r + m[1] * g + m[2] * b);
        d[i + 1] = clamp255(m[3] * r + m[4] * g + m[5] * b);
        d[i + 2] = clamp255(m[6] * r + m[7] * g + m[8] * b);
    }
    ctx.putImageData(imgData, 0, 0);
}

function drawTestPattern(ctx, w, h) {
    const hues = [0, 45, 90, 135, 180, 225, 270, 315];
    const barW = w / hues.length;
    hues.forEach((hue, i) => {
        ctx.fillStyle = `hsl(${hue}, 85%, 55%)`;
        ctx.fillRect(i * barW, 0, barW, h);
    });
}

function renderColorblind() {
    const grid = document.getElementById('cbGrid');
    grid.innerHTML = '';
    const panels = [
        { label: 'Visione tricromatica (normale)', matrix: null },
        { label: 'Protanopia — assenza coni L', matrix: CB_MATRICES.protanopia },
        { label: 'Deuteranopia — assenza coni M', matrix: CB_MATRICES.deuteranopia },
        { label: 'Tritanopia — assenza coni S (rara)', matrix: CB_MATRICES.tritanopia }
    ];
    panels.forEach(p => {
        const col = document.createElement('div');
        col.className = 'cb-col';
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 100;
        col.appendChild(canvas);
        const title = document.createElement('div');
        title.className = 'cb-title';
        title.textContent = p.label;
        col.appendChild(title);
        grid.appendChild(col);
        const ctx = canvas.getContext('2d');
        drawTestPattern(ctx, 240, 100);
        if (p.matrix) applyFilter(ctx, 240, 100, p.matrix);
    });
}

const HELP_TEXT = {
    metamerism: [
        '• L\'occhio umano è <strong>tricromatico</strong>: ha tre tipi di cono (L, M, S), ciascuno sensibile a una gamma di lunghezze d\'onda diversa, oltre ai bastoncelli.',
        '• Il cervello non "vede" la lunghezza d\'onda della luce direttamente: vede solo quanto ciascun tipo di cono viene stimolato. Combinazioni fisicamente diverse di luce che stimolano i coni allo stesso modo sono percepite come <strong>identiche</strong> — questo fenomeno si chiama metamerismo.',
        '• È esattamente il trucco che sfrutta ogni schermo: non riproduce mai la luce "vera" di un tramonto o di una foglia, produce solo una combinazione di rosso, verde e blu che stimola i tuoi coni allo stesso modo.'
    ],
    density: [
        '• I <strong>coni</strong> permettono la visione a colori, ma richiedono più luce e sono concentrati quasi tutti in una piccola area centrale, la fovea.',
        '• I <strong>bastoncelli</strong> sono molto più sensibili alla luce debole ma non distinguono i colori, e dominano la visione periferica.',
        '• Per questo, di notte, guardare un oggetto debolmente illuminato leggermente di lato (non dritto) lo rende spesso più visibile: sposti la sua immagine su una zona più ricca di bastoncelli.'
    ],
    colorblind: [
        '• Il daltonismo più comune deriva dall\'<strong>assenza o malfunzionamento</strong> di uno dei tre tipi di cono, non da un problema generico "di vista".',
        '• Protanopia e deuteranopia (assenza dei coni L o M) sono le forme più comuni e riguardano soprattutto la distinzione tra rosso e verde.',
        '• La tritanopia (assenza dei coni S, sensibili al blu) è molto più rara.'
    ]
};

function setMode(mode) {
    ['metamerism', 'density', 'colorblind'].forEach(m => {
        document.getElementById(m + 'Mode').classList.toggle('hidden', m !== mode);
        document.getElementById(m + 'Btn').classList.toggle('active', m === mode);
    });
    document.getElementById('helpList').innerHTML = HELP_TEXT[mode].map(li => `<li>${li}</li>`).join('');
    if (mode === 'metamerism') renderMetamerism();
    else if (mode === 'density') renderDensityChart();
    else renderColorblind();
}

document.getElementById('metamerismBtn').addEventListener('click', () => setMode('metamerism'));
document.getElementById('densityBtn').addEventListener('click', () => setMode('density'));
document.getElementById('colorblindBtn').addEventListener('click', () => setMode('colorblind'));

['wavelengthSlider', 'rSlider', 'gSlider', 'bSlider'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderMetamerism);
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché gli schermi usano proprio R, G, B? ▸'
        : 'Perché gli schermi usano proprio R, G, B? ▾';
});

// Inizializzazione
setMode('metamerism');
