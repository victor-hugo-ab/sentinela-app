import { Alert, Platform } from 'react-native';

// Pergunta "tem certeza?" antes de uma ação que não dá para desfazer.
// No celular usa o alerta nativo; no navegador, window.confirm (o Alert do RN não funciona na web).
export function confirmar(titulo: string, mensagem: string, rotuloConfirmar = 'Apagar'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' && window.confirm(`${titulo}\n\n${mensagem}`));
  }
  return new Promise((resolver) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
        { text: rotuloConfirmar, style: 'destructive', onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) }
    );
  });
}
