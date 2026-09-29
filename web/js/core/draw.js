// Sorteios: potes, confrontos entre potes, sorteio aberto e a fase de liga da Champions (modelo suíço).
// Tudo trabalha com ids de times; o país vem de SIM.T(id).pais.
(function (SIM) {
  'use strict';

  const { shuffle } = SIM.rng;
  const pais = (id) => SIM.T(id).pais;

  /** Divide em potes pelo rating atual (pote 1 = mais fortes). `primeiros` entram no pote 1 obrigatoriamente. */
  function makePots(ids, nPots, primeiros = []) {
    const fixos = new Set(primeiros);
    const ordenados = [...primeiros, ...SIM.porRating(ids.filter((id) => !fixos.has(id)))];
    const tam = Math.ceil(ordenados.length / nPots);
    return Array.from({ length: nPots }, (_, i) => ordenados.slice(i * tam, (i + 1) * tam));
  }

  /** Divide em metade forte (pote A) e metade fraca (pote B) pelo rating atual. */
  function potesAB(ids) {
    const o = SIM.porRating(ids);
    return [o.slice(0, o.length / 2), o.slice(o.length / 2)];
  }

  /**
   * Sorteia confrontos entre dois potes (ex.: pote A = mais fortes x pote B = mais fracos),
   * garantindo que fortes não se enfrentem. `podeCruzar` impõe restrições extras.
   */
  function drawPairs(potA, potB, rng, podeCruzar = () => true) {
    if (potA.length !== potB.length) throw new Error('Potes de tamanhos diferentes.');
    for (let tentativa = 0; tentativa < 200; tentativa++) {
      const a = shuffle(potA, rng);
      const b = shuffle(potB, rng);
      const usado = new Array(b.length).fill(false);
      const res = [];
      const casar = (i) => {
        if (i === a.length) return true;
        for (let j = 0; j < b.length; j++) {
          if (usado[j] || !podeCruzar(a[i], b[j])) continue;
          usado[j] = true;
          res.push([a[i], b[j]]);
          if (casar(i + 1)) return true;
          res.pop();
          usado[j] = false;
        }
        return false;
      };
      if (casar(0)) return res;
    }
    throw new Error('Não foi possível sortear os confrontos com as restrições dadas.');
  }

  /** Sorteio aberto: embaralha e forma pares consecutivos. */
  function drawOpen(ids, rng) {
    const s = shuffle(ids, rng);
    const res = [];
    for (let i = 0; i + 1 < s.length; i += 2) res.push([s[i], s[i + 1]]);
    return res;
  }

  /**
   * Fase de liga da Champions (36 clubes, 4 potes de 9): cada clube enfrenta 2 adversários
   * de cada pote (1 em casa, 1 fora), nenhum do mesmo país e no máximo 2 do mesmo país estrangeiro.
   * Retorna a lista de jogos [mandante, visitante].
   */
  function drawSwissLeague(pots, rng) {
    for (let tentativa = 0; tentativa < 500; tentativa++) {
      const res = tentarSuico(pots, rng);
      if (res) return res;
    }
    throw new Error('Não foi possível sortear a fase de liga.');
  }

  function tentarSuico(pots, rng) {
    const oponentes = new Map(pots.flat().map((id) => [id, []]));
    const jogos = [];

    const valido = (casa, fora) => {
      if (casa === fora || pais(casa) === pais(fora)) return false;
      const oc = oponentes.get(casa);
      const of = oponentes.get(fora);
      if (oc.includes(fora)) return false;
      if (oc.filter((o) => pais(o) === pais(fora)).length >= 2) return false;
      if (of.filter((o) => pais(o) === pais(casa)).length >= 2) return false;
      return true;
    };

    // Para cada par ordenado de potes (i, j): uma permutação em que cada clube do pote i
    // recebe exatamente um clube do pote j (e cada clube do pote j visita exatamente um do pote i).
    const paresDePotes = [];
    for (let i = 0; i < pots.length; i++) for (let j = 0; j < pots.length; j++) paresDePotes.push([i, j]);

    for (const [pi, pj] of shuffle(paresDePotes, rng)) {
      const mandantes = shuffle(pots[pi], rng);
      const visitantes = shuffle(pots[pj], rng);
      const usado = new Set();
      const escolhidos = [];
      let passos = 0;
      const casar = (k) => {
        if (k === mandantes.length) return true;
        if (++passos > 20000) return false;
        const casa = mandantes[k];
        for (const fora of visitantes) {
          if (usado.has(fora) || !valido(casa, fora)) continue;
          usado.add(fora);
          escolhidos.push([casa, fora]);
          oponentes.get(casa).push(fora);
          oponentes.get(fora).push(casa);
          if (casar(k + 1)) return true;
          oponentes.get(casa).pop();
          oponentes.get(fora).pop();
          escolhidos.pop();
          usado.delete(fora);
        }
        return false;
      };
      if (!casar(0)) return null;
      jogos.push(...escolhidos);
    }
    return jogos;
  }

  /**
   * Distribui jogos em rodadas nas quais cada time joga exatamente uma vez
   * (emparelhamento perfeito por rodada, com backtracking). Retorna null se não conseguir.
   */
  function scheduleRounds(jogos, nRodadas, rng) {
    for (let tentativa = 0; tentativa < 50; tentativa++) {
      let restantes = shuffle(jogos, rng);
      const rodadas = [];
      let ok = true;
      for (let r = 0; r < nRodadas; r++) {
        const rodada = emparelhamentoPerfeito(restantes);
        if (!rodada) { ok = false; break; }
        const usados = new Set(rodada);
        restantes = restantes.filter((j) => !usados.has(j));
        rodadas.push(rodada);
      }
      if (ok && restantes.length === 0) return rodadas;
    }
    return null;
  }

  function emparelhamentoPerfeito(jogos) {
    const times = new Map();
    for (const j of jogos) {
      for (const t of j) {
        if (!times.has(t)) times.set(t, []);
        times.get(t).push(j);
      }
    }
    const coberto = new Set();
    const escolhidos = [];
    let passos = 0;
    const buscar = () => {
      if (coberto.size === times.size) return true;
      if (++passos > 50000) return false;
      // Time descoberto com menos opções (heurística MRV).
      let melhor = null;
      for (const [id, lista] of times) {
        if (coberto.has(id)) continue;
        const opcoes = lista.filter(([a, b]) => !coberto.has(a) && !coberto.has(b));
        if (opcoes.length === 0) return false;
        if (!melhor || opcoes.length < melhor.length) melhor = opcoes;
      }
      for (const j of melhor) {
        coberto.add(j[0]); coberto.add(j[1]);
        escolhidos.push(j);
        if (buscar()) return true;
        escolhidos.pop();
        coberto.delete(j[0]); coberto.delete(j[1]);
      }
      return false;
    };
    return buscar() ? escolhidos : null;
  }

  SIM.sorteio = { makePots, potesAB, drawPairs, drawOpen, drawSwissLeague, scheduleRounds };
})(window.SIM);
