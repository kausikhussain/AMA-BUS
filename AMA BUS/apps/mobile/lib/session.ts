import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession } from "@amaride/shared";

const SESSION_KEY = "amaride.mobile.session";

export const getSession = async () => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as AuthSession) : null;
};

export const saveSession = async (session: AuthSession) => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};
