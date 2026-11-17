import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { cores, espaco, raio, tamanhoFonte } from '../theme/tema';

interface Props {
  titulo?: string;
  children: ReactNode;
  estilo?: StyleProp<ViewStyle>;
}

// Bloco branco com borda, usado em todas as telas.
export function Cartao({ titulo, children, estilo }: Props) {
  return (
    <View style={[estilos.cartao, estilo]}>
      {titulo ? (
        <Text style={estilos.titulo} accessibilityRole="header">
          {titulo}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    marginBottom: espaco.md,
  },
  titulo: {
    fontSize: tamanhoFonte.subtitulo,
    fontWeight: '700',
    color: cores.texto,
    marginBottom: espaco.sm,
  },
});
