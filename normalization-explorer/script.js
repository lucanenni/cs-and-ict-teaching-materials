// --- Normalizzazione passo-passo di una tabella denormalizzata -------------
const ORIGINAL_ORDERS = [
    { id: 1, clienteNome: 'Giulia Bianchi', clienteEmail: 'giulia@email.it', prodotto: 'Tastiera', prezzo: 45, quantita: 1 },
    { id: 2, clienteNome: 'Giulia Bianchi', clienteEmail: 'giulia@email.it', prodotto: 'Mouse', prezzo: 15, quantita: 2 },
    { id: 3, clienteNome: 'Marco Rossi', clienteEmail: 'marco@email.it', prodotto: 'Tastiera', prezzo: 45, quantita: 1 },
    { id: 4, clienteNome: 'Marco Rossi', clienteEmail: 'marco@email.it', prodotto: 'Monitor', prezzo: 120, quantita: 1 },
    { id: 5, clienteNome: 'Sara Conti', clienteEmail: 'sara@email.it', prodotto: 'Mouse', prezzo: 15, quantita: 1 }
];

const NEW_EMAIL = 'giulia.bianchi@nuovo-indirizzo.it';
const TINTS = ['tint-1', 'tint-2', 'tint-3', 'tint-4'];

function tintFor(distinctValues, value) {
    const idx = distinctValues.indexOf(value);
    return TINTS[idx % TINTS.length];
}

function distinctInOrder(arr, key) {
    const seen = [];
    arr.forEach(item => { if (!seen.includes(item[key])) seen.push(item[key]); });
    return seen;
}

function cloneOriginalOrders() {
    return ORIGINAL_ORDERS.map(o => ({ ...o }));
}

let state = {
    stage: 'flat',
    orders: cloneOriginalOrders(),
    clienti: null,
    prodotti: null,
    ordersNorm: null
};

function extractClienti() {
    const names = distinctInOrder(state.orders, 'clienteNome');
    state.clienti = names.map((nome, idx) => {
        const firstRow = state.orders.find(o => o.clienteNome === nome);
        return { id: idx + 1, nome, email: firstRow.clienteEmail };
    });
    state.ordersNorm = state.orders.map(o => ({
        id: o.id,
        clienteId: state.clienti.find(c => c.nome === o.clienteNome).id,
        prodotto: o.prodotto,
        prezzo: o.prezzo,
        quantita: o.quantita
    }));
    state.stage = 'clienti';
}

function extractProdotti() {
    const names = distinctInOrder(state.ordersNorm, 'prodotto');
    state.prodotti = names.map((nome, idx) => {
        const firstRow = state.ordersNorm.find(o => o.prodotto === nome);
        return { id: idx + 1, nome, prezzo: firstRow.prezzo };
    });
    state.ordersNorm = state.ordersNorm.map(o => ({
        id: o.id,
        clienteId: o.clienteId,
        prodottoId: state.prodotti.find(p => p.nome === o.prodotto).id,
        quantita: o.quantita
    }));
    state.stage = 'full';
}

function resetAll() {
    state = { stage: 'flat', orders: cloneOriginalOrders(), clienti: null, prodotti: null, ordersNorm: null };
    render();
}

function renderFlatTable() {
    const names = distinctInOrder(state.orders, 'clienteNome');
    const products = distinctInOrder(state.orders, 'prodotto');

    // righe con la stessa persona ma email diverse: incoerenza da segnalare
    const emailsByName = {};
    state.orders.forEach(o => {
        (emailsByName[o.clienteNome] = emailsByName[o.clienteNome] || new Set()).add(o.clienteEmail);
    });

    const rowsHtml = state.orders.map(o => {
        const inconsistent = emailsByName[o.clienteNome].size > 1;
        return `<tr>
            <td>${o.id}</td>
            <td class="${tintFor(names, o.clienteNome)}">${o.clienteNome}</td>
            <td class="${tintFor(names, o.clienteNome)}${inconsistent ? ' inconsistent' : ''}">${o.clienteEmail}</td>
            <td class="${tintFor(products, o.prodotto)}">${o.prodotto}</td>
            <td class="${tintFor(products, o.prodotto)}">${o.prezzo}</td>
            <td>${o.quantita}</td>
        </tr>`;
    }).join('');

    return `
        <div class="table-block wide">
            <div class="table-name">Ordini</div>
            <table class="data-table">
                <thead><tr><th>OrdineID</th><th>ClienteNome</th><th>ClienteEmail</th><th>Prodotto</th><th>PrezzoUnitario</th><th>Quantità</th></tr></thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>
    `;
}

