import { MUNICIPIOS } from '../src/domain/municipios';
import { avaliarRisco } from '../src/domain/risco';
import { Decisao } from '../src/domain/tipos';
import { gerarSeriesSinteticas } from '../src/services/sintetico';
import { estadoInicial, reducer } from '../src/state/reducer';
import { contarPorNivel, decisaoMaisRecente, decisoesDoAlerta, resumirPainel } from '../src/state/seletores';

const AGORA = new Date('2026-11-16T15:00:00Z');
const avaliacoes = gerarSeriesSinteticas(MUNICIPIOS, AGORA).map((s) => avaliarRisco(s, AGORA));

const decisao = (alertaId: string, id = 'd1'): Decisao => ({
  id,
  alertaId,
  municipioId: alertaId.split(':')[0],
  nivel: 'severo',
  confianca: 'alta',
  acao: 'aprovar',
  justificativa: 'Chuva já ocorrida e solo encharcado.',
  criadaEm: '2026-11-16T15:05:00Z',
});

describe('seletores', () => {
  it('conta municípios por nível, incluindo níveis com zero', () => {
    expect(contarPorNivel(avaliacoes)).toEqual({ baixo: 5, moderado: 2, alto: 2, severo: 1, extremo: 0 });
  });

  it('resume o painel: alertas altos, pendentes e maior chuva', () => {
    const r = resumirPainel(avaliacoes, []);
    expect(r.emAlerta).toBe(3); // lajeado (severo), estrela e encantado (alto)
    expect(r.pendentes).toBe(3);
    expect(r.maiorChuva?.municipioId).toBe('lajeado');
  });

  it('uma decisão tira o alerta da lista de pendentes', () => {
    const lajeado = avaliacoes.find((a) => a.municipioId === 'lajeado')!;
    const r = resumirPainel(avaliacoes, [decisao(lajeado.alertaId)]);
    expect(r.pendentes).toBe(2);
  });

  it('decisão de um nível antigo não vale para o alerta novo', () => {
    const lajeado = avaliacoes.find((a) => a.municipioId === 'lajeado')!;
    const antiga = decisao('lajeado:2026-11-16:moderado');
    expect(decisaoMaisRecente([antiga], lajeado.alertaId)).toBeUndefined();
  });

  it('devolve a decisão mais recente e todo o histórico do alerta', () => {
    const id = 'lajeado:2026-11-16:severo';
    const lista = [decisao(id, 'novo'), decisao('estrela:2026-11-16:alto', 'outro'), decisao(id, 'velho')];
    expect(decisaoMaisRecente(lista, id)?.id).toBe('novo');
    expect(decisoesDoAlerta(lista, id).map((d) => d.id)).toEqual(['novo', 'velho']);
  });

  it('lista vazia não quebra o resumo', () => {
    expect(resumirPainel([], [])).toEqual({ emAlerta: 0, pendentes: 0, maiorChuva: null });
  });
});

describe('reducer: remover relato', () => {
  it('remove só o relato pedido', () => {
    const base = { municipioId: 'lajeado', local: 'Centro', tipo: 'alagamento', gravidade: 'alta', descricao: 'Água na rua.', criadoEm: 'x' } as const;
    let e = reducer(estadoInicial, { tipo: 'ADICIONAR_RELATO', relato: { ...base, id: 'a' } });
    e = reducer(e, { tipo: 'ADICIONAR_RELATO', relato: { ...base, id: 'b' } });
    e = reducer(e, { tipo: 'REMOVER_RELATO', id: 'a' });
    expect(e.relatos.map((r) => r.id)).toEqual(['b']);
  });
});
