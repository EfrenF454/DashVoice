import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { solicitarPermisosNotificaciones } from '@/services/notificaciones';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

const papTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6C63FF',
    background: '#0F0F1A',
    surface: '#1A1A2E',
  },
};

// ── Guarda de autenticación ──────────────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, cargando } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (cargando) return;

    const enLoginScreen = segments[0] === 'login';

    if (!session && !enLoginScreen) {
      router.replace('/login');
    } else if (session && enLoginScreen) {
      router.replace('/(tabs)');
    }
  }, [session, cargando, segments]);

  return <>{children}</>;
}

// ── Layout raíz ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      solicitarPermisosNotificaciones();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <PaperProvider theme={papTheme}>
        <StatusBar style="light" />
        <AuthProvider>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthGuard>
        </AuthProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
