// Configurações: backup (exportar/importar), resetar ratings e apagar tudo.
(function (SIM) {
  'use strict';

  const ui = () => SIM.estadoUi;

  SIM.paginas.config = {
    titulo: () => 'Configurações',
    render() {
      const t = SIM.stats.totais();
      const andamento = SIM.store.edicoes.filter((e) => e.status === 'andamento').length;
      return `<section class="stage-head"><p class="eyebrow">Dados</p><h1>Configurações</h1>
          <p class="lede">Tudo fica guardado neste navegador (IndexedDB). Para levar para outro computador ou não perder nada ao limpar o navegador, exporte um backup.</p></section>
        <section class="panel">
          <h2 class="section-title">Armazenamento</h2>
          <p class="${SIM.store.persistente ? '' : 'bad-text'}">${SIM.store.persistente ? 'Os dados estão sendo gravados no navegador.' : 'O armazenamento do navegador não está disponível: nada será guardado ao fechar a página.'}</p>
          <p class="muted small">${SIM.fmtNum(SIM.store.edicoes.length)} edições (${andamento} em andamento) · ${SIM.fmtNum(t.jogos)} jogos.</p>
        </section>
        <section class="panel">
          <h2 class="section-title">Backup</h2>
          <p class="muted">O arquivo inclui todas as edições, jogos, ratings e divisões atuais.</p>
          <div class="row wrap-row">
            <button class="btn primary" data-action="exportar">${SIM.icone('baixar')} Exportar backup</button>
            <label class="btn ghost file-btn">${SIM.icone('subir')} Importar backup<input type="file" accept="application/json,.json" data-change="importar" class="sr-only"></label>
          </div>
          <p class="muted small">Importar substitui todos os dados atuais pelos do arquivo.</p>
        </section>
        <section class="panel danger-zone">
          <h2 class="section-title">Recomeçar</h2>
          <div class="setting"><div><b>Resetar ratings</b><p class="muted small">Volta todos os times ao rating inicial e as divisões do Brasileirão à formação original. O histórico continua.</p></div>
            <button class="btn ghost" data-action="pedir-reset">Resetar ratings</button></div>
          <div class="setting"><div><b>Apagar tudo</b><p class="muted small">Apaga edições, jogos, histórico e ratings. Não dá para desfazer.</p></div>
            <button class="btn danger" data-action="pedir-apagar">Apagar tudo</button></div>
        </section>
        <section class="panel"><h2 class="section-title">Testes</h2>
          <p class="muted">Motor de partidas, Elo, desempates, sorteios e uma simulação completa de cada competição, rodados no próprio navegador sem alterar os seus dados.</p>
          <a class="btn ghost" href="tests.html" target="_blank" rel="noopener">Abrir testes</a></section>`;
    },
  };

  Object.assign(SIM.acoes, {
    exportar() {
      const blob = new Blob([SIM.store.exportar()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulador-futebol-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    importar(el) {
      const arq = el.files && el.files[0];
      if (!arq) return undefined;
      return arq.text().then((txt) => SIM.store.importar(txt)).then(() => {
        ui().mensagem = `Backup importado: ${SIM.store.edicoes.length} edições.`;
        ui().recemConcluida = null;
      });
    },
    'pedir-reset'() {
      ui().modal = { titulo: 'Resetar os ratings?', texto: 'Todos os times voltam ao rating inicial e as divisões voltam à formação original. As edições e o histórico continuam.', confirmar: 'Resetar ratings', acao: 'confirmar-reset', perigo: true };
    },
    'confirmar-reset'() {
      ui().modal = null;
      return SIM.store.resetarRatings().then(() => { ui().mensagem = 'Ratings resetados.'; });
    },
    'pedir-apagar'() {
      ui().modal = { titulo: 'Apagar tudo?', texto: 'Edições, jogos, histórico e ratings serão apagados deste navegador. Exporte um backup antes se quiser guardar.', confirmar: 'Apagar tudo', acao: 'confirmar-apagar', perigo: true };
    },
    'confirmar-apagar'() {
      ui().modal = null;
      ui().recemConcluida = null;
      return SIM.store.apagarTudo().then(() => { ui().mensagem = 'Todos os dados foram apagados.'; });
    },
  });
})(window.SIM);
