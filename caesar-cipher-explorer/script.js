const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function shiftChar(ch, shift) {
    const isUpper = ch >= 'A' && ch <= 'Z';
    const isLower = ch >= 'a' && ch <= 'z';
    if (!isUpper && !isLower) return ch;
    const base = isUpper ? 65 : 97;
    const code = ch.charCodeAt(0) - base;
    const shifted = ((code + shift) % 26 + 26) % 26;
    return String.fromCharCode(shifted + base);
}

function caesarShift(text, shift) {
    return [...text].map(ch => shiftChar(ch, shift)).join('');
}

let state = {
    mode: 'encrypt',
    shift: 3
};

function renderAlphabet() {
    const row = document.getElementById('alphabetRow');
    row.innerHTML = '';
    const effectiveShift = state.mode === 'encrypt' ? state.shift : -state.shift;
    ALPHABET.split('').forEach(letter => {
        const pair = document.createElement('div');
        pair.className = 'alphabet-pair';
        const plain = document.createElement('span');
        plain.className = 'plain-letter';
        plain.textContent = letter;
        const cipher = document.createElement('span');
        cipher.className = 'cipher-letter';
        cipher.textContent = shiftChar(letter, effectiveShift);
        pair.appendChild(plain);
        pair.appendChild(cipher);
        row.appendChild(pair);
    });
}

function renderOutput() {
    const text = document.getElementById('mainText').value;
    const effectiveShift = state.mode === 'encrypt' ? state.shift : -state.shift;
    document.getElementById('outputText').textContent = caesarShift(text, effectiveShift);
    document.getElementById('outputLabel').textContent = state.mode === 'encrypt' ? 'Testo cifrato:' : 'Testo decifrato:';
}

function renderAll() {
    renderAlphabet();
    renderOutput();
}

document.getElementById('mainText').addEventListener('input', renderOutput);

document.getElementById('shiftSlider').addEventListener('input', (e) => {
    state.shift = parseInt(e.target.value);
    document.getElementById('shiftValue').textContent = state.shift;
    renderAll();
});

document.getElementById('encryptModeBtn').addEventListener('click', () => {
    state.mode = 'encrypt';
    document.getElementById('encryptModeBtn').classList.add('active');
    document.getElementById('decryptModeBtn').classList.remove('active');
    renderAll();
});

document.getElementById('decryptModeBtn').addEventListener('click', () => {
    state.mode = 'decrypt';
    document.getElementById('decryptModeBtn').classList.add('active');
    document.getElementById('encryptModeBtn').classList.remove('active');
    renderAll();
});

document.getElementById('bruteBtn').addEventListener('click', () => {
    const ciphertext = document.getElementById('bruteInput').value;
    const results = document.getElementById('bruteResults');
    results.innerHTML = '';
    for (let shift = 0; shift < 26; shift++) {
        const attempt = caesarShift(ciphertext, -shift);
        const row = document.createElement('div');
        row.className = 'brute-row';
        row.innerHTML = `<span class="brute-shift">shift ${shift}</span><span class="brute-text">${attempt}</span>`;
        results.appendChild(row);
    }
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché è considerato un cifrario "debole"? ▸'
        : 'Perché è considerato un cifrario "debole"? ▾';
});

// Precompila il campo "forza bruta" con un testo cifrato generato al volo
// (spostamento 7), così la demo funziona subito senza dover cifrare nulla a mano.
document.getElementById('bruteInput').value = caesarShift('Ci vediamo domani alle tre in biblioteca', 7);

renderAll();
