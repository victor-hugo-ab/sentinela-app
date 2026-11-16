import { hojeISO, somarDias } from '../domain/datas';
import { Municipio, SerieClima } from '../domain/tipos';

// Dados SINTÉTICOS para o modo demonstração (apresentação sem internet e testes).
// Cada perfil tem 7 dias passados (do mais antigo ao mais recente) e 7 dias a partir de hoje,
// com a chance de chuva dos dias previstos. Os valores são inventados e deterministas.
interface Perfil {
  passado: number[];
  futuro: number[];
  probabilidade: number[];
}

export const PERFIS: Record<string, Perfil> = {
  // Pouca chuva: risco baixo.
  calmo: {
    passado: [0, 1, 0, 2, 0, 0, 1],
    futuro: [0, 3, 0, 0, 1, 0, 0],
    probabilidade: [10, 20, 10, 10, 15, 10, 10],
  },
  // Chuva moderada, dependente de previsão com boa chance: risco moderado, confiança média.
  moderado: {
    passado: [0, 4, 6, 10, 8, 5, 12],
    futuro: [18, 22, 5, 0, 0, 3, 0],
    probabilidade: [80, 80, 50, 20, 10, 30, 20],
  },
  // Muita chuva prevista com alta chance: risco alto, confiança média.
  alto: {
    passado: [2, 5, 8, 14, 20, 15, 25],
    futuro: [30, 32, 10, 3, 0, 0, 0],
    probabilidade: [90, 85, 60, 30, 20, 10, 10],
  },
  // Risco alto que depende de previsão com baixa chance de chuva: confiança baixa.
  alto_incerto: {
    passado: [0, 0, 2, 5, 8, 6, 10],
    futuro: [38, 30, 12, 0, 0, 0, 0],
    probabilidade: [35, 30, 25, 10, 10, 10, 10],
  },
  // Chuva forte já ocorrida (solo encharcado): risco severo, confiança alta.
  severo_observado: {
    passado: [0, 0, 10, 25, 38, 30, 22],
    futuro: [5, 2, 0, 0, 0, 0, 0],
    probabilidade: [40, 30, 10, 10, 10, 10, 10],
  },
};

// Qual perfil cada município usa na demonstração (fator multiplica a chuva do perfil).
const ATRIBUICAO: Record<string, { perfil: keyof typeof PERFIS; fator: number }> = {
  lajeado: { perfil: 'severo_observado', fator: 1 },
  estrela: { perfil: 'alto', fator: 1 },
  encantado: { perfil: 'alto_incerto', fator: 1 },
  'arroio-do-meio': { perfil: 'moderado', fator: 1 },
  'roca-sales': { perfil: 'moderado', fator: 0.9 },
  mucum: { perfil: 'calmo', fator: 3 },
  taquari: { perfil: 'calmo', fator: 1 },
  colinas: { perfil: 'calmo', fator: 2 },
  'cruzeiro-do-sul': { perfil: 'calmo', fator: 0.5 },
  'santa-clara-do-sul': { perfil: 'calmo', fator: 3 },
};

export function gerarSerieSintetica(municipio: Municipio, agora: Date): SerieClima {
  const { perfil, fator } = ATRIBUICAO[municipio.id] ?? { perfil: 'calmo', fator: 1 };
  const p = PERFIS[perfil];
  const hoje = hojeISO(agora);
  const arredondar = (mm: number) => Math.round(mm * fator * 10) / 10;

  const dias = [
    ...p.passado.map((mm, i) => ({
      data: somarDias(hoje, i - 7),
      chuvaMm: arredondar(mm),
      probabilidade: null,
    })),
    ...p.futuro.map((mm, i) => ({
      data: somarDias(hoje, i),
      chuvaMm: arredondar(mm),
      probabilidade: p.probabilidade[i],
    })),
  ];

  return { municipioId: municipio.id, dias, fonte: 'sintetico', atualizadoEm: agora.toISOString() };
}

export function gerarSeriesSinteticas(municipios: readonly Municipio[], agora: Date): SerieClima[] {
  return municipios.map((m) => gerarSerieSintetica(m, agora));
}
