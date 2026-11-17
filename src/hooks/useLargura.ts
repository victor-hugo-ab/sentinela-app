import { useWindowDimensions } from 'react-native';
import { espaco } from '../theme/tema';

// Largura útil para desenhar gráficos dentro de um Cartão (desconta o padding da tela e do cartão).
// Limita a 640 para não esticar demais em tablet ou no navegador.
export function useLarguraCartao(): number {
  const { width } = useWindowDimensions();
  const util = Math.min(width, 640) - espaco.lg * 2 - espaco.lg * 2 - 2;
  return Math.max(240, util);
}
