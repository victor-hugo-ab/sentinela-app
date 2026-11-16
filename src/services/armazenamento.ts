import AsyncStorage from '@react-native-async-storage/async-storage';
import { Decisao, Relato, SerieClima } from '../domain/tipos';

// Persistência local (AsyncStorage). Nada sai do aparelho: relatos e decisões ficam só aqui.
const CHAVE_ESTADO = '@sentinela/estado-v1';
const CHAVE_CLIMA = '@sentinela/clima-v1';

export interface EstadoPersistido {
  config: { modoDemo: boolean; municipioId: string };
  relatos: Relato[];
  decisoes: Decisao[];
}

async function lerJson(chave: string): Promise<unknown> {
  try {
    const texto = await AsyncStorage.getItem(chave);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null; // dado corrompido ou storage indisponível: o app segue com o padrão
  }
}

export async function carregarEstado(): Promise<Partial<EstadoPersistido> | null> {
  const bruto = (await lerJson(CHAVE_ESTADO)) as Partial<EstadoPersistido> | null;
  if (!bruto || typeof bruto !== 'object') return null;
  return {
    config: bruto.config && typeof bruto.config === 'object' ? bruto.config : undefined,
    relatos: Array.isArray(bruto.relatos) ? bruto.relatos : [],
    decisoes: Array.isArray(bruto.decisoes) ? bruto.decisoes : [],
  };
}

export async function salvarEstado(estado: EstadoPersistido): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
  } catch {
    // Falha ao gravar não derruba o app; os dados continuam em memória.
  }
}

export async function carregarCacheClima(): Promise<SerieClima[]> {
  const bruto = await lerJson(CHAVE_CLIMA);
  return Array.isArray(bruto) ? (bruto as SerieClima[]) : [];
}

export async function salvarCacheClima(series: SerieClima[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_CLIMA, JSON.stringify(series));
  } catch {
    // Sem cache, só perdemos o uso offline.
  }
}

export async function apagarTudo(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([CHAVE_ESTADO, CHAVE_CLIMA]);
  } catch {
    // ignora
  }
}
