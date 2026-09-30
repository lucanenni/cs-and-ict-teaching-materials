const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
}

function svgText(x, y, content, extraAttrs = {}) {
    const t = svgEl('text', { x, y, class: 'part-label', ...extraAttrs });
    t.textContent = content;
    return t;
}

// Un piccolo "ventilatore" stilizzato, riusato per dissipatore, GPU e alimentatore.
function fanGroup(cx, cy, r, bladeColor, hubColor) {
    const g = svgEl('g');
    for (let i = 0; i < 5; i++) {
        const angle = i * 72;
        const rad = (angle * Math.PI) / 180;
        const bx = cx + Math.cos(rad) * r * 0.5;
        const by = cy + Math.sin(rad) * r * 0.5;
        g.appendChild(svgEl('ellipse', {
            cx: bx, cy: by, rx: r * 0.4, ry: r * 0.16,
            fill: bladeColor, opacity: 0.8,
            transform: `rotate(${angle + 20} ${bx} ${by})`
        }));
    }
    g.appendChild(svgEl('circle', { cx, cy, r, fill: 'none', stroke: '#64748b', 'stroke-width': 1.5 }));
    g.appendChild(svgEl('circle', { cx, cy, r: r * 0.3, fill: hubColor }));
    return g;
}

function getSlotBBox(slot) {
    if (slot.type === 'circle') return { x: slot.cx - slot.r, y: slot.cy - slot.r, w: slot.r * 2, h: slot.r * 2 };
    if (slot.type === 'ram') return { x: slot.x, y: slot.y, w: slot.count * slot.stickW + (slot.count - 1) * slot.gap, h: slot.h };
    return { x: slot.x, y: slot.y, w: slot.w, h: slot.h };
}

// ===== Dati dei componenti =====
const COMPONENTS = [
    {
        id: 'motherboard', name: 'Scheda madre', icon: '🟩', requires: [],
        slot: { type: 'rect', x: 170, y: 30, w: 210, h: 440 },
        fn: 'Il "sistema nervoso" del PC: collega fisicamente ed elettricamente tutti gli altri componenti, permettendo loro di scambiarsi dati.',
        fact: 'Il formato più comune è ATX (30,5 × 24,4 cm), ma esistono anche versioni più piccole come Micro-ATX e Mini-ITX per case compatti.'
    },
    {
        id: 'psu', name: 'Alimentatore (PSU)', icon: '🔌', requires: [],
        slot: { type: 'rect', x: 55, y: 420, w: 140, h: 80 },
        fn: 'Trasforma la corrente alternata (AC) di casa in corrente continua (DC) a basso voltaggio, e la distribuisce a tutti i componenti tramite i cavi.',
        fact: 'La potenza si misura in watt: un PC da gaming può richiederne 500-850W, un PC da ufficio anche solo 300W.'
    },
    {
        id: 'storage', name: 'Disco SSD', icon: '💾', requires: [],
        slot: { type: 'rect', x: 55, y: 340, w: 90, h: 55 },
        fn: 'Conserva permanentemente il sistema operativo, i programmi e i tuoi file — anche a computer spento, a differenza della RAM.',
        fact: 'Un SSD non ha parti meccaniche in movimento, a differenza di un vecchio disco HDD: per questo è più veloce, silenzioso e resistente agli urti.'
    },
    {
        id: 'cpu', name: 'Processore (CPU)', icon: '🧠', requires: ['motherboard'],
        slot: { type: 'rect', x: 245, y: 70, w: 65, h: 65 },
        fn: 'Il "cervello" del computer: esegue miliardi di calcoli al secondo per far funzionare ogni programma, dal sistema operativo ai videogiochi.',
        fact: 'Una CPU moderna ha più "core" (nuclei) che lavorano in parallelo — 4, 8, anche 16 o più — ciascuno capace di eseguire calcoli in modo indipendente.'
    },
    {
        id: 'ram', name: 'Memoria RAM', icon: '📊', requires: ['motherboard'],
        slot: { type: 'ram', x: 325, y: 60, stickW: 16, gap: 6, h: 160, count: 2 },
        fn: 'La memoria "di lavoro" del PC: tiene i dati dei programmi aperti in questo momento, per recuperarli velocissimamente. Si svuota completamente quando spegni il PC.',
        fact: 'RAM sta per "Random Access Memory": la CPU può accedere a qualsiasi punto della memoria nello stesso tempo, senza doverla leggere in ordine.'
    },
    {
        id: 'gpu', name: 'Scheda video (GPU)', icon: '🎮', requires: ['motherboard'],
        slot: { type: 'rect', x: 140, y: 258, w: 230, h: 55 },
        fn: 'Calcola le immagini da mostrare a schermo: fondamentale per i videogiochi, la grafica 3D e sempre più anche per l\'intelligenza artificiale.',
        fact: 'Una GPU ha migliaia di piccoli "core" specializzati in calcoli semplici fatti in parallelo — l\'opposto della CPU, che ha pochi core ma molto versatili.'
    },
    {
        id: 'cooler', name: 'Dissipatore CPU', icon: '❄️', requires: ['cpu'],
        slot: { type: 'circle', cx: 277, cy: 102, r: 45 },
        fn: 'Porta via il calore generato dalla CPU mentre lavora, impedendole di surriscaldarsi e rallentare (o spegnersi per protezione).',
        fact: 'Esistono dissipatori ad aria (alette metalliche e una ventola) e a liquido (pompano un refrigerante attraverso un radiatore).'
    }
];

