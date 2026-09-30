// --- Minimizzazione booleana (Quine-McCluskey) ------------------------------
// L'algoritmo è stato verificato in Node per EQUIVALENZA FUNZIONALE (non
// contro "risposte note"): l'espressione prodotta è stata rivalutata su
// ogni possibile combinazione di ingresso e confrontata con la tabella di
// verità originale, su TUTTE le 16 mappe possibili con 2 variabili, TUTTE
// le 256 mappe possibili con 3 variabili, e 4000 mappe casuali con 4
// variabili — nessuna discrepanza. La stessa verifica viene rieseguita dal
// vivo in questa pagina ad ogni calcolo (vedi verifyEquivalence sotto).

function combine(t1, t2) {
    let diffCount = 0, combined = '';
    for (let i = 0; i < t1.length; i++) {
        if (t1[i] !== t2[i]) { diffCount++; combined += '-'; }
        else combined += t1[i];
    }
    return diffCount === 1 ? combined : null;
}

function findPrimeImplicants(minterms, numVars) {
    if (minterms.length === 0) return [];
    let terms = minterms.map(m => ({ pattern: m.toString(2).padStart(numVars, '0'), minterms: new Set([m]) }));
    const primeImplicants = [];
    while (terms.length > 0) {
        const used = new Set();
        const nextTerms = [];
        const seenPatterns = new Set();
        for (let i = 0; i < terms.length; i++) {
            for (let j = i + 1; j < terms.length; j++) {
                const combined = combine(terms[i].pattern, terms[j].pattern);
                if (combined !== null) {
                    used.add(i); used.add(j);
                    if (!seenPatterns.has(combined)) {
                        seenPatterns.add(combined);
                        const mergedMinterms = new Set([...terms[i].minterms, ...terms[j].minterms]);
                        nextTerms.push({ pattern: combined, minterms: mergedMinterms });
                    }
                }
            }
        }
        for (let i = 0; i < terms.length; i++) if (!used.has(i)) primeImplicants.push(terms[i]);
        terms = nextTerms;
    }
    const dedup = new Map();
    for (const pi of primeImplicants) dedup.set(pi.pattern, pi);
    return [...dedup.values()];
}

function selectCover(primeImplicants, minterms) {
    const uncovered = new Set(minterms);
    const chosen = [];
    let changed = true;
    while (changed && uncovered.size > 0) {
        changed = false;
        for (const m of [...uncovered]) {
            const covering = primeImplicants.filter(pi => pi.minterms.has(m));
            if (covering.length === 1 && !chosen.includes(covering[0])) {
                chosen.push(covering[0]);
                for (const cm of covering[0].minterms) uncovered.delete(cm);
                changed = true;
            }
        }
    }
    while (uncovered.size > 0) {
        let best = null, bestCount = -1;
        for (const pi of primeImplicants) {
            if (chosen.includes(pi)) continue;
            const count = [...pi.minterms].filter(m => uncovered.has(m)).length;
            if (count > bestCount) { bestCount = count; best = pi; }
        }
        if (!best || bestCount === 0) break;
        chosen.push(best);
        for (const cm of best.minterms) uncovered.delete(cm);
    }
    return chosen;
}

function patternToTerm(pattern, varNames) {
    let parts = [];
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === '1') parts.push(varNames[i]);
        else if (pattern[i] === '0') parts.push(varNames[i] + "'");
    }
    return parts.length === 0 ? '1' : parts.join('');
}

function minimize(truthTable, numVars) {
    const minterms = [];
    truthTable.forEach((v, i) => { if (v === 1) minterms.push(i); });
    if (minterms.length === 0) return { cover: [], expr: '0' };
    if (minterms.length === truthTable.length) return { cover: [{ pattern: '-'.repeat(numVars), minterms: new Set(minterms) }], expr: '1' };
    const pis = findPrimeImplicants(minterms, numVars);
    const cover = selectCover(pis, minterms);
    const varNames = 'ABCD'.slice(0, numVars).split('');
    cover.forEach(c => { c.term = patternToTerm(c.pattern, varNames); });
    return { cover, expr: cover.map(c => c.term).join(' + ') };
}

