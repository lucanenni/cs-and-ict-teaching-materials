// --- Riconoscere un tentativo di phishing -----------------------------------
//
// Logica pura (classificazione della risposta, punteggio, elenco degli errori)
// verificata a parte in Node su casi costruiti a mano, prima di collegarla
// a questa interfaccia (vedi README.md).
//
// Scelta di interazione: niente pattern "Avvia"/"Passo singolo". Per ogni
// email l'utente risponde una sola volta e vede SUBITO tutti gli indizi
// insieme: è più diretto per un esercizio di riconoscimento in cui non c'è
// una sequenza temporale da animare (a differenza, ad esempio, di un episodio
// di apprendimento per rinforzo).

const EMAILS = [
    {
        id: 1,
        isPhishing: false,
        mittente: 'Biblioteca Civica Fittizia <prestiti@biblioteca-fittizia.it>',
        oggetto: 'Promemoria: scadenza prestito il 22/10',
        corpo: "Gentile utente,\nle ricordiamo che il libro «Il sentiero immaginario» è in prestito dal 01/10 e scade il 22/10. Può rinnovarlo dal suo account oppure restituirlo in sede.\n\nGrazie,\nBiblioteca Civica Fittizia",
        spiegazioneLegittima: 'Mittente coerente con un servizio bibliotecario, nessuna richiesta di dati personali o di pagamento, nessuna urgenza artificiale, nessun link o allegato sospetto.'
    },
    {
        id: 2,
        isPhishing: true,
        mittente: 'ServizioPagamenti <supporto@servizio-pagamenti-sicuro24.com>',
        oggetto: 'URGENTE: il tuo account sarà chiuso entro 24 ore',
        corpo: "Abbiamo rilevato un'attivita anomala sul tuo account. Per evitare la chiusura devi confermare subito i tuoi dati cliccando sul link qui sotto ed inserire password e numero della carta.\n\nQuesto e' un messagio automatico, non rispondere.",
        link: { display: 'www.serviziopagamenti.com/conferma-account', real: 'servizio-pagamenti-sicuro24-verifica.ru/login.php' },
        indizi: [
            'Il dominio del mittente ("servizio-pagamenti-sicuro24.com") è quasi identico a un indirizzo plausibile ma non lo è: un dominio "quasi giusto" è un classico segnale di phishing.',
            'Il link mostrato appare come: "www.serviziopagamenti.com/conferma-account" — ma punta davvero a: "servizio-pagamenti-sicuro24-verifica.ru/login.php", un indirizzo completamente diverso.',
            'Urgenza artificiale: "il tuo account sarà chiuso entro 24 ore" spinge a cliccare senza pensare.',
            'Richiesta diretta, via email, di password e numero della carta: nessun servizio serio lo chiederebbe così.'
        ]
    },
    {
        id: 3,
        isPhishing: false,
        mittente: 'Marco Rossi <marco.rossi@aziendafittizia-informatica.it>',
        oggetto: 'File riunione di lunedì',
        corpo: "Ciao,\nti allego le slide per la riunione di lunedì alle 10. Fammi sapere se mancano dei dati prima di allora.\n\nGrazie,\nMarco",
        allegato: 'slide_riunione.pptx',
        spiegazioneLegittima: "Mittente coerente con un collega e con il dominio aziendale, nessuna richiesta anomala, nessuna urgenza, e l'allegato ha un'estensione normale (.pptx) senza doppie estensioni sospette."
    },
    {
        id: 4,
        isPhishing: true,
        mittente: 'La Tua Banca <assistenza@la-tua-banca-online-sicura.info>',
        oggetto: 'Verifica urgente del tuo conto',
        corpo: "Il tuo accesso è stato sospeso per motivi di sicurezza. Scarica e apri subito l'allegato per ripristinare l'accesso al tuo conto entro 12 ore, altrimenti il conto verra bloccato definitivamente.",
        allegato: 'documento_verifica.pdf.exe',
        indizi: [
            'Il dominio del mittente ("la-tua-banca-online-sicura.info") non corrisponde a un indirizzo bancario plausibile: è generico e con estensione ".info", tipica di domini usa-e-getta.',
            'L\'allegato ha una doppia estensione sospetta: "documento_verifica.pdf.exe" sembra un PDF ma è in realtà un programma eseguibile (.exe).',
            'Urgenza artificiale: "entro 12 ore, altrimenti il conto verrà bloccato definitivamente".'
        ]
    },
    {
        id: 5,
        isPhishing: false,
        mittente: 'Corriere Spedizioni Fittizio <notifiche@corrierefittizio-spedizioni.it>',
        oggetto: 'Il tuo pacco è in consegna oggi',
        corpo: "Il tuo ordine n. 48213 è in consegna oggi tra le 9:00 e le 13:00.\nNumero di tracking: CF48213IT.\n\nNessuna azione richiesta da parte tua.",
        spiegazioneLegittima: 'Nessuna richiesta di dati o di pagamento, nessun link né allegato, nessuna urgenza a cliccare o agire: solo un\'informazione di stato, con un numero di tracking testuale.'
    },
    {
        id: 6,
        isPhishing: true,
        mittente: 'Assistenza Account Social <no-reply@assistenza-social-network.net>',
        oggetto: 'Il Suo account sarà Bloccato!!! Agire Subito',
        corpo: "Gentilissimo utente, abbiamo notato accessi non autorizzati. Clicchi qui per confermare la sua password entro le prossime 2 ore altrimenti il account sarà cancellato per sempre.\n\nCordiali Saluti,\nIl Team",
        link: { display: 'accedi-al-tuo-account.com/sicurezza', real: 'secure-login-verifica-account.xyz/phish123' },
        indizi: [
            'Errori grammaticali e ortografici vistosi: "il account" invece di "il suo account", maiuscole insolite ("Bloccato", "Agire Subito") e punteggiatura eccessiva ("!!!").',
            'Il link mostrato appare come: "accedi-al-tuo-account.com/sicurezza" — ma punta davvero a: "secure-login-verifica-account.xyz/phish123".',
            'Urgenza artificiale: "entro le prossime 2 ore altrimenti... sarà cancellato per sempre".',
            'Richiesta diretta della password per email, per "confermarla".'
        ]
    },
    {
        id: 7,
        isPhishing: false,
        mittente: 'Segreteria Scuola Fittizia <segreteria@scuola-fittizia-istituto.edu.it>',
        oggetto: 'Variazione orario lezioni di giovedì',
        corpo: "Si comunica che giovedì le lezioni di matematica inizieranno alle 9:30 invece delle 8:30, per un'assemblea docenti.\n\nCordiali saluti,\nSegreteria",
        spiegazioneLegittima: 'Mittente coerente con la segreteria scolastica, comunicazione ordinaria senza alcuna richiesta di dati, link o allegati, nessuna urgenza artificiale.'
    },
    {
        id: 8,
        isPhishing: true,
        mittente: 'Lotteria Fortunata <premi@lotteria-fortunata-vincite.top>',
        oggetto: 'Hai vinto 5.000€! Riscatta il premio solo oggi',
        corpo: "Congratulazioni! Il tuo indirizzo email è stato selezionato per vincere 5.000€. Per riscattare il premio invia subito nome, codice fiscale e dati della carta per le spese di spedizione.\n\nOfferta valida solo per le prossime 3 ore.",
        allegato: 'modulo_riscossione.zip.exe',
        indizi: [
            'Urgenza artificiale: "offerta valida solo per le prossime 3 ore" per impedire di riflettere con calma.',
            'Richiesta diretta di dati sensibili (codice fiscale e dati della carta) per ricevere un premio: nessuna lotteria seria lo chiederebbe così.',
            'L\'allegato ha una doppia estensione sospetta: "modulo_riscossione.zip.exe" sembra un archivio ma è un programma eseguibile (.exe).'
        ]
    }
];

