// --- Simulazione di traceroute basata su TTL --------------------------------
// Gli IP dei router sono generati da intervalli riservati alla documentazione
// (RFC 5737: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24), ciclati in modo
// deterministico: non corrispondono a nessun host reale.
const IP_RANGES = ['192.0.2.', '198.51.100.', '203.0.113.'];

const DESTINATIONS = [
    { name: 'sito-scuola.it', hops: 4 },
    { name: 'server-europa.com', hops: 6 },
    { name: 'server-lontano.net', hops: 8 }
];

function ipForHop(ttl) {
    const range = IP_RANGES[(ttl - 1) % IP_RANGES.length];
    const octet = ((ttl * 37) % 253) + 1;
    return range + octet;
}

function buildHops(destination) {
    const hops = [];
    for (let ttl = 1; ttl <= destination.hops; ttl++) {
        const isFinal = ttl === destination.hops;
        const jitter = Math.floor(Math.random() * 12);
        const rtt = Math.round(8 + ttl * 14 + jitter + (isFinal ? 6 : 0));
        hops.push({ ttl, ip: ipForHop(ttl), rtt, isFinal });
    }
    return hops;
}

function buildSteps(hops, destName) {
    return hops.map(hop => {
        if (hop.isFinal) {
            return {
                hop,
                text: `<strong>TTL=${hop.ttl}</strong>: il pacchetto sopravvive abbastanza da raggiungere finalmente <strong>${destName}</strong> (${hop.ip}). La destinazione risponde (RTT ${hop.rtt} ms): traceroute completato in ${hop.ttl} hop.`
            };
        }
        return {
            hop,
            text: `<strong>TTL=${hop.ttl}</strong>: il pacchetto attraversa i router già scoperti e arriva al router #${hop.ttl} (${hop.ip}) con il contatore a 0. Il router lo scarta e risponde con un ICMP "Time Exceeded" (RTT ${hop.rtt} ms).`
        };
    });
}

let state = {
    destIdx: 0,
    hops: [],
    steps: [],
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 1300
};

function renderChips() {
    const wrap = document.getElementById('destChips');
    wrap.innerHTML = '';
    DESTINATIONS.forEach((d, i) => {
        const chip = document.createElement('button');
        chip.className = 'chip' + (i === state.destIdx ? ' active' : '');
        chip.textContent = d.name;
        chip.addEventListener('click', () => {
            if (state.destIdx === i) return;
            state.destIdx = i;
            renderChips();
            startNewRun();
        });
        wrap.appendChild(chip);
    });
}

function renderDiagram() {
    const wrap = document.getElementById('hopDiagram');
    wrap.innerHTML = '';

    const client = document.createElement('div');
    client.className = 'node';
    client.id = 'node-client';
    client.innerHTML = `<div class="node-icon">💻</div><div class="node-label">Tu</div>`;
    wrap.appendChild(client);

    state.hops.forEach((hop, i) => {
        const edge = document.createElement('div');
        edge.className = 'edge';
        edge.id = 'edge-' + i;
        wrap.appendChild(edge);

        const node = document.createElement('div');
        node.className = 'node unknown';
        node.id = 'node-hop-' + i;
        const icon = hop.isFinal ? '🎯' : '📡';
        const label = hop.isFinal ? 'Destinazione' : `Hop ${hop.ttl}`;
        node.innerHTML = `<div class="node-icon">${icon}</div><div class="node-label">${label}</div>`;
        wrap.appendChild(node);
    });
}

function renderStepHighlight() {
    for (let i = 0; i < state.hops.length; i++) {
        const node = document.getElementById('node-hop-' + i);
        const edge = document.getElementById('edge-' + i);
        node.classList.remove('active', 'discovered', 'unknown');
        edge.classList.remove('active', 'discovered');
        if (i < state.current) {
            node.classList.add('discovered');
            edge.classList.add('discovered');
        } else if (i === state.current) {
            node.classList.add('active');
            edge.classList.add('active');
        } else {
            node.classList.add('unknown');
        }
    }
}

function renderTable() {
    const body = document.getElementById('hopBody');
    body.innerHTML = '';
    for (let i = 0; i <= state.current && i < state.hops.length; i++) {
        const hop = state.hops[i];
        const tr = document.createElement('tr');
        if (hop.isFinal) tr.className = 'final';
        tr.innerHTML = `
            <td>${hop.ttl}</td>
            <td>${hop.ip}</td>
            <td>${hop.rtt} ms</td>
            <td class="msg">${hop.isFinal ? '✓ Destinazione raggiunta' : 'Time Exceeded'}</td>
        `;
        body.appendChild(tr);
    }
}

function render() {
    renderStepHighlight();
    renderTable();

    const step = state.steps[state.current];
    document.getElementById('stepPanel').innerHTML =
        `<span class="step-counter">Passo ${state.current + 1} di ${state.steps.length}</span>${step.text}`;

    const atEnd = state.current >= state.steps.length - 1;
    const playBtn = document.getElementById('playPauseBtn');
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else if (atEnd) {
        playBtn.textContent = '✓ Completato';
    } else {
        playBtn.textContent = '▶ Avvia';
    }
    playBtn.disabled = atEnd;
    document.getElementById('stepBtn').disabled = atEnd;
}

function advance() {
    if (state.current >= state.steps.length - 1) {
        stopPlaying();
        render();
        return;
    }
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

function playPause() {
    if (state.isPlaying) { stopPlaying(); render(); }
    else startPlaying();
}

function startNewRun() {
    stopPlaying();
    const dest = DESTINATIONS[state.destIdx];
    state.hops = buildHops(dest);
    state.steps = buildSteps(state.hops, dest.name);
    state.current = 0;
    renderDiagram();
    render();
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });
document.getElementById('resetBtn').addEventListener('click', startNewRun);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché la destinazione finale non scarta il pacchetto? ▸'
        : 'Perché la destinazione finale non scarta il pacchetto? ▾';
});

renderChips();
startNewRun();
