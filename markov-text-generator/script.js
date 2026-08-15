// Un piccolo corpus con vocabolario ripetuto apposta, per dare al modello
// statistiche interessanti da mostrare (più frasi condividono le stesse
// parole iniziali e diverse continuazioni possibili).
const corpus = `Il gatto dorme sul divano. Il cane corre in giardino. Il gatto gioca con il gomitolo. Il cane abbaia al postino. Il gatto guarda la pioggia dalla finestra. Il cane dorme vicino al camino. Il gatto miagola per la fame. Il cane scodinzola quando torna il padrone. Il gatto si nasconde sotto il letto. Il cane porta la palla in giardino. La sera il gatto dorme sul divano. La sera il cane dorme vicino al camino.`;

const tokens = corpus.split(/\s+/).filter(Boolean);
const MAX_LENGTH = 40;

// Costruisce la tabella delle transizioni: per ogni contesto di `order`
// parole, conta quali parole lo seguono nel corpus e con che frequenza.
function buildModel(order) {
    const model = {};
    for (let i = 0; i + order < tokens.length; i++) {
        const key = tokens.slice(i, i + order).join(' ');
        const next = tokens[i + order];
        if (!model[key]) model[key] = {};
        model[key][next] = (model[key][next] || 0) + 1;
    }
    return model;
}

const models = { 1: buildModel(1), 2: buildModel(2) };

// Dato una parola iniziale, restituisce i primi `order` token della frase del
// corpus che comincia con quella parola: garantisce un contesto sempre valido
// per il modello (con `order` 2, un solo token di contesto non basterebbe).
function seedSequence(word, order) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === word && (i === 0 || /[.!?]$/.test(tokens[i - 1]))) {
            return tokens.slice(i, i + order);
        }
    }
    return [word];
}

// Parole valide come punto di partenza: quelle che iniziano una frase nel
// corpus originale (dopo un punto, o la primissima).
function startingWords() {
    const starts = new Set([tokens[0]]);
    tokens.forEach((t, i) => {
        if (i > 0 && /[.!?]$/.test(tokens[i - 1])) starts.add(t);
    });
    return [...starts];
}

let state = {
    order: 1,
    greedy: false,
    generated: [],
    isPlaying: false,
    speed: 700,
    interval: null,
    stopped: false,
    stopReason: ''
};

function currentContext() {
    const n = state.order;
    return state.generated.slice(-n).join(' ');
}

function getDistribution() {
    const model = models[state.order];
    const context = currentContext();
    const dist = model[context];
    if (!dist) return null;
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    return Object.entries(dist)
        .map(([word, count]) => ({ word, p: count / total }))
        .sort((a, b) => b.p - a.p);
}

function weightedPick(dist) {
    let r = Math.random();
    for (const entry of dist) {
        if (r < entry.p) return entry.word;
        r -= entry.p;
    }
    return dist[dist.length - 1].word;
}

function step() {
    if (state.stopped) return;

    const dist = getDistribution();
    if (!dist) {
        state.stopped = true;
        state.stopReason = 'Il modello non ha mai visto questa combinazione di parole nel testo originale: vicolo cieco.';
        stopPlaying();
        render();
        return;
    }

    const nextWord = state.greedy ? dist[0].word : weightedPick(dist);
    state.generated.push(nextWord);

    if (state.generated.length >= MAX_LENGTH) {
        state.stopped = true;
        state.stopReason = `Mi sono fermato dopo ${MAX_LENGTH} parole (per non continuare all'infinito) — nota se il testo si è messo a ripetersi in un ciclo.`;
        stopPlaying();
    }

    render();
}

function render() {
    const textEl = document.getElementById('generatedText');
    textEl.innerHTML = state.generated
        .map((w, i) => i === state.generated.length - 1 ? `<span class="current-word">${w}</span>` : w)
        .join(' ');

    const weightsPanel = document.getElementById('weightsPanel');
    if (state.stopped) {
        weightsPanel.innerHTML = `<p class="weights-placeholder">⏹ ${state.stopReason}</p>`;
    } else {
        const dist = getDistribution();
        if (!dist) {
            weightsPanel.innerHTML = '<p class="weights-placeholder">Nessuna continuazione nota per questo contesto.</p>';
        } else {
            let html = `<div class="weights-title">Possibili parole successive (contesto: "${currentContext()}"):</div>`;
            dist.forEach(({ word, p }) => {
                const pct = Math.round(p * 100);
                html += `
                    <div class="weight-row">
                        <span class="weight-word">${word}</span>
                        <div class="weight-bar-container">
                            <div class="weight-bar" style="width: ${pct}%"></div>
                        </div>
                        <span class="weight-value">${pct}%</span>
                    </div>
                `;
            });
            weightsPanel.innerHTML = html;
        }
    }

    const playBtn = document.getElementById('playPauseBtn');
    playBtn.disabled = state.stopped;
    document.getElementById('stepBtn').disabled = state.stopped;
    playBtn.textContent = state.isPlaying ? '⏸ Pausa' : '▶ Avvia';
}

function startPlaying() {
    if (state.stopped) return;
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    state.interval = setInterval(() => {
        if (state.stopped) { stopPlaying(); return; }
        step();
    }, state.speed);
    render();
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
}

function playPause() {
    if (state.stopped) return;
    if (state.isPlaying) { stopPlaying(); render(); } else { startPlaying(); }
}

function resetGeneration() {
    stopPlaying();
    const seed = document.getElementById('seedSelect').value;
    state.generated = seedSequence(seed, state.order);
    state.stopped = false;
    state.stopReason = '';
    render();
}

function populateSeedSelect() {
    const select = document.getElementById('seedSelect');
    select.innerHTML = '';
    startingWords().forEach(word => {
        const opt = document.createElement('option');
        opt.value = word;
        opt.textContent = word;
        select.appendChild(opt);
    });
}

// Event listeners
document.getElementById('memorySelect').addEventListener('change', (e) => {
    state.order = parseInt(e.target.value);
    resetGeneration();
});

document.getElementById('greedyMode').addEventListener('change', (e) => {
    state.greedy = e.target.checked;
    render();
});

document.getElementById('seedSelect').addEventListener('change', resetGeneration);

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); step(); });
document.getElementById('resetBtn').addEventListener('click', resetGeneration);

document.getElementById('corpusToggleBtn').addEventListener('click', () => {
    const panel = document.getElementById('corpusPanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('corpusToggleBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? '📖 Leggi il testo da cui il modello ha imparato ▸'
        : '📖 Leggi il testo da cui il modello ha imparato ▾';
});
document.getElementById('corpusPanel').textContent = corpus;

// Inizializzazione
populateSeedSelect();
resetGeneration();
