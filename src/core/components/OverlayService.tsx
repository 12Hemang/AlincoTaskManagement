// utils/OverlayService.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';

let setOverlayVisible: ((visible: boolean) => void) | null = null;

// Overlay component
export const Overlay = () => {
  const [visible, updateVisible] = useState(false);

  useEffect(() => {
    setOverlayVisible = updateVisible;
    return () => {
      setOverlayVisible = null;
    };
  }, []);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    </Modal>
  );
};

// Functions to show/dismiss overlay
export const showOverlay = () => setOverlayVisible && setOverlayVisible(true);
export const dismissOverlay = () => setOverlayVisible && setOverlayVisible(false);

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
