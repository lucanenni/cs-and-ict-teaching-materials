// Ogni frase ha una serie di token "principali" e, opzionalmente, uno o due
// punti di scelta in cui il modello avrebbe potuto proseguire in modo diverso.
// `firstChoice`/`secondChoice` sono opzionali: una frase può averne 0, 1 o 2.
// In ogni punto di scelta le probabilità (mainProbability + alternatives)
// sommano sempre a 100.
const exampleSentences = [
    {
        prompt: "Completa: Il gatto",
        tokens: ["Il", " gatto", " nero", " dorme", " sul", " divano", " comodo", "."],
        firstChoice: {
            position: 2,
            mainProbability: 40,
            alternatives: [
                { token: " rosso", probability: 25, continueWith: [" dorme", " sul", " tappeto", " morbido", "."] },
                { token: " bianco", probability: 15, continueWith: [" dorme", " nella", " sua", " cuccia", "."] },
                { token: " tigrato", probability: 12, continueWith: [" dorme", " vicino", " al", " camino", "."] },
                { token: " grigio", probability: 8, continueWith: [" dorme", " tutto", " il", " giorno", "."] }
            ]
        },
        secondChoice: {
            position: 3,
            mainProbability: 40,
            alternatives: [
                { token: " gioca", probability: 24, continueWith: [" con", " il", " gomitolo", " di", " lana", "."] },
                { token: " corre", probability: 16, continueWith: [" veloce", " nel", " giardino", "."] },
                { token: " si", probability: 12, continueWith: [" nasconde", " sotto", " il", " letto", "."] },
                { token: " miagola", probability: 8, continueWith: [" forte", " vicino", " alla", " porta", "."] }
            ]
        }
    },
    {
        prompt: "Completa: La programmazione",
        tokens: ["La", " programmazione", " è", " l'arte", " di", " risolvere", " problemi", " con", " il", " codice", "."],
        firstChoice: {
            position: 2,
            mainProbability: 40,
            alternatives: [
                { token: " richiede", probability: 20, continueWith: [" l'arte", " di", " scomporre", " problemi", " complessi", "."] },
                { token: " permette", probability: 17, continueWith: [" l'arte", " di", " automatizzare", " processi", "."] },
                { token: " insegna", probability: 13, continueWith: [" l'arte", " di", " pensare", " in", " modo", " strutturato", "."] },
                { token: " sviluppa", probability: 10, continueWith: [" l'arte", " di", " creare", " soluzioni", " innovative", "."] }
            ]
        },
        secondChoice: {
            position: 4,
            mainProbability: 40,
            alternatives: [
                { token: " risolvere", probability: 23, continueWith: [" problemi", " complessi", " con", " eleganza", "."] },
                { token: " creare", probability: 17, continueWith: [" software", " utile", " per", " tutti", "."] },
                { token: " trasformare", probability: 12, continueWith: [" idee", " in", " realtà", " digitale", "."] },
                { token: " automatizzare", probability: 8, continueWith: [" compiti", " ripetitivi", " e", " noiosi", "."] }
            ]
        }
    },
    {
        prompt: "Completa: Nel design grafico",
        tokens: ["Nel", " design", " grafico", ",", " i", " colori", " comunicano", " emozioni", " e", " messaggi", "."],
        firstChoice: {
            position: 4,
            mainProbability: 40,
            alternatives: [
                { token: " le", probability: 21, continueWith: [" forme", " comunicano", " struttura", " e", " significato", "."] },
                { token: " la", probability: 18, continueWith: [" tipografia", " comunica", " tono", " e", " personalità", "."] },
                { token: " gli", probability: 12, continueWith: [" spazi", " comunicano", " equilibrio", " e", " respiro", "."] },
                { token: " il", probability: 9, continueWith: [" contrasto", " comunica", " gerarchia", " visiva", "."] }
            ]
        },
        secondChoice: {
            position: 6,
            mainProbability: 40,
            alternatives: [
                { token: " esprimono", probability: 20, continueWith: [" emozioni", " profonde", " e", " immediate", "."] },
                { token: " trasmettono", probability: 17, continueWith: [" significati", " culturali", " specifici", "."] },
                { token: " creano", probability: 13, continueWith: [" atmosfere", " coinvolgenti", " e", " memorabili", "."] },
                { token: " influenzano", probability: 10, continueWith: [" percezioni", " e", " decisioni", "."] }
            ]
        }
    },
    {
        // Esempio con un solo punto di scelta (e sole 3 alternative), per mostrare
        // che non tutte le frasi hanno per forza due bivi.
        prompt: "Completa: Oggi il tempo",
        tokens: ["Oggi", " il", " tempo", " è", " splendido", " e", " caldo", "."],
        firstChoice: {
            position: 4,
            mainProbability: 45,
            alternatives: [
                { token: " pessimo", probability: 30, continueWith: [" e", " piove", " forte", "."] },
                { token: " variabile", probability: 15, continueWith: [" con", " nuvole", " sparse", "."] },
                { token: " incerto", probability: 10, continueWith: [" tra", " sole", " e", " pioggia", "."] }
            ]
        }
    }
];

