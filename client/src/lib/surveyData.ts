import { SurveyQuestion } from './types';

export const PARTIES_GENERAL = {
  PP: { name: 'PP', logo: '/assets/icons/PP.png', color: '#0066FF' },
  PSOE: { name: 'PSOE', logo: '/assets/icons/PSOE.png', color: '#E81B23' },
  VOX: { name: 'VOX', logo: '/assets/icons/VOX.png', color: '#2ECC71' },
  SUMAR: { name: 'SUMAR', logo: '/assets/icons/SUMAR.png', color: '#9B2D96' },
  PODEMOS: { name: 'PODEMOS', logo: '/assets/icons/PODEMOS.png', color: '#7B3FF2' },
  JUNTS: { name: 'JUNTS', logo: '/assets/icons/JUNTS.png', color: '#003F9F' },
  ERC: { name: 'ERC', logo: '/assets/icons/ERCNew.png', color: '#FFC400' },
  PNV: { name: 'PNV', logo: '/assets/icons/PNV.png', color: '#00B050' },
  ALIANZA: { name: 'Aliança Catalana', logo: '/assets/icons/alianza.png', color: '#003D99' },
  BILDU: { name: 'BILDU', logo: '/assets/icons/ehbildu.png', color: '#00AA44' },
  SAF: { name: 'Se Acabó La Fiesta', logo: '/assets/icons/SeAcabóLaFiesta.png', color: '#FF6600' },
  CC: { name: 'Coalición Canaria', logo: '/assets/icons/coalicióncanaria.png', color: '#FFCC00' },
  UPN: { name: 'UPN', logo: '/assets/icons/UPNNew.png', color: '#0066FF' },
  CIUDADANOS: { name: 'Ciudadanos', logo: '/assets/icons/ciudadanos.png', color: '#FF9900' },
  PLIB: { name: 'P-Lib', logo: '/assets/icons/P-Lib.jpg', color: '#FFD700' },
  EB: { name: 'Escaños en Blanco', logo: '/assets/icons/EscañosEnBlancoNEW.png', color: '#999999' },
  BNG: { name: 'BNG', logo: '/assets/icons/bng.png', color: '#003D99' },
  FO: { name: 'Frente Obrero', logo: '/assets/icons/FrenteObrero.png', color: '#CC0000' },
  CJ: { name: 'Caminando Juntos', logo: '/assets/icons/CaminandoJuntos.png', color: '#0066FF' },
  FALANGE: { name: 'Falange', logo: '/assets/icons/FALANGENEW.webp', color: '#FF0000' },
  IE: { name: 'Izquierda Española', logo: '/assets/icons/IzquierdaEspañolaNEW.png', color: '#CC0000' },
  COMPROMIS: { name: 'Compromís', logo: '/assets/logos/compromis-logo.png', color: '#FF9900' },
  DO: { name: 'Democracia Ourensana', logo: '/assets/logos/democracia-ourensana-logo.png', color: '#FFD700' },
  AA: { name: 'Adelante Andalucía', logo: '/assets/logos/adelante-andalucia.png', color: '#FF0000' },
  CUP: { name: 'CUP', logo: '/assets/logos/cup.png', color: '#FFC400' },
  PACMA: { name: 'PACMA', logo: '/assets/logos/pacma.png', color: '#00AA44' },
  PCTE: { name: 'PCTE', logo: '/assets/logos/pcte.png', color: '#CC0000' },
  UPL: { name: 'UPL', logo: '/assets/logos/upl.png', color: '#0066FF' },
};

