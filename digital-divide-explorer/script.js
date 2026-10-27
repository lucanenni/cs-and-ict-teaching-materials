// --- Il divario digitale: non solo una questione di connessione -----------

const SCENARIOS = {
    interrogazione: {
        label: 'Interrogazione a distanza e compito online',
        steps: [
            { bianchi: 'Alle 8:50 Marco si collega da un portatile personale tramite fibra: la videolezione si carica subito.', rossi: "Alle 8:50 Giulia deve aspettare che il fratello più piccolo finisca di usare l'unico smartphone di famiglia per la sua lezione." },
            { bianchi: 'La piattaforma di videoconferenza si apre in pochi secondi, audio e video stabili.', rossi: "Quando tocca a Giulia, la connessione dati mobile è lenta: l'app di videoconferenza si blocca nel caricamento." },
            { bianchi: "L'insegnante fa l'appello e inizia l'interrogazione in orario.", rossi: "Giulia entra con 6 minuti di ritardo: l'insegnante ha già iniziato con un altro compagno." },
            { bianchi: 'Durante l\'interrogazione la connessione resta stabile: Marco risponde con sicurezza.', rossi: "A metà interrogazione la connessione si interrompe per qualche secondo: l'audio salta e l'insegnante chiede a Giulia di ripetere." },
            { bianchi: "Finita l'interrogazione, Marco apre subito la piattaforma dei compiti e carica il file dal suo dispositivo.", rossi: 'Giulia deve aspettare ancora il suo turno sul telefono di famiglia per caricare il compito, mentre i dati del mese stanno per finire.' },
            { bianchi: 'Il caricamento va a buon fine al primo tentativo.', rossi: 'Il caricamento si interrompe due volte per la connessione lenta.' }
        ],
        outcome: {
            bianchi: { status: 'good', text: 'Esito: interrogazione completata senza intoppi, compito consegnato in tempo.' },
            rossi: { status: 'bad', text: 'Esito: interrogazione comunque sostenuta, ma compito consegnato in ritardo — non per la preparazione di Giulia, ma per il tempo perso nei turni e nei problemi di connessione.' }
        }
    },
    certificato: {
        label: 'Richiedere un certificato alla pubblica amministrazione',
        steps: [
            { bianchi: 'Il padre di Marco apre il portale da casa con la fibra; la pagina si carica in un istante.', rossi: 'Il padre di Giulia prova ad aprire il portale dal telefono condiviso, ma non ha mai usato un sito della pubblica amministrazione.' },
            { bianchi: 'Accede subito con le credenziali già salvate nel browser.', rossi: 'Non ricorda la password e non sa come recuperarla: deve aspettare che Giulia torni da scuola per farsi aiutare.' },
            { bianchi: "Compila il modulo online: i campi sono chiari, l'operazione richiede pochi minuti.", rossi: 'Lo schermo piccolo dello smartphone rende difficile leggere il modulo e toccare i campi giusti senza errori.' },
            { bianchi: 'Carica gli allegati richiesti direttamente dal computer, già pronti in una cartella.', rossi: 'Devono fotografare i documenti col telefono: i file sono troppo pesanti per la connessione e il caricamento fallisce più volte.' },
            { bianchi: 'Il certificato viene generato e scaricato sul momento.', rossi: 'Dopo vari tentativi la richiesta parte, ma hanno già consumato quasi tutti i giga del mese.' }
        ],
        outcome: {
            bianchi: { status: 'good', text: 'Esito: certificato ottenuto in pochi minuti, nello stesso pomeriggio.' },
            rossi: { status: 'bad', text: "Esito: richiesta inviata con un giorno di ritardo e con il traffico dati quasi esaurito — non per mancanza di volontà, ma per un dispositivo piccolo, una connessione limitata e un'interfaccia mai vista prima." }
        }
    },
    colloquio: {
        label: 'Colloquio di lavoro in videochiamata',
        steps: [
            { bianchi: 'Marco si prepara nella sua stanza, collegato in fibra, con portatile e webcam già pronti.', rossi: 'Giulia deve organizzare il colloquio negli orari in cui i fratelli non hanno bisogno dello smartphone di famiglia.' },
            { bianchi: 'La videochiamata si avvia puntuale, inquadratura stabile e sfondo ordinato.', rossi: "Il colloquio inizia in ritardo perché l'app richiede un aggiornamento che, con la connessione dati, impiega tempo a scaricarsi." },
            { bianchi: 'Durante la chiamata audio e video restano fluidi per tutta la durata.', rossi: "A metà colloquio la connessione rallenta: il video si blocca e l'intervistatore fatica a sentire le risposte di Giulia." },
            { bianchi: 'Marco condivide lo schermo per mostrare un suo progetto, senza problemi.', rossi: 'Giulia vorrebbe mostrare un suo progetto, ma sul telefono condiviso non riesce a condividere lo schermo durante la chiamata.' }
        ],
        outcome: {
            bianchi: { status: 'good', text: "Esito: colloquio concluso senza intoppi, buona impressione lasciata all'intervistatore." },
            rossi: { status: 'bad', text: 'Esito: colloquio portato a termine, ma con interruzioni tecniche che hanno reso la comunicazione più difficile — le risposte di Giulia erano preparate quanto quelle di Marco.' }
        }
    }
};

