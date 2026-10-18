// --- Logica pura della lista concatenata ------------------------------------
// Verificata a parte con uno script Node prima di essere collegata al DOM
// (vedi il README): ogni operazione produce lo stato finale corretto e,
// nel caso dell'inserimento in testa, dimostra che il nuovo nodo punta già
// al vecchio primo nodo PRIMA che la testa venga spostata.

function cloneState(state) {
    const nodes = {};
    Object.keys(state.nodes).forEach(id => { nodes[id] = { value: state.nodes[id].value, next: state.nodes[id].next }; });
    return { nodes, headId: state.headId, nextId: state.nextId };
}

function chainFrom(nodes, startId) {
    const order = [];
    let cur = startId;
    const seen = new Set();
    while (cur !== null && cur !== undefined) {
        if (seen.has(cur)) break;
        seen.add(cur);
        order.push(cur);
        cur = nodes[cur].next;
    }
    return order;
}

function snapshot(work, extra) {
    const values = {};
    const nextPointers = {};
    Object.keys(work.nodes).forEach(id => {
        values[id] = work.nodes[id].value;
        nextPointers[id] = work.nodes[id].next;
    });
    return Object.assign({ values, nextPointers, headArrowTo: work.headId }, extra);
}

function opInsertHead(state, value) {
    const work = cloneState(state);
    const newId = String(work.nextId++);
    const oldHeadId = work.headId;
    const steps = [];

    work.nodes[newId] = { value, next: undefined };
    steps.push(snapshot(work, {
        order: [newId, ...chainFrom(work.nodes, oldHeadId)], newId,
        text: `Si crea il nuovo nodo con valore <strong>${value}</strong>. Non è ancora collegato a nessuno: se lo lasciassimo così, sarebbe irraggiungibile.`
    }));

    work.nodes[newId].next = oldHeadId;
    steps.push(snapshot(work, {
        order: chainFrom(work.nodes, newId), newId,
        text: `Il nuovo nodo viene fatto puntare al <strong>vecchio primo nodo</strong>${oldHeadId !== null ? '' : ' (che non esiste: la lista era vuota)'}. La TESTA non si è ancora spostata: se si spostasse prima di questo passo, il resto della lista andrebbe perso.`
    }));

    work.headId = newId;
    steps.push(snapshot(work, {
        order: chainFrom(work.nodes, work.headId), newId,
        text: `Solo ora la <strong>TESTA</strong> viene aggiornata per puntare al nuovo nodo. Nessun altro nodo esistente è stato toccato o spostato: l'inserimento in testa costa sempre lo stesso, qualunque sia la lunghezza della lista.`
    }));

    return { state: work, steps };
}

function opInsertTail(state, value) {
    const work = cloneState(state);
    const newId = String(work.nextId++);
    const steps = [];

    if (work.headId === null) {
        work.nodes[newId] = { value, next: null };
        work.headId = newId;
        steps.push(snapshot(work, {
            order: [newId], newId,
            text: `La lista è vuota: il nuovo nodo con valore <strong>${value}</strong> diventa anche la testa.`
        }));
        return { state: work, steps };
    }

    const order = chainFrom(work.nodes, work.headId);
    const lastId = order[order.length - 1];
    steps.push(snapshot(work, {
        order, highlightIds: order,
        text: `Per trovare l'ultimo nodo occorre <strong>attraversare la lista dalla testa</strong>, nodo per nodo: una lista concatenata semplice non sa dove sia la coda senza percorrerla tutta.`
    }));

    work.nodes[newId] = { value, next: null };
    steps.push(snapshot(work, {
        order: [...order, newId], newId,
        text: `Si crea il nuovo nodo con valore <strong>${value}</strong>, ancora isolato in coda.`
    }));

    work.nodes[lastId].next = newId;
    steps.push(snapshot(work, {
        order: chainFrom(work.nodes, work.headId), newId,
        text: `L'ultimo nodo che esisteva prima (valore ${work.nodes[lastId] ? state.nodes[lastId].value : ''}) viene aggiornato per puntare al nuovo nodo, che diventa la nuova coda della lista.`
    }));

    return { state: work, steps };
}

