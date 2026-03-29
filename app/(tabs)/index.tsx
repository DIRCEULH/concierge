import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';

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

export default function HomeScreen() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');
  //Data Atual
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const ano = now.getFullYear();

  // Inicializa o filtroData com a data atual
  const [filtroData, setFiltroData] = useState(`${dia}/${mes}/${ano}`);
  const [registrosFiltrados, setRegistrosFiltrados] = useState<Registro[]>([]);

  const router = useRouter();

  // Modal e picker
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [campoData, setCampoData] = useState<'data_entrada' | 'data_saida'>('data_saida');

  // Verifica login
  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem('user');
      if (!user) router.replace('/login');
    };
    checkLogin();
  }, []);

  // Busca registros
  useEffect(() => {
    fetchRegistros(filtroData);
  }, []);

  // Filtra registros por nome
  useEffect(() => {
    const filtrados = registros.filter((item) =>
      item.nome.toLowerCase().includes(filtroNome.toLowerCase())
    );
    setRegistrosFiltrados(filtrados);
  }, [filtroNome, registros]);

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/(tabs)/login');
  };

  const visitor = async () => {
    router.replace('/(tabs)/visitor');
  };

  const showMessage = (title: string, message: string) => {
    Platform.OS === 'web' ? alert(`${title}: ${message}`) : Alert.alert(title, message);
  };

  const fetchRegistros = async (dataEntrada: string) => {
    setLoading(true);
    try {
      // Convertendo para formato MySQL: YYYY-MM-DD
      const partes = dataEntrada.split(' ')[0].split('/');
      const dataMySQL = `${partes[2]}-${partes[1]}-${partes[0]}`;


      const response = await fetch(`http://192.168.0.5:3000/visitantes?data_atual=${encodeURIComponent(dataMySQL)}`);
      const data = await response.json();

      setRegistros(data);
      setRegistrosFiltrados(data);
    } catch (error) {
      console.error('Erro ao buscar registros por data:', error);
      showMessage('Erro', 'Não foi possível buscar os registros.');
    } finally {
      setLoading(false);
    }
  };

  // Abre popup para inserir data_entrada ou data_saida
  const abrirPopupData = (item: Registro, campo: 'data_entrada' | 'data_saida') => {
    if (campo === 'data_saida' && item.data_saida !== '00/00/0000 00:00') return;
    if (campo === 'data_entrada' && item.data_entrada !== '00/00/0000 00:00') return;

    setSelectedRegistro(item);
    setDate(new Date());
    setCampoData(campo);
    setModalVisible(true);
  };

  // Salva data_entrada ou data_saida
  const salvarData = async () => {
    if (!selectedRegistro) return;

    const d = date;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const minuto = String(d.getMinutes()).padStart(2, '0');
    const novaDataString = `${dia}/${mes}/${ano} ${hora}:${minuto}`;

    try {
      await fetch(`http://192.168.0.5:3000/visitantes/${selectedRegistro.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campoData]: novaDataString }),
      });



      // Atualiza localmente
      const novosRegistros = registros.map((r) =>
        r.id === selectedRegistro.id ? { ...r, [campoData]: novaDataString } : r
      );
      console.log('Dirceu', JSON.stringify({ [campoData]: novaDataString }))
      setRegistros(novosRegistros);
      setRegistrosFiltrados(novosRegistros);

      setModalVisible(false);
      setSelectedRegistro(null);
      setShowPicker(false);
    } catch (error) {
      console.error(error);
      showMessage('Erro', 'Não foi possível atualizar a data.');
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
    <View style={styles.container}>
      {/* Botões Logout / Visitante */}
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Logout" onPress={logout} />
        </View>
        <View style={styles.button}>
          <Button title="Visitante" onPress={visitor} />
        </View>
      </View>

      {/* Filtro */}


      <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center' }}>
        {/* Filtro por nome */}
        <TextInput
          placeholder="Filtrar por nome..."
          value={filtroNome}
          onChangeText={setFiltroNome}
          style={{
            flex: 1,
            borderWidth: 1,
            padding: 8,
            backgroundColor: '#fff',
            marginRight: 5
          }}
        />

        {/* Filtro por data */}
        <MaskedTextInput
          mask="99/99/9999 99:99"
          placeholder="Data Entrada (DD/MM/YYYY)"
          keyboardType="numeric"
          value={filtroData}
          onChangeText={setFiltroData}
          style={{
            flex: 1,
            borderWidth: 1,
            padding: 8,
            backgroundColor: '#fff',
            textAlign: 'center',
            marginRight: 5
          }}
        />

        {/* Botão buscar */}
        <TouchableOpacity
          onPress={() => {
            fetchRegistros(filtroData);
          }}
          style={{
            backgroundColor: '#007bff',
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 5
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabela */}
      <View style={{ flex: 1, backgroundColor: '#000' }}> {/* Container principal ocupa 100% */}
        <ScrollView style={{ flex: 1 }}> {/* Scroll vertical */}
          <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}> {/* Scroll horizontal */}
            <View style={{ flex: 1 }}>
              {/* Header */}
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

              {/* Linhas */}
              {registrosFiltrados.map((item) => (
                <View key={item.id} style={styles.row}>
                  <Text style={styles.cell}>{item.id}</Text>
                  <Text style={styles.cell}>{item.cpf_cnpj}</Text>
                  <Text style={styles.cell}>{item.nome}</Text>
                  <Text style={styles.cell}>{item.empresa}</Text>

                  {/* Data Entrada */}
                  <TouchableOpacity onPress={() => abrirPopupData(item, 'data_entrada')}>
                    <Text style={[styles.cell, { color: item.data_entrada === '00/00/0000 00:00' ? 'red' : '#fff' }]}>
                      {item.data_entrada || '—'}
                    </Text>
                  </TouchableOpacity>

                  {/* Data Saída */}
                  <TouchableOpacity onPress={() => abrirPopupData(item, 'data_saida')}>
                    <Text style={[styles.cell, { color: item.data_saida === '00/00/0000 00:00' ? 'red' : '#fff' }]}>
                      {item.data_saida || '—'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.cell}>{item.placa}</Text>
                  <Text style={styles.cell}>{item.destino}</Text>
                  <Text style={styles.cell}>{item.atendente}</Text>
                  <Text style={styles.cell}>{item.obs}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Modal para selecionar data */}
      {modalVisible && (
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 300 }}>
              <Text style={{ marginBottom: 10 }}>
                Selecionar {campoData === 'data_entrada' ? 'data de entrada' : 'data de saída'}
              </Text>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') setShowPicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                <Button title="Salvar" onPress={salvarData} />
                <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, marginTop: 25, backgroundColor: '#000' },
  logoutContainer: { marginHorizontal: 1, marginBottom: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  button: { flex: 1, marginHorizontal: 1 },
  header: { flexDirection: 'row', backgroundColor: '#ddd', paddingVertical: 5 },
  headerCell: { width: 120, fontWeight: 'bold', fontSize: 12, paddingHorizontal: 5 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 5 },
  cell: { width: 120, fontSize: 12, paddingHorizontal: 5, borderRightWidth: 1, color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});