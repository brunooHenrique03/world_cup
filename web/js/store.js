// Persistência no IndexedDB, com tudo carregado em memória na inicialização
// (a interface continua síncrona; cada alteração é gravada logo em seguida).
//
// kv/meta   → { seq, proximoId, ratings: {id: rating}, divisoes: {id: divisão}, migrado }
// edicoes/* → uma edição por registro, com o estado interativo e todos os jogos
//
// Os jogos disputados ficam dentro das edições (única fonte da verdade). O índice por time,
// usado em rankings, página do time e confronto direto, é montado em memória sob demanda.
(function (SIM) {
  'use strict';

  const DB_NOME = 'sim-futebol';
  const OLD_HISTORY_KEY = 'wc-sim-history-v1';
  const OLD_STATE_KEY = 'wc-sim-state-v1';

  let db = null;
  const store = {
    meta: { seq: 0, proximoId: 1, ratings: {}, divisoes: {}, migrado: false },
    edicoes: [],
    persistente: false,
    avisos: [],
    rev: 0,
  };

  // ---------- IndexedDB ----------
  function abrir() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error('IndexedDB indisponível'));
      const req = indexedDB.open(DB_NOME, 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        d.createObjectStore('kv');
        d.createObjectStore('edicoes', { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function tx(nomes, modo, fn) {
    if (!db) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const t = db.transaction(nomes, modo);
      const out = fn(t);
      t.oncomplete = () => resolve(out && out.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }).catch((e) => {
      console.error(e);
      avisar('Não foi possível gravar no armazenamento do navegador. As últimas alterações podem se perder ao recarregar.');
    });
  }

  function lerTudo() {
    return new Promise((resolve, reject) => {
      const t = db.transaction(['kv', 'edicoes'], 'readonly');
      const meta = t.objectStore('kv').get('meta');
      const eds = t.objectStore('edicoes').getAll();
      t.oncomplete = () => resolve({ meta: meta.result, edicoes: eds.result || [] });
      t.onerror = () => reject(t.error);
    });
  }

  function avisar(texto) {
    if (!store.avisos.includes(texto)) store.avisos.push(texto);
  }

  // ---------- ratings e divisões ----------
  function aplicarMeta() {
    for (const t of Object.values(SIM.TEAMS)) {
      t.rating = store.meta.ratings[t.id] ?? t.ratingInicial;
      t.divisao = t.id in store.meta.divisoes ? store.meta.divisoes[t.id] : t.divisaoInicial;
    }
  }

  function capturarMeta() {
    const ratings = {};
    const divisoes = {};
    for (const t of Object.values(SIM.TEAMS)) {
      if (t.rating !== t.ratingInicial) ratings[t.id] = t.rating;
      if (t.divisao !== t.divisaoInicial) divisoes[t.id] = t.divisao;
    }
    store.meta.ratings = ratings;
    store.meta.divisoes = divisoes;
  }

  // ---------- migração da versão antiga (só Copa, localStorage) ----------
  function migrar() {
    if (store.meta.migrado) return;
    store.meta.migrado = true;
    let antigo = [];
    try { antigo = JSON.parse(localStorage.getItem(OLD_HISTORY_KEY) || '[]'); } catch (e) { antigo = []; }
    // A lista antiga vem da mais nova para a mais antiga.
    for (const h of antigo.slice().reverse()) {
      if (!h || !SIM.T(h.champion) || !SIM.T(h.runnerUp)) continue;
      const ed = {
        id: store.meta.proximoId++, tipo: 'copa', numero: null, rotulo: 'Copa do Mundo · ' + h.edition,
        status: 'concluida', resumoApenas: true, criadoEm: h.date || null,
        sede: h.host || null, campeao: h.champion, vice: h.runnerUp, terceiro: h.third || null,
        jogos: [], participantes: [], resultado: {},
      };
      store.edicoes.push(ed);
      salvarEdicao(ed);
    }
    try {
      if (localStorage.getItem(OLD_STATE_KEY)) {
        const s = JSON.parse(localStorage.getItem(OLD_STATE_KEY));
        if (s && s.stage !== 'done') avisar('A Copa que estava em andamento na versão anterior não pôde ser migrada. As edições concluídas foram mantidas no histórico.');
      }
    } catch (e) { /* armazenamento indisponível */ }
    salvarMeta();
  }

  // ---------- API ----------
  async function iniciar() {
    try {
      db = await abrir();
      const { meta, edicoes } = await lerTudo();
      if (meta) store.meta = Object.assign(store.meta, meta);
      store.edicoes = edicoes.sort((a, b) => a.id - b.id);
      store.persistente = true;
    } catch (e) {
      console.error(e);
      db = null;
      avisar('O armazenamento do navegador não está disponível (modo privado?). O simulador funciona, mas nada será guardado ao fechar a página.');
    }
    aplicarMeta();
    migrar();
    store.rev++;
  }

  function salvarMeta() {
    capturarMeta();
    store.rev++;
    return tx(['kv'], 'readwrite', (t) => t.objectStore('kv').put(store.meta, 'meta'));
  }

  function salvarEdicao(ed) {
    store.rev++;
    return tx(['edicoes'], 'readwrite', (t) => t.objectStore('edicoes').put(ed));
  }

  /** Grava a edição e os ratings de uma vez (depois de cada ação do usuário). */
  function salvar(ed) {
    capturarMeta();
    store.rev++;
    return tx(['kv', 'edicoes'], 'readwrite', (t) => {
      t.objectStore('kv').put(store.meta, 'meta');
      if (ed) t.objectStore('edicoes').put(ed);
    });
  }

  function novaEdicaoId() { return store.meta.proximoId++; }
  function proximoSeq() { return ++store.meta.seq; }

  function adicionarEdicao(ed) {
    store.edicoes.push(ed);
    return salvar(ed);
  }

  function removerEdicao(ed) {
    store.edicoes = store.edicoes.filter((e) => e.id !== ed.id);
    capturarMeta();
    store.rev++;
    return tx(['kv', 'edicoes'], 'readwrite', (t) => {
      t.objectStore('kv').put(store.meta, 'meta');
      t.objectStore('edicoes').delete(ed.id);
    });
  }

  const edicao = (id) => store.edicoes.find((e) => e.id === Number(id)) || null;
  const emAndamento = (tipo) => store.edicoes.find((e) => e.tipo === tipo && e.status === 'andamento') || null;
  const concluidas = (tipo) => store.edicoes.filter((e) => e.status === 'concluida' && (!tipo || e.tipo === tipo));
  const ultimaConcluida = (tipo) => concluidas(tipo).slice(-1)[0] || null;

  // ---------- índice de jogos por time (memorizado pela revisão) ----------
  let indice = { rev: -1, porTime: new Map(), todos: [] };
  function indexar() {
    if (indice.rev === store.rev) return indice;
    const porTime = new Map();
    const todos = [];
    for (const ed of store.edicoes) {
      for (const j of ed.jogos || []) {
        if (!j.jogado) continue;
        const ref = { ed, j };
        todos.push(ref);
        for (const id of [j.m, j.v]) {
          if (!porTime.has(id)) porTime.set(id, []);
          porTime.get(id).push(ref);
        }
      }
    }
    const bySeq = (a, b) => a.j.seq - b.j.seq;
    todos.sort(bySeq);
    for (const l of porTime.values()) l.sort(bySeq);
    indice = { rev: store.rev, porTime, todos };
    return indice;
  }

  const jogosDoTime = (id) => indexar().porTime.get(id) || [];
  const todosOsJogos = () => indexar().todos;

  // ---------- backup e reset ----------
  function exportar() {
    capturarMeta();
    return JSON.stringify({ app: 'simulador-futebol', versao: 1, exportadoEm: new Date().toISOString(), meta: store.meta, edicoes: store.edicoes });
  }

  async function importar(texto) {
    const dados = JSON.parse(texto);
    if (!dados || dados.app !== 'simulador-futebol' || !Array.isArray(dados.edicoes) || !dados.meta) {
      throw new Error('O arquivo não é um backup deste simulador.');
    }
    await substituirTudo(dados.meta, dados.edicoes);
  }

  async function substituirTudo(meta, edicoes) {
    store.meta = Object.assign({ seq: 0, proximoId: 1, ratings: {}, divisoes: {}, migrado: true }, meta);
    store.edicoes = edicoes.slice().sort((a, b) => a.id - b.id);
    aplicarMeta();
    store.rev++;
    await tx(['kv', 'edicoes'], 'readwrite', (t) => {
      t.objectStore('edicoes').clear();
      for (const ed of store.edicoes) t.objectStore('edicoes').put(ed);
      t.objectStore('kv').put(store.meta, 'meta');
    });
  }

  /** Volta todos os ratings (e divisões) aos valores iniciais, mantendo o histórico. */
  function resetarRatings() {
    for (const t of Object.values(SIM.TEAMS)) {
      t.rating = t.ratingInicial;
      t.divisao = t.divisaoInicial;
    }
    return salvarMeta();
  }

  /** Apaga edições, histórico e ratings. */
  function apagarTudo() {
    return substituirTudo({ seq: 0, proximoId: 1, ratings: {}, divisoes: {}, migrado: true }, []);
  }

  Object.assign(store, {
    iniciar, salvar, salvarMeta, salvarEdicao, adicionarEdicao, removerEdicao, novaEdicaoId, proximoSeq,
    edicao, emAndamento, concluidas, ultimaConcluida, jogosDoTime, todosOsJogos,
    exportar, importar, resetarRatings, apagarTudo, avisar,
  });
  SIM.store = store;
})(window.SIM);
