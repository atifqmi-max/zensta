import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme, darkTheme } from './src/constants/theme';
import { useColorScheme } from 'react-native';

export default function App() {
  const scheme = useColorScheme();
  
  return (
    <AuthProvider>
      <PaperProvider theme={scheme === 'dark' ? darkTheme : theme}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}
