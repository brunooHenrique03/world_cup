// Testes do núcleo e das competições. Rodam no navegador (tests.html) e no Node (sem interface).
// Cada teste lança um erro se falhar.
(function (SIM) {
  'use strict';

  const testes = [];
  const teste = (nome, fn) => testes.push({ nome, fn });
  function ok(cond, msg) { if (!cond) throw new Error(msg || 'condição falsa'); }
  function igual(a, b, msg) { if (a !== b) throw new Error(`${msg || 'valores diferentes'}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); }

  const { criarRng } = SIM.rng;
  const { eloDelta, K } = SIM.elo;

  /** Guarda e restaura ratings/divisões/edições para que os testes não alterem os dados do usuário. */
  function isolado(fn) {
    const ratings = Object.values(SIM.TEAMS).map((t) => [t, t.rating, t.divisao]);
    const edicoes = SIM.store.edicoes;
    const meta = JSON.stringify(SIM.store.meta);
    const salvar = SIM.store.salvar, adicionar = SIM.store.adicionarEdicao;
    SIM.store.edicoes = [];
    SIM.store.salvar = () => Promise.resolve();
    SIM.store.adicionarEdicao = (ed) => { SIM.store.edicoes.push(ed); return Promise.resolve(); };
    try { return fn(); } finally {
      for (const [t, r, d] of ratings) { t.rating = r; t.divisao = d; }
      SIM.store.edicoes = edicoes;
      SIM.store.meta = JSON.parse(meta);
      SIM.store.salvar = salvar;
      SIM.store.adicionarEdicao = adicionar;
      SIM.store.rev++;
    }
  }

  function simularEdicao(tipo) {
    const ed = SIM.motor.novaEdicao(tipo);
    SIM.def(ed).prepararAutomatico(ed, SIM.motor.rngDe(ed));
    SIM.motor.simularTudo(ed);
    return ed;
  }

  // ---------- Elo ----------
  teste('Elo: soma zero e simétrico', () => {
    const d = eloDelta({ ratingA: 1800, ratingB: 1700, hfa: 0, k: 40, golsA: 2, golsB: 1 });
    const inv = eloDelta({ ratingA: 1700, ratingB: 1800, hfa: 0, k: 40, golsA: 1, golsB: 2 });
    igual(d, -inv, 'o delta de B é o oposto do de A');
  });
  teste('Elo: vencedor sempre ganha pelo menos 1 ponto', () => {
    const d = eloDelta({ ratingA: 2400, ratingB: 1200, hfa: 100, k: 30, golsA: 1, golsB: 0 });
    ok(d >= 1, `delta ${d}`);
    const p = eloDelta({ ratingA: 2400, ratingB: 1200, hfa: 0, k: 30, golsA: 0, golsB: 0, penaltis: 'A' });
    ok(p >= 1, `vitória nos pênaltis: delta ${p}`);
  });
  teste('Elo: goleada vale mais que vitória simples', () => {
    const a = eloDelta({ ratingA: 1700, ratingB: 1700, hfa: 0, k: 40, golsA: 1, golsB: 0 });
    const b = eloDelta({ ratingA: 1700, ratingB: 1700, hfa: 0, k: 40, golsA: 4, golsB: 0 });
    ok(b > a, `${b} > ${a}`);
  });

  teste('Elo sem viés: a variação esperada do favorito é ~0 (o multiplicador de gols não infla os fortes)', () => {
    const rng = criarRng(21);
    for (const dr of [0, 150, 300]) {
      let soma = 0;
      const N = 20000;
      for (let i = 0; i < N; i++) {
        const [a, b] = SIM.partida.simulateScore(dr, rng);
        soma += eloDelta({ ratingA: 1800 + dr, ratingB: 1800, hfa: 0, k: 40, golsA: a, golsB: b });
      }
      ok(Math.abs(soma / N) < 0.4, `dr=${dr}: variação média ${(soma / N).toFixed(2)}`);
    }
  });

  // ---------- RNG e partida ----------
  teste('RNG: mesma semente gera a mesma sequência e o estado pode ser retomado', () => {
    const a = criarRng(42), b = criarRng(42);
    for (let i = 0; i < 5; i++) igual(a(), b());
    const c = criarRng(a.estado());
    igual(c(), a());
  });
  teste('Partida: favorito vence mais e a média de gols é plausível', () => {
    const rng = criarRng(7);
    let v = 0, d = 0, gols = 0;
    for (let i = 0; i < 4000; i++) {
      const [x, y] = SIM.partida.simulateScore(300, rng);
      gols += x + y;
      if (x > y) v++; else if (y > x) d++;
    }
    ok(v > d * 2, `vitórias ${v} x derrotas ${d}`);
    const media = gols / 4000;
    ok(media > 2 && media < 3.6, `média de gols ${media}`);
  });
  teste('Pênaltis: sempre há vencedor', () => {
    const rng = criarRng(3);
    for (let i = 0; i < 500; i++) {
      const [a, b] = SIM.partida.penaltyShootout(0, rng);
      ok(a !== b, `${a} x ${b}`);
    }
  });

  // ---------- classificação ----------
  const J = (m, v, gm, gv) => ({ m, v, gm, gv, jogado: true });
  teste('Classificação FIFA 2026: confronto direto antes do saldo', () => {
    // A e B com 6 pontos; B tem saldo maior, mas A venceu o confronto direto.
    const jogos = [J('A', 'B', 1, 0), J('A', 'C', 0, 1), J('A', 'D', 1, 0), J('B', 'C', 5, 0), J('B', 'D', 3, 0), J('C', 'D', 0, 2)];
    const t = SIM.classificar(['A', 'B', 'C', 'D'], jogos, 'fifa2026');
    igual(t[0].id, 'A');
    igual(t[1].id, 'B');
  });
  teste('Classificação UEFA: saldo decide antes do confronto direto', () => {
    const jogos = [J('A', 'B', 1, 0), J('A', 'C', 0, 1), J('A', 'D', 1, 0), J('B', 'C', 5, 0), J('B', 'D', 3, 0), J('C', 'D', 0, 2)];
    const t = SIM.classificar(['A', 'B', 'C', 'D'], jogos, 'uefa');
    igual(t[0].id, 'B');
  });
  teste('Classificação CBF: número de vitórias antes do saldo', () => {
    // A: 2V 0E 1D (6 pts, saldo +1). B: 1V 3E 0D (6 pts, saldo +5). CBF: A na frente.
    const jogos = [J('A', 'X', 1, 0), J('A', 'Y', 1, 0), J('A', 'Z', 0, 1), J('B', 'X', 5, 0), J('B', 'Y', 0, 0), J('B', 'Z', 0, 0), J('B', 'W', 0, 0)];
    const t = SIM.classificar(['A', 'B'], jogos, 'cbf');
    igual(t[0].id, 'A');
  });
  teste('Classificação: empate total resolvido pelo sorteio guardado', () => {
    // (Na UEFA, B passaria à frente pelos gols fora; na CBF o empate chega ao sorteio.)
    const t1 = SIM.classificar(['A', 'B'], [J('A', 'B', 1, 1)], 'cbf', { A: 0.1, B: 0.9 });
    igual(t1[0].id, 'B');
    const t2 = SIM.classificar(['A', 'B'], [J('A', 'B', 1, 1)], 'cbf', { A: 0.9, B: 0.1 });
    igual(t2[0].id, 'A');
    const t3 = SIM.classificar(['A', 'B'], [J('A', 'B', 1, 1)], 'uefa', { A: 0.9, B: 0.1 });
    igual(t3[0].id, 'B', 'UEFA: gols fora');
  });

  // ---------- calendário e sorteios ----------
  teste('Turno e returno: cada par se enfrenta uma vez em casa e uma fora', () => {
    const ids = Array.from({ length: 20 }, (_, i) => 'T' + i);
    const rodadas = SIM.calendario.doubleRoundRobin(ids, criarRng(1));
    igual(rodadas.length, 38);
    const vistos = new Set();
    for (const r of rodadas) {
      igual(r.length, 10, 'jogos por rodada');
      const naRodada = new Set(r.flat());
      igual(naRodada.size, 20, 'cada time joga uma vez por rodada');
      for (const [a, b] of r) { ok(!vistos.has(a + '>' + b), 'mando repetido'); vistos.add(a + '>' + b); }
    }
    igual(vistos.size, 380);
  });
  teste('Sorteio suíço: 8 jogos por clube, 2 de cada pote, sem compatriotas e no máximo 2 por país', () => isolado(() => {
    const ed = SIM.motor.novaEdicao('champions');
    const jogos = SIM.sorteio.drawSwissLeague(ed.potes, criarRng(11));
    const pote = (id) => ed.potes.findIndex((p) => p.includes(id));
    for (const id of ed.participantes) {
      const meus = jogos.filter(([a, b]) => a === id || b === id);
      igual(meus.length, 8, 'jogos de ' + id);
      igual(meus.filter(([a]) => a === id).length, 4, 'jogos em casa de ' + id);
      const rivais = meus.map(([a, b]) => (a === id ? b : a));
      for (let p = 0; p < 4; p++) igual(rivais.filter((r) => pote(r) === p).length, 2, `rivais do pote ${p + 1} de ${id}`);
      ok(rivais.every((r) => SIM.T(r).pais !== SIM.T(id).pais), 'compatriota na fase de liga');
      const porPais = {};
      for (const r of rivais) porPais[SIM.T(r).pais] = (porPais[SIM.T(r).pais] || 0) + 1;
      ok(Object.values(porPais).every((n) => n <= 2), 'mais de 2 rivais do mesmo país');
    }
  }));

  teste('Potes da Champions: no máximo 4 clubes do mesmo país por pote (senão o sorteio suíço é impossível)', () => isolado(() => {
    // Força 6 ingleses no topo do rating para provocar o caso extremo.
    Object.values(SIM.TEAMS).filter((t) => t.pais === 'ENG' && t.tipo === 'clube').forEach((t, i) => { t.rating = 2600 - i; });
    const ed = SIM.motor.novaEdicao('champions');
    for (const pote of ed.potes) {
      const cont = {};
      for (const id of pote) cont[SIM.T(id).pais] = (cont[SIM.T(id).pais] || 0) + 1;
      ok(Object.values(cont).every((n) => n <= 4), JSON.stringify(cont));
    }
    SIM.sorteio.drawSwissLeague(ed.potes, criarRng(2));
  }));

  // ---------- competições completas ----------
  teste('Copa do Mundo: 104 jogos, grupos válidos e um campeão', () => isolado(() => {
    const ed = simularEdicao('copa');
    igual(ed.status, 'concluida');
    igual(ed.jogos.length, 104);
    ok(ed.jogos.every((j) => j.jogado), 'todos os jogos disputados');
    igual(new Set(ed.participantes).size, 48);
    for (const g of Object.keys(ed.grupos)) {
      const confs = ed.grupos[g].map((id) => SIM.T(id).conf);
      for (const c of new Set(confs)) ok(confs.filter((x) => x === c).length <= (c === 'UEFA' ? 2 : 1), `grupo ${g} com confederação repetida`);
    }
    igual(ed.grupos.A[0], ed.sede, 'a sede é A1');
    ok(ed.campeao && ed.vice && ed.campeao !== ed.vice, 'campeão e vice');
    igual(ed.resultado[ed.campeao], 'Campeão');
    ok(ed.jogos.slice(72).every((j) => j.avanca), 'todo jogo do mata-mata tem classificado');
  }));
  teste('Brasileirão: 380 jogos, acesso e descenso mantêm 20 clubes na Série A', () => isolado(() => {
    const ed = simularEdicao('brasileirao');
    igual(ed.jogos.length, 380);
    igual(ed.status, 'concluida');
    igual(ed.rebaixados.length, 4);
    igual(ed.promovidos.length, 4);
    const serieA = Object.values(SIM.TEAMS).filter((t) => t.pais === 'BRA' && t.divisao === 'A');
    igual(serieA.length, 20);
    ok(ed.rebaixados.every((id) => SIM.T(id).divisao === 'B'), 'rebaixados na Série B');
    const ed2 = simularEdicao('brasileirao');
    igual(ed2.numero, ed.numero + 1, 'temporada seguinte');
    ok(ed.promovidos.every((id) => ed2.participantes.includes(id)), 'promovidos jogam a temporada seguinte');
  }));
  teste('Copa do Brasil: 72 clubes, 8 diretos nas oitavas e um campeão', () => isolado(() => {
    const ed = simularEdicao('copaBrasil');
    igual(ed.status, 'concluida');
    igual(ed.participantes.length, 72);
    igual(ed.diretos.length, 8);
    // 32 (1ª fase) + 16 (2ª) + 16 (3ª, ida e volta) + 16 + 8 + 4 + 2
    igual(ed.jogos.length, 94);
    const oitavas = ed.jogos.filter((j) => j.bloco === 'OIT').flatMap((j) => [j.m, j.v]);
    ok(ed.diretos.every((id) => oitavas.includes(id)), 'diretos jogam as oitavas');
    igual(Object.keys(ed.resultado).length, 72, 'resultado para todos os clubes');
    igual(ed.resultado[ed.campeao], 'Campeão');
  }));
  teste('Champions: 36 clubes, fase de liga de 144 jogos e final única', () => isolado(() => {
    const ed = simularEdicao('champions');
    igual(ed.status, 'concluida');
    igual(ed.participantes.length, 36);
    igual(ed.jogos.filter((j) => j.bloco[0] === 'L').length, 144);
    // 144 + 16 (playoff) + 16 (oitavas) + 8 + 4 + 1
    igual(ed.jogos.length, 189);
    const final = ed.jogos[ed.jogos.length - 1];
    ok(final.neutro && final.avanca === ed.campeao, 'final em campo neutro');
    const porPais = {};
    for (const id of ed.participantes) porPais[SIM.T(id).pais] = (porPais[SIM.T(id).pais] || 0) + 1;
    ok(Object.entries(porPais).every(([p, n]) => n <= (SIM.VAGAS_POR_PAIS[p] ?? SIM.VAGAS_PADRAO)), 'limite de vagas por país');
    const ed2 = simularEdicao('champions');
    igual(ed2.detentor, ed.campeao, 'o campeão vigente volta como detentor');
  }));
  teste('Descartar uma edição devolve os ratings aos valores anteriores', () => isolado(() => {
    const antes = Object.fromEntries(Object.values(SIM.TEAMS).map((t) => [t.id, t.rating]));
    const ed = SIM.motor.novaEdicao('brasileirao');
    SIM.def(ed).prepararAutomatico(ed, SIM.motor.rngDe(ed));
    for (let i = 0; i < 60; i++) SIM.motor.jogarProximo(ed);
    ok(Object.values(SIM.TEAMS).some((t) => t.rating !== antes[t.id]), 'ratings mudaram');
    SIM.motor.descartar(ed);
    for (const t of Object.values(SIM.TEAMS)) ok(Math.abs(t.rating - antes[t.id]) < 0.05, `${t.id}: ${t.rating} x ${antes[t.id]}`);
  }));
  teste('Elo é de soma zero ao longo de uma temporada inteira', () => isolado(() => {
    const soma = () => Object.values(SIM.TEAMS).filter((t) => t.pais === 'BRA').reduce((s, t) => s + t.rating, 0);
    const antes = soma();
    simularEdicao('copaBrasil');
    ok(Math.abs(soma() - antes) < 0.5, `${soma()} x ${antes}`);
  }));

  SIM.rodarTestes = function () {
    return testes.map(({ nome, fn }) => {
      const t0 = Date.now();
      try { fn(); return { nome, ok: true, ms: Date.now() - t0 }; } catch (e) { return { nome, ok: false, erro: e.message, ms: Date.now() - t0 }; }
    });
  };
})(window.SIM);
