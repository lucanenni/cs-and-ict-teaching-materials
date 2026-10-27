// --- Riconoscere una fake news ----------------------------------------------
//
// Logica pura (classificazione della risposta, punteggio, elenco degli errori)
// verificata a parte in Node su casi costruiti a mano, prima di collegarla a
// questa interfaccia (vedi README.md). È lo stesso schema già usato e
// verificato in phishing-awareness-explorer/script.js.
//
// Scelta di interazione: come in netiquette-explorer e phishing-awareness-
// explorer, niente pattern "Avvia"/"Passo singolo". Per ogni notizia l'utente
// risponde una sola volta e vede subito tutti gli indizi insieme: è un
// esercizio di riconoscimento di casi isolati, non una sequenza da animare.

const NEWS = [
    {
        id: 1,
        isFake: false,
        title: 'Bere tè verde subito prima di dormire può disturbare il sonno, dicono i nutrizionisti',
        source: 'Istituto Fittizio di Nutrizione e Benessere',
        date: '14 marzo 2024',
        body: "Secondo l'Istituto Fittizio di Nutrizione e Benessere, il tè verde contiene caffeina in quantità non trascurabile: assunto nelle due ore prima di coricarsi può ridurre la qualità del sonno nelle persone sensibili alla caffeina. L'istituto consiglia di consumarlo preferibilmente nelle prime ore della giornata.",
        why: 'Fonte citata con un nome istituzionale verificabile e plausibile, affermazione coerente con la premessa (la caffeina presente nel tè verde), titolo che corrisponde esattamente al contenuto, nessuna promessa miracolosa.'
    },
    {
        id: 2,
        isFake: true,
        title: "Scoperto l'alimento che fa perdere 5 kg di grasso in un solo giorno",
        source: 'Giornale della Salute Vera',
        date: '12 ottobre 2026',
        body: "Secondo un articolo circolato online, un comune ortaggio sarebbe in grado di far perdere fino a 5 kg di grasso corporeo in appena 24 ore se consumato in grandi quantità. L'articolo non specifica quale sarebbe il meccanismo biologico, né cita quale ortaggio esattamente.",
        clues: [
            "Il titolo promette un risultato (5 kg di grasso perso in un giorno) che contraddice platealmente le basi elementari della fisiologia: perdere così tanto grasso corporeo in 24 ore non è possibile, e l'articolo non fornisce alcuna prova scientifica a supporto.",
            'La fonte citata, «Giornale della Salute Vera», non corrisponde a nessuna pubblicazione realmente identificabile: è un nome pensato per sembrare autorevole, ma inventato.',
            "Nessun dato verificabile viene fornito: non si cita né l'ortaggio specifico, né uno studio, né l'autore dell'articolo originale."
        ]
    },
    {
        id: 3,
        isFake: false,
        title: 'Testato in laboratorio un nuovo materiale riciclabile per le batterie al litio',
        source: 'Dipartimento di Ingegneria dei Materiali, Università Fittizia di Novaria',
        date: '2 settembre 2024',
        body: "Un gruppo di ricerca del Dipartimento di Ingegneria dei Materiali dell'Università Fittizia di Novaria ha pubblicato i risultati preliminari di un nuovo componente per batterie, più facile da riciclare rispetto a quelli attualmente in uso. I ricercatori precisano che si tratta di test di laboratorio: un'eventuale applicazione commerciale richiederebbe probabilmente alcuni anni.",
        why: "Fonte accademica verificabile con un nome plausibile, linguaggio prudente e misurato ('risultati preliminari', 'alcuni anni'), nessuna promessa immediata né titolo sensazionalistico: il contenuto corrisponde esattamente a quanto annunciato nel titolo."
    },
    {
        id: 4,
        isFake: true,
        title: 'Crollo improvviso del vecchio ponte di Ponteverde, paura tra i residenti',
        source: 'da un post social condiviso migliaia di volte',
        date: '27 ottobre 2026 (oggi)',
        body: "Nella notte di ieri il vecchio ponte pedonale di Ponteverde sarebbe crollato all'improvviso. La foto che accompagna la notizia, ripresa da un profilo social, mostra macerie e detriti sul greto del fiume.",
        clues: [
            "La foto usata per illustrare la notizia proviene in realtà da un crollo avvenuto in una località diversa più di dieci anni fa: un'immagine vecchia e decontestualizzata, presentata come se fosse di oggi.",
            "La data: il fatto viene presentato come avvenuto 'nella notte di ieri', ma si tratta di un episodio già vecchio rimesso in circolazione con una data riciclata, come se fosse di attualità.",
            "La notizia non cita nessuna fonte verificabile (comune, vigili del fuoco, testata giornalistica locale): si basa solo su «un post social condiviso migliaia di volte», che non è una fonte."
        ]
    },
    {
        id: 5,
        isFake: false,
        title: 'Il Comune di Pontecorvo Immaginario inaugura una nuova pista ciclabile',
        source: 'Ufficio Stampa del Comune di Pontecorvo Immaginario',
        date: '9 ottobre 2025',
        body: "Il Comune di Pontecorvo Immaginario ha inaugurato ieri una pista ciclabile di 3,2 km che collega il centro al parco comunale. L'opera, finanziata in parte con fondi regionali, era prevista nel piano urbano del traffico approvato due anni fa.",
        why: 'Notizia locale verificabile con una fonte istituzionale chiara (ufficio stampa comunale), dettagli concreti e plausibili (lunghezza esatta, finanziamento, piano approvato in precedenza), nessun elemento sensazionalistico.'
    },
    {
        id: 6,
        isFake: true,
        title: 'Mangiare la buccia della mela previene il raffreddore nel 90% dei casi',
        source: 'secondo alcuni esperti',
        date: '15 giugno 2025',
        body: 'Secondo alcuni esperti, mangiare regolarmente la buccia della mela riduce il rischio di raffreddore nel 90% dei casi, grazie alle sue proprietà. Sempre più persone scelgono di non sbucciare più la frutta per questo motivo.',
        clues: [
            "La percentuale precisa (90%) non è collegata a nessuno studio, ricerca o fonte verificabile: 'secondo alcuni esperti' non indica chi, dove o quando.",
            'Nessun dato scientifico concreto viene citato a supporto di un\'affermazione medica così specifica.',
            "L'affermazione usa una percentuale precisa proprio per sembrare autorevole, compensando l'assenza totale di una fonte verificabile."
        ]
    },
    {
        id: 7,
        isFake: false,
        title: 'Scoperta una nuova specie di farfalla nel Parco Naturale Fittizio dei Monti Serrati',
        source: 'Museo di Scienze Naturali di Fiumelago',
        date: '30 maggio 2025',
        body: "Gli entomologi del Museo di Scienze Naturali di Fiumelago hanno identificato una nuova specie di farfalla, provvisoriamente chiamata Lycaena fittizia, durante un censimento condotto nella primavera 2025. La scoperta sarà sottoposta a revisione scientifica prima della pubblicazione definitiva.",
        why: "Fonte scientifica verificabile e nominata con precisione, linguaggio cauto ('provvisoriamente', 'sarà sottoposta a revisione'), dettagli specifici e plausibili, nessuna promessa esagerata."
    },
    {
        id: 8,
        isFake: true,
        title: "Bere acqua e limone al mattino elimina tutte le tossine dal corpo in un'ora",
        source: 'Centro Studi Benessere Naturale Italia',
        date: '3 gennaio 2026',
        body: "Un articolo online sostiene che un bicchiere di acqua tiepida e limone al mattino sia sufficiente a eliminare completamente le tossine accumulate nel corpo in appena un'ora, grazie a un fantomatico 'effetto detox immediato'. L'articolo è firmato dal 'Centro Studi Benessere Naturale Italia'.",
        clues: [
            "L'affermazione contraddice platealmente la fisiologia di base: sono fegato e reni a occuparsi costantemente della depurazione dell'organismo, un processo continuo, non un 'reset' completabile in un'ora bevendo qualcosa.",
            "Il «Centro Studi Benessere Naturale Italia» citato come fonte non risulta essere un ente realmente identificabile: suona autorevole ma è un nome inventato.",
            "Il titolo è sensazionalistico ('elimina TUTTE le tossine') per un effetto che, anche nella migliore delle ipotesi, sarebbe parziale e graduale: non corrisponde a come funziona davvero il corpo."
        ]
    }
];

