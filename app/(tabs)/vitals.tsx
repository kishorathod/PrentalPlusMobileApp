import { StatusBar } from 'expo-status-bar';
import { Activity, Baby, Droplets, Heart, Plus, Thermometer, Scale as WeightIcon, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/lib/api';

const COLORS = {
    primary: '#3A86FF',
    background: '#F2F6FC',
    cardBackground: '#FFFFFF',
    textPrimary: '#0B132A',
    textSecondary: '#64748B',
    danger: '#FF4D4D',
    success: '#00C853',
    white: '#FFFFFF',
    border: '#E2E8F0',
};

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

import { useAuth } from '../../src/context/AuthContext';

export default function VitalsScreen() {
    const { user } = useAuth();
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
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await api.get('/vitals/readings');
            setReadings(res.data.readings || []);
            setStats(res.data.stats);
        } catch (error: any) {
            console.error('Failed to fetch vitals:', error);
            const errorDetail = error.response?.data?.error || error.response?.data?.message || error.message;
            Alert.alert('Error', `Failed to load vitals data\n\nDetail: ${errorDetail}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVitals();
    }, [user]);

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
            const errorDetail = error.response?.data?.error || error.response?.data?.message || error.message;
            Alert.alert('Record Failed', `Failed to record vitals\n\nDetail: ${errorDetail}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !refreshing && readings.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading vitals data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Text style={styles.headerTitle}>Health Vitals</Text>
                <Text style={styles.headerSubtitle}>Track your pregnancy health indicators</Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Overview */}
                {stats && (
                    <View style={styles.statsRow}>
                        <StatBox
                            label="Current Weight"
                            value={stats.currentWeight ? `${stats.currentWeight} kg` : '--'}
                            icon={WeightIcon}
                            color="#E0F2FE"
                            iconColor="#0EA5E9"
                        />
                        <StatBox
                            label="Avg BP"
                            value={stats.averageSystolic && stats.averageDiastolic ? `${Math.round(stats.averageSystolic)}/${Math.round(stats.averageDiastolic)}` : '--'}
                            icon={Heart}
                            color="#FFE4E6"
                            iconColor="#F43F5E"
                        />
                    </View>
                )}

                <Text style={styles.sectionHeader}>Recent History</Text>

                {readings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrapper}>
                            <Activity size={48} color={COLORS.textSecondary} opacity={0.3} />
                        </View>
                        <Text style={styles.emptyTitle}>No vitals recorded</Text>
                        <Text style={styles.emptySubtitle}>
                            Start tracking your vitals regularly to monitor your progress.
                        </Text>
                    </View>
                ) : (
                    readings.map(reading => (
                        <VitalReadingCard key={reading.id} reading={reading} />
                    ))
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                onPress={() => setShowRecordModal(true)}
                activeOpacity={0.8}
                style={styles.fab}
            >
                <Plus size={32} color="white" />
            </TouchableOpacity>

            {/* Record Modal */}
            <Modal visible={showRecordModal} animationType="slide" transparent>
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.content}>
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>Record Vitals</Text>
                            <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setShowRecordModal(false)}>
                                <X size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                            <View style={modalStyles.form}>
                                <View style={modalStyles.row}>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="BP Systolic" value={formData.systolic} onChangeText={(t: string) => setFormData(p => ({ ...p, systolic: t }))} placeholder="120" keyboardType="numeric" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="BP Diastolic" value={formData.diastolic} onChangeText={(t: string) => setFormData(p => ({ ...p, diastolic: t }))} placeholder="80" keyboardType="numeric" />
                                    </View>
                                </View>

                                <View style={modalStyles.row}>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Heart Rate" value={formData.heartRate} onChangeText={(t: string) => setFormData(p => ({ ...p, heartRate: t }))} placeholder="75" keyboardType="numeric" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Weight (kg)" value={formData.weight} onChangeText={(t: string) => setFormData(p => ({ ...p, weight: t }))} placeholder="65.5" keyboardType="numeric" />
                                    </View>
                                </View>

                                <View style={modalStyles.row}>
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
                                    activeOpacity={0.8}
                                    style={modalStyles.saveButton}
                                >
                                    <Text style={modalStyles.saveButtonText}>Save Readings</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function StatBox({ label, value, icon: Icon, color, iconColor }: { label: string; value: string; icon: any; color: string; iconColor: string }) {
    return (
        <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: color }]}>
                <Icon size={24} color={iconColor} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );
}

