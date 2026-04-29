import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

type User = {
    id: number;
    user: string;
    email: string;
    status: string;
    permissao: string;
};

export default function UsersScreen() {

    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const fetchUsers = async (text: string = '') => {
        try {
            setLoading(true);

            const url = text
                ? `https://api-concierge.vercel.app/users?search=${text}`
                : `https://api-concierge.vercel.app/users`;

            const response = await fetch(url);
            const data: User[] = await response.json();

            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const start = async () => {
        router.replace('/(tabs)');
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (text: string) => {
        setSearch(text);
        fetchUsers(text);
    };

    // 🔥 UPDATE STATUS (AUTO)
    const updateStatus = async (userId: number, value: string) => {
        try {
            await fetch(
                `https://api-concierge.vercel.app/updateUsers?id=${userId}&status=${value}`,
                { method: 'PATCH' }
            );
            fetchUsers(search); // 👈 REFRESH AQUI
        } catch (error) {
            console.error(error);
        }
    };

    // 🔥 UPDATE PERMISSÃO (AUTO)
    const updatePermission = async (userId: number, value: string) => {
        try {
            await fetch(
                `https://api-concierge.vercel.app/updateUsers?id=${userId}&permissao=${value}`,
                { method: 'PATCH' }
            );
            fetchUsers(search); // 👈 REFRESH AQUI
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }: { item: User }) => (
        <View style={styles.item}>

            {/* INFO */}
            <View style={styles.info}>
                <Text style={styles.name}>{item.user}</Text>
                <Text style={styles.email}>{item.email}</Text>
            </View>

            {/* STATUS */}
            <View style={styles.editRow}>

                <Picker
                    style={[
                        styles.picker,
                        { color: item.status === 'A' ? 'green' : 'red' }
                    ]}
                    selectedValue={item.status}
                    onValueChange={(value) => updateStatus(item.id, value)}
                >
                    <Picker.Item label="Ativo" value="A" color="green" />
                    <Picker.Item label="Inativo" value="I" color="red" />
                </Picker>

            </View>

            {/* PERMISSÃO */}
            <View style={styles.editRow}>
                <Picker
                     style={[
                        styles.picker,
                        { color: item.permissao === 'Admin' ? '#007bff' : 'orange' }
                    ]}
                    selectedValue={item.permissao}
                    onValueChange={(value) => updatePermission(item.id, value)}
                >
                    <Picker.Item label="Atendente" value="Atendente"  color="red" />
                    <Picker.Item label="Admin" value="Admin" color="green" />
                </Picker>
            </View>

        </View>
    );

    return (
        <View style={styles.container}>

            {/* SEARCH + VOLTAR */}
            <View style={styles.row}>

                <View style={styles.searchWrap}>
                    <TextInput
                        placeholder="Buscar usuário..."
                        value={search}
                        onChangeText={handleSearch}
                        style={styles.inputInner}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={start}>
                    <Ionicons name="arrow-back-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Voltar</Text>
                </TouchableOpacity>

            </View>

            {/* LISTA */}
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.empty}>Nenhum usuário encontrado</Text>
                    }
                />
            )}

        </View>
    );
}



const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    input: {
        flex: 1,
        borderWidth: 1,
        padding: 10,
        borderRadius: 6,
        borderColor: '#ccc',
    },

    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        flex: 1,
        backgroundColor: '#fff',
    },

    inputInner: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderWidth: 0, // 👈 remove duplicação
        backgroundColor: 'transparent',
    },

    item: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },

    info: {
        marginBottom: 5,
    },

    name: {
        fontWeight: 'bold',
        color: '#000',
    },

    email: {
        color: '#555',
    },

    editRow: {
        marginTop: 6,
    },

    picker: {
        height: 40,
    },


    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 6,
    },

    buttonText: {
        color: '#fff',
        marginLeft: 5,
        fontWeight: 'bold',
    },

    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        flex: 1,
        backgroundColor: '#fff',
    },


});