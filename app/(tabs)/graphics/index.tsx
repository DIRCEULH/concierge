import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;





export default function Grafico() {


    const router = useRouter();

    const start = async () => {
        router.replace('/(tabs)');
    };

    const [graficoData, setGraficoData] = useState([
        {
            name: 'Dentro',
            population: 0,
            color: '#28a745',
            legendFontColor: '#fff',
            legendFontSize: 13,
        },
        {
            name: 'Saíram',
            population: 0,
            color: '#dc3545',
            legendFontColor: '#fff',
            legendFontSize: 13,
        },
        {
            name: 'Total Hoje',
            population: 0,
            color: '#007bff',
            legendFontColor: '#fff',
            legendFontSize: 13,
        },
    ]);
    const buscarDashboard = async () => {

        try {

            const response = await axios.get(
                'https://api-concierge.vercel.app/dashboard'
            );

            const dashboard = response.data;

            setGraficoData([
                {
                    name: 'Dentro',
                    population: Number(dashboard.dentro || 0),
                    color: '#28a745',
                    legendFontColor: '#fff',
                    legendFontSize: 13,
                },
                {
                    name: 'Saíram',
                    population: Number(dashboard.sairam || 0),
                    color: '#dc3545',
                    legendFontColor: '#fff',
                    legendFontSize: 13,
                },
                {
                    name: 'Total Hoje',
                    population: Number(dashboard.total || 0),
                    color: '#007bff',
                    legendFontColor: '#fff',
                    legendFontSize: 13,
                },
            ]);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        buscarDashboard();

    }, []);

    return (

        <ScrollView
            contentContainerStyle={styles.container}
        >

            <View style={styles.card}>

                <Text style={styles.title}>
                    Fluxo de Visitantes
                </Text>

                <View style={styles.chartContainer}>

                    <PieChart
                        data={graficoData}
                         width={Math.min(screenWidth - 40, 350)}
                        height={220}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        absolute
                        hasLegend={true}
                        chartConfig={{
                            backgroundColor: '#111',
                            backgroundGradientFrom: '#111',
                            backgroundGradientTo: '#111',
                            color: () => '#fff',
                        }}
                    />

                </View>

                {/* 🔥 CARDS VERTICAIS */}

                <View style={styles.infoContainer}>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoNumber}>
                            {graficoData[0]?.population || 0}
                        </Text>

                        <Text style={styles.infoLabel}>
                            Dentro da Empresa
                        </Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoNumber}>
                            {graficoData[1]?.population || 0}
                        </Text>

                        <Text style={styles.infoLabel}>
                            Já Saíram
                        </Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoNumber}>
                            {graficoData[2]?.population || 0}
                        </Text>

                        <Text style={styles.infoLabel}>
                            Total Hoje
                        </Text>
                    </View>

                </View>

            </View>
            <View style={styles.buttonContainer}>

                <TouchableOpacity
                    style={styles.button}
                    onPress={start}
                >

                    <Ionicons
                        name="arrow-back-outline"
                        size={22}
                        color="#fff"
                    />

                    <Text style={styles.buttonText}>
                        Voltar
                    </Text>

                </TouchableOpacity>

            </View>

        </ScrollView>

    );
}

const styles = StyleSheet.create({

    container: {
        flexGrow: 1,
        backgroundColor: '#000',
        padding: 15,
        alignItems: 'center',
    },

    card: {
        width: '100%',
        maxWidth: 400,

        backgroundColor: '#111',

        borderRadius: 18,

        padding: 5,

        borderWidth: 1,
        borderColor: '#222',

        elevation: 8,
    },

    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },

    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    infoContainer: {
        marginTop: 5,
        gap: 12,
    },

    infoBox: {
        backgroundColor: '#1a1a1a',

        borderRadius: 10,

        paddingVertical: 8,
        paddingHorizontal: 10,

        alignItems: 'center',

        borderWidth: 1,
        borderColor: '#2a2a2a',
    },

    infoNumber: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },

    infoLabel: {
        color: '#aaa',
        marginTop: 5,
        fontSize: 14,
    },

    buttonContainer: {
        marginTop: 10,
        alignItems: 'center',
    },

    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#007bff',

        paddingVertical: 12,
        paddingHorizontal: 25,

        borderRadius: 10,

        gap: 8,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

});