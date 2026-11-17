import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NIVEIS, NivelRisco, ROTULO_NIVEL } from '../domain/tipos';
import { coresNivel, cores, espaco, raio, tamanhoFonte } from '../theme/tema';

// Quantos municípios estão em cada nível (barras horizontais, sempre com número e símbolo).
export function GraficoNiveis({ contagem }: { contagem: Record<NivelRisco, number> }) {
  const maior = Math.max(1, ...NIVEIS.map((n) => contagem[n]));
  const resumo = NIVEIS.map((n) => `${ROTULO_NIVEL[n]}: ${contagem[n]}`).join('; ');

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Municípios por nível de risco. ${resumo}`}>
      {NIVEIS.map((nivel) => {
        const c = coresNivel[nivel];
        return (
          <View key={nivel} style={estilos.linha}>
            <Text style={estilos.nome}>
              {c.simbolo} {ROTULO_NIVEL[nivel]}
            </Text>
            <View style={estilos.trilho}>
              <View
                style={[
                  estilos.barra,
                  { backgroundColor: c.borda, width: `${(contagem[nivel] / maior) * 100}%` },
                ]}
              />
            </View>
            <Text style={estilos.numero}>{contagem[nivel]}</Text>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, marginBottom: espaco.sm },
  nome: { width: 100, fontSize: tamanhoFonte.pequeno, fontWeight: '600', color: cores.texto },
  trilho: { flex: 1, height: 14, backgroundColor: '#E3E9EF', borderRadius: raio.pill, overflow: 'hidden' },
  barra: { height: '100%', borderRadius: raio.pill },
  numero: { width: 24, textAlign: 'right', fontWeight: '800', color: cores.texto },
});
