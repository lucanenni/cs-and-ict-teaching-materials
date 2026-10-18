// --- Token passing: un gettone che gira, un nodo alla volta -----------------
// La logica pura (buildScenario più sotto) è stata verificata a parte in
// Node su: nessun richiedente, un solo nodo (destinazione = nodo opposto),
// due nodi che si scambiano i frame (ordine di invio = ordine in cui il
// token li raggiunge) e 100 combinazioni casuali di nodi/punto di partenza
// del token: termina sempre con il numero giusto di trasmissioni, e ogni
// trasmissione si conclude (conferma) prima che la successiva inizi — quindi
// nessuna collisione è mai possibile, per costruzione dell'algoritmo stesso.

const N = 6; // numero di nodi nell'anello

function assignDestinations(wantIds) {
    const dest = {};
    if (wantIds.length === 1) {
        dest[wantIds[0]] = (wantIds[0] + Math.floor(N / 2)) % N;
    } else {
        wantIds.forEach((id, i) => { dest[id] = wantIds[(i + 1) % wantIds.length]; });
    }
    return dest;
}

function buildScenario(wantIds, startToken) {
    const dest = assignDestinations(wantIds);
    const sentSet = new Set();
    const steps = [];
    let token = typeof startToken === 'number' ? startToken : 0;
    let guard = 0;
    const totalWanting = wantIds.length;

    if (totalWanting === 0) {
        steps.push({ type: 'idle', node: token, text: `Il token circola (ora a N${token}) ma nessun nodo ha un frame pronto: passa semplicemente di mano in mano.` });
        return steps;
    }

    while (sentSet.size < totalWanting && guard < 500) {
        guard++;
        if (wantIds.includes(token) && !sentSet.has(token)) {
            const d = dest[token];
            steps.push({ type: 'seize', node: token, from: token, dest: d, text: `Il token arriva a N${token}: lo trattiene (nessun altro può trasmettere ora) e allega un frame per N${d}.` });

            let pos = token;
            while (pos !== d) {
                pos = (pos + 1) % N;
                if (pos === d) {
                    steps.push({ type: 'deliver', node: pos, from: token, dest: d, text: `Il frame raggiunge N${d}: lo copia, è il destinatario.` });
                } else {
                    steps.push({ type: 'relay', node: pos, from: token, dest: d, text: `Il frame passa per N${pos} (non è il destinatario): lo ripete sull'anello senza fermarlo.` });
                }
            }
            while (pos !== token) {
                pos = (pos + 1) % N;
                if (pos === token) {
                    steps.push({ type: 'confirm', node: pos, from: token, dest: d, text: `Il frame torna a N${token}, che lo rimuove dall'anello: consegna confermata. N${token} rilascia il token.` });
                } else {
                    steps.push({ type: 'relay-return', node: pos, from: token, dest: d, text: `Il frame continua il giro di ritorno passando per N${pos}.` });
                }
            }
            sentSet.add(token);
            const nextHolder = (token + 1) % N;
            const stillWaiting = wantIds.filter(id => !sentSet.has(id));
            steps.push({
                type: 'release', node: nextHolder, text: `Il token riparte verso N${nextHolder}.` +
                    (stillWaiting.length ? ` In attesa del proprio turno: ${stillWaiting.map(w => 'N' + w).join(', ')}.` : '')
            });
            token = nextHolder;
        } else {
            const prev = token;
            token = (token + 1) % N;
            const waiting = wantIds.filter(id => !sentSet.has(id));
            steps.push({
                type: 'pass', node: token, text: `N${prev} non ha nulla da trasmettere: passa subito il token a N${token}.` +
                    (waiting.length ? ` (${waiting.map(w => 'N' + w).join(', ')} in attesa del proprio turno)` : '')
            });
        }
    }

    steps.push({ type: 'done', node: token, text: 'Tutti i nodi con un frame pronto hanno trasmesso, ciascuno al proprio turno: nessuna collisione è mai stata possibile, per costruzione.' });
    return steps;
}

