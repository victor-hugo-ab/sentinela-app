import { Avaliacao, Decisao, NIVEIS, NivelRisco } from '../domain/tipos';
import { indiceDoNivel } from '../domain/risco';

// Cálculos sobre o estado, separados das telas para poderem ser testados.

export function contarPorNivel(avaliacoes: Avaliacao[]): Record<NivelRisco, number> {
  const contagem = Object.fromEntries(NIVEIS.map((n) => [n, 0])) as Record<NivelRisco, number>;
  for (const a of avaliacoes) contagem[a.nivel]++;
  return contagem;
}

// As decisões são guardadas da mais nova para a mais antiga; a primeira que bate é a mais recente.
export function decisaoMaisRecente(decisoes: Decisao[], alertaId: string): Decisao | undefined {
  return decisoes.find((d) => d.alertaId === alertaId);
}

export function decisoesDoAlerta(decisoes: Decisao[], alertaId: string): Decisao[] {
  return decisoes.filter((d) => d.alertaId === alertaId);
}

const INDICE_ALTO = indiceDoNivel('alto');

export interface ResumoPainel {
  emAlerta: number; // municípios em nível alto ou acima
  pendentes: number; // desses, quantos ainda não têm decisão do gestor
  maiorChuva: { mm: number; municipioId: string } | null;
}

export function resumirPainel(avaliacoes: Avaliacao[], decisoes: Decisao[]): ResumoPainel {
  const graves = avaliacoes.filter((a) => indiceDoNivel(a.nivel) >= INDICE_ALTO);
  const pendentes = graves.filter((a) => !decisaoMaisRecente(decisoes, a.alertaId)).length;
  const maior = avaliacoes.reduce<Avaliacao | null>(
    (m, a) => (m === null || a.metricas.pico3dMm > m.metricas.pico3dMm ? a : m),
    null
  );
  return {
    emAlerta: graves.length,
    pendentes,
    maiorChuva: maior ? { mm: maior.metricas.pico3dMm, municipioId: maior.municipioId } : null,
  };
}
