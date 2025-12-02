const tabelaLogs = document.getElementById("tabela-logs");

function getLogClass(type) {
    if (type.toLowerCase() == 'error') {
        return 'log-error';
    } else if (type.toLowerCase() == 'warning') {
        return 'log-warning';
    }
    return 'log-info';
}

function carregarLogs() {
    tabelaLogs.innerHTML = "";

    fetch("/logs")
        .then(res => {
            if (!res.ok) {
                throw new Error(`Erro HTTP: ${res.status}`);
            }
            return res.json();
        })
        .then(logs => {
            if (!Array.isArray(logs) || logs.length == 0) {
                tabelaLogs.innerHTML = `
                    <tr>
                        <td colspan="2" class="text-muted text-center">
                            Nenhum evento registrado no Logger.
                        </td>
                    </tr>
                `;
                return;
            }

            let tabela_conteudo = "";

            logs.forEach(log => {
                const logClass = getLogClass(log.type);

                tabela_conteudo += `
                    <tr class="${logClass}">
                        <td>
                            <strong>${log.type}</strong>
                        </td>
                        <td>${log.log}</td>
                    </tr>
                `;
            });

            tabelaLogs.innerHTML = tabela_conteudo;
        })
}

carregarLogs();