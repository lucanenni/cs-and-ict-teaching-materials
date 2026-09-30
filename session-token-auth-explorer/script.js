// --- Base64url e HMAC-SHA256 reali (Web Crypto API) -----------------------
function base64UrlEncodeBytes(bytes) {
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64UrlEncodeString(str) {
    return base64UrlEncodeBytes(new TextEncoder().encode(str));
}
function base64UrlDecodeToString(b64url) {
    let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));
    return new TextDecoder().decode(bytes);
}
async function hmacSha256(keyBytes, msgBytes) {
    const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, msgBytes);
    return new Uint8Array(sig);
}

// Segreto "del server", generato una sola volta all'apertura della pagina.
// In un sito vero non lascerebbe mai il server: qui vive nello stesso
// browser solo perché non c'è un vero server con cui parlare.
const SERVER_SECRET = crypto.getRandomValues(new Uint8Array(32));

async function makeToken(payloadObj) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = base64UrlEncodeString(JSON.stringify(header));
    const payloadB64 = base64UrlEncodeString(JSON.stringify(payloadObj));
    const signingInput = `${headerB64}.${payloadB64}`;
    const sigBytes = await hmacSha256(SERVER_SECRET, new TextEncoder().encode(signingInput));
    return `${signingInput}.${base64UrlEncodeBytes(sigBytes)}`;
}

async function verifyToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, reason: 'formato non valido (servono 3 parti separate da ".")' };
    const [headerB64, payloadB64, sigB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;
    const expectedSigBytes = await hmacSha256(SERVER_SECRET, new TextEncoder().encode(signingInput));
    const expectedSigB64 = base64UrlEncodeBytes(expectedSigBytes);
    let payload = null;
    try { payload = JSON.parse(base64UrlDecodeToString(payloadB64)); } catch (e) { /* payload illeggibile */ }
    return { valid: expectedSigB64 === sigB64, payload };
}

async function tamperToken(token) {
    const [headerB64, payloadB64, sigB64] = token.split('.');
    let payload;
    try { payload = JSON.parse(base64UrlDecodeToString(payloadB64)); } catch (e) { payload = {}; }
    payload.role = 'amministratore';
    const newPayloadB64 = base64UrlEncodeString(JSON.stringify(payload));
    // La firma resta quella VECCHIA: chi manomette il token non conosce
    // SERVER_SECRET e quindi non può calcolarne una nuova che corrisponda.
    return `${headerB64}.${newPayloadB64}.${sigB64}`;
}

// --- Modalità sessione con cookie ------------------------------------------

let sessionsTable = {};
let currentSessionId = null;

function randomSessionId() {
    return Array.from(crypto.getRandomValues(new Uint8Array(10))).map(b => b.toString(16).padStart(2, '0')).join('');
}

function renderSessionsTable() {
    const box = document.getElementById('sessionsTableBox');
    const entries = Object.entries(sessionsTable);
    box.innerHTML = entries.length === 0
        ? '<span style="color:#9ca3af;">(nessuna sessione attiva)</span>'
        : entries.map(([sid, user]) => `<div class="server-row">${sid} → ${user}</div>`).join('');
}

function sessionLogin() {
    const username = document.getElementById('sessionUserInput').value.trim() || 'utente';
    currentSessionId = randomSessionId();
    sessionsTable[currentSessionId] = username;
    document.getElementById('cookieValueInput').value = currentSessionId;
    document.getElementById('sessionResult').textContent = `✓ Login effettuato: il server ha creato una sessione e te ne ha dato l'ID come cookie.`;
    document.getElementById('sessionResult').className = 'result-text ok';
    renderSessionsTable();
}

function sessionLogout() {
    if (currentSessionId) delete sessionsTable[currentSessionId];
    document.getElementById('sessionResult').textContent = '↪ Logout: la sessione è stata cancellata dalla tabella del server. Il cookie nel browser è rimasto uguale, ma ora non corrisponde più a nulla.';
    document.getElementById('sessionResult').className = 'result-text';
    renderSessionsTable();
}

function sendCookie() {
    const value = document.getElementById('cookieValueInput').value.trim();
    const result = document.getElementById('sessionResult');
    if (sessionsTable[value]) {
        result.textContent = `✓ Il server ha trovato questo ID nella sua tabella: sei riconosciuto come "${sessionsTable[value]}".`;
        result.className = 'result-text ok';
    } else {
        result.textContent = `❌ Il server non trova questo ID nella sua tabella: richiesta rifiutata, nessun utente riconosciuto.`;
        result.className = 'result-text fail';
    }
}

// --- Modalità token ---------------------------------------------------------

let currentToken = null;

