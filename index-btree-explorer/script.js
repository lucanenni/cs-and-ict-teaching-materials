// --- Ricerca con e senza indice: scansione lineare vs albero B -------------
// L'albero è costruito una sola volta, per bulk-load, da un elenco di 15
// chiavi ordinate: non è una struttura generica per ogni N, ma un esempio
// fisso, piccolo e interamente verificabile a mano.

const SORTED_KEYS = [12, 19, 23, 31, 38, 42, 47, 55, 61, 68, 74, 82, 89, 93, 99];

const NAMES_BY_PHYSICAL_ORDER = [
    'Giulia Bianchi', 'Marco Rossi', 'Sara Conti', 'Luca Ferrari', 'Omar Haddad',
    'Elena Greco', 'Davide Russo', 'Chiara Marino', 'Matteo Villa', 'Aisha Bakri',
    'Francesca Moretti', 'Leonardo Costa', 'Martina De Luca', 'Riccardo Fontana', 'Alice Colombo'
];

// Ordine "fisico" con cui le righe sono salvate su disco (non ordinato per codice).
const PHYSICAL_KEY_ORDER = [55, 23, 82, 12, 99, 42, 68, 31, 89, 47, 19, 74, 38, 93, 61];

const TABLE_ROWS = PHYSICAL_KEY_ORDER.map((codice, i) => ({ codice, nome: NAMES_BY_PHYSICAL_ORDER[i] }));

const TREE = {
    id: 'root',
    keys: [31, 55, 82],
    children: [
        { id: 'leaf0', keys: [12, 19, 23] },
        { id: 'leaf1', keys: [38, 42, 47] },
        { id: 'leaf2', keys: [61, 68, 74] },
        { id: 'leaf3', keys: [89, 93, 99] }
    ]
};

// Deve corrispondere a .tree-node { width } e .tree-leaves-row { gap } in style.css.
const NODE_WIDTH = 104;
const NODE_GAP = 12;

// --- Ricerca (pure, senza DOM): produce una traccia passo-passo -----------

function buildScanSteps(target) {
    const steps = [];
    for (let i = 0; i < TABLE_ROWS.length; i++) {
        const row = TABLE_ROWS[i];
        const isMatch = row.codice === target;
        steps.push({ rowIdx: i, isMatch, comparisons: i + 1 });
        if (isMatch) break;
    }
    return steps;
}

function buildTreeSteps(target) {
    const steps = [];
    let comparisons = 0;

    function searchNode(node) {
        for (let i = 0; i < node.keys.length; i++) {
            comparisons++;
            const key = node.keys[i];
            if (target === key) {
                steps.push({ nodeId: node.id, keyIdx: i, result: 'equal', comparisons });
                return { found: true, nodeId: node.id };
            }
            if (target < key) {
                steps.push({ nodeId: node.id, keyIdx: i, result: 'less', comparisons });
                if (node.children) return searchNode(node.children[i]);
                return { found: false, nodeId: node.id };
            }
            steps.push({ nodeId: node.id, keyIdx: i, result: 'greater', comparisons });
        }
        if (node.children) return searchNode(node.children[node.keys.length]);
        return { found: false, nodeId: node.id };
    }

    const result = searchNode(TREE);
    return { steps, result, totalComparisons: comparisons };
}

// --- Rendering --------------------------------------------------------------

function renderScanTable() {
    const table = document.getElementById('scanTable');
    const thead = '<thead><tr><th>Riga</th><th>Codice</th><th>Nome</th></tr></thead>';
    const tbody = '<tbody>' + TABLE_ROWS.map((r, i) =>
        `<tr id="scanrow-${i}"><td>${i + 1}</td><td>${r.codice}</td><td>${r.nome}</td></tr>`
    ).join('') + '</tbody>';
    table.innerHTML = thead + tbody;
}

function renderTreeStatic() {
    const rootRow = document.getElementById('treeRootRow');
    rootRow.innerHTML = renderNodeHtml(TREE);

    const leavesRow = document.getElementById('treeLeavesRow');
    leavesRow.innerHTML = TREE.children.map(renderNodeHtml).join('');

    const rootHeight = rootRow.querySelector('.tree-node').offsetHeight;
    const leafStep = NODE_WIDTH + NODE_GAP;
    const totalWidth = TREE.children.length * leafStep - NODE_GAP;

    rootRow.style.width = totalWidth + 'px';
    leavesRow.style.width = totalWidth + 'px';

    const svg = document.getElementById('treeLines');
    svg.setAttribute('width', totalWidth);
    const gapBelowRoot = 40;
    const svgHeight = rootHeight + gapBelowRoot;
    svg.setAttribute('height', svgHeight);
    svg.innerHTML = '';

    const rootCenterX = totalWidth / 2;
    TREE.children.forEach((leaf, i) => {
        const leafCenterX = i * leafStep + NODE_WIDTH / 2;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', rootCenterX);
        line.setAttribute('y1', rootHeight);
        line.setAttribute('x2', leafCenterX);
        line.setAttribute('y2', svgHeight);
        line.id = 'treeline-' + leaf.id;
        svg.appendChild(line);
    });
}

function renderNodeHtml(node) {
    const title = node.id === 'root' ? 'Radice' : 'Foglia';
    const keysHtml = node.keys.map((k, i) => `<div class="tree-key" id="treekey-${node.id}-${i}">${k}</div>`).join('');
    return `<div class="tree-node" id="treenode-${node.id}"><div class="tree-node-title">${title}</div><div class="tree-keys">${keysHtml}</div></div>`;
}

function clearScanHighlights() {
    TABLE_ROWS.forEach((_, i) => {
        const el = document.getElementById('scanrow-' + i);
        if (el) el.classList.remove('checked', 'found');
    });
}

function clearTreeHighlights() {
    document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.tree-key').forEach(k => k.classList.remove('checked', 'found'));
    document.querySelectorAll('.tree-lines line').forEach(l => l.classList.remove('active'));
}

// --- Animazione (play automatico fino alla fine) ---------------------------

let scanInterval = null;
let treeInterval = null;

function runScanAnimation(target) {
    if (scanInterval) clearInterval(scanInterval);
    clearScanHighlights();
    const steps = buildScanSteps(target);
    let i = 0;
    document.getElementById('scanCounter').textContent = '';
    document.getElementById('scanStepText').textContent = '';

    scanInterval = setInterval(() => {
        if (i >= steps.length) { clearInterval(scanInterval); scanInterval = null; return; }
        const step = steps[i];
        const el = document.getElementById('scanrow-' + step.rowIdx);
        el.classList.add(step.isMatch ? 'found' : 'checked');
        document.getElementById('scanStepText').textContent =
            `Riga ${step.rowIdx + 1}: codice ${TABLE_ROWS[step.rowIdx].codice} ${step.isMatch ? '= trovato!' : '≠ ' + target + ', continua...'}`;
        document.getElementById('scanCounter').textContent = `Confronti finora: ${step.comparisons}`;
        i++;
        if (i >= steps.length) {
            clearInterval(scanInterval);
            scanInterval = null;
            const last = steps[steps.length - 1];
            if (!last.isMatch) {
                document.getElementById('scanStepText').textContent = `Nessuna riga corrisponde a ${target}: controllate tutte le ${TABLE_ROWS.length} righe.`;
            }
            lastScanComparisons = last.comparisons;
            renderCompare();
        }
    }, 220);
}

function runTreeAnimation(target) {
    if (treeInterval) clearInterval(treeInterval);
    clearTreeHighlights();
    const { steps, result, totalComparisons } = buildTreeSteps(target);
    let i = 0;
    document.getElementById('treeCounter').textContent = '';
    document.getElementById('treeStepText').textContent = '';

    treeInterval = setInterval(() => {
        if (i >= steps.length) { clearInterval(treeInterval); treeInterval = null; return; }
        const step = steps[i];
        document.getElementById('treenode-' + step.nodeId).classList.add('active');
        const keyEl = document.getElementById(`treekey-${step.nodeId}-${step.keyIdx}`);
        const node = step.nodeId === 'root' ? TREE : TREE.children.find(c => c.id === step.nodeId);
        const key = node.keys[step.keyIdx];

        let text;
        if (step.result === 'equal') {
            keyEl.classList.add('found');
            text = `${step.nodeId === 'root' ? 'Radice' : 'Foglia'}: ${target} = ${key} → trovato!`;
        } else if (step.result === 'less') {
            keyEl.classList.add('checked');
            text = `${step.nodeId === 'root' ? 'Radice' : 'Foglia'}: ${target} < ${key} → ` +
                (node.children ? 'prosegui nel figlio a sinistra di questa chiave.' : 'non c\'è nessuna chiave qui sotto: non esiste.');
            if (node.children) {
                const line = document.getElementById('treeline-' + node.children[step.keyIdx].id);
                if (line) line.classList.add('active');
            }
        } else {
            keyEl.classList.add('checked');
            text = `${step.nodeId === 'root' ? 'Radice' : 'Foglia'}: ${target} > ${key} → continua a scorrere.`;
        }
        document.getElementById('treeStepText').textContent = text;
        document.getElementById('treeCounter').textContent = `Confronti finora: ${step.comparisons}`;
        i++;

        if (i >= steps.length) {
            clearInterval(treeInterval);
            treeInterval = null;
            if (!result.found) {
                document.getElementById('treeStepText').textContent += ` "${target}" non esiste nella tabella.`;
            }
            lastTreeComparisons = totalComparisons;
            renderCompare();
        }
    }, 500);
}

let lastScanComparisons = null;
let lastTreeComparisons = null;

function renderCompare() {
    const box = document.getElementById('compareBox');
    if (lastScanComparisons === null || lastTreeComparisons === null) {
        box.innerHTML = '';
        return;
    }
    const max = Math.max(lastScanComparisons, lastTreeComparisons, 1);
    const scanPct = Math.max(8, (lastScanComparisons / max) * 100);
    const treePct = Math.max(8, (lastTreeComparisons / max) * 100);
    box.innerHTML = `
        <div class="compare-row">
            <div class="compare-label">Senza indice</div>
            <div class="compare-bar-wrap"><div class="compare-bar scan" style="width:${scanPct}%">${lastScanComparisons}</div></div>
        </div>
        <div class="compare-row">
            <div class="compare-label">Con indice (albero B)</div>
            <div class="compare-bar-wrap"><div class="compare-bar tree" style="width:${treePct}%">${lastTreeComparisons}</div></div>
        </div>
    `;
}

function currentTarget() {
    return parseInt(document.getElementById('targetInput').value, 10);
}

const PRESETS = [12, 68, 99, 50, 100];

function renderPresets() {
    const wrap = document.getElementById('presetChips');
    wrap.innerHTML = '';
    PRESETS.forEach(val => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = val;
        chip.addEventListener('click', () => {
            document.getElementById('targetInput').value = val;
        });
        wrap.appendChild(chip);
    });
}

document.getElementById('scanRunBtn').addEventListener('click', () => runScanAnimation(currentTarget()));
document.getElementById('treeRunBtn').addEventListener('click', () => runTreeAnimation(currentTarget()));

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché un indice non rende gratis anche gli INSERT? ▸'
        : 'Perché un indice non rende gratis anche gli INSERT? ▾';
});

renderPresets();
renderScanTable();
renderTreeStatic();
