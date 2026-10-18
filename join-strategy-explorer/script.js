// --- Nested loop join vs hash join ------------------------------------------
const NOMI = ['Giulia', 'Marco', 'Sara', 'Luca', 'Elena', 'Davide', 'Chiara', 'Matteo', 'Alice', 'Francesco', 'Martina', 'Simone', 'Valentina', 'Andrea', 'Federica'];

function generateClienti(n) {
    const clienti = [];
    for (let i = 1; i <= n; i++) {
        clienti.push({ cliente_id: i, nome: `${NOMI[(i - 1) % NOMI.length]} ${String.fromCharCode(65 + ((i - 1) % 26))}.` });
    }
    return clienti;
}

function generateOrdini(n) {
    const ordini = [];
    for (let i = 1; i <= n; i++) {
        const cliente_id = ((i * 5 - 3) % n) + 1;
        const importo = 10 + ((i * 37) % 190);
        ordini.push({ ordine_id: i, cliente_id, importo });
    }
    return ordini;
}

// Nested loop join: per ogni ordine, scansiona TUTTE le righe di clienti.
// Nessuna uscita anticipata al primo match: i confronti crescono come N × M.
function buildNestedLoopSteps(ordini, clienti) {
    const steps = [];
    let count = 0;
    for (const o of ordini) {
        for (const c of clienti) {
            count++;
            const match = o.cliente_id === c.cliente_id;
            steps.push({
                text: `Confronto #${count}: Ordine #${o.ordine_id} (cliente_id=${o.cliente_id}) vs ${c.nome} (cliente_id=${c.cliente_id}) → ${match ? 'corrispondenza trovata' : 'nessuna corrispondenza'}.`,
                count,
                match
            });
        }
    }
    return { steps, totalComparisons: count };
}

// Hash join: una passata O(M) per costruire la hash table su clienti, poi
// una passata O(N) di lookup su ordini. Totale: N + M operazioni.
function buildHashJoinSteps(ordini, clienti) {
    const steps = [];
    let count = 0;
    const table = new Map();
    for (const c of clienti) {
        count++;
        table.set(c.cliente_id, c);
        steps.push({ text: `Costruzione hash table — inserisco ${c.nome} (cliente_id=${c.cliente_id}): 1 operazione di inserimento.`, count, phase: 'build' });
    }
    for (const o of ordini) {
        count++;
        const match = table.get(o.cliente_id);
        steps.push({
            text: `Lookup O(1) — Ordine #${o.ordine_id} (cliente_id=${o.cliente_id}) → ${match ? `trovato: ${match.nome}` : 'nessun cliente corrispondente'}: 1 operazione di lookup.`,
            count,
            phase: 'probe'
        });
    }
    return { steps, totalOperations: count, buildOps: clienti.length, probeOps: ordini.length };
}

let currentOrdini = [];
let currentClienti = [];

function renderTables() {
    document.getElementById('ordiniBody').innerHTML = currentOrdini.map(o => `
        <tr><td>${o.ordine_id}</td><td>${o.cliente_id}</td><td>€${o.importo}</td></tr>
    `).join('');
    document.getElementById('clientiBody').innerHTML = currentClienti.map(c => `
        <tr><td>${c.cliente_id}</td><td>${c.nome}</td></tr>
    `).join('');
}

function updateStatsDisplay(n) {
    document.getElementById('statNestedValue').textContent = n * n;
    document.getElementById('statHashValue').textContent = n + n;
}

// Ogni runner prepara subito il proprio scenario (steps + esito finale) alla
// creazione — loadFresh()+renderPanel() vengono chiamati una volta qui sotto,
// prima di qualunque click — così "Passo singolo" funziona fin da subito.
// I passi vengono rivelati progressivamente (come un log), con scroll
// automatico, così da seguire la crescita del contatore operazione dopo
// operazione.
function makeRunner(prefix, speed, counterLabel, buildScenario) {
    let steps = [];
    let current = -1;
    let interval = null;
    let onFinish = null;

    function renderPanel() {
        const panel = document.getElementById(prefix + 'StepPanel');
        panel.innerHTML = steps.slice(0, current + 1).map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
        ).join('');
        panel.scrollTop = panel.scrollHeight;
        document.getElementById(prefix + 'StepBtn').disabled = steps.length === 0 || current >= steps.length - 1;
        const count = current >= 0 ? steps[current].count : 0;
        document.getElementById(prefix + 'OpCounter').textContent = `${counterLabel}: ${count}`;
    }

    function stopAuto() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    function loadFresh() {
        const scenario = buildScenario();
        steps = scenario.steps;
        onFinish = scenario.onFinish;
        current = -1;
        document.getElementById(prefix + 'Result').className = 'result-box';
        document.getElementById(prefix + 'Result').textContent = '';
    }

    function advance() {
        if (current >= steps.length - 1) { stopAuto(); return; }
        current++;
        renderPanel();
        if (current >= steps.length - 1) { stopAuto(); onFinish(); }
    }

    loadFresh();
    renderPanel();

    return {
        startAuto() {
            stopAuto();
            loadFresh();
            renderPanel();
            interval = setInterval(advance, speed);
        },
        stepOnce() {
            stopAuto();
            if (current === -1) {
                loadFresh();
                renderPanel();
            }
            advance();
        },
        reset() {
            stopAuto();
            loadFresh();
            renderPanel();
        }
    };
}

function renderNlResult(scenario) {
    const box = document.getElementById('nlResult');
    box.className = 'result-box bad';
    box.innerHTML = `Totale confronti: <strong>${scenario.totalComparisons}</strong> (N × M = ${currentOrdini.length} × ${currentClienti.length}). Ogni ordine ha dovuto scansionare tutta la tabella Clienti.`;
}

function renderHjResult(scenario) {
    const box = document.getElementById('hjResult');
    box.className = 'result-box good';
    box.innerHTML = `Totale operazioni: <strong>${scenario.totalOperations}</strong> (${scenario.buildOps} per costruire la hash table + ${scenario.probeOps} lookup). Molte meno del nested loop, soprattutto al crescere delle tabelle.`;
}

const nlRunner = makeRunner('nl', 60, 'Confronti', () => {
    const scenario = buildNestedLoopSteps(currentOrdini, currentClienti);
    return { steps: scenario.steps, onFinish: () => renderNlResult(scenario) };
});

const hjRunner = makeRunner('hj', 180, 'Operazioni', () => {
    const scenario = buildHashJoinSteps(currentOrdini, currentClienti);
    return { steps: scenario.steps, onFinish: () => renderHjResult(scenario) };
});

function regenerateData(n) {
    currentOrdini = generateOrdini(n);
    currentClienti = generateClienti(n);
    renderTables();
    updateStatsDisplay(n);
    nlRunner.reset();
    hjRunner.reset();
}

const rowsInput = document.getElementById('rowsInput');
rowsInput.addEventListener('input', () => {
    const n = parseInt(rowsInput.value, 10);
    document.getElementById('rowsValue').textContent = n;
    regenerateData(n);
});

regenerateData(parseInt(rowsInput.value, 10));

document.getElementById('nlRunBtn').addEventListener('click', () => nlRunner.startAuto());
document.getElementById('nlStepBtn').addEventListener('click', () => nlRunner.stepOnce());
document.getElementById('hjRunBtn').addEventListener('click', () => hjRunner.startAuto());
document.getElementById('hjStepBtn').addEventListener('click', () => hjRunner.stepOnce());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché allora non usare sempre l\'hash join? ▸'
        : 'Perché allora non usare sempre l\'hash join? ▾';
});
