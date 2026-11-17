import React from 'react';
import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icone } from '../components/Icones';
import { AlertasScreen } from '../screens/AlertasScreen';
import { DetalheScreen } from '../screens/DetalheScreen';
import { PainelScreen } from '../screens/PainelScreen';
import { RelatosScreen } from '../screens/RelatosScreen';
import { SobreScreen } from '../screens/SobreScreen';
import { cores } from '../theme/tema';
import type { AbasParams, RaizParams } from './tipos';

const Abas = createBottomTabNavigator<AbasParams>();
const Pilha = createNativeStackNavigator<RaizParams>();

const tema: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: cores.primaria,
    background: cores.fundo,
    card: cores.primaria,
    text: cores.branco,
    border: cores.primariaEscura,
  },
};

function NavegacaoAbas() {
  return (
    <Abas.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.branco,
        headerTitleStyle: { fontWeight: '800' },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarStyle: { backgroundColor: cores.branco, borderTopColor: cores.borda, minHeight: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
      }}
    >
      <Abas.Screen
        name="Painel"
        component={PainelScreen}
        options={{ title: 'Sentinela', tabBarLabel: 'Painel', tabBarIcon: ({ color }) => <Icone nome="painel" cor={color} /> }}
      />
      <Abas.Screen
        name="Alertas"
        component={AlertasScreen}
        options={{ title: 'Alertas', tabBarIcon: ({ color }) => <Icone nome="alertas" cor={color} /> }}
      />
      <Abas.Screen
        name="Relatos"
        component={RelatosScreen}
        options={{ title: 'Relatos de campo', tabBarLabel: 'Relatos', tabBarIcon: ({ color }) => <Icone nome="relatos" cor={color} /> }}
      />
      <Abas.Screen
        name="Sobre"
        component={SobreScreen}
        options={{ title: 'Sobre e privacidade', tabBarLabel: 'Sobre', tabBarIcon: ({ color }) => <Icone nome="sobre" cor={color} /> }}
      />
    </Abas.Navigator>
  );
}

export function Navegacao() {
  return (
    <NavigationContainer theme={tema}>
      <Pilha.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: cores.primaria },
          headerTintColor: cores.branco,
          headerTitleStyle: { fontWeight: '800' },
        }}
      >
        <Pilha.Screen name="Abas" component={NavegacaoAbas} options={{ headerShown: false }} />
        <Pilha.Screen name="Detalhe" component={DetalheScreen} options={{ title: 'Detalhe do alerta' }} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
