# world_cup
Projeto de um Simulador de Futebol

## Versão web (`web/`)

Abra `web/index.html` no navegador. Não precisa instalar nada nem compilar. Também funciona servido por qualquer servidor estático:

```bash
python -m http.server -d web
```

### Competições

Todas são interativas: você faz os sorteios e joga partida a partida, uma rodada ou fase de cada vez, ou simula tudo até o fim.

- **Copa do Mundo**: 48 seleções. Escolha ou sorteio da sede, eliminatórias por confederação, sorteio dos grupos pote a pote, 8 melhores terceiros e mata-mata dos 16 avos até a final.
- **Brasileirão Série A**: 20 clubes em turno e returno, com os critérios de desempate da CBF. Os 4 últimos caem e 4 clubes sobem da Série B para a temporada seguinte.
- **Copa do Brasil**: 72 clubes, com sorteio a cada fase. Os 8 primeiros do último Brasileirão entram direto nas oitavas.
- **Champions League**: 36 clubes. Fase de liga no modelo suíço, playoff, mata-mata em ida e volta e final única.

### Páginas

- **Início**: as competições, com a opção de começar ou continuar cada uma, os números gerais, os campeões vigentes e o top 5 dos rankings.
- **Rankings**: seleções, clubes europeus e brasileiros, com filtro, busca, variação do rating e forma recente.
- **Histórico**: todas as edições, com jogos, classificação, chaveamento e campanha de cada participante.
- **Time**: gráfico da evolução do rating, títulos, campanhas e últimos jogos.
- **Confronto direto** e **Campeões**.
- **Configurações**: exportar e importar backup, resetar ratings e apagar tudo.

### Como funciona

- **Rating Elo**: `Rn = Ro + K·(G·(W − We) − viés)`, com K por competição: Copa 60, mata-mata da Champions 50, fase de liga da Champions e Copa do Brasil 40, Brasileirão 30. O mando de campo vale +100, e a sede da Copa tem esse bônus em todos os jogos.
- **Placar**: gols por Poisson a partir da força em campo, que é o rating inicial somado à metade da fase atual. Um time em boa fase joga melhor, mas o rating tende a voltar à qualidade real do elenco.
- **Dados**: ficam no navegador (IndexedDB). Use **Configurações → Exportar backup** para não perder nada.

Os testes rodam em `web/tests.html`.

## Versão Delphi (`src/`)

É a versão original, só com a Copa do Mundo, em Delphi VCL com banco Firebird (`database/BASE.FDB`).
