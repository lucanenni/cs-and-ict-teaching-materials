// --- Risoluzione ARP (IP → MAC) con cache a scadenza -----------------------
const CLIENT_IP = '192.168.1.10';
const GATEWAY_IP = '192.168.1.1';
const CACHE_TTL = 3; // sopravvive per altre 3 azioni di invio prima di scadere

const LAN_DEVICES = [
    { id: 'laptop', name: 'Laptop (tu)', ip: CLIENT_IP, icon: '💻' },
    { id: 'gateway', name: 'Gateway', ip: GATEWAY_IP, icon: '📡' },
    { id: 'tv', name: 'Smart TV', ip: '192.168.1.12', icon: '📺' },
    { id: 'printer', name: 'Stampante', ip: '192.168.1.13', icon: '🖨️' },
    { id: 'phone', name: 'Smartphone', ip: '192.168.1.14', icon: '📱' },
    { id: 'internet', name: 'Internet', ip: null, icon: '🌍' }
];

const EXTERNAL_IP = '8.8.8.8';

function macForIndex(i) {
    let seed = (i + 1) * 2654435761 % 4294967296;
    const bytes = [0x02];
    for (let b = 0; b < 5; b++) {
        seed = (seed * 1103515245 + 12345) % 4294967296;
        bytes.push(Math.floor(seed / 4294967296 * 256) % 256);
    }
    return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
}

LAN_DEVICES.forEach((d, i) => { d.mac = d.ip ? macForIndex(i) : null; });

function deviceByIp(ip) {
    return LAN_DEVICES.find(d => d.ip === ip);
}

let cache = {}; // ip -> { mac, ttl }

function tickCache() {
    Object.keys(cache).forEach(ip => {
        cache[ip].ttl -= 1;
        if (cache[ip].ttl <= 0) delete cache[ip];
    });
}

// Decide quale IP va davvero risolto via ARP: quello di destinazione se è
// sulla rete locale, altrimenti il gateway (ARP non attraversa mai i router).
function resolutionTarget(destIp) {
    return destIp === EXTERNAL_IP ? GATEWAY_IP : destIp;
}

function buildSendSteps(destIp) {
    tickCache();
    const isExternal = destIp === EXTERNAL_IP;
    const resolveIp = resolutionTarget(destIp);
    const owner = deviceByIp(resolveIp);
    const cached = cache[resolveIp];

    const steps = [];
    steps.push({
        kind: 'intro',
        text: isExternal
            ? `Il laptop vuole mandare un pacchetto a <strong>${destIp}</strong>: non è sulla rete locale (192.168.1.0/24), quindi userà il gateway.`
            : `Il laptop vuole mandare un pacchetto a <strong>${destIp}</strong>, sulla stessa rete locale.`
    });

    if (cached) {
        steps.push({
            kind: 'cache-hit',
            resolveIp,
            text: `Il MAC di ${resolveIp} è già in cache (${cached.mac}): nessun ARP necessario, il frame parte subito.`
        });
    } else {
        steps.push({
            kind: 'broadcast',
            resolveIp,
            text: `<strong>ARP Request</strong> (broadcast): "Chi ha ${resolveIp}? Dimmelo a ${CLIENT_IP}." Tutti i dispositivi della rete locale la ricevono.`
        });
        steps.push({
            kind: 'reply',
            resolveIp,
            responderId: owner.id,
            text: `<strong>ARP Reply</strong> (unicast): solo ${owner.name} risponde, perché solo lui possiede ${resolveIp}. Il suo MAC è ${owner.mac}.`
        });
        steps.push({
            kind: 'cache-store',
            resolveIp,
            mac: owner.mac,
            text: `Il laptop salva ${resolveIp} → ${owner.mac} nella sua cache ARP, valida per le prossime ${CACHE_TTL} operazioni di invio.`
        });
    }

    if (isExternal) {
        steps.push({
            kind: 'forward',
            text: `Il frame arriva al gateway (usando il suo MAC), indirizzato a livello IP a ${destIp}: sarà il gateway a instradarlo verso internet.`
        });
    } else {
        steps.push({
            kind: 'deliver',
            targetId: owner.id,
            text: `Il frame Ethernet, indirizzato al MAC ${owner.mac}, arriva direttamente a ${owner.name}.`
        });
    }

    return steps;
}

let state = { steps: [], current: 0, isPlaying: false, interval: null, speed: 1400, selectedDest: null };