function opInsertAfter(state, afterId, value) {
    const work = cloneState(state);
    const newId = String(work.nextId++);
    const afterNext = work.nodes[afterId].next;
    const baseOrder = chainFrom(work.nodes, work.headId);
    const idx = baseOrder.indexOf(afterId);
    const displayOrder = [...baseOrder.slice(0, idx + 1), newId, ...baseOrder.slice(idx + 1)];
    const afterValue = state.nodes[afterId].value;
    const steps = [];

    work.nodes[newId] = { value, next: undefined };
    steps.push(snapshot(work, {
        order: displayOrder, newId, highlightIds: [afterId],
        text: `Si crea il nuovo nodo con valore <strong>${value}</strong>, da inserire subito dopo il nodo con valore ${afterValue}. Non è ancora collegato a nulla.`
    }));

    work.nodes[newId].next = afterNext;
    steps.push(snapshot(work, {
        order: displayOrder, newId, highlightIds: [afterId],
        text: `Il nuovo nodo viene fatto puntare a chi era il successivo del nodo ${afterValue}. Per un istante, il nodo ${afterValue} punta ancora al suo vecchio successivo: il collegamento non è stato ancora aggiornato.`
    }));

    work.nodes[afterId].next = newId;
    steps.push(snapshot(work, {
        order: chainFrom(work.nodes, work.headId), newId, highlightIds: [afterId],
        text: `Il nodo ${afterValue} viene aggiornato per puntare al nuovo nodo. Nessun altro nodo della lista è stato spostato.`
    }));

    return { state: work, steps };
}

function opRemove(state, id) {
    const work = cloneState(state);
    const steps = [];
    const baseOrder = chainFrom(work.nodes, work.headId);
    const removedValue = state.nodes[id].value;

    if (work.headId === id) {
        const newHead = work.nodes[id].next;
        steps.push(snapshot(work, {
            order: baseOrder, removingId: id,
            text: `Si vuole rimuovere la <strong>TESTA</strong> (valore ${removedValue}).`
        }));
        work.headId = newHead;
        steps.push(snapshot(work, {
            order: baseOrder, removingId: id,
            text: `La TESTA viene spostata direttamente sul nodo successivo, <strong>scavalcando</strong> quello da rimuovere.`
        }));
        delete work.nodes[id];
        steps.push(snapshot(work, {
            order: chainFrom(work.nodes, work.headId),
            text: `Il nodo rimosso non è più raggiungibile da nessun puntatore: viene eliminato.`
        }));
        return { state: work, steps };
    }

    const idx = baseOrder.indexOf(id);
    const predId = baseOrder[idx - 1];
    const predValue = state.nodes[predId].value;
    const nextOfRemoved = work.nodes[id].next;
    steps.push(snapshot(work, {
        order: baseOrder, highlightIds: [predId, id],
        text: `Si attraversa la lista dalla testa per trovare il nodo <strong>precedente</strong> a quello da rimuovere: è il nodo con valore ${predValue}.`
    }));
    work.nodes[predId].next = nextOfRemoved;
    steps.push(snapshot(work, {
        order: baseOrder, removingId: id, highlightIds: [predId],
        text: `Il nodo ${predValue} viene fatto puntare direttamente al nodo successivo a quello rimosso, <strong>scavalcandolo</strong>.`
    }));
    delete work.nodes[id];
    steps.push(snapshot(work, {
        order: chainFrom(work.nodes, work.headId),
        text: `Il nodo rimosso (valore ${removedValue}) non è più collegato a nulla ed è eliminato.`
    }));
    return { state: work, steps };
}

function opSearch(state, value) {
    const order = chainFrom(state.nodes, state.headId);
    const values = {}, nextPointers = {};
    order.forEach(id => { values[id] = state.nodes[id].value; nextPointers[id] = state.nodes[id].next; });
    const steps = [];
    for (const id of order) {
        const match = String(state.nodes[id].value) === String(value);
        steps.push({
            order, values, nextPointers, headArrowTo: state.headId,
            highlightIds: [id], foundId: match ? id : null,
            text: match
                ? `Il nodo con valore <strong>${state.nodes[id].value}</strong> corrisponde: valore trovato!`
                : `Il nodo con valore ${state.nodes[id].value} non corrisponde a "${value}": si passa al nodo successivo.`
        });
        if (match) return { found: true, steps };
    }
    steps.push({
        order, values, nextPointers, headArrowTo: state.headId,
        highlightIds: [], foundId: null, notFoundEnd: true,
        text: `Si è raggiunta la fine della lista senza trovare "${value}": il valore non è presente.`
    });
    return { found: false, steps };
}

// --- Stato dell'applicazione -------------------------------------------------

const OPERATIONS = [
    { key: 'insertHead', label: 'Inserisci in testa', needsValue: true, needsTarget: false, valueLabel: 'Valore da inserire' },
    { key: 'insertTail', label: 'Inserisci in coda', needsValue: true, needsTarget: false, valueLabel: 'Valore da inserire' },
    { key: 'insertAfter', label: 'Inserisci dopo un nodo', needsValue: true, needsTarget: true, valueLabel: 'Valore da inserire' },
    { key: 'remove', label: 'Rimuovi un nodo', needsValue: false, needsTarget: true, valueLabel: 'Valore' },
    { key: 'search', label: 'Cerca un valore', needsValue: true, needsTarget: false, valueLabel: 'Valore da cercare' }
];

