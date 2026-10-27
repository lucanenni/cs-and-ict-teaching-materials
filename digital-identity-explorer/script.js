// --- Identità digitale: cosa si vede, cosa si deduce ----------------------

const DECISIONS = [
    { id: 'posizione', question: 'Pubblichi la tua posizione attuale in questo post?', shareLabel: 'Condividi posizione', skipLabel: 'Non condividere', shareTag: 'posizione attuale', skipTag: 'niente posizione' },
    { id: 'nomeReale', question: 'Usi il tuo vero nome e cognome o un nickname?', shareLabel: 'Vero nome e cognome', skipLabel: 'Nickname', shareTag: 'vero nome', skipTag: 'nickname' },
    { id: 'scuola', question: 'Pubblichi la foto del diploma con il nome della tua scuola?', shareLabel: 'Condividi', skipLabel: 'Non condividere', shareTag: 'nome scuola', skipTag: 'niente scuola' },
    { id: 'dataNascita', question: 'Rispondi a un sondaggio online con la tua data di nascita?', shareLabel: 'Condividi', skipLabel: 'Non condividere', shareTag: 'data di nascita', skipTag: 'niente data' },
    { id: 'citta', question: 'Taggi la tua città in un post?', shareLabel: 'Condividi', skipLabel: 'Non condividere', shareTag: 'città', skipTag: 'niente città' },
    { id: 'casa', question: "Condividi una foto di famiglia che mostra la tua casa dall'esterno?", shareLabel: 'Condividi', skipLabel: 'Non condividere', shareTag: 'aspetto casa', skipTag: 'niente casa' },
    { id: 'turniGenitori', question: 'Scrivi un commento pubblico che rivela il turno di lavoro dei tuoi genitori?', shareLabel: 'Condividi', skipLabel: 'Non condividere', shareTag: 'turni genitori', skipTag: 'niente turni' },
    { id: 'allenamento', question: 'Pubblichi un post che mostra luogo e orario dei tuoi allenamenti settimanali?', shareLabel: 'Condividi', skipLabel: 'Non condividere', shareTag: 'orari allenamento', skipTag: 'niente allenamento' }
];

const RULES = [
    { topic: 'identita', requires: ['nomeReale'], text: 'Si conosce il tuo vero nome e cognome: chiunque può cercarti per nome su altri social o sui motori di ricerca.' },
    { topic: 'identita', requires: ['nomeReale', 'citta'], text: 'Si conosce il tuo nome completo e la città: è già abbastanza per trovarti su altri profili o incontrarti di persona.' },
    { topic: 'identita', requires: ['nomeReale', 'citta', 'scuola'], text: "Nome, scuola e città insieme rendono la tua identità pubblica facilmente ricostruibile, con la scuola come punto d'incontro fisico noto." },
    { topic: 'identita', requires: ['nomeReale', 'citta', 'scuola', 'dataNascita'], text: 'Con nome, città, scuola e data di nascita il profilo è quasi completo: chiunque può identificarti con certezza e verificarlo incrociando altri account con lo stesso nome.' },

    { topic: 'luogo_abituale', requires: ['citta'], text: 'Si sa in quale città ti trovi abitualmente.' },
    { topic: 'luogo_abituale', requires: ['scuola'], text: 'Si sa in quale scuola trovarti nelle ore scolastiche.' },
    { topic: 'luogo_abituale', requires: ['scuola', 'citta'], text: 'Si sa in quale scuola e città trovarti nelle ore scolastiche, con un margine di poche ore al giorno.' },

    { topic: 'eta_classe', requires: ['dataNascita'], text: 'Si conosce la tua data di nascita esatta: età e prossimo compleanno sono già un dato in più per restringere ricerche su di te.' },
    { topic: 'eta_classe', requires: ['dataNascita', 'scuola'], text: 'Si può calcolare la tua età esatta e, conoscendo anche la scuola, indovinare con buona probabilità in quale classe sei.' },
    { topic: 'eta_classe', requires: ['dataNascita', 'scuola', 'citta'], text: 'Età, scuola e città combinate permettono di capire quasi con certezza chi sei e che classe frequenti, anche senza conoscere il tuo nome.' },

    { topic: 'casa', requires: ['casa'], text: "Si vede com'è e si intuisce dove si trova (circa) la tua abitazione dall'esterno." },
    { topic: 'casa', requires: ['casa', 'citta'], text: "Si vede l'aspetto della tua casa e si sa in che città si trova: insieme restringono parecchio dove abiti davvero." },

    { topic: 'casa_vuota', requires: ['turniGenitori'], text: "Si sa a che ore i tuoi genitori non sono in casa: un'informazione che indica quando la casa potrebbe essere vuota." },
    { topic: 'casa_vuota', requires: ['turniGenitori', 'casa'], text: "Si conosce l'aspetto della casa e gli orari in cui resta vuota: due informazioni che, insieme, non dovrebbero mai comparire nello stesso posto." },

    { topic: 'posizione', requires: ['posizione'], text: 'Si sa esattamente dove ti trovi in questo momento.' },

    { topic: 'orari_extra', requires: ['allenamento'], text: 'Si sa in quale luogo e a quale orario ricorrente ti trovi fuori casa, ad esempio per andare ad allenarti.' }
];

