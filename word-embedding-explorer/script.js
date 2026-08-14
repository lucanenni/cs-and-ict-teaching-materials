const SVG_NS = 'http://www.w3.org/2000/svg';

// Coordinate scelte a mano in modo che i cluster semantici siano visivamente
// separati e che almeno un'analogia (re - uomo + donna) dia un risultato esatto.
const words = [
    // Animali (in alto a sinistra)
    { label: 'gatto', x: -9, y: 8 },
    { label: 'cane', x: -7, y: 8 },
    { label: 'leone', x: -8, y: 6 },
    { label: 'tigre', x: -9, y: 5 },
    { label: 'elefante', x: -6, y: 6 },
    // Meteo (in alto a destra)
    { label: 'pioggia', x: 6, y: 8 },
    { label: 'sole', x: 9, y: 8 },
    { label: 'neve', x: 8, y: 6 },
    { label: 'vento', x: 9, y: 5 },
    // Royalty (in basso al centro) — spostato lontano dagli altri cluster
    // con una traslazione pura, che non altera l'aritmetica delle analogie.
    { label: 're', x: 1, y: -7 },
    { label: 'regina', x: 1, y: -1 },
    { label: 'principe', x: 3, y: -8 },
    { label: 'principessa', x: 2, y: 0 },
    // Persone / asse di genere (in basso al centro)
    { label: 'uomo', x: -2, y: -7 },
    { label: 'donna', x: -2, y: -1 },
    { label: 'ragazzo', x: -4, y: -8 },
    { label: 'ragazza', x: -4, y: 0 }
];

const analogies = [
    { a: 're', b: 'uomo', c: 'donna', label: 're − uomo + donna' },
    { a: 'principessa', b: 'ragazza', c: 'ragazzo', label: 'principessa − ragazza + ragazzo' }
];

let state = {
    mode: 'explore', // 'explore' | 'analogy'
    selectedWord: null,
    selectedAnalogy: 0,
    analogyResult: null
};

function findWord(label) {
    return words.find(w => w.label === label);
}

function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function similarityIndex(dist) {
    return Math.round(100 / (1 + dist));
}

function clearGroup(id) {
    const g = document.getElementById(id);
    while (g.firstChild) g.removeChild(g.firstChild);
    return g;
}

function drawGrid() {
    const g = clearGroup('gridGroup');
    const axis = document.createElementNS(SVG_NS, 'line');
    axis.setAttribute('x1', -11); axis.setAttribute('x2', 11);
    axis.setAttribute('y1', 0); axis.setAttribute('y2', 0);
    axis.setAttribute('stroke', '#e5e7eb'); axis.setAttribute('stroke-width', 0.05);
    g.appendChild(axis);
    const axis2 = document.createElementNS(SVG_NS, 'line');
    axis2.setAttribute('x1', 0); axis2.setAttribute('x2', 0);
    axis2.setAttribute('y1', -11); axis2.setAttribute('y2', 11);
    axis2.setAttribute('stroke', '#e5e7eb'); axis2.setAttribute('stroke-width', 0.05);
    g.appendChild(axis2);
}

function svgY(y) {
    // Nello SVG l'asse Y cresce verso il basso: lo invertiamo per un grafico "matematico".
    return -y;
}

function makeCircle(x, y, r, fill, extraClass) {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', svgY(y));
    c.setAttribute('r', r);
    c.setAttribute('fill', fill);
    c.setAttribute('stroke', '#1f2937');
    c.setAttribute('stroke-width', 0.08);
    if (extraClass) c.setAttribute('class', extraClass);
    return c;
}

function makeLabel(x, y, text, opts = {}) {
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', svgY(y) - (opts.dy ?? 0.75));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-size', opts.size || 0.55);
    t.setAttribute('font-weight', opts.bold ? 'bold' : 'normal');
    t.setAttribute('fill', opts.color || '#374151');
    t.setAttribute('class', 'word-label');
    t.textContent = text;
    return t;
}

