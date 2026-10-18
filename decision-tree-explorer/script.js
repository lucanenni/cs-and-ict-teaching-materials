// --- Albero decisionale costruito con l'impurità di Gini -------------------
// Ad ogni nodo, per ogni feature ancora disponibile, calcoliamo quanto
// "mista" resterebbe ciascuna fetta dei dati dopo la divisione (impurità di
// Gini: 1 - somma delle probabilità al quadrato), mediata sul peso di ogni
// fetta. La feature con il punteggio PIÙ BASSO è quella scelta: divide i
// dati nel modo che produce, in media, i gruppi più "puri" possibile.
//
// La logica (gini, scoreFeatures, buildTree, classify) è stata verificata in
// Node (non incluso nel progetto pubblicato): i punteggi delle feature alla
// radice sono stati confrontati con il calcolo a mano (Tempo=0.30, Vento≈
// 0.419, Umidità=0.40), la forma esatta dell'albero risultante è stata
// verificata nodo per nodo, l'albero classifica correttamente tutti e 10 gli
// esempi di addestramento, 3 nuovi esempi sono stati classificati e
// confrontati col percorso atteso, e un caso sintetico verifica il fallback
// alla classe maggioritaria quando un nodo esaurisce le feature o incontra
// un valore mai visto in addestramento.

const LABEL = 'giocare';
const FEATURE_LABELS = { tempo: 'Tempo', vento: 'Vento', umidita: 'Umidità' };
const FEATURES = ['tempo', 'vento', 'umidita'];
const FEATURE_DOMAINS = {
    tempo: ['Sole', 'Pioggia', 'Nuvoloso'],
    vento: ['Si', 'No'],
    umidita: ['Alta', 'Normale'],
};

const DATASET = [
    { giorno: 1, tempo: 'Sole', vento: 'No', umidita: 'Alta', giocare: 'No' },
    { giorno: 2, tempo: 'Sole', vento: 'Si', umidita: 'Alta', giocare: 'No' },
    { giorno: 3, tempo: 'Nuvoloso', vento: 'No', umidita: 'Alta', giocare: 'Si' },
    { giorno: 4, tempo: 'Pioggia', vento: 'No', umidita: 'Alta', giocare: 'Si' },
    { giorno: 5, tempo: 'Pioggia', vento: 'No', umidita: 'Normale', giocare: 'Si' },
    { giorno: 6, tempo: 'Pioggia', vento: 'Si', umidita: 'Normale', giocare: 'No' },
    { giorno: 7, tempo: 'Nuvoloso', vento: 'Si', umidita: 'Normale', giocare: 'Si' },
    { giorno: 8, tempo: 'Sole', vento: 'No', umidita: 'Alta', giocare: 'No' },
    { giorno: 9, tempo: 'Sole', vento: 'No', umidita: 'Normale', giocare: 'Si' },
    { giorno: 10, tempo: 'Pioggia', vento: 'No', umidita: 'Normale', giocare: 'Si' },
];

function classCounts(examples) {
    const counts = {};
    for (const ex of examples) counts[ex[LABEL]] = (counts[ex[LABEL]] || 0) + 1;
    return counts;
}

// Impurità di Gini di un insieme di esempi: 1 - Σ p_c², dove p_c è la
// proporzione di esempi di classe c. Vale 0 quando l'insieme è puro (una
// sola classe), ed è massima quando le classi sono mescolate in parti
// uguali.
function gini(examples) {
    const counts = classCounts(examples);
    const n = examples.length;
    if (n === 0) return 0;
    let sumSq = 0;
    for (const c of Object.values(counts)) sumSq += (c / n) * (c / n);
    return 1 - sumSq;
}

function splitBy(examples, feature) {
    const groups = {};
    for (const ex of examples) {
        const v = ex[feature];
        (groups[v] = groups[v] || []).push(ex);
    }
    return groups;
}

