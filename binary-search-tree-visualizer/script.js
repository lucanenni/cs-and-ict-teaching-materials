let idCounter = 0;

let state = {
    root: null,
    interval: null,
    speed: 500
};

function insertValue(value) {
    let isDuplicate = false;
    let insertedId = null;

    function ins(node) {
        if (!node) {
            const n = { id: idCounter++, value, left: null, right: null };
            insertedId = n.id;
            return n;
        }
        if (value === node.value) {
            isDuplicate = true;
            return node;
        }
        if (value < node.value) node.left = ins(node.left);
        else node.right = ins(node.right);
        return node;
    }

    state.root = ins(state.root);
    return { isDuplicate, insertedId };
}

function countNodes(node) {
    return node ? 1 + countNodes(node.left) + countNodes(node.right) : 0;
}

function heightOf(node) {
    return node ? 1 + Math.max(heightOf(node.left), heightOf(node.right)) : 0;
}

function ghostLi() {
    const li = document.createElement('li');
    li.className = 'ghost-node';
    const box = document.createElement('div');
    box.className = 'node-box';
    box.textContent = '·';
    li.appendChild(box);
    return li;
}

function buildTreeDom(node) {
    const li = document.createElement('li');
    const box = document.createElement('div');
    box.className = 'node-box';
    box.textContent = node.value;
    box.dataset.id = node.id;
    li.appendChild(box);

    if (node.left || node.right) {
        const ul = document.createElement('ul');
        ul.appendChild(node.left ? buildTreeDom(node.left) : ghostLi());
        ul.appendChild(node.right ? buildTreeDom(node.right) : ghostLi());
        li.appendChild(ul);
    }
    return li;
}

function renderTree() {
    const root = document.getElementById('treeRoot');
    root.innerHTML = '';
    if (!state.root) {
        const li = document.createElement('li');
        li.style.listStyle = 'none';
        li.style.color = '#9ca3af';
        li.style.fontStyle = 'italic';
        li.textContent = 'Albero vuoto — inserisci un valore per iniziare.';
        root.appendChild(li);
        return;
    }
    root.appendChild(buildTreeDom(state.root));
}

function renderStats() {
    const n = countNodes(state.root);
    const h = heightOf(state.root);
    const idealH = n > 0 ? Math.ceil(Math.log2(n + 1)) : 0;
    document.getElementById('statsRow').innerHTML = n === 0
        ? 'Albero vuoto'
        : `Nodi: <span>${n}</span> · Altezza attuale: <span>${h}</span> · Altezza minima possibile con ${n} nodi: <span>${idealH}</span>`;
}

function clearAllHighlights() {
    document.querySelectorAll('.node-box').forEach(el => el.classList.remove('comparing', 'found', 'new-node'));
}

function nodeEl(id) {
    return document.querySelector(`.node-box[data-id="${id}"]`);
}

function setControlsDisabled(disabled) {
    ['insertBtn', 'searchBtn', 'randomBtn', 'clearBtn', 'inorderBtn'].forEach(id => {
        document.getElementById(id).disabled = disabled;
    });
}

function stopAnim() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
}

function playFrames(frames, onFrame, onDone) {
    stopAnim();
    setControlsDisabled(true);
    let i = -1;
    const tick = () => {
        i++;
        if (i >= frames.length) {
            stopAnim();
            setControlsDisabled(false);
            if (onDone) onDone();
            return;
        }
        onFrame(frames[i], i);
    };
    tick();
    state.interval = setInterval(tick, state.speed);
}

function generateSearchFrames(root, target) {
    const frames = [];
    let node = root;
    while (node) {
        if (target === node.value) {
            frames.push({ nodeId: node.id, nodeValue: node.value, result: 'equal' });
            break;
        }
        if (target < node.value) {
            frames.push({ nodeId: node.id, nodeValue: node.value, result: 'less' });
            node = node.left;
        } else {
            frames.push({ nodeId: node.id, nodeValue: node.value, result: 'greater' });
            node = node.right;
        }
    }
    return frames;
}

function generateInorderFrames(root) {
    const frames = [];
    function visit(node) {
        if (!node) return;
        visit(node.left);
        frames.push({ nodeId: node.id, value: node.value });
        visit(node.right);
    }
    visit(root);
    return frames;
}

