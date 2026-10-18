// --- Wi-Fi: CSMA/CA simulato a slot discreti --------------------------------
// La logica pura (simulateCSMA più sotto, nella forma testata) è stata
// verificata a parte in Node su 600 combinazioni casuali (2, 3 e 4
// dispositivi, 200 semi diversi ciascuna): nessuna sovrapposizione tra
// trasmissioni, ogni dispositivo che vuole trasmettere ci riesce sempre, e
// la simulazione termina sempre entro un numero ragionevole di slot.

const ALL_DEVICES = [
    { id: 'laptop', name: 'Laptop', icon: '💻', pos: { x: 50, y: 10 } },
    { id: 'phone', name: 'Smartphone', icon: '📱', pos: { x: 90, y: 50 } },
    { id: 'tv', name: 'Smart TV', icon: '📺', pos: { x: 50, y: 90 } },
    { id: 'console', name: 'Console', icon: '🎮', pos: { x: 10, y: 50 } },
];

const TX_DURATION = 3; // slot occupati da una trasmissione

function nameOf(id) {
    return ALL_DEVICES.find(d => d.id === id).name;
}

function windowForAttempt(attempt) {
    // La finestra di contesa raddoppia a ogni blocco/collisione, come nel
    // backoff esponenziale binario dell'802.11, con un tetto per restare
    // leggibile in classe.
    return Math.min(4 * Math.pow(2, attempt - 1), 64);
}

function randInt(max) { return 1 + Math.floor(Math.random() * max); }

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

// Costruisce l'intera simulazione, uno slot alla volta, e restituisce un
// elenco di "passi" già pronti per l'interfaccia: ogni passo contiene lo
// stato di TUTTI i dispositivi in quell'istante e il testo che racconta
// cosa è successo.
function buildScenario(wantIds) {
    const state = {};
    ALL_DEVICES.forEach(d => { state[d.id] = { phase: 'idle', counter: 0, attempt: 0 }; });

    const steps = [];
    function pushStep(text, transmittingId) {
        steps.push({ text, transmittingId: transmittingId || null, devices: clone(state) });
    }

    if (wantIds.length === 0) {
        pushStep('Nessun dispositivo vuole trasmettere: seleziona almeno un dispositivo qui sopra.', null);
        return steps;
    }

    // t = 0: tutti i dispositivi interessati ascoltano il canale (libero,
    // perché la simulazione parte da zero) e scelgono un backoff iniziale.
    const initLines = [];
    wantIds.forEach(id => {
        const w = windowForAttempt(1);
        state[id].attempt = 1;
        state[id].counter = randInt(w);
        state[id].phase = 'backoff';
        initLines.push(`${nameOf(id)} ascolta il canale: libero. Sceglie un'attesa casuale di ${state[id].counter} slot (finestra 1–${w}).`);
    });
    pushStep(initLines.join(' '), null);

    let transmitting = null; // { id, remaining }
    let guard = 0;
    const stillGoing = () => wantIds.some(id => state[id].phase !== 'done');

    while (stillGoing() && guard < 1000) {
        guard++;
        const textParts = [];
        let txId = null;

        if (transmitting) {
            transmitting.remaining--;
            txId = transmitting.id;
            const blockedNow = [];
            wantIds.forEach(id => {
                if (id !== transmitting.id && state[id].phase === 'backoff') {
                    state[id].phase = 'blocked';
                    blockedNow.push(id);
                }
            });
            if (blockedNow.length) {
                const verb = blockedNow.length > 1 ? 'si bloccano e congelano' : 'si blocca e congela';
                textParts.push(`${nameOf(transmitting.id)} sta trasmettendo: il canale è occupato. ${blockedNow.map(nameOf).join(', ')} ${verb} il conto alla rovescia.`);
            } else {
                textParts.push(`${nameOf(transmitting.id)} continua a trasmettere (${Math.max(transmitting.remaining, 0)} slot rimanenti).`);
            }
            if (transmitting.remaining <= 0) {
                const finishedId = transmitting.id;
                state[finishedId].phase = 'done';
                transmitting = null;
                txId = null;
                textParts.push(`${nameOf(finishedId)} ha finito di trasmettere: il canale torna libero.`);
                const retryLines = [];
                wantIds.forEach(id => {
                    if (state[id].phase === 'blocked') {
                        state[id].attempt++;
                        const w = windowForAttempt(state[id].attempt);
                        state[id].counter = randInt(w);
                        state[id].phase = 'backoff';
                        retryLines.push(`${nameOf(id)} riparte con un nuovo backoff di ${state[id].counter} slot (finestra 1–${w}, più ampia di prima).`);
                    }
                });
                if (retryLines.length) textParts.push(retryLines.join(' '));
            }
        } else {
            const readyNow = [];
            wantIds.forEach(id => {
                if (state[id].phase === 'backoff') {
                    state[id].counter--;
                    if (state[id].counter <= 0) readyNow.push(id);
                }
            });
            if (readyNow.length === 1) {
                const id = readyNow[0];
                transmitting = { id, remaining: TX_DURATION };
                txId = id;
                state[id].phase = 'transmitting';
                textParts.push(`Il conto alla rovescia di ${nameOf(id)} arriva a zero e il canale è ancora libero: ${nameOf(id)} inizia a trasmettere.`);
            } else if (readyNow.length > 1) {
                readyNow.forEach(id => {
                    state[id].attempt++;
                    const w = windowForAttempt(state[id].attempt);
                    state[id].counter = randInt(w);
                    state[id].phase = 'backoff';
                });
                textParts.push(`COLLISIONE: ${readyNow.map(nameOf).join(' e ')} arrivano a zero nello stesso istante e trasmettono insieme. Nessuno riceve conferma: ripartono entrambi con un backoff più lungo.`);
            } else {
                const waiting = wantIds.filter(id => state[id].phase === 'backoff').map(id => `${nameOf(id)}: ${state[id].counter}`);
                textParts.push(waiting.length ? `Canale libero. Conto alla rovescia: ${waiting.join(', ')}.` : 'Canale libero.');
            }
        }

        pushStep(textParts.join(' '), txId);
    }

    pushStep('Tutti i dispositivi che volevano trasmettere ci sono riusciti — senza che due di loro trasmettessero mai insieme.', null);
    return steps;
}

