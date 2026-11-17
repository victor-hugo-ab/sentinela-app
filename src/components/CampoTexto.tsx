import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, espaco, raio, tamanhoFonte } from '../theme/tema';

interface Props {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  erro?: string;
  ajuda?: string;
  placeholder?: string;
  multilinha?: boolean;
  limite?: number; // máximo de caracteres (mostra contador)
}

export function CampoTexto({ rotulo, valor, aoMudar, erro, ajuda, placeholder, multilinha, limite }: Props) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      {ajuda ? <Text style={estilos.ajuda}>{ajuda}</Text> : null}
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSuave}
        multiline={multilinha}
        maxLength={limite}
        accessibilityLabel={rotulo}
        accessibilityHint={erro}
        style={[estilos.entrada, multilinha && estilos.multilinha, !!erro && estilos.entradaComErro]}
      />
      {limite ? (
        <Text style={estilos.contador} accessibilityElementsHidden importantForAccessibility="no">
          {valor.length} / {limite}
        </Text>
      ) : null}
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
  rotulo: { fontSize: tamanhoFonte.corpo, fontWeight: '600', color: cores.texto, marginBottom: espaco.xs },
  ajuda: { fontSize: tamanhoFonte.pequeno, color: cores.textoSuave, marginBottom: espaco.xs },
  entrada: {
    borderWidth: 1,
    borderColor: '#8A97A5',
    borderRadius: raio.sm,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.md,
    fontSize: tamanhoFonte.corpo,
    color: cores.texto,
    backgroundColor: cores.branco,
    minHeight: 48,
  },
  multilinha: { minHeight: 96, textAlignVertical: 'top' },
  entradaComErro: { borderColor: cores.erro, borderWidth: 2 },
  contador: { fontSize: 12, color: cores.textoSuave, textAlign: 'right', marginTop: 2 },
  erro: { color: cores.erro, fontSize: tamanhoFonte.pequeno, fontWeight: '600', marginTop: espaco.xs },
});
