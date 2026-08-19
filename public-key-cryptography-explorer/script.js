const SCENARIOS = {
    secret: {
        speed: 2200,
        help: [
            '• Chiunque possieda la <strong>chiave pubblica</strong> di qualcuno può chiudere un messaggio destinato a lui — ma solo la sua <strong>chiave privata</strong> può riaprirlo.',
            '• Le due chiavi sono collegate matematicamente, ma conoscere quella pubblica non permette di ricavare quella privata in un tempo ragionevole.',
            '• Questo risolve un problema che la crittografia simmetrica da sola non può risolvere: comunicare in segreto con qualcuno senza essersi mai accordati su una chiave condivisa in anticipo.'
        ],
        steps: [
            {
                active: ['bob'],
                alice: null,
                public: null,
                bob: { icon: '🔑 🔓', caption: 'Bob genera due chiavi collegate: una serratura pubblica e una chiave privata.' },
                text: 'Bob genera una coppia di chiavi collegate matematicamente: una <strong>serratura pubblica</strong> (che chiunque potrà usare per chiudere qualcosa destinato a lui) e una <strong>chiave privata</strong> (che non condivide con nessuno).'
            },
            {
                active: ['bob', 'public'],
                alice: null,
                public: { icon: '🔓', caption: 'La serratura pubblica di Bob, visibile a chiunque' },
                bob: { icon: '🔑 🔓', caption: 'Ha pubblicato la serratura, tiene la chiave privata solo per sé' },
                text: 'Bob pubblica la sua serratura pubblica apertamente — sul suo sito, per email, non importa dove: chiunque, <strong>Eve compresa</strong>, può vederla e usarla.'
            },
            {
                active: ['alice'],
                alice: { icon: '✉️', caption: 'Un messaggio segreto per Bob' },
                public: { icon: '🔓', caption: 'La serratura pubblica di Bob, visibile a chiunque' },
                bob: { icon: '🔑 🔓', caption: 'Ha pubblicato la serratura, tiene la chiave privata solo per sé' },
                text: 'Alice scrive un messaggio che vuole restasse segreto, leggibile solo da Bob.'
            },
            {
                active: ['alice', 'public'],
                alice: { icon: '🔓 → 🔒', caption: 'Alice chiude il messaggio con la serratura PUBBLICA di Bob' },
                public: { icon: '🔓', caption: 'La serratura pubblica di Bob, visibile a chiunque' },
                bob: { icon: '🔑 🔓', caption: 'Ha pubblicato la serratura, tiene la chiave privata solo per sé' },
                text: 'Alice chiude il messaggio in una scatola usando la serratura pubblica di Bob. Una volta chiusa così, <strong>nemmeno Alice</strong> può più riaprirla: serve la chiave privata di Bob, che lei non possiede.'
            },
            {
                active: ['public'],
                alice: { icon: '🔓 → 🔒', caption: 'Ha chiuso il messaggio e lo ha inviato' },
                public: { icon: '🔒📦', caption: 'La scatola chiusa viaggia sul canale pubblico' },
                bob: { icon: '🔑 🔓', caption: 'In attesa della scatola' },
                text: 'La scatola chiusa attraversa il canale pubblico. <strong>Eve la vede passare</strong>, ma è chiusa con una serratura che solo la chiave privata di Bob può aprire — provare ad aprirla senza quella chiave è, nella pratica, impossibile.'
            },
            {
                active: ['bob', 'public'],
                alice: { icon: '🔓 → 🔒', caption: 'Ha chiuso il messaggio e lo ha inviato' },
                public: { icon: '🔒📦', caption: 'La scatola chiusa viaggia sul canale pubblico' },
                bob: { icon: '🔑 → 🔓', caption: 'Bob apre la scatola con la SUA chiave privata' },
                text: 'Bob riceve la scatola e la apre con la sua chiave privata: l\'unica, tra tutte quelle possibili, che corrisponde a quella specifica serratura.'
            },
            {
                active: ['bob'],
                alice: { icon: '🔓 → 🔒', caption: 'Ha chiuso il messaggio e lo ha inviato' },
                public: { icon: '🔓', caption: 'La serratura pubblica di Bob, visibile a chiunque' },
                bob: { icon: '📖 ✉️', caption: 'Messaggio letto!' },
                text: 'Bob legge il messaggio originale. Alice e Bob non si sono mai dovuti scambiare alcun segreto in anticipo: la serratura pubblica di Bob, visibile a tutti, bastava.'
            }
        ]
    },
    sign: {
        speed: 2200,
        help: [
            '• Per firmare, la direzione delle chiavi si <strong>inverte</strong> rispetto al messaggio segreto: chi firma usa la propria chiave <strong>privata</strong>, chi verifica usa la chiave <strong>pubblica</strong> di chi ha firmato.',
            '• Solo chi possiede la chiave privata può produrre una firma valida — ma chiunque, con la chiave pubblica corrispondente, può verificarla.',
            '• Una firma valida garantisce due cose insieme: che il messaggio viene davvero da quella persona (<strong>autenticità</strong>), e che nessuno lo ha alterato lungo il percorso (<strong>integrità</strong>).'
        ],
        steps: [
            {
                active: ['alice'],
                alice: { icon: '🔑 🔓', caption: 'Alice ha una chiave privata (segreta) e una pubblica (già nota a tutti)' },
                public: null,
                bob: null,
                text: 'Anche Alice possiede una coppia di chiavi. La sua chiave pubblica è già conosciuta da chiunque potrebbe voler verificare i suoi messaggi in futuro.'
            },
            {
                active: ['alice'],
                alice: { icon: '📢', caption: 'Un messaggio da firmare (non necessariamente segreto)' },
                public: null,
                bob: null,
                text: 'Alice scrive un messaggio che non deve restare segreto — magari deve arrivare a tutti (un annuncio, un aggiornamento software) — ma vuole che chi lo riceve sia sicuro che venga davvero da lei.'
            },
            {
                active: ['alice', 'public'],
                alice: { icon: '🔑 → ✍️', caption: 'Alice firma il messaggio con la SUA chiave privata' },
                public: null,
                bob: null,
                text: 'Alice usa la sua chiave privata per produrre una firma legata in modo univoco sia a lei che a questo preciso messaggio: un sigillo che solo la sua chiave privata poteva produrre.'
            },
            {
                active: ['public'],
                alice: { icon: '🔑 → ✍️', caption: 'Ha firmato e inviato il messaggio' },
                public: { icon: '📨 ✍️', caption: 'Messaggio + firma viaggiano pubblicamente' },
                bob: null,
                text: 'Il messaggio e la firma viaggiano insieme, in chiaro: qui l\'obiettivo non è la segretezza, ma la certezza di chi lo ha scritto.'
            },
            {
                active: ['bob', 'public'],
                alice: { icon: '🔑 → ✍️', caption: 'Ha firmato e inviato il messaggio' },
                public: { icon: '📨 ✍️', caption: 'Messaggio + firma viaggiano pubblicamente' },
                bob: { icon: '🔓 → 🔍', caption: 'Bob verifica la firma con la chiave PUBBLICA di Alice' },
                text: 'Bob (o chiunque altro) prende la chiave pubblica di Alice, già nota, e la usa per controllare che la firma corrisponda esattamente a quel messaggio.'
            },
            {
                active: ['bob'],
                alice: { icon: '🔑 → ✍️', caption: 'Ha firmato e inviato il messaggio' },
                public: { icon: '📨 ✍️', caption: 'Messaggio + firma viaggiano pubblicamente' },
                bob: { icon: '✅', caption: 'Firma verificata!' },
                text: 'La firma corrisponde: Bob ha la certezza che il messaggio viene da chi possiede la chiave privata di Alice, e che nessuno lo ha alterato lungo il percorso. Nota la direzione opposta rispetto al messaggio segreto: qui la chiave <strong>privata</strong> firma, e la chiave <strong>pubblica</strong> verifica.'
            }
        ]
    }
};