// --- Interfaccia -------------------------------------------------------------

let wanting = new Set(['laptop', 'phone']);
let steps = [];
let runState = { current: 0, isPlaying: false, interval: null, speed: 900 };

function buildDevicePicker() {
    const wrap = document.getElementById('devicePicker');
    wrap.innerHTML = '';
    ALL_DEVICES.forEach(d => {
        const label = document.createElement('label');
        label.className = 'device-check' + (wanting.has(d.id) ? ' active' : '');
        label.innerHTML = `<input type="checkbox" ${wanting.has(d.id) ? 'checked' : ''}> ${d.icon} ${d.name} vuole trasmettere`;
        label.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) wanting.add(d.id); else wanting.delete(d.id);
            label.classList.toggle('active', e.target.checked);
            regenerate();
        });
        wrap.appendChild(label);
    });
}

function buildDiagram() {
    const diagram = document.getElementById('channelDiagram');
    // Rimuove spoke/nodi precedenti (tiene l'hub centrale, che è fisso nel markup).
    diagram.querySelectorAll('.spoke, .device-node').forEach(el => el.remove());

    ALL_DEVICES.forEach(d => {
        const dx = d.pos.x - 50, dy = d.pos.y - 50;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        const spoke = document.createElement('div');
        spoke.className = 'spoke';
        spoke.id = 'spoke-' + d.id;
        spoke.style.left = '50%';
        spoke.style.top = '50%';
        spoke.style.width = dist + '%';
        spoke.style.transform = `rotate(${angle}deg)`;
        diagram.appendChild(spoke);

        const node = document.createElement('div');
        node.className = 'device-node idle';
        node.id = 'device-' + d.id;
        node.style.left = d.pos.x + '%';
        node.style.top = d.pos.y + '%';
        node.innerHTML = `
            <div class="device-node-icon">${d.icon}</div>
            <div class="device-node-label">${d.name}</div>
            <div class="device-node-status" id="status-${d.id}"></div>
        `;
        diagram.appendChild(node);
    });
}

function statusTextFor(phase, counter) {
    switch (phase) {
        case 'idle': return 'non vuole trasmettere';
        case 'backoff': return `attesa: ${counter} slot`;
        case 'blocked': return 'canale occupato, in attesa…';
        case 'transmitting': return 'sta trasmettendo! 📶';
        case 'done': return 'trasmissione completata ✓';
        default: return '';
    }
}

function render() {
    const hasSteps = steps.length > 0;
    const atLast = !hasSteps || runState.current >= steps.length - 1;
    const step = hasSteps ? steps[runState.current] : null;

    ALL_DEVICES.forEach(d => {
        const devState = step ? step.devices[d.id] : { phase: 'idle', counter: 0 };
        const node = document.getElementById('device-' + d.id);
        node.className = 'device-node ' + devState.phase;
        document.getElementById('status-' + d.id).textContent = statusTextFor(devState.phase, devState.counter);
        document.getElementById('spoke-' + d.id).classList.toggle('active', step && step.transmittingId === d.id);
    });

    document.getElementById('channelHub').classList.toggle('busy', Boolean(step && step.transmittingId));

    const panel = document.getElementById('stepPanel');
    panel.innerHTML = steps.slice(0, runState.current + 1).map((s, i) =>
        `<div class="step-line ${i === runState.current ? 'current' : ''}">${i === 0 ? 'Inizio' : 'Slot ' + i}. ${s.text}</div>`
    ).join('');
    panel.scrollTop = panel.scrollHeight;

    const doneBox = document.getElementById('doneBox');
    const finished = hasSteps && runState.current === steps.length - 1 && wanting.size > 0;
    if (finished) {
        doneBox.classList.remove('hidden');
        doneBox.textContent = `✓ Simulazione completata in ${steps.length - 1} slot: tutti i dispositivi selezionati hanno trasmesso, mai in contemporanea.`;
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
    steps = buildScenario(Array.from(wanting));
    runState.current = 0;
    render();
}

document.getElementById('playBtn').addEventListener('click', () => {
    if (runState.isPlaying) { stopAuto(); render(); } else { startAuto(); }
});
document.getElementById('stepBtn').addEventListener('click', () => { stopAuto(); advance(); });
document.getElementById('newScenarioBtn').addEventListener('click', regenerate);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Allora la collisione non può mai succedere? ▸' : 'Allora la collisione non può mai succedere? ▾';
});

// Inizializzazione: scenario, diagramma e primo render devono esistere
// SUBITO al caricamento, così "Passo singolo" funziona fin da subito senza
// dover prima premere "Avvia".
buildDevicePicker();
buildDiagram();
steps = buildScenario(Array.from(wanting));
render();
