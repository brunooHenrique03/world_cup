// Clubes europeus: [nome, sigla, país, rating Elo (escala Club Elo), [cor 1, cor 2], padrão do escudo].
(function (SIM) {
  'use strict';

  /** Máximo de clubes por país na Champions (clubes além disso ficam de fora). */
  SIM.VAGAS_POR_PAIS = { ENG: 5, ESP: 4, ITA: 4, GER: 4, FRA: 3, POR: 3, NED: 3 };
  SIM.VAGAS_PADRAO = 2;
  SIM.BANDEIRA_PAIS = {"ENG": "eng", "ESP": "esp", "GER": "ger", "ITA": "ita", "FRA": "fra", "POR": "por", "NED": "ned", "BEL": "bel", "TUR": "tur", "SCO": "sco", "NOR": "nor", "GRE": "gre", "CZE": "cze", "UKR": "ukr", "AUT": "aut", "SRB": "srb", "DEN": "den", "CRO": "cro", "SUI": "sui", "AZE": "az", "HUN": "hun", "POL": "pol", "SWE": "swe", "CYP": "cy", "KAZ": "kaz"};

  const RAW = [
    ["Liverpool", 'LIV', 'ENG', 2000, ['#c8102e', '#f6eb61'], 'liso'],
    ["Arsenal", 'ARS', 'ENG', 1985, ['#ef0107', '#ffffff'], 'liso'],
    ["Manchester City", 'MCI', 'ENG', 1975, ['#6cabdd', '#1c2c5b'], 'liso'],
    ["Chelsea", 'CHE', 'ENG', 1895, ['#034694', '#ffffff'], 'liso'],
    ["Newcastle", 'NEW', 'ENG', 1810, ['#1a1a1a', '#ffffff'], 'listras'],
    ["Aston Villa", 'AVL', 'ENG', 1800, ['#670e36', '#95bfe5'], 'liso'],
    ["Tottenham", 'TOT', 'ENG', 1795, ['#f5f5f5', '#132257'], 'liso'],
    ["Manchester United", 'MUN', 'ENG', 1780, ['#da291c', '#111111'], 'liso'],

    ["Real Madrid", 'RMA', 'ESP', 1990, ['#f5f5f5', '#febe10'], 'liso'],
    ["Barcelona", 'BAR', 'ESP', 1970, ['#a50044', '#004d98'], 'listras'],
    ["Atlético de Madrid", 'ATM', 'ESP', 1880, ['#cb3524', '#ffffff'], 'listras'],
    ["Athletic Bilbao", 'ATH', 'ESP', 1800, ['#ee2523', '#ffffff'], 'listras'],
    ["Villarreal", 'VIL', 'ESP', 1780, ['#ffe667', '#005187'], 'liso'],
    ["Real Betis", 'BET', 'ESP', 1760, ['#00954c', '#ffffff'], 'listras'],
    ["Real Sociedad", 'RSO', 'ESP', 1740, ['#0067b1', '#ffffff'], 'listras'],

    ["Bayern de Munique", 'BAY', 'GER', 1960, ['#dc052d', '#0066b2'], 'liso'],
    ["Bayer Leverkusen", 'B04', 'GER', 1850, ['#e32221', '#111111'], 'liso'],
    ["Borussia Dortmund", 'BVB', 'GER', 1830, ['#fde100', '#111111'], 'liso'],
    ["RB Leipzig", 'RBL', 'GER', 1790, ['#f5f5f5', '#dd0741'], 'liso'],
    ["Eintracht Frankfurt", 'SGE', 'GER', 1770, ['#111111', '#e1000f'], 'liso'],
    ["Stuttgart", 'VFB', 'GER', 1760, ['#f5f5f5', '#e32219'], 'faixas'],

    ["Inter de Milão", 'INT', 'ITA', 1930, ['#0068a8', '#111111'], 'listras'],
    ["Napoli", 'NAP', 'ITA', 1860, ['#12a0d7', '#ffffff'], 'liso'],
    ["Juventus", 'JUV', 'ITA', 1830, ['#111111', '#ffffff'], 'listras'],
    ["Atalanta", 'ATA', 'ITA', 1820, ['#1e71b8', '#111111'], 'listras'],
    ["Milan", 'MIL', 'ITA', 1820, ['#fb090b', '#111111'], 'listras'],
    ["Roma", 'ROM', 'ITA', 1790, ['#8e1f2f', '#f0bc42'], 'liso'],
    ["Bologna", 'BOL', 'ITA', 1760, ['#1a2f48', '#a21c26'], 'listras'],

    ["Paris Saint-Germain", 'PSG', 'FRA', 1950, ['#004170', '#da291c'], 'liso'],
    ["Olympique de Marseille", 'OM', 'FRA', 1780, ['#f5f5f5', '#2faee0'], 'liso'],
    ["Monaco", 'ASM', 'FRA', 1760, ['#e51b22', '#ffffff'], 'metades'],
    ["Lille", 'LOSC', 'FRA', 1760, ['#e01e13', '#20325f'], 'liso'],
    ["Lyon", 'OL', 'FRA', 1740, ['#f5f5f5', '#da0812'], 'liso'],

    ["Sporting", 'SCP', 'POR', 1800, ['#008057', '#ffffff'], 'faixas'],
    ["Benfica", 'SLB', 'POR', 1790, ['#e83030', '#ffffff'], 'liso'],
    ["Porto", 'FCP', 'POR', 1780, ['#003f98', '#ffffff'], 'listras'],
    ["Braga", 'SCB', 'POR', 1720, ['#d4001e', '#ffffff'], 'liso'],

    ["PSV", 'PSV', 'NED', 1780, ['#ed1c24', '#ffffff'], 'listras'],
    ["Feyenoord", 'FEY', 'NED', 1740, ['#e3001b', '#ffffff'], 'metades'],
    ["Ajax", 'AJA', 'NED', 1740, ['#f5f5f5', '#d2122e'], 'faixa-diagonal'],
    ["Twente", 'TWE', 'NED', 1680, ['#e30613', '#ffffff'], 'liso'],

    ["Club Brugge", 'CLB', 'BEL', 1740, ['#0a4ea2', '#111111'], 'listras'],
    ["Union Saint-Gilloise", 'USG', 'BEL', 1690, ['#ffd200', '#1d3a8a'], 'liso'],

    ["Galatasaray", 'GAL', 'TUR', 1740, ['#fdb912', '#a90432'], 'metades'],
    ["Fenerbahçe", 'FEN', 'TUR', 1720, ['#fef200', '#004b98'], 'listras'],

    ["Celtic", 'CEL', 'SCO', 1700, ['#018749', '#ffffff'], 'faixas'],
    ["Rangers", 'RAN', 'SCO', 1660, ['#1b458f', '#ffffff'], 'liso'],

    ["Bodø/Glimt", 'BOD', 'NOR', 1700, ['#ffd700', '#111111'], 'liso'],

    ["Olympiacos", 'OLY', 'GRE', 1700, ['#e2001a', '#ffffff'], 'listras'],
    ["PAOK", 'PAOK', 'GRE', 1680, ['#111111', '#ffffff'], 'listras'],

    ["Slavia Praga", 'SLA', 'CZE', 1690, ['#e30613', '#ffffff'], 'metades'],
    ["Sparta Praga", 'SPA', 'CZE', 1640, ['#8a1538', '#ffffff'], 'liso'],

    ["Shakhtar Donetsk", 'SHK', 'UKR', 1680, ['#f47920', '#111111'], 'listras'],

    ["Red Bull Salzburg", 'RBS', 'AUT', 1680, ['#f5f5f5', '#e30613'], 'liso'],
    ["Sturm Graz", 'STU', 'AUT', 1620, ['#111111', '#ffffff'], 'liso'],

    ["Estrela Vermelha", 'CZV', 'SRB', 1660, ['#e2001a', '#ffffff'], 'listras'],

    ["Copenhague", 'FCK', 'DEN', 1660, ['#f5f5f5', '#1b3d8f'], 'liso'],
    ["Midtjylland", 'FCM', 'DEN', 1650, ['#111111', '#e30613'], 'liso'],

    ["Dinamo Zagreb", 'DZG', 'CRO', 1650, ['#0056a3', '#ffffff'], 'liso'],

    ["Young Boys", 'YB', 'SUI', 1640, ['#ffd200', '#111111'], 'liso'],
    ["Basel", 'FCB', 'SUI', 1630, ['#e30613', '#003a8c'], 'metades'],

    ["Qarabağ", 'QAR', 'AZE', 1640, ['#111111', '#ffffff'], 'liso'],

    ["Ferencváros", 'FTC', 'HUN', 1620, ['#00a94f', '#ffffff'], 'listras'],

    ["Legia Varsóvia", 'LEG', 'POL', 1600, ['#f5f5f5', '#00a650'], 'liso'],

    ["Malmö", 'MFF', 'SWE', 1600, ['#8ecae6', '#ffffff'], 'liso'],

    ["Pafos", 'PAF', 'CYP', 1580, ['#0055a4', '#ffffff'], 'liso'],

    ["Kairat Almaty", 'KAI', 'KAZ', 1500, ['#ffd200', '#111111'], 'liso'],
  ];

  for (const [nome, codigo, pais, rating, cores, padrao] of RAW) {
    SIM.addTeam({ id: pais + '-' + codigo, nome, codigo, tipo: 'clube', conf: 'UEFA', pais, divisao: null, bandeira: 'flags/' + SIM.BANDEIRA_PAIS[pais] + '.jpg', rating, cores, padrao });
  }
})(window.SIM);
