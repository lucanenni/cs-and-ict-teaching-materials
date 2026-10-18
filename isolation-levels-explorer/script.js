// --- Livelli di isolamento: dirty read e lettura non ripetibile ------------
const BALANCE = 100;
const AMOUNT = 30;

const LEVELS = ['READ_UNCOMMITTED', 'READ_COMMITTED', 'REPEATABLE_READ', 'SERIALIZABLE'];

function isAtLeast(level, min) {
    return LEVELS.indexOf(level) >= LEVELS.indexOf(min);
}

function levelLabel(level) {
    return {
        READ_UNCOMMITTED: 'Read Uncommitted',
        READ_COMMITTED: 'Read Committed',
        REPEATABLE_READ: 'Repeatable Read',
        SERIALIZABLE: 'Serializable'
    }[level];
}

const LEVEL_DESCRIPTIONS = {
    READ_UNCOMMITTED: 'Il livello più permissivo: una transazione può leggere anche dati scritti da un\'altra transazione che non ha ancora fatto COMMIT.',
    READ_COMMITTED: 'Una transazione legge solo dati già confermati (COMMIT) da altre transazioni — niente dirty read — ma letture ripetute nella stessa transazione possono comunque restituire valori diversi.',
    REPEATABLE_READ: 'Una transazione, una volta letto un dato, lo rilegge sempre con lo stesso valore per tutta la sua durata — niente dirty read né letture non ripetibili.',
    SERIALIZABLE: 'Il livello più isolato: il risultato è come se le transazioni fossero eseguite una alla volta, in sequenza, anche se in realtà girano in parallelo.'
};

// Dirty read: T1 modifica il saldo senza ancora confermare; T2 prova a
// leggerlo; T1 fa ROLLBACK. Solo READ UNCOMMITTED lascia passare la lettura
// del valore non confermato.
function buildDirtyReadScenario(level, balance, amount) {
    const uncommittedValue = balance - amount;
    const allowsDirtyRead = level === 'READ_UNCOMMITTED';
    const steps = [];
    steps.push(`T1 inizia una transazione e modifica il saldo: UPDATE saldo = ${balance} - ${amount} = ${uncommittedValue} (non ancora confermato).`);
    if (allowsDirtyRead) {
        steps.push(`T2 legge il saldo: a livello READ UNCOMMITTED può vedere anche dati non confermati di altre transazioni → legge €${uncommittedValue}.`);
    } else {
        steps.push(`T2 prova a leggere il saldo, ma a livello ${levelLabel(level)} deve aspettare che T1 confermi (COMMIT) o annulli (ROLLBACK) la modifica.`);
    }
    steps.push(`T1 esegue ROLLBACK: la modifica viene annullata, il saldo torna a €${balance}.`);
    if (allowsDirtyRead) {
        steps.push(`Esito: T2 aveva letto €${uncommittedValue}, un valore che — dopo il ROLLBACK — non è mai esistito davvero (dirty read).`);
    } else {
        steps.push(`Solo ora che T1 ha finito, T2 può leggere: trova il saldo reale, €${balance}.`);
    }
    return {
        steps,
        anomalyHappened: allowsDirtyRead,
        readValue: allowsDirtyRead ? uncommittedValue : balance,
        trueValue: balance
    };
}

// Lettura non ripetibile: T2 legge due volte nella stessa transazione; nel
// mezzo T1 modifica e fa COMMIT. Solo REPEATABLE READ e SERIALIZABLE
// mantengono la stessa "fotografia" alla seconda lettura.
function buildNonRepeatableReadScenario(level, balance, amount) {
    const newValue = balance - amount;
    const preventsNonRepeatable = isAtLeast(level, 'REPEATABLE_READ');
    const steps = [];
    steps.push(`T2 inizia una transazione e legge il saldo per la prima volta: €${balance}.`);
    steps.push(`T1 modifica il saldo (UPDATE saldo = ${balance} - ${amount} = ${newValue}) ed esegue COMMIT.`);
    if (preventsNonRepeatable) {
        steps.push(`T2 legge di nuovo il saldo, nella stessa transazione: a livello ${levelLabel(level)} vede ancora €${balance} (la sua "fotografia" iniziale resta coerente).`);
    } else {
        steps.push(`T2 legge di nuovo il saldo, nella stessa transazione: a livello ${levelLabel(level)} vede il nuovo valore già confermato, €${newValue} (diverso dalla prima lettura!).`);
    }
    steps.push(`T2 esegue COMMIT.`);
    return {
        steps,
        anomalyHappened: !preventsNonRepeatable,
        firstRead: balance,
        secondRead: preventsNonRepeatable ? balance : newValue
    };
}

