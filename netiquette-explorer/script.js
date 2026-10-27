// --- Netiquette: le regole non scritte del comportamento online ------------
//
// Logica pura (classificazione della risposta, punteggio, elenco degli errori)
// verificata a parte in Node su casi costruiti a mano, prima di collegarla a
// questa interfaccia (vedi README.md).
//
// Scelta di interazione: come in phishing-awareness-explorer, niente pattern
// "Avvia"/"Passo singolo". Per ogni messaggio l'utente risponde una sola
// volta e vede subito tutta la valutazione: è un esercizio di riconoscimento,
// non una sequenza temporale da animare.

const RULES = {
    maiuscolo: 'Scrivere TUTTO IN MAIUSCOLO (percepito come gridare)',
    flood: 'Messaggio fuori tema (flood/off-topic)',
    flaming: 'Tono aggressivo o insultante verso un\'altra persona (flaming)',
    privacy: 'Informazioni private di un\'altra persona condivise senza permesso',
    registro: 'Registro linguistico inadeguato al contesto',
    spam: 'Pubblicità o link non richiesti in un contesto non adatto (spam)',
    domande_ripetute: 'Domanda già risposta, senza aver letto cosa è stato scritto sopra'
};

const MESSAGES = [
    {
        id: 1,
        ok: false,
        rule: 'maiuscolo',
        context: 'Gruppo chat di classe — 3ª A',
        format: 'chat',
        author: 'Giulia',
        text: "RAGAZZI AVETE VISTO CHE DOMANI C'È IL COMPITO DI MATEMATICA?? IO NON HO STUDIATO NIENTE AIUTOOO",
        explanation: "Scrivere un intero messaggio in MAIUSCOLO viene percepito online come gridare, anche quando non è l'intenzione di chi scrive. In questo caso probabilmente vuole solo sottolineare l'ansia per il compito, ma l'effetto su chi legge è di un tono allarmato o aggressivo, non quello di una domanda tranquilla al gruppo."
    },
    {
        id: 2,
        ok: true,
        context: 'Commento sotto un video (canale di divulgazione scientifica)',
        format: 'comment',
        author: 'utente_curioso92',
        text: "Video molto chiaro, grazie! Non avevo capito la differenza tra velocità e accelerazione finché non ho visto l'esempio dell'ascensore a 4:30. C'è un video simile anche sull'energia cinetica?",
        explanation: "Il commento è pertinente al contenuto del video, specifico (cita un momento preciso, 4:30) e scritto in un tono informale ma rispettoso, del tutto adeguato a un commento pubblico sotto un video."
    },
    {
        id: 3,
        ok: false,
        rule: 'registro',
        context: 'Email a un professore',
        format: 'email',
        author: 'Marco (studente)',
        subject: 'ciao prof',
        text: "ciao prof nn ho capito tt la lezione di oggi, mi mandi gli appunti plz? grazie 😊👍",
        explanation: "Il registro è troppo informale per un'email a un insegnante: abbreviazioni da chat ('nn', 'tt', 'plz'), nessun saluto o firma adeguati, ed emoji in un contesto che richiede un tono più formale. La richiesta in sé è legittima: è la forma a non essere adatta al destinatario."
    },
    {
        id: 4,
        ok: false,
        rule: 'spam',
        context: "Canale di lavoro 'generale' (azienda fittizia)",
        format: 'slack',
        author: 'Davide (Magazzino)',
        text: "Ciao a tutti! Se vi serve un idraulico fidato per casa, contattate mio cugino al numero 333-xxxxxxx, prezzi ottimi! 🔧",
        explanation: "È un messaggio pubblicitario non richiesto e del tutto estraneo al lavoro, pubblicato in un canale aziendale pensato per le comunicazioni di servizio: anche se scritto in buona fede, resta spam fuori contesto."
    },
    {
        id: 5,
        ok: false,
        rule: 'flaming',
        context: 'Forum di un gioco online',
        format: 'forum',
        threadTitle: 'Discussione: strategie per il livello 7',
        author: 'ShadowBlade99',
        text: "Sei il giocatore più scarso che abbia mai visto, non sai nemmeno giocare, disinstalla il gioco e non tornare più, inutile.",
        explanation: "È un attacco diretto e insultante verso un'altra persona (flaming): anche in un contesto competitivo come un forum di gioco, criticare una strategia o una partita non giustifica mai insulti personali."
    },
    {
        id: 6,
        ok: true,
        context: 'Gruppo chat di classe — 3ª A',
        format: 'chat',
        author: 'Elena',
        text: "Ragazzi scusate, domani sarò assente per una visita medica: qualcuno può farmi un breve riassunto vocale di cosa viene spiegato in classe? Grazie mille in anticipo! 🙏",
        explanation: "Il messaggio è pertinente al gruppo (organizzazione scolastica tra compagni), chiaro nella richiesta, e scritto con un tono gentile: adeguato al contesto di una chat di classe."
    },
    {
        id: 7,
        ok: false,
        rule: 'privacy',
        context: 'Email a un professore',
        format: 'email',
        author: 'Sara (studente)',
        subject: 'Richiesta proroga consegna progetto',
        text: "Buongiorno Professore,\nvolevo chiederLe una proroga per la consegna del progetto. Il mio compagno Luca non ha potuto lavorarci con me perché la settimana scorsa è stato ricoverato in ospedale per un problema di salute piuttosto delicato, e i suoi genitori mi hanno chiesto di non parlarne in giro — ma volevo che Lei capisse il motivo del ritardo.\n\nCordiali saluti,\nSara",
        explanation: "Il problema non è chiedere una proroga, ma condividere un dettaglio sanitario privato di un'altra persona (Luca) senza il suo permesso — tanto più dopo che la famiglia aveva chiesto esplicitamente di non parlarne. Sarebbe bastato scrivere che il compagno ha avuto un'emergenza personale, senza entrare nei dettagli."
    },
    {
        id: 8,
        ok: false,
        rule: 'domande_ripetute',
        context: 'Forum di un gioco online',
        format: 'forum',
        threadTitle: 'Discussione: come craftare la spada di ghiaccio?',
        author: 'NoobMaster_22',
        text: "Ragazzi scusate ma come si fa a craftare la spada di ghiaccio?",
        threadContext: [
            { author: 'IceQueen_77', text: 'Come si craft la spada di ghiaccio? Non trovo la ricetta da nessuna parte...' },
            { author: 'MapMasterGuide', text: 'Serve: 3 cristalli di gelo + 1 lingotto d\'acciaio, alla fucina incantata. Guida completa qui: [link alla guida]' }
        ],
        explanation: "La stessa identica domanda era già stata posta e risposta pochi messaggi più sopra, con tanto di guida linkata: chi scrive non ha letto cosa era già stato scritto, costringendo altri a ripetersi. Prima di fare una domanda in un forum (o in un gruppo) è buona norma leggere, o cercare, se è già stata affrontata."
    }
];

