import { buscarMunicipio } from './municipios';
import { ACOES_DECISAO, GRAVIDADES_RELATO, TIPOS_RELATO } from './tipos';

export type Erros<T extends string> = Partial<Record<T, string>>;

export interface ResultadoValidacao<Dados, Campo extends string> {
  valido: boolean;
  erros: Erros<Campo>;
  dados: Dados;
}

export const LIMITES = {
  local: { min: 3, max: 100 },
  descricaoRelato: { min: 10, max: 300 },
  justificativaDecisao: { min: 15, max: 300 },
};

function limpar(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ') : '';
}

// Privacidade: bloqueia texto que parece telefone, documento (8 ou mais dígitos) ou e-mail.
export function contemDadoPessoal(texto: string): boolean {
  const muitosDigitos = /(?:\d[\s.\-()]*){8,}/.test(texto);
  const email = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(texto);
  return muitosDigitos || email;
}

const MENSAGEM_DADO_PESSOAL =
  'Retire telefones, documentos e e-mails do texto. O app não guarda dados pessoais.';

// ---------- Relato de campo ----------
export type CampoRelato = 'municipioId' | 'local' | 'tipo' | 'gravidade' | 'descricao';

export interface EntradaRelato {
  municipioId: string;
  local: string;
  tipo: string;
  gravidade: string;
  descricao: string;
}

export function validarRelato(entrada: Partial<EntradaRelato>): ResultadoValidacao<EntradaRelato, CampoRelato> {
  const dados: EntradaRelato = {
    municipioId: limpar(entrada.municipioId),
    local: limpar(entrada.local),
    tipo: limpar(entrada.tipo),
    gravidade: limpar(entrada.gravidade),
    descricao: limpar(entrada.descricao),
  };
  const erros: Erros<CampoRelato> = {};

  if (!buscarMunicipio(dados.municipioId)) erros.municipioId = 'Escolha o município.';

  if (dados.local.length < LIMITES.local.min || dados.local.length > LIMITES.local.max) {
    erros.local = `Informe o bairro ou ponto de referência (${LIMITES.local.min} a ${LIMITES.local.max} caracteres).`;
  } else if (contemDadoPessoal(dados.local)) {
    erros.local = MENSAGEM_DADO_PESSOAL;
  }

  if (!TIPOS_RELATO.some((t) => t.valor === dados.tipo)) erros.tipo = 'Escolha o tipo de ocorrência.';
  if (!GRAVIDADES_RELATO.some((g) => g.valor === dados.gravidade)) erros.gravidade = 'Escolha a gravidade.';

  const d = LIMITES.descricaoRelato;
  if (dados.descricao.length < d.min || dados.descricao.length > d.max) {
    erros.descricao = `Descreva a situação (${d.min} a ${d.max} caracteres).`;
  } else if (contemDadoPessoal(dados.descricao)) {
    erros.descricao = MENSAGEM_DADO_PESSOAL;
  }

  return { valido: Object.keys(erros).length === 0, erros, dados };
}

// ---------- Decisão do gestor ----------
export type CampoDecisao = 'acao' | 'justificativa' | 'confirmacao';

export interface EntradaDecisao {
  acao: string;
  justificativa: string;
  confirmou: boolean;
}

// A decisão sempre exige justificativa escrita pelo gestor. Aprovar um aviso exige também
// a confirmação de que ele revisou nível, confiança e limitações (humano no controle).
export function validarDecisao(
  entrada: Partial<EntradaDecisao>
): ResultadoValidacao<EntradaDecisao, CampoDecisao> {
  const dados: EntradaDecisao = {
    acao: limpar(entrada.acao),
    justificativa: limpar(entrada.justificativa),
    confirmou: entrada.confirmou === true,
  };
  const erros: Erros<CampoDecisao> = {};

  if (!ACOES_DECISAO.some((a) => a.valor === dados.acao)) erros.acao = 'Escolha o que fazer com o alerta.';

  const j = LIMITES.justificativaDecisao;
  if (dados.justificativa.length < j.min || dados.justificativa.length > j.max) {
    erros.justificativa = `Explique o motivo da decisão (${j.min} a ${j.max} caracteres).`;
  } else if (contemDadoPessoal(dados.justificativa)) {
    erros.justificativa = MENSAGEM_DADO_PESSOAL;
  }

  if (dados.acao === 'aprovar' && !dados.confirmou) {
    erros.confirmacao = 'Confirme que você revisou o nível, a confiança e as limitações.';
  }

  return { valido: Object.keys(erros).length === 0, erros, dados };
}
