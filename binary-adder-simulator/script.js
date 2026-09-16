const HELP_TEXT = {
    half: [
        '• Un <strong>semisommatore</strong> somma due singoli bit usando due porte: una <strong>XOR</strong> calcola la somma (S), una <strong>AND</strong> calcola il riporto (C).',
        '• Funziona bene finché non serve tenere conto di un riporto proveniente da una colonna precedente — per quello serve il "sommatore completo" nella scheda successiva.',
        '• Prova A=1, B=1: la somma corretta di 1+1 in binario è "10", cioè S=0 con un riporto C=1 — esattamente quello che mostrano le due porte.'
    ],
    full: [
        '• Un <strong>sommatore completo</strong> accetta anche un riporto in ingresso (Cin), oltre ai due bit A e B — indispensabile per concatenare più colonne insieme.',
        '• È costruito con <strong>due semisommatori</strong> in cascata più una porta OR finale: i 5 passi qui sopra mostrano esattamente questi 5 collegamenti.',
        '• Con A=1, B=1, Cin=1 la somma è "11" in binario: S=1 e riporto in uscita Cout=1 — il caso con più "1" possibile, e nessuna porta si perde nulla.'
    ],
    multi: [
        '• Concatenando un sommatore completo per ogni colonna, con il riporto in uscita di ognuno collegato al riporto in ingresso del successivo, si sommano numeri binari di qualunque lunghezza.',
        '• L\'addizione procede sempre dalla colonna <strong>meno significativa</strong> (a destra, come a mano) verso quella più significativa: guarda l\'animazione propagare il riporto da destra a sinistra.',
        '• Se anche l\'ultima colonna produce un riporto in uscita, il risultato non ci sta più nei bit disponibili: è un <strong>overflow</strong>, lo stesso identico problema che causa bug reali quando un numero intero "trabocca" il suo spazio di memoria.'
    ]
};

const HINT_TEXT = {
    half: 'Accendi e spegni A e B e guarda le due porte calcolare somma e riporto in tempo reale.',
    full: 'Accendi e spegni A, B e il riporto in ingresso (Cin): segui i 5 passi che portano al risultato finale.',
    multi: 'Componi due numeri binari a 4 bit e guarda la somma propagarsi colonna per colonna, con il riporto che passa da una all\'altra.'
};

function halfAdd(a, b) {
    return { s: a ^ b, c: a & b };
}

function fullAdd(a, b, cin) {
    const s1 = a ^ b;
    const c1 = a & b;
    const s = s1 ^ cin;
    const c2 = s1 & cin;
    const cout = c1 | c2;
    return { s1, c1, s, c2, cout };
}

let state = {
    mode: 'half',
    half: { A: 1, B: 0 },
    full: { A: 1, B: 0, Cin: 0 },
    multi: {
        A: [0, 1, 0, 1],
        B: [0, 0, 1, 1],
        frames: [],
        finalCarryOut: 0,
        sumBits: [],
        current: -1,
        isPlaying: false,
        interval: null,
        speed: 700
    }
};

// --- Componenti condivisi del circuito -----------------------------------

function makeInputToggle(label, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'input-toggle';
    const labelEl = document.createElement('span');
    labelEl.className = 'input-toggle-label';
    labelEl.textContent = label;
    wrap.appendChild(labelEl);

    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!value;
    input.addEventListener('change', (e) => onChange(e.target.checked ? 1 : 0));
    const slider = document.createElement('span');
    slider.className = 'slider-toggle';
    switchLabel.appendChild(input);
    switchLabel.appendChild(slider);
    wrap.appendChild(switchLabel);
    return wrap;
}

function makeValueChip(label, value) {
    const wrap = document.createElement('div');
    wrap.className = 'value-chip';
    const labelEl = document.createElement('span');
    labelEl.className = 'value-chip-label';
    labelEl.textContent = label;
    const numEl = document.createElement('span');
    numEl.className = 'value-chip-num' + (value ? ' on' : '');
    numEl.textContent = value;
    wrap.appendChild(labelEl);
    wrap.appendChild(numEl);
    return wrap;
}

function makeWire(live) {
    const w = document.createElement('div');
    w.className = 'wire' + (live ? ' live' : '');
    return w;
}

function makeOutputLamp(value, label, isFinal) {
    const col = document.createElement('div');
    col.className = 'output-lamp-col';
    const lamp = document.createElement('div');
    lamp.className = 'output-lamp' + (value ? ' on' : '') + (isFinal ? ' final' : '');
    lamp.textContent = value;
    col.appendChild(lamp);
    const lbl = document.createElement('div');
    lbl.className = 'output-label';
    lbl.textContent = label;
    col.appendChild(lbl);
    return col;
}

