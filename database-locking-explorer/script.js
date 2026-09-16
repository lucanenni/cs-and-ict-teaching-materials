// --- Deadlock: attesa circolare vs ordine di lock coerente -----------------
const ACCOUNTS = ['A', 'B'];

// Ogni passo descrive lo stato COMPLETO dei lock e delle attese dopo quel
// passo, così l'interfaccia può limitarsi a "fotografare" lo stato invece di
// applicare differenze — più facile da verificare passo per passo.
const DEADLOCK_STEPS = [
    { locks: { A: 'T1', B: null }, waiting: {}, text: 'T1 blocca Conto A (per trasferire A→B).' },
    { locks: { A: 'T1', B: 'T2' }, waiting: {}, text: 'T2 blocca Conto B (per trasferire B→A).' },
    { locks: { A: 'T1', B: 'T2' }, waiting: { T1: 'B' }, text: 'T1 vuole bloccare Conto B, occupato da T2: si mette in attesa.' },
    { locks: { A: 'T1', B: 'T2' }, waiting: { T1: 'B', T2: 'A' }, text: 'T2 vuole bloccare Conto A, occupato da T1: si mette in attesa.', deadlock: true },
    { locks: { A: 'T1', B: 'T2' }, waiting: { T1: 'B', T2: 'A' }, text: 'DEADLOCK: T1 aspetta T2, T2 aspetta T1. Il database rileva il ciclo nel grafo delle attese.', deadlock: true },
    { locks: { A: 'T1', B: null }, waiting: {}, text: 'Il database sceglie una vittima: ABORT di T2. T2 va in ROLLBACK e rilascia il lock su Conto B.' },
    { locks: { A: 'T1', B: 'T1' }, waiting: {}, text: 'T1, non più bloccato, ottiene anche il lock su Conto B.' },
    { locks: { A: null, B: null }, waiting: {}, text: 'T1 completa il trasferimento e fa COMMIT, rilasciando entrambi i lock.' },
    { locks: { A: 'T2', B: 'T2' }, waiting: {}, text: 'L\'applicazione ritenta T2 da capo: stavolta trova entrambi i conti liberi.' },
    { locks: { A: null, B: null }, waiting: {}, text: 'T2 completa il trasferimento e fa COMMIT. Entrambe le transazioni sono infine riuscite.' }
];

const ORDERED_STEPS = [
    { locks: { A: 'T1', B: null }, waiting: {}, text: 'T1 blocca Conto A (per trasferire A→B).' },
    { locks: { A: 'T1', B: null }, waiting: { T2: 'A' }, text: 'T2 vuole trasferire B→A, ma segue la convenzione "blocca sempre A per prima": A è occupato da T1, T2 si mette in attesa.' },
    { locks: { A: 'T1', B: 'T1' }, waiting: { T2: 'A' }, text: 'T1 blocca anche Conto B (libero, T2 non lo ha ancora toccato): ottiene entrambi i lock.' },
    { locks: { A: null, B: null }, waiting: {}, text: 'T1 completa il trasferimento e fa COMMIT, rilasciando i lock: A è di nuovo libero.' },
    { locks: { A: 'T2', B: null }, waiting: {}, text: 'T2, non più bloccato, ottiene il lock su Conto A.' },
    { locks: { A: 'T2', B: 'T2' }, waiting: {}, text: 'T2 blocca anche Conto B (libero) e completa il trasferimento.' },
    { locks: { A: null, B: null }, waiting: {}, text: 'T2 fa COMMIT. Nessun deadlock: le transazioni si sono semplicemente messe in coda, mai in cerchio.' }
];

function makeRunner(prefix, steps, speed) {
    let current = -1;
    let interval = null;

    function renderLocks() {
        const wrap = document.getElementById(prefix + 'Locks');
        const step = current >= 0 ? steps[current] : { locks: {}, waiting: {} };
        wrap.innerHTML = ACCOUNTS.map(acc => {
            const holder = step.locks[acc];
            const waiters = Object.entries(step.waiting || {}).filter(([, wantedAcc]) => wantedAcc === acc).map(([t]) => t);
            return `
                <div class="lock-cell ${holder ? 'held' : ''} ${step.deadlock ? 'deadlocked' : ''}">
                    <div class="lock-account">Conto ${acc}</div>
                    <div class="lock-status ${holder ? '' : 'free'}">${holder ? `🔒 ${holder}` : 'libero'}</div>
                    ${waiters.length ? `<div class="lock-waiting">in attesa: ${waiters.join(', ')}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    function renderSteps() {
        const panel = document.getElementById(prefix + 'StepPanel');
        panel.innerHTML = steps.slice(0, current + 1).map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''} ${s.deadlock ? 'deadlock' : ''}">${i + 1}. ${s.text}</div>`
        ).join('');
        panel.scrollTop = panel.scrollHeight;
        document.getElementById(prefix + 'StepBtn').disabled = current >= steps.length - 1;
    }

    function render() {
        renderLocks();
        renderSteps();
    }

    function stopAuto() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    function advance() {
        if (current >= steps.length - 1) { stopAuto(); return; }
        current++;
        render();
        if (current >= steps.length - 1) stopAuto();
    }

    return {
        startAuto() {
            stopAuto();
            current = -1;
            document.getElementById(prefix + 'StepBtn').disabled = false;
            render();
            interval = setInterval(advance, speed);
        },
        stepOnce() {
            stopAuto();
            advance();
        }
    };
}

const deadlockRunner = makeRunner('deadlock', DEADLOCK_STEPS, 1300);
const orderedRunner = makeRunner('ordered', ORDERED_STEPS, 1300);

document.getElementById('deadlockRunBtn').addEventListener('click', () => deadlockRunner.startAuto());
document.getElementById('deadlockStepBtn').addEventListener('click', () => deadlockRunner.stepOnce());
document.getElementById('orderedRunBtn').addEventListener('click', () => orderedRunner.startAuto());
document.getElementById('orderedStepBtn').addEventListener('click', () => orderedRunner.stepOnce());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non bloccare semplicemente tutto in anticipo? ▸'
        : 'Perché non bloccare semplicemente tutto in anticipo? ▾';
});
