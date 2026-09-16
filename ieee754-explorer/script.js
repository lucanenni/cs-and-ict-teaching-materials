// Tutta la codifica/decodifica passa dal vero float a 32 bit del browser
// (DataView), non da una reimplementazione a mano: è quindi garantita
// conforme allo standard IEEE 754, non solo un'approssimazione didattica.
const buffer = new ArrayBuffer(4);
const view = new DataView(buffer);

let state = {
    bits: new Array(32).fill(0)
};

function bitsToUint32() {
    return state.bits.reduce((acc, b) => (acc << 1) | b, 0) >>> 0;
}

function uint32ToBits(u32) {
    const bits = [];
    for (let i = 31; i >= 0; i--) bits.push((u32 >>> i) & 1);
    return bits;
}

function currentFloatValue() {
    view.setUint32(0, bitsToUint32(), false);
    return view.getFloat32(0, false);
}

function setBitsFromFloat(value) {
    view.setFloat32(0, value, false);
    state.bits = uint32ToBits(view.getUint32(0, false));
}

function renderBits() {
    const box = document.getElementById('bitsBox');
    box.innerHTML = '';
    state.bits.forEach((bit, i) => {
        if (i === 1 || i === 9) {
            const gap = document.createElement('div');
            gap.className = 'bit-group-gap';
            box.appendChild(gap);
        }
        const groupClass = i === 0 ? 'sign' : i < 9 ? 'exp' : 'mantissa';
        const col = document.createElement('div');
        col.className = 'bit-col';
        const btn = document.createElement('button');
        btn.className = 'bit-toggle' + (bit ? ' on ' + groupClass : '');
        btn.textContent = bit;
        btn.addEventListener('click', () => {
            state.bits[i] = state.bits[i] ? 0 : 1;
            renderAll();
        });
        col.appendChild(btn);
        box.appendChild(col);
    });
}

function formatValue(v) {
    if (Number.isNaN(v)) return 'NaN';
    if (v === Infinity) return '+Infinito';
    if (v === -Infinity) return '-Infinito';
    if (Object.is(v, -0)) return '-0';
    return v.toString();
}

function renderValue() {
    const v = currentFloatValue();
    document.getElementById('valueDisplay').textContent = formatValue(v);

    const sign = state.bits[0];
    const expBits = state.bits.slice(1, 9);
    const mantissaBits = state.bits.slice(9);
    const expRaw = expBits.reduce((a, b) => (a << 1) | b, 0);
    const mantissaFrac = mantissaBits.reduce((a, b) => (a << 1) | b, 0) / Math.pow(2, 23);

    const formulaEl = document.getElementById('formulaDisplay');
    if (expRaw === 255) {
        formulaEl.textContent = mantissaBits.every(b => b === 0)
            ? `esponente = 255 (tutto 1), mantissa = 0 → infinito`
            : `esponente = 255 (tutto 1), mantissa ≠ 0 → NaN`;
    } else if (expRaw === 0) {
        if (mantissaBits.every(b => b === 0)) {
            formulaEl.textContent = `esponente = 0, mantissa = 0 → zero (${sign ? '-0' : '+0'})`;
        } else {
            formulaEl.textContent = `(-1)^${sign} × 0.${mantissaBits.join('')} × 2^-126 (numero denormale)`;
        }
    } else {
        formulaEl.textContent = `(-1)^${sign} × 1.${mantissaFrac.toFixed(7).slice(2)} × 2^(${expRaw}-127) = (-1)^${sign} × ${(1 + mantissaFrac).toFixed(7)} × 2^${expRaw - 127}`;
    }

    renderPrecisionPanel(v);
}

function renderPrecisionPanel(v) {
    const panel = document.getElementById('precisionPanel');
    if (Number.isNaN(v) || !Number.isFinite(v)) {
        panel.textContent = '';
        return;
    }
    const asDouble = v; // il valore che JS usa internamente per confrontare è già un double a piena precisione
    const diff = Math.abs(asDouble - roundTripDecimal);
    if (roundTripDecimal !== null && !Number.isNaN(roundTripDecimal) && Number.isFinite(roundTripDecimal) && diff > 0) {
        panel.innerHTML = `Il numero che hai scritto (${roundTripDecimal}) non è rappresentabile esattamente in 32 bit: il valore memorizzato è in realtà <strong>${v.toPrecision(9)}</strong> — una differenza di circa ${diff.toExponential(3)}.`;
    } else {
        panel.textContent = '';
    }
}

let roundTripDecimal = null;

function applyDecimal(raw) {
    const trimmed = raw.trim();
    if (trimmed === '') return;

    let value;
    if (trimmed.toLowerCase() === 'nan') value = NaN;
    else if (trimmed === 'Infinity' || trimmed === '+Infinity') value = Infinity;
    else if (trimmed === '-Infinity') value = -Infinity;
    else value = parseFloat(trimmed);

    roundTripDecimal = value;
    setBitsFromFloat(value);
    renderAll();
}

function renderAll() {
    renderBits();
    renderValue();
}

document.getElementById('applyBtn').addEventListener('click', () => {
    applyDecimal(document.getElementById('decimalInput').value);
});
document.getElementById('decimalInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyDecimal(document.getElementById('decimalInput').value);
});
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.getElementById('decimalInput').value = chip.dataset.val;
        applyDecimal(chip.dataset.val);
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché 0,1 + 0,2 non fa esattamente 0,3 in quasi ogni linguaggio? ▸'
        : 'Perché 0,1 + 0,2 non fa esattamente 0,3 in quasi ogni linguaggio? ▾';
});

// Inizializzazione
applyDecimal('0.1');
