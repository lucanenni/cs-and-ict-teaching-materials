let state = {
    width: 8,
    bits: new Array(8).fill(0), // indice 0 = bit più significativo (MSB)
    signed: false
};

function placeValue(indexFromLeft) {
    return Math.pow(2, state.width - 1 - indexFromLeft);
}

function unsignedValue() {
    return state.bits.reduce((sum, bit, i) => sum + bit * placeValue(i), 0);
}

function displayedValue() {
    const unsigned = unsignedValue();
    if (state.signed && state.bits[0] === 1) {
        return unsigned - Math.pow(2, state.width);
    }
    return unsigned;
}

function renderBits() {
    const box = document.getElementById('bitsBox');
    box.innerHTML = '';
    state.bits.forEach((bit, i) => {
        if (i > 0 && i % 4 === 0) {
            box.appendChild(Object.assign(document.createElement('div'), { className: 'bit-nibble-gap' }));
        }
        const col = document.createElement('div');
        col.className = 'bit-col';

        const place = document.createElement('div');
        place.className = 'bit-place';
        place.textContent = state.signed && i === 0 ? '±' + placeValue(i) : placeValue(i);
        col.appendChild(place);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bit-toggle' + (bit ? ' on' : '');
        btn.textContent = bit;
        btn.addEventListener('click', () => {
            state.bits[i] = state.bits[i] ? 0 : 1;
            renderAll();
        });
        col.appendChild(btn);

        box.appendChild(col);
    });
}

function renderValues() {
    document.getElementById('decValue').textContent = displayedValue();

    const binStr = state.bits.join('');
    const grouped = binStr.replace(/(.{4})(?=.)/g, '$1 ');
    document.getElementById('binValue').textContent = grouped;

    const hexDigits = state.width / 4;
    const hex = unsignedValue().toString(16).toUpperCase().padStart(hexDigits, '0');
    document.getElementById('hexValue').textContent = '0x' + hex;
}

function renderSum() {
    const terms = state.bits.map((bit, i) => `${placeValue(i)}×${bit}`).join(' + ');
    document.getElementById('sumPanel').textContent = `${terms} = ${unsignedValue()}` +
        (state.signed && state.bits[0] === 1 ? ` → con segno: ${displayedValue()} (perché il bit più a sinistra vale −${placeValue(0)} invece di +${placeValue(0)})` : '');
}

function renderAll() {
    renderBits();
    renderValues();
    renderSum();
}

function setBitsFromUnsigned(value) {
    const bits = [];
    for (let i = 0; i < state.width; i++) {
        bits.push((value >> (state.width - 1 - i)) & 1);
    }
    state.bits = bits;
}

function showError(msg) {
    const el = document.getElementById('errorText');
    if (!msg) {
        el.classList.add('hidden');
        el.textContent = '';
    } else {
        el.classList.remove('hidden');
        el.textContent = msg;
    }
}

function applyInput() {
    const format = document.getElementById('inputFormat').value;
    const raw = document.getElementById('valueInput').value.trim();
    if (raw === '') { showError('Scrivi prima un numero.'); return; }

    if (format === 'hex') {
        const clean = raw.replace(/^0x/i, '');
        if (!/^[0-9a-fA-F]+$/.test(clean)) { showError('Non è un numero esadecimale valido (usa solo cifre 0-9 e A-F).'); return; }
        const value = parseInt(clean, 16);
        const max = Math.pow(2, state.width) - 1;
        if (value > max) { showError(`Troppo grande per ${state.width} bit (massimo 0x${max.toString(16).toUpperCase()}).`); return; }
        setBitsFromUnsigned(value);
    } else {
        if (!/^-?\d+$/.test(raw)) { showError('Non è un numero decimale valido.'); return; }
        const value = parseInt(raw, 10);
        const minSigned = -Math.pow(2, state.width - 1);
        const maxSigned = Math.pow(2, state.width - 1) - 1;
        const maxUnsigned = Math.pow(2, state.width) - 1;
        if (state.signed) {
            if (value < minSigned || value > maxSigned) { showError(`Fuori range per ${state.width} bit con segno (da ${minSigned} a ${maxSigned}).`); return; }
            setBitsFromUnsigned(value < 0 ? value + Math.pow(2, state.width) : value);
        } else {
            if (value < 0 || value > maxUnsigned) { showError(`Fuori range per ${state.width} bit senza segno (da 0 a ${maxUnsigned}).`); return; }
            setBitsFromUnsigned(value);
        }
    }
    showError(null);
    renderAll();
}

document.getElementById('widthSelect').addEventListener('change', (e) => {
    state.width = parseInt(e.target.value);
    state.bits = new Array(state.width).fill(0);
    renderAll();
});

document.getElementById('signedToggle').addEventListener('change', (e) => {
    state.signed = e.target.checked;
    renderAll();
});

document.getElementById('applyBtn').addEventListener('click', applyInput);
document.getElementById('valueInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyInput();
});

document.getElementById('clearBtn').addEventListener('click', () => {
    state.bits = new Array(state.width).fill(0);
    showError(null);
    renderAll();
});

document.getElementById('maxBtn').addEventListener('click', () => {
    state.bits = new Array(state.width).fill(1);
    showError(null);
    renderAll();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Come si rappresentano i numeri negativi? ▸'
        : 'Come si rappresentano i numeri negativi? ▾';
});

renderAll();