// Ordine di disegno "fisico": il dissipatore va sopra la CPU, la RAM e la
// GPU si vedono sopra la scheda madre, ecc.
const DRAW_ORDER = ['motherboard', 'psu', 'storage', 'gpu', 'ram', 'cpu', 'cooler'];

// ===== Disegno: stile schematico (piatto, un colore, massima chiarezza) =====
const SCHEMATIC_COLORS = {
    motherboard: '#16a34a', psu: '#f59e0b', storage: '#0d9488',
    cpu: '#2563eb', ram: '#a855f7', gpu: '#dc2626', cooler: '#0ea5e9'
};

const artSchematic = {
    motherboard(s) {
        const g = svgEl('g');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 6, fill: SCHEMATIC_COLORS.motherboard, 'fill-opacity': 0.18, stroke: SCHEMATIC_COLORS.motherboard, 'stroke-width': 2 }));
        g.appendChild(svgText(s.x + s.w / 2, s.y + s.h - 12, 'Scheda madre'));
        return g;
    },
    psu(s) {
        const g = svgEl('g');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 4, fill: SCHEMATIC_COLORS.psu }));
        g.appendChild(svgText(s.x + s.w / 2, s.y + s.h / 2 + 4, 'Alimentatore', { fill: 'white' }));
        return g;
    },
    storage(s) {
        const g = svgEl('g');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 3, fill: SCHEMATIC_COLORS.storage }));
        g.appendChild(svgText(s.x + s.w / 2, s.y + s.h / 2 + 4, 'SSD', { fill: 'white' }));
        return g;
    },
    cpu(s) {
        const g = svgEl('g');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 4, fill: SCHEMATIC_COLORS.cpu }));
        g.appendChild(svgText(s.x + s.w / 2, s.y + s.h / 2 + 4, 'CPU', { fill: 'white' }));
        return g;
    },
    ram(s) {
        const g = svgEl('g');
        for (let i = 0; i < s.count; i++) {
            const x = s.x + i * (s.stickW + s.gap);
            g.appendChild(svgEl('rect', { x, y: s.y, width: s.stickW, height: s.h, rx: 2, fill: SCHEMATIC_COLORS.ram }));
        }
        const bbox = getSlotBBox(s);
        g.appendChild(svgText(bbox.x + bbox.w / 2, bbox.y - 8, 'RAM'));
        return g;
    },
    gpu(s) {
        const g = svgEl('g');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 4, fill: SCHEMATIC_COLORS.gpu }));
        g.appendChild(svgText(s.x + s.w / 2, s.y + s.h / 2 + 4, 'GPU', { fill: 'white' }));
        return g;
    },
    cooler(s) {
        const g = svgEl('g');
        g.appendChild(svgEl('circle', { cx: s.cx, cy: s.cy, r: s.r, fill: SCHEMATIC_COLORS.cooler, 'fill-opacity': 0.92 }));
        g.appendChild(svgEl('line', { x1: s.cx - s.r * 0.6, y1: s.cy, x2: s.cx + s.r * 0.6, y2: s.cy, stroke: 'white', 'stroke-width': 2 }));
        g.appendChild(svgEl('line', { x1: s.cx, y1: s.cy - s.r * 0.6, x2: s.cx, y2: s.cy + s.r * 0.6, stroke: 'white', 'stroke-width': 2 }));
        return g;
    }
};

