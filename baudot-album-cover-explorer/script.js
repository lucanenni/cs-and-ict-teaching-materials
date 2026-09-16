// Tavola ITA2 verificata (la stessa usata in baudot-code-explorer, dove
// se ne trova la nota completa sulle fonti consultate).
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

const CHAR_TO_ENTRY = {};
CODE_TABLE.forEach(entry => {
    if (entry.letterType === 'letter') CHAR_TO_ENTRY[entry.letters] = { code: entry.code, side: 'letters' };
    if (entry.figureType === 'letter') CHAR_TO_ENTRY[entry.figures] = { code: entry.code, side: 'figures' };
});
CHAR_TO_ENTRY[' '] = { code: SPACE_ENTRY.code, side: 'both' };

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

function decodeBlocks(blocks) {
    let shift = 'letters';
    let out = '';
    blocks.forEach(b => {
        const entry = CODE_TABLE.find(e => e.code === b.code);
        const side = shift;
        const type = side === 'letters' ? entry.letterType : entry.figureType;
        const label = side === 'letters' ? entry.letters : entry.figures;
        if (type === 'shift') {
            shift = label === 'LTRS' ? 'letters' : 'figures';
        } else if (type === 'space') {
            out += ' ';
        } else if (type === 'letter') {
            out += label;
        }
    });
    return out;
}

let state = { blocks: [] };

function render() {
    const text = document.getElementById('textInput').value;
    const { blocks, unsupported } = encodeText(text);
    state.blocks = blocks;

    const errorText = document.getElementById('errorText');
    if (unsupported.length > 0) {
        errorText.textContent = `Il codice Baudot non può rappresentare: ${unsupported.join(' ')} (accenti, minuscole distinte ed emoji non esistevano sui telescriventi).`;
        errorText.classList.remove('hidden');
    } else {
        errorText.classList.add('hidden');
    }

    const reveal = document.getElementById('revealToggle').checked;
    const box = document.getElementById('coverBox');
    box.innerHTML = '';
    blocks.forEach((b, i) => {
        const col = document.createElement('div');
        col.className = 'cover-column';
        const hue = (i * 47) % 360;
        // Il valore del codice (b.code) resta quello standard ITA2, letto
        // "bit1...bit5"; ma sulla copertina reale la colonna si legge
        // dall'alto verso il basso nell'ordine OPPOSTO (bit5 in cima) — lo
        // si nota confrontando fonti esterne sulla decodifica della
        // copertina, che riportano X come 10111 letto dall'alto anziché
        // 11101: i due sono lo stesso codice, letto in direzione opposta.
        [...b.code].reverse().forEach(bit => {
            const block = document.createElement('div');
            block.className = 'cover-block' + (bit === '1' ? ' on' : '');
            if (bit === '1') block.style.background = `hsl(${hue}, 70%, 55%)`;
            col.appendChild(block);
        });
        const label = document.createElement('div');
        label.className = 'cover-column-label';
        const readTopToBottom = [...b.code].reverse().join('');
        label.textContent = reveal ? `${b.char}\n${readTopToBottom}` : '';
        label.style.whiteSpace = 'pre-line';
        col.appendChild(label);
        box.appendChild(col);
    });

    const decoded = decodeBlocks(blocks);
    document.getElementById('decodedPanel').textContent = blocks.length > 0
        ? `Decodificato dal codice: "${decoded}"`
        : 'Scrivi qualcosa qui sopra per generare i blocchi.';
}

document.getElementById('textInput').addEventListener('input', render);
document.getElementById('revealToggle').addEventListener('change', render);
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.getElementById('textInput').value = chip.dataset.text;
        render();
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché proprio il codice Baudot, e non binario "normale"? ▸'
        : 'Perché proprio il codice Baudot, e non binario "normale"? ▾';
});

// Inizializzazione
render();
