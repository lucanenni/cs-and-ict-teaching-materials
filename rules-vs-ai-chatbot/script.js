// Ogni categoria definisce due insiemi di parole chiave: quelle (rigide) del
// chatbot a regole e quelle (più ampie, con sinonimi/parafrasi) del chatbot
// "IA" simulato. Questo è il cuore del confronto: stesso tema, riconoscimento
// diverso.
const categories = [
    {
        id: 'saluto',
        ruleKeywords: ['ciao', 'salve', 'buongiorno', 'buonasera'],
        aiKeywords: ['ciao', 'salve', 'buongiorno', 'buonasera', 'hey', 'ehi'],
        ruleResponse: 'Ciao! Come posso aiutarti?',
        ruleExplain: 'il messaggio contiene una parola di saluto prevista (es. "ciao")',
        aiResponses: [
            { text: 'Ciao! Come posso aiutarti oggi?', p: 55 },
            { text: 'Ehilà! Dimmi pure che ti serve.', p: 30 },
            { text: 'Salve, sono qui per aiutarti.', p: 15 }
        ]
    },
    {
        id: 'nome',
        ruleKeywords: ['come ti chiami', 'nome'],
        aiKeywords: ['come ti chiami', 'nome', 'chi sei'],
        ruleResponse: 'Mi chiamo RegolaBot: rispondo solo se riconosco esattamente una parola chiave.',
        ruleExplain: 'il messaggio contiene "nome" o "come ti chiami"',
        aiResponses: [
            { text: 'Mi puoi chiamare Assistente: provo a capire il senso generale di quello che scrivi, non solo parole esatte.', p: 60 },
            { text: 'Non ho un vero nome, sono solo un modellino di esempio!', p: 40 }
        ]
    },
    {
        id: 'meteo',
        ruleKeywords: ['che tempo fa', 'meteo'],
        aiKeywords: ['che tempo fa', 'meteo', 'piove', 'previsioni', 'nuvoloso'],
        ruleResponse: 'Non ho una regola per rispondere a domande sul meteo.',
        ruleExplain: 'il messaggio contiene "meteo" o "che tempo fa"',
        aiResponses: [
            { text: 'Non ho accesso a dati meteo in tempo reale, ma ti conviene controllare un\'app affidabile prima di uscire ☂️', p: 50 },
            { text: 'Non posso conoscere il meteo di oggi con certezza, ma in questo periodo capita spesso variabile.', p: 50 }
        ]
    },
    {
        id: 'barzelletta',
        ruleKeywords: ['barzelletta'],
        aiKeywords: ['barzelletta', 'scherzo', 'battuta', 'farmi ridere'],
        ruleResponse: 'Non conosco barzellette: nessuna regola gestisce questa richiesta.',
        ruleExplain: 'il messaggio contiene "barzelletta"',
        aiResponses: [
            { text: 'Perché il libro di matematica è triste? Perché ha troppi problemi!', p: 50 },
            { text: 'Cosa dice un tostapane a un altro tostapane? "Ti tosta bene, oggi!"', p: 50 }
        ]
    },
    {
        id: 'matematica',
        ruleKeywords: ['2+2', 'quanto fa 2+2'],
        aiKeywords: ['2+2', 'quanto fa', 'due più due', 'somma di due e due'],
        ruleResponse: 'Il risultato è 4.',
        ruleExplain: 'il messaggio contiene esattamente la stringa "2+2" scritta in cifre',
        aiResponses: [
            { text: '2 + 2 fa 4.', p: 60 },
            { text: 'Il risultato è 4!', p: 40 }
        ]
    },
    {
        id: 'mondiali2050',
        // Nessuna ruleKeywords/ruleResponse: il chatbot a regole non ha
        // nessuna regola per questo, quindi cade sempre nel fallback.
        aiKeywords: ['mondiali del 2050', 'mondiali 2050'],
        hallucination: true,
        aiResponses: [
            { text: 'Nel 2050 i Mondiali di calcio sono stati vinti dal Brasile, in una finale combattutissima contro la Germania! ⚽🏆', p: 100 }
        ]
    }
];

const genericFallbacks = [
    'È una domanda interessante! Anche se non ho informazioni precise su questo, direi che dipende dal contesto specifico.',
    'Non conosco questo argomento nel dettaglio, ma in generale la risposta dipende da diversi fattori.',
    'Posso provare a risponderti: di solito in questi casi conviene considerare più punti di vista.'
];