function makeGateStepRow(title, inputs, gateName, output, outputLabel, isFinal) {
    const container = document.createElement('div');
    const titleEl = document.createElement('div');
    titleEl.className = 'step-title';
    titleEl.textContent = title;
    container.appendChild(titleEl);

    const row = document.createElement('div');
    row.className = 'step-row';

    const chipCol = document.createElement('div');
    chipCol.className = 'value-chip-col';
    inputs.forEach(([lbl, val]) => chipCol.appendChild(makeValueChip(lbl, val)));
    row.appendChild(chipCol);

    row.appendChild(makeWire(inputs.some(([, v]) => v)));

    const gateBox = document.createElement('div');
    gateBox.className = 'gate-box';
    gateBox.textContent = gateName;
    row.appendChild(gateBox);

    row.appendChild(makeWire(!!output));
    row.appendChild(makeOutputLamp(output, outputLabel, isFinal));

    container.appendChild(row);
    return container;
}

// --- Modalità 1: semisommatore --------------------------------------------

function renderHalf() {
    const { A, B } = state.half;
    const { s, c } = halfAdd(A, B);
    const box = document.getElementById('halfCircuitBox');
    box.innerHTML = '';

    const topRow = document.createElement('div');
    topRow.className = 'top-inputs-row';
    topRow.appendChild(makeInputToggle('A', A, (v) => { state.half.A = v; renderHalf(); }));
    topRow.appendChild(makeInputToggle('B', B, (v) => { state.half.B = v; renderHalf(); }));
    box.appendChild(topRow);

    box.appendChild(makeGateStepRow('A ⊕ B → Somma (S)', [['A', A], ['B', B]], 'XOR', s, 'S', true));
    box.appendChild(makeGateStepRow('A · B → Riporto (C)', [['A', A], ['B', B]], 'AND', c, 'C', true));

    const table = document.getElementById('halfTruthTable');
    let html = '<tr><th>A</th><th>B</th><th>S</th><th>C</th></tr>';
    for (let a = 0; a <= 1; a++) {
        for (let b = 0; b <= 1; b++) {
            const r = halfAdd(a, b);
            const isCurrent = a === A && b === B;
            html += `<tr class="${isCurrent ? 'current-row' : ''}"><td>${a}</td><td>${b}</td><td>${r.s}</td><td>${r.c}</td></tr>`;
        }
    }
    table.innerHTML = html;
}

// --- Modalità 2: sommatore completo ----------------------------------------

function renderFull() {
    const { A, B, Cin } = state.full;
    const { s1, c1, s, c2, cout } = fullAdd(A, B, Cin);
    const box = document.getElementById('fullCircuitBox');
    box.innerHTML = '';

    const topRow = document.createElement('div');
    topRow.className = 'top-inputs-row';
    topRow.appendChild(makeInputToggle('A', A, (v) => { state.full.A = v; renderFull(); }));
    topRow.appendChild(makeInputToggle('B', B, (v) => { state.full.B = v; renderFull(); }));
    topRow.appendChild(makeInputToggle('Cin', Cin, (v) => { state.full.Cin = v; renderFull(); }));
    box.appendChild(topRow);

    box.appendChild(makeGateStepRow('1. A ⊕ B = S₁ (somma parziale)', [['A', A], ['B', B]], 'XOR', s1, 'S₁', false));
    box.appendChild(makeGateStepRow('2. A · B = C₁ (riporto parziale)', [['A', A], ['B', B]], 'AND', c1, 'C₁', false));
    box.appendChild(makeGateStepRow('3. S₁ ⊕ Cin = S (somma finale)', [['S₁', s1], ['Cin', Cin]], 'XOR', s, 'S', true));
    box.appendChild(makeGateStepRow('4. S₁ · Cin = C₂ (riporto parziale)', [['S₁', s1], ['Cin', Cin]], 'AND', c2, 'C₂', false));
    box.appendChild(makeGateStepRow('5. C₁ + C₂ = Cout (riporto in uscita)', [['C₁', c1], ['C₂', c2]], 'OR', cout, 'Cout', true));

    const table = document.getElementById('fullTruthTable');
    let html = '<tr><th>A</th><th>B</th><th>Cin</th><th>S</th><th>Cout</th></tr>';
    for (let a = 0; a <= 1; a++) {
        for (let b = 0; b <= 1; b++) {
            for (let cin = 0; cin <= 1; cin++) {
                const r = fullAdd(a, b, cin);
                const isCurrent = a === A && b === B && cin === Cin;
                html += `<tr class="${isCurrent ? 'current-row' : ''}"><td>${a}</td><td>${b}</td><td>${cin}</td><td>${r.s}</td><td>${r.cout}</td></tr>`;
            }
        }
    }
    table.innerHTML = html;
}

