// --- Un piccolo motore SQL scritto a mano (SELECT/WHERE/JOIN/ORDER BY) -----
// Copre volutamente solo un sottoinsieme di SQL: niente sottoquery, GROUP BY,
// funzioni di aggregazione, OR o parentesi nel WHERE. L'obiettivo è che le
// query che copre siano eseguite in modo sicuramente corretto, non coprire
// tutto SQL.

const DATASET = {
    studenti: [
        { id: 1, nome: 'Giulia Bianchi', classe: '5A' },
        { id: 2, nome: 'Marco Rossi', classe: '5A' },
        { id: 3, nome: 'Sara Conti', classe: '5B' },
        { id: 4, nome: 'Luca Ferrari', classe: '5B' },
        { id: 5, nome: 'Omar Haddad', classe: '5A' }
    ],
    voti: [
        { id: 1, studente_id: 1, materia: 'Matematica', voto: 8 },
        { id: 2, studente_id: 1, materia: 'Italiano', voto: 7 },
        { id: 3, studente_id: 2, materia: 'Matematica', voto: 6 },
        { id: 4, studente_id: 2, materia: 'Italiano', voto: 9 },
        { id: 5, studente_id: 3, materia: 'Matematica', voto: 9 },
        { id: 6, studente_id: 3, materia: 'Italiano', voto: 8 },
        { id: 7, studente_id: 4, materia: 'Matematica', voto: 5 },
        { id: 8, studente_id: 4, materia: 'Italiano', voto: 6 },
        { id: 9, studente_id: 5, materia: 'Matematica', voto: 7 },
        { id: 10, studente_id: 5, materia: 'Italiano', voto: 7 }
    ]
};

const KEYWORDS = new Set(['SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'ORDER', 'BY', 'ASC', 'DESC', 'AND']);

function tokenize(sql) {
    const re = /\s+|'([^']*)'|"([^"]*)"|(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(<>|!=|<=|>=|=|<|>)|([,.()*])/g;
    const tokens = [];
    let pos = 0;
    while (pos < sql.length) {
        re.lastIndex = pos;
        const m = re.exec(sql);
        if (!m || m.index !== pos) {
            throw new Error(`Carattere non riconosciuto in posizione ${pos}: "${sql[pos]}"`);
        }
        const whole = m[0];
        if (!/^\s+$/.test(whole)) {
            if (m[1] !== undefined) tokens.push({ type: 'string', value: m[1] });
            else if (m[2] !== undefined) tokens.push({ type: 'string', value: m[2] });
            else if (m[3] !== undefined) tokens.push({ type: 'number', value: parseFloat(m[3]) });
            else if (m[4] !== undefined) {
                const upper = m[4].toUpperCase();
                tokens.push(KEYWORDS.has(upper) ? { type: 'keyword', value: upper } : { type: 'ident', value: m[4] });
            } else if (m[5] !== undefined) tokens.push({ type: 'op', value: m[5] });
            else if (m[6] !== undefined) tokens.push({ type: 'punct', value: m[6] });
        }
        pos += whole.length;
    }
    return tokens;
}

