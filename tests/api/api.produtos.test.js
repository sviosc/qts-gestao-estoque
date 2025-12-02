const { app, _reset } = require("../../server.js");

let server, baseURL;

beforeAll(async () => {
    server = app.listen(0);
    await new Promise((res) => server.once('listening', res));
    baseURL = `http://127.0.0.1:${server.address().port}`;
})

afterAll(async () => {
    await new Promise((res) => server.close(res));
    await _reset()
})

beforeEach(async () => {
    await _reset()
})

// HELPERS

const send = (method, path, body) =>
    fetch(`${baseURL}${path}`, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
    });

// POST

const post = (n, m, pC, pV) => send("POST", "/produtos", { nome: n, marca: m, precoCusto: pC, precoVenda: pV });

test("POST /produtos -> 201 e retorna {nome, marca, precoCusto, precoVenda}", async () => {
    const res = await fetch(`${baseURL}/produtos`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nome: "chocolate", marca: "nestle", precoCusto: 5, precoVenda: 7 }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ nome: "chocolate", marca: "nestle", precoCusto: 5, precoVenda: 7 })
});

// DELETE

const del = (n, m, pC, pV) => send("DELETE", "/produtos", { nome: n, marca: m, precoCusto: pC, precoVenda: pV });

test("DELETE /produtos -> 204 ao remover, 404 na segunda", async () => {
    await post("chocolate", "nestle", 5, 7);
    await post("chocolate", "nestle", 5, 7);
    expect((await del("chocolate", "nestle", 5, 7)).status).toBe(204);
    expect((await del("chocolate", "nestle", 5, 7)).status).toBe(404);
})

test("DELETE /produtos -> 400 inválido; 404 não encontrado", async () => {
    for (const [n, m, pC, pV] of [["v", "", 4, 5], ["", "o", ,]]) {
        expect((await del(n, m, pC, pV)).status).toBe(400);
    }
    expect((await del("P", "!", 55, 56)).status).toBe(404);
});

// HELPERS p/ GET
const list = () => fetch(`${baseURL}/produtos`);
const find = (n, m, pC, pV) => fetch
    (`${baseURL}/produtos/find?nome=${encodeURIComponent(n)}&marca=${encodeURIComponent(m)}&precoCusto=${encodeURIComponent(pC)}&precoVenda=${encodeURIComponent(pV)}`);

// GET /produtos
test("GET /produtos -> 200 lista com itens", async () => {
    await post("chocolate", "nestle", 5, 7);
    await post("barra de chocolate", "nescau", 10, 20);

    const res = await list();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual(expect.arrayContaining([
        { nome: "chocolate", marca: "nestle", precoCusto: 5, precoVenda: 7 },
        { nome: "barra de chocolate", marca: "nescau", precoCusto: 10, precoVenda: 20 },
    ]));
})

// GET /produtos/find
test("GET /produtos/find -> 200 encontra; 404 não encontrado; 400 inválido", async () => {
    await post("chocolate", "nestle", 5, 7);
    let r = await find("chocolate", "nestle", 5, 7);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ nome: "chocolate", marca: "nestle", precoCusto: 5, precoVenda: 7 });

    r = await find("X", ":P", 9, 99);
    expect(r.status).toBe(404);

    for (const [n, m, pC, pV] of [["v", "", 4, 5], ["", "o", ,]]) {
        r = await find(n, m, pC, pV);
        expect(r.status).toBe(400)
    }
});

// helper PUT
const put = (match, patch) => send("PUT", "/produtos", { match, patch });

// PUT
test("PUT /produtos -> 200 atualiza; 404 não encontrado", async () => {
    await post("chocolate", "nestle", 5, 7);
    await post("chocolate", "nestle", 5, 7);
    await post("moranguete", "garoto", 7, 14);

    const r = await put({ nome: "chocolate", marca: "nestle", precoCusto: 5, precoVenda: 7 }, { nome: "chocolate tamanho família", marca: "nestle 2", precoCusto: 5, precoVenda: 10 });
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ nome: "chocolate tamanho família", marca: "nestle 2", precoCusto: 5, precoVenda: 10 });

    const res = await list();
    const data = await res.json();
    expect(data).toHaveLength(3);
    expect(data).toEqual(expect.arrayContaining([
        { nome: "chocolate tamanho família", marca: "nestle 2", precoCusto: 5, precoVenda: 10 },
        { nome: "chocolate", marca: "nestle", precoCusto: 5, precoVenda: 7 },
        { nome: "moranguete", marca: "garoto", precoCusto: 7, precoVenda: 14 },
    ]));
});

test("PUT /produtos -> 400 patch vazio; 400 inválido; 404 não encontrado", async () => {
    await post("chocolate", "nestle", 5, 7);

    // patch vazio
    expect((await put({ nome: "chocolate", marca: "nestle", precoCusto: 5, precoVenda: 7 }, {})).status).toBe(400);

    // campos inválidos
    expect((await put({ nome: "chocolate", marca: "nestle", precoCusto: 5, precoVenda: 7 }, { nome: "" })).status).toBe(400);

    // não encontrado
    expect((await put({ nome: "banana brasil", marca: "er", precoCusto: 3, precoVenda: 6 }, { nome: "Z" })).status).toBe(404);
})