// --- Modalità 3: somma di due numeri a più bit ------------------------------

function toDecimal(bitsArr) {
    return bitsArr.reduce((acc, b) => acc * 2 + b, 0);
}

function generateMultiFrames(A, B) {
    const n = A.length;
    const frames = [];
    const sumBits = new Array(n).fill(0);
    let carry = 0;
    for (let i = n - 1; i >= 0; i--) {
        const a = A[i], b = B[i], cin = carry;
        const r = fullAdd(a, b, cin);
        sumBits[i] = r.s;
        frames.push({ pos: i, a, b, cin, s: r.s, cout: r.cout });
        carry = r.cout;
    }
    return { frames, finalCarryOut: carry, sumBits };
}

function regenerateMultiFrames() {
    const { frames, finalCarryOut, sumBits } = generateMultiFrames(state.multi.A, state.multi.B);
    state.multi.frames = frames;
    state.multi.finalCarryOut = finalCarryOut;
    state.multi.sumBits = sumBits;
    state.multi.current = -1;
}

function renderMultiNumbers() {
    const box = document.getElementById('multiNumbers');
    box.innerHTML = '';
    ['A', 'B'].forEach(letter => {
        const arr = state.multi[letter];
        const row = document.createElement('div');
        row.className = 'number-row';
        const label = document.createElement('div');
        label.className = 'number-label';
        label.textContent = 'Numero ' + letter + ':';
        row.appendChild(label);

        const bitsRow = document.createElement('div');
        bitsRow.className = 'bits-row';
        arr.forEach((bit, i) => {
            const btn = document.createElement('button');
            btn.className = 'bit-toggle' + (bit ? ' on' : '');
            btn.textContent = bit;
            btn.disabled = state.multi.isPlaying;
            btn.addEventListener('click', () => {
                stopMultiPlaying();
                arr[i] = arr[i] ? 0 : 1;
                regenerateMultiFrames();
                renderMultiNumbers();
                renderMulti();
                updateMultiCaption();
            });
            bitsRow.appendChild(btn);
        });
        row.appendChild(bitsRow);

        const dec = document.createElement('span');
        dec.className = 'number-decimal';
        dec.textContent = '= ' + toDecimal(arr);
        row.appendChild(dec);

        box.appendChild(row);
    });
}

function addLabeledBit(col, label, value, extraClass) {
    const lbl = document.createElement('div');
    lbl.className = 'ripple-label';
    lbl.textContent = label;
    col.appendChild(lbl);
    const bit = document.createElement('div');
    bit.className = 'ripple-bit' + (value === 1 ? ' on' : '') + (extraClass ? ' ' + extraClass : '');
    bit.textContent = (value === null || value === undefined) ? '?' : value;
    col.appendChild(bit);
}

function renderMulti() {
    const { A, B, frames, current } = state.multi;
    const n = A.length;
    const box = document.getElementById('rippleBox');
    box.innerHTML = '';

    for (let i = 0; i < n; i++) {
        const frameIdx = frames.findIndex(f => f.pos === i);
        const isActive = frameIdx === current;
        const isRevealed = frameIdx !== -1 && frameIdx <= current;
        const frame = isRevealed ? frames[frameIdx] : null;

        const col = document.createElement('div');
        col.className = 'ripple-col' + (isActive ? ' active' : '') + (isRevealed && !isActive ? ' done' : '');

        const place = document.createElement('div');
        place.className = 'ripple-label';
        place.textContent = `2^${n - 1 - i}`;
        col.appendChild(place);

        addLabeledBit(col, 'A', A[i]);
        addLabeledBit(col, 'B', B[i]);
        addLabeledBit(col, 'cin', frame ? frame.cin : null, 'carry');
        addLabeledBit(col, 'S', frame ? frame.s : null);
        addLabeledBit(col, 'cout', frame ? frame.cout : null, 'carry');

        box.appendChild(col);
    }

    renderSumResult();
}

