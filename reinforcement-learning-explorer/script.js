// --- Apprendimento per rinforzo: Q-learning passo-passo su una griglia -----
//
// Logica pura (griglia, scelta azione, aggiornamento Q) verificata a parte in
// Node su casi calcolabili a mano e su un test di convergenza, prima di
// collegarla a questa interfaccia (vedi README.md).

const SIZE = 5;
const START = { r: 4, c: 0 };
const GOAL = { r: 0, c: 4 };
const TRAPS = [{ r: 1, c: 2 }, { r: 3, c: 3 }];
const MAX_STEPS = 50;
const ALPHA = 0.5;   // tasso di apprendimento
const GAMMA = 0.9;   // fattore di sconto sul futuro
const EPSILON = 0.2; // probabilità di esplorazione

const ACTION_NAMES = ['su', 'giù', 'sinistra', 'destra'];
const ACTION_ARROWS = ['↑', '↓', '←', '→'];
const DELTAS = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];

// --- Logica pura -----------------------------------------------------------

function createQTable(size) {
    const q = [];
    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) row.push([0, 0, 0, 0]);
        q.push(row);
    }
    return q;
}

function argmax(arr) {
    let best = 0;
    for (let i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i;
    return best;
}

function chooseAction(qValues, epsilon, rand) {
    if (rand() < epsilon) return Math.floor(rand() * 4);
    return argmax(qValues);
}

function clampMove(r, c, action, size) {
    const d = DELTAS[action];
    let nr = r + d.dr;
    let nc = c + d.dc;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) { nr = r; nc = c; }
    return { r: nr, c: nc };
}

function isGoal(r, c) { return r === GOAL.r && c === GOAL.c; }
function isTrap(r, c) { return TRAPS.some(t => t.r === r && t.c === c); }

function getReward(r, c) {
    if (isGoal(r, c)) return 10;
    if (isTrap(r, c)) return -10;
    return -1;
}

function updateQ(qTable, r, c, action, reward, nr, nc, alpha, gamma) {
    const maxNext = Math.max(...qTable[nr][nc]);
    const old = qTable[r][c][action];
    const updated = old + alpha * (reward + gamma * maxNext - old);
    qTable[r][c][action] = updated;
    return updated;
}

function makeEpisodeState() {
    return { pos: { r: START.r, c: START.c }, steps: 0, done: false, outcome: null, totalReward: 0, lastAction: null, lastReward: null };
}

// Esegue un passo dell'episodio, aggiornando la Q-table "sul posto".
// Ritorna un piccolo oggetto con i dettagli del passo, utile per il log testuale.
function stepEpisode(ep, qTable, rand) {
    if (ep.done) return null;
    const { r, c } = ep.pos;
    const qvals = qTable[r][c];
    const action = chooseAction(qvals, EPSILON, rand);
    const newPos = clampMove(r, c, action, SIZE);
    const reward = getReward(newPos.r, newPos.c);
    const newQ = updateQ(qTable, r, c, action, reward, newPos.r, newPos.c, ALPHA, GAMMA);

    ep.steps++;
    ep.pos = newPos;
    ep.totalReward += reward;
    ep.lastAction = action;
    ep.lastReward = reward;

    if (isGoal(newPos.r, newPos.c)) { ep.done = true; ep.outcome = 'goal'; }
    else if (isTrap(newPos.r, newPos.c)) { ep.done = true; ep.outcome = 'trap'; }
    else if (ep.steps >= MAX_STEPS) { ep.done = true; ep.outcome = 'timeout'; }

    return { from: { r, c }, action, to: newPos, reward, newQ, outcome: ep.outcome };
}

// Esegue un intero episodio senza animazione (per il "run veloce").
function runFullEpisode(qTable, rand) {
    const ep = makeEpisodeState();
    let guard = 0;
    while (!ep.done && guard < MAX_STEPS + 5) {
        stepEpisode(ep, qTable, rand);
        guard++;
    }
    return ep;
}

