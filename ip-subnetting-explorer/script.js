function clampOctet(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(255, n));
}

function ipToInt(octets) {
    return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

function intToIp(n) {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function maskFromCidr(cidr) {
    if (cidr === 0) return 0;
    return (0xFFFFFFFF << (32 - cidr)) >>> 0;
}

function toBinary32(n) {
    return n.toString(2).padStart(32, '0');
}

let state = {
    ip: [192, 168, 1, 42],
    cidr: 24,
    ip2: [192, 168, 1, 200]
};

function makeOctetInputs(containerId, octets, onChange) {
    const box = document.getElementById(containerId);
    box.innerHTML = '';
    octets.forEach((val, i) => {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.max = 255;
        input.value = val;
        input.addEventListener('input', (e) => {
            octets[i] = clampOctet(e.target.value);
            onChange();
        });
        box.appendChild(input);
        if (i < 3) {
            const dot = document.createElement('span');
            dot.className = 'octet-dot';
            dot.textContent = '.';
            box.appendChild(dot);
        }
    });
}

function renderBits() {
    const ipInt = ipToInt(state.ip);
    const bin = toBinary32(ipInt);
    const box = document.getElementById('bitsBox');
    box.innerHTML = '';
    for (let o = 0; o < 4; o++) {
        const group = document.createElement('div');
        group.className = 'octet-bits';
        for (let b = 0; b < 8; b++) {
            const bitIndex = o * 8 + b;
            const bitEl = document.createElement('div');
            bitEl.className = 'bit-box ' + (bitIndex < state.cidr ? 'network' : 'host');
            bitEl.textContent = bin[bitIndex];
            group.appendChild(bitEl);
        }
        box.appendChild(group);
    }
}

function subnetInfo(ipOctets, cidr) {
    const ipInt = ipToInt(ipOctets);
    const mask = maskFromCidr(cidr);
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    let usable, first, last;
    if (cidr === 32) {
        usable = 1; first = ipInt; last = ipInt;
    } else if (cidr === 31) {
        usable = 2; first = network; last = broadcast;
    } else {
        usable = Math.pow(2, 32 - cidr) - 2;
        first = network + 1;
        last = broadcast - 1;
    }
    return { ipInt, mask, network, broadcast, usable, first, last };
}

function renderResults() {
    const info = subnetInfo(state.ip, state.cidr);
    const rows = [
        ['Maschera di sottorete', intToIp(info.mask)],
        ['Indirizzo di rete', intToIp(info.network)],
        ['Indirizzo di broadcast', intToIp(info.broadcast)],
        ['Primo host utilizzabile', intToIp(info.first)],
        ['Ultimo host utilizzabile', intToIp(info.last)],
        ['Host utilizzabili', info.usable.toLocaleString('it-IT')]
    ];
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = rows.map(([label, value]) =>
        `<div class="result-box"><div class="result-label">${label}</div><div class="result-value">${value}</div></div>`
    ).join('');
}

function renderCompare() {
    const info1 = subnetInfo(state.ip, state.cidr);
    const info2 = subnetInfo(state.ip2, state.cidr);
    const same = info1.network === info2.network;
    const el = document.getElementById('compareResult');
    el.textContent = same
        ? `✓ Stessa sottorete: entrambi condividono l'indirizzo di rete ${intToIp(info1.network)}/${state.cidr} — possono comunicare direttamente, senza passare da un router.`
        : `✗ Sottoreti diverse: ${intToIp(info1.ipInt)} è in ${intToIp(info1.network)}/${state.cidr}, ${intToIp(info2.ipInt)} è in ${intToIp(info2.network)}/${state.cidr} — serve un router per farli comunicare.`;
    el.style.color = same ? '#0f766e' : '#b45309';
}

function renderAll() {
    document.getElementById('cidrInput').value = state.cidr;
    document.getElementById('cidrSlider').value = state.cidr;
    renderBits();
    renderResults();
    renderCompare();
}

function setCidr(value) {
    state.cidr = Math.max(0, Math.min(32, parseInt(value, 10) || 0));
    renderAll();
}

makeOctetInputs('octetGroup', state.ip, renderAll);
makeOctetInputs('octetGroup2', state.ip2, renderCompare);

document.getElementById('cidrInput').addEventListener('input', (e) => setCidr(e.target.value));
document.getElementById('cidrSlider').addEventListener('input', (e) => setCidr(e.target.value));

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché "sprecare" indirizzi dividendo in sottoreti? ▸'
        : 'Perché "sprecare" indirizzi dividendo in sottoreti? ▾';
});

// Inizializzazione
renderAll();
