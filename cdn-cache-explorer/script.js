// --- Cache CDN: hit/miss, scadenza (TTL) e invalidazione manuale -----------
const CLOCK_STEP = 5; // secondi simulati che passano a ogni richiesta

const RESOURCES = [
    { id: 'html', name: '/index.html', ttl: 15, originLatency: 180, edgeLatency: 15 },
    { id: 'logo', name: '/logo.png', ttl: 60, originLatency: 220, edgeLatency: 12 },
    { id: 'css', name: '/style.css', ttl: 30, originLatency: 150, edgeLatency: 10 }
];

let clock = 0;
let cache = {}; // id -> { expiresAt } oppure assente/undefined se non in cache
let requestLog = [];

function isCached(id) {
    return cache[id] !== undefined && clock <= cache[id].expiresAt;
}

// Esegue una richiesta e restituisce l'esito, aggiornando l'orologio e la cache.
function requestResource(id) {
    clock += CLOCK_STEP;
    const resource = RESOURCES.find(r => r.id === id);
    const hit = isCached(id);
    if (!hit) {
        cache[id] = { expiresAt: clock + resource.ttl };
    }
    const responseTime = hit ? resource.edgeLatency : resource.originLatency + resource.edgeLatency;
    const entry = { tick: clock, resourceId: id, resourceName: resource.name, hit, responseTime };
    requestLog.push(entry);
    return entry;
}

function purgeResource(id) {
    delete cache[id];
}

function buildSteps(resource, hit) {
    if (hit) {
        return [
            { active: ['user', 'edge'], edge: 'user-edge', text: `La richiesta per <strong>${resource.name}</strong> arriva al server edge: è già in cache e ancora valida.` },
            { active: ['edge', 'user'], edge: 'user-edge', text: `<strong>Cache HIT</strong> — l'edge risponde subito, in ${resource.edgeLatency} ms, senza disturbare l'origine.` }
        ];
    }
    return [
        { active: ['user', 'edge'], edge: 'user-edge', text: `La richiesta per <strong>${resource.name}</strong> arriva al server edge: non è in cache (o è scaduta/invalidata).` },
        { active: ['edge', 'origin'], edge: 'edge-origin', text: `<strong>Cache MISS</strong> — l'edge la richiede all'origine.` },
        { active: ['origin', 'edge'], edge: 'edge-origin', text: `L'origine risponde dopo ${resource.originLatency} ms. L'edge salva una copia in cache, valida per i prossimi ${resource.ttl} secondi simulati.` },
        { active: ['edge', 'user'], edge: 'user-edge', text: `L'edge inoltra la risposta all'utente: ${resource.originLatency + resource.edgeLatency} ms in tutto.` }
    ];
}

let anim = { steps: [], current: 0, interval: null, isPlaying: false, speed: 1100 };

function renderClock() {
    document.getElementById('clockValue').textContent = clock;
}

function renderResources() {
    const grid = document.getElementById('resourcesGrid');
    grid.innerHTML = RESOURCES.map(r => {
        const cached = isCached(r.id);
        const statusText = cached
            ? `🟢 In cache — scade a t=${cache[r.id].expiresAt}s`
            : '🔴 Non in cache';
        return `
            <div class="resource-card">
                <div class="resource-name">${r.name}</div>
                <div class="resource-status ${cached ? 'cached' : 'uncached'}">${statusText}</div>
                <div class="resource-controls">
                    <button class="btn btn-primary" data-request="${r.id}">Richiedi</button>
                    <button class="btn btn-secondary" data-purge="${r.id}" ${cached ? '' : 'disabled'}>Invalida</button>
                </div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('[data-request]').forEach(btn => {
        btn.addEventListener('click', () => runRequest(btn.dataset.request));
    });
    grid.querySelectorAll('[data-purge]').forEach(btn => {
        btn.addEventListener('click', () => {
            purgeResource(btn.dataset.purge);
            renderResources();
        });
    });
}

function renderLog() {
    const body = document.getElementById('logBody');
    body.innerHTML = requestLog.slice().reverse().map(e => `
        <tr>
            <td>${e.tick}s</td>
            <td>${e.resourceName}</td>
            <td class="${e.hit ? 'hit-badge' : 'miss-badge'}">${e.hit ? 'HIT' : 'MISS'}</td>
            <td>${e.responseTime} ms</td>
        </tr>
    `).join('');
    document.getElementById('emptyLogText').classList.toggle('hidden', requestLog.length > 0);
}

function clearDiagram() {
    document.querySelectorAll('.node').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.edge').forEach(e => e.classList.remove('active'));
}

function renderAnimStep() {
    clearDiagram();
    const step = anim.steps[anim.current];
    step.active.forEach(id => document.getElementById('node-' + id).classList.add('active'));
    document.getElementById('edge-' + step.edge).classList.add('active');
    document.getElementById('stepPanel').innerHTML = step.text;
}

function advanceAnim() {
    if (anim.current >= anim.steps.length - 1) { stopAnim(); return; }
    anim.current++;
    renderAnimStep();
    if (anim.current >= anim.steps.length - 1) stopAnim();
}

function stopAnim() {
    if (anim.interval) clearInterval(anim.interval);
    anim.interval = null;
    anim.isPlaying = false;
}

function runRequest(id) {
    stopAnim();
    const resource = RESOURCES.find(r => r.id === id);
    const entry = requestResource(id);
    renderClock();
    renderResources();
    renderLog();

    anim.steps = buildSteps(resource, entry.hit);
    anim.current = 0;
    anim.isPlaying = true;
    renderAnimStep();
    anim.interval = setInterval(advanceAnim, anim.speed);
}

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché a volte serve invalidare a mano? ▸'
        : 'Perché a volte serve invalidare a mano? ▾';
});

renderClock();
renderResources();
renderLog();
