// Seleções: substitui a tabela TTIMES da versão Delphi.
// Each entry: [name, code, flag file (in flags/), strength 0-100]
// Strength plays the role of TTIMES.PONTUACAO: it seeds the pots and drives match simulation.
window.WC_DATA = (function () {
  const CONFEDERATIONS = [
    { id: 'CONCACAF', name: 'América do Norte e Central', slots: 6 },
    { id: 'CONMEBOL', name: 'América do Sul', slots: 6 },
    { id: 'CAF', name: 'África', slots: 10 },
    { id: 'UEFA', name: 'Europa', slots: 16 },
    { id: 'AFC_OFC', name: 'Ásia e Oceania', slots: 10 },
  ];

  const RAW = {
    CONMEBOL: [
      ['Argentina', 'ARG', 'arg', 94], ['Brasil', 'BRA', 'bra', 90], ['Uruguai', 'URU', 'uru', 85],
      ['Colômbia', 'COL', 'col', 85], ['Equador', 'ECU', 'ecu', 82], ['Paraguai', 'PAR', 'par', 76],
      ['Peru', 'PER', 'per', 72], ['Chile', 'CHI', 'chi', 71], ['Venezuela', 'VEN', 'ven', 70],
      ['Bolívia', 'BOL', 'bol', 60],
    ],
    CONCACAF: [
      ['México', 'MEX', 'mex', 80], ['Estados Unidos', 'USA', 'usa', 79], ['Canadá', 'CAN', 'can', 77],
      ['Panamá', 'PAN', 'pan', 72], ['Costa Rica', 'CRC', 'crc', 69], ['Jamaica', 'JAM', 'jm', 66],
      ['Honduras', 'HON', 'hon', 64], ['Curaçao', 'CUW', 'cw', 60], ['Haiti', 'HAI', 'hai', 60],
      ['El Salvador', 'SLV', 'slv', 58], ['Guatemala', 'GUA', 'gt', 58], ['Trinidad e Tobago', 'TRI', 'tt', 57],
      ['Suriname', 'SUR', 'sur', 56], ['Nicarágua', 'NCA', 'nca', 50], ['Cuba', 'CUB', 'cub', 48],
      ['República Dominicana', 'DOM', 'do', 47], ['Bermudas', 'BER', 'bm', 44], ['Porto Rico', 'PUR', 'pr', 42],
      ['Granada', 'GRN', 'gd', 40], ['Belize', 'BLZ', 'bz', 38],
    ],
    CAF: [
      ['Marrocos', 'MAR', 'mar', 86], ['Senegal', 'SEN', 'sen', 82], ['Argélia', 'ALG', 'alg', 77],
      ['Nigéria', 'NGA', 'nga', 77], ['Costa do Marfim', 'CIV', 'civ', 77], ['Egito', 'EGY', 'egy', 76],
      ['Tunísia', 'TUN', 'tun', 73], ['Camarões', 'CMR', 'cmr', 73], ['Mali', 'MLI', 'ml', 72],
      ['África do Sul', 'RSA', 'rsa', 71], ['RD Congo', 'COD', 'cd', 71], ['Gana', 'GHA', 'gha', 70],
      ['Burkina Faso', 'BFA', 'bf', 69], ['Cabo Verde', 'CPV', 'cpv', 67], ['Guiné', 'GUI', 'gn', 64],
      ['Gabão', 'GAB', 'ga', 64], ['Angola', 'ANG', 'ang', 63], ['Zâmbia', 'ZAM', 'zm', 62],
      ['Benin', 'BEN', 'bj', 61], ['Uganda', 'UGA', 'ug', 60], ['Guiné Equatorial', 'EQG', 'gq', 60],
      ['Mauritânia', 'MTN', 'mr', 59], ['Moçambique', 'MOZ', 'mz', 58], ['Líbia', 'LBY', 'ly', 58],
      ['Namíbia', 'NAM', 'na', 57], ['Madagascar', 'MAD', 'mg', 56], ['Quênia', 'KEN', 'ke', 55],
      ['Tanzânia', 'TAN', 'tz', 55], ['Sudão', 'SDN', 'sd', 55], ['Congo', 'CGO', 'cgo', 55],
      ['Zimbábue', 'ZIM', 'zw', 55], ['Gâmbia', 'GAM', 'gm', 55], ['Serra Leoa', 'SLE', 'sl', 53],
      ['Togo', 'TOG', 'tg', 53], ['Ruanda', 'RWA', 'rw', 52], ['Malawi', 'MWI', 'mw', 50],
      ['Níger', 'NIG', 'ne', 50], ['Libéria', 'LBR', 'lr', 48], ['Botsuana', 'BOT', 'bw', 48],
      ['Etiópia', 'ETH', 'et', 46],
    ],
    UEFA: [
      ['Espanha', 'ESP', 'esp', 94], ['França', 'FRA', 'fra', 92], ['Inglaterra', 'ENG', 'eng', 91],
      ['Portugal', 'POR', 'por', 89], ['Holanda', 'NED', 'ned', 88], ['Alemanha', 'GER', 'ger', 87],
      ['Bélgica', 'BEL', 'bel', 85], ['Itália', 'ITA', 'ita', 85], ['Croácia', 'CRO', 'cro', 84],
      ['Suíça', 'SUI', 'sui', 81], ['Dinamarca', 'DEN', 'den', 81], ['Áustria', 'AUT', 'aut', 81],
      ['Noruega', 'NOR', 'nor', 80], ['Turquia', 'TUR', 'tur', 80], ['Ucrânia', 'UKR', 'ukr', 78],
      ['Sérvia', 'SRB', 'srb', 77], ['Polônia', 'POL', 'pol', 76], ['Suécia', 'SWE', 'swe', 76],
      ['Grécia', 'GRE', 'gre', 76], ['Tchéquia', 'CZE', 'cze', 75], ['Hungria', 'HUN', 'hun', 75],
      ['Escócia', 'SCO', 'sco', 74], ['Romênia', 'ROU', 'ro', 73], ['País de Gales', 'WAL', 'gb-wls', 72],
      ['Eslováquia', 'SVK', 'svk', 72], ['Eslovênia', 'SVN', 'svn', 72], ['Geórgia', 'GEO', 'geo', 72],
      ['Irlanda', 'IRL', 'irl', 70], ['Albânia', 'ALB', 'alb', 70],
      ['Bósnia e Herzegovina', 'BIH', 'bih', 68], ['Irlanda do Norte', 'NIR', 'gb-nir', 66],
      ['Islândia', 'ISL', 'isl', 66], ['Finlândia', 'FIN', 'fin', 64], ['Macedônia do Norte', 'MKD', 'mk', 64],
      ['Israel', 'ISR', 'isr', 64], ['Montenegro', 'MNE', 'me', 63], ['Kosovo', 'KVX', 'xk', 62],
      ['Bulgária', 'BUL', 'bg', 60], ['Cazaquistão', 'KAZ', 'kaz', 58], ['Luxemburgo', 'LUX', 'lu', 58],
      ['Armênia', 'ARM', 'am', 55], ['Estônia', 'EST', 'ee', 52], ['Chipre', 'CYP', 'cy', 52],
      ['Azerbaijão', 'AZE', 'az', 52], ['Letônia', 'LVA', 'lv', 50], ['Lituânia', 'LTU', 'lt', 50],
      ['Moldávia', 'MDA', 'md', 48], ['Ilhas Faroé', 'FRO', 'fo', 48], ['Malta', 'MLT', 'mt', 45],
    ],
    AFC_OFC: [
      ['Japão', 'JPN', 'jpn', 86], ['Irã', 'IRN', 'irn', 80], ['Coreia do Sul', 'KOR', 'kor', 80],
      ['Austrália', 'AUS', 'aus', 78], ['Uzbequistão', 'UZB', 'uzb', 73], ['Arábia Saudita', 'KSA', 'ksa', 72],
      ['Iraque', 'IRQ', 'irq', 71], ['Jordânia', 'JOR', 'jor', 71], ['Catar', 'QAT', 'qat', 70],
      ['Emirados Árabes Unidos', 'UAE', 'uae', 69], ['Omã', 'OMA', 'om', 67], ['Nova Zelândia', 'NZL', 'nzl', 66],
      ['China', 'CHN', 'chn', 64], ['Bahrein', 'BHR', 'bh', 63], ['Síria', 'SYR', 'sy', 63],
      ['Tailândia', 'THA', 'tha', 62], ['Palestina', 'PLE', 'ps', 62], ['Indonésia', 'IDN', 'idn', 62],
      ['Vietnã', 'VIE', 'vie', 61], ['Coreia do Norte', 'PRK', 'prk', 60], ['Líbano', 'LBN', 'lb', 59],
      ['Tadjiquistão', 'TJK', 'tj', 59], ['Quirguistão', 'KGZ', 'kg', 58], ['Malásia', 'MAS', 'my', 57],
      ['Índia', 'IND', 'in', 55], ['Kuwait', 'KUW', 'kw', 55], ['Turcomenistão', 'TKM', 'tm', 52],
      ['Filipinas', 'PHI', 'ph', 52], ['Hong Kong', 'HKG', 'hk', 50], ['Fiji', 'FIJ', 'fj', 50],
      ['Singapura', 'SIN', 'sg', 48], ['Mianmar', 'MYA', 'mm', 48], ['Nova Caledônia', 'NCL', 'nc', 46],
      ['Ilhas Salomão', 'SOL', 'sb', 45], ['Afeganistão', 'AFG', 'afg', 45], ['Taiti', 'TAH', 'pf', 44],
      ['Vanuatu', 'VAN', 'vu', 43], ['Papua-Nova Guiné', 'PNG', 'pg', 42], ['Bangladesh', 'BAN', 'bd', 42],
      ['Paquistão', 'PAK', 'pak', 40],
    ],
  };

  const TEAMS = {};
  for (const conf of Object.keys(RAW)) {
    for (const [name, code, flag, rating] of RAW[conf]) {
      TEAMS[code] = { id: code, name, code, flag: 'flags/' + flag + '.jpg', rating, conf };
    }
  }

  // Official 2026 knockout layout (matches 73-104).
  // "1A" = winner of group A, "2B" = runner-up of B, "3:ABCDF" = one of the best third-placed
  // teams from those groups, "W74"/"L101" = winner/loser of that match.
  const KNOCKOUT = [
    { no: 73, stage: 'R32', a: '2A', b: '2B' },
    { no: 74, stage: 'R32', a: '1E', b: '3:ABCDF' },
    { no: 75, stage: 'R32', a: '1F', b: '2C' },
    { no: 76, stage: 'R32', a: '1C', b: '2F' },
    { no: 77, stage: 'R32', a: '1I', b: '3:CDFGH' },
    { no: 78, stage: 'R32', a: '2E', b: '2I' },
    { no: 79, stage: 'R32', a: '1A', b: '3:CEFHI' },
    { no: 80, stage: 'R32', a: '1L', b: '3:EHIJK' },
    { no: 81, stage: 'R32', a: '1D', b: '3:BEFIJ' },
    { no: 82, stage: 'R32', a: '1G', b: '3:AEHIJ' },
    { no: 83, stage: 'R32', a: '2K', b: '2L' },
    { no: 84, stage: 'R32', a: '1H', b: '2J' },
    { no: 85, stage: 'R32', a: '1B', b: '3:EFGIJ' },
    { no: 86, stage: 'R32', a: '1J', b: '2H' },
    { no: 87, stage: 'R32', a: '1K', b: '3:DEIJL' },
    { no: 88, stage: 'R32', a: '2D', b: '2G' },
    { no: 89, stage: 'R16', a: 'W74', b: 'W77' },
    { no: 90, stage: 'R16', a: 'W73', b: 'W75' },
    { no: 91, stage: 'R16', a: 'W76', b: 'W78' },
    { no: 92, stage: 'R16', a: 'W79', b: 'W80' },
    { no: 93, stage: 'R16', a: 'W83', b: 'W84' },
    { no: 94, stage: 'R16', a: 'W81', b: 'W82' },
    { no: 95, stage: 'R16', a: 'W86', b: 'W88' },
    { no: 96, stage: 'R16', a: 'W85', b: 'W87' },
    { no: 97, stage: 'QF', a: 'W89', b: 'W90' },
    { no: 98, stage: 'QF', a: 'W93', b: 'W94' },
    { no: 99, stage: 'QF', a: 'W91', b: 'W92' },
    { no: 100, stage: 'QF', a: 'W95', b: 'W96' },
    { no: 101, stage: 'SF', a: 'W97', b: 'W98' },
    { no: 102, stage: 'SF', a: 'W99', b: 'W100' },
    { no: 103, stage: '3P', a: 'L101', b: 'L102' },
    { no: 104, stage: 'F', a: 'W101', b: 'W102' },
  ];

  return { CONFEDERATIONS, TEAMS, KNOCKOUT, GROUPS: 'ABCDEFGHIJKL'.split('') };
})();
