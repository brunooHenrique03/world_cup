// Classificação com os critérios de desempate de cada entidade:
// - fifa2026: pontos, confronto direto, saldo, gols pró, sorteio (Copa de 48)
// - uefa:     pontos, saldo, gols pró, gols fora, vitórias, vitórias fora, sorteio
// - cbf:      pontos, vitórias, saldo, gols pró, confronto direto, sorteio
// O "sorteio" usa um número fixo por time (`sorteio[id]`), guardado na edição,
// para que a tabela seja a mesma a cada vez que a tela é desenhada.
(function (SIM) {
  'use strict';

  const PTS = (r) => r.pts;
  const SG = (r) => r.sg;
  const GP = (r) => r.gp;
  const V = (r) => r.v;
  const GPF = (r) => r.gpFora;
  const VF = (r) => r.vFora;

  const REGRAS = {
    fifa2026: { antes: [PTS], confrontoDireto: true, depois: [SG, GP] },
    uefa: { antes: [PTS, SG, GP, GPF, V, VF], confrontoDireto: false, depois: [] },
    cbf: { antes: [PTS, V, SG, GP], confrontoDireto: true, depois: [] },
  };

  const emptyRow = (id) => ({ id, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pts: 0, gpFora: 0, vFora: 0 });

  /** Soma os jogos disputados (`{m, v, gm, gv, jogado}`) entre os times dados. */
  function accumulate(ids, jogos) {
    const rows = new Map(ids.map((id) => [id, emptyRow(id)]));
    for (const m of jogos) {
      if (!m.jogado) continue;
      const h = rows.get(m.m);
      const a = rows.get(m.v);
      if (!h || !a) continue;
      h.j++; a.j++;
      h.gp += m.gm; h.gc += m.gv;
      a.gp += m.gv; a.gc += m.gm;
      a.gpFora += m.gv;
      if (m.gm > m.gv) { h.v++; a.d++; h.pts += 3; }
      else if (m.gm < m.gv) { a.v++; h.d++; a.pts += 3; a.vFora++; }
      else { h.e++; a.e++; h.pts++; a.pts++; }
    }
    for (const r of rows.values()) r.sg = r.gp - r.gc;
    return rows;
  }

  function compareBy(keys) {
    return (x, y) => {
      for (const k of keys) {
        const d = k(y) - k(x);
        if (d !== 0) return d;
      }
      return 0;
    };
  }

  function classificar(ids, jogos, criterio, sorteio = {}) {
    const regra = REGRAS[criterio];
    const rows = [...accumulate(ids, jogos).values()];
    const lote = (r) => sorteio[r.id] ?? 0;
    const byAntes = compareBy(regra.antes);
    rows.sort(byAntes);

    const out = [];
    for (let i = 0; i < rows.length;) {
      let j = i + 1;
      while (j < rows.length && byAntes(rows[i], rows[j]) === 0) j++;
      const grupo = rows.slice(i, j);
      if (grupo.length > 1) {
        let h2h = new Map();
        if (regra.confrontoDireto) {
          const set = new Set(grupo.map((r) => r.id));
          h2h = accumulate(grupo.map((r) => r.id), jogos.filter((m) => set.has(m.m) && set.has(m.v)));
        }
        const hk = (f) => (r) => (h2h.has(r.id) ? f(h2h.get(r.id)) : 0);
        const keys = [...(regra.confrontoDireto ? [hk(PTS), hk(SG), hk(GP)] : []), ...regra.depois, lote];
        grupo.sort(compareBy(keys));
      }
      out.push(...grupo);
      i = j;
    }
    return out;
  }

  /** Ordena linhas já calculadas de grupos diferentes (ex.: melhores terceiros): pontos, saldo, gols pró, sorteio. */
  const compararEntreGrupos = (sorteio) => compareBy([PTS, SG, GP, (r) => sorteio[r.id] ?? 0]);

  SIM.classificar = classificar;
  SIM.compararEntreGrupos = compararEntreGrupos;
})(window.SIM);
