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
                    placeholderTextColor="#000"
                    value={form.cpf_cnpj}
                    onChangeText={(text) => {
                        const formatted = formatCpfCnpj(text);

                        handleChange('cpf_cnpj', formatted);
                    }}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Placa"
                    placeholderTextColor="#000"
                    value={form.placa}
                    onChangeText={(v) =>
                        handleChange('placa', v.toUpperCase())
                    }
                    autoCapitalize="characters"
                    style={styles.input}
                />

                <TextInput
                    placeholder="Marca"
                    placeholderTextColor="#000"
                    value={form.marca}
                    onChangeText={(v) => handleChange('marca', v)}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Modelo"
                    placeholderTextColor="#000"
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
                        dropdownIconColor="#000"
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
                    placeholderTextColor="#000"
                    value={searchCpfCnpj}
                    onChangeText={(text) => setSearchCpfCnpj(text)}
                    style={styles.input}
                />

                <View style={styles.tableContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ minWidth: 700 }}>
                            <View style={[styles.tableRow, styles.tableHeaderRow]}>
                                <Text style={[styles.tableHeaderText, { flex: 2 }]}>CPF/CNPJ</Text>
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
                                                    index % 2 === 0 ? '#111' : '#1a1a1a',
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.tableCell, { flex: 2 }]}>{item.cpf_cnpj ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.placa ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.modelo ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.marca ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.cor ?? ''}</Text>
                                        <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.tipo_veiculo ?? ''}</Text>
                                    </View>
                                ))}

                                {registrosFiltrados.length === 0 && (
                                    <View style={styles.emptyRow}>
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
        paddingVertical: 20,
        backgroundColor: '#000',
    },

    formContainer: {
        width: '90%',
        maxWidth: 400,
    },

    title: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },

    input: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 10,
        borderRadius: 6,
        color: '#000',
    },

    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        marginTop: 10,
    },

    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 6,
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 10,
        height: 50,
        justifyContent: 'center',
        overflow: 'hidden',
    },

    picker: {
        color: '#000',
        height: 50,
        width: '100%',
    },

    tableSection: {
        width: '90%',
        maxWidth: 1000,
        marginTop: 30,
    },

    sectionTitle: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    tableContainer: {
        backgroundColor: '#111',
        borderRadius: 8,
        padding: 10,
        width: '100%',
    },

    tableBody: {
        height: 150,
    },

    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 42,
        paddingHorizontal: 4,
    },

    tableHeaderRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        marginBottom: 6,
    },

    tableCell: {
        color: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 6,
        textAlign: 'left',
    },

    tableHeaderText: {
        color: '#fff',
        fontWeight: 'bold',
        paddingVertical: 8,
        paddingHorizontal: 6,
        textAlign: 'left',
    },

    emptyRow: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyText: {
        color: '#ccc',
        textAlign: 'center',
    },

});