// Copa do Mundo (formato 2026): 48 seleções, 12 grupos, 8 melhores terceiros, 16 avos até a final.
// Etapas interativas: sede → eliminatórias → sorteio dos grupos pote a pote → jogos.
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;
  const M = SIM.motor;
  const { K } = SIM.elo;
  const GRUPOS = 'ABCDEFGHIJKL'.split('');
  const PRIMEIRA_EDICAO = 2026;

  // "1A" = 1º do grupo A, "2B" = 2º do B, "3:ABCDF" = um dos melhores terceiros desses grupos,
  // "W74"/"L101" = vencedor/perdedor daquele jogo.
  const KNOCKOUT = [
    [73, 'R32', '2A', '2B'], [74, 'R32', '1E', '3:ABCDF'], [75, 'R32', '1F', '2C'], [76, 'R32', '1C', '2F'],
    [77, 'R32', '1I', '3:CDFGH'], [78, 'R32', '2E', '2I'], [79, 'R32', '1A', '3:CEFHI'], [80, 'R32', '1L', '3:EHIJK'],
    [81, 'R32', '1D', '3:BEFIJ'], [82, 'R32', '1G', '3:AEHIJ'], [83, 'R32', '2K', '2L'], [84, 'R32', '1H', '2J'],
    [85, 'R32', '1B', '3:EFGIJ'], [86, 'R32', '1J', '2H'], [87, 'R32', '1K', '3:DEIJL'], [88, 'R32', '2D', '2G'],
    [89, 'R16', 'W74', 'W77'], [90, 'R16', 'W73', 'W75'], [91, 'R16', 'W76', 'W78'], [92, 'R16', 'W79', 'W80'],
    [93, 'R16', 'W83', 'W84'], [94, 'R16', 'W81', 'W82'], [95, 'R16', 'W86', 'W88'], [96, 'R16', 'W85', 'W87'],
    [97, 'QF', 'W89', 'W90'], [98, 'QF', 'W93', 'W94'], [99, 'QF', 'W91', 'W92'], [100, 'QF', 'W95', 'W96'],
    [101, 'SF', 'W97', 'W98'], [102, 'SF', 'W99', 'W100'],
    [103, '3P', 'L101', 'L102'], [104, 'F', 'W101', 'W102'],
  ];
  const FASE = { R32: '16 avos de final', R16: 'Oitavas de final', QF: 'Quartas de final', SF: 'Semifinal', '3P': 'Disputa de 3º lugar', F: 'Final' };
  // Colunas do chaveamento, ordenadas para que cada jogo fique entre os dois que o alimentam.
  const BRACKET = [
    ['16 avos', [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87]],
    ['Oitavas', [89, 90, 93, 94, 91, 92, 95, 96]],
    ['Quartas', [97, 98, 99, 100]],
    ['Semifinais', [101, 102]],
    ['Final', [104]],
  ];

  const conf = (id) => SIM.CONFEDERACOES.find((c) => c.id === id);
  const selecoes = () => Object.values(SIM.TEAMS).filter((t) => t.tipo === 'selecao');

  // ---------- 1. sede ----------
  function iniciar(ed) {
    const ultima = SIM.store.concluidas('copa').filter((e) => e.numero).slice(-1)[0];
    ed.numero = ultima ? ultima.numero + 4 : PRIMEIRA_EDICAO;
    ed.rotulo = `Copa do Mundo ${ed.numero}`;
  }

  function confirmarSede(ed) {
    if (!ed.sede) return;
    ed.classificados = {};
    for (const c of SIM.CONFEDERACOES) ed.classificados[c.id] = [];
    ed.classificados[T(ed.sede).conf].push(ed.sede);
    ed.etapa = 'eliminatorias';
  }

  // ---------- 2. eliminatórias ----------
  function sortearVaga(ed, confId, rng) {
    const c = conf(confId);
    const lista = ed.classificados[confId];
    if (lista.length >= c.vagas) return;
    const pool = selecoes().filter((t) => t.conf === confId && !lista.includes(t.id)).map((t) => t.id);
    // Mais fortes têm mais chance de se classificar, mas zebras acontecem.
    lista.push(SIM.rng.sortearPonderado(pool, c.vagas - lista.length, rng)[0]);
  }

  const eliminatoriasCompletas = (ed) => SIM.CONFEDERACOES.every((c) => ed.classificados[c.id].length === c.vagas);

  function limparVagas(ed) {
    for (const c of SIM.CONFEDERACOES) ed.classificados[c.id] = c.id === T(ed.sede).conf ? [ed.sede] : [];
  }

  // ---------- 3. sorteio dos grupos ----------
  function montarPotes(ed) {
    const todos = SIM.porRating(SIM.CONFEDERACOES.flatMap((c) => ed.classificados[c.id]).filter((id) => id !== ed.sede));
    const ordenados = [ed.sede, ...todos];
    ed.participantes = ordenados;
    ed.potes = [0, 1, 2, 3].map((p) => ordenados.slice(p * 12, p * 12 + 12));
    ed.grupos = {};
    for (const g of GRUPOS) ed.grupos[g] = [null, null, null, null];
    ed.grupos.A[0] = ed.sede; // a sede abre o torneio como A1
    ed.ultimoSorteado = ed.sede;
    M.sortearLotes(ed, ordenados);
  }

  const poteDe = (ed, id) => ed.potes.findIndex((p) => p.includes(id));
  const sorteado = (ed, id) => GRUPOS.some((g) => ed.grupos[g].includes(id));

  function podeEntrar(ed, id, g, grupos) {
    const slots = grupos[g];
    const pote = poteDe(ed, id);
    if (slots[pote] !== null) return false;
    const c = T(id).conf;
    const mesma = slots.filter((x) => x && T(x).conf === c).length;
    return c === 'UEFA' ? mesma < 2 : mesma === 0;
  }

  // Condição necessária rápida: em cada pote, os times restantes precisam caber nas vagas livres
  // daquele pote (emparelhamento bipartido). Corta a maioria dos becos sem saída cedo.
  function potesEmparelhaveis(ed, restantes, grupos) {
    for (let p = 0; p < 4; p++) {
      const times = restantes.filter((id) => poteDe(ed, id) === p);
      if (!times.length) continue;
      const dono = {};
      const tentar = (id, visto) => {
        for (const g of GRUPOS) {
          if (visto.has(g) || !podeEntrar(ed, id, g, grupos)) continue;
          visto.add(g);
          if (!dono[g] || tentar(dono[g], visto)) { dono[g] = id; return true; }
        }
        return false;
      };
      for (const id of times) if (!tentar(id, new Set())) return false;
    }
    return true;
  }

  // Todos os restantes ainda podem ser colocados? Busca em profundidade com orçamento de nós.
  function resolvivel(ed, restantes, grupos, orcamento) {
    if (!restantes.length) return true;
    if (!potesEmparelhaveis(ed, restantes, grupos)) return false;
    let melhor = null, opcoes = null;
    for (const id of restantes) {
      const op = GRUPOS.filter((g) => podeEntrar(ed, id, g, grupos));
      if (!op.length) return false;
      if (!melhor || op.length < opcoes.length) { melhor = id; opcoes = op; }
    }
    const resto = restantes.filter((x) => x !== melhor);
    const pote = poteDe(ed, melhor);
    for (const g of opcoes) {
      if (--orcamento.n < 0) { orcamento.estourou = true; return false; }
      grupos[g][pote] = melhor;
      const ok = resolvivel(ed, resto, grupos, orcamento);
      grupos[g][pote] = null;
      if (ok) return true;
    }
    return false;
  }

  function sortearProxima(ed, rng) {
    const p = ed.potes.findIndex((pt) => pt.some((id) => !sorteado(ed, id)));
    if (p < 0) return false;
    const id = SIM.rng.pick(ed.potes[p].filter((x) => !sorteado(ed, x)), rng);
    const restantes = ed.potes.flat().filter((x) => x !== id && !sorteado(ed, x));
    // Como no sorteio real: a seleção vai para o primeiro grupo (A a L) que mantém o resto do sorteio possível.
    let alvo = null, indefinido = null;
    for (const g of GRUPOS) {
      if (!podeEntrar(ed, id, g, ed.grupos)) continue;
      ed.grupos[g][p] = id;
      const orc = { n: 20000, estourou: false };
      const ok = resolvivel(ed, restantes, ed.grupos, orc);
      ed.grupos[g][p] = null;
      if (ok) { alvo = g; break; }
      if (orc.estourou && !indefinido) indefinido = g;
    }
    // Redes de segurança: um grupo que a busca não conseguiu descartar, qualquer grupo válido, qualquer vaga do pote.
    if (!alvo) alvo = indefinido || GRUPOS.find((g) => podeEntrar(ed, id, g, ed.grupos)) || GRUPOS.find((g) => ed.grupos[g][p] === null);
    ed.grupos[alvo][p] = id;
    ed.ultimoSorteado = id;
    return true;
  }

  const sorteioCompleto = (ed) => ed.potes && ed.potes.every((p) => p.every((id) => sorteado(ed, id)));

  // ---------- 4. jogos ----------
  function comecar(ed) {
    const rodadas = [[[0, 1], [2, 3]], [[0, 2], [3, 1]], [[3, 0], [1, 2]]]; // por rodada, pela posição no pote
    rodadas.forEach((pares, d) => {
      for (const g of GRUPOS) {
        for (const [x, y] of pares) {
          M.criarJogo(ed, { bloco: 'MD' + (d + 1), fase: 'Grupo ' + g, grupo: g, rodada: d + 1, m: ed.grupos[g][x], v: ed.grupos[g][y], k: K.copaDoMundo, neutro: true });
        }
      }
    });
    for (const [no, st, a, b] of KNOCKOUT) {
      const j = M.criarJogo(ed, { bloco: st === '3P' ? 'F' : st, fase: FASE[st], estagio: st, srcM: a, srcV: b, k: K.copaDoMundo, neutro: true, mataMata: 'prorrogacao' });
      if (j.n !== no) throw new Error('Numeração dos jogos da Copa fora de ordem.');
    }
    ed.terceiros = null;
    ed.etapa = 'jogos';
  }

  const jogosDoGrupo = (ed, g) => ed.jogos.filter((j) => j.grupo === g);
  const grupoCompleto = (ed, g) => jogosDoGrupo(ed, g).every((j) => j.jogado);
  const faseDeGruposCompleta = (ed) => GRUPOS.every((g) => grupoCompleto(ed, g));
  const classificacao = (ed, g) => SIM.classificar(ed.grupos[g], jogosDoGrupo(ed, g), 'fifa2026', ed.sorteio);

  function terceiros(ed) {
    return GRUPOS.map((g) => Object.assign({ grupo: g }, classificacao(ed, g)[2])).sort(SIM.compararEntreGrupos(ed.sorteio));
  }

  // Encaixa os 8 melhores terceiros nas vagas dos 16 avos (cada vaga aceita certos grupos).
  function distribuirTerceiros(ed) {
    const melhores = terceiros(ed).slice(0, 8);
    const porGrupo = Object.fromEntries(melhores.map((r) => [r.grupo, r.id]));
    const vagas = KNOCKOUT.filter((k) => k[3].startsWith('3:')).map((k) => ({ no: k[0], aceita: k[3].slice(2).split(''), grupoDoLider: k[2][1] }));
    const usado = new Set(), res = {};
    function bt(i, estrito) {
      if (i === vagas.length) return true;
      const v = vagas[i];
      for (const g of Object.keys(porGrupo)) {
        if (usado.has(g)) continue;
        if (estrito ? !v.aceita.includes(g) : g === v.grupoDoLider) continue;
        usado.add(g); res[v.no] = porGrupo[g];
        if (bt(i + 1, estrito)) return true;
        usado.delete(g);
      }
      return false;
    }
    if (!bt(0, true)) { usado.clear(); bt(0, false); }
    ed.terceiros = res;
  }

  function resolverFonte(ed, src, no) {
    if (src.startsWith('3:')) return ed.terceiros ? ed.terceiros[no] : null;
    if (src[0] === 'W' || src[0] === 'L') {
      const j = ed.jogos[Number(src.slice(1)) - 1];
      return j && j.jogado ? (src[0] === 'W' ? M.quemAvanca(j) : M.quemCai(j)) : null;
    }
    const g = src[1];
    return grupoCompleto(ed, g) ? classificacao(ed, g)[Number(src[0]) - 1].id : null;
  }

  function resolverMataMata(ed) {
    if (!ed.terceiros && faseDeGruposCompleta(ed)) distribuirTerceiros(ed);
    for (const j of ed.jogos) {
      if (j.grupo || j.jogado) continue;
      j.m = resolverFonte(ed, j.srcM, j.n);
      j.v = resolverFonte(ed, j.srcV, j.n);
    }
  }

  function descreverFonte(src) {
    if (!src) return 'A definir';
    if (src.startsWith('3:')) return '3º ' + src.slice(2).split('').join('/');
    if (src[0] === 'W') return 'Vencedor J' + src.slice(1);
    if (src[0] === 'L') return 'Perdedor J' + src.slice(1);
    return (src[0] === '1' ? '1º' : '2º') + ' do Grupo ' + src[1];
  }

  function finalizar(ed) {
    const final = ed.jogos[103];
    const terceiro = ed.jogos[102];
    ed.campeao = M.quemAvanca(final);
    ed.vice = M.quemCai(final);
    ed.terceiro = M.quemAvanca(terceiro);
    const res = {};
    for (const id of ed.participantes) res[id] = 'Fase de grupos';
    for (const j of ed.jogos) if (!j.grupo && j.estagio !== '3P' && j.estagio !== 'F') res[M.quemCai(j)] = j.fase;
    res[ed.terceiro] = '3º lugar';
    res[M.quemCai(terceiro)] = '4º lugar';
    res[ed.vice] = 'Vice-campeão';
    res[ed.campeao] = 'Campeão';
    ed.resultado = res;
  }

  // ---------- telas de preparação ----------
  function telaSede(ed) {
    const h = ed.sede && T(ed.sede);
    const opts = SIM.CONFEDERACOES.map((c) => `<optgroup label="${esc(c.nome)}">${selecoes().filter((t) => t.conf === c.id)
      .sort((a, b) => a.nome.localeCompare(b.nome, SIM.LOCALE))
      .map((t) => `<option value="${t.id}" ${t.id === ed.sede ? 'selected' : ''}>${esc(t.nome)}</option>`).join('')}</optgroup>`).join('');
    return `<section class="stage-head"><p class="eyebrow">Etapa 1 de 4</p><h1>Escolha o país-sede</h1>
      <p class="lede">A sede se classifica automaticamente, fica no Pote 1, abre o torneio como A1 e joga com a vantagem de mando (+100 de rating) em todos os jogos.</p></section>
      <section class="host-card">
        <div class="host-flag ${h ? 'revealed' : ''}">${SIM.ui.escudo(ed.sede, 'xl')}</div>
        <div class="host-info">
          ${h ? `<p class="eyebrow">País-sede</p><h2 class="host-name">${esc(h.nome)} <span class="code">${esc(h.codigo)}</span></h2>
            <p class="muted">${esc(conf(h.conf).nome)} · rating ${SIM.fmtRating(h.rating)}</p>`
            : '<p class="eyebrow">Sede não definida</p><h2 class="host-name muted">Sorteie ou escolha a sede</h2>'}
          <div class="row wrap-row">
            <button class="btn ${h ? 'ghost' : 'primary'}" data-action="c:sortear-sede">${h ? 'Sortear de novo' : 'Sortear sede'}</button>
            <label class="select"><span class="sr-only">Escolher sede</span>
              <select data-change="c:escolher-sede"><option value="">Ou escolha a sede…</option>${opts}</select></label>
          </div>
        </div>
      </section>
      <div class="footer-actions"><button class="btn primary" data-action="c:confirmar-sede" ${h ? '' : 'disabled'}>Seguir para as eliminatórias</button></div>`;
  }

  function telaEliminatorias(ed) {
    const pronto = eliminatoriasCompletas(ed);
    const total = SIM.CONFEDERACOES.reduce((n, c) => n + ed.classificados[c.id].length, 0);
    return `<section class="stage-head split"><div><p class="eyebrow">Etapa 2 de 4</p><h1>Eliminatórias</h1>
      <p class="lede">Sorteie as vagas de cada confederação. O sorteio é ponderado pelo rating atual: as seleções mais fortes têm mais chance, mas zebras acontecem.</p></div>
      <div class="counter"><span class="big-num">${total}</span><span class="muted">de 48 classificadas</span></div></section>
      <div class="toolbar">
        <button class="btn ghost" data-action="c:sortear-todas-vagas" ${pronto ? 'disabled' : ''}>Sortear todas as vagas</button>
        <button class="btn ghost" data-action="c:limpar-vagas" ${total <= 1 ? 'disabled' : ''}>Limpar</button>
        <span class="spacer"></span>
        <button class="btn primary" data-action="c:ir-sorteio" ${pronto ? '' : 'disabled'}>Seguir para o sorteio dos grupos</button>
      </div>
      <div class="conf-grid">${SIM.CONFEDERACOES.map((c) => {
        const lista = ed.classificados[c.id];
        const cheio = lista.length >= c.vagas;
        return `<article class="card conf ${cheio ? 'full' : ''}">
          <header class="card-head"><div><h3>${esc(c.nome)}</h3><p class="muted small">${c.id.replace('_', ' / ')}</p></div>
            <span class="pill ${cheio ? 'ok' : ''}">${lista.length}/${c.vagas}</span></header>
          <ol class="slots">${Array.from({ length: c.vagas }, (_, i) => lista[i]
            ? `<li class="slot filled ${i === lista.length - 1 && lista[i] !== ed.sede ? 'fresh' : ''}">${SIM.ui.escudo(lista[i])}<span class="nm">${esc(T(lista[i]).nome)}</span>${lista[i] === ed.sede ? '<span class="tag">Sede</span>' : `<span class="rt">${SIM.fmtRating(T(lista[i]).rating)}</span>`}</li>`
            : `<li class="slot empty">Vaga ${i + 1}</li>`).join('')}</ol>
          <button class="btn ${cheio ? 'ghost' : 'soft'} block" data-action="c:sortear-vaga" data-conf="${c.id}" ${cheio ? 'disabled' : ''}>${cheio ? 'Vagas preenchidas' : 'Sortear seleção'}</button>
        </article>`;
      }).join('')}</div>`;
  }

  function telaSorteio(ed) {
    const pronto = sorteioCompleto(ed);
    const proximo = ed.potes.findIndex((p) => p.some((id) => !sorteado(ed, id)));
    return `<section class="stage-head"><p class="eyebrow">Etapa 3 de 4</p><h1>Sorteio dos grupos</h1>
      <p class="lede">Potes pelo rating atual. Cada grupo recebe uma seleção de cada pote. Seleções da mesma confederação ficam separadas, exceto as europeias, que podem ser duas no mesmo grupo.</p></section>
      <div class="toolbar">
        <button class="btn primary" data-action="c:sortear-proxima" ${pronto ? 'disabled' : ''}>Sortear próxima seleção</button>
        <button class="btn ghost" data-action="c:sortear-todas" ${pronto ? 'disabled' : ''}>Sortear todas</button>
        <button class="btn ghost" data-action="c:refazer-sorteio">Refazer sorteio</button>
        <span class="spacer"></span>
        <button class="btn primary" data-action="c:comecar" ${pronto ? '' : 'disabled'}>Começar a Copa</button>
      </div>
      <div class="pots">${ed.potes.map((p, i) => `<section class="pot ${i === proximo ? 'active' : ''}">
        <h3>Pote ${i + 1}${i === proximo ? ' <span class="pill ok">Sorteando</span>' : ''}</h3>
        <ul class="chips">${p.map((id) => `<li class="chip ${sorteado(ed, id) ? 'used' : ''}" title="${esc(T(id).nome)}">${SIM.ui.escudo(id)}${esc(T(id).codigo)}</li>`).join('')}</ul>
      </section>`).join('')}</div>
      <div class="group-grid">${GRUPOS.map((g) => `<article class="card group-card">
        <header class="group-head"><h3>Grupo ${g}</h3></header>
        <ol class="group-slots">${ed.grupos[g].map((id, i) => id
          ? `<li class="${id === ed.ultimoSorteado ? 'fresh' : ''}"><span class="pos">${g}${i + 1}</span>${SIM.ui.escudo(id)}<span class="nm">${esc(T(id).nome)}</span><span class="conf-tag">${T(id).conf === 'AFC_OFC' ? 'AFC' : T(id).conf}</span></li>`
          : `<li class="empty"><span class="pos">${g}${i + 1}</span><span class="muted">Pote ${i + 1}</span></li>`).join('')}</ol>
      </article>`).join('')}</div>`;
  }

  // ---------- abas ----------
  function abaGrupos(ed) {
    const completa = faseDeGruposCompleta(ed);
    const ters = terceiros(ed);
    const terceirosClassificados = new Set(completa ? ters.slice(0, 8).map((r) => r.id) : []);
    return `${SIM.ui.legenda([['q', 'Os dois primeiros avançam'], ['t', 'Os oito melhores terceiros avançam'], ['o', 'Eliminado']])}
      <div class="group-grid tables">${GRUPOS.map((g) => {
        const fim = grupoCompleto(ed, g);
        return `<article class="card group-table"><header class="group-head"><h3>Grupo ${g}</h3>${fim ? '<span class="pill ok">Encerrado</span>' : ''}</header>
          ${SIM.ui.tabela(classificacao(ed, g), { titulo: 'Seleção', compacta: true, zona: (pos, r) => (!fim ? '' : pos <= 2 ? 'q' : pos === 3 ? (completa ? (terceirosClassificados.has(r.id) ? 't' : 'o') : '') : 'o') })}</article>`;
      }).join('')}</div>
      <section class="panel"><h2 class="section-title">Terceiros colocados</h2>
        <p class="muted small">Ordenados por pontos, saldo de gols e gols pró. Os oito primeiros vão aos 16 avos de final${completa ? '' : ' quando todos os grupos terminarem'}.</p>
        <div class="table-scroll"><table class="data standings"><thead><tr><th></th><th class="l">Seleção</th><th>Grupo</th><th title="Jogos">J</th><th title="Saldo de gols">SG</th><th title="Gols pró">GP</th><th title="Pontos">Pts</th></tr></thead>
        <tbody>${ters.map((r, i) => `<tr class="${completa ? (i < 8 ? 't' : 'o') : ''}"><td class="rank">${i + 1}</td><td class="l">${SIM.ui.nomeTime(r.id)}</td><td>${r.grupo}</td><td>${r.j}</td><td>${r.sg > 0 ? '+' + r.sg : r.sg}</td><td>${r.gp}</td><td class="pts">${r.pts}</td></tr>`).join('')}</tbody></table></div>
      </section>`;
  }

  function abaChave(ed) {
    const box = (j) => {
      const linha = (id, src, g, p, ganhou) => `<div class="bt ${ganhou ? 'win' : ''} ${id ? '' : 'tbd'}">${SIM.ui.escudo(id)}<span class="nm">${id ? esc(T(id).nome) : esc(descreverFonte(src))}</span><span class="bs">${j.jogado ? g + (p !== null ? `<small>(${p})</small>` : '') : ''}</span></div>`;
      return `<div class="bmatch ${j.jogado ? 'played' : ''}"><span class="bno">J${j.n}${j.prorr && j.penM === null ? ' · prorr.' : ''}</span>
        ${linha(j.m, j.srcM, j.gm, j.penM, j.jogado && j.avanca === j.m)}${linha(j.v, j.srcV, j.gv, j.penV, j.jogado && j.avanca === j.v)}</div>`;
    };
    return `<div class="bracket-scroll"><div class="bracket">${BRACKET.map(([titulo, nos]) => `<section class="bcol">
      <h3>${titulo}</h3><div class="bcol-body">${nos.map((n) => box(ed.jogos[n - 1])).join('')}
      ${titulo === 'Final' ? `<h3 class="sub">Disputa de 3º lugar</h3>${box(ed.jogos[102])}` : ''}</div></section>`).join('')}</div></div>`;
  }

  SIM.registrarCompeticao({
    tipo: 'copa', nome: 'Copa do Mundo', curto: 'Copa', cor: 'amber', icone: 'globo',
    descricao: 'Seleções do mundo inteiro: sorteio da sede, eliminatórias por confederação, grupos e mata-mata.',
    detalhes: ['48 seleções', '12 grupos', '104 jogos'],
    etapas: [['sede', 'Sede'], ['eliminatorias', 'Eliminatórias'], ['sorteio', 'Sorteio'], ['jogos', 'Copa']],
    iniciar,
    preparacao(ed) {
      if (ed.etapa === 'sede') return telaSede(ed);
      if (ed.etapa === 'eliminatorias') return telaEliminatorias(ed);
      return telaSorteio(ed);
    },
    acoes: {
      'sortear-sede'(ed, el, rng) { ed.sede = SIM.rng.pick(selecoes().map((t) => t.id).filter((id) => id !== ed.sede), rng); },
      'escolher-sede'(ed, el) { if (el.value && T(el.value)) ed.sede = el.value; },
      'confirmar-sede'(ed) { confirmarSede(ed); },
      'sortear-vaga'(ed, el, rng) { sortearVaga(ed, el.dataset.conf, rng); },
      'sortear-todas-vagas'(ed, el, rng) { for (const c of SIM.CONFEDERACOES) while (ed.classificados[c.id].length < c.vagas) sortearVaga(ed, c.id, rng); },
      'limpar-vagas'(ed) { limparVagas(ed); },
      'ir-sorteio'(ed) { if (eliminatoriasCompletas(ed)) { montarPotes(ed); ed.etapa = 'sorteio'; } },
      'sortear-proxima'(ed, el, rng) { sortearProxima(ed, rng); },
      'sortear-todas'(ed, el, rng) { while (sortearProxima(ed, rng)); },
      'refazer-sorteio'(ed) { montarPotes(ed); },
      comecar(ed) { if (sorteioCompleto(ed)) comecar(ed); },
    },
    blocos: () => [['MD1', '1ª rodada'], ['MD2', '2ª rodada'], ['MD3', '3ª rodada'], ['R32', '16 avos'], ['R16', 'Oitavas'], ['QF', 'Quartas'], ['SF', 'Semifinais'], ['F', 'Finais']],
    rotuloJogo: (ed, j) => (j.grupo ? `Grupo ${j.grupo} · ${j.rodada}ª rodada` : j.fase),
    tagJogo: (ed, j) => (j.grupo ? `Grupo ${j.grupo}` : j.estagio === '3P' ? '3º lugar' : j.estagio === 'F' ? 'Final' : ''),
    fonte: descreverFonte,
    abas: () => [['grupos', 'Grupos', abaGrupos], ['chave', 'Mata-mata', abaChave]],
    aposJogo: resolverMataMata,
    avancar: resolverMataMata,
    terminou: (ed) => ed.jogos.length === 104 && ed.jogos[103].jogado && ed.jogos[102].jogado,
    finalizar,
    // Usado pelos testes: executa as etapas de preparação sem interface.
    prepararAutomatico(ed, rng) {
      if (!ed.sede) ed.sede = SIM.rng.pick(selecoes().map((t) => t.id), rng);
      confirmarSede(ed);
      for (const c of SIM.CONFEDERACOES) while (ed.classificados[c.id].length < c.vagas) sortearVaga(ed, c.id, rng);
      montarPotes(ed);
      while (sortearProxima(ed, rng));
      comecar(ed);
    },
  });
})(window.SIM);
