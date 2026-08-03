import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/src/auth/AuthProvider';
import { bb } from '@/src/theme/tokens';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="light" backgroundColor={bb.colors.canvas} />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { token, loading } = useAuth();
  if (loading) return null;
  return (
      <Stack>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={Boolean(token)}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Add transaction' }} />
        </Stack.Protected>
      </Stack>
  );
}
