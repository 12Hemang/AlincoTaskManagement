import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../feature/auth/domain/model/User';

const USER_KEY = 'APP_USER';

export class LocalStorage {
  static async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static async getUser(): Promise<User | null> {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  }

  static async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  }
}
