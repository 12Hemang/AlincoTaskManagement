import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { Images } from '../../../core/constants/Assets';
import { Sizes } from '../../../core/constants/Sizes';
import { useThemeProvider } from '../../../core/theme/ThemeProvider';
import { AuthController } from '../controller/AuthController';
import { OverlayMessage } from '../../../core/components/OverlayMessage';
import { AppLocalization } from '../../../core/localization/AppLocalization';
import { LanguageManager } from '../../../core/localization/LanguageManager';
import styles from '../style/LoginStyle.style'; // ✅ default import

// Initialize localization module
const loginStrings = AppLocalization('login');

const LoginScreen: React.FC = () => {
  const { theme } = useThemeProvider();
  const authController = new AuthController();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [, forceRender] = useState(0); // to re-render on language change

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await authController.login(username, password);
      OverlayMessage.success(
        `${loginStrings.get('loginButton')} ${loginStrings.get('successSuffix')}`,
        `${loginStrings.get('loginTitle')} ${user.fullName}`
      );
    } catch (e: any) {
      OverlayMessage.error(
        `${loginStrings.get('loginButton')} ${loginStrings.get('failedSuffix')}`,
        e.message || 'Please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      await authController.skipAsGuest();
      OverlayMessage.info(loginStrings.get('loginButton'), 'You are logged in as guest');
    } catch {
      OverlayMessage.error('Guest login failed');
    }
  };

  const switchLanguage = () => {
    const newLang = LanguageManager.getLanguage() === 'en' ? 'hi' : 'en';
    LanguageManager.setLanguage(newLang);
    forceRender(n => n + 1); // re-render to reflect updated language
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        
           <Image
            source={Images.logo}
            style={{ width: Sizes.logoWidth, height: Sizes.logoHeight, alignSelf: 'center', marginBottom: 16 }}
            resizeMode="contain"
          />
        
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{loginStrings.get('loginTitle')}</Text>

          <TextInput
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.card }]}
            placeholder={loginStrings.get('usernamePlaceholder')}
            placeholderTextColor={theme.colors.placeholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.card }]}
            placeholder={loginStrings.get('passwordPlaceholder')}
            placeholderTextColor={theme.colors.placeholder}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={handleLogin} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{loginStrings.get('loginButton')}</Text>}
          </TouchableOpacity>

          {/* Underline text buttons */}
          <TouchableOpacity onPress={handleGuest}>
            <Text style={[styles.underlineText, { color: theme.colors.primary }]}>
              {loginStrings.get('skipGuest')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={switchLanguage}>
            <Text style={[styles.underlineText, { color: theme.colors.primary }]}>
              {LanguageManager.getLanguage() === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
