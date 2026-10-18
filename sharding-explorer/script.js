// --- Sharding: instradamento diretto vs scatter-gather ---------------------
const USERS = [
    { id: 1, nome: 'Giulia Rossi', eta: 25 },
    { id: 2, nome: 'Marco Bianchi', eta: 34 },
    { id: 3, nome: 'Sara Verdi', eta: 41 },
    { id: 4, nome: 'Luca Ferrari', eta: 19 },
    { id: 5, nome: 'Elena Russo', eta: 52 },
    { id: 6, nome: 'Davide Colombo', eta: 30 },
    { id: 7, nome: 'Chiara Fontana', eta: 45 },
    { id: 8, nome: 'Matteo Ricci', eta: 23 },
    { id: 9, nome: 'Alice Marino', eta: 38 },
    { id: 10, nome: 'Francesco Greco', eta: 29 },
    { id: 11, nome: 'Martina Bruno', eta: 61 },
    { id: 12, nome: 'Simone Gallo', eta: 33 }
];

function shardOf(id) {
    return id % 3;
}

function usersInShard(users, shardIndex) {
    return users.filter(u => shardOf(u.id) === shardIndex);
}

// Query per ID: calcola lo shard e lo interroga da solo.
function buildIdQueryScenario(users, id) {
    const shard = shardOf(id);
    const user = users.find(u => u.id === id);
    const steps = [
        { text: `Calcolo lo shard: id % 3 = ${id} % 3 = ${shard}.`, activeShards: [], matchedIds: [] },
        { text: `Instradamento diretto: la query viene inviata SOLO allo Shard ${shard}. Gli altri 2 shard non vengono nemmeno contattati.`, activeShards: [shard], matchedIds: [] },
        {
            text: user
                ? `Lo Shard ${shard} trova la riga: id=${user.id}, nome=${user.nome}, età=${user.eta}.`
                : `Lo Shard ${shard} non trova nessuna riga con id=${id}.`,
            activeShards: [shard],
            matchedIds: user ? [user.id] : []
        }
    ];
    return { steps, nodesQueried: 1, totalNodes: 3, found: !!user, shard };
}

// Query senza chiave di sharding (es. età > 30): scatter su tutti i nodi,
// poi gather dei risultati.
function buildScatterGatherScenario(users, predicate, predicateLabel) {
    const steps = [
        { text: `La query filtra per "${predicateLabel}", che NON è la chiave di sharding (id): non si può sapere in anticipo quale shard contenga le righe giuste.`, activeShards: [], matchedIds: [] },
        { text: `La query viene inviata (scatter) a TUTTI e 3 gli shard.`, activeShards: [0, 1, 2], matchedIds: [] }
    ];
    let gathered = [];
    for (let s = 0; s < 3; s++) {
        const matches = usersInShard(users, s).filter(predicate);
        gathered = gathered.concat(matches);
        steps.push({
            text: matches.length > 0
                ? `Shard ${s} risponde con ${matches.length} riga/righe che soddisfano il filtro: ${matches.map(u => u.nome).join(', ')}.`
                : `Shard ${s} risponde: nessuna riga soddisfa il filtro.`,
            activeShards: [s],
            matchedIds: matches.map(u => u.id)
        });
    }
    steps.push({
        text: `Gather: i risultati dei 3 shard vengono uniti in un'unica lista finale di ${gathered.length} righe.`,
        activeShards: [0, 1, 2],
        matchedIds: gathered.map(u => u.id)
    });
    return { steps, nodesQueried: 3, totalNodes: 3, results: gathered };
}

