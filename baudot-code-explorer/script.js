// -----------------------------------------------------------------------
// Tavola del codice ITA2 (la revisione standard del codice Baudot,
// usata dai telescriventi del '900). Verificata contro più fonti di
// riferimento; le lettere e le cifre coincidono ovunque, mentre alcuni
// simboli di punteggiatura nella colonna "Cifre" variavano storicamente
// da un paese/costruttore all'altro — qui si usa una delle varianti più
// comuni.
//
// letterType/figureType: 'letter' (carattere normale), 'space' (spazio,
// identico in entrambi gli stati), 'control' (LF/CR/NULL/BEL, non
// digitabile), 'shift' (LTRS/FIGS, cambia stato invece di rappresentare
// un carattere).
// -----------------------------------------------------------------------
const CODE_TABLE = [
    { code: '00000', letters: 'NULL', figures: 'NULL', letterType: 'control', figureType: 'control' },
    { code: '00001', letters: 'E', figures: '3', letterType: 'letter', figureType: 'letter' },
    { code: '00010', letters: 'LF', figures: 'LF', letterType: 'control', figureType: 'control' },
    { code: '00011', letters: 'A', figures: '-', letterType: 'letter', figureType: 'letter' },
    { code: '00100', letters: 'SPAZIO', figures: 'SPAZIO', letterType: 'space', figureType: 'space' },
    { code: '00101', letters: 'S', figures: 'BEL', letterType: 'letter', figureType: 'control' },
    { code: '00110', letters: 'I', figures: '8', letterType: 'letter', figureType: 'letter' },
    { code: '00111', letters: 'U', figures: '7', letterType: 'letter', figureType: 'letter' },
    { code: '01000', letters: 'CR', figures: 'CR', letterType: 'control', figureType: 'control' },
    { code: '01001', letters: 'D', figures: '$', letterType: 'letter', figureType: 'letter' },
    { code: '01010', letters: 'R', figures: '4', letterType: 'letter', figureType: 'letter' },
    { code: '01011', letters: 'J', figures: "'", letterType: 'letter', figureType: 'letter' },
    { code: '01100', letters: 'N', figures: ',', letterType: 'letter', figureType: 'letter' },
    { code: '01101', letters: 'F', figures: '!', letterType: 'letter', figureType: 'letter' },
    { code: '01110', letters: 'C', figures: ':', letterType: 'letter', figureType: 'letter' },
    { code: '01111', letters: 'K', figures: '(', letterType: 'letter', figureType: 'letter' },
    { code: '10000', letters: 'T', figures: '5', letterType: 'letter', figureType: 'letter' },
    { code: '10001', letters: 'Z', figures: '"', letterType: 'letter', figureType: 'letter' },
    { code: '10010', letters: 'L', figures: ')', letterType: 'letter', figureType: 'letter' },
    { code: '10011', letters: 'W', figures: '2', letterType: 'letter', figureType: 'letter' },
    { code: '10100', letters: 'H', figures: '#', letterType: 'letter', figureType: 'letter' },
    { code: '10101', letters: 'Y', figures: '6', letterType: 'letter', figureType: 'letter' },
    { code: '10110', letters: 'P', figures: '0', letterType: 'letter', figureType: 'letter' },
    { code: '10111', letters: 'Q', figures: '1', letterType: 'letter', figureType: 'letter' },
    { code: '11000', letters: 'O', figures: '9', letterType: 'letter', figureType: 'letter' },
    { code: '11001', letters: 'B', figures: '?', letterType: 'letter', figureType: 'letter' },
    { code: '11010', letters: 'G', figures: '&', letterType: 'letter', figureType: 'letter' },
    { code: '11011', letters: 'FIGS', figures: 'FIGS', letterType: 'shift', figureType: 'shift' },
    { code: '11100', letters: 'M', figures: '.', letterType: 'letter', figureType: 'letter' },
    { code: '11101', letters: 'X', figures: '/', letterType: 'letter', figureType: 'letter' },
    { code: '11110', letters: 'V', figures: ';', letterType: 'letter', figureType: 'letter' },
    { code: '11111', letters: 'LTRS', figures: 'LTRS', letterType: 'shift', figureType: 'shift' }
];

const SPACE_ENTRY = CODE_TABLE.find(e => e.letterType === 'space');
const LTRS_ENTRY = CODE_TABLE.find(e => e.letterType === 'shift' && e.letters === 'LTRS');
const FIGS_ENTRY = CODE_TABLE.find(e => e.letterType === 'shift' && e.letters === 'FIGS');