function makeLine(x1, y1, x2, y2, opts = {}) {
    const l = document.createElementNS(SVG_NS, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', svgY(y1));
    l.setAttribute('x2', x2); l.setAttribute('y2', svgY(y2));
    l.setAttribute('stroke', opts.stroke || '#db2777');
    l.setAttribute('stroke-width', opts.width || 0.1);
    if (opts.dash) l.setAttribute('stroke-dasharray', opts.dash);
    if (opts.marker) l.setAttribute('marker-end', 'url(#arrowhead)');
    return l;
}

function renderPointsBase(highlightFn) {
    const g = clearGroup('pointsGroup');
    words.forEach(w => {
        const style = highlightFn ? highlightFn(w) : { r: 0.5, fill: '#a78bfa' };
        g.appendChild(makeCircle(w.x, w.y, style.r, style.fill));
        g.appendChild(makeLabel(w.x, w.y, w.label, { bold: style.bold, color: style.labelColor }));
    });
}

function renderExplore() {
    document.getElementById('hintText').textContent = state.selectedWord
        ? `Le linee mostrano le parole più vicine a "${state.selectedWord}". Prova a cliccarne un'altra.`
        : 'Clicca su una parola per vedere quali altre le sono più vicine nello spazio dei significati.';

    const linesGroup = clearGroup('linesGroup');
    let neighbors = [];

    if (state.selectedWord) {
        const origin = findWord(state.selectedWord);
        neighbors = words
            .filter(w => w.label !== state.selectedWord)
            .map(w => ({ ...w, dist: distance(origin, w) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 4);

        neighbors.forEach((n, i) => {
            linesGroup.appendChild(makeLine(origin.x, origin.y, n.x, n.y, {
                stroke: '#c084fc',
                width: 0.15 - i * 0.02
            }));
        });
    }

    renderPointsBase(w => {
        if (w.label === state.selectedWord) {
            return { r: 0.7, fill: '#7c3aed', bold: true };
        }
        const n = neighbors.find(x => x.label === w.label);
        if (n) {
            return { r: 0.55, fill: '#db2777', bold: false };
        }
        return { r: 0.42, fill: '#c4b5fd' };
    });

    // Attach click handlers
    document.querySelectorAll('#pointsGroup circle').forEach((circle, i) => {
        circle.classList.add('word-point');
        circle.addEventListener('click', () => {
            state.selectedWord = words[i].label;
            render();
        });
    });

    const panel = document.getElementById('resultsPanel');
    if (!state.selectedWord) {
        panel.innerHTML = '<p class="results-placeholder">👆 Clicca su una parola del grafico qui sopra per vedere le parole più simili.</p>';
        return;
    }
    let html = `<div class="results-title">Parole più simili a "${state.selectedWord}":</div>`;
    neighbors.forEach(n => {
        const sim = similarityIndex(n.dist);
        html += `
            <div class="result-row">
                <span class="result-word">${n.label}</span>
                <div class="result-bar-container">
                    <div class="result-bar" style="width: ${sim}%"></div>
                </div>
                <span class="result-value">${sim}%</span>
            </div>
        `;
    });
    panel.innerHTML = html;
}

function renderAnalogy() {
    document.getElementById('hintText').textContent = 'Scegli un\'analogia e premi "Calcola": la pagina somma e sottrae i vettori delle parole e cerca la parola più vicina al risultato.';

    const linesGroup = clearGroup('linesGroup');
    const analogy = analogies[state.selectedAnalogy];
    const a = findWord(analogy.a);
    const b = findWord(analogy.b);
    const c = findWord(analogy.c);

    let computed = null;
    let nearest = null;
    if (state.analogyResult) {
        computed = state.analogyResult.computed;
        nearest = state.analogyResult.nearest;

        // Vettore b -> a
        linesGroup.appendChild(makeLine(b.x, b.y, a.x, a.y, { stroke: '#7c3aed', width: 0.12, marker: true }));
        // Stesso vettore applicato a partire da c, tratteggiato, fino al punto calcolato
        linesGroup.appendChild(makeLine(c.x, c.y, computed.x, computed.y, { stroke: '#7c3aed', width: 0.12, dash: '0.3,0.2', marker: true }));
        // Collegamento dal punto calcolato alla parola più vicina trovata
        linesGroup.appendChild(makeLine(computed.x, computed.y, nearest.x, nearest.y, { stroke: '#059669', width: 0.1, dash: '0.15,0.15' }));
    }

    renderPointsBase(w => {
        if ([analogy.a, analogy.b, analogy.c].includes(w.label)) {
            return { r: 0.6, fill: '#7c3aed', bold: true };
        }
        if (nearest && w.label === nearest.label) {
            return { r: 0.65, fill: '#059669', bold: true };
        }
        return { r: 0.4, fill: '#e9d5ff' };
    });

    if (computed) {
        const g = document.getElementById('pointsGroup');
        g.appendChild(makeCircle(computed.x, computed.y, 0.45, '#fbbf24'));
        g.appendChild(makeLabel(computed.x, computed.y, '?', { bold: true, color: '#92400e', size: 0.7 }));
    }

    const panel = document.getElementById('resultsPanel');
    if (!state.analogyResult) {
        panel.innerHTML = `<p class="results-placeholder">Premi "Calcola" per vedere ${analogy.label} = ?</p>`;
        return;
    }
    const dist = distance(computed, nearest);
    const matchText = dist < 0.05
        ? 'una corrispondenza esatta! ✨'
        : `una corrispondenza molto vicina (distanza ${dist.toFixed(2)}).`;
    panel.innerHTML = `
        <div class="analogy-steps">
            <div>1. ${analogy.a} − ${analogy.b} = vettore (${(a.x - b.x).toFixed(0)}, ${(a.y - b.y).toFixed(0)})</div>
            <div>2. ${analogy.c} + quel vettore = punto (${computed.x.toFixed(0)}, ${computed.y.toFixed(0)})</div>
            <div>3. La parola più vicina a quel punto è...</div>
        </div>
        <div class="analogy-answer">${analogy.label} ≈ ${nearest.label} — ${matchText}</div>
    `;
}

function render() {
    if (state.mode === 'explore') {
        renderExplore();
    } else {
        renderAnalogy();
    }
}

function calculateAnalogy() {
    const analogy = analogies[state.selectedAnalogy];
    const a = findWord(analogy.a);
    const b = findWord(analogy.b);
    const c = findWord(analogy.c);
    const computed = { x: a.x - b.x + c.x, y: a.y - b.y + c.y };

    const nearest = words
        .filter(w => ![analogy.a, analogy.b, analogy.c].includes(w.label))
        .map(w => ({ ...w, dist: distance(computed, w) }))
        .sort((x, y) => x.dist - y.dist)[0];

    state.analogyResult = { computed, nearest };
    render();
}

// Event listeners
document.getElementById('exploreModeBtn').addEventListener('click', () => {
    state.mode = 'explore';
    document.getElementById('exploreModeBtn').classList.add('active');
    document.getElementById('analogyModeBtn').classList.remove('active');
    document.getElementById('analogyControls').classList.add('hidden');
    render();
});

document.getElementById('analogyModeBtn').addEventListener('click', () => {
    state.mode = 'analogy';
    document.getElementById('analogyModeBtn').classList.add('active');
    document.getElementById('exploreModeBtn').classList.remove('active');
    document.getElementById('analogyControls').classList.remove('hidden');
    render();
});

document.getElementById('analogySelect').addEventListener('change', (e) => {
    state.selectedAnalogy = parseInt(e.target.value);
    state.analogyResult = null;
    render();
});

document.getElementById('calcAnalogyBtn').addEventListener('click', calculateAnalogy);

drawGrid();
render();