function nextIndex(current, totalSteps) {
    if (current >= totalSteps - 1) return totalSteps - 1;
    return current + 1;
}

function isComplete(current, totalSteps) {
    return current >= totalSteps - 1;
}

function makeDivideRunner() {
    let scenarioKey = 'interrogazione';
    let current = -1;
    let interval = null;

    function scenario() {
        return SCENARIOS[scenarioKey];
    }

    function renderChips() {
        const wrap = document.getElementById('scenarioChips');
        wrap.innerHTML = Object.entries(SCENARIOS).map(([key, s]) =>
            `<button type="button" class="chip ${key === scenarioKey ? 'active' : ''}" data-key="${key}">${s.label}</button>`
        ).join('');
        wrap.querySelectorAll('.chip').forEach(btn => {
            btn.addEventListener('click', () => selectScenario(btn.getAttribute('data-key')));
        });
    }

    function renderPanel(prefix, side) {
        const panel = document.getElementById(prefix + 'Panel');
        const steps = scenario().steps;
        panel.innerHTML = steps.slice(0, current + 1).map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${s[side]}</div>`
        ).join('') || '<div class="step-line">Premi "Avvia" o "Passo singolo" per iniziare il racconto.</div>';
        panel.scrollTop = panel.scrollHeight;
    }

    function renderOutcome(prefix, side) {
        const box = document.getElementById(prefix + 'Outcome');
        const steps = scenario().steps;
        if (!isComplete(current, steps.length)) {
            box.classList.add('hidden');
            return;
        }
        const out = scenario().outcome[side];
        box.classList.remove('hidden');
        box.className = 'result-box ' + out.status;
        box.textContent = out.text;
    }

    function updateButtons() {
        const total = scenario().steps.length;
        document.getElementById('stepBtn').disabled = isComplete(current, total);
    }

    function render() {
        renderChips();
        renderPanel('bianchi', 'bianchi');
        renderPanel('rossi', 'rossi');
        renderOutcome('bianchi', 'bianchi');
        renderOutcome('rossi', 'rossi');
        updateButtons();
    }

    function stopAuto() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    function advance() {
        const total = scenario().steps.length;
        current = nextIndex(current, total);
        render();
        if (isComplete(current, total)) stopAuto();
    }

    function selectScenario(key) {
        if (!SCENARIOS[key]) return;
        stopAuto();
        scenarioKey = key;
        current = -1;
        render();
    }

    // Rendering iniziale alla creazione, PRIMA di qualunque click: "Passo
    // singolo" è già abilitato e funzionante al semplice caricamento della
    // pagina, con lo scenario di default pronto.
    render();

    return {
        startAuto() {
            stopAuto();
            current = -1;
            render();
            interval = setInterval(advance, 900);
        },
        stepOnce() {
            stopAuto();
            advance();
        },
        reset() {
            stopAuto();
            current = -1;
            render();
        }
    };
}

const divideRunner = makeDivideRunner();

document.getElementById('runBtn').addEventListener('click', () => divideRunner.startAuto());
document.getElementById('stepBtn').addEventListener('click', () => divideRunner.stepOnce());
document.getElementById('resetBtn').addEventListener('click', () => divideRunner.reset());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Non basta regalare un dispositivo a chi non ne ha? ▸'
        : 'Non basta regalare un dispositivo a chi non ne ha? ▾';
});
