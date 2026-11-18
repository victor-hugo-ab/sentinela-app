// Tipos compartilhados pelo app. Nomes em português para casar com o vocabulário do Sentinela.

export type NivelRisco = 'baixo' | 'moderado' | 'alto' | 'severo' | 'extremo';
export const NIVEIS: readonly NivelRisco[] = ['baixo', 'moderado', 'alto', 'severo', 'extremo'];
export const ROTULO_NIVEL: Record<NivelRisco, string> = {
  baixo: 'Baixo',
  moderado: 'Moderado',
  alto: 'Alto',
  severo: 'Severo',
  extremo: 'Extremo',
};

export type Confianca = 'alta' | 'media' | 'baixa';
export const ROTULO_CONFIANCA: Record<Confianca, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

// api = Open-Meteo agora; cache = última resposta guardada no aparelho; sintetico = modo demonstração.
export type FonteDados = 'api' | 'cache' | 'sintetico';

export interface Municipio {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
}

// Chuva de um dia. "data" é YYYY-MM-DD. Valores ausentes ficam null (nunca viram zero).
export interface DiaChuva {
  data: string;
  chuvaMm: number | null;
  probabilidade: number | null; // % de chance de chuva (só existe para hoje e dias futuros)
}

export interface SerieClima {
  municipioId: string;
  dias: DiaChuva[];
  fonte: FonteDados;
  atualizadoEm: string; // ISO
}

export interface MetricasChuva {
  pico3dMm: number;
  janelaInicio: string;
  janelaFim: string;
  passado3dMm: number;
  passado7dMm: number;
  proximos3dMm: number;
  previstoNoPicoMm: number;
}

// Resultado da análise de um município. É uma estimativa para apoiar o gestor, não uma decisão.
export interface Avaliacao {
  alertaId: string;
  municipioId: string;
  nivel: NivelRisco;
  nivelBase: NivelRisco; // antes do ajuste por solo encharcado
  confianca: Confianca;
  motivosConfianca: string[];
  justificativa: string[];
  limitacoes: string[];
  sugestao: string;
  metricas: MetricasChuva;
  dataBase: string; // YYYY-MM-DD de referência ("hoje" no momento da coleta)
  fonte: FonteDados;
  atualizadoEm: string;
}

export type TipoRelato =
  | 'alagamento'
  | 'rio_acima_da_cota'
  | 'pessoas_em_risco'
  | 'deslizamento'
  | 'falta_servicos'
  | 'abrigo';
export type GravidadeRelato = 'baixa' | 'media' | 'alta';

export const TIPOS_RELATO: ReadonlyArray<{ valor: TipoRelato; rotulo: string }> = [
  { valor: 'alagamento', rotulo: 'Rua ou casa alagada' },
  { valor: 'rio_acima_da_cota', rotulo: 'Rio acima do normal' },
  { valor: 'pessoas_em_risco', rotulo: 'Pessoas em risco' },
  { valor: 'deslizamento', rotulo: 'Deslizamento' },
  { valor: 'falta_servicos', rotulo: 'Falta de energia ou água' },
  { valor: 'abrigo', rotulo: 'Problema em abrigo' },
];

export const GRAVIDADES_RELATO: ReadonlyArray<{ valor: GravidadeRelato; rotulo: string }> = [
  { valor: 'baixa', rotulo: 'Baixa' },
  { valor: 'media', rotulo: 'Média' },
  { valor: 'alta', rotulo: 'Alta' },
];

// Relato de campo. Sem nome, telefone nem coordenadas: só o necessário.
export interface Relato {
  id: string;
  municipioId: string;
  local: string;
  tipo: TipoRelato;
  gravidade: GravidadeRelato;
  descricao: string;
  criadoEm: string; // ISO
}

export type AcaoDecisao = 'aprovar' | 'observar' | 'descartar';
export const ACOES_DECISAO: ReadonlyArray<{ valor: AcaoDecisao; rotulo: string }> = [
  { valor: 'aprovar', rotulo: 'Aprovar aviso' },
  { valor: 'observar', rotulo: 'Manter em observação' },
  { valor: 'descartar', rotulo: 'Rejeitar aviso' },
];

// Registro da decisão do gestor sobre um alerta. É o que torna o apoio auditável.
export interface Decisao {
  id: string;
  alertaId: string;
  municipioId: string;
  nivel: NivelRisco;
  confianca: Confianca;
  acao: AcaoDecisao;
  justificativa: string;
  criadaEm: string; // ISO
}
