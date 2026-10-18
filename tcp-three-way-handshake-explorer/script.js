// --- Handshake TCP a 3 vie (apertura) + chiusura a 4 vie (approfondimento) -
//
// Numeri di sequenza iniziali: generati con una funzione pseudo-casuale ma
// deterministica (stesso seed -> stesso risultato), per avere una pagina
// riproducibile nei test, pur sembrando "scelti a caso" come nella realtà.

function pseudoRandomSeq(seed) {
    let h = seed >>> 0;
    h = (h * 9301 + 49297) % 233280;
    return 1000 + Math.floor((h / 233280) * 9000);
}

function buildHandshakeSteps(x, y) {
    return [
        {
            dir: 'fwd', label: `SYN  seq=${x}`,
            clientState: 'SYN_SENT', serverState: 'LISTEN',
            text: `Il client invia un segmento <strong>SYN</strong> con il proprio numero di sequenza iniziale <code>x = ${x}</code>. Passa allo stato <strong>SYN_SENT</strong>: ha aperto la connessione ma non ha ancora conferma dal server.`
        },
        {
            dir: 'rev', label: `SYN-ACK  seq=${y} ack=${x + 1}`,
            clientState: 'SYN_SENT', serverState: 'SYN_RECEIVED',
            text: `Il server risponde con <strong>SYN-ACK</strong>: propone il proprio numero di sequenza iniziale <code>y = ${y}</code> e conferma di aver visto x (<code>ack = ${x}+1 = ${x + 1}</code>). Passa a <strong>SYN_RECEIVED</strong>.`
        },
        {
            dir: 'fwd', label: `ACK  ack=${y + 1}`,
            clientState: 'ESTABLISHED', serverState: 'ESTABLISHED',
            text: `Il client conferma di aver visto y (<code>ack = ${y}+1 = ${y + 1}</code>). Entrambi i lati passano a <strong>ESTABLISHED</strong>: i dati possono iniziare a fluire in entrambe le direzioni.`
        }
    ];
}

function buildClosingSteps(x, y) {
    const clientFinSeq = x + 1;
    const serverAckForFin = clientFinSeq + 1;
    const serverFinSeq = y + 1;
    const clientAckForFin = serverFinSeq + 1;
    return [
        {
            dir: 'fwd', label: `FIN  seq=${clientFinSeq}`,
            clientState: 'FIN_WAIT_1', serverState: 'ESTABLISHED',
            text: `Il client non ha più dati da inviare: manda un <strong>FIN</strong> con <code>seq=${clientFinSeq}</code> e passa a <strong>FIN_WAIT_1</strong>.`
        },
        {
            dir: 'rev', label: `ACK  ack=${serverAckForFin}`,
            clientState: 'FIN_WAIT_2', serverState: 'CLOSE_WAIT',
            text: `Il server conferma il FIN (<code>ack=${serverAckForFin}</code>) e passa a <strong>CLOSE_WAIT</strong>: può ancora finire di inviare i propri dati. Il client, ricevuta la conferma, passa a <strong>FIN_WAIT_2</strong>.`
        },
        {
            dir: 'rev', label: `FIN  seq=${serverFinSeq}`,
            clientState: 'FIN_WAIT_2', serverState: 'LAST_ACK',
            text: `Anche il server non ha più nulla da inviare: manda il proprio <strong>FIN</strong> (<code>seq=${serverFinSeq}</code>) e passa a <strong>LAST_ACK</strong>.`
        },
        {
            dir: 'fwd', label: `ACK  ack=${clientAckForFin}`,
            clientState: 'CLOSED', serverState: 'CLOSED',
            text: `Il client conferma anche il FIN del server (<code>ack=${clientAckForFin}</code>). Entrambi i lati chiudono la connessione (nella realtà il client attenderebbe ancora un po' in <strong>TIME_WAIT</strong> per sicurezza, qui semplificato).`
        }
    ];
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pseudoRandomSeq, buildHandshakeSteps, buildClosingSteps };
}