// ===== Disegno: stile realistico (più dettagli, ombre, texture) =====
let gradientCounter = 0;
function addGradient(defs, colorFrom, colorTo, angle = 90) {
    gradientCounter++;
    const id = 'grad' + gradientCounter;
    const grad = svgEl('linearGradient', { id, x1: '0%', y1: '0%', x2: '0%', y2: '100%', gradientTransform: `rotate(${angle}, 0.5, 0.5)` });
    const stop1 = svgEl('stop', { offset: '0%', 'stop-color': colorFrom });
    const stop2 = svgEl('stop', { offset: '100%', 'stop-color': colorTo });
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    return `url(#${id})`;
}

const artRealistic = {
    motherboard(s, defs) {
        const g = svgEl('g');
        const pcbGrad = addGradient(defs, '#166534', '#14532d');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 6, fill: pcbGrad, stroke: '#052e16', 'stroke-width': 2 }));
        // tracce circuitali
        for (let i = 0; i < 6; i++) {
            const ly = s.y + 20 + i * (s.h - 40) / 6;
            g.appendChild(svgEl('line', { x1: s.x + 10, y1: ly, x2: s.x + s.w - 10, y2: ly, stroke: '#4ade80', 'stroke-width': 0.6, opacity: 0.35 }));
        }
        // chipset
        g.appendChild(svgEl('rect', { x: s.x + 20, y: s.y + s.h - 70, width: 46, height: 46, rx: 3, fill: '#1f2937' }));
        for (let i = 0; i < 4; i++) {
            g.appendChild(svgEl('line', { x1: s.x + 24, y1: s.y + s.h - 66 + i * 12, x2: s.x + 62, y2: s.y + s.h - 66 + i * 12, stroke: '#4b5563', 'stroke-width': 2 }));
        }
        // condensatori
        [[30, 45], [50, 45], [70, 45]].forEach(([dx, dy]) => {
            g.appendChild(svgEl('circle', { cx: s.x + dx, cy: s.y + dy, r: 4, fill: '#0f172a', stroke: '#facc15', 'stroke-width': 1 }));
        });
        const labelBg = svgEl('rect', { x: s.x + s.w / 2 - 44, y: s.y + s.h - 24, width: 88, height: 16, rx: 3, fill: 'white', opacity: 0.85, class: 'label-bg' });
        g.appendChild(labelBg);
        g.appendChild(svgText(s.x + s.w / 2, s.y + s.h - 12, 'Scheda madre'));
        return g;
    },
    psu(s, defs) {
        const g = svgEl('g');
        const metalGrad = addGradient(defs, '#4b5563', '#1f2937');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 4, fill: metalGrad, stroke: '#111827', 'stroke-width': 1.5 }));
        g.appendChild(fanGroup(s.x + s.w / 2, s.y + s.h / 2, Math.min(s.w, s.h) * 0.32, '#9ca3af', '#111827'));
        for (let i = 0; i < 4; i++) {
            g.appendChild(svgEl('line', { x1: s.x + 6, y1: s.y + 8 + i * 5, x2: s.x + 6, y2: s.y + 8 + i * 5, stroke: '#6b7280', 'stroke-width': 1 }));
        }
        g.appendChild(svgText(s.x + s.w / 2, s.y + s.h + 14, 'Alimentatore', { fill: '#1f2937' }));
        return g;
    },
    storage(s, defs) {
        const g = svgEl('g');
        const darkGrad = addGradient(defs, '#1e293b', '#0f172a');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 3, fill: darkGrad, stroke: '#0d9488', 'stroke-width': 1.5 }));
        g.appendChild(svgEl('rect', { x: s.x + 8, y: s.y + s.h - 14, width: s.w - 16, height: 6, rx: 2, fill: '#0d9488' }));
        [[10, 10], [s.w - 10, 10], [10, s.h - 10], [s.w - 10, s.h - 10]].forEach(([dx, dy]) => {
            g.appendChild(svgEl('circle', { cx: s.x + dx, cy: s.y + dy, r: 2, fill: '#334155' }));
        });
        g.appendChild(svgText(s.x + s.w / 2, s.y + s.h / 2 + 2, 'SSD', { fill: '#5eead4' }));
        return g;
    },
    cpu(s, defs) {
        const g = svgEl('g');
        const metalGrad = addGradient(defs, '#d1d5db', '#6b7280');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 3, fill: metalGrad, stroke: '#1f2937', 'stroke-width': 1.5 }));
        g.appendChild(svgEl('polygon', { points: `${s.x + 4},${s.y + 4} ${s.x + 14},${s.y + 4} ${s.x + 4},${s.y + 14}`, fill: '#facc15' }));
        return g;
    },
    ram(s, defs) {
        const g = svgEl('g');
        const ramGrad = addGradient(defs, '#c084fc', '#7e22ce');
        for (let i = 0; i < s.count; i++) {
            const x = s.x + i * (s.stickW + s.gap);
            g.appendChild(svgEl('rect', { x, y: s.y, width: s.stickW, height: s.h, rx: 2, fill: ramGrad, stroke: '#581c87', 'stroke-width': 1 }));
            g.appendChild(svgEl('line', { x1: x + s.stickW / 2, y1: s.y + 6, x2: x + s.stickW / 2, y2: s.y + s.h - 20, stroke: '#581c87', 'stroke-width': 1, opacity: 0.5 }));
            g.appendChild(svgEl('rect', { x: x + 2, y: s.y + s.h - 14, width: s.stickW - 4, height: 8, fill: '#eab308' }));
        }
        const bbox = getSlotBBox(s);
        const labelBg = svgEl('rect', { x: bbox.x - 6, y: bbox.y - 22, width: bbox.w + 12, height: 15, rx: 3, fill: 'white', opacity: 0.85, class: 'label-bg' });
        g.appendChild(labelBg);
        g.appendChild(svgText(bbox.x + bbox.w / 2, bbox.y - 10, 'RAM'));
        return g;
    },
    gpu(s, defs) {
        const g = svgEl('g');
        const shroudGrad = addGradient(defs, '#374151', '#111827');
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 5, fill: shroudGrad, stroke: '#000000', 'stroke-width': 1 }));
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: 5, fill: '#dc2626' }));
        g.appendChild(fanGroup(s.x + s.w * 0.3, s.y + s.h / 2, s.h * 0.4, '#9ca3af', '#1f2937'));
        g.appendChild(fanGroup(s.x + s.w * 0.68, s.y + s.h / 2, s.h * 0.4, '#9ca3af', '#1f2937'));
        return g;
    },
    cooler(s, defs) {
        const g = svgEl('g');
        g.appendChild(fanGroup(s.cx, s.cy, s.r, '#bae6fd', '#0c4a6e'));
        g.appendChild(svgEl('circle', { cx: s.cx, cy: s.cy, r: s.r, fill: 'none', stroke: '#0ea5e9', 'stroke-width': 1, opacity: 0.6 }));
        return g;
    }
};

