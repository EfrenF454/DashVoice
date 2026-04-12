import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useMemo } from 'react';

export default function NotFound() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Stack.Screen options={{ title: 'Página no encontrada' }} />
      <View style={styles.container}>
        <Text style={styles.texto}>Esta pantalla no existe.</Text>
        <Link href="/" style={styles.enlace}>
          Ir al inicio
        </Link>
      </View>
    </>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    texto: {
      color: c.text,
      fontSize: 18,
      marginBottom: 16,
    },
    enlace: {
      color: c.primary,
      fontSize: 16,
    },
  });
}
