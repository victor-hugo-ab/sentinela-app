import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export type NomeIcone = 'painel' | 'alertas' | 'relatos' | 'sobre';

// Ícones desenhados em SVG (sem depender de fonte de ícones), usados na barra de abas.
export function Icone({ nome, cor, tamanho = 24 }: { nome: NomeIcone; cor: string; tamanho?: number }) {
  const traco = { stroke: cor, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {nome === 'painel' && (
        <>
          <Rect x={3} y={3} width={7} height={9} rx={1.5} {...traco} />
          <Rect x={14} y={3} width={7} height={5} rx={1.5} {...traco} />
          <Rect x={14} y={12} width={7} height={9} rx={1.5} {...traco} />
          <Rect x={3} y={16} width={7} height={5} rx={1.5} {...traco} />
        </>
      )}
      {nome === 'alertas' && (
        <>
          <Path d="M12 3 L22 20 H2 Z" {...traco} />
          <Line x1={12} y1={10} x2={12} y2={14.5} {...traco} />
          <Line x1={12} y1={17.2} x2={12} y2={17.3} {...traco} />
        </>
      )}
      {nome === 'relatos' && (
        <>
          <Rect x={4} y={3} width={16} height={18} rx={2} {...traco} />
          <Line x1={8} y1={9} x2={16} y2={9} {...traco} />
          <Line x1={8} y1={13} x2={16} y2={13} {...traco} />
          <Line x1={8} y1={17} x2={12} y2={17} {...traco} />
        </>
      )}
      {nome === 'sobre' && (
        <>
          <Circle cx={12} cy={12} r={9} {...traco} />
          <Line x1={12} y1={11} x2={12} y2={16.5} {...traco} />
          <Line x1={12} y1={7.7} x2={12} y2={7.8} {...traco} />
        </>
      )}
    </Svg>
  );
}
