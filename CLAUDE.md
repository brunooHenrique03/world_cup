# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral

Simulador de futebol. O repositório tem **duas implementações independentes**, que não compartilham código:

- `src/` — a versão original em **Delphi VCL** (RAD Studio / Delphi 10.4, `ProjectVersion 19.3`, Win32) com banco **Firebird** via FireDAC. Só a Copa do Mundo.
- `web/` — a versão principal, em **HTML/CSS/JS puro** (sem build, sem npm, sem framework): Copa do Mundo, Brasileirão, Copa do Brasil e Champions League, com rating Elo, rankings e histórico, tudo guardado no IndexedDB do navegador.

## Rodando

**Web:** abra `web/index.html` direto no navegador (funciona por `file://`) ou sirva a pasta com qualquer servidor estático, ex.: `python -m http.server -d web`. Não há etapa de build.

**Testes (web):** abra `web/tests.html` no navegador. Os testes estão em [web/js/testes.js](web/js/testes.js) (`teste(nome, fn)`, lançando erro na falha) e não alteram os dados do usuário (`isolado()`). Para rodar no Node, carregue os `<script src>` do `tests.html` num contexto `vm` com `window` apontando para o próprio contexto e chame `SIM.store.iniciar().then(() => SIM.rodarTestes())`. Sem IndexedDB, o store funciona só em memória. Não há lint.

**Delphi:** abra `src/WorldCup.dproj` no RAD Studio e compile. Pela linha de comando, com o ambiente do RAD Studio carregado (`rsvars.bat`): `msbuild src\WorldCup.dproj /p:Config=Debug /p:Platform=Win32`. O executável sai em `src/exe/` e os `.dcu` em `src/dcu/`, ambos ignorados pelo Git.

- O caminho do banco está fixo em [src/forms/UdmPrincipal.dfm](src/forms/UdmPrincipal.dfm) (`Database=C:\Users\USUARIO\Documents\Projetos\world_cup\database\BASE.FDB`, `SYSDBA`/`masterkey`), com `Connected = True` em tempo de design. Ajuste-o para a máquina local; o arquivo real está em `database/BASE.FDB`. É preciso um servidor Firebird rodando.
- As imagens são carregadas com caminho relativo `../images/...`, ou seja, relativo a `src/exe/` → `src/images/`.

## Arquitetura — Delphi (`src/`)

- `UdmPrincipal` (data module) guarda a conexão e as queries compartilhadas: `TTIMES` (seleções; `PONTUACAO` é a força do time), `TCOMPETICAO`, `TMODELO`, `TPARTICIPANTE`. Outras telas usam `TGRUPOS` e as tabelas de confrontos pelas suas próprias queries.
- IDs são gerados por `dmPrincipal.GetNewID(tabela, campo)` (`max(campo) + 1`), não por generators do Firebird.
- Fluxo de telas, cada uma abrindo a próxima: `UPrincipal` → `UnitConfiguracoes` (cria a competição, `qry_Competicao.Append`) → `UDefinirParticipantes` (sorteio das classificadas por continente) → `USorteioGrupos` (potes e grupos) → `UnitChaveamento` (jogos, classificação e mata-mata). Os formulários filhos são embutidos em `pnlParent` do formulário principal.
- As queries montam SQL por concatenação de strings (`'... where CODIGO = ' + QuotedStr(...)`) reaproveitando `dmPrincipal.qry_Times`; lembre de que isso altera o SQL dessa query compartilhada.
- `src/forms/UnitChaveamento(1).pas/.dfm` é uma cópia solta (o `.pas` está vazio) e não faz parte do projeto — o `.dpr` usa só `UnitChaveamento.pas`.

## Arquitetura — Web (`web/`)

Scripts clássicos (não ES modules, para funcionar por `file://`), todos registrando no namespace `window.SIM`. **A ordem dos `<script>` em [web/index.html](web/index.html) importa** e é espelhada em [web/tests.html](web/tests.html); um arquivo novo precisa entrar nos dois (menos páginas de UI, que só vão no `index.html`).