// Stato dell'applicazione
let state = {
    currentIndex: 0,
    isPlaying: false,
    selectedSentence: 0,
    selectedPath: 'main',
    speed: 500,
    autoMode: false,
    currentChoicePoint: 1,
    firstChoiceMade: false,
    secondChoiceMade: false,
    interval: null
};

function getTokensForPath() {
    const sentence = exampleSentences[state.selectedSentence];

    if (state.selectedPath === 'main') {
        return sentence.tokens;
    }

    const parts = state.selectedPath.split('-');

    if (state.selectedPath.startsWith('main-alt2-') && sentence.secondChoice) {
        const alt2Index = parseInt(parts[2]);
        const alt2 = sentence.secondChoice.alternatives[alt2Index];
        return [...sentence.tokens.slice(0, sentence.secondChoice.position), alt2.token, ...alt2.continueWith];
    } else if (parts.length === 2 && parts[0] === 'alt1' && sentence.firstChoice) {
        const altIndex = parseInt(parts[1]);
        const alt = sentence.firstChoice.alternatives[altIndex];
        return [...sentence.tokens.slice(0, sentence.firstChoice.position), alt.token, ...alt.continueWith];
    } else if (parts.length === 4 && sentence.firstChoice && sentence.secondChoice) {
        const alt1Index = parseInt(parts[1]);
        const alt2Index = parseInt(parts[3]);
        const alt1 = sentence.firstChoice.alternatives[alt1Index];
        const alt2 = sentence.secondChoice.alternatives[alt2Index];

        const tokensBeforeSecondChoice = alt1.continueWith.slice(0, sentence.secondChoice.position - sentence.firstChoice.position - 1);
        return [
            ...sentence.tokens.slice(0, sentence.firstChoice.position),
            alt1.token,
            ...tokensBeforeSecondChoice,
            alt2.token,
            ...alt2.continueWith
        ];
    }

    return sentence.tokens;
}

