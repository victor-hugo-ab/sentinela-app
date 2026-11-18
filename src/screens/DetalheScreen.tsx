import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AvisoFonte, EstadoVazio } from '../components/Avisos';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { Caixa } from '../components/Caixa';
import { Cartao } from '../components/Cartao';
import { GraficoChuva } from '../components/GraficoChuva';
import { Seletor } from '../components/Seletor';
import { SeloConfianca, SeloNivel } from '../components/Selos';
import { Tela } from '../components/Tela';
import { formatarDataHora, formatarMm } from '../domain/datas';
import { nomeDoMunicipio } from '../domain/municipios';
import { ACOES_DECISAO, TIPOS_RELATO } from '../domain/tipos';
import { CampoDecisao, LIMITES, validarDecisao } from '../domain/validacao';
import { useLarguraCartao } from '../hooks/useLargura';
import type { RaizParams } from '../navigation/tipos';
import { useApp } from '../state/AppContext';
import { decisoesDoAlerta } from '../state/seletores';
import { cores, espaco, raio, tamanhoFonte } from '../theme/tema';

type Props = NativeStackScreenProps<RaizParams, 'Detalhe'>;

function Lista({ itens }: { itens: string[] }) {
  return (
    <View style={{ gap: espaco.sm }}>
      {itens.map((texto, i) => (
        <View key={i} style={estilos.item}>
          <Text style={estilos.marcador}>•</Text>
          <Text style={estilos.itemTexto}>{texto}</Text>
        </View>
      ))}
    </View>
  );
}

