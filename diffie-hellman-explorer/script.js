const PUBLIC_PAIRS = [
    { p: 23, g: 5 },
    { p: 23, g: 11 },
    { p: 29, g: 3 },
    { p: 31, g: 7 },
    { p: 37, g: 2 }
];

function modPow(base, exp, mod) {
    let result = 1;
    const b = base % mod;
    for (let i = 0; i < exp; i++) result = (result * b) % mod;
    return result;
}

function numberToColor(n, p) {
    const hue = Math.round((n / p) * 360);
    return `hsl(${hue}, 65%, 55%)`;
}

let state = {
    p: 23,
    g: 5,
    a: 6,
    b: 4,
    crack: { frames: [], current: -1, interval: null, isPlaying: false, speed: 350 }
};

function renderSwatch(id, items) {
    const box = document.getElementById(id);
    box.innerHTML = '';
    items.forEach(([label, val]) => {
        const sw = document.createElement('div');
        sw.className = 'color-swatch';
        sw.style.background = numberToColor(val, state.p);
        sw.title = `${label} = ${val}`;
        box.appendChild(sw);
    });
}

function renderAll() {
    document.getElementById('pValue').textContent = state.p;
    document.getElementById('gValue').textContent = state.g;

    const maxSecret = state.p - 2;
    const aliceSlider = document.getElementById('aliceSecret');
    const bobSlider = document.getElementById('bobSecret');
    aliceSlider.max = maxSecret;
    bobSlider.max = maxSecret;
    if (state.a > maxSecret) state.a = maxSecret;
    if (state.b > maxSecret) state.b = maxSecret;
    aliceSlider.value = state.a;
    bobSlider.value = state.b;

    const A = modPow(state.g, state.a, state.p);
    const B = modPow(state.g, state.b, state.p);
    const sharedAlice = modPow(B, state.a, state.p);
    const sharedBob = modPow(A, state.b, state.p);

    document.getElementById('aliceSecretDisplay').textContent = `segreto a = ${state.a}`;
    document.getElementById('bobSecretDisplay').textContent = `segreto b = ${state.b}`;
    document.getElementById('aliceComputed').textContent = A;
    document.getElementById('bobComputed').textContent = B;
    document.getElementById('publicA').textContent = A;
    document.getElementById('publicB').textContent = B;

    renderSwatch('aliceSwatch', [['a', state.a], ['A', A]]);
    renderSwatch('bobSwatch', [['b', state.b], ['B', B]]);

    document.getElementById('aliceShared').textContent = sharedAlice;
    document.getElementById('bobShared').textContent = sharedBob;
    const check = document.getElementById('sharedCheck');
    if (sharedAlice === sharedBob) {
        check.textContent = `✓ Alice e Bob hanno la stessa chiave segreta condivisa: ${sharedAlice} — senza mai averla scambiata direttamente!`;
        check.style.color = '#15803d';
    } else {
        check.textContent = '⚠ qualcosa non torna nel calcolo';
        check.style.color = '#b91c1c';
    }
}

function newPublicPair() {
    let next = PUBLIC_PAIRS[Math.floor(Math.random() * PUBLIC_PAIRS.length)];
    if (PUBLIC_PAIRS.length > 1) {
        while (next.p === state.p && next.g === state.g) {
            next = PUBLIC_PAIRS[Math.floor(Math.random() * PUBLIC_PAIRS.length)];
        }
    }
    state.p = next.p;
    state.g = next.g;
    state.a = 1 + Math.floor(Math.random() * (state.p - 2));
    state.b = 1 + Math.floor(Math.random() * (state.p - 2));
    resetCrack();
    renderAll();
}

// --- Sezione di Eve: violazione per forza bruta -----------------------------

function generateCrackFrames() {
    const A = modPow(state.g, state.a, state.p);
    const frames = [];
    for (let guess = 1; guess <= state.p - 2; guess++) {
        const val = modPow(state.g, guess, state.p);
        frames.push({ guess, val, target: A, match: val === A });
        if (val === A) break;
    }
    return frames;
}

function stopCrackInterval() {
    if (state.crack.interval) clearInterval(state.crack.interval);
    state.crack.interval = null;
}

function resetCrack() {
    stopCrackInterval();
    state.crack.frames = [];
    state.crack.current = -1;
    state.crack.isPlaying = false;
    document.getElementById('crackAttempts').innerHTML = '';
    document.getElementById('crackCaption').textContent = '';
    document.getElementById('crackBtn').textContent = '▶ Fai provare a Eve';
    document.getElementById('crackBtn').disabled = false;
}

function renderCrackFrame(frame, index) {
    const chip = document.createElement('span');
    chip.className = 'attempt-chip' + (frame.match ? ' match' : '');
    chip.textContent = `g^${frame.guess} mod p = ${frame.val}`;
    document.getElementById('crackAttempts').appendChild(chip);

    const caption = document.getElementById('crackCaption');
    if (frame.match) {
        const B = modPow(state.g, state.b, state.p);
        const sharedByEve = modPow(B, frame.guess, state.p);
        caption.textContent = `Trovato dopo ${index + 1} tentativi: l'esponente ${frame.guess} produce g^${frame.guess} mod p = ${frame.val} = A. Con questo, Eve può calcolare anche lei il segreto condiviso: ${sharedByEve}.`;
    } else {
        caption.textContent = `Tentativo ${index + 1}: g^${frame.guess} mod p = ${frame.val} ≠ A (${frame.target}), continua...`;
    }
}

function doCrack() {
    resetCrack();
    const frames = generateCrackFrames();
    state.crack.frames = frames;
    state.crack.current = -1;
    state.crack.isPlaying = true;
    document.getElementById('crackBtn').disabled = true;
    let i = -1;
    state.crack.interval = setInterval(() => {
        i++;
        if (i >= frames.length) {
            stopCrackInterval();
            state.crack.isPlaying = false;
            document.getElementById('crackBtn').disabled = false;
            return;
        }
        state.crack.current = i;
        renderCrackFrame(frames[i], i);
    }, state.crack.speed);
}

// --- Eventi ------------------------------------------------------------

document.getElementById('aliceSecret').addEventListener('input', (e) => {
    state.a = parseInt(e.target.value, 10);
    renderAll();
    resetCrack();
});
document.getElementById('bobSecret').addEventListener('input', (e) => {
    state.b = parseInt(e.target.value, 10);
    renderAll();
});
document.getElementById('newPublicBtn').addEventListener('click', newPublicPair);
document.getElementById('crackBtn').addEventListener('click', doCrack);
document.getElementById('resetCrackBtn').addEventListener('click', resetCrack);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché Eve non riesce sempre a violarlo? ▸'
        : 'Perché Eve non riesce sempre a violarlo? ▾';
});

// Inizializzazione
renderAll();
