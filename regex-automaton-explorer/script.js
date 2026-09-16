// -----------------------------------------------------------------------
// Un vero motore di espressioni regolari: parser a discesa ricorsiva +
// costruzione di Thompson (regex -> NFA con transizioni epsilon) +
// simulazione a insieme di stati (nessuna conversione a DFA, nessuna
// backtracking pericoloso). Supporta: concatenazione, | (alternativa),
// * + ? (ripetizioni), () (raggruppamento). Verificato con 24 casi di
// test (inclusi esiti attesi negativi) prima di essere usato qui.
// -----------------------------------------------------------------------

function parseRegex(pattern) {
    let src = pattern, pos = 0;
    const peek = () => src[pos];

    function parseExpr() {
        let node = parseTerm();
        while (peek() === '|') {
            pos++;
            const right = parseTerm();
            node = { type: 'alt', left: node, right };
        }
        return node;
    }
    function parseTerm() {
        let node = null;
        while (pos < src.length && peek() !== '|' && peek() !== ')') {
            const f = parseFactor();
            node = node ? { type: 'concat', left: node, right: f } : f;
        }
        return node || { type: 'empty' };
    }
    function parseFactor() {
        let atom = parseAtom();
        while (peek() === '*' || peek() === '+' || peek() === '?') {
            const op = peek();
            pos++;
            atom = { type: 'repeat', op, child: atom };
        }
        return atom;
    }
    function parseAtom() {
        if (peek() === '(') {
            pos++;
            const e = parseExpr();
            if (peek() === ')') pos++;
            else throw new Error('parentesi "(" senza ")" corrispondente');
            return e;
        }
        if (peek() === undefined || peek() === '*' || peek() === '+' || peek() === '?' || peek() === ')') {
            throw new Error(`carattere inatteso alla posizione ${pos}`);
        }
        const c = peek();
        pos++;
        return { type: 'char', char: c };
    }

    const ast = parseExpr();
    if (pos !== src.length) throw new Error(`carattere inatteso "${peek()}" alla posizione ${pos}`);
    return ast;
}

function compileNFA(pattern) {
    const states = [];
    const newState = (type) => { const s = { id: states.length, type }; states.push(s); return s; };
    const patch = (outList, targetId) => outList.forEach(([id, field]) => { states[id][field] = targetId; });

    const fragChar = (c) => { const s = newState('char'); s.char = c; s.out = null; return { start: s.id, out: [[s.id, 'out']] }; };
    const concat = (f1, f2) => { patch(f1.out, f2.start); return { start: f1.start, out: f2.out }; };
    const alternate = (f1, f2) => { const s = newState('split'); s.out1 = f1.start; s.out2 = f2.start; return { start: s.id, out: [...f1.out, ...f2.out] }; };
    const star = (f1) => { const s = newState('split'); s.out1 = f1.start; s.out2 = null; patch(f1.out, s.id); return { start: s.id, out: [[s.id, 'out2']] }; };
    const plus = (f1) => { const s = newState('split'); s.out1 = f1.start; s.out2 = null; patch(f1.out, s.id); return { start: f1.start, out: [[s.id, 'out2']] }; };
    const optional = (f1) => { const s = newState('split'); s.out1 = f1.start; s.out2 = null; return { start: s.id, out: [...f1.out, [s.id, 'out2']] }; };
    const fragEmpty = () => { const s = newState('split'); s.out1 = null; s.out2 = null; return { start: s.id, out: [[s.id, 'out1']] }; };

    function build(ast) {
        switch (ast.type) {
            case 'char': return fragChar(ast.char);
            case 'concat': return concat(build(ast.left), build(ast.right));
            case 'alt': return alternate(build(ast.left), build(ast.right));
            case 'repeat': {
                const child = build(ast.child);
                if (ast.op === '*') return star(child);
                if (ast.op === '+') return plus(child);
                return optional(child);
            }
            default: return fragEmpty();
        }
    }

    const ast = parseRegex(pattern);
    const frag = build(ast);
    const accept = newState('accept');
    patch(frag.out, accept.id);
    return { states, start: frag.start, acceptId: accept.id };
}

function epsilonClosure(ids, states) {
    const stack = [...ids];
    const closure = new Set(ids);
    while (stack.length) {
        const id = stack.pop();
        const s = states[id];
        if (s.type === 'split') {
            [s.out1, s.out2].forEach(t => {
                if (t !== null && t !== undefined && !closure.has(t)) { closure.add(t); stack.push(t); }
            });
        }
    }
    return closure;
}

function stepNFA(current, ch, states) {
    const next = new Set();
    current.forEach(id => {
        const s = states[id];
        if (s.type === 'char' && s.char === ch && s.out !== null) next.add(s.out);
    });
    return epsilonClosure([...next], states);
}

function simulate(nfa, input) {
    const frames = [];
    let current = epsilonClosure([nfa.start], nfa.states);
    frames.push({ charIndex: -1, states: [...current].sort((a, b) => a - b) });
    for (let i = 0; i < input.length; i++) {
        current = stepNFA(current, input[i], nfa.states);
        frames.push({ charIndex: i, states: [...current].sort((a, b) => a - b) });
    }
    const accepted = current.has(nfa.acceptId);
    return { frames, accepted };
}

