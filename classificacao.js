// ====================== CLASSIFICAÇÃO DOS BENS ======================
// Fonte: Portaria CGE nº 195/2016 - Anexo I (classificação dos bens móveis)
// Código completo da conta: PREFIXO_CONTA + "." + código do tipo + "." + código do subtipo
// Ex.: 1.2.3.1.1.01.18.03 = Processamento de dados > Impressoras
// Observação: a portaria não possui o código 22.
// Cada subtipo: [código, nome, observação opcional (exemplos do item "Diversos")]

const PREFIXO_CONTA = "1.2.3.1.1.01";

const _TIPOS_PORTARIA = [
  ["01", "Aeronaves", [
    ["01", "Aviões"], ["02", "Balões"], ["03", "Helicópteros"], ["04", "Planadores"], ["99", "Diversos"]
  ]],
  ["02", "Aparelhos de Medição e Orientação", [
    ["01", "Amperímetro"], ["02", "Balanças"], ["03", "Barômetros"], ["04", "Capacímetro"],
    ["05", "Frequencímetro"], ["06", "Hidrômetros"], ["07", "Manômetros (Reguladores)"],
    ["08", "Medidores de Gás e Corrente Elétrica"], ["09", "Multímetro"], ["10", "Osciloscópio"],
    ["11", "Paquímetros"], ["12", "Pirômetros"], ["13", "Podômetros"], ["14", "Rodômetros"],
    ["15", "Termômetros Climáticos e Clínicos"], ["99", "Diversos"]
  ]],
  ["03", "Aparelhos e Equipamentos de Comunicação", [
    ["01", "Antena Parabólica"], ["02", "Aparelhagem de transmissão (rádios de comunicação)"],
    ["03", "Aparelho de fax"], ["04", "Aparelhos telefônicos (interfone)"], ["05", "Mesas telefônicas"],
    ["06", "Rádio telegrafia (telex)"], ["99", "Diversos"]
  ]],
  ["04", "Aparelhos, Equipamentos, Utensílios Médico-Odontológico, Laboratorial e Hospitalar", [
    ["01", "Aparelho de Pressão Arterial"], ["02", "Aparelho de radioterapia e ultravioleta"], ["03", "Bacias"],
    ["04", "Balanças (hospitalar, biométrica e pediátrica)"], ["05", "Bisturi elétrico"],
    ["06", "Cadeiras e Mesas especiais (maca)"], ["07", "Comadres"], ["08", "Compadres"], ["09", "Eletrocardiógrafo"],
    ["10", "Equipamento dentário (colher de dentina, cureta periodental, espelho bucal, aparelho de RX dentário)"],
    ["11", "Equipamento hospitalar de grande porte - Raios X"], ["12", "Estetoscópio"], ["13", "Liofilizadores"],
    ["14", "Mesa de operação"], ["15", "Suporte para mesa"], ["16", "Tendas de oxigênio"],
    ["99", "Diversos", "andadores, apar. bommet, apar. anestesia, apar. de eletro-coagulação, apar. ultra-som, aspiradores, bisturi, bomba infusão, cavalo rody, espaldar, foco cirúrgico, forno de bia, lâmpada refletora, centrífugas clínicas, negatoscópio, tripé p/ coleta de sangue, turbilhão de água p/ membros, muletas, sinetografo, roda nautica, ap. medição de glicose, válvula espiatória, analizador, apar. infravermelho, reanimador, canula de guedel, suporte p/soro, microscópio"]
  ]],
  ["05", "Aparelhos e Equipamentos para Esporte e Diversões", [
    ["01", "Balanços"], ["02", "Baliza"], ["03", "Bandeiras"], ["04", "Barras"], ["05", "Bicicleta Ergométrica"],
    ["06", "Brasões"], ["07", "Carrocéis"], ["08", "Cavalos e Carneiros de Madeira"], ["09", "Dardos"],
    ["10", "Deslizadores"], ["11", "Discos"], ["12", "Escudos"], ["13", "Flâmulas"], ["14", "Insígnias"],
    ["15", "Jogos de Selins"], ["16", "Paralelas"], ["17", "Pesos"], ["18", "Placard"], ["19", "Remos"],
    ["20", "Tabelas"], ["21", "Varas de Salto"],
    ["99", "Diversos", "tatame, bolas, bolas c/peso, trampolins, bomba de encher pneu"]
  ]],
  ["06", "Aparelhos e Utensílios Domésticos", [
    ["01", "Aspirador de pó"], ["02", "Bandeja de aço inox (travessas)"], ["03", "Batedeira"], ["04", "Botijões"],
    ["05", "Cafeteiras"], ["06", "Enceradeira"], ["07", "Escada Portátil"], ["08", "Extrator de suco"],
    ["09", "Ferro de passar roupa"], ["10", "Fogareiros"], ["11", "Fogões"], ["12", "Fornos (microondas)"],
    ["13", "Fritadeira"], ["14", "Garrafas de Aço para Gás"], ["15", "Geladeira (refrigerador, freezer)"],
    ["16", "Liquidificador"], ["17", "Máquina de fechar quentinha"], ["18", "Máquina de lavar louças"],
    ["19", "Máquina de lavar roupas"], ["20", "Nebulizador"], ["21", "Ozonizador"],
    ["22", "Panelas (de pressão, caldeirão, caçarola)"], ["23", "Sanduicheira"], ["24", "Torradeira"],
    ["25", "Ventiladores"],
    ["99", "Diversos", "facas grandes, conchas, espumadeiras, garfo tridente, balde aço inox, caixa aço inox, caldeirão gás, cuba redonda, apar. fondue, assadeiras, balcões c/cubas, bule de aço inox, caldeira a gás p/alimentos, filtros, escorredor, paneleiro, leiteira, batedores, lanterna"]
  ]],
  ["07", "Armamento", [
    ["01", "Instrumentos e Armas de uso das corporações policial-militar"], ["99", "Diversos"]
  ]],
  ["08", "Coleções e Materiais Bibliográficos", [
    ["01", "Coleções Botânicas"], ["02", "Coleções Ceroplásticas"], ["03", "Coleções Filatélicas"],
    ["04", "Coleções Mineralógicas"], ["05", "Coleções Numismáticas"], ["06", "Coleções Zoológicas"],
    ["07", "Documentos"], ["08", "Fichas Bibliográficas"], ["09", "Livros"], ["10", "Mapas"],
    ["11", "Material Folclórico"], ["12", "Pinacotecas"], ["13", "Publicações"], ["99", "Diversos"]
  ]],
  ["09", "Discotecas e Filmotecas", [
    ["01", "Discos e respectivos Albuns"], ["02", "Filmes Cinematográficos de caráter educativo ou científico"],
    ["99", "Diversos"]
  ]],
  ["10", "Embarcações", [
    ["01", "Canoas"], ["02", "Chatas"], ["03", "Lanchas"], ["04", "Navios"], ["05", "Rebocadores"],
    ["06", "Traineiras"], ["07", "Transportadores para Barcos"], ["99", "Diversos"]
  ]],
  ["11", "Equipamentos de Manobras e Patrulhamento", [
    ["01", "Material para acampamento, campanha e para instrução e serviço"], ["99", "Diversos"]
  ]],
  ["12", "Equipamentos de Proteção, Segurança e Socorro", [
    ["01", "Cofres"], ["02", "Máquinas e Equipamentos para Salvamento"],
    ["03", "Máquinas e Equipamentos para combate e prevenção de incêndios (extintores)"], ["99", "Diversos"]
  ]],
  ["13", "Instrumentos Musicais e Artísticos", [
    ["01", "Instrumentos Musicais em Geral"], ["99", "Diversos"]
  ]],
  ["14", "Máquinas e Equipamentos de Natureza Industrial", [
    ["01", "Bebedouros elétricos"], ["02", "Condicionadores de Ar"], ["03", "Exaustores e Coifas"],
    ["04", "Máquina de lavar louças e bandejas"], ["05", "Máquinas a vapor"], ["06", "Máquinas de calçados"],
    ["07", "Máquinas de carpintaria"], ["08", "Máquinas de cortar pão e presunto"], ["09", "Máquinas de costura"],
    ["10", "Máquinas de fazer café (cafeteiras)"], ["11", "Máquinas de lavar bandejas"], ["12", "Máquinas de marcenaria"],
    ["13", "Máquinas e Equipamentos para controle de Trânsito"], ["14", "Máquinas elétricas para moer carne"],
    ["15", "Máquinas especiais para a indústria de petróleo"],
    ["16", "Máquinas para indústria de laticínios e fabricação de alimentos (modeladora de pão, divisora de pão, máquina para amassar massas)"],
    ["17", "Máquinas para indústria de papel"], ["18", "Máquinas para indústria têxtil"],
    ["19", "Máquinas para lavanderia"], ["20", "Máquinas para lixo e esgoto"],
    ["21", "Máquinas para tratamento de água"], ["22", "Roçadeiras"], ["23", "Serras"], ["24", "Turbinas"],
    ["99", "Diversos", "tornos, triturador de resíduos, gerador de áudio, afiador, descascador de batatas, cortadores de legumes, bancada com furadeira, banho-maria, carregador para bateria automotiva, conj. piscina c/filtro e bomba, processador de legumes, câmara frigorífica, centrífugas em geral, compressores em geral, esmeril, esterilizador, estufa, forno industrial, furadeiras em geral, cilindro para massas, máq. solda, mesa de luz, caldeiras, filtro industrial, aquecedores de água a gás, frezadora, máq. de gelo, lavadora de alta pressão, lixadeira, betoneiras, vacuometro em geral, motores em geral, martelete, outros materiais de uso duradouro"]
  ]],
  ["15", "Máquinas e Equipamentos Energéticos", [
    ["01", "Estabilizador"], ["02", "Geradores e Fontes de Alimentação"], ["03", "No Break"],
    ["04", "Transformadores"], ["05", "Voltímetros"], ["99", "Diversos"]
  ]],
  ["16", "Máquinas e Equipamentos Gráficos", [
    ["01", "Aparelhos de Cópia, Redução e Ampliação (copiadoras)"],
    ["02", "Aparelhos de cópias fotostáticas e heliográficas (copiadora para plantas de arquitetura)"],
    ["03", "Duplicadores (mimeógrafos)"], ["04", "Guilhotina elétrica ou manual"],
    ["05", "Máquinas de impressão e de tipografia"], ["99", "Diversos"]
  ]],
  ["17", "Equipamentos para Áudio, Vídeo e Foto", [
    ["01", "Aparelhos de som (rádios)"], ["02", "Amplificador"], ["03", "Gravadores de som"],
    ["04", "Projetores (data show, retroprojetores)"], ["05", "Televisão"], ["06", "Videocassete"],
    ["99", "Diversos", "equalizador, mesa de som, câmeras, caixa acústica, comutador de sinais de vídeo, filmadora, flash, fones, megafone, microfones, lentes objetivas, sincronizador, sintonizador, tela de projeção, transcodificador, canhão de luz, pedestal p/ microfone, suporte p/ caixas de som, antena parabólica, aparelho de DVD, Blue Ray, mp3, headset, central de vigilância"]
  ]],
  ["18", "Equipamentos e Materiais de Processamento de Dados", [
    ["01", "Computadores e microcomputadores eletrônicos (laptop, conjunto completo, CPU)"],
    ["02", "Hub, Switch e Patch Panel"], ["03", "Impressoras"], ["04", "Intercaladores"], ["05", "Monitor"],
    ["06", "Perfuradores"], ["07", "Scanner"], ["08", "Separadoras"], ["09", "Tabuladoras"], ["10", "Teclado"],
    ["99", "Diversos", "abafadores, adaptadores, caneta óptica, gravador de cd/dvd, estação de trabalho, gerenciador de impressora (caixa comutadora), leitora óptica, webcam, pen drive, roteador, router, zip-drive, cx de som p/ micro, mimio interativo-quadro interativo"]
  ]],
  ["19", "Máquinas, Instalações e Utensílios de Escritório", [
    ["01", "Caixa Registradora"], ["02", "Carimbo Datadores e Numeradores Metálicos"], ["03", "Escalas Triangulares"],
    ["04", "Fichários"], ["05", "Fragmentadora de papel"], ["06", "Globo Terrestre"], ["07", "Grampeadores"],
    ["08", "Máquinas de calcular"], ["09", "Máquinas de contabilidade"], ["10", "Máquinas de escrever"],
    ["11", "Pantógrafos para normografos"], ["12", "Perfuradores de papel"], ["13", "Régua T"],
    ["99", "Diversos", "anel de gravezande, capela exaustão, chapa aquecedora, clivador, colchão de ar linear, dilatometro, base retangular, bico de bunsen, caneta laser, cubas de ondas, guilhotina, espatula de inox, fasimetro, espectofotômetro, homogenizador, pont de prova, cinescópios, conj. disparador de projeteis, pinças, manequim simulador, microscópio, perfurador de placa, pirômetro"]
  ]],
  ["20", "Máquinas, Ferramentas e Utensílios de Oficina", [
    ["01", "Bancadas para oficinas de trabalho"], ["02", "Diamante para Vidraceiro"], ["03", "Ferramentas Agrícolas"],
    ["04", "Ferramentas e Utensílios para Construção Civil"], ["05", "Ferramentas para Minério"],
    ["06", "Ferramentas para Trabalho de Barbeiro"], ["07", "Ferramentas para Trabalho em couro"],
    ["08", "Ferramentas para Trabalho de Oficina de Alfaiataria"], ["09", "Ferramentas para Trabalho em Madeiras"],
    ["10", "Ferramentas para Trabalho em Oficina Mecânica (alargador de tubos, micrometros, goniômetro)"],
    ["11", "Ferramentas para Trabalho em Oficinas de Encadernação"],
    ["12", "Ferramentas para Trabalho em Oficinas de Forja"],
    ["13", "Ferramentas para Trabalho em Oficinas de Fundição"],
    ["14", "Ferramentas para Trabalho em Oficinas de Solda (inversor - retificador de solda, maçarico)"],
    ["15", "Material de Jardinagem - Regadores, Tesouras de Poda"], ["16", "Oficina de refrigeração (manifold)"],
    ["99", "Diversos", "alavancas, alicates, pulverizadores, torquimetro, esquadro, ferro de soldar, pistola de pintura, serrote, caixa de ferramenta"]
  ]],
  ["21", "Equipamentos e Utensílios Hidráulicos e Elétricos", [
    ["01", "Bancadas para cozinha (térmicas e frigoríficas)"], ["02", "Bombas"], ["03", "Bombas para Lubrificação"],
    ["04", "Diversos"], ["05", "Máquinas hidráulicas"], ["06", "Máquinas pneumáticas"],
    ["07", "Motores Térmicos e Elétricos"], ["08", "Prensas"], ["09", "Pronto Board"], ["99", "Diversos"]
  ]],
  ["23", "Mobiliário em Geral", [
    ["01", "Armários de madeiras, Aço e Especiais"], ["02", "Balcões"], ["03", "Bancos (escolares, de jardim)"],
    ["04", "Biombos"], ["05", "Cadeiras, Poltronas e Cadeiras Universitárias"], ["06", "Carteiras"],
    ["07", "Colchões"], ["08", "Cortinas"], ["09", "Espelhos"], ["10", "Estantes"], ["11", "Grupos estofados"],
    ["12", "Luminárias"], ["13", "Mapotecas"], ["14", "Mesas, Carteiras escolares"], ["15", "Persianas"],
    ["16", "Porta Guarda-chuvas"], ["17", "Relógios (mesa, parede, ponto)"],
    ["18", "Roupeiros (armários de aço para funcionário, guarda-roupa)"], ["19", "Tapetes"],
    ["20", "Vitrines Especiais (armário para exposição de objetos)"],
    ["99", "Diversos", "tamboretes, mastros, abajour, arquivos de aço, lixeiras, bancadas, banquetas, suporte p/revistas e jornais, suporte p/garrafão de água, estrados em geral, porta cartões de ponto, gaveteiro, quadro mural, claviculário, cama, girovisão, papeleira, cavalete, lavatórios, quadro para pilot, pranchetas para desenho, conjunto professor"]
  ]],
  ["24", "Obras de Arte e Peças para Museu", [
    ["01", "Alfaias"], ["02", "Cerâmicas"], ["03", "Documentos e Objetos Históricos"], ["04", "Gravuras"],
    ["05", "Louças"], ["06", "Marfins"], ["07", "Molduras"], ["08", "Pedestais"], ["09", "Pinacoteca"],
    ["10", "Porcelanas"], ["11", "Quadros"], ["99", "Diversos"]
  ]],
  ["25", "Semoventes e Equipamentos de Montaria", [
    ["01", "Animais para sela"],
    ["02", "Animais para produção de leite, lã, ovos e para reprodução, enfim que não se"],
    ["03", "Animais para tração"], ["99", "Diversos"]
  ]],
  ["26", "Veículos Diversos", [
    ["01", "Bicicletas"], ["02", "Carrinho de Mão"], ["03", "Carro plataforma, armazém"], ["04", "Carroças"],
    ["05", "Carroceira p/autocaminhões e outras viaturas"], ["06", "Charretes"], ["07", "Empilhadeira"],
    ["08", "Tanques para água ou para combustível líquidos e quasiquer outros equipamentos para instalação em chassis de veículos de tração mecânica"],
    ["09", "Triciclos"],
    ["99", "Diversos", "carro para bagagens, carros específicos para transporte de cubas de alimento, porta-bandeja, louças, recipientes, porta-detritos, lixo, cantoneira"]
  ]],
  ["27", "Veículos Ferroviários (a cadastrar)", []],
  ["28", "Peças não Incorporáveis a Imóveis", []],
  ["29", "Veículos de Tração Mecânica (a cadastrar)", []],
  ["30", "Carros de Combate (a cadastrar)", []],
  ["31", "Equipamentos, Peças e Acessórios Aeronáuticos", []],
  ["32", "Equipamentos, Peças e Acessórios de Proteção ao Voo", []],
  ["33", "Acessórios para Automóveis", [
    ["01", "Condicionador de ar"], ["02", "Rádios"], ["03", "Kit Gás"], ["99", "Diversos"]
  ]],
  ["34", "Equipamentos de Mergulho e Salvamento", []],
  ["35", "Equipamentos, Peças e Acessórios Marítimos", []],
  ["36", "Equipamentos e Sistemas de Proteção e Vigilância Ambiental", []],
  ["37", "Material destinado ao Acondicionamento para Transporte de Objetos e Valores", [
    ["01", "Arcas"], ["02", "Baús"], ["03", "Caixas de embalagens"], ["04", "Containers"], ["05", "Malas"],
    ["06", "Maletas"], ["99", "Diversos"]
  ]],
  ["62", "Máquinas e Equipamentos Agrícolas e Rodoviários", [
    ["01", "Arados"], ["02", "Carregadores"], ["03", "Compactadores"], ["04", "Conjunto de ignição"],
    ["05", "Cultivadores"], ["06", "Desintegradores"], ["07", "Escavadeiras"],
    ["08", "Fornos e Estufas de secagem e amadurecimento"], ["09", "Grades"], ["10", "Máquinas de Beneficiamento"],
    ["11", "Máquinas de movimentação de terra (exceto os equipamentos mecânicos para"],
    ["12", "Máquinas e Misturadoras de Ração"], ["13", "Motoniveladoras"],
    ["14", "Pulverizadores de tração mecânica ou animal"], ["15", "Rolos compressores"], ["16", "Sulcadores"],
    ["17", "Tratores (lâminas, esteira)"],
    ["18", "Todo equipamento ou máquina destinado ao fomento agropecuário à construção,"],
    ["19", "Usinas de Asfalto"], ["99", "Diversos"]
  ]],
  ["63", "Veículos de Tração Mecânica", [
    ["01", "Ambulâncias"], ["02", "Automóveis de passeio"], ["03", "Caminhões"], ["04", "Camionetas tipo \"pick up\""],
    ["05", "Camionetas tipo rural ou Kombi"], ["06", "Carro para Corpo de Bombeiros"],
    ["07", "Carro para Limpeza Urbana"], ["08", "Carro para Polícia"], ["09", "Carro para Saúde e Assistência"],
    ["10", "Carro-Bomba"], ["11", "Carro-pipa"], ["12", "Consultórios volantes"], ["13", "Furgões"], ["14", "Jeeps"],
    ["15", "Lambretas"], ["16", "Microonibus"], ["17", "Motocicletas"], ["18", "Ônibus"], ["99", "Diversos"]
  ]]
];

// Converte para objetos: { codigo, nome, subtipos: [{ codigo, nome, obs }] }
const TIPOS_BEM = _TIPOS_PORTARIA.map(([codigo, nome, subs]) => ({
  codigo,
  nome,
  subtipos: subs.map(([c, n, o]) => ({ codigo: c, nome: n, obs: o || "" }))
}));
