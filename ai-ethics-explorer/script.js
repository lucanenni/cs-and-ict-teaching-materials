// --- Dilemmi etici dell'IA: 5 scenari da esplorare (non un quiz) -----------
const SCENARIOS = [
    {
        label: 'Prestito bancario',
        title: 'Un algoritmo decide chi riceve un prestito',
        description: 'Una banca usa un algoritmo che analizza dati storici (reddito, storia dei pagamenti, altri prestiti in corso) per decidere se approvare o negare una richiesta di prestito. Il sistema valuta migliaia di richieste al giorno, ma quando un cliente chiede perché la sua richiesta è stata negata, la banca non riesce a fornire una spiegazione chiara: il modello combina centinaia di variabili in modi che nessun umano può ripercorrere facilmente a posteriori.',
        pro: [
            'Analizza in modo coerente migliaia di richieste, applicando gli stessi criteri a tutti, senza il rischio di un impiegato stanco o distratto che decide diversamente il venerdì pomeriggio.',
            'Può individuare pattern complessi nei dati storici che aiutano a stimare il rischio di insolvenza meglio di poche regole semplici scritte a mano.',
            'Riduce drasticamente il tempo di attesa per il cliente: una risposta in pochi secondi invece di settimane.'
        ],
        con: [
            'Se il modello ha imparato un pregiudizio presente nei dati storici, lo applica automaticamente a tutte le nuove richieste, su una scala molto più ampia di quanto farebbe un singolo impiegato prevenuto.',
            'Il cliente negato non ha un vero modo di contestare la decisione, perché nessuno — nemmeno la banca — può indicare con precisione quali fattori hanno pesato di più nel suo caso specifico.',
            'La responsabilità si diluisce: chi risponde se il modello sbaglia? Chi l\'ha progettato, chi l\'ha comprato da un fornitore esterno, o chi lo ha messo in produzione senza controllarlo a fondo?'
        ],
        principleName: 'Trasparenza / spiegabilità',
        principleText: 'Qui il principio più in gioco è la trasparenza: un cliente ha il diritto di capire, almeno nelle sue linee essenziali, perché una decisione che lo riguarda è stata presa in un certo modo — specialmente quando quella decisione ha conseguenze concrete sulla sua vita, come l\'accesso a una casa o a un\'attività.'
    },
    {
        label: 'Riconoscimento facciale a scuola',
        title: 'Presenze automatiche con riconoscimento facciale',
        description: 'Una scuola installa telecamere con riconoscimento facciale all\'ingresso delle classi per registrare automaticamente le presenze, eliminando l\'appello manuale e risparmiando qualche minuto di lezione ogni giorno per centinaia di classi.',
        pro: [
            'Automatizza un compito ripetitivo (l\'appello), restituendo tempo di lezione ogni giorno su larga scala.',
            'Riduce gli errori di trascrizione manuale delle presenze.',
            'Permette di rilevare in tempo reale l\'assenza inattesa di uno studente, utile anche in caso di emergenza.'
        ],
        con: [
            'Raccoglie dati biometrici (il volto) di minori ogni giorno, per un obiettivo che si potrebbe probabilmente ottenere anche con mezzi meno invasivi (badge, firma, appello a voce).',
            'Gli studenti non scelgono davvero di essere "osservati" in questo modo: la scuola è un ambiente in cui non si può semplicemente scegliere di non partecipare.',
            'Una volta installata l\'infrastruttura di telecamere, può essere facilmente estesa ad altri usi (riconoscere emozioni, comportamenti, presenza in altri spazi) senza che nessuno lo abbia davvero deciso in partenza.'
        ],
        principleName: 'Sorveglianza e privacy',
        principleText: 'Qui il principio più in gioco è la sorveglianza e la privacy: quali dati biometrici vengono raccolti su minori, per quanto tempo vengono conservati, chi può accedervi, e se gli studenti (o le loro famiglie) sono stati davvero informati e hanno potuto scegliere.'
    },
    {
        label: 'Auto a guida autonoma',
        title: 'Un\'auto autonoma e un incidente inevitabile',
        description: 'Un\'automobile a guida autonoma si trova in una situazione in cui un incidente è ormai inevitabile: il software deve scegliere, in una frazione di secondo, tra due traiettorie possibili, entrambe con conseguenze dannose per persone diverse (ad esempio i passeggeri dell\'auto oppure un pedone sulla strada).',
        pro: [
            'Un sistema può reagire in millisecondi, più velocemente di qualsiasi riflesso umano, riducendo la gravità di molti incidenti rispetto alla guida media di una persona.',
            'Le regole di comportamento in situazioni di emergenza possono essere discusse e fissate prima, con calma, invece di essere improvvisate nel panico da un conducente umano.',
            'Un\'auto autonoma non si distrae, non guida in stato di ebbrezza, non ha sonno: elimina intere categorie di incidenti causati da errore umano comune.'
        ],
        con: [
            'Qualunque regola venga scritta in anticipo equivale a decidere in astratto chi "conta meno" in un incidente — una scelta che nessuno vorrebbe dover formalizzare esplicitamente in un codice.',
            'Non esiste un consenso condiviso su quale criterio etico dovrebbe guidare questa scelta (minimizzare il numero di persone coinvolte? proteggere sempre i passeggeri? trattare tutti allo stesso modo?).',
            'Chi decide quale regola usare — il produttore dell\'auto, il legislatore, l\'acquirente — e chi ne risponde legalmente e moralmente quando la regola viene davvero applicata su strada?'
        ],
        principleName: 'Responsabilità',
        principleText: 'Qui il principio più in gioco è la responsabilità: chi risponde di una scelta che prima veniva presa (o subita) nell\'istinto di un conducente, e che ora è invece il risultato di una decisione progettuale presa con calma, mesi o anni prima, da un\'azienda.'
    },
    {
        label: 'Selezione CV',
        title: 'Scarto automatico dei curriculum',
        description: 'Un\'azienda che riceve migliaia di candidature per ogni posizione usa un sistema automatico che scarta una parte dei curriculum secondo criteri statistici (parole chiave, percorso di studi, esperienze pregresse), prima che un recruiter umano ne veda anche solo uno.',
        pro: [
            'Rende gestibile un volume di candidature che nessun team di recruiting potrebbe leggere manualmente in tempi ragionevoli.',
            'Applica lo stesso criterio a tutti i candidati nella prima scrematura, evitando che l\'ordine di lettura o la stanchezza del recruiter influenzino chi viene notato.',
            'Libera tempo umano per concentrarsi sui colloqui con i candidati che restano, invece che su una lettura superficiale di migliaia di CV.'
        ],
        con: [
            'Un candidato valido ma con un CV scritto in modo non standard (percorso atipico, lacune formali ma esperienza reale) può essere scartato senza che nessun umano lo guardi mai.',
            'Se i criteri riflettono pattern storici di assunzione, il sistema può riprodurre e amplificare uno squilibrio già presente (es. favorire sempre certi percorsi di studio) su una scala molto più ampia di quella di un singolo selezionatore.',
            'Il candidato scartato non riceve quasi mai una spiegazione specifica, e non ha modo di capire cosa avrebbe potuto cambiare nella propria candidatura.'
        ],
        principleName: 'Equità',
        principleText: 'Qui il principio più in gioco è l\'equità: il sistema tratta allo stesso modo candidati che, a parità di competenze reali, hanno percorsi diversi solo per motivi che non riguardano davvero il merito (es. il tipo di scuola frequentata, la formulazione del CV, qualche lacuna formale)?'
    },
    {
        label: 'Raccomandazioni video',
        title: 'Un algoritmo decide cosa guardare',
        description: 'Una piattaforma di video usa un algoritmo di raccomandazione che decide cosa mostrare a ciascun utente, scegliendo tra migliaia di contenuti possibili quello che, in base al comportamento passato, massimizza il tempo che l\'utente passerà a guardare la piattaforma.',
        pro: [
            'Aiuta l\'utente a trovare contenuti che probabilmente gli interessano, in mezzo a una quantità di materiale che nessuno potrebbe scorrere manualmente.',
            'Permette a piccoli creatori di contenuti di essere scoperti da un pubblico che altrimenti non li troverebbe mai, se il contenuto incontra davvero l\'interesse di qualcuno.',
            'Si adatta ai gusti individuali, offrendo un\'esperienza diversa — e potenzialmente più pertinente — per ogni persona.'
        ],
        con: [
            'L\'obiettivo del sistema non è informare bene o mostrare punti di vista diversi, ma massimizzare il tempo di visione: i due obiettivi a volte coincidono, ma spesso no.',
            'Mostrando sempre più contenuti simili a quelli già guardati, può rinchiudere progressivamente l\'utente in una visione del mondo sempre più ristretta, senza che se ne accorga (vedi anche, nella raccolta, il progetto sulle bolle di filtraggio).',
            'Nessuno al di fuori dell\'azienda che possiede l\'algoritmo può davvero verificare con quali criteri esatti il sistema decide cosa mostrare a chi, né contestare quella scelta se la ritiene scorretta.'
        ],
        principleName: 'Trasparenza / spiegabilità',
        principleText: 'Qui il principio più in gioco è ancora la trasparenza: nessuno, al di fuori dell\'azienda che lo possiede, può davvero verificare secondo quali criteri l\'algoritmo decide cosa mostrare, né contestare quella scelta dall\'esterno.'
    }
];

