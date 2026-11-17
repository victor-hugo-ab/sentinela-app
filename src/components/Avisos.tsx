import React from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarDataHora } from '../domain/datas';
import { FonteDados } from '../domain/tipos';
import { cores, espaco, raio, tamanhoFonte, TAMANHO_MINIMO_TOQUE } from '../theme/tema';
import { Botao } from './Botao';

// Faixa que diz de onde vêm os dados que o gestor está vendo.
export function AvisoFonte({ fonte, atualizadoEm, aviso }: { fonte: FonteDados; atualizadoEm: string | null; aviso: string | null }) {
  const quando = atualizadoEm ? formatarDataHora(atualizadoEm) : '';
  let texto: string;
  let alerta = true;

  if (fonte === 'sintetico') {
    texto = 'Modo demonstração: dados fictícios. Não use para decisões reais.';
  } else if (fonte === 'cache') {
    texto = `${aviso ?? 'Mostrando dados guardados no aparelho.'} Última atualização: ${quando}.`;
  } else {
    texto = `Dados reais da Open-Meteo, atualizados em ${quando}.`;
    alerta = false;
  }

  return (
    <View
      style={[estilos.faixa, alerta ? estilos.faixaAlerta : estilos.faixaNormal]}
      accessible
      accessibilityLabel={texto}
    >
      <Text style={[estilos.faixaTexto, alerta && { color: cores.aviso }]}>{`${alerta ? '⚠ ' : 'ℹ '}${texto}`}</Text>
    </View>
  );
}

export function AvisoEmergencia() {
  const ligar = (numero: string) => Linking.openURL(`tel:${numero}`).catch(() => {});
  const contatos = [
    { numero: '199', nome: 'Defesa Civil' },
    { numero: '193', nome: 'Bombeiros' },
    { numero: '190', nome: 'Polícia' },
  ];
  return (
    <View style={estilos.emergencia}>
      <Text style={estilos.emergenciaTitulo} accessibilityRole="header">
        Em emergência, ligue
      </Text>
      <View style={estilos.contatos}>
        {contatos.map((c) => (
          <Pressable
            key={c.numero}
            onPress={() => ligar(c.numero)}
            accessibilityRole="button"
            accessibilityLabel={`Ligar para ${c.nome}, ${c.numero}`}
            style={estilos.contato}
          >
            <Text style={estilos.contatoNumero}>{c.numero}</Text>
            <Text style={estilos.contatoNome}>{c.nome}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={estilos.emergenciaTexto}>Este app apoia a decisão do gestor e não substitui o socorro.</Text>
    </View>
  );
}

export function Carregando({ texto = 'Carregando dados de chuva...' }: { texto?: string }) {
  return (
    <View style={estilos.centro} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={estilos.centroTexto}>{texto}</Text>
    </View>
  );
}

export function EstadoVazio({
  titulo,
  texto,
  rotuloBotao,
  aoPressionar,
}: {
  titulo: string;
  texto?: string;
  rotuloBotao?: string;
  aoPressionar?: () => void;
}) {
  return (
    <View style={estilos.centro}>
      <Text style={estilos.vazioTitulo}>{titulo}</Text>
      {texto ? <Text style={estilos.centroTexto}>{texto}</Text> : null}
      {rotuloBotao && aoPressionar ? (
        <Botao rotulo={rotuloBotao} aoPressionar={aoPressionar} estilo={{ marginTop: espaco.lg }} />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  faixa: { borderRadius: raio.sm, padding: espaco.md, marginBottom: espaco.md, borderWidth: 1 },
  faixaNormal: { backgroundColor: cores.primariaClara, borderColor: cores.borda },
  faixaAlerta: { backgroundColor: cores.avisoFundo, borderColor: cores.avisoBorda },
  faixaTexto: { fontSize: tamanhoFonte.pequeno, color: cores.primariaEscura, fontWeight: '600' },
  emergencia: {
    backgroundColor: cores.avisoFundo,
    borderColor: cores.avisoBorda,
    borderWidth: 1,
    borderLeftWidth: 6,
    borderRadius: raio.md,
    padding: espaco.lg,
    marginBottom: espaco.md,
  },
  emergenciaTitulo: { fontSize: tamanhoFonte.corpo, fontWeight: '800', color: cores.aviso },
  contatos: { flexDirection: 'row', gap: espaco.sm, marginVertical: espaco.sm },
  contato: {
    flex: 1,
    minHeight: TAMANHO_MINIMO_TOQUE,
    backgroundColor: cores.branco,
    borderRadius: raio.sm,
    borderWidth: 1,
    borderColor: cores.avisoBorda,
    alignItems: 'center',
    paddingVertical: espaco.sm,
  },
  contatoNumero: { fontSize: tamanhoFonte.subtitulo, fontWeight: '800', color: cores.texto },
  contatoNome: { fontSize: 12, color: cores.textoSuave },
  emergenciaTexto: { fontSize: tamanhoFonte.pequeno, color: cores.aviso },
  centro: { alignItems: 'center', padding: espaco.xl },
  centroTexto: { marginTop: espaco.md, textAlign: 'center', color: cores.textoSuave, fontSize: tamanhoFonte.corpo },
  vazioTitulo: { fontSize: tamanhoFonte.subtitulo, fontWeight: '700', color: cores.texto, textAlign: 'center' },
});
