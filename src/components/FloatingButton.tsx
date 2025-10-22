import React from 'react';
import { TouchableOpacity, StyleSheet, Text,GestureResponderEvent } from 'react-native';

interface FloatingButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

export default function FloatingButton({ onPress }: FloatingButtonProps) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={{ fontSize: 24, color: '#fff' }}>＋</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