// ===== Stato =====
let state = {
    mode: 'build',
    style: 'schematic',
    installed: new Set(),
    selectedId: null
};

function getComponent(id) {
    return COMPONENTS.find(c => c.id === id);
}

function missingRequirements(id) {
    return getComponent(id).requires.filter(r => !state.installed.has(r));
}

function dependentsOf(id) {
    return COMPONENTS.filter(c => state.installed.has(c.id) && c.requires.includes(id));
}

function handleComponentClick(id) {
    state.selectedId = id;
    if (!state.installed.has(id)) {
        if (missingRequirements(id).length === 0) {
            state.installed.add(id);
        }
    }
    renderAll();
}

function handleRemove(id) {
    if (dependentsOf(id).length > 0) return;
    state.installed.delete(id);
    renderAll();
}

function buildAll() {
    let changed = true;
    let guard = 0;
    while (changed && guard < 50) {
        changed = false;
        guard++;
        COMPONENTS.forEach(c => {
            if (!state.installed.has(c.id) && c.requires.every(r => state.installed.has(r))) {
                state.installed.add(c.id);
                changed = true;
            }
        });
    }
    renderAll();
}

function resetAll() {
    state.installed.clear();
    state.selectedId = null;
    renderAll();
}

// ===== Disegno del case =====
function drawCaseShell(svg) {
    svg.appendChild(svgEl('rect', { x: 10, y: 10, width: 400, height: 500, rx: 14, fill: '#e2e8f0', stroke: '#94a3b8', 'stroke-width': 2 }));
    svg.appendChild(svgEl('rect', { x: 10, y: 10, width: 34, height: 500, rx: 14, fill: '#cbd5e1' }));
    svg.appendChild(svgEl('circle', { cx: 27, cy: 40, r: 6, fill: '#64748b' }));
    svg.appendChild(svgEl('rect', { x: 19, y: 60, width: 16, height: 6, rx: 2, fill: '#94a3b8' }));
    svg.appendChild(svgEl('rect', { x: 19, y: 72, width: 16, height: 6, rx: 2, fill: '#94a3b8' }));
}

