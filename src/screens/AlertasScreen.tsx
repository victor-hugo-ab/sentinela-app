import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AvisoFonte, Carregando, EstadoVazio } from '../components/Avisos';
import { CartaoAlerta } from '../components/CartaoAlerta';
import { Seletor } from '../components/Seletor';
import { Tela } from '../components/Tela';
import type { AbasParams, RaizParams } from '../navigation/tipos';
import { useApp } from '../state/AppContext';
import { decisaoMaisRecente } from '../state/seletores';
import { cores, espaco, tamanhoFonte } from '../theme/tema';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AbasParams, 'Alertas'>,
  NativeStackScreenProps<RaizParams>
>;

type Filtro = 'todos' | 'pendentes';

export function AlertasScreen({ navigation }: Props) {
  const { estado, avaliacoes, atualizarClima } = useApp();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const { clima, decisoes } = estado;

  if (clima.status === 'carregando' && clima.series.length === 0) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  const lista = filtro === 'pendentes' ? avaliacoes.filter((a) => !decisaoMaisRecente(decisoes, a.alertaId)) : avaliacoes;

  return (
    <Tela atualizando={clima.status === 'carregando'} aoAtualizar={atualizarClima}>
      <AvisoFonte fonte={avaliacoes[0]?.fonte ?? 'api'} atualizadoEm={clima.avaliadoEm} aviso={clima.aviso} />
      <Text style={estilos.intro}>
        Do município com maior risco para o menor. Cada alerta é uma estimativa: abra para ver a justificativa, a confiança e as limitações antes de decidir.
      </Text>
      <Seletor
        rotulo="Mostrar"
        opcoes={[
          { valor: 'todos', rotulo: `Todos (${avaliacoes.length})` },
          { valor: 'pendentes', rotulo: 'Sem decisão' },
        ]}
        valor={filtro}
        aoEscolher={(v) => setFiltro(v as Filtro)}
      />
      {lista.length === 0 ? (
        <EstadoVazio
          titulo={avaliacoes.length === 0 ? 'Nenhum alerta disponível' : 'Todos os alertas já têm decisão'}
          texto={avaliacoes.length === 0 ? clima.erro ?? 'Puxe a tela para baixo para atualizar.' : undefined}
        />
      ) : (
        lista.map((a) => (
          <CartaoAlerta
            key={a.alertaId}
            avaliacao={a}
            decisao={decisaoMaisRecente(decisoes, a.alertaId)}
            aoPressionar={() => navigation.navigate('Detalhe', { municipioId: a.municipioId })}
          />
        ))
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  intro: { fontSize: tamanhoFonte.corpo, color: cores.textoSuave, marginBottom: espaco.lg },
});