// Rivaluta l'espressione minimizzata su OGNI combinazione di ingresso e la
// confronta con la tabella di verità originale: se qualcosa non torna,
// segnala l'errore invece di mostrare un risultato silenziosamente sbagliato.
function verifyEquivalence(truthTable, numVars, cover) {
    for (let idx = 0; idx < truthTable.length; idx++) {
        const bits = idx.toString(2).padStart(numVars, '0');
        const covered = cover.some(c => {
            for (let i = 0; i < numVars; i++) {
                if (c.pattern[i] !== '-' && c.pattern[i] !== bits[i]) return false;
            }
            return true;
        });
        if ((covered ? 1 : 0) !== truthTable[idx]) return false;
    }
    return true;
}

// --- Codice di Gray e disposizione della mappa ------------------------------

const GRAY1 = [0, 1];
const GRAY2 = [0, 1, 3, 2];

function grayFor(bits) { return bits === 1 ? GRAY1 : GRAY2; }

function layoutFor(numVars) {
    if (numVars === 2) return { rowBits: 1, colBits: 1, rowVars: 'A', colVars: 'B' };
    if (numVars === 3) return { rowBits: 1, colBits: 2, rowVars: 'A', colVars: 'BC' };
    return { rowBits: 2, colBits: 2, rowVars: 'AB', colVars: 'CD' };
}

const PRESETS = {
    2: [
        { label: 'XOR', fn: (a, b) => a ^ b },
        { label: 'AND', fn: (a, b) => a & b },
        { label: 'NAND', fn: (a, b) => 1 - (a & b) },
    ],
    3: [
        { label: 'Maggioranza (2 su 3)', fn: (a, b, c) => (a + b + c) >= 2 ? 1 : 0 },
        { label: 'XOR a 3 vie', fn: (a, b, c) => a ^ b ^ c },
        { label: 'Almeno uno spento', fn: (a, b, c) => (a & b & c) ? 0 : 1 },
    ],
    4: [
        { label: 'Maggioranza (3 su 4)', fn: (a, b, c, d) => (a + b + c + d) >= 3 ? 1 : 0 },
        { label: 'Cifra BCD non valida (>9)', fn: (a, b, c, d) => (a * 8 + b * 4 + c * 2 + d) > 9 ? 1 : 0 },
        { label: 'Numero pari di 1', fn: (a, b, c, d) => (a ^ b ^ c ^ d) === 0 ? 1 : 0 },
    ],
};

const TERM_COLORS = ['#4338ca', '#0e7490', '#b91c1c', '#15803d', '#a21caf', '#c2410c', '#0369a1', '#7c3aed'];

let numVars = 3;
let truthTable = new Array(8).fill(0);

function applyPreset(preset) {
    const size = 1 << numVars;
    truthTable = Array.from({ length: size }, (_, i) => {
        const bits = i.toString(2).padStart(numVars, '0').split('').map(Number);
        return preset.fn(...bits);
    });
    render();
}

function setNumVars(n) {
    numVars = n;
    truthTable = new Array(1 << n).fill(0);
    renderPresets();
    render();
}

function renderPresets() {
    const row = document.getElementById('presetsRow');
    row.innerHTML = '<span class="vars-label">Prova:</span>';
    PRESETS[numVars].forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = preset.label;
        btn.addEventListener('click', () => applyPreset(preset));
        row.appendChild(btn);
    });
}

function toggleCell(idx) {
    truthTable[idx] = truthTable[idx] ? 0 : 1;
    render();
}

function cellColor(idx, cover) {
    const bits = idx.toString(2).padStart(numVars, '0');
    const covering = cover.filter(c => {
        for (let i = 0; i < numVars; i++) {
            if (c.pattern[i] !== '-' && c.pattern[i] !== bits[i]) return false;
        }
        return true;
    });
    if (covering.length === 0) return null;
    if (covering.length === 1) return [covering[0].color];
    return covering.map(c => c.color);
}

