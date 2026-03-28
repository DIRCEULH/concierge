import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';



export default function CadastroScreen() {



    useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem('user');

      if (!user) {
        router.replace('/login'); 
      }
    };

    checkLogin();
  }, []);


  const [form, setForm] = useState({
    cpf_cnpj: '',
    nome: '',
    empresa: '',
    data_entrada: '',
    data_saida: '',
    placa: '',
    destino: '',
    atendente: '',
    obs: '',
  });

  const router = useRouter();

  // ✅ Carregar atendente do AsyncStorage

  const [user, setUser] = useState('');
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStorage = await AsyncStorage.getItem('user');
        const userValue = userStorage ? JSON.parse(userStorage) : '';
         setUser(userValue);
        setForm(prev => ({
          ...prev,
          atendente: userStorage ? JSON.parse(userStorage) : '',
        }));
      } catch (error) {
        console.log('Erro ao carregar user:', error);
      }
    };

    loadUser();
  }, []);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(title + ': ' + message);
    } else {
      Alert.alert(title, message);
    }
  };

  const start = async () => {
    router.replace('/(tabs)');
  };

  // ✅ Atualizar form e salvar atendente no AsyncStorage
  const handleChange = async (campo: string, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));

    if (campo === 'atendente') {
      try {
        await AsyncStorage.setItem('user', JSON.stringify(valor));
      } catch (error) {
        console.log('Erro ao salvar user:', error);
      }
    }
  };

  const salvar = async () => {
    try {
      if (!form.nome) {
        showMessage('Erro', 'Nome é obrigatório');
        return;
      }

      const response = await axios.post('http://192.168.0.5:3000/visitors', form);

      showMessage('Sucesso', 'Registro salvo! ' + JSON.stringify(response.data));

      // limpar formulário
      setForm({
        cpf_cnpj: '',
        nome: '',
        empresa: '',
        data_entrada: '',
        data_saida: '',
        placa: '',
        destino: '',
        atendente: user,
        obs: '',
      });

    } catch (error: any) {
      console.error('Erro ao salvar:', error);

      if (error.response) {
        showMessage('Erro API', JSON.stringify(error.response.data));
      } else if (error.request) {
        showMessage('Erro', 'Servidor não respondeu');
      } else {
        showMessage('Erro', error.message);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput placeholder="CPF/CNPJ" value={form.cpf_cnpj} onChangeText={(v) => handleChange('cpf_cnpj', v)} style={styles.input} />
      <TextInput placeholder="Nome" value={form.nome} onChangeText={(v) => handleChange('nome', v)} style={styles.input} />
      <TextInput placeholder="Empresa" value={form.empresa} onChangeText={(v) => handleChange('empresa', v)} style={styles.input} />

      <MaskedTextInput
        mask="99/99/9999 99:99"
        placeholder="Data Entrada (DD/MM/YYYY HH:mm)"
        keyboardType="numeric"
        value={form.data_entrada}
        onChangeText={(text) => handleChange('data_entrada', text)}
        style={styles.input}
      />

      <MaskedTextInput
        mask="99/99/9999 99:99"
        placeholder="Data Saída (DD/MM/YYYY HH:mm)"
        keyboardType="numeric"
        value={form.data_saida}
        onChangeText={(text) => handleChange('data_saida', text)}
        style={styles.input}
      />

      <TextInput placeholder="Placa" value={form.placa} onChangeText={(v) => handleChange('placa', v)} style={styles.input} />
      <TextInput placeholder="Destino" value={form.destino} onChangeText={(v) => handleChange('destino', v)} style={styles.input} />

      {/* ✅ Corrigido: agora pega do form.atendente */}
      <View style={[styles.input, styles.inputDisabled]}>
        <Text selectable>{form.atendente}</Text>
      </View>
      <TextInput placeholder="Observações" value={form.obs} onChangeText={(v) => handleChange('obs', v)} style={styles.input} multiline />

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Salvar" onPress={salvar} />
        </View>

        <View style={styles.button}>
          <Button title="Voltar" onPress={start} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop:25,
    backgroundColor:'#000'
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 3,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },

  button: {
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  inputDisabled: {
    backgroundColor: '#eee', // fundo cinza claro para indicar que está desabilitado
    color: '#666',           // texto com cor mais clara
    opacity: 0.7,            // leve opacidade para efeito visual
  },
});