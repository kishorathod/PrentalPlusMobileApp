import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../src/lib/api';

type VitalReading = {
    id: string;
    systolic?: number;
    diastolic?: number;
    heartRate?: number;
    weight?: number;
    temperature?: number;
    glucose?: number;
    spo2?: number;
    fetalMovement?: number;
    week?: number;
    notes?: string;
    recordedAt: string;
    hasAlerts: boolean;
};

type VitalsStats = {
    totalReadings: number;
    activeAlerts: number;
    averageSystolic: number | null;
    averageDiastolic: number | null;
    averageHeartRate: number | null;
    currentWeight: number | null;
    lastReading: VitalReading | null;
};

export default function VitalsScreen() {
    const insets = useSafeAreaInsets();
    const [readings, setReadings] = useState<VitalReading[]>([]);
    const [stats, setStats] = useState<VitalsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);

    const [formData, setFormData] = useState({
        systolic: '',
        diastolic: '',
        heartRate: '',
        weight: '',
        temperature: '',
        glucose: '',
        spo2: '',
        notes: '',
    });

    const fetchVitals = async () => {
        try {
            setLoading(true);
            const res = await api.get('/vitals/readings');
            setReadings(res.data.readings || []);
            setStats(res.data.stats);
        } catch (error) {
            console.error('Failed to fetch vitals:', error);
            Alert.alert('Error', 'Failed to load vitals data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVitals();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchVitals();
    };

    const handleRecord = async () => {
        // At least one vital must be provided
        const hasValue = formData.systolic || formData.diastolic || formData.heartRate ||
            formData.weight || formData.temperature || formData.glucose || formData.spo2;

        if (!hasValue) {
            Alert.alert('Error', 'Please enter at least one health measurement.');
            return;
        }

        try {
            setLoading(true);

            // Get active pregnancyId from dashboard
            const dashboardRes = await api.get('/mobile-dashboard');
            const pregnancyId = dashboardRes.data.pregnancy?.id;

            const payload = {
                pregnancyId,
                systolic: formData.systolic ? parseInt(formData.systolic) : undefined,
                diastolic: formData.diastolic ? parseInt(formData.diastolic) : undefined,
                heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
                glucose: formData.glucose ? parseFloat(formData.glucose) : undefined,
                spo2: formData.spo2 ? parseInt(formData.spo2) : undefined,
                notes: formData.notes,
                recordedAt: new Date().toISOString(),
            };

            const res = await api.post('/vitals/readings', payload);

            if (res.data.hasAlerts) {
                Alert.alert('Reading Saved', 'Your vitals have been recorded. Note: Some readings are outside the normal range. Please consult your doctor if you feel unwell.');
            } else {
                Alert.alert('Success', 'Vitals recorded successfully!');
            }

            setShowRecordModal(false);
            setFormData({
                systolic: '',
                diastolic: '',
                heartRate: '',
                weight: '',
                temperature: '',
                glucose: '',
                spo2: '',
                notes: '',
            });
            fetchVitals();
        } catch (error: any) {
            console.error('Failed to record vitals:', error);
            const msg = error.response?.data?.error || 'Failed to record vitals';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !refreshing && readings.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                <ActivityIndicator size="large" color="#EF4444" />
                <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading vitals data...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={{ backgroundColor: 'white', paddingHorizontal: 24, paddingTop: Math.max(insets.top, 16), paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>Health Vitals</Text>
                <Text style={{ color: '#6B7280' }}>Track your pregnancy health indicators</Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={{ padding: 24 }}>
                    {/* Stats Overview */}
                    {stats && (
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                            <StatBox
                                label="Current Weight"
                                value={stats.currentWeight ? `${stats.currentWeight} kg` : '--'}
                                icon="⚖️"
                                color="#FEE2E2"
                                textColor="#B91C1C"
                            />
                            <StatBox
                                label="Avg BP"
                                value={stats.averageSystolic && stats.averageDiastolic ? `${Math.round(stats.averageSystolic)}/${Math.round(stats.averageDiastolic)}` : '--'}
                                icon="❤️"
                                color="#FEE2E2"
                                textColor="#B91C1C"
                            />
                        </View>
                    )}

                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Recent History</Text>

                    {readings.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>🩺</Text>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 }}>No vitals recorded</Text>
                            <Text style={{ color: '#6B7280', textAlign: 'center' }}>
                                Start tracking your vitals to see them here.
                            </Text>
                        </View>
                    ) : (
                        readings.map(reading => (
                            <VitalReadingCard key={reading.id} reading={reading} />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                onPress={() => setShowRecordModal(true)}
                style={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    backgroundColor: '#EF4444',
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>

            {/* Record Modal */}
            <Modal visible={showRecordModal} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Record Vitals</Text>
                            <TouchableOpacity onPress={() => setShowRecordModal(false)}>
                                <Text style={{ fontSize: 20 }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ gap: 16, paddingBottom: 40 }}>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="BP Systolic" value={formData.systolic} onChangeText={(t: string) => setFormData(p => ({ ...p, systolic: t }))} placeholder="120" keyboardType="numeric" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="BP Diastolic" value={formData.diastolic} onChangeText={(t: string) => setFormData(p => ({ ...p, diastolic: t }))} placeholder="80" keyboardType="numeric" />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Heart Rate" value={formData.heartRate} onChangeText={(t: string) => setFormData(p => ({ ...p, heartRate: t }))} placeholder="75" keyboardType="numeric" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Weight (kg)" value={formData.weight} onChangeText={(t: string) => setFormData(p => ({ ...p, weight: t }))} placeholder="65.5" keyboardType="numeric" />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Temp (°C)" value={formData.temperature} onChangeText={(t: string) => setFormData(p => ({ ...p, temperature: t }))} placeholder="36.6" keyboardType="numeric" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Glucose" value={formData.glucose} onChangeText={(t: string) => setFormData(p => ({ ...p, glucose: t }))} placeholder="95" keyboardType="numeric" />
                                    </View>
                                </View>

                                <FormInput label="SpO2 (%)" value={formData.spo2} onChangeText={(t: string) => setFormData(p => ({ ...p, spo2: t }))} placeholder="98" keyboardType="numeric" />
                                <FormInput label="Notes" value={formData.notes} onChangeText={(t: string) => setFormData(p => ({ ...p, notes: t }))} placeholder="How are you feeling?" multiline />

                                <TouchableOpacity
                                    onPress={handleRecord}
                                    style={{ backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Save Readings</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function StatBox({ label, value, icon, color, textColor }: { label: string; value: string; icon: string; color: string; textColor: string }) {
    return (
        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}>
            <View style={{ backgroundColor: color, padding: 8, borderRadius: 12, marginBottom: 8 }}>
                <Text style={{ fontSize: 20 }}>{icon}</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>{value}</Text>
            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{label}</Text>
        </View>
    );
}

function VitalReadingCard({ reading }: { reading: VitalReading }) {
    const date = new Date(reading.recordedAt);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: '#6B7280', fontSize: 14 }}>{dateStr}</Text>
                {reading.week && (
                    <Text style={{ color: '#3B82F6', fontWeight: '600', fontSize: 14 }}>Week {reading.week}</Text>
                )}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                {reading.systolic && reading.diastolic && (
                    <ReadingItem label="BP" value={`${reading.systolic}/${reading.diastolic}`} unit="mmHg" />
                )}
                {reading.heartRate && (
                    <ReadingItem label="Heart" value={reading.heartRate} unit="bpm" />
                )}
                {reading.weight && (
                    <ReadingItem label="Weight" value={reading.weight} unit="kg" />
                )}
                {reading.temperature && (
                    <ReadingItem label="Temp" value={reading.temperature} unit="°C" />
                )}
                {reading.glucose && (
                    <ReadingItem label="Glucose" value={reading.glucose} unit="mg/dL" />
                )}
                {reading.spo2 && (
                    <ReadingItem label="SpO2" value={reading.spo2} unit="%" />
                )}
                {reading.fetalMovement !== undefined && (
                    <ReadingItem label="Kicks" value={reading.fetalMovement} unit="/session" />
                )}
            </View>

            {reading.notes && (
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                    <Text style={{ color: '#6B7280', fontSize: 13, fontStyle: 'italic' }}>"{reading.notes}"</Text>
                </View>
            )}

            {reading.hasAlerts && (
                <View style={{ marginTop: 12, backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ marginRight: 8 }}>⚠️</Text>
                    <Text style={{ color: '#B91C1C', fontSize: 12, fontWeight: '600' }}>Abnormal readings detected</Text>
                </View>
            )}
        </View>
    );
}

function ReadingItem({ label, value, unit }: { label: string; value: any; unit: string }) {
    return (
        <View style={{ minWidth: '30%' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>{label}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>{value} <Text style={{ fontSize: 10, fontWeight: 'normal', color: '#6B7280' }}>{unit}</Text></Text>
        </View>
    );
}

function FormInput({ label, ...props }: any) {
    return (
        <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>{label}</Text>
            <TextInput
                style={{
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: '#111827'
                }}
                placeholderTextColor="#9CA3AF"
                {...props}
            />
        </View>
    );
}
