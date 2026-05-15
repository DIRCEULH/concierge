import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState<'data_entrada' | 'data_saida' | null>(null);
  const [datePickerValue, setDatePickerValue] = useState(new Date());
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  

  const formatDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hour}:${minute}`;
  };

  const parseDateTime = (value: string) => {
    const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})\s*(\d{2}):(\d{2})?/);
    if (!match) {
      return new Date();
    }

    const [, day, month, year, hour = '00', minute = '00'] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  };

  const formatDateTimeForWeb = (value: string) => {
    if (!value) return '';
    const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})\s*(\d{2}):(\d{2})/);
    if (!match) return '';
    const [, day, month, year, hour, minute] = match;
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const parseDateTimeFromWeb = (value: string) => {
    if (!value) return '';
    const match = value.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!match) return '';
    const [, year, month, day, hour, minute] = match;
    return `${day}/${month}/${year} ${hour}:${minute}`;
  };

  const openDatePicker = (field: 'data_entrada' | 'data_saida') => {
    setDatePickerField(field);
    setDatePickerValue(parseDateTime(form[field] || ''));
    setDatePickerMode('date');
    setShowDatePicker(true);
  };

  const openWebDateTimePicker = (field: 'data_entrada' | 'data_saida') => {
    try {
      const input = document.createElement('input');
      input.type = 'datetime-local';
      // make input off-screen but with size so Chrome allows interaction
      input.style.position = 'fixed';
      input.style.left = '0px';
      input.style.top = '0px';
      input.style.width = '1px';
      input.style.height = '1px';
      input.style.opacity = '0';
      input.style.zIndex = '1000';

      const current = formatDateTimeForWeb(form[field]);
      if (current) input.value = current;

      const cleanup = () => {
        try { document.body.removeChild(input); } catch (e) {}
      };

      input.addEventListener('change', (e: any) => {
        const v = e.target.value;
        const parsed = parseDateTimeFromWeb(v);
        handleChange(field, parsed);
        cleanup();
      });

      input.addEventListener('blur', cleanup);

      document.body.appendChild(input);

      // Prefer showPicker when available (Chrome/Edge support); fallback to click()
      // Call focus before show/click to improve reliability
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
      console.log('Web picker not available', err);
    }
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    if (event?.type === 'dismissed') {
      setShowDatePicker(false);
      setDatePickerField(null);
      return;
    }

    if (!selectedDate || !datePickerField) {
      return;
    }

    if (Platform.OS === 'android') {
      if (datePickerMode === 'date') {
        // user picked a date: apply it immediately (keep previous time if any),
        // then switch to time mode so they can adjust the time if desired
        const pickedDate = new Date(selectedDate);
        const current = datePickerValue || new Date();
        pickedDate.setHours(current.getHours(), current.getMinutes());

        // update field immediately with chosen date (and existing time)
        handleChange(datePickerField, formatDateTime(pickedDate));

        // keep value and open time picker for further adjustment
        setDatePickerValue(pickedDate);
        setDatePickerMode('time');
        setShowDatePicker(true);
        return;
      }

      if (datePickerMode === 'time') {
        const date = new Date(datePickerValue);
        date.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        // update field again with final chosen time
        handleChange(datePickerField, formatDateTime(date));
        setShowDatePicker(false);
        setDatePickerField(null);
        setDatePickerMode('date');
      }
      return;
    }

    handleChange(datePickerField, formatDateTime(selectedDate));
    setShowDatePicker(false);
    setDatePickerField(null);
  };

  const lastTapRef = useRef<Record<string, number>>({});

  const handleDateDoubleClick = (field: 'data_entrada' | 'data_saida') => {
    const now = new Date();
    handleChange(field, formatDateTime(now));
  };

  const handleDateTap = (field: 'data_entrada' | 'data_saida') => {
    const now = Date.now();
    const last = lastTapRef.current[field] || 0;
    if (now - last < 350) {
      handleDateDoubleClick(field);
    }
    lastTapRef.current[field] = now;
  };


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

        let v = value
            .replace(/[^a-zA-Z0-9]/g, '')
            .toUpperCase();

        // 🔥 CPF (11)
        if (v.length <= 11) {

            v = v
                .replace(/^(.{3})(.{0,3})/, '$1.$2')
                .replace(/^(.{7})(.{0,3})/, '$1.$2')
                .replace(/^(.{11})(.{0,2})/, '$1-$2');

            return v;
        }

        // 🔥 CNPJ (14)
        v = v.slice(0, 14);

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
            placeholderTextColor="rgba(255,255,255,0.65)"
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
          placeholderTextColor="rgba(255,255,255,0.65)"
          value={form.nome}
          onChangeText={(v) => handleChange('nome', v)}
          style={styles.input}
        />

        <TextInput
          placeholder="Empresa"
          placeholderTextColor="rgba(255,255,255,0.65)"
          value={form.empresa}
          onChangeText={(v) => handleChange('empresa', v)}
          style={styles.input}
        />

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <MaskedTextInput
              mask="99/99/9999 99:99"
              placeholder="Data Entrada"
              placeholderTextColor="rgba(255,255,255,0.65)"
              value={form.data_entrada}
              onChangeText={(v) => handleChange('data_entrada', v)}
              style={[styles.input, styles.dateInput, styles.dateInputLeft]}
              keyboardType="numeric"
              {...({ onDoubleClick: () => handleDateDoubleClick('data_entrada'), onTouchStart: () => handleDateTap('data_entrada') } as any)}
            />

            <TouchableOpacity
              style={[styles.dateButton, styles.dateButtonRight]}
              onPress={() => Platform.OS === 'web' ? openWebDateTimePicker('data_entrada') : openDatePicker('data_entrada')}
            >
              <Ionicons name="calendar-outline" size={18} color="#d3f2ff" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateField}>
            <MaskedTextInput
              mask="99/99/9999 99:99"
              placeholder="Data Saída"
              placeholderTextColor="rgba(255,255,255,0.65)"
              value={form.data_saida}
              onChangeText={(v) => handleChange('data_saida', v)}
              style={[styles.input, styles.dateInput, styles.dateInputLeft]}
              keyboardType="numeric"
              {...({ onDoubleClick: () => handleDateDoubleClick('data_saida'), onTouchStart: () => handleDateTap('data_saida') } as any)}
            />

            <TouchableOpacity
              style={[styles.dateButton, styles.dateButtonRight]}
              onPress={() => Platform.OS === 'web' ? openWebDateTimePicker('data_saida') : openDatePicker('data_saida')}
            >
              <Ionicons name="calendar-outline" size={18} color="#d3f2ff" />
            </TouchableOpacity>
          </View>

          
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={datePickerValue}
            mode={Platform.OS === 'android' ? datePickerMode : 'datetime'}
            display={Platform.OS === 'android' ? (datePickerMode === 'date' ? 'calendar' : 'clock') : 'default'}
            onChange={handleDateTimeChange}
          />
        )}

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
            placeholderTextColor="rgba(255,255,255,0.65)"
            value={form.placa}
            onChangeText={(v) => handleChange('placa', v)}
            style={styles.input}
          />
        )}

        <TextInput
          placeholder="Destino"
          placeholderTextColor="rgba(255,255,255,0.65)"
          value={form.destino}
          onChangeText={(v) => handleChange('destino', v)}
          style={styles.input}
        />

        <View style={[styles.input, styles.inputDisabled]}>
          <Text>{form.atendente}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.local}
                onValueChange={(itemValue) => handleChange('local', itemValue)}
                style={styles.picker}
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
          </View>

          <View style={styles.field}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.codigo_tipo}
                onValueChange={(itemValue) => handleChange('codigo_tipo', itemValue)}
                style={styles.picker}
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
            </View>
          </View>
        </View>

        <TextInput
          placeholder="Obs"
          placeholderTextColor="rgba(255,255,255,0.65)"
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
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#071926',
  },

  formContainer: {
    width: '90%',
    maxWidth: 480,
    padding: 24,
    borderRadius: 28,
    backgroundColor: 'rgba(10,126,164,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(10,126,164,0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 12,
  },

  title: {
    fontSize: 24,
    color: '#d3f2ff',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.4,
  },

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
  },

  inputText: {
    color: '#eef8ff',
    fontSize: 16,
  },

  placeholderText: {
    color: 'rgba(226,245,255,0.7)',
  },

  dropdown: {
    backgroundColor: '#0b304c',
    borderWidth: 1,
    borderColor: 'rgba(10,126,164,0.30)',
    borderRadius: 14,
    maxHeight: 180,
    marginBottom: 12,
  },

  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(10,126,164,0.18)',
    color: '#eef8ff',
  },

  inputDisabled: {
    backgroundColor: '#12354a',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
  },

  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 140,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: 'rgba(10,126,164,0.30)',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#0b304c',
  },

  picker: {
    width: '100%',
    height: 54,
    color: '#eef8ff',
    backgroundColor: '#0b304c',
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  dateField: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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

  dateButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateButtonRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  hiddenInput: {
    position: 'absolute',
    left: -9999,
    width: 0,
    height: 0,
    opacity: 0,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  field: {
    flex: 1,
    minWidth: 150,
  },
});