export const YOUTH_ASSOCIATIONS = {
  SHAACABAT: { name: "S'ha Acabat!", logo: '/assets/icons/SHaAcabat.jpg', color: '#FF6600' },
  REVUELTA: { name: 'Revuelta', logo: '/assets/icons/RevueltaNEW.jpg', color: '#D91E63' },
  NNGG: { name: 'Nuevas Generaciones del PP', logo: '/assets/icons/NuevasGeneracionesdelPP.png', color: '#0066FF' },
  JVOX: { name: 'Jóvenes de VOX', logo: '/assets/icons/JóvenesDeVOXNEW.png', color: '#2ECC71' },
  VLE: { name: 'Voces Libres España (VLE)', logo: '/assets/icons/VocesLibresDeEspañaNEW.jpg', color: '#FFD700' },
  JSE: { name: 'Juventudes Socialistas de España', logo: '/assets/icons/JuventudesSocialistasdeEspañaNEW.png', color: '#E81B23' },
  PATRIOTA: { name: 'Acción Patriota', logo: '/assets/icons/Patriota.png', color: '#FF0000' },
  JIU: { name: 'Juventudes de Izquierda Unida', logo: '/assets/icons/JuventudesDeIzquierdaUnida.jpg', color: '#CC0000' },
  JCOMUNISTA: { name: 'Juventudes Comunistas', logo: '/assets/icons/juventudescomunistas.png', color: '#CC0000' },
  JCS: { name: 'Jóvenes de Ciudadanos', logo: '/assets/icons/jóvenesdeciudadanosNEW.jpg', color: '#FF9900' },
  EGI: { name: 'EGI', logo: '/assets/icons/egi.jpg', color: '#00AA44' },
  ERNAI: { name: 'Ernai', logo: '/assets/icons/ernai.jpg', color: '#00AA44' },
  JERC: { name: "Joventuts d'Esquerra Republicana de Catalunya", logo: '/assets/icons/ERCNew.png', color: '#FFC400' },
  JNC: { name: 'Joventut Nacionalista de Catalunya', logo: '/assets/icons/JoventutNacionalistadeCatalunyaNEW.png', color: '#003D99' },
  GALIZANOVA: { name: 'Galiza Nova', logo: '/assets/icons/galizanovanew.png', color: '#003D99' },
  ARRAN: { name: 'Arran', logo: '/assets/icons/arran-new.png', color: '#00AA44' },
  JNCANA: { name: 'Jóvenes Nacionalistas de Canarias', logo: '/assets/icons/jncana.jpg', color: '#FFCC00' },
  JPV: { name: 'Joves del País Valencià – Compromís', logo: '/assets/icons/jpv.png', color: '#FF9900' },
  ACL: { name: 'Acción Castilla y León', logo: '/assets/icons/AcciónCastillayLeónNEW.png', color: '#FFD700' },
  JEC: { name: 'Juventud Estudiante Católica', logo: '/assets/icons/JuventudEstudianteCatólicaNEW.jpg', color: '#0066FF' },
  AGORA: { name: 'ÁGORA Canarias', logo: '/assets/icons/agora.png', color: '#FFCC00' },
};

export const LEADERS = {
  FEIJOO: { name: 'Alberto Núñez Feijóo', image: '/assets/leaders/feijoo-nuevo.png' },
  SANCHEZ: { name: 'Pedro Sánchez', image: '/assets/leaders/PedroSanchez.png' },
  ABASCAL: { name: 'Santiago Abascal', image: '/assets/leaders/SantiagoAbascal.png' },
  ALVISE: { name: 'Alvise Pérez', image: '/assets/leaders/alvise-nuevo.png' },
  YOLANDA: { name: 'Yolanda Díaz', image: '/assets/leaders/YolandaDiaz.png' },
  IRENE: { name: 'Irene Montero', image: '/assets/leaders/IreneMontero.png' },
  AYUSO: { name: 'Isabel Díaz Ayuso', image: '/assets/leaders/IsabelDiazAyuso.png' },
  BUXADE: { name: 'Jorge Buxadé', image: '/assets/leaders/JorgeBuxade.png' },
};