let currentLevel = 'READ_UNCOMMITTED';

// Ogni runner prepara subito il proprio scenario (steps + esito finale) alla
// creazione — loadFresh()+renderPanel() vengono chiamati una volta qui sotto,
// prima di qualunque click — così "Passo singolo" funziona fin da subito,
// non solo dopo aver premuto "Avvia".
function makeRunner(prefix, speed, buildScenario) {
    let steps = [];
    let current = -1;
    let interval = null;
    let onFinish = null;

    function renderPanel() {
        const panel = document.getElementById(prefix + 'StepPanel');
        panel.innerHTML = steps.map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${i + 1}. ${s}</div>`
        ).join('');
        document.getElementById(prefix + 'StepBtn').disabled = steps.length === 0 || current >= steps.length - 1;
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

function renderDirtyResult(scenario) {
    const box = document.getElementById('dirtyResult');
    box.className = 'result-box ' + (scenario.anomalyHappened ? 'bad' : 'good');
    box.innerHTML = scenario.anomalyHappened
        ? `<strong>Dirty read avvenuto.</strong> T2 ha letto €${scenario.readValue}, un valore poi annullato dal ROLLBACK di T1: non è mai esistito davvero.`
        : `<strong>Dirty read impedito.</strong> T2 ha dovuto aspettare T1 e ha letto solo il saldo reale, €${scenario.readValue}.`;
}

function renderNonRepResult(scenario) {
    const box = document.getElementById('nonRepResult');
    box.className = 'result-box ' + (scenario.anomalyHappened ? 'bad' : 'good');
    box.innerHTML = scenario.anomalyHappened
        ? `<strong>Lettura non ripetibile avvenuta.</strong> T2 ha letto €${scenario.firstRead} e poi €${scenario.secondRead} nella stessa transazione: due valori diversi.`
        : `<strong>Lettura non ripetibile impedita.</strong> T2 ha letto €${scenario.firstRead} entrambe le volte, nonostante il COMMIT di T1 nel mezzo.`;
}

const dirtyRunner = makeRunner('dirty', 1300, () => {
    const scenario = buildDirtyReadScenario(currentLevel, BALANCE, AMOUNT);
    return { steps: scenario.steps, onFinish: () => renderDirtyResult(scenario) };
});

const nonRepRunner = makeRunner('nonRep', 1300, () => {
    const scenario = buildNonRepeatableReadScenario(currentLevel, BALANCE, AMOUNT);
    return { steps: scenario.steps, onFinish: () => renderNonRepResult(scenario) };
});

function setLevel(level) {
    currentLevel = level;
    document.querySelectorAll('.level-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level === level);
    });
    document.getElementById('levelInfo').innerHTML =
        `<strong>${levelLabel(level)}</strong>: ${LEVEL_DESCRIPTIONS[level]}`;
    dirtyRunner.reset();
    nonRepRunner.reset();
}

document.querySelectorAll('.level-chip').forEach(btn => {
    btn.addEventListener('click', () => setLevel(btn.dataset.level));
});

setLevel(currentLevel);

document.getElementById('dirtyRunBtn').addEventListener('click', () => dirtyRunner.startAuto());
document.getElementById('dirtyStepBtn').addEventListener('click', () => dirtyRunner.stepOnce());
document.getElementById('nonRepRunBtn').addEventListener('click', () => nonRepRunner.startAuto());
document.getElementById('nonRepStepBtn').addEventListener('click', () => nonRepRunner.stepOnce());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non usare sempre Serializable? ▸'
        : 'Perché non usare sempre Serializable? ▾';
});
