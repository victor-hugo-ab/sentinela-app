import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { MUNICIPIOS } from '../domain/municipios';
import { avaliarRisco, ordenarPorRisco } from '../domain/risco';
import { Avaliacao, Decisao, Relato } from '../domain/tipos';
import {
  apagarTudo,
  carregarCacheClima,
  carregarEstado,
  salvarCacheClima,
  salvarEstado,
} from '../services/armazenamento';
import { buscarClima, ErroClima } from '../services/clima';
import { gerarSeriesSinteticas } from '../services/sintetico';
import { Acao, Estado, estadoInicial, reducer } from './reducer';

interface ContextoApp {
  estado: Estado;
  avaliacoes: Avaliacao[]; // todos os municípios, do mais grave para o menos grave
  avaliacaoDe: (municipioId: string) => Avaliacao | undefined;
  atualizarClima: () => Promise<void>;
  adicionarRelato: (relato: Omit<Relato, 'id' | 'criadoEm'>) => void;
  registrarDecisao: (decisao: Omit<Decisao, 'id' | 'criadaEm'>) => void;
  escolherMunicipio: (municipioId: string) => void;
  definirModoDemo: (ativo: boolean) => void;
  apagarDadosDoAparelho: () => Promise<void>;
}

const Contexto = createContext<ContextoApp | null>(null);

// Identificador simples e suficiente para registros locais.
const novoId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial);
  const numeroDaBusca = useRef(0); // descarta respostas antigas se o usuário trocar de modo no meio da busca

  // 1) Ao abrir: lê o que estava salvo no aparelho.
  useEffect(() => {
    carregarEstado().then((salvo) => dispatch({ tipo: 'HIDRATAR', salvo }));
  }, []);

  // 2) Sempre que config, relatos ou decisões mudam: grava no aparelho.
  useEffect(() => {
    if (!estado.hidratado) return;
    salvarEstado({ config: estado.config, relatos: estado.relatos, decisoes: estado.decisoes });
  }, [estado.hidratado, estado.config, estado.relatos, estado.decisoes]);

  const atualizarClima = useCallback(async () => {
    const minhaBusca = ++numeroDaBusca.current;
    const emitir = (acao: Acao) => {
      if (minhaBusca === numeroDaBusca.current) dispatch(acao);
    };
    emitir({ tipo: 'CLIMA_CARREGANDO' });
    const agora = new Date();

    if (estado.config.modoDemo) {
      emitir({
        tipo: 'CLIMA_OK',
        series: gerarSeriesSinteticas(MUNICIPIOS, agora),
        avaliadoEm: agora.toISOString(),
        aviso: null,
      });
      return;
    }

    try {
      const series = await buscarClima(MUNICIPIOS, agora);
      await salvarCacheClima(series);
      emitir({ tipo: 'CLIMA_OK', series, avaliadoEm: agora.toISOString(), aviso: null });
    } catch (erro) {
      const guardado = await carregarCacheClima();
      if (guardado.length === MUNICIPIOS.length) {
        const series = guardado.map((s) => ({ ...s, fonte: 'cache' as const }));
        emitir({
          tipo: 'CLIMA_OK',
          series,
          avaliadoEm: series[0].atualizadoEm,
          aviso: 'Sem conexão com a fonte de dados. Mostrando a última atualização guardada no aparelho.',
        });
      } else {
        emitir({
          tipo: 'CLIMA_ERRO',
          erro:
            erro instanceof ErroClima
              ? erro.message
              : 'Não foi possível carregar os dados de chuva. Tente novamente.',
        });
      }
    }
  }, [estado.config.modoDemo]);

  // 3) Busca os dados quando o app abre e quando o modo (real/demonstração) muda.
  useEffect(() => {
    if (estado.hidratado) atualizarClima();
  }, [estado.hidratado, atualizarClima]);

  const avaliacoes = useMemo(() => {
    const agora = new Date();
    return ordenarPorRisco(estado.clima.series.map((s) => avaliarRisco(s, agora)));
  }, [estado.clima.series]);

  const valor = useMemo<ContextoApp>(
    () => ({
      estado,
      avaliacoes,
      avaliacaoDe: (id) => avaliacoes.find((a) => a.municipioId === id),
      atualizarClima,
      adicionarRelato: (relato) =>
        dispatch({
          tipo: 'ADICIONAR_RELATO',
          relato: { ...relato, id: novoId(), criadoEm: new Date().toISOString() },
        }),
      registrarDecisao: (decisao) =>
        dispatch({
          tipo: 'REGISTRAR_DECISAO',
          decisao: { ...decisao, id: novoId(), criadaEm: new Date().toISOString() },
        }),
      escolherMunicipio: (municipioId) => dispatch({ tipo: 'ESCOLHER_MUNICIPIO', municipioId }),
      definirModoDemo: (ativo) => dispatch({ tipo: 'DEFINIR_MODO_DEMO', ativo }),
      apagarDadosDoAparelho: async () => {
        await apagarTudo();
        dispatch({ tipo: 'APAGAR_DADOS' });
      },
    }),
    [estado, avaliacoes, atualizarClima]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp(): ContextoApp {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useApp precisa estar dentro de <AppProvider>.');
  return contexto;
}
