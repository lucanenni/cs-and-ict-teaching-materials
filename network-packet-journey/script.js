// La riga di nodi rappresenta le "tappe" logiche del viaggio (non una mappa
// di rete letterale): il DNS, ad esempio, non fa fisicamente da tramite per
// i dati che tornano dal server, ma qui la freccia del racconto attraversa
// comunque quella posizione nel diagramma. I testi di ogni passo chiariscono
// sempre cosa succede realmente.
function buildSteps(host) {
    return [
        { active: ['client'], edge: null, text: `Il browser vuole caricare <strong>${host}</strong>, ma i computer si scambiano dati solo con indirizzi IP numerici, non con nomi.` },
        { active: ['client', 'dns'], edge: 'client-dns', text: `Il browser interroga un server <strong>DNS</strong>: "qual è l'indirizzo IP di ${host}?"` },
        { active: ['client', 'dns'], edge: 'client-dns', text: `Il DNS risponde con l'indirizzo IP corrispondente: <strong>93.184.216.34</strong>.` },
        { active: ['dns', 'router'], edge: 'dns-router', text: `Ora il browser può inviare la vera richiesta HTTP, che attraversa uno o più <strong>router</strong> lungo il percorso verso il server.` },
        { active: ['router', 'server'], edge: 'router-server', text: `Il pacchetto raggiunge il <strong>server</strong> che ospita il sito.` },
        { active: ['server'], edge: null, text: `Il server elabora la richiesta e prepara la risposta: il codice HTML della pagina.` },
        { active: ['server', 'router'], edge: 'router-server', text: `La risposta comincia il viaggio di ritorno verso il browser, di nuovo attraverso la rete.` },
        { active: ['router', 'dns'], edge: 'dns-router', text: `Il pacchetto di risposta continua il suo tragitto...` },
        { active: ['dns', 'client'], edge: 'client-dns', text: `...e arriva finalmente al browser.` },
        { active: ['client'], edge: null, text: `Il browser riceve l'HTML e lo trasforma nella pagina che vedi. Tutto questo, di solito, in meno di un secondo!` }
    ];
}

let state = {
    steps: buildSteps(document.getElementById('urlSelect').value),
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 1400
};

function render() {
    const step = state.steps[state.current];

    document.querySelectorAll('.node').forEach(node => {
        const id = node.id.replace('node-', '');
        node.classList.toggle('active', step.active.includes(id));
    });
    document.querySelectorAll('.edge').forEach(edge => edge.classList.remove('active'));
    if (step.edge) {
        const edgeEl = document.getElementById('edge-' + step.edge);
        if (edgeEl) edgeEl.classList.add('active');
    }

    document.getElementById('stepPanel').innerHTML =
        `<span class="step-counter">Passo ${state.current + 1} di ${state.steps.length}</span>${step.text}`;

    const playBtn = document.getElementById('playPauseBtn');
    const atEnd = state.current >= state.steps.length - 1;
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else if (atEnd) {
        playBtn.textContent = '↻ Riavvia';
    } else {
        playBtn.textContent = '▶ Avvia';
    }
    document.getElementById('stepBtn').disabled = atEnd;
}

function advance() {
    if (state.current >= state.steps.length - 1) {
        stopPlaying();
        render();
        return;
    }
    state.current++;
    render();
    if (state.current >= state.steps.length - 1) stopPlaying();
}

function startPlaying() {
    if (state.current >= state.steps.length - 1) {
        state.current = 0;
    }
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    render();
    state.interval = setInterval(advance, state.speed);
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
}

function playPause() {
    if (state.isPlaying) {
        stopPlaying();
        render();
    } else {
        startPlaying();
    }
}

function reset() {
    stopPlaying();
    state.current = 0;
    render();
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    advance();
});
document.getElementById('resetBtn').addEventListener('click', reset);

document.getElementById('urlSelect').addEventListener('change', (e) => {
    state.steps = buildSteps(e.target.value);
    reset();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché tutto questo richiede meno di un secondo? ▸'
        : 'Perché tutto questo richiede meno di un secondo? ▾';
});

render();
