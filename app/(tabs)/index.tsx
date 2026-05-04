import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { default as React, useEffect, useRef, useState } from 'react';
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
import Icon from 'react-native-vector-icons/FontAwesome';
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

  const [filtroLocal, setFiltroLocal] = useState('');

  const router = useRouter();

  // Modal e picker
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [campoData, setCampoData] = useState<'data_entrada' | 'data_saida'>('data_saida');


  const scrollRef = useRef<ScrollView>(null);
const headerScrollRef = useRef<ScrollView>(null);

const syncScroll = (x: number) => {
  headerScrollRef.current?.scrollTo({ x, animated: false });
};


  // Carregar último local selecionado do AsyncStorage
  useEffect(() => {
    const loadLocal = async () => {
      try {
        const savedLocal = await AsyncStorage.getItem('filtroLocal');
        if (savedLocal) {
          setFiltroLocal(savedLocal);
          fetchRegistros(filtroData, savedLocal);

        }


      } catch (error) {
        console.log('Erro ao carregar local:', error);
      }
    };
    loadLocal();
  }, []);


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
    fetchRegistros(filtroData, filtroLocal);
  }, []);

  // Filtra registros por nome
  useEffect(() => {
    const filtrados = registros.filter((item) =>
      item.nome.toLowerCase().includes(filtroNome.toLowerCase())
    );
    setRegistrosFiltrados(filtrados);
  }, [filtroNome, registros]);


  // Salvar local selecionado no AsyncStorage
  const handleLocalChange = async (valor: string) => {
    setFiltroLocal(valor);
    try {
      await AsyncStorage.setItem('filtroLocal', valor);
    } catch (error) {
      console.log('Erro ao salvar local:', error);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/(tabs)/login');
  };

  const visitor = async () => {
    router.replace('/(tabs)/visitor');
  };

  const config = async () => {
    router.replace('/(tabs)/settings')
  };

  const showMessage = (title: string, message: string) => {
    Platform.OS === 'web' ? alert(`${title}: ${message}`) : Alert.alert(title, message);
  };

  const fetchRegistros = async (dataEntrada: string, local: string) => {

    console.log('Dirceu', dataEntrada, local)
    setLoading(true);
    try {
      // Convertendo data para formato MySQL: YYYY-MM-DD
      const partes = dataEntrada.split(' ')[0].split('/');
      const dataMySQL = `${partes[2]}-${partes[1]}-${partes[0]}`;

      // Monta URL com data e local
      let url = `https://api-concierge.vercel.app/visitantes?data_atual=${encodeURIComponent(dataMySQL)}`;
      if (local) {
        url += `&local=${encodeURIComponent(local)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      const lista = Array.isArray(data) ? data : [];
      setRegistros(lista);
      setRegistrosFiltrados(lista);
    } catch (error) {
      console.error('Erro ao buscar registros por data e local:', error);
      showMessage('Erro', 'Não foi possível buscar os registros.');
    } finally {
      setLoading(false);
    }
  };

  // Abre popup para inserir data_entrada ou data_saida
  const abrirPopupData = (
    item: Registro,
    campo: 'data_entrada' | 'data_saida'
  ) => {

    const valor =
      campo === 'data_saida'
        ? item.data_saida
        : item.data_entrada;

    if (valor) return;

    setSelectedRegistro(item);
    setCampoData(campo);
    setDate(valor ? new Date(valor) : new Date());
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
      await fetch(`https://api-concierge.vercel.app/visitantes/${selectedRegistro.id}`, {
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
          <Button title="Visitantes" onPress={visitor} />
        </View>
        <View style={styles.iconButton}>
          <Icon name="cog" size={28} color="#fff" onPress={config} />
        </View>
      </View>

      {/* Filtro */}


      <View style={styles.filtrosContainer}>

        <View style={styles.filtroItem}>
          <Picker
            selectedValue={filtroLocal}
            onValueChange={handleLocalChange}
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
        </View>

        <View style={styles.filtroItem}>
          <MaskedTextInput
            mask="99/99/9999"
            placeholder="Data"
            keyboardType="numeric"
            value={filtroData}
            onChangeText={setFiltroData}
            style={styles.input}
          />
        </View>

        <View style={styles.filtroItem}>

          <TextInput
            placeholder="Filtrar por nome..."
            value={filtroNome}
            onChangeText={setFiltroNome}
            style={styles.input}
          />
        </View>

        <View style={styles.filtroItemButton}>
          <TouchableOpacity
            onPress={() => fetchRegistros(filtroData, filtroLocal)}
            style={styles.botaoBuscar}
          >
            <Text style={styles.textoBotao}>🔍</Text>
          </TouchableOpacity>
        </View>

      </View>




{/* TABELA */}
<View style={{ flex: 1, backgroundColor: '#000' }}>

  {/* HEADER FIXO NA VERTICAL */}
  <View style={styles.header}>
    <ScrollView
      horizontal
      ref={headerScrollRef}
      scrollEnabled={false} // 🔥 importante: header não controla scroll sozinho
      showsHorizontalScrollIndicator={false}
       contentContainerStyle={{ minWidth: 900 }}
    >
          <View style={{ flexDirection: 'row', minWidth: 900 }}>

        <Text style={[styles.headerCell, { flex: 0.5, textAlign: 'center' }]}>ID</Text>
        <Text style={[styles.headerCell, { flex: 2.5, textAlign: 'center' }]}>CPF/CNPJ</Text>
        <Text style={[styles.headerCell, { flex: 4, textAlign: 'center' }]}>NOME</Text>
        <Text style={[styles.headerCell, { flex: 2, textAlign: 'center' }]}>EMPRESA</Text>
        <Text style={[styles.headerCell, { flex: 2.5, textAlign: 'center' }]}>ENTRADA</Text>
        <Text style={[styles.headerCell, { flex: 2.5, textAlign: 'center' }]}>SAÍDA</Text>
        <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'center' }]}>PLACA</Text>
        <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'center' }]}>DESTINO</Text>
        <Text style={[styles.headerCell, { flex: 2, textAlign: 'center' }]}>ATENDENTE</Text>
        <Text style={[styles.headerCell, { flex: 2.5 }]}>OBSERVAÇÃO</Text>

      </View>
    </ScrollView>
  </View>

  {/* BODY */}
  <ScrollView style={{ flex: 1 }}>

    <ScrollView
      horizontal
      ref={scrollRef}
      bounces={false}
      showsHorizontalScrollIndicator={false}
      onScroll={(e) => syncScroll(e.nativeEvent.contentOffset.x)} // 🔥 sincroniza header
      scrollEventThrottle={16}
    >

      <View>

        {registrosFiltrados?.length > 0 ? (
          registrosFiltrados.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.row,
                {
                  flexDirection: 'row',
                  backgroundColor: index % 2 === 0 ? '#0d0d0d' : '#1a1a1a',
                },
              ]}
            >

              <Text style={[styles.cell, { flex: 0.5, textAlign: 'center' }]}>{item.id}</Text>
              <Text style={[styles.cell, { flex: 2.5, textAlign: 'center' }]}>{item.cpf_cnpj}</Text>
              <Text style={[styles.cell, { flex: 4 }]}>{item.nome}</Text>
              <Text style={[styles.cell, { flex: 2, textAlign: 'center' }]}>{item.empresa}</Text>

              <TouchableOpacity style={{ flex: 2.5 }} onPress={() => abrirPopupData(item, 'data_entrada')}>
                <View style={styles.cellCenter}>
                  {item.data_entrada ? (
                    <Text style={{ color: '#fff' }}>{item.data_entrada}</Text>
                  ) : (
                    <Ionicons name="calendar-outline" size={20} color="#007bff" />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={{ flex: 2.5 }} onPress={() => abrirPopupData(item, 'data_saida')}>
                <View style={styles.cellCenter}>
                  {item.data_saida ? (
                    <Text style={{ color: '#fff' }}>{item.data_saida}</Text>
                  ) : (
                    <Ionicons name="calendar-outline" size={20} color="#007bff" />
                  )}
                </View>
              </TouchableOpacity>

              <Text style={[styles.cell, { flex: 1.5, textAlign: 'center' }]}>{item.placa}</Text>
              <Text style={[styles.cell, { flex: 1.5, textAlign: 'center' }]}>{item.destino}</Text>
              <Text style={[styles.cell, { flex: 2, textAlign: 'center' }]}>{item.atendente}</Text>

              <TouchableOpacity
                onPress={() => alert(item.obs || 'Sem observação')}
                style={[styles.cellCenter, { flex: 1, backgroundColor: '#007bff' }]}
              >
                <Icon name="sticky-note" size={16} color="#fff" />
              </TouchableOpacity>

            </View>
          ))
        ) : (
          <Text style={{ color: '#fff', padding: 10 }}>
            Nenhum registro encontrado
          </Text>
        )}

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
                Selecionar {campoData === 'data_entrada' ? 'data e hora de entrada.' : 'data e hora de saída.'}
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

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 15
              }}>

                <TouchableOpacity
                  onPress={salvarData}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#007bff',
                    padding: 10,
                    borderRadius: 6
                  }}
                >
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={{ color: '#fff' }}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#ccc',
                    padding: 10,
                    borderRadius: 6
                  }}
                >
                  <Ionicons name="close-outline" size={20} color="#000" />
                  <Text>Cancelar</Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, marginTop: 40, backgroundColor: '#000' },
  logoutContainer: { marginHorizontal: 1, marginBottom: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  button: { flex: 1, marginHorizontal: 1 },
  buttonIcon: { width: 80, height: 25, backgroundColor: '#007bff', borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 65 },
  header: { flexDirection: 'row', backgroundColor: '#ddd', paddingVertical: 5 },
  headerCell: { width: 125,height: 15, fontWeight: 'bold', fontSize: 12, paddingHorizontal: 10 , borderRightWidth: 2,   borderRightColor: '#222'},
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    minHeight: 34, // 👈 antes estava maior (ou implícito)
    alignItems: 'center',
  },
  cell: { width: 152, fontSize: 12, paddingHorizontal: 10, borderRightWidth: 1, color: '#fff',  borderRightColor: '#222',},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tooltip: {
    position: 'absolute',
    top: 30,
    left: 0,
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 5,
    maxWidth: 400,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  tooltipText: { color: '#fff', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 0,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  iconButton: {
    padding: 10,
    marginTop: -5
  },
  cellCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding:10,
    borderRightWidth: 2,
    borderRightColor: '#222',
  },
  filtrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // 👈 ESSENCIAL
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  filtroItem: {
    width: '48%', // 2 por linha
    marginBottom: 8,
  },


  filtroItemButton: {
    width: '48%', // mesmo padrão dos inputs
    alignItems: 'flex-end', // 👉 joga o botão pra direita
  },

  botaoBuscar: {
    height: 40, // 👉 mesma altura dos inputs
    minWidth: 50, // 👉 botão menor
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },

});