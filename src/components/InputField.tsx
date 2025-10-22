import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  multiline?: boolean;
};

const InputField: React.FC<Props> = ({ label, value, onChangeText, editable = true, multiline = false }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: editable ? '#fff' : '#f5f5f5' }]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
      />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#333',
  },
});
