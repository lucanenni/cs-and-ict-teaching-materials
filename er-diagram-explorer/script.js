// --- Scenari ER: entità, relazioni e le tabelle SQL che ne derivano --------
// Ogni scenario è costruito apposta con solo coppie di entità ADIACENTI nella
// riga (indici consecutivi): così le linee di collegamento restano dritte e
// non attraversano mai una terza entità di mezzo.

const SCENARIOS = {
    biblioteca: {
        label: 'Biblioteca',
        entities: [
            { id: 'editore', name: 'Editore', pk: 'id', attrs: ['id', 'nome', 'sede'] },
            { id: 'libro', name: 'Libro', pk: 'isbn', attrs: ['isbn', 'titolo', 'anno'] },
            { id: 'autore', name: 'Autore', pk: 'id', attrs: ['id', 'nome', 'nazionalità'] },
            { id: 'utente', name: 'Utente', pk: 'id', attrs: ['id', 'nome', 'email'] },
            { id: 'tessera', name: 'Tessera', pk: 'id', attrs: ['id', 'numero', 'scadenza'] }
        ],
        relationships: [
            { aIdx: 0, bIdx: 1, cardinality: '1:N', verb: 'pubblica', desc: 'Un editore pubblica molti libri, ma ogni libro ha un solo editore.' },
            { aIdx: 2, bIdx: 1, cardinality: 'N:M', verb: 'scrive', desc: 'Un autore può scrivere più libri, e un libro può avere più autori (una raccolta, un saggio a più mani...).', junctionName: 'Libro_Autore' },
            { aIdx: 3, bIdx: 4, cardinality: '1:1', verb: 'possiede', desc: 'Ogni utente della biblioteca possiede esattamente una tessera, e ogni tessera appartiene a un solo utente.' }
        ]
    },
    scuola: {
        label: 'Scuola',
        entities: [
            { id: 'aula', name: 'Aula', pk: 'id', attrs: ['id', 'numero', 'piano'] },
            { id: 'classe', name: 'Classe', pk: 'id', attrs: ['id', 'nome', 'anno_corso'] },
            { id: 'studente', name: 'Studente', pk: 'id', attrs: ['id', 'nome', 'data_nascita'] },
            { id: 'materia', name: 'Materia', pk: 'id', attrs: ['id', 'nome', 'ore_settimanali'] }
        ],
        relationships: [
            { aIdx: 0, bIdx: 1, cardinality: '1:1', verb: 'ospita', desc: 'In questo istituto ogni classe è assegnata a un\'aula fissa, e ogni aula ospita una sola classe.' },
            { aIdx: 1, bIdx: 2, cardinality: '1:N', verb: 'raggruppa', desc: 'Una classe raggruppa molti studenti, ma ogni studente appartiene a una sola classe.' },
            { aIdx: 2, bIdx: 3, cardinality: 'N:M', verb: 'segue', desc: 'Uno studente segue più materie, e una materia è seguita da molti studenti.', junctionName: 'Studente_Materia', extraAttrs: ['voto'] }
        ]
    },
    ecommerce: {
        label: 'E-commerce',
        entities: [
            { id: 'indirizzo', name: 'Indirizzo', pk: 'id', attrs: ['id', 'via', 'città'] },
            { id: 'cliente', name: 'Cliente', pk: 'id', attrs: ['id', 'nome', 'email'] },
            { id: 'ordine', name: 'Ordine', pk: 'id', attrs: ['id', 'data', 'totale'] },
            { id: 'prodotto', name: 'Prodotto', pk: 'id', attrs: ['id', 'nome', 'prezzo'] }
        ],
        relationships: [
            { aIdx: 0, bIdx: 1, cardinality: '1:1', verb: 'riceve', desc: 'In questo negozio ogni cliente ha un solo indirizzo di spedizione principale, usato da un solo cliente.' },
            { aIdx: 1, bIdx: 2, cardinality: '1:N', verb: 'effettua', desc: 'Un cliente effettua molti ordini nel tempo, ma ogni ordine appartiene a un solo cliente.' },
            { aIdx: 2, bIdx: 3, cardinality: 'N:M', verb: 'contiene', desc: 'Un ordine può contenere più prodotti, e uno stesso prodotto può comparire in molti ordini diversi.', junctionName: 'RigaOrdine', extraAttrs: ['quantità', 'prezzo_unitario'] }
        ]
    }
};

const BOX_WIDTH = 180;
const GAP = 60;
const STEP = BOX_WIDTH + GAP;

function fkColumnName(entity) {
    return `${entity.id}_${entity.pk}`;
}

