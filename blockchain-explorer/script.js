const DIFFICULTY_PREFIX = '00';
const GENESIS_PREV = '0'.repeat(64);
const INITIAL_DATA = ['Genesis', 'Alice paga 5 a Bob', 'Bob paga 2 a Carla', 'Carla paga 1 ad Alice'];

async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function isValidHash(hash) {
    return hash.startsWith(DIFFICULTY_PREFIX);
}

async function computeHash(index, dataStr, nonce, prevHash) {
    return sha256Hex(`${index}|${dataStr}|${nonce}|${prevHash}`);
}

function shortHash(hash) {
    return hash.slice(0, 16) + '…';
}

let state = {
    blocks: [],
    busy: false
};

function makeBlock(index, data) {
    return { index, data, nonce: 0, hash: '' };
}

async function recomputeFrom(startIndex) {
    for (let i = startIndex; i < state.blocks.length; i++) {
        const prevHash = i === 0 ? GENESIS_PREV : state.blocks[i - 1].hash;
        state.blocks[i].hash = await computeHash(state.blocks[i].index, state.blocks[i].data, state.blocks[i].nonce, prevHash);
    }
}

async function mineBlock(i) {
    if (state.busy) return;
    state.busy = true;
    render();
    const prevHash = i === 0 ? GENESIS_PREV : state.blocks[i - 1].hash;
    let nonce = 0;
    let hash = await computeHash(state.blocks[i].index, state.blocks[i].data, nonce, prevHash);
    let attempts = 1;
    while (!isValidHash(hash) && attempts < 500000) {
        nonce++;
        hash = await computeHash(state.blocks[i].index, state.blocks[i].data, nonce, prevHash);
        attempts++;
        if (attempts % 40 === 0) {
            const label = document.getElementById('mining-' + i);
            if (label) label.textContent = `⛏️ Provo... (${attempts})`;
        }
    }
    state.blocks[i].nonce = nonce;
    state.blocks[i].hash = hash;
    await recomputeFrom(i + 1);
    state.busy = false;
    render();
}

async function onDataChange(i, value) {
    state.blocks[i].data = value;
    await recomputeFrom(i);
    render();
}

function render() {
    const row = document.getElementById('blocksRow');
    row.innerHTML = '';

    state.blocks.forEach((block, i) => {
        const expectedPrev = i === 0 ? GENESIS_PREV : state.blocks[i - 1].hash;
        const linkOk = block.hash && isValidHash(block.hash);
        const card = document.createElement('div');
        card.className = 'block-card ' + (linkOk ? 'valid' : 'invalid');

        card.innerHTML = `
            <div class="block-title">Blocco #${block.index}</div>
            <div class="block-field">
                <div class="block-field-label">Dati</div>
                <input type="text" value="${block.data.replace(/"/g, '&quot;')}" data-idx="${i}" class="data-input">
            </div>
            <div class="nonce-row"><span>Nonce</span><span>${block.nonce}</span></div>
            <div class="block-field">
                <div class="block-field-label">Hash del blocco precedente atteso</div>
                <div class="block-hash" title="${expectedPrev}">${i === 0 ? '(nessuno, è il primo)' : shortHash(expectedPrev)}</div>
            </div>
            <div class="block-field">
                <div class="block-field-label">Hash di questo blocco</div>
                <div class="block-hash own-hash" title="${block.hash}">${block.hash ? shortHash(block.hash) : '...'}</div>
            </div>
            <button class="mine-btn" id="mining-${i}" data-mine="${i}" ${state.busy ? 'disabled' : ''}>⛏️ Mina</button>
        `;
        row.appendChild(card);

        if (i < state.blocks.length - 1) {
            const nextValid = state.blocks[i + 1].hash && isValidHash(state.blocks[i + 1].hash);
            const link = document.createElement('div');
            link.className = 'chain-link' + (linkOk && nextValid ? '' : ' broken');
            link.textContent = '→';
            row.appendChild(link);
        }
    });

    row.querySelectorAll('.data-input').forEach(input => {
        input.addEventListener('input', (e) => onDataChange(parseInt(e.target.dataset.idx, 10), e.target.value));
    });
    row.querySelectorAll('[data-mine]').forEach(btn => {
        btn.addEventListener('click', (e) => mineBlock(parseInt(e.target.dataset.mine, 10)));
    });

    const validCount = state.blocks.filter(b => b.hash && isValidHash(b.hash)).length;
    document.getElementById('chainStats').textContent =
        `${validCount} / ${state.blocks.length} blocchi validi e minati (hash che inizia con "${DIFFICULTY_PREFIX}")` +
        (validCount === state.blocks.length ? ' — catena integra ✓' : ' — catena rotta, ri-mina i blocchi in rosso');
}

async function initChain() {
    state.blocks = INITIAL_DATA.map((d, i) => makeBlock(i, d));
    render();
    for (let i = 0; i < state.blocks.length; i++) {
        await mineBlock(i);
    }
}

document.getElementById('resetBtn').addEventListener('click', initChain);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché questo rende la blockchain difficile da falsificare? ▸'
        : 'Perché questo rende la blockchain difficile da falsificare? ▾';
});

// Inizializzazione
initChain();
