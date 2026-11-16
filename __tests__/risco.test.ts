import { MUNICIPIOS } from '../src/domain/municipios';
import {
  avaliarRisco,
  nivelPorChuva3d,
  ordenarPorRisco,
  subirNivel,
} from '../src/domain/risco';
import { DiaChuva, SerieClima } from '../src/domain/tipos';
import { somarDias } from '../src/domain/datas';
import { gerarSerieSintetica, gerarSeriesSinteticas } from '../src/services/sintetico';

const AGORA = new Date('2026-11-16T15:00:00Z'); // 12:00 em Brasília, dia 16/11
const HOJE = '2026-11-16';

// Monta uma série com 7 dias passados e 7 a partir de hoje.
function serie(passado: number[], futuro: number[], prob: number[], extra: Partial<SerieClima> = {}): SerieClima {
  const dias: DiaChuva[] = [
    ...passado.map((mm, i) => ({ data: somarDias(HOJE, i - 7), chuvaMm: mm, probabilidade: null })),
    ...futuro.map((mm, i) => ({ data: somarDias(HOJE, i), chuvaMm: mm, probabilidade: prob[i] ?? null })),
  ];
  return { municipioId: 'lajeado', dias, fonte: 'api', atualizadoEm: AGORA.toISOString(), ...extra };
}

const SEM_CHUVA = [0, 0, 0, 0, 0, 0, 0];

describe('nivelPorChuva3d', () => {
  it.each([
    [0, 'baixo'],
    [39.9, 'baixo'],
    [40, 'moderado'],
    [69.9, 'moderado'],
    [70, 'alto'],
    [110, 'severo'],
    [159, 'severo'],
    [160, 'extremo'],
    [400, 'extremo'],
  ])('%s mm -> %s', (mm, nivel) => {
    expect(nivelPorChuva3d(mm)).toBe(nivel);
  });

  it('subirNivel não passa de extremo', () => {
    expect(subirNivel('baixo')).toBe('moderado');
    expect(subirNivel('extremo')).toBe('extremo');
  });
});