function render() {
    const sentence = exampleSentences[state.selectedSentence];
    const currentTokens = getTokensForPath();
    const displayedTokens = currentTokens.slice(0, state.currentIndex + 1);
    const nextToken = currentTokens[state.currentIndex + 1];

    // Render prompt
    document.getElementById('promptText').textContent = `Prompt: ${sentence.prompt}`;

    // Render tokens
    const tokensContainer = document.getElementById('tokensContainer');
    tokensContainer.innerHTML = '';

    displayedTokens.forEach((token, idx) => {
        const span = document.createElement('span');
        span.className = 'token';

        if (idx === state.currentIndex) {
            span.classList.add('token-current');
        } else if (sentence.firstChoice && state.selectedPath.startsWith('alt1-') && idx === sentence.firstChoice.position) {
            span.classList.add('token-alt');
        } else if (sentence.secondChoice && (state.selectedPath.startsWith('alt2-') || state.selectedPath.includes('-alt2-')) && idx === sentence.secondChoice.position) {
            span.classList.add('token-alt');
        } else {
            span.classList.add('token-generated');
        }

        span.textContent = token;
        tokensContainer.appendChild(span);
    });

    // Render next token
    if (nextToken && state.currentIndex < currentTokens.length - 1) {
        const span = document.createElement('span');
        span.className = 'token token-next';
        span.textContent = nextToken;
        tokensContainer.appendChild(span);
    }

    // Render info
    let infoText = `Token generati: <strong>${state.currentIndex + 1}</strong> / ${currentTokens.length}`;

    if (state.selectedPath !== 'main' && !state.selectedPath.startsWith('main-')) {
        if (state.selectedPath.includes('-alt2-')) {
            infoText += '<span class="info-alt-path">(percorsi alternativi - scelte 1 e 2)</span>';
        } else {
            infoText += '<span class="info-alt-path">(percorso alternativo - scelta 1)</span>';
        }
    }
    if (state.selectedPath.startsWith('main-alt2-')) {
        infoText += '<span class="info-alt-path">(percorso alternativo - scelta 2)</span>';
    }

    infoText += '<br>';

    if (state.currentIndex < currentTokens.length - 1) {
        infoText += `Prossimo token: <strong>"${nextToken}"</strong>`;
    } else {
        infoText += '<span class="info-complete">✓ Generazione completata!</span>';
    }

    document.getElementById('infoContent').innerHTML = infoText;

    // Update play button
    const playBtn = document.getElementById('playPauseBtn');
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else if (state.currentIndex >= currentTokens.length - 1) {
        playBtn.textContent = '↻ Riavvia';
    } else {
        playBtn.textContent = '▶ Avvia';
    }
}

function showChoices() {
    const sentence = exampleSentences[state.selectedSentence];
    const choicesPanel = document.getElementById('choicesPanel');

    const choice = state.currentChoicePoint === 1 ? sentence.firstChoice : sentence.secondChoice;
    if (!choice) return;

    const choiceLabel = state.currentChoicePoint === 1 ? '(prima scelta)' : '(seconda scelta)';
    const mainProb = `${choice.mainProbability}%`;

    const mainToken = sentence.tokens[choice.position];
    const mainPreview = sentence.tokens.slice(0, choice.position + 4).join('');
    const alternatives = choice.alternatives;

    let html = `
                <div class="choices-title">
                    🔀 Scelta del percorso ${choiceLabel}
                </div>
                <p class="choices-description">
                    Il modello ha calcolato diverse probabilità per il prossimo token. Scegli quale percorso seguire:
                </p>

                <button class="choice-button choice-main" onclick="handleChoice('main')">
                    <div class="choice-header">
                        <span class="choice-token">${mainToken}</span>
                        <span class="choice-probability prob-main">${mainProb} probabilità</span>
                    </div>
                    <div class="choice-preview">${mainPreview}...</div>
                    <div class="choice-bar-container">
                        <div class="choice-bar bar-main" style="width: ${mainProb}"></div>
                    </div>
                </button>
            `;

    alternatives.forEach((alt, idx) => {
        const preview = [...sentence.tokens.slice(0, choice.position), alt.token, ...alt.continueWith.slice(0, 3)].join('');

        html += `
                    <button class="choice-button choice-alt" onclick="handleChoice('alt${state.currentChoicePoint}-${idx}')">
                        <div class="choice-header">
                            <span class="choice-token">${alt.token}</span>
                            <span class="choice-probability prob-alt">${alt.probability}% probabilità</span>
                        </div>
                        <div class="choice-preview">${preview}...</div>
                        <div class="choice-bar-container">
                            <div class="choice-bar bar-alt" style="width: ${alt.probability}%"></div>
                        </div>
                    </button>
                `;
    });

    choicesPanel.innerHTML = html;
    choicesPanel.classList.remove('hidden');
}