// Gini pesato di una divisione: la media dell'impurità di ciascun gruppo,
// pesata dalla sua dimensione relativa. È il punteggio che confrontiamo fra
// le feature candidate: il più basso vince.
function weightedGini(groups, total) {
    let w = 0;
    for (const g of Object.values(groups)) w += (g.length / total) * gini(g);
    return w;
}

function scoreFeatures(examples, features) {
    const n = examples.length;
    return features.map(feature => {
        const groups = splitBy(examples, feature);
        const groupInfo = {};
        for (const [v, g] of Object.entries(groups)) {
            groupInfo[v] = { n: g.length, counts: classCounts(g), gini: gini(g) };
        }
        return { feature, weightedGini: weightedGini(groups, n), groups: groupInfo };
    });
}

function majorityClass(examples) {
    const counts = classCounts(examples);
    let best = null, bestN = -1;
    for (const [label, c] of Object.entries(counts)) {
        if (c > bestN) { best = label; bestN = c; }
    }
    return best;
}

let nodeCounter = 0;
function buildTree(examples, availableFeatures) {
    const counts = classCounts(examples);
    const labels = Object.keys(counts);
    const id = nodeCounter++;
    if (labels.length === 1) {
        return { id, examples, counts, isLeaf: true, label: labels[0], reason: 'pure' };
    }
    if (availableFeatures.length === 0) {
        return { id, examples, counts, isLeaf: true, label: majorityClass(examples), reason: 'no-features' };
    }
    const scores = scoreFeatures(examples, availableFeatures);
    let best = scores[0];
    for (const s of scores) if (s.weightedGini < best.weightedGini - 1e-12) best = s;

    const groups = splitBy(examples, best.feature);
    const remaining = availableFeatures.filter(f => f !== best.feature);
    const children = {};
    for (const [value, subset] of Object.entries(groups)) {
        const child = buildTree(subset, remaining);
        child.edgeValue = value;
        children[value] = child;
    }
    return { id, examples, counts, isLeaf: false, feature: best.feature, scores, children };
}

// Traversa l'albero in ampiezza (BFS): radice prima, poi tutti i suoi figli,
// poi i loro figli — l'ordine più naturale per "raccontare" la costruzione
// un nodo alla volta.
function buildFrames(tree) {
    const frames = [];
    const queue = [tree];
    while (queue.length) {
        const node = queue.shift();
        frames.push(node);
        if (!node.isLeaf) {
            for (const child of Object.values(node.children)) queue.push(child);
        }
    }
    return frames;
}

function classify(tree, example) {
    const path = [];
    const visited = [tree.id];
    let node = tree;
    while (!node.isLeaf) {
        const value = example[node.feature];
        path.push({ nodeId: node.id, feature: node.feature, value });
        const child = node.children[value];
        if (!child) {
            return { label: majorityClass(node.examples), path, fallback: true, fallbackAt: node.id, visited };
        }
        node = child;
        visited.push(node.id);
    }
    return { label: node.label, path, fallback: false, visited };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LABEL, FEATURES, FEATURE_DOMAINS, DATASET,
        gini, splitBy, weightedGini, scoreFeatures, majorityClass, buildTree, buildFrames, classify,
    };
}

// --- Interfaccia -------------------------------------------------------------

if (typeof document !== 'undefined') {

nodeCounter = 0;
const tree = buildTree(DATASET, FEATURES);
const frames = buildFrames(tree);
let frameIndex = -1;
let running = false;
let timer = null;
let classifying = false;

function currentSpeed() {
    return parseInt(document.getElementById('speedSlider').value, 10);
}

function renderDataset() {
    const tbody = document.getElementById('datasetBody');
    tbody.innerHTML = DATASET.map(ex => `
        <tr>
            <td>${ex.giorno}</td>
            <td>${ex.tempo}</td>
            <td>${ex.vento}</td>
            <td>${ex.umidita}</td>
            <td class="ds-label ${ex.giocare === 'Si' ? 'ds-si' : 'ds-no'}">${ex.giocare}</td>
        </tr>
    `).join('');
}

function countsText(counts) {
    return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ');
}

function nodeSummaryHtml(node) {
    const n = node.examples.length;
    if (node.isLeaf) {
        return `<span class="dt-count">${n} es.</span><span class="dt-leaf-label">Giocare: ${node.label}</span>`;
    }
    return `<span class="dt-count">${n} es. (${countsText(node.counts)})</span><span class="dt-feature-label">${FEATURE_LABELS[node.feature]}?</span>`;
}

function nodeLi(node) {
    const li = document.createElement('li');
    li.dataset.id = node.id;
    if (node.edgeValue !== undefined) {
        const edge = document.createElement('div');
        edge.className = 'dt-edge-label hidden';
        edge.dataset.edgeFor = node.id;
        edge.textContent = node.edgeValue;
        li.appendChild(edge);
    }
    const box = document.createElement('div');
    box.className = 'dt-node-box pending';
    box.dataset.id = node.id;
    box.textContent = '?';
    li.appendChild(box);

    if (!node.isLeaf) {
        const ul = document.createElement('ul');
        for (const child of Object.values(node.children)) {
            ul.appendChild(nodeLi(child));
        }
        li.appendChild(ul);
    }
    return li;
}

function buildTreeDom() {
    const root = document.getElementById('treeRoot');
    root.innerHTML = '';
    root.appendChild(nodeLi(tree));
}

function describeFrame(node) {
    const n = node.examples.length;
    if (node.isLeaf) {
        if (node.reason === 'pure') {
            return `Nodo con ${n} esempi, tutti con Giocare = ${node.label}: è già puro → diventa una foglia "${node.label}".`;
        }
        return `Nodo con ${n} esempi (${countsText(node.counts)}) ma nessuna feature rimasta da provare: diventa una foglia con la classe più frequente qui → "${node.label}".`;
    }
    const sorted = node.scores.slice().sort((a, b) => a.weightedGini - b.weightedGini);
    const scoresText = sorted.map(s =>
        `${FEATURE_LABELS[s.feature]}: Gini pesato = ${s.weightedGini.toFixed(3)}` + (s.feature === node.feature ? ' ← scelta' : '')
    ).join('; ');
    const splitText = Object.entries(node.children).map(([v, c]) => `${v} (${c.examples.length} es.)`).join(', ');
    return `Nodo con ${n} esempi (${countsText(node.counts)}). Punteggi delle feature candidate — ${scoresText}. ` +
        `Si divide per ${FEATURE_LABELS[node.feature]}: ${splitText}.`;
}

function addStepLine(text) {
    const panel = document.getElementById('stepPanel');
    panel.querySelectorAll('.step-line.current').forEach(el => el.classList.remove('current'));
    const line = document.createElement('div');
    line.className = 'step-line current';
    line.textContent = text;
    panel.appendChild(line);
    panel.scrollTop = panel.scrollHeight;
}

function revealNode(node) {
    const box = document.querySelector(`.dt-node-box[data-id="${node.id}"]`);
    box.classList.remove('pending');
    box.classList.add(node.isLeaf ? 'leaf' : 'internal');
    box.innerHTML = nodeSummaryHtml(node);
    const edge = document.querySelector(`.dt-edge-label[data-edge-for="${node.id}"]`);
    if (edge) edge.classList.remove('hidden');
}

function updateButtons() {
    const atEnd = frameIndex >= frames.length - 1;
    document.getElementById('stepBtn').disabled = atEnd;
    document.getElementById('runBtn').disabled = atEnd;
    document.getElementById('classifyBtn').disabled = !atEnd || classifying;
    document.getElementById('classifyHint').classList.toggle('hidden', atEnd);
}

function tick() {
    if (frameIndex >= frames.length - 1) { stopAuto(); return; }
    frameIndex++;
    const node = frames[frameIndex];
    revealNode(node);
    addStepLine(`Passo ${frameIndex + 1}: ` + describeFrame(node));
    if (frameIndex >= frames.length - 1) {
        document.getElementById('resultBox').className = 'result-box good';
        document.getElementById('resultBox').textContent =
            `✓ Albero completato: ${frames.length} nodi costruiti (${frames.filter(f => f.isLeaf).length} foglie).`;
    }
    updateButtons();
    if (frameIndex >= frames.length - 1) stopAuto();
}

function startAuto() {
    if (running || frameIndex >= frames.length - 1) return;
    running = true;
    document.getElementById('runBtn').textContent = '⏸ Pausa';
    timer = setInterval(tick, currentSpeed());
}

function stopAuto() {
    running = false;
    document.getElementById('runBtn').textContent = '▶ Avvia';
    if (timer) { clearInterval(timer); timer = null; }
}

function toggleRun() {
    if (running) stopAuto(); else startAuto();
}

function resetBuild() {
    stopAuto();
    frameIndex = -1;
    buildTreeDom();
    document.getElementById('stepPanel').innerHTML = '';
    document.getElementById('resultBox').className = 'result-box';
    document.getElementById('resultBox').textContent = '';
    document.getElementById('classifyResultBox').className = 'result-box';
    document.getElementById('classifyResultBox').textContent = '';
    document.querySelectorAll('.dt-node-box').forEach(el => el.classList.remove('path-node', 'path-leaf'));
    document.querySelectorAll('.dt-edge-label').forEach(el => el.classList.remove('path-edge'));
    updateButtons();
}

function clearClassifyHighlight() {
    document.querySelectorAll('.dt-node-box').forEach(el => el.classList.remove('path-node', 'path-leaf'));
    document.querySelectorAll('.dt-edge-label').forEach(el => el.classList.remove('path-edge'));
}

function doClassify() {
    if (frameIndex < frames.length - 1 || classifying) return;
    const example = {
        tempo: document.getElementById('selTempo').value,
        vento: document.getElementById('selVento').value,
        umidita: document.getElementById('selUmidita').value,
    };
    clearClassifyHighlight();
    const result = classify(tree, example);
    const box = document.getElementById('classifyResultBox');
    box.className = 'result-box';
    box.textContent = '';

    classifying = true;
    updateButtons();
    let i = 0;
    const steps = result.visited;
    const stepTimer = setInterval(() => {
        const nodeId = steps[i];
        const box2 = document.querySelector(`.dt-node-box[data-id="${nodeId}"]`);
        box2.classList.add(i === steps.length - 1 ? 'path-leaf' : 'path-node');
        const edge = document.querySelector(`.dt-edge-label[data-edge-for="${nodeId}"]`);
        if (edge) edge.classList.add('path-edge');
        i++;
        if (i >= steps.length) {
            clearInterval(stepTimer);
            classifying = false;
            updateButtons();
            box.className = result.fallback ? 'result-box bad' : 'result-box good';
            const pathText = result.path.map(p => `${FEATURE_LABELS[p.feature]}=${p.value}`).join(' → ');
            box.textContent = result.fallback
                ? `⚠ Previsione: Giocare = ${result.label} (percorso: ${pathText} → valore non visto in addestramento a quel nodo, si usa la classe più frequente lì).`
                : `✓ Previsione: Giocare = ${result.label} (percorso seguito: ${pathText}).`;
        }
    }, 650);
}

document.getElementById('runBtn').addEventListener('click', toggleRun);
document.getElementById('stepBtn').addEventListener('click', tick);
document.getElementById('resetBtn').addEventListener('click', resetBuild);
document.getElementById('classifyBtn').addEventListener('click', doClassify);

document.getElementById('speedSlider').addEventListener('input', (e) => {
    document.getElementById('speedValue').textContent = e.target.value + ' ms/nodo';
    if (running) { stopAuto(); startAuto(); }
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Un albero più profondo è sempre meglio? ▸'
        : 'Un albero più profondo è sempre meglio? ▾';
});

// Inizializzazione: albero già calcolato, struttura disegnata (vuota),
// Passo singolo funziona da subito senza dover prima premere Avvia.
renderDataset();
buildTreeDom();
document.getElementById('speedSlider').dispatchEvent(new Event('input'));
updateButtons();

}
