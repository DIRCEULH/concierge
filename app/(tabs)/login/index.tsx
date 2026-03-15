// app/(abs)/login/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Platform, StyleSheet, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
  try {
    const res = await axios.post('http://192.168.0.5:3000/register', { email, password });
    Alert.alert(res.data.message);
  } catch (err: any) {
    Alert.alert('Erro', err.response?.data?.message || err.message);
  }
};

const showMessage = (title: string, message: string) => {

  if (Platform.OS === "web") {
    alert(title + ": " + message);
  } else {
    Alert.alert(title, message,[
      {
        text: "OK",
        onPress: () => router.replace("/")
      }
    ]);
  }

};

const handleLogin = async () => {
  try {

    const res = await axios.post("http://192.168.0.5:3000/login", {
      email,
      password
    });

   // showMessage("ok!", res.data.message);
    router.replace('/');

  } catch (err: any) {

    console.log(err.response?.data);

   showMessage("Atenção", err.response?.data?.message || err.message);

  }
};




  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Login</ThemedText>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Cadastrar" onPress={handleRegister} />
      <View style={{ height: 10 }} />
      <Button title="Login" onPress={handleLogin} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, gap: 12 },
  input: { borderWidth: 1, borderColor: '#888', borderRadius: 6, padding: 10, marginBottom: 8 },
});