// Motor comum das competições.
//
// Cada competição registra uma definição com SIM.registrarCompeticao({ ... }):
//   tipo, nome, curto, cor, descricao, detalhes     metadados para o menu
//   etapas: [[id, rótulo], ...]                     etapas mostradas no topo; a última é 'jogos'
//   iniciar(ed)                                      prepara a edição (participantes, 1ª etapa)
//   preparacao(ed) → html                            tela das etapas antes de 'jogos'
//   acoes: { nome(ed, el, rng) }                     ações próprias (data-action="c:nome")
//   blocos(ed) → [[id, rótulo], ...]                 agrupamento dos jogos (rodadas / fases), em ordem
//   rotuloJogo(ed, j), tagJogo(ed, j), fonte(src)    textos do placar e da lista de jogos
//   abas(ed) → [[id, rótulo, html(ed)], ...]         abas extras além de "Jogos"
//   prepararAutomatico(ed, rng)                      executa a preparação sem interface (testes)
//   aposJogo(ed, j)                                  opcional: chamada depois de cada jogo
//   avancar(ed)                                      chamada quando não há jogo a disputar: cria os próximos
//                                                    jogos ou define ed.sorteioPendente
//   sortear(ed)                                      executa o sorteio pendente
//   terminou(ed) → bool, finalizar(ed)               encerramento (campeão, resultados, acesso/descenso)
//
// Jogo (dentro de ed.jogos):
//   { n, bloco, fase, rodada, perna, grupo, m, v, k, neutro,
//     mataMata: 'prorrogacao' | 'penaltis' | null,   jogo único que precisa de vencedor
//     vantagemEmpate: id | null,                       quem avança se empatar (sem pênaltis)
//     ida: n | null, desempate: 'prorrogacao' | 'penaltis',   volta de um confronto de ida e volta
//     jogado, gm, gv, prorr, penM, penV, venc, avanca, seq, rM, rV, delta }
(function (SIM) {
  'use strict';

  const { HFA, eloDelta } = SIM.elo;
  // O placar sai da força em campo (SIM.elo.forca); o rating Elo é atualizado com a expectativa pelo rating.
  const { simulateScore, simulateExtraTime, penaltyShootout } = SIM.partida;

  SIM.COMPETICOES = {};
  SIM.ORDEM_COMPETICOES = [];
  SIM.registrarCompeticao = (def) => {
    SIM.COMPETICOES[def.tipo] = def;
    SIM.ORDEM_COMPETICOES.push(def.tipo);
  };
  SIM.def = (ed) => SIM.COMPETICOES[ed.tipo];

  /** RNG da edição: cada número gerado atualiza o estado guardado em ed.rngEstado. */
  function rngDe(ed) {
    const base = SIM.rng.criarRng(ed.rngEstado);
    const rng = () => {
      const x = base();
      ed.rngEstado = base.estado();
      return x;
    };
    return rng;
  }

  function novaEdicao(tipo) {
    const def = SIM.COMPETICOES[tipo];
    const semente = SIM.rng.sementeAleatoria();
    const ed = {
      id: SIM.store.novaEdicaoId(), tipo, numero: null, rotulo: '', status: 'andamento',
      criadoEm: new Date().toISOString().slice(0, 10), semente, rngEstado: semente,
      etapa: def.etapas[0][0], sede: null, campeao: null, vice: null, terceiro: null,
      participantes: [], sorteio: {}, jogos: [], resultado: {}, sorteioPendente: null, ultimo: null,
    };
    def.iniciar(ed, rngDe(ed));
    SIM.store.adicionarEdicao(ed);
    return ed;
  }

  /** Número fixo por time para o último critério de desempate (sorteio). */
  function sortearLotes(ed, ids) {
    const rng = rngDe(ed);
    for (const id of ids) ed.sorteio[id] = rng();
  }

  function criarJogo(ed, j) {
    const jogo = Object.assign({
      n: ed.jogos.length + 1, bloco: null, fase: '', rodada: null, perna: null, grupo: null,
      m: null, v: null, k: 40, neutro: false, mataMata: null, vantagemEmpate: null, ida: null, desempate: null,
      jogado: false, gm: null, gv: null, prorr: false, penM: null, penV: null, venc: null, avanca: null,
    }, j);
    ed.jogos.push(jogo);
    return jogo;
  }

  /** Vantagem de campo a favor do mandante (negativa se favorece o visitante). */
  function hfa(ed, j) {
    if (!j.neutro) return HFA;
    if (ed.sede && ed.sede === j.m) return HFA;
    if (ed.sede && ed.sede === j.v) return -HFA;
    return 0;
  }

  function jogar(ed, j, rng = rngDe(ed)) {
    const M = SIM.T(j.m);
    const V = SIM.T(j.v);
    const h = hfa(ed, j);
    const dr = SIM.elo.forca(M) - SIM.elo.forca(V) + h;
    let [gm, gv] = simulateScore(dr, rng);
    let prorr = false;
    let penM = null;
    let penV = null;
    let venc = gm > gv ? j.m : gv > gm ? j.v : null;
    let avanca = null;

    if (j.ida) {
      // Volta de um confronto de ida e volta. Sem gol fora; empate no agregado vai à
      // prorrogação (UEFA) ou direto aos pênaltis (CBF). `a` mandou a ida (é o visitante agora).
      const ida = ed.jogos[j.ida - 1];
      const aggA = () => ida.gm + gv;
      const aggB = () => ida.gv + gm;
      if (aggA() === aggB() && j.desempate === 'prorrogacao') {
        const [em, ev] = simulateExtraTime(dr, rng);
        gm += em;
        gv += ev;
        prorr = true;
      }
      if (aggA() !== aggB()) {
        avanca = aggA() > aggB() ? j.v : j.m;
      } else {
        [penM, penV] = penaltyShootout(dr, rng);
        avanca = penM > penV ? j.m : j.v;
      }
      venc = gm > gv ? j.m : gv > gm ? j.v : penM !== null ? avanca : null;
    } else if (!venc && j.vantagemEmpate) {
      avanca = j.vantagemEmpate;
    } else if (!venc && j.mataMata) {
      if (j.mataMata === 'prorrogacao') {
        const [em, ev] = simulateExtraTime(dr, rng);
        gm += em;
        gv += ev;
        prorr = true;
        venc = gm > gv ? j.m : gv > gm ? j.v : null;
      }
      if (!venc) {
        [penM, penV] = penaltyShootout(dr, rng);
        venc = penM > penV ? j.m : j.v;
      }
    }
    if (!j.ida && (j.mataMata || j.vantagemEmpate)) avanca = avanca || venc;

    const penaltis = penM !== null && gm === gv ? (penM > penV ? 'A' : 'B') : undefined;
    const delta = eloDelta({ ratingA: M.rating, ratingB: V.rating, hfa: h, k: j.k, golsA: gm, golsB: gv, penaltis });
    Object.assign(j, {
      jogado: true, gm, gv, prorr, penM, penV, venc, avanca,
      seq: SIM.store.proximoSeq(), rM: M.rating, rV: V.rating, delta,
    });
    M.rating = Math.round((M.rating + delta) * 10) / 10;
    V.rating = Math.round((V.rating - delta) * 10) / 10;
    ed.ultimo = j.n;
    const def = SIM.def(ed);
    if (def.aposJogo) def.aposJogo(ed, j);
    avancar(ed);
    return j;
  }

  /** Depois de cada jogo: deixa a competição criar os próximos jogos e encerra quando for o caso. */
  function avancar(ed) {
    const def = SIM.def(ed);
    if (!ed.sorteioPendente && !proximoJogo(ed)) def.avancar(ed, rngDe(ed));
    if (!ed.sorteioPendente && !proximoJogo(ed) && def.terminou(ed)) finalizar(ed);
  }

  const proximoJogo = (ed) => ed.jogos.find((j) => !j.jogado && j.m && j.v) || null;

  function sortear(ed) {
    if (!ed.sorteioPendente) return;
    SIM.def(ed).sortear(ed, rngDe(ed));
    ed.sorteioPendente = null;
    ed.ultimo = null;
    avancar(ed);
  }

  function jogarProximo(ed) {
    const j = proximoJogo(ed);
    if (j) jogar(ed, j);
    return j;
  }

  /** Joga todos os jogos restantes do bloco (rodada ou fase) do próximo jogo. */
  function jogarBloco(ed) {
    const primeiro = proximoJogo(ed);
    if (!primeiro) return null;
    const rng = rngDe(ed);
    let j;
    while ((j = proximoJogo(ed)) && j.bloco === primeiro.bloco) jogar(ed, j, rng);
    ed.ultimo = null;
    return primeiro.bloco;
  }

  /** Joga (e sorteia) tudo até o fim da competição. */
  function simularTudo(ed) {
    const rng = rngDe(ed);
    let guarda = 0;
    while (ed.status === 'andamento' && guarda++ < 5000) {
      const j = proximoJogo(ed);
      if (j) jogar(ed, j, rng);
      else if (ed.sorteioPendente) sortear(ed);
      else break;
    }
    ed.ultimo = null;
  }

  function finalizar(ed) {
    SIM.def(ed).finalizar(ed, rngDe(ed));
    ed.status = 'concluida';
    ed.concluidoEm = new Date().toISOString().slice(0, 10);
  }

  /** Descarta uma edição em andamento: reverte o rating de cada jogo disputado e apaga a edição. */
  function descartar(ed) {
    for (const j of ed.jogos.slice().reverse()) {
      if (!j.jogado) continue;
      SIM.T(j.m).rating = Math.round((SIM.T(j.m).rating - j.delta) * 10) / 10;
      SIM.T(j.v).rating = Math.round((SIM.T(j.v).rating + j.delta) * 10) / 10;
    }
    return SIM.store.removerEdicao(ed);
  }

  // ---------- consultas ----------
  const jogosDoBloco = (ed, bloco) => ed.jogos.filter((j) => j.bloco === bloco);
  const blocoCompleto = (ed, bloco) => jogosDoBloco(ed, bloco).every((j) => j.jogado);
  /** Quem avançou em um jogo eliminatório (jogo único ou volta de ida e volta). */
  const quemAvanca = (j) => j.avanca;
  const quemCai = (j) => (j.avanca ? (j.avanca === j.m ? j.v : j.m) : null);
  const letraGrupo = (i) => String.fromCharCode(65 + i);

  /** Nome da fase eliminatória pelo número de times restantes. */
  function nomeFase(nTimes) {
    switch (nTimes) {
      case 2: return 'Final';
      case 4: return 'Semifinal';
      case 8: return 'Quartas de final';
      case 16: return 'Oitavas de final';
      case 32: return '16 avos de final';
      default: return `Fase de ${nTimes}`;
    }
  }

  /** Cria os jogos de confrontos de ida e volta. `pares` = [[manda a ida, manda a volta], ...]. */
  function criarIdaEVolta(ed, pares, o) {
    // Todas as idas antes das voltas: os jogos são disputados na ordem de ed.jogos.
    const idas = pares.map(([a, b]) => criarJogo(ed, { bloco: o.bloco, fase: o.fase, perna: 1, m: a, v: b, k: o.k }));
    pares.forEach(([a, b], i) => criarJogo(ed, {
      bloco: o.bloco + '-v', fase: o.fase, perna: 2, m: b, v: a, k: o.k, ida: idas[i].n, desempate: o.desempate,
    }));
  }

  SIM.motor = {
    rngDe, novaEdicao, sortearLotes, criarJogo, criarIdaEVolta, jogar, avancar, proximoJogo, sortear,
    jogarProximo, jogarBloco, simularTudo, finalizar, descartar,
    jogosDoBloco, blocoCompleto, quemAvanca, quemCai, letraGrupo, nomeFase,
  };
})(window.SIM);
