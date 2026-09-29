// Champions League (formato novo): fase de liga com 36 clubes (modelo suíço, 8 rodadas),
// playoff do 9º ao 24º, oitavas, quartas e semifinal em ida e volta (prorrogação e pênaltis)
// e final única em campo neutro.
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;
  const M = SIM.motor;
  const { K } = SIM.elo;
  const { makePots, drawPairs, drawOpen, drawSwissLeague, scheduleRounds } = SIM.sorteio;
  const PRIMEIRA_TEMPORADA = 2026;
  const N = 36;

  const FASES = [
    { id: 'LIGA', nome: 'Fase de liga' },
    { id: 'PO', nome: 'Playoff', regra: 'Do 9º ao 16º (cabeças) contra do 17º ao 24º. O cabeça decide em casa.' },
    { id: 'OIT', nome: 'Oitavas de final', regra: 'Os 8 primeiros da fase de liga contra os vencedores do playoff. Os 8 primeiros decidem em casa.' },
    { id: 'QUA', nome: 'Quartas de final', regra: 'Sorteio aberto, ida e volta.' },
    { id: 'SEM', nome: 'Semifinal', regra: 'Sorteio aberto, ida e volta.' },
    { id: 'FIN', nome: 'Final', regra: 'Jogo único em campo neutro, com prorrogação e pênaltis.' },
  ];
  const ZONAS = [[1, 8, 'z-lib', 'Oitavas de final'], [9, 24, 'z-sul', 'Playoff'], [25, 36, 'z-reb', 'Eliminado']];
  const zona = (pos) => (ZONAS.find(([de, ate]) => pos >= de && pos <= ate) || [])[2] || '';

  const temporada = (ano) => `${ano}/${String((ano + 1) % 100).padStart(2, '0')}`;

  /** Campeão vigente + melhores clubes pelo rating, respeitando o limite de vagas por país. */
  function participantes() {
    const clubes = SIM.porRating(Object.values(SIM.TEAMS).filter((t) => t.tipo === 'clube' && t.conf === 'UEFA').map((t) => t.id));
    const anterior = SIM.store.ultimaConcluida('champions');
    const detentor = anterior && anterior.campeao && clubes.includes(anterior.campeao) ? anterior.campeao : null;
    const lista = [];
    const porPais = {};
    const add = (id) => { lista.push(id); porPais[T(id).pais] = (porPais[T(id).pais] || 0) + 1; };
    if (detentor) add(detentor);
    for (const id of clubes) {
      if (lista.length >= N) break;
      if (id === detentor) continue;
      if ((porPais[T(id).pais] || 0) >= (SIM.VAGAS_POR_PAIS[T(id).pais] ?? SIM.VAGAS_PADRAO)) continue;
      add(id);
    }
    return { lista, detentor };
  }

  /**
   * Cada clube enfrenta 2 rivais do próprio pote, nunca compatriotas. Com n clubes de um país
   * num pote de 9, eles precisam de 2n jogos contra os (9 − n) de outros países, que aceitam no
   * máximo 2 cada: só há solução com n ≤ 4. Se um país passar disso, o seu clube mais fraco
   * no pote troca de lugar com o melhor clube de outro país do pote vizinho.
   */
  const MAX_POR_PAIS_NO_POTE = 4;
  function equilibrarPotes(potes, detentor) {
    for (let guarda = 0; guarda < 50; guarda++) {
      let trocou = false;
      potes.forEach((pote, p) => {
        const cont = {};
        for (const id of pote) cont[T(id).pais] = (cont[T(id).pais] || 0) + 1;
        const pais = Object.keys(cont).find((c) => cont[c] > MAX_POR_PAIS_NO_POTE);
        if (!pais) return;
        const viz = p < potes.length - 1 ? p + 1 : p - 1;
        const sai = SIM.porRating(pote.filter((id) => T(id).pais === pais && id !== detentor)).pop();
        const candidatos = SIM.porRating(potes[viz].filter((id) => T(id).pais !== pais));
        const entra = viz > p ? candidatos[0] : candidatos[candidatos.length - 1];
        pote[pote.indexOf(sai)] = entra;
        potes[viz][potes[viz].indexOf(entra)] = sai;
        trocou = true;
      });
      if (!trocou) break;
    }
    return potes;
  }

  function iniciar(ed) {
    const ultima = SIM.store.concluidas('champions').slice(-1)[0];
    ed.numero = ultima ? ultima.numero + 1 : PRIMEIRA_TEMPORADA;
    ed.rotulo = `Champions League ${temporada(ed.numero)}`;
    const { lista, detentor } = participantes();
    ed.participantes = lista;
    ed.detentor = detentor;
    ed.potes = equilibrarPotes(makePots(lista, 4, detentor ? [detentor] : []), detentor);
    ed.fase = -1;
  }

  const classificacao = (ed) => SIM.classificar(ed.participantes, ed.jogos.filter((j) => j.bloco && j.bloco[0] === 'L'), 'uefa', ed.sorteio);
  const vencedores = (ed, id) => ed.jogos.filter((j) => j.bloco === id + '-v').map((j) => j.avanca);

  function sortearLiga(ed, rng) {
    let rodadas = null;
    for (let i = 0; i < 30 && !rodadas; i++) rodadas = scheduleRounds(drawSwissLeague(ed.potes, rng), 8, rng);
    if (!rodadas) throw new Error('Não foi possível montar o calendário da fase de liga.');
    M.sortearLotes(ed, ed.participantes);
    rodadas.forEach((jogos, r) => {
      for (const [a, b] of jogos) M.criarJogo(ed, { bloco: 'L' + (r + 1), fase: 'Fase de liga', rodada: r + 1, m: a, v: b, k: K.uclLiga });
    });
    ed.fase = 0;
    ed.etapa = 'jogos';
  }

  function sortearFase(ed, rng) {
    const i = ed.fase + 1;
    const f = FASES[i];
    const o = { bloco: f.id, fase: f.nome, k: K.uclMataMata, desempate: 'prorrogacao' };
    if (f.id === 'PO') {
      const tab = classificacao(ed).map((r) => r.id);
      ed.tabelaLiga = tab;
      // Cabeças (9º–16º) x (17º–24º); o cabeça decide em casa.
      M.criarIdaEVolta(ed, drawPairs(tab.slice(8, 16), tab.slice(16, 24), rng).map(([c, o2]) => [o2, c]), o);
    } else if (f.id === 'OIT') {
      M.criarIdaEVolta(ed, drawPairs(ed.tabelaLiga.slice(0, 8), vencedores(ed, 'PO'), rng).map(([t, p]) => [p, t]), o);
    } else if (f.id === 'FIN') {
      const [a, b] = SIM.rng.shuffle(vencedores(ed, 'SEM'), rng);
      M.criarJogo(ed, { bloco: 'FIN', fase: 'Final', m: a, v: b, k: K.uclMataMata, neutro: true, mataMata: 'prorrogacao' });
    } else {
      M.criarIdaEVolta(ed, drawOpen(vencedores(ed, FASES[i - 1].id), rng), o);
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
    const final = ed.jogos[ed.jogos.length - 1];
    ed.campeao = M.quemAvanca(final);
    ed.vice = M.quemCai(final);
    const res = {};
    const tab = ed.tabelaLiga || classificacao(ed).map((r) => r.id);
    tab.forEach((id, i) => { res[id] = i >= 24 ? `Fase de liga (${i + 1}º)` : 'Fase de liga'; });
    for (const f of FASES.slice(1, -1)) for (const j of ed.jogos.filter((x) => x.bloco === f.id + '-v')) res[M.quemCai(j)] = f.nome;
    res[ed.vice] = 'Vice-campeão';
    res[ed.campeao] = 'Campeão';
    ed.resultado = res;
  }

  function telaPotes(ed) {
    return `<section class="stage-head"><p class="eyebrow">Champions League · ${temporada(ed.numero)}</p><h1>Sorteio da fase de liga</h1>
      <p class="lede">Os 36 clubes são divididos em 4 potes pelo rating${ed.detentor ? ' (o campeão vigente é cabeça do pote 1)' : ''}. Cada clube enfrenta 2 adversários de cada pote, um em casa e um fora, sem rivais do mesmo país e com no máximo 2 do mesmo país.</p></section>
      <div class="pots">${ed.potes.map((p, i) => `<section class="pot">
        <h3>Pote ${i + 1}</h3>
        <ul class="plain pot-list">${p.map((id) => `<li>${SIM.ui.escudo(id)}<span class="nm">${esc(T(id).nome)}</span>${id === ed.detentor ? '<span class="tag">Detentor</span>' : `<span class="conf-tag">${esc(T(id).pais)}</span>`}</li>`).join('')}</ul>
      </section>`).join('')}</div>
      <div class="footer-actions"><button class="btn primary" data-action="c:sortear-liga">Sortear a fase de liga</button></div>`;
  }

  function abaLiga(ed) {
    return `${SIM.ui.legenda(ZONAS.map(([, , cls, txt]) => [cls, txt]))}
      <section class="card">${SIM.ui.tabela(classificacao(ed), { titulo: 'Clube', zona })}</section>`;
  }

  function abaChave(ed) {
    const cols = FASES.slice(1, -1).filter((f) => ed.jogos.some((j) => j.bloco === f.id)).map((f) => ({ titulo: f.nome, confrontos: SIM.ui.confrontosDaFase(ed, f.id) }));
    if (ed.jogos.some((j) => j.bloco === 'FIN')) cols.push({ titulo: 'Final', confrontos: SIM.ui.confrontosDaFase(ed, 'FIN') });
    if (!cols.length) return SIM.ui.vazio('O mata-mata começa depois da fase de liga.');
    return SIM.ui.chave(cols);
  }

  const BLOCOS = [
    ...Array.from({ length: 8 }, (_, i) => ['L' + (i + 1), `${i + 1}ª rodada`]),
    ['PO', 'Playoff · ida'], ['PO-v', 'Playoff · volta'], ['OIT', 'Oitavas · ida'], ['OIT-v', 'Oitavas · volta'],
    ['QUA', 'Quartas · ida'], ['QUA-v', 'Quartas · volta'], ['SEM', 'Semi · ida'], ['SEM-v', 'Semi · volta'], ['FIN', 'Final'],
  ];

  SIM.registrarCompeticao({
    tipo: 'champions', nome: 'Champions League', curto: 'Champions', cor: 'indigo', icone: 'estrela',
    descricao: 'A elite dos clubes europeus: fase de liga no modelo suíço, playoff e mata-mata em ida e volta.',
    detalhes: ['36 clubes', 'Modelo suíço', 'Final única'],
    etapas: [['potes', 'Potes'], ['jogos', 'Temporada']],
    iniciar,
    preparacao: telaPotes,
    acoes: { 'sortear-liga'(ed, el, rng) { sortearLiga(ed, rng); } },
    blocos: () => BLOCOS,
    rotuloJogo: (ed, j) => (j.rodada ? `Fase de liga · ${j.rodada}ª rodada` : j.fase + (j.neutro ? ' · campo neutro' : '')),
    tagJogo: (ed, j) => (j.perna ? (j.perna === 1 ? 'ida' : 'volta') : j.bloco === 'FIN' ? 'Final' : ''),
    abas: () => [['liga', 'Fase de liga', abaLiga], ['chave', 'Mata-mata', abaChave]],
    avancar,
    sortear: sortearFase,
    terminou: (ed) => ed.fase === FASES.length - 1 && ed.jogos.every((j) => j.jogado),
    finalizar,
    prepararAutomatico(ed, rng) { sortearLiga(ed, rng); },
    temporada,
  });
})(window.SIM);
