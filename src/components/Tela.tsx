import React, { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores, espaco } from '../theme/tema';

interface Props {
  children: ReactNode;
  atualizando?: boolean;
  aoAtualizar?: () => void; // puxar para atualizar
}

// Contêiner padrão das telas: respeita as áreas seguras, rola e (opcionalmente) puxa para atualizar.
export function Tela({ children, atualizando, aoAtualizar }: Props) {
  return (
    <SafeAreaView style={estilos.area} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          aoAtualizar ? <RefreshControl refreshing={!!atualizando} onRefresh={aoAtualizar} colors={[cores.primaria]} /> : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  area: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xl * 2 },
});