// --- Logica pura -------------------------------------------------------------

function classify(userAnswer, email) {
    const correctAnswer = email.isPhishing ? 'phishing' : 'legittima';
    return { correctAnswer, correct: userAnswer === correctAnswer };
}

function computeScore(answers) {
    const correct = answers.filter(a => a.correct).length;
    return { correct, total: answers.length };
}

function getWrongAnswers(answers, emails) {
    return answers
        .filter(a => !a.correct)
        .map(a => {
            const email = emails.find(e => e.id === a.emailId);
            return { oggetto: email.oggetto, userAnswer: a.userAnswer, correctAnswer: a.correctAnswer };
        });
}

// --- Stato dell'interfaccia ---------------------------------------------------

let currentIndex = 0;
let answers = [];
let answeredCurrent = false;

function labelFor(answer) {
    return answer === 'phishing' ? '⚠ Phishing' : '✓ Legittima';
}

function renderEmailCard(email) {
    const card = document.getElementById('emailCard');
    let linkHtml = '';
    if (email.link) {
        linkHtml = `<div class="email-link">🔗 ${email.link.display}</div>`;
    }
    let attachHtml = '';
    if (email.allegato) {
        attachHtml = `<div class="email-attachment">📎 ${email.allegato}</div>`;
    }
    card.innerHTML = `
        <div class="email-row"><div class="email-label">Da:</div><div class="email-value">${email.mittente}</div></div>
        <div class="email-row"><div class="email-label">Oggetto:</div><div class="email-value">${email.oggetto}</div></div>
        <div class="email-body">${email.corpo}</div>
        ${linkHtml}
        ${attachHtml}
    `;
}

