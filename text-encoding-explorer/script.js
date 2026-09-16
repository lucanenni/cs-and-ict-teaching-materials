const encoder = new TextEncoder();

function toBinary8(byte) {
    return byte.toString(2).padStart(8, '0');
}

function analyzeText(text) {
    // [...text] itera per code point Unicode, non per unità UTF-16: gestisce
    // correttamente anche gli emoji rappresentati da coppie surrogate.
    return [...text].map(ch => {
        const codePoint = ch.codePointAt(0);
        const bytes = Array.from(encoder.encode(ch));
        return { ch, codePoint, bytes };
    });
}

function formatCodePoint(cp) {
    return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
}

function render() {
    const text = document.getElementById('textInput').value;
    const chars = analyzeText(text);

    const box = document.getElementById('charsBox');
    box.innerHTML = '';
    chars.forEach(({ ch, codePoint, bytes }) => {
        const card = document.createElement('div');
        card.className = 'char-card';

        const display = document.createElement('div');
        display.className = 'char-display';
        display.textContent = ch === ' ' ? '␣' : ch;
        card.appendChild(display);

        const cp = document.createElement('div');
        cp.className = 'char-codepoint';
        cp.textContent = formatCodePoint(codePoint);
        card.appendChild(cp);

        const bytesRow = document.createElement('div');
        bytesRow.className = 'char-bytes';
        bytes.forEach(byte => {
            const chip = document.createElement('div');
            chip.className = 'byte-chip';
            chip.innerHTML = `${byte.toString(16).toUpperCase().padStart(2, '0')}<span class="byte-bin">${toBinary8(byte)}</span>`;
            bytesRow.appendChild(chip);
        });
        card.appendChild(bytesRow);

        box.appendChild(card);
    });

    const totalBytes = chars.reduce((sum, c) => sum + c.bytes.length, 0);
    const panel = document.getElementById('totalsPanel');
    let html = `Caratteri: ${chars.length} · Byte totali (UTF-8): ${totalBytes}`;
    if (totalBytes > chars.length) {
        html += `<span class="totals-note">Nota: alcuni caratteri occupano più di un byte — per questo il totale è più alto del numero di caratteri.</span>`;
    }
    panel.innerHTML = html;
}

document.getElementById('textInput').addEventListener('input', render);

document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.getElementById('textInput').value = chip.dataset.text;
        render();
    });
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non usare sempre 4 byte per ogni carattere? ▸'
        : 'Perché non usare sempre 4 byte per ogni carattere? ▾';
});

render();
