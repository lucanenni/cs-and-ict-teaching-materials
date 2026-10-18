// --- Hashing SHA-256 reale, via l'API nativa del browser -------------------
// Scelta didattica: usiamo crypto.subtle.digest('SHA-256', ...) invece di una
// funzione hash "giocattola", perché è disponibile in ogni browser moderno
// senza librerie esterne e mostra agli studenti un algoritmo realmente usato
// (anche se, per le password, andrebbe comunque affiancato da bcrypt/scrypt/
// Argon2 — vedi l'approfondimento nel pannello di aiuto).

async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function generateSaltHex(byteLength) {
    const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildSaltedInput(password, salt) {
    return password + ':' + salt;
}

// Raggruppa gli indici degli elementi che condividono lo stesso valore di
// keyFn(item). Ritorna solo i gruppi con più di un elemento (i duplicati).
// Logica pura, testata separatamente in Node prima di collegarla al DOM.
function findDuplicateGroups(items, keyFn) {
    const groups = {};
    items.forEach((item, i) => {
        const k = keyFn(item);
        if (!groups[k]) groups[k] = [];
        groups[k].push(i);
    });
    return Object.values(groups).filter(g => g.length > 1);
}

// --- Dati di esempio ---------------------------------------------------

const USERS = [
    { name: 'Giulia', password: 'password123' },
    { name: 'Marco', password: 'password123' },
    { name: 'Elena', password: 'calcio99' },
    { name: 'Davide', password: 'password123' },
    { name: 'Sara', password: 'ciaociao1' }
];

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function renderNoSalt() {
    const hashes = await Promise.all(USERS.map(u => sha256Hex(u.password)));
    const dupGroups = findDuplicateGroups(hashes, h => h);
    const rowDupClass = new Array(USERS.length).fill('');
    dupGroups.forEach((group, gi) => {
        group.forEach(idx => { rowDupClass[idx] = 'dup-' + (gi % 4); });
    });

    const tbody = document.getElementById('noSaltBody');
    tbody.innerHTML = USERS.map((u, i) => `
        <tr class="${rowDupClass[i]}">
            <td>${escapeHtml(u.name)}</td>
            <td class="mono">${escapeHtml(u.password)}</td>
            <td class="mono hash-cell">${hashes[i]}</td>
        </tr>
    `).join('');

    const resultBox = document.getElementById('noSaltResult');
    if (dupGroups.length > 0) {
        const descr = dupGroups.map(g => g.map(i => USERS[i].name).join(', ')).join(' — ');
        resultBox.className = 'result-box bad';
        resultBox.innerHTML = `⚠ Hash identico tra: <strong>${descr}</strong>. Un attaccante che scopre l'hash di uno qualunque di questi account (da una fuga di dati, o già presente in una tabella precalcolata) scopre <em>immediatamente</em> anche gli altri, senza nemmeno dover attaccare quell'account specifico.`;
    } else {
        resultBox.className = 'result-box good';
        resultBox.textContent = 'Nessun hash duplicato in questo momento (nessuno degli utenti condivide la stessa password).';
    }
}

async function renderSalted() {
    const salts = USERS.map(() => generateSaltHex(4));
    const saltedInputs = USERS.map((u, i) => buildSaltedInput(u.password, salts[i]));
    const hashes = await Promise.all(saltedInputs.map(sha256Hex));
    const dupGroups = findDuplicateGroups(hashes, h => h);

    const tbody = document.getElementById('saltBody');
    tbody.innerHTML = USERS.map((u, i) => `
        <tr>
            <td>${escapeHtml(u.name)}</td>
            <td class="mono">${escapeHtml(u.password)}</td>
            <td class="mono">${salts[i]}</td>
            <td class="mono hash-cell">${hashes[i]}</td>
        </tr>
    `).join('');

    const resultBox = document.getElementById('saltResult');
    if (dupGroups.length > 0) {
        // Statisticamente non dovrebbe mai succedere con salt casuali a 32 bit,
        // ma lo gestiamo comunque per correttezza.
        resultBox.className = 'result-box bad';
        resultBox.textContent = 'Coincidenza rarissima: due salt casuali sono risultati uguali. Premi "Rigenera i salt" per un nuovo tentativo.';
    } else {
        resultBox.className = 'result-box good';
        resultBox.innerHTML = `Nessun hash uguale, <strong>anche se alcune password in chiaro sono identiche</strong>: il salt diverso per ogni utente rende diverso anche l'input dato alla funzione hash. Una tabella precalcolata condivisa non serve più a nulla qui.`;
    }
}

function renderAll() {
    renderNoSalt();
    renderSalted();
}

document.getElementById('regenSaltBtn').addEventListener('click', renderSalted);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Il salt rende l\'hash anche più lento da calcolare? ▸'
        : 'Il salt rende l\'hash anche più lento da calcolare? ▾';
});

renderAll();