if (typeof document !== 'undefined') {

    const X = pseudoRandomSeq(7);
    const Y = pseudoRandomSeq(13);

    const HANDSHAKE_STEPS = buildHandshakeSteps(X, Y);
    const CLOSING_STEPS = buildClosingSteps(X, Y);

    function makeRunner(opts) {
        const { steps, messagesId, clientStateId, clientBoxId, serverStateId, serverBoxId,
            statusId, runBtnId, stepBtnId, resetBtnId, initialClient, initialServer,
            finalStatusText, speed } = opts;
        let current = -1;
        let interval = null;

        function renderHosts() {
            const step = current >= 0 ? steps[current] : null;
            const clientState = step ? step.clientState : initialClient;
            const serverState = step ? step.serverState : initialServer;
            document.getElementById(clientStateId).textContent = clientState;
            document.getElementById(serverStateId).textContent = serverState;

            const clientBox = document.getElementById(clientBoxId);
            const serverBox = document.getElementById(serverBoxId);
            const isDone = (s) => s === 'ESTABLISHED' || s === 'CLOSED';
            clientBox.classList.toggle('active', !!step && !isDone(clientState));
            clientBox.classList.toggle('done', isDone(clientState));
            serverBox.classList.toggle('active', !!step && !isDone(serverState));
            serverBox.classList.toggle('done', isDone(serverState));
        }

        function renderMessages() {
            const container = document.getElementById(messagesId);
            container.innerHTML = '';
            for (let i = 0; i <= current; i++) {
                const step = steps[i];
                const row = document.createElement('div');
                row.className = 'msg-row' + (step.dir === 'rev' ? ' reverse' : '');

                const track = document.createElement('div');
                track.className = 'msg-arrow-track';
                const line = document.createElement('div');
                line.className = 'msg-arrow-line' + (step.dir === 'rev' ? ' reverse' : '');
                const label = document.createElement('div');
                label.className = 'msg-label';
                label.textContent = step.label;
                track.appendChild(line);
                track.appendChild(label);
                row.appendChild(track);
                container.appendChild(row);

                const desc = document.createElement('div');
                desc.className = 'msg-desc';
                desc.innerHTML = step.text;
                container.appendChild(desc);
            }
        }

        function render() {
            renderHosts();
            renderMessages();
            document.getElementById(stepBtnId).disabled = current >= steps.length - 1;
            document.getElementById(statusId).textContent =
                current >= steps.length - 1 ? finalStatusText : '';
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

        // Render iniziale: il passo singolo deve funzionare da subito, senza
        // dover prima cliccare "Avvia".
        render();

        document.getElementById(runBtnId).addEventListener('click', () => {
            stopAuto();
            current = -1;
            render();
            interval = setInterval(advance, speed);
        });
        document.getElementById(stepBtnId).addEventListener('click', () => {
            stopAuto();
            advance();
        });
        document.getElementById(resetBtnId).addEventListener('click', () => {
            stopAuto();
            current = -1;
            render();
        });

        return { render };
    }

    makeRunner({
        steps: HANDSHAKE_STEPS,
        messagesId: 'messages',
        clientStateId: 'clientState', clientBoxId: 'clientBox',
        serverStateId: 'serverState', serverBoxId: 'serverBox',
        statusId: 'statusText',
        runBtnId: 'runBtn', stepBtnId: 'stepBtn', resetBtnId: 'resetBtn',
        initialClient: 'CLOSED', initialServer: 'LISTEN',
        finalStatusText: '✓ Connessione ESTABLISHED: i dati possono iniziare a fluire.',
        speed: 1300
    });

    const closingRunner = makeRunner({
        steps: CLOSING_STEPS,
        messagesId: 'closingMessages',
        clientStateId: 'closingClientState', clientBoxId: 'closingClientBox',
        serverStateId: 'closingServerState', serverBoxId: 'closingServerBox',
        statusId: 'closingStatusText',
        runBtnId: 'closingRunBtn', stepBtnId: 'closingStepBtn', resetBtnId: 'closingResetBtn',
        initialClient: 'ESTABLISHED', initialServer: 'ESTABLISHED',
        finalStatusText: '✓ Connessione chiusa su entrambi i lati.',
        speed: 1300
    });

    document.getElementById('showClosingBtn').addEventListener('click', () => {
        const section = document.getElementById('closingSection');
        const isHidden = section.classList.toggle('hidden');
        const btn = document.getElementById('showClosingBtn');
        btn.textContent = isHidden ? 'Mostra anche la chiusura (4 vie) ▸' : 'Nascondi la chiusura (4 vie) ▾';
        if (!isHidden) closingRunner.render();
    });

    document.getElementById('deepDiveBtn').addEventListener('click', () => {
        const panel = document.getElementById('deepDivePanel');
        const isHidden = panel.classList.toggle('hidden');
        const btn = document.getElementById('deepDiveBtn');
        btn.setAttribute('aria-expanded', String(!isHidden));
        btn.textContent = isHidden
            ? 'Perché non bastano 2 messaggi? ▸'
            : 'Perché non bastano 2 messaggi? ▾';
    });
}
