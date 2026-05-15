import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { default as React, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const [permissao, setPermissao] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [campoData, setCampoData] = useState<'data_entrada' | 'data_saida'>('data_saida');
  const [showFiltroDatePicker, setShowFiltroDatePicker] = useState(false);
  const [filterDateValue, setFilterDateValue] = useState(new Date());

  const formatDateOnly = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateOnly = (value: string) => {
    const parts = value.split('/');
    if (parts.length < 3) return new Date();
    const [day, month, year] = parts;
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const formatDateForWeb = (value: string) => {
    if (!value) return '';
    const parts = value.split('/');
    if (parts.length < 3) return '';
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  };

  const parseDateFromWeb = (value: string) => {
    if (!value) return '';
    const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return '';
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  };

  const openWebDatePicker = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'date';
      input.style.position = 'fixed';
      input.style.left = '0px';
      input.style.top = '0px';
      input.style.width = '1px';
      input.style.height = '1px';
      input.style.opacity = '0';
      input.style.zIndex = '1000';

      const current = formatDateForWeb(filtroData);
      if (current) input.value = current;

      const cleanup = () => {
        try { document.body.removeChild(input); } catch (e) {}
      };

      input.addEventListener('change', (e: any) => {
        const v = e.target.value;
        const parsed = parseDateFromWeb(v);
        setFiltroData(parsed);
        fetchRegistros(parsed, filtroLocal);
        cleanup();
      });

      input.addEventListener('blur', cleanup);

      document.body.appendChild(input);
      input.focus();
      const tryShow = (input as any).showPicker;
      if (typeof tryShow === 'function') {
        try {
          (input as any).showPicker();
        } catch (err) {
          input.click();
        }
      } else {
        input.click();
      }
    } catch (err) {
      console.log('Web date picker not available', err);
    }
  };

  const openFiltroDatePicker = () => {
    if (Platform.OS === 'web') {
      openWebDatePicker();
      return;
    }

    setFilterDateValue(parseDateOnly(filtroData));
    setShowFiltroDatePicker(true);
  };


  const scrollRef = useRef<ScrollView>(null);
  const headerScrollRef = useRef<ScrollView>(null);

  const syncScroll = (x: number) => {
    headerScrollRef.current?.scrollTo({ x, animated: false });
  }

  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [formEdit, setFormEdit] = useState({
    data_entrada: '',
    data_saida: '',
    destino: '',
  })


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
      const permissao = await AsyncStorage.getItem('permissao')
      if (permissao) {
        setPermissao(JSON.parse(permissao));
      }

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

  const vehicles = async () => {
    router.replace('/(tabs)/vehicles');
  };

  const graphics = async () => {
    router.replace('/(tabs)/graphics');
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


  const excluirVisitante = async (id: number) => {
    try {
      await fetch(
        `https://api-concierge.vercel.app/excluirVisitante/${id}`,
        {
          method: 'DELETE',
        }
      );

      fetchRegistros(filtroData, filtroLocal);
    } catch (error) {
      console.error(error);
    }
  };

  const atualizarVisitante = async (
    id: number,
    data_entrada: string,
    data_saida: string,
    destino: string
  ) => {
    try {
      await fetch(
        `https://api-concierge.vercel.app/atualizarVisitante/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data_entrada,
            data_saida,
            destino,
          }),
        }
      )

      fetchRegistros(filtroData, filtroLocal);
    } catch (error) {
      console.error(error);
    }
  }

  const confirmarExclusao = (id: number) => {

    if (Platform.OS === 'web') {

      const confirmar = confirm(
        'Deseja realmente excluir este visitante?'
      );

      if (confirmar) {
        excluirVisitante(id);
      }

    } else {

      Alert.alert(
        'Confirmar exclusão',
        'Deseja realmente excluir este visitante?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => excluirVisitante(id),
          },
        ]
      );

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


  const isAdmin = permissao == "Admin"

  return (
    <View style={styles.container}>
      {/* Botões Logout / Visitante */}
      <View style={styles.buttonContainer}>

        <View style={styles.button}>
          <TouchableOpacity style={styles.iconOnlyButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>


        <View style={styles.button}>
          <TouchableOpacity  style={styles.iconOnlyButton} onPress={visitor}>
            <Ionicons name="people-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.button}>
          <TouchableOpacity   style={styles.iconOnlyButton} onPress={vehicles}>
            <Ionicons name="car-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.button}>
          <TouchableOpacity  style={styles.iconOnlyButton} onPress={graphics}>
            <Ionicons name="bar-chart-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.iconButton}>
          <Icon
            name="cog"
            size={28}
            color="#fff"
            onPress={isAdmin ? config : undefined}
            style={{
              opacity: isAdmin ? 1 : 0.4,
            }}
          />
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
          <View style={styles.dateField}>
            <MaskedTextInput
              mask="99/99/9999"
              placeholder="Data"
              placeholderTextColor="rgba(255,255,255,0.65)"
              keyboardType="numeric"
              value={filtroData}
              onChangeText={(v) => setFiltroData(v)}
              style={[styles.input, styles.dateInput, styles.dateInputLeft]}
            />
            <TouchableOpacity
              onPress={openFiltroDatePicker}
              style={[styles.dateButton, styles.dateButtonRight]}
            >
              <Ionicons name="calendar-outline" size={18} color="#d3f2ff" />
            </TouchableOpacity>
          </View>
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
              <Ionicons name="search-outline" size={18} color="#d3f2ff" />
          </TouchableOpacity>
        </View>

      </View>




      {/* TABELA */}
      <View style={[{ flex: 1, backgroundColor: '#071926', borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: 'rgba(10,126,164,0.22)', overflow: 'hidden' }]}>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: 'rgba(10,126,164,0.08)', borderBottomWidth: 1, borderBottomColor: 'rgba(10,126,164,0.22)' }]}>
          <ScrollView
            horizontal
            ref={headerScrollRef}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ minWidth: 1100 }}
          >

            <View
              style={{
                flexDirection: 'row',
                minWidth: 1100,
                alignItems: 'center',
              }}
            >

              <View style={[styles.tableCell, { flex: 0.5 }]}>
                <Text style={styles.headerText}>ID</Text>
              </View>

              <View style={[styles.tableCell, { flex: 3 }]}>
                <Text style={styles.headerText}>CPF/CNPJ</Text>
              </View>

              <View style={[styles.tableCell, { flex: 4 }]}>
                <Text style={styles.headerText}>NOME</Text>
              </View>

              <View style={[styles.tableCell, { flex: 3 }]}>
                <Text style={styles.headerText}>EMPRESA</Text>
              </View>

              <View style={[styles.tableCell, { flex: 2.5 }]}>
                <Text style={styles.headerText}>ENTRADA</Text>
              </View>

              <View style={[styles.tableCell, { flex: 2.5 }]}>
                <Text style={styles.headerText}>SAÍDA</Text>
              </View>

              <View style={[styles.tableCell, { flex: 1.5 }]}>
                <Text style={styles.headerText}>PLACA</Text>
              </View>

              <View style={[styles.tableCell, { flex: 1.5 }]}>
                <Text style={styles.headerText}>DESTINO</Text>
              </View>

              <View style={[styles.tableCell, { flex: 2 }]}>
                <Text style={styles.headerText}>ATENDENTE</Text>
              </View>

              <View style={[styles.tableCell, { flex: 1.5 }]}>
                <Text style={styles.headerText}>OBS</Text>
              </View>

              <View style={[styles.tableCell, { flex: 2.5 }]}>
                <Text style={styles.headerText}>AÇÕES</Text>
              </View>

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
            onScroll={(e) =>
              syncScroll(e.nativeEvent.contentOffset.x)
            }
            scrollEventThrottle={16}
          >

            <View style={{ minWidth: 1100 }}>

              {registrosFiltrados?.length > 0 ? (
                registrosFiltrados.map((item, index) => (

                  <View
                    key={item.id}
                    style={[
                      styles.row,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor:
                          index % 2 === 0
                            ? '#0a1420'
                            : '#0f1b2d',
                      },
                    ]}
                  >

                    {/* ID */}
                    <View
                      style={[styles.tableCell, { flex: 0.5 }]}
                    >
                      <Text style={styles.cellText}>
                        {item.id}
                      </Text>
                    </View>

                    {/* CPF */}
                    <View
                      style={[styles.tableCell, { flex: 3 }]}
                    >
                      <Text style={styles.cellText}>
                        {item.cpf_cnpj}
                      </Text>
                    </View>

                    {/* NOME */}
                    <View
                      style={[styles.tableCell, { flex: 4 }]}
                    >
                      <Text style={styles.cellText}>
                        {item.nome}
                      </Text>
                    </View>

                    {/* EMPRESA */}
                    <View
                      style={[styles.tableCell, { flex: 3 }]}
                    >
                      <Text style={styles.cellText}>
                        {item.empresa}
                      </Text>
                    </View>

                    {/* ENTRADA */}
                    <View
                      style={[styles.tableCell, { flex: 2.5 }]}
                    >

                      {editandoId === item.id ? (

                        <MaskedTextInput
                          mask="99/99/9999 99:99"
                          placeholder="Entrada"
                          placeholderTextColor="rgba(255,255,255,0.65)"
                          value={formEdit.data_entrada}
                          onChangeText={(text) =>
                            setFormEdit({
                              ...formEdit,
                              data_entrada: text,
                            })
                          }
                          keyboardType="numeric"
                          style={styles.tableInput}
                        />

                      ) : (

                        <TouchableOpacity
                          onPress={() =>
                            abrirPopupData(item, 'data_entrada')
                          }
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                          }}
                        >

                          {item.data_entrada ? (

                            <Text style={styles.cellText}>
                              {item.data_entrada}
                            </Text>

                          ) : (

                            <Ionicons
                              name="calendar-outline"
                              size={18}
                              color="#0a7ea4"
                            />

                          )}

                        </TouchableOpacity>

                      )}

                    </View>

                    {/* SAÍDA */}
                    <View
                      style={[styles.tableCell, { flex: 2.5 }]}
                    >

                      {editandoId === item.id ? (

                        <MaskedTextInput
                          mask="99/99/9999 99:99"
                          placeholder="Saída"
                          placeholderTextColor="rgba(255,255,255,0.65)"
                          value={formEdit.data_saida}
                          onChangeText={(text) =>
                            setFormEdit({
                              ...formEdit,
                              data_saida: text,
                            })
                          }
                          keyboardType="numeric"
                          style={styles.tableInput}
                        />

                      ) : (

                        <TouchableOpacity
                          onPress={() =>
                            abrirPopupData(item, 'data_saida')
                          }
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                          }}
                        >

                          {item.data_saida ? (

                            <Text style={styles.cellText}>
                              {item.data_saida}
                            </Text>

                          ) : (

                            <Ionicons
                              name="calendar-outline"
                              size={18}
                              color="#0a7ea4"
                            />

                          )}

                        </TouchableOpacity>

                      )}

                    </View>

                    {/* PLACA */}
                    <View
                      style={[styles.tableCell, { flex: 1.5 }]}
                    >
                      <Text style={styles.cellText}>
                        {item.placa}
                      </Text>
                    </View>

                    {/* DESTINO */}
                    <View
                      style={[styles.tableCell, { flex: 1.5 }]}
                    >

                      {editandoId === item.id ? (

                        <TextInput
                          value={formEdit.destino}
                          onChangeText={(text) =>
                            setFormEdit({
                              ...formEdit,
                              destino: text,
                            })
                          }
                          style={styles.tableInput}
                        />

                      ) : (

                        <Text style={styles.cellText}>
                          {item.destino}
                        </Text>

                      )}

                    </View>

                    {/* ATENDENTE */}
                    <View
                      style={[styles.tableCell, { flex: 2 }]}
                    >
                      <Text style={styles.cellText}>
                        {item.atendente}
                      </Text>
                    </View>

                    {/* OBS */}
                    <View
                      style={[styles.tableCell, { flex: 1.5 }]}
                    >

                      <TouchableOpacity
                        onPress={() =>
                          showMessage(
                            'Observação',
                            item.obs || 'Sem observação'
                          )
                        }
                      >
                        <Icon
                          name="sticky-note"
                          size={18}
                          color="#fff"
                        />
                      </TouchableOpacity>

                    </View>

                    {/* AÇÕES */}
                    <View
                      style={[
                        styles.tableCell,
                        {
                          flex: 2.5,
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                        },
                      ]}
                    >

                      {/* DELETE */}
                      <TouchableOpacity
                        disabled={!isAdmin}
                        onPress={() => confirmarExclusao(item.id)}
                        style={{
                          opacity: isAdmin ? 1 : 0.4,
                        }}
                      >
                        <Icon
                          name="trash"
                          size={22}
                          color="red"
                        />
                      </TouchableOpacity>

                      {/* EDIT */}
                      <TouchableOpacity
                        disabled={!isAdmin}
                        onPress={() => {

                          setEditandoId(item.id);

                          setFormEdit({
                            data_entrada:
                              item.data_entrada,
                            data_saida:
                              item.data_saida,
                            destino: item.destino,
                          });

                        }}
                        style={{
                          opacity: isAdmin ? 1 : 0.4,
                        }}
                      >
                        <Icon
                          name="pencil"
                          size={22}
                          color="blue"
                        />
                      </TouchableOpacity>

                      {/* SAVE */}
                      {editandoId === item.id && (
                        <TouchableOpacity
                          onPress={() => {

                            atualizarVisitante(
                              item.id,
                              formEdit.data_entrada,
                              formEdit.data_saida,
                              formEdit.destino
                            );

                            setEditandoId(null);

                          }}
                        >
                          <Icon
                            name="check"
                            size={22}
                            color="green"
                          />
                        </TouchableOpacity>
                      )}

                      {/* CANCELAR EDIÇÃO */}
                      {editandoId === item.id && (
                        <TouchableOpacity
                          onPress={() => setEditandoId(null)}
                        >
                          <Icon
                            name="times"
                            size={22}
                            color="orange"
                          />
                        </TouchableOpacity>
                      )}

                    </View>

                  </View>

                ))
              ) : (
                <View style={{ paddingVertical: 24, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="search-outline" size={32} color="rgba(211,242,255,0.4)" style={{ marginBottom: 8 }} />
                  <Text style={{ color: '#d3f2ff', textAlign: 'center', fontSize: 14 }}>
                    Nenhum registro encontrado
                  </Text>
                </View>
              )}

            </View>

          </ScrollView>

        </ScrollView>

      </View>




      {showFiltroDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={filterDateValue}
          mode="date"
          display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') setShowFiltroDatePicker(false);
            if (selectedDate) {
              const s = formatDateOnly(selectedDate);
              setFiltroData(s);
              fetchRegistros(s, filtroLocal);
            }
          }}
        />
      )}

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
                            backgroundColor: '#0a7ea4',
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
  container: { flex: 1, padding: 10, marginTop: 40, backgroundColor: '#071926' },
  logoutContainer: { marginHorizontal: 1, marginBottom: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  button: { flex: 1, marginHorizontal: 1 },
  iconOnlyButton: {
    backgroundColor: '#0a7ea4',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: { width: 80, height: 25, backgroundColor: '#0a7ea4', borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 65 },
  header: { flexDirection: 'row', backgroundColor: 'rgba(10,126,164,0.08)', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(10,126,164,0.22)' },
  headerCell: { width: 125, height: 15, fontWeight: '700', fontSize: 12, paddingHorizontal: 10, borderRightWidth: 2, borderRightColor: 'rgba(10,126,164,0.12)' },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(10,126,164,0.12)',
    minHeight: 36,
    alignItems: 'center',
  },
  cell: { width: 152, fontSize: 12, paddingHorizontal: 10, borderRightWidth: 1, color: '#fff', borderRightColor: '#222', },
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
    minHeight: 54,
    backgroundColor: '#0b304c',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(10,126,164,0.30)',
    justifyContent: 'center',
    color: '#eef8ff',
  },
  iconButton: {
    padding: 10,
    marginTop: -5
  },
  cellCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
    height: 44,
    minWidth: 50,
    backgroundColor: '#0a7ea4',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  textoBotao: {
    color: '#fff',
    fontWeight: '700',
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(10,126,164,0.12)',
    minHeight: 36,
    flexWrap: 'wrap',
  },
  cellText: {
    color: '#eef8ff',
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%',

  },
  tableInput: {
    height: 36,
    fontSize: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#0b304c',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(10,126,164,0.30)',
    color: '#eef8ff',
    width: '95%',
    flexWrap: 'wrap',
  },
  headerText: {
    color: '#d3f2ff',
    textAlign: 'center',
    fontWeight: '700',

  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  dateField: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },

  dateInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 4,
    minWidth: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  dateInputLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  dateButtonRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  dateButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },

});