// --- Stato dell'interfaccia --------------------------------------------------

let qTable = createQTable(SIZE);
let episodeCount = 0;      // episodi completati
let currentEpisode = makeEpisodeState();
let stepLog = [];          // righe testuali dell'episodio corrente
let lastCompleted = null;  // { outcome, steps, totalReward, episodeNumber }
let autoInterval = null;

const OUTCOME_LABELS = {
    goal: 'OBIETTIVO raggiunto',
    trap: 'caduto in una TRAPPOLA',
    timeout: 'troppi passi (nessuna conclusione)'
};

function stopAuto() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = null;
}

function cellClasses(r, c) {
    const classes = ['rl-cell'];
    if (r === START.r && c === START.c) classes.push('rl-start');
    if (isGoal(r, c)) classes.push('rl-goal');
    if (isTrap(r, c)) classes.push('rl-trap');
    if (currentEpisode.pos.r === r && currentEpisode.pos.c === c) classes.push('rl-agent');
    return classes.join(' ');
}

function centerIcon(r, c) {
    if (currentEpisode.pos.r === r && currentEpisode.pos.c === c) return '🤖';
    if (isGoal(r, c)) return '🎯';
    if (isTrap(r, c)) return '💀';
    if (r === START.r && c === START.c) return 'S';
    return '';
}

function renderGrid() {
    const grid = document.getElementById('rlGrid');
    let html = '';
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const q = qTable[r][c];
            const best = argmax(q);
            const qCell = (action, posClass) => {
                const cls = 'rl-q ' + posClass + (action === best ? ' rl-q-best' : '');
                return `<div class="${cls}">${q[action].toFixed(1)}</div>`;
            };
            html += `
                <div class="${cellClasses(r, c)}" title="cella (${r + 1},${c + 1})">
                    ${qCell(0, 'rl-q-up')}
                    ${qCell(2, 'rl-q-left')}
                    <div class="rl-q-center">${centerIcon(r, c)}</div>
                    ${qCell(3, 'rl-q-right')}
                    ${qCell(1, 'rl-q-down')}
                </div>
            `;
        }
    }
    grid.innerHTML = html;
}

function renderStatus() {
    const status = document.getElementById('rlStatus');
    const n = episodeCount + 1;
    status.innerHTML = `<strong>Episodio numero ${n}</strong> — passo ${currentEpisode.steps} di massimo ${MAX_STEPS} — ` +
        `posizione cella (${currentEpisode.pos.r + 1}, ${currentEpisode.pos.c + 1}) — ` +
        `premio totale finora: ${currentEpisode.totalReward.toFixed(1)}`;

    const stepBtn = document.getElementById('rlStepBtn');
    const runBtn = document.getElementById('rlRunBtn');
    stepBtn.disabled = currentEpisode.done;
    runBtn.disabled = currentEpisode.done;
}

function renderStepPanel() {
    const panel = document.getElementById('rlStepPanel');
    if (stepLog.length === 0) {
        panel.innerHTML = '<div class="step-line">Premi "Passo singolo" o "Avvia" per far muovere l\'agente.</div>';
        return;
    }
    panel.innerHTML = stepLog.map((line, i) =>
        `<div class="step-line ${i === stepLog.length - 1 ? 'current' : ''}">${line}</div>`
    ).join('');
    panel.scrollTop = panel.scrollHeight;
}

function renderResultBox() {
    const box = document.getElementById('rlResultBox');
    if (!lastCompleted) {
        box.className = 'result-box';
        box.textContent = 'Nessun episodio concluso ancora.';
        return;
    }
    const good = lastCompleted.outcome === 'goal';
    box.className = 'result-box ' + (good ? 'good' : 'bad');
    box.textContent = `Ultimo episodio concluso (#${lastCompleted.episodeNumber}): ${OUTCOME_LABELS[lastCompleted.outcome]} in ${lastCompleted.steps} passi, premio totale ${lastCompleted.totalReward.toFixed(1)}.`;
}

