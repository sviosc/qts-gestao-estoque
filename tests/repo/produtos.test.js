const repo = require("../../repo.memory.js");

beforeEach(async () => {
    await repo._reset()
})

//#region READ

test("list começa vazio", async () => {
    const a = await repo.list();
    expect(Array.isArray(a)).toBe(true);
    expect(a).toHaveLength(0);
});

test("list reflete itens criados e mutação externa não afeta o store", async () => {
    await repo.create({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });

    const before = await repo.list();
    expect(before).toContainEqual({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });

    // tentar alterar a cópia não deve afetar o store
    before[0].nome = "X";
    const after = await repo.list();
    expect(after[0]).toEqual({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });
})

test("get retorna cópia do primeiro que casa (nome + marca + precoCusto + precoVenda) ou null", async () => {
    await repo.create({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });
    await repo.create({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 }); // duplicado

    const got = await repo.get({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });
    expect(got).toEqual({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });

    const miss = await repo.get({ nome: "X", marca: "M", precoCusto: 5, precoVenda: 7 });
    expect(miss).toBeNull();
})

test("get valida entradas", async () => {
    await expect(repo.get({ nome: "", marca: "M", precoCusto: 5, precoVenda: 7 })).rejects.toThrow(/nome/i);
    await expect(repo.get({ nome: "N", marca: "", precoCusto: 5, precoVenda: 7 })).rejects.toThrow(/marca/i);
    await expect(repo.get({ nome: "N", marca: "M", precoCusto: -1, precoVenda: 7 })).rejects.toThrow(/custo/i);
    await expect(repo.get({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 4 })).rejects.toThrow(/venda/i);
});

//#endregion

//#region CREATE

test("create cria item e persiste", async () => {
    const a = await repo.create({ nome: "A", marca: "B", precoCusto: 1, precoVenda: 2 });
    expect(a).toEqual({ nome: "A", marca: "B", precoCusto: 1, precoVenda: 2 });

    const all = await repo.list();
    expect(all).toContainEqual({ nome: "A", marca: "B", precoCusto: 1, precoVenda: 2 });
});

test("create valida entradas", async () => {
    await expect(repo.create({ nome: " ", marca: "M", precoCusto: 5, precoVenda: 6 })).rejects.toThrow(/nome/i);
    await expect(repo.create({ nome: "N", marca: " ", precoCusto: 5, precoVenda: 6 })).rejects.toThrow(/marca/i);
    await expect(repo.create({ nome: "N", marca: "M", precoCusto: 0, precoVenda: 6 })).rejects.toThrow(/custo/i);
    await expect(repo.create({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 4 })).rejects.toThrow(/venda/i);
});

//#endregion

//#region UPDATE

test("update atualiza apenas a PRIMEIRA ocorrência que casa", async () => {
    await repo.create({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });
    await repo.create({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 }); // duplicado
    await repo.create({ nome: "A", marca: "B", precoCusto: 1, precoVenda: 2 });

    const up = await repo.update({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 },
        { nome: "N1", marca: "M1", precoCusto: 5.1, precoVenda: 7.1 });

    const all = await repo.list();
    expect(all).toHaveLength(3);
    expect(all).toContainEqual({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });
    expect(all).toContainEqual({ nome: "A", marca: "B", precoCusto: 1, precoVenda: 2 });
    expect(all).toContainEqual({ nome: "N1", marca: "M1", precoCusto: 5.1, precoVenda: 7.1 });
});

test("update aceita só um dos atributos novos, validando-os", async () => {
    await repo.create({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });

    expect(await repo.update({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 }, { nome: "    N1   " }))
        .toEqual({ nome: "N1", marca: "M", precoCusto: 5, precoVenda: 7 });

    expect(await repo.update({ nome: "N1", marca: "M", precoCusto: 5, precoVenda: 7 }, { marca: "   M1     " }))
        .toEqual({ nome: "N1", marca: "M1", precoCusto: 5, precoVenda: 7 });

    expect(await repo.update({ nome: "N1", marca: "M1", precoCusto: 5, precoVenda: 7 }, { precoCusto: 5.1 }))
        .toEqual({ nome: "N1", marca: "M1", precoCusto: 5.1, precoVenda: 7 });

    expect(await repo.update({ nome: "N1", marca: "M1", precoCusto: 5.1, precoVenda: 7 }, { precoVenda: 7.1 }))
        .toEqual({ nome: "N1", marca: "M1", precoCusto: 5.1, precoVenda: 7.1 });

    await expect(repo.update({ nome: "N1", marca: "M1", precoCusto: 5.1, precoVenda: 7.1 }, {}))
        .rejects.toThrow(/nada para atualizar/i);

    await expect(repo.update({ nome: "N1", marca: "M1", precoCusto: 5.1, precoVenda: 7.1 }, { nome: " " }))
        .rejects.toThrow(/nome/i);
});

//#endregion

//#region DELETE

test('del remove TODAS as ocorrências; retorna true e false', async () => {
    await repo.create({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 });
    await repo.create({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 }); // duplicado
    await repo.create({ nome: "A", marca: "B", precoCusto: 1, precoVenda: 2 });

    expect(await repo.del({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 })).toBe(true);
    expect(await repo.list()).toEqual([{ nome: "A", marca: "B", precoCusto: 1, precoVenda: 2 }]);

    expect(await repo.del({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 7 })).toBe(false);
});

test('del valida entradas', async () => {
    await expect(repo.del({ nome: " ", marca: "M", precoCusto: 5, precoVenda: 6 })).rejects.toThrow(/nome/i);
    await expect(repo.del({ nome: "N", marca: " ", precoCusto: 5, precoVenda: 6 })).rejects.toThrow(/marca/i);
    await expect(repo.del({ nome: "N", marca: "M", precoCusto: 0, precoVenda: 6 })).rejects.toThrow(/custo/i);
    await expect(repo.del({ nome: "N", marca: "M", precoCusto: 5, precoVenda: 4 })).rejects.toThrow(/venda/i);
});

//#endregion