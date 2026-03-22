import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export default function HomeScreen() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistros();
  }, []);

  const fetchRegistros = async () => {
    try {
      const response = await fetch('https://sua-api.com/registros');
      const data = await response.json();
      setRegistros(data);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#ddd',
    paddingVertical: 5,
  },
  headerCell: {
    width: '20%',
    fontWeight: 'bold',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
  },
  cell: {
    width: '20%',
    fontSize: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});