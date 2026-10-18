// --- CRC e checksum: rilevare un errore con due tecniche diverse ---------
//
// Polinomio CRC-8 usato: x^8 + x^2 + x + 1  ->  1 0000 0111 (9 bit, grado 8).
// Checksum semplice usato: XOR di tutti i byte del messaggio.

const CRC8_POLY = '100000111';
const DEFAULT_BYTES = [0x43, 0x53]; // "C", "S"

function bytesToBitString(bytes) {
    return bytes.map(b => b.toString(2).padStart(8, '0')).join('');
}

function bitStringToBytes(bits) {
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return bytes;
}

function xorChecksum(bytes) {
    return bytes.reduce((acc, b) => acc ^ b, 0);
}

function flipBit(bits, index) {
    const arr = bits.split('');
    arr[index] = arr[index] === '1' ? '0' : '1';
    return arr.join('');
}

// Divisione binaria modulo-2 passo-passo: si scorre il messaggio (con gli
// zeri di padding annessi) e ogni volta che il bit alla posizione corrente è
// 1 si fa lo XOR con il polinomio.
function crc8Divide(messageBits) {
    const degree = CRC8_POLY.length - 1; // 8
    const work = (messageBits + '0'.repeat(degree)).split('').map(Number);
    const polyBits = CRC8_POLY.split('').map(Number);
    const steps = [];
    for (let i = 0; i + polyBits.length <= work.length; i++) {
        if (work[i] === 1) {
            for (let j = 0; j < polyBits.length; j++) {
                work[i + j] = work[i + j] ^ polyBits[j];
            }
            steps.push({ position: i, bit: 1, window: work.slice(i, i + polyBits.length).join('') });
        } else {
            steps.push({ position: i, bit: 0, window: work.slice(i, i + polyBits.length).join('') });
        }
    }
    const remainder = work.slice(work.length - degree).join('');
    return { remainder, steps };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CRC8_POLY, DEFAULT_BYTES, bytesToBitString, bitStringToBytes, xorChecksum, flipBit, crc8Divide };
}

