import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function HomeScreen() {


  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    fetchRegistros();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/(tabs)/login');
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
      // const response = await fetch('https://sua-api.com/registros');
      const data = [
        {
          id: 1,
          cpf_cnpj: '111.111.111-11',
          nome: 'Carlos Pereira',
          empresa: 'Empresa Alpha',
          data_entrada: '2026-03-20',
          data_saida: '2026-03-20',
          placa: 'AAA-1111',
          destino: 'Curitiba',
          atendente: 'Juliana',
          obs: 'Visita técnica',
        },
        {
          id: 2,
          cpf_cnpj: '222.222.222-22',
          nome: 'Fernanda Lima',
          empresa: 'Empresa Beta',
          data_entrada: '2026-03-21',
          data_saida: '2026-03-21',
          placa: 'BBB-2222',
          destino: 'Florianópolis',
          atendente: 'Roberto',
          obs: 'Reunião',
        },
        {
          id: 3,
          cpf_cnpj: '333.333.333-33',
          nome: 'Marcos Souza',
          empresa: 'Empresa Gamma',
          data_entrada: '2026-03-22',
          data_saida: '2026-03-22',
          placa: 'CCC-3333',
          destino: 'Porto Alegre',
          atendente: 'Ana',
          obs: 'Entrega de material',
        },
      ];
      setTimeout( ()=> { setRegistros(data) })
} catch (error) {
  console.error('Erro ao buscar registros:', error);
  // showMessage('Erro ao buscar registros:', error);
} finally {
  setLoading(false);
}
  };



//const renderItem = ({ item }) => (

const renderItem = ({ item }: { item: Registro }) => (
  <View style={styles.row}>
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
);

if (loading) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text>Carregando...</Text>
    </View>
  );
}

return (
<ScrollView horizontal>
  <View>
    {<View style={styles.logoutContainer}> <Button title="Logout" onPress={logout} /> </View>}
    {/* Cabeçalho */}
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

    {/* Lista */}
    <FlatList
      data={registros}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />

  </View>
</ScrollView>);
}



const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },

  logoutContainer: { marginBottom: 10 },

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
    color: '#fff',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});