// --- Interfaccia -------------------------------------------------------------

const NODE_IDS = [0, 1, 2, 3, 4, 5];
let wanting = new Set([1, 4]);
let steps = [];
let runState = { current: 0, isPlaying: false, interval: null, speed: 650 };

function nodePos(i) {
    const angle = (-90 + i * (360 / N)) * Math.PI / 180;
    const R = 39;
    return { x: 50 + R * Math.cos(angle), y: 50 + R * Math.sin(angle) };
}

function destHint() {
    const list = Array.from(wanting).sort((a, b) => a - b);
    const dest = assignDestinations(list);
    return dest;
}

function buildDevicePicker() {
    const wrap = document.getElementById('devicePicker');
    wrap.innerHTML = '';
    const dest = destHint();
    NODE_IDS.forEach(i => {
        const label = document.createElement('label');
        label.className = 'device-check' + (wanting.has(i) ? ' active' : '');
        const hint = wanting.has(i) ? ` <span class="dest-hint">→ N${dest[i]}</span>` : '';
        label.innerHTML = `<input type="checkbox" ${wanting.has(i) ? 'checked' : ''}> N${i} ha un frame pronto${hint}`;
        label.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) wanting.add(i); else wanting.delete(i);
            regenerate();
            buildDevicePicker();
        });
        wrap.appendChild(label);
    });
}

function buildDiagram() {
    const diagram = document.getElementById('ringDiagram');
    diagram.querySelectorAll('.ring-node, .token-marker, .frame-marker').forEach(el => el.remove());

    NODE_IDS.forEach(i => {
        const p = nodePos(i);
        const node = document.createElement('div');
        node.className = 'ring-node';
        node.id = 'node-' + i;
        node.style.left = p.x + '%';
        node.style.top = p.y + '%';
        node.innerHTML = `
            <div class="ring-node-icon">N${i}</div>
            <div class="ring-node-status" id="nodestatus-${i}"></div>
        `;
        diagram.appendChild(node);
    });

    const token = document.createElement('div');
    token.className = 'token-marker';
    token.id = 'tokenMarker';
    token.textContent = '🪙';
    diagram.appendChild(token);

    const frame = document.createElement('div');
    frame.className = 'frame-marker hidden';
    frame.id = 'frameMarker';
    diagram.appendChild(frame);
}

function placeMarker(el, nodeIndex) {
    const p = nodePos(nodeIndex);
    el.style.left = p.x + '%';
    el.style.top = p.y + '%';
}

