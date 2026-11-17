import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarMm } from '../domain/datas';
import { nomeDoMunicipio } from '../domain/municipios';
import { Avaliacao, Decisao, ACOES_DECISAO } from '../domain/tipos';
import { coresNivel, cores, espaco, raio, tamanhoFonte } from '../theme/tema';
import { SeloConfianca, SeloNivel } from './Selos';

interface Props {
  avaliacao: Avaliacao;
  decisao?: Decisao; // última decisão do gestor sobre este alerta, se houver
  aoPressionar: () => void;
}

// Linha de alerta (um município): nome, nível, confiança, chuva e situação da decisão.
export function CartaoAlerta({ avaliacao, decisao, aoPressionar }: Props) {
  const nome = nomeDoMunicipio(avaliacao.municipioId);
  const c = coresNivel[avaliacao.nivel];
  const situacao = decisao
    ? `Decisão: ${ACOES_DECISAO.find((a) => a.valor === decisao.acao)?.rotulo}`
    : 'Aguardando decisão do gestor';

  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={`${nome}. Risco ${avaliacao.nivel}. Confiança ${avaliacao.confianca}. ${situacao}. Toque para ver os detalhes.`}
      style={({ pressed }) => [estilos.cartao, { borderLeftColor: c.borda }, pressed && { opacity: 0.85 }]}
    >
      <View style={estilos.topo}>
        <Text style={estilos.nome}>{nome}</Text>
        <SeloNivel nivel={avaliacao.nivel} />
      </View>
      <SeloConfianca confianca={avaliacao.confianca} />
      <Text style={estilos.linha}>
        Maior acumulado de 3 dias: <Text style={estilos.forte}>{formatarMm(avaliacao.metricas.pico3dMm)} mm</Text>
      </Text>
      <Text style={[estilos.situacao, !decisao && estilos.pendente]}>{situacao}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    borderLeftWidth: 8,
    padding: espaco.lg,
    marginBottom: espaco.md,
    gap: espaco.sm,
  },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espaco.sm },
  nome: { fontSize: tamanhoFonte.subtitulo, fontWeight: '800', color: cores.texto, flexShrink: 1 },
  linha: { fontSize: tamanhoFonte.corpo, color: cores.texto },
  forte: { fontWeight: '800' },
  situacao: { fontSize: tamanhoFonte.pequeno, color: cores.textoSuave },
  pendente: { color: cores.aviso, fontWeight: '700' },
});
