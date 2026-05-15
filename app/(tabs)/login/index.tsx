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
  const [showPassword, setShowPassword] = useState(false);

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

      const res = await axios.post("https://api-concierge.vercel.app/login", {
        email,
        password
      });

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(res.data.result[0].user)
      )

      await AsyncStorage.setItem(
        'permissao',
        JSON.stringify(res.data.result[0].permissao)
      )

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
        "https://api-concierge.vercel.app/register",
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
      <View style={styles.card}>
        <Image
          source={require('@/assets/images/Concierge.png')}
          style={styles.logo}
        />
        <ThemedText type="title" style={styles.titleText}>
          {/* {isRegister ? "Cadastro" : "Login"} */}
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
          secureTextEntry={!showPassword}
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
          />
        </TouchableOpacity>
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
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  switchButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 15,
    resizeMode: 'contain',
  },
  titleText: {
    color: '#111',
    textAlign: 'center',
    marginBottom: 16,
  },
})