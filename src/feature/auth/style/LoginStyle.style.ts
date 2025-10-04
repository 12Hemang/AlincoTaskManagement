// LoginStyle.style.ts
import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12, fontSize: 16 },
  button: { marginTop: 8, borderRadius: 8, overflow: 'hidden', paddingVertical: 12 },
  buttonText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#fff' },
  error: { color: '#ff4d4f', fontSize: 14, marginBottom: 12, textAlign: 'left' },
  secondaryButton: { paddingVertical: 10, borderRadius: 8, borderWidth: 1, marginBottom: 10 },
  secondaryButtonText: { textAlign: 'center', fontSize: 16, fontWeight: '500' },
  underlineText: { textDecorationLine: 'underline', textAlign: 'center', fontSize: 16, fontWeight: '500', marginVertical: 8 },
});

export default styles;
