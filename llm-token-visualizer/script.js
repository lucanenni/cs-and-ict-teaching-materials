const exampleSentences = [
    {
        prompt: "Completa: Il gatto",
        tokens: ["Il", " gatto", " nero", " dorme", " sul", " divano", " comodo", "."],
        firstChoice: {
            position: 2,
            alternatives: [
                { token: " rosso", probability: 25, continueWith: [" dorme", " sul", " tappeto", " morbido", "."] },
                { token: " bianco", probability: 15, continueWith: [" dorme", " nella", " sua", " cuccia", "."] },
                { token: " tigrato", probability: 12, continueWith: [" dorme", " vicino", " al", " camino", "."] },
                { token: " grigio", probability: 8, continueWith: [" dorme", " tutto", " il", " giorno", "."] }
            ]
        },
        secondChoice: {
            position: 3,
            alternatives: [
                { token: " gioca", probability: 30, continueWith: [" con", " il", " gomitolo", " di", " lana", "."] },
                { token: " corre", probability: 20, continueWith: [" veloce", " nel", " giardino", "."] },
                { token: " si", probability: 15, continueWith: [" nasconde", " sotto", " il", " letto", "."] },
                { token: " miagola", probability: 10, continueWith: [" forte", " vicino", " alla", " porta", "."] }
            ]
        }
    },
    {
        prompt: "Completa: La programmazione",
        tokens: ["La", " programmazione", " è", " l'arte", " di", " risolvere", " problemi", " con", " il", " codice", "."],
        firstChoice: {
            position: 2,
            alternatives: [
                { token: " richiede", probability: 30, continueWith: [" l'arte", " di", " scomporre", " problemi", " complessi", "."] },
                { token: " permette", probability: 25, continueWith: [" l'arte", " di", " automatizzare", " processi", "."] },
                { token: " insegna", probability: 20, continueWith: [" l'arte", " di", " pensare", " in", " modo", " strutturato", "."] },
                { token: " sviluppa", probability: 15, continueWith: [" l'arte", " di", " creare", " soluzioni", " innovative", "."] }
            ]
        },
        secondChoice: {
            position: 4,
            alternatives: [
                { token: " risolvere", probability: 35, continueWith: [" problemi", " complessi", " con", " eleganza", "."] },
                { token: " creare", probability: 25, continueWith: [" software", " utile", " per", " tutti", "."] },
                { token: " trasformare", probability: 18, continueWith: [" idee", " in", " realtà", " digitale", "."] },
                { token: " automatizzare", probability: 12, continueWith: [" compiti", " ripetitivi", " e", " noiosi", "."] }
            ]
        },
        secondChoice: {
            position: 4,
            alternatives: [
                { token: " risolvere", probability: 35, continueWith: [" problemi", " complessi", " con", " eleganza", "."] },
                { token: " creare", probability: 25, continueWith: [" software", " utile", " per", " tutti", "."] },
                { token: " trasformare", probability: 18, continueWith: [" idee", " in", " realtà", " digitale", "."] },
                { token: " automatizzare", probability: 12, continueWith: [" compiti", " ripetitivi", " e", " noiosi", "."] }
            ]
        }
    },
    {
        prompt: "Completa: Nel design grafico",
        tokens: ["Nel", " design", " grafico", ",", " i", " colori", " comunicano", " emozioni", " e", " messaggi", "."],
        firstChoice: {
            position: 4,
            alternatives: [
                { token: " le", probability: 35, continueWith: [" forme", " comunicano", " struttura", " e", " significato", "."] },
                { token: " la", probability: 30, continueWith: [" tipografia", " comunica", " tono", " e", " personalità", "."] },
                { token: " gli", probability: 20, continueWith: [" spazi", " comunicano", " equilibrio", " e", " respiro", "."] },
                { token: " il", probability: 15, continueWith: [" contrasto", " comunica", " gerarchia", " visiva", "."] }
            ]
        },
        secondChoice: {
            position: 6,
            alternatives: [
                { token: " esprimono", probability: 30, continueWith: [" emozioni", " profonde", " e", " immediate", "."] },
                { token: " trasmettono", probability: 25, continueWith: [" significati", " culturali", " specifici", "."] },
                { token: " creano", probability: 20, continueWith: [" atmosfere", " coinvolgenti", " e", " memorabili", "."] },
                { token: " influenzano", probability: 15, continueWith: [" percezioni", " e", " decisioni", "."] }
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

    if (state.selectedPath.startsWith('main-alt2-')) {
        const alt2Index = parseInt(parts[2]);
        const alt2 = sentence.secondChoice.alternatives[alt2Index];
        return [...sentence.tokens.slice(0, sentence.secondChoice.position), alt2.token, ...alt2.continueWith];
    } else if (parts.length === 2 && parts[0] === 'alt1') {
        const altIndex = parseInt(parts[1]);
        const alt = sentence.firstChoice.alternatives[altIndex];
        return [...sentence.tokens.slice(0, sentence.firstChoice.position), alt.token, ...alt.continueWith];
    } else if (parts.length === 4) {
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
        } else if (state.selectedPath.startsWith('alt1-') && idx === sentence.firstChoice.position) {
            span.classList.add('token-alt1');
        } else if ((state.selectedPath.startsWith('alt2-') || state.selectedPath.includes('-alt2-')) && idx === sentence.secondChoice.position) {
            span.classList.add('token-alt2');
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

    const choiceLabel = state.currentChoicePoint === 1 ? '(prima scelta)' : '(seconda scelta)';
    const mainProb = state.currentChoicePoint === 1 ? '40%' : '35%';
    const mainProbWidth = state.currentChoicePoint === 1 ? '40%' : '35%';

    const mainToken = state.currentChoicePoint === 1
        ? sentence.tokens[sentence.firstChoice.position]
        : sentence.tokens[sentence.secondChoice.position];

    const mainPreview = state.currentChoicePoint === 1
        ? sentence.tokens.slice(0, 6).join('')
        : sentence.tokens.slice(0, 7).join('');

    const alternatives = state.currentChoicePoint === 1
        ? sentence.firstChoice.alternatives
        : sentence.secondChoice.alternatives;

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
                        <div class="choice-bar bar-main" style="width: ${mainProbWidth}"></div>
                    </div>
                </button>
            `;

    alternatives.forEach((alt, idx) => {
        const preview = state.currentChoicePoint === 1
            ? [...sentence.tokens.slice(0, sentence.firstChoice.position), alt.token, ...alt.continueWith.slice(0, 3)].join('')
            : [...sentence.tokens.slice(0, sentence.secondChoice.position), alt.token, ...alt.continueWith.slice(0, 3)].join('');

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

        const firstChoicePos = sentence.firstChoice.position;
        const secondChoicePos = sentence.secondChoice.position;

        // Verifica se dobbiamo fermarci per una scelta
        if (state.currentIndex === firstChoicePos && !state.autoMode && !state.firstChoiceMade) {
            clearInterval(state.interval);
            state.isPlaying = false;
            state.currentChoicePoint = 1;
            showChoices();
        } else if (state.currentIndex === secondChoicePos && !state.autoMode && !state.secondChoiceMade) {
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
    panel.classList.toggle('hidden');
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value);
    document.getElementById('speedLabel').textContent = `Velocità di generazione: ${state.speed}ms`;
    if (state.isPlaying) {
        startInterval();
    }
});

// Inizializzazione
render();