function renderClientiTable() {
    const rows = state.clienti.map(c => `<tr><td>${c.id}</td><td>${c.nome}</td><td>${c.email}</td></tr>`).join('');
    return `
        <div class="table-block">
            <div class="table-name">Clienti</div>
            <table class="data-table">
                <thead><tr><th>ClienteID</th><th>Nome</th><th>Email</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function renderProdottiTable() {
    const rows = state.prodotti.map(p => `<tr><td>${p.id}</td><td>${p.nome}</td><td>${p.prezzo}</td></tr>`).join('');
    return `
        <div class="table-block">
            <div class="table-name">Prodotti</div>
            <table class="data-table">
                <thead><tr><th>ProdottoID</th><th>Nome</th><th>PrezzoUnitario</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function renderOrdiniStage2() {
    const products = distinctInOrder(state.ordersNorm, 'prodotto');
    const rows = state.ordersNorm.map(o => `<tr>
        <td>${o.id}</td>
        <td class="fk">${o.clienteId}</td>
        <td class="${tintFor(products, o.prodotto)}">${o.prodotto}</td>
        <td class="${tintFor(products, o.prodotto)}">${o.prezzo}</td>
        <td>${o.quantita}</td>
    </tr>`).join('');
    return `
        <div class="table-block wide">
            <div class="table-name">Ordini</div>
            <table class="data-table">
                <thead><tr><th>OrdineID</th><th>ClienteID</th><th>Prodotto</th><th>PrezzoUnitario</th><th>Quantità</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function renderOrdiniFull() {
    const rows = state.ordersNorm.map(o => `<tr>
        <td>${o.id}</td>
        <td class="fk">${o.clienteId}</td>
        <td class="fk">${o.prodottoId}</td>
        <td>${o.quantita}</td>
    </tr>`).join('');
    return `
        <div class="table-block">
            <div class="table-name">Ordini</div>
            <table class="data-table">
                <thead><tr><th>OrdineID</th><th>ClienteID</th><th>ProdottoID</th><th>Quantità</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function renderJoinPreview() {
    const rows = state.ordersNorm.map(o => {
        const c = state.clienti.find(x => x.id === o.clienteId);
        const p = state.prodotti.find(x => x.id === o.prodottoId);
        return `<tr><td>${o.id}</td><td>${c.nome}</td><td>${c.email}</td><td>${p.nome}</td><td>${p.prezzo}</td><td>${o.quantita}</td></tr>`;
    }).join('');
    return `
        <div class="table-block wide">
            <div class="table-name">Anteprima (le tre tabelle riunite con un JOIN)</div>
            <table class="data-table">
                <thead><tr><th>OrdineID</th><th>ClienteNome</th><th>ClienteEmail</th><th>Prodotto</th><th>PrezzoUnitario</th><th>Quantità</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function renderAnomalyBox() {
    const box = document.getElementById('anomalyBox');
    if (state.stage === 'flat') {
        box.className = 'anomaly-box';
        box.innerHTML = `<strong>⚠ Tre problemi nascosti in questa tabella:</strong>
            <ul>
                <li>• <strong>Aggiornamento</strong>: "Giulia Bianchi" ed "email" compaiono 2 volte (righe 1 e 2) — cambiarla in una sola riga crea un'incoerenza.</li>
                <li>• <strong>Inserimento</strong>: non puoi registrare un nuovo cliente senza che faccia già un ordine.</li>
                <li>• <strong>Cancellazione</strong>: se cancellassi la riga 5 (l'unico ordine di Sara Conti), perderesti anche ogni traccia di Sara come cliente.</li>
            </ul>`;
    } else if (state.stage === 'clienti') {
        box.className = 'anomaly-box';
        box.innerHTML = `<strong>Un problema risolto, uno resta:</strong>
            <ul>
                <li>• ✓ I dati dei clienti ora vivono in un unico posto: cambiare l'email di Giulia richiede una sola modifica, in <em>Clienti</em>.</li>
                <li>• ⚠ "Tastiera" e il suo prezzo compaiono ancora 2 volte nella tabella Ordini (righe 1 e 3): stessa identica anomalia, ma sui prodotti.</li>
            </ul>`;
    } else {
        box.className = 'anomaly-box ok';
        box.innerHTML = `<strong>✓ Nessuna ridondanza rimasta.</strong> Ogni fatto (un cliente, un prodotto, un ordine) è scritto in una sola riga di una sola tabella. Aggiornare, inserire o cancellare un cliente o un prodotto non tocca più le altre tabelle per errore.`;
    }
}

function render() {
    const wrap = document.getElementById('tablesWrap');
    let html = '<div class="tables-row">';
    if (state.stage === 'flat') {
        html += renderFlatTable();
    } else if (state.stage === 'clienti') {
        html += renderClientiTable() + renderOrdiniStage2();
    } else {
        html += renderClientiTable() + renderProdottiTable() + renderOrdiniFull() + renderJoinPreview();
    }
    html += '</div>';
    wrap.innerHTML = html;

    renderAnomalyBox();

    document.getElementById('step1Btn').disabled = state.stage !== 'flat';
    document.getElementById('step1Btn').textContent = state.stage === 'flat' ? '① Estrai i clienti' : '✓ Clienti estratti';
    document.getElementById('step2Btn').disabled = state.stage !== 'clienti';
    document.getElementById('step2Btn').textContent = state.stage === 'full' ? '✓ Prodotti estratti' : '② Estrai i prodotti';
}

document.getElementById('step1Btn').addEventListener('click', () => { extractClienti(); render(); });
document.getElementById('step2Btn').addEventListener('click', () => { extractProdotti(); render(); });
document.getElementById('resetBtn').addEventListener('click', resetAll);

document.getElementById('simulateBtn').addEventListener('click', () => {
    const resultEl = document.getElementById('simResult');
    if (state.stage === 'flat') {
        const giuliaRows = state.orders.filter(o => o.clienteNome === 'Giulia Bianchi');
        const first = giuliaRows[0];
        first.clienteEmail = first.clienteEmail === NEW_EMAIL ? ORIGINAL_ORDERS[0].clienteEmail : NEW_EMAIL;
        resultEl.textContent = first.clienteEmail === NEW_EMAIL
            ? '⚠ Aggiornata solo la riga 1: ora la riga 2 (stessa Giulia) ha ancora la vecchia email. Guarda la cella rossa: la tabella si contraddice da sola.'
            : '↺ Email della riga 1 ripristinata: le due righe di Giulia sono di nuovo coerenti (per fortuna, questa volta).';
    } else {
        const giulia = state.clienti.find(c => c.nome === 'Giulia Bianchi');
        giulia.email = giulia.email === NEW_EMAIL ? ORIGINAL_ORDERS[0].clienteEmail : NEW_EMAIL;
        resultEl.textContent = `✓ Aggiornata un'unica riga in Clienti. Tutti gli ordini di Giulia la vedranno subito${state.stage === 'full' ? ' (guarda l\'anteprima col JOIN qui sotto)' : ''}: non serve toccare Ordini.`;
    }
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'È davvero "2NF" e "3NF" in senso stretto? ▸'
        : 'È davvero "2NF" e "3NF" in senso stretto? ▾';
});

render();
