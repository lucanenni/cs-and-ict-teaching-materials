// --- Modello di costo semplificato di un pianificatore di query -----------
const TOTAL_ROWS = 1000;
const COST_PER_ROW_SEQ = 1;       // lettura in blocco, economica per riga
const INDEX_TRAVERSAL_COST = 3;   // attraversare l'albero dell'indice (fisso)
const COST_PER_ROW_RANDOM = 4;    // un accesso "sparso" alla tabella per ogni riga trovata

function seqScanCost() {
    return TOTAL_ROWS * COST_PER_ROW_SEQ;
}

function indexScanCost(matchingRows) {
    return INDEX_TRAVERSAL_COST + matchingRows * COST_PER_ROW_RANDOM;
}

const PRESETS = [
    { rows: 1, label: 'Chiave univoca (1 riga)' },
    { rows: 10, label: 'Filtro molto raro (10 righe)' },
    { rows: 300, label: 'Filtro comune (300 righe)' },
    { rows: 800, label: 'Quasi tutta la tabella (800 righe)' }
];

function renderChips() {
    const wrap = document.getElementById('presetChips');
    wrap.innerHTML = '';
    PRESETS.forEach(p => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = p.label;
        chip.addEventListener('click', () => {
            document.getElementById('selectivitySlider').value = p.rows;
            render();
        });
        wrap.appendChild(chip);
    });
}

function render() {
    const matchingRows = parseInt(document.getElementById('selectivitySlider').value, 10);
    document.getElementById('selectivityValue').textContent = matchingRows;

    const seqCost = seqScanCost();
    const idxCost = indexScanCost(matchingRows);
    const maxCost = Math.max(seqCost, idxCost);

    document.getElementById('seqExplain').textContent =
        `Seq Scan on tabella  (cost=0..${seqCost})\n  Filter: colonna = valore\n  righe lette: ${TOTAL_ROWS} (tutte)`;
    document.getElementById('idxExplain').textContent =
        `Index Scan using idx_colonna on tabella  (cost=0..${idxCost})\n  Index Cond: colonna = valore\n  righe trovate: ${matchingRows}`;

    document.getElementById('seqCostFill').style.width = (seqCost / maxCost * 100) + '%';
    document.getElementById('idxCostFill').style.width = (idxCost / maxCost * 100) + '%';
    document.getElementById('seqCostLabel').textContent = `costo stimato: ${seqCost}`;
    document.getElementById('idxCostLabel').textContent = `costo stimato: ${idxCost}`;

    const seqWins = seqCost <= idxCost;
    document.getElementById('seqPlanCard').classList.toggle('winner', seqWins);
    document.getElementById('idxPlanCard').classList.toggle('winner', !seqWins);

    const rowWord = matchingRows === 1 ? 'riga' : 'righe';
    const verdict = document.getElementById('verdictBox');
    verdict.textContent = seqWins
        ? `Il pianificatore userebbe Seq Scan: con ${matchingRows} ${rowWord} su ${TOTAL_ROWS}, leggere tutto in blocco costa meno che saltare qua e là nell'indice.`
        : `Il pianificatore userebbe Index Scan: con solo ${matchingRows} ${rowWord} su ${TOTAL_ROWS}, l'indice evita di leggere tutto il resto della tabella.`;
}

document.getElementById('selectivitySlider').addEventListener('input', render);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Il database controlla ogni volta quante righe corrispondono? ▸'
        : 'Il database controlla ogni volta quante righe corrispondono? ▾';
});

renderChips();
render();
