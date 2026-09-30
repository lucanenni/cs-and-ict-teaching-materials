// -----------------------------------------------------------------------
// Codice a barre (1D) — schema originale e semplificato a scopo
// didattico, NON lo standard reale Code 39/UPC: ogni carattere è uno dei
// C(9,3)=84 modi di scegliere quali 3 dei 9 elementi (barre/spazi
// alternati) sono "larghi" invece che "stretti". Un vero standard usa
// tabelle definite da un ente di normazione; qui la tabella è generata
// algoritmicamente, quindi è internamente coerente per costruzione.
// -----------------------------------------------------------------------

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ .-$'.split('');

function allCombos3of9() {
    const combos = [];
    for (let a = 0; a < 9; a++)
        for (let b = a + 1; b < 9; b++)
            for (let c = b + 1; c < 9; c++)
                combos.push([a, b, c]);
    return combos;
}
const ALL_COMBOS = allCombos3of9(); // 84 combinazioni

function patternForIndex(i) {
    const wide = ALL_COMBOS[i];
    return Array.from({ length: 9 }, (_, pos) => wide.includes(pos) ? 'W' : 'N');
}

const START_IDX = ALPHABET.length;     // 40
const STOP_IDX = ALPHABET.length + 1;  // 41

function charsEqual(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

function findAlphabetIndex(pattern) {
    const wideIdx = pattern.map((v, i) => v === 'W' ? i : -1).filter(i => i >= 0);
    for (let i = 0; i < ALL_COMBOS.length; i++) {
        if (charsEqual(ALL_COMBOS[i], wideIdx)) return i;
    }
    return -1;
}

let barState = { patterns: [], text: '' };

function buildBarcode(text) {
    const upper = text.toUpperCase();
    const validChars = [...upper].filter(ch => ALPHABET.includes(ch));
    const invalid = [...upper].filter(ch => !ALPHABET.includes(ch) && ch !== '');
    const indices = validChars.map(ch => ALPHABET.indexOf(ch));
    const checksum = indices.reduce((a, b) => a + b, 0) % ALPHABET.length;
    const allIndices = [START_IDX, ...indices, checksum, STOP_IDX];
    const patterns = allIndices.map(patternForIndex);
    return { patterns, validChars, invalid, checksum };
}

function renderBarcodeSvg(patterns) {
    const svg = document.getElementById('barcodeSvg');
    svg.innerHTML = '';
    const NS = 'http://www.w3.org/2000/svg';
    const marginX = 20, top = 20, height = 90;
    const unitsPerChar = 6 * 1 + 3 * 2.5; // 6 narrow + 3 wide per 9-element char
    const gapUnits = 1;
    const totalUnits = patterns.length * unitsPerChar + (patterns.length - 1) * gapUnits;
    const availableWidth = 600 - marginX * 2;
    const unit = availableWidth / totalUnits;

    let x = marginX;
    patterns.forEach((pattern) => {
        pattern.forEach((el, i) => {
            const w = unit * (el === 'W' ? 2.5 : 1);
            const isBar = i % 2 === 0; // elemento 0 = barra, alterna
            if (isBar) {
                const rect = document.createElementNS(NS, 'rect');
                rect.setAttribute('x', x.toFixed(2));
                rect.setAttribute('y', top);
                rect.setAttribute('width', w.toFixed(2));
                rect.setAttribute('height', height);
                rect.setAttribute('fill', '#1e293b');
                svg.appendChild(rect);
            }
            x += w;
        });
        x += unit * gapUnits;
    });
}

function refreshBarcode() {
    const text = document.getElementById('barcodeInput').value;
    const { patterns, validChars, invalid, checksum } = buildBarcode(text);
    barState = { patterns, text: validChars.join(''), checksum };
    renderBarcodeSvg(patterns);
    const note = document.getElementById('barcodeNote');
    note.textContent = invalid.length > 0
        ? `Caratteri non supportati da questo alfabeto, ignorati: ${[...new Set(invalid)].join(' ')}`
        : `Alfabeto minuscole (auto-maiuscolate), cifre, spazio, . - $. Checksum calcolato: ${checksum}.`;
    document.getElementById('barcodeResult').textContent = '';
}

function corruptRandomBar() {
    if (barState.patterns.length <= 2) return;
    // scegli un carattere dati (non START né STOP, cioè non il primo né l'ultimo)
    const charIdx = 1 + Math.floor(Math.random() * (barState.patterns.length - 2));
    const elIdx = Math.floor(Math.random() * 9);
    const pattern = barState.patterns[charIdx];
    pattern[elIdx] = pattern[elIdx] === 'W' ? 'N' : 'W';
    renderBarcodeSvg(barState.patterns);
    document.getElementById('barcodeResult').textContent = '⚡ Un elemento è stato invertito (largo↔stretto) in un carattere a caso.';
}

function decodeBarcode() {
    const dataAndChecksum = barState.patterns.slice(1, -1); // esclude START/STOP
    const decodedIdx = dataAndChecksum.map(findAlphabetIndex);
    const illegiblePositions = decodedIdx.map((v, i) => v === -1 ? i : -1).filter(i => i >= 0);
    const el = document.getElementById('barcodeResult');
    if (illegiblePositions.length > 0) {
        el.textContent = `❌ Carattere illeggibile in posizione ${illegiblePositions.map(i => i + 1).join(', ')}: un codice a barre non ha ridondanza, un solo elemento danneggiato basta a rendere quel carattere indecifrabile (non solo "sbagliato": proprio nessuna corrispondenza valida).`;
        return;
    }
    const chars = decodedIdx.slice(0, -1).map(i => ALPHABET[i]);
    const readChecksum = decodedIdx[decodedIdx.length - 1];
    const expectedChecksum = chars.map(ch => ALPHABET.indexOf(ch)).reduce((a, b) => a + b, 0) % ALPHABET.length;
    if (readChecksum === expectedChecksum) {
        el.textContent = `✓ Decodificato: "${chars.join('')}" — checksum verificato (${readChecksum}).`;
    } else {
        el.textContent = `⚠ Decodificato: "${chars.join('')}", ma il checksum non corrisponde (atteso ${expectedChecksum}, letto ${readChecksum}) — errore rilevato, non correggibile.`;
    }
}

// -----------------------------------------------------------------------
// Codice 2D semplificato con vera correzione d'errore Hamming(7,4).
// Ispirato ai QR code (pattern di ricerca agli angoli) ma NON conforme
// allo standard ISO: disposizione dei dati e correzione d'errore sono
// entrambe semplificate a scopo didattico.
// -----------------------------------------------------------------------

const GRID_N = 17;

function encodeHamming74(d1, d2, d3, d4) {
    const p1 = d1 ^ d2 ^ d4;
    const p2 = d1 ^ d3 ^ d4;
    const p3 = d2 ^ d3 ^ d4;
    return [p1, p2, d1, p3, d2, d3, d4];
}

function decodeHamming74(bits7) {
    const c = [null, bits7[0], bits7[1], bits7[2], bits7[3], bits7[4], bits7[5], bits7[6]];
    const s1 = c[1] ^ c[3] ^ c[5] ^ c[7];
    const s2 = c[2] ^ c[3] ^ c[6] ^ c[7];
    const s3 = c[4] ^ c[5] ^ c[6] ^ c[7];
    const errPos = s1 + 2 * s2 + 4 * s3;
    const corrected = c.slice();
    if (errPos !== 0) corrected[errPos] ^= 1;
    return { data: [corrected[3], corrected[5], corrected[6], corrected[7]], errPos };
}

function reservedMask(n) {
    const mask = Array.from({ length: n }, () => Array(n).fill(false));
    const mark = (r0, c0) => { for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) mask[r0 + r][c0 + c] = true; };
    mark(0, 0); mark(0, n - 7); mark(n - 7, 0);
    return mask;
}

