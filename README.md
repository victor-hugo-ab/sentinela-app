# Sentinela — Painel de Inteligência Territorial

App mobile em **React Native (Expo)** da Global Solution 2026.2, disciplina Cross-Platform Application Development, desafio Citizen Tech, case **Territory Predictive Insights**.

O Sentinela antecipa o risco de alagamento nos municípios do Vale do Taquari (RS) a partir da chuva observada e prevista, e apoia a decisão de um gestor público. O app **nunca decide nem envia avisos sozinho**: ele mostra o nível de risco com justificativa, confiança e limitações, e registra o que o gestor decidiu e por quê.

## Integrantes

| Nome completo | RM |
|---|---|
| Enzo Cerneviva | 563480 |
| Matheus Lara | 560449 |
| Victor Hugo | 564633 |

## O que o app faz

- **Painel:** indicadores (municípios em nível alto ou mais, alertas sem decisão, maior acumulado de chuva), gráfico de municípios por nível de risco e gráfico de chuva diária (observada x prevista) do município escolhido.
- **Alertas:** lista dos municípios do mais grave para o menos grave, com filtro "Sem decisão".
- **Detalhe do alerta:** nível, **justificativa** (por que este nível), **nível de confiança** com os motivos, **limitações**, gráfico, relatos de campo do município e sugestão de encaminhamento. O gestor escolhe *aprovar aviso*, *manter em observação* ou *rejeitar aviso*, **sempre com justificativa escrita**; aprovar exige confirmar que revisou nível, confiança e limitações.
- **Relatos de campo:** formulário validado para registrar ocorrências (alagamento, rio acima do normal, pessoas em risco etc.), com lista e exclusão.
- **Sobre e privacidade:** modo demonstração, fonte dos dados, método, limitações e vieses, e botão para apagar os dados do aparelho.

## Relação com o Sentinela completo

Este app é o painel do gestor do projeto **Sentinela** (estimativa diária de risco de alagamento no Vale do Taquari, com regressão logística, painel do operador e avisos por WhatsApp). Aqui, a estimativa usa a **regra simples** que no projeto completo serve de comparação para o modelo: se a chuva de 3 dias passa de certo limite, sobe o nível. Os níveis (baixo, moderado, alto, severo, extremo) e a regra de que o alerta nasce a partir de "alto" são os mesmos do projeto. Para ligar o modelo treinado, basta trocar a função `avaliarRisco` por uma chamada à API do Sentinela, sem mexer nas telas. O aviso aprovado não é enviado por este protótipo; no sistema completo ele sai pelo WhatsApp após a aprovação do operador.

## Como o risco é estimado

Regra simples e explicável (inspirada na regra de comparação do projeto Sentinela), não um modelo treinado:

1. Soma a chuva de 3 dias e toma a **maior janela entre ontem e daqui a 2 dias**.
2. Compara com faixas: abaixo de 40 mm = baixo; 40 a 70 = moderado; 70 a 110 = alto; 110 a 160 = severo; 160 ou mais = extremo.
3. Se choveu **100 mm ou mais nos 7 dias anteriores**, sobe um nível (solo encharcado).

**Confiança** (alta, média ou baixa) cai quando faltam dados de chuva, quando a estimativa depende de previsão com baixa chance de chuva, quando a chuva passa do que as faixas cobrem ou quando os dados guardados no aparelho são antigos (mais de 12 h). Dados guardados nunca passam de confiança média.

O código está em `src/domain/risco.ts` e é coberto por testes.

## Fontes de dados