const chips = [
    'Ciao!',
    'Come ti chiami?',
    'Che tempo fa oggi?',
    'Raccontami una barzelletta',
    'Quanto fa due più due?',
    'Chi vincerà i mondiali del 2050?'
];

function normalize(text) {
    return text.toLowerCase().trim();
}

function findCategory(message, field) {
    const norm = normalize(message);
    for (const cat of categories) {
        const keywords = cat[field];
        if (!keywords) continue;
        const match = keywords.find(k => norm.includes(k));
        if (match) return { category: cat, matchedKeyword: match };
    }
    return null;
}

function weightedPick(options) {
    const total = options.reduce((sum, o) => sum + o.p, 0);
    let r = Math.random() * total;
    for (const o of options) {
        if (r < o.p) return o;
        r -= o.p;
    }
    return options[options.length - 1];
}

function ruleReply(message) {
    const found = findCategory(message, 'ruleKeywords');
    if (found && found.category.ruleResponse) {
        return {
            text: found.category.ruleResponse,
            meta: `Regola attivata: ${found.category.ruleExplain}.`,
            hallucination: false
        };
    }
    return {
        text: 'Non ho nessuna regola che corrisponde a questo messaggio. 🤷',
        meta: 'Nessuna regola corrisponde: nessuna parola chiave riconosciuta.',
        hallucination: false
    };
}

function aiReply(message) {
    const found = findCategory(message, 'aiKeywords');
    if (found) {
        const chosen = weightedPick(found.category.aiResponses);
        if (found.category.hallucination) {
            return {
                text: chosen.text,
                meta: `Sicurezza: ${chosen.p}% — 🚨 risposta INVENTATA: nessuno può sapere il risultato di un evento futuro. L'IA l'ha generata comunque perché il suo compito è "continuare il testo in modo plausibile", non "dire il vero". Questo si chiama allucinazione.`,
                hallucination: true
            };
        }
        return {
            text: chosen.text,
            meta: `Sicurezza: ${chosen.p}% — ha riconosciuto il tema "${found.category.id}" anche da una formulazione diversa.`,
            hallucination: false
        };
    }
    const text = genericFallbacks[Math.floor(Math.random() * genericFallbacks.length)];
    const confidence = 30 + Math.floor(Math.random() * 16);
    return {
        text,
        meta: `Sicurezza: ${confidence}% — ⚠️ non ha una vera risposta, ma genera comunque una frase plausibile invece di ammettere "non lo so".`,
        hallucination: true
    };
}

function appendBubble(logId, role, text) {
    const log = document.getElementById(logId);
    const bubble = document.createElement('div');
    bubble.className = `bubble ${role === 'user' ? 'bubble-user' : 'bubble-bot'}`;
    bubble.textContent = text;
    log.appendChild(bubble);
    return bubble;
}

function appendMeta(logId, text, hallucination) {
    const log = document.getElementById(logId);
    const meta = document.createElement('div');
    meta.className = 'bubble-meta' + (hallucination ? ' hallucination' : '');
    meta.textContent = text;
    log.appendChild(meta);
    log.scrollTop = log.scrollHeight;
}

function sendMessage(message) {
    if (!message.trim()) return;

    appendBubble('ruleLog', 'user', message);
    appendBubble('aiLog', 'user', message);

    const rule = ruleReply(message);
    appendBubble('ruleLog', 'bot', rule.text);
    appendMeta('ruleLog', rule.meta, rule.hallucination);

    const ai = aiReply(message);
    appendBubble('aiLog', 'bot', ai.text);
    appendMeta('aiLog', ai.meta, ai.hallucination);

    document.getElementById('ruleLog').scrollTop = document.getElementById('ruleLog').scrollHeight;
    document.getElementById('aiLog').scrollTop = document.getElementById('aiLog').scrollHeight;
}

function renderChips() {
    const row = document.getElementById('chipsRow');
    row.innerHTML = '';
    chips.forEach(text => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip';
        btn.textContent = text;
        btn.addEventListener('click', () => sendMessage(text));
        row.appendChild(btn);
    });
}

function resetChat() {
    document.getElementById('ruleLog').innerHTML = '';
    document.getElementById('aiLog').innerHTML = '';
}

document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    sendMessage(input.value);
    input.value = '';
    input.focus();
});

document.getElementById('resetChatBtn').addEventListener('click', resetChat);

renderChips();
