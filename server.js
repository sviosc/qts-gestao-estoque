const express = require("express");
const app = express()
const logger = require('./utils/Log.js')

app.use(express.json());
app.use(express.static("public"))

// const repo = require("./repo.memory.js")
const repo = require("./repo.sqlite.js")

// POST

app.post("/produtos", async (req, res) => {
    logger.addInfo(`API: Requisição recebida - POST /produtos.`);
    try {
        const created = await repo.create(req.body || {});
        logger.addInfo(`API: Produto ${created.nome} criado. Status 201.`);
        res.status(201).json(created);
    } catch (err) {
        const msg = err?.message || "erro";
        logger.addError(`API: Falha no POST /produtos. Erro: ${msg}. Status 400.`);
        res.status(400).json({ error: msg });
    }
})

if (require.main === module) {
    const PORT = 3000;
    const HOST = "127.0.0.1";

    app.listen(PORT, HOST, () => {
        console.log(`API on http://${HOST}:${PORT}`)
    });
}

// DELETE /produtos - body: {nome, marca, precoCusto, precoVenda}

app.delete("/produtos", async (req, res) => {
    logger.addInfo(`API: Requisição recebida - DELETE /produtos.`);
    try {
        const ok = await repo.del(req.body || {});
        if (!ok) {
            logger.addWarning(`API: DELETE falhou. Produto não encontrado para exclusão. Status 404.`);
            return res.status(404).json({ error: "não encontrado" });
        }
        logger.addInfo(`API: Produto excluído com sucesso. Status 204.`);
        res.status(204).end();
    } catch (err) {
        const msg = err?.message || "erro";
        logger.addError(`API: Falha crítica no DELETE /produtos. Erro: ${msg}. Status 400.`);
        res.status(400).json({ error: msg });
    }
});

// GET /produtos - lista tudo
app.get("/produtos", async (_req, res) => {
    logger.addInfo(`API: Requisição recebida - GET /produtos (Listar tudo).`);
    try {
        const items = await repo.list();
        logger.addInfo(`API: Listagem concluída com ${items.length} itens. Status 200.`);
        res.status(200).json(items);
    } catch (err) {
        const msg = err?.message || "erro";
        logger.addError(`API: Falha crítica no GET /produtos. Erro: ${msg}. Status 500.`);
        res.status(500).json({ error: msg });
    }
})

// GET /produtos/find?nome=&marca=&precoCusto=&precoVenda=
app.get("/produtos/find", async (req, res) => {
    logger.addInfo(`API: Requisição recebida - GET /produtos/find.`);
    try {
        const { nome, marca } = req.query;
        const precoCusto = Number(req.query.precoCusto);
        const precoVenda = Number(req.query.precoVenda);

        if (!nome || !marca || isNaN(precoCusto) || isNaN(precoVenda)) {
            logger.addWarning(`API: Falha no GET /find. Parâmetro inválido recebido. Status 400.`);
            return res.status(400).json({ error: "Parâmetro inválido" });
        }

        const item = await repo.get({ nome, marca, precoCusto, precoVenda });
        if (!item) {
            logger.addWarning(`API: Falha no GET /find. Item não encontrado. Status 404.`);
            return res.status(404).json({ error: "não encontrado" });
        }
        logger.addInfo(`API: Item ${nome} encontrado por busca. Status 200.`);
        res.status(200).json(item);
    } catch (err) {
        const msg = err?.message || "erro";
        logger.addError(`API: Falha inesperada no GET /find. Erro: ${msg}. Status 500.`);
        res.status(500).json({ error: msg });
    }
});

// PUT /produtos
app.put("/produtos", async (req, res) => {
    logger.addInfo(`API: Requisição recebida - PUT /produtos.`);
    try {
        const { match, patch } = req.body || {};
        const updated = await repo.update(match, patch || {});
        logger.addInfo(`API: Produto atualizado com sucesso. Status 200.`);
        res.status(200).json(updated)
    } catch (err) {
        const msg = err?.message || "erro";
        if (/não encontrado/i.test(msg)) {
            logger.addWarning(`API: PUT falhou. Produto 'match' não encontrado. Status 404.`);
            return res.status(404).json({ error: msg });
        }

        logger.addError(`API: Falha no PUT /produtos. Erro: ${msg}. Status 400.`);
        res.status(400).json({ error: msg });
    }
});

// GET /logs

app.get("/logs", (_req, res) => {
    const Logs = logger.getAllLogs();
    res.status(200).json(Logs)
})

module.exports = { app, _reset: repo._reset };