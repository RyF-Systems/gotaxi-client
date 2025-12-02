import { ToastProvider } from '@/hooks/toastContext';
import { useAuthStore } from '@/store/authStore';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Cargar fuentes
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter_18pt-Bold.ttf'),
  });

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  // Ocultar splash screen cuando las fuentes estén listas Y se haya hidratado el store
  useEffect(() => {
    if (fontsLoaded && hasHydrated) {
      SplashScreen.hideAsync();
      setIsNavigationReady(true);
    }
  }, [fontsLoaded, hasHydrated]);

  // Protección de rutas
  useEffect(() => {
    if (!isNavigationReady || !hasHydrated) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Usuario no autenticado tratando de acceder a rutas protegidas
      router.replace('(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Usuario autenticado en páginas de auth
      router.replace('(tabs)/');
    }
  }, [isAuthenticated, segments, isNavigationReady, hasHydrated, router]);

  if (!fontsLoaded || !isNavigationReady) {
    return null;
  }

  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="booking"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </ToastProvider>
  );
}