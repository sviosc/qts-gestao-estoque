const nomeProduto = document.getElementById('nomeProduto');
const marcaProduto = document.getElementById('marcaProduto');
const precoCusto = document.getElementById('precoCusto');
const precoVenda = document.getElementById('precoVenda');

let produtoOriginal = null;

//#region Função de criação

function criarProduto() {
    const nome = nomeProduto.value.trim();
    const marca = marcaProduto.value.trim();
    const precoC = Number(precoCusto.value);
    const precoV = Number(precoVenda.value);

    const produto = {
        nome,
        marca,
        precoCusto: precoC,
        precoVenda: precoV
    };



    fetch("/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto)
    })
        .then(async res => {
            const data = await res.json();

            if (!res.ok) {
                alert("Erro: " + data.error);
                return;
            }

            alert("Produto cadastrado com sucesso!");
            window.location.href = "produto-listar.html";
        })
        .catch(() => {
            alert("Erro ao conectar com o servidor.");
        });
}

//#region Funções de edição

function carregarProdutosEditar() {

    const params = new URLSearchParams(window.location.search);

    if (params.has('nome')) {
        const tituloPagina = document.getElementById('titulo');
        const h3Pag = document.getElementById('h3-pag');
        const btnSalvar = document.getElementById('salvar')


        produtoOriginal = {
            nome: decodeURIComponent(params.get('nome')),
            marca: decodeURIComponent(params.get('marca')),
            precoCusto: Number(decodeURIComponent(params.get('precoCusto'))),
            precoVenda: Number(decodeURIComponent(params.get('precoVenda')))
        }

        nomeProduto.value = produtoOriginal.nome;
        marcaProduto.value = produtoOriginal.marca;
        precoCusto.value = produtoOriginal.precoCusto;
        precoVenda.value = produtoOriginal.precoVenda;

        tituloPagina.textContent = 'Editar Produto';
        h3Pag.innerText = 'Editar Produto';
        btnSalvar.innerText = 'Salvar Alterações'

        btnSalvar.setAttribute('onclick', 'atualizarProduto()');
    }
}

function atualizarProduto() {
    const nome = nomeProduto.value.trim();
    const marca = marcaProduto.value.trim();
    const precoC = Number(precoCusto.value);
    const precoV = Number(precoVenda.value);

    if (produtoOriginal.nome == nome && produtoOriginal.marca == marca && produtoOriginal.precoCusto == precoC && produtoOriginal.precoVenda == precoV) {
        alert("Nada a atualizar");
        return;
    }

    const bodyData = {
        match: produtoOriginal,
        patch: {
            nome,
            marca,
            precoCusto: precoC,
            precoVenda: precoV
        }
    }



    fetch("/produtos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
    })
        .then(async res => {
            const data = await res.json();

            if (!res.ok) {
                const errorMessage = res.status == 404
                    ? "Erro: O produto original não foi encontrado"
                    : "Erro ao atualizar: " + data.error;
                alert(errorMessage);
                return;
            }

            alert("Produto atualizado com sucesso!");
            window.location.href = "produto-listar.html"
        })
        .catch(() => {
            alert("Erro ao conectar com o servidor.")
        })
}

carregarProdutosEditar()