function doInsert() {
    const input = document.getElementById('valueInput');
    const value = parseInt(input.value, 10);
    const caption = document.getElementById('stepCaption');
    if (isNaN(value)) {
        caption.textContent = 'Scrivi prima un numero da inserire.';
        return;
    }
    const { isDuplicate, insertedId } = insertValue(value);
    renderTree();
    renderStats();
    document.getElementById('outputBox').classList.add('hidden');
    if (isDuplicate) {
        caption.textContent = `Il valore ${value} è già presente nell'albero (niente duplicati).`;
    } else {
        caption.textContent = `Inserito ${value}.`;
        const el = nodeEl(insertedId);
        if (el) el.classList.add('new-node');
    }
    input.value = '';
    input.focus();
}

function doSearch() {
    const input = document.getElementById('valueInput');
    const target = parseInt(input.value, 10);
    const caption = document.getElementById('stepCaption');
    if (isNaN(target)) {
        caption.textContent = 'Scrivi prima un numero da cercare.';
        return;
    }
    if (!state.root) {
        caption.textContent = "L'albero è vuoto: niente da cercare.";
        return;
    }
    const frames = generateSearchFrames(state.root, target);
    clearAllHighlights();
    document.getElementById('outputBox').classList.add('hidden');
    playFrames(frames, (frame) => {
        const el = nodeEl(frame.nodeId);
        if (frame.result === 'equal') {
            el.classList.add('found');
            caption.textContent = `${target} = ${frame.nodeValue}: trovato! ✅ (in ${frames.indexOf(frame) + 1} confronti)`;
        } else {
            el.classList.add('comparing');
            caption.textContent = frame.result === 'less'
                ? `${target} < ${frame.nodeValue}: vai a sinistra.`
                : `${target} > ${frame.nodeValue}: vai a destra.`;
        }
    }, () => {
        const last = frames[frames.length - 1];
        if (last.result !== 'equal') {
            caption.textContent = `${target} non è presente nell'albero: la ricerca si ferma qui dopo ${frames.length} confronti (è dove ${target} verrebbe inserito).`;
        }
    });
}

function doInorder() {
    const caption = document.getElementById('stepCaption');
    if (!state.root) {
        caption.textContent = "L'albero è vuoto: niente da visitare.";
        return;
    }
    const frames = generateInorderFrames(state.root);
    clearAllHighlights();
    const outputBox = document.getElementById('outputBox');
    const outputValues = document.getElementById('outputValues');
    outputBox.classList.remove('hidden');
    outputValues.textContent = '';
    const collected = [];
    playFrames(frames, (frame) => {
        const el = nodeEl(frame.nodeId);
        el.classList.add('found');
        collected.push(frame.value);
        outputValues.textContent = collected.join(', ');
        caption.textContent = `Visitato ${frame.value}.`;
    }, () => {
        caption.textContent = `Visita completata: sempre in ordine crescente, qualunque sia la forma dell'albero.`;
    });
}

function doRandomTree() {
    stopAnim();
    setControlsDisabled(false);
    state.root = null;
    idCounter = 0;
    const pool = Array.from({ length: 50 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const chosen = pool.slice(0, 10);
    chosen.forEach(v => insertValue(v));
    renderTree();
    renderStats();
    document.getElementById('outputBox').classList.add('hidden');
    document.getElementById('stepCaption').textContent =
        `Nuovo albero con 10 valori casuali, inseriti in quest'ordine: ${chosen.join(', ')}.`;
}

function doClear() {
    stopAnim();
    setControlsDisabled(false);
    state.root = null;
    idCounter = 0;
    renderTree();
    renderStats();
    document.getElementById('outputBox').classList.add('hidden');
    document.getElementById('stepCaption').textContent = '';
}

document.getElementById('insertBtn').addEventListener('click', doInsert);
document.getElementById('valueInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doInsert();
});
document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('inorderBtn').addEventListener('click', doInorder);
document.getElementById('randomBtn').addEventListener('click', doRandomTree);
document.getElementById('clearBtn').addEventListener('click', doClear);

document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value, 10);
    document.getElementById('speedValue').textContent = state.speed + 'ms';
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? "Perché l'ordine di inserimento cambia tutto? ▸"
        : "Perché l'ordine di inserimento cambia tutto? ▾";
});

// Inizializzazione
doRandomTree();