function renderShardGrid() {
    const grid = document.getElementById('shardGrid');
    grid.innerHTML = [0, 1, 2].map(s => {
        const rows = usersInShard(USERS, s).map(u => `
            <tr id="row-${s}-${u.id}">
                <td>${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.eta}</td>
            </tr>
        `).join('');
        return `
            <div class="shard-box" id="shard-box-${s}">
                <div class="shard-header">Shard ${s} (id % 3 = ${s})</div>
                <table class="shard-table">
                    <thead><tr><th>ID</th><th>Nome</th><th>Età</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }).join('');
}

function highlightShards(activeShards, matchedIds) {
    for (let s = 0; s < 3; s++) {
        const box = document.getElementById('shard-box-' + s);
        box.classList.toggle('active', activeShards.includes(s));
    }
    USERS.forEach(u => {
        const row = document.getElementById(`row-${shardOf(u.id)}-${u.id}`);
        if (row) row.classList.toggle('row-active', matchedIds.includes(u.id));
    });
}

// Ogni runner prepara subito il proprio scenario (steps + esito finale) alla
// creazione — loadFresh()+renderPanel() vengono chiamati una volta qui sotto,
// prima di qualunque click — così "Passo singolo" funziona fin da subito.
function makeRunner(prefix, speed, buildScenario) {
    let steps = [];
    let current = -1;
    let interval = null;
    let onFinish = null;

    function renderPanel() {
        const panel = document.getElementById(prefix + 'StepPanel');
        panel.innerHTML = steps.map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
        ).join('');
        document.getElementById(prefix + 'StepBtn').disabled = steps.length === 0 || current >= steps.length - 1;
        const step = current >= 0 ? steps[current] : { activeShards: [], matchedIds: [] };
        highlightShards(step.activeShards, step.matchedIds);
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
        document.getElementById(prefix + 'NodeCounter').textContent = '';
        document.getElementById(prefix + 'NodeCounter').className = 'node-counter';
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
        }
    };
}

function currentId() {
    const v = parseInt(document.getElementById('idInput').value, 10);
    return Math.min(Math.max(v || 1, 1), 12);
}

function renderIdResult(scenario) {
    const counter = document.getElementById('idNodeCounter');
    counter.textContent = `Nodi interrogati: ${scenario.nodesQueried} di ${scenario.totalNodes}`;
    counter.className = 'node-counter efficient';

    const box = document.getElementById('idResult');
    box.className = 'result-box good';
    box.innerHTML = scenario.found
        ? `Trovata in un solo nodo (Shard ${scenario.shard}), senza coinvolgere gli altri 2 shard.`
        : `Nessuna riga trovata, ma comunque è bastato interrogare un solo nodo (Shard ${scenario.shard}): se non c'è lì, non può essere altrove.`;
}

function renderScatterResult(scenario) {
    const counter = document.getElementById('scatterNodeCounter');
    counter.textContent = `Nodi interrogati: ${scenario.nodesQueried} di ${scenario.totalNodes}`;
    counter.className = 'node-counter costly';

    const box = document.getElementById('scatterResult');
    box.className = 'result-box bad';
    box.innerHTML = `Trovate ${scenario.results.length} righe in totale, ma per ottenerle è stato necessario interrogare TUTTI i nodi: ${scenario.results.map(u => u.nome).join(', ')}.`;
}

renderShardGrid();

const idRunner = makeRunner('id', 1300, () => {
    const scenario = buildIdQueryScenario(USERS, currentId());
    return { steps: scenario.steps, onFinish: () => renderIdResult(scenario) };
});

const scatterRunner = makeRunner('scatter', 1300, () => {
    const scenario = buildScatterGatherScenario(USERS, u => u.eta > 30, 'età > 30');
    return { steps: scenario.steps, onFinish: () => renderScatterResult(scenario) };
});

document.getElementById('idRunBtn').addEventListener('click', () => idRunner.startAuto());
document.getElementById('idStepBtn').addEventListener('click', () => idRunner.stepOnce());
document.getElementById('scatterRunBtn').addEventListener('click', () => scatterRunner.startAuto());
document.getElementById('scatterStepBtn').addEventListener('click', () => scatterRunner.stepOnce());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Si può evitare il costo delle query "scatter-gather"? ▸'
        : 'Si può evitare il costo delle query "scatter-gather"? ▾';
});