// --- Logica pura -------------------------------------------------------------

function classify(userChoice, news) {
    const correctChoice = news.isFake ? 'falsa' : 'attendibile';
    return { correctChoice, correct: userChoice === correctChoice };
}

function computeScore(answers) {
    const correct = answers.filter(a => a.correct).length;
    return { correct, total: answers.length };
}

function getMistakes(answers, newsList) {
    return answers
        .filter(a => !a.correct)
        .map(a => {
            const news = newsList.find(n => n.id === a.newsId);
            return { title: news.title, userChoice: a.userChoice, correctChoice: a.correctChoice };
        });
}

// --- Stato dell'interfaccia ---------------------------------------------------

let currentIndex = 0;
let answers = [];
let answeredCurrent = false;

function labelFor(choice) {
    return choice === 'falsa' ? '⚠ Probabilmente falsa' : '✓ Attendibile';
}

function renderNewsCard(news) {
    const card = document.getElementById('newsCard');
    card.innerHTML = `
        <div class="news-title">${news.title}</div>
        <div class="news-meta">
            <span><strong>Fonte:</strong> ${news.source}</span>
            <span><strong>Data:</strong> ${news.date}</span>
        </div>
        <div class="news-body">${news.body}</div>
    `;
}

function renderProgress() {
    document.getElementById('progressText').textContent =
        `Notizia ${currentIndex + 1} di ${NEWS.length} — punteggio finora: ${computeScore(answers).correct} / ${answers.length}`;
}

