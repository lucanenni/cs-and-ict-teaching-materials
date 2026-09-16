const BRANCH_COLORS = ['#ea580c', '#0891b2', '#7c3aed', '#16a34a', '#db2777', '#0284c7'];

let state = null;
let idCounter = 0;

function newId() {
    return (idCounter++).toString(36);
}

function initState() {
    idCounter = 0;
    const rootId = newId();
    state = {
        commits: { [rootId]: { id: rootId, parents: [], message: 'commit iniziale', lane: 0 } },
        branches: { main: rootId },
        branchLanes: { main: 0 },
        currentBranch: 'main',
        order: [rootId]
    };
}

function isAncestor(ancestorId, commitId) {
    const stack = [commitId];
    const seen = new Set();
    while (stack.length) {
        const id = stack.pop();
        if (id === ancestorId) return true;
        if (seen.has(id)) continue;
        seen.add(id);
        (state.commits[id].parents || []).forEach(p => stack.push(p));
    }
    return false;
}

function showError(msg) {
    const el = document.getElementById('errorText');
    el.textContent = msg;
    el.classList.remove('hidden');
}
function clearError() {
    document.getElementById('errorText').classList.add('hidden');
}

function doCommit() {
    clearError();
    const msgInput = document.getElementById('commitMsgInput');
    const message = msgInput.value.trim() || 'commit senza messaggio';
    const parentId = state.branches[state.currentBranch];
    const id = newId();
    state.commits[id] = { id, parents: [parentId], message, lane: state.branchLanes[state.currentBranch] };
    state.branches[state.currentBranch] = id;
    state.order.push(id);
    msgInput.value = '';
    renderAll();
}

function doNewBranch() {
    clearError();
    const input = document.getElementById('newBranchInput');
    const name = input.value.trim();
    if (!name) { showError('Scrivi un nome per il nuovo branch.'); return; }
    if (state.branches[name]) { showError(`Esiste già un branch chiamato "${name}".`); return; }
    state.branches[name] = state.branches[state.currentBranch];
    const usedLanes = new Set(Object.values(state.branchLanes));
    let lane = 0;
    while (usedLanes.has(lane)) lane++;
    state.branchLanes[name] = lane;
    input.value = '';
    renderAll();
}

function doCheckout() {
    clearError();
    const name = document.getElementById('checkoutSelect').value;
    if (!name) return;
    state.currentBranch = name;
    renderAll();
}

function doMerge() {
    clearError();
    const otherName = document.getElementById('mergeSelect').value;
    if (!otherName) { showError('Scegli un branch da unire.'); return; }
    if (otherName === state.currentBranch) { showError('Non puoi unire un branch con se stesso.'); return; }
    const currentTip = state.branches[state.currentBranch];
    const otherTip = state.branches[otherName];

    if (currentTip === otherTip || isAncestor(otherTip, currentTip)) {
        showError(`"${state.currentBranch}" è già aggiornato rispetto a "${otherName}": niente da unire.`);
        return;
    }
    if (isAncestor(currentTip, otherTip)) {
        // fast-forward: sposta solo l'etichetta del branch, nessun nuovo commit
        state.branches[state.currentBranch] = otherTip;
        renderAll();
        return;
    }
    const id = newId();
    state.commits[id] = {
        id,
        parents: [currentTip, otherTip],
        message: `merge di ${otherName} in ${state.currentBranch}`,
        lane: state.branchLanes[state.currentBranch]
    };
    state.branches[state.currentBranch] = id;
    state.order.push(id);
    renderAll();
}

function renderSelects() {
    const branchNames = Object.keys(state.branches);
    const checkoutSelect = document.getElementById('checkoutSelect');
    const mergeSelect = document.getElementById('mergeSelect');
    checkoutSelect.innerHTML = branchNames.map(n => `<option value="${n}">${n}</option>`).join('');
    checkoutSelect.value = state.currentBranch;
    mergeSelect.innerHTML = branchNames.filter(n => n !== state.currentBranch).map(n => `<option value="${n}">${n}</option>`).join('');
    document.getElementById('currentBranchName').textContent = state.currentBranch;
}

function branchColor(name) {
    return BRANCH_COLORS[state.branchLanes[name] % BRANCH_COLORS.length];
}