function drawEmptySlot(component, svg) {
    const s = component.slot;
    const g = svgEl('g', { class: 'part' });
    if (s.type === 'circle') {
        g.appendChild(svgEl('circle', { cx: s.cx, cy: s.cy, r: s.r, class: 'slot-outline' }));
    } else if (s.type === 'ram') {
        for (let i = 0; i < s.count; i++) {
            const x = s.x + i * (s.stickW + s.gap);
            g.appendChild(svgEl('rect', { x, y: s.y, width: s.stickW, height: s.h, rx: 2, class: 'slot-outline' }));
        }
    } else {
        g.appendChild(svgEl('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: 4, class: 'slot-outline' }));
    }
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => handleComponentClick(component.id));
    svg.appendChild(g);
}

function drawInstalledPart(component, svg, defs, style) {
    const artSet = style === 'realistic' ? artRealistic : artSchematic;
    const g = style === 'realistic' ? artSet[component.id](component.slot, defs) : artSet[component.id](component.slot);
    g.classList.add('part');
    g.addEventListener('click', () => handleComponentClick(component.id));
    svg.appendChild(g);
}

function renderCase() {
    const svg = document.getElementById('caseSvg');
    svg.innerHTML = '';
    const defs = svgEl('defs');
    svg.appendChild(defs);
    drawCaseShell(svg);

    DRAW_ORDER.forEach(id => {
        const component = getComponent(id);
        if (state.installed.has(id)) {
            drawInstalledPart(component, svg, defs, state.style);
        } else {
            drawEmptySlot(component, svg);
        }
    });
}

function renderTray() {
    const grid = document.getElementById('trayGrid');
    grid.innerHTML = '';
    COMPONENTS.forEach(c => {
        const installed = state.installed.has(c.id);
        const item = document.createElement('div');
        item.className = 'tray-item' + (installed ? ' installed' : '');
        item.innerHTML = `<span class="tray-icon">${c.icon}</span>${c.name}<span class="tray-status">${installed ? '✓ montato' : 'da montare'}</span>`;
        item.addEventListener('click', () => handleComponentClick(c.id));
        grid.appendChild(item);
    });
}

function renderProgress() {
    const pct = Math.round((state.installed.size / COMPONENTS.length) * 100);
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressLabel').textContent = `${state.installed.size}/${COMPONENTS.length} montati`;
}

function renderInfoPanel() {
    const panel = document.getElementById('infoPanel');
    if (!state.selectedId) {
        panel.innerHTML = '<p class="info-placeholder">👆 Clicca su un componente (nel vassoio o nel case) per scoprire a cosa serve.</p>';
        return;
    }
    const c = getComponent(state.selectedId);
    const installed = state.installed.has(c.id);
    let html = `<div class="info-title">${c.icon} ${c.name}</div>`;
    html += `<div class="info-function">${c.fn}</div>`;
    html += `<div class="info-fact">💡 ${c.fact}</div>`;

    if (installed) {
        const dependents = dependentsOf(c.id);
        const disabled = dependents.length > 0;
        html += `<div class="info-actions"><button class="btn-remove" id="removeBtn" ${disabled ? 'disabled' : ''}>✕ Smonta</button></div>`;
        if (disabled) {
            html += `<div class="info-warning">Devi prima smontare: ${dependents.map(d => d.name).join(', ')}</div>`;
        }
    } else {
        const missing = missingRequirements(c.id);
        if (missing.length > 0) {
            html += `<div class="info-warning">⚠ Devi prima installare: ${missing.map(id => getComponent(id).name).join(', ')}</div>`;
        }
    }

    panel.innerHTML = html;
    if (installed) {
        const btn = document.getElementById('removeBtn');
        if (btn) btn.addEventListener('click', () => handleRemove(c.id));
    }
}

function updateHint() {
    document.getElementById('hintText').textContent = state.installed.size === 0
        ? 'Inizia montando la scheda madre, l\'alimentatore o il disco: sono i componenti che non richiedono nient\'altro prima.'
        : state.installed.size === COMPONENTS.length
            ? '✓ PC completo! Prova a smontarlo cliccando sui componenti, oppure passa alla modalità Quiz.'
            : 'Continua a montare i componenti: quelli bloccati ti diranno cosa serve prima.';
}

function renderAll() {
    renderCase();
    renderTray();
    renderProgress();
    renderInfoPanel();
    updateHint();
}

// ===== Quiz =====
const QUIZ_QUESTIONS = [
    { type: 'text', question: 'Quale componente è definito il "cervello" del computer, perché esegue i calcoli?', options: ['CPU', 'RAM', 'Alimentatore', 'SSD'], correct: 'CPU', explain: 'La CPU (Central Processing Unit) esegue le istruzioni di ogni programma.' },
    { type: 'text', question: 'Quale componente perde tutto il suo contenuto quando spegni il PC?', options: ['SSD', 'RAM', 'Scheda madre', 'GPU'], correct: 'RAM', explain: 'La RAM è una memoria "volatile": senza corrente elettrica si svuota.' },
    { type: 'text', question: 'A cosa serve principalmente l\'alimentatore (PSU)?', options: ['Raffredda la CPU', 'Trasforma e distribuisce la corrente ai componenti', 'Calcola le immagini a schermo', 'Salva i file permanentemente'], correct: 'Trasforma e distribuisce la corrente ai componenti', explain: 'Converte la corrente alternata di casa in corrente continua per i componenti.' },
    { type: 'text', question: 'Quale componente collega fisicamente tutti gli altri, permettendo loro di comunicare?', options: ['Scheda madre', 'GPU', 'Dissipatore', 'RAM'], correct: 'Scheda madre', explain: 'È il "sistema nervoso" del PC: ogni altro componente si collega a lei.' },
    { type: 'text', question: 'Quale componente è più importante per i videogiochi e la grafica 3D?', options: ['SSD', 'Alimentatore', 'GPU', 'RAM'], correct: 'GPU', explain: 'La GPU ha migliaia di piccoli core specializzati nel calcolo delle immagini.' },
    { type: 'text', question: 'Perché la CPU ha bisogno di un dissipatore?', options: ['Per aumentarne la velocità', 'Per non farla surriscaldare', 'Per aumentarne la memoria', 'Per collegarla a internet'], correct: 'Per non farla surriscaldare', explain: 'Una CPU che lavora genera calore: senza dissipazione rallenterebbe o si spegnerebbe per protezione.' },
    { type: 'text', question: 'Quale componente conserva i tuoi file anche quando il PC è spento?', options: ['RAM', 'CPU', 'SSD', 'Dissipatore'], correct: 'SSD', explain: 'A differenza della RAM, la memoria di uno storage come l\'SSD è permanente.' },
    { type: 'text', question: 'Dove si inserisce direttamente la CPU?', options: ['Nella GPU', 'Nell\'alimentatore', 'Nel socket della scheda madre', 'Nell\'SSD'], correct: 'Nel socket della scheda madre', explain: 'Il socket è l\'apposito alloggiamento pensato per quel modello di CPU.' },
    { type: 'image', id: 'gpu', question: 'Quale componente è mostrato in questa immagine?', options: ['Scheda video (GPU)', 'Alimentatore (PSU)', 'Disco SSD', 'Dissipatore CPU'], correct: 'Scheda video (GPU)', explain: 'Riconoscibile dalle ventole e dalla forma allungata della scheda.' },
    { type: 'image', id: 'ram', question: 'Quale componente è mostrato in questa immagine?', options: ['Scheda madre', 'Memoria RAM', 'Processore (CPU)', 'Alimentatore'], correct: 'Memoria RAM', explain: 'Riconoscibile dai due moduli sottili e allungati.' }
];

let quizState = { order: [], current: 0, score: 0, answered: false };

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function startQuiz() {
    quizState.order = shuffle(QUIZ_QUESTIONS.map((_, i) => i));
    quizState.current = 0;
    quizState.score = 0;
    document.getElementById('quizIntro').classList.add('hidden');
    document.getElementById('quizResult').classList.add('hidden');
    document.getElementById('quizQuestion').classList.remove('hidden');
    showQuizQuestion();
}

function renderQuizImage(componentId) {
    const svg = document.getElementById('quizImage');
    svg.innerHTML = '';
    const defs = svgEl('defs');
    svg.appendChild(defs);
    const component = getComponent(componentId);
    const bbox = getSlotBBox(component.slot);
    const pad = 18;
    const vbW = bbox.w + pad * 2;
    const vbH = bbox.h + pad * 2;
    svg.setAttribute('viewBox', `${bbox.x - pad} ${bbox.y - pad} ${vbW} ${vbH}`);
    // Dimensione a schermo calcolata a mano (invece di affidarsi a CSS
    // width/height:auto, che su un <svg> senza dimensioni intrinseche può
    // collassare a 0×0 in alcuni motori): l'immagine sta sempre dentro un
    // riquadro MAX_SIZE×MAX_SIZE, qualunque sia la forma del componente
    // (la RAM, molto stretta e alta, altrimenti diventerebbe altissima).
    const MAX_SIZE = 220;
    const scale = Math.min(MAX_SIZE / vbW, MAX_SIZE / vbH);
    svg.style.width = Math.round(vbW * scale) + 'px';
    svg.style.height = Math.round(vbH * scale) + 'px';
    const artSet = state.style === 'realistic' ? artRealistic : artSchematic;
    const g = state.style === 'realistic' ? artSet[componentId](component.slot, defs) : artSet[componentId](component.slot);
    // Le etichette di testo ("RAM", "CPU"...) servono nella vista del case,
    // ma nel quiz rivelerebbero subito la risposta: le togliamo qui.
    g.querySelectorAll('.part-label, .label-bg').forEach(el => el.remove());
    svg.appendChild(g);
}

function showQuizQuestion() {
    quizState.answered = false;
    const q = QUIZ_QUESTIONS[quizState.order[quizState.current]];
    document.getElementById('quizProgress').textContent = `Domanda ${quizState.current + 1} di ${QUIZ_QUESTIONS.length} · Punteggio: ${quizState.score}`;
    document.getElementById('quizQuestionText').textContent = q.question;

    const img = document.getElementById('quizImage');
    if (q.type === 'image') {
        img.classList.remove('hidden');
        renderQuizImage(q.id);
    } else {
        img.classList.add('hidden');
    }

    const optsEl = document.getElementById('quizOptions');
    optsEl.innerHTML = '';
    shuffle(q.options).forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => selectQuizAnswer(opt, q, btn));
        optsEl.appendChild(btn);
    });

    document.getElementById('quizFeedback').classList.add('hidden');
    document.getElementById('quizNextBtn').classList.add('hidden');
}

