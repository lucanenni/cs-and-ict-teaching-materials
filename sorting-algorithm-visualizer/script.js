const ARRAY_SIZE = 16;

function randomArray() {
    return Array.from({ length: ARRAY_SIZE }, () => 5 + Math.floor(Math.random() * 95));
}

// Ogni funzione di ordinamento restituisce un array di "fotogrammi": lo stato
// dell'array in quel momento, più quali indici sono in confronto o sono stati
// appena scambiati. La riproduzione poi si limita a scorrere questa lista.
function bubbleSortSteps(input) {
    const a = [...input];
    const steps = [];
    let comparisons = 0, swaps = 0;
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
            comparisons++;
            steps.push({ array: [...a], compare: [j, j + 1], swap: null, comparisons, swaps });
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                swaps++;
                steps.push({ array: [...a], compare: null, swap: [j, j + 1], comparisons, swaps });
            }
        }
    }
    steps.push({ array: [...a], compare: null, swap: null, comparisons, swaps, done: true });
    return steps;
}

function selectionSortSteps(input) {
    const a = [...input];
    const steps = [];
    let comparisons = 0, swaps = 0;
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            comparisons++;
            steps.push({ array: [...a], compare: [minIdx, j], swap: null, comparisons, swaps });
            if (a[j] < a[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
            [a[i], a[minIdx]] = [a[minIdx], a[i]];
            swaps++;
            steps.push({ array: [...a], compare: null, swap: [i, minIdx], comparisons, swaps });
        }
    }
    steps.push({ array: [...a], compare: null, swap: null, comparisons, swaps, done: true });
    return steps;
}

function insertionSortSteps(input) {
    const a = [...input];
    const steps = [];
    let comparisons = 0, swaps = 0;
    for (let i = 1; i < a.length; i++) {
        let j = i;
        while (j > 0) {
            comparisons++;
            steps.push({ array: [...a], compare: [j - 1, j], swap: null, comparisons, swaps });
            if (a[j - 1] > a[j]) {
                [a[j - 1], a[j]] = [a[j], a[j - 1]];
                swaps++;
                steps.push({ array: [...a], compare: null, swap: [j - 1, j], comparisons, swaps });
                j--;
            } else {
                break;
            }
        }
    }
    steps.push({ array: [...a], compare: null, swap: null, comparisons, swaps, done: true });
    return steps;
}

function quickSortSteps(input) {
    const a = [...input];
    const steps = [];
    let comparisons = 0, swaps = 0;

    function partition(lo, hi) {
        const pivot = a[hi];
        let i = lo - 1;
        for (let j = lo; j < hi; j++) {
            comparisons++;
            steps.push({ array: [...a], compare: [j, hi], swap: null, comparisons, swaps });
            if (a[j] < pivot) {
                i++;
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                    swaps++;
                    steps.push({ array: [...a], compare: null, swap: [i, j], comparisons, swaps });
                }
            }
        }
        if (i + 1 !== hi) {
            [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
            swaps++;
            steps.push({ array: [...a], compare: null, swap: [i + 1, hi], comparisons, swaps });
        }
        return i + 1;
    }

    function qs(lo, hi) {
        if (lo < hi) {
            const p = partition(lo, hi);
            qs(lo, p - 1);
            qs(p + 1, hi);
        }
    }

    qs(0, a.length - 1);
    steps.push({ array: [...a], compare: null, swap: null, comparisons, swaps, done: true });
    return steps;
}

