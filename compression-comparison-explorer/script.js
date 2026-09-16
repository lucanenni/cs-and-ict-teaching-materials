// --- RLE (run-length encoding) ------------------------------------------
// Ogni token: carattere (8 bit) + lunghezza della sequenza (8 bit, fino a
// 255 ripetizioni) = 16 bit per token.
function rleCompress(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        let j = i;
        while (j < input.length && input[j] === input[i] && (j - i) < 255) j++;
        tokens.push({ char: input[i], count: j - i });
        i = j;
    }
    return tokens;
}
function rleBits(tokens) {
    return tokens.length * 16;
}
function rleDecompress(tokens) {
    return tokens.map(t => t.char.repeat(t.count)).join('');
}

// --- LZ77 -----------------------------------------------------------------
// Finestra scorrevole: cerca la sottostringa già vista più lunga che
// combacia con quella da comprimere, anche con sovrapposizione (utile per
// le ripetizioni di un solo carattere, come in RLE). Ogni token: 1 bit di
// tipo + (8 bit carattere, se letterale) oppure (5 bit distanza + 4 bit
// lunghezza, se riferimento) — con finestra a 32 e lunghezza massima 16.
const LZ_WINDOW = 32, LZ_MAX_LEN = 16, LZ_MIN_MATCH = 3;

function lz77Compress(input) {
    const tokens = [];
    let pos = 0;
    while (pos < input.length) {
        let bestLen = 0, bestDist = 0;
        const searchStart = Math.max(0, pos - LZ_WINDOW);
        for (let start = searchStart; start < pos; start++) {
            let len = 0;
            while (len < LZ_MAX_LEN && pos + len < input.length && input[start + len] === input[pos + len]) len++;
            if (len > bestLen) { bestLen = len; bestDist = pos - start; }
        }
        if (bestLen >= LZ_MIN_MATCH) {
            tokens.push({ type: 'match', dist: bestDist, len: bestLen });
            pos += bestLen;
        } else {
            tokens.push({ type: 'literal', char: input[pos] });
            pos += 1;
        }
    }
    return tokens;
}
function lz77Bits(tokens) {
    return tokens.reduce((sum, t) => sum + (t.type === 'literal' ? 9 : 10), 0);
}
function lz77Decompress(tokens) {
    let output = '';
    tokens.forEach(t => {
        if (t.type === 'literal') output += t.char;
        else {
            const start = output.length - t.dist;
            for (let i = 0; i < t.len; i++) output += output[start + i];
        }
    });
    return output;
}

// --- Huffman (versione compatta, stessa logica verificata in
// huffman-coding-explorer) --------------------------------------------
function huffmanCodes(text) {
    const freq = {};
    for (const ch of text) freq[ch] = (freq[ch] || 0) + 1;
    let nodes = Object.entries(freq).map(([ch, f], i) => ({ id: i, char: ch, freq: f, left: null, right: null }));
    let idc = nodes.length;
    if (nodes.length === 1) {
        return { codes: { [nodes[0].char]: '0' }, freq };
    }
    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq || a.id - b.id);
        const a = nodes.shift(), b = nodes.shift();
        nodes.push({ id: idc++, char: null, freq: a.freq + b.freq, left: a, right: b });
    }
    const codes = {};
    (function walk(node, path) {
        if (node.char !== null) { codes[node.char] = path || '0'; return; }
        walk(node.left, path + '0');
        walk(node.right, path + '1');
    })(nodes[0], '');
    return { codes, freq };
}
function huffmanBits(text) {
    if (text.length === 0) return 0;
    const { codes } = huffmanCodes(text);
    return [...text].reduce((sum, ch) => sum + codes[ch].length, 0);
}

// --- Interfaccia -----------------------------------------------------------

function renderTokenList(id, tokens, kind) {
    const box = document.getElementById(id);
    box.innerHTML = tokens.map(t => {
        if (kind === 'rle') return `<span class="token-chip run">${t.char}×${t.count}</span>`;
        if (kind === 'lz77') return t.type === 'literal'
            ? `<span class="token-chip">${t.char}</span>`
            : `<span class="token-chip match">↩${t.dist},${t.len}</span>`;
        return '';
    }).join('');
}

function render() {
    const text = document.getElementById('textInput').value;
    const baselineBits = text.length * 8;

    const rleTokens = rleCompress(text);
    const rleTotal = rleBits(rleTokens);
    const rleOk = rleDecompress(rleTokens) === text;

    const lzTokens = lz77Compress(text);
    const lzTotal = lz77Bits(lzTokens);
    const lzOk = lz77Decompress(lzTokens) === text;

    const huffTotal = huffmanBits(text);

    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = `
        <div class="result-box">
            <div class="result-title">RLE</div>
            <div class="token-list" id="rleTokens"></div>
            <div class="result-size">${rleTotal} bit (${rleTokens.length} token)</div>
            <div class="result-note">${rleOk ? '✓ decompressione verificata' : '⚠ errore di decompressione'}</div>
        </div>
        <div class="result-box">
            <div class="result-title">LZ77</div>
            <div class="token-list" id="lzTokens"></div>
            <div class="result-size">${lzTotal} bit (${lzTokens.length} token)</div>
            <div class="result-note">${lzOk ? '✓ decompressione verificata' : '⚠ errore di decompressione'}</div>
        </div>
        <div class="result-box">
            <div class="result-title">Huffman</div>
            <div class="result-size">${huffTotal} bit</div>
            <div class="result-note">codici a lunghezza variabile per carattere (vedi huffman-coding-explorer per il dettaglio passo-passo)</div>
        </div>
    `;
    renderTokenList('rleTokens', rleTokens, 'rle');
    renderTokenList('lzTokens', lzTokens, 'lz77');

    const rows = [
        ['Originale (8 bit/carattere)', baselineBits],
        ['RLE', rleTotal],
        ['LZ77', lzTotal],
        ['Huffman', huffTotal]
    ];
    const minBits = Math.min(...rows.slice(1).map(r => r[1]));
    const maxBits = Math.max(...rows.map(r => r[1]));
    document.getElementById('summaryTable').innerHTML =
        '<tr><th>Metodo</th><th>Bit totali</th><th>Rispetto all\'originale</th></tr>' +
        rows.map(([label, bits]) => {
            const pct = baselineBits > 0 ? Math.round((bits / baselineBits) * 100) : 100;
            const cls = label !== rows[0][0] && bits === minBits ? ' class="best"' : (bits === maxBits && label !== rows[0][0] ? ' class="worst"' : '');
            return `<tr><td>${label}</td><td${cls}>${bits}</td><td>${pct}%</td></tr>`;
        }).join('');
}

document.getElementById('textInput').addEventListener('input', render);
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
        ? 'Perché non si può sempre battere lo spazio originale? ▸'
        : 'Perché non si può sempre battere lo spazio originale? ▾';
});

// Inizializzazione
render();