function renderProgress() {
    document.getElementById('progressText').textContent = `Email ${currentIndex + 1} di ${EMAILS.length} — punteggio finora: ${computeScore(answers).correct} / ${answers.length}`;
}

function renderFeedback(email, result, userAnswer) {
    const box = document.getElementById('feedbackBox');
    box.classList.remove('hidden');
    box.className = 'result-box ' + (result.correct ? 'good' : 'bad');

    const verdictText = email.isPhishing
        ? '⚠ Questa email è un tentativo di PHISHING.'
        : '✓ Questa email è LEGITTIMA.';
    const yourAnswerText = `Hai risposto: ${labelFor(userAnswer)} — ${result.correct ? 'risposta corretta.' : 'risposta sbagliata.'}`;

    let detailHtml;
    if (email.isPhishing) {
        detailHtml = `<ul class="indizio-list">${email.indizi.map(ind => `<li>${ind}</li>`).join('')}</ul>`;
    } else {
        detailHtml = `<p style="margin-top:0.4rem;">${email.spiegazioneLegittima}</p>`;
    }

    box.innerHTML = `<div class="verdict-banner">${verdictText}</div><div>${yourAnswerText}</div>${detailHtml}`;
}

function renderEmail() {
    const email = EMAILS[currentIndex];
    answeredCurrent = false;
    renderEmailCard(email);
    renderProgress();

    document.getElementById('feedbackBox').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('answerControls').classList.remove('hidden');
    document.getElementById('legitBtn').disabled = false;
    document.getElementById('phishBtn').disabled = false;

    document.getElementById('quizArea').classList.remove('hidden');
    document.getElementById('summaryArea').classList.add('hidden');
}

function answer(userAnswer) {
    if (answeredCurrent) return;
    answeredCurrent = true;

    const email = EMAILS[currentIndex];
    const result = classify(userAnswer, email);
    answers.push({ emailId: email.id, userAnswer, correctAnswer: result.correctAnswer, correct: result.correct });

    document.getElementById('legitBtn').disabled = true;
    document.getElementById('phishBtn').disabled = true;
    renderFeedback(email, result, userAnswer);
    renderProgress();

    const nextBtn = document.getElementById('nextBtn');
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = currentIndex >= EMAILS.length - 1 ? 'Vedi il punteggio finale →' : 'Email successiva →';
}

function goNext() {
    if (currentIndex >= EMAILS.length - 1) {
        showSummary();
        return;
    }
    currentIndex++;
    renderEmail();
}

function showSummary() {
    document.getElementById('quizArea').classList.add('hidden');
    document.getElementById('summaryArea').classList.remove('hidden');

    const score = computeScore(answers);
    const scoreBox = document.getElementById('summaryScoreBox');
    const good = score.correct === score.total;
    scoreBox.className = 'result-box ' + (good ? 'good' : (score.correct >= score.total / 2 ? 'good' : 'bad'));
    scoreBox.textContent = `Hai classificato correttamente ${score.correct} email su ${score.total}.`;

    const wrong = getWrongAnswers(answers, EMAILS);
    const wrongWrap = document.getElementById('summaryWrongList');
    if (wrong.length === 0) {
        wrongWrap.innerHTML = '<p style="margin-top:0.75rem; color:#166534; font-size:0.85rem;">Nessun errore: ottimo lavoro nel riconoscere ogni email!</p>';
    } else {
        wrongWrap.innerHTML = '<h3 class="help-title" style="margin-top:0.9rem; color:#1f2937;">Email classificate male</h3>' +
            wrong.map(w => `
                <div class="summary-wrong-item">
                    <strong>"${w.oggetto}"</strong><br>
                    Hai risposto <strong>${labelFor(w.userAnswer)}</strong>, ma la risposta corretta era <strong>${labelFor(w.correctAnswer)}</strong>.
                </div>
            `).join('');
    }
}

function restart() {
    currentIndex = 0;
    answers = [];
    renderEmail();
}

// Render iniziale.
renderEmail();

document.getElementById('legitBtn').addEventListener('click', () => answer('legittima'));
document.getElementById('phishBtn').addEventListener('click', () => answer('phishing'));
document.getElementById('nextBtn').addEventListener('click', goNext);
document.getElementById('restartBtn').addEventListener('click', restart);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Ma se il mittente sembra un collega o un\'azienda che conosco davvero? ▸'
        : 'Ma se il mittente sembra un collega o un\'azienda che conosco davvero? ▾';
});