function subsetOf(requires, shared) {
    return requires.every(r => shared.has(r));
}

function computeDeductions(shared) {
    const byTopic = new Map();
    for (const rule of RULES) {
        if (!subsetOf(rule.requires, shared)) continue;
        const current = byTopic.get(rule.topic);
        if (!current || rule.requires.length > current.requires.length) {
            byTopic.set(rule.topic, rule);
        }
    }
    const topicOrder = [];
    for (const rule of RULES) {
        if (!topicOrder.includes(rule.topic)) topicOrder.push(rule.topic);
    }
    return topicOrder.filter(t => byTopic.has(t)).map(t => byTopic.get(t).text);
}

function exposureLevel(shared) {
    const count = shared.size;
    if (count <= 1) return 'Basso';
    if (count <= 4) return 'Medio';
    return 'Alto';
}

// --- stato e interazione ---------------------------------------------------

let index = 0;
let shared = new Set();
const history = []; // { id, shareTag/skipTag, didShare }

function renderProgress() {
    document.getElementById('progressText').textContent = `Decisione ${index + 1} di ${DECISIONS.length}`;
}

function renderDecision() {
    const d = DECISIONS[index];
    document.getElementById('decisionQuestion').textContent = d.question;
    document.getElementById('shareBtn').textContent = d.shareLabel;
    document.getElementById('skipBtn').textContent = d.skipLabel;
    renderProgress();
}

function renderExposure() {
    const level = exposureLevel(shared);
    const cls = level.toLowerCase();
    const pct = Math.min(100, Math.round((shared.size / DECISIONS.length) * 100));
    const fill = document.getElementById('exposureFill');
    fill.className = 'exposure-bar-fill ' + cls;
    fill.style.width = pct + '%';
    const badge = document.getElementById('exposureBadge');
    badge.className = 'exposure-badge ' + cls;
    badge.textContent = level;
}

function renderChoicesLog(targetId) {
    const wrap = document.getElementById(targetId);
    wrap.innerHTML = history.map(h =>
        `<span class="${h.didShare ? 'shared' : 'notshared'}">${h.didShare ? '✓ ' : '✗ '}${h.tag}</span>`
    ).join('') || '<span>Ancora nessuna scelta fatta.</span>';
}

function renderDeductionPanel() {
    const panel = document.getElementById('deductionPanel');
    const list = document.getElementById('deductionList');
    const deductions = computeDeductions(shared);
    if (deductions.length === 0) {
        panel.classList.add('hidden');
        return;
    }
    panel.classList.remove('hidden');
    list.innerHTML = deductions.map(text => `<li>• ${text}</li>`).join('');
}

function renderAll() {
    renderExposure();
    renderChoicesLog('choicesLog');
    renderDeductionPanel();
    if (index < DECISIONS.length) {
        document.getElementById('decisionArea').classList.remove('hidden');
        document.getElementById('summaryArea').classList.add('hidden');
        renderDecision();
    } else {
        document.getElementById('decisionArea').classList.add('hidden');
        document.getElementById('summaryArea').classList.remove('hidden');
        renderSummary();
    }
}

function renderSummary() {
    renderChoicesLog('summaryChoices');
    const deductions = computeDeductions(shared);
    const out = document.getElementById('summaryDeductions');
    if (deductions.length === 0) {
        out.innerHTML = '<p>Non avendo condiviso informazioni sensibili, chi guarda da fuori non può dedurre granché su di te. Ottimo risultato di consapevolezza!</p>';
        return;
    }
    out.innerHTML = '<p>Combinando solo le informazioni che hai scelto di condividere, chi guarda da fuori può dedurre:</p><ul>' +
        deductions.map(text => `<li>• ${text}</li>`).join('') + '</ul>';
}

function choose(didShare) {
    const d = DECISIONS[index];
    if (didShare) shared.add(d.id);
    history.push({ id: d.id, didShare, tag: didShare ? d.shareTag : d.skipTag });
    index++;
    renderAll();
}

function restart() {
    index = 0;
    shared = new Set();
    history.length = 0;
    renderAll();
}

document.getElementById('shareBtn').addEventListener('click', () => choose(true));
document.getElementById('skipBtn').addEventListener('click', () => choose(false));
document.getElementById('restartBtn').addEventListener('click', restart);

// Rendering iniziale alla creazione: la prima decisione è già pronta al
// semplice caricamento della pagina, senza bisogno di alcuna azione preliminare.
renderAll();

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Allora non dovrei condividere mai nulla? ▸' : 'Allora non dovrei condividere mai nulla? ▾';
});
