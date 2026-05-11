import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function CadastroScreen() {

  const router = useRouter();


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
    codigo_tipo: '',
    nome_tipo: ''
  });

  type Visitante = {
    cpf_cnpj: string;
    nome: string;
    empresa: string;
    placa?: string;
    codigo_tipo: string;
    nome_tipo: string;
  };

  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem('user');

      if (!user) {
        router.replace('/login');
        return;
      }

      await fetchTipos();
    };

    checkLogin();
  }, []);

  useEffect(() => {
    if (form.cpf_cnpj) {
      buscarVeiculos();
    }
  }, [form.cpf_cnpj]);


  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<Visitante[]>([]);
  const [tipos, setTipos] = useState<Visitante[]>([]);
  const [placas, setPlacas] = useState<any[]>([]);


  const buscarVeiculos = async () => {
    try {
      const response = await fetch(
        `https://api-concierge.vercel.app/vehicles?cpf_cnpj=${form.cpf_cnpj}`
      );

      const data = await response.json();

      console.log('RETORNO API:', data);

      setPlacas(Array.isArray(data) ? data : []);

    } catch (error) {
      console.log('Erro ao buscar veículos:', error);
    }
  };

  const start = async () => {
    router.replace('/(tabs)');
  };

  const fetchTipos = async () => {
    try {
      const res = await fetch('https://api-concierge.vercel.app/visitor_type');
      const data = await res.json();

      console.log('TIPOS API:', data);

      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setTipos(lista);

    } catch (err) {
      console.log('Erro ao buscar tipos:', err);
      setTipos([]);
    }
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
        `https://api-concierge.vercel.app/buscaVisitantes?search=${clean}`
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

      // if (!form.data_entrada) return showMessage('Erro', 'data_entrada obrigatório');
      // if (!form.data_saida) return showMessage('Erro', 'data_saida obrigatório');
      if (!form.placa) return showMessage('Erro', 'placa obrigatório');
      if (!form.destino) return showMessage('Erro', 'destino obrigatório');
      if (!form.local) return showMessage('Erro', 'local obrigatório');
      if (!form.codigo_tipo) return showMessage('Erro', 'Tipo de Pessoa obrigatório');

      console.log('Dirceu', form.placa)

      const response = await axios.post(
        'https://api-concierge.vercel.app/visitors',
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
        codigo_tipo: '',
        nome_tipo: ''
      });

      setBusca('');
      setResultados([]);

    } catch (error: any) {
      showMessage('Erro', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Cadastro de Pessoas</Text>

        {/* 🔥 INPUT INTELIGENTE */}
        <View>
          <TextInput
            placeholder="CPF ou CNPJ"
            placeholderTextColor="#000"
            value={busca}
            onChangeText={(text) => {
              const formatted = formatCpfCnpj(text);

              setBusca(formatted);
              handleChange('cpf_cnpj', formatted);

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

        <TextInput
          placeholder="Nome"
          placeholderTextColor="#000"
          value={form.nome}
          onChangeText={(v) => handleChange('nome', v)}
          style={styles.input}
        />

        <TextInput
          placeholder="Empresa"
          placeholderTextColor="#000"
          value={form.empresa}
          onChangeText={(v) => handleChange('empresa', v)}
          style={styles.input}
        />

        <MaskedTextInput
          mask="99/99/9999 99:99"
          placeholder="Data Entrada"
          placeholderTextColor="#000"
          value={form.data_entrada}
          onChangeText={(v) => handleChange('data_entrada', v)}
          style={styles.input}
        />

        <MaskedTextInput
          mask="99/99/9999 99:99"
          placeholder="Data Saída"
          placeholderTextColor="#000"
          value={form.data_saida}
          onChangeText={(v) => handleChange('data_saida', v)}
          style={styles.input}
        />



        {Array.isArray(placas) && placas.length > 0 ? (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.placa}
              onValueChange={(value) => handleChange('placa', value)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione a placa" value="" />

              {placas.map((item) => (
                <Picker.Item
                  key={item.id}
                  label={item.placa}
                  value={item.placa}
                />
              ))}
            </Picker>
          </View>
        ) : (
          <TextInput
            placeholder="Placa"
            placeholderTextColor="#000"
            value={form.placa}
            onChangeText={(v) => handleChange('placa', v)}
            style={styles.input}
          />
        )}

        <TextInput
          placeholder="Destino"
          placeholderTextColor="#000"
          value={form.destino}
          onChangeText={(v) => handleChange('destino', v)}
          style={styles.input}
        />

        <View style={[styles.input, styles.inputDisabled]}>
          <Text>{form.atendente}</Text>
        </View>

        <Picker
          selectedValue={form.local}
          onValueChange={(itemValue) => handleChange('local', itemValue)}
          style={styles.input}
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

        <Picker
          selectedValue={form.codigo_tipo}
          onValueChange={(itemValue) => handleChange('codigo_tipo', itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Selecione o tipo..." value="" />

          {tipos.map((tipo) => (
            <Picker.Item
              key={tipo.codigo_tipo}
              label={tipo.nome_tipo}
              value={tipo.codigo_tipo}
            />
          ))}
        </Picker>

        <TextInput
          placeholder="Obs"
          placeholderTextColor="#000"
          value={form.obs}
          onChangeText={(v) => handleChange('obs', v)}
          style={styles.input}
          multiline
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={salvar}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={start}>
            <Ionicons name="arrow-back-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  // 🔥 controla o comportamento do scroll (ANDROID + WEB)
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#000',
  },

  // 🔥 container centralizado com largura limitada
  formContainer: {
    width: '90%',
    maxWidth: 400,
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },

  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    color: '#000'
  },

  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    maxHeight: 150,
  },

  item: {
    padding: 10,
    borderBottomWidth: 1,
  },

  inputDisabled: {
    backgroundColor: '#eee',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },

  picker: {
    height: 50,
    width: '100%',
  },
});
