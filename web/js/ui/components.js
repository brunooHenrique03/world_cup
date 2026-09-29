// Componentes de interface compartilhados (todos devolvem HTML em string; texto dinâmico passa por esc()).
(function (SIM) {
  'use strict';

  const { esc, T } = SIM;

  // ---------- bandeira / escudo ----------
  function ehClara(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 0.299 * r + 0.587 * g + 0.114 * b > 170;
  }

  const ESCUDO = 'M20 1 L38 6 V22 C38 34 30 42 20 47 C10 42 2 34 2 22 V6 Z';

  function padraoSvg(padrao, c1, c2) {
    switch (padrao) {
      case 'listras': return [0, 1, 2, 3, 4].map((i) => `<rect x="${4 + i * 8}" y="0" width="4" height="48" fill="${c2}"/>`).join('');
      case 'faixas': return `<rect x="0" y="17" width="40" height="12" fill="${c2}"/>`;
      case 'metades': return `<rect x="20" y="0" width="20" height="48" fill="${c2}"/>`;
      case 'faixa-diagonal': return `<path d="M-4 30 L30 -4 L40 4 L6 38 Z" fill="${c2}"/>`;
      default: return '';
    }
  }

  /** Escudo SVG de um clube, desenhado com as cores e o padrão do uniforme (nenhuma marca oficial). */
  function escudoClube(t, cls) {
    const [c1, c2] = t.cores || ['#2563eb', '#ffffff'];
    const uid = 'e' + t.id.replace(/[^A-Za-z0-9]/g, '');
    const fundoLiso = !t.padrao || t.padrao === 'liso';
    const txt = fundoLiso ? (ehClara(c1) ? '#111' : '#fff') : ehClara(c1) && ehClara(c2) ? '#111' : '#fff';
    const sigla = t.codigo.slice(0, 4);
    return `<svg class="crest ${cls || ''}" viewBox="0 0 40 48" aria-hidden="true">
      <defs><clipPath id="${uid}"><path d="${ESCUDO}"/></clipPath></defs>
      <g clip-path="url(#${uid})"><rect width="40" height="48" fill="${c1}"/>${padraoSvg(t.padrao, c1, c2)}</g>
      <path d="${ESCUDO}" fill="none" stroke="${fundoLiso ? c2 : 'rgb(0 0 0 / .35)'}" stroke-width="2.2"/>
      <text x="20" y="${sigla.length > 3 ? 28 : 29}" text-anchor="middle" font-size="${sigla.length > 3 ? 9 : 11}" font-weight="800" fill="${txt}" ${fundoLiso ? '' : 'stroke="rgb(0 0 0 / .55)" stroke-width="2.2" paint-order="stroke"'} font-family="Figtree, system-ui, sans-serif">${esc(sigla)}</text>
    </svg>`;
  }

  /** Bandeira (seleções) ou escudo (clubes). `id` nulo = time a definir. */
  function escudo(id, cls) {
    const t = id && T(id);
    if (t && t.tipo === 'clube') return escudoClube(t, cls);
    const src = t ? t.bandeira : 'flags/unknown.jpg';
    return `<img class="flag ${cls || ''}" src="${src}" alt="" loading="lazy" width="24" height="16">`;
  }

  /** Nome do time com escudo, com link para a página do time. */
  function nomeTime(id, opt = {}) {
    if (!id) return `<span class="team">${escudo(null)}<span class="nm muted">${esc(opt.aDefinir || 'A definir')}</span></span>`;
    const t = T(id);
    const nome = opt.curto ? t.codigo : t.nome;
    const inner = `${escudo(id, opt.cls)}<span class="nm">${opt.negrito ? `<b>${esc(nome)}</b>` : esc(nome)}</span>${opt.extra || ''}`;
    return opt.semLink ? `<span class="team">${inner}</span>` : `<a class="team link" href="#/time/${encodeURIComponent(id)}" title="${esc(t.nome)}">${inner}</a>`;
  }

  const contexto = (t) => (t.tipo === 'selecao' ? (t.conf === 'AFC_OFC' ? 'AFC/OFC' : t.conf) : t.pais === 'BRA' ? `${t.uf}${t.divisao ? ' · Série ' + t.divisao : ''}` : t.pais);

  // ---------- tabela de classificação ----------
  /**
   * rows: linhas de SIM.classificar. opt.zona(pos, row) → classe CSS ('q', 't', 'o', 'z-...'),
   * opt.compacta esconde GP/GC; opt.extra(row) → célula extra.
   */
  function tabela(rows, opt = {}) {
    const sg = (x) => (x > 0 ? '+' + x : String(x));
    return `<div class="table-scroll"><table class="data standings">
      <thead><tr><th></th><th class="l">${esc(opt.titulo || 'Time')}</th><th title="Pontos">Pts</th><th title="Jogos">J</th><th title="Vitórias">V</th><th title="Empates">E</th><th title="Derrotas">D</th>
      ${opt.compacta ? '' : '<th class="hide-sm" title="Gols pró">GP</th><th class="hide-sm" title="Gols contra">GC</th>'}<th title="Saldo de gols">SG</th>${opt.extraTitulo ? `<th class="hide-sm">${esc(opt.extraTitulo)}</th>` : ''}</tr></thead>
      <tbody>${rows.map((r, i) => `<tr class="${opt.zona ? opt.zona(i + 1, r) || '' : ''}">
        <td class="rank">${i + 1}</td><td class="l">${nomeTime(r.id)}</td><td class="pts">${r.pts}</td>
        <td>${r.j}</td><td>${r.v}</td><td>${r.e}</td><td>${r.d}</td>
        ${opt.compacta ? '' : `<td class="hide-sm">${r.gp}</td><td class="hide-sm">${r.gc}</td>`}<td>${sg(r.sg)}</td>
        ${opt.extra ? `<td class="hide-sm">${opt.extra(r)}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
  }

  function legenda(itens) {
    return `<p class="legend">${itens.map(([cls, txt]) => `<span class="key ${cls}"></span>${esc(txt)}`).join(' ')}</p>`;
  }

  // ---------- jogos ----------
  function placarTexto(j, doPontoDeVistaDe) {
    const deM = !doPontoDeVistaDe || doPontoDeVistaDe === j.m;
    const [x, y] = deM ? [j.gm, j.gv] : [j.gv, j.gm];
    let s = `${x} a ${y}`;
    if (j.penM !== null) s += ` (${deM ? j.penM : j.penV} a ${deM ? j.penV : j.penM} nos pênaltis)`;
    else if (j.prorr) s += ' na prorrogação';
    return s;
  }

  /** Placar agregado de um confronto de ida e volta, do ponto de vista do mandante da volta. */
  function agregado(ed, j) {
    if (!j.ida) return null;
    const ida = ed.jogos[j.ida - 1];
    if (!ida.jogado) return null;
    return j.jogado ? [ida.gv + j.gm, ida.gm + j.gv] : [ida.gv, ida.gm];
  }

  function rodape(ed, j) {
    const nm = (id) => esc(T(id).nome);
    if (!j.jogado) return 'Antes do apito inicial';
    const agg = agregado(ed, j);
    if (j.penM !== null) return `${nm(j.avanca || j.venc)} ${j.ida ? 'avança' : 'vence'} nos pênaltis`;
    if (agg) return `${nm(j.avanca)} avança · agregado ${Math.max(...agg)} a ${Math.min(...agg)}${j.prorr ? ' (prorrogação)' : ''}`;
    if (j.prorr) return `${nm(j.venc)} vence na prorrogação`;
    if (!j.venc && j.avanca) return `Empate · ${nm(j.avanca)} avança pela vantagem`;
    return j.venc ? `Fim de jogo · Vitória de ${nm(j.venc)}` : 'Fim de jogo · Empate';
  }

  /** Placar grande (estilo estádio) do jogo atual ou do último jogo disputado. */
  function placar(ed, j, rotulo, fonte) {
    const res = j.jogado;
    const lado = (id, src, pens) => `<div class="side">
      ${escudo(id, 'lg')}<span class="side-name">${id ? esc(T(id).nome) : esc(fonte ? fonte(src) : 'A definir')}</span>
      ${id ? `<span class="side-meta">${esc(T(id).codigo)} · ${SIM.fmtRating(res ? (id === j.m ? j.rM : j.rV) : T(id).rating)}${ed.sede === id ? ' · Sede' : ''}</span>` : ''}
      ${res && pens !== null ? `<span class="pens">${pens} pên.</span>` : ''}
      ${res ? `<span class="delta ${deltaCls(id === j.m ? j.delta : -j.delta)}">${SIM.fmtDelta(id === j.m ? j.delta : -j.delta)}</span>` : ''}
    </div>`;
    const agg = agregado(ed, j);
    return `<div class="board ${res ? 'final' : ''}" aria-live="polite">
      <p class="board-meta"><span>J${j.n}</span> · ${esc(rotulo)}${j.perna ? ` · ${j.perna === 1 ? 'ida' : 'volta'}` : ''}</p>
      <div class="board-teams">
        ${lado(j.m, j.srcM, j.penM)}
        <div class="board-score">${res ? `<span class="goals">${j.gm}</span><span class="dash">–</span><span class="goals">${j.gv}</span>` : '<span class="vs">x</span>'}</div>
        ${lado(j.v, j.srcV, j.penV)}
      </div>
      ${agg && !res ? `<p class="board-foot">Ida: ${esc(T(j.v).nome)} ${ed.jogos[j.ida - 1].gm} a ${ed.jogos[j.ida - 1].gv}</p>` : ''}
      <p class="board-foot">${rodape(ed, j)}</p>
    </div>`;
  }

  const deltaCls = (d) => (d > 0 ? 'up' : d < 0 ? 'down' : '');

  /** Linha compacta de um jogo. `tag` aparece sob o número do jogo. */
  function linhaJogo(ed, j, opt = {}) {
    const ganhou = (id) => j.jogado && (j.avanca ? j.avanca === id : j.venc === id);
    const time = (id, src) => `<span class="ft ${ganhou(id) ? 'win' : ''}">${id ? nomeTime(id) : `<span class="team">${escudo(null)}<i class="nm">${esc(opt.fonte ? opt.fonte(src) : 'A definir')}</i></span>`}</span>`;
    const agg = agregado(ed, j);
    const extra = j.penM !== null ? `<small>${j.penM}–${j.penV} pên.</small>` : j.prorr ? '<small>prorr.</small>' : agg && j.jogado ? `<small>agr. ${agg[0]}–${agg[1]}</small>` : '';
    return `<li class="fixture ${j.jogado ? 'played' : ''} ${ed.ultimo === j.n ? 'fresh' : ''}">
      <span class="fno">J${j.n}${opt.tag ? `<small>${esc(opt.tag)}</small>` : ''}</span>
      ${time(j.m, j.srcM)}
      <span class="fscore">${j.jogado ? `${j.gm}–${j.gv}` : '<span class="muted">x</span>'}${extra}</span>
      ${time(j.v, j.srcV)}
    </li>`;
  }

  // ---------- forma e rating ----------
  /** Resultado de um jogo para o time `id`: 'V', 'E' ou 'D' (pênaltis contam como empate). */
  function resultadoPara(j, id) {
    if (j.gm === j.gv) return 'E';
    const venceu = (j.gm > j.gv) === (j.m === id);
    return venceu ? 'V' : 'D';
  }

  function forma(id, n = 5) {
    const jogos = SIM.store.jogosDoTime(id).slice(-n);
    if (!jogos.length) return '<span class="muted small">–</span>';
    return `<span class="form">${jogos.map(({ j }) => {
      const r = resultadoPara(j, id);
      return `<i class="f-${r}" title="${esc(T(j.m).codigo)} ${j.gm}–${j.gv} ${esc(T(j.v).codigo)}">${r}</i>`;
    }).join('')}</span>`;
  }

  /** Gráfico de linha (SVG) da evolução do rating. `pontos` = [{x (índice), y (rating), rotulo}]. */
  function graficoRating(pontos, inicial) {
    if (pontos.length < 2) return '<p class="empty">O gráfico aparece depois dos primeiros jogos.</p>';
    const W = 720, H = 220, P = { l: 44, r: 12, t: 12, b: 24 };
    const ys = pontos.map((p) => p.y).concat([inicial]);
    let min = Math.min(...ys), max = Math.max(...ys);
    const folga = Math.max(10, (max - min) * 0.1);
    min -= folga; max += folga;
    const x = (i) => P.l + (i / (pontos.length - 1)) * (W - P.l - P.r);
    const y = (v) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
    const linha = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.y).toFixed(1)}`).join(' ');
    const area = `${linha} L${x(pontos.length - 1).toFixed(1)} ${H - P.b} L${P.l} ${H - P.b} Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * (max - min));
    const ult = pontos[pontos.length - 1];
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução do rating: de ${SIM.fmtRating(pontos[0].y)} para ${SIM.fmtRating(ult.y)} em ${pontos.length - 1} jogos">
      ${ticks.map((v) => `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="axis" x="${P.l - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${Math.round(v)}</text>`).join('')}
      <line class="base" x1="${P.l}" x2="${W - P.r}" y1="${y(inicial).toFixed(1)}" y2="${y(inicial).toFixed(1)}"/>
      <path class="area" d="${area}"/><path class="line" d="${linha}"/>
      <circle class="dot" cx="${x(pontos.length - 1).toFixed(1)}" cy="${y(ult.y).toFixed(1)}" r="4"/>
      <text class="axis" x="${P.l}" y="${H - 6}">1º jogo</text><text class="axis" x="${W - P.r}" y="${H - 6}" text-anchor="end">${pontos.length - 1}º jogo</text>
    </svg>`;
  }

  /** Barra horizontal do rating (escala comum a todos os times). */
  function barraRating(r) {
    const pct = SIM.clamp((r - 1200) / (2250 - 1200), 0.02, 1) * 100;
    return `<span class="rbar"><i style="width:${pct.toFixed(1)}%"></i></span>`;
  }

  // ---------- chaveamento genérico (fases em colunas) ----------
  /** colunas = [{ titulo, confrontos: [{ a, b, placarA, placarB, extra, vencedor, jogado }] }] */
  function chave(colunas) {
    const linha = (c, id, gols, extra) => `<div class="bt ${c.vencedor && c.vencedor === id ? 'win' : ''} ${id ? '' : 'tbd'}">${escudo(id)}<span class="nm">${id ? esc(T(id).nome) : 'A definir'}</span><span class="bs">${c.jogado ? gols + (extra ? `<small>${extra}</small>` : '') : ''}</span></div>`;
    return `<div class="bracket-scroll"><div class="bracket" style="grid-template-columns: repeat(${colunas.length}, minmax(190px, 1fr)); min-width: ${colunas.length * 205}px">${colunas.map((col) => `<section class="bcol">
      <h3>${esc(col.titulo)}</h3><div class="bcol-body">${col.confrontos.map((c) => `<div class="bmatch ${c.jogado ? 'played' : ''}">${c.rotulo ? `<span class="bno">${esc(c.rotulo)}</span>` : ''}
        ${linha(c, c.a, c.placarA, c.extraA)}${linha(c, c.b, c.placarB, c.extraB)}</div>`).join('')}</div></section>`).join('')}</div></div>`;
  }

  /**
   * Converte os jogos eliminatórios de uma fase em confrontos para o chaveamento.
   * Ida e volta viram um confronto só, com o placar agregado.
   */
  function confrontosDaFase(ed, blocoIda) {
    const idas = ed.jogos.filter((j) => j.bloco === blocoIda);
    return idas.map((j) => {
      const volta = ed.jogos.find((x) => x.ida === j.n);
      if (volta) {
        const jogado = volta.jogado;
        return {
          a: j.m, b: j.v, jogado, vencedor: volta.avanca,
          placarA: jogado ? j.gm + volta.gv : '', placarB: jogado ? j.gv + volta.gm : '',
          extraA: volta.penV !== null ? `(${volta.penV})` : '', extraB: volta.penM !== null ? `(${volta.penM})` : '',
          rotulo: j.jogado ? `${j.gm}–${j.gv} · ${volta.jogado ? `${volta.gv}–${volta.gm}` : 'volta'}` : '',
        };
      }
      return {
        a: j.m, b: j.v, jogado: j.jogado, vencedor: j.avanca || j.venc,
        placarA: j.gm, placarB: j.gv,
        extraA: j.penM !== null ? `(${j.penM})` : '', extraB: j.penV !== null ? `(${j.penV})` : '',
        rotulo: j.prorr && j.penM === null ? 'prorr.' : '',
      };
    });
  }

  // ---------- diversos ----------
  const vazio = (texto) => `<p class="empty">${esc(texto)}</p>`;

  function modal({ titulo, texto, confirmar, acao, cancelar = 'Cancelar', perigo = false }) {
    return `<div class="scrim" data-action="fechar-modal"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
        <h2 id="m-title">${esc(titulo)}</h2><p>${esc(texto)}</p>
        <div class="row end">
          <button class="btn ghost" data-action="fechar-modal" data-autofocus>${esc(cancelar)}</button>
          <button class="btn ${perigo ? 'danger' : 'primary'}" data-action="${esc(acao)}">${esc(confirmar)}</button>
        </div>
      </div>`;
  }

  SIM.ui = {
    escudo, nomeTime, contexto, tabela, legenda, placar, placarTexto, linhaJogo, agregado, forma, resultadoPara,
    graficoRating, barraRating, chave, confrontosDaFase, vazio, modal, deltaCls,
  };
})(window.SIM);