let currentIndex = 0;
const visited = new Set();

function renderSelector() {
    const wrap = document.getElementById('scenarioSelector');
    wrap.innerHTML = SCENARIOS.map((s, i) => `
        <button type="button" class="scenario-btn ${i === currentIndex ? 'active' : ''}" data-index="${i}">
            ${i + 1}. ${s.label}${visited.has(i) && i !== currentIndex ? '<span class="visited-dot" title="già visitato"></span>' : ''}
        </button>
    `).join('');
    wrap.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentIndex = parseInt(btn.dataset.index, 10);
            render();
        });
    });
}

function renderScenario() {
    const s = SCENARIOS[currentIndex];
    visited.add(currentIndex);
    document.getElementById('scenarioTitle').textContent = s.title;
    document.getElementById('scenarioDescription').textContent = s.description;
    document.getElementById('principleName').textContent = s.principleName;
    document.getElementById('principleText').textContent = s.principleText;
    document.getElementById('proList').innerHTML = s.pro.map(p => `<li>${p}</li>`).join('');
    document.getElementById('conList').innerHTML = s.con.map(c => `<li>${c}</li>`).join('');
}

function render() {
    renderSelector();
    renderScenario();
}

render();

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'In cosa differisce questo progetto dal simulatore sul bias nei dati? ▸'
        : 'In cosa differisce questo progetto dal simulatore sul bias nei dati? ▾';
});
