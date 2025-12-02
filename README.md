# qts-gestao-estoque - Sistema CRUD de Produtos

Sistema desenvolvido para fins educacionais para a disciplina Qualidade e Teste de Software 
(QTS), com foco no uso do ciclo TDD, testes automatizados e boas práticas de desenvolvimento.
O projeto implementa o controle de produtos com as operações básicas de CRUD, 
utilizando Node.js + SQLite, além de páginas simples em HTML/JS para interação visual.

------------------------------------------------------------------------

## 📘 Descrição do Sistema

O sistema realiza o controle de produtos, onde cada produto possui:

- **nome**
- **marca**
- **preço de custo**
- **preço de venda**

O projeto inclui:

- Backend completo em Node.js  
- Repositório em memória e repositório SQLite  
- Logger usando o Design Pattern Singleton  
- Interface simples em HTML + JS  
- Testes unitários e testes automatizados 

------------------------------------------------------------------------

## Tecnologias utilizadas

- **HTML**
- **JavaScript**
- **Python**

- **NodeJS**
- **Express**
- **Sqlite3**
- **Jest**
- **Selenium**
- **Bootstrap**


------------------------------------------------------------------------

## Como rodar o projeto

## Requisitos

- **Node.js v22.19.0**
- NPM
- Python 3 (para Selenium)

1. **Clone o repositório**
```bash
git clone https://github.com/sviosc/qts-gestao-estoque.git
```

2. **Acesse a pasta**
```bash
cd qts-gestao-estoque
```

3. **Instale as dependências**
```bash
npm install
```

5. **Inicie o servidor**
```bash
npm run start
```

------------------------------------------------------------------------

## Como rodar os testes

## JEST 
Após instaladas as dependências do projeto, rode o seguinte comando
para executar os testes unitários.

**Executar a bateria de testes**
```bash
npx jest
```

## SELENIUM

**Instalar as dependências**
```bash
pip install selenium
```

**Executar o teste automatizado** (IMPORTANTE ESTAR NA RAIZ DO PROJETO: qts-gestao-estoque/ )
```bash
python tests/POM/test_produto_cadastrar.py 
```

------------------------------------------------------------------------

### Página Inicial

A página inicial apresenta:

-   Botão para acessar a página de criação
-   Botão para acessar a listagem de produtos
-   Botão para acessar a listagem de logs do sistema

------------------------------------------------------------------------

#### Cadastro de Produtos

-   Nome e Marca\
-   Preço de custo e de venda\

------------------------------------------------------------------------

### Página de Edição

Mesma estrutura da página de cadastro, porém com os dados já
preenchidos para alteração.\
É possível editar um produto, alterando seu nome, sua marca,
seu preço de custo e seu preço de venda, desde que respeite
as restrições impostas.


------------------------------------------------------------------------

### Logs do Sistema

Tabela que lista:

-   Tipo de log\
-   Mensagem do log\

------------------------------------------------------------------------

### Uso do TDD

O backend foi desenvolvido seguindo o fluxo do TDD

Nesse sentido, seguia o ciclo RED - GREEN - REFACTOR

**RED**
Escreve-se o teste antes da implementação, o que resulta em falha.

**GREEN**
Escreve-se um código mínimo necessário para o teste passar.

**REFACTOR**
Refatora-se o código, mantendo todos os testes passando.

------------------------------------------------------------------------

### Design Pattern

## Singleton

O Singleton foi utilizado para implementação de um logger, localizado
na raiz do projeto, dentro da subpasta utils

utils/Log.js

Por meio do Singleton, registra-se somente uma instância no sistema,
responsável por registrar as ações realizadas na aplicação.
A exibição dessas ações pode ser visualizada na página log.html,
que pode ser acessada na página inicial da aplicação.

------------------------------------------------------------------------


## Autores

-   **Roberto Peixoto Milão**\
-   **Vinícios Ricardo Ribeiro Dias**

------------------------------------------------------------------------

## Instituição

**ETEC Sales Gomes**\
Ensino Médio com Habilitação em **Técnico de Desenvolvimento de Desenvolvimento de Sistemas**
Sistemas**\
Tatuí -- SP \| 2025
