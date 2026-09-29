// Rating no estilo World Football Elo.
//   We = 1 / (1 + 10^(-(Ra - Rb + HFA) / 400))
//   Rn = Ro + K * (G * (W - We) - viés)
// Soma zero: o que um time ganha o outro perde. O "viés" corrige o efeito do multiplicador
// de gols G para que ninguém ganhe rating só por ser favorito (ver vies()).
(function (SIM) {
  'use strict';

  /** Vantagem de mando de campo, em pontos de rating. */
  const HFA = 100;

  /** Pontos mínimos que um vencedor sempre ganha (toda vitória aumenta o rating). */
  const GANHO_MINIMO = 1;

  /** Peso (K) por importância da partida. */
  const K = {
    copaDoMundo: 60,
    uclMataMata: 50,
    uclLiga: 40,
    copaDoBrasil: 40,
    brasileirao: 30,
  };

  const expected = (ra, rb, hfa = 0) => 1 / (1 + 10 ** (-(ra - rb + hfa) / 400));

  function goalMultiplier(margin) {
    const n = Math.abs(margin);
    if (n <= 1) return 1;
    if (n === 2) return 1.5;
    return (11 + n) / 8;
  }

  /**
   * Viés do multiplicador de gols: o favorito vence por placares largos e perde por pouco,
   * então E[G·(W − We)] > 0 e, sem correção, os fortes ganham rating em média a cada jogo
   * (e a diferença se realimenta). O valor esperado é calculado exatamente sobre o modelo de
   * placar (Poisson) e descontado, para que a variação esperada de cada jogo seja zero.
   */
  const cacheVies = new Map();
  function vies(dr) {
    const chave = Math.round(dr / 5) * 5;
    if (cacheVies.has(chave)) return cacheVies.get(chave);
    const [la, lb] = SIM.partida.taxasMedias(chave);
    const pmf = (l) => {
      const p = [Math.exp(-l)];
      for (let n = 1; n <= 15; n++) p.push((p[n - 1] * l) / n);
      return p;
    };
    const pa = pmf(la), pb = pmf(lb);
    const we = 1 / (1 + 10 ** (-chave / 400));
    let e = 0;
    for (let a = 0; a <= 15; a++) {
      for (let b = 0; b <= 15; b++) {
        const w = a > b ? 1 : a < b ? 0 : 0.5;
        e += pa[a] * pb[b] * goalMultiplier(a - b) * (w - we);
      }
    }
    cacheVies.set(chave, e);
    return e;
  }

  /**
   * Variação de rating para o time A (o time B recebe o valor negativo).
   * `penaltis`: 'A' ou 'B' quando o jogo empatou e foi decidido nos pênaltis.
   */
  function eloDelta({ ratingA, ratingB, hfa, k, golsA, golsB, penaltis }) {
    const we = expected(ratingA, ratingB, hfa);
    let w;
    if (golsA > golsB) w = 1;
    else if (golsA < golsB) w = 0;
    else if (penaltis === 'A') w = 0.75;
    else if (penaltis === 'B') w = 0.25;
    else w = 0.5;

    let delta = k * (goalMultiplier(golsA - golsB) * (w - we) - vies(ratingA - ratingB + hfa));
    // Quem vence (no tempo normal, na prorrogação ou nos pênaltis) sempre sobe no ranking.
    if (w > 0.5 && delta < GANHO_MINIMO) delta = GANHO_MINIMO;
    if (w < 0.5 && delta > -GANHO_MINIMO) delta = -GANHO_MINIMO;
    return Math.round(delta * 10) / 10;
  }

  /**
   * Força em campo: o rating inicial (qualidade do elenco) mais metade da fase atual.
   * Se a simulação usasse o próprio rating, o Elo viraria um passeio aleatório sem âncora
   * (times sobem ou caem para sempre). Assim um time em boa fase joga melhor, mas quando o
   * rating passa da força real ele rende abaixo do esperado e volta aos poucos.
   */
  const PESO_FASE = 0.5;
  const forca = (t) => t.ratingInicial + PESO_FASE * (t.rating - t.ratingInicial);

  SIM.elo = { HFA, GANHO_MINIMO, K, expected, goalMultiplier, vies, eloDelta, forca };
})(window.SIM);
