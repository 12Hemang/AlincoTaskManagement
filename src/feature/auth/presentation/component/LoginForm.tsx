// component/LoginForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import  styles  from '../../style/LoginStyle.style';


// Define the props interface here
export interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onForgot?: (email: string) => Promise<void>;
  onGuest?: () => Promise<void>;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onForgot, onGuest, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  return (
    <View style={styles.card}>
      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#1890ff' }]}
        onPress={() => onLogin(username, password)}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {onForgot && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email for Forgot Password"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#faad14' }]}
            onPress={() => onForgot(email)}
          >
            <Text style={styles.buttonText}>Forgot Password</Text>
          </TouchableOpacity>
        </>
      )}

      {onGuest && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#52c41a' }]}
          onPress={onGuest}
        >
          <Text style={styles.buttonText}>Continue as Guest</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
