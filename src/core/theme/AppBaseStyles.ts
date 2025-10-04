import { TextStyle, ViewStyle } from 'react-native';
import { useThemeProvider } from './ThemeProvider';

export const AppBaseStyle = {
  container: (): ViewStyle => {
    const { theme } = useThemeProvider();
    return {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme.colors.background,
    };
  },

  card: (): ViewStyle => {
    const { theme } = useThemeProvider();
    return {
      borderRadius: 12,
      padding: 16,
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
    };
  },

  title: (): TextStyle => {
    const { theme } = useThemeProvider();
    return {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
      color: theme.colors.text,
    };
  },

  input: (): ViewStyle => {
    const { theme } = useThemeProvider();
    return {
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 12,
      //fontSize: 16,
      borderColor: theme.colors.border,
      //color: theme.colors.text,
      backgroundColor: theme.colors.card,
    };
  },

  buttonText: (): TextStyle => ({
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff', // Button text is always white
  }),

  underlineText: (): TextStyle => {
    const { theme } = useThemeProvider();
    return {
      textDecorationLine: 'underline',
      textAlign: 'center',
      fontWeight: '500',
      fontSize: 16,
      color: theme.colors.primary,
    };
  },
};
