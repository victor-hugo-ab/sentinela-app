import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AvisoEmergencia, AvisoFonte, Carregando, EstadoVazio } from '../components/Avisos';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { GraficoChuva } from '../components/GraficoChuva';
import { GraficoNiveis } from '../components/GraficoNiveis';
import { Indicador } from '../components/Indicador';
import { Seletor } from '../components/Seletor';
import { SeloConfianca, SeloNivel } from '../components/Selos';
import { Tela } from '../components/Tela';
import { formatarMm } from '../domain/datas';
import { MUNICIPIOS, nomeDoMunicipio } from '../domain/municipios';
import { useLarguraCartao } from '../hooks/useLargura';
import type { AbasParams, RaizParams } from '../navigation/tipos';
import { useApp } from '../state/AppContext';
import { contarPorNivel, resumirPainel } from '../state/seletores';
import { cores, espaco, tamanhoFonte } from '../theme/tema';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AbasParams, 'Painel'>,
  NativeStackScreenProps<RaizParams>
>;

export function PainelScreen({ navigation }: Props) {
  const { estado, avaliacoes, avaliacaoDe, atualizarClima, escolherMunicipio } = useApp();
  const largura = useLarguraCartao();
  const { clima, config, decisoes } = estado;

  const contagem = useMemo(() => contarPorNivel(avaliacoes), [avaliacoes]);
  const resumo = useMemo(() => resumirPainel(avaliacoes, decisoes), [avaliacoes, decisoes]);
  const selecionada = avaliacaoDe(config.municipioId);
  const serie = clima.series.find((s) => s.municipioId === config.municipioId);

  if (clima.status === 'carregando' && clima.series.length === 0) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  if (clima.series.length === 0) {
    return (
      <Tela>
        <EstadoVazio
          titulo="Não foi possível carregar os dados"
          texto={clima.erro ?? 'Tente novamente em instantes.'}
          rotuloBotao="Tentar de novo"
          aoPressionar={atualizarClima}
        />
        <AvisoEmergencia />
      </Tela>
    );
  }

  return (
    <Tela atualizando={clima.status === 'carregando'} aoAtualizar={atualizarClima}>
      <AvisoFonte fonte={serie?.fonte ?? 'api'} atualizadoEm={clima.avaliadoEm} aviso={clima.aviso} />

      <View style={estilos.indicadores}>
        <Indicador rotulo="Em nível alto ou mais" valor={String(resumo.emAlerta)} unidade={`de ${MUNICIPIOS.length}`} />
        <Indicador rotulo="Sem decisão" valor={String(resumo.pendentes)} detalhe="alertas altos pendentes" />
      </View>
      {resumo.maiorChuva ? (
        <View style={estilos.indicadores}>
          <Indicador
            rotulo="Maior acumulado de 3 dias"
            valor={formatarMm(resumo.maiorChuva.mm)}
            unidade="mm"
            detalhe={nomeDoMunicipio(resumo.maiorChuva.municipioId)}
          />
        </View>
      ) : null}

      <Cartao titulo="Municípios por nível de risco">
        <GraficoNiveis contagem={contagem} />
      </Cartao>

      <Cartao titulo="Chuva no município">
        <Seletor
          opcoes={MUNICIPIOS.map((m) => ({ valor: m.id, rotulo: m.nome }))}
          valor={config.municipioId}
          aoEscolher={escolherMunicipio}
          rolagem
        />
        {selecionada && serie ? (
          <>
            <View style={estilos.selos}>
              <SeloNivel nivel={selecionada.nivel} />
              <SeloConfianca confianca={selecionada.confianca} />
            </View>
            <GraficoChuva dias={serie.dias} dataBase={selecionada.dataBase} largura={largura} />
            <Text style={estilos.legendaGrafico}>
              Maior acumulado de 3 dias: {formatarMm(selecionada.metricas.pico3dMm)} mm. Nos 7 dias anteriores: {formatarMm(selecionada.metricas.passado7dMm)} mm.
            </Text>
            <Botao
              rotulo="Ver justificativa e decidir"
              aoPressionar={() => navigation.navigate('Detalhe', { municipioId: selecionada.municipioId })}
              estilo={{ marginTop: espaco.md }}
            />
          </>
        ) : null}
      </Cartao>

      <AvisoEmergencia />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  indicadores: { flexDirection: 'row', gap: espaco.md, marginBottom: espaco.md },
  selos: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, marginBottom: espaco.md },
  legendaGrafico: { fontSize: tamanhoFonte.pequeno, color: cores.textoSuave, marginTop: espaco.sm },
});
