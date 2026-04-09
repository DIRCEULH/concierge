import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Platform, StyleSheet, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      alert(title + ": " + message);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    try {
      console.log('Dirceu', user, email, password)

      switch (true) {
        case !user:
          return showMessage("Atenção", "Usuário Obrigatório!")


        case !email:
          return showMessage("Atenção", "Email Obrigatório!");


        case !password:
          return showMessage("Atenção", "Password Obrigatório!");


        default:

      }

      const res = await axios.post("http://192.168.0.12:3000/login", {
        user,
        email,
        password
      });


      await AsyncStorage.setItem(
        'user',
        JSON.stringify(res.data.result[0].user)
      );


      // ✅ vai pra tela principal
      router.replace('/(tabs)');

    } catch (err: any) {
      console.log(err.response?.data);

      showMessage(
        "Atenção",
        err.response?.data?.message || err.message
      );
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post('http://192.168.0.12:3000/register', { user, email, password });
      Alert.alert(res.data.message);
      showMessage('Atenção', res.data.message);
    } catch (err: any) {

      showMessage('Erro', err.response?.data?.message || err.message)
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Login</ThemedText>

      <TextInput
        placeholder="Usuário"
        value={user}
        onChangeText={setUser}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
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
  input: { borderWidth: 1, borderColor: '#888', borderRadius: 6, padding: 10, backgroundColor: '#fff', },
});