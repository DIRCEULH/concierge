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
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 5 }}>
                <TouchableOpacity
                    onPress={() => updateStatus(item.id, 'A')}
                    style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#007bff',
                        backgroundColor: item.status === 'A' ? 'green' : 'transparent',
                    }}
                >
                    <Text
                        style={{

                            textAlign: 'center',
                            color: item.status === 'A' ? '#fff' : 'green',
                        }}
                    >
                        Ativo
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => updateStatus(item.id, 'I')}
                    style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#007bff',
                        backgroundColor: item.status === 'I' ? 'red' : 'transparent',
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            color: item.status === 'I' ? '#fff' : 'red',
                        }}
                    >
                        Inativo
                    </Text>
                </TouchableOpacity>
            </View>

            {/* PERMISSÃO */}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                <TouchableOpacity
                    onPress={() => updatePermission(item.id, 'Atendente')}
                    style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#007bff',
                        backgroundColor: item.permissao === 'Atendente' ? '#007bff' : 'transparent',
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            color: item.permissao === 'Atendente' ? '#fff' : '#007bff',
                        }}
                    >
                        Atendente
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => updatePermission(item.id, 'Admin')}
                    style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#007bff',
                        backgroundColor: item.permissao === 'Admin' ? '#007bff' : 'transparent',
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            color: item.permissao === 'Admin' ? '#fff' : '#007bff',
                        }}
                    >
                        Admin
                    </Text>
                </TouchableOpacity>
            </View>


        </View>
    );

    return (
        <View style={styles.container}>

            {/* SEARCH + VOLTAR */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 12,
                    gap: 10,

                    // sombra leve (Android/iOS)
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    marginTop:35
                }}
            >

                {/* SEARCH */}
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#f3f4f6',
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        height: 40,
                    }}
                >
                    <Ionicons name="search-outline" size={18} color="#888" />

                    <TextInput
                        placeholder="Buscar usuário..."
                        value={search}
                        onChangeText={handleSearch}
                        style={{
                            flex: 1,
                            marginLeft: 8,
                            fontSize: 14,
                            height:35
                        }}
                    />
                </View>

                {/* BOTÃO VOLTAR */}
                <TouchableOpacity
                    onPress={start}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#111827',
                        paddingHorizontal: 12,
                        height: 40,
                        borderRadius: 10,
                        gap: 6,
                    }}
                >
                    <Ionicons name="arrow-back-outline" size={18} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 13 }}>Voltar</Text>
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
        marginTop: 4,
        borderWidth: 0,
    },

    picker: {
        width: '100%',
        height: 50,
        backgroundColor: 'transparent',
    },

    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 6,
        marginTop: 75
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
        marginTop: 75
    },


});