import { router, Stack, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '@/src/auth/AuthProvider';
import { bb } from '@/src/theme/tokens';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useNotificationObserver();
  return (
    <PaperProvider theme={{ ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary: bb.colors.emerald, surface: bb.colors.surface, onSurface: bb.colors.text, background: bb.colors.canvas } }}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="light" backgroundColor={bb.colors.canvas} />
      </AuthProvider>
    </PaperProvider>
  );
}

function useNotificationObserver() {
  useEffect(() => {
    const redirect = (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as Href);
    };
    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) redirect(response.notification);
    const subscription = Notifications.addNotificationResponseReceivedListener(response => redirect(response.notification));
    return () => subscription.remove();
  }, []);
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
          <Stack.Screen name="reminders" options={chromeHeader('Smart reminders')} />
          <Stack.Screen name="create-goal" options={chromeHeader('Create goal')} />
          <Stack.Screen name="contribute-goal" options={chromeHeader('Goal contribution')} />
          <Stack.Screen name="budget" options={chromeHeader('Monthly budget')} />
          <Stack.Screen name="tower" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack.Protected>
      </Stack>
  );
}

function chromeHeader(title: string) {
  return { title, headerStyle: { backgroundColor: bb.colors.carbon }, headerTintColor: bb.colors.title, headerTitleStyle: { color: bb.colors.title, fontWeight: '900' as const, fontFamily: bb.fonts.body } };
}
