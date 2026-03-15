// app/(abs)/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Button, StyleSheet } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Se quiser auto-redirecionar para login
    const timer = setTimeout(() => {
      router.replace('/login'); // vai para tela de login
    }, 1500); // 1,5s
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Bem-vindo!</ThemedText>
      <Button title="Ir para Login" onPress={() => router.push('/login')} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});