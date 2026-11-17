import { Confianca, NivelRisco } from '../domain/tipos';

// Identidade visual do Sentinela: azul-marinho institucional, fundo claro e uma escala de risco
// em que cada nível tem cor, símbolo e texto (o nível nunca depende só da cor).

export const cores = {
  primaria: '#0B3C6F',
  primariaEscura: '#082C52',
  primariaClara: '#E3EEF9',
  fundo: '#F3F6FA',
  superficie: '#FFFFFF',
  texto: '#14202E',
  textoSuave: '#4A5A6B',
  borda: '#CBD5E1',
  erro: '#B3261E',
  erroFundo: '#FBE6E6',
  sucesso: '#1E7A46',
  sucessoFundo: '#E3F4EA',
  aviso: '#7A4F00',
  avisoFundo: '#FFF4D6',
  avisoBorda: '#C98A00',
  branco: '#FFFFFF',
};

export const espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const raio = { sm: 6, md: 12, pill: 999 };
export const tamanhoFonte = { pequeno: 13, corpo: 15, subtitulo: 17, titulo: 22, destaque: 30 };

export interface EstiloNivel {
  fundo: string;
  texto: string;
  borda: string;
  simbolo: string;
}

export const coresNivel: Record<NivelRisco, EstiloNivel> = {
  baixo: { fundo: '#E3F4EA', texto: '#14532D', borda: '#1E7A46', simbolo: '○' },
  moderado: { fundo: '#FFF4CC', texto: '#5C4000', borda: '#A87A00', simbolo: '◐' },
  alto: { fundo: '#FFE4CC', texto: '#702E00', borda: '#C25A00', simbolo: '●' },
  severo: { fundo: '#FADADD', texto: '#6B0D15', borda: '#B3261E', simbolo: '◆' },
  extremo: { fundo: '#4A1D5E', texto: '#FFFFFF', borda: '#4A1D5E', simbolo: '▲' },
};

// Barrinhas de confiança: ▮▮▮ alta, ▮▮▯ média, ▮▯▯ baixa.
export const simboloConfianca: Record<Confianca, string> = {
  alta: '▮▮▮',
  media: '▮▮▯',
  baixa: '▮▯▯',
};

export const TAMANHO_MINIMO_TOQUE = 48;
