import { Municipio, SerieClima, DiaChuva } from '../domain/tipos';

// Fonte pública: Open-Meteo (https://open-meteo.com), sem chave de API.
// Pedimos os 7 dias anteriores e os 7 próximos, em uma única chamada para todos os municípios.
const URL_BASE = 'https://api.open-meteo.com/v1/forecast';
export const TEMPO_LIMITE_MS = 12_000;

export class ErroClima extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroClima';
  }
}

export function montarUrl(municipios: readonly Municipio[]): string {
  const latitudes = municipios.map((m) => m.latitude).join(',');
  const longitudes = municipios.map((m) => m.longitude).join(',');
  const parametros = [
    `latitude=${latitudes}`,
    `longitude=${longitudes}`,
    'daily=precipitation_sum,precipitation_probability_max',
    'past_days=7',
    'forecast_days=7',
    'timezone=America%2FSao_Paulo',
  ];
  return `${URL_BASE}?${parametros.join('&')}`;
}

// Número válido ou null: valores ausentes ou estranhos nunca viram zero.
function numeroOuNulo(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 ? valor : null;
}

function converterUm(resposta: unknown, municipio: Municipio, agora: Date): SerieClima {
  const diario = (resposta as { daily?: Record<string, unknown> } | null)?.daily;
  const datas = diario?.time;
  const chuva = diario?.precipitation_sum;
  const probabilidade = diario?.precipitation_probability_max;

  if (!Array.isArray(datas) || !Array.isArray(chuva) || datas.length !== chuva.length || datas.length === 0) {
    throw new ErroClima(`Resposta inesperada da fonte de dados para ${municipio.nome}.`);
  }

  const dias: DiaChuva[] = datas.map((data, i) => ({
    data: String(data),
    chuvaMm: numeroOuNulo(chuva[i]),
    probabilidade: Array.isArray(probabilidade) ? numeroOuNulo(probabilidade[i]) : null,
  }));

  return { municipioId: municipio.id, dias, fonte: 'api', atualizadoEm: agora.toISOString() };
}

// Com várias coordenadas a API devolve uma lista; com uma só, um objeto.
export function converterResposta(json: unknown, municipios: readonly Municipio[], agora: Date): SerieClima[] {
  const lista = Array.isArray(json) ? json : [json];
  if (lista.length !== municipios.length) {
    throw new ErroClima('A fonte de dados devolveu uma quantidade inesperada de municípios.');
  }
  return municipios.map((m, i) => converterUm(lista[i], m, agora));
}

type Buscar = (url: string, init?: { signal?: AbortSignal }) => Promise<Pick<Response, 'ok' | 'status' | 'json'>>;

export async function buscarClima(
  municipios: readonly Municipio[],
  agora: Date = new Date(),
  buscar: Buscar = fetch as unknown as Buscar
): Promise<SerieClima[]> {
  const controle = new AbortController();
  const cronometro = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  try {
    const resposta = await buscar(montarUrl(municipios), { signal: controle.signal });
    if (!resposta.ok) throw new ErroClima(`A fonte de dados respondeu com erro (${resposta.status}).`);
    return converterResposta(await resposta.json(), municipios, agora);
  } catch (erro) {
    if (erro instanceof ErroClima) throw erro;
    throw new ErroClima('Não foi possível acessar a fonte de dados. Verifique a conexão.');
  } finally {
    clearTimeout(cronometro);
  }
}
