// utils/OverlayMessage.ts
import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

export class OverlayMessage {
  /**
   * Show a toast message
   * @param type 'success' | 'error' | 'info'
   * @param message main text
   * @param description optional subtext
   * @param duration milliseconds to auto hide
   */
  static show(
    type: ToastType,
    message: string,
    description?: string,
    duration: number = 2000
  ) {
    Toast.show({
      type,
      text1: message,
      text2: description,
      visibilityTime: duration,
      position: 'top',
    });
  }

  static success(message: string, description?: string, duration?: number) {
    this.show('success', message, description, duration);
  }

  static error(message: string, description?: string, duration?: number) {
    this.show('error', message, description, duration);
  }

  static info(message: string, description?: string, duration?: number) {
    this.show('info', message, description, duration);
  }

  /**
   * Hide all currently visible toasts
   */
  static hide() {
    Toast.hide();
  }
}
