// --- Codifica di segnale: NRZ vs Manchester --------------------------------
//
// Nessun "Avvia"/"Passo singolo" qui: il disegno delle due forme d'onda è
// istantaneo (ricalcolato per intero ogni volta che la sequenza cambia),
// perché per un contenuto puramente visivo come questo un redraw diretto è
// più chiaro di un'animazione bit per bit (scelta documentata nel README).

function validateBits(str, minLen, maxLen) {
    const cleaned = (str || '').replace(/\s+/g, '');
    if (!/^[01]+$/.test(cleaned)) return null;
    if (cleaned.length < minLen || cleaned.length > maxLen) return null;
    return cleaned;
}

function nrzTransitions(bits) {
    let count = 0;
    for (let i = 1; i < bits.length; i++) {
        if (bits[i] !== bits[i - 1]) count++;
    }
    return count;
}

// Convenzione fissa: bit 1 -> prima metà ALTA poi BASSA (transizione H->L a metà bit)
//                     bit 0 -> prima metà BASSA poi ALTA (transizione L->H a metà bit)
function manchesterLevels(bits) {
    const levels = [];
    for (const b of bits) {
        if (b === '1') levels.push(1, 0);
        else levels.push(0, 1);
    }
    return levels;
}

function manchesterTransitions(bits) {
    const levels = manchesterLevels(bits);
    let count = 0;
    for (let i = 1; i < levels.length; i++) {
        if (levels[i] !== levels[i - 1]) count++;
    }
    return count;
}

function longestRun(bits) {
    let bestStart = 0, bestLen = 1, curStart = 0, curLen = 1;
    for (let i = 1; i < bits.length; i++) {
        if (bits[i] === bits[i - 1]) {
            curLen++;
        } else {
            curStart = i;
            curLen = 1;
        }
        if (curLen > bestLen) {
            bestLen = curLen;
            bestStart = curStart;
        }
    }
    return { start: bestStart, end: bestStart + bestLen - 1, length: bestLen, value: bits[bestStart] };
}

function pseudoRandomBits(seed, length) {
    let h = seed >>> 0;
    let out = '';
    for (let i = 0; i < length; i++) {
        h = (h * 1103515245 + 12345) & 0x7fffffff; // LCG classico, 31 bit positivi
        out += ((h >> 16) & 1) ? '1' : '0';
    }
    return out;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateBits, nrzTransitions, manchesterLevels, manchesterTransitions, longestRun, pseudoRandomBits };
}