if (typeof document !== 'undefined') {

    const transmittedBits = bytesToBitString(DEFAULT_BYTES);
    const transmittedChecksum = xorChecksum(DEFAULT_BYTES);
    const transmittedCrc = crc8Divide(transmittedBits).remainder;

    let receivedBits = transmittedBits;

    function renderBitsRow(containerId, bits, clickable) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        for (let byteIdx = 0; byteIdx < bits.length / 8; byteIdx++) {
            const group = document.createElement('div');
            group.className = 'byte-group';
            for (let i = 0; i < 8; i++) {
                const idx = byteIdx * 8 + i;
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'bit-cell' + (clickable ? ' clickable' : '');
                cell.textContent = bits[idx];
                if (bits[idx] !== transmittedBits[idx]) cell.classList.add('flipped');
                if (clickable) {
                    cell.addEventListener('click', () => {
                        receivedBits = flipBit(receivedBits, idx);
                        updateReceived();
                    });
                }
                group.appendChild(cell);
            }
            container.appendChild(group);
        }
    }

    function fmtBinHex(value, bits) {
        const binStr = value.toString(2).padStart(bits, '0');
        return `0b${binStr} (0x${value.toString(16).toUpperCase()})`;
    }

    function renderTransmitted() {
        renderBitsRow('transmittedBits', transmittedBits, false);
        document.getElementById('transmittedAscii').textContent =
            'Byte: ' + DEFAULT_BYTES.map(b => `0x${b.toString(16).toUpperCase()} ('${String.fromCharCode(b)}')`).join(', ');
        document.getElementById('transmittedChecksum').textContent = fmtBinHex(transmittedChecksum, 8);
        document.getElementById('transmittedCrc').textContent = fmtBinHex(parseInt(transmittedCrc, 2), 8);
    }

    let crcRunner;

    function updateReceived() {
        renderBitsRow('receivedBits', receivedBits, true);
        const receivedBytes = bitStringToBytes(receivedBits);
        const receivedChecksum = xorChecksum(receivedBytes);
        const receivedCrc = crc8Divide(receivedBits).remainder;

        document.getElementById('receivedChecksum').textContent = fmtBinHex(receivedChecksum, 8);
        document.getElementById('receivedCrc').textContent = fmtBinHex(parseInt(receivedCrc, 2), 8);

        const checksumMatch = receivedChecksum === transmittedChecksum;
        const crcMatch = receivedCrc === transmittedCrc;

        const checksumBox = document.getElementById('checksumVerify');
        checksumBox.innerHTML = `<strong>Verifica checksum</strong><br>Trasmesso: ${fmtBinHex(transmittedChecksum, 8)}<br>Ricevuto: ${fmtBinHex(receivedChecksum, 8)}<br>${checksumMatch ? '<span class="match">✓ coincidono: il checksum non rileva nessun errore</span>' : '<span class="mismatch">✗ diversi: il checksum rileva un errore</span>'}`;
        checksumBox.className = 'verify-box result-box ' + (checksumMatch ? 'good' : 'bad');

        const crcBox = document.getElementById('crcVerify');
        crcBox.innerHTML = `<strong>Verifica CRC</strong><br>Trasmesso: ${fmtBinHex(parseInt(transmittedCrc, 2), 8)}<br>Ricevuto: ${fmtBinHex(parseInt(receivedCrc, 2), 8)}<br>${crcMatch ? '<span class="match">✓ coincidono: il CRC non rileva nessun errore</span>' : '<span class="mismatch">✗ diversi: il CRC rileva un errore</span>'}`;
        crcBox.className = 'verify-box result-box ' + (crcMatch ? 'good' : 'bad');

        if (crcRunner) crcRunner.rebuild();
    }

    function makeCrcRunner() {
        let steps = [];
        let current = -1;
        let interval = null;

        function render() {
            const panel = document.getElementById('crcStepPanel');
            panel.innerHTML = steps.slice(0, current + 1).map((s, i) => {
                const action = s.bit === 1 ? 'bit = 1 → XOR con il polinomio' : 'bit = 0 → nessuno XOR, si scende di una posizione';
                return `<div class="step-line ${i === current ? 'current' : ''}">Posizione ${s.position}: ${action} — finestra: <code>${s.window}</code></div>`;
            }).join('');
            panel.scrollTop = panel.scrollHeight;
            document.getElementById('crcStepBtn').disabled = steps.length === 0 || current >= steps.length - 1;
        }

        function stopAuto() {
            if (interval) clearInterval(interval);
            interval = null;
        }

        function advance() {
            if (current >= steps.length - 1) { stopAuto(); return; }
            current++;
            render();
            if (current >= steps.length - 1) stopAuto();
        }

        function rebuild() {
            stopAuto();
            steps = crc8Divide(receivedBits).steps;
            current = -1;
            render();
        }

        rebuild(); // render iniziale: "Passo singolo" deve funzionare da subito

        document.getElementById('crcRunBtn').addEventListener('click', () => {
            stopAuto();
            current = -1;
            render();
            interval = setInterval(advance, 500);
        });
        document.getElementById('crcStepBtn').addEventListener('click', () => {
            stopAuto();
            advance();
        });
        document.getElementById('crcResetBtn').addEventListener('click', () => {
            stopAuto();
            current = -1;
            render();
        });

        return { rebuild };
    }

    renderTransmitted();
    crcRunner = makeCrcRunner();
    updateReceived();

    document.getElementById('singleErrorBtn').addEventListener('click', () => {
        receivedBits = flipBit(transmittedBits, 5);
        updateReceived();
    });

    document.getElementById('doubleErrorBtn').addEventListener('click', () => {
        // Flip dello stesso bit (indice 0, il più significativo di ciascun
        // byte) in entrambi i byte: si annulla sempre nello XOR checksum,
        // ma viene rilevato dal CRC (verificato con un test Node).
        receivedBits = flipBit(flipBit(transmittedBits, 0), 8);
        updateReceived();
    });

    document.getElementById('resetMessageBtn').addEventListener('click', () => {
        receivedBits = transmittedBits;
        updateReceived();
    });

    document.getElementById('deepDiveBtn').addEventListener('click', () => {
        const panel = document.getElementById('deepDivePanel');
        const isHidden = panel.classList.toggle('hidden');
        const btn = document.getElementById('deepDiveBtn');
        btn.setAttribute('aria-expanded', String(!isHidden));
        btn.textContent = isHidden
            ? 'Esistono codici che permettono anche di correggere l\'errore? ▸'
            : 'Esistono codici che permettono anche di correggere l\'errore? ▾';
    });
}