function parse(tokens) {
    let i = 0;
    const peek = () => tokens[i];
    const atEnd = () => i >= tokens.length;

    function expectKeyword(kw) {
        const t = peek();
        if (!t || t.type !== 'keyword' || t.value !== kw) {
            throw new Error(`Atteso "${kw}"${t ? ` ma trovato "${t.value}"` : ' ma la query finisce qui'}.`);
        }
        i++;
        return t;
    }

    function matchKeyword(kw) {
        const t = peek();
        if (t && t.type === 'keyword' && t.value === kw) { i++; return true; }
        return false;
    }

    function expectPunct(p) {
        const t = peek();
        if (!t || t.type !== 'punct' || t.value !== p) {
            throw new Error(`Atteso "${p}"${t ? ` ma trovato "${t.value}"` : ' ma la query finisce qui'}.`);
        }
        i++;
    }

    function parseColumnRef() {
        const t = peek();
        if (!t || t.type !== 'ident') {
            throw new Error(`Atteso il nome di una colonna${t ? ` ma trovato "${t.value}"` : ' ma la query finisce qui'}.`);
        }
        i++;
        if (peek() && peek().type === 'punct' && peek().value === '.') {
            i++;
            const col = peek();
            if (!col || col.type !== 'ident') throw new Error('Atteso un nome di colonna dopo il punto.');
            i++;
            return { table: t.value, col: col.value };
        }
        return { table: null, col: t.value };
    }

    function parseSelectList() {
        if (peek() && peek().type === 'punct' && peek().value === '*') {
            i++;
            return '*';
        }
        const cols = [parseColumnRef()];
        while (peek() && peek().type === 'punct' && peek().value === ',') {
            i++;
            cols.push(parseColumnRef());
        }
        return cols;
    }

    function parseValue() {
        const t = peek();
        if (!t) throw new Error('Atteso un valore (numero o testo tra virgolette) ma la query finisce qui.');
        if (t.type === 'number' || t.type === 'string') { i++; return { literal: t.value }; }
        throw new Error(`Atteso un valore (numero o testo tra virgolette) ma trovato "${t.value}".`);
    }

    function parseCondition() {
        const left = parseColumnRef();
        const opTok = peek();
        if (!opTok || opTok.type !== 'op') {
            throw new Error(`Atteso un operatore di confronto (=, <, >, <=, >=, <>)${opTok ? ` ma trovato "${opTok.value}"` : ''}.`);
        }
        i++;
        const rightTok = peek();
        if (rightTok && rightTok.type === 'ident') {
            i++;
            let right = { table: null, col: rightTok.value };
            if (peek() && peek().type === 'punct' && peek().value === '.') {
                i++;
                const col = peek();
                if (!col || col.type !== 'ident') throw new Error('Atteso un nome di colonna dopo il punto.');
                i++;
                right = { table: rightTok.value, col: col.value };
            }
            return { left, op: opTok.value, right: { columnRef: right } };
        }
        const value = parseValue();
        return { left, op: opTok.value, right: value };
    }

    function parseConditionList() {
        const conds = [parseCondition()];
        while (matchKeyword('AND')) conds.push(parseCondition());
        return conds;
    }

    expectKeyword('SELECT');
    const select = parseSelectList();
    expectKeyword('FROM');
    const fromTok = peek();
    if (!fromTok || fromTok.type !== 'ident') throw new Error('Atteso il nome di una tabella dopo FROM.');
    i++;
    const from = fromTok.value;

    let join = null;
    if (matchKeyword('JOIN')) {
        const joinTok = peek();
        if (!joinTok || joinTok.type !== 'ident') throw new Error('Atteso il nome di una tabella dopo JOIN.');
        i++;
        expectKeyword('ON');
        const onCond = parseCondition();
        if (!onCond.right.columnRef) throw new Error('La condizione ON deve confrontare due colonne (es. studenti.id = voti.studente_id).');
        join = { table: joinTok.value, on: onCond };
    }

    let where = null;
    if (matchKeyword('WHERE')) where = parseConditionList();

    let orderBy = null;
    if (matchKeyword('ORDER')) {
        expectKeyword('BY');
        const col = parseColumnRef();
        let dir = 'ASC';
        if (matchKeyword('ASC')) dir = 'ASC';
        else if (matchKeyword('DESC')) dir = 'DESC';
        orderBy = { col, dir };
    }

    if (!atEnd()) {
        throw new Error(`Testo inatteso dopo la fine della query: "${peek().value}".`);
    }

    return { select, from, join, where, orderBy };
}

// --- Esecuzione -------------------------------------------------------------

function loadTable(name) {
    const rows = DATASET[name];
    if (!rows) throw new Error(`Tabella sconosciuta: "${name}". Le tabelle disponibili sono: ${Object.keys(DATASET).join(', ')}.`);
    return rows;
}

