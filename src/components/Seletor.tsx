import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { cores, espaco, raio, tamanhoFonte, TAMANHO_MINIMO_TOQUE } from '../theme/tema';

interface Opcao {
  valor: string;
  rotulo: string;
}

interface Props {
  rotulo?: string;
  opcoes: ReadonlyArray<Opcao>;
  valor: string;
  aoEscolher: (valor: string) => void;
  erro?: string;
  rolagem?: boolean; // true: uma linha rolável na horizontal; false: quebra em várias linhas
}

// Escolha de uma opção entre várias (como um <select> ou radio). A opção escolhida
// ganha um ✓ além da cor, para não depender só de cor.
export function Seletor({ rotulo, opcoes, valor, aoEscolher, erro, rolagem }: Props) {
  const chips = opcoes.map((opcao) => {
    const escolhida = opcao.valor === valor;
    return (
      <Pressable
        key={opcao.valor}
        onPress={() => aoEscolher(opcao.valor)}
        accessibilityRole="radio"
        accessibilityLabel={opcao.rotulo}
        accessibilityState={{ selected: escolhida }}
        style={[estilos.chip, escolhida && estilos.chipEscolhido]}
      >
        <Text style={[estilos.chipTexto, escolhida && estilos.chipTextoEscolhido]}>
          {escolhida ? '✓ ' : ''}
          {opcao.rotulo}
        </Text>
      </Pressable>
    );
  });

  return (
    <View style={estilos.campo}>
      {rotulo ? <Text style={estilos.rotulo}>{rotulo}</Text> : null}
      {rolagem ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="radiogroup">
          <View style={estilos.linha}>{chips}</View>
        </ScrollView>
      ) : (
        <View style={[estilos.linha, estilos.quebra]} accessibilityRole="radiogroup">
          {chips}
        </View>
      )}
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
  rotulo: { fontSize: tamanhoFonte.corpo, fontWeight: '600', color: cores.texto, marginBottom: espaco.sm },
  linha: { flexDirection: 'row', gap: espaco.sm },
  quebra: { flexWrap: 'wrap' },
  chip: {
    minHeight: TAMANHO_MINIMO_TOQUE,
    justifyContent: 'center',
    paddingHorizontal: espaco.lg,
    borderRadius: raio.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  chipEscolhido: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto: { fontSize: tamanhoFonte.corpo, color: cores.texto },
  chipTextoEscolhido: { color: cores.branco, fontWeight: '700' },
  erro: { color: cores.erro, fontSize: tamanhoFonte.pequeno, fontWeight: '600', marginTop: espaco.xs },
});