function selectQuizAnswer(opt, q, btnEl) {
    if (quizState.answered) return;
    quizState.answered = true;
    const correct = opt === q.correct;
    if (correct) quizState.score++;

    document.querySelectorAll('.quiz-option').forEach(b => {
        b.disabled = true;
        if (b.textContent === q.correct) b.classList.add('correct');
        else if (b === btnEl) b.classList.add('wrong');
    });

    const feedback = document.getElementById('quizFeedback');
    feedback.classList.remove('hidden');
    feedback.className = 'quiz-feedback ' + (correct ? 'correct' : 'wrong');
    feedback.textContent = (correct ? '✓ Esatto! ' : '✗ Non esatto. ') + (q.explain || '');
    document.getElementById('quizNextBtn').classList.remove('hidden');
}

function showQuizResult() {
    document.getElementById('quizQuestion').classList.add('hidden');
    document.getElementById('quizResult').classList.remove('hidden');
    document.getElementById('quizResultScore').textContent = `${quizState.score} / ${QUIZ_QUESTIONS.length}`;
    const pct = quizState.score / QUIZ_QUESTIONS.length;
    let msg;
    if (pct === 1) msg = 'Perfetto! Conosci il PC come le tue tasche. 🏆';
    else if (pct >= 0.7) msg = 'Molto bene! Hai le idee chiare sui componenti principali.';
    else if (pct >= 0.4) msg = 'Non male, ma un ripasso non farebbe male — prova la modalità "Monta/smonta"!';
    else msg = 'Ripassa i componenti nella modalità "Monta/smonta" e riprova il quiz!';
    document.getElementById('quizResultMessage').textContent = msg;
}