// Ogni riga di lavoro è { __tables: { nomeTabella: {col: valore, ...}, ... } }
// così una query con JOIN può tenere separate le colonne delle due tabelle
// anche quando condividono lo stesso nome (es. "id" in entrambe).
function makeBaseRows(tableName) {
    return loadTable(tableName).map(row => ({ __tables: { [tableName]: row } }));
}

function resolveColumn(row, ref) {
    if (ref.table) {
        const tbl = row.__tables[ref.table];
        if (!tbl) throw new Error(`Tabella o alias sconosciuto: "${ref.table}".`);
        if (!(ref.col in tbl)) throw new Error(`La tabella "${ref.table}" non ha una colonna "${ref.col}".`);
        return tbl[ref.col];
    }
    const matches = Object.keys(row.__tables).filter(t => ref.col in row.__tables[t]);
    if (matches.length === 0) throw new Error(`Colonna sconosciuta: "${ref.col}".`);
    if (matches.length > 1) throw new Error(`Colonna ambigua: "${ref.col}" esiste in più tabelle (${matches.join(', ')}). Specifica tabella.colonna.`);
    return row.__tables[matches[0]][ref.col];
}

function compare(a, op, b) {
    switch (op) {
        case '=': return a === b;
        case '!=': case '<>': return a !== b;
        case '<': return a < b;
        case '>': return a > b;
        case '<=': return a <= b;
        case '>=': return a >= b;
        default: throw new Error(`Operatore sconosciuto: "${op}".`);
    }
}

function evalCondition(row, cond) {
    const left = resolveColumn(row, cond.left);
    const right = cond.right.columnRef ? resolveColumn(row, cond.right.columnRef) : cond.right.literal;
    return compare(left, cond.op, right);
}

function execute(ast) {
    let rows = makeBaseRows(ast.from);

    if (ast.join) {
        const rightRows = loadTable(ast.join.table);
        const joined = [];
        for (const leftRow of rows) {
            for (const rightRawRow of rightRows) {
                const candidate = { __tables: { ...leftRow.__tables, [ast.join.table]: rightRawRow } };
                if (evalCondition(candidate, ast.join.on)) joined.push(candidate);
            }
        }
        rows = joined;
    }

    if (ast.where) {
        rows = rows.filter(row => ast.where.every(cond => evalCondition(row, cond)));
    }

    if (ast.orderBy) {
        const { col, dir } = ast.orderBy;
        rows = [...rows].sort((a, b) => {
            const va = resolveColumn(a, col);
            const vb = resolveColumn(b, col);
            if (va < vb) return dir === 'ASC' ? -1 : 1;
            if (va > vb) return dir === 'ASC' ? 1 : -1;
            return 0;
        });
    }

    let columns;
    let projected;
    if (ast.select === '*') {
        const tableNames = Object.keys(rows[0] ? rows[0].__tables : { [ast.from]: {} });
        const multiTable = tableNames.length > 1;
        columns = [];
        tableNames.forEach(t => Object.keys(loadTable(t)[0] || {}).forEach(c => {
            columns.push(multiTable ? `${t}.${c}` : c);
        }));
        projected = rows.map(row => {
            const out = {};
            tableNames.forEach(t => Object.keys(row.__tables[t]).forEach(c => {
                out[multiTable ? `${t}.${c}` : c] = row.__tables[t][c];
            }));
            return out;
        });
    } else {
        columns = ast.select.map(ref => ref.table ? `${ref.table}.${ref.col}` : ref.col);
        projected = rows.map(row => {
            const out = {};
            ast.select.forEach((ref, idx) => { out[columns[idx]] = resolveColumn(row, ref); });
            return out;
        });
    }

    return { columns, rows: projected };
}

function run(sql) {
    const tokens = tokenize(sql);
    const ast = parse(tokens);
    return execute(ast);
}

if (typeof module !== 'undefined') {
    module.exports = { DATASET, tokenize, parse, execute, run };
}
