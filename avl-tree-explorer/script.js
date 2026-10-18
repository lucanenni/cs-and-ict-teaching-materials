// --- Albero AVL: inserimento BST + ri-bilanciamento automatico -------------
// La logica pura (rotateLeft/rotateRight/updateHeight/balanceFactor e la
// funzione d'inserimento) è stata verificata separatamente in Node su diversi
// casi (inserimento 1,2,3 -> radice 2; inserimento 1..5 -> altezza 3 con AVL
// contro altezza 5 senza AVL; casi di doppia rotazione LR e RL; uno stress
// test con 100 inserimenti casuali che conferma che l'albero resta sempre
// bilanciato e con altezza O(log n)). Qui la stessa logica viene incapsulata
// in insertWithFrames, che in più registra un fotogramma (clone completo
// dell'albero + testo) ad ogni passo, così l'interfaccia può limitarsi a
// "fotografare" lo stato invece di calcolarlo di nuovo.

let idCounter = 0;

function newNode(value) {
    return { id: idCounter++, value, left: null, right: null, parent: null, height: 1 };
}
function heightOf(n) { return n ? n.height : 0; }
function balanceFactor(n) { return n ? heightOf(n.left) - heightOf(n.right) : 0; }
function updateHeight(n) { n.height = 1 + Math.max(heightOf(n.left), heightOf(n.right)); }

function rotateRight(y) {
    const x = y.left;
    const T2 = x.right;
    const oldParent = y.parent;
    x.right = y;
    y.parent = x;
    y.left = T2;
    if (T2) T2.parent = y;
    x.parent = oldParent;
    if (oldParent) {
        if (oldParent.left === y) oldParent.left = x; else oldParent.right = x;
    }
    updateHeight(y);
    updateHeight(x);
    return x;
}
function rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;
    const oldParent = x.parent;
    y.left = x;
    x.parent = y;
    x.right = T2;
    if (T2) T2.parent = x;
    y.parent = oldParent;
    if (oldParent) {
        if (oldParent.left === x) oldParent.left = y; else oldParent.right = y;
    }
    updateHeight(x);
    updateHeight(y);
    return y;
}

// Clona l'albero senza il puntatore al genitore (per evitare riferimenti
// circolari) — usato per i fotogrammi mostrati in sequenza nell'interfaccia.
function cloneTree(node) {
    if (!node) return null;
    return { id: node.id, value: node.value, left: cloneTree(node.left), right: cloneTree(node.right) };
}
// Altezza e fattore di bilanciamento ricalcolati direttamente dalla
// struttura del clone (non dal campo .height interno): così restano
// corretti da mostrare anche quando il bilanciamento AVL è disattivato e il
// campo .height non viene aggiornato dall'algoritmo.
function cloneHeight(n) { return n ? 1 + Math.max(cloneHeight(n.left), cloneHeight(n.right)) : 0; }
function cloneBF(n) { return n ? cloneHeight(n.left) - cloneHeight(n.right) : 0; }
function countNodes(n) { return n ? 1 + countNodes(n.left) + countNodes(n.right) : 0; }
function isBalancedTree(n) {
    if (!n) return true;
    return Math.abs(cloneBF(n)) <= 1 && isBalancedTree(n.left) && isBalancedTree(n.right);
}

const ROTATION_LABEL = {
    LL: 'rotazione semplice a destra (caso sinistra-sinistra)',
    RR: 'rotazione semplice a sinistra (caso destra-destra)',
    LR: 'rotazione doppia sinistra-destra',
    RL: 'rotazione doppia destra-sinistra'
};

