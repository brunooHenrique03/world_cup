// Clubes brasileiros: [nome, sigla, UF, divisão inicial, rating Elo, [cor 1, cor 2], padrão do escudo].
// Divisão inicial: Série A (20), Série B (20), Série C (20) e outros (D). As divisões mudam com o acesso e o descenso.
(function (SIM) {
  'use strict';

  SIM.PRIMEIRA_TEMPORADA = 2026;

  const RAW = [
    // Série A
    ["Flamengo", 'FLA', 'RJ', 'A', 1880, ['#c4161c', '#111111'], 'faixas'],
    ["Palmeiras", 'PAL', 'SP', 'A', 1860, ['#006437', '#ffffff'], 'liso'],
    ["Cruzeiro", 'CRU', 'MG', 'A', 1800, ['#0033a0', '#ffffff'], 'liso'],
    ["Botafogo", 'BOT', 'RJ', 'A', 1780, ['#111111', '#ffffff'], 'listras'],
    ["Fluminense", 'FLU', 'RJ', 'A', 1770, ['#7a1437', '#00613c'], 'listras'],
    ["Mirassol", 'MIR', 'SP', 'A', 1750, ['#ffd200', '#00843d'], 'liso'],
    ["Bahia", 'BAH', 'BA', 'A', 1750, ['#0033a0', '#e30613'], 'faixas'],
    ["São Paulo", 'SAO', 'SP', 'A', 1750, ['#f5f5f5', '#e30613'], 'faixas'],
    ["Internacional", 'INT', 'RS', 'A', 1730, ['#e30613', '#ffffff'], 'liso'],
    ["Atlético Mineiro", 'CAM', 'MG', 'A', 1730, ['#111111', '#ffffff'], 'listras'],
    ["Corinthians", 'COR', 'SP', 'A', 1730, ['#f5f5f5', '#111111'], 'liso'],
    ["Grêmio", 'GRE', 'RS', 'A', 1720, ['#0d80bf', '#111111'], 'listras'],
    ["Red Bull Bragantino", 'RBB', 'SP', 'A', 1710, ['#f5f5f5', '#e30613'], 'liso'],
    ["Vasco da Gama", 'VAS', 'RJ', 'A', 1710, ['#111111', '#ffffff'], 'faixa-diagonal'],
    ["Santos", 'SAN', 'SP', 'A', 1700, ['#f5f5f5', '#111111'], 'liso'],
    ["Athletico Paranaense", 'CAP', 'PR', 'A', 1690, ['#c8102e', '#111111'], 'listras'],
    ["Vitória", 'VIT', 'BA', 'A', 1670, ['#e30613', '#111111'], 'listras'],
    ["Coritiba", 'CFC', 'PR', 'A', 1660, ['#00613c', '#ffffff'], 'faixas'],
    ["Chapecoense", 'CHA', 'SC', 'A', 1640, ['#00913f', '#ffffff'], 'liso'],
    ["Remo", 'REM', 'PA', 'A', 1630, ['#0b1d4d', '#ffffff'], 'liso'],
    // Série B
    ["Fortaleza", 'FOR', 'CE', 'B', 1680, ['#0033a0', '#e30613'], 'listras'],
    ["Ceará", 'CEA', 'CE', 'B', 1660, ['#111111', '#ffffff'], 'listras'],
    ["Juventude", 'JUV', 'RS', 'B', 1630, ['#00843d', '#ffffff'], 'listras'],
    ["Sport", 'SPT', 'PE', 'B', 1630, ['#e30613', '#111111'], 'faixas'],
    ["Goiás", 'GOI', 'GO', 'B', 1610, ['#00843d', '#ffffff'], 'liso'],
    ["Criciúma", 'CRI', 'SC', 'B', 1610, ['#ffd200', '#111111'], 'listras'],
    ["Novorizontino", 'NOV', 'SP', 'B', 1610, ['#ffd200', '#111111'], 'liso'],
    ["Cuiabá", 'CUI', 'MT', 'B', 1600, ['#ffd200', '#00843d'], 'liso'],
    ["Atlético Goianiense", 'ACG', 'GO', 'B', 1600, ['#e30613', '#111111'], 'listras'],
    ["América Mineiro", 'AME', 'MG', 'B', 1590, ['#00843d', '#111111'], 'liso'],
    ["CRB", 'CRB', 'AL', 'B', 1580, ['#e30613', '#ffffff'], 'listras'],
    ["Avaí", 'AVA', 'SC', 'B', 1580, ['#0033a0', '#ffffff'], 'listras'],
    ["Vila Nova", 'VIL', 'GO', 'B', 1570, ['#e30613', '#ffffff'], 'liso'],
    ["Operário-PR", 'OPE', 'PR', 'B', 1570, ['#111111', '#ffffff'], 'listras'],
    ["Athletic Club", 'ATC', 'MG', 'B', 1550, ['#111111', '#ffffff'], 'liso'],
    ["Botafogo-SP", 'BSP', 'SP', 'B', 1550, ['#e30613', '#ffffff'], 'liso'],
    ["Ferroviária", 'FER', 'SP', 'B', 1550, ['#7a1437', '#ffffff'], 'liso'],
    ["Náutico", 'NAU', 'PE', 'B', 1550, ['#e30613', '#ffffff'], 'listras'],
    ["Londrina", 'LON', 'PR', 'B', 1540, ['#0b8fd6', '#ffffff'], 'liso'],
    ["São Bernardo", 'SBE', 'SP', 'B', 1540, ['#ffd200', '#111111'], 'liso'],
    // Série C
    ["Paysandu", 'PAY', 'PA', 'C', 1540, ['#6cace4', '#ffffff'], 'listras'],
    ["Amazonas", 'AMA', 'AM', 'C', 1520, ['#ffd200', '#111111'], 'liso'],
    ["Volta Redonda", 'VRE', 'RJ', 'C', 1520, ['#ffd200', '#111111'], 'liso'],
    ["Ponte Preta", 'PON', 'SP', 'C', 1530, ['#111111', '#ffffff'], 'liso'],
    ["Guarani", 'GUA', 'SP', 'C', 1510, ['#00843d', '#ffffff'], 'liso'],
    ["Figueirense", 'FIG', 'SC', 'C', 1500, ['#111111', '#ffffff'], 'listras'],
    ["Brusque", 'BRU', 'SC', 'C', 1500, ['#ffd200', '#e30613'], 'liso'],
    ["Ypiranga-RS", 'YPI', 'RS', 'C', 1490, ['#ffd200', '#00843d'], 'liso'],
    ["Caxias", 'CAX', 'RS', 'C', 1490, ['#7a1437', '#ffffff'], 'liso'],
    ["Floresta", 'FLO', 'CE', 'C', 1470, ['#00843d', '#ffffff'], 'liso'],
    ["Confiança", 'CON', 'SE', 'C', 1470, ['#0033a0', '#ffffff'], 'liso'],
    ["ABC", 'ABC', 'RN', 'C', 1480, ['#111111', '#ffffff'], 'liso'],
    ["Botafogo-PB", 'BPB', 'PB', 'C', 1470, ['#111111', '#ffffff'], 'listras'],
    ["Tombense", 'TOM', 'MG', 'C', 1470, ['#e30613', '#ffffff'], 'liso'],
    ["Itabaiana", 'ITA', 'SE', 'C', 1450, ['#0033a0', '#ffffff'], 'liso'],
    ["Anápolis", 'ANA', 'GO', 'C', 1440, ['#e30613', '#ffffff'], 'liso'],
    ["Retrô", 'RET', 'PE', 'C', 1450, ['#0033a0', '#ffd200'], 'liso'],
    ["CSA", 'CSA', 'AL', 'C', 1470, ['#0033a0', '#ffffff'], 'liso'],
    ["Maringá", 'MAR', 'PR', 'C', 1450, ['#111111', '#ffffff'], 'liso'],
    ["Ituano", 'ITU', 'SP', 'C', 1480, ['#e30613', '#111111'], 'listras'],
    // Outros (Série D / estaduais)
    ["Santa Cruz", 'STC', 'PE', 'D', 1450, ['#e30613', '#111111'], 'faixas'],
    ["Portuguesa", 'POR', 'SP', 'D', 1440, ['#e30613', '#00843d'], 'listras'],
    ["América-RN", 'ARN', 'RN', 'D', 1430, ['#e30613', '#ffffff'], 'liso'],
    ["Sampaio Corrêa", 'SAM', 'MA', 'D', 1430, ['#ffd200', '#00843d'], 'faixas'],
    ["Paraná", 'PAR', 'PR', 'D', 1420, ['#0033a0', '#e30613'], 'liso'],
    ["Joinville", 'JEC', 'SC', 'D', 1420, ['#e30613', '#111111'], 'listras'],
    ["Treze", 'TRE', 'PB', 'D', 1410, ['#111111', '#ffffff'], 'listras'],
    ["Manaus", 'MAN', 'AM', 'D', 1400, ['#ffd200', '#111111'], 'liso'],
    ["Aparecidense", 'APA', 'GO', 'D', 1400, ['#0033a0', '#ffd200'], 'liso'],
    ["Tuna Luso", 'TUN', 'PA', 'D', 1390, ['#e30613', '#ffffff'], 'liso'],
    ["Moto Club", 'MOT', 'MA', 'D', 1380, ['#e30613', '#111111'], 'liso'],
    ["Brasiliense", 'BRS', 'DF', 'D', 1380, ['#ffd200', '#00843d'], 'liso'],
  ];

  for (const [nome, codigo, uf, divisao, rating, cores, padrao] of RAW) {
    SIM.addTeam({ id: 'BRA-' + codigo, nome, codigo, tipo: 'clube', conf: 'CBF', pais: 'BRA', uf, divisao, bandeira: 'flags/bra.jpg', rating, cores, padrao });
  }
})(window.SIM);