function render() {
    const hasSteps = steps.length > 0;
    const atLast = !hasSteps || runState.current >= steps.length - 1;
    const step = hasSteps ? steps[runState.current] : null;

    // ricostruisce chi ha già trasmesso fino a questo passo (per colorare i nodi in attesa)
    const sentSoFar = new Set();
    for (let i = 0; i <= runState.current && i < steps.length; i++) {
        if (steps[i].type === 'seize') sentSoFar.add(steps[i].node);
    }

    NODE_IDS.forEach(i => {
        const node = document.getElementById('node-' + i);
        let cls = 'ring-node';
        let statusText = '';
        if (wanting.has(i) && !sentSoFar.has(i)) { cls += ' wants'; statusText = 'ha un frame pronto, aspetta il token'; }
        if (sentSoFar.has(i) && !(wanting.has(i) && !sentSoFar.has(i))) { /* già servito */ }
        if (step) {
            const carrying = step.type === 'relay' || step.type === 'deliver' || step.type === 'relay-return' || step.type === 'confirm' || step.type === 'seize';
            if (step.node === i) {
                if (step.type === 'deliver') { cls += ' receiving'; statusText = 'riceve il frame: lo copia 📬'; }
                else if (step.type === 'confirm') { cls += ' done'; statusText = 'riceve la conferma e rilascia il token ✓'; }
                else if (carrying) { cls += ' sending'; statusText = step.type === 'seize' ? `trattiene il token, invia a N${step.dest}` : 'ripete il frame sull\'anello'; }
                else { cls += ' holder'; statusText = 'ha il token ora'; }
            } else if (step.type === 'done' && sentSoFar.has(i)) {
                cls += ' done';
            }
        }
        node.className = cls;
        document.getElementById('nodestatus-' + i).textContent = statusText;
    });

    const tokenMarker = document.getElementById('tokenMarker');
    const frameMarker = document.getElementById('frameMarker');
    if (step) {
        placeMarker(tokenMarker, step.node);
        tokenMarker.classList.remove('hidden');
        const carryingFrame = ['seize', 'relay', 'deliver', 'relay-return', 'confirm'].includes(step.type);
        if (carryingFrame) {
            placeMarker(frameMarker, step.node);
            frameMarker.classList.remove('hidden');
            frameMarker.classList.toggle('returning', step.type === 'relay-return' || step.type === 'confirm');
            frameMarker.textContent = step.type === 'seize' ? '✉' : (step.type === 'deliver' ? '📬' : '➜');
        } else {
            frameMarker.classList.add('hidden');
        }
    }

    const panel = document.getElementById('stepPanel');
    panel.innerHTML = steps.slice(0, runState.current + 1).map((s, i) =>
        `<div class="step-line ${i === runState.current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
    ).join('');
    panel.scrollTop = panel.scrollHeight;

    const doneBox = document.getElementById('doneBox');
    const finished = hasSteps && runState.current === steps.length - 1 && wanting.size > 0;
    if (finished) {
        doneBox.classList.remove('hidden');
        doneBox.textContent = `✓ Tutti i nodi selezionati hanno trasmesso il proprio frame, ciascuno aspettando il turno del token — zero collisioni, perché era impossibile che se ne verificasse una.`;
    } else {
        doneBox.classList.add('hidden');
    }

    document.getElementById('stepBtn').disabled = atLast;
    document.getElementById('playBtn').disabled = atLast;
    document.getElementById('playBtn').textContent = runState.isPlaying ? '⏸ Pausa' : (atLast ? '✓ Fatto' : '▶ Avvia');
}

function stopAuto() {
    if (runState.interval) clearInterval(runState.interval);
    runState.interval = null;
    runState.isPlaying = false;
}

function advance() {
    if (runState.current >= steps.length - 1) { stopAuto(); render(); return; }
    runState.current++;
    render();
    if (runState.current >= steps.length - 1) stopAuto();
}

function startAuto() {
    if (runState.current >= steps.length - 1) return;
    stopAuto();
    runState.isPlaying = true;
    render();
    runState.interval = setInterval(advance, runState.speed);
}

function regenerate() {
    stopAuto();
    const list = Array.from(wanting).sort((a, b) => a - b);
    steps = buildScenario(list, 0);
    runState.current = 0;
    render();
}

document.getElementById('playBtn').addEventListener('click', () => {
    if (runState.isPlaying) { stopAuto(); render(); } else { startAuto(); }
});
document.getElementById('stepBtn').addEventListener('click', () => { stopAuto(); advance(); });
document.getElementById('newScenarioBtn').addEventListener('click', () => {
    // Varia leggermente il punto di partenza del token, a parità di richiedenti,
    // per mostrare che l'ordine di servizio segue sempre e solo la posizione
    // del token, non chi ha "chiesto prima".
    stopAuto();
    const list = Array.from(wanting).sort((a, b) => a - b);
    const start = Math.floor(Math.random() * N);
    steps = buildScenario(list, start);
    runState.current = 0;
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Allora perché non lo usano tutti? ▸' : 'Allora perché non lo usano tutti? ▾';
});

// Inizializzazione: scenario, diagramma e primo render devono esistere SUBITO
// al caricamento, così "Passo singolo" funziona fin da subito senza dover
// prima premere "Avvia".
buildDevicePicker();
buildDiagram();
regenerateInitial();

function regenerateInitial() {
    const list = Array.from(wanting).sort((a, b) => a - b);
    steps = buildScenario(list, 0);
    runState.current = 0;
    render();
}