function render() {
    renderGrid();
    renderStatus();
    renderStepPanel();
    renderResultBox();
}

function logStep(detail) {
    const fromTxt = `(${detail.from.r + 1},${detail.from.c + 1})`;
    const toTxt = `(${detail.to.r + 1},${detail.to.c + 1})`;
    let line = `Passo ${currentEpisode.steps}: azione "${ACTION_NAMES[detail.action]}" ${ACTION_ARROWS[detail.action]} da ${fromTxt} a ${toTxt}; premio ${detail.reward > 0 ? '+' : ''}${detail.reward} → Q aggiornato a ${detail.newQ.toFixed(2)}.`;
    if (detail.outcome) {
        line += ` Episodio concluso: ${OUTCOME_LABELS[detail.outcome]}.`;
    }
    stepLog.push(line);
}

function finishEpisodeIfDone() {
    if (currentEpisode.done) {
        episodeCount++;
        lastCompleted = {
            outcome: currentEpisode.outcome,
            steps: currentEpisode.steps,
            totalReward: currentEpisode.totalReward,
            episodeNumber: episodeCount
        };
        stopAuto();
    }
}

function doStep() {
    if (currentEpisode.done) return;
    const detail = stepEpisode(currentEpisode, qTable, Math.random);
    if (detail) logStep(detail);
    finishEpisodeIfDone();
    render();
}

function startAuto() {
    stopAuto();
    if (currentEpisode.done) return;
    autoInterval = setInterval(() => {
        doStep();
        if (currentEpisode.done) stopAuto();
    }, 450);
}

function newEpisode() {
    stopAuto();
    currentEpisode = makeEpisodeState();
    stepLog = [];
    render();
}

function runFast(n) {
    stopAuto();
    const tally = { goal: 0, trap: 0, timeout: 0 };
    for (let i = 0; i < n; i++) {
        const ep = runFullEpisode(qTable, Math.random);
        tally[ep.outcome]++;
        episodeCount++;
    }
    // Il run veloce non riguarda un singolo episodio concluso: il box dei
    // risultati viene aggiornato manualmente qui sotto, non da renderResultBox.
    lastCompleted = null;
    currentEpisode = makeEpisodeState();
    stepLog = [];
    render();

    const box = document.getElementById('rlResultBox');
    const good = tally.goal >= tally.trap + tally.timeout;
    box.className = 'result-box ' + (good ? 'good' : 'bad');
    box.textContent = `Eseguiti ${n} episodi velocemente (senza animazione): obiettivo raggiunto ${tally.goal} volte, trappola ${tally.trap} volte, timeout ${tally.timeout} volte. La Q-table è stata aggiornata ad ogni passo di ogni episodio — ora prova "Passo singolo" per vedere l'agente scegliere.`;
}

function resetQTable() {
    stopAuto();
    qTable = createQTable(SIZE);
    episodeCount = 0;
    lastCompleted = null;
    currentEpisode = makeEpisodeState();
    stepLog = [];
    render();
}

// Render iniziale: un episodio è già pronto PRIMA di qualunque click, così
// "Passo singolo" funziona subito al caricamento della pagina.
render();

document.getElementById('rlStepBtn').addEventListener('click', doStep);
document.getElementById('rlRunBtn').addEventListener('click', startAuto);
document.getElementById('rlNewEpisodeBtn').addEventListener('click', newEpisode);
document.getElementById('rlFast50Btn').addEventListener('click', () => runFast(50));
document.getElementById('rlFast200Btn').addEventListener('click', () => runFast(200));
document.getElementById('rlResetBtn').addEventListener('click', resetQTable);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non basta sempre scegliere l\'azione con il valore Q più alto? ▸'
        : 'Perché non basta sempre scegliere l\'azione con il valore Q più alto? ▾';
});
