// --- Motore S-DES (Simplified DES, Edward Schaefer 1996) ------------------
// Implementazione verificata bit per bit contro l'esempio numerico completo
// di riferimento (chiave 1101001101, testo in chiaro 10101010 → K1 =
// 11011010, K2 = 10001101, testo cifrato 00111001) prima di essere
// inserita qui, oltre che su 2000 cifrature/decifrature casuali (la
// decifratura deve sempre restituire il testo in chiaro di partenza).

const P10 = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6];
const P8 = [6, 3, 7, 4, 8, 5, 10, 9];
const IP = [2, 6, 3, 1, 4, 8, 5, 7];
const IP_INV = [4, 1, 3, 5, 7, 2, 8, 6];
const EP = [4, 1, 2, 3, 2, 3, 4, 1];
const P4 = [2, 4, 3, 1];

const S0 = [
    ['01', '00', '11', '10'],
    ['11', '10', '01', '00'],
    ['00', '10', '01', '11'],
    ['11', '01', '11', '10'],
];
const S1 = [
    ['00', '01', '10', '11'],
    ['10', '00', '01', '11'],
    ['11', '00', '01', '00'],
    ['10', '01', '00', '11'],
];

function toBits(str) { return str.split('').map(Number); }
function toStr(bits) { return bits.join(''); }
function permute(bits, table) { return table.map(p => bits[p - 1]); }
function xorBits(a, b) { return a.map((v, i) => v ^ b[i]); }
function leftShift(half, n) {
    n = n % half.length;
    return half.slice(n).concat(half.slice(0, n));
}

function generateSubkeys(key10) {
    const k = toBits(key10);
    const p10 = permute(k, P10);
    let left = p10.slice(0, 5), right = p10.slice(5, 10);
    const afterFirstShift = { left: leftShift(left, 1), right: leftShift(right, 1) };
    const k1 = permute(afterFirstShift.left.concat(afterFirstShift.right), P8);
    const afterSecondShift = { left: leftShift(afterFirstShift.left, 2), right: leftShift(afterFirstShift.right, 2) };
    const k2 = permute(afterSecondShift.left.concat(afterSecondShift.right), P8);
    return {
        p10: toStr(p10),
        afterFirstShift: toStr(afterFirstShift.left.concat(afterFirstShift.right)),
        k1: toStr(k1),
        afterSecondShift: toStr(afterSecondShift.left.concat(afterSecondShift.right)),
        k2: toStr(k2),
    };
}

function sbox(table, nibble) {
    const row = parseInt('' + nibble[0] + nibble[3], 2);
    const col = parseInt('' + nibble[1] + nibble[2], 2);
    return toBits(table[row][col]);
}

// Esegue fk (la funzione di round) e ritorna anche tutti i valori intermedi,
// utili per mostrare la traccia passo-passo.
function fkTraced(block8, subkey8) {
    const b = toBits(block8);
    const L = b.slice(0, 4), R = b.slice(4, 8);
    const ep = permute(R, EP);
    const xored = xorBits(ep, toBits(subkey8));
    const n1 = xored.slice(0, 4), n2 = xored.slice(4, 8);
    const s0out = sbox(S0, n1);
    const s1out = sbox(S1, n2);
    const combined = s0out.concat(s1out);
    const p4 = permute(combined, P4);
    const newL = xorBits(p4, L);
    return {
        L: toStr(L), R: toStr(R),
        ep: toStr(ep),
        xored: toStr(xored),
        s0out: toStr(s0out), s1out: toStr(s1out), combined: toStr(combined),
        p4: toStr(p4),
        newL: toStr(newL),
        output: toStr(newL.concat(R)),
    };
}

function swapNibbles(block8) {
    return block8.slice(4, 8) + block8.slice(0, 4);
}

// Esegue l'intero algoritmo (cifratura o decifratura, a seconda dell'ordine
// delle sottochiavi passato) e ritorna una traccia completa di ogni passo.
function runTraced(input8, keyA, keyB) {
    const ipOut = toStr(permute(toBits(input8), IP));
    const round1 = fkTraced(ipOut, keyA);
    const swapped = swapNibbles(round1.output);
    const round2 = fkTraced(swapped, keyB);
    const output = toStr(permute(toBits(round2.output), IP_INV));
    return { ipOut, round1, swapped, round2, output };
}

// --- Interfaccia -----------------------------------------------------------

let plaintextBits = toBits('10101010');
let keyBitsArr = toBits('1101001101');
let mode = 'encrypt';

function renderBitsRow(containerId, bitsArr, onToggle) {
    const row = document.getElementById(containerId);
    row.innerHTML = '';
    bitsArr.forEach((bit, i) => {
        const btn = document.createElement('button');
        btn.className = 'bit-toggle' + (bit ? ' on' : '');
        btn.textContent = String(bit);
        btn.addEventListener('click', () => onToggle(i));
        row.appendChild(btn);
    });
}

