const FILES = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'];

// Schema di modifiche deterministico (non casuale), per poter verificare a
// mano i numeri: giorno 1 = stato iniziale, i giorni 2-7 elencano quali file
// sono stati modificati quel giorno rispetto al giorno precedente.
const CHANGES_BY_DAY = {
    1: [],
    2: ['F1', 'F3'],
    3: ['F2'],
    4: ['F1', 'F4', 'F5'],
    5: ['F3'],
    6: ['F2', 'F6'],
    7: ['F1']
};

function computeStrategies() {
    const full = {};
    const incremental = {};
    const differential = {};
    let sinceLastFullSet = new Set();

    for (let day = 1; day <= 7; day++) {
        full[day] = [...FILES];

        if (day === 1) {
            incremental[day] = [...FILES];
        } else {
            incremental[day] = [...CHANGES_BY_DAY[day]];
        }

        if (day === 1) {
            differential[day] = [...FILES];
            sinceLastFullSet = new Set();
        } else {
            CHANGES_BY_DAY[day].forEach(f => sinceLastFullSet.add(f));
            differential[day] = [...sinceLastFullSet];
        }
    }
    return { full, incremental, differential };
}

const STRATEGIES = computeStrategies();

function restoreCost(strategyName, day) {
    if (strategyName === 'full') return { sets: 1, files: STRATEGIES.full[day].length };
    if (strategyName === 'differential') {
        if (day === 1) return { sets: 1, files: STRATEGIES.differential[1].length };
        return { sets: 2, files: STRATEGIES.differential[1].length + STRATEGIES.differential[day].length };
    }
    // incremental: serve l'intera catena dal giorno 1 al giorno corrente
    let files = 0;
    for (let d = 1; d <= day; d++) files += STRATEGIES.incremental[d].length;
    return { sets: day, files };
}

function renderFiles(day) {
    const changedToday = new Set(day === 1 ? FILES : CHANGES_BY_DAY[day]);
    const row = document.getElementById('filesRow');
    row.innerHTML = FILES.map(f => `
        <div class="file-chip ${changedToday.has(f) ? 'changed-today' : ''}">
            <span class="file-icon">${changedToday.has(f) ? '✏️' : '📄'}</span>
            ${f}
        </div>
    `).join('');
}

function renderTable(day) {
    const rows = [
        ['Completo', STRATEGIES.full],
        ['Incrementale', STRATEGIES.incremental],
        ['Differenziale', STRATEGIES.differential]
    ];
    let html = '<tr><th>Strategia</th>' + [1, 2, 3, 4, 5, 6, 7].map(d => `<th${d === day ? ' class="today-col"' : ''}>Giorno ${d}</th>`).join('') + '<th>Ripristino a oggi</th></tr>';
    rows.forEach(([label, data]) => {
        const key = label === 'Completo' ? 'full' : label === 'Incrementale' ? 'incremental' : 'differential';
        const cost = restoreCost(key, day);
        html += `<tr><td>${label}</td>`;
        [1, 2, 3, 4, 5, 6, 7].forEach(d => {
            html += `<td${d === day ? ' class="today-col"' : ''}>${data[d].length} file</td>`;
        });
        html += `<td>${cost.sets} backup, ${cost.files} file da leggere</td></tr>`;
    });
    document.getElementById('strategyTable').innerHTML = html;
}

function sumSizes(data) {
    return [1, 2, 3, 4, 5, 6, 7].reduce((sum, d) => sum + data[d].length, 0);
}

function renderTotals() {
    const totals = [
        ['Completo', sumSizes(STRATEGIES.full), '#16a34a'],
        ['Incrementale', sumSizes(STRATEGIES.incremental), '#0891b2'],
        ['Differenziale', sumSizes(STRATEGIES.differential), '#9333ea']
    ];
    const row = document.getElementById('totalsRow');
    row.innerHTML = totals.map(([label, total]) => `
        <div class="totals-box">
            <div class="totals-title">${label}</div>
            <p>${total} "file" copiati in totale nella settimana (su 7 giorni × 6 file = 42 possibili).</p>
        </div>
    `).join('');
}

function render() {
    const day = parseInt(document.getElementById('daySlider').value, 10);
    document.getElementById('dayValue').textContent = 'Giorno ' + day;
    renderFiles(day);
    renderTable(day);
    renderTotals();
}

document.getElementById('daySlider').addEventListener('input', render);

// --- Regola del 3-2-1 -----------------------------------------------------

const MEDIA_TYPES = ['Disco esterno', 'Cloud', 'NAS', 'Chiavetta USB', 'Nastro (tape)'];

function renderMediaChecks() {
    const box = document.getElementById('mediaChecks');
    box.innerHTML = MEDIA_TYPES.map((m, i) => `
        <label class="media-chip"><input type="checkbox" data-media="${i}"> ${m}</label>
    `).join('');
    box.querySelectorAll('input').forEach(inp => inp.addEventListener('change', renderVerdict));
}

function renderVerdict() {
    const copies = parseInt(document.getElementById('copiesInput').value, 10) || 0;
    const mediaCount = document.querySelectorAll('#mediaChecks input:checked').length;
    const offsite = document.getElementById('offsiteCheck').checked;

    const missing = [];
    if (copies < 3) missing.push(`servono almeno 3 copie (ne hai indicate ${copies})`);
    if (mediaCount < 2) missing.push(`servono almeno 2 tipi di supporto diversi (ne hai selezionati ${mediaCount})`);
    if (!offsite) missing.push('serve almeno una copia conservata fuori sede');

    const verdict = document.getElementById('ruleVerdict');
    if (missing.length === 0) {
        verdict.className = 'rule-verdict pass';
        verdict.textContent = '✓ La tua configurazione soddisfa la regola del 3-2-1.';
    } else {
        verdict.className = 'rule-verdict fail';
        verdict.textContent = '⚠ Non ancora: ' + missing.join('; ') + '.';
    }
}

document.getElementById('copiesInput').addEventListener('input', renderVerdict);
document.getElementById('offsiteCheck').addEventListener('change', renderVerdict);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non fare sempre e solo backup completi? ▸'
        : 'Perché non fare sempre e solo backup completi? ▾';
});

// Inizializzazione
renderMediaChecks();
renderVerdict();
render();
