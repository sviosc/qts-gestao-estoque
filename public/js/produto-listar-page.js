const tabela = document.getElementById("tabela-produtos"); // seleciona o tbody

function excluirProduto(nome, marca, pCusto, pVenda) {
    const match = {
        nome: nome,
        marca: marca,
        precoCusto: Number(pCusto),
        precoVenda: Number(pVenda)
    }

    if (confirm(`Excluir o produto ${match.nome} ${match.marca}? 
        ATENÇÃO: Esta ação excluirá todos os registros que corresponderem a TODAS as características deste`)) {
        fetch("/produtos", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(match)
        })
            .then(async res => {
                if (res.status === 204) {
                    alert("Produto excluído com sucesso!");
                    carregarProdutos();
                } else if (res.status === 404) {
                    alert("Erro: Produto não encontrado.");
                } else {
                    const data = await res.json();
                    alert(`Erro ao excluir: ${data.error || 'Erro desconhecido'}`);
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Erro de conexão.");
            });
    }
}

function editarProduto(nome, marca, precoCusto, precoVenda) {
    window.location.href = `produto-cadastrar.html?nome=${nome}&marca=${marca}&precoCusto=${precoCusto}&precoVenda=${precoVenda}`;
}

function carregarProdutos() {
    fetch("/produtos")
        .then(res => res.json())
        .then(produtos => {
            tabela.innerHTML = "";
            let tabela_conteudo = "";

            if (!Array.isArray(produtos) || produtos.length === 0) {
                tabela.innerHTML = `
            <tr>
            <td colspan="5" class="text-muted">Nenhum produto cadastrado.</td>
            </tr>
            `;
                return;
            }

            produtos.forEach(p => {
                tabela_conteudo += `
                    <tr>
                        <td>${p.nome}</td>
                        <td>${p.marca}</td>
                        <td>${Number(p.precoCusto).toFixed(2)}</td>
                        <td>${Number(p.precoVenda).toFixed(2)}</td>
                        <td>
                            <button onclick="editarProduto('${p.nome}','${p.marca}','${p.precoCusto}','${p.precoVenda}')" class="btn btn-warning btn-sm text-white">
                                Editar
                            </button>
                            <button onclick="excluirProduto('${p.nome}','${p.marca}','${p.precoCusto}','${p.precoVenda}')" class="btn btn-danger btn-sm ms-1">
                                Excluir
                            </button>
                        </td>
                    </tr>
                `;
            });

            tabela.innerHTML = tabela_conteudo;
        })
        .catch(() => {
            alert("Erro ao carregar produtos.");
        });
}

carregarProdutos();