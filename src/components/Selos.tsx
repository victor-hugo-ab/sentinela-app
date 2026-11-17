import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Confianca, NivelRisco, ROTULO_CONFIANCA, ROTULO_NIVEL } from '../domain/tipos';
import { coresNivel, cores, espaco, raio, simboloConfianca } from '../theme/tema';

// Selo do nível de risco: símbolo + texto + cor.
export function SeloNivel({ nivel, grande }: { nivel: NivelRisco; grande?: boolean }) {
  const c = coresNivel[nivel];
  return (
    <View
      accessible
      accessibilityLabel={`Risco ${ROTULO_NIVEL[nivel]}`}
      style={[estilos.selo, { backgroundColor: c.fundo, borderColor: c.borda }, grande && estilos.seloGrande]}
    >
      <Text style={[estilos.textoSelo, { color: c.texto }, grande && estilos.textoSeloGrande]}>
        {c.simbolo} {ROTULO_NIVEL[nivel]}
      </Text>
    </View>
  );
}

// Selo da confiança: barrinhas + texto.
export function SeloConfianca({ confianca }: { confianca: Confianca }) {
  return (
    <View
      accessible
      accessibilityLabel={`Confiança ${ROTULO_CONFIANCA[confianca]}`}
      style={estilos.confianca}
    >
      <Text style={estilos.textoConfianca}>
        {simboloConfianca[confianca]} Confiança {ROTULO_CONFIANCA[confianca].toLowerCase()}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: raio.pill,
    paddingHorizontal: espaco.md,
    paddingVertical: 3,
  },
  seloGrande: { paddingHorizontal: espaco.lg, paddingVertical: espaco.sm },
  textoSelo: { fontSize: 13, fontWeight: '800' },
  textoSeloGrande: { fontSize: 20 },
  confianca: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.primariaClara,
    borderRadius: raio.pill,
    paddingHorizontal: espaco.md,
    paddingVertical: 3,
  },
  textoConfianca: { fontSize: 13, fontWeight: '600', color: cores.primariaEscura },
});
