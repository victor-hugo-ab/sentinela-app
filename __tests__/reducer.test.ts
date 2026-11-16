import { estadoInicial, reducer } from '../src/state/reducer';
import { Decisao, Relato } from '../src/domain/tipos';

const relato: Relato = {
  id: 'r1',
  municipioId: 'lajeado',
  local: 'Centro',
  tipo: 'alagamento',
  gravidade: 'alta',
  descricao: 'Água na rua principal.',
  criadoEm: '2026-11-16T15:00:00Z',
};
const decisao: Decisao = {
  id: 'd1',
  alertaId: 'lajeado:2026-11-16:severo',
  municipioId: 'lajeado',
  nivel: 'severo',
  confianca: 'alta',
  acao: 'aprovar',
  justificativa: 'Chuva já ocorrida e solo encharcado.',
  criadaEm: '2026-11-16T15:05:00Z',
};

describe('reducer', () => {
  it('começa sem hidratar, no município piloto', () => {
    expect(estadoInicial.hidratado).toBe(false);
    expect(estadoInicial.config.municipioId).toBe('lajeado');
  });

  it('HIDRATAR aplica o que estava salvo', () => {
    const e = reducer(estadoInicial, {
      tipo: 'HIDRATAR',
      salvo: { config: { modoDemo: true, municipioId: 'estrela' }, relatos: [relato], decisoes: [decisao] },
    });
    expect(e.hidratado).toBe(true);
    expect(e.config).toEqual({ modoDemo: true, municipioId: 'estrela' });
    expect(e.relatos).toHaveLength(1);
    expect(e.decisoes).toHaveLength(1);
  });

  it('HIDRATAR sem nada salvo só marca como hidratado', () => {
    const e = reducer(estadoInicial, { tipo: 'HIDRATAR', salvo: null });
    expect(e.hidratado).toBe(true);
    expect(e.relatos).toEqual([]);
  });

  it('adiciona relatos e decisões no começo da lista', () => {
    let e = reducer(estadoInicial, { tipo: 'ADICIONAR_RELATO', relato });
    e = reducer(e, { tipo: 'ADICIONAR_RELATO', relato: { ...relato, id: 'r2' } });
    expect(e.relatos.map((r) => r.id)).toEqual(['r2', 'r1']);
    e = reducer(e, { tipo: 'REGISTRAR_DECISAO', decisao });
    expect(e.decisoes[0].id).toBe('d1');
  });

  it('troca município e modo demonstração', () => {
    let e = reducer(estadoInicial, { tipo: 'ESCOLHER_MUNICIPIO', municipioId: 'taquari' });
    e = reducer(e, { tipo: 'DEFINIR_MODO_DEMO', ativo: true });
    expect(e.config).toEqual({ modoDemo: true, municipioId: 'taquari' });
  });

  it('controla o status do clima', () => {
    let e = reducer(estadoInicial, { tipo: 'CLIMA_ERRO', erro: 'falhou' });
    expect(e.clima.status).toBe('erro');
    expect(e.clima.erro).toBe('falhou');
    e = reducer(e, { tipo: 'CLIMA_CARREGANDO' });
    expect(e.clima.status).toBe('carregando');
    expect(e.clima.erro).toBeNull();
    e = reducer(e, { tipo: 'CLIMA_OK', series: [], avaliadoEm: '2026-11-16T15:00:00Z', aviso: 'aviso' });
    expect(e.clima.status).toBe('ok');
    expect(e.clima.aviso).toBe('aviso');
  });

  it('APAGAR_DADOS limpa relatos, decisões e configurações, mas mantém o clima na tela', () => {
    let e = reducer(estadoInicial, { tipo: 'ADICIONAR_RELATO', relato });
    e = reducer(e, { tipo: 'CLIMA_OK', series: [], avaliadoEm: 'x', aviso: null });
    e = reducer(e, { tipo: 'APAGAR_DADOS' });
    expect(e.relatos).toEqual([]);
    expect(e.decisoes).toEqual([]);
    expect(e.clima.status).toBe('ok');
  });
});
