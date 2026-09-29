(function () {
  'use strict';

  const { CONFEDERATIONS, TEAMS, KNOCKOUT, GROUPS } = window.WC_DATA;
  const STORE_KEY = 'wc-sim-state-v1';
  const HISTORY_KEY = 'wc-sim-history-v1';
  const COUNTER_KEY = 'wc-sim-counter-v1';
  const STAGE_LABEL = { R32: '16 avos de final', R16: 'Oitavas de final', QF: 'Quartas de final', SF: 'Semifinal', '3P': 'Disputa de 3º lugar', F: 'Final' };
  const PHASES = ['MD1', 'MD2', 'MD3', 'R32', 'R16', 'QF', 'SF', 'F'];
  const PHASE_LABEL = { MD1: '1ª rodada', MD2: '2ª rodada', MD3: '3ª rodada', R32: '16 avos', R16: 'Oitavas', QF: 'Quartas', SF: 'Semifinais', F: 'Finais' };
  const BRACKET_TITLE = { R32: '16 avos', R16: 'Oitavas', QF: 'Quartas', SF: 'Semifinais', F: 'Final' };
  const LOCALE = 'pt-BR';
  // Bracket columns, ordered so each match sits between the two that feed it.
  const BRACKET = [
    ['R32', [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87]],
    ['R16', [89, 90, 93, 94, 91, 92, 95, 96]],
    ['QF', [97, 98, 99, 100]],
    ['SF', [101, 102]],
    ['F', [104]],
  ];

  // ---------- storage (every access guarded: storage can be missing or blocked) ----------
  function load(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  let S = load(STORE_KEY, null);
  if (S && S.v !== 1) S = null;
  let history = load(HISTORY_KEY, []);
  const ui = { phase: null, showResult: null, modal: null, busy: false };

  function persist() { save(STORE_KEY, S); }

  // ---------- helpers ----------
  const T = (id) => TEAMS[id];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const confName = (id) => CONFEDERATIONS.find((c) => c.id === id).name;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function flag(id, cls) {
    const src = id ? T(id).flag : 'flags/unknown.jpg';
    return `<img class="flag ${cls || ''}" src="${src}" alt="" loading="lazy" width="24" height="16">`;
  }

  function newEdition() {
    const counter = load(COUNTER_KEY, 0) + 1;
    save(COUNTER_KEY, counter);
    const d = new Date();
    const mon = d.toLocaleString(LOCALE, { month: 'short' }).replace('.', '').toUpperCase();
    return `${mon}.${d.getFullYear()}.${String(counter).padStart(4, '0')}`;
  }

  // ---------- 1. host ----------
  function startCup() {
    S = {
      v: 1, edition: newEdition(), stage: 'host', host: null,
      qualified: null, pots: null, groups: null, lastPlaced: null,
      matches: [], thirds: null, lots: {}, tab: 'matches',
    };
    ui.phase = null; ui.showResult = null;
    persist();
  }

  function drawHost() {
    const ids = Object.keys(TEAMS).filter((id) => id !== S.host);
    S.host = pick(ids);
    persist();
  }

  function confirmHost() {
    if (!S.host) return;
    S.qualified = {};
    for (const c of CONFEDERATIONS) S.qualified[c.id] = [];
    S.qualified[T(S.host).conf].push(S.host);
    S.stage = 'qualify';
    persist();
  }

  // ---------- 2. qualifiers ----------
  function drawQualifier(confId) {
    const conf = CONFEDERATIONS.find((c) => c.id === confId);
    const list = S.qualified[confId];
    if (list.length >= conf.slots) return;
    const pool = Object.values(TEAMS).filter((t) => t.conf === confId && !list.includes(t.id));
    // Stronger teams are likelier to qualify, but upsets happen.
    const weights = pool.map((t) => Math.exp((t.rating - 60) / 14));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    let chosen = pool[pool.length - 1];
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) { chosen = pool[i]; break; } }
    list.push(chosen.id);
  }

  function qualifyingDone() {
    return CONFEDERATIONS.every((c) => S.qualified[c.id].length === c.slots);
  }

  function resetQualifiers() {
    for (const c of CONFEDERATIONS) S.qualified[c.id] = c.id === T(S.host).conf ? [S.host] : [];
  }

  // ---------- 3. group draw ----------
  function buildPots() {
    const all = CONFEDERATIONS.flatMap((c) => S.qualified[c.id]).filter((id) => id !== S.host);
    all.sort((a, b) => T(b).rating - T(a).rating || T(a).name.localeCompare(T(b).name, LOCALE));
    const ordered = [S.host, ...all];
    S.pots = [0, 1, 2, 3].map((p) => ordered.slice(p * 12, p * 12 + 12));
    S.groups = {};
    for (const g of GROUPS) S.groups[g] = [null, null, null, null];
    S.groups.A[0] = S.host; // host opens in group A, position A1
    S.lastPlaced = S.host;
    S.lots = {};
    for (const id of ordered) S.lots[id] = Math.random(); // drawing of lots, the last tiebreaker
  }

  const potOf = (id) => S.pots.findIndex((p) => p.includes(id));
  const isPlaced = (id) => GROUPS.some((g) => S.groups[g].includes(id));

  function canPlace(id, g, groups) {
    const slots = groups[g];
    const pot = potOf(id);
    if (slots[pot] !== null) return false;
    const conf = T(id).conf;
    const same = slots.filter((x) => x && T(x).conf === conf).length;
    return conf === 'UEFA' ? same < 2 : same === 0;
  }

  // Quick necessary condition: within each pot, the remaining teams must fit the free slots
  // of that pot one-to-one (bipartite matching). Prunes most dead ends early.
  function potsMatchable(remaining, groups) {
    for (let p = 0; p < 4; p++) {
      const teams = remaining.filter((id) => potOf(id) === p);
      if (!teams.length) continue;
      const owner = {};
      const tryAssign = (id, seen) => {
        for (const g of GROUPS) {
          if (seen.has(g) || !canPlace(id, g, groups)) continue;
          seen.add(g);
          if (!owner[g] || tryAssign(owner[g], seen)) { owner[g] = id; return true; }
        }
        return false;
      };
      for (const id of teams) if (!tryAssign(id, new Set())) return false;
    }
    return true;
  }

  // Can every remaining team still be placed legally? Depth-first search with a node budget.
  function solvable(remaining, groups, budget) {
    if (!remaining.length) return true;
    if (!potsMatchable(remaining, groups)) return false;
    let best = null, bestOpts = null;
    for (const id of remaining) {
      const opts = GROUPS.filter((g) => canPlace(id, g, groups));
      if (!opts.length) return false;
      if (!best || opts.length < bestOpts.length) { best = id; bestOpts = opts; }
    }
    const rest = remaining.filter((x) => x !== best);
    const pot = potOf(best);
    for (const g of bestOpts) {
      if (--budget.n < 0) { budget.out = true; return false; }
      groups[g][pot] = best;
      const ok = solvable(rest, groups, budget);
      groups[g][pot] = null;
      if (ok) return true;
    }
    return false;
  }

  function drawNextTeam() {
    const potIdx = S.pots.findIndex((p) => p.some((id) => !isPlaced(id)));
    if (potIdx < 0) return false;
    const id = pick(S.pots[potIdx].filter((x) => !isPlaced(x)));
    const remaining = S.pots.flat().filter((x) => x !== id && !isPlaced(x));
    // Like the real draw: the team goes to the first group (A to L) that keeps the rest of the draw possible.
    let target = null, undecided = null;
    for (const g of GROUPS) {
      if (!canPlace(id, g, S.groups)) continue;
      S.groups[g][potIdx] = id;
      const budget = { n: 20000, out: false };
      const ok = solvable(remaining, S.groups, budget);
      S.groups[g][potIdx] = null;
      if (ok) { target = g; break; }
      if (budget.out && !undecided) undecided = g;
    }
    // Safety nets: a group the search could not rule out, then any legal group, then any free pot slot.
    if (!target) target = undecided || GROUPS.find((g) => canPlace(id, g, S.groups)) || GROUPS.find((g) => S.groups[g][potIdx] === null);
    S.groups[target][potIdx] = id;
    S.lastPlaced = id;
    return true;
  }

  const drawDone = () => S.pots && S.pots.every((p) => p.every(isPlaced));

  function redoDraw() { buildPots(); }

  // ---------- 4. fixtures ----------
  function buildFixtures() {
    const pairs = [[[0, 1], [2, 3]], [[0, 2], [3, 1]], [[3, 0], [1, 2]]]; // per matchday, by pot position
    const matches = [];
    pairs.forEach((md, d) => {
      GROUPS.forEach((g, gi) => {
        md.forEach(([x, y], k) => {
          matches.push(blankMatch((d * 24) + gi * 2 + k + 1, 'G', S.groups[g][x], S.groups[g][y], { group: g, md: d + 1 }));
        });
      });
    });
    for (const k of KNOCKOUT) matches.push(blankMatch(k.no, k.stage, null, null, { srcA: k.a, srcB: k.b }));
    S.matches = matches;
  }

  function blankMatch(no, stage, a, b, extra) {
    return Object.assign({ no, stage, a, b, ga: null, gb: null, et: false, pa: null, pb: null, played: false, winner: null, loser: null }, extra);
  }

  function startTournament() {
    buildFixtures();
    S.stage = 'play';
    S.tab = 'matches';
    ui.phase = 'MD1';
    persist();
  }

  // ---------- 5. match engine ----------
  function strength(id) { return T(id).rating + (id === S.host ? 4 : 0); }

  function poisson(lambda) {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }

  function expectedGoals(a, b) {
    const d = strength(a) - strength(b);
    return [clamp(1.25 * Math.exp(d / 35), 0.15, 4.5), clamp(1.25 * Math.exp(-d / 35), 0.15, 4.5)];
  }

  function penalties(a, b) {
    const d = strength(a) - strength(b);
    const pA = clamp(0.76 + d * 0.002, 0.6, 0.9), pB = clamp(0.76 - d * 0.002, 0.6, 0.9);
    let sa = 0, sb = 0;
    // Best of five, stopping as soon as one side can no longer be caught.
    for (let i = 0; i < 5; i++) {
      if (Math.random() < pA) sa++;
      if (sa > sb + (5 - i) || sb > sa + (4 - i)) break;
      if (Math.random() < pB) sb++;
      if (Math.abs(sa - sb) > 4 - i) break;
    }
    while (sa === sb) { if (Math.random() < pA) sa++; if (Math.random() < pB) sb++; }
    return [sa, sb];
  }

  function playMatch(m) {
    const [la, lb] = expectedGoals(m.a, m.b);
    m.ga = poisson(la); m.gb = poisson(lb);
    if (m.stage !== 'G' && m.ga === m.gb) {
      m.et = true;
      m.ga += poisson(la / 3); m.gb += poisson(lb / 3);
      if (m.ga === m.gb) [m.pa, m.pb] = penalties(m.a, m.b);
    }
    m.played = true;
    if (m.ga !== m.gb || m.pa !== null) {
      const aWins = m.ga > m.gb || (m.ga === m.gb && m.pa > m.pb);
      m.winner = aWins ? m.a : m.b;
      m.loser = aWins ? m.b : m.a;
    }
    resolveKnockout();
    if (m.no === 104) finishCup();
  }

  // ---------- standings ----------
  function groupMatches(g) { return S.matches.filter((m) => m.stage === 'G' && m.group === g); }
  const groupComplete = (g) => groupMatches(g).every((m) => m.played);
  const groupStageComplete = () => GROUPS.every(groupComplete);

  function tableRows(teams, matches) {
    const rows = {};
    for (const id of teams) rows[id] = { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
    for (const m of matches) {
      if (!m.played || !rows[m.a] || !rows[m.b]) continue;
      const A = rows[m.a], B = rows[m.b];
      A.p++; B.p++; A.gf += m.ga; A.ga += m.gb; B.gf += m.gb; B.ga += m.ga;
      if (m.ga > m.gb) { A.w++; B.l++; A.pts += 3; } else if (m.gb > m.ga) { B.w++; A.l++; B.pts += 3; } else { A.d++; B.d++; A.pts++; B.pts++; }
    }
    return Object.values(rows).map((r) => Object.assign(r, { gd: r.gf - r.ga }));
  }

  const basicCmp = (x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf;

  function standings(g) {
    const matches = groupMatches(g);
    const rows = tableRows(S.groups[g], matches).sort(basicCmp);
    // Tied on points, goal difference and goals: split by head-to-head, then by drawing of lots.
    const out = [];
    for (let i = 0; i < rows.length;) {
      let j = i + 1;
      while (j < rows.length && basicCmp(rows[i], rows[j]) === 0) j++;
      const tied = rows.slice(i, j);
      if (tied.length > 1) {
        const ids = tied.map((r) => r.id);
        const h2h = tableRows(ids, matches.filter((m) => ids.includes(m.a) && ids.includes(m.b)));
        const hmap = Object.fromEntries(h2h.map((r) => [r.id, r]));
        tied.sort((x, y) => basicCmp(hmap[x.id], hmap[y.id]) || S.lots[y.id] - S.lots[x.id]);
      }
      out.push(...tied);
      i = j;
    }
    return out;
  }

  function thirdPlaced() {
    return GROUPS.map((g) => Object.assign({ group: g }, standings(g)[2]))
      .sort((x, y) => basicCmp(x, y) || S.lots[y.id] - S.lots[x.id]);
  }

  // Match the 8 best third-placed teams to their Round-of-32 slots (each slot accepts certain groups).
  function assignThirds() {
    const best = thirdPlaced().slice(0, 8);
    const byGroup = Object.fromEntries(best.map((r) => [r.group, r.id]));
    const slots = KNOCKOUT.filter((k) => k.b.startsWith('3:')).map((k) => ({ no: k.no, allowed: k.b.slice(2).split(''), winnerGroup: k.a[1] }));
    const used = new Set(), result = {};
    function bt(i, strict) {
      if (i === slots.length) return true;
      const s = slots[i];
      for (const g of Object.keys(byGroup)) {
        if (used.has(g)) continue;
        if (strict ? !s.allowed.includes(g) : g === s.winnerGroup) continue;
        used.add(g); result[s.no] = byGroup[g];
        if (bt(i + 1, strict)) return true;
        used.delete(g);
      }
      return false;
    }
    if (!bt(0, true)) { used.clear(); bt(0, false); }
    S.thirds = result;
  }

  function resolveSource(src, matchNo) {
    if (src.startsWith('3:')) return S.thirds ? S.thirds[matchNo] : null;
    if (src[0] === 'W' || src[0] === 'L') {
      const m = S.matches.find((x) => x.no === Number(src.slice(1)));
      return m && m.played ? (src[0] === 'W' ? m.winner : m.loser) : null;
    }
    const g = src[1];
    return groupComplete(g) ? standings(g)[Number(src[0]) - 1].id : null;
  }

  function resolveKnockout() {
    if (!S.thirds && groupStageComplete()) assignThirds();
    for (const m of S.matches) {
      if (m.stage === 'G' || m.played) continue;
      m.a = resolveSource(m.srcA, m.no);
      m.b = resolveSource(m.srcB, m.no);
    }
  }

  function describeSource(src) {
    if (src.startsWith('3:')) return '3º ' + src.slice(2).split('').join('/');
    if (src[0] === 'W') return 'Vencedor J' + src.slice(1);
    if (src[0] === 'L') return 'Perdedor J' + src.slice(1);
    return (src[0] === '1' ? '1º' : '2º') + ' do Grupo ' + src[1];
  }

  function phaseOf(m) { return m.stage === 'G' ? 'MD' + m.md : (m.stage === '3P' ? 'F' : m.stage); }
  function nextMatch() { return S.matches.filter((m) => !m.played && m.a && m.b).sort((x, y) => x.no - y.no)[0] || null; }
  function matchLabel(m) { return m.stage === 'G' ? `Grupo ${m.group} · ${m.md}ª rodada` : STAGE_LABEL[m.stage]; }

  function finishCup() {
    const final = S.matches.find((m) => m.no === 104);
    const third = S.matches.find((m) => m.no === 103);
    S.stage = 'done';
    S.tab = 'bracket';
    history.unshift({
      edition: S.edition, champion: final.winner, runnerUp: final.loser,
      third: third && third.winner, host: S.host, date: new Date().toISOString().slice(0, 10),
    });
    history = history.slice(0, 30);
    save(HISTORY_KEY, history);
  }

  // ---------- actions ----------
  const actions = {
    start() { startCup(); },
    'ask-new'() { ui.modal = 'new'; },
    'close-modal'() { ui.modal = null; },
    'confirm-new'() { ui.modal = null; startCup(); },
    'draw-host'() { drawHost(); },
    'confirm-host'() { confirmHost(); },
    'draw-qualifier'(el) { drawQualifier(el.dataset.conf); persist(); },
    'draw-all-qualifiers'() { for (const c of CONFEDERATIONS) while (S.qualified[c.id].length < c.slots) drawQualifier(c.id); persist(); },
    'reset-qualifiers'() { resetQualifiers(); persist(); },
    'to-draw'() { if (!qualifyingDone()) return; buildPots(); S.stage = 'draw'; persist(); },
    'draw-next'() { drawNextTeam(); persist(); },
    'draw-all'() { while (drawNextTeam()); persist(); },
    'redo-draw'() { redoDraw(); persist(); },
    'to-play'() { if (drawDone()) startTournament(); },
    tab(el) { S.tab = el.dataset.tab; persist(); },
    phase(el) { ui.phase = el.dataset.phase; },
    play() {
      const m = nextMatch();
      if (!m) return;
      playMatch(m);
      ui.showResult = m.no;
      ui.phase = phaseOf(m);
      persist();
    },
    continue() { ui.showResult = null; const n = nextMatch(); if (n) ui.phase = phaseOf(n); },
    'play-phase'() {
      const first = nextMatch();
      if (!first) return;
      const ph = phaseOf(first);
      let m;
      while ((m = nextMatch()) && phaseOf(m) === ph) playMatch(m);
      ui.showResult = null;
      ui.phase = ph;
      persist();
    },
    'play-all'() {
      let m;
      while ((m = nextMatch())) playMatch(m);
      ui.showResult = null;
      ui.phase = 'F';
      persist();
    },
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    fn(el);
    render();
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'host-select' && e.target.value) { S.host = e.target.value; persist(); render(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ui.modal) { ui.modal = null; render(); }
  });

  // ---------- views ----------
  const app = document.getElementById('app');

  function render() {
    app.innerHTML = header() + `<main class="wrap">${body()}</main>` + modal();
    const focus = app.querySelector('[data-autofocus]');
    if (focus) focus.focus();
  }

  function header() {
    const steps = [['host', 'Sede'], ['qualify', 'Eliminatórias'], ['draw', 'Sorteio'], ['play', 'Copa']];
    const order = ['host', 'qualify', 'draw', 'play', 'done'];
    const cur = S ? order.indexOf(S.stage) : -1;
    return `<header class="topbar"><div class="topbar-inner">
      <div class="brand"><span class="brand-mark" aria-hidden="true"></span><span>Simulador da <b>Copa</b></span></div>
      ${S ? `<ol class="steps" aria-label="Progresso">${steps.map(([k, l], i) =>
        `<li class="${i < cur ? 'done' : i === cur ? 'current' : ''}" ${i === cur ? 'aria-current="step"' : ''}><span class="dot">${i + 1}</span><span class="step-label">${l}</span></li>`).join('')}</ol>
      <div class="top-actions"><span class="edition" title="Código da edição">${esc(S.edition)}</span>
      <button class="btn ghost small" data-action="ask-new">Nova Copa</button></div>` : ''}
    </div></header>`;
  }

  function body() {
    if (!S) return homeView();
    switch (S.stage) {
      case 'host': return hostView();
      case 'qualify': return qualifyView();
      case 'draw': return drawView();
      default: return tournamentView();
    }
  }

  function modal() {
    if (ui.modal !== 'new') return '';
    return `<div class="scrim" data-action="close-modal"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
        <h2 id="m-title">Começar uma nova Copa?</h2>
        <p>A edição ${esc(S.edition)} será descartada${S.stage === 'done' ? '' : ' antes de terminar'}. As edições concluídas continuam na lista de campeões.</p>
        <div class="row end">
          <button class="btn ghost" data-action="close-modal" data-autofocus>Continuar jogando</button>
          <button class="btn danger" data-action="confirm-new">Descartar e recomeçar</button>
        </div>
      </div>`;
  }

  function homeView() {
    return `<section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">48 seleções · 12 grupos · 104 jogos</p>
          <h1>Organize sua própria Copa do Mundo, do sorteio da sede ao apito final.</h1>
          <p class="lede">Escolha o país-sede, sorteie as seleções classificadas de cada confederação, faça o sorteio dos grupos pote a pote e jogue todas as partidas, dos 16 avos até a final.</p>
          <button class="btn primary big" data-action="start">Começar uma nova Copa</button>
        </div>
        <div class="hero-pitch" aria-hidden="true"><div class="pitch-lines"></div><div class="trophy"></div></div>
      </section>
      <section class="panel">
        <h2 class="section-title">Campeões</h2>
        ${history.length ? `<div class="table-scroll"><table class="data history">
          <thead><tr><th>Edição</th><th>Campeão</th><th class="hide-sm">Vice</th><th class="hide-sm">3º lugar</th><th>Sede</th></tr></thead>
          <tbody>${history.map((h) => `<tr><td class="mono">${esc(h.edition)}</td>
            <td><span class="team">${flag(h.champion)}<b>${esc(T(h.champion).name)}</b></span></td>
            <td class="hide-sm"><span class="team">${flag(h.runnerUp)}${esc(T(h.runnerUp).name)}</span></td>
            <td class="hide-sm">${h.third ? `<span class="team">${flag(h.third)}${esc(T(h.third).name)}</span>` : '–'}</td>
            <td><span class="team">${flag(h.host)}${esc(T(h.host).code)}</span></td></tr>`).join('')}</tbody></table></div>`
        : `<p class="empty">Nenhuma edição concluída ainda. Os campeões aparecem aqui depois de cada final.</p>`}
      </section>`;
  }

  function hostView() {
    const h = S.host && T(S.host);
    const opts = CONFEDERATIONS.map((c) => `<optgroup label="${esc(c.name)}">${Object.values(TEAMS).filter((t) => t.conf === c.id)
      .sort((a, b) => a.name.localeCompare(b.name, LOCALE))
      .map((t) => `<option value="${t.id}" ${t.id === S.host ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</optgroup>`).join('');
    return `<section class="stage-head"><p class="eyebrow">Etapa 1 de 4</p><h1>Escolha o país-sede</h1>
      <p class="lede">A sede se classifica automaticamente, fica no Pote 1 e abre o torneio como A1.</p></section>
      <section class="host-card">
        <div class="host-flag ${h ? 'revealed' : ''}">${flag(S.host, 'xl')}</div>
        <div class="host-info">
          ${h ? `<p class="eyebrow">País-sede</p><h2 class="host-name">${esc(h.name)} <span class="code">${h.code}</span></h2>
            <p class="muted">${esc(confName(h.conf))} · força ${h.rating}</p>`
            : `<p class="eyebrow">Sede não definida</p><h2 class="host-name muted">Sorteie ou escolha a sede</h2>`}
          <div class="row wrap-row">
            <button class="btn ${h ? 'ghost' : 'primary'}" data-action="draw-host">${h ? 'Sortear de novo' : 'Sortear sede'}</button>
            <label class="select"><span class="sr-only">Escolher sede</span>
              <select id="host-select"><option value="">Ou escolha a sede…</option>${opts}</select></label>
          </div>
        </div>
      </section>
      <div class="footer-actions"><button class="btn primary" data-action="confirm-host" ${h ? '' : 'disabled'}>Seguir para as eliminatórias</button></div>`;
  }

  function qualifyView() {
    const done = qualifyingDone();
    const total = CONFEDERATIONS.reduce((n, c) => n + S.qualified[c.id].length, 0);
    return `<section class="stage-head split"><div><p class="eyebrow">Etapa 2 de 4</p><h1>Eliminatórias</h1>
      <p class="lede">Sorteie as vagas de cada confederação. Seleções mais fortes têm mais chance de se classificar, mas zebras acontecem.</p></div>
      <div class="counter"><span class="big-num">${total}</span><span class="muted">de 48 classificadas</span></div></section>
      <div class="toolbar">
        <button class="btn ghost" data-action="draw-all-qualifiers" ${done ? 'disabled' : ''}>Sortear todas as vagas</button>
        <button class="btn ghost" data-action="reset-qualifiers" ${total <= 1 ? 'disabled' : ''}>Limpar</button>
        <span class="spacer"></span>
        <button class="btn primary" data-action="to-draw" ${done ? '' : 'disabled'}>Seguir para o sorteio dos grupos</button>
      </div>
      <div class="conf-grid">${CONFEDERATIONS.map((c) => {
        const list = S.qualified[c.id];
        const full = list.length >= c.slots;
        return `<article class="card conf ${full ? 'full' : ''}">
          <header class="card-head"><div><h3>${esc(c.name)}</h3><p class="muted small">${c.id.replace('_', ' / ')}</p></div>
            <span class="pill ${full ? 'ok' : ''}">${list.length}/${c.slots}</span></header>
          <ol class="slots">${Array.from({ length: c.slots }, (_, i) => list[i]
            ? `<li class="slot filled ${i === list.length - 1 && list[i] !== S.host ? 'fresh' : ''}">${flag(list[i])}<span class="nm">${esc(T(list[i]).name)}</span>${list[i] === S.host ? '<span class="tag">Sede</span>' : `<span class="rt">${T(list[i]).rating}</span>`}</li>`
            : `<li class="slot empty">Vaga ${i + 1}</li>`).join('')}</ol>
          <button class="btn ${full ? 'ghost' : 'soft'} block" data-action="draw-qualifier" data-conf="${c.id}" ${full ? 'disabled' : ''}>${full ? 'Vagas preenchidas' : 'Sortear seleção'}</button>
        </article>`;
      }).join('')}</div>`;
  }

  function drawView() {
    const done = drawDone();
    const nextPot = S.pots.findIndex((p) => p.some((id) => !isPlaced(id)));
    return `<section class="stage-head"><p class="eyebrow">Etapa 3 de 4</p><h1>Sorteio dos grupos</h1>
      <p class="lede">Cada grupo recebe uma seleção de cada pote. Seleções da mesma confederação ficam separadas, exceto as europeias, que podem ser duas no mesmo grupo.</p></section>
      <div class="toolbar">
        <button class="btn primary" data-action="draw-next" ${done ? 'disabled' : ''}>Sortear próxima seleção</button>
        <button class="btn ghost" data-action="draw-all" ${done ? 'disabled' : ''}>Sortear todas</button>
        <button class="btn ghost" data-action="redo-draw">Refazer sorteio</button>
        <span class="spacer"></span>
        <button class="btn primary" data-action="to-play" ${done ? '' : 'disabled'}>Começar a Copa</button>
      </div>
      <div class="pots">${S.pots.map((p, i) => `<section class="pot ${i === nextPot ? 'active' : ''}">
        <h3>Pote ${i + 1}${i === nextPot ? ' <span class="pill ok">Sorteando</span>' : ''}</h3>
        <ul class="chips">${p.map((id) => `<li class="chip ${isPlaced(id) ? 'used' : ''}" title="${esc(T(id).name)}">${flag(id)}${T(id).code}</li>`).join('')}</ul>
      </section>`).join('')}</div>
      <div class="group-grid">${GROUPS.map((g) => `<article class="card group-card">
        <header class="group-head"><h3>Grupo ${g}</h3></header>
        <ol class="group-slots">${S.groups[g].map((id, i) => id
          ? `<li class="${id === S.lastPlaced ? 'fresh' : ''}"><span class="pos">${g}${i + 1}</span>${flag(id)}<span class="nm">${esc(T(id).name)}</span><span class="conf-tag">${T(id).conf === 'AFC_OFC' ? 'AFC' : T(id).conf}</span></li>`
          : `<li class="empty"><span class="pos">${g}${i + 1}</span><span class="muted">Pote ${i + 1}</span></li>`).join('')}</ol>
      </article>`).join('')}</div>`;
  }

  function tournamentView() {
    const tabs = [['matches', 'Jogos'], ['groups', 'Grupos'], ['bracket', 'Mata-mata']];
    const champ = S.stage === 'done' ? S.matches.find((m) => m.no === 104) : null;
    return `${champ ? championBanner(champ) : ''}
      <nav class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${S.tab === k}" class="tab ${S.tab === k ? 'on' : ''}" data-action="tab" data-tab="${k}">${l}</button>`).join('')}</nav>
      ${S.tab === 'groups' ? groupsTab() : S.tab === 'bracket' ? bracketTab() : matchesTab()}`;
  }

  function championBanner(f) {
    const w = T(f.winner);
    return `<section class="champion">
      <div class="champ-flag">${flag(f.winner, 'xl')}</div>
      <div><p class="eyebrow on-dark">Campeão · ${esc(S.edition)}</p>
        <h1>${esc(w.name)}</h1>
        <p>Venceu ${esc(T(f.loser).name)} por ${scoreText(f, f.winner === f.a)} na final.</p></div>
      <button class="btn on-dark" data-action="ask-new">Começar uma nova Copa</button>
    </section>`;
  }

  function scoreText(m, fromA) {
    const [x, y] = fromA ? [m.ga, m.gb] : [m.gb, m.ga];
    let s = `${x} a ${y}`;
    if (m.pa !== null) s += ` (${fromA ? m.pa : m.pb} a ${fromA ? m.pb : m.pa} nos pênaltis)`;
    else if (m.et) s += ' na prorrogação';
    return s;
  }

  function matchesTab() {
    const shown = ui.showResult ? S.matches.find((m) => m.no === ui.showResult) : null;
    const next = nextMatch();
    const phase = ui.phase || (next ? phaseOf(next) : 'F');
    const list = S.matches.filter((m) => phaseOf(m) === phase).sort((a, b) => a.no - b.no);
    const remainingInPhase = next ? S.matches.filter((m) => !m.played && phaseOf(m) === phaseOf(next)).length : 0;
    const board = shown || next;
    return `<div class="play-layout">
      <section class="board-col">
        ${board ? scoreboard(board, !!shown) : `<div class="board"><p class="board-meta">Copa encerrada</p><p class="board-empty">Os 104 jogos foram disputados.</p></div>`}
        <div class="board-actions">
          ${shown ? `<button class="btn primary block" data-action="continue" data-autofocus>${next ? 'Próximo jogo' : 'Concluir'}</button>`
            : `<button class="btn primary block" data-action="play" ${next ? '' : 'disabled'}>Jogar partida</button>`}
          <div class="row">
            <button class="btn ghost grow" data-action="play-phase" ${next ? '' : 'disabled'}>Jogar ${next ? esc(PHASE_LABEL[phaseOf(next)].toLowerCase()) : 'fase'}${remainingInPhase > 1 ? ` (${remainingInPhase})` : ''}</button>
            <button class="btn ghost grow" data-action="play-all" ${next ? '' : 'disabled'}>Simular até o fim</button>
          </div>
        </div>
      </section>
      <section class="fixtures">
        <div class="chip-row" role="group" aria-label="Escolher fase">${PHASES.map((p) => `<button class="fchip ${p === phase ? 'on' : ''}" data-action="phase" data-phase="${p}">${PHASE_LABEL[p]}</button>`).join('')}</div>
        <ol class="fixture-list">${list.map(fixtureRow).join('')}</ol>
      </section>
    </div>`;
  }

  function scoreboard(m, result) {
    const side = (id, src, pens) => `<div class="side">
      ${flag(id, 'lg')}<span class="side-name">${id ? esc(T(id).name) : esc(describeSource(src))}</span>
      ${id ? `<span class="side-meta">${T(id).code} · ${T(id).rating}${id === S.host ? ' · Sede' : ''}</span>` : ''}
      ${result && pens !== null ? `<span class="pens">${pens} pên.</span>` : ''}
    </div>`;
    return `<div class="board ${result ? 'final' : ''}" aria-live="polite">
      <p class="board-meta"><span>J${m.no}</span> · ${esc(matchLabel(m))}</p>
      <div class="board-teams">
        ${side(m.a, m.srcA, m.pa)}
        <div class="board-score">${result ? `<span class="goals">${m.ga}</span><span class="dash">–</span><span class="goals">${m.gb}</span>` : '<span class="vs">x</span>'}</div>
        ${side(m.b, m.srcB, m.pb)}
      </div>
      <p class="board-foot">${result ? (m.pa !== null ? `${esc(T(m.winner).name)} vence nos pênaltis` : m.et ? `${esc(T(m.winner).name)} vence na prorrogação` : m.winner ? `Fim de jogo · Vitória de ${esc(T(m.winner).name)}` : 'Fim de jogo · Empate') : 'Antes do apito inicial'}</p>
    </div>`;
  }

  function fixtureRow(m) {
    const team = (id, src, win) => `<span class="ft ${win ? 'win' : ''}">${flag(id)}<span class="nm">${id ? esc(T(id).name) : `<i>${esc(describeSource(src))}</i>`}</span></span>`;
    const tag = m.stage === 'G' ? `Grupo ${m.group}` : m.stage === '3P' ? '3º lugar' : m.stage === 'F' ? 'Final' : '';
    return `<li class="fixture ${m.played ? 'played' : ''} ${ui.showResult === m.no ? 'fresh' : ''}">
      <span class="fno">J${m.no}${tag ? `<small>${tag}</small>` : ''}</span>
      ${team(m.a, m.srcA, m.played && m.winner === m.a)}
      <span class="fscore">${m.played ? `${m.ga}–${m.gb}` : '<span class="muted">x</span>'}${m.pa !== null ? `<small>${m.pa}–${m.pb} pên.</small>` : m.et ? '<small>prorr.</small>' : ''}</span>
      ${team(m.b, m.srcB, m.played && m.winner === m.b)}
    </li>`;
  }

  function groupsTab() {
    const complete = groupStageComplete();
    const thirds = thirdPlaced();
    const qualifiedThirds = new Set(complete ? thirds.slice(0, 8).map((r) => r.id) : []);
    return `<p class="legend"><span class="key q"></span>Os dois primeiros avançam <span class="key t"></span>Os oito melhores terceiros avançam <span class="key o"></span>Eliminado</p>
      <div class="group-grid tables">${GROUPS.map((g) => {
        const rows = standings(g);
        const done = groupComplete(g);
        return `<article class="card group-table"><header class="group-head"><h3>Grupo ${g}</h3>${done ? '<span class="pill ok">Encerrado</span>' : ''}</header>
          <div class="table-scroll"><table class="data standings"><thead><tr><th></th><th class="l">Seleção</th><th title="Jogos">J</th><th title="Vitórias">V</th><th title="Empates">E</th><th title="Derrotas">D</th><th class="hide-sm" title="Gols pró">GP</th><th class="hide-sm" title="Gols contra">GC</th><th title="Saldo de gols">SG</th><th title="Pontos">Pts</th></tr></thead>
          <tbody>${rows.map((r, i) => {
            const cls = !done ? '' : i < 2 ? 'q' : i === 2 ? (complete ? (qualifiedThirds.has(r.id) ? 't' : 'o') : 't-pending') : 'o';
            return `<tr class="${cls}"><td class="rank">${i + 1}</td><td class="l"><span class="team">${flag(r.id)}<span class="nm">${esc(T(r.id).name)}</span></span></td>
              <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td class="hide-sm">${r.gf}</td><td class="hide-sm">${r.ga}</td><td>${r.gd > 0 ? '+' + r.gd : r.gd}</td><td class="pts">${r.pts}</td></tr>`;
          }).join('')}</tbody></table></div></article>`;
      }).join('')}</div>
      <section class="panel"><h2 class="section-title">Terceiros colocados</h2>
        <p class="muted small">Ordenados por pontos, saldo de gols e gols pró. Os oito primeiros vão aos 16 avos de final${complete ? '' : ' quando todos os grupos terminarem'}.</p>
        <div class="table-scroll"><table class="data standings"><thead><tr><th></th><th class="l">Seleção</th><th>Grupo</th><th title="Jogos">J</th><th title="Saldo de gols">SG</th><th title="Gols pró">GP</th><th title="Pontos">Pts</th></tr></thead>
        <tbody>${thirds.map((r, i) => `<tr class="${complete ? (i < 8 ? 't' : 'o') : ''}"><td class="rank">${i + 1}</td><td class="l"><span class="team">${flag(r.id)}<span class="nm">${esc(T(r.id).name)}</span></span></td><td>${r.group}</td><td>${r.p}</td><td>${r.gd > 0 ? '+' + r.gd : r.gd}</td><td>${r.gf}</td><td class="pts">${r.pts}</td></tr>`).join('')}</tbody></table></div>
      </section>`;
  }

  function bracketTab() {
    const byNo = Object.fromEntries(S.matches.map((m) => [m.no, m]));
    const box = (m) => {
      const line = (id, src, g, p, win) => `<div class="bt ${win ? 'win' : ''} ${id ? '' : 'tbd'}">${flag(id)}<span class="nm">${id ? esc(T(id).name) : esc(describeSource(src))}</span><span class="bs">${m.played ? g + (p !== null ? `<small>(${p})</small>` : '') : ''}</span></div>`;
      return `<div class="bmatch ${m.played ? 'played' : ''}"><span class="bno">J${m.no}${m.et && m.pa === null ? ' · prorr.' : ''}</span>
        ${line(m.a, m.srcA, m.ga, m.pa, m.played && m.winner === m.a)}${line(m.b, m.srcB, m.gb, m.pb, m.played && m.winner === m.b)}</div>`;
    };
    return `<div class="bracket-scroll"><div class="bracket">${BRACKET.map(([st, nos]) => `<section class="bcol">
      <h3>${BRACKET_TITLE[st]}</h3><div class="bcol-body">${nos.map((n) => box(byNo[n])).join('')}
      ${st === 'F' ? `<h3 class="sub">Disputa de 3º lugar</h3>${box(byNo[103])}` : ''}</div></section>`).join('')}</div></div>`;
  }

  // Boot: old saves keep working; fix any knockout slots that depend on finished results.
  if (S && (S.stage === 'play' || S.stage === 'done')) resolveKnockout();
  render();
})();
