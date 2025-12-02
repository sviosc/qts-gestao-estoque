let _data = [];

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
    _data = []
}

// read
async function list() {
    const result = [];
    for (let i = 0; i < _data.length; i++) {
        const x = _data[i];
        result.push({ nome: x.nome, marca: x.marca, precoCusto: x.precoCusto, precoVenda: x.precoVenda });
    }
    return result;
}
async function get({ nome, marca, precoCusto, precoVenda } = {}) {
    validateNonEmpty(nome, "nome");
    validateNonEmpty(marca, "marca");
    validateNonNegative(precoCusto, "precoCusto");
    validateNonNegative(precoVenda, "precoVenda");
    validatePrecoCustoGreaterThanPrecoVenda(precoCusto, precoVenda)

    const n = nome.trim();
    const m = marca.trim();
    const pC = precoCusto;
    const pV = precoVenda;

    for (let i = 0; i < _data.length; i++) {
        const x = _data[i];
        if (x.nome === n && x.marca === m && x.precoCusto === pC && x.precoVenda === pV) {
            return { nome: x.nome, marca: x.marca, precoCusto: x.precoCusto, precoVenda: x.precoVenda };
        }
    }
    return null;
}

// create
async function create({ nome, marca, precoCusto, precoVenda } = {}) {
    validateNonEmpty(nome, "nome");
    validateNonEmpty(marca, "marca");
    validateNonNegative(precoCusto, "precoCusto");
    validateNonNegative(precoVenda, "precoVenda");
    validatePrecoCustoGreaterThanPrecoVenda(precoCusto, precoVenda)

    const produto = { nome: nome.trim(), marca: marca.trim(), precoCusto: precoCusto, precoVenda: precoVenda };
    _data.push(produto);
    return { nome: produto.nome, marca: produto.marca, precoCusto: produto.precoCusto, precoVenda: produto.precoVenda }; // cópia exibida caso create seja realizado com sucesso
}

// update
async function update(match, patch = {}) {
    if (!match || typeof match !== "object") {
        throw new Error("parâmetros inválidos")
    }

    validateNonEmpty(match.nome, "nome");
    validateNonEmpty(match.marca, "marca");
    validateNonNegative(match.precoCusto, "precoCusto");
    validateNonNegative(match.precoVenda, "precoVenda");
    validatePrecoCustoGreaterThanPrecoVenda(match.precoCusto, match.precoVenda)

    const hasNewNome = Object.hasOwn(patch, "nome");
    const hasNewMarca = Object.hasOwn(patch, "marca");
    const hasNewPrecoCusto = Object.hasOwn(patch, "precoCusto");
    const hasNewPrecoVenda = Object.hasOwn(patch, "precoVenda");

    if (!hasNewNome && !hasNewMarca && !hasNewPrecoCusto && !hasNewPrecoVenda) {
        throw new Error("nada para atualizar");
    }

    const mn = match.nome.trim();
    const mm = match.marca.trim();
    const mpc = match.precoCusto;
    const mpv = match.precoVenda;

    let item_encontrado = false;

    for (let i = 0; i < _data.length; i++) {
        const cur = _data[i];

        if (cur.nome === mn && cur.marca === mm && cur.precoCusto === mpc && cur.precoVenda === mpv) {
            let item_encontrado = true

            let nn = cur.nome;
            let nm = cur.marca;
            let npc = cur.precoCusto;
            let npv = cur.precoVenda;

            if (hasNewNome) {
                validateNonEmpty(patch.nome, "nome");
                nn = String(patch.nome).trim();
            }
            if (hasNewMarca) {
                validateNonEmpty(patch.marca, "marca");
                nm = String(patch.marca).trim();
            }
            if (hasNewPrecoCusto) {
                validateNonNegative(patch.precoCusto, "precoCusto")
                validatePrecoCustoGreaterThanPrecoVenda(patch.precoCusto, match.precoVenda);
                npc = Number(patch.precoCusto);
            }
            if (hasNewPrecoVenda) {
                validateNonNegative(patch.precoVenda, "precoVenda")
                validatePrecoCustoGreaterThanPrecoVenda(match.precoCusto, patch.precoVenda);
                npv = Number(patch.precoVenda);
            }

            const updated = { nome: nn, marca: nm, precoCusto: npc, precoVenda: npv };
            _data[i] = updated;
            return { nome: updated.nome, marca: updated.marca, precoCusto: updated.precoCusto, precoVenda: updated.precoVenda } // cópia exibida caso update seja realizado com sucesso
        }
    }

    if (!item_encontrado) {
        throw new Error("não encontrado para atualizar")
    }
}

async function del({ nome, marca, precoCusto, precoVenda } = {}) {
    validateNonEmpty(nome, "nome");
    validateNonEmpty(marca, "marca");
    validateNonNegative(precoCusto, "precoCusto");
    validateNonNegative(precoVenda, "precoVenda");
    validatePrecoCustoGreaterThanPrecoVenda(precoCusto, precoVenda)

    const n = nome.trim();
    const m = marca.trim();
    const pC = precoCusto;
    const pV = precoVenda;

    const next = [];
    let removed = false;
    for (let i = 0; i < _data.length; i++) {
        const x = _data[i];
        if (x.nome === n && x.marca === m && x.precoCusto === pC && x.precoVenda === pV) {
            removed = true;
        } else {
            next.push(x)
        }
    }

    _data = next;
    return removed;
}

module.exports = {
    _reset,
    list,
    get,
    create,
    update,
    del
}