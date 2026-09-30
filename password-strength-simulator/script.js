const SPEED_PRESETS = [
    { label: 'a mano (1/sec)', rate: 1 },
    { label: 'script online con limiti (100/sec)', rate: 100 },
    { label: 'PC offline potente (10 miliardi/sec)', rate: 1e10 },
    { label: 'cluster di GPU (1000 miliardi/sec)', rate: 1e12 },
    { label: 'supercomputer (100 milioni di miliardi/sec)', rate: 1e17 }
];

const COMMON_PASSWORDS = [
    '123456', '123456789', '12345678', '12345', '1234567', 'password', 'qwerty', '111111',
    'abc123', 'password1', 'iloveyou', 'admin', 'letmein', 'welcome', 'monkey', 'dragon',
    '123123', '000000', 'qwerty123', '1q2w3e4r', 'sunshine', 'princess', 'football',
    'baseball', 'master', 'login', 'passw0rd'
];

const WEAK_SUBSTRINGS = [
    'password', 'qwerty', '123456', 'letmein', 'admin', 'welcome', 'monkey', 'dragon',
    'iloveyou', 'princess', 'sunshine', 'master', 'football', 'baseball', 'passw0rd'
];

function isSequential(pw) {
    const lower = pw.toLowerCase();
    for (let i = 0; i <= lower.length - 4; i++) {
        const chunk = lower.slice(i, i + 4);
        let asc = true, desc = true;
        for (let j = 1; j < 4; j++) {
            if (chunk.charCodeAt(j) !== chunk.charCodeAt(j - 1) + 1) asc = false;
            if (chunk.charCodeAt(j) !== chunk.charCodeAt(j - 1) - 1) desc = false;
        }
        if (asc || desc) return true;
    }
    return false;
}

function isCommonPassword(pw) {
    const lower = pw.toLowerCase();
    if (COMMON_PASSWORDS.includes(lower)) {
        return { common: true, reason: 'è tra le password più diffuse al mondo (comparirebbe nelle prime righe di qualunque lista di password rubate)' };
    }
    if (pw.length > 1 && /^(.)\1+$/.test(pw)) {
        return { common: true, reason: 'è un singolo carattere ripetuto: uno dei primi pattern che qualunque attacco prova' };
    }
    for (const w of WEAK_SUBSTRINGS) {
        if (lower.includes(w)) {
            return { common: true, reason: `contiene "${w}", una delle parole più usate (e quindi più provate per prime) nelle password reali` };
        }
    }
    if (isSequential(pw)) {
        return { common: true, reason: 'contiene una sequenza ovvia di caratteri (es. "1234" o "abcd"), un altro pattern tra i primi provati' };
    }
    return { common: false };
}

function analyze(pw) {
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /[0-9]/.test(pw);
    const hasSpace = /\s/.test(pw);
    const hasSymbol = /[^a-zA-Z0-9\s]/.test(pw);
    let size = 0;
    if (hasLower) size += 26;
    if (hasUpper) size += 26;
    if (hasDigit) size += 10;
    if (hasSymbol) size += 32;
    if (hasSpace) size += 1;
    const length = pw.length;
    const keyspace = size > 0 && length > 0 ? Math.pow(size, length) : 0;
    const entropy = size > 0 && length > 0 ? length * Math.log2(size) : 0;
    return { hasLower, hasUpper, hasDigit, hasSymbol, hasSpace, size, length, keyspace, entropy };
}

function formatBigNumber(n) {
    if (n < 1000) return Math.round(n).toString();
    if (n < 1e6) return Math.round(n).toLocaleString('it-IT');
    const exp = n.toExponential(2);
    const [mantissa, exponent] = exp.split('e');
    const expNum = parseInt(exponent, 10);
    return `${mantissa} × 10^${expNum}`;
}

