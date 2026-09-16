// --- Lost update: due prelievi concorrenti, con e senza transazioni --------
const STARTING_BALANCE = 100;

// Senza transazioni: entrambi gli sportelli leggono lo stesso saldo "vecchio"
// prima che l'altro scriva, e decidono/scrivono in base a quello — anche se
// nel frattempo l'altro ha già consegnato dei soldi.
function buildNoTxScenario(balance, amount) {
    const bothRead = balance;
    const aSufficient = bothRead >= amount;
    const bSufficient = bothRead >= amount;
    const aDispensed = aSufficient ? amount : 0;
    const bDispensed = bSufficient ? amount : 0;
    const aWrite = bothRead - aDispensed;
    const bWrite = bothRead - bDispensed; // B scrive per ultimo, sovrascrivendo A
    const finalBalance = bWrite;
    const totalDispensed = aDispensed + bDispensed;

    const steps = [
        `Sportello A legge il saldo: €${bothRead}.`,
        `Sportello B legge il saldo: €${bothRead} (anche lui — A non ha ancora scritto nulla).`,
        `Sportello A verifica: €${bothRead} ${aSufficient ? '≥' : '<'} €${amount} richiesti → ${aSufficient ? `consegna €${amount}` : 'fondi insufficienti, nessuna consegna'}.`,
        `Sportello B verifica sul saldo che AVEVA letto (€${bothRead}): ${bSufficient ? `≥ €${amount} → consegna €${amount}` : `< €${amount} → fondi insufficienti, nessuna consegna`}.`,
        `Sportello A scrive il nuovo saldo: €${bothRead} − €${aDispensed} = €${aWrite}.`,
        `Sportello B scrive il nuovo saldo: €${bothRead} − €${bDispensed} = €${bWrite} (sovrascrive la scrittura di A, che sparisce).`
    ];

    return { steps, finalBalance, totalDispensed, aDispensed, bDispensed };
}

// Con transazioni: la transazione di A blocca il conto finché non fa commit;
// solo allora B può leggere (il saldo ormai aggiornato) e procedere.
function buildTxScenario(balance, amount) {
    const aRead = balance;
    const aSufficient = aRead >= amount;
    const aDispensed = aSufficient ? amount : 0;
    const aWrite = aRead - aDispensed;

    const bRead = aWrite;
    const bSufficient = bRead >= amount;
    const bDispensed = bSufficient ? amount : 0;
    const bWrite = bRead - bDispensed;

    const finalBalance = bWrite;
    const totalDispensed = aDispensed + bDispensed;

    const steps = [
        `Sportello A inizia una transazione e blocca il conto: legge il saldo, €${aRead}.`,
        `Sportello B prova a iniziare una transazione sullo stesso conto, ma deve aspettare: A ha ancora il blocco.`,
        `Sportello A verifica: €${aRead} ${aSufficient ? '≥' : '<'} €${amount} → ${aSufficient ? `consegna €${amount}, scrive €${aWrite}` : 'fondi insufficienti, ROLLBACK'}. COMMIT: rilascia il blocco.`,
        `Ora Sportello B può procedere: legge il saldo già aggiornato, €${bRead}.`,
        `Sportello B verifica: €${bRead} ${bSufficient ? '≥' : '<'} €${amount} → ${bSufficient ? `consegna €${amount}, scrive €${bWrite}, COMMIT` : `fondi insufficienti: la transazione si annulla (ROLLBACK), nessuna consegna`}.`
    ];

    return { steps, finalBalance, totalDispensed, aDispensed, bDispensed };
}

function makeRunner(prefix, speed) {
    let steps = [];
    let current = -1;
    let interval = null;
    let onFinish = null;

    function renderPanel() {
        const panel = document.getElementById(prefix + 'StepPanel');
        panel.innerHTML = steps.map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${i + 1}. ${s}</div>`
        ).join('');
        document.getElementById(prefix + 'StepBtn').disabled = current >= steps.length - 1;
    }

    function stopAuto() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    function advance() {
        if (current >= steps.length - 1) { stopAuto(); return; }
        current++;
        renderPanel();
        if (current >= steps.length - 1) { stopAuto(); onFinish(); }
    }

    return {
        startAuto(newSteps, finishCb) {
            stopAuto();
            steps = newSteps;
            current = -1;
            onFinish = finishCb;
            document.getElementById(prefix + 'Result').className = 'result-box';
            document.getElementById(prefix + 'Result').textContent = '';
            document.getElementById(prefix + 'StepBtn').disabled = false;
            renderPanel();
            interval = setInterval(advance, speed);
        },
        stepOnce() {
            stopAuto();
            advance();
        }
    };
}

const noTxRunner = makeRunner('noTx', 1300);
const txRunner = makeRunner('tx', 1300);

function currentAmount() {
    const v = parseInt(document.getElementById('amountInput').value, 10);
    return Math.min(Math.max(v || 0, 1), STARTING_BALANCE);
}

function runNoTx() {
    const amount = currentAmount();
    const scenario = buildNoTxScenario(STARTING_BALANCE, amount);
    noTxRunner.startAuto(scenario.steps, () => {
        const box = document.getElementById('noTxResult');
        const discrepancy = STARTING_BALANCE - scenario.finalBalance - scenario.totalDispensed;
        box.className = 'result-box ' + (discrepancy < 0 ? 'bad' : 'good');
        box.innerHTML = `Saldo finale: <strong>€${scenario.finalBalance}</strong>. Consegnati in totale:
            <strong>€${scenario.totalDispensed}</strong>.` +
            (discrepancy < 0
                ? ` <strong>Mancano all'appello €${-discrepancy}</strong>: la banca ha consegnato più soldi di quanti il saldo registrato ne tenga conto.`
                : ' Nessuna discrepanza in questo caso (i fondi non bastavano nemmeno per uno dei due).');
    });
}

function runTx() {
    const amount = currentAmount();
    const scenario = buildTxScenario(STARTING_BALANCE, amount);
    txRunner.startAuto(scenario.steps, () => {
        const box = document.getElementById('txResult');
        const discrepancy = STARTING_BALANCE - scenario.finalBalance - scenario.totalDispensed;
        box.className = 'result-box good';
        box.innerHTML = `Saldo finale: <strong>€${scenario.finalBalance}</strong>. Consegnati in totale:
            <strong>€${scenario.totalDispensed}</strong>. Nessuna discrepanza (verificato: ${discrepancy === 0 ? '0' : discrepancy}€) — ogni euro consegnato è sempre stato davvero disponibile.`;
    });
}

document.getElementById('noTxRunBtn').addEventListener('click', runNoTx);
document.getElementById('noTxStepBtn').addEventListener('click', () => noTxRunner.stepOnce());
document.getElementById('txRunBtn').addEventListener('click', runTx);
document.getElementById('txStepBtn').addEventListener('click', () => txRunner.stepOnce());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Cosa sono la "C" e la "D" di ACID? ▸'
        : 'Cosa sono la "C" e la "D" di ACID? ▾';
});
