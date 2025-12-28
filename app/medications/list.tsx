import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Check, ChevronLeft, Clock, Pill, Plus } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/lib/api';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#3A86FF',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    background: '#F8FAFC',
    white: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
};

interface MedicationLog {
    id: string;
    taken: boolean;
    scheduledFor: string;
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    timeOfDay: string[];
    logs: MedicationLog[];
}

interface DailySlot {
    reminderId: string;
    name: string;
    dosage: string;
    time: string;
    taken: boolean;
    logId?: string;
}

export default function MedicationListScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [dailySchedule, setDailySchedule] = useState<DailySlot[]>([]);

    const fetchMedications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/mobile-medications');
            const data = res.data.medications || [];
            setMedications(data);
            processSchedule(data);
        } catch (error) {
            console.error('[Medications] Fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const processSchedule = (meds: Medication[]) => {
        const schedule: DailySlot[] = [];
        const today = new Date().toISOString().split('T')[0];

        meds.forEach(med => {
            med.timeOfDay.forEach(time => {
                const scheduledTime = `${today}T${time}:00.000Z`;
                const existingLog = med.logs.find(log => {
                    const logTime = new Date(log.scheduledFor).toISOString().split('T')[1].substring(0, 5);
                    return logTime === time;
                });

                schedule.push({
                    reminderId: med.id,
                    name: med.name,
                    dosage: med.dosage,
                    time,
                    taken: existingLog?.taken || false,
                    logId: existingLog?.id
                });
            });
        });

        // Sort by time
        schedule.sort((a, b) => a.time.localeCompare(b.time));
        setDailySchedule(schedule);
    };

    useFocusEffect(
        useCallback(() => {
            fetchMedications();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchMedications();
    };

    const handleLogIntake = async (slot: DailySlot) => {
        if (slot.taken) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const scheduledFor = `${today}T${slot.time}:00.000Z`;

            await api.post('/mobile-medications/log', {
                reminderId: slot.reminderId,
                taken: true,
                scheduledFor,
                notes: 'Logged via mobile app'
            });

            // Refresh data to update state
            fetchMedications();
            Alert.alert('Success', `${slot.name} intake recorded!`);
        } catch (error) {
            console.error('[Medications] Log error:', error);
            Alert.alert('Error', 'Failed to record intake');
        }
    };

    const getTakenCount = () => dailySchedule.filter(s => s.taken).length;
    const progress = dailySchedule.length > 0 ? getTakenCount() / dailySchedule.length : 0;

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Medications</Text>
                <TouchableOpacity onPress={() => router.push('/medications/add')} style={styles.addButton}>
                    <Plus size={24} color={COLORS.white} />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {/* Progress Card */}
                <LinearGradient
                    colors={[COLORS.primary, '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.progressCard}
                >
                    <View style={styles.progressHeader}>
                        <View>
                            <Text style={styles.progressTitle}>Daily Progress</Text>
                            <Text style={styles.progressSubtitle}>
                                {getTakenCount()} of {dailySchedule.length} doses taken
                            </Text>
                        </View>
                        <View style={styles.pillIconBg}>
                            <Pill size={24} color={COLORS.primary} />
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressPercent}>{Math.round(progress * 100)}% Completed</Text>
                </LinearGradient>

                {/* Schedule List */}
                <Text style={styles.sectionHeader}>Today's Schedule</Text>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : dailySchedule.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconWrapper}>
                            <Pill size={48} color="#CBD5E1" />
                        </View>
                        <Text style={styles.emptyTitle}>No medications set</Text>
                        <Text style={styles.emptySubtitle}>Tap the + button to add your supplements or prescribed medications.</Text>
                    </View>
                ) : (
                    dailySchedule.map((slot, index) => (
                        <TouchableOpacity
                            key={`${slot.reminderId}-${index}`}
                            onPress={() => handleLogIntake(slot)}
                            activeOpacity={0.7}
                            style={[styles.slotCard, slot.taken && styles.slotCardTaken]}
                            disabled={slot.taken}
                        >
                            <View style={styles.slotTimeContainer}>
                                <Clock size={16} color={COLORS.textSecondary} />
                                <Text style={styles.slotTime}>{slot.time}</Text>
                            </View>
                            <View style={styles.slotContent}>
                                <Text style={styles.slotName}>{slot.name}</Text>
                                <Text style={styles.slotDosage}>{slot.dosage}</Text>
                            </View>
                            <View style={[styles.statusIndicator, slot.taken ? styles.statusTaken : styles.statusPending]}>
                                {slot.taken ? (
                                    <Check size={18} color={COLORS.white} />
                                ) : (
                                    <View style={styles.pendingDot} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
    scrollContent: { padding: 20, paddingBottom: 40 },
    progressCard: {
        borderRadius: 28,
        padding: 24,
        marginBottom: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 5,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    progressTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
    progressSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
    pillIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 12 },
    progressBarFill: { height: '100%', backgroundColor: COLORS.white, borderRadius: 4 },
    progressPercent: { color: COLORS.white, fontSize: 12, fontWeight: '700', textAlign: 'right' },
    sectionHeader: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
    slotCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    slotCardTaken: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
    slotTimeContainer: { width: 70, alignItems: 'center' },
    slotTime: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4 },
    slotContent: { flex: 1, marginLeft: 12 },
    slotName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
    slotDosage: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    statusIndicator: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    statusTaken: { backgroundColor: COLORS.success },
    statusPending: { backgroundColor: '#F1F5F9' },
    pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIconWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
});
