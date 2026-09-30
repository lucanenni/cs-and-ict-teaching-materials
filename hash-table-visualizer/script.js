const ANIM_SPEED = 600;
const RANDOM_WORDS = ['GATTO', 'CANE', 'SOLE', 'LUNA', 'MARE', 'CIELO', 'FIORE', 'ALBERO', 'CASA',
    'LIBRO', 'TAVOLO', 'SEDIA', 'FINESTRA', 'PORTA', 'STRADA', 'FIUME', 'MONTE', 'NEVE', 'VENTO', 'PIOGGIA'];

let state = {
    size: 8,
    buckets: [],
    interval: null
};

function initBuckets(size) {
    state.size = size;
    state.buckets = Array.from({ length: size }, () => []);
}

function hashKey(key, size) {
    let sum = 0;
    for (const ch of key) sum += ch.charCodeAt(0);
    return { sum, index: sum % size };
}

function charSumExplain(key) {
    return [...key].map(ch => `${ch}(${ch.charCodeAt(0)})`).join(' + ');
}

function insertKey(key) {
    const { sum, index } = hashKey(key, state.size);
    const bucket = state.buckets[index];
    if (bucket.includes(key)) return { sum, index, duplicate: true };
    bucket.push(key);
    return { sum, index, duplicate: false, collision: bucket.length > 1 };
}

function renderBuckets() {
    const box = document.getElementById('bucketsBox');
    box.innerHTML = '';
    state.buckets.forEach((bucket, i) => {
        const row = document.createElement('div');
        row.className = 'bucket-row';

        const indexEl = document.createElement('div');
        indexEl.className = 'bucket-index';
        indexEl.textContent = 'B' + i;
        row.appendChild(indexEl);

        const chainEl = document.createElement('div');
        chainEl.className = 'bucket-chain';
        if (bucket.length === 0) {
            chainEl.innerHTML = '<span class="bucket-empty">(vuoto)</span>';
        } else {
            bucket.forEach((k, idx) => {
                const chip = document.createElement('span');
                chip.className = 'key-chip';
                chip.textContent = k;
                chip.dataset.bucket = i;
                chip.dataset.idx = idx;
                chainEl.appendChild(chip);
                if (idx < bucket.length - 1) {
                    const arrow = document.createElement('span');
                    arrow.className = 'chain-arrow';
                    arrow.textContent = '→';
                    chainEl.appendChild(arrow);
                }
            });
        }
        row.appendChild(chainEl);
        box.appendChild(row);
    });
}

function renderStats() {
    const totalKeys = state.buckets.reduce((s, b) => s + b.length, 0);
    const collidingBuckets = state.buckets.filter(b => b.length > 1).length;
    const loadFactor = (totalKeys / state.size).toFixed(2);
    document.getElementById('statsRow').innerHTML =
        `Chiavi: <span>${totalKeys}</span> · Bucket: <span>${state.size}</span> · ` +
        `Fattore di carico: <span>${loadFactor}</span> · Bucket con collisioni: <span>${collidingBuckets}</span>`;
}

function clearAllHighlights() {
    document.querySelectorAll('.key-chip').forEach(el => el.classList.remove('comparing', 'found', 'new-key'));
}

function chipAt(bucketIndex, idx) {
    return document.querySelector(`.key-chip[data-bucket="${bucketIndex}"][data-idx="${idx}"]`);
}

function setControlsDisabled(disabled) {
    ['insertBtn', 'searchBtn', 'randomBtn', 'clearBtn', 'anagramBtn', 'sizeSelect'].forEach(id => {
        document.getElementById(id).disabled = disabled;
    });
}

function stopAnim() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
}

function playFrames(frames, onFrame, onDone) {
    stopAnim();
    setControlsDisabled(true);
    let i = -1;
    const tick = () => {
        i++;
        if (i >= frames.length) {
            stopAnim();
            setControlsDisabled(false);
            if (onDone) onDone();
            return;
        }
        onFrame(frames[i], i);
    };
    tick();
    state.interval = setInterval(tick, ANIM_SPEED);
}

