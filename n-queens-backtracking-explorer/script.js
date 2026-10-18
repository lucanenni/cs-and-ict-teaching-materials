// -----------------------------------------------------------------------
// Logica pura del backtracking per il problema delle N regine (nessun
// riferimento al DOM). Si procede riga per riga: per la riga corrente si
// prova la prima colonna libera (non attaccata da nessuna regina già
// piazzata nelle righe precedenti). Se nessuna colonna della riga va bene,
// si fa BACKTRACK: si rimuove la regina della riga precedente e si riprova
// dalla colonna successiva lì. L'intera sequenza di passi viene calcolata
// in anticipo (come un'unica lista di "fotogrammi"), così l'interfaccia si
// limita a scorrerla.
// -----------------------------------------------------------------------

// Righe già piazzate (indici < row) che attaccano la cella (row, col):
// stessa colonna, o stessa diagonale in una delle due direzioni.
function computeAttackers(cols, row, col) {
    const attackers = [];
    for (let r = 0; r < row; r++) {
        const c = cols[r];
        if (c === -1) continue;
        if (c === col || Math.abs(c - col) === Math.abs(r - row)) attackers.push(r);
    }
    return attackers;
}

// Per una data riga, quali colonne sono già "sotto attacco" dalle regine
// piazzate nelle righe precedenti — usato solo per l'evidenziazione visiva.
function attackedColumnsForRow(cols, row, n) {
    const result = [];
    for (let c = 0; c < n; c++) {
        if (computeAttackers(cols, row, c).length > 0) result.push(c);
    }
    return result;
}

function solveNQueensTrace(n) {
    const cols = new Array(n).fill(-1);
    const frames = [];
    let placementsTried = 0;
    let backtracks = 0;
    let row = 0;
    let col = 0;
    let solved = false;

    const snapshot = () => cols.slice();

    frames.push({
        type: 'start', cols: snapshot(), row: 0, col: null,
        attackedCols: attackedColumnsForRow(cols, 0, n),
        placementsTried, backtracks,
        text: 'Si parte dalla riga 1: si cerca la prima colonna libera.'
    });

    // Limite di sicurezza: evita un loop infinito se n non ammette soluzione.
    let safety = 0;
    const safetyLimit = n * n * n * 50 + 1000;

    while (row < n && safety++ < safetyLimit) {
        if (col >= n) {
            if (row === 0) {
                frames.push({
                    type: 'fail', cols: snapshot(), row: null, col: null,
                    attackedCols: [], placementsTried, backtracks,
                    text: 'Nessuna colonna valida nemmeno nella prima riga: con questo N non esiste soluzione.'
                });
                break;
            }
            row--;
            const removedCol = cols[row];
            cols[row] = -1;
            col = removedCol + 1;
            backtracks++;
            frames.push({
                type: 'backtrack', cols: snapshot(), row, col: null, removedCol,
                attackedCols: attackedColumnsForRow(cols, row, n),
                placementsTried, backtracks,
                text: `Nessuna colonna valida nella riga successiva: BACKTRACK. Rimuovo la regina dalla riga ${row + 1} (era in colonna ${removedCol + 1}) e riprovo da colonna ${col + 1}.`
            });
            continue;
        }

        placementsTried++;
        const attackers = computeAttackers(cols, row, col);
        if (attackers.length > 0) {
            frames.push({
                type: 'attacked', cols: snapshot(), row, col, attackers,
                attackedCols: attackedColumnsForRow(cols, row, n),
                placementsTried, backtracks,
                text: `Riga ${row + 1}, colonna ${col + 1}: sotto attacco dalla regina di riga ${attackers.map(r => r + 1).join(', ')}. Provo la colonna successiva.`
            });
            col++;
        } else {
            cols[row] = col;
            frames.push({
                type: 'place', cols: snapshot(), row, col,
                attackedCols: attackedColumnsForRow(cols, row, n),
                placementsTried, backtracks,
                text: `Riga ${row + 1}, colonna ${col + 1}: libera. Piazzo la regina.`
            });
            row++;
            col = 0;
            if (row === n) {
                solved = true;
                frames.push({
                    type: 'solution', cols: snapshot(), row: null, col: null,
                    attackedCols: [], placementsTried, backtracks,
                    text: 'Soluzione trovata! Tutte le regine sono piazzate senza conflitti.'
                });
                break;
            }
        }
    }

    return { frames, cols: cols.slice(), n, solved, placementsTried, backtracks };
}

// Verifica indipendente: nessuna coppia di regine si attacca.
function isValidSolution(cols) {
    for (let r1 = 0; r1 < cols.length; r1++) {
        if (cols[r1] === -1) return false;
        for (let r2 = r1 + 1; r2 < cols.length; r2++) {
            if (cols[r2] === cols[r1]) return false;
            if (Math.abs(cols[r2] - cols[r1]) === Math.abs(r2 - r1)) return false;
        }
    }
    return true;
}

// -----------------------------------------------------------------------
// Interfaccia
// -----------------------------------------------------------------------

if (typeof document !== 'undefined') {

    let state = {
        n: 5,
        trace: null,
        current: -1,
        isPlaying: false,
        interval: null,
        speed: 500,
        cellEls: []
    };

    function buildAndRender() {
        stopPlaying();
        state.trace = solveNQueensTrace(state.n);
        state.current = -1;
        buildBoardDom();
        renderFrame();
    }

    function buildBoardDom() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${state.n}, 1fr)`;
        state.cellEls = [];
        for (let r = 0; r < state.n; r++) {
            const rowEls = [];
            for (let c = 0; c < state.n; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell' + ((r + c) % 2 === 0 ? ' light' : ' dark');
                board.appendChild(cell);
                rowEls.push(cell);
            }
            state.cellEls.push(rowEls);
        }
    }

    function renderFrame() {
        const frame = state.current >= 0 ? state.trace.frames[state.current] : state.trace.frames[0];
        const displayFrame = state.current >= 0 ? frame : null;
        const cols = frame.cols;
        const n = state.n;

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = state.cellEls[r][c];
                cell.classList.remove('queen', 'attacked', 'trying', 'backtracked');
                cell.textContent = '';
                if (cols[r] === c) {
                    cell.classList.add('queen');
                    cell.textContent = '♛';
                }
            }
        }

        if (frame.row !== null && frame.row !== undefined && frame.attackedCols) {
            frame.attackedCols.forEach(c => {
                if (cols[frame.row] !== c) state.cellEls[frame.row][c].classList.add('attacked');
            });
        }
        if ((frame.type === 'attacked' || frame.type === 'place') && frame.col !== null && frame.col !== undefined) {
            state.cellEls[frame.row][frame.col].classList.add('trying');
        }
        if (frame.type === 'backtrack' && frame.removedCol !== undefined) {
            state.cellEls[frame.row][frame.removedCol].classList.add('backtracked');
        }

        const panel = document.getElementById('stepPanel');
        if (state.current < 0) {
            panel.innerHTML = `<div class="step-line current">Premi "Avvia" o "Passo singolo" per iniziare a piazzare le regine, riga per riga.</div>`;
        } else {
            const start = Math.max(0, state.current - 6);
            panel.innerHTML = state.trace.frames.slice(start, state.current + 1).map((f, i) => {
                const realIndex = start + i;
                const cls = ['step-line'];
                if (realIndex === state.current) cls.push('current');
                if (f.type === 'backtrack') cls.push('backtrack-line');
                return `<div class="${cls.join(' ')}">${realIndex + 1}. ${f.text}</div>`;
            }).join('');
            panel.scrollTop = panel.scrollHeight;
        }

        document.getElementById('placementsCount').textContent = frame.placementsTried;
        document.getElementById('backtracksCount').textContent = frame.backtracks;

        const atEnd = state.current >= state.trace.frames.length - 1;
        document.getElementById('stepCounter').textContent = state.current >= 0
            ? `Passo ${state.current + 1} / ${state.trace.frames.length}`
            : `Pronto · ${state.trace.frames.length} passi totali`;

        const resultBox = document.getElementById('resultBox');
        if (atEnd && frame.type === 'solution') {
            resultBox.classList.remove('hidden', 'bad');
            resultBox.classList.add('good');
            resultBox.textContent = `✓ Soluzione trovata dopo ${frame.placementsTried} tentativi di piazzamento e ${frame.backtracks} backtrack: colonne [${state.trace.cols.map(c => c + 1).join(', ')}].`;
        } else if (atEnd && frame.type === 'fail') {
            resultBox.classList.remove('hidden', 'good');
            resultBox.classList.add('bad');
            resultBox.textContent = `✗ Nessuna soluzione trovata per N = ${n}.`;
        } else {
            resultBox.classList.add('hidden');
        }

        document.getElementById('stepBtn').disabled = atEnd;
        document.getElementById('playBtn').textContent = state.isPlaying ? '⏸ Pausa' : (atEnd ? '↻ Riavvia' : '▶ Avvia');
    }

    function advance() {
        if (state.current >= state.trace.frames.length - 1) {
            stopPlaying();
            return;
        }
        state.current++;
        renderFrame();
    }

    function startPlaying() {
        if (state.current >= state.trace.frames.length - 1) state.current = -1;
        stopPlaying();
        state.isPlaying = true;
        renderFrame();
        state.interval = setInterval(() => {
            advance();
            if (state.current >= state.trace.frames.length - 1) stopPlaying();
        }, state.speed);
    }

    function stopPlaying() {
        if (state.interval) clearInterval(state.interval);
        state.interval = null;
        state.isPlaying = false;
    }

    document.getElementById('playBtn').addEventListener('click', () => {
        if (state.isPlaying) {
            stopPlaying();
            renderFrame();
        } else {
            startPlaying();
        }
    });
    document.getElementById('stepBtn').addEventListener('click', () => {
        stopPlaying();
        advance();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        state.current = -1;
        stopPlaying();
        renderFrame();
    });
    document.getElementById('nSelect').addEventListener('change', (e) => {
        state.n = parseInt(e.target.value, 10);
        buildAndRender();
    });

    document.getElementById('deepDiveBtn').addEventListener('click', () => {
        const panel = document.getElementById('deepDivePanel');
        const isHidden = panel.classList.toggle('hidden');
        const btn = document.getElementById('deepDiveBtn');
        btn.setAttribute('aria-expanded', String(!isHidden));
        btn.textContent = isHidden
            ? 'Perché non provare prima tutte le combinazioni possibili? ▸'
            : 'Perché non provare prima tutte le combinazioni possibili? ▾';
    });

    // Inizializzazione: con N = 5 di default, "Passo singolo" funziona
    // subito, senza bisogno di premere "Avvia" prima.
    buildAndRender();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { computeAttackers, attackedColumnsForRow, solveNQueensTrace, isValidSolution };
}
