// Costruisce una matrice n×n di pesi di attenzione (ogni riga somma a 1).
// `overrides` permette di specificare a mano, per alcuni indici di parola,
// pesi "grezzi" verso altre parole (vengono normalizzati automaticamente).
// Le parole senza override ricevono una distribuzione di default plausibile
// (soprattutto su se stesse e sulle parole immediatamente vicine).
function buildAttention(n, overrides) {
    const matrix = [];
    for (let i = 0; i < n; i++) {
        const row = new Array(n).fill(0);
        if (overrides[i]) {
            let sum = 0;
            Object.values(overrides[i]).forEach(w => sum += w);
            Object.entries(overrides[i]).forEach(([j, w]) => {
                row[Number(j)] = w / sum;
            });
        } else {
            row.fill(0.015);
            row[i] = 0.4;
            if (i > 0) row[i - 1] += 0.2;
            if (i < n - 1) row[i + 1] += 0.2;
            const sum = row.reduce((a, b) => a + b, 0);
            for (let k = 0; k < n; k++) row[k] /= sum;
        }
        matrix.push(row);
    }
    return matrix;
}

const examples = [
    {
        hint: 'Prova a cliccare su "era": guarda a cosa presta più attenzione. Poi prova su "gatto".',
        tokens: ["Il", "gatto", "si", "è", "seduto", "sul", "tappeto", "perché", "era", "morbido", "."],
        note: 'Nota come "era" presti più attenzione a "tappeto" che a "gatto": il modello ha capito che è il tappeto ad essere morbido, non il gatto.',
        overrides: {
            2: { 1: 8, 2: 2 }, // "si" -> "gatto" (concordanza riflessiva)
            8: { 6: 7, 9: 2, 1: 1 }, // "era" -> soprattutto "tappeto"
            9: { 6: 6, 8: 3, 1: 1 } // "morbido" -> "tappeto"
        }
    },
    {
        hint: 'Prova a cliccare su "intelligenti" o su "difficile": guarda a quale sostantivo si "aggancia" l\'aggettivo.',
        tokens: ["Le", "ragazze", "intelligenti", "hanno", "risolto", "velocemente", "il", "problema", "difficile", "."],
        note: 'Aggettivi e articoli prestano attenzione al sostantivo a cui si riferiscono per concordare in genere e numero, anche quando non sono adiacenti.',
        overrides: {
            0: { 1: 9, 0: 1 }, // "Le" -> "ragazze"
            2: { 1: 8, 2: 2 }, // "intelligenti" -> "ragazze"
            6: { 7: 9, 6: 1 }, // "il" -> "problema"
            8: { 7: 8, 8: 2 } // "difficile" -> "problema"
        }
    },
    {
        hint: 'Prova a cliccare su "vinto": è lontano da "scienziato", ma guarda comunque a lui per capire chi ha vinto.',
        tokens: ["Lo", "scienziato", "che", "ha", "scoperto", "quella", "proteina", "ha", "vinto", "un", "premio", "importante", "."],
        note: 'Nonostante "vinto" sia lontano da "scienziato" nella frase, l\'attenzione collega direttamente il verbo al suo soggetto, superando il semplice limite di vicinanza.',
        overrides: {
            2: { 1: 9, 2: 1 }, // "che" -> "scienziato" (pronome relativo)
            8: { 1: 7, 7: 2, 10: 1 }, // "vinto" -> soprattutto "scienziato"
            11: { 10: 8, 11: 2 } // "importante" -> "premio"
        }
    }
];

examples.forEach(ex => {
    ex.attention = buildAttention(ex.tokens.length, ex.overrides);
});

let state = {
    selectedExample: 0,
    selectedToken: null
};

function render() {
    const example = examples[state.selectedExample];

    document.getElementById('hintText').textContent = example.hint;

    const tokensRow = document.getElementById('tokensRow');
    tokensRow.innerHTML = '';

    example.tokens.forEach((token, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'token-chip';
        btn.textContent = token;

        if (state.selectedToken !== null) {
            if (idx === state.selectedToken) {
                btn.classList.add('selected');
            } else {
                const weight = example.attention[state.selectedToken][idx];
                btn.style.backgroundColor = `rgba(217, 119, 6, ${Math.min(weight * 1.8, 0.9)})`;
                if (weight > 0.35) {
                    btn.style.color = 'white';
                }
            }
        }

        btn.addEventListener('click', () => {
            state.selectedToken = idx;
            render();
        });

        tokensRow.appendChild(btn);
    });

    renderWeightsPanel(example);
}

function renderWeightsPanel(example) {
    const panel = document.getElementById('weightsPanel');

    if (state.selectedToken === null) {
        panel.innerHTML = '<p class="weights-placeholder">👆 Clicca su una parola della frase qui sopra per vedere la sua distribuzione di attenzione.</p>';
        return;
    }

    const word = example.tokens[state.selectedToken];
    const weights = example.attention[state.selectedToken]
        .map((w, idx) => ({ word: example.tokens[idx], idx, w }))
        .filter(entry => entry.w > 0.03)
        .sort((a, b) => b.w - a.w);

    let html = `<div class="weights-title">Distribuzione dell'attenzione da "${word}":</div>`;
    weights.forEach(entry => {
        const pct = Math.round(entry.w * 100);
        const label = entry.idx === state.selectedToken ? `${entry.word} (se stessa)` : entry.word;
        html += `
            <div class="weight-row">
                <span class="weight-word">${label}</span>
                <div class="weight-bar-container">
                    <div class="weight-bar" style="width: ${pct}%"></div>
                </div>
                <span class="weight-value">${pct}%</span>
            </div>
        `;
    });
    html += `<p style="margin-top: 0.75rem; font-size: 0.85rem; color: #78350f;">${example.note}</p>`;

    panel.innerHTML = html;
}

document.getElementById('exampleSelect').addEventListener('change', (e) => {
    state.selectedExample = parseInt(e.target.value);
    state.selectedToken = null;
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Come si calcolano davvero questi pesi? ▸'
        : 'Come si calcolano davvero questi pesi? ▾';
});

render();