function formatDuration(seconds) {
    if (seconds < 1) return 'meno di un secondo';
    if (seconds < 60) return `${Math.round(seconds)} secondi`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minuti`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} ore`;
    const years = seconds / 31557600;
    if (years < 1) return `${Math.round(seconds / 86400)} giorni`;
    const AGE_OF_UNIVERSE_YEARS = 13.8e9;
    if (years < AGE_OF_UNIVERSE_YEARS) return `${formatBigNumber(years)} anni`;
    const factor = years / AGE_OF_UNIVERSE_YEARS;
    return `${formatBigNumber(factor)} volte l'età dell'universo (${formatBigNumber(years)} anni)`;
}

function strengthInfo(entropy, isCommon) {
    if (isCommon) return { label: 'Debole — password comune', pct: 12, color: '#dc2626' };
    if (entropy < 28) return { label: 'Debole', pct: 20, color: '#dc2626' };
    if (entropy < 45) return { label: 'Discreta', pct: 45, color: '#ea580c' };
    if (entropy < 65) return { label: 'Forte', pct: 75, color: '#16a34a' };
    return { label: 'Molto forte', pct: 100, color: '#15803d' };
}

function renderCrackTime(a, commonCheck) {
    const speedIdx = parseInt(document.getElementById('speedSlider').value, 10);
    const preset = SPEED_PRESETS[speedIdx];
    document.getElementById('speedLabel').textContent = preset.label;
    const el = document.getElementById('crackTime');
    if (a.length === 0) {
        el.textContent = '';
        return;
    }
    if (commonCheck.common) {
        el.textContent = 'In pratica: istantaneo — è tra i primi tentativi di qualunque attacco reale, indipendentemente dalla velocità.';
        return;
    }
    const seconds = a.keyspace / (2 * preset.rate);
    el.textContent = `Circa ${formatDuration(seconds)} in media, a questa velocità.`;
}

function render() {
    const pw = document.getElementById('pwInput').value;
    const a = analyze(pw);
    const commonCheck = pw.length > 0 ? isCommonPassword(pw) : { common: false };

    document.getElementById('statLength').textContent = a.length || '–';
    document.getElementById('statCharset').textContent = a.size > 0 ? a.size + ' simboli' : '–';
    document.getElementById('statKeyspace').textContent = a.length > 0 ? formatBigNumber(a.keyspace) : '–';
    document.getElementById('statEntropy').textContent = a.length > 0 ? a.entropy.toFixed(1) + ' bit' : '–';

    const badges = document.getElementById('charsetBadges');
    badges.innerHTML = '';
    [
        ['Minuscole a-z', a.hasLower],
        ['MAIUSCOLE A-Z', a.hasUpper],
        ['Cifre 0-9', a.hasDigit],
        ['Simboli', a.hasSymbol],
        ['Spazi', a.hasSpace]
    ].forEach(([label, active]) => {
        const b = document.createElement('span');
        b.className = 'charset-badge' + (active ? ' active' : '');
        b.textContent = (active ? '✓ ' : '') + label;
        badges.appendChild(b);
    });

    const warning = document.getElementById('commonWarning');
    if (commonCheck.common) {
        warning.textContent = `⚠ Attenzione: questa password ${commonCheck.reason}. Verrebbe indovinata in pochissimo tempo, indipendentemente da quanto sembri complessa.`;
        warning.classList.remove('hidden');
    } else {
        warning.classList.add('hidden');
    }

    const s = strengthInfo(a.entropy, commonCheck.common);
    document.getElementById('strengthBar').style.width = a.length > 0 ? s.pct + '%' : '0%';
    document.getElementById('strengthBar').style.backgroundColor = s.color;
    document.getElementById('strengthLabel').textContent = a.length > 0 ? s.label : '';
    document.getElementById('strengthLabel').style.color = s.color;

    renderCrackTime(a, commonCheck);
}

document.getElementById('pwInput').addEventListener('input', render);
document.getElementById('speedSlider').addEventListener('input', render);

document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.getElementById('pwInput').value = chip.dataset.pw;
        render();
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? "Perché il calcolo dell'entropia non basta da solo? ▸"
        : "Perché il calcolo dell'entropia non basta da solo? ▾";
});

// Inizializzazione
render();
