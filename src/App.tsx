import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, View } from 'react-native';

import { ApiHelper } from './core/network/ApiHelper';
import { Overlay } from './core/components/OverlayService';
import { BASE_URLS } from './core/network/ApiConstants';

import { ThemeProvider, useThemeProvider } from './core/theme/ThemeProvider';

import LoginScreen from './feature/auth/presentation/LoginScren';


export type RootStackParamList = {
  Login: undefined;
  MovieList: undefined;
  MovieDetail: { movieId: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC<{ initialRoute: keyof RootStackParamList }> = ({
  initialRoute,
}) => {
  const { theme, isDark, toggleTheme } = useThemeProvider();

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />

      </Stack.Navigator>
      <Overlay />
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>('Login');

  useEffect(() => {
    ApiHelper.init(BASE_URLS.DEFAULT);

    const checkLogin = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setInitialRoute('MovieList');
      }
    };
    checkLogin();
  }, []);

  return (
    
    <ThemeProvider>
      <AppNavigator initialRoute={initialRoute} />
    </ThemeProvider>
  );
};

export default App;
