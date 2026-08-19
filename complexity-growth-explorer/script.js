const CHART_N_MAX = 50;
const NS = 'http://www.w3.org/2000/svg';

const COMPLEXITY_CLASSES = [
    { key: 'const', label: 'O(1)', color: '#16a34a', fn: () => 1, example: 'Accesso a un array per indice, o ricerca in una tabella hash in media — vedi hash-table-visualizer.' },
    { key: 'log', label: 'O(log n)', color: '#0891b2', fn: n => Math.log2(Math.max(n, 1)), example: 'Ricerca in un albero binario di ricerca bilanciato — vedi binary-search-tree-visualizer.' },
    { key: 'linear', label: 'O(n)', color: '#4f46e5', fn: n => n, example: 'Scorrere un array intero una volta, o una visita in-order di un albero.' },
    { key: 'linearithmic', label: 'O(n log n)', color: '#9333ea', fn: n => n * Math.log2(Math.max(n, 1)), example: 'Quick sort e merge sort, in media — vedi sorting-algorithm-visualizer.' },
    { key: 'quadratic', label: 'O(n²)', color: '#ea580c', fn: n => n * n, example: 'Bubble sort e selection sort, che confrontano ogni coppia di elementi.' },
    { key: 'exponential', label: 'O(2ⁿ)', color: '#dc2626', fn: n => Math.pow(2, n), example: 'Fibonacci calcolato con ricorsione ingenua, senza memoization — vedi recursion-tree-visualizer.' }
];

let state = {
    n: 20,
    active: { const: true, log: true, linear: true, linearithmic: true, quadratic: true, exponential: true }
};

function formatBigNumber(n) {
    if (n < 1000) return Math.round(n).toString();
    if (n < 1e6) return Math.round(n).toLocaleString('it-IT');
    const exp = n.toExponential(2);
    const [mantissa, exponent] = exp.split('e');
    return `${mantissa} × 10^${parseInt(exponent, 10)}`;
}

function formatOps(v) {
    if (v < 1e12) return Math.round(v).toLocaleString('it-IT');
    return formatBigNumber(v);
}

function formatDuration(seconds) {
    if (seconds < 1e-6) return '< 1 µs (istantaneo)';
    if (seconds < 1e-3) return (seconds * 1e6).toFixed(1) + ' µs';
    if (seconds < 1) return (seconds * 1000).toFixed(1) + ' ms';
    if (seconds < 60) return seconds.toFixed(2) + ' secondi';
    if (seconds < 3600) return (seconds / 60).toFixed(1) + ' minuti';
    if (seconds < 86400) return (seconds / 3600).toFixed(1) + ' ore';
    const years = seconds / 31557600;
    if (years < 1) return (seconds / 86400).toFixed(1) + ' giorni';
    const AGE_OF_UNIVERSE_YEARS = 13.8e9;
    if (years < AGE_OF_UNIVERSE_YEARS) return formatBigNumber(years) + ' anni';
    return formatBigNumber(years / AGE_OF_UNIVERSE_YEARS) + " volte l'età dell'universo";
}

function renderLegend() {
    const grid = document.getElementById('legendGrid');
    grid.innerHTML = '';
    COMPLEXITY_CLASSES.forEach(c => {
        const item = document.createElement('label');
        item.className = 'legend-item' + (state.active[c.key] ? ' active' : '');
        item.style.setProperty('--curve-color', c.color);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = state.active[c.key];
        checkbox.addEventListener('change', (e) => {
            state.active[c.key] = e.target.checked;
            render();
        });

        const textWrap = document.createElement('span');
        textWrap.className = 'legend-text';
        const labelEl = document.createElement('span');
        labelEl.className = 'legend-label';
        labelEl.textContent = c.label;
        const exampleEl = document.createElement('span');
        exampleEl.className = 'legend-example';
        exampleEl.textContent = c.example;
        textWrap.appendChild(labelEl);
        textWrap.appendChild(exampleEl);

        item.appendChild(checkbox);
        item.appendChild(textWrap);
        grid.appendChild(item);
    });
}

