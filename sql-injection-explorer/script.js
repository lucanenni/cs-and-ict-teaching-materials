// ============================================================================
// NOTA DI SICUREZZA: questa è una simulazione didattica isolata, interamente
// lato client. Non esiste nessun database reale, nessuna query viene mai
// inviata a un server: tutto qui sotto è semplice JavaScript che costruisce
// una stringa di testo e poi, separatamente, decide "a mano" (con due logiche
// diverse: una vulnerabile, una sicura) se quella stringa corrisponde a uno
// degli utenti di una tabella finta tenuta in memoria. Nessun vero attacco a
// nessun sistema reale è coinvolto.
// ============================================================================

// --- Logica pura (testata separatamente in Node prima di collegarla al DOM) -

function parseOperand(raw) {
    raw = raw.trim();
    if (raw.startsWith("'") && raw.endsWith("'") && raw.length >= 2) {
        return { type: 'literal', value: raw.slice(1, -1) };
    }
    return { type: 'field', value: raw };
}

function evalOperand(op, row) {
    if (op.type === 'literal') return op.value;
    return row[op.value];
}

function evalCondition(cond, row) {
    const m = cond.match(/^(.+?)=(.+)$/);
    if (!m) return false;
    const lhs = parseOperand(m[1]);
    const rhs = parseOperand(m[2]);
    return evalOperand(lhs, row) === evalOperand(rhs, row);
}

function splitTopLevel(str, word) {
    const re = new RegExp('\\b' + word + '\\b', 'ig');
    return str.split(re).map(s => s.trim()).filter(Boolean);
}

// Query "concatenata (vulnerabile)": l'input dell'utente viene incollato
// letteralmente dentro la stringa SQL, diventando potenzialmente sintassi.
function buildConcatenatedQuery(nome, password) {
    return `SELECT * FROM utenti WHERE nome='${nome}' AND password='${password}'`;
}

function evaluateConcatenatedQuery(query, utenti) {
    const whereIdx = query.toUpperCase().indexOf('WHERE');
    let clause = query.slice(whereIdx + 5);
    const commentIdx = clause.indexOf('--');
    const truncated = commentIdx !== -1;
    if (truncated) clause = clause.slice(0, commentIdx);
    clause = clause.trim();

    const orGroups = splitTopLevel(clause, 'or');
    const matchedRows = utenti.filter(row =>
        orGroups.some(group => {
            const conds = splitTopLevel(group, 'and');
            return conds.length > 0 && conds.every(c => evalCondition(c, row));
        })
    );
    return { clause, truncated, matchedRows };
}

// Query "parametrizzata (sicura)": l'input resta sempre un valore di dato,
// mai sintassi. Il confronto è letterale, carattere per carattere.
function buildParameterizedQuery(nome, password) {
    return { sql: "SELECT * FROM utenti WHERE nome = $1 AND password = $2", params: [nome, password] };
}

function evaluateParameterizedQuery(params, utenti) {
    const [nome, password] = params;
    const matchedRows = utenti.filter(row => row.nome === nome && row.password === password);
    return { matchedRows };
}

// --- Dati di esempio (tabella finta in memoria, NON un database reale) -----

const UTENTI = [
    { nome: 'mario', password: 'Password1!' },
    { nome: 'luisa', password: 'Gatto2024' },
    { nome: 'admin', password: 'SuperSegreta9' }
];

const ATTACK_USERNAME = "' OR '1'='1' --";

let mode = 'vuln'; // 'vuln' | 'safe'

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderUsersTable(matchedNames) {
    const box = document.getElementById('usersTable');
    box.innerHTML = UTENTI.map(u => {
        const isMatch = matchedNames.includes(u.nome);
        return `<div class="users-row ${isMatch ? 'matched' : ''}">${escapeHtml(u.nome)} / ${escapeHtml(u.password)}${isMatch ? '  ← corrispondenza trovata' : ''}</div>`;
    }).join('');
}

function updateQueryDisplay() {
    const nome = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const titleEl = document.getElementById('queryTitle');
    const valueEl = document.getElementById('queryValueBox');
    const extraEl = document.getElementById('queryExtraBox');

    if (mode === 'vuln') {
        titleEl.textContent = 'Query costruita (concatenando direttamente l\'input)';
        const query = buildConcatenatedQuery(nome, password);
        valueEl.textContent = query;
        extraEl.innerHTML = '';
    } else {
        titleEl.textContent = 'Query con placeholder + parametri passati separatamente';
        const q = buildParameterizedQuery(nome, password);
        valueEl.textContent = q.sql;
        extraEl.innerHTML = `<strong>Parametri passati come dati (mai come sintassi):</strong>\n$1 = ${escapeHtml(JSON.stringify(nome))}\n$2 = ${escapeHtml(JSON.stringify(password))}`;
    }
}