export const PROVINCES = [
  // Andalucía (8)
  'Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla',
  // Aragón (3)
  'Huesca', 'Teruel', 'Zaragoza',
  // Asturias (1)
  'Asturias',
  // Islas Baleares (1)
  'Illes Balears',
  // Canarias (2)
  'Las Palmas', 'Santa Cruz de Tenerife',
  // Cantabria (1)
  'Cantabria',
  // Castilla-La Mancha (5)
  'Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo',
  // Castilla y León (9)
  'Ávila', 'Burgos', 'León', 'Palencia', 'Salamanca', 'Segovia', 'Soria', 'Valladolid', 'Zamora',
  // Cataluña (4)
  'Barcelona', 'Girona', 'Lleida', 'Tarragona',
  // Comunidad Valenciana (3)
  'Alicante', 'Castellón', 'Valencia',
  // Extremadura (2)
  'Badajoz', 'Cáceres',
  // Galicia (4)
  'A Coruña', 'Lugo', 'Ourense', 'Pontevedra',
  // La Rioja (1)
  'La Rioja',
  // Comunidad de Madrid (1)
  'Madrid',
  // Murcia (1)
  'Murcia',
  // Navarra (1)
  'Navarra',
  // País Vasco (3)
  'Álava', 'Bizkaia', 'Gipuzkoa',
  // Ceuta y Melilla (2)
  'Ceuta', 'Melilla'
];

export const CCAA = [
  'Andalucía',
  'Aragón',
  'Asturias',
  'Islas Baleares',
  'Canarias',
  'Cantabria',
  'Castilla-La Mancha',
  'Castilla y León',
  'Cataluña',
  'Comunidad Valenciana',
  'Extremadura',
  'Galicia',
  'La Rioja',
  'Madrid',
  'Murcia',
  'Navarra',
  'País Vasco',
  'Ceuta y Melilla'
];

export const PROBLEMS = [
  'Inmigración',
  'Corrupción',
  'Desempleo',
  'Vivienda',
  'Conflictos internacionales',
  'Ocupación ilegal',
  'Sanidad',
  'Educación',
  'Bajos salarios',
  'Deuda pública',
  'Sobrerregulación',
  'Calidad institucional',
  'Pérdida de soberanía',
  'Impuestos',
];