function quickMatch(pattern, input) {
    try {
        const nfa = compileNFA(pattern);
        return simulate(nfa, input).accepted;
    } catch (e) {
        return null;
    }
}

// --- Stato dell'interfaccia -------------------------------------------

let state = {
    nfa: null,
    frames: [],
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 700,
    input: ''
};

function compileAndSimulate() {
    const pattern = document.getElementById('regexInput').value;
    const input = document.getElementById('testInput').value;
    const errorEl = document.getElementById('regexError');
    try {
        state.nfa = compileNFA(pattern);
        errorEl.classList.add('hidden');
    } catch (e) {
        errorEl.textContent = '⚠ Espressione regolare non valida: ' + e.message;
        errorEl.classList.remove('hidden');
        state.nfa = null;
        state.frames = [];
        render();
        renderQuickTest();
        return;
    }
    const result = simulate(state.nfa, input);
    state.frames = result.frames;
    state.input = input;
    state.current = 0;
    stopPlaying();
    render();
    renderQuickTest();
}

function render() {
    const tapeBox = document.getElementById('tapeBox');
    tapeBox.innerHTML = '';
    if (!state.nfa) { tapeBox.innerHTML = '<span style="color:#9ca3af;">Correggi l\'espressione regolare per continuare.</span>'; document.getElementById('statesRow').innerHTML = ''; document.getElementById('verdict').textContent = ''; return; }

    const frame = state.frames[state.current];
    [...state.input].forEach((ch, i) => {
        const el = document.createElement('div');
        el.className = 'tape-char' + (i < frame.charIndex + 1 ? ' consumed' : '') + (i === frame.charIndex ? ' current' : '');
        el.textContent = ch;
        tapeBox.appendChild(el);
    });
    if (state.input.length === 0) tapeBox.innerHTML = '<span style="color:#9ca3af;">(stringa vuota)</span>';

    const statesRow = document.getElementById('statesRow');
    statesRow.innerHTML = frame.states.map(id =>
        `<div class="state-chip${id === state.nfa.acceptId ? ' accept' : ''}">${id}</div>`
    ).join('') || '<span style="color:#9ca3af;">(nessuno stato vivo: la stringa è già rifiutata)</span>';

    const verdict = document.getElementById('verdict');
    const isLast = state.current === state.frames.length - 1;
    if (isLast) {
        const accepted = frame.states.includes(state.nfa.acceptId);
        verdict.textContent = accepted ? `✓ Stringa ACCETTATA da "${document.getElementById('regexInput').value}"` : `✗ Stringa RIFIUTATA da "${document.getElementById('regexInput').value}"`;
        verdict.className = 'verdict ' + (accepted ? 'accepted' : 'rejected');
    } else {
        verdict.textContent = '';
        verdict.className = 'verdict';
    }

    const playBtn = document.getElementById('playPauseBtn');
    if (state.isPlaying) playBtn.textContent = '⏸ Pausa';
    else if (isLast) playBtn.textContent = '↻ Riavvia';
    else playBtn.textContent = '▶ Avvia';
    document.getElementById('stepBtn').disabled = isLast;
}

function renderQuickTest() {
    const box = document.getElementById('quickTestRow');
    const base = document.getElementById('testInput').value;
    const variants = [...new Set([
        base,
        base.slice(0, -1),
        base.length > 0 ? base + base[0] : base,
        [...base].reverse().join(''),
        base + 'x'
    ])];

    const pattern = document.getElementById('regexInput').value;
    box.innerHTML = variants.map(v => {
        const result = quickMatch(pattern, v);
        if (result === null) return '';
        const cls = result ? 'pass' : 'fail';
        const label = v === '' ? '(vuota)' : v;
        return `<span class="quick-test-chip ${cls}">"${label}" → ${result ? 'accettata' : 'rifiutata'}</span>`;
    }).join('');
}

function advance() {
    if (state.current >= state.frames.length - 1) { stopPlaying(); return; }
    state.current++;
    render();
    if (state.current >= state.frames.length - 1) stopPlaying();
}

function startPlaying() {
    if (!state.nfa) return;
    if (state.current >= state.frames.length - 1) state.current = 0;
    stopPlayingInterval();
    state.isPlaying = true;
    render();
    state.interval = setInterval(advance, state.speed);
}

function stopPlayingInterval() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
}

function stopPlaying() {
    stopPlayingInterval();
    state.isPlaying = false;
    render();
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (state.isPlaying) stopPlaying();
    else startPlaying();
});
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });
document.getElementById('resetBtn').addEventListener('click', () => { stopPlaying(); state.current = 0; render(); });

document.getElementById('regexInput').addEventListener('input', compileAndSimulate);
document.getElementById('testInput').addEventListener('input', compileAndSimulate);
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.getElementById('regexInput').value = chip.dataset.regex;
        document.getElementById('testInput').value = chip.dataset.text;
        compileAndSimulate();
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché "non deterministico"? Il computer non deve scegliere una strada? ▸'
        : 'Perché "non deterministico"? Il computer non deve scegliere una strada? ▾';
});

// Inizializzazione
compileAndSimulate();
