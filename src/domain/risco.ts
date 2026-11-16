import { formatarDiaMes, formatarMm, hojeISO, somarDias } from './datas';
import {
  Avaliacao,
  Confianca,
  DiaChuva,
  NIVEIS,
  NivelRisco,
  ROTULO_NIVEL,
  SerieClima,
} from './tipos';

// ---------------------------------------------------------------------------
// Regras do estimador de risco de alagamento.
//
// É uma regra simples e explicável (parecida com a "regra de comparação" do Sentinela),
// não um modelo treinado. Os limiares abaixo são ILUSTRATIVOS do protótipo: precisam ser
// calibrados com o modelo do Sentinela e o histórico de alagamentos antes de qualquer uso real.
// ---------------------------------------------------------------------------

// Chuva acumulada em 3 dias (mm) -> nível. Do maior para o menor.
export const LIMIARES_3D: ReadonlyArray<{ minimo: number; nivel: NivelRisco; faixa: string }> = [
  { minimo: 160, nivel: 'extremo', faixa: '160 mm ou mais' },
  { minimo: 110, nivel: 'severo', faixa: '110 a 160 mm' },
  { minimo: 70, nivel: 'alto', faixa: '70 a 110 mm' },
  { minimo: 40, nivel: 'moderado', faixa: '40 a 70 mm' },
  { minimo: 0, nivel: 'baixo', faixa: 'abaixo de 40 mm' },
];

export const LIMITE_SOLO_ENCHARCADO_7D = 100; // mm nos 7 dias anteriores sobe o nível em 1 grau
export const LIMITE_FORA_DO_HISTORICO_3D = 250; // mm: acima disso o estimador não é confiável
export const HORAS_CACHE_VALIDO = 12;
export const PROBABILIDADE_CONFIAVEL = 60; // % média de chance de chuva nos dias previstos
export const PARTE_PREVISTA_TOLERADA = 1 / 3;
export const FOLGA_NIVEL_BAIXO_MM = 20; // metade do limiar do nível moderado

const SUGESTOES: Record<NivelRisco, string> = {
  baixo: 'Sem ação necessária agora. Seguir acompanhando o painel.',
  moderado: 'Acompanhar de perto e conferir se as equipes estão de sobreaviso.',
  alto: 'Avaliar um aviso preventivo à população e a prontidão dos abrigos.',
  severo: 'Avaliar aviso imediato, abrigos abertos e apoio às áreas de maior risco.',
  extremo: 'Avaliar a ativação do protocolo de emergência junto à defesa civil estadual.',
};

export function nivelPorChuva3d(mm: number): NivelRisco {
  return (LIMIARES_3D.find((l) => mm >= l.minimo) ?? LIMIARES_3D[LIMIARES_3D.length - 1]).nivel;
}

export function faixaDoNivel(nivel: NivelRisco): string {
  return LIMIARES_3D.find((l) => l.nivel === nivel)?.faixa ?? '';
}

export function subirNivel(nivel: NivelRisco): NivelRisco {
  const i = NIVEIS.indexOf(nivel);
  return NIVEIS[Math.min(i + 1, NIVEIS.length - 1)];
}

export function indiceDoNivel(nivel: NivelRisco): number {
  return NIVEIS.indexOf(nivel);
}

interface Janela {
  soma: number;
  faltantes: number; // dias sem dado de chuva na janela
  inicio: string;
  fim: string;
  previstoMm: number; // parte da soma que é previsão (hoje ou depois)
  probabilidades: number[];
}

// Soma a chuva dos "tamanho" dias que terminam em "fim". Dia sem dado não vira zero: conta como faltante.
function janela(porData: Map<string, DiaChuva>, fim: string, tamanho: number, dataBase: string): Janela {
  const inicio = somarDias(fim, -(tamanho - 1));
  const resultado: Janela = { soma: 0, faltantes: 0, inicio, fim, previstoMm: 0, probabilidades: [] };

  for (let i = 0; i < tamanho; i++) {
    const data = somarDias(inicio, i);
    const dia = porData.get(data);
    if (!dia || dia.chuvaMm === null) {
      resultado.faltantes++;
      continue;
    }
    resultado.soma += dia.chuvaMm;
    if (data >= dataBase) {
      resultado.previstoMm += dia.chuvaMm;
      if (dia.probabilidade !== null) resultado.probabilidades.push(dia.probabilidade);
    }
  }
  return resultado;
}