function renderSumResult() {
    const { A, B, frames, current, sumBits, finalCarryOut } = state.multi;
    const n = A.length;
    const el = document.getElementById('sumResult');
    if (current < frames.length - 1) {
        el.textContent = '';
        return;
    }
    const decA = toDecimal(A);
    const decB = toDecimal(B);
    const decSumBits = toDecimal(sumBits);
    const actualSum = decA + decB;
    if (finalCarryOut === 1) {
        el.innerHTML = `${decA} + ${decB} = ${actualSum}, ma con soli ${n} bit disponibili il risultato è ${decSumBits} — ` +
            `<strong>overflow!</strong> il riporto finale (che varrebbe ${Math.pow(2, n)}) va perso perché non c'è un bit in più per rappresentarlo.`;
    } else {
        el.textContent = `${decA} + ${decB} = ${decSumBits} ✓ (in binario: ${sumBits.join('')})`;
    }
}

function updateMultiCaption() {
    const { frames, current, A } = state.multi;
    const caption = document.getElementById('stepCaption');
    const n = A.length;
    if (current < 0) {
        caption.textContent = 'Premi "Avvia" o "Passo singolo" per iniziare la somma dalla colonna meno significativa (a destra).';
        return;
    }
    const f = frames[current];
    caption.textContent = `Colonna 2^${n - 1 - f.pos}: ${f.a} + ${f.b} + riporto in ingresso (${f.cin}) = somma ${f.s}, riporto in uscita ${f.cout}.`;
}

function updateMultiControls() {
    const { current, frames, isPlaying } = state.multi;
    const atEnd = current >= frames.length - 1;
    const playBtn = document.getElementById('playPauseBtn');
    if (isPlaying) playBtn.textContent = '⏸ Pausa';
    else if (atEnd) playBtn.textContent = '↻ Riavvia';
    else playBtn.textContent = '▶ Avvia';
    document.getElementById('stepBtn').disabled = atEnd;
}

function advanceMulti() {
    if (state.multi.current >= state.multi.frames.length - 1) {
        stopMultiPlaying();
        return;
    }
    state.multi.current++;
    renderMulti();
    updateMultiCaption();
    updateMultiControls();
}

function startMultiPlaying() {
    if (state.multi.current >= state.multi.frames.length - 1) state.multi.current = -1;
    stopMultiInterval();
    state.multi.isPlaying = true;
    renderMultiNumbers();
    updateMultiControls();
    state.multi.interval = setInterval(() => {
        advanceMulti();
        if (state.multi.current >= state.multi.frames.length - 1) stopMultiPlaying();
    }, state.multi.speed);
}

function stopMultiInterval() {
    if (state.multi.interval) clearInterval(state.multi.interval);
    state.multi.interval = null;
}

function stopMultiPlaying() {
    stopMultiInterval();
    state.multi.isPlaying = false;
    renderMultiNumbers();
    updateMultiControls();
}

function resetMulti() {
    stopMultiPlaying();
    state.multi.current = -1;
    renderMulti();
    updateMultiCaption();
    updateMultiControls();
}

// --- Cambio modalità e inizializzazione ------------------------------------

function setMode(mode) {
    state.mode = mode;
    document.getElementById('halfModeBtn').classList.toggle('active', mode === 'half');
    document.getElementById('fullModeBtn').classList.toggle('active', mode === 'full');
    document.getElementById('multiModeBtn').classList.toggle('active', mode === 'multi');
    document.getElementById('halfMode').classList.toggle('hidden', mode !== 'half');
    document.getElementById('fullMode').classList.toggle('hidden', mode !== 'full');
    document.getElementById('multiMode').classList.toggle('hidden', mode !== 'multi');
    document.getElementById('hintText').textContent = HINT_TEXT[mode];
    document.getElementById('helpList').innerHTML = HELP_TEXT[mode].map(li => `<li>${li}</li>`).join('');

    if (mode === 'half') renderHalf();
    else if (mode === 'full') renderFull();
    else {
        renderMultiNumbers();
        renderMulti();
        updateMultiCaption();
        updateMultiControls();
    }
}

document.getElementById('halfModeBtn').addEventListener('click', () => setMode('half'));
document.getElementById('fullModeBtn').addEventListener('click', () => setMode('full'));
document.getElementById('multiModeBtn').addEventListener('click', () => setMode('multi'));

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (state.multi.isPlaying) stopMultiPlaying();
    else startMultiPlaying();
});
document.getElementById('stepBtn').addEventListener('click', () => {
    stopMultiPlaying();
    advanceMulti();
});
document.getElementById('resetMultiBtn').addEventListener('click', resetMulti);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Perché serve un "riporto"? ▸' : 'Perché serve un "riporto"? ▾';
});

// Inizializzazione
regenerateMultiFrames();
setMode('half');
