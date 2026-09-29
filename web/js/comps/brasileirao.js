// Brasileirão Série A: 20 clubes, turno e returno (38 rodadas), critérios da CBF.
// No fim, os 4 últimos caem e 4 clubes sobem da Série B (sorteio ponderado pelo rating entre os melhores).
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;
  const M = SIM.motor;
  const { K } = SIM.elo;

  const ZONAS = [
    [1, 4, 'z-lib', 'Libertadores (fase de grupos)'],
    [5, 6, 'z-pre', 'Libertadores (fase preliminar)'],
    [7, 12, 'z-sul', 'Copa Sul-Americana'],
    [17, 20, 'z-reb', 'Rebaixado para a Série B'],
  ];
  const zona = (pos) => (ZONAS.find(([de, ate]) => pos >= de && pos <= ate) || [])[2] || '';

  const serie = (d) => Object.values(SIM.TEAMS).filter((t) => t.tipo === 'clube' && t.pais === 'BRA' && t.divisao === d).map((t) => t.id);
  const classificacao = (ed) => SIM.classificar(ed.participantes, ed.jogos, 'cbf', ed.sorteio);

  function iniciar(ed) {
    const ultima = SIM.store.concluidas('brasileirao').slice(-1)[0];
    ed.numero = ultima ? ultima.numero + 1 : SIM.PRIMEIRA_TEMPORADA;
    ed.rotulo = `Brasileirão ${ed.numero}`;
    ed.participantes = SIM.porRating(serie('A'));
  }

  function montarCalendario(ed, rng) {
    if (ed.participantes.length !== 20) throw new Error(`A Série A deveria ter 20 clubes, mas tem ${ed.participantes.length}.`);
    M.sortearLotes(ed, ed.participantes);
    SIM.calendario.doubleRoundRobin(ed.participantes, rng).forEach((rodada, r) => {
      for (const [a, b] of rodada) M.criarJogo(ed, { bloco: 'R' + (r + 1), fase: 'Pontos corridos', rodada: r + 1, m: a, v: b, k: K.brasileirao });
    });
    ed.etapa = 'jogos';
  }

  function finalizar(ed, rng) {
    const tab = classificacao(ed);
    ed.campeao = tab[0].id;
    ed.vice = tab[1].id;
    ed.terceiro = tab[2].id;
    ed.resultado = Object.fromEntries(tab.map((r, i) => [r.id, `${i + 1}º`]));
    ed.tabelaFinal = tab.map((r) => r.id);

    // Acesso e descenso: os 4 últimos caem; sobem 4 da Série B (ponderado pelo rating entre os 8 melhores).
    const rebaixados = tab.slice(16).map((r) => r.id);
    const promovidos = SIM.rng.sortearPonderado(serie('B'), 4, rng);
    for (const id of rebaixados) T(id).divisao = 'B';
    for (const id of promovidos) T(id).divisao = 'A';
    ed.rebaixados = rebaixados;
    ed.promovidos = promovidos;
  }

  function telaCalendario(ed) {
    return `<section class="stage-head"><p class="eyebrow">Série A · ${ed.numero}</p><h1>Os 20 clubes da temporada</h1>
      <p class="lede">Turno e returno em 38 rodadas. Desempate: pontos, vitórias, saldo de gols, gols pró e confronto direto. Os quatro últimos caem para a Série B.</p></section>
      <div class="club-grid">${ed.participantes.map((id, i) => `<div class="club-card">
        <span class="rank-n">${i + 1}</span>${SIM.ui.escudo(id, 'md')}<div class="grow"><b class="nm">${esc(T(id).nome)}</b><span class="muted small">${esc(T(id).uf)} · rating ${SIM.fmtRating(T(id).rating)}</span></div></div>`).join('')}</div>
      <div class="footer-actions"><button class="btn primary" data-action="c:calendario">Sortear a tabela e começar</button></div>`;
  }

  function abaClassificacao(ed) {
    const tab = classificacao(ed);
    const fim = ed.status === 'concluida';
    return `${SIM.ui.legenda(ZONAS.map(([, , cls, txt]) => [cls, txt]))}
      <section class="card">${SIM.ui.tabela(tab, { titulo: 'Clube', zona, extraTitulo: 'Forma', extra: (r) => formaNaEdicao(ed, r.id) })}</section>
      ${fim && ed.promovidos ? `<section class="panel"><h2 class="section-title">Acesso e descenso</h2>
        <div class="two-col"><div><p class="eyebrow">Caem para a Série B</p><ul class="plain">${ed.rebaixados.map((id) => `<li>${SIM.ui.nomeTime(id)}</li>`).join('')}</ul></div>
        <div><p class="eyebrow">Sobem da Série B</p><ul class="plain">${ed.promovidos.map((id) => `<li>${SIM.ui.nomeTime(id)}</li>`).join('')}</ul></div></div></section>` : ''}`;
  }

  function formaNaEdicao(ed, id) {
    const ult = ed.jogos.filter((j) => j.jogado && (j.m === id || j.v === id)).slice(-5);
    return `<span class="form">${ult.map((j) => `<i class="f-${SIM.ui.resultadoPara(j, id)}">${SIM.ui.resultadoPara(j, id)}</i>`).join('')}</span>`;
  }

  SIM.registrarCompeticao({
    tipo: 'brasileirao', nome: 'Brasileirão Série A', curto: 'Brasileirão', cor: 'green', icone: 'escudo',
    descricao: '20 clubes, 38 rodadas em pontos corridos, com rebaixamento e acesso entre temporadas.',
    detalhes: ['20 clubes', '38 rodadas', 'G4 / Z4'],
    etapas: [['clubes', 'Clubes'], ['jogos', 'Temporada']],
    iniciar,
    preparacao: telaCalendario,
    acoes: { calendario(ed, el, rng) { montarCalendario(ed, rng); } },
    blocos: () => Array.from({ length: 38 }, (_, i) => ['R' + (i + 1), String(i + 1)]),
    rotuloBlocos: 'Rodada',
    rotuloJogo: (ed, j) => `${j.rodada}ª rodada`,
    tagJogo: () => '',
    abas: () => [['tabela', 'Classificação', abaClassificacao]],
    abaInicial: 'tabela',
    avancar() {},
    terminou: (ed) => ed.jogos.length === 380 && ed.jogos.every((j) => j.jogado),
    finalizar,
    prepararAutomatico(ed, rng) { montarCalendario(ed, rng); },
    ZONAS, classificacao,
  });
})(window.SIM);