let state = {
    mode: 'secret',
    current: 0,
    isPlaying: false,
    interval: null
};

function renderColumn(id, content) {
    const el = document.getElementById('content-' + id);
    if (!content) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = `<div class="icon-line">${content.icon}</div><div class="icon-caption">${content.caption}</div>`;
}

function render() {
    const scenario = SCENARIOS[state.mode];
    const step = scenario.steps[state.current];

    ['alice', 'public', 'bob'].forEach(id => {
        document.getElementById('col-' + id).classList.toggle('active', step.active.includes(id));
        renderColumn(id, step[id]);
    });

    document.getElementById('stepPanel').innerHTML =
        `<div><span class="step-counter">Passo ${state.current + 1} di ${scenario.steps.length}</span>${step.text}</div>`;

    const playBtn = document.getElementById('playPauseBtn');
    const atEnd = state.current >= scenario.steps.length - 1;
    if (state.isPlaying) playBtn.textContent = '⏸ Pausa';
    else if (atEnd) playBtn.textContent = '↻ Riavvia';
    else playBtn.textContent = '▶ Avvia';
    document.getElementById('stepBtn').disabled = atEnd;
}

function advance() {
    const scenario = SCENARIOS[state.mode];
    if (state.current >= scenario.steps.length - 1) {
        stopPlaying();
        return;
    }
    state.current++;
    render();
    if (state.current >= scenario.steps.length - 1) stopPlaying();
}

function startPlaying() {
    const scenario = SCENARIOS[state.mode];
    if (state.current >= scenario.steps.length - 1) state.current = 0;
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    render();
    state.interval = setInterval(advance, scenario.speed);
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
    render();
}

function playPause() {
    if (state.isPlaying) stopPlaying();
    else startPlaying();
}

function setMode(mode) {
    stopPlaying();
    state.mode = mode;
    state.current = 0;
    document.getElementById('secretModeBtn').classList.toggle('active', mode === 'secret');
    document.getElementById('signModeBtn').classList.toggle('active', mode === 'sign');
    document.getElementById('helpList').innerHTML = SCENARIOS[mode].help.map(li => `<li>${li}</li>`).join('');
    render();
}

document.getElementById('secretModeBtn').addEventListener('click', () => setMode('secret'));
document.getElementById('signModeBtn').addEventListener('click', () => setMode('sign'));

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    advance();
});
document.getElementById('resetBtn').addEventListener('click', () => {
    stopPlaying();
    state.current = 0;
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Cosa impedisce a Eve di violarlo? ▸' : 'Cosa impedisce a Eve di violarlo? ▾';
});

// Inizializzazione
setMode('secret');
