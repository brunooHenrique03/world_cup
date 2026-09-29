// Namespace global do simulador. Todos os outros scripts registram o que exportam em window.SIM.
// Scripts clássicos (e não ES modules) para que o app funcione aberto direto por file://.
(function () {
  'use strict';

  const SIM = (window.SIM = window.SIM || {});

  /** Todos os times (seleções e clubes), indexados pelo id. Ex.: 'ARG', 'BRA-FLA', 'ENG-LIV'. */
  SIM.TEAMS = {};

  SIM.addTeam = function (t) {
    t.ratingInicial = t.rating;
    t.divisaoInicial = t.divisao;
    SIM.TEAMS[t.id] = t;
  };

  SIM.T = (id) => SIM.TEAMS[id];
  SIM.LOCALE = 'pt-BR';

  SIM.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  SIM.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  SIM.fmtRating = (r) => Math.round(r).toLocaleString(SIM.LOCALE);
  SIM.fmtNum = (n) => n.toLocaleString(SIM.LOCALE);
  SIM.fmtDelta = (d) => (d > 0 ? '+' : d < 0 ? '−' : '±') + Math.abs(Math.round(d * 10) / 10).toLocaleString(SIM.LOCALE);
  SIM.porRating = (ids) => ids.slice().sort((a, b) => SIM.T(b).rating - SIM.T(a).rating || SIM.T(a).nome.localeCompare(SIM.T(b).nome, SIM.LOCALE));
})();