async function tokenLogin() {
    const username = document.getElementById('tokenUserInput').value.trim() || 'utente';
    const role = document.getElementById('roleSelect').value;
    currentToken = await makeToken({ user: username, role, iat: Date.now() });
    document.getElementById('tokenValueBox').textContent = currentToken;
    const { payload } = await verifyToken(currentToken);
    document.getElementById('tokenDecodedBox').textContent = 'Contenuto leggibile (non cifrato): ' + JSON.stringify(payload, null, 2);
    document.getElementById('tokenResult').textContent = '';
    document.getElementById('tokenResult').className = 'result-text';
}

async function doVerifyToken() {
    const result = document.getElementById('tokenResult');
    const { valid, payload, reason } = await verifyToken(currentToken || '');
    if (valid) {
        result.textContent = `✓ Firma valida: il server si fida di questo contenuto → ${JSON.stringify(payload)}`;
        result.className = 'result-text ok';
    } else {
        result.textContent = `❌ Firma non valida${reason ? ' (' + reason + ')' : ''}: il server rifiuta il token, qualcosa non torna.`;
        result.className = 'result-text fail';
    }
}

async function doTamperToken() {
    if (!currentToken) return;
    currentToken = await tamperToken(currentToken);
    document.getElementById('tokenValueBox').textContent = currentToken;
    const { payload } = await verifyToken(currentToken);
    // payload potrebbe non essere valido dal punto di vista della firma, ma
    // resta comunque leggibile: lo decodifichiamo di nuovo direttamente.
    const parts = currentToken.split('.');
    let decodedPayload = null;
    try { decodedPayload = JSON.parse(base64UrlDecodeToString(parts[1])); } catch (e) { }
    document.getElementById('tokenDecodedBox').textContent = 'Contenuto leggibile (non cifrato): ' + JSON.stringify(decodedPayload, null, 2);
    document.getElementById('tokenResult').textContent = 'Ruolo modificato in "amministratore" nel payload, ma la firma non è stata (e non poteva essere) ricalcolata. Premi "Verifica" per vedere cosa succede.';
    document.getElementById('tokenResult').className = 'result-text';
}

// --- Cambio modalità ---------------------------------------------------------

const HELP_TEXT = {
    session: [
        '• HTTP non ha memoria tra una richiesta e l\'altra: senza un meccanismo apposito, ogni richiesta sarebbe "anonima" anche subito dopo un login.',
        '• Con le <strong>sessioni</strong>, il server crea e conserva lui stesso lo stato (chi sei), e dà al browser solo un ID casuale e privo di significato da restituire ad ogni richiesta successiva tramite un cookie.',
        '• Un ID di sessione da solo, se non corrisponde a una voce nella tabella del server, non serve a nulla: prova a modificarlo a mano qui sopra.'
    ],
    token: [
        '• Con i <strong>token firmati</strong> (come i JWT), è il client a portarsi dietro i propri dati — il server non deve conservare nulla, gli basta ricontrollare la firma ad ogni richiesta.',
        '• Il contenuto del token è leggibile da chiunque (è solo codificato, non cifrato): la sicurezza sta tutta nella <strong>firma</strong> (HMAC-SHA256, calcolata con Web Crypto qui nella pagina), che solo chi conosce il segreto del server può calcolare correttamente.',
        '• Prova a "manomettere" il ruolo nel token: il contenuto cambia, ma senza il segreto la firma resta quella vecchia — e la verifica lo scopre subito.'
    ]
};

function setMode(mode) {
    document.getElementById('sessionMode').classList.toggle('hidden', mode !== 'session');
    document.getElementById('tokenMode').classList.toggle('hidden', mode !== 'token');
    document.getElementById('sessionModeBtn').classList.toggle('active', mode === 'session');
    document.getElementById('tokenModeBtn').classList.toggle('active', mode === 'token');
    document.getElementById('helpList').innerHTML = HELP_TEXT[mode].map(li => `<li>${li}</li>`).join('');
}

document.getElementById('sessionModeBtn').addEventListener('click', () => setMode('session'));
document.getElementById('tokenModeBtn').addEventListener('click', () => setMode('token'));

document.getElementById('sessionLoginBtn').addEventListener('click', sessionLogin);
document.getElementById('sessionLogoutBtn').addEventListener('click', sessionLogout);
document.getElementById('sendCookieBtn').addEventListener('click', sendCookie);

document.getElementById('tokenLoginBtn').addEventListener('click', tokenLogin);
document.getElementById('verifyTokenBtn').addEventListener('click', doVerifyToken);
document.getElementById('tamperTokenBtn').addEventListener('click', doTamperToken);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Quale dei due è "migliore"? ▸' : 'Quale dei due è "migliore"? ▾';
});

// Inizializzazione
setMode('session');
sessionLogin();
tokenLogin();
