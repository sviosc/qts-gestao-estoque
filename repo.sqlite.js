const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const logger = require('./utils/Log.js')

// abre DB e cria tabela (uma única vez) e retorna uma referência
const ready = open({ filename: "produtos.db", driver: sqlite3.Database })
    .then(async (db) => {
        await db.exec(`
            CREATE TABLE IF NOT EXISTS produtos (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                nome    TEXT NOT NULL,
                marca   TEXT NOT NULL,
                precoCusto  REAL(9,2) CHECK (precoCusto > 0) NOT NULL,
                precoVenda  REAL(9,2) CHECK (precoVenda >= precoCusto) NOT NULL 
            );
            `);
        return db;
    });

function validateNonEmpty(v, field) {
    if (typeof v !== 'string' || v.trim().length === 0) {
        throw new Error(`${field} é obrigatório`)
    }
}

function validateNonNegative(v, field) {
    if (typeof v !== "number" || v <= 0) {
        throw new Error(`${field} deve ser maior que 0`)
    }
}

function validatePrecoCustoGreaterThanPrecoVenda(pC, pV) {
    if (pC > pV) {
        throw new Error(`Preço de custo (${pC}) maior que Preço de venda (${pV}). Preço de custo deve ser menor ou igual ao preço de venda. `)
    }
}

async function _reset() {
    const db = await ready;
    await db.exec(`DELETE FROM produtos;`);
}

//#region READ

async function list() {
    const db = await ready;
    const rows = await db.all(`SELECT nome, marca, precoCusto, precoVenda FROM produtos ORDER BY id;`);

    logger.addInfo(`Listagem concluída. Total de produtos: ${rows.length}`)

    const result = [];
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        result.push({ nome: r.nome, marca: r.marca, precoCusto: r.precoCusto, precoVenda: r.precoVenda });
    }

    return result;
}

async function get({ nome, marca, precoCusto, precoVenda } = {}) {
    const db = await ready;
    validateNonEmpty(nome, "nome");
    validateNonEmpty(marca, "marca");
    validateNonNegative(precoCusto, "precoCusto");
    validateNonNegative(precoVenda, "precoVenda");
    validatePrecoCustoGreaterThanPrecoVenda(precoCusto, precoVenda);
    logger.addInfo(`Buscando produto: ${nome} - ${marca}`)

    const n = nome.trim(), m = marca.trim(), pC = parseFloat(precoCusto), pV = parseFloat(precoVenda);
    const row = await db.get(
        `SELECT nome, marca, precoCusto, precoVenda
            FROM produtos
            WHERE nome = ? AND marca = ? AND precoCusto = ? AND precoVenda = ?
            ORDER BY id
            LIMIT 1;`,
        n, m, pC, pV
    );

    if (!row) {
        logger.addWarning(`GET: Produto ${nome} não encontrado`)
    } else {
        logger.addInfo(`GET: Produto ${nome} encontrado.`)
    }

    return !row ? null : { nome: row.nome, marca: row.marca, precoCusto: row.precoCusto, precoVenda: row.precoVenda };
}

//#endregion

//#region CREATE

async function create({ nome, marca, precoCusto, precoVenda } = {}) {
    const db = await ready;

    validateNonEmpty(nome, "nome");
    validateNonEmpty(marca, "marca");
    validateNonNegative(precoCusto, "precoCusto");
    validateNonNegative(precoVenda, "precoVenda");
    validatePrecoCustoGreaterThanPrecoVenda(precoCusto, precoVenda);
    const n = nome.trim(), m = marca.trim(), pC = parseFloat(precoCusto), pV = parseFloat(precoVenda);

    await db.run(`INSERT INTO produtos (nome, marca, precoCusto, precoVenda) VALUES (?, ?, ?, ?);`, n, m, pC, pV);
    logger.addInfo(`Produto ${nome} criado com sucesso.`);
    return { nome: nome, marca: marca, precoCusto: precoCusto, precoVenda: precoVenda };
}

//#endregion

//#region UPDATE