function initialListState() {
    return {
        nodes: { '1': { value: 10, next: '2' }, '2': { value: 20, next: '3' }, '3': { value: 30, next: null } },
        headId: '1',
        nextId: 4
    };
}

const app = {
    listState: initialListState(),
    opKey: 'insertHead',
    currentSteps: [],
    current: -1,
    interval: null,
    speed: 1300,
    applied: false,
    pendingResultState: null,
    searchFound: null
};

function currentOp() {
    return OPERATIONS.find(o => o.key === app.opKey);
}

function renderChips() {
    const wrap = document.getElementById('opChips');
    wrap.innerHTML = '';
    OPERATIONS.forEach(op => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip' + (op.key === app.opKey ? ' active' : '');
        chip.textContent = op.label;
        chip.addEventListener('click', () => {
            app.opKey = op.key;
            renderChips();
            updateFormVisibility();
            regenerateSteps();
        });
        wrap.appendChild(chip);
    });
}

function updateFormVisibility() {
    const op = currentOp();
    document.getElementById('valueGroup').classList.toggle('hidden', !op.needsValue);
    document.getElementById('targetGroup').classList.toggle('hidden', !op.needsTarget);
    document.getElementById('valueLabel').textContent = op.valueLabel;
    if (op.needsTarget) renderTargetSelect();
}

function renderTargetSelect() {
    const sel = document.getElementById('targetSelect');
    const order = chainFrom(app.listState.nodes, app.listState.headId);
    const prevValue = sel.value;
    sel.innerHTML = '';
    if (order.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '— lista vuota —';
        sel.appendChild(opt);
        return;
    }
    order.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = `valore ${app.listState.nodes[id].value}`;
        sel.appendChild(opt);
    });
    if (order.includes(prevValue)) sel.value = prevValue;
}

function nextCaption(nextVal, values) {
    if (nextVal === undefined) return '(non collegato)';
    if (nextVal === null) return '→ fine';
    if (values[nextVal] !== undefined) return `→ valore ${values[nextVal]}`;
    return `→ #${nextVal}`;
}

function renderDiagram(step) {
    const row = document.getElementById('listRow');
    const headTarget = step.headArrowTo;
    const headCaption = headTarget === null ? 'vuota' : `→ valore ${step.values[headTarget]}`;
    const headLinkedToFirst = step.order.length > 0 ? headTarget === step.order[0] : headTarget === null;

    let html = `<div class="head-box"><span class="head-label">TESTA</span><div class="head-chip">${headCaption}</div></div>`;
    html += `<span class="arrow-glyph" style="color:${headLinkedToFirst ? '#1d4ed8' : '#d1d5db'}">${headLinkedToFirst ? '━▶' : '┄▶'}</span>`;

    step.order.forEach((id, idx) => {
        const classes = ['node-box'];
        if (id === step.newId) classes.push('new-node');
        if (id === step.removingId) classes.push('removing-node');
        if (step.highlightIds && step.highlightIds.includes(id)) classes.push('highlight-node');
        if (id === step.foundId) classes.push('found-node');
        const nextVal = step.nextPointers[id];
        html += `<div class="node-unit"><div class="${classes.join(' ')}" data-id="${id}"><div class="node-value">${step.values[id]}</div><div class="node-next">${nextCaption(nextVal, step.values)}</div></div>`;
        const nextInOrder = idx < step.order.length - 1 ? step.order[idx + 1] : null;
        const linked = nextVal === nextInOrder;
        html += `<span class="arrow-glyph" style="color:${linked ? '#1d4ed8' : '#d1d5db'}">${linked ? '━▶' : '┄▶'}</span></div>`;
    });

    html += `<div class="null-box">fine<br>(NULL)</div>`;
    row.innerHTML = html;

    row.querySelectorAll('.node-box').forEach(box => {
        box.addEventListener('click', () => {
            const sel = document.getElementById('targetSelect');
            if (!sel) return;
            const id = box.dataset.id;
            if (Array.from(sel.options).some(o => o.value === id)) {
                sel.value = id;
                regenerateSteps();
            }
        });
    });
}

function renderEmptyDiagram() {
    const order = chainFrom(app.listState.nodes, app.listState.headId);
    const values = {}, nextPointers = {};
    order.forEach(id => { values[id] = app.listState.nodes[id].value; nextPointers[id] = app.listState.nodes[id].next; });
    renderDiagram({ order, values, nextPointers, headArrowTo: app.listState.headId });
}

