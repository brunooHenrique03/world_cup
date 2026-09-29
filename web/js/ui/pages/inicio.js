// Menu inicial: competições (nova edição ou continuar), números gerais, campeões vigentes e top 5 dos rankings.
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;

  function progresso(ed) {
    const def = SIM.def(ed);
    if (ed.etapa !== 'jogos') {
      const et = def.etapas.find(([id]) => id === ed.etapa);
      return { texto: `Preparação: ${et ? et[1].toLowerCase() : ''}`, pct: 0 };
    }
    const jogados = ed.jogos.filter((j) => j.jogado).length;
    const prox = SIM.motor.proximoJogo(ed);
    const fase = ed.sorteioPendente ? ed.sorteioPendente.titulo : prox ? def.rotuloJogo(ed, prox) : '';
    // Nas copas, os jogos futuros só existem depois dos sorteios: estima pelo total conhecido do formato.
    const total = { copa: 104, brasileirao: 380, copaBrasil: 94, champions: 189 }[ed.tipo] || ed.jogos.length;
    return { texto: `${fase} · ${jogados} de ${total} jogos`, pct: Math.round((jogados / total) * 100) };
  }

  function cardCompeticao(tipo) {
    const def = SIM.COMPETICOES[tipo];
    const ed = SIM.store.emAndamento(tipo);
    const ultima = SIM.store.concluidas(tipo).slice(-1)[0];
    const p = ed && progresso(ed);
    return `<article class="comp-card comp-${tipo}">
      <a class="comp-card-link" href="#/competicao/${tipo}" aria-label="${esc(def.nome)}${ed ? ': continuar ' + esc(ed.rotulo) : ''}"></a>
      <div class="comp-card-top">${SIM.emblema(tipo, 'lg')}${ed ? '<span class="pill live">Em andamento</span>' : ''}</div>
      <h3>${esc(def.nome)}</h3>
      <p class="muted small">${esc(def.descricao)}</p>
      <ul class="chips">${def.detalhes.map((d) => `<li class="chip">${esc(d)}</li>`).join('')}</ul>
      <div class="comp-card-foot">
        ${ed ? `<div class="progress" role="progressbar" aria-valuenow="${p.pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p.pct}%"></i></div>
          <p class="small"><b>${esc(ed.rotulo)}</b><br><span class="muted">${esc(p.texto)}</span></p>
          <span class="btn primary block">${SIM.icone('play')} Continuar</span>`
        : `<p class="small muted">${ultima && ultima.campeao ? `Campeão vigente: <b class="ink">${esc(T(ultima.campeao).nome)}</b>` : 'Nenhuma edição disputada ainda.'}</p>
          <span class="btn soft block">${SIM.icone('play')} Nova edição</span>`}
      </div>
    </article>`;
  }

  function topRanking(chave) {
    const g = SIM.stats.GRUPOS_RANKING[chave];
    const ids = SIM.stats.ranking(g.filtro).slice(0, 5);
    return `<article class="card top-card"><header class="card-head"><h3>${esc(g.rotulo)}</h3><a class="small link-accent" href="#/rankings/${chave}">ver todos</a></header>
      <ol class="top-list">${ids.map((id, i) => `<li><span class="pos ${i === 0 ? 'gold' : ''}">${i + 1}</span>${SIM.ui.nomeTime(id)}${SIM.ui.forma(id, 3)}<span class="rt">${SIM.fmtRating(T(id).rating)}</span></li>`).join('')}</ol>
    </article>`;
  }

  SIM.paginas.inicio = {
    titulo: () => 'Início',
    render() {
      const t = SIM.stats.totais();
      const andamento = SIM.ORDEM_COMPETICOES.map((x) => SIM.store.emAndamento(x)).filter(Boolean);
      const campeoes = SIM.ORDEM_COMPETICOES.map((x) => SIM.store.concluidas(x).filter((e) => e.campeao).slice(-1)[0]).filter(Boolean);
      return `<section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">Copa do Mundo · Champions · Brasileirão · Copa do Brasil</p>
            <h1>Simule o futebol, jogo a jogo.</h1>
            <p class="lede">Sorteios com potes e cabeças de chave, regras oficiais de desempate e um ranking Elo que muda a cada partida. Tudo fica guardado no histórico, neste navegador.</p>
            <div class="row wrap-row">
              ${andamento.length ? `<a class="btn primary big" href="#/competicao/${andamento[0].tipo}">${SIM.icone('play')} Continuar ${esc(SIM.def(andamento[0]).curto)}</a>`
                : `<button class="btn primary big" data-action="rolar" data-alvo="competicoes">${SIM.icone('play')} Escolher competição</button>`}
              <a class="btn ghost" href="#/rankings">${SIM.icone('barras')} Ver rankings</a>
            </div>
          </div>
          <div class="hero-pitch" aria-hidden="true"><div class="pitch-lines"></div><div class="trophy"></div></div>
        </section>

        <section class="section" id="competicoes" aria-labelledby="t-comp">
          <h2 class="section-title" id="t-comp">Competições</h2>
          <div class="comp-grid">${SIM.ORDEM_COMPETICOES.map(cardCompeticao).join('')}</div>
        </section>

        <section class="stat-grid" aria-label="Números gerais">
          <div class="stat"><span class="stat-n">${SIM.fmtNum(t.edicoes)}</span><span class="stat-l">edições concluídas</span></div>
          <div class="stat"><span class="stat-n">${SIM.fmtNum(t.jogos)}</span><span class="stat-l">jogos disputados</span></div>
          <div class="stat"><span class="stat-n">${SIM.fmtNum(t.gols)}</span><span class="stat-l">gols</span></div>
          <div class="stat"><span class="stat-n">${t.media.toLocaleString(SIM.LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><span class="stat-l">gols por jogo</span></div>
        </section>

        ${campeoes.length ? `<section class="section"><h2 class="section-title">Campeões vigentes</h2>
          <div class="champ-grid">${campeoes.map((ed) => `<a class="champ-card comp-${ed.tipo}" href="#/edicao/${ed.id}">
            ${SIM.emblema(ed.tipo)}<div class="grow"><span class="muted small">${esc(ed.rotulo)}</span>
            <span class="team">${SIM.ui.escudo(ed.campeao, 'md')}<b class="nm">${esc(T(ed.campeao).nome)}</b></span></div></a>`).join('')}</div></section>` : ''}

        <section class="section"><h2 class="section-title">Rankings</h2>
          <div class="top-grid">${['selecoes', 'europa', 'brasil'].map(topRanking).join('')}</div>
        </section>`;
    },
  };
})(window.SIM);
