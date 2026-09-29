// Copa do Brasil: 72 clubes, mata-mata do início ao fim, com um sorteio a cada fase.
// 1ª fase: jogo único na casa do mais fraco; o visitante (mais forte) avança com o empate.
// 2ª fase: jogo único na casa do mais fraco; empate vai aos pênaltis.
// 3ª fase em diante: ida e volta, sem gol fora; empate no agregado vai direto aos pênaltis.
// Os 8 melhores do último Brasileirão (ou do rating da Série A) entram direto nas oitavas.
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;
  const M = SIM.motor;
  const { K } = SIM.elo;
  const { potesAB, drawPairs, drawOpen } = SIM.sorteio;
  const DIRETOS = 8;

  const FASES = [
    { id: 'F1', nome: '1ª fase', regra: 'Jogo único na casa do mais fraco. O visitante, mais forte, avança com o empate.' },
    { id: 'F2', nome: '2ª fase', regra: 'Jogo único na casa do mais fraco. Empate vai para os pênaltis.' },
    { id: 'F3', nome: '3ª fase', regra: 'Ida e volta, pote A (mais fortes) contra pote B. O mais forte decide em casa.' },
    { id: 'OIT', nome: 'Oitavas de final', regra: 'Os 8 classificados da 3ª fase e os 8 que entraram direto. Pote A contra pote B, ida e volta.' },
    { id: 'QUA', nome: 'Quartas de final', regra: 'Sorteio aberto, ida e volta.' },
    { id: 'SEM', nome: 'Semifinal', regra: 'Sorteio aberto, ida e volta.' },
    { id: 'FIN', nome: 'Final', regra: 'Ida e volta. Empate no agregado vai para os pênaltis.' },
  ];
  const idaEVolta = (f) => !['F1', 'F2'].includes(f.id);

  function classificadosDiretos(ids) {
    const ultimo = SIM.store.ultimaConcluida('brasileirao');
    if (ultimo && ultimo.tabelaFinal) {
      const top = ultimo.tabelaFinal.slice(0, DIRETOS).filter((id) => ids.includes(id));
      if (top.length === DIRETOS) return top;
    }
    return SIM.porRating(ids.filter((id) => T(id).divisao === 'A')).slice(0, DIRETOS);
  }

  function iniciar(ed) {
    const ultima = SIM.store.concluidas('copaBrasil').slice(-1)[0];
    ed.numero = ultima ? ultima.numero + 1 : SIM.PRIMEIRA_TEMPORADA;
    ed.rotulo = `Copa do Brasil ${ed.numero}`;
    const clubes = Object.values(SIM.TEAMS).filter((t) => t.tipo === 'clube' && t.pais === 'BRA').map((t) => t.id);
    ed.participantes = SIM.porRating(clubes);
    ed.diretos = classificadosDiretos(clubes);
    ed.fase = -1;
  }

  /** Quem avançou na fase (jogo único: o jogo; ida e volta: a volta). */
  function classificadosDaFase(ed, f) {
    return ed.jogos.filter((j) => j.bloco === (idaEVolta(f) ? f.id + '-v' : f.id)).map((j) => j.avanca);
  }

  function sortearFase(ed, rng) {
    const i = ed.fase + 1;
    const f = FASES[i];
    let times;
    if (i === 0) times = ed.participantes.filter((id) => !ed.diretos.includes(id));
    else if (f.id === 'OIT') times = [...classificadosDaFase(ed, FASES[i - 1]), ...ed.diretos];
    else times = classificadosDaFase(ed, FASES[i - 1]);

    let pares;
    if (['QUA', 'SEM', 'FIN'].includes(f.id)) {
      pares = drawOpen(times, rng);
    } else {
      // Pote A (fortes) x pote B (fracos); o mais fraco manda o jogo único ou a ida.
      const [a, b] = potesAB(times);
      pares = drawPairs(a, b, rng).map(([forte, fraco]) => [fraco, forte]);
    }
    if (f.id === 'F1') {
      for (const [fraco, forte] of pares) M.criarJogo(ed, { bloco: 'F1', fase: f.nome, m: fraco, v: forte, k: K.copaDoBrasil, vantagemEmpate: forte });
    } else if (f.id === 'F2') {
      for (const [fraco, forte] of pares) M.criarJogo(ed, { bloco: 'F2', fase: f.nome, m: fraco, v: forte, k: K.copaDoBrasil, mataMata: 'penaltis' });
    } else {
      M.criarIdaEVolta(ed, pares, { bloco: f.id, fase: f.nome, k: K.copaDoBrasil, desempate: 'penaltis' });
    }
    ed.fase = i;
  }

  function avancar(ed) {
    if (ed.fase < FASES.length - 1) {
      const f = FASES[ed.fase + 1];
      ed.sorteioPendente = { titulo: `Sorteio: ${f.nome}`, texto: f.regra };
    }
  }

  function finalizar(ed) {
    const volta = ed.jogos[ed.jogos.length - 1];
    ed.campeao = M.quemAvanca(volta);
    ed.vice = M.quemCai(volta);
    const res = {};
    for (const f of FASES) {
      for (const j of ed.jogos.filter((x) => x.bloco === (idaEVolta(f) ? f.id + '-v' : f.id))) res[M.quemCai(j)] = f.nome;
    }
    res[ed.vice] = 'Vice-campeão';
    res[ed.campeao] = 'Campeão';
    ed.resultado = res;
  }

  function telaInicial(ed) {
    const outros = ed.participantes.filter((id) => !ed.diretos.includes(id));
    const ultimo = SIM.store.ultimaConcluida('brasileirao');
    return `<section class="stage-head"><p class="eyebrow">Copa do Brasil · ${ed.numero}</p><h1>72 clubes, uma taça</h1>
      <p class="lede">Mata-mata do início ao fim. Cada fase tem o seu sorteio: nas primeiras, pote A (mais fortes) contra pote B (mais fracos), com o mais fraco jogando em casa.</p></section>
      <section class="panel"><h2 class="section-title">Direto nas oitavas</h2>
        <p class="muted small">${ultimo && ultimo.tabelaFinal ? `Os 8 primeiros do ${esc(ultimo.rotulo)}.` : 'Sem Brasileirão concluído: os 8 clubes de maior rating da Série A.'}</p>
        <div class="club-grid">${ed.diretos.map((id) => `<div class="club-card">${SIM.ui.escudo(id, 'md')}<div class="grow"><b class="nm">${esc(T(id).nome)}</b><span class="muted small">${esc(SIM.ui.contexto(T(id)))}</span></div></div>`).join('')}</div>
      </section>
      <section class="panel"><h2 class="section-title">Disputam a 1ª fase <span class="pill">${outros.length}</span></h2>
        <ul class="chips">${outros.map((id) => `<li class="chip" title="${esc(T(id).nome)}">${SIM.ui.escudo(id)}${esc(T(id).codigo)}</li>`).join('')}</ul>
      </section>
      <div class="footer-actions"><button class="btn primary" data-action="c:primeira-fase">Sortear a 1ª fase</button></div>`;
  }

  function abaChave(ed) {
    const cols = FASES.slice(2).filter((f) => ed.jogos.some((j) => j.bloco === f.id)).map((f) => ({ titulo: f.nome, confrontos: SIM.ui.confrontosDaFase(ed, f.id) }));
    if (!cols.length) return SIM.ui.vazio('O chaveamento aparece a partir da 3ª fase.');
    return SIM.ui.chave(cols);
  }

  const BLOCOS = [['F1', '1ª fase'], ['F2', '2ª fase'], ['F3', '3ª fase · ida'], ['F3-v', '3ª fase · volta'], ['OIT', 'Oitavas · ida'], ['OIT-v', 'Oitavas · volta'],
    ['QUA', 'Quartas · ida'], ['QUA-v', 'Quartas · volta'], ['SEM', 'Semi · ida'], ['SEM-v', 'Semi · volta'], ['FIN', 'Final · ida'], ['FIN-v', 'Final · volta']];

  SIM.registrarCompeticao({
    tipo: 'copaBrasil', nome: 'Copa do Brasil', curto: 'Copa do Brasil', cor: 'teal', icone: 'taca',
    descricao: '72 clubes de todo o país. Mata-mata do início ao fim, com sorteio a cada fase e zebras garantidas.',
    detalhes: ['72 clubes', 'Jogo único e ida e volta', 'Pênaltis'],
    etapas: [['clubes', 'Clubes'], ['jogos', 'Mata-mata']],
    iniciar,
    preparacao: telaInicial,
    acoes: { 'primeira-fase'(ed, el, rng) { sortearFase(ed, rng); ed.etapa = 'jogos'; } },
    blocos: () => BLOCOS,
    rotuloJogo: (ed, j) => j.fase,
    tagJogo: (ed, j) => (j.perna ? (j.perna === 1 ? 'ida' : 'volta') : ''),
    abas: () => [['chave', 'Chaveamento', abaChave]],
    avancar,
    sortear: sortearFase,
    terminou: (ed) => ed.fase === FASES.length - 1 && ed.jogos.every((j) => j.jogado),
    finalizar,
    prepararAutomatico(ed, rng) { sortearFase(ed, rng); ed.etapa = 'jogos'; },
  });
})(window.SIM);