function renderGraph() {
    const svg = document.getElementById('graphSvg');
    const NS = 'http://www.w3.org/2000/svg';
    const laneW = 110, rowH = 64, marginX = 60, marginTop = 30;
    const numLanes = Object.keys(state.branchLanes).length;
    const width = marginX * 2 + laneW * numLanes;
    const height = marginTop + rowH * state.order.length + 40;
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = '';

    const posOf = (id) => {
        const c = state.commits[id];
        const idx = state.order.indexOf(id);
        return { x: marginX + c.lane * laneW, y: marginTop + idx * rowH };
    };

    // Archi verso i genitori (disegnati per primi, sotto ai nodi)
    state.order.forEach(id => {
        const c = state.commits[id];
        const p1 = posOf(id);
        c.parents.forEach(parentId => {
            const p2 = posOf(parentId);
            const line = document.createElementNS(NS, 'path');
            line.setAttribute('d', `M${p1.x},${p1.y} C${p1.x},${(p1.y + p2.y) / 2} ${p2.x},${(p1.y + p2.y) / 2} ${p2.x},${p2.y}`);
            line.setAttribute('stroke', '#cbd5e1');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('fill', 'none');
            svg.appendChild(line);
        });
    });

    // Nodi commit
    state.order.forEach(id => {
        const c = state.commits[id];
        const { x, y } = posOf(id);
        const isMerge = c.parents.length > 1;
        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', x); circle.setAttribute('cy', y); circle.setAttribute('r', isMerge ? 10 : 8);
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', '#6b7280');
        circle.setAttribute('stroke-width', '2.5');
        svg.appendChild(circle);

        const idLabel = document.createElementNS(NS, 'text');
        idLabel.setAttribute('x', x); idLabel.setAttribute('y', y - 16);
        idLabel.setAttribute('text-anchor', 'middle');
        idLabel.setAttribute('font-size', '10');
        idLabel.setAttribute('fill', '#9ca3af');
        idLabel.setAttribute('font-family', 'monospace');
        idLabel.textContent = id;
        svg.appendChild(idLabel);

        const msgLabel = document.createElementNS(NS, 'text');
        msgLabel.setAttribute('x', x + 16); msgLabel.setAttribute('y', y + 4);
        msgLabel.setAttribute('font-size', '10.5');
        msgLabel.setAttribute('fill', '#374151');
        msgLabel.textContent = c.message;
        svg.appendChild(msgLabel);
    });

    // Etichette dei branch, accanto al loro commit di punta
    Object.entries(state.branches).forEach(([name, commitId]) => {
        const { x, y } = posOf(commitId);
        const isCurrent = name === state.currentBranch;
        const lane = state.branchLanes[name];
        const tagX = marginX + lane * laneW - 46;
        const g = document.createElementNS(NS, 'g');

        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', tagX - 2); rect.setAttribute('y', y - 10);
        rect.setAttribute('width', 42); rect.setAttribute('height', 18);
        rect.setAttribute('rx', 4);
        rect.setAttribute('fill', branchColor(name));
        g.appendChild(rect);

        const text = document.createElementNS(NS, 'text');
        text.setAttribute('x', tagX + 19); text.setAttribute('y', y + 3);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '9');
        text.setAttribute('font-family', 'monospace');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', 'white');
        text.textContent = name.length > 6 ? name.slice(0, 5) + '…' : name;
        g.appendChild(text);

        if (isCurrent) {
            const head = document.createElementNS(NS, 'text');
            head.setAttribute('x', tagX + 19); head.setAttribute('y', y - 14);
            head.setAttribute('text-anchor', 'middle');
            head.setAttribute('font-size', '8.5');
            head.setAttribute('font-weight', 'bold');
            head.setAttribute('fill', '#1f2937');
            head.textContent = 'HEAD';
            g.appendChild(head);
        }

        svg.appendChild(g);
        g.setAttribute('title', name);
    });
}

function renderAll() {
    renderSelects();
    renderGraph();
}

document.getElementById('commitBtn').addEventListener('click', doCommit);
document.getElementById('branchBtn').addEventListener('click', doNewBranch);
document.getElementById('checkoutBtn').addEventListener('click', doCheckout);
document.getElementById('mergeBtn').addEventListener('click', doMerge);
document.getElementById('resetBtn').addEventListener('click', () => { initState(); clearError(); renderAll(); });

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Cos\'è un merge "fast-forward"? ▸' : 'Cos\'è un merge "fast-forward"? ▾';
});

// Inizializzazione
initState();
renderAll();