async function update(match, patch = {}) {
    const db = await ready;

    if (!match || typeof match !== "object") {
        logger.addError("UPDATE: Parâmetros de 'match' inválidos.")
        throw new Error("parâmetros inválidos");
    }
    validateNonEmpty(match.nome, "nome");
    validateNonEmpty(match.marca, "marca");
    validateNonNegative(match.precoCusto, "precoCusto");
    validateNonNegative(match.precoVenda, "precoVenda");
    validatePrecoCustoGreaterThanPrecoVenda(match.precoCusto, match.precoVenda);

    const hasNewNome = Object.hasOwn(patch, "nome");
    const hasNewMarca = Object.hasOwn(patch, "marca");
    const hasNewPrecoC = Object.hasOwn(patch, "precoCusto");
    const hasNewPrecoV = Object.hasOwn(patch, "precoVenda");

    if (!hasNewNome && !hasNewMarca && !hasNewPrecoC && !hasNewPrecoV) {
        logger.addError("UPDATE: Objeto 'patch' vazio.");
        throw new Error("nada para atualizar");
    }

    const mn = match.nome.trim(), mm = match.marca.trim(), mpC = parseFloat(match.precoCusto), mpV = parseFloat(match.precoVenda);

    const cur = await db.get(
        `SELECT id, nome, marca, precoCusto, precoVenda
            FROM produtos
            WHERE nome = ? AND marca = ? AND precoCusto = ? AND precoVenda = ?
            ORDER BY id
            LIMIT 1;`,
        mn, mm, mpC, mpV
    );

    if (!cur) {
        logger.addWarning(`UPDATE: Produto 'match' (${match.nome}) não encontrado.`);
        throw new Error("não encontrado");
    }

    let nn = cur.nome, nm = cur.marca, npC = cur.precoCusto, npV = cur.precoVenda;

    if (hasNewNome) {
        validateNonEmpty(patch.nome, "nome");
        nn = String(patch.nome).trim();
    }

    if (hasNewMarca) {
        validateNonEmpty(patch.marca, "marca");
        nm = String(patch.marca).trim();
    }

    if (hasNewPrecoC) {
        validateNonNegative(parseFloat(patch.precoCusto), "precoCusto");
        npC = parseFloat(patch.precoCusto)
    }

    if (hasNewPrecoV) {
        validateNonNegative(parseFloat(patch.precoVenda), "precoVenda");
        validatePrecoCustoGreaterThanPrecoVenda(parseFloat(patch.precoCusto), parseFloat(patch.precoVenda));
        npV = parseFloat(patch.precoVenda);
    }

    await db.run(`UPDATE produtos SET nome = ?, marca = ?, precoCusto = ?, precoVenda = ? WHERE id = ?;`, nn, nm, npC, npV, cur.id);
    logger.addInfo(`Produto ${nn} (ID: ${cur.id}) atualizado com sucesso.`);

    return { nome: nn, marca: nm, precoCusto: npC, precoVenda: npV };
}

//#endregion

//#region DELETE

async function del({ nome, marca, precoCusto, precoVenda } = {}) {
    const db = await ready;

    validateNonEmpty(nome, "nome");
    validateNonEmpty(marca, "marca");
    validateNonNegative(precoCusto, "precoCusto");
    validateNonNegative(precoVenda, "precoVenda");
    validatePrecoCustoGreaterThanPrecoVenda(precoCusto, precoVenda);
    const n = nome.trim(), m = marca.trim(), pC = parseFloat(precoCusto), pV = parseFloat(precoVenda);

    const res = await db.run(`DELETE FROM produtos WHERE nome = ? AND marca = ? AND precoCusto = ? AND precoVenda = ?;`, n, m, pC, pV);

    if (res.changes > 0) logger.addInfo(`DELETE: ${res.changes} produto(s) excluído(s) com sucesso.`);
    else logger.addWarning(`DELETE: Nenhuma linha foi excluída para o produto: ${nome}.`);

    return res.changes > 0;
}

//#endregion

module.exports = {
    _reset,
    list,
    get,
    create,
    update,
    del
};