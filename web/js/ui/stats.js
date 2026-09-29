// Agregados para as páginas: títulos, totais, retrospecto e confronto direto (memorizados pela revisão do store).
(function (SIM) {
  'use strict';

  const memo = (fn) => {
    let rev = -1, val;
    return () => {
      if (rev !== SIM.store.rev) { val = fn(); rev = SIM.store.rev; }
      return val;
    };
  };

  /** { id: { total, porTipo: { tipo: n }, vices } } */
  const titulos = memo(() => {
    const out = {};
    const de = (id) => (out[id] = out[id] || { total: 0, porTipo: {}, vices: 0 });
    for (const ed of SIM.store.concluidas()) {
      if (ed.campeao) {
        const t = de(ed.campeao);
        t.total++;
        t.porTipo[ed.tipo] = (t.porTipo[ed.tipo] || 0) + 1;
      }
      if (ed.vice) de(ed.vice).vices++;
    }
    return out;
  });

  const totais = memo(() => {
    const jogos = SIM.store.todosOsJogos();
    const gols = jogos.reduce((s, { j }) => s + j.gm + j.gv, 0);
    return {
      edicoes: SIM.store.concluidas().length,
      jogos: jogos.length,
      gols,
      media: jogos.length ? gols / jogos.length : 0,
      penaltis: jogos.filter(({ j }) => j.penM !== null).length,
    };
  });

  /** Retrospecto de um time (ou de A contra B, se `contra` for dado). */
  function retrospecto(id, contra) {
    let jogos = SIM.store.jogosDoTime(id);
    if (contra) jogos = jogos.filter(({ j }) => j.m === contra || j.v === contra);
    const r = { j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, jogos };
    for (const { j } of jogos) {
      r.j++;
      const meus = j.m === id ? j.gm : j.gv;
      const deles = j.m === id ? j.gv : j.gm;
      r.gp += meus; r.gc += deles;
      if (meus > deles) r.v++; else if (meus < deles) r.d++; else r.e++;
    }
    return r;
  }

  /** Variação de rating nos últimos `n` jogos. */
  function variacaoRecente(id, n = 10) {
    return SIM.store.jogosDoTime(id).slice(-n).reduce((s, { j }) => s + (j.m === id ? j.delta : -j.delta), 0);
  }

  /** Ranking atual de um grupo de times, com posição. */
  function ranking(filtro) {
    return SIM.porRating(Object.values(SIM.TEAMS).filter(filtro).map((t) => t.id));
  }

  const GRUPOS_RANKING = {
    selecoes: { rotulo: 'Seleções', filtro: (t) => t.tipo === 'selecao' },
    europa: { rotulo: 'Clubes europeus', filtro: (t) => t.tipo === 'clube' && t.conf === 'UEFA' },
    brasil: { rotulo: 'Clubes brasileiros', filtro: (t) => t.tipo === 'clube' && t.pais === 'BRA' },
  };

  const grupoDoTime = (t) => (t.tipo === 'selecao' ? 'selecoes' : t.conf === 'UEFA' ? 'europa' : 'brasil');

  SIM.stats = { titulos, totais, retrospecto, variacaoRecente, ranking, GRUPOS_RANKING, grupoDoTime };
})(window.SIM);
