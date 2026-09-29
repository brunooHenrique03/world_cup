// Rankings: seleções, clubes europeus e clubes brasileiros, com filtro, busca, variação e forma recente.
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;
  const ui = () => SIM.estadoUi;

  /** Opções do filtro de cada aba: [valor, rótulo, teste]. */
  function filtros(aba) {
    if (aba === 'selecoes') return SIM.CONFEDERACOES.map((c) => [c.id, c.nome, (t) => t.conf === c.id]);
    if (aba === 'brasil') return ['A', 'B', 'C', 'D'].map((d) => [d, d === 'D' ? 'Outros (Série D)' : `Série ${d}`, (t) => t.divisao === d]);
    const paises = [...new Set(Object.values(SIM.TEAMS).filter((t) => t.tipo === 'clube' && t.conf === 'UEFA').map((t) => t.pais))];
    const nome = (p) => (SIM.T(p) ? SIM.T(p).nome : p);
    return paises.sort((a, b) => nome(a).localeCompare(nome(b), SIM.LOCALE)).map((p) => [p, nome(p), (t) => t.pais === p]);
  }

  const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  SIM.paginas.rankings = {
    titulo: () => 'Rankings',
    render(aba = 'selecoes') {
      const grupos = SIM.stats.GRUPOS_RANKING;
      if (!grupos[aba]) aba = 'selecoes';
      const opcoes = filtros(aba);
      const filtroAtual = opcoes.find(([v]) => v === ui().rankingFiltro);
      const busca = semAcento(ui().rankingBusca.trim());
      const todos = SIM.stats.ranking(grupos[aba].filtro);
      const titulos = SIM.stats.titulos();
      const linhas = todos
        .map((id, i) => ({ id, pos: i + 1 }))
        .filter(({ id }) => (!filtroAtual || filtroAtual[2](T(id))) && (!busca || semAcento(T(id).nome).includes(busca) || semAcento(T(id).codigo).includes(busca)));

      return `<section class="stage-head"><p class="eyebrow">Ranking Elo</p><h1>Rankings</h1>
          <p class="lede">O rating muda a cada partida: vence quem ganha pontos do adversário, e zebras valem mais. A variação é em relação ao rating inicial.</p></section>
        <nav class="tabs" role="tablist">${Object.entries(grupos).map(([id, g]) => `<a role="tab" aria-selected="${id === aba}" class="tab ${id === aba ? 'on' : ''}" href="#/rankings/${id}">${esc(g.rotulo)}</a>`).join('')}</nav>
        <div class="toolbar">
          <label class="select"><span class="sr-only">Filtrar</span><select data-change="rk-filtro">
            <option value="">${aba === 'selecoes' ? 'Todas as confederações' : aba === 'brasil' ? 'Todas as divisões' : 'Todos os países'}</option>
            ${opcoes.map(([v, r]) => `<option value="${esc(v)}" ${filtroAtual && filtroAtual[0] === v ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></label>
          <label class="search">${SIM.icone('buscar')}<span class="sr-only">Buscar time</span>
            <input id="rk-busca" type="search" placeholder="Buscar time" value="${esc(ui().rankingBusca)}" data-input="rk-busca" autocomplete="off"></label>
          <span class="spacer"></span><span class="muted small">${linhas.length} de ${todos.length}</span>
        </div>
        <section class="card"><div class="table-scroll"><table class="data ranking">
          <thead><tr><th>#</th><th class="l">Time</th><th class="l hide-sm">${aba === 'selecoes' ? 'Confederação' : aba === 'brasil' ? 'UF · Divisão' : 'País'}</th>
            <th class="l">Rating</th><th title="Desde o rating inicial">Variação</th><th class="hide-sm" title="Nos últimos 10 jogos">Últ. 10</th><th>Forma</th><th class="hide-sm">Jogos</th><th title="Títulos">${SIM.icone('taca')}</th></tr></thead>
          <tbody>${linhas.length ? linhas.map(({ id, pos }) => {
            const t = T(id);
            const varTotal = t.rating - t.ratingInicial;
            const rec = SIM.stats.variacaoRecente(id);
            const nJogos = SIM.store.jogosDoTime(id).length;
            const tit = titulos[id];
            return `<tr><td class="rank ${pos <= 3 ? 'top' : ''}">${pos}</td><td class="l">${SIM.ui.nomeTime(id)}</td>
              <td class="l hide-sm muted small">${esc(SIM.ui.contexto(t))}</td>
              <td class="l"><span class="rating-cell"><b>${SIM.fmtRating(t.rating)}</b>${SIM.ui.barraRating(t.rating)}</span></td>
              <td><span class="delta ${SIM.ui.deltaCls(varTotal)}">${nJogos ? SIM.fmtDelta(varTotal) : '–'}</span></td>
              <td class="hide-sm"><span class="delta ${SIM.ui.deltaCls(rec)}">${nJogos ? SIM.fmtDelta(rec) : '–'}</span></td>
              <td>${SIM.ui.forma(id)}</td><td class="hide-sm">${nJogos}</td><td>${tit ? `<b>${tit.total}</b>` : '<span class="muted">–</span>'}</td></tr>`;
          }).join('') : `<tr><td colspan="9" class="empty-row">Nenhum time encontrado.</td></tr>`}</tbody></table></div></section>`;
    },
  };

  Object.assign(SIM.acoes, {
    'rk-filtro'(el) { ui().rankingFiltro = el.value; },
    'rk-busca'(el) { ui().rankingBusca = el.value; },
  });
})(window.SIM);
