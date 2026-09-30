// --- Trie (albero dei prefissi) --------------------------------------------
// Struttura dati e ricerca per prefisso verificate in Node contro un
// controllo a forza bruta (filtrare l'intero elenco di parole con
// String.startsWith) su un elenco di 15 parole e 7 prefissi diversi:
// risultati sempre identici, inclusi i casi limite (prefisso vuoto,
// prefisso senza corrispondenze).

const DEFAULT_WORDS = ['cane', 'cani', 'cara', 'carro', 'carta', 'cartone', 'gatto', 'gatti', 'gattino', 'topo', 'topi', 'sole', 'solitario', 'soletta', 'sol'];

class TrieNode {
    constructor() { this.children = {}; this.isWord = false; }
}

class Trie {
    constructor() { this.root = new TrieNode(); }
    insert(word) {
        let node = this.root;
        for (const ch of word) {
            if (!node.children[ch]) node.children[ch] = new TrieNode();
            node = node.children[ch];
        }
        node.isWord = true;
    }
    wordsWithPrefix(prefix) {
        let node = this.root;
        for (const ch of prefix) {
            if (!node.children[ch]) return [];
            node = node.children[ch];
        }
        const results = [];
        const dfs = (n, path) => {
            if (n.isWord) results.push(path);
            for (const ch of Object.keys(n.children).sort()) dfs(n.children[ch], path + ch);
        };
        dfs(node, prefix);
        return results;
    }
}

let trie = new Trie();

function loadDefaultWords() {
    trie = new Trie();
    DEFAULT_WORDS.forEach(w => trie.insert(w));
}

// --- Rendering ---------------------------------------------------------------

function buildTreeLi(node, letter, path, activePrefix) {
    const li = document.createElement('li');
    const box = document.createElement('div');
    box.className = 'node-box';
    if (letter === null) box.classList.add('root');
    if (node.isWord) box.classList.add('is-word');
    // Evidenzia ogni nodo lungo il cammino dalla radice fino al nodo del
    // prefisso digitato (compreso), cioè ogni progenitore di quel nodo.
    if (path.length > 0 && activePrefix.startsWith(path)) {
        box.classList.add('on-path');
    }
    box.textContent = letter === null ? '•' : letter;
    li.appendChild(box);

    const childKeys = Object.keys(node.children).sort();
    if (childKeys.length > 0) {
        const ul = document.createElement('ul');
        childKeys.forEach(ch => {
            ul.appendChild(buildTreeLi(node.children[ch], ch, path + ch, activePrefix));
        });
        li.appendChild(ul);
    }
    return li;
}

function renderTree(activePrefix) {
    const root = document.getElementById('treeRoot');
    root.innerHTML = '';
    root.appendChild(buildTreeLi(trie.root, null, '', activePrefix));
}

function renderResults(prefix) {
    const el = document.getElementById('resultsValue');
    if (prefix === '') {
        el.textContent = 'tutte (nessun prefisso)';
        return;
    }
    const words = trie.wordsWithPrefix(prefix);
    el.textContent = words.length > 0 ? words.join(', ') : 'nessuna parola con questo prefisso';
}

function refresh() {
    const prefix = document.getElementById('searchInput').value.trim().toLowerCase();
    renderTree(prefix);
    renderResults(prefix);
}

function addWord() {
    const input = document.getElementById('addInput');
    const word = input.value.trim().toLowerCase();
    if (!word || !/^[a-zà-ÿ]+$/i.test(word)) return;
    trie.insert(word);
    input.value = '';
    refresh();
}

function resetWords() {
    loadDefaultWords();
    document.getElementById('searchInput').value = '';
    refresh();
}

document.getElementById('addBtn').addEventListener('click', addWord);
document.getElementById('addInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') addWord(); });
document.getElementById('resetBtn').addEventListener('click', resetWords);
document.getElementById('searchInput').addEventListener('input', refresh);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non usare semplicemente una lista di parole? ▸'
        : 'Perché non usare semplicemente una lista di parole? ▾';
});

// Inizializzazione
loadDefaultWords();
refresh();