// Mappa carattere -> { code, side } per la codifica del testo.
const CHAR_TO_ENTRY = {};
CODE_TABLE.forEach(entry => {
    if (entry.letterType === 'letter') CHAR_TO_ENTRY[entry.letters] = { code: entry.code, side: 'letters' };
    if (entry.figureType === 'letter') CHAR_TO_ENTRY[entry.figures] = { code: entry.code, side: 'figures' };
});
CHAR_TO_ENTRY[' '] = { code: SPACE_ENTRY.code, side: 'both' };

const HELP_TEXT = {
    table: [
        '• Ogni codice Baudot usa solo <strong>5 bit</strong>: 2⁵ = 32 combinazioni possibili in tutto.',
        '• Per avere sia lettere che cifre/punteggiatura, lo stesso identico codice ha <strong>due significati diversi</strong> a seconda dello stato attuale: Lettere (LTRS) o Cifre (FIGS).',
        '• I codici 11111 e 11011 non rappresentano un carattere da stampare: dicono al ricevitore "cambia stato da ora in poi" — un po\' come il tasto Maiusc di una tastiera, ma permanente finché non arriva l\'altro codice.'
    ],
    encode: [
        '• Scrivendo un testo, la pagina inserisce automaticamente un codice LTRS o FIGS ogni volta che serve cambiare stato — ma solo quando serve davvero.',
        '• Spazio e alcuni codici di controllo sono identici in entrambi gli stati, quindi non fanno mai scattare un cambio.',
        '• Più il testo alterna lettere e cifre, più cambi di stato (e quindi più bit) servono: guarda il confronto qui sotto.'
    ]
};

let state = {
    mode: 'table',
    bits: [0, 0, 0, 0, 1], // E di default
    shift: 'letters'
};

function bitsToCode(bits) {
    return bits.join('');
}

function findEntry(code) {
    return CODE_TABLE.find(e => e.code === code);
}

function renderBits() {
    const box = document.getElementById('bitsBox');
    box.innerHTML = '';
    state.bits.forEach((bit, i) => {
        const col = document.createElement('div');
        col.className = 'bit-col';
        const place = document.createElement('div');
        place.className = 'bit-place';
        place.textContent = 'bit ' + (i + 1);
        const btn = document.createElement('button');
        btn.className = 'bit-toggle' + (bit ? ' on' : '');
        btn.textContent = bit;
        btn.addEventListener('click', () => {
            state.bits[i] = state.bits[i] ? 0 : 1;
            renderBits();
            renderTableMode();
        });
        col.appendChild(place);
        col.appendChild(btn);
        box.appendChild(col);
    });
}

function describeEntry(entry, side) {
    const label = side === 'letters' ? entry.letters : entry.figures;
    const type = side === 'letters' ? entry.letterType : entry.figureType;
    if (type === 'shift') {
        const target = label === 'LTRS' ? 'Lettere' : 'Cifre';
        return { char: label, desc: `Non è un carattere: dice al ricevitore di passare allo stato "${target}".` };
    }
    if (type === 'control') {
        const names = { NULL: 'nessun carattere (riempimento/inattività)', LF: 'avanzamento riga', CR: 'ritorno a capo', BEL: 'campanello (avviso sonoro)' };
        return { char: label, desc: names[label] || 'carattere di controllo, non stampabile.' };
    }
    if (type === 'space') {
        return { char: '␣', desc: 'Spazio — identico in entrambi gli stati, non richiede mai un cambio.' };
    }
    return { char: label, desc: side === 'letters' ? 'Lettera.' : 'Cifra o simbolo di punteggiatura.' };
}

function renderTableMode() {
    const code = bitsToCode(state.bits);
    const entry = findEntry(code);
    const { char, desc } = describeEntry(entry, state.shift);

    document.getElementById('resultBox').innerHTML = `
        <div class="result-char">${char}</div>
        <div class="result-desc">${desc}</div>
    `;

    const tbody = document.getElementById('codeTableBody');
    tbody.innerHTML = '';
    CODE_TABLE.forEach(e => {
        const tr = document.createElement('tr');
        if (e.code === code) tr.classList.add('highlighted');
        else if (e.letterType === 'shift') tr.classList.add('shift-row');
        else if (e.letterType === 'control') tr.classList.add('control-row');
        tr.innerHTML = `<td>${e.code}</td><td>${e.letters}</td><td>${e.figures}</td>`;
        tbody.appendChild(tr);
    });
}

