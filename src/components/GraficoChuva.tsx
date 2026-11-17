import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as TextoSvg } from 'react-native-svg';
import { diaDaSemana, formatarDiaMes, formatarMm } from '../domain/datas';
import { DiaChuva } from '../domain/tipos';
import { cores, espaco, tamanhoFonte } from '../theme/tema';

interface Props {
  dias: DiaChuva[];
  dataBase: string; // YYYY-MM-DD de "hoje": separa chuva observada de previsão
  largura: number;
  altura?: number;
}

// Barras de chuva diária. Observado = barra cheia; previsão = barra vazada com borda tracejada
// (a diferença não depende só de cor). Dia sem dado aparece como "s/d".
export function GraficoChuva({ dias, dataBase, largura, altura = 190 }: Props) {
  const margemTopo = 20;
  const margemBase = 36;
  const areaAltura = altura - margemTopo - margemBase;
  const maximo = Math.max(10, ...dias.map((d) => d.chuvaMm ?? 0));
  const passo = largura / Math.max(1, dias.length);
  const larguraBarra = Math.min(26, passo * 0.62);

  const resumo = dias
    .map((d) => `${formatarDiaMes(d.data)}: ${d.chuvaMm === null ? 'sem dado' : `${formatarMm(d.chuvaMm)} milímetros`}`)
    .join('; ');

  return (
    <View>
      <View accessible accessibilityRole="image" accessibilityLabel={`Gráfico de chuva diária. ${resumo}`}>
        <Svg width={largura} height={altura}>
          <Line x1={0} x2={largura} y1={margemTopo + areaAltura} y2={margemTopo + areaAltura} stroke={cores.borda} strokeWidth={1} />
          {dias.map((dia, i) => {
            const x = i * passo + (passo - larguraBarra) / 2;
            const previsto = dia.data >= dataBase;
            const hoje = dia.data === dataBase;
            const valor = dia.chuvaMm ?? 0;
            const h = Math.max(dia.chuvaMm === null ? 0 : 2, (valor / maximo) * areaAltura);
            const y = margemTopo + areaAltura - h;
            const centro = x + larguraBarra / 2;

            return (
              <React.Fragment key={dia.data}>
                {dia.chuvaMm !== null ? (
                  <Rect
                    x={x}
                    y={y}
                    width={larguraBarra}
                    height={h}
                    rx={3}
                    fill={previsto ? cores.branco : cores.primaria}
                    stroke={cores.primaria}
                    strokeWidth={2}
                    strokeDasharray={previsto ? '4,3' : undefined}
                  />
                ) : null}
                <TextoSvg x={centro} y={dia.chuvaMm === null ? margemTopo + areaAltura - 4 : y - 4} fontSize={10} fontWeight="700" fill={cores.texto} textAnchor="middle">
                  {dia.chuvaMm === null ? 's/d' : formatarMm(dia.chuvaMm)}
                </TextoSvg>
                <TextoSvg x={centro} y={altura - 20} fontSize={10} fontWeight={hoje ? '800' : '400'} fill={cores.texto} textAnchor="middle">
                  {hoje ? 'hoje' : diaDaSemana(dia.data)}
                </TextoSvg>
                <TextoSvg x={centro} y={altura - 7} fontSize={9} fill={cores.textoSuave} textAnchor="middle">
                  {formatarDiaMes(dia.data)}
                </TextoSvg>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
      <View style={estilos.legenda}>
        <View style={estilos.legendaItem}>
          <View style={[estilos.amostra, { backgroundColor: cores.primaria }]} />
          <Text style={estilos.legendaTexto}>Observado</Text>
        </View>
        <View style={estilos.legendaItem}>
          <View style={[estilos.amostra, estilos.amostraPrevisto]} />
          <Text style={estilos.legendaTexto}>Previsão</Text>
        </View>
        <Text style={estilos.legendaTexto}>mm por dia</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  legenda: { flexDirection: 'row', gap: espaco.lg, flexWrap: 'wrap', marginTop: espaco.xs },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amostra: { width: 14, height: 14, borderRadius: 3, borderWidth: 2, borderColor: cores.primaria },
  amostraPrevisto: { backgroundColor: cores.branco, borderStyle: 'dashed' },
  legendaTexto: { fontSize: tamanhoFonte.pequeno, color: cores.textoSuave },
});
