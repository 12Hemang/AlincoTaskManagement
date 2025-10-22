import AsyncStorage from '@react-native-async-storage/async-storage';

const SID_KEY = 'sid';
const USER_KEY = 'user';

// ✅ Save session (sid + user)
export const saveSession = async (sid: string, user: string) => {
  try {
    await AsyncStorage.multiSet([
      [SID_KEY, sid],
      [USER_KEY, user],
    ]);
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

// ✅ Get stored session
export const getSession = async (): Promise<{ sid: string | null; user: string | null }> => {
  try {
    const values = await AsyncStorage.multiGet([SID_KEY, USER_KEY]);
    const sid = values[0][1];
    const user = values[1][1];
    return { sid, user };
  } catch (error) {
    console.error('Error getting session:', error);
    return { sid: null, user: null };
  }
};

// ✅ Remove session
export const clearSession = async () => {
  try {
    await AsyncStorage.multiRemove([SID_KEY, USER_KEY]);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};