function finderColor(r, c) {
    if (r === 0 || r === 6 || c === 0 || c === 6) return true;
    if (r === 1 || r === 5 || c === 1 || c === 5) return false;
    return true;
}

function dataCoords(n, mask) {
    const coords = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!mask[r][c]) coords.push([r, c]);
    return coords;
}

const MASK = reservedMask(GRID_N);
const DATA_COORDS = dataCoords(GRID_N, MASK);

let matrixState = { grid: null, nibbleCount: 0, byteLength: 0 };

function encodeMatrixText(text) {
    const bytes = Array.from(new TextEncoder().encode(text.toUpperCase()));
    const bits = [];
    bytes.forEach(byte => { for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1); });
    while (bits.length % 4 !== 0) bits.push(0);
    const nibbles = [];
    for (let i = 0; i < bits.length; i += 4) nibbles.push(bits.slice(i, i + 4));
    const codewordBits = nibbles.flatMap(n => encodeHamming74(n[0], n[1], n[2], n[3]));

    const grid = Array.from({ length: GRID_N }, () => Array(GRID_N).fill(0));
    const paintFinder = (r0, c0) => {
        for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) grid[r0 + r][c0 + c] = finderColor(r, c) ? 1 : 0;
    };
    paintFinder(0, 0); paintFinder(0, GRID_N - 7); paintFinder(GRID_N - 7, 0);

    DATA_COORDS.forEach(([r, c], i) => {
        grid[r][c] = i < codewordBits.length ? codewordBits[i] : 0;
    });

    return { grid, nibbleCount: nibbles.length, byteLength: bytes.length };
}