const media = (valores: number[]) => valores.reduce((a, b) => a + b, 0) / valores.length;

// Analisa a série de chuva de um município e devolve nível, confiança, justificativa e limitações.
// "agora" só serve para medir a idade dos dados guardados no aparelho.
export function avaliarRisco(serie: SerieClima, agora: Date): Avaliacao {
  // "Hoje" é o dia em que os dados foram coletados, não o dia em que o app foi aberto.
  const dataBase = hojeISO(new Date(serie.atualizadoEm));
  const porData = new Map(serie.dias.map((d) => [d.data, d]));

  // Janelas de 3 dias que terminam entre ontem e daqui a 2 dias. O pico é a maior delas.
  const candidatas = [-1, 0, 1, 2].map((deslocamento) =>
    janela(porData, somarDias(dataBase, deslocamento), 3, dataBase)
  );
  const pico = candidatas.reduce((maior, atual) => (atual.soma > maior.soma ? atual : maior));
  const passado3d = janela(porData, somarDias(dataBase, -1), 3, dataBase);
  const passado7d = janela(porData, somarDias(dataBase, -1), 7, dataBase);
  const proximos3d = janela(porData, somarDias(dataBase, 2), 3, dataBase);

  const semDados = pico.faltantes === 3;
  const nivelBase = semDados ? 'baixo' : nivelPorChuva3d(pico.soma);
  const soloEncharcado = !semDados && passado7d.soma >= LIMITE_SOLO_ENCHARCADO_7D;
  const nivel = soloEncharcado ? subirNivel(nivelBase) : nivelBase;

  // ---------- Justificativa ----------
  const justificativa: string[] = [];
  if (semDados) {
    justificativa.push('Não há dados de chuva suficientes para estimar o risco deste município.');
  } else {
    justificativa.push(
      `Maior acumulado de 3 dias entre ontem e daqui a 2 dias: ${formatarMm(pico.soma)} mm ` +
        `(${formatarDiaMes(pico.inicio)} a ${formatarDiaMes(pico.fim)}), faixa de risco ${ROTULO_NIVEL[nivelBase].toLowerCase()} (${faixaDoNivel(nivelBase)}).`
    );
    justificativa.push(
      `Chuva nos 7 dias anteriores: ${formatarMm(passado7d.soma)} mm.` +
        (soloEncharcado
          ? ` Com ${LIMITE_SOLO_ENCHARCADO_7D} mm ou mais, o solo tende a estar encharcado e o nível subiu um grau, para ${ROTULO_NIVEL[nivel].toLowerCase()}.`
          : '')
    );
    if (pico.previstoMm > 0) {
      const mediaProb = pico.probabilidades.length ? Math.round(media(pico.probabilidades)) : null;
      justificativa.push(
        `Desse acumulado, ${formatarMm(pico.previstoMm)} mm ainda são previsão` +
          (mediaProb === null ? '.' : ` (chance média de chuva de ${mediaProb}%).`)
      );
    }
  }

  // ---------- Confiança ----------
  const motivosConfianca: string[] = [];
  let confianca: Confianca;
  const idadeHoras = (agora.getTime() - new Date(serie.atualizadoEm).getTime()) / 3_600_000;
  const parteDaPrevisao = pico.soma > 0 ? pico.previstoMm / pico.soma : 0;

  if (semDados || pico.faltantes > 0) {
    confianca = 'baixa';
    motivosConfianca.push('Faltam dados de chuva na janela analisada.');
  } else if (pico.soma > LIMITE_FORA_DO_HISTORICO_3D) {
    confianca = 'baixa';
    motivosConfianca.push('A chuva está acima do que as faixas do estimador cobrem; o resultado é incerto.');
  } else if (serie.fonte === 'cache' && idadeHoras > HORAS_CACHE_VALIDO) {
    confianca = 'baixa';
    motivosConfianca.push(`Os dados têm mais de ${HORAS_CACHE_VALIDO} horas e a previsão pode ter mudado.`);
  } else if (nivel === 'baixo' && pico.soma <= FOLGA_NIVEL_BAIXO_MM) {
    confianca = 'alta';
    motivosConfianca.push('Mesmo com a incerteza da previsão, o acumulado fica bem abaixo da faixa de risco.');
  } else if (parteDaPrevisao <= PARTE_PREVISTA_TOLERADA) {
    confianca = 'alta';
    motivosConfianca.push('A maior parte do acumulado já é chuva observada, não previsão.');
  } else {
    const mediaProb = pico.probabilidades.length ? media(pico.probabilidades) : null;
    if (mediaProb !== null && mediaProb < PROBABILIDADE_CONFIAVEL) {
      confianca = 'baixa';
      motivosConfianca.push(
        `Boa parte do acumulado depende da previsão e a chance média de chuva é de ${Math.round(mediaProb)}%.`
      );
    } else {
      confianca = 'media';
      motivosConfianca.push(
        mediaProb === null
          ? 'Parte do acumulado depende da previsão, sem probabilidade informada.'
          : `Parte do acumulado depende da previsão, com chance média de chuva de ${Math.round(mediaProb)}%.`
      );
    }
  }
  // Dados guardados no aparelho (mesmo recentes) nunca passam de confiança média.
  if (serie.fonte === 'cache' && confianca === 'alta') {
    confianca = 'media';
    motivosConfianca.push('Os dados vêm do aparelho (sem conexão), então a confiança é limitada a média.');
  }

  // ---------- Limitações ----------
  const limitacoes: string[] = [
    'Considera só a chuva. Não inclui nível do rio, relevo, drenagem urbana nem operação de barragens.',
    'Os limiares de chuva são ilustrativos do protótipo e precisam ser calibrados com o histórico de alagamentos.',
    'A chuva vem de grade de cerca de 10 km e pode diferir do que choveu de fato no município.',
  ];
  if (pico.previstoMm > 0) {
    limitacoes.push('Previsão de chuva perde precisão a cada dia à frente; o quadro pode mudar nas próximas atualizações.');
  }
  if (serie.fonte === 'sintetico') {
    limitacoes.push('Dados sintéticos de demonstração: não representam o tempo real.');
  }
  if (serie.fonte === 'cache') {
    limitacoes.push(`Dados guardados no aparelho há ${Math.max(0, Math.round(idadeHoras))} h, sem conexão com a fonte.`);
  }
  if (pico.faltantes > 0) {
    limitacoes.push(`Faltam dados de chuva em ${pico.faltantes} dia(s) da janela analisada.`);
  }

  return {
    alertaId: `${serie.municipioId}:${dataBase}:${nivel}`,
    municipioId: serie.municipioId,
    nivel,
    nivelBase,
    confianca,
    motivosConfianca,
    justificativa,
    limitacoes,
    sugestao: SUGESTOES[nivel],
    metricas: {
      pico3dMm: pico.soma,
      janelaInicio: pico.inicio,
      janelaFim: pico.fim,
      passado3dMm: passado3d.soma,
      passado7dMm: passado7d.soma,
      proximos3dMm: proximos3d.soma,
      previstoNoPicoMm: pico.previstoMm,
    },
    dataBase,
    fonte: serie.fonte,
    atualizadoEm: serie.atualizadoEm,
  };
}

// Ordena do mais grave para o menos grave (empate: maior chuva primeiro).
export function ordenarPorRisco(avaliacoes: Avaliacao[]): Avaliacao[] {
  return [...avaliacoes].sort(
    (a, b) => indiceDoNivel(b.nivel) - indiceDoNivel(a.nivel) || b.metricas.pico3dMm - a.metricas.pico3dMm
  );
}
