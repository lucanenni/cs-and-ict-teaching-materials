// --- Interfaccia dell'esploratore SQL (usa il motore in engine.js) ---------
const PRESETS = [
    'SELECT nome, classe FROM studenti',
    "SELECT nome FROM studenti WHERE classe = '5B'",
    'SELECT nome, materia, voto FROM studenti JOIN voti ON studenti.id = voti.studente_id',
    "SELECT nome, voto FROM studenti JOIN voti ON studenti.id = voti.studente_id WHERE materia = 'Matematica' ORDER BY voto DESC",
    'SELECT * FROM voti WHERE voto >= 8'
];

function renderMiniTable(id, rows) {
    const table = document.getElementById(id);
    if (rows.length === 0) return;
    const cols = Object.keys(rows[0]);
    const thead = `<thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${r[c]}</td>`).join('')}</tr>`).join('')}</tbody>`;
    table.innerHTML = thead + tbody;
}

function renderPresets() {
    const wrap = document.getElementById('presetChips');
    wrap.innerHTML = '';
    PRESETS.forEach(sql => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = sql;
        chip.addEventListener('click', () => {
            document.getElementById('queryInput').value = sql;
            runQuery();
        });
        wrap.appendChild(chip);
    });
}

function runQuery() {
    const sql = document.getElementById('queryInput').value.trim();
    const box = document.getElementById('resultBox');
    if (!sql) { box.innerHTML = '<p class="empty-box">Scrivi o scegli una query da eseguire.</p>'; return; }

    try {
        const result = run(sql);
        if (result.rows.length === 0) {
            box.innerHTML = '<p class="empty-box">La query è valida, ma nessuna riga soddisfa le condizioni.</p>';
            return;
        }
        const thead = `<thead><tr>${result.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${result.rows.map(r =>
            `<tr>${result.columns.map(c => `<td>${r[c]}</td>`).join('')}</tr>`
        ).join('')}</tbody>`;
        const rowWord = result.rows.length === 1 ? 'riga restituita' : 'righe restituite';
        box.innerHTML = `<table class="result-table">${thead}${tbody}</table>` +
            `<p class="result-meta">${result.rows.length} ${rowWord}.</p>`;
    } catch (e) {
        box.innerHTML = `<div class="error-box">✗ ${e.message}</div>`;
    }
}

document.getElementById('runBtn').addEventListener('click', runQuery);
document.getElementById('queryInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runQuery();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Come "pensa" questo motore quando esegue una query? ▸'
        : 'Come "pensa" questo motore quando esegue una query? ▾';
});

renderMiniTable('studentiTable', DATASET.studenti);
renderMiniTable('votiTable', DATASET.voti);
renderPresets();
document.getElementById('queryInput').value = PRESETS[0];
runQuery();
