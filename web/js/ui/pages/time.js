// Página do time (evolução do rating, títulos, campanhas, últimos jogos) e confronto direto.
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;
  const ui = () => SIM.estadoUi;

  function linhaJogoDoTime({ ed, j }, id) {
    const outro = j.m === id ? j.v : j.m;
    const casa = j.m === id;
    const r = SIM.ui.resultadoPara(j, id);
    const delta = casa ? j.delta : -j.delta;
    const pen = j.penM !== null ? ` <small class="muted">(${casa ? j.penM : j.penV}–${casa ? j.penV : j.penM} pên.)</small>` : j.prorr ? ' <small class="muted">prorr.</small>' : '';
    return `<tr><td><span class="form"><i class="f-${r}">${r}</i></span></td>
      <td class="l">${SIM.ui.nomeTime(outro)} <span class="muted small">${casa ? 'em casa' : j.neutro ? 'neutro' : 'fora'}</span></td>
      <td><b>${casa ? j.gm : j.gv}–${casa ? j.gv : j.gm}</b>${pen}</td>
      <td class="l hide-sm"><a class="link small" href="#/edicao/${ed.id}">${esc(ed.rotulo)}</a><br><span class="muted small">${esc(j.fase)}${j.rodada ? ` · ${j.rodada}ª rodada` : ''}</span></td>
      <td><span class="delta ${SIM.ui.deltaCls(delta)}">${SIM.fmtDelta(delta)}</span></td></tr>`;
  }

  function tabelaJogos(refs, id) {
    return `<div class="table-scroll"><table class="data games"><thead><tr><th></th><th class="l">Adversário</th><th>Placar</th><th class="l hide-sm">Competição</th><th>Rating</th></tr></thead>
      <tbody>${refs.map((r) => linhaJogoDoTime(r, id)).join('')}</tbody></table></div>`;
  }

  SIM.paginas.time = {
    titulo: (id) => (T(id) ? T(id).nome : 'Time'),
    render(id) {
      const t = T(id);
      if (!t) return SIM.ui.vazio('Time não encontrado.');
      const grupo = SIM.stats.grupoDoTime(t);
      const rank = SIM.stats.ranking(SIM.stats.GRUPOS_RANKING[grupo].filtro);
      const pos = rank.indexOf(id) + 1;
      const jogos = SIM.store.jogosDoTime(id);
      const ret = SIM.stats.retrospecto(id);
      const tit = SIM.stats.titulos()[id];
      const pontos = jogos.length ? [{ y: jogos[0].j.m === id ? jogos[0].j.rM : jogos[0].j.rV }, ...jogos.map(({ j }) => ({ y: (j.m === id ? j.rM + j.delta : j.rV - j.delta) }))] : [];
      const campanhas = SIM.store.edicoes.filter((ed) => ed.participantes.includes(id) || (ed.resultado && ed.resultado[id]) || ed.campeao === id).slice().reverse();
      const varTotal = t.rating - t.ratingInicial;

      return `<section class="team-head">
          <div class="team-badge">${SIM.ui.escudo(id, 'xl')}</div>
          <div class="grow"><p class="eyebrow">${esc(SIM.stats.GRUPOS_RANKING[grupo].rotulo)} · ${esc(SIM.ui.contexto(t))}</p>
            <h1>${esc(t.nome)} <span class="code">${esc(t.codigo)}</span></h1>
            <div class="row wrap-row"><a class="btn ghost small" href="#/rankings/${grupo}">${pos}º no ranking</a>
              <a class="btn ghost small" href="#/confronto/${encodeURIComponent(id)}">${SIM.icone('espadas')} Confronto direto</a></div>
          </div>
        </section>
        <section class="stat-grid">
          <div class="stat"><span class="stat-n">${SIM.fmtRating(t.rating)}</span><span class="stat-l">rating atual</span></div>
          <div class="stat"><span class="stat-n delta ${SIM.ui.deltaCls(varTotal)}">${SIM.fmtDelta(varTotal)}</span><span class="stat-l">desde o início (${SIM.fmtRating(t.ratingInicial)})</span></div>
          <div class="stat"><span class="stat-n">${ret.v}-${ret.e}-${ret.d}</span><span class="stat-l">vitórias, empates e derrotas</span></div>
          <div class="stat"><span class="stat-n">${tit ? tit.total : 0}</span><span class="stat-l">${tit && tit.total === 1 ? 'título' : 'títulos'}${tit && tit.vices ? ` · ${tit.vices} vice${tit.vices > 1 ? 's' : ''}` : ''}</span></div>
        </section>
        <section class="panel"><h2 class="section-title">Evolução do rating</h2>${SIM.ui.graficoRating(pontos, t.ratingInicial)}</section>
        ${tit ? `<section class="panel"><h2 class="section-title">Títulos</h2><ul class="trophy-list">${Object.entries(tit.porTipo).map(([tipo, n]) =>
          `<li class="comp-${tipo}">${SIM.emblema(tipo)}<b>${n}×</b> ${esc(SIM.COMPETICOES[tipo].nome)}</li>`).join('')}</ul></section>` : ''}
        ${campanhas.length ? `<section class="panel"><h2 class="section-title">Campanhas</h2><div class="table-scroll"><table class="data history">
          <thead><tr><th class="l">Edição</th><th class="l">Campanha</th><th class="hide-sm">Jogos</th></tr></thead>
          <tbody>${campanhas.map((ed) => `<tr><td class="l"><span class="team">${SIM.emblema(ed.tipo, 'sm')}<a class="nm link" href="#/edicao/${ed.id}">${esc(ed.rotulo)}</a></span></td>
            <td class="l">${ed.campeao === id ? `<b class="gold-text">${SIM.icone('taca')} Campeão</b>` : esc((ed.resultado && ed.resultado[id]) || (ed.status === 'andamento' ? 'Em andamento' : '–'))}</td>
            <td class="hide-sm">${ed.jogos.filter((j) => j.jogado && (j.m === id || j.v === id)).length}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
        <section class="panel"><h2 class="section-title">Últimos jogos</h2>
          ${jogos.length ? tabelaJogos(jogos.slice(-15).reverse(), id) : SIM.ui.vazio('Nenhum jogo disputado ainda.')}</section>`;
    },
  };

  // ---------- confronto direto ----------
  function seletor(nome, valor, outro) {
    const grupos = Object.entries(SIM.stats.GRUPOS_RANKING).map(([, g]) => `<optgroup label="${esc(g.rotulo)}">${Object.values(SIM.TEAMS).filter(g.filtro)
      .sort((a, b) => a.nome.localeCompare(b.nome, SIM.LOCALE))
      .map((t) => `<option value="${t.id}" ${t.id === valor ? 'selected' : ''} ${t.id === outro ? 'disabled' : ''}>${esc(t.nome)}${t.tipo === 'clube' ? ` (${esc(t.pais === 'BRA' ? t.uf : t.pais)})` : ''}</option>`).join('')}</optgroup>`).join('');
    return `<label class="select big-select"><span class="sr-only">${nome}</span><select data-change="cd-${nome}"><option value="">Escolha um time…</option>${grupos}</select></label>`;
  }

  /** Par padrão: o time dado contra o adversário que ele mais enfrentou (ou o 2º do ranking). */
  function padrao(a) {
    const jogos = a ? SIM.store.jogosDoTime(a) : [];
    if (a && jogos.length) {
      const cont = {};
      for (const { j } of jogos) { const o = j.m === a ? j.v : j.m; cont[o] = (cont[o] || 0) + 1; }
      return Object.entries(cont).sort((x, y) => y[1] - x[1])[0][0];
    }
    return null;
  }

  SIM.paginas.confronto = {
    titulo: () => 'Confronto direto',
    render(a, b) {
      if (a && !T(a)) a = null;
      if (b && !T(b)) b = null;
      if (!a) {
        const top = SIM.stats.ranking(SIM.stats.GRUPOS_RANKING.selecoes.filtro);
        a = top[0];
        b = b || top[1];
      }
      if (!b) b = padrao(a) || SIM.stats.ranking((t) => SIM.stats.grupoDoTime(t) === SIM.stats.grupoDoTime(T(a)) && t.id !== a)[0];
      ui().confronto = { a, b };
      const ret = a && b ? SIM.stats.retrospecto(a, b) : null;
      const lado = (id, v, gols) => `<div class="h2h-side">${SIM.ui.escudo(id, 'lg')}<b>${esc(T(id).nome)}</b><span class="h2h-n">${v}</span><span class="muted small">vitórias · ${gols} gols</span></div>`;
      return `<section class="stage-head"><p class="eyebrow">Retrospecto</p><h1>Confronto direto</h1>
          <p class="lede">Escolha dois times para ver todos os jogos entre eles, em todas as competições.</p></section>
        <div class="h2h-pickers">${seletor('a', a, b)}<span class="vs-tag">x</span>${seletor('b', b, a)}</div>
        ${ret ? `<section class="h2h">
            ${lado(a, ret.v, ret.gp)}
            <div class="h2h-mid"><span class="h2h-n muted">${ret.e}</span><span class="muted small">empates</span><span class="small">${ret.j} ${ret.j === 1 ? 'jogo' : 'jogos'}</span></div>
            ${lado(b, ret.d, ret.gc)}
          </section>
          <section class="panel"><h2 class="section-title">Jogos</h2>${ret.j ? tabelaJogos(ret.jogos.slice().reverse(), a) : SIM.ui.vazio('Esses times ainda não se enfrentaram.')}</section>`
        : SIM.ui.vazio('Escolha os dois times.')}`;
    },
  };

  const rotaConfronto = (a, b) => `#/confronto/${encodeURIComponent(a)}${b && b !== a ? '/' + encodeURIComponent(b) : ''}`;
  Object.assign(SIM.acoes, {
    'cd-a'(el) { if (el.value) SIM.ir(rotaConfronto(el.value, (ui().confronto || {}).b)); },
    'cd-b'(el) { if (el.value) SIM.ir(rotaConfronto((ui().confronto || {}).a, el.value)); },
  });
})(window.SIM);
