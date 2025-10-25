export interface SurveyResponse {
  id?: string;
  created_at?: string;
  
  // Datos sociodemográficos
  edad?: number;
  provincia?: string;
  ccaa?: string;
  nacionalidad?: string;
  
  // Intención de voto
  voto_generales?: string;
  voto_generales_otro?: string;
  voto_autonomicas?: string;
  voto_autonomicas_otro?: string;
  voto_municipales?: string;
  voto_municipales_otro?: string;
  voto_europeas?: string;
  voto_europeas_otro?: string;
  
  // Participación y preferencias políticas
  probabilidad_voto?: string;
  futuro_presidente?: string;
  nota_ejecutivo?: number;
  posicion_ideologica?: number;
  
  // Valoración de líderes políticos
  val_feijoo?: number;
  val_sanchez?: number;
  val_abascal?: number;
  val_alvise?: number;
  val_yolanda_diaz?: number;
  val_irene_montero?: number;
  val_ayuso?: number;
  val_buxade?: number;
  
  // Juventud y estructuras sociales
  voto_asociacion_juvenil?: string;
  voto_asociacion_juvenil_otro?: string;
  reformular_c_juventud?: string;
  unificar_apps_publicas?: string;
  conocer_gastos_publicos?: string;
  principales_problemas?: string[];
  problemas_personales?: string[];
  otro_problema?: string;
  
  // Política exterior y defensa
  paises_amenaza?: string;
  aumentar_gasto_defensa?: string;
  alineacion_internacional?: string;
  rusia_genocidio?: string;
  
  // Sistema democrático y medios
  libertad_peligro?: string;
  confianza_medios?: string;
  calidad_democratica?: number;
  sanchez_respeta_democracia?: string;
  oposicion_eficaz?: string;
  judicial_igualdad?: string;
  mecanismos_anticorrupcion?: string;
  
  // Constitución y reformas
  elecciones_anticipadas?: string;
  reforma_estructural?: string;
  sistema_pensiones?: string;
  voto_menores_18?: string;
  politica_inmigracion_dura?: string;
  aranceles_eeuu?: string;
  tc_suspender_amnistia?: string;
  sanchez_dimision?: string;
  
  // Partidos y liderazgos
  val_feijoo_congreso?: number;
  ayuso_protagonismo?: string;
  coalicion_pp_vox?: string;
  pp_corrupto?: string;
  psoe_corrupto?: string;
  pp_psoe_diferencia?: string;
  vox_atacar_pp?: string;
  
  // Renovación democrática
  regeneracion_democratica?: string;
  apoyar_antisistema?: string;
  p_lib_escanos_congreso?: string;
  crear_partido_politico?: string;
  opinion_alvise?: string;
  jovenes_representados?: string;
  
  // Comentarios finales
  tema_no_cubierto?: string;
  experiencia_encuesta?: number;
}

export interface PartyData {
  id: string;
  nombre_completo: string;
  votos: number;
  escanos: number;
  porcentaje: number;
  logo_path: string;
}

export interface YouthAssociationData {
  id: string;
  nombre_completo: string;
  votos: number;
  escanos: number;
  porcentaje: number;
  logo_path: string;
}

export interface SurveyQuestion {
  id: string;
  section: string;
  question: string;
  type: 'radio' | 'checkbox' | 'scale' | 'text' | 'number';
  options?: string[];
  min?: number;
  max?: number;
  fieldName: keyof SurveyResponse;
}

