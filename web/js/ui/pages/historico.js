// Histórico de edições (com filtro por competição) e galeria de campeões.
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;

  function filtroCompeticoes(base, atual) {
    return `<div class="chip-row" role="group" aria-label="Competição">
      <a class="fchip ${atual === 'todas' ? 'on' : ''}" href="#/${base}/todas">Todas</a>
      ${SIM.ORDEM_COMPETICOES.map((t) => `<a class="fchip ${atual === t ? 'on' : ''}" href="#/${base}/${t}">${esc(SIM.COMPETICOES[t].curto)}</a>`).join('')}</div>`;
  }

  function golsDa(ed) {
    return ed.jogos.reduce((s, j) => s + (j.jogado ? j.gm + j.gv : 0), 0);
  }

  SIM.paginas.historico = {
    titulo: () => 'Histórico',
    render(tipo = 'todas') {
      if (tipo !== 'todas' && !SIM.COMPETICOES[tipo]) tipo = 'todas';
      const eds = SIM.store.edicoes.filter((e) => tipo === 'todas' || e.tipo === tipo).slice().reverse();
      return `<section class="stage-head"><p class="eyebrow">Todas as edições</p><h1>Histórico</h1>
          <p class="lede">Cada edição guarda todos os jogos, a classificação, o chaveamento e a campanha de cada participante.</p></section>
        ${filtroCompeticoes('historico', tipo)}
        ${eds.length ? `<section class="card"><div class="table-scroll"><table class="data history">
          <thead><tr><th class="l">Edição</th><th class="l">Campeão</th><th class="l hide-sm">Vice</th><th class="hide-sm">Jogos</th><th class="hide-sm">Gols</th><th class="l hide-sm">Data</th><th></th></tr></thead>
          <tbody>${eds.map((ed) => `<tr>
            <td class="l"><span class="team">${SIM.emblema(ed.tipo, 'sm')}<a class="nm link" href="#/edicao/${ed.id}">${esc(ed.rotulo)}</a></span></td>
            <td class="l">${ed.campeao ? SIM.ui.nomeTime(ed.campeao, { negrito: true }) : '<span class="pill live">Em andamento</span>'}</td>
            <td class="l hide-sm">${ed.vice ? SIM.ui.nomeTime(ed.vice) : '–'}</td>
            <td class="hide-sm">${ed.resumoApenas ? '–' : ed.jogos.filter((j) => j.jogado).length}</td>
            <td class="hide-sm">${ed.resumoApenas ? '–' : golsDa(ed)}</td>
            <td class="l hide-sm muted small">${esc(fmtData(ed.concluidoEm || ed.criadoEm))}</td>
            <td><a class="btn ghost small" href="${ed.status === 'andamento' ? '#/competicao/' + ed.tipo : '#/edicao/' + ed.id}">${ed.status === 'andamento' ? 'Continuar' : 'Detalhes'}</a></td>
          </tr>`).join('')}</tbody></table></div></section>`
          : `<section class="panel">${SIM.ui.vazio('Nenhuma edição por aqui ainda.')}<a class="btn primary" href="#/inicio">Escolher uma competição</a></section>`}`;
    },
  };

  function fmtData(iso) {
    if (!iso) return '';
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  }

  SIM.paginas.campeoes = {
    titulo: () => 'Campeões',
    render() {
      const titulos = SIM.stats.titulos();
      const secoes = SIM.ORDEM_COMPETICOES.map((tipo) => {
        const def = SIM.COMPETICOES[tipo];
        const eds = SIM.store.concluidas(tipo).filter((e) => e.campeao);
        if (!eds.length) return '';
        const maiores = Object.entries(titulos).filter(([, t]) => t.porTipo[tipo])
          .sort((a, b) => b[1].porTipo[tipo] - a[1].porTipo[tipo] || T(b[0]).rating - T(a[0]).rating).slice(0, 5);
        return `<section class="section comp-${tipo}">
          <header class="section-head">${SIM.emblema(tipo)}<h2 class="section-title">${esc(def.nome)}</h2><span class="pill">${eds.length} ${eds.length === 1 ? 'edição' : 'edições'}</span></header>
          <div class="champs-layout">
            <ol class="gallery">${eds.slice().reverse().map((ed) => `<li><a class="gallery-item" href="#/edicao/${ed.id}">
              ${SIM.ui.escudo(ed.campeao, 'lg')}<b class="nm">${esc(T(ed.campeao).nome)}</b><span class="muted small">${esc(ed.numero ? (def.temporada ? def.temporada(ed.numero) : String(ed.numero)) : ed.rotulo)}</span></a></li>`).join('')}</ol>
            <div class="card top-card"><header class="card-head"><h3>Mais títulos</h3></header>
              <ol class="top-list">${maiores.map(([id, t], i) => `<li><span class="pos ${i === 0 ? 'gold' : ''}">${i + 1}</span>${SIM.ui.nomeTime(id)}<span class="rt">${t.porTipo[tipo]} ${t.porTipo[tipo] === 1 ? 'título' : 'títulos'}</span></li>`).join('')}</ol></div>
          </div>
        </section>`;
      }).join('');
      return `<section class="stage-head"><p class="eyebrow">Galeria</p><h1>Campeões</h1>
          <p class="lede">Todos os campeões de cada competição, do mais recente para o mais antigo.</p></section>
        ${secoes || `<section class="panel">${SIM.ui.vazio('A galeria aparece depois da primeira final.')}<a class="btn primary" href="#/inicio">Escolher uma competição</a></section>`}`;
    },
  };
})(window.SIM);