export function DetalheScreen({ route }: Props) {
  const { municipioId } = route.params;
  const { estado, avaliacaoDe, registrarDecisao } = useApp();
  const largura = useLarguraCartao();

  const [acao, setAcao] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [confirmou, setConfirmou] = useState(false);
  const [erros, setErros] = useState<Partial<Record<CampoDecisao, string>>>({});
  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  const avaliacao = avaliacaoDe(municipioId);
  const serie = estado.clima.series.find((s) => s.municipioId === municipioId);

  if (!avaliacao || !serie) {
    return (
      <Tela>
        <EstadoVazio titulo="Alerta não disponível" texto="Volte e atualize os dados." />
      </Tela>
    );
  }

  const nome = nomeDoMunicipio(municipioId);
  const historico = decisoesDoAlerta(estado.decisoes, avaliacao.alertaId);
  const relatosDoMunicipio = estado.relatos.filter((r) => r.municipioId === municipioId);

  const registrar = () => {
    const resultado = validarDecisao({ acao, justificativa, confirmou });
    setErros(resultado.erros);
    setConfirmacao(null);
    if (!resultado.valido) return;

    registrarDecisao({
      alertaId: avaliacao.alertaId,
      municipioId,
      nivel: avaliacao.nivel,
      confianca: avaliacao.confianca,
      acao: resultado.dados.acao as (typeof ACOES_DECISAO)[number]['valor'],
      justificativa: resultado.dados.justificativa,
    });
    setAcao('');
    setJustificativa('');
    setConfirmou(false);
    setConfirmacao('Decisão registrada neste aparelho. Este protótipo não envia avisos: no Sentinela completo, o aviso aprovado sai pelo WhatsApp.');
  };

  return (
    <Tela>
      <AvisoFonte fonte={avaliacao.fonte} atualizadoEm={avaliacao.atualizadoEm} aviso={estado.clima.aviso} />

      <Cartao>
        <Text style={estilos.nome} accessibilityRole="header">
          {nome}
        </Text>
        <View style={estilos.selos}>
          <SeloNivel nivel={avaliacao.nivel} grande />
          <SeloConfianca confianca={avaliacao.confianca} />
        </View>
        <Text style={estilos.destaque}>
          Estimativa de risco de alagamento com base na chuva. É um apoio à decisão, não uma ordem.
        </Text>
      </Cartao>

      <Cartao titulo="Por que este nível?">
        <Lista itens={avaliacao.justificativa} />
      </Cartao>

      <Cartao titulo="Quão confiável é?">
        <Lista itens={avaliacao.motivosConfianca} />
      </Cartao>

      <View style={estilos.limitacoes}>
        <Text style={estilos.limitacoesTitulo} accessibilityRole="header">
          ⚠ Limitações desta estimativa
        </Text>
        <Lista itens={avaliacao.limitacoes} />
      </View>

      <Cartao titulo="Chuva diária">
        <GraficoChuva dias={serie.dias} dataBase={avaliacao.dataBase} largura={largura} />
      </Cartao>

      <Cartao titulo={`Relatos de campo em ${nome}`}>
        {relatosDoMunicipio.length === 0 ? (
          <Text style={estilos.itemTexto}>Nenhum relato registrado para este município.</Text>
        ) : (
          <View style={{ gap: espaco.md }}>
            {relatosDoMunicipio.slice(0, 3).map((r) => (
              <View key={r.id}>
                <Text style={estilos.relatoTitulo}>
                  {TIPOS_RELATO.find((t) => t.valor === r.tipo)?.rotulo} · {r.local}
                </Text>
                <Text style={estilos.itemTexto}>{r.descricao}</Text>
                <Text style={estilos.pequeno}>{formatarDataHora(r.criadoEm)}</Text>
              </View>
            ))}
            {relatosDoMunicipio.length > 3 ? (
              <Text style={estilos.pequeno}>E mais {relatosDoMunicipio.length - 3} na aba Relatos.</Text>
            ) : null}
          </View>
        )}
      </Cartao>

      <Cartao titulo="Sugestão de encaminhamento">
        <Text style={estilos.itemTexto}>{avaliacao.sugestao}</Text>
        <Text style={[estilos.pequeno, { marginTop: espaco.sm }]}>
          A sugestão é genérica para o nível de risco. Quem decide é o gestor, com o que sabe do território.
        </Text>
      </Cartao>

      <Cartao titulo="Sua decisão">
        <Text style={[estilos.itemTexto, { marginBottom: espaco.md }]}>
          Nenhuma ação é tomada sozinha. Escolha o que fazer e explique o motivo: o registro fica guardado para auditoria.
        </Text>

        {confirmacao ? (
          <View style={estilos.sucesso} accessibilityLiveRegion="polite">
            <Text style={estilos.sucessoTexto}>✓ {confirmacao}</Text>
          </View>
        ) : null}

        <Seletor rotulo="O que fazer com este alerta?" opcoes={ACOES_DECISAO} valor={acao} aoEscolher={setAcao} erro={erros.acao} />
        <CampoTexto
          rotulo="Justificativa da decisão"
          ajuda="Sem nomes, telefones ou documentos de pessoas."
          valor={justificativa}
          aoMudar={setJustificativa}
          erro={erros.justificativa}
          multilinha
          limite={LIMITES.justificativaDecisao.max}
        />
        {acao === 'aprovar' ? (
          <Caixa
            rotulo="Revisei o nível, a confiança e as limitações desta estimativa."
            marcada={confirmou}
            aoAlternar={setConfirmou}
            erro={erros.confirmacao}
          />
        ) : null}
        <Botao rotulo="Registrar decisão" aoPressionar={registrar} />
      </Cartao>

      {historico.length > 0 ? (
        <Cartao titulo="Decisões registradas para este alerta">
          <View style={{ gap: espaco.md }}>
            {historico.map((d) => (
              <View key={d.id}>
                <Text style={estilos.relatoTitulo}>
                  {ACOES_DECISAO.find((a) => a.valor === d.acao)?.rotulo} · {formatarDataHora(d.criadaEm)}
                </Text>
                <Text style={estilos.itemTexto}>{d.justificativa}</Text>
              </View>
            ))}
          </View>
        </Cartao>
      ) : null}

      <Text style={estilos.pequeno}>
        Chuva máxima de 3 dias: {formatarMm(avaliacao.metricas.pico3dMm)} mm. Id do alerta: {avaliacao.alertaId}
      </Text>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  nome: { fontSize: tamanhoFonte.destaque, fontWeight: '800', color: cores.texto, marginBottom: espaco.sm },
  selos: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espaco.sm, marginBottom: espaco.md },
  destaque: { fontSize: tamanhoFonte.corpo, color: cores.textoSuave },
  item: { flexDirection: 'row', gap: espaco.sm },
  marcador: { fontSize: tamanhoFonte.corpo, color: cores.primaria, fontWeight: '800' },
  itemTexto: { flex: 1, fontSize: tamanhoFonte.corpo, color: cores.texto, lineHeight: 22 },
  pequeno: { fontSize: tamanhoFonte.pequeno, color: cores.textoSuave },
  relatoTitulo: { fontSize: tamanhoFonte.corpo, fontWeight: '700', color: cores.texto },
  limitacoes: {
    backgroundColor: cores.avisoFundo,
    borderColor: cores.avisoBorda,
    borderWidth: 1,
    borderLeftWidth: 6,
    borderRadius: raio.md,
    padding: espaco.lg,
    marginBottom: espaco.md,
  },
  limitacoesTitulo: { fontSize: tamanhoFonte.subtitulo, fontWeight: '800', color: cores.aviso, marginBottom: espaco.sm },
  sucesso: {
    backgroundColor: cores.sucessoFundo,
    borderColor: cores.sucesso,
    borderWidth: 1,
    borderRadius: raio.sm,
    padding: espaco.md,
    marginBottom: espaco.md,
  },
  sucessoTexto: { color: cores.sucesso, fontWeight: '700', fontSize: tamanhoFonte.corpo },
});
