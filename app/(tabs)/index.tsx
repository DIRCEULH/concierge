import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function HomeScreen() {
  //const [registros, setRegistros] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useEffect(() => {
  //   fetchRegistros();
  // }, []);

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

  const [registros, setRegistros] = useState<Registro[]>([
    {
      id: 1,
      cpf_cnpj: '123.456.789-00',
      nome: 'João Silva',
      empresa: 'Empresa X',
      data_entrada: '2026-03-22',
      data_saida: '2026-03-22',
      placa: 'ABC-1234',
      destino: 'São Paulo',
      atendente: 'Maria',
      obs: 'Sem observações',
    },
    {
      id: 2,
      cpf_cnpj: '987.654.321-00',
      nome: 'Ana Souza',
      empresa: 'Empresa Y',
      data_entrada: '2026-03-21',
      data_saida: '2026-03-21',
      placa: 'XYZ-9876',
      destino: 'Rio de Janeiro',
      atendente: 'Carlos',
      obs: 'Entrega atrasada',
    },
  ]);

  // const fetchRegistros = async () => {
  //   try {
  //     const response = await fetch('https://sua-api.com/registros');
  //     const data = await response.json();
  //     setRegistros(data);
  //   } catch (error) {
  //     console.error('Erro ao buscar registros:', error);
  //     Alert.alert('Erro ao buscar registros:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



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
    <View style={styles.container}>
      {/* Container do botão separado */}
      { <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={logout} />
      </View> }

      {/* Cabeçalho da tabela */}
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

      {/* FlatList */}
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  logoutContainer: { marginBottom: 10 }, // garante que o botão fique visível
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#ddd',
    paddingVertical: 5,
  },
  headerCell: { width: '20%', fontWeight: 'bold', fontSize: 12 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
  },
  cell: { width: '20%', fontSize: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});