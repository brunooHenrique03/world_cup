// Gerador pseudoaleatório com semente (mulberry32). O estado é um único inteiro,
// então cada edição guarda o seu e continua a mesma sequência depois de recarregar a página.
(function (SIM) {
  'use strict';

  function criarRng(estado) {
    let a = estado >>> 0;
    const rng = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    rng.estado = () => a;
    return rng;
  }

  const sementeAleatoria = () => Math.floor(Math.random() * 2 ** 31);

  function shuffle(arr, rng) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  function weightedPick(items, weight, rng) {
    const weights = items.map(weight);
    const total = weights.reduce((s, w) => s + w, 0);
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /** Amostra de uma distribuição de Poisson (algoritmo de Knuth). */
  function poisson(lambda, rng) {
    const l = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= rng();
    } while (p > l);
    return k - 1;
  }

  /**
   * Sorteio ponderado pelo rating: os mais fortes têm mais chance, mas surpresas acontecem.
   * A cada vaga, considera só os (n + folga) melhores candidatos restantes.
   */
  function sortearPonderado(candidatos, n, rng, folga = 4) {
    const restantes = SIM.porRating(candidatos);
    const escolhidos = [];
    for (let i = 0; i < n && restantes.length > 0; i++) {
      const janela = restantes.slice(0, n - i + folga);
      const max = SIM.T(janela[0]).rating;
      const t = weightedPick(janela, (id) => 10 ** ((SIM.T(id).rating - max) / 150), rng);
      escolhidos.push(t);
      restantes.splice(restantes.indexOf(t), 1);
    }
    return escolhidos;
  }

  SIM.rng = { criarRng, sementeAleatoria, shuffle, pick, weightedPick, poisson, sortearPonderado };
})(window.SIM);
