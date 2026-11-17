import type { NavigatorScreenParams } from '@react-navigation/native';

export type AbasParams = {
  Painel: undefined;
  Alertas: undefined;
  Relatos: undefined;
  Sobre: undefined;
};

export type RaizParams = {
  Abas: NavigatorScreenParams<AbasParams> | undefined;
  Detalhe: { municipioId: string };
};