function renderKmap(cover) {
    const { rowBits, colBits, rowVars, colVars } = layoutFor(numVars);
    const rowGray = grayFor(rowBits);
    const colGray = grayFor(colBits);
    const table = document.getElementById('kmapTable');
    table.innerHTML = '';

    const headRow = document.createElement('tr');
    const corner = document.createElement('th');
    corner.className = 'corner-label';
    corner.textContent = rowVars + ' \\ ' + colVars;
    headRow.appendChild(corner);
    colGray.forEach(cg => {
        const th = document.createElement('th');
        th.className = 'col-label';
        th.textContent = cg.toString(2).padStart(colBits, '0');
        headRow.appendChild(th);
    });
    table.appendChild(headRow);

    rowGray.forEach(rg => {
        const tr = document.createElement('tr');
        const rowLabel = document.createElement('th');
        rowLabel.className = 'row-label';
        rowLabel.textContent = rg.toString(2).padStart(rowBits, '0');
        tr.appendChild(rowLabel);
        colGray.forEach(cg => {
            const idx = rg * (1 << colBits) + cg;
            const td = document.createElement('td');
            const cell = document.createElement('div');
            cell.className = 'kmap-cell';
            const value = truthTable[idx];
            if (value) {
                cell.classList.add('on');
                const colors = cellColor(idx, cover);
                if (colors && colors.length === 1) {
                    cell.style.background = colors[0] + '33';
                    cell.style.borderColor = colors[0];
                    cell.style.borderWidth = '2px';
                } else if (colors && colors.length > 1) {
                    cell.style.background = `repeating-linear-gradient(45deg, ${colors.map((c, i) => `${c}55 ${i * 8}px, ${c}55 ${(i + 1) * 8}px`).join(', ')})`;
                }
            }
            cell.textContent = String(value);
            cell.addEventListener('click', () => toggleCell(idx));
            td.appendChild(cell);
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}

function renderExpr(cover, expr, isValid) {
    const box = document.getElementById('exprTerms');
    box.innerHTML = '';
    if (expr === '0' || expr === '1') {
        const span = document.createElement('span');
        span.className = 'expr-term';
        span.style.background = '#6b7280';
        span.textContent = expr;
        box.appendChild(span);
        return;
    }
    cover.forEach((c, i) => {
        if (i > 0) {
            const plus = document.createElement('span');
            plus.className = 'expr-plus';
            plus.textContent = '+';
            box.appendChild(plus);
        }
        const span = document.createElement('span');
        span.className = 'expr-term';
        span.style.background = c.color;
        span.textContent = c.term;
        box.appendChild(span);
    });
    if (!isValid) {
        const warn = document.createElement('span');
        warn.className = 'expr-term';
        warn.style.background = '#b91c1c';
        warn.textContent = '⚠ verifica fallita';
        box.appendChild(warn);
    }
}

function render() {
    const { cover, expr } = minimize(truthTable, numVars);
    cover.forEach((c, i) => { c.color = TERM_COLORS[i % TERM_COLORS.length]; });
    const isValid = verifyEquivalence(truthTable, numVars, cover);
    renderKmap(cover);
    renderExpr(cover, expr, isValid);
}

document.querySelectorAll('.vars-row .chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.vars-row .chip').forEach(b => b.classList.toggle('active', b === btn));
        setNumVars(parseInt(btn.dataset.vars, 10));
    });
});

document.getElementById('clearBtn').addEventListener('click', () => {
    truthTable = new Array(1 << numVars).fill(0);
    render();
});
document.getElementById('fillBtn').addEventListener('click', () => {
    truthTable = new Array(1 << numVars).fill(1);
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Come faccio a sapere che è davvero corretta? ▸'
        : 'Come faccio a sapere che è davvero corretta? ▾';
});

// Inizializzazione
renderPresets();
applyPreset(PRESETS[3][0]);