function stopAuto() {
    if (app.interval) clearInterval(app.interval);
    app.interval = null;
}

function render() {
    const panel = document.getElementById('stepPanel');
    const runBtn = document.getElementById('runBtn');
    const stepBtn = document.getElementById('stepBtn');
    const resultBox = document.getElementById('resultBox');

    if (app.currentSteps.length === 0) {
        renderEmptyDiagram();
        panel.innerHTML = '<span class="step-line">Nessuna operazione pronta: scegli un nodo di riferimento valido (la lista potrebbe essere vuota).</span>';
        runBtn.disabled = true;
        stepBtn.disabled = true;
        resultBox.className = 'result-box';
        resultBox.textContent = '';
        return;
    }

    runBtn.disabled = false;

    if (app.current < 0) {
        renderEmptyDiagram();
        panel.innerHTML = '<span class="step-line">Pronto. Premi "Avvia" o "Passo singolo" per eseguire l\'operazione passo per passo.</span>';
        stepBtn.disabled = false;
        resultBox.className = 'result-box';
        resultBox.textContent = '';
        return;
    }

    const step = app.currentSteps[app.current];
    renderDiagram(step);

    panel.innerHTML = app.currentSteps.slice(0, app.current + 1).map((s, i) =>
        `<div class="step-line ${i === app.current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
    ).join('');
    panel.scrollTop = panel.scrollHeight;

    stepBtn.disabled = app.current >= app.currentSteps.length - 1;

    if (app.current >= app.currentSteps.length - 1 && !app.applied) {
        applyOutcome();
    }
}

function applyOutcome() {
    app.applied = true;
    const resultBox = document.getElementById('resultBox');
    const op = currentOp();
    if (op.key === 'search') {
        if (app.searchFound) {
            resultBox.className = 'result-box good';
            resultBox.textContent = '✓ Valore trovato nella lista.';
        } else {
            resultBox.className = 'result-box bad';
            resultBox.textContent = '✗ Valore non presente nella lista.';
        }
        return;
    }
    app.listState = app.pendingResultState;
    const order = chainFrom(app.listState.nodes, app.listState.headId);
    const valuesList = order.map(id => app.listState.nodes[id].value).join(', ');
    resultBox.className = 'result-box good';
    resultBox.textContent = `✓ Operazione completata. La lista ora contiene: ${order.length ? valuesList : '(vuota)'}.`;
    renderTargetSelect();
}

function regenerateSteps() {
    stopAuto();
    app.applied = false;
    app.current = -1;
    app.searchFound = null;
    app.pendingResultState = null;

    const op = currentOp();
    const valueRaw = document.getElementById('valueInput').value.trim();
    const targetId = document.getElementById('targetSelect') ? document.getElementById('targetSelect').value : null;

    if (op.needsTarget && !targetId) {
        app.currentSteps = [];
        render();
        return;
    }

    let result;
    if (op.key === 'insertHead') result = opInsertHead(app.listState, valueRaw);
    else if (op.key === 'insertTail') result = opInsertTail(app.listState, valueRaw);
    else if (op.key === 'insertAfter') result = opInsertAfter(app.listState, targetId, valueRaw);
    else if (op.key === 'remove') result = opRemove(app.listState, targetId);
    else if (op.key === 'search') result = opSearch(app.listState, valueRaw);

    if (op.key === 'search') {
        app.currentSteps = result.steps;
        app.searchFound = result.found;
    } else {
        app.currentSteps = result.steps;
        app.pendingResultState = result.state;
    }

    render();
}

function advance() {
    if (app.current >= app.currentSteps.length - 1) { stopAuto(); return; }
    app.current++;
    render();
    if (app.current >= app.currentSteps.length - 1) stopAuto();
}

function startAuto() {
    stopAuto();
    if (app.currentSteps.length === 0) return;
    if (app.current >= app.currentSteps.length - 1) { app.current = -1; app.applied = false; }
    render();
    app.interval = setInterval(advance, app.speed);
}

function stepOnce() {
    stopAuto();
    advance();
}

document.getElementById('runBtn').addEventListener('click', startAuto);
document.getElementById('stepBtn').addEventListener('click', stepOnce);

document.getElementById('valueInput').addEventListener('input', regenerateSteps);
document.getElementById('targetSelect').addEventListener('change', regenerateSteps);

document.getElementById('clearListBtn').addEventListener('click', () => {
    stopAuto();
    app.listState = { nodes: {}, headId: null, nextId: 1 };
    renderTargetSelect();
    regenerateSteps();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'In cosa è diversa da un array? ▸' : 'In cosa è diversa da un array? ▾';
});

renderChips();
updateFormVisibility();
regenerateSteps();
