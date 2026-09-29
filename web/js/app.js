// Roteador por hash, layout, despacho de ações e inicialização.
//
// Rotas: #/inicio · #/competicao/<tipo> · #/edicao/<id> · #/rankings/<aba> · #/historico/<tipo>
//        #/time/<id> · #/confronto/<a>/<b> · #/campeoes · #/config
//
// Toda interação usa data-action="nome" (clique), data-change="nome" (select/arquivo) ou
// data-input="nome" (busca). Ações de uma competição usam o prefixo "c:" e vão para def.acoes.
(function (SIM) {
  'use strict';

  const { esc } = SIM;
  const app = document.getElementById('app');

  /** Estado só da interface (não é gravado). */
  const ui = (SIM.estadoUi = {
    modal: null, mostrarResultado: false, aba: {}, bloco: {}, rankingFiltro: '', rankingBusca: '',
    historicoTipo: 'todas', mensagem: null,
  });

  SIM.paginas = SIM.paginas || {};

  const NAV = [
    ['inicio', 'Início', 'casa'],
    ['rankings', 'Rankings', 'barras'],
    ['historico', 'Histórico', 'relogio'],
    ['campeoes', 'Campeões', 'taca'],
    ['confronto', 'Confronto direto', 'espadas'],
    ['config', 'Configurações', 'engrenagem'],
  ];

  // ---------- rota ----------
  function rota() {
    const partes = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    return { nome: partes[0] || 'inicio', params: partes.slice(1) };
  }

  function ir(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }
  SIM.ir = ir;

  // ---------- layout ----------
  function navItem([id, rotulo, icone], atual) {
    const ativo = atual === id || (id === 'inicio' && atual === 'competicao');
    return `<a class="nav-item ${ativo ? 'on' : ''}" href="#/${id}" ${ativo ? 'aria-current="page"' : ''}>${SIM.icone(icone)}<span>${esc(rotulo)}</span></a>`;
  }

  function layout(conteudo, atual) {
    const andamento = SIM.ORDEM_COMPETICOES.map((t) => SIM.store.emAndamento(t)).filter(Boolean);
    return `<div class="shell">
      <aside class="sidebar">
        <a class="brand" href="#/inicio"><span class="brand-mark" aria-hidden="true"></span><span>Simulador <b>de Futebol</b></span></a>
        <nav class="nav" aria-label="Principal">${NAV.map((n) => navItem(n, atual)).join('')}</nav>
        ${andamento.length ? `<div class="side-live"><p class="eyebrow on-dark">Em andamento</p>${andamento.map((ed) => `<a class="live-item" href="#/competicao/${ed.tipo}">
          <span class="comp-dot comp-${ed.tipo}"></span><span class="nm">${esc(ed.rotulo)}</span></a>`).join('')}</div>` : ''}
        <p class="side-foot">Regras FIFA · UEFA · CBF.<br>Ratings Elo atualizados a cada partida.</p>
      </aside>
      <header class="mobilebar">
        <a class="brand" href="#/inicio"><span class="brand-mark" aria-hidden="true"></span><span>Simulador <b>de Futebol</b></span></a>
        <nav class="mnav" aria-label="Principal">${NAV.map((n) => navItem(n, atual)).join('')}</nav>
      </header>
      <main class="wrap">${avisos()}${conteudo}</main>
    </div>${modal()}`;
  }

  function avisos() {
    const itens = [...SIM.store.avisos];
    if (ui.mensagem) itens.push(ui.mensagem);
    if (!itens.length) return '';
    return itens.map((t, i) => `<div class="notice" role="status"><span>${esc(t)}</span>
      <button class="btn ghost small" data-action="fechar-aviso" data-i="${i}">Ok</button></div>`).join('');
  }

  function modal() {
    if (!ui.modal) return '';
    return SIM.ui.modal(ui.modal);
  }

  // ---------- render ----------
  let ultimaRota = null;
  function render() {
    const r = rota();
    const pagina = SIM.paginas[r.nome] || SIM.paginas.inicio;
    let conteudo;
    try {
      conteudo = pagina.render(...r.params);
    } catch (e) {
      console.error(e);
      conteudo = `<section class="panel"><h1 class="section-title">Algo deu errado</h1><p class="muted">${esc(e.message)}</p><a class="btn ghost" href="#/inicio">Voltar ao início</a></section>`;
    }
    // Mantém o foco (e o cursor) em campos de busca, que são redesenhados a cada tecla.
    const foco = document.activeElement && document.activeElement.id ? { id: document.activeElement.id, pos: document.activeElement.selectionStart } : null;
    app.innerHTML = layout(conteudo, r.nome);
    document.title = (pagina.titulo ? pagina.titulo(...r.params) + ' · ' : '') + 'Simulador de Futebol';
    const chave = location.hash;
    if (chave !== ultimaRota) {
      window.scrollTo(0, 0);
      ultimaRota = chave;
    } else if (foco) {
      const el = document.getElementById(foco.id);
      if (el) { el.focus(); if (foco.pos != null && el.setSelectionRange) el.setSelectionRange(foco.pos, foco.pos); }
    }
    const af = app.querySelector('[data-autofocus]');
    if (af) af.focus({ preventScroll: true });
    if (ui.rolarPara) {
      const alvo = document.getElementById(ui.rolarPara);
      ui.rolarPara = null;
      if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  SIM.render = render;

  // ---------- ações ----------
  /** Edição da página de competição: a em andamento ou a que acabou de terminar nesta tela. */
  const edAtual = () => {
    const r = rota();
    if (r.nome !== 'competicao') return null;
    const recem = ui.recemConcluida && SIM.store.edicao(ui.recemConcluida);
    return SIM.store.emAndamento(r.params[0]) || (recem && recem.tipo === r.params[0] ? recem : null);
  };

  function comEdicao(fn) {
    return (el) => {
      const ed = edAtual();
      if (!ed) return;
      fn(ed, el);
      if (ed.status === 'concluida') ui.recemConcluida = ed.id;
      SIM.store.salvar(ed);
    };
  }

  const acoes = {
    'fechar-modal'() { ui.modal = null; },
    rolar(el) { ui.rolarPara = el.dataset.alvo; },
    'fechar-aviso'(el) {
      const i = Number(el.dataset.i);
      if (i < SIM.store.avisos.length) SIM.store.avisos.splice(i, 1);
      else ui.mensagem = null;
    },
    'nova-edicao'(el) {
      const tipo = el.dataset.tipo;
      if (!SIM.store.emAndamento(tipo)) SIM.motor.novaEdicao(tipo);
      ui.mostrarResultado = false;
      ui.recemConcluida = null;
      ir('#/competicao/' + tipo);
    },
    jogar: comEdicao((ed) => {
      const j = SIM.motor.jogarProximo(ed);
      if (j) { ui.mostrarResultado = true; ui.bloco[ed.id] = j.bloco; }
    }),
    continuar: comEdicao((ed) => {
      ui.mostrarResultado = false;
      const n = SIM.motor.proximoJogo(ed);
      if (n) ui.bloco[ed.id] = n.bloco;
    }),
    'jogar-bloco': comEdicao((ed) => {
      const b = SIM.motor.jogarBloco(ed);
      ui.mostrarResultado = false;
      if (b) ui.bloco[ed.id] = b;
    }),
    'simular-tudo': comEdicao((ed) => {
      SIM.motor.simularTudo(ed);
      ui.mostrarResultado = false;
      delete ui.bloco[ed.id];
    }),
    'sortear-pendente': comEdicao((ed) => {
      SIM.motor.sortear(ed);
      ui.mostrarResultado = false;
      const n = SIM.motor.proximoJogo(ed);
      if (n) ui.bloco[ed.id] = n.bloco;
    }),
    aba(el) { ui.aba[el.dataset.ed] = el.dataset.aba; },
    bloco(el) { ui.bloco[el.dataset.ed] = el.dataset.bloco; ui.mostrarResultado = false; },
    'pedir-descartar'() {
      const ed = edAtual();
      if (!ed) return;
      ui.modal = {
        titulo: 'Descartar esta edição?', perigo: true, acao: 'confirmar-descartar', confirmar: 'Descartar edição', cancelar: 'Continuar jogando',
        texto: `${ed.rotulo} será apagada e os ratings voltam ao que eram antes dos jogos dela. As edições concluídas não mudam.`,
      };
    },
    'confirmar-descartar'() {
      const ed = edAtual();
      ui.modal = null;
      if (!ed) return;
      SIM.motor.descartar(ed);
      ui.mensagem = `${ed.rotulo} foi descartada.`;
      ir('#/inicio');
    },
  };
  SIM.acoes = acoes;

  function despachar(nome, el) {
    if (nome.startsWith('c:')) {
      const ed = edAtual();
      const def = ed && SIM.def(ed);
      const fn = def && ed.status === 'andamento' && def.acoes && def.acoes[nome.slice(2)];
      if (!fn) return;
      fn(ed, el, SIM.motor.rngDe(ed));
      SIM.store.salvar(ed);
      render();
      return;
    }
    const fn = acoes[nome];
    if (!fn) return;
    const res = fn(el);
    if (res && typeof res.then === 'function') res.then(render, (e) => { ui.mensagem = e.message; render(); });
    else render();
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    e.preventDefault();
    despachar(el.dataset.action, el);
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el) despachar(el.dataset.change, el);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (el) despachar(el.dataset.input, el);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ui.modal) { ui.modal = null; render(); }
  });
  window.addEventListener('hashchange', () => { ui.modal = null; render(); });

  // ---------- boot ----------
  app.innerHTML = '<div class="boot"><span class="brand-mark" aria-hidden="true"></span><p>Carregando…</p></div>';
  SIM.store.iniciar().then(render, (e) => { console.error(e); render(); });
})(window.SIM);