function VitalReadingCard({ reading }: { reading: VitalReading }) {
    const date = new Date(reading.recordedAt);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <View style={styles.readingCard}>
            <View style={styles.readingHeader}>
                <Text style={styles.readingDate}>{dateStr}</Text>
                {reading.week && (
                    <View style={styles.weekBadge}>
                        <Text style={styles.weekBadgeText}>Week {reading.week}</Text>
                    </View>
                )}
            </View>

            <View style={styles.readingGrid}>
                {reading.systolic && reading.diastolic && (
                    <ReadingItem icon={Heart} label="Blood Pressure" value={`${reading.systolic}/${reading.diastolic}`} unit="mmHg" color="#F43F5E" />
                )}
                {reading.heartRate && (
                    <ReadingItem icon={Activity} label="Heart Rate" value={reading.heartRate} unit="bpm" color="#3A86FF" />
                )}
                {reading.weight && (
                    <ReadingItem icon={WeightIcon} label="Weight" value={reading.weight} unit="kg" color="#0EA5E9" />
                )}
                {reading.temperature && (
                    <ReadingItem icon={Thermometer} label="Temperature" value={reading.temperature} unit="°C" color="#F59E0B" />
                )}
                {reading.glucose && (
                    <ReadingItem icon={Droplets} label="Blood Glucose" value={reading.glucose} unit="mg/dL" color="#10B981" />
                )}
                {reading.spo2 && (
                    <ReadingItem icon={Activity} label="SpO2 Level" value={reading.spo2} unit="%" color="#8B5CF6" />
                )}
                {reading.fetalMovement !== undefined && (
                    <ReadingItem icon={Baby} label="Fetal Kicks" value={reading.fetalMovement} unit="/session" color="#F472B6" />
                )}
            </View>

            {reading.notes && (
                <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>"{reading.notes}"</Text>
                </View>
            )}

            {reading.hasAlerts && (
                <View style={styles.alertContainer}>
                    <Activity size={16} color={COLORS.danger} />
                    <Text style={styles.alertText}>Abnormal readings detected. Consult your doctor.</Text>
                </View>
            )}
        </View>
    );
}

function ReadingItem({ icon: Icon, label, value, unit, color }: { icon: any; label: string; value: any; unit: string; color: string }) {
    return (
        <View style={styles.readingItem}>
            <View style={[styles.readingItemIcon, { backgroundColor: `${color}10` }]}>
                <Icon size={14} color={color} />
            </View>
            <View>
                <Text style={styles.readingItemLabel}>{label}</Text>
                <Text style={styles.readingItemValue}>
                    {value} <Text style={styles.readingItemUnit}>{unit}</Text>
                </Text>
            </View>
        </View>
    );
}

function FormInput({ label, ...props }: any) {
    return (
        <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>{label}</Text>
            <TextInput
                style={modalStyles.input}
                placeholderTextColor="#94A3B8"
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    loadingText: { marginTop: 16, color: COLORS.textSecondary, fontSize: 16, fontWeight: '500' },
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
    headerSubtitle: { color: COLORS.textSecondary, fontSize: 15, marginTop: 4 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2
    },
    statIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    statValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    sectionHeader: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
    readingCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2
    },
    readingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    readingDate: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
    weekBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    weekBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '800' },
    readingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    readingItem: { minWidth: '45%', flexDirection: 'row', alignItems: 'center', gap: 10 },
    readingItemIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    readingItemLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    readingItemValue: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginTop: 1 },
    readingItemUnit: { fontSize: 11, fontWeight: '500', color: COLORS.textSecondary },
    notesContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
    notesText: { color: COLORS.textSecondary, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
    alertContainer: {
        marginTop: 16,
        backgroundColor: '#FFE4E6',
        padding: 12,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    alertText: { color: COLORS.danger, fontSize: 12, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyIconWrapper: { marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
    emptySubtitle: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 15, lineHeight: 22, paddingHorizontal: 20 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        backgroundColor: COLORS.primary,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
});

const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(11, 19, 42, 0.4)', justifyContent: 'flex-end' },
    content: { backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
    closeBtn: { padding: 4 },
    form: { gap: 16 },
    row: { flexDirection: 'row', gap: 16 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.textPrimary
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4
    },
    saveButtonText: { color: COLORS.white, fontWeight: '800', fontSize: 17 },
});
