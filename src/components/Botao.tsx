import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { cores, espaco, raio, TAMANHO_MINIMO_TOQUE } from '../theme/tema';

type Variante = 'primario' | 'secundario' | 'perigo';

interface Props {
  rotulo: string;
  aoPressionar: () => void;
  variante?: Variante;
  desabilitado?: boolean;
  dica?: string; // texto extra para leitores de tela
  estilo?: StyleProp<ViewStyle>;
}

const FUNDO: Record<Variante, string> = {
  primario: cores.primaria,
  secundario: cores.primariaClara,
  perigo: cores.erro,
};
const TEXTO: Record<Variante, string> = {
  primario: cores.branco,
  secundario: cores.primaria,
  perigo: cores.branco,
};

export function Botao({ rotulo, aoPressionar, variante = 'primario', desabilitado, dica, estilo }: Props) {
  return (
    <Pressable
      onPress={aoPressionar}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: !!desabilitado }}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: FUNDO[variante], opacity: desabilitado ? 0.5 : pressed ? 0.85 : 1 },
        variante === 'secundario' && estilos.borda,
        estilo,
      ]}
    >
      <Text style={[estilos.texto, { color: TEXTO[variante] }]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: TAMANHO_MINIMO_TOQUE,
    borderRadius: raio.sm,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borda: { borderWidth: 1, borderColor: cores.primaria },
  texto: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