export const surveyQuestions: SurveyQuestion[] = [
  // Datos sociodemográficos
  {
    id: 'edad',
    section: 'Datos personales',
    question: '¿Cuál es tu edad?',
    type: 'number',
    fieldName: 'edad',
  },
  {
    id: 'ccaa',
    section: 'Datos personales',
    question: '¿En qué Comunidad Autónoma resides?',
    type: 'radio',
    options: CCAA,
    fieldName: 'ccaa',
  },
  {
    id: 'provincia',
    section: 'Datos personales',
    question: '¿En qué provincia resides?',
    type: 'radio',
    options: PROVINCES,
    fieldName: 'provincia',
  },
  {
    id: 'nacionalidad',
    section: 'Datos personales',
    question: '¿Cuál es tu nacionalidad?',
    type: 'text',
    fieldName: 'nacionalidad',
  },

  // Intención de voto - Elecciones Generales
  {
    id: 'voto_generales',
    section: 'Intención de voto',
    question: '¿A qué partido votarías en las elecciones generales?',
    type: 'radio',
    options: Object.values(PARTIES_GENERAL).map(p => p.name).concat(['Otros']),
    fieldName: 'voto_generales',
  },

  // Intención de voto - Autonómicas
  {
    id: 'voto_autonomicas',
    section: 'Intención de voto',
    question: '¿A qué partido votarías en las elecciones autonómicas?',
    type: 'radio',
    options: Object.values(PARTIES_GENERAL).map(p => p.name).concat(['Otros']),
    fieldName: 'voto_autonomicas',
  },

  // Intención de voto - Municipales
  {
    id: 'voto_municipales',
    section: 'Intención de voto',
    question: '¿A qué partido votarías en las elecciones municipales?',
    type: 'radio',
    options: Object.values(PARTIES_GENERAL).map(p => p.name).concat(['Otros']),
    fieldName: 'voto_municipales',
  },

  // Intención de voto - Europeas
  {
    id: 'voto_europeas',
    section: 'Intención de voto',
    question: '¿A qué partido votarías en las elecciones europeas?',
    type: 'radio',
    options: Object.values(PARTIES_GENERAL).map(p => p.name).concat(['Otros']),
    fieldName: 'voto_europeas',
  },

  // Probabilidad de voto
  {
    id: 'probabilidad_voto',
    section: 'Participación política',
    question: '¿Con qué probabilidad acudirás a votar en las próximas elecciones?',
    type: 'radio',
    options: ['Alta', 'Media', 'Baja', 'Otro'],
    fieldName: 'probabilidad_voto',
  },

  // Futuro presidente
  {
    id: 'futuro_presidente',
    section: 'Participación política',
    question: '¿A quién ves como futuro presidente del Gobierno de España?',
    type: 'text',
    fieldName: 'futuro_presidente',
  },

  // Nota al ejecutivo
  {
    id: 'nota_ejecutivo',
    section: 'Participación política',
    question: '¿Qué nota le pones al actual Ejecutivo? (0-10)',
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'nota_ejecutivo',
  },

  // Posición ideológica
  {
    id: 'posicion_ideologica',
    section: 'Participación política',
    question: '¿Dónde te sitúas ideológicamente? (1=Extrema izquierda, 10=Extrema derecha)',
    type: 'scale',
    min: 1,
    max: 10,
    fieldName: 'posicion_ideologica',
  },

  // Valoración de líderes
  {
    id: 'val_feijoo',
    section: 'Valoración de líderes',
    question: `¿Cómo valoras a ${LEADERS.FEIJOO.name}? (0-10)`,
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'val_feijoo',
  },
  {
    id: 'val_sanchez',
    section: 'Valoración de líderes',
    question: `¿Cómo valoras a ${LEADERS.SANCHEZ.name}? (0-10)`,
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'val_sanchez',
  },
  {
    id: 'val_abascal',
    section: 'Valoración de líderes',
    question: `¿Cómo valoras a ${LEADERS.ABASCAL.name}? (0-10)`,
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'val_abascal',
  },
  {
    id: 'val_alvise',
    section: 'Valoración de líderes',
    question: `¿Cómo valoras a ${LEADERS.ALVISE.name}? (0-10)`,
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'val_alvise',
  },
  {
    id: 'val_yolanda_diaz',
    section: 'Valoración de líderes',
    question: `¿Cómo valoras a ${LEADERS.YOLANDA.name}? (0-10)`,
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'val_yolanda_diaz',
  },
  {
    id: 'val_irene_montero',
    section: 'Valoración de líderes',
    question: `¿Cómo valoras a ${LEADERS.IRENE.name}? (0-10)`,
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'val_irene_montero',
  },
  {
    id: 'val_ayuso',
    section: 'Valoración de líderes',
    question: `¿Cómo valoras a ${LEADERS.AYUSO.name}? (0-10)`,
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'val_ayuso',
  },
  {
    id: 'val_buxade',
    section: 'Valoración de líderes',
    question: `¿Cómo valoras a ${LEADERS.BUXADE.name}? (0-10)`,
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'val_buxade',
  },

  // Juventud
  {
    id: 'voto_asociacion_juvenil',
    section: 'Juventud',
    question: '¿A qué asociación juvenil votarías?',
    type: 'radio',
    options: Object.values(YOUTH_ASSOCIATIONS).map(a => a.name).concat(['Otros']),
    fieldName: 'voto_asociacion_juvenil',
  },

  {
    id: 'reformular_c_juventud',
    section: 'Juventud',
    question: '¿Debería reformularse el Consejo de la Juventud para ser elegido democráticamente?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'reformular_c_juventud',
  },

  {
    id: 'unificar_apps_publicas',
    section: 'Juventud',
    question: '¿Debería España unificar todas las apps públicas en una sola plataforma?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'unificar_apps_publicas',
  },

  {
    id: 'conocer_gastos_publicos',
    section: 'Juventud',
    question: '¿Se deberían conocer en tiempo real los gastos, ingresos y contratos de instituciones y cargos públicos?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez'],
    fieldName: 'conocer_gastos_publicos',
  },

  {
    id: 'principales_problemas',
    section: 'Problemas',
    question: '¿Cuáles son los tres principales problemas que enfrenta España actualmente?',
    type: 'checkbox',
    options: PROBLEMS,
    fieldName: 'principales_problemas',
  },

  {
    id: 'otro_problema',
    section: 'Problemas',
    question: 'Otro problema (opcional)',
    type: 'text',
    fieldName: 'otro_problema',
  },

  {
    id: 'problemas_personales',
    section: 'Problemas',
    question: '¿Cuáles de estos problemas te afectan personalmente en mayor medida?',
    type: 'checkbox',
    options: PROBLEMS,
    fieldName: 'problemas_personales',
  },

  // Política exterior
  {
    id: 'paises_amenaza',
    section: 'Política exterior',
    question: '¿Qué país(es) considera amenaza(s) para la paz mundial?',
    type: 'text',
    fieldName: 'paises_amenaza',
  },

  {
    id: 'aumentar_gasto_defensa',
    section: 'Política exterior',
    question: '¿Debería España aumentar su gasto en defensa al 5% del PIB?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'aumentar_gasto_defensa',
  },

  {
    id: 'alineacion_internacional',
    section: 'Política exterior',
    question: '¿Deberíamos alinearnos más con EE.UU. o con China?',
    type: 'radio',
    options: ['EE.UU.', 'China', 'Neutralidad', 'Otro'],
    fieldName: 'alineacion_internacional',
  },

  {
    id: 'rusia_genocidio',
    section: 'Política exterior',
    question: '¿Considera que Rusia está cometiendo genocidio?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'rusia_genocidio',
  },

  // Sistema democrático
  {
    id: 'libertad_peligro',
    section: 'Sistema democrático',
    question: '¿Cree que la libertad de prensa o judicial está en peligro?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'libertad_peligro',
  },

  {
    id: 'confianza_medios',
    section: 'Sistema democrático',
    question: '¿Confía en que los medios de comunicación en España ofrecen información objetiva?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'confianza_medios',
  },

  {
    id: 'calidad_democratica',
    section: 'Sistema democrático',
    question: 'Valore la calidad democrática en España (1-10)',
    type: 'scale',
    min: 1,
    max: 10,
    fieldName: 'calidad_democratica',
  },

  {
    id: 'sanchez_respeta_democracia',
    section: 'Sistema democrático',
    question: '¿Cree que Pedro Sánchez respeta los principios democráticos?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'sanchez_respeta_democracia',
  },

  {
    id: 'oposicion_eficaz',
    section: 'Sistema democrático',
    question: '¿La oposición liderada por el PP cumple eficazmente su papel?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'oposicion_eficaz',
  },

  {
    id: 'judicial_igualdad',
    section: 'Sistema democrático',
    question: '¿Cree que el sistema judicial trata por igual a todos los ciudadanos?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'judicial_igualdad',
  },

  {
    id: 'mecanismos_anticorrupcion',
    section: 'Sistema democrático',
    question: '¿Son suficientes los mecanismos actuales contra la corrupción?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'mecanismos_anticorrupcion',
  },

  // Constitución y reformas
  {
    id: 'elecciones_anticipadas',
    section: 'Reformas',
    question: '¿Cree que habrá elecciones anticipadas antes de 2027?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'elecciones_anticipadas',
  },

  {
    id: 'reforma_estructural',
    section: 'Reformas',
    question: '¿España necesita una reforma estructural del Estado?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'reforma_estructural',
  },

  {
    id: 'sistema_pensiones',
    section: 'Reformas',
    question: '¿Qué sistema de pensiones prefiere?',
    type: 'radio',
    options: ['Público', 'Privado', 'Mixto', 'Otro'],
    fieldName: 'sistema_pensiones',
  },

  {
    id: 'voto_menores_18',
    section: 'Reformas',
    question: '¿Está de acuerdo con permitir votar a menores de 18 años?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'voto_menores_18',
  },

  {
    id: 'politica_inmigracion_dura',
    section: 'Reformas',
    question: '¿Cree que España necesita una política de inmigración más dura?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'politica_inmigracion_dura',
  },

  {
    id: 'aranceles_eeuu',
    section: 'Reformas',
    question: '¿Los aranceles de EE.UU. perjudican a España?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'aranceles_eeuu',
  },

  {
    id: 'tc_suspender_amnistia',
    section: 'Reformas',
    question: '¿Debe el Tribunal Constitucional suspender la tramitación de la ley de amnistía?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'tc_suspender_amnistia',
  },

  {
    id: 'sanchez_dimision',
    section: 'Reformas',
    question: '¿Debería dimitir Pedro Sánchez?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'sanchez_dimision',
  },

  // Partidos y liderazgos
  {
    id: 'val_feijoo_congreso',
    section: 'Partidos',
    question: '¿Cómo valoras la decisión de Feijóo de adelantar el Congreso del PP a julio? (0-10)',
    type: 'scale',
    min: 0,
    max: 10,
    fieldName: 'val_feijoo_congreso',
  },

  {
    id: 'ayuso_protagonismo',
    section: 'Partidos',
    question: '¿Debería Ayuso tener más protagonismo en la dirección nacional del PP?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'ayuso_protagonismo',
  },

  {
    id: 'coalicion_pp_vox',
    section: 'Partidos',
    question: '¿Ve posible una coalición PP–VOX?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'coalicion_pp_vox',
  },

  {
    id: 'pp_corrupto',
    section: 'Partidos',
    question: '¿Considera al PP un partido corrupto y mentiroso?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'pp_corrupto',
  },

  {
    id: 'psoe_corrupto',
    section: 'Partidos',
    question: '¿Considera al PSOE un partido corrupto y mentiroso?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'psoe_corrupto',
  },

  {
    id: 'pp_psoe_diferencia',
    section: 'Partidos',
    question: '¿Cree que PP y PSOE se diferencian realmente?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'pp_psoe_diferencia',
  },

  {
    id: 'vox_atacar_pp',
    section: 'Partidos',
    question: '¿Cree que VOX debería dejar de atacar al PP y atacar juntos al PSOE?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'vox_atacar_pp',
  },

  // Renovación democrática
  {
    id: 'regeneracion_democratica',
    section: 'Renovación',
    question: '¿Debería haber una verdadera regeneración democrática en España?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'regeneracion_democratica',
  },

  {
    id: 'apoyar_antisistema',
    section: 'Renovación',
    question: '¿Apoyaría a un partido antisistema del actual establishment?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'apoyar_antisistema',
  },

  {
    id: 'p_lib_escanos_congreso',
    section: 'Renovación',
    question: '¿Cree que partidos como P-LIB o Escaños en Blanco podrían llegar al Congreso?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'p_lib_escanos_congreso',
  },

  {
    id: 'crear_partido_politico',
    section: 'Renovación',
    question: '¿Crearía usted un partido político?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'crear_partido_politico',
  },

  {
    id: 'opinion_alvise',
    section: 'Renovación',
    question: '¿Qué opina de la figura de Alvise Pérez?',
    type: 'text',
    fieldName: 'opinion_alvise',
  },

  {
    id: 'jovenes_representados',
    section: 'Renovación',
    question: '¿Cree que los jóvenes están suficientemente representados en la política española?',
    type: 'radio',
    options: ['Sí', 'No', 'Tal vez', 'Otro'],
    fieldName: 'jovenes_representados',
  },

  // Comentarios finales
  {
    id: 'tema_no_cubierto',
    section: 'Comentarios',
    question: '¿Hay algún tema importante que no hayamos cubierto y sobre el que le gustaría opinar?',
    type: 'text',
    fieldName: 'tema_no_cubierto',
  },

  {
    id: 'experiencia_encuesta',
    section: 'Comentarios',
    question: '¿Cómo calificaría su experiencia con esta encuesta? (1-10)',
    type: 'scale',
    min: 1,
    max: 10,
    fieldName: 'experiencia_encuesta',
  },
];

