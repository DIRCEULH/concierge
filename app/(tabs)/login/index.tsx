import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      alert(title + ": " + message);
    } else {
      Alert.alert(title, message);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 🔐 LOGIN
  const handleLogin = async () => {
    try {
      switch (true) {
        case !email:
          return showMessage("Atenção", "Email obrigatório!");

        case !password:
          return showMessage("Atenção", "Senha obrigatória!");

        default:
      }

      const res = await axios.post("http://192.168.0.12:3000/login", {
        email,
        password
      });

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(res.data.result[0].user)
      );

      router.replace('/(tabs)');

    } catch (err: any) {
      showMessage(
        "Erro",
        err.response?.data?.message || err.message
      );
    }
  };

  // 📝 CADASTRO
  const handleRegister = async () => {
    try {
      switch (true) {
        case !user:
          return showMessage("Atenção", "Usuário obrigatório!");

        case !email:
          return showMessage("Atenção", "Email obrigatório!");

        case !isValidEmail(email):
          return showMessage("Atenção", "Email inválido!");

        case !password:
          return showMessage("Atenção", "Senha obrigatória!");

        default:
      }

      const res = await axios.post(
        "http://192.168.0.12:3000/register",
        { user, email, password }
      );

      showMessage("Sucesso", res.data.message);

      // limpa campos e volta pro login
      setUser('');
      setEmail('');
      setPassword('');
      setIsRegister(false);

    } catch (err: any) {
      showMessage(
        "Erro",
        err.response?.data?.message || err.message
      );
    }
  };

return (
  <ThemedView style={styles.container}>
    <Image
  source={require('@/assets/images/Concierge.png')}
  style={styles.logo}
/>
    <ThemedText type="title">
      {isRegister ? "Cadastro" : "Login"}
    </ThemedText>

    {/* 👤 Usuário (só no cadastro) */}
    {isRegister && (
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} />
        <TextInput
          placeholder="Usuário"
          value={user}
          onChangeText={setUser}
          style={styles.input}
          autoCapitalize="none"
        />
      </View>
    )}

    {/* 📧 Email */}
    <View style={styles.inputContainer}>
      <Ionicons name="mail-outline" size={20} />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
    </View>

    {/* 🔒 Senha */}
    <View style={styles.inputContainer}>
      <Ionicons name="lock-closed-outline" size={20} />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
    </View>

    {/* 🔘 Botão principal */}
    <TouchableOpacity
      style={styles.button}
      onPress={isRegister ? handleRegister : handleLogin}
    >
      <Ionicons
        name={isRegister ? "person-add-outline" : "log-in-outline"}
        size={20}
        color="#fff"
      />
      <Text style={styles.buttonText}>
        {isRegister ? "Cadastrar" : "Login"}
      </Text>
    </TouchableOpacity>

    {/* 🔄 Alternar modo */}
    <TouchableOpacity
      onPress={() => setIsRegister(!isRegister)}
      style={styles.switchButton}
    >
      <Text style={{ color: '#007bff' }}>
        {isRegister
          ? "Já tem conta? Fazer login"
          : "Não tem conta? Cadastrar"}
      </Text>
    </TouchableOpacity>

  </ThemedView>
)}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 12
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff'
  },

  input: {
    flex: 1,
    paddingVertical: 10,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginTop: 10
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  switchButton: {
    marginTop: 10,
    alignItems: 'center'
  },
  logo: {
  width: 150,
  height: 150,
  alignSelf: 'center',
  marginBottom: 20,
  resizeMode: 'contain'
},
})