function doInsert(rawValue) {
    const input = document.getElementById('keyInput');
    const raw = rawValue !== undefined ? rawValue : input.value;
    const key = raw.trim().toUpperCase();
    const caption = document.getElementById('stepCaption');
    if (!key) {
        caption.textContent = 'Scrivi prima una parola da inserire.';
        return;
    }
    const { sum, index, duplicate } = insertKey(key);
    renderBuckets();
    renderStats();
    if (duplicate) {
        caption.textContent = `"${key}" è già presente nel bucket ${index}.`;
    } else {
        const bucket = state.buckets[index];
        const collided = bucket.length > 1;
        caption.textContent = `hash("${key}") = ${charSumExplain(key)} = ${sum} → ${sum} mod ${state.size} = ${index}` +
            (collided ? ` — collisione! il bucket ${index} aveva già altre chiavi.` : ` → bucket ${index}.`);
        const chip = chipAt(index, bucket.length - 1);
        if (chip) chip.classList.add('new-key');
    }
    input.value = '';
    input.focus();
}

function generateSearchFrames(bucket, key) {
    const frames = [];
    for (let i = 0; i < bucket.length; i++) {
        frames.push({ key: bucket[i], idx: i, match: bucket[i] === key });
        if (bucket[i] === key) break;
    }
    return frames;
}

function doSearch() {
    const input = document.getElementById('keyInput');
    const key = input.value.trim().toUpperCase();
    const caption = document.getElementById('stepCaption');
    if (!key) {
        caption.textContent = 'Scrivi prima una parola da cercare.';
        return;
    }
    const { sum, index } = hashKey(key, state.size);
    const bucket = state.buckets[index];
    clearAllHighlights();
    if (bucket.length === 0) {
        caption.textContent = `hash("${key}") = ${sum} mod ${state.size} = ${index} → il bucket ${index} è vuoto: la chiave non c'è.`;
        return;
    }
    caption.textContent = `hash("${key}") = ${sum} mod ${state.size} = ${index} → guarda solo nel bucket ${index}.`;
    const frames = generateSearchFrames(bucket, key);
    playFrames(frames, (frame) => {
        const chip = chipAt(index, frame.idx);
        if (frame.match) {
            chip.classList.add('found');
            caption.textContent = `Bucket ${index}, posizione ${frame.idx}: "${frame.key}" = "${key}" → trovata! ✅`;
        } else {
            chip.classList.add('comparing');
            caption.textContent = `Bucket ${index}, posizione ${frame.idx}: "${frame.key}" ≠ "${key}", continua nella catena...`;
        }
    }, () => {
        const last = frames[frames.length - 1];
        if (!last.match) {
            caption.textContent = `"${key}" non è nel bucket ${index} (controllati ${frames.length} elementi della catena) — ma sappiamo comunque subito in quale unico bucket cercare, senza guardare gli altri.`;
        }
    });
}

function doRandomWord() {
    const w = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)];
    doInsert(w);
}

function doAnagramDemo() {
    stopAnim();
    ['ROMA', 'AMOR', 'MORA', 'RAMO'].forEach(w => doInsert(w));
    document.getElementById('stepCaption').textContent =
        'ROMA, AMOR, MORA e RAMO hanno esattamente le stesse lettere, quindi la stessa somma di codici: guarda come sono finite tutte nello stesso bucket, in una catena di 4 — succede con qualunque numero di bucket.';
}

function setSize(newSize) {
    stopAnim();
    initBuckets(newSize);
    renderBuckets();
    renderStats();
    document.getElementById('stepCaption').textContent = '';
}

function doClear() {
    stopAnim();
    initBuckets(state.size);
    renderBuckets();
    renderStats();
    document.getElementById('stepCaption').textContent = '';
}

document.getElementById('insertBtn').addEventListener('click', () => doInsert());
document.getElementById('keyInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doInsert();
});
document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('randomBtn').addEventListener('click', doRandomWord);
document.getElementById('anagramBtn').addEventListener('click', doAnagramDemo);
document.getElementById('clearBtn').addEventListener('click', doClear);
document.getElementById('sizeSelect').addEventListener('change', (e) => setSize(parseInt(e.target.value, 10)));

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché ROMA, AMOR, MORA e RAMO collidono sempre? ▸'
        : 'Perché ROMA, AMOR, MORA e RAMO collidono sempre? ▾';
});

// Inizializzazione
initBuckets(8);
['GATTO', 'CANE', 'SOLE', 'CASA', 'LIBRO'].forEach(w => insertKey(w));
renderBuckets();
renderStats();
