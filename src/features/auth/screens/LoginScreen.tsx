import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { loginUser } from '../slice/authSlice';
import { NavigationRoutes } from '../../../app/navigation/AppNavigator';

export default function LoginScreen({ navigation }: any) {
  const [usr, setUsr] = useState('hemang.api@alnicoelectric.com');
  const [pwd, setPwd] = useState('Hemang@2871#');
  const dispatch = useAppDispatch();
  const { loading, error, sid } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (sid) navigation.replace(NavigationRoutes.Dashboard);
  }, [sid]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        
        <View style={styles.form}>
          <TextInput 
            placeholder="Email" 
            placeholderTextColor="#999"
            value={usr} 
            onChangeText={setUsr} 
            style={styles.input} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput 
            placeholder="Password" 
            placeholderTextColor="#999"
            value={pwd} 
            onChangeText={setPwd} 
            secureTextEntry 
            style={styles.input} 
          />
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={() => dispatch(loginUser({ usr, pwd }))}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
});