- **Open-Meteo** (https://open-meteo.com), API pública e gratuita, sem chave: chuva diária (`precipitation_sum`) e chance máxima de chuva (`precipitation_probability_max`), 7 dias passados e 7 futuros, em uma única chamada para todos os municípios.
- **Cache local:** sem internet, o app mostra a última consulta guardada, com aviso.
- **Dados sintéticos:** o modo demonstração (aba Sobre) gera dados fictícios e determinísticos para apresentar sem internet. Aparece um aviso em todas as telas.
- Municípios: amostra de 10 do Vale do Taquari, com coordenadas aproximadas do centro urbano (Lajeado é o piloto do Sentinela).

## Limitações

- Considera **só a chuva**. Não inclui nível dos rios, relevo, drenagem urbana nem operação de barragens.
- Os **limiares são ilustrativos** do protótipo e precisam ser calibrados com o modelo do Sentinela e o histórico de alagamentos antes de qualquer uso real.
- A previsão vem de grade de cerca de 10 km e pode diferir da chuva local; a precisão cai a cada dia à frente.
- Possível viés: municípios menores ou com poucos relatos de campo podem ter o risco subestimado.
- Os relatos e decisões ficam só no aparelho: não há sincronização entre gestores.
- É um protótipo acadêmico. Nenhuma estimativa deve ser usada sozinha em decisões de alto impacto.

## Privacidade e acessibilidade

- Sem login, sem nome, sem telefone e **sem localização do aparelho**. Relatos e decisões ficam só no aparelho (AsyncStorage) e nunca são enviados. A única chamada externa é a consulta de chuva por município.
- Os textos digitados são verificados e **bloqueiam telefones, documentos e e-mails**.
- O botão "Apagar dados do aparelho" remove relatos, decisões e configurações.
- O nível de risco sempre aparece com **cor + símbolo + texto**, e a confiança com barras + texto. O gráfico distingue observado (barra cheia) de previsão (barra tracejada) sem depender de cor.
- Áreas de toque de pelo menos 48 px, rótulos de acessibilidade em botões, campos e gráficos, mensagens de erro anunciadas por leitores de tela.
- Telefones de emergência (Defesa Civil 199, Bombeiros 193, Polícia 190) em destaque; o app deixa claro que não substitui o socorro.

## Requisitos técnicos

| Requisito | Onde está |
|---|---|
| React Native | Expo SDK 58, TypeScript |
| Navegação entre telas | `src/navigation/` (abas + pilha, React Navigation) |
| Gerenciamento de estado | `src/state/` (`useReducer` + Context, reducer testado) |
| Consumo de API | `src/services/clima.ts` (Open-Meteo, com tempo limite e tratamento de erro) |
| Persistência | `src/services/armazenamento.ts` (AsyncStorage: relatos, decisões, configuração e cache de clima) |
| Formulários com validação | `src/domain/validacao.ts` (relato e decisão) |
| Componentes reutilizáveis e identidade visual | `src/components/` e `src/theme/tema.ts` |
| Acessibilidade e privacidade | ver seção acima |

## Como executar

Pré-requisitos: Node.js 18 ou superior. Para ver no celular, o app **Expo Go** (versão compatível com o SDK 58) ou um emulador.

```bash
npm install
npx expo start
```

Escaneie o QR code com o Expo Go, ou pressione `a` (Android) / `i` (iOS) para o emulador. Também roda no navegador com `npm run web`.

Para apresentar sem internet: aba **Sobre** → ligar **Modo demonstração**. No cenário fictício, Lajeado fica em risco severo (confiança alta), Estrela em alto (média), Encantado em alto (baixa, porque depende de previsão com pouca chance de chuva) e os demais entre moderado e baixo.

## Testes

```bash
npm test          # 65 testes (regras de risco, validação, estado, clima, seletores)
npm run typecheck # TypeScript estrito
```

## Estrutura

```
src/
├── domain/      regras puras: tipos, risco, validação, datas, municípios
├── services/    Open-Meteo, dados sintéticos, armazenamento local
├── state/       reducer, contexto e seletores
├── components/  Cartao, Botao, CampoTexto, Seletor, Caixa, Selos, gráficos, avisos
├── screens/     Painel, Alertas, Detalhe, Relatos, Sobre
├── navigation/  abas e pilha
└── theme/       cores, espaçamentos e escala de risco
__tests__/       testes automáticos (jest)
```