function buildSqlForRelationship(scenario, rel) {
    const a = scenario.entities[rel.aIdx];
    const b = scenario.entities[rel.bIdx];

    if (rel.cardinality === '1:1') {
        const fk = fkColumnName(a);
        return `${b.name} (\n  ${b.attrs.map(c => c === b.pk ? c + '  -- PK' : c).join(',\n  ')},\n  ${fk}  -- FK → ${a.name}.${a.pk} (UNIQUE)\n)\n\n${a.name} resta invariata.`;
    }
    if (rel.cardinality === '1:N') {
        const fk = fkColumnName(a);
        return `${b.name} (\n  ${b.attrs.map(c => c === b.pk ? c + '  -- PK' : c).join(',\n  ')},\n  ${fk}  -- FK → ${a.name}.${a.pk}\n)\n\n${a.name} resta invariata.`;
    }
    // N:M
    const fkA = fkColumnName(a);
    const fkB = fkColumnName(b);
    const extra = rel.extraAttrs ? ',\n  ' + rel.extraAttrs.join(',\n  ') : '';
    return `${rel.junctionName} (\n  ${fkA}  -- FK → ${a.name}.${a.pk},\n  ${fkB}  -- FK → ${b.name}.${b.pk}${extra},\n  PRIMARY KEY (${fkA}, ${fkB})\n)\n\n${a.name} e ${b.name} restano invariate.`;
}

let state = {
    scenarioKey: 'biblioteca',
    selectedRel: null
};

function renderScenarioChips() {
    const wrap = document.getElementById('scenarioChips');
    wrap.innerHTML = '';
    Object.keys(SCENARIOS).forEach(key => {
        const chip = document.createElement('button');
        chip.className = 'chip' + (key === state.scenarioKey ? ' active' : '');
        chip.textContent = SCENARIOS[key].label;
        chip.addEventListener('click', () => {
            state.scenarioKey = key;
            state.selectedRel = null;
            renderScenarioChips();
            renderDiagram();
            renderDetail();
        });
        wrap.appendChild(chip);
    });
}

function renderDiagram() {
    const scenario = SCENARIOS[state.scenarioKey];
    const row = document.getElementById('entitiesRow');
    row.innerHTML = '';
    scenario.entities.forEach((entity, idx) => {
        const box = document.createElement('div');
        box.className = 'entity-box';
        box.id = 'entity-' + idx;
        box.innerHTML = `<div class="entity-title">${entity.name}</div><ul class="entity-attrs">${entity.attrs.map(a => `<li class="${a === entity.pk ? 'pk' : ''}">${a}${a === entity.pk ? ' (PK)' : ''}</li>`).join('')}</ul>`;
        row.appendChild(box);
    });

    const totalWidth = scenario.entities.length * STEP - GAP;
    const boxHeight = row.querySelector('.entity-box').offsetHeight;

    const svg = document.getElementById('linesLayer');
    svg.setAttribute('width', totalWidth);
    svg.setAttribute('height', boxHeight);
    svg.innerHTML = '';

    const badgesLayer = document.getElementById('badgesLayer');
    badgesLayer.innerHTML = '';
    badgesLayer.style.width = totalWidth + 'px';
    badgesLayer.style.height = boxHeight + 'px';

    const centerY = boxHeight / 2;
    const centerX = i => i * STEP + BOX_WIDTH / 2;

    scenario.relationships.forEach((rel, relIdx) => {
        const x1 = centerX(rel.aIdx);
        const x2 = centerX(rel.bIdx);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', centerY);
        line.id = 'line-' + relIdx;
        svg.appendChild(line);

        const badge = document.createElement('button');
        badge.className = 'rel-badge';
        badge.id = 'badge-' + relIdx;
        badge.style.left = ((x1 + x2) / 2) + 'px';
        badge.style.top = centerY + 'px';
        badge.textContent = rel.cardinality;
        badge.addEventListener('click', () => {
            state.selectedRel = relIdx;
            renderDiagram();
            renderDetail();
        });
        badgesLayer.appendChild(badge);
    });

    document.querySelectorAll('.entity-box').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.lines-layer line').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.rel-badge').forEach(b => b.classList.remove('active'));

    if (state.selectedRel !== null) {
        const rel = scenario.relationships[state.selectedRel];
        document.getElementById('entity-' + rel.aIdx).classList.add('active');
        document.getElementById('entity-' + rel.bIdx).classList.add('active');
        document.getElementById('line-' + state.selectedRel).classList.add('active');
        document.getElementById('badge-' + state.selectedRel).classList.add('active');
    }
}

function renderDetail() {
    const panel = document.getElementById('detailPanel');
    if (state.selectedRel === null) {
        panel.innerHTML = '<p class="hint-text">Clicca su una delle etichette di cardinalità (1:1, 1:N, N:M) sopra per vedere la spiegazione e le tabelle risultanti.</p>';
        return;
    }
    const scenario = SCENARIOS[state.scenarioKey];
    const rel = scenario.relationships[state.selectedRel];
    const a = scenario.entities[rel.aIdx];
    const b = scenario.entities[rel.bIdx];
    const sql = buildSqlForRelationship(scenario, rel);

    panel.innerHTML = `
        <div class="detail-title">${a.name} — ${rel.cardinality} — ${b.name}</div>
        <p class="detail-desc">${rel.desc}</p>
        <div class="sql-block">${sql}</div>
    `;
}

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché una relazione N:M non si può fare con una sola FK? ▸'
        : 'Perché una relazione N:M non si può fare con una sola FK? ▾';
});

renderScenarioChips();
renderDiagram();
renderDetail();
