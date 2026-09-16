// --- Incapsulamento/decapsulamento a strati (modello TCP/IP a 5 livelli) ---
const LAYERS = [
    { id: 'app', icon: '📄', name: 'Applicazione', desc: 'Genera e interpreta i dati (HTTP, email, messaggistica...).', osi: 'OSI 7+6+5: Applicazione, Presentazione, Sessione' },
    { id: 'transport', icon: '🚚', name: 'Trasporto', desc: 'Consegna i dati al programma giusto, tramite le porte.', osi: 'OSI 4: Trasporto' },
    { id: 'network', icon: '🗺️', name: 'Rete', desc: 'Instrada da un capo all\'altro di reti diverse, tramite gli IP.', osi: 'OSI 3: Rete' },
    { id: 'link', icon: '🔗', name: 'Collegamento', desc: 'Consegna al dispositivo successivo nella stessa rete locale, tramite i MAC.', osi: 'OSI 2: Collegamento' },
    { id: 'physical', icon: '⚡', name: 'Fisico', desc: 'Trasforma tutto in segnali elettrici, luminosi o radio.', osi: 'OSI 1: Fisico' }
];

function buildSteps(message, proto) {
    const data = { cls: 'seg-data', label: message };
    const transportSeg = { cls: 'seg-transport', label: proto };
    const networkSeg = { cls: 'seg-network', label: 'IP' };
    const linkSeg = { cls: 'seg-link', label: 'MAC' };
    const bitsSeg = { cls: 'seg-bits', label: '01001011 01110100...' };

    const transportNote = proto === 'TCP'
        ? 'instaura prima una connessione affidabile: i dati persi vengono ritrasmessi.'
        : 'li invia subito, senza garanzia di consegna: più veloce, ma "spara e dimentica".';

    return [
        {
            layerId: 'app',
            segments: [data],
            text: `<strong>Applicazione (mittente)</strong>: il programma vuole inviare "${message}".`
        },
        {
            layerId: 'transport',
            segments: [transportSeg, data],
            text: `<strong>Trasporto (mittente)</strong>: aggiunge un header <strong>${proto}</strong> con le porte del programma mittente e destinatario, e ${transportNote} Ora si chiama <em>segmento</em>.`
        },
        {
            layerId: 'network',
            segments: [networkSeg, transportSeg, data],
            text: `<strong>Rete (mittente)</strong>: aggiunge un header <strong>IP</strong> con gli indirizzi IP mittente e destinatario, per poterlo instradare anche attraverso reti diverse dalla tua. Ora si chiama <em>pacchetto</em>.`
        },
        {
            layerId: 'link',
            segments: [linkSeg, networkSeg, transportSeg, data],
            text: `<strong>Collegamento (mittente)</strong>: aggiunge un header con gli indirizzi <strong>MAC</strong> del mittente e del prossimo dispositivo sulla stessa rete locale (es. il router di casa). Ora si chiama <em>frame</em>.`
        },
        {
            layerId: 'physical',
            segments: [bitsSeg],
            text: `<strong>Fisico</strong>: l'intero frame viene trasformato in segnali — elettrici, luminosi o radio — e trasmesso sul mezzo fisico. Nessun header qui: solo bit.`
        },
        {
            layerId: 'link',
            segments: [networkSeg, transportSeg, data],
            text: `<strong>Collegamento (destinatario)</strong>: riceve i segnali, li riassembla in un frame, controlla che l'indirizzo MAC di destinazione sia il suo e rimuove il proprio header.`
        },
        {
            layerId: 'network',
            segments: [transportSeg, data],
            text: `<strong>Rete (destinatario)</strong>: controlla che l'IP di destinazione sia il suo e rimuove l'header IP, passando il segmento al livello Trasporto.`
        },
        {
            layerId: 'transport',
            segments: [data],
            text: `<strong>Trasporto (destinatario)</strong>: legge la porta nell'header ${proto}, lo rimuove, e sa a quale programma consegnare i dati.`
        },
        {
            layerId: 'app',
            segments: [data],
            text: `<strong>Applicazione (destinatario)</strong>: riceve esattamente "${message}" — l'incapsulamento e la decapsulazione hanno fatto il loro lavoro senza perdere nulla.`
        }
    ];
}

let state = {
    message: 'Ciao!',
    proto: 'TCP',
    steps: [],
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 1500
};

function renderLayers() {
    const box = document.getElementById('layersBox');
    box.innerHTML = '';
    LAYERS.forEach(layer => {
        const row = document.createElement('div');
        row.className = 'layer-row';
        row.id = 'layer-' + layer.id;
        row.innerHTML = `
            <div class="layer-icon">${layer.icon}</div>
            <div class="layer-name">${layer.name}</div>
            <div class="layer-desc">${layer.desc}</div>
            <div class="layer-osi-hint hidden">${layer.osi}</div>
        `;
        box.appendChild(row);
    });
    syncOsiHints();
}

function syncOsiHints() {
    const show = document.getElementById('osiToggle').checked;
    document.querySelectorAll('.layer-osi-hint').forEach(el => el.classList.toggle('hidden', !show));
}

function renderPacket() {
    const wrap = document.getElementById('packetSegments');
    wrap.innerHTML = '';
    const step = state.steps[state.current];
    step.segments.forEach(seg => {
        const el = document.createElement('div');
        el.className = 'segment ' + seg.cls;
        el.textContent = seg.label;
        wrap.appendChild(el);
    });
}

function render() {
    LAYERS.forEach(layer => {
        document.getElementById('layer-' + layer.id).classList.remove('active');
    });
    const step = state.steps[state.current];
    document.getElementById('layer-' + step.layerId).classList.add('active');

    renderPacket();

    document.getElementById('stepPanel').innerHTML =
        `<span class="step-counter">Passo ${state.current + 1} di ${state.steps.length}</span>${step.text}`;

    const atEnd = state.current >= state.steps.length - 1;
    const playBtn = document.getElementById('playPauseBtn');
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
    if (state.current >= state.steps.length - 1) state.current = 0;
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
    if (state.isPlaying) { stopPlaying(); render(); }
    else startPlaying();
}

function rebuild() {
    stopPlaying();
    const raw = document.getElementById('messageInput').value.trim();
    state.message = raw.length > 0 ? raw : 'Ciao!';
    state.steps = buildSteps(state.message, state.proto);
    state.current = 0;
    render();
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });
document.getElementById('resetBtn').addEventListener('click', rebuild);
document.getElementById('messageInput').addEventListener('input', rebuild);
document.getElementById('osiToggle').addEventListener('change', syncOsiHints);

document.querySelectorAll('.chip[data-proto]').forEach(chip => {
    chip.addEventListener('click', () => {
        state.proto = chip.dataset.proto;
        document.querySelectorAll('.chip[data-proto]').forEach(c => c.classList.toggle('active', c === chip));
        rebuild();
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché si parlano di 7 livelli E di 5? ▸'
        : 'Perché si parlano di 7 livelli E di 5? ▾';
});

renderLayers();
rebuild();