function renderChips() {
    const wrap = document.getElementById('destChips');
    wrap.innerHTML = '';
    const targets = [
        { ip: LAN_DEVICES.find(d => d.id === 'tv').ip, label: 'Smart TV (192.168.1.12)' },
        { ip: LAN_DEVICES.find(d => d.id === 'printer').ip, label: 'Stampante (192.168.1.13)' },
        { ip: LAN_DEVICES.find(d => d.id === 'phone').ip, label: 'Smartphone (192.168.1.14)' },
        { ip: EXTERNAL_IP, label: '8.8.8.8 (fuori rete)' }
    ];
    targets.forEach(t => {
        const chip = document.createElement('button');
        chip.className = 'chip' + (state.selectedDest === t.ip ? ' active' : '');
        chip.textContent = t.label;
        chip.addEventListener('click', () => {
            state.selectedDest = t.ip;
            renderChips();
            startSend(t.ip);
        });
        wrap.appendChild(chip);
    });
}

function renderNodes() {
    const row = document.getElementById('nodeRow');
    row.innerHTML = '';
    LAN_DEVICES.forEach(d => {
        const node = document.createElement('div');
        node.className = 'node';
        node.id = 'node-' + d.id;
        node.innerHTML = `<div class="node-icon">${d.icon}</div><div class="node-label">${d.name}</div><div class="node-sub">${d.ip || ''}</div>`;
        row.appendChild(node);
    });
}

function renderCacheTable() {
    const body = document.getElementById('arpBody');
    body.innerHTML = '';
    const entries = Object.entries(cache);
    entries.forEach(([ip, entry]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${ip}</td><td>${entry.mac}</td><td>${entry.ttl}</td>`;
        body.appendChild(tr);
    });
    document.getElementById('emptyText').classList.toggle('hidden', entries.length > 0);
}

function clearNodeHighlights() {
    LAN_DEVICES.forEach(d => document.getElementById('node-' + d.id).classList.remove('active', 'responder'));
}

function render() {
    const hasSteps = state.steps.length > 0;
    document.getElementById('playPauseBtn').disabled = !hasSteps;
    document.getElementById('stepBtn').disabled = !hasSteps || state.current >= state.steps.length - 1;
    if (!hasSteps) return;

    const step = state.steps[state.current];
    clearNodeHighlights();
    document.getElementById('node-laptop').classList.add('active');

    if (step.kind === 'broadcast') {
        LAN_DEVICES.forEach(d => { if (d.id !== 'laptop' && d.id !== 'internet') document.getElementById('node-' + d.id).classList.add('active'); });
    } else if (step.kind === 'reply') {
        document.getElementById('node-' + step.responderId).classList.add('responder');
    } else if (step.kind === 'deliver') {
        document.getElementById('node-' + step.targetId).classList.add('active');
    } else if (step.kind === 'forward') {
        document.getElementById('node-gateway').classList.add('active');
        document.getElementById('node-internet').classList.add('active');
    } else if (step.kind === 'cache-hit') {
        const owner = deviceByIp(step.resolveIp);
        document.getElementById('node-' + owner.id).classList.add('responder');
    }

    document.getElementById('stepPanel').innerHTML =
        `<span class="step-counter">Passo ${state.current + 1} di ${state.steps.length}</span>${step.text}`;

    if (step.kind === 'cache-store') {
        cache[step.resolveIp] = { mac: step.mac, ttl: CACHE_TTL };
        renderCacheTable();
    }

    const atEnd = state.current >= state.steps.length - 1;
    const playBtn = document.getElementById('playPauseBtn');
    if (state.isPlaying) playBtn.textContent = '⏸ Pausa';
    else if (atEnd) playBtn.textContent = '✓ Fatto';
    else playBtn.textContent = '▶ Avvia';
}

function advance() {
    if (state.current >= state.steps.length - 1) { stopPlaying(); render(); return; }
    state.current++;
    render();
    if (state.current >= state.steps.length - 1) stopPlaying();
}

function startPlaying() {
    if (state.current >= state.steps.length - 1) return;
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    render();
    state.interval = setInterval(advance, state.speed);
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
}

function startSend(destIp) {
    stopPlaying();
    state.steps = buildSendSteps(destIp);
    state.current = 0;
    render();
    renderCacheTable();
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (state.isPlaying) { stopPlaying(); render(); } else { startPlaying(); }
});
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });
document.getElementById('clearCacheBtn').addEventListener('click', () => {
    cache = {};
    renderCacheTable();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'E se la destinazione non è sulla rete locale? ▸'
        : 'E se la destinazione non è sulla rete locale? ▾';
});

renderChips();
renderNodes();
renderCacheTable();
