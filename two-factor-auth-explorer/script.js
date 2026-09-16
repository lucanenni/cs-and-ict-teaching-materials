const STEP_SECONDS = 30;
const DIGITS = 6;

function toBase32(bytes) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (const b of bytes) bits += b.toString(2).padStart(8, '0');
    let out = '';
    for (let i = 0; i < bits.length; i += 5) {
        let chunk = bits.substr(i, 5);
        if (chunk.length < 5) chunk = chunk.padEnd(5, '0');
        out += alphabet[parseInt(chunk, 2)];
    }
    return out;
}

function counterToBytes(counter) {
    const buf = new Uint8Array(8);
    let c = counter;
    for (let i = 7; i >= 0; i--) {
        buf[i] = c & 0xff;
        c = Math.floor(c / 256);
    }
    return buf;
}

async function hmacSha1(keyBytes, msgBytes) {
    const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, msgBytes);
    return new Uint8Array(sig);
}

async function generateTOTP(secretBytes, counter) {
    const counterBytes = counterToBytes(counter);
    const hmac = await hmacSha1(secretBytes, counterBytes);
    const offset = hmac[19] & 0xf;
    const binCode = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    const otp = binCode % Math.pow(10, DIGITS);
    return String(otp).padStart(DIGITS, '0');
}

let state = {
    secretBytes: null,
    currentCode: '',
    lastCounter: -1
};

function newSecret() {
    state.secretBytes = crypto.getRandomValues(new Uint8Array(20));
    document.getElementById('secretValue').textContent = toBase32(state.secretBytes);
    document.getElementById('codeInput').value = '';
    document.getElementById('loginResult').textContent = '';
    state.lastCounter = -1;
    tick();
}

async function tick() {
    const now = Date.now() / 1000;
    const counter = Math.floor(now / STEP_SECONDS);
    if (counter !== state.lastCounter) {
        state.lastCounter = counter;
        state.currentCode = await generateTOTP(state.secretBytes, counter);
        document.getElementById('totpCode').textContent =
            state.currentCode.slice(0, 3) + ' ' + state.currentCode.slice(3);
    }
    const elapsed = now % STEP_SECONDS;
    const remaining = STEP_SECONDS - elapsed;
    const pct = (remaining / STEP_SECONDS) * 100;
    document.getElementById('totpBar').style.width = pct + '%';
    document.getElementById('totpCountdown').textContent =
        `Nuovo codice tra ${Math.ceil(remaining)} secondi`;
}

document.getElementById('newSecretBtn').addEventListener('click', newSecret);

document.getElementById('passwordOnlyBtn').addEventListener('click', () => {
    const el = document.getElementById('loginResult');
    el.textContent = '✗ Password corretta, ma manca il secondo fattore: accesso rifiutato.';
    el.style.color = '#b91c1c';
});

document.getElementById('fullLoginBtn').addEventListener('click', () => {
    const code = document.getElementById('codeInput').value.trim();
    const el = document.getElementById('loginResult');
    if (code === state.currentCode) {
        el.textContent = '✓ Password e codice corretti: accesso consentito.';
        el.style.color = '#15803d';
    } else {
        el.textContent = `✗ Codice errato o scaduto (quello attuale è ${state.currentCode}): accesso rifiutato.`;
        el.style.color = '#b91c1c';
    }
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Il secondo fattore rende tutto inviolabile? ▸'
        : 'Il secondo fattore rende tutto inviolabile? ▾';
});

// Inizializzazione
newSecret();
setInterval(tick, 1000);