function renderChart() {
    const svg = document.getElementById('chartSvg');
    svg.innerHTML = '';

    const W = 700, H = 400;
    const marginLeft = 55, marginRight = 15, marginTop = 15, marginBottom = 35;
    const plotW = W - marginLeft - marginRight;
    const plotBottom = H - marginBottom;
    const plotH = plotBottom - marginTop;

    const yMaxVal = Math.pow(2, CHART_N_MAX);
    const yMaxLog = Math.log10(yMaxVal);

    function xScale(n) { return marginLeft + (n - 1) / (CHART_N_MAX - 1) * plotW; }
    function yScale(v) {
        const lv = Math.log10(Math.max(v, 1));
        return plotBottom - (lv / yMaxLog) * plotH;
    }

    for (let p = 0; p <= 14; p += 2) {
        const y = yScale(Math.pow(10, p));
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', marginLeft);
        line.setAttribute('x2', W - marginRight);
        line.setAttribute('y1', y);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'grid-line');
        svg.appendChild(line);

        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', marginLeft - 8);
        label.setAttribute('y', y + 3);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('class', 'axis-label');
        label.textContent = p === 0 ? '1' : `10^${p}`;
        svg.appendChild(label);
    }

    const xAxis = document.createElementNS(NS, 'line');
    xAxis.setAttribute('x1', marginLeft);
    xAxis.setAttribute('x2', W - marginRight);
    xAxis.setAttribute('y1', plotBottom);
    xAxis.setAttribute('y2', plotBottom);
    xAxis.setAttribute('class', 'axis-line');
    svg.appendChild(xAxis);

    [1, 10, 20, 30, 40, 50].forEach(n => {
        const x = xScale(n);
        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', plotBottom + 16);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'axis-label');
        label.textContent = 'n=' + n;
        svg.appendChild(label);
    });

    const xTitle = document.createElementNS(NS, 'text');
    xTitle.setAttribute('x', marginLeft + plotW / 2);
    xTitle.setAttribute('y', H - 2);
    xTitle.setAttribute('text-anchor', 'middle');
    xTitle.setAttribute('class', 'axis-label');
    xTitle.textContent = "dimensione dell'input (n)";
    svg.appendChild(xTitle);

    const yTitle = document.createElementNS(NS, 'text');
    yTitle.setAttribute('x', 4);
    yTitle.setAttribute('y', 11);
    yTitle.setAttribute('class', 'axis-label');
    yTitle.textContent = 'operazioni (scala log)';
    svg.appendChild(yTitle);

    COMPLEXITY_CLASSES.forEach(c => {
        if (!state.active[c.key]) return;
        let d = '';
        for (let n = 1; n <= CHART_N_MAX; n++) {
            const x = xScale(n);
            const y = yScale(c.fn(n));
            d += (n === 1 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
        }
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', d.trim());
        path.setAttribute('class', 'curve-path');
        path.setAttribute('stroke', c.color);
        svg.appendChild(path);
    });

    const cx = xScale(state.n);
    const cursorLine = document.createElementNS(NS, 'line');
    cursorLine.setAttribute('x1', cx);
    cursorLine.setAttribute('x2', cx);
    cursorLine.setAttribute('y1', marginTop);
    cursorLine.setAttribute('y2', plotBottom);
    cursorLine.setAttribute('class', 'cursor-line');
    svg.appendChild(cursorLine);

    COMPLEXITY_CLASSES.forEach(c => {
        if (!state.active[c.key]) return;
        const cy = yScale(c.fn(state.n));
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', cx);
        dot.setAttribute('cy', cy);
        dot.setAttribute('r', 4.5);
        dot.setAttribute('fill', c.color);
        dot.setAttribute('class', 'cursor-dot');
        svg.appendChild(dot);
    });
}

function renderTable() {
    document.getElementById('tableN').textContent = state.n;
    const table = document.getElementById('opsTable');
    let html = '<tr><th>Classe</th><th>Operazioni</th><th>Tempo stimato</th></tr>';
    COMPLEXITY_CLASSES.forEach(c => {
        if (!state.active[c.key]) return;
        const ops = c.fn(state.n);
        const seconds = ops / 1e9;
        html += `<tr><td style="color:${c.color}; font-weight:700;">${c.label}</td><td>${formatOps(ops)}</td><td>${formatDuration(seconds)}</td></tr>`;
    });
    table.innerHTML = html;
}

function render() {
    renderLegend();
    renderChart();
    renderTable();
}

document.getElementById('nSlider').addEventListener('input', (e) => {
    state.n = parseInt(e.target.value, 10);
    document.getElementById('nValue').textContent = state.n;
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Un computer più veloce non risolve il problema? ▸'
        : 'Un computer più veloce non risolve il problema? ▾';
});

// Inizializzazione
render();
