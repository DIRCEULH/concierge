import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function HomeScreen() {


  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [filtroNome, setFiltroNome] = useState('');
  const [registrosFiltrados, setRegistrosFiltrados] = useState<Registro[]>([]);

  useEffect(() => {
    fetchRegistros();
  }, []);

  useEffect(() => {
    const filtrados = registros.filter((item) =>
      item.nome.toLowerCase().includes(filtroNome.toLowerCase())
    );

    setRegistrosFiltrados(filtrados);
  }, [filtroNome, registros]);


  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');

    router.replace('/(tabs)/login');
  };

  const visitor = async () => {
    router.replace('/(tabs)/visitor');
  };


  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      alert(title + ": " + message);
    } else {
      Alert.alert(title, message);
    }
  };


  type Registro = {
    id: number;
    cpf_cnpj: string;
    nome: string;
    empresa: string;
    data_entrada: string;
    data_saida: string;
    placa: string;
    destino: string;
    atendente: string;
    obs: string;

  };



  const fetchRegistros = async () => {
    try {
       const response = await fetch('http://192.168.0.5:3000/visitantes');
       const data = await response.json();
      setTimeout(() => {

        setRegistros(data);
        setRegistrosFiltrados(data); // 🔥 importante
      }, 100);

    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      // showMessage('Erro ao buscar registros:', error);
    } finally {
      setLoading(false);
    }
  };





  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (

    <View>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Logout" onPress={logout} />
        </View>

        <View style={styles.button}>
          <Button title="Visitante" onPress={visitor} />
        </View>
      </View>
      {<View style={styles.logoutContainer}>
        <TextInput placeholder="Filtrar por nome..." value={filtroNome} onChangeText={setFiltroNome} style={{ borderWidth: 1, marginBottom: 10, padding: 8, backgroundColor: '#fff' }} />
      </View>}
      {/* Cabeçalho */}
      <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1 }}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerCell}>ID</Text>
            <Text style={styles.headerCell}>CPF/CNPJ</Text>
            <Text style={styles.headerCell}>NOME</Text>
            <Text style={styles.headerCell}>EMPRESA</Text>
            <Text style={styles.headerCell}>ENTRADA</Text>
            <Text style={styles.headerCell}>SAÍDA</Text>
            <Text style={styles.headerCell}>PLACA</Text>
            <Text style={styles.headerCell}>DESTINO</Text>
            <Text style={styles.headerCell}>ATENDENTE</Text>
            <Text style={styles.headerCell}>OBS</Text>
          </View>

          {/* LINHAS */}
          {registrosFiltrados.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.cell}>{item.id}</Text>
              <Text style={styles.cell}>{item.cpf_cnpj}</Text>
              <Text style={styles.cell}>{item.nome}</Text>
              <Text style={styles.cell}>{item.empresa}</Text>
              <Text style={styles.cell}>{item.data_entrada}</Text>
              <Text style={styles.cell}>{item.data_saida}</Text>
              <Text style={styles.cell}>{item.placa}</Text>
              <Text style={styles.cell}>{item.destino}</Text>
              <Text style={styles.cell}>{item.atendente}</Text>
              <Text style={styles.cell}>{item.obs}</Text>
            </View>
          ))}

        </View>
      </ScrollView>

    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },

  logoutContainer: { marginHorizontal: 1, marginBottom: 5 },

  buttonContainer: {
    flexDirection: 'row', // 🔥 lado a lado
    justifyContent: 'space-between', // ou 'flex-start'
    marginBottom: 5,
  },

  button: {
    flex: 1, // 🔥 divide espaço igual
    marginHorizontal: 1,
  },

  header: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    paddingVertical: 5,
  },

  headerCell: {
    width: 120, // 🔥 largura fixa
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 5,
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
  },

  cell: {
    width: 120, // 🔥 mesma largura do header
    fontSize: 12,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    color: '#fff',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});