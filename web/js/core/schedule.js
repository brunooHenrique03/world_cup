// Calendário de pontos corridos.
(function (SIM) {
  'use strict';

  const { shuffle } = SIM.rng;

  /** Turno único pelo método do círculo, alternando mandos. Retorna rodadas de pares [mandante, visitante]. */
  function roundRobin(items, rng) {
    const lista = shuffle(items, rng);
    if (lista.length % 2 === 1) lista.push(null);
    const n = lista.length;
    const rodadas = [];
    const fixo = lista[0];
    let giro = lista.slice(1);
    for (let r = 0; r < n - 1; r++) {
      const atual = [fixo, ...giro];
      const jogos = [];
      for (let i = 0; i < n / 2; i++) {
        const a = atual[i];
        const b = atual[n - 1 - i];
        if (a === null || b === null) continue;
        // Alterna mando para equilibrar casa/fora.
        jogos.push((r + i) % 2 === 0 ? [a, b] : [b, a]);
      }
      rodadas.push(jogos);
      giro = [giro[giro.length - 1], ...giro.slice(0, -1)];
    }
    return rodadas;
  }

  /** Turno e returno: o returno espelha o turno com mandos invertidos. */
  function doubleRoundRobin(items, rng) {
    const turno = roundRobin(items, rng);
    return [...turno, ...turno.map((r) => r.map(([a, b]) => [b, a]))];
  }

  SIM.calendario = { roundRobin, doubleRoundRobin };
})(window.SIM);
