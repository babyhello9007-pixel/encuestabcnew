export interface LeaderOption {
  name: string;
  isCustom?: boolean;
}

export interface PartyLeaders {
  [key: string]: LeaderOption[];
}

export const PARTY_LEADERS: PartyLeaders = {
  PP: [
    { name: "Alberto Núñez Feijóo" },
    { name: "Isabel Díaz Ayuso" },
    { name: "Juan Manuel Moreno Bonilla" },
  ],
  PSOE: [
    { name: "Pedro Sánchez" },
    { name: "Salvador Illa" },
    { name: "Juan Espadas" },
  ],
  VOX: [
    { name: "Santiago Abascal" },
    { name: "Javier Ortega Smith" },
    { name: "Rocío de Meer" },
  ],
  Podemos: [
    { name: "Ione Belarra" },
    { name: "Javier Sánchez Serna" },
    { name: "Lilith Verstrynge" },
  ],
  Ciudadanos: [
    { name: "Inés Arrimadas" },
    { name: "Edmundo Bal" },
    { name: "Juan Carlos Girauta" },
  ],
  "Se Acabó La Fiesta": [
    { name: "Iñigo Errejón" },
    { name: "Javier Milei" },
    { name: "Nicolás Márquez" },
  ],
  SUMAR: [
    { name: "Yolanda Díaz" },
    { name: "Jaume Asens" },
    { name: "Marta Lois" },
  ],
  "Aliança Catalana": [
    { name: "Carles Puigdemont" },
    { name: "Jordi Turull" },
    { name: "Anna Erra" },
  ],
  ERC: [
    { name: "Oriol Junqueras" },
    { name: "Gabriel Rufián" },
    { name: "Marta Rovira" },
  ],
  JUNTS: [
    { name: "Carles Puigdemont" },
    { name: "Laura Borràs" },
    { name: "Albert Batet" },
  ],
  BNG: [
    { name: "Ana Pontón" },
    { name: "Xosé Manoel Beiras" },
    { name: "Néstor Rego" },
  ],
  PNV: [
    { name: "Andoni Ortuzar" },
    { name: "Aitor Esteban" },
    { name: "Ibone Bengoetxea" },
  ],
  BILDU: [
    { name: "Mertxe Aizpurua" },
    { name: "Oskar Matute" },
    { name: "Jon Iñarritu" },
  ],
  "Coalición Canaria": [
    { name: "Fernando Clavijo" },
    { name: "Cristina Valido" },
    { name: "Pedro Quevedo" },
  ],
  "Izquierda Española": [
    { name: "Enrique Santiago" },
    { name: "Antón Gómez-Reino" },
    { name: "Javier Sánchez Serna" },
  ],
  "P-Lib": [
    { name: "Juan Carlos Girauta" },
    { name: "Albert Rivera" },
    { name: "Javier Milei" },
  ],
  "Frente Obrero": [
    { name: "Jaime Óscar Quesada" },
    { name: "Emilio Sola" },
    { name: "Lidia Falcón" },
  ],
  "Escaños en Blanco": [
    { name: "Voto Nulo" },
    { name: "Abstención" },
    { name: "Voto en Blanco" },
  ],
  "Falange Española de las JONS": [
    { name: "Santiago Abascal" },
    { name: "Rocío de Meer" },
    { name: "Javier Ortega Smith" },
  ],
  "Soberanía y Trabajo": [
    { name: "Santiago Abascal" },
    { name: "Rocío de Meer" },
    { name: "Javier Ortega Smith" },
  ],
  "Caminando Juntos": [
    { name: "Javier Milei" },
    { name: "Santiago Abascal" },
    { name: "Alberto Núñez Feijóo" },
  ],
  Otros: [
    { name: "Otros" },
    { name: "Ninguno" },
    { name: "Abstención" },
  ],
};

export function getLeaderOptions(partyName: string): LeaderOption[] {
  return PARTY_LEADERS[partyName] || [];
}

