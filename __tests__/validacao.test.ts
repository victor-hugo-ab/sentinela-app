import { contemDadoPessoal, validarDecisao, validarRelato } from '../src/domain/validacao';

const relatoValido = {
  municipioId: 'lajeado',
  local: 'Bairro Centro',
  tipo: 'alagamento',
  gravidade: 'alta',
  descricao: 'Água entrando nas lojas da rua principal.',
};

describe('validarRelato', () => {
  it('aceita um relato completo e limpa os espaços', () => {
    const r = validarRelato({ ...relatoValido, local: '  Bairro    Centro ' });
    expect(r.valido).toBe(true);
    expect(r.dados.local).toBe('Bairro Centro');
  });

  it('devolve um erro por campo vazio', () => {
    const r = validarRelato({});
    expect(r.valido).toBe(false);
    expect(Object.keys(r.erros).sort()).toEqual(['descricao', 'gravidade', 'local', 'municipioId', 'tipo']);
  });

  it('rejeita município, tipo e gravidade fora das listas', () => {
    const r = validarRelato({ ...relatoValido, municipioId: 'gotham', tipo: 'x', gravidade: 'enorme' });
    expect(r.erros.municipioId && r.erros.tipo && r.erros.gravidade).toBeTruthy();
  });

  it('rejeita descrição curta e longa demais', () => {
    expect(validarRelato({ ...relatoValido, descricao: 'curta' }).erros.descricao).toBeTruthy();
    expect(validarRelato({ ...relatoValido, descricao: 'a'.repeat(301) }).erros.descricao).toBeTruthy();
  });

  it('bloqueia dados pessoais no texto', () => {
    const r = validarRelato({ ...relatoValido, descricao: 'Chamem o João no (51) 99876-5432, ele está ilhado.' });
    expect(r.valido).toBe(false);
    expect(r.erros.descricao).toContain('dados pessoais');
  });
});

describe('contemDadoPessoal', () => {
  it.each([
    ['ligue 51 99876-5432', true],
    ['CPF 123.456.789-09', true],
    ['fulano@email.com', true],
    ['Rua 15 de Novembro, 1234', false],
    ['km 4 da estrada geral', false],
    ['água na altura de 80 cm', false],
  ])('%s -> %s', (texto, esperado) => {
    expect(contemDadoPessoal(texto)).toBe(esperado);
  });
});

describe('validarDecisao', () => {
  const ok = { acao: 'observar', justificativa: 'Aguardar a próxima atualização da previsão.', confirmou: false };

  it('aceita observar ou descartar sem confirmação', () => {
    expect(validarDecisao(ok).valido).toBe(true);
    expect(validarDecisao({ ...ok, acao: 'descartar' }).valido).toBe(true);
  });

  it('exige justificativa escrita', () => {
    const r = validarDecisao({ ...ok, justificativa: 'ok' });
    expect(r.valido).toBe(false);
    expect(r.erros.justificativa).toBeTruthy();
  });

  it('aprovar aviso exige a confirmação de revisão', () => {
    const sem = validarDecisao({ ...ok, acao: 'aprovar', confirmou: false });
    expect(sem.valido).toBe(false);
    expect(sem.erros.confirmacao).toBeTruthy();
    expect(validarDecisao({ ...ok, acao: 'aprovar', confirmou: true }).valido).toBe(true);
  });

  it('exige escolher uma ação válida', () => {
    expect(validarDecisao({ ...ok, acao: 'enviar_sozinho' }).erros.acao).toBeTruthy();
  });
});
