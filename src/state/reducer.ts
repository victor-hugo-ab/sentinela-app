import { MUNICIPIO_PILOTO } from '../domain/municipios';
import { Decisao, Relato, SerieClima } from '../domain/tipos';
import { EstadoPersistido } from '../services/armazenamento';

// Estado global do app (useReducer + Context). Tudo que muda o estado passa por uma ação,
// o que facilita testar e explicar.

export type StatusClima = 'carregando' | 'ok' | 'erro';

export interface EstadoClima {
  status: StatusClima;
  series: SerieClima[];
  avaliadoEm: string | null; // ISO do último carregamento bem-sucedido
  aviso: string | null; // ex.: "Sem conexão, mostrando dados guardados"
  erro: string | null;
}

export interface Estado {
  hidratado: boolean; // true depois de ler o que estava salvo no aparelho
  config: { modoDemo: boolean; municipioId: string };
  relatos: Relato[];
  decisoes: Decisao[];
  clima: EstadoClima;
}

export type Acao =
  | { tipo: 'HIDRATAR'; salvo: Partial<EstadoPersistido> | null }
  | { tipo: 'ESCOLHER_MUNICIPIO'; municipioId: string }
  | { tipo: 'DEFINIR_MODO_DEMO'; ativo: boolean }
  | { tipo: 'ADICIONAR_RELATO'; relato: Relato }
  | { tipo: 'REMOVER_RELATO'; id: string }
  | { tipo: 'REGISTRAR_DECISAO'; decisao: Decisao }
  | { tipo: 'CLIMA_CARREGANDO' }
  | { tipo: 'CLIMA_OK'; series: SerieClima[]; avaliadoEm: string; aviso: string | null }
  | { tipo: 'CLIMA_ERRO'; erro: string }
  | { tipo: 'APAGAR_DADOS' };

export const estadoInicial: Estado = {
  hidratado: false,
  config: { modoDemo: false, municipioId: MUNICIPIO_PILOTO },
  relatos: [],
  decisoes: [],
  clima: { status: 'carregando', series: [], avaliadoEm: null, aviso: null, erro: null },
};

export function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case 'HIDRATAR':
      return {
        ...estado,
        hidratado: true,
        config: { ...estado.config, ...(acao.salvo?.config ?? {}) },
        relatos: acao.salvo?.relatos ?? estado.relatos,
        decisoes: acao.salvo?.decisoes ?? estado.decisoes,
      };

    case 'ESCOLHER_MUNICIPIO':
      return { ...estado, config: { ...estado.config, municipioId: acao.municipioId } };

    case 'DEFINIR_MODO_DEMO':
      return { ...estado, config: { ...estado.config, modoDemo: acao.ativo } };

    case 'ADICIONAR_RELATO':
      return { ...estado, relatos: [acao.relato, ...estado.relatos] };

    case 'REMOVER_RELATO':
      return { ...estado, relatos: estado.relatos.filter((r) => r.id !== acao.id) };

    case 'REGISTRAR_DECISAO':
      return { ...estado, decisoes: [acao.decisao, ...estado.decisoes] };

    case 'CLIMA_CARREGANDO':
      return { ...estado, clima: { ...estado.clima, status: 'carregando', erro: null } };

    case 'CLIMA_OK':
      return {
        ...estado,
        clima: { status: 'ok', series: acao.series, avaliadoEm: acao.avaliadoEm, aviso: acao.aviso, erro: null },
      };

    case 'CLIMA_ERRO':
      return { ...estado, clima: { ...estado.clima, status: 'erro', erro: acao.erro } };

    case 'APAGAR_DADOS':
      return {
        ...estadoInicial,
        hidratado: true,
        clima: estado.clima, // o clima atual continua na tela; só o que era do usuário some
      };

    default:
      return estado;
  }
}