describe('avaliarRisco', () => {
  it('chuva já observada e forte: nível alto, solo encharcado sobe para severo, confiança alta', () => {
    const a = avaliarRisco(serie([0, 0, 10, 25, 38, 30, 22], [5, 2, 0, 0, 0, 0, 0], [40, 30, 0, 0, 0, 0, 0]), AGORA);
    expect(a.nivelBase).toBe('alto');
    expect(a.nivel).toBe('severo');
    expect(a.confianca).toBe('alta');
    expect(a.metricas.pico3dMm).toBe(90);
    expect(a.metricas.passado7dMm).toBe(125);
    expect(a.justificativa.join(' ')).toContain('encharcado');
  });

  it('dependência de previsão com boa chance de chuva: confiança média', () => {
    const a = avaliarRisco(serie([2, 5, 8, 14, 20, 15, 25], [30, 32, 10, 3, 0, 0, 0], [90, 85, 60, 30, 20, 10, 10]), AGORA);
    expect(a.nivel).toBe('alto');
    expect(a.confianca).toBe('media');
    expect(a.metricas.previstoNoPicoMm).toBe(62);
    expect(a.limitacoes.join(' ')).toContain('Previsão de chuva perde precisão');
  });

  it('dependência de previsão com baixa chance de chuva: confiança baixa', () => {
    const a = avaliarRisco(serie([0, 0, 2, 5, 8, 6, 10], [38, 30, 12, 0, 0, 0, 0], [35, 30, 25, 10, 10, 10, 10]), AGORA);
    expect(a.nivel).toBe('alto');
    expect(a.confianca).toBe('baixa');
  });

  it('pouca chuva: risco baixo com confiança alta', () => {
    const a = avaliarRisco(serie([0, 1, 0, 2, 0, 0, 1], [0, 3, 0, 0, 1, 0, 0], [10, 20, 10, 10, 15, 10, 10]), AGORA);
    expect(a.nivel).toBe('baixo');
    expect(a.confianca).toBe('alta');
  });

  it('chuva extrema acima do que o estimador cobre: confiança baixa', () => {
    const a = avaliarRisco(serie([0, 0, 0, 0, 100, 90, 80], SEM_CHUVA, SEM_CHUVA), AGORA);
    expect(a.nivel).toBe('extremo');
    expect(a.confianca).toBe('baixa');
    expect(a.motivosConfianca.join(' ')).toContain('acima do que as faixas');
  });

  it('dia sem dado não vira zero: reduz a confiança e aparece nas limitações', () => {
    const s = serie([0, 0, 10, 25, 38, 30, 22], [5, 2, 0, 0, 0, 0, 0], SEM_CHUVA);
    s.dias[6] = { ...s.dias[6], chuvaMm: null };
    const a = avaliarRisco(s, AGORA);
    expect(a.confianca).toBe('baixa');
    expect(a.limitacoes.join(' ')).toContain('Faltam dados');
  });

  it('sem nenhum dado na janela: nível baixo, confiança baixa e mensagem clara', () => {
    const a = avaliarRisco({ municipioId: 'lajeado', dias: [], fonte: 'api', atualizadoEm: AGORA.toISOString() }, AGORA);
    expect(a.nivel).toBe('baixo');
    expect(a.confianca).toBe('baixa');
    expect(a.justificativa[0]).toContain('Não há dados');
  });

  it('dados guardados há mais de 12 horas: confiança baixa', () => {
    const antigo = new Date(AGORA.getTime() - 20 * 3_600_000).toISOString();
    const a = avaliarRisco(
      serie([0, 0, 10, 25, 38, 30, 22], [5, 2, 0, 0, 0, 0, 0], SEM_CHUVA, { fonte: 'cache', atualizadoEm: antigo }),
      AGORA
    );
    expect(a.confianca).toBe('baixa');
    expect(a.limitacoes.join(' ')).toContain('guardados no aparelho há 20 h');
  });

  it('dados guardados recentes: confiança limitada a média', () => {
    const a = avaliarRisco(
      serie([0, 0, 10, 25, 38, 30, 22], [5, 2, 0, 0, 0, 0, 0], SEM_CHUVA, { fonte: 'cache' }),
      AGORA
    );
    expect(a.confianca).toBe('media');
  });

  it('dados sintéticos aparecem como limitação', () => {
    const a = avaliarRisco(serie(SEM_CHUVA, SEM_CHUVA, SEM_CHUVA, { fonte: 'sintetico' }), AGORA);
    expect(a.limitacoes.join(' ')).toContain('sintéticos');
  });

  it('o id do alerta muda quando o nível muda no mesmo dia', () => {
    const calmo = avaliarRisco(serie(SEM_CHUVA, SEM_CHUVA, SEM_CHUVA), AGORA);
    const forte = avaliarRisco(serie([0, 0, 0, 0, 50, 50, 50], SEM_CHUVA, SEM_CHUVA), AGORA);
    expect(calmo.alertaId).toBe('lajeado:2026-11-16:baixo');
    expect(forte.alertaId).not.toBe(calmo.alertaId);
  });

  it('toda avaliação traz justificativa, limitações e sugestão', () => {
    const a = avaliarRisco(serie(SEM_CHUVA, SEM_CHUVA, SEM_CHUVA), AGORA);
    expect(a.justificativa.length).toBeGreaterThan(0);
    expect(a.limitacoes.length).toBeGreaterThanOrEqual(3);
    expect(a.sugestao.length).toBeGreaterThan(0);
  });
});

describe('cenário de demonstração (dados sintéticos)', () => {
  const resultado = Object.fromEntries(
    gerarSeriesSinteticas(MUNICIPIOS, AGORA).map((s) => {
      const a = avaliarRisco(s, AGORA);
      return [s.municipioId, `${a.nivel}/${a.confianca}`];
    })
  );

  it('cobre vários níveis e confianças, de forma estável', () => {
    expect(resultado).toEqual({
      lajeado: 'severo/alta',
      estrela: 'alto/media',
      encantado: 'alto/baixa',
      'arroio-do-meio': 'moderado/media',
      'roca-sales': 'moderado/media',
      mucum: 'baixo/alta',
      taquari: 'baixo/alta',
      colinas: 'baixo/alta',
      'cruzeiro-do-sul': 'baixo/alta',
      'santa-clara-do-sul': 'baixo/alta',
    });
  });

  it('a série sintética tem 14 dias consecutivos terminando 6 dias depois de hoje', () => {
    const s = gerarSerieSintetica(MUNICIPIOS[0], AGORA);
    expect(s.dias).toHaveLength(14);
    expect(s.dias[0].data).toBe('2026-11-09');
    expect(s.dias[7].data).toBe('2026-11-16');
    expect(s.dias[13].data).toBe('2026-11-22');
    expect(s.fonte).toBe('sintetico');
  });

  it('ordenarPorRisco coloca o município mais grave primeiro', () => {
    const avaliacoes = gerarSeriesSinteticas(MUNICIPIOS, AGORA).map((s) => avaliarRisco(s, AGORA));
    const ordenadas = ordenarPorRisco(avaliacoes);
    expect(ordenadas[0].municipioId).toBe('lajeado');
    expect(ordenadas[ordenadas.length - 1].nivel).toBe('baixo');
  });
});
