import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores, espaco, raio, tamanhoFonte } from '../theme/tema';

interface Props {
  rotulo: string;
  valor: string;
  unidade?: string;
  detalhe?: string;
}

// Número em destaque com legenda, usado nas linhas de indicadores do painel.
export function Indicador({ rotulo, valor, unidade, detalhe }: Props) {
  return (
    <View
      style={estilos.caixa}
      accessible
      accessibilityLabel={`${rotulo}: ${valor}${unidade ? ` ${unidade}` : ''}${detalhe ? `. ${detalhe}` : ''}`}
    >
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor}>
        {valor}
        {unidade ? <Text style={estilos.unidade}> {unidade}</Text> : null}
      </Text>
      {detalhe ? <Text style={estilos.detalhe}>{detalhe}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flex: 1,
    minWidth: 100,
    backgroundColor: cores.primariaClara,
    borderRadius: raio.md,
    padding: espaco.md,
  },
  rotulo: { fontSize: 12, fontWeight: '600', color: cores.textoSuave },
  valor: { fontSize: tamanhoFonte.titulo, fontWeight: '800', color: cores.primaria, marginTop: 2 },
  unidade: { fontSize: tamanhoFonte.pequeno, fontWeight: '600' },
  detalhe: { fontSize: 12, color: cores.textoSuave, marginTop: 2 },
});
