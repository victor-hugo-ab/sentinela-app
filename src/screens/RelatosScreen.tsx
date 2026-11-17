import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { Cartao } from '../components/Cartao';
import { confirmar } from '../components/confirmar';
import { EstadoVazio } from '../components/Avisos';
import { Seletor } from '../components/Seletor';
import { Tela } from '../components/Tela';
import { formatarDataHora } from '../domain/datas';
import { MUNICIPIOS, nomeDoMunicipio } from '../domain/municipios';
import { GRAVIDADES_RELATO, GravidadeRelato, TIPOS_RELATO, TipoRelato } from '../domain/tipos';
import { CampoRelato, LIMITES, validarRelato } from '../domain/validacao';
import { useApp } from '../state/AppContext';
import { cores, espaco, raio, tamanhoFonte } from '../theme/tema';

export function RelatosScreen() {
  const { estado, adicionarRelato, removerRelato } = useApp();

  const [municipioId, setMunicipioId] = useState('');
  const [local, setLocal] = useState('');
  const [tipo, setTipo] = useState('');
  const [gravidade, setGravidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erros, setErros] = useState<Partial<Record<CampoRelato, string>>>({});
  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  const enviar = () => {
    const resultado = validarRelato({ municipioId, local, tipo, gravidade, descricao });
    setErros(resultado.erros);
    setConfirmacao(null);
    if (!resultado.valido) return;

    adicionarRelato({
      municipioId: resultado.dados.municipioId,
      local: resultado.dados.local,
      tipo: resultado.dados.tipo as TipoRelato,
      gravidade: resultado.dados.gravidade as GravidadeRelato,
      descricao: resultado.dados.descricao,
    });
    setMunicipioId('');
    setLocal('');
    setTipo('');
    setGravidade('');
    setDescricao('');
    setConfirmacao('Relato registrado neste aparelho.');
  };

  const excluir = async (id: string) => {
    const certeza = await confirmar('Excluir relato', 'Este relato será apagado do aparelho. Não dá para desfazer.', 'Excluir');
    if (certeza) removerRelato(id);
  };

  return (
    <Tela>
      <Cartao titulo="Registrar relato de campo">
        <Text style={estilos.ajuda}>
          Informações de campo complementam a previsão de chuva. Não peça nem registre nome, telefone, documento ou endereço exato de moradores.
        </Text>

        {confirmacao ? (
          <View style={estilos.sucesso} accessibilityLiveRegion="polite">
            <Text style={estilos.sucessoTexto}>✓ {confirmacao}</Text>
          </View>
        ) : null}

        <Seletor
          rotulo="Município"
          opcoes={MUNICIPIOS.map((m) => ({ valor: m.id, rotulo: m.nome }))}
          valor={municipioId}
          aoEscolher={setMunicipioId}
          erro={erros.municipioId}
          rolagem
        />
        <CampoTexto
          rotulo="Bairro ou ponto de referência"
          valor={local}
          aoMudar={setLocal}
          erro={erros.local}
          placeholder="Ex.: Bairro Centro, perto da rodoviária"
          limite={LIMITES.local.max}
        />
        <Seletor rotulo="Tipo de ocorrência" opcoes={TIPOS_RELATO} valor={tipo} aoEscolher={setTipo} erro={erros.tipo} />
        <Seletor rotulo="Gravidade" opcoes={GRAVIDADES_RELATO} valor={gravidade} aoEscolher={setGravidade} erro={erros.gravidade} />
        <CampoTexto
          rotulo="Descrição"
          valor={descricao}
          aoMudar={setDescricao}
          erro={erros.descricao}
          placeholder="O que está acontecendo? Há risco para pessoas?"
          multilinha
          limite={LIMITES.descricaoRelato.max}
        />
        <Botao rotulo="Registrar relato" aoPressionar={enviar} />
      </Cartao>

      <Text style={estilos.titulo} accessibilityRole="header">
        Relatos registrados ({estado.relatos.length})
      </Text>
      {estado.relatos.length === 0 ? (
        <EstadoVazio titulo="Nenhum relato ainda" texto="Os relatos que você registrar aparecem aqui e no detalhe do alerta do município." />
      ) : (
        estado.relatos.map((r) => (
          <View key={r.id} style={estilos.relato}>
            <Text style={estilos.relatoTitulo}>
              {nomeDoMunicipio(r.municipioId)} · {r.local}
            </Text>
            <Text style={estilos.meta}>
              {TIPOS_RELATO.find((t) => t.valor === r.tipo)?.rotulo} · Gravidade {GRAVIDADES_RELATO.find((g) => g.valor === r.gravidade)?.rotulo.toLowerCase()}
            </Text>
            <Text style={estilos.descricao}>{r.descricao}</Text>
            <Text style={estilos.meta}>{formatarDataHora(r.criadoEm)}</Text>
            <Botao
              rotulo="Excluir"
              variante="secundario"
              aoPressionar={() => excluir(r.id)}
              dica="Apaga este relato do aparelho"
              estilo={{ marginTop: espaco.sm, alignSelf: 'flex-start' }}
            />
          </View>
        ))
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  ajuda: { fontSize: tamanhoFonte.pequeno, color: cores.textoSuave, marginBottom: espaco.lg },
  titulo: { fontSize: tamanhoFonte.subtitulo, fontWeight: '800', color: cores.texto, marginVertical: espaco.sm },
  relato: {
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    marginBottom: espaco.md,
    gap: 4,
  },
  relatoTitulo: { fontSize: tamanhoFonte.subtitulo, fontWeight: '700', color: cores.texto },
  meta: { fontSize: tamanhoFonte.pequeno, color: cores.textoSuave },
  descricao: { fontSize: tamanhoFonte.corpo, color: cores.texto, lineHeight: 22, marginVertical: 4 },
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
