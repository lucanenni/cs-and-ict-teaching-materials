// --- Verifica della catena di certificati: Root CA → CA Intermedia → sito --
// Logica pura (testata separatamente in Node prima di collegarla al DOM):
// dato un eventuale punto di rottura, costruisce la sequenza di passi che il
// browser esegue per decidere se fidarsi del certificato del sito.

function buildChainSteps(failAt) {
    // failAt: null (catena valida) | 'site' | 'intermediate' | 'root'
    const steps = [];

    steps.push({
        id: 'receive',
        text: "Il browser si collega a esempio.it e riceve il certificato del sito, firmato da: CA Intermedia Esempio.",
        status: 'info',
        certUpdates: { site: 'received' }
    });

    const siteSigOk = failAt !== 'site';
    steps.push({
        id: 'siteSig',
        text: siteSigOk
            ? "Verifica la firma del certificato del sito con la chiave pubblica della CA Intermedia: firma valida."
            : "Verifica la firma del certificato del sito con la chiave pubblica della CA Intermedia: firma NON valida (il certificato è stato alterato o non è firmato da questa CA).",
        status: siteSigOk ? 'ok' : 'fail',
        certUpdates: { site: siteSigOk ? 'ok' : 'fail' }
    });
    if (!siteSigOk) {
        steps.push({
            id: 'result',
            text: "✗ Connessione non sicura — la catena si rompe al certificato del sito: la sua firma non è valida, quindi non si può risalire alla CA Intermedia con fiducia.",
            status: 'bad',
            result: 'bad'
        });
        return { steps, trusted: false, brokenAt: 'siteSig' };
    }

    const intSigOk = failAt !== 'intermediate';
    steps.push({
        id: 'intSig',
        text: intSigOk
            ? "Verifica la firma del certificato della CA Intermedia con la chiave pubblica della Root CA: firma valida."
            : "Verifica la firma del certificato della CA Intermedia con la chiave pubblica della Root CA: firma NON valida.",
        status: intSigOk ? 'ok' : 'fail',
        certUpdates: { intermediate: intSigOk ? 'ok' : 'fail' }
    });
    if (!intSigOk) {
        steps.push({
            id: 'result',
            text: "✗ Connessione non sicura — la catena si rompe alla CA Intermedia: la sua firma non è valida, quindi non si può risalire alla Root CA con fiducia.",
            status: 'bad',
            result: 'bad'
        });
        return { steps, trusted: false, brokenAt: 'intSig' };
    }

    const rootTrusted = failAt !== 'root';
    steps.push({
        id: 'trust',
        text: rootTrusted
            ? "Controlla se la Root CA è nel trust store del browser: presente."
            : "Controlla se la Root CA è nel trust store del browser: ASSENTE (nessuno garantisce per questa radice).",
        status: rootTrusted ? 'ok' : 'fail',
        certUpdates: { root: rootTrusted ? 'ok' : 'fail' }
    });
    if (!rootTrusted) {
        steps.push({
            id: 'result',
            text: "✗ Connessione non sicura — la catena si rompe alla Root CA: non essendo nel trust store, nessun anello precedente della catena può essere considerato attendibile.",
            status: 'bad',
            result: 'bad'
        });
        return { steps, trusted: false, brokenAt: 'trust' };
    }

    steps.push({
        id: 'result',
        text: "✓ Connessione sicura — ogni firma è valida fino a una radice già fidata dal browser: tutta la catena è attendibile.",
        status: 'good',
        result: 'good'
    });
    return { steps, trusted: true, brokenAt: null };
}

// --- Interfaccia -----------------------------------------------------------

const CERT_STATUS_TEXT = {
    site: {
        pending: 'in attesa di verifica',
        received: 'Certificato ricevuto dal browser',
        ok: 'Firma verificata ✓',
        fail: 'Firma NON valida ✗'
    },
    intermediate: {
        pending: 'in attesa di verifica',
        ok: 'Firma verificata ✓',
        fail: 'Firma NON valida ✗'
    },
    root: {
        pending: 'in attesa di verifica',
        ok: 'Presente nel trust store ✓',
        fail: 'Assente dal trust store ✗'
    }
};

function computeCertStates(steps, uptoIndex) {
    const state = { site: 'pending', intermediate: 'pending', root: 'pending' };
    for (let i = 0; i <= uptoIndex; i++) {
        const cu = steps[i].certUpdates;
        if (cu) Object.assign(state, cu);
    }
    return state;
}

function applyCertCard(certId, status) {
    const card = document.getElementById('cert' + certId.charAt(0).toUpperCase() + certId.slice(1));
    const statusEl = document.getElementById('cert' + certId.charAt(0).toUpperCase() + certId.slice(1) + 'Status');
    card.classList.remove('pending', 'received', 'ok', 'fail');
    card.classList.add(status);
    statusEl.textContent = CERT_STATUS_TEXT[certId][status] || 'in attesa di verifica';
}

function makeRunner(steps, speed) {
    let current = -1;
    let interval = null;

    function renderCerts() {
        const certState = computeCertStates(steps, current);
        applyCertCard('site', certState.site);
        applyCertCard('intermediate', certState.intermediate);
        applyCertCard('root', certState.root);
    }

    function renderSteps() {
        const panel = document.getElementById('stepPanel');
        panel.innerHTML = steps.slice(0, current + 1).map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''} ${s.status === 'fail' ? 'fail-step' : ''}">${i + 1}. ${s.text}</div>`
        ).join('');
        panel.scrollTop = panel.scrollHeight;
        document.getElementById('stepBtn').disabled = current >= steps.length - 1;
    }

    function renderResult() {
        const box = document.getElementById('resultBox');
        if (current < 0) {
            box.className = 'result-box';
            box.textContent = 'Premi "▶ Avvia" o "Passo singolo →" per iniziare la verifica.';
            return;
        }
        const step = steps[current];
        if (step.result === 'good') {
            box.className = 'result-box good';
            box.textContent = step.text;
        } else if (step.result === 'bad') {
            box.className = 'result-box bad';
            box.textContent = step.text;
        } else {
            box.className = 'result-box';
            box.textContent = 'Verifica in corso...';
        }
    }

    function render() {
        renderCerts();
        renderSteps();
        renderResult();
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

    // Render subito alla creazione: così "Passo singolo" funziona fin dal
    // caricamento della pagina, senza dover prima cliccare "Avvia".
    render();

    return {
        startAuto() {
            stopAuto();
            current = -1;
            document.getElementById('stepBtn').disabled = false;
            render();
            interval = setInterval(advance, speed);
        },
        stepOnce() {
            stopAuto();
            advance();
        }
    };
}

let runner = makeRunner(buildChainSteps(null).steps, 1100);

function rebuildRunner() {
    const failAt = document.getElementById('scenarioSelect').value || null;
    runner = makeRunner(buildChainSteps(failAt).steps, 1100);
}

document.getElementById('scenarioSelect').addEventListener('change', rebuildRunner);
document.getElementById('runBtn').addEventListener('click', () => runner.startAuto());
document.getElementById('stepBtn').addEventListener('click', () => runner.stepOnce());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non dare direttamente a ogni sito un certificato firmato dalla Root CA? ▸'
        : 'Perché non dare direttamente a ogni sito un certificato firmato dalla Root CA? ▾';
});
