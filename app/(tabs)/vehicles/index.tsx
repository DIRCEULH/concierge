import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';

import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function CadastroVehicleScreen() {

    const router = useRouter();

    const [form, setForm] = useState({
        cpf_cnpj: '',
        placa: '',
        modelo: '',
        marca: '',
        cor: '',
        tipo_veiculo: '',
    });

    const [user, setUser] = useState('');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [searchCpfCnpj, setSearchCpfCnpj] = useState('');

    const fetchVehicles = async () => {
        try {
            const response = await axios.get('https://api-concierge.vercel.app/vehicles');
            const data = response.data ?? [];
            setVehicles(Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.log('Erro ao carregar veículos:', error);
            setVehicles([]);
        }
    };

    const registrosFiltrados = useMemo(() => {
        const cleanSearch = searchCpfCnpj.replace(/[^0-9]/g, '');
        if (!cleanSearch) return vehicles;

        return vehicles.filter((item: any) =>
            (item.cpf_cnpj ?? '').replace(/[^0-9]/g, '').includes(cleanSearch)
        );
    }, [searchCpfCnpj, vehicles]);

    useEffect(() => {

        const checkLogin = async () => {

            const userStorage = await AsyncStorage.getItem('user');

            if (!userStorage) {
                router.replace('/login');
                return;
            }

            const userValue = JSON.parse(userStorage);

            setUser(userValue);
            await fetchVehicles();

        };

        checkLogin();

    }, []);

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

    const handleChange = (campo: string, valor: string) => {
        setForm(prev => ({
            ...prev,
            [campo]: valor,
        }));
    };

    const showMessage = (title: string, message: string) => {

        if (Platform.OS === 'web') {
            alert(title + ': ' + message);
        } else {
            Alert.alert(title, message);
        }

    };

    const salvar = async () => {

        try {

            if (!form.cpf_cnpj)
                return showMessage('Erro', 'CPF/CNPJ obrigatório');

            if (!form.placa)
                return showMessage('Erro', 'Placa obrigatória');

            if (!form.modelo)
                return showMessage('Erro', 'Modelo obrigatório');

            if (!form.marca)
                return showMessage('Erro', 'Marca obrigatória');

            if (!form.cor)
                return showMessage('Erro', 'Cor obrigatória');

            if (!form.tipo_veiculo)
                return showMessage('Erro', 'Tipo do veículo obrigatório');

            const response = await axios.post(
                'https://api-concierge.vercel.app/register-vehicle',
                form
            );

            showMessage(
                'Sucesso',
                response.data.message
            );

            setForm({
                cpf_cnpj: '',
                placa: '',
                modelo: '',
                marca: '',
                cor: '',
                tipo_veiculo: '',
            });

            await fetchVehicles();

        } catch (error) {

            console.log(error);

            showMessage(
                'Erro',
                'Erro ao cadastrar veículo'
            );
        }
    };

    const voltar = () => {
        router.replace('/(tabs)');
    };

    return (

        <ScrollView contentContainerStyle={styles.scroll} nestedScrollEnabled>

            <View style={styles.formContainer}>

                <Text style={styles.title}>
                    Cadastro de Veículos
                </Text>

                <TextInput
                    placeholder="CPF ou CNPJ"
                    placeholderTextColor="rgba(255,255,255,0.65)"
                    value={form.cpf_cnpj}
                    onChangeText={(text) => {
                        const formatted = formatCpfCnpj(text);

                        handleChange('cpf_cnpj', formatted);
                    }}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Placa"
                    placeholderTextColor="rgba(255,255,255,0.65)"
                    value={form.placa}
                    onChangeText={(v) =>
                        handleChange('placa', v.toUpperCase())
                    }
                    autoCapitalize="characters"
                    style={styles.input}
                />

                <TextInput
                    placeholder="Marca"
                    placeholderTextColor="rgba(255,255,255,0.65)"
                    value={form.marca}
                    onChangeText={(v) => handleChange('marca', v)}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Modelo"
                    placeholderTextColor="rgba(255,255,255,0.65)"
                    value={form.modelo}
                    onChangeText={(v) => handleChange('modelo', v)}
                    style={styles.input}
                />

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={form.cor}
                        onValueChange={(value) =>
                            handleChange('cor', value)
                        }
                        dropdownIconColor="#eef8ff"
                        style={styles.picker}
                    >

                        <Picker.Item
                            label="Selecione a cor"
                            value=""
                        />

                        <Picker.Item label="Branco" value="Branco" />
                        <Picker.Item label="Preto" value="Preto" />
                        <Picker.Item label="Prata" value="Prata" />
                        <Picker.Item label="Cinza" value="Cinza" />
                        <Picker.Item label="Vermelho" value="Vermelho" />
                        <Picker.Item label="Azul" value="Azul" />
                        <Picker.Item label="Verde" value="Verde" />
                        <Picker.Item label="Amarelo" value="Amarelo" />
                        <Picker.Item label="Marrom" value="Marrom" />
                        <Picker.Item label="Bege" value="Bege" />
                        <Picker.Item label="Laranja" value="Laranja" />
                        <Picker.Item label="Dourado" value="Dourado" />
                        <Picker.Item label="Roxo" value="Roxo" />
                        <Picker.Item label="Rosa" value="Rosa" />
                        <Picker.Item label="Outro" value="Outro" />

                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={form.tipo_veiculo}
                        onValueChange={(value) =>
                            handleChange('tipo_veiculo', value)
                        }
                        style={styles.picker}
                    >

                        <Picker.Item
                            label="Selecione o tipo do veículo"
                            value=""
                        />

                        <Picker.Item
                            label="Carro"
                            value="Carro"
                        />

                        <Picker.Item
                            label="Moto"
                            value="Moto"
                        />

                        <Picker.Item
                            label="Ônibus"
                            value="Onibus"
                        />

                        <Picker.Item
                            label="Caminhão"
                            value="Caminhao"
                        />

                        <Picker.Item
                            label="Van"
                            value="Van"
                        />

                        <Picker.Item
                            label="Bicicleta"
                            value="Bicicleta"
                        />

                        <Picker.Item
                            label="Outro"
                            value="Outro"
                        />

                    </Picker>
                </View>

                <View style={styles.buttonContainer}>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={salvar}
                    >
                        <Ionicons
                            name="save-outline"
                            size={20}
                            color="#fff"
                        />

                        <Text style={styles.buttonText}>
                            Salvar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={voltar}
                    >
                        <Ionicons
                            name="arrow-back-outline"
                            size={20}
                            color="#fff"
                        />

                        <Text style={styles.buttonText}>
                            Voltar
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>

            <View style={styles.tableSection}>
                <Text style={styles.sectionTitle}>Veículos cadastrados</Text>

                <TextInput
                    placeholder="Pesquisar por CPF/CNPJ"
                    placeholderTextColor="rgba(255,255,255,0.65)"
                    value={searchCpfCnpj}
                    onChangeText={(text) => setSearchCpfCnpj(text)}
                    style={styles.input}
                />

                <View style={styles.tableContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ minWidth: 480 }}>
                            <View style={[styles.tableRow, styles.tableHeaderRow]}>
                                <Text style={[styles.tableHeaderText, { flex: 3 }]}>CPF/CNPJ</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Placa</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Modelo</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Marca</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Cor</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Tipo</Text>
                            </View>

                            <ScrollView style={styles.tableBody} nestedScrollEnabled showsVerticalScrollIndicator>
                                {registrosFiltrados.map((item, index) => (
                                    <View
                                        key={item.id ?? index}
                                        style={[
                                            styles.tableRow,
                                            {
                                                backgroundColor:
                                                    index % 2 === 0 ? '#0a1420' : '#0f1b2d',
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.tableCell, { flex: 3 }]}>{item.cpf_cnpj ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.placa ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.modelo ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.marca ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.cor ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.tipo_veiculo ?? ''}</Text>
                                    </View>
                                ))}

                                {registrosFiltrados.length === 0 && (
                                    <View style={styles.emptyRow}>
                                        <Ionicons name="search-outline" size={32} color="rgba(211,242,255,0.4)" style={{ marginBottom: 8 }} />
                                        <Text style={styles.emptyText}>
                                            Nenhum veículo encontrado.
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View>

        </ScrollView>
    );
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
        minWidth: 100,
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

    tableSection: {
        width: '90%',
        maxWidth: 480,
        marginTop: 30,
    },

    sectionTitle: {
        fontSize: 18,
        color: '#d3f2ff',
        marginBottom: 10,
        fontWeight: '700',
        textAlign: 'center',
    },

    tableContainer: {
        backgroundColor: 'rgba(10,126,164,0.04)',
        borderRadius: 20,
        padding: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(10,126,164,0.12)'
    },

    tableBody: {
        height: 150,
    },

    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 42,
        paddingHorizontal: 6,
    },

    tableHeaderRow: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(10,126,164,0.22)',
        marginBottom: 8,
    },

    tableCell: {
        color: '#eef8ff',
        paddingVertical: 10,
        paddingHorizontal: 8,
        textAlign: 'left',
    },

    tableHeaderText: {
        color: '#d3f2ff',
        fontWeight: '700',
        paddingVertical: 10,
        paddingHorizontal: 8,
        textAlign: 'left',
    },

    emptyRow: {
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyText: {
        color: '#d3f2ff',
        textAlign: 'center',
    },

});