if (typeof document !== 'undefined') {

    const MIN_LEN = 12;
    const MAX_LEN = 16;
    const BIT_WIDTH = 32; // px per intervallo di un bit
    const HEIGHT = 70;
    const Y_HIGH = 15;
    const Y_LOW = 55;
    let randomSeed = 99;

    function buildSamples(bits, encoding) {
        const samples = [];
        if (encoding === 'nrz') {
            for (let i = 0; i < bits.length; i++) {
                samples.push({ start: i, end: i + 1, level: bits[i] === '1' ? 1 : 0 });
            }
        } else {
            for (let i = 0; i < bits.length; i++) {
                const b = bits[i];
                if (b === '1') {
                    samples.push({ start: i, end: i + 0.5, level: 1 });
                    samples.push({ start: i + 0.5, end: i + 1, level: 0 });
                } else {
                    samples.push({ start: i, end: i + 0.5, level: 0 });
                    samples.push({ start: i + 0.5, end: i + 1, level: 1 });
                }
            }
        }
        return samples;
    }

    function pathFromSamples(samples) {
        let d = '';
        let prevY = null;
        samples.forEach((s, idx) => {
            const x0 = s.start * BIT_WIDTH;
            const x1 = s.end * BIT_WIDTH;
            const y = s.level ? Y_HIGH : Y_LOW;
            if (idx === 0) {
                d += `M ${x0} ${y} L ${x1} ${y}`;
            } else {
                d += ` L ${x0} ${prevY} L ${x0} ${y} L ${x1} ${y}`;
            }
            prevY = y;
        });
        return d;
    }

    function renderWaveform(svgId, bits, encoding, highlight) {
        const svg = document.getElementById(svgId);
        const width = bits.length * BIT_WIDTH + 10;
        svg.setAttribute('width', width);
        svg.setAttribute('height', HEIGHT + 20);
        svg.setAttribute('viewBox', `0 0 ${width} ${HEIGHT + 20}`);
        svg.innerHTML = '';

        // griglia verticale ai confini dei bit + etichette
        for (let i = 0; i <= bits.length; i++) {
            const x = i * BIT_WIDTH + 5;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x); line.setAttribute('x2', x);
            line.setAttribute('y1', 5); line.setAttribute('y2', HEIGHT + 5);
            line.setAttribute('class', 'wave-grid');
            svg.appendChild(line);
            if (i < bits.length) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + BIT_WIDTH / 2);
                text.setAttribute('y', HEIGHT + 18);
                text.setAttribute('class', 'wave-bitlabel');
                text.textContent = bits[i];
                svg.appendChild(text);
            }
        }

        if (highlight) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', highlight.start * BIT_WIDTH + 5);
            rect.setAttribute('y', 5);
            rect.setAttribute('width', (highlight.end - highlight.start + 1) * BIT_WIDTH);
            rect.setAttribute('height', HEIGHT);
            rect.setAttribute('class', 'wave-highlight');
            svg.appendChild(rect);
        }

        const samples = buildSamples(bits, encoding);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathFromSamples(samples));
        path.setAttribute('transform', 'translate(5,5)');
        path.setAttribute('class', 'wave-line ' + encoding);
        svg.appendChild(path);
    }

    function render(bits) {
        document.getElementById('seqDisplay').textContent = 'Sequenza: ' + bits.match(/.{1,4}/g).join(' ');

        const run = longestRun(bits);
        renderWaveform('nrzSvg', bits, 'nrz', run.length >= 4 ? run : null);
        renderWaveform('manchesterSvg', bits, 'manchester', null);

        const nrzT = nrzTransitions(bits);
        const manT = manchesterTransitions(bits);
        document.getElementById('nrzCount').textContent = nrzT;
        document.getElementById('manchesterCount').textContent = manT;

        const warning = document.getElementById('flatWarning');
        if (run.length >= 4) {
            warning.classList.remove('hidden');
            warning.innerHTML = `Dal bit ${run.start + 1} al bit ${run.end + 1} ci sono <strong>${run.length} bit "${run.value}" consecutivi</strong>: in NRZ il segnale resta piatto per tutto questo tratto (zona evidenziata sopra), senza nessuna transizione. Senza un clock condiviso, il destinatario rischia di "perdere il conto" di quanti bit sono passati.`;
        } else {
            warning.classList.add('hidden');
        }
    }

    function applyBits(raw) {
        const errorEl = document.getElementById('inputError');
        const cleaned = validateBits(raw, MIN_LEN, MAX_LEN);
        if (!cleaned) {
            errorEl.textContent = `Inserisci solo cifre 0 e 1, tra ${MIN_LEN} e ${MAX_LEN} bit.`;
            return;
        }
        errorEl.textContent = '';
        document.getElementById('bitsInput').value = cleaned;
        render(cleaned);
    }

    document.getElementById('applyBtn').addEventListener('click', () => {
        applyBits(document.getElementById('bitsInput').value);
    });

    document.getElementById('flatExampleBtn').addEventListener('click', () => {
        applyBits('11110000011111');
    });

    document.getElementById('randomBtn').addEventListener('click', () => {
        randomSeed += 7;
        applyBits(pseudoRandomBits(randomSeed, 14));
    });

    document.getElementById('deepDiveBtn').addEventListener('click', () => {
        const panel = document.getElementById('deepDivePanel');
        const isHidden = panel.classList.toggle('hidden');
        const btn = document.getElementById('deepDiveBtn');
        btn.setAttribute('aria-expanded', String(!isHidden));
        btn.textContent = isHidden
            ? 'Non basterebbe un orologio preciso su entrambi i lati? ▸'
            : 'Non basterebbe un orologio preciso su entrambi i lati? ▾';
    });

    // Render iniziale con la sequenza già presente nell'input.
    applyBits(document.getElementById('bitsInput').value);
}
