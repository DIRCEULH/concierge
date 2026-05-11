import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

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

    useEffect(() => {

        const checkLogin = async () => {

            const userStorage = await AsyncStorage.getItem('user');

            if (!userStorage) {
                router.replace('/login');
                return;
            }

            const userValue = JSON.parse(userStorage);

            setUser(userValue);

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

        <ScrollView contentContainerStyle={styles.scroll}>

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

});