function handleChoice(path) {
    let newPath;

    if (state.currentChoicePoint === 2) {
        if (state.selectedPath === 'main') {
            if (path === 'main') {
                newPath = 'main';
            } else {
                newPath = 'main-' + path;
            }
        } else if (state.selectedPath.startsWith('alt1-')) {
            newPath = state.selectedPath + '-' + path;
        } else {
            newPath = path;
        }
        state.secondChoiceMade = true;
    } else {
        newPath = path;
        state.firstChoiceMade = true;
    }

    state.selectedPath = newPath;
    document.getElementById('choicesPanel').classList.add('hidden');

    setTimeout(() => {
        state.isPlaying = true;
        startInterval();
        render();
    }, 100);
}

function startInterval() {
    if (state.interval) clearInterval(state.interval);

    state.interval = setInterval(() => {
        const currentTokens = getTokensForPath();
        const sentence = exampleSentences[state.selectedSentence];

        if (!state.isPlaying || state.currentIndex >= currentTokens.length - 1) {
            clearInterval(state.interval);
            state.isPlaying = false;
            render();
            return;
        }

        state.currentIndex++;
        render();

        // Le frasi possono non avere un secondo (o alcun) punto di scelta:
        // ogni controllo va eseguito solo se quel punto di scelta esiste davvero.
        const firstChoicePos = sentence.firstChoice ? sentence.firstChoice.position : null;
        const secondChoicePos = sentence.secondChoice ? sentence.secondChoice.position : null;

        if (firstChoicePos !== null && state.currentIndex === firstChoicePos && !state.autoMode && !state.firstChoiceMade) {
            clearInterval(state.interval);
            state.isPlaying = false;
            state.currentChoicePoint = 1;
            showChoices();
        } else if (secondChoicePos !== null && state.currentIndex === secondChoicePos && !state.autoMode && !state.secondChoiceMade) {
            clearInterval(state.interval);
            state.isPlaying = false;
            state.currentChoicePoint = 2;
            showChoices();
        }
    }, state.speed);
}

function reset() {
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = false;
    state.currentIndex = 0;
    state.selectedPath = 'main';
    state.firstChoiceMade = false;
    state.secondChoiceMade = false;
    state.currentChoicePoint = 1;
    document.getElementById('choicesPanel').classList.add('hidden');
    render();
}

function playPause() {
    const currentTokens = getTokensForPath();

    if (state.currentIndex >= currentTokens.length - 1) {
        reset();
        setTimeout(() => {
            state.isPlaying = true;
            startInterval();
            render();
        }, 100);
    } else {
        state.isPlaying = !state.isPlaying;
        if (state.isPlaying) {
            startInterval();
        } else {
            if (state.interval) clearInterval(state.interval);
        }
        render();
    }
}

// Event listeners
document.getElementById('sentenceSelect').addEventListener('change', (e) => {
    state.selectedSentence = parseInt(e.target.value);
    reset();
});

document.getElementById('autoMode').addEventListener('change', (e) => {
    state.autoMode = e.target.checked;
});

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('resetBtn').addEventListener('click', reset);

document.getElementById('settingsBtn').addEventListener('click', () => {
    const panel = document.getElementById('settingsPanel');
    const isHidden = panel.classList.toggle('hidden');
    document.getElementById('settingsBtn').setAttribute('aria-expanded', String(!isHidden));
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value);
    document.getElementById('speedLabel').textContent = `Velocità di generazione: ${state.speed}ms`;
    if (state.isPlaying) {
        startInterval();
    }
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché il modello sceglie queste probabilità? ▸'
        : 'Perché il modello sceglie queste probabilità? ▾';
});

// Inizializzazione
render();
