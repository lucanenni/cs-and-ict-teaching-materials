// --- Gerarchia dei domini e simulazione (semplificata) della risoluzione DNS -
// Il modello di parsing qui sotto NON è la vera Public Suffix List usata dai
// browser (quella è una lista mantenuta pubblicamente, con centinaia di casi
// speciali): è una versione ridotta, con solo i TLD composti più comuni,
// pensata per mostrare il concetto senza scaricare un elenco enorme. Il
// pannello di approfondimento nella pagina segnala esplicitamente questo
// limite con l'esempio di github.io.
const COMPOUND_TLDS = new Set([
    'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'net.uk',
    'com.au', 'net.au', 'org.au',
    'co.nz', 'co.jp', 'co.in', 'co.za', 'com.br'
]);

function parseDomain(raw) {
    let s = raw.trim().toLowerCase();
    s = s.replace(/^[a-z]+:\/\//, '');
    s = s.split('/')[0];
    s = s.replace(/\.$/, '');

    const labels = s.split('.').filter(Boolean);
    if (labels.length < 2) {
        return { error: 'Serve almeno un dominio di secondo livello e un TLD, ad esempio "esempio.it".' };
    }
    if (labels.some(l => !/^[a-z0-9-]+$/.test(l))) {
        return { error: 'Usa solo lettere, numeri e trattini in ciascuna etichetta.' };
    }

    const lastTwo = labels.slice(-2).join('.');
    const tldLen = (labels.length >= 3 && COMPOUND_TLDS.has(lastTwo)) ? 2 : 1;
    const sldIndex = labels.length - tldLen - 1;

    const tld = labels.slice(labels.length - tldLen).join('.');
    const sld = labels[sldIndex];
    const registrable = labels.slice(sldIndex).join('.');
    const subdomainLabels = labels.slice(0, sldIndex);
    const subdomain = subdomainLabels.join('.');
    const fullHost = labels.join('.');

    return { labels, tld, sld, registrable, subdomain, subdomainLabels, fullHost };
}

// IP inventato ma deterministico, solo per dare un risultato finale "concreto"
// alla simulazione: non corrisponde a un vero indirizzo del dominio digitato.
function fakeIp(host) {
    let hash = 0;
    for (let i = 0; i < host.length; i++) {
        hash = (hash * 31 + host.charCodeAt(i)) >>> 0;
    }
    const a = 20 + (hash % 200);
    const b = (hash >>> 8) % 256;
    const c = (hash >>> 16) % 256;
    const d = 1 + ((hash >>> 24) % 254);
    return `${a}.${b}.${c}.${d}`;
}

function renderBreadcrumb(parsed) {
    const el = document.getElementById('breadcrumb');
    if (parsed.error) { el.innerHTML = ''; return; }

    const parts = [];
    parsed.subdomainLabels.forEach(label => {
        parts.push(`<span class="label-sub">${label}</span>`);
    });
    parts.push(`<span class="label-sld">${parsed.sld}</span>`);
    parsed.tld.split('.').forEach(label => {
        parts.push(`<span class="label-tld">${label}</span>`);
    });

    el.innerHTML = parts.join('<span class="dot">.</span>') + '<span class="dot">.</span>';
}

function renderTree(parsed) {
    const wrap = document.getElementById('treeWrap');
    wrap.innerHTML = '';
    if (parsed.error) return;

    const nodes = [
        { title: 'Radice', value: '. (root)' },
        { title: 'Dominio di primo livello (TLD)', value: '.' + parsed.tld },
        { title: 'Dominio registrato (2° livello)', value: parsed.registrable },
        { title: parsed.subdomain ? 'Host completo (con sottodominio)' : 'Host completo (nessun sottodominio)', value: parsed.fullHost }
    ];

    nodes.forEach((n, i) => {
        if (i > 0) {
            const edge = document.createElement('div');
            edge.className = 'tree-edge';
            wrap.appendChild(edge);
        }
        const node = document.createElement('div');
        node.className = 'tree-node';
        node.innerHTML = `<div class="tree-node-title">${n.title}</div><div class="tree-node-value">${n.value}</div>`;
        wrap.appendChild(node);
    });
}

function buildSteps(parsed) {
    if (parsed.error) return [];
    const { tld, registrable, fullHost } = parsed;
    const ip = fakeIp(fullHost);
    return [
        { active: ['client'], edge: null, text: `Il resolver deve trovare l'indirizzo IP di <strong>${fullHost}</strong>, ma parte senza sapere nulla: nemmeno un server radice ricorda ogni dominio del mondo.` },
        { active: ['client', 'root'], edge: 'client-root', text: `Contatta uno dei server <strong>radice</strong> (.). Non conoscono ${fullHost}, ma sanno esattamente a chi rivolgersi per qualunque dominio <strong>.${tld}</strong>.` },
        { active: ['client', 'tld'], edge: 'client-tld', text: `Il resolver contatta i server <strong>TLD .${tld}</strong> indicati dalla radice. Anche loro non conoscono ${fullHost} nel dettaglio, ma sanno quale server è autoritativo per <strong>${registrable}</strong>.` },
        { active: ['client', 'auth'], edge: 'client-auth', text: `Il resolver contatta il server <strong>autoritativo di ${registrable}</strong> — gestito direttamente da chi ha registrato quel dominio.` },
        { active: ['auth'], edge: null, text: `Quel server risponde con l'indirizzo IP di ${fullHost}: <strong>${ip}</strong> (inventato a scopo didattico).` },
        { active: ['client'], edge: null, text: `Il resolver restituisce l'IP al browser, che può finalmente aprire una connessione a ${fullHost}.` }
    ];
}

let state = {
    parsed: null,
    steps: [],
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 1600
};

function updateDomain(regenerateSteps) {
    const raw = document.getElementById('domainInput').value;
    state.parsed = parseDomain(raw);

    const errorEl = document.getElementById('errorText');
    if (state.parsed.error) {
        errorEl.textContent = state.parsed.error;
        errorEl.classList.remove('hidden');
    } else {
        errorEl.classList.add('hidden');
    }

    renderBreadcrumb(state.parsed);
    renderTree(state.parsed);

    if (regenerateSteps) {
        stopPlaying();
        state.steps = buildSteps(state.parsed);
        state.current = 0;
    }
    render();
}

function render() {
    const hasSteps = state.steps.length > 0;
    document.getElementById('playPauseBtn').disabled = !hasSteps;
    document.getElementById('stepBtn').disabled = !hasSteps;

    if (!hasSteps) {
        document.querySelectorAll('.node').forEach(node => node.classList.remove('active'));
        document.querySelectorAll('.edge').forEach(edge => edge.classList.remove('active'));
        document.getElementById('stepPanel').innerHTML = 'Correggi il dominio qui sopra per avviare la simulazione.';
        return;
    }

    const step = state.steps[state.current];
    document.querySelectorAll('.node').forEach(node => {
        const id = node.id.replace('node-', '');
        node.classList.toggle('active', step.active.includes(id));
    });
    document.querySelectorAll('.edge').forEach(edge => edge.classList.remove('active'));
    if (step.edge) {
        const edgeEl = document.getElementById('edge-' + step.edge);
        if (edgeEl) edgeEl.classList.add('active');
    }

    document.getElementById('stepPanel').innerHTML =
        `<span class="step-counter">Passo ${state.current + 1} di ${state.steps.length}</span>${step.text}`;

    const playBtn = document.getElementById('playPauseBtn');
    const atEnd = state.current >= state.steps.length - 1;
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else if (atEnd) {
        playBtn.textContent = '↻ Riavvia';
    } else {
        playBtn.textContent = '▶ Avvia';
    }
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
    if (state.steps.length === 0) return;
    if (state.current >= state.steps.length - 1) state.current = 0;
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
    if (state.isPlaying) {
        stopPlaying();
        render();
    } else {
        startPlaying();
    }
}

document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    advance();
});
document.getElementById('resetBtn').addEventListener('click', () => {
    stopPlaying();
    state.current = 0;
    render();
});

document.getElementById('domainInput').addEventListener('input', () => updateDomain(true));

document.querySelectorAll('.presets-row .chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('domainInput').value = btn.dataset.domain;
        updateDomain(true);
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'In cosa differisce da "il viaggio di un pacchetto"? ▸'
        : 'In cosa differisce da "il viaggio di un pacchetto"? ▾';
});

updateDomain(true);
