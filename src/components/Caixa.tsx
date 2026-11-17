import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espaco, raio, tamanhoFonte, TAMANHO_MINIMO_TOQUE } from '../theme/tema';

interface Props {
  rotulo: string;
  marcada: boolean;
  aoAlternar: (marcada: boolean) => void;
  erro?: string;
}

// Caixa de marcação com texto ao lado. A área de toque cobre a linha inteira.
export function Caixa({ rotulo, marcada, aoAlternar, erro }: Props) {
  return (
    <View style={estilos.campo}>
      <Pressable
        onPress={() => aoAlternar(!marcada)}
        accessibilityRole="checkbox"
        accessibilityLabel={rotulo}
        accessibilityState={{ checked: marcada }}
        style={estilos.linha}
      >
        <View style={[estilos.caixa, marcada && estilos.caixaMarcada, !!erro && estilos.caixaErro]}>
          {marcada ? <Text style={estilos.marca}>✓</Text> : null}
        </View>
        <Text style={estilos.rotulo}>{rotulo}</Text>
      </Pressable>
      {erro ? (
        <Text style={estilos.erro} accessibilityLiveRegion="polite">
          {`⚠ ${erro}`}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { marginBottom: espaco.lg },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, minHeight: TAMANHO_MINIMO_TOQUE },
  caixa: {
    width: 28,
    height: 28,
    borderRadius: raio.sm,
    borderWidth: 2,
    borderColor: '#5B6B7C',
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaMarcada: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  caixaErro: { borderColor: cores.erro },
  marca: { color: cores.branco, fontWeight: '800', fontSize: 18 },
  rotulo: { flex: 1, fontSize: tamanhoFonte.corpo, color: cores.texto },
  erro: { color: cores.erro, fontSize: tamanhoFonte.pequeno, fontWeight: '600', marginTop: espaco.xs },
});