const ALGORITHMS = {
    bubble: {
        run: bubbleSortSteps,
        explain: [
            '• Confronta ogni coppia di elementi vicini e li scambia se sono nell\'ordine sbagliato.',
            '• Ripete la scansione più volte: ad ogni giro, il valore più grande "galleggia" verso la fine, come una bolla.',
            '• Semplice da capire, ma lento su array grandi: nel caso peggiore richiede circa n² confronti.'
        ]
    },
    selection: {
        run: selectionSortSteps,
        explain: [
            '• Ad ogni passo cerca il valore più piccolo tra quelli non ancora ordinati, e lo scambia in posizione.',
            '• Fa sempre lo stesso numero di confronti, indipendentemente da quanto l\'array sia già ordinato.',
            '• Fa pochissimi scambi rispetto a bubble sort, ma non è più veloce in generale (sempre circa n² confronti).'
        ]
    },
    insertion: {
        run: insertionSortSteps,
        explain: [
            '• Costruisce l\'array ordinato un elemento alla volta, inserendo ciascun nuovo valore nella posizione giusta tra quelli già sistemati.',
            '• Molto efficiente quando l\'array è già quasi ordinato: in quel caso richiede pochissimi confronti.',
            '• È il modo in cui molte persone ordinano le carte da gioco in mano, senza pensarci.'
        ]
    },
    quick: {
        run: quickSortSteps,
        explain: [
            '• Sceglie un "perno" (pivot) e riorganizza l\'array in modo che tutti i valori più piccoli finiscano prima di lui e i più grandi dopo.',
            '• Poi applica la stessa strategia, ricorsivamente, alle due metà — un classico esempio di "divide et impera".',
            '• In media è uno degli algoritmi di ordinamento più veloci in assoluto, anche se nel caso peggiore può essere lento quanto bubble sort.'
        ]
    }
};

let state = {
    original: randomArray(),
    algo: 'bubble',
    steps: [],
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 150
};

function computeSteps() {
    state.steps = ALGORITHMS[state.algo].run(state.original);
    state.current = 0;
}

function renderBars() {
    const step = state.steps[state.current];
    const row = document.getElementById('barsRow');
    row.innerHTML = '';
    const maxVal = Math.max(...state.original);

    step.array.forEach((val, i) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = (val / maxVal * 100) + '%';
        if (step.done) {
            bar.classList.add('done');
        } else if (step.swap && step.swap.includes(i)) {
            bar.classList.add('swap');
        } else if (step.compare && step.compare.includes(i)) {
            bar.classList.add('compare');
        }
        row.appendChild(bar);
    });

    document.getElementById('statsRow').innerHTML =
        `Passo ${state.current + 1} / ${state.steps.length} · Confronti: <span>${step.comparisons}</span> · Scambi: <span>${step.swaps}</span>` +
        (step.done ? ' · <span style="color:#16a34a">✓ Ordinamento completato!</span>' : '');

    const playBtn = document.getElementById('playPauseBtn');
    const atEnd = state.current >= state.steps.length - 1;
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else if (atEnd) {
        playBtn.textContent = '↻ Riavvia';
    } else {
        playBtn.textContent = '▶ Avvia';
    }
    document.getElementById('stepBtn').disabled = atEnd;
}

function advance() {
    if (state.current >= state.steps.length - 1) {
        stopPlaying();
        return;
    }
    state.current++;
    renderBars();
}

function startPlaying() {
    if (state.current >= state.steps.length - 1) {
        state.current = 0;
    }
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    renderBars();
    state.interval = setInterval(() => {
        advance();
        if (state.current >= state.steps.length - 1) stopPlaying();
    }, state.speed);
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
    renderBars();
}

function playPause() {
    if (state.isPlaying) {
        stopPlaying();
    } else {
        startPlaying();
    }
}

function resetPlayback() {
    stopPlaying();
    state.current = 0;
    renderBars();
}

function newArray() {
    stopPlaying();
    state.original = randomArray();
    computeSteps();
    renderBars();
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    advance();
});
document.getElementById('newArrayBtn').addEventListener('click', newArray);

document.getElementById('algoSelect').addEventListener('change', (e) => {
    state.algo = e.target.value;
    document.getElementById('algoExplainList').innerHTML =
        ALGORITHMS[state.algo].explain.map(li => `<li>${li}</li>`).join('');
    stopPlaying();
    computeSteps();
    renderBars();
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = state.speed + 'ms';
    if (state.isPlaying) startPlaying();
});

// Inizializzazione
document.getElementById('algoExplainList').innerHTML =
    ALGORITHMS[state.algo].explain.map(li => `<li>${li}</li>`).join('');
computeSteps();
renderBars();
