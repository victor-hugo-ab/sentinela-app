import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { AvisoEmergencia } from '../components/Avisos';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { confirmar } from '../components/confirmar';
import { Tela } from '../components/Tela';
import { useApp } from '../state/AppContext';
import { cores, espaco, tamanhoFonte } from '../theme/tema';

function Paragrafo({ children }: { children: React.ReactNode }) {
  return <Text style={estilos.texto}>{children}</Text>;
}

export function SobreScreen() {
  const { estado, definirModoDemo, apagarDadosDoAparelho } = useApp();

  const apagar = async () => {
    const certeza = await confirmar(
      'Apagar dados do aparelho',
      'Relatos, decisões e configurações serão apagados deste aparelho. Não dá para desfazer.'
    );
    if (certeza) await apagarDadosDoAparelho();
  };

  return (
    <Tela>
      <Cartao titulo="Modo demonstração">
        <View style={estilos.linhaSwitch}>
          <Text style={[estilos.texto, { flex: 1 }]}>Usar dados fictícios (para apresentar sem internet)</Text>
          <Switch
            value={estado.config.modoDemo}
            onValueChange={definirModoDemo}
            accessibilityLabel="Modo demonstração com dados fictícios"
            trackColor={{ false: '#9AA7B5', true: cores.primaria }}
            thumbColor={cores.branco}
          />
        </View>
        <Text style={estilos.pequeno}>
          {estado.config.modoDemo
            ? 'Ativo: os dados são sintéticos e aparecem com um aviso em todas as telas.'
            : 'Desativado: o app usa a previsão real da Open-Meteo.'}
        </Text>
      </Cartao>

      <Cartao titulo="Sobre o Sentinela">
        <Paragrafo>
          Painel de inteligência territorial do Vale do Taquari (RS), criado para o case Territory Predictive Insights da Global Solution 2026.2. Ele antecipa o risco de alagamento a partir da chuva observada e prevista e apoia a decisão do gestor público.
        </Paragrafo>
        <Paragrafo>
          O app não toma decisões nem envia avisos à população: ele mostra o nível de risco, a justificativa, a confiança e as limitações, e registra o que o gestor decidiu e por quê. No Sentinela completo, o aviso aprovado pelo operador sai pelo WhatsApp; aqui o gestor só registra a decisão.
        </Paragrafo>
      </Cartao>

      <Cartao titulo="Fonte dos dados">
        <Paragrafo>
          Chuva diária (observada e prevista) e chance de chuva: Open-Meteo, API pública e gratuita (open-meteo.com), consultada em uma grade de cerca de 10 km sobre o centro de cada município.
        </Paragrafo>
        <Paragrafo>
          Quando não há conexão, o app mostra a última consulta guardada no aparelho, com aviso. No modo demonstração, os dados são sintéticos.
        </Paragrafo>
      </Cartao>

      <Cartao titulo="Como o risco é estimado">
        <Paragrafo>
          Soma-se a chuva de 3 dias (a maior janela entre ontem e daqui a 2 dias) e compara-se com faixas: abaixo de 40 mm é baixo; 40 a 70 moderado; 70 a 110 alto; 110 a 160 severo; 160 ou mais extremo. Se choveu 100 mm ou mais nos 7 dias anteriores, o nível sobe um grau, porque o solo tende a estar encharcado.
        </Paragrafo>
        <Paragrafo>
          A confiança cai quando faltam dados, quando a estimativa depende muito de previsão com baixa chance de chuva, quando os dados guardados são antigos ou quando a chuva passa do que as faixas cobrem.
        </Paragrafo>
      </Cartao>

      <View style={estilos.limitacoes}>
        <Text style={estilos.limitacoesTitulo} accessibilityRole="header">
          ⚠ Limitações e vieses
        </Text>
        <Paragrafo>
          Só a chuva é considerada: nível dos rios, relevo, drenagem e barragens ficam de fora. Os limiares são ilustrativos do protótipo e precisam ser calibrados com o histórico de alagamentos. A grade de 10 km pode errar a chuva local, sobretudo em áreas de relevo irregular. Municípios menores ou com menos relatos de campo podem ter o risco subestimado. Nenhuma estimativa deve ser usada sozinha para decisões de alto impacto.
        </Paragrafo>
      </View>

      <Cartao titulo="Privacidade">
        <Paragrafo>
          O app não pede login, nome, telefone nem localização do aparelho. Relatos e decisões ficam só neste aparelho e nunca são enviados a servidores. A única comunicação externa é a consulta de chuva por município, que não envia dados pessoais. Os textos são verificados para bloquear telefones, documentos e e-mails.
        </Paragrafo>
        <Botao rotulo="Apagar dados do aparelho" variante="perigo" aoPressionar={apagar} dica="Apaga relatos, decisões e configurações" />
      </Cartao>

      <AvisoEmergencia />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  texto: { fontSize: tamanhoFonte.corpo, color: cores.texto, lineHeight: 22, marginBottom: espaco.sm },
  pequeno: { fontSize: tamanhoFonte.pequeno, color: cores.textoSuave },
  linhaSwitch: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, marginBottom: espaco.sm },
  limitacoes: {
    backgroundColor: cores.avisoFundo,
    borderColor: cores.avisoBorda,
    borderWidth: 1,
    borderLeftWidth: 6,
    borderRadius: 12,
    padding: espaco.lg,
    marginBottom: espaco.md,
  },
  limitacoesTitulo: { fontSize: tamanhoFonte.subtitulo, fontWeight: '800', color: cores.aviso, marginBottom: espaco.sm },
});