function encodeText(text) {
    const upper = text.toUpperCase();
    const blocks = [];
    const unsupported = [];
    let shift = 'letters';

    for (const ch of upper) {
        const found = CHAR_TO_ENTRY[ch];
        if (!found) {
            if (ch.trim() !== '') unsupported.push(ch);
            continue;
        }
        if (found.side === 'both') {
            blocks.push({ code: found.code, char: '␣', isShift: false });
            continue;
        }
        if (found.side !== shift) {
            const shiftEntry = found.side === 'letters' ? LTRS_ENTRY : FIGS_ENTRY;
            blocks.push({ code: shiftEntry.code, char: found.side === 'letters' ? 'LTRS' : 'FIGS', isShift: true });
            shift = found.side;
        }
        blocks.push({ code: found.code, char: ch, isShift: false });
    }

    return { blocks, unsupported: [...new Set(unsupported)] };
}

function renderEncodeMode() {
    const text = document.getElementById('textInput').value;
    const { blocks, unsupported } = encodeText(text);

    const errorText = document.getElementById('errorText');
    if (unsupported.length > 0) {
        errorText.textContent = `Il codice Baudot non può rappresentare: ${unsupported.join(' ')} — lettere accentate, punteggiatura non prevista ed emoji non esistevano sui telescriventi dell'epoca (e non distinguevano maiuscole/minuscole: il testo viene convertito tutto in maiuscolo).`;
        errorText.classList.remove('hidden');
    } else {
        errorText.classList.add('hidden');
    }

    const blocksBox = document.getElementById('blocksBox');
    blocksBox.innerHTML = '';
    blocks.forEach(b => {
        const div = document.createElement('div');
        div.className = 'code-block' + (b.isShift ? ' shift-block' : '');
        div.innerHTML = `<span class="block-char">${b.char}</span><span class="block-bits">${b.code}</span>`;
        blocksBox.appendChild(div);
    });

    const charBlocks = blocks.filter(b => !b.isShift).length;
    const shiftBlocks = blocks.filter(b => b.isShift).length;
    const totalBlocks = blocks.length;

    if (totalBlocks === 0) {
        document.getElementById('totalsPanel').innerHTML = 'Scrivi qualcosa per vedere la codifica.';
        return;
    }

    const totalBits = totalBlocks * 5;
    const withoutShiftsBits = charBlocks * 5;
    const asciiBits = charBlocks * 7;
    let note = '';
    if (shiftBlocks > 0) {
        const extraPercent = Math.round((shiftBlocks / charBlocks) * 100);
        note = `Senza mai alternare tra lettere e cifre sarebbero bastati ${charBlocks} blocchi (${withoutShiftsBits} bit): alternare le due modalità costa ${shiftBlocks * 5} bit in più, circa il ${extraPercent}% in più. In ASCII (7 bit fissi a carattere, nessun cambio modalità) lo stesso testo occuperebbe ${asciiBits} bit.`;
    } else {
        note = `Questo testo non alterna mai lettere e cifre, quindi non serve nessun cambio di modalità. In ASCII (7 bit fissi a carattere) occuperebbe ${asciiBits} bit — qui ne bastano ${totalBits}.`;
    }

    document.getElementById('totalsPanel').innerHTML =
        `${charBlocks} caratteri → ${totalBlocks} blocchi da 5 bit (${shiftBlocks} cambi di modalità) = ${totalBits} bit totali` +
        `<span class="totals-note">${note}</span>`;
}

function setMode(mode) {
    state.mode = mode;
    document.getElementById('tableModeBtn').classList.toggle('active', mode === 'table');
    document.getElementById('encodeModeBtn').classList.toggle('active', mode === 'encode');
    document.getElementById('tableMode').classList.toggle('hidden', mode !== 'table');
    document.getElementById('encodeMode').classList.toggle('hidden', mode !== 'encode');
    document.getElementById('helpList').innerHTML = HELP_TEXT[mode].map(li => `<li>${li}</li>`).join('');
    if (mode === 'table') renderTableMode();
    else renderEncodeMode();
}

document.getElementById('tableModeBtn').addEventListener('click', () => setMode('table'));
document.getElementById('encodeModeBtn').addEventListener('click', () => setMode('encode'));

document.getElementById('shiftToggle').addEventListener('click', (e) => {
    const btn = e.target.closest('.shift-btn');
    if (!btn) return;
    state.shift = btn.dataset.shift;
    document.querySelectorAll('.shift-btn').forEach(b => b.classList.toggle('active', b === btn));
    renderTableMode();
});

document.getElementById('textInput').addEventListener('input', renderEncodeMode);

document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.getElementById('textInput').value = chip.dataset.text;
        renderEncodeMode();
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non bastano 5 bit per lettere E cifre insieme? ▸'
        : 'Perché non bastano 5 bit per lettere E cifre insieme? ▾';
});

// Inizializzazione
renderBits();
setMode('table');
