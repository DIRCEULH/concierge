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
    local: '',
  });

  type Visitante = {
    cpf_cnpj: string;
    nome: string;
    empresa: string;
    placa?: string;
  };

  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<Visitante[]>([]);

  const start = async () => {
    router.replace('/(tabs)');
  };


  const formatCpfCnpj = (value: string) => {
    let v = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // 🔥 LIMITE
    if (/^\d+$/.test(v)) {
      v = v.slice(0, 11); // CPF
    } else {
      v = v.slice(0, 14); // CNPJ alfanumérico
    }

    // CPF
    if (/^\d+$/.test(v)) {
      v = v
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      return v;
    }

    // CNPJ alfanumérico
    v = v
      .replace(/^(.{2})(.{0,3})/, '$1.$2')
      .replace(/^(.{6})(.{0,3})/, '$1.$2')
      .replace(/^(.{10})(.{0,4})/, '$1/$2')
      .replace(/^(.{15})(.{0,2})/, '$1-$2');

    return v;
  };

  const buscarVisitantes = async (texto: string) => {
    const clean = texto.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (clean.length < 3) {
      setResultados([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://DIRCEUHEINECK:3000/buscaVisitantes?search=${clean}`
      );

      const data = response.data ?? [];

      const filtrados = data.filter((item: any) =>
        (item.cpf_cnpj ?? '')
          .replace(/[^a-zA-Z0-9]/g, '')
          .toUpperCase()
          .includes(clean)
      );
      setResultados(filtrados);
    } catch (error) {
      console.log('Erro busca:', error);
      setResultados([]);
    }
  };

  const [user, setUser] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userStorage = await AsyncStorage.getItem('user');
      const userValue = userStorage ? JSON.parse(userStorage) : '';

      setUser(userValue);

      setForm(prev => ({
        ...prev,
        atendente: userValue,
      }));
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

  const handleChange = (campo: string, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const salvar = async () => {
    try {
      if (!form.cpf_cnpj) return showMessage('Erro', 'CPF/CNPJ obrigatório');
      if (!form.nome) return showMessage('Erro', 'Nome obrigatório');
      if (!form.empresa) return showMessage('Erro', 'Empresa obrigatório');

      const response = await axios.post(
        'http://DIRCEUHEINECK:3000/visitors',
        form
      );

      showMessage('Sucesso', 'Registro salvo!');

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
        local: '',
      });

      setBusca('');
      setResultados([]);

    } catch (error: any) {
      showMessage('Erro', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      {/* 🔥 INPUT INTELIGENTE */}
      <View>
        <TextInput
          placeholder="CPF ou CNPJ"
          value={busca}
          onChangeText={(text) => {
            const formatted = formatCpfCnpj(text);

            setBusca(formatted);
            handleChange('cpf_cnpj', formatted);

            // 🔥 busca SEM máscara
            const clean = text.replace(/[^a-zA-Z0-9]/g, '');

            if (clean.length < 3) {
              setResultados([]);
              return;
            }

            buscarVisitantes(clean);
          }}
          style={styles.input}
        />

        {/* 🔥 AUTOCOMPLETE */}
        {resultados.length > 0 && (
          <View style={styles.dropdown}>
            <ScrollView>
              {resultados.map((item, index) => (
                <Text
                  key={index}
                  style={styles.item}
                  onPress={() => {
                    setResultados([]);

                    const formatted = formatCpfCnpj(item.cpf_cnpj || '');

                    setBusca(formatted);

                    setForm(prev => ({
                      ...prev,
                      cpf_cnpj: formatted,
                      nome: item.nome || '',
                      empresa: item.empresa || '',
                      placa: item.placa || '',
                    }));
                  }}
                >
                  {item.nome} - {item.empresa} ({item.cpf_cnpj})
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <TextInput placeholder="Nome" value={form.nome}
        onChangeText={(v) => handleChange('nome', v)} style={styles.input} />

      <TextInput placeholder="Empresa" value={form.empresa}
        onChangeText={(v) => handleChange('empresa', v)} style={styles.input} />

      <MaskedTextInput
        mask="99/99/9999 99:99"
        placeholder="Data Entrada"
        value={form.data_entrada}
        onChangeText={(v) => handleChange('data_entrada', v)}
        style={styles.input}
      />

      <MaskedTextInput
        mask="99/99/9999 99:99"
        placeholder="Data Saída"
        value={form.data_saida}
        onChangeText={(v) => handleChange('data_saida', v)}
        style={styles.input}
      />

      <TextInput placeholder="Placa" value={form.placa}
        onChangeText={(v) => handleChange('placa', v)} style={styles.input} />

      <TextInput placeholder="Destino" value={form.destino}
        onChangeText={(v) => handleChange('destino', v)} style={styles.input} />

      <View style={[styles.input, styles.inputDisabled]}>
        <Text>{form.atendente}</Text>
      </View>

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

      <TextInput placeholder="Obs" value={form.obs}
        onChangeText={(v) => handleChange('obs', v)}
        style={styles.input} multiline />

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
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  title: { fontSize: 20, color: '#fff', marginBottom: 10 },
  input: { backgroundColor: '#fff', padding: 10, marginBottom: 5, borderRadius: 5 },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    maxHeight: 150
  },
  item: {
    padding: 10,
    borderBottomWidth: 1
  },
  inputDisabled: {
    backgroundColor: '#eee'
  },
  button: {
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  }
});