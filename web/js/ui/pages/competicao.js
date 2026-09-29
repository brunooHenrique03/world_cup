// Página da competição (edição em andamento, interativa) e detalhe de uma edição (histórico).
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;
  const M = SIM.motor;
  const ui = () => SIM.estadoUi;

  // ---------- cabeçalho ----------
  function cabecalho(ed, interativo) {
    const def = SIM.def(ed);
    const ordem = def.etapas.map((e) => e[0]);
    const atual = ed.status === 'concluida' ? ordem.length : ordem.indexOf(ed.etapa);
    const jogados = ed.jogos.filter((j) => j.jogado).length;
    return `<section class="comp-head comp-${ed.tipo}">
      ${SIM.emblema(ed.tipo, 'lg')}
      <div class="grow"><p class="eyebrow">${esc(def.nome)}${ed.status === 'concluida' ? ' · concluída' : ' · em andamento'}</p>
        <h1>${esc(ed.rotulo)}</h1>
        ${ed.jogos.length ? `<p class="muted small">${jogados} de ${ed.jogos.length} jogos disputados${ed.sede ? ` · Sede: ${esc(T(ed.sede).nome)}` : ''}</p>` : ''}
      </div>
      ${interativo ? `<ol class="steps" aria-label="Progresso">${def.etapas.map(([, l], i) =>
        `<li class="${i < atual ? 'done' : i === atual ? 'current' : ''}" ${i === atual ? 'aria-current="step"' : ''}><span class="dot">${i + 1}</span><span class="step-label">${esc(l)}</span></li>`).join('')}</ol>
        <button class="btn ghost small" data-action="pedir-descartar">${SIM.icone('lixeira')} Descartar</button>` : ''}
    </section>`;
  }

  function bannerCampeao(ed, interativo) {
    const def = SIM.def(ed);
    const final = ed.jogos.filter((j) => j.jogado).slice(-1)[0];
    let como = '';
    if (ed.tipo === 'brasileirao') {
      const tab = SIM.COMPETICOES.brasileirao.classificacao(ed);
      como = `Campeão com ${tab[0].pts} pontos em 38 rodadas, ${tab[0].pts - tab[1].pts} à frente do ${esc(T(ed.vice).nome)}.`;
    } else if (final) {
      const agg = SIM.ui.agregado(ed, final);
      como = agg
        ? `Venceu ${esc(T(ed.vice).nome)} na final por ${Math.max(...agg)} a ${Math.min(...agg)} no agregado${final.penM !== null ? ', nos pênaltis' : ''}.`
        : `Venceu ${esc(T(ed.vice).nome)} por ${SIM.ui.placarTexto(final, ed.campeao)} na final.`;
    }
    return `<section class="champion">
      <div class="champ-flag">${SIM.ui.escudo(ed.campeao, 'xl')}</div>
      <div><p class="eyebrow on-dark">Campeão · ${esc(ed.rotulo)}</p>
        <h1>${esc(T(ed.campeao).nome)}</h1><p>${como}</p></div>
      ${interativo ? `<div class="champ-actions"><button class="btn on-dark" data-action="nova-edicao" data-tipo="${ed.tipo}">Nova edição de ${esc(def.curto)}</button>
        <a class="btn ghost-dark" href="#/edicao/${ed.id}">Ver no histórico</a></div>` : ''}
    </section>`;
  }

  // ---------- aba Jogos ----------
  function blocoAtual(ed) {
    const def = SIM.def(ed);
    const blocos = def.blocos(ed).filter(([id]) => ed.jogos.some((j) => j.bloco === id));
    const escolhido = ui().bloco[ed.id];
    if (escolhido && blocos.some(([id]) => id === escolhido)) return { blocos, atual: escolhido };
    const prox = M.proximoJogo(ed);
    if (prox) return { blocos, atual: prox.bloco };
    const ultimo = ed.jogos.filter((j) => j.jogado).slice(-1)[0];
    return { blocos, atual: ultimo ? ultimo.bloco : blocos.length ? blocos[0][0] : null };
  }

  function colunaPlacar(ed) {
    const def = SIM.def(ed);
    const prox = M.proximoJogo(ed);
    const mostrado = ui().mostrarResultado && ed.ultimo ? ed.jogos[ed.ultimo - 1] : null;
    if (ed.sorteioPendente && !mostrado) {
      return `<div class="board draw-board"><p class="board-meta">Próxima etapa</p>
          <p class="board-empty">${esc(ed.sorteioPendente.titulo.replace('Sorteio: ', ''))}</p>
          <p class="board-foot">${esc(ed.sorteioPendente.texto || '')}</p></div>
        <div class="board-actions">
          <button class="btn primary block" data-action="sortear-pendente" data-autofocus>${SIM.icone('dados')} Fazer o sorteio</button>
          <button class="btn ghost block" data-action="simular-tudo">${SIM.icone('raio')} Simular até o fim</button>
        </div>`;
    }
    const jogo = mostrado || prox;
    const rotulo = jogo ? def.rotuloJogo(ed, jogo) : '';
    const noBloco = prox ? ed.jogos.filter((j) => !j.jogado && j.bloco === prox.bloco && j.m && j.v).length : 0;
    const nomeBloco = prox ? (def.blocos(ed).find(([id]) => id === prox.bloco) || [])[1] : '';
    return `${jogo ? SIM.ui.placar(ed, jogo, rotulo, def.fonte) : `<div class="board"><p class="board-meta">${esc(ed.rotulo)}</p><p class="board-empty">Competição encerrada</p></div>`}
      <div class="board-actions">
        ${mostrado ? `<button class="btn primary block" data-action="continuar" data-autofocus>${prox || ed.sorteioPendente ? 'Próximo jogo' : 'Concluir'}</button>`
          : `<button class="btn primary block" data-action="jogar" ${prox ? '' : 'disabled'}>${SIM.icone('play')} Jogar partida</button>`}
        <div class="row">
          <button class="btn ghost grow" data-action="jogar-bloco" ${prox ? '' : 'disabled'}>Jogar ${prox ? esc((def.rotuloBlocos ? def.rotuloBlocos + ' ' : '') + nomeBloco).toLowerCase() : 'fase'}${noBloco > 1 ? ` (${noBloco})` : ''}</button>
          <button class="btn ghost grow" data-action="simular-tudo" ${prox || ed.sorteioPendente ? '' : 'disabled'}>${SIM.icone('raio')} Até o fim</button>
        </div>
      </div>`;
  }

  function listaJogos(ed, bloco) {
    const def = SIM.def(ed);
    const lista = ed.jogos.filter((j) => j.bloco === bloco);
    return `<ol class="fixture-list">${lista.map((j) => SIM.ui.linhaJogo(ed, j, { tag: def.tagJogo(ed, j), fonte: def.fonte })).join('')}</ol>`;
  }

  function seletorBlocos(ed, blocos, atual) {
    const def = SIM.def(ed);
    return `<div class="chip-row ${blocos.length > 12 ? 'dense' : ''}" role="group" aria-label="${esc(def.rotuloBlocos || 'Fase')}">
      ${def.rotuloBlocos ? `<span class="chip-label">${esc(def.rotuloBlocos)}</span>` : ''}
      ${blocos.map(([id, rot]) => {
        const done = M.blocoCompleto(ed, id);
        return `<button class="fchip ${id === atual ? 'on' : ''} ${done ? 'done' : ''}" data-action="bloco" data-ed="${ed.id}" data-bloco="${esc(id)}" ${id === atual ? 'aria-pressed="true"' : ''}>${esc(rot)}</button>`;
      }).join('')}</div>`;
  }

  function abaJogos(ed, interativo) {
    const { blocos, atual } = blocoAtual(ed);
    if (!blocos.length) return SIM.ui.vazio('Nenhum jogo ainda.');
    const lista = `<section class="fixtures">${seletorBlocos(ed, blocos, atual)}${listaJogos(ed, atual)}</section>`;
    if (!interativo || ed.status !== 'andamento') return lista;
    return `<div class="play-layout"><section class="board-col">${colunaPlacar(ed)}</section>${lista}</div>`;
  }

  function abaParticipantes(ed) {
    const ordem = Object.keys(ed.resultado || {});
    const ids = ed.participantes.length ? ed.participantes : ordem;
    const peso = (id) => {
      const r = ed.resultado[id] || '';
      if (r === 'Campeão') return 0;
      if (r === 'Vice-campeão') return 1;
      const n = parseInt(r, 10);
      return Number.isNaN(n) ? 2 + ordemFase(r) : 2 + n / 100;
    };
    const lista = ids.slice().sort((a, b) => peso(a) - peso(b) || T(b).rating - T(a).rating);
    return `<section class="card"><div class="table-scroll"><table class="data">
      <thead><tr><th class="l">Time</th><th class="l">Campanha</th><th class="hide-sm">J</th><th class="hide-sm">V</th><th class="hide-sm">E</th><th class="hide-sm">D</th><th>Saldo de rating</th></tr></thead>
      <tbody>${lista.map((id) => {
        const js = ed.jogos.filter((j) => j.jogado && (j.m === id || j.v === id));
        let v = 0, e = 0, d = 0, delta = 0;
        for (const j of js) {
          const r = SIM.ui.resultadoPara(j, id);
          if (r === 'V') v++; else if (r === 'E') e++; else d++;
          delta += j.m === id ? j.delta : -j.delta;
        }
        return `<tr><td class="l">${SIM.ui.nomeTime(id)}</td><td class="l">${esc(ed.resultado[id] || '–')}</td>
          <td class="hide-sm">${js.length}</td><td class="hide-sm">${v}</td><td class="hide-sm">${e}</td><td class="hide-sm">${d}</td>
          <td><span class="delta ${SIM.ui.deltaCls(delta)}">${js.length ? SIM.fmtDelta(delta) : '–'}</span></td></tr>`;
      }).join('')}</tbody></table></div></section>`;
  }

  const FASES_ORDEM = ['Fase de grupos', 'Fase de liga', '1ª fase', '2ª fase', '3ª fase', 'Playoff', '16 avos de final', 'Oitavas de final', 'Quartas de final', 'Semifinal', '4º lugar', '3º lugar'];
  const ordemFase = (r) => {
    const i = FASES_ORDEM.findIndex((f) => r.startsWith(f));
    return i < 0 ? 0 : (FASES_ORDEM.length - i) / FASES_ORDEM.length;
  };

  /** Visão completa de uma edição (abas). `interativo` = página de jogo; senão, histórico. */
  function visaoEdicao(ed, interativo) {
    const def = SIM.def(ed);
    if (interativo && ed.status === 'andamento' && ed.etapa !== 'jogos') return cabecalho(ed, true) + def.preparacao(ed);
    if (ed.resumoApenas) {
      return `${cabecalho(ed, false)}${ed.campeao ? bannerCampeao(ed, false) : ''}
        <section class="panel"><p class="muted">Edição disputada na versão anterior do simulador: só o resumo foi guardado.</p>
        <dl class="facts">${ed.vice ? `<div><dt>Vice</dt><dd>${SIM.ui.nomeTime(ed.vice)}</dd></div>` : ''}${ed.terceiro ? `<div><dt>3º lugar</dt><dd>${SIM.ui.nomeTime(ed.terceiro)}</dd></div>` : ''}${ed.sede ? `<div><dt>Sede</dt><dd>${SIM.ui.nomeTime(ed.sede)}</dd></div>` : ''}</dl></section>`;
    }
    const abas = [['jogos', 'Jogos', (e) => abaJogos(e, interativo)], ...def.abas(ed)];
    if (!interativo || ed.status === 'concluida') abas.push(['participantes', 'Participantes', abaParticipantes]);
    // Em andamento: Jogos. Concluída: a classificação (pontos corridos) ou o chaveamento final.
    const padrao = interativo && ed.status === 'andamento' ? 'jogos' : def.abaInicial || def.abas(ed).slice(-1)[0][0];
    let atual = ui().aba[ed.id] || padrao;
    if (!abas.some(([id]) => id === atual)) atual = padrao;
    const aba = abas.find(([id]) => id === atual);
    return `${cabecalho(ed, interativo && ed.status === 'andamento')}
      ${ed.status === 'concluida' && ed.campeao ? bannerCampeao(ed, interativo) : ''}
      <nav class="tabs" role="tablist">${abas.map(([id, rot]) => `<button role="tab" aria-selected="${id === atual}" class="tab ${id === atual ? 'on' : ''}" data-action="aba" data-ed="${ed.id}" data-aba="${id}">${esc(rot)}</button>`).join('')}</nav>
      ${aba[2](ed)}`;
  }

  /** Competição sem edição em andamento: apresentação e botão para começar. */
  function telaInicial(tipo) {
    const def = SIM.COMPETICOES[tipo];
    const eds = SIM.store.concluidas(tipo);
    const ultima = eds.slice(-1)[0];
    return `<section class="comp-intro comp-${tipo}">
        ${SIM.emblema(tipo, 'xl')}
        <div class="grow"><p class="eyebrow">${eds.length ? `${eds.length} ${eds.length === 1 ? 'edição concluída' : 'edições concluídas'}` : 'Nenhuma edição ainda'}</p>
          <h1>${esc(def.nome)}</h1><p class="lede">${esc(def.descricao)}</p>
          <ul class="chips big">${def.detalhes.map((d) => `<li class="chip">${esc(d)}</li>`).join('')}</ul>
          <div class="row wrap-row"><button class="btn primary big" data-action="nova-edicao" data-tipo="${tipo}" data-autofocus>${SIM.icone('play')} Começar nova edição</button>
          ${eds.length ? `<a class="btn ghost" href="#/historico/${tipo}">Ver histórico</a>` : ''}</div>
        </div>
      </section>
      ${ultima && ultima.campeao ? `<section class="panel"><h2 class="section-title">Campeão vigente</h2>
        <div class="row wrap-row">${SIM.ui.nomeTime(ultima.campeao, { cls: 'md', negrito: true })}<span class="muted">${esc(ultima.rotulo)}</span>
        <a class="btn ghost small" href="#/edicao/${ultima.id}">Ver edição</a></div></section>` : ''}`;
  }

  SIM.paginas.competicao = {
    titulo: (tipo) => (SIM.COMPETICOES[tipo] ? SIM.COMPETICOES[tipo].nome : 'Competição'),
    render(tipo) {
      if (!SIM.COMPETICOES[tipo]) return SIM.ui.vazio('Competição não encontrada.');
      const ed = SIM.store.emAndamento(tipo);
      if (!ed) {
        // Acabou de terminar? Mostra a edição concluída com as ações de continuar.
        const recem = SIM.store.edicao(SIM.estadoUi.recemConcluida);
        if (recem && recem.tipo === tipo) return visaoEdicao(recem, true);
        return telaInicial(tipo);
      }
      return visaoEdicao(ed, true);
    },
  };

  SIM.paginas.edicao = {
    titulo: (id) => { const ed = SIM.store.edicao(id); return ed ? ed.rotulo : 'Edição'; },
    render(id) {
      const ed = SIM.store.edicao(id);
      if (!ed) return SIM.ui.vazio('Edição não encontrada.');
      if (ed.status === 'andamento') {
        return `${cabecalho(ed, false)}<section class="panel"><p>Esta edição ainda está em andamento.</p>
          <a class="btn primary" href="#/competicao/${ed.tipo}">Continuar jogando</a></section>`;
      }
      return visaoEdicao(ed, false);
    },
  };

  SIM.visaoEdicao = visaoEdicao;
})(window.SIM);
