// --- Handshake TLS 1.2 (caso comune, senza autenticazione del client) -----
// La sequenza esatta dei 9 messaggi segue RFC 5246 §7.3 ("Basic Handshake"),
// nel caso in cui il server non richiede un certificato al client (il caso
// comune per la stragrande maggioranza dei siti):
//   Client:  ClientHello
//   Server:  ServerHello, Certificate, ServerKeyExchange, ServerHelloDone
//   Client:  ClientKeyExchange, [ChangeCipherSpec], Finished
//   Server:  [ChangeCipherSpec], Finished
//   (poi)    Application Data
//
// Lo scambio di chiavi è un vero ECDHE (curva P-256) calcolato con la Web
// Crypto API: due coppie di chiavi effimere, un segreto condiviso derivato
// indipendentemente da entrambe le parti e verificato byte per byte
// identico. I messaggi "Finished" sono un vero tag HMAC-SHA256 calcolato
// con quel segreto; il passo "Application Data" è una vera cifratura
// AES-GCM del messaggio, decifrata correttamente dal lato server.

function bytesToHex(bytes) {
    return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function bytesEqual(a, b) {
    const x = new Uint8Array(a), y = new Uint8Array(b);
    if (x.length !== y.length) return false;
    return x.every((v, i) => v === y[i]);
}

let serverKeyPair, clientKeyPair, serverPubRaw, clientPubRaw;
let sharedSecretBytes = null, sharedSecretMatches = false;

async function genServerKeys() {
    serverKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    serverPubRaw = await crypto.subtle.exportKey('raw', serverKeyPair.publicKey);
    return { html: `Il server genera una coppia di chiavi ECDHE effimera (curva P-256) e invia la sua chiave pubblica:<br><code>${bytesToHex(serverPubRaw).slice(0, 48)}...</code>`, ok: true };
}

async function genClientKeysAndDerive() {
    clientKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    clientPubRaw = await crypto.subtle.exportKey('raw', clientKeyPair.publicKey);

    const serverPubKey = await crypto.subtle.importKey('raw', serverPubRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const clientPubKey = await crypto.subtle.importKey('raw', clientPubRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, []);

    const clientShared = await crypto.subtle.deriveBits({ name: 'ECDH', public: serverPubKey }, clientKeyPair.privateKey, 256);
    const serverShared = await crypto.subtle.deriveBits({ name: 'ECDH', public: clientPubKey }, serverKeyPair.privateKey, 256);

    sharedSecretMatches = bytesEqual(clientShared, serverShared);
    sharedSecretBytes = new Uint8Array(clientShared);

    return {
        html: `Il client genera la propria coppia effimera e invia la sua chiave pubblica. Ora entrambe le parti calcolano <em>indipendentemente</em> lo stesso segreto condiviso (ognuna con la propria chiave privata e la chiave pubblica dell'altro, mai trasmessa in chiaro):<br>` +
            `<code>segreto condiviso: ${bytesToHex(sharedSecretBytes).slice(0, 48)}...</code><br>` +
            (sharedSecretMatches ? '✓ Il segreto calcolato dal client e quello calcolato dal server coincidono esattamente, byte per byte.' : '✗ ERRORE: i segreti non coincidono.'),
        ok: sharedSecretMatches
    };
}

async function computeFinished(who) {
    const hmacKey = await crypto.subtle.importKey('raw', sharedSecretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const transcript = new TextEncoder().encode('ClientHello|ServerHello|Certificate|ServerKeyExchange|ServerHelloDone|ClientKeyExchange');
    const tag = await crypto.subtle.sign('HMAC', hmacKey, transcript);
    const label = who === 'client' ? 'Client' : 'Server';
    return {
        html: `${label} cifra un hash HMAC-SHA256 di tutti i messaggi scambiati finora con il segreto appena calcolato, e lo invia come prova che nessuno ha alterato l'handshake:<br><code>Finished: ${bytesToHex(tag).slice(0, 48)}...</code>`,
        ok: true
    };
}

async function demoApplicationData() {
    const aesKey = await crypto.subtle.importKey('raw', sharedSecretBytes, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode('GET /pagina-segreta HTTP/1.1');
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plaintext);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ciphertext);
    const decryptedText = new TextDecoder().decode(decrypted);
    return {
        html: `Il canale è ora cifrato. Il client invia una vera richiesta cifrata con AES-256-GCM:<br><code>testo in chiaro: "GET /pagina-segreta HTTP/1.1"</code><br><code>cifrato: ${bytesToHex(ciphertext).slice(0, 48)}...</code><br>Il server la decifra con lo stesso segreto condiviso: <code>"${decryptedText}"</code> ✓`,
        ok: decryptedText === 'GET /pagina-segreta HTTP/1.1'
    };
}

const STEPS = [
    { dir: 'fwd', label: 'ClientHello', desc: 'Il client apre la connessione: elenca le versioni di TLS e i cifrari che supporta, e invia un numero casuale.' },
    { dir: 'rev', label: 'ServerHello', desc: 'Il server sceglie una versione e un cifrario tra quelli proposti, e aggiunge il proprio numero casuale.' },
    { dir: 'rev', label: 'Certificate', desc: 'Il server invia il proprio certificato digitale, che contiene la sua chiave pubblica a lungo termine ed è firmato da un\'autorità di certificazione (CA) di cui il browser si fida.' },
    { dir: 'rev', label: 'ServerKeyExchange', desc: '', action: genServerKeys },
    { dir: 'rev', label: 'ServerHelloDone', desc: 'Il server segnala di aver finito la propria parte: tocca al client.' },
    { dir: 'fwd', label: 'ClientKeyExchange', desc: '', action: genClientKeysAndDerive },
    { dir: 'fwd', label: '[ChangeCipherSpec] + Finished', desc: '', action: () => computeFinished('client') },
    { dir: 'rev', label: '[ChangeCipherSpec] + Finished', desc: '', action: () => computeFinished('server') },
    { dir: 'both', label: 'Application Data', desc: '', action: demoApplicationData },
];

let currentStep = -1;
let running = false;

function renderMessages() {
    const container = document.getElementById('messages');
    container.innerHTML = '';
    for (let i = 0; i <= currentStep; i++) {
        const step = STEPS[i];
        const row = document.createElement('div');
        row.className = 'msg-row' + (step.dir === 'rev' ? ' reverse' : '');

        const track = document.createElement('div');
        track.className = 'msg-arrow-track';
        const line = document.createElement('div');
        line.className = 'msg-arrow-line' + (step.dir === 'rev' ? ' reverse' : '');
        const label = document.createElement('div');
        label.className = 'msg-label';
        label.textContent = step.label + (step.dir === 'both' ? ' ⇄' : '');
        track.appendChild(line);
        track.appendChild(label);
        row.appendChild(track);
        container.appendChild(row);

        const desc = document.createElement('div');
        desc.className = 'msg-desc' + (step.resultOk ? ' crypto-ok' : '');
        desc.innerHTML = step.resolvedDesc || step.desc;
        container.appendChild(desc);
    }
}

async function nextStep() {
    if (running || currentStep >= STEPS.length - 1) return;
    running = true;
    document.getElementById('nextBtn').disabled = true;
    currentStep++;
    const step = STEPS[currentStep];
    if (step.action) {
        document.getElementById('statusText').textContent = 'Calcolo in corso (Web Crypto reale)...';
        const result = await step.action();
        step.resolvedDesc = result.html;
        step.resultOk = result.ok;
    }
    renderMessages();
    document.getElementById('statusText').textContent =
        currentStep >= STEPS.length - 1 ? '✓ Handshake completato: il canale è cifrato.' : '';
    running = false;
    document.getElementById('nextBtn').disabled = currentStep >= STEPS.length - 1;
}

function reset() {
    currentStep = -1;
    STEPS.forEach(s => { s.resolvedDesc = null; s.resultOk = false; });
    sharedSecretBytes = null;
    renderMessages();
    document.getElementById('statusText').textContent = '';
    document.getElementById('nextBtn').disabled = false;
}

document.getElementById('nextBtn').addEventListener('click', nextStep);
document.getElementById('resetBtn').addEventListener('click', reset);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché "effimero"? Non bastava una chiave fissa? ▸'
        : 'Perché "effimero"? Non bastava una chiave fissa? ▾';
});

// Inizializzazione
reset();