- **Times** (`js/data/`): seleções, clubes brasileiros (com divisão A/B/C/D) e europeus, registrados por `SIM.addTeam` em `SIM.TEAMS`. O id é a sigla para seleções (`ARG`) e `PAÍS-SIGLA` para clubes (`BRA-FLA`, `ENG-LIV`). `rating` é o Elo atual; `ratingInicial` e `divisaoInicial` guardam os valores do seed. Os ratings das seleções vieram do projeto de referência ou de um ajuste linear sobre a antiga força 0–100.
- **Núcleo** (`js/core/`): `rng` (mulberry32, com estado retomável), `elo`, `match` (placar por Poisson, prorrogação, pênaltis), `standings` (critérios `fifa2026`/`uefa`/`cbf`; o último desempate usa `ed.sorteio[id]`, fixo por edição, para a tabela não mudar entre renders), `schedule` e `draw` (potes, pares A×B, sorteio aberto, fase de liga suíça).
- **Duas decisões do modelo de rating** (não desfaça sem medir; os testes cobrem ambas):
  - O placar sai de `SIM.elo.forca(t)` = `ratingInicial + 0,5·(rating − ratingInicial)`, não do rating. Com o próprio rating o Elo vira passeio aleatório sem âncora e os times fogem para 3000+.
  - `eloDelta` desconta `vies(dr)` = E[G·(W−We)], calculado sobre o modelo de Poisson. Sem isso, o multiplicador de gols faz o favorito ganhar rating em média a cada jogo.
- **Persistência** ([js/store.js](web/js/store.js)): o IndexedDB `sim-futebol` é lido inteiro para a memória no boot. `kv/meta` guarda seq, próximo id e os ratings/divisões que diferem do seed; `edicoes` guarda uma edição por registro, **com todos os jogos dentro**. Não há tabela de partidas: o índice por time (`jogosDoTime`, `todosOsJogos`) é montado sob demanda e memorizado por `store.rev`, que precisa subir a cada alteração (`salvar*` já faz isso). A migração do formato antigo (`localStorage` `wc-sim-history-v1`) roda uma vez (`meta.migrado`).
- **Motor** ([js/comps/common.js](web/js/comps/common.js)): uma edição tem `jogos[]` (com `n` = índice + 1, `bloco` = rodada ou fase, e `ida` apontando para o jogo de ida na volta de um confronto), `etapa`, `sorteioPendente`, `participantes`, `resultado` e `rngEstado`. `jogar()` atualiza os ratings na hora. Quando não há próximo jogo, o motor chama `def.avancar` (que cria os jogos seguintes ou define `sorteioPendente`) e, se `def.terminou`, `def.finalizar`. Descartar uma edição reverte os deltas dos jogos dela. O contrato de cada competição está documentado no topo do arquivo.
- **Competições** (`js/comps/`): `copa` (sede → eliminatórias → sorteio pote a pote → jogos; o mata-mata usa códigos de origem `1A`, `3:ABCDF`, `W74`, `L101` resolvidos em `aposJogo`), `brasileirao` (acesso e descenso alteram `t.divisao`), `copa-brasil` (diretos nas oitavas = top 8 do último Brasileirão) e `champions` (`equilibrarPotes` garante no máximo 4 clubes de um país por pote; com 5 o sorteio suíço não tem solução).
- **UI**: [js/app.js](web/js/app.js) é o roteador por hash (`#/competicao/<tipo>`, `#/edicao/<id>`, `#/rankings/<aba>`, `#/time/<id>`, `#/confronto/<a>/<b>`, …). `render()` reconstrói o `#app` via `innerHTML` a cada ação. As interações usam `data-action` (clique), `data-change` e `data-input`, despachadas para `SIM.acoes`. Ações com prefixo `c:` vão para `def.acoes` da edição da página. As páginas ficam em `js/ui/pages/` e registram `SIM.paginas[nome]` e ações extras. Todo texto dinâmico passa por `esc()`. O estado só de interface fica em `SIM.estadoUi`.
- Bandeiras em `web/flags/` (cópia de `src/images/`). Os escudos dos clubes são SVG gerados a partir de `cores` e `padrao` (`SIM.ui.escudo`).
