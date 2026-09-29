// Placar de uma partida: gols por Poisson com média que depende da diferença de rating.
// Calibrado para que a pontuação média simulada coincida com a expectativa Elo.
(function (SIM) {
  'use strict';

  const { poisson } = SIM.rng;
  const MEDIA_GOLS = 1.35;
  const LAMBDA_MIN = 0.1;
  const LAMBDA_MAX = 6;

  const clampL = (x) => Math.min(LAMBDA_MAX, Math.max(LAMBDA_MIN, x));

  /** Taxas de gols esperados. `dr` = diferença de rating já com o mando (positivo favorece A). */
  function goalRates(dr, rng, fator = 1) {
    const formaA = 1 + (rng() - 0.5) * 0.1; // ±5% de "forma" no dia
    const formaB = 1 + (rng() - 0.5) * 0.1;
    return [
      clampL(MEDIA_GOLS * 10 ** (dr / 1000) * formaA) * fator,
      clampL(MEDIA_GOLS * 10 ** (-dr / 1000) * formaB) * fator,
    ];
  }

  /** Taxas médias (sem a variação de forma), usadas para calcular valores esperados. */
  const taxasMedias = (dr) => [clampL(MEDIA_GOLS * 10 ** (dr / 1000)), clampL(MEDIA_GOLS * 10 ** (-dr / 1000))];

  function simulateScore(dr, rng, fator = 1) {
    const [la, lb] = goalRates(dr, rng, fator);
    return [poisson(la, rng), poisson(lb, rng)];
  }

  /** Prorrogação: 30 minutos, ou seja, 1/3 das taxas de um jogo. */
  const simulateExtraTime = (dr, rng) => simulateScore(dr, rng, 1 / 3);

  /** Disputa de pênaltis: 5 cobranças alternadas e, depois, alternadas até decidir. */
  function penaltyShootout(dr, rng) {
    const conv = (d) => Math.min(0.85, Math.max(0.65, 0.75 + d / 4000));
    const pA = conv(dr);
    const pB = conv(-dr);
    let a = 0;
    let b = 0;
    for (let i = 0; i < 5; i++) {
      if (rng() < pA) a++;
      // Após a cobrança de A: B ainda tem (5 - i) cobranças; A tem (4 - i).
      if (a > b + (5 - i) || b > a + (4 - i)) return [a, b];
      if (rng() < pB) b++;
      if (a > b + (4 - i) || b > a + (4 - i)) return [a, b];
    }
    while (a === b) {
      if (rng() < pA) a++;
      if (rng() < pB) b++;
    }
    return [a, b];
  }

  SIM.partida = { goalRates, taxasMedias, simulateScore, simulateExtraTime, penaltyShootout };
})(window.SIM);
