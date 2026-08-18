async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

let state = {
    hashA: '',
    hashB: '',
    requestId: 0
};

function renderHashValue(elementId, hash, other) {
    const el = document.getElementById(elementId);
    el.innerHTML = hash.split('').map((ch, i) => {
        const cls = other && other[i] === ch ? 'match' : 'diff';
        return `<span class="hash-char ${cls}">${ch}</span>`;
    }).join('');
}

function renderSimilarity() {
    if (!state.hashA || !state.hashB) return;
    let matches = 0;
    for (let i = 0; i < state.hashA.length; i++) {
        if (state.hashA[i] === state.hashB[i]) matches++;
    }
    const pct = Math.round((matches / state.hashA.length) * 100);
    const panel = document.getElementById('similarityPanel');
    if (state.hashA === state.hashB) {
        panel.innerHTML = `I due testi hanno prodotto <strong>lo stesso identico hash</strong> — perché il testo in ingresso è identico.`;
    } else {
        panel.innerHTML = `Solo <strong>${pct}%</strong> delle cifre dell'hash coincidono nella stessa posizione tra i due testi — un valore vicino a quello atteso anche tra due hash di testi <em>completamente diversi</em> (circa 6%, per puro caso, dato che ogni cifra esadecimale ha 16 possibilità). Nonostante l'ingresso fosse quasi identico, l'uscita è, di fatto, irriconoscibile.`;
    }
}

async function updateHashes() {
    const id = ++state.requestId;
    const textA = document.getElementById('textA').value;
    const textB = document.getElementById('textB').value;

    const [hashA, hashB] = await Promise.all([sha256Hex(textA), sha256Hex(textB)]);

    if (id !== state.requestId) return; // un input più recente ha già superato questo calcolo

    state.hashA = hashA;
    state.hashB = hashB;
    renderHashValue('hashA', hashA, hashB);
    renderHashValue('hashB', hashB, hashA);
    renderSimilarity();
}

document.getElementById('textA').addEventListener('input', updateHashes);
document.getElementById('textB').addEventListener('input', updateHashes);

function setTexts(a, b) {
    document.getElementById('textA').value = a;
    document.getElementById('textB').value = b;
    updateHashes();
}

document.getElementById('presetDiff').addEventListener('click', () => setTexts('Ciao mondo', 'Ciao mondo.'));
document.getElementById('presetDigit').addEventListener('click', () => setTexts('Il mio PIN è 1234', 'Il mio PIN è 1235'));
document.getElementById('presetSame').addEventListener('click', () => setTexts('Stesso testo identico', 'Stesso testo identico'));

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'A cosa servono davvero gli hash? ▸'
        : 'A cosa servono davvero gli hash? ▾';
});

updateHashes();