function attemptLogin() {
    const nome = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const resultEl = document.getElementById('loginResult');
    const extraEl = document.getElementById('queryExtraBox');

    if (mode === 'vuln') {
        const query = buildConcatenatedQuery(nome, password);
        const { clause, truncated, matchedRows } = evaluateConcatenatedQuery(query, UTENTI);
        renderUsersTable(matchedRows.map(r => r.nome));

        let explain = `Clausola WHERE effettivamente valutata: <code>${escapeHtml(clause)}</code>`;
        if (truncated) explain += `\n(il resto della query dopo <strong>--</strong> è stato trattato come un commento SQL e ignorato)`;
        extraEl.innerHTML = explain;

        if (matchedRows.length === 0) {
            resultEl.className = 'result-box bad';
            resultEl.textContent = '✗ Accesso negato: nessuna riga della tabella corrisponde alla condizione.';
        } else if (matchedRows.length === 1) {
            resultEl.className = 'result-box good';
            resultEl.textContent = `✓ Accesso consentito come "${matchedRows[0].nome}".`;
        } else {
            resultEl.className = 'result-box bad';
            resultEl.textContent = `⚠ BYPASS RIUSCITO: la condizione risulta vera per ${matchedRows.length} righe contemporaneamente (${matchedRows.map(r => r.nome).join(', ')}), senza aver fornito nessuna password valida. L'accesso viene concesso al primo risultato: "${matchedRows[0].nome}".`;
        }
    } else {
        const q = buildParameterizedQuery(nome, password);
        const { matchedRows } = evaluateParameterizedQuery(q.params, UTENTI);
        renderUsersTable(matchedRows.map(r => r.nome));

        if (matchedRows.length === 1) {
            resultEl.className = 'result-box good';
            resultEl.textContent = `✓ Accesso consentito come "${matchedRows[0].nome}".`;
        } else {
            resultEl.className = 'result-box bad';
            resultEl.textContent = `✗ Accesso negato: il valore fornito viene confrontato carattere per carattere con nome e password reali — nessuna corrispondenza (${matchedRows.length} righe trovate). L'eventuale sintassi SQL contenuta nell'input (apici, --, OR, ecc.) viene trattata come testo normale, non come codice.`;
        }
    }
}

function setMode(newMode) {
    mode = newMode;
    document.getElementById('vulnModeBtn').classList.toggle('active', mode === 'vuln');
    document.getElementById('safeModeBtn').classList.toggle('active', mode === 'safe');

    const helpList = document.getElementById('helpList');
    if (mode === 'vuln') {
        helpList.innerHTML = `
            <li>• In questa modalità l'input dell'utente viene incollato <strong>letteralmente</strong> dentro la stringa della query, prima che venga "eseguita".</li>
            <li>• Se l'input contiene apici o parole come <code>OR</code>, quella sintassi diventa parte della query vera e propria, cambiandone il significato logico.</li>
            <li>• Con <code>' OR '1'='1' --</code> come nome utente, la condizione diventa sempre vera per ogni riga della tabella: l'accesso viene concesso senza conoscere nessuna password.</li>`;
    } else {
        helpList.innerHTML = `
            <li>• In questa modalità la query contiene solo <strong>placeholder</strong> (<code>$1</code>, <code>$2</code>): la struttura della query è fissata in anticipo, separata dai dati.</li>
            <li>• I valori inseriti dall'utente vengono passati <strong>a parte</strong>, come dati puri: il motore li confronta carattere per carattere, non li interpreta mai come sintassi SQL.</li>
            <li>• Lo stesso input malevolo di prima, provato qui, non trova nessuna corrispondenza: resta solo una strana stringa di testo, non diventa codice.</li>`;
    }

    updateQueryDisplay();
    document.getElementById('loginResult').className = 'result-box';
    document.getElementById('loginResult').textContent = 'Compila i campi e premi "Accedi".';
    renderUsersTable([]);
}

document.getElementById('vulnModeBtn').addEventListener('click', () => setMode('vuln'));
document.getElementById('safeModeBtn').addEventListener('click', () => setMode('safe'));

document.getElementById('usernameInput').addEventListener('input', updateQueryDisplay);
document.getElementById('passwordInput').addEventListener('input', updateQueryDisplay);
document.getElementById('loginBtn').addEventListener('click', attemptLogin);

document.getElementById('fillAttackBtn').addEventListener('click', () => {
    document.getElementById('usernameInput').value = ATTACK_USERNAME;
    document.getElementById('passwordInput').value = 'qualsiasi-cosa';
    updateQueryDisplay();
});

document.getElementById('fillValidBtn').addEventListener('click', () => {
    document.getElementById('usernameInput').value = 'mario';
    document.getElementById('passwordInput').value = 'Password1!';
    updateQueryDisplay();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Basta "pulire" l\'input per essere al sicuro? ▸'
        : 'Basta "pulire" l\'input per essere al sicuro? ▾';
});

// Inizializzazione
setMode('vuln');
renderUsersTable([]);
