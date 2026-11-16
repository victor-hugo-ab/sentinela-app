import { MUNICIPIOS } from '../src/domain/municipios';
import { buscarClima, converterResposta, ErroClima, montarUrl } from '../src/services/clima';
import { formatarDataHora, formatarDiaMes, formatarMm, hojeISO, somarDias } from '../src/domain/datas';

const AGORA = new Date('2026-11-16T15:00:00Z');
const DOIS = MUNICIPIOS.slice(0, 2);

const respostaApi = (chuva: Array<number | null>) => ({
  daily: {
    time: chuva.map((_, i) => somarDias('2026-11-09', i)),
    precipitation_sum: chuva,
    precipitation_probability_max: chuva.map(() => 50),
  },
});

describe('montarUrl', () => {
  it('pede todos os municípios em uma chamada, com 7 dias passados e 7 futuros', () => {
    const url = montarUrl(DOIS);
    expect(url).toContain('https://api.open-meteo.com/v1/forecast');
    expect(url).toContain('latitude=-29.4669,-29.5008');
    expect(url).toContain('longitude=-51.9614,-51.9658');
    expect(url).toContain('past_days=7');
    expect(url).toContain('forecast_days=7');
    expect(url).toContain('precipitation_sum');
  });
});

describe('converterResposta', () => {
  it('converte uma lista (vários municípios)', () => {
    const series = converterResposta([respostaApi([1, 2, 3]), respostaApi([4, 5, 6])], DOIS, AGORA);
    expect(series).toHaveLength(2);
    expect(series[0]).toMatchObject({ municipioId: 'lajeado', fonte: 'api' });
    expect(series[1].dias[2]).toEqual({ data: '2026-11-11', chuvaMm: 6, probabilidade: 50 });
  });

  it('aceita um objeto único quando só há um município', () => {
    expect(converterResposta(respostaApi([1, 2]), [DOIS[0]], AGORA)).toHaveLength(1);
  });

  it('valores ausentes ou inválidos viram null, nunca zero', () => {
    const [serie] = converterResposta(respostaApi([null, -5, 7]), [DOIS[0]], AGORA);
    expect(serie.dias.map((d) => d.chuvaMm)).toEqual([null, null, 7]);
  });

  it('rejeita resposta fora do formato', () => {
    expect(() => converterResposta({ erro: true }, [DOIS[0]], AGORA)).toThrow(ErroClima);
    expect(() => converterResposta([respostaApi([1])], DOIS, AGORA)).toThrow(ErroClima);
  });
});

describe('buscarClima', () => {
  it('devolve as séries quando a fonte responde', async () => {
    const buscar = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [respostaApi([1]), respostaApi([2])],
    });
    const series = await buscarClima(DOIS, AGORA, buscar);
    expect(series).toHaveLength(2);
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it('transforma erro HTTP em ErroClima com mensagem clara', async () => {
    const buscar = jest.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
    await expect(buscarClima(DOIS, AGORA, buscar)).rejects.toThrow('respondeu com erro (429)');
  });

  it('transforma falha de rede em ErroClima', async () => {
    const buscar = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    await expect(buscarClima(DOIS, AGORA, buscar)).rejects.toThrow('Verifique a conexão');
  });
});

describe('datas', () => {
  it('hojeISO usa o horário de Brasília (UTC-3)', () => {
    expect(hojeISO(new Date('2026-11-17T01:30:00Z'))).toBe('2026-11-16');
    expect(hojeISO(new Date('2026-11-17T03:00:00Z'))).toBe('2026-11-17');
  });

  it('somarDias atravessa mês e ano', () => {
    expect(somarDias('2026-11-30', 1)).toBe('2026-12-01');
    expect(somarDias('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('formata dia/mês, data e hora e milímetros', () => {
    expect(formatarDiaMes('2026-11-16')).toBe('16/11');
    expect(formatarDataHora('2026-11-16T21:07:00Z')).toBe('16/11 às 18:07');
    expect(formatarMm(7.46)).toBe('7,5');
    expect(formatarMm(87)).toBe('87');
    expect(formatarMm(46.8)).toBe('47');
  });
});