function renderMatrixSvg() {
    const svg = document.getElementById('matrixSvg');
    svg.innerHTML = '';
    const NS = 'http://www.w3.org/2000/svg';
    const size = 300 / GRID_N;
    for (let r = 0; r < GRID_N; r++) {
        for (let c = 0; c < GRID_N; c++) {
            const rect = document.createElementNS(NS, 'rect');
            rect.setAttribute('x', (c * size).toFixed(2));
            rect.setAttribute('y', (r * size).toFixed(2));
            rect.setAttribute('width', size.toFixed(2));
            rect.setAttribute('height', size.toFixed(2));
            rect.setAttribute('fill', matrixState.grid[r][c] ? '#1e293b' : '#ffffff');
            rect.setAttribute('stroke', '#e5e7eb');
            rect.setAttribute('stroke-width', '0.5');
            if (!MASK[r][c]) {
                rect.classList.add('matrix-module');
                rect.addEventListener('click', () => {
                    matrixState.grid[r][c] = matrixState.grid[r][c] ? 0 : 1;
                    renderMatrixSvg();
                });
            }
            svg.appendChild(rect);
        }
    }
}

function refreshMatrix() {
    const text = document.getElementById('matrixInput').value || 'A';
    const { grid, nibbleCount, byteLength } = encodeMatrixText(text);
    matrixState = { grid, nibbleCount, byteLength };
    renderMatrixSvg();
    document.getElementById('matrixResult').textContent = '';
}

function decodeMatrix() {
    const totalBits = matrixState.nibbleCount * 7;
    const bits = DATA_COORDS.slice(0, totalBits).map(([r, c]) => matrixState.grid[r][c]);
    let corrections = 0;
    const nibbles = [];
    for (let i = 0; i < matrixState.nibbleCount; i++) {
        const block = bits.slice(i * 7, i * 7 + 7);
        const { data, errPos } = decodeHamming74(block);
        if (errPos !== 0) corrections++;
        nibbles.push(data);
    }
    const bitStream = nibbles.flat().slice(0, matrixState.byteLength * 8);
    const bytes = [];
    for (let i = 0; i < bitStream.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) byte = (byte << 1) | (bitStream[i + j] || 0);
        bytes.push(byte);
    }
    let text;
    try {
        text = new TextDecoder().decode(new Uint8Array(bytes));
    } catch (e) {
        text = '(byte non validi)';
    }
    const el = document.getElementById('matrixResult');
    el.textContent = corrections === 0
        ? `✓ Decodificato senza errori: "${text}"`
        : `✓ Decodificato: "${text}" — ${corrections} blocco/i su ${matrixState.nibbleCount} avevano un errore, corretto automaticamente da Hamming(7,4).`;
}

// --- Cambio modalità e eventi -----------------------------------------

const HELP_TEXT = {
    barcode: [
        '• Ogni carattere diventa una sequenza fissa di 9 elementi (barre e spazi alternati), di cui esattamente 3 "larghi" e 6 "stretti" — qui generata algoritmicamente, non secondo uno standard reale come Code 39.',
        '• Un carattere di <strong>checksum</strong> (somma degli indici dei caratteri) viene aggiunto alla fine: se qualcosa non torna, il lettore sa che c\'è stato un errore.',
        '• Ma sapere che c\'è un errore non basta a saperlo correggere: un codice a barre 1D non ha ridondanza sufficiente per "indovinare" cosa c\'era prima del danno.'
    ],
    matrix: [
        '• I tre quadrati agli angoli sono <strong>pattern di ricerca</strong> semplificati, come nei veri QR code: aiutano a localizzare e orientare il codice.',
        '• I dati sono divisi in blocchi da 4 bit, ciascuno protetto con un vero <strong>codice di Hamming (7,4)</strong>: 3 bit di controllo aggiunti a ogni 4 bit di dati.',
        '• Danneggia un solo modulo dati per blocco e guarda la decodifica correggerlo da sola — è una vera correzione d\'errore, non solo rilevamento.'
    ]
};

function setMode(mode) {
    document.getElementById('barcodeMode').classList.toggle('hidden', mode !== 'barcode');
    document.getElementById('matrixMode').classList.toggle('hidden', mode !== 'matrix');
    document.getElementById('barcodeBtn').classList.toggle('active', mode === 'barcode');
    document.getElementById('matrixBtn').classList.toggle('active', mode === 'matrix');
    document.getElementById('helpList').innerHTML = HELP_TEXT[mode].map(li => `<li>${li}</li>`).join('');
}

document.getElementById('barcodeBtn').addEventListener('click', () => setMode('barcode'));
document.getElementById('matrixBtn').addEventListener('click', () => setMode('matrix'));

document.getElementById('barcodeInput').addEventListener('input', refreshBarcode);
document.getElementById('corruptBarBtn').addEventListener('click', corruptRandomBar);
document.getElementById('decodeBarBtn').addEventListener('click', decodeBarcode);
document.getElementById('resetBarBtn').addEventListener('click', refreshBarcode);

document.getElementById('matrixInput').addEventListener('input', refreshMatrix);
document.getElementById('decodeMatrixBtn').addEventListener('click', decodeMatrix);
document.getElementById('resetMatrixBtn').addEventListener('click', refreshMatrix);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché i QR code veri hanno "occhi" negli angoli? ▸'
        : 'Perché i QR code veri hanno "occhi" negli angoli? ▾';
});

// Inizializzazione
setMode('barcode');
refreshBarcode();
refreshMatrix();