function renderFeedback(news, result, userChoice) {
    const box = document.getElementById('feedbackBox');
    box.classList.remove('hidden');
    box.className = 'result-box ' + (result.correct ? 'good' : 'bad');

    const verdictText = news.isFake
        ? '⚠ Questa notizia è PROBABILMENTE FALSA.'
        : '✓ Questa notizia è ATTENDIBILE.';
    const yourAnswerText = `Hai risposto: ${labelFor(userChoice)} — ${result.correct ? 'risposta corretta.' : 'risposta sbagliata.'}`;

    let detailHtml;
    if (news.isFake) {
        detailHtml = `<ul class="indizio-list">${news.clues.map(c => `<li>${c}</li>`).join('')}</ul>`;
    } else {
        detailHtml = `<p style="margin-top:0.4rem;">${news.why}</p>`;
    }

    box.innerHTML = `<div class="verdict-banner">${verdictText}</div><div>${yourAnswerText}</div>${detailHtml}`;
}

function renderNews() {
    const news = NEWS[currentIndex];
    answeredCurrent = false;
    renderNewsCard(news);
    renderProgress();

    document.getElementById('feedbackBox').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('answerControls').classList.remove('hidden');
    document.getElementById('trueBtn').disabled = false;
    document.getElementById('fakeBtn').disabled = false;

    document.getElementById('quizArea').classList.remove('hidden');
    document.getElementById('summaryArea').classList.add('hidden');
}

function answer(userChoice) {
    if (answeredCurrent) return;
    answeredCurrent = true;

    const news = NEWS[currentIndex];
    const result = classify(userChoice, news);
    answers.push({ newsId: news.id, userChoice, correctChoice: result.correctChoice, correct: result.correct });

    document.getElementById('trueBtn').disabled = true;
    document.getElementById('fakeBtn').disabled = true;
    renderFeedback(news, result, userChoice);
    renderProgress();

    const nextBtn = document.getElementById('nextBtn');
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = currentIndex >= NEWS.length - 1 ? 'Vedi il riepilogo finale →' : 'Notizia successiva →';
}

function goNext() {
    if (currentIndex >= NEWS.length - 1) {
        showSummary();
        return;
    }
    currentIndex++;
    renderNews();
}

function showSummary() {
    document.getElementById('quizArea').classList.add('hidden');
    document.getElementById('summaryArea').classList.remove('hidden');

    const score = computeScore(answers);
    const scoreBox = document.getElementById('summaryScoreBox');
    scoreBox.className = 'result-box ' + (score.correct >= score.total / 2 ? 'good' : 'bad');
    scoreBox.textContent = `Hai classificato correttamente ${score.correct} notizie su ${score.total}.`;

    const mistakes = getMistakes(answers, NEWS);
    const wrongWrap = document.getElementById('summaryWrongList');
    if (mistakes.length === 0) {
        wrongWrap.innerHTML = '<p style="margin-top:0.75rem; color:#166534; font-size:0.85rem;">Nessun errore: ottimo lavoro nel riconoscere ogni notizia!</p>';
    } else {
        wrongWrap.innerHTML = '<h3 class="help-title" style="margin-top:0.9rem; color:#1f2937;">Notizie classificate male</h3>' +
            mistakes.map(m => `
                <div class="summary-wrong-item">
                    <strong>"${m.title}"</strong><br>
                    Hai risposto <strong>${labelFor(m.userChoice)}</strong>, ma la risposta corretta era <strong>${labelFor(m.correctChoice)}</strong>.
                </div>
            `).join('');
    }
}

function restart() {
    currentIndex = 0;
    answers = [];
    renderNews();
}

// Render iniziale.
renderNews();

document.getElementById('trueBtn').addEventListener('click', () => answer('attendibile'));
document.getElementById('fakeBtn').addEventListener('click', () => answer('falsa'));
document.getElementById('nextBtn').addEventListener('click', goNext);
document.getElementById('restartBtn').addEventListener('click', restart);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché le notizie false si diffondono così velocemente? ▸'
        : 'Perché le notizie false si diffondono così velocemente? ▾';
});