function stepRow(label, value, accent) {
    return `<div class="step-row"><span class="k">${label}</span><span class="v${accent ? ' accent' : ''}">${value}</span></div>`;
}

function render() {
    renderBitsRow('plaintextBits', plaintextBits, (i) => {
        plaintextBits[i] = plaintextBits[i] ? 0 : 1;
        render();
    });
    renderBitsRow('keyBits', keyBitsArr, (i) => {
        keyBitsArr[i] = keyBitsArr[i] ? 0 : 1;
        render();
    });

    document.getElementById('plaintextLabel').textContent =
        mode === 'encrypt' ? 'Testo in chiaro (8 bit)' : 'Testo cifrato (8 bit)';
    document.getElementById('resultLabel').textContent =
        mode === 'encrypt' ? 'Testo cifrato:' : 'Testo in chiaro:';

    const key10 = toStr(keyBitsArr);
    const input8 = toStr(plaintextBits);
    const sub = generateSubkeys(key10);
    const [keyA, keyB] = mode === 'encrypt' ? [sub.k1, sub.k2] : [sub.k2, sub.k1];
    const trace = runTraced(input8, keyA, keyB);

    document.getElementById('resultValue').textContent = trace.output;

    const roundBlock = (title, r, subkeyLabel, subkeyVal) => `
        <div class="step-card">
            <div class="step-title">${title}</div>
            <div class="step-rows">
                ${stepRow('L / R', r.L + ' / ' + r.R)}
                ${stepRow('EP(R) — espansione 4→8 bit', r.ep)}
                ${stepRow('EP(R) XOR ' + subkeyLabel + ' (' + subkeyVal + ')', r.xored, true)}
                ${stepRow('S0(n₁n₂n₃n₄) / S1(n₅n₆n₇n₈)', r.s0out + ' / ' + r.s1out)}
                ${stepRow('P4(S0‖S1)', r.combined + ' → ' + r.p4)}
                ${stepRow('P4 XOR L', r.newL, true)}
                ${stepRow('Risultato del round (newL ‖ R)', r.output, true)}
            </div>
        </div>`;

    document.getElementById('trace').innerHTML = `
        <div class="step-card">
            <div class="step-title">Generazione delle sottochiavi</div>
            <div class="step-rows">
                ${stepRow('Chiave originale (10 bit)', key10)}
                ${stepRow('P10(chiave)', sub.p10)}
                ${stepRow('Dopo split + rotazione sinistra di 1', sub.afterFirstShift)}
                ${stepRow('P8 → K1', sub.k1, true)}
                ${stepRow("Dopo un'altra rotazione sinistra di 2", sub.afterSecondShift)}
                ${stepRow('P8 → K2', sub.k2, true)}
            </div>
        </div>

        <div class="step-card">
            <div class="step-title">${mode === 'encrypt' ? 'Testo in chiaro' : 'Testo cifrato'} dopo IP (permutazione iniziale)</div>
            <div class="step-rows">${stepRow('IP(' + input8 + ')', trace.ipOut, true)}</div>
        </div>

        ${roundBlock('Round 1 — usa ' + (mode === 'encrypt' ? 'K1' : 'K2'), trace.round1, mode === 'encrypt' ? 'K1' : 'K2', keyA)}

        <div class="step-card">
            <div class="step-title">Scambio dei due nibble</div>
            <div class="step-rows">${stepRow('Swap(' + trace.round1.output + ')', trace.swapped, true)}</div>
        </div>

        ${roundBlock('Round 2 — usa ' + (mode === 'encrypt' ? 'K2' : 'K1'), trace.round2, mode === 'encrypt' ? 'K2' : 'K1', keyB)}

        <div class="step-card">
            <div class="step-title">IP⁻¹ (permutazione finale) → risultato</div>
            <div class="step-rows">${stepRow('IP⁻¹(' + trace.round2.output + ')', trace.output, true)}</div>
        </div>
    `;
}

document.querySelectorAll('.mode-row .chip').forEach(btn => {
    btn.addEventListener('click', () => {
        mode = btn.dataset.mode;
        document.querySelectorAll('.mode-row .chip').forEach(b => b.classList.toggle('active', b === btn));
        render();
    });
});

document.querySelectorAll('.presets-row .chip').forEach(btn => {
    btn.addEventListener('click', () => {
        plaintextBits = toBits(btn.dataset.plaintext);
        keyBitsArr = toBits(btn.dataset.key);
        render();
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'In cosa differisce dal vero DES? ▸' : 'In cosa differisce dal vero DES? ▾';
});

render();