// --- Logica pura -------------------------------------------------------------

function classify(userChoice, message) {
    const correctChoice = message.ok ? 'ok' : 'bad';
    return { correctChoice, correct: userChoice === correctChoice };
}

function computeScore(answers) {
    const correct = answers.filter(a => a.correct).length;
    return { correct, total: answers.length };
}

function getMistakes(answers, messages) {
    return answers
        .filter(a => !a.correct)
        .map(a => {
            const msg = messages.find(m => m.id === a.messageId);
            return { context: msg.context, userChoice: a.userChoice, correctChoice: a.correctChoice, msg };
        });
}

// --- Stato dell'interfaccia ---------------------------------------------------

let currentIndex = 0;
let answers = [];
let answeredCurrent = false;

function labelFor(choice) {
    return choice === 'bad' ? '⚠ Non va bene' : '✓ Va bene';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderMessageFrame(message) {
    const frame = document.getElementById('messageFrame');
    let html = '';

    if (message.format === 'chat') {
        html = `
            <div class="chat-thread">
                <div class="chat-bubble highlight">
                    <div class="chat-author">${escapeHtml(message.author)}</div>
                    <div class="chat-text">${escapeHtml(message.text)}</div>
                </div>
            </div>
        `;
    } else if (message.format === 'comment') {
        html = `
            <div class="video-header"><span class="video-icon">▶️</span> Canale Scienza Facile Fittizia — "Perché gli oggetti accelerano?"</div>
            <div class="comment-card">
                <div class="chat-author">${escapeHtml(message.author)}</div>
                <div class="chat-text">${escapeHtml(message.text)}</div>
            </div>
        `;
    } else if (message.format === 'email') {
        html = `
            <div class="email-card">
                <div class="email-row"><div class="email-label">Da:</div><div class="email-value">${escapeHtml(message.author)}</div></div>
                <div class="email-row"><div class="email-label">Oggetto:</div><div class="email-value">${escapeHtml(message.subject)}</div></div>
                <div class="email-body">${escapeHtml(message.text)}</div>
            </div>
        `;
    } else if (message.format === 'slack') {
        const initials = message.author.slice(0, 2).toUpperCase();
        html = `
            <div class="slack-header"># generale</div>
            <div class="slack-message">
                <div class="slack-avatar">${initials}</div>
                <div class="slack-body">
                    <div class="chat-author">${escapeHtml(message.author)}</div>
                    <div class="chat-text">${escapeHtml(message.text)}</div>
                </div>
            </div>
        `;
    } else if (message.format === 'forum') {
        const prior = (message.threadContext || []).map(p => `
            <div class="forum-post muted">
                <div class="forum-author">${escapeHtml(p.author)}</div>
                <div class="chat-text">${escapeHtml(p.text)}</div>
            </div>
        `).join('');
        html = `
            <div class="forum-thread-title">🧵 ${escapeHtml(message.threadTitle)}</div>
            ${prior}
            <div class="forum-post highlight">
                <div class="forum-author">${escapeHtml(message.author)}</div>
                <div class="chat-text">${escapeHtml(message.text)}</div>
            </div>
        `;
    }

    frame.innerHTML = html;
    document.getElementById('contextTag').textContent = message.context;
}

function renderProgress() {
    document.getElementById('progressText').textContent =
        `Messaggio ${currentIndex + 1} di ${MESSAGES.length} — punteggio finora: ${computeScore(answers).correct} / ${answers.length}`;
}

function renderFeedback(message, result, userChoice) {
    const box = document.getElementById('feedbackBox');
    box.classList.remove('hidden');
    box.className = 'result-box ' + (result.correct ? 'good' : 'bad');

    const verdictText = message.ok
        ? '✓ Questo messaggio VA BENE per il suo contesto.'
        : '⚠ Questo messaggio NON VA BENE.';
    const yourAnswerText = `Hai risposto: ${labelFor(userChoice)} — ${result.correct ? 'risposta corretta.' : 'risposta sbagliata.'}`;

    let detailHtml;
    if (!message.ok) {
        detailHtml = `<div class="rule-badge">Regola violata: ${escapeHtml(RULES[message.rule])}</div><p>${escapeHtml(message.explanation)}</p>`;
    } else {
        detailHtml = `<p style="margin-top:0.4rem;">${escapeHtml(message.explanation)}</p>`;
    }

    box.innerHTML = `<div class="verdict-banner">${verdictText}</div><div>${yourAnswerText}</div>${detailHtml}`;
}

function renderMessage() {
    const message = MESSAGES[currentIndex];
    answeredCurrent = false;
    renderMessageFrame(message);
    renderProgress();

    document.getElementById('feedbackBox').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('answerControls').classList.remove('hidden');
    document.getElementById('okBtn').disabled = false;
    document.getElementById('badBtn').disabled = false;

    document.getElementById('quizArea').classList.remove('hidden');
    document.getElementById('summaryArea').classList.add('hidden');
}

function answer(userChoice) {
    if (answeredCurrent) return;
    answeredCurrent = true;

    const message = MESSAGES[currentIndex];
    const result = classify(userChoice, message);
    answers.push({ messageId: message.id, userChoice, correctChoice: result.correctChoice, correct: result.correct });

    document.getElementById('okBtn').disabled = true;
    document.getElementById('badBtn').disabled = true;
    renderFeedback(message, result, userChoice);
    renderProgress();

    const nextBtn = document.getElementById('nextBtn');
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = currentIndex >= MESSAGES.length - 1 ? 'Vedi il riepilogo finale →' : 'Messaggio successivo →';
}

function goNext() {
    if (currentIndex >= MESSAGES.length - 1) {
        showSummary();
        return;
    }
    currentIndex++;
    renderMessage();
}

function showSummary() {
    document.getElementById('quizArea').classList.add('hidden');
    document.getElementById('summaryArea').classList.remove('hidden');

    const score = computeScore(answers);
    const scoreBox = document.getElementById('summaryScoreBox');
    scoreBox.className = 'result-box ' + (score.correct === score.total ? 'good' : (score.correct >= score.total / 2 ? 'good' : 'bad'));
    scoreBox.textContent = `Hai valutato correttamente ${score.correct} messaggi su ${score.total}.`;

    const mistakes = getMistakes(answers, MESSAGES);
    const wrongWrap = document.getElementById('summaryWrongList');
    if (mistakes.length === 0) {
        wrongWrap.innerHTML = '<p style="margin-top:0.75rem; color:#166534; font-size:0.85rem;">Nessun errore: ottimo lavoro nel riconoscere ogni messaggio!</p>';
    } else {
        wrongWrap.innerHTML = '<h3 class="help-title" style="margin-top:0.9rem; color:#1f2937;">Messaggi valutati male</h3>' +
            mistakes.map(m => `
                <div class="summary-wrong-item">
                    <strong>${escapeHtml(m.context)}</strong><br>
                    Hai risposto <strong>${labelFor(m.userChoice)}</strong>, ma la risposta corretta era <strong>${labelFor(m.correctChoice)}</strong>.<br>
                    ${escapeHtml(m.msg.explanation)}
                </div>
            `).join('');
    }
}

function restart() {
    currentIndex = 0;
    answers = [];
    renderMessage();
}

// Render iniziale.
renderMessage();

document.getElementById('okBtn').addEventListener('click', () => answer('ok'));
document.getElementById('badBtn').addEventListener('click', () => answer('bad'));
document.getElementById('nextBtn').addEventListener('click', goNext);
document.getElementById('restartBtn').addEventListener('click', restart);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Ma online si scherza sempre un po\' così tra amici: è davvero un problema? ▸'
        : 'Ma online si scherza sempre un po\' così tra amici: è davvero un problema? ▾';
});
