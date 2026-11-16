// Funções de data sem Intl: o Brasil não tem horário de verão desde 2019, então
// o horário de Brasília é sempre UTC-3. Isso evita depender do suporte a fusos do aparelho.

const DESLOCAMENTO_BRASILIA_MS = -3 * 60 * 60 * 1000;

// "Hoje" no horário de Brasília, como YYYY-MM-DD.
export function hojeISO(agora: Date): string {
  return new Date(agora.getTime() + DESLOCAMENTO_BRASILIA_MS).toISOString().slice(0, 10);
}

// Soma (ou subtrai) dias de uma data YYYY-MM-DD.
export function somarDias(dataISO: string, dias: number): string {
  const d = new Date(`${dataISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// "2026-11-16" -> "16/11"
export function formatarDiaMes(dataISO: string): string {
  const [, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}`;
}

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

// "2026-11-16" -> "seg"
export function diaDaSemana(dataISO: string): string {
  return DIAS_SEMANA[new Date(`${dataISO}T00:00:00Z`).getUTCDay()];
}

// ISO -> "16/11 às 18:07" no horário de Brasília
export function formatarDataHora(iso: string): string {
  const d = new Date(new Date(iso).getTime() + DESLOCAMENTO_BRASILIA_MS);
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const hora = String(d.getUTCHours()).padStart(2, '0');
  const minuto = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dia}/${mes} às ${hora}:${minuto}`;
}

// Número com vírgula decimal, sem casas inúteis: 12 -> "12", 7.46 -> "7,5".
export function formatarMm(valor: number): string {
  const arredondado = valor >= 10 ? Math.round(valor) : Math.round(valor * 10) / 10;
  return String(arredondado).replace('.', ',');
}
