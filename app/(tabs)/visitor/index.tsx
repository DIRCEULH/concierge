import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
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

  const router = useRouter();

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
    local: '', // ✅ Novo campo local
  })

  const formatCpfCnpj = (value:String) => {
    let v = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // CPF (só números)
    if (/^\d+$/.test(v) && v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      return v;
    }

    // CNPJ alfanumérico
    v = v.replace(/^(.{2})(.{0,3})/, '$1.$2');
    v = v.replace(/^(.{6})(.{0,3})/, '$1.$2');
    v = v.replace(/^(.{10})(.{0,4})/, '$1/$2');
    v = v.replace(/^(.{15})(.{0,2})/, '$1-$2');

    return v;
  };


  const [user, setUser] = useState('');
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStorage = await AsyncStorage.getItem('user');
        const userValue = userStorage ? JSON.parse(userStorage) : '';
        setUser(userValue);
        setForm(prev => ({
          ...prev,
          atendente: userValue,
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
      if (!form.cpf_cnpj) {
        showMessage('Erro', 'CNPJ é obrigatório');
        return;
      }
      if (!form.nome) {
        showMessage('Erro', 'Nome é obrigatório');
        return;
      }
      if (!form.empresa) {
        showMessage('Erro', 'Empresa é obrigatório');
        return;
      }

      if (!form.destino) {
        showMessage('Erro', 'Destino é obrigatório');
        return;
      }
      if (!form.local) {
        showMessage('Erro', 'local é obrigatório');
        return;
      }
      if (!form.data_entrada) {
        showMessage('Erro', 'Data Entrada é obrigatório (00/00/0000 00:00)');
        return;
      }
      if (!form.data_saida) {
        showMessage('Erro', 'Data Saída é obrigatório! (00/00/0000 00:00)');
        return;
      }


      const response = await axios.post('http://192.168.0.12:3000/visitors', form);

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
        local: '', // resetar campo local
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

      <TextInput
        placeholder="CPF ou CNPJ"
        value={form.cpf_cnpj}
        onChangeText={(v) => { handleChange('cpf_cnpj', formatCpfCnpj(v)) }}
        autoCapitalize="characters"
        maxLength={18}
        style={styles.input}
      />

      <TextInput
        placeholder="Nome"
        value={form.nome}
        onChangeText={(v) => handleChange('nome', v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Empresa"
        value={form.empresa}
        onChangeText={(v) => handleChange('empresa', v)}
        style={styles.input}
      />

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

      <TextInput
        placeholder="Placa"
        value={form.placa}
        onChangeText={(v) => handleChange('placa', v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Destino"
        value={form.destino}
        onChangeText={(v) => handleChange('destino', v)}
        style={styles.input}
      />

      {/* Atendente desabilitado */}
      <View style={[styles.input, styles.inputDisabled]}>
        <Text selectable>{form.atendente}</Text>
      </View>

      {/* ✅ Picker para selecionar Local */}
      <View >
        <Picker
          selectedValue={form.local}
          onValueChange={(itemValue) => handleChange('local', itemValue)}
          style={[styles.input]}
        >
          <Picker.Item label="Selecione o local..." value="" />
          <Picker.Item label="MATRIZ" value="MATRIZ" />
          <Picker.Item label="CD-1" value="CD-1" />
          <Picker.Item label="CD-2" value="CD-2" />
          <Picker.Item label="CD-3" value="CD-3" />
          <Picker.Item label="CD-4" value="CD-4" />
          <Picker.Item label="FILIAL-1" value="FILIAL-1" />
          <Picker.Item label="FILIAL-2" value="FILIAL-2" />
          <Picker.Item label="FILIAL-3" value="FILIAL-3" />
          <Picker.Item label="FILIAL-4" value="FILIAL-4" />
        </Picker>
      </View>

      <TextInput
        placeholder="Observações"
        value={form.obs}
        onChangeText={(v) => handleChange('obs', v)}
        style={styles.input}
        multiline
      />

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
    marginTop: 25,
    backgroundColor: '#000'
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#fff'
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
    backgroundColor: '#eee', // fundo cinza claro
    color: '#666',           // texto mais claro
    opacity: 0.7,            // efeito visual
  },
});