// Inserisce value nell'albero (mutando rootHolder.node, che resta la "vera"
// radice da qui in poi) e restituisce { frames, duplicate }: frames è la
// sequenza di fotogrammi da mostrare uno alla volta nell'interfaccia.
function insertWithFrames(rootHolder, value, avlMode) {
    const frames = [];
    const snap = (highlight, text, phase) => {
        frames.push({ tree: cloneTree(rootHolder.node), highlight, text, phase });
    };

    let cur = rootHolder.node;
    while (cur) {
        if (value === cur.value) {
            snap([cur.id], `Il valore ${value} è già presente nell'albero (niente duplicati): coincide con il nodo ${cur.value}.`, 'duplicate');
            return { frames, duplicate: true };
        }
        if (value < cur.value) {
            snap([cur.id], `Fase 1 (inserimento BST): ${value} < ${cur.value} → scendo a sinistra.`, 'compare');
            if (!cur.left) break;
            cur = cur.left;
        } else {
            snap([cur.id], `Fase 1 (inserimento BST): ${value} > ${cur.value} → scendo a destra.`, 'compare');
            if (!cur.right) break;
            cur = cur.right;
        }
    }

    const n = newNode(value);
    if (!cur) {
        rootHolder.node = n;
        snap([n.id], `Fase 1 (inserimento BST): l'albero era vuoto, ${value} diventa la radice.`, 'new');
    } else {
        n.parent = cur;
        if (value < cur.value) cur.left = n; else cur.right = n;
        snap([n.id], `Fase 1 (inserimento BST): inserito ${value} come figlio di ${cur.value}, esattamente come in un BST normale.`, 'new');
    }

    if (!avlMode) {
        snap([n.id], `Bilanciamento AVL disattivo: nessun controllo di equilibrio dopo l'inserimento.`, 'new');
        return { frames, duplicate: false };
    }

    const ancestors = [];
    let p = n.parent;
    while (p) { ancestors.push(p); p = p.parent; }

    for (const anc of ancestors) {
        updateHeight(anc);
        const bal = balanceFactor(anc);
        snap([anc.id], `Fase 2 (risalgo e controllo): nodo ${anc.value} — altezza sx=${heightOf(anc.left)}, altezza dx=${heightOf(anc.right)}, fattore di bilanciamento = ${bal}.`, 'check');

        if (Math.abs(bal) > 1) {
            const wasRoot = anc.parent === null;
            const beforeIds = [anc.id, anc.left && anc.left.id, anc.right && anc.right.id].filter(x => x !== null && x !== undefined);
            snap(beforeIds, `Fase 3: squilibrio nel nodo ${anc.value} (fattore ${bal} — fuori dal range [-1, 1])! Serve una rotazione.`, 'imbalance');

            let kind, newSubRoot;
            if (bal > 1) {
                if (balanceFactor(anc.left) >= 0) { kind = 'LL'; newSubRoot = rotateRight(anc); }
                else { kind = 'LR'; anc.left = rotateLeft(anc.left); newSubRoot = rotateRight(anc); }
            } else {
                if (balanceFactor(anc.right) <= 0) { kind = 'RR'; newSubRoot = rotateLeft(anc); }
                else { kind = 'RL'; anc.right = rotateRight(anc.right); newSubRoot = rotateLeft(anc); }
            }
            if (wasRoot) rootHolder.node = newSubRoot;

            snap([newSubRoot.id], `Eseguita ${ROTATION_LABEL[kind]}: il sotto-albero ha ora radice ${newSubRoot.value}, e torna bilanciato.`, 'rotate');
        }
    }

    snap([n.id], `✓ Inserimento di ${value} completato.`, 'new');
    return { frames, duplicate: false };
}

// --- Interfaccia -------------------------------------------------------------

const state = {
    rootHolder: { node: null },
    avlMode: true,
    pending: null,   // { frames, index } mentre si avanza fotogramma per fotogramma
    playing: false,
    interval: null,
    speed: 650
};

function ghostLi() {
    const li = document.createElement('li');
    const box = document.createElement('div');
    box.className = 'avl-node ghost';
    box.textContent = '·';
    li.appendChild(box);
    return li;
}

function buildDom(node) {
    const li = document.createElement('li');
    const box = document.createElement('div');
    box.className = 'avl-node';
    box.dataset.id = node.id;

    const val = document.createElement('div');
    val.className = 'avl-node-value';
    val.textContent = node.value;
    box.appendChild(val);

    const bf = cloneBF(node);
    const bfEl = document.createElement('div');
    bfEl.className = 'avl-node-bf' + (Math.abs(bf) > 1 ? ' bf-bad' : '');
    bfEl.textContent = 'bf ' + (bf > 0 ? '+' + bf : bf);
    box.appendChild(bfEl);

    li.appendChild(box);

    if (node.left || node.right) {
        const ul = document.createElement('ul');
        ul.appendChild(node.left ? buildDom(node.left) : ghostLi());
        ul.appendChild(node.right ? buildDom(node.right) : ghostLi());
        li.appendChild(ul);
    }
    return li;
}

function renderTree(tree, highlight, phase) {
    const root = document.getElementById('treeRoot');
    root.innerHTML = '';
    if (!tree) {
        const li = document.createElement('li');
        li.style.listStyle = 'none';
        li.style.color = '#9ca3af';
        li.style.fontStyle = 'italic';
        li.textContent = 'Albero vuoto — inserisci un valore per iniziare.';
        root.appendChild(li);
        return;
    }
    root.appendChild(buildDom(tree));
    const cls = { compare: 'hl-compare', new: 'hl-new', check: 'hl-check', imbalance: 'hl-imbalance', rotate: 'hl-rotate', duplicate: 'hl-check' }[phase] || '';
    if (cls) {
        (highlight || []).forEach(id => {
            const el = root.querySelector(`.avl-node[data-id="${id}"]`);
            if (el) el.classList.add(cls);
        });
    }
}

function renderStats(tree) {
    const n = countNodes(tree);
    const h = cloneHeight(tree);
    const bal = isBalancedTree(tree);
    document.getElementById('statsRow').innerHTML = n === 0
        ? 'Albero vuoto'
        : `Nodi: <span>${n}</span> · Altezza: <span>${h}</span> · ${bal ? '<span style="color:#16a34a">✓ bilanciato</span>' : '<span style="color:#b91c1c">✗ NON bilanciato</span>'}`;
}

function renderFrame(frame) {
    renderTree(frame.tree, frame.highlight, frame.phase);
    document.getElementById('stepCaption').textContent = frame.text;
    renderStats(frame.tree);
}

function setControlsDisabled(disabled) {
    ['insertBtn', 'demoBtn', 'clearBtn', 'avlToggle', 'valueInput'].forEach(id => {
        document.getElementById(id).disabled = disabled;
    });
}

function stopAuto() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.playing = false;
}

function updateModeBadge() {
    const badge = document.getElementById('modeBadge');
    badge.textContent = state.avlMode ? 'AVL ATTIVO' : 'AVL DISATTIVO';
    badge.className = 'avl-mode-badge ' + (state.avlMode ? 'on' : 'off');
}

// Calcola (se serve) i fotogrammi per il valore scritto nell'input e li
// mette in coda in state.pending. Restituisce false se l'input non è valido.
function ensurePending() {
    if (state.pending) return true;
    const input = document.getElementById('valueInput');
    const value = parseInt(input.value, 10);
    if (isNaN(value)) {
        document.getElementById('stepCaption').textContent = 'Scrivi prima un numero da inserire.';
        return false;
    }
    const { frames } = insertWithFrames(state.rootHolder, value, state.avlMode);
    state.pending = { frames, index: -1 };
    return true;
}

function showFinalResultIfNeeded() {
    // Mostra il confronto solo dopo la demo rapida (gestito separatamente).
}

function stepOnce() {
    stopAuto();
    if (!ensurePending()) return;
    if (state.pending.index >= state.pending.frames.length - 1) {
        // L'inserimento corrente è già stato completamente mostrato: libera
        // la coda così un nuovo clic parte con un nuovo inserimento.
        state.pending = null;
        if (!ensurePending()) return;
    }
    state.pending.index++;
    renderFrame(state.pending.frames[state.pending.index]);
    if (state.pending.index >= state.pending.frames.length - 1) {
        state.pending = null;
        document.getElementById('valueInput').value = '';
    }
}

function doInsertAuto() {
    stopAuto();
    if (!ensurePending()) return;
    setControlsDisabled(true);
    state.playing = true;
    state.interval = setInterval(() => {
        state.pending.index++;
        renderFrame(state.pending.frames[state.pending.index]);
        if (state.pending.index >= state.pending.frames.length - 1) {
            stopAuto();
            setControlsDisabled(false);
            state.pending = null;
            document.getElementById('valueInput').value = '';
        }
    }, state.speed);
}

function doClear() {
    stopAuto();
    setControlsDisabled(false);
    state.rootHolder.node = null;
    state.pending = null;
    idCounter = 0;
    renderTree(null, [], '');
    renderStats(null);
    document.getElementById('resultBox').classList.add('hidden');
    document.getElementById('stepCaption').textContent = 'Albero svuotato. Scrivi un numero e premi "Inserisci" o "Passo singolo".';
}

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function doDemo() {
    stopAuto();
    setControlsDisabled(true);
    state.rootHolder.node = null;
    state.pending = null;
    idCounter = 0;
    document.getElementById('resultBox').classList.add('hidden');

    const values = [1, 2, 3, 4, 5];
    let allFrames = [];
    for (const v of values) {
        const { frames } = insertWithFrames(state.rootHolder, v, state.avlMode);
        allFrames = allFrames.concat(frames);
    }

    for (const frame of allFrames) {
        renderFrame(frame);
        await sleep(280);
    }

    const finalTree = cloneTree(state.rootHolder.node);
    const h = cloneHeight(finalTree);
    const n = countNodes(finalTree);
    const resultBox = document.getElementById('resultBox');
    resultBox.classList.remove('hidden');
    if (state.avlMode) {
        resultBox.className = 'result-box good';
        resultBox.innerHTML = `✓ Con il bilanciamento AVL attivo, inserendo 1, 2, 3, 4, 5 in ordine crescente l'albero resta <strong>bilanciato</strong>: ${n} nodi, altezza ${h} (non una catena di altezza ${n}).`;
    } else {
        resultBox.className = 'result-box bad';
        resultBox.innerHTML = `✗ Con il bilanciamento AVL <strong>disattivato</strong>, inserendo 1, 2, 3, 4, 5 in ordine crescente l'albero degenera in una catena lineare: ${n} nodi, altezza ${h} — ogni nodo ha solo il figlio destro, come una lista. Prova a rispuntare la casella AVL e a rifare la demo per vedere la differenza.`;
    }

    setControlsDisabled(false);
    document.getElementById('stepCaption').textContent = 'Demo completata.';
}

document.getElementById('insertBtn').addEventListener('click', doInsertAuto);
document.getElementById('stepBtn').addEventListener('click', stepOnce);
document.getElementById('clearBtn').addEventListener('click', doClear);
document.getElementById('demoBtn').addEventListener('click', doDemo);
document.getElementById('valueInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doInsertAuto();
});

document.getElementById('avlToggle').addEventListener('change', (e) => {
    state.avlMode = !e.target.checked;
    updateModeBadge();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché bastano le rotazioni per sistemare tutto? ▸'
        : 'Perché bastano le rotazioni per sistemare tutto? ▾';
});

// Inizializzazione — il render iniziale avviene qui, non solo dentro
// "Inserisci"/demo, così "Passo singolo" funziona fin da subito.
updateModeBadge();
renderTree(null, [], '');
renderStats(null);