// ===== Event listener =====
document.getElementById('buildModeBtn').addEventListener('click', () => {
    state.mode = 'build';
    document.getElementById('buildModeBtn').classList.add('active');
    document.getElementById('quizModeBtn').classList.remove('active');
    document.getElementById('buildPanel').classList.remove('hidden');
    document.getElementById('quizPanel').classList.add('hidden');
});

document.getElementById('quizModeBtn').addEventListener('click', () => {
    state.mode = 'quiz';
    document.getElementById('quizModeBtn').classList.add('active');
    document.getElementById('buildModeBtn').classList.remove('active');
    document.getElementById('quizPanel').classList.remove('hidden');
    document.getElementById('buildPanel').classList.add('hidden');
});

document.getElementById('styleSelect').addEventListener('change', (e) => {
    state.style = e.target.value;
    renderCase();
    if (!document.getElementById('quizQuestion').classList.contains('hidden')) {
        const q = QUIZ_QUESTIONS[quizState.order[quizState.current]];
        if (q && q.type === 'image') renderQuizImage(q.id);
    }
});

document.getElementById('buildAllBtn').addEventListener('click', buildAll);
document.getElementById('resetBtn').addEventListener('click', resetAll);

document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
document.getElementById('quizRetryBtn').addEventListener('click', startQuiz);
document.getElementById('quizNextBtn').addEventListener('click', () => {
    quizState.current++;
    if (quizState.current >= QUIZ_QUESTIONS.length) {
        showQuizResult();
    } else {
        showQuizQuestion();
    }
});

// ===== Inizializzazione =====
renderAll();
