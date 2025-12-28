import { StatusBar } from 'expo-status-bar';
import { Calendar, Clock, Plus, User as UserIcon, X } from 'lucide-react-native';
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
    warning: '#FCA311',
    white: '#FFFFFF',
    border: '#E2E8F0',
};

type Appointment = {
    id: string;
    title: string;
    date: string;
    time?: string;
    status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    type?: string;
    doctorName?: string;
    notes?: string;
};

export default function AppointmentsScreen() {
    const insets = useSafeAreaInsets();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        type: 'ROUTINE_CHECKUP',
        date: '',
        time: '',
        doctorName: '',
        location: '',
        notes: '',
    });

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/appointments');
            setAppointments(res.data.appointments || []);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            Alert.alert('Error', 'Failed to load appointments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointments();
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.date || !formData.time) {
            Alert.alert('Error', 'Title, date, and time are required.');
            return;
        }

        try {
            setLoading(true);
            const dateTimeStr = `${formData.date}T${formData.time}:00`;
            const dateObj = new Date(dateTimeStr);

            if (isNaN(dateObj.getTime())) {
                Alert.alert('Error', 'Invalid date or time format. Please use YYYY-MM-DD and HH:mm.');
                setLoading(false);
                return;
            }

            await api.post('/appointments', {
                title: formData.title,
                type: formData.type,
                date: dateObj.toISOString(),
                duration: 30, // Default
                doctorName: formData.doctorName,
                location: formData.location,
                notes: formData.notes,
            });

            Alert.alert('Success', 'Appointment scheduled successfully!');
            setShowCreateModal(false);
            setFormData({
                title: '',
                type: 'ROUTINE_CHECKUP',
                date: '',
                time: '',
                doctorName: '',
                location: '',
                notes: '',
            });
            fetchAppointments();
        } catch (error: any) {
            console.error('Failed to create appointment:', error);
            const msg = error.response?.data?.error || 'Failed to create appointment';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const now = new Date();

        if (filter === 'upcoming') {
            return aptDate >= now && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED';
        } else if (filter === 'past') {
            return aptDate < now || apt.status === 'COMPLETED' || apt.status === 'CANCELLED';
        }
        return true;
    });

    if (loading && !refreshing && appointments.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Text style={styles.headerTitle}>Appointments</Text>

                {/* Filter Tabs */}
                <View style={styles.filterRow}>
                    <FilterTab label="Upcoming" active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
                    <FilterTab label="Past" active={filter === 'past'} onPress={() => setFilter('past')} />
                    <FilterTab label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    {filteredAppointments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconWrapper}>
                                <Calendar size={48} color={COLORS.textSecondary} opacity={0.3} />
                            </View>
                            <Text style={styles.emptyTitle}>No appointments</Text>
                            <Text style={styles.emptySubtitle}>
                                {filter === 'upcoming'
                                    ? 'You have no upcoming appointments. Stay on top of your health by scheduling one!'
                                    : 'No appointments found in this category.'}
                            </Text>
                        </View>
                    ) : (
                        filteredAppointments.map(apt => (
                            <AppointmentCard key={apt.id} appointment={apt} />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.8}
                style={styles.fab}
            >
                <Plus size={32} color="white" />
            </TouchableOpacity>

            {/* Create Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.content}>
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>Schedule Appointment</Text>
                            <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setShowCreateModal(false)}>
                                <X size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                            <View style={modalStyles.form}>
                                <FormInput label="Title" value={formData.title} onChangeText={(t: string) => setFormData(p => ({ ...p, title: t }))} placeholder="Routine Checkup" />

                                <View style={modalStyles.inputGroup}>
                                    <Text style={modalStyles.label}>Appointment Type</Text>
                                    <View style={modalStyles.typeGrid}>
                                        {['ROUTINE_CHECKUP', 'ULTRASOUND', 'LAB_TEST', 'CONSULTATION'].map(type => (
                                            <TouchableOpacity
                                                key={type}
                                                onPress={() => setFormData(p => ({ ...p, type }))}
                                                activeOpacity={0.7}
                                                style={[
                                                    modalStyles.typeChip,
                                                    formData.type === type && modalStyles.typeChipActive
                                                ]}
                                            >
                                                <Text style={[
                                                    modalStyles.typeChipText,
                                                    formData.type === type && modalStyles.typeChipActiveText
                                                ]}>
                                                    {type.replace('_', ' ')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={modalStyles.row}>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Date" value={formData.date} onChangeText={(t: string) => setFormData(p => ({ ...p, date: t }))} placeholder="YYYY-MM-DD" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Time" value={formData.time} onChangeText={(t: string) => setFormData(p => ({ ...p, time: t }))} placeholder="HH:mm" />
                                    </View>
                                </View>

                                <FormInput label="Doctor Name" value={formData.doctorName} onChangeText={(t: string) => setFormData(p => ({ ...p, doctorName: t }))} placeholder="Dr. Smith" />
                                <FormInput label="Location" value={formData.location} onChangeText={(t: string) => setFormData(p => ({ ...p, location: t }))} placeholder="Main Clinic" />
                                <FormInput label="Notes" value={formData.notes} onChangeText={(t: string) => setFormData(p => ({ ...p, notes: t }))} placeholder="Add any specific instructions or notes..." multiline />

                                <TouchableOpacity
                                    onPress={handleCreate}
                                    activeOpacity={0.8}
                                    style={modalStyles.saveButton}
                                >
                                    <Text style={modalStyles.saveButtonText}>Confirm Appointment</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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

function FilterTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.filterTab, active && styles.filterTabActive]}
        >
            <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{label}</Text>
        </TouchableOpacity>
    );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
    const date = new Date(appointment.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = appointment.time || date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const statusMap = {
        SCHEDULED: { color: COLORS.primary, bg: '#E0F2FE', label: 'In Progress' },
        CONFIRMED: { color: COLORS.success, bg: '#DCFCE7', label: 'Confirmed' },
        COMPLETED: { color: COLORS.textSecondary, bg: '#F1F5F9', label: 'Completed' },
        CANCELLED: { color: COLORS.danger, bg: '#FFE4E6', label: 'Cancelled' },
    };

    const status = statusMap[appointment.status] || statusMap.SCHEDULED;

    return (
        <View style={styles.appointmentCard}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.aptTitle}>{appointment.title}</Text>
                    {appointment.doctorName && (
                        <View style={styles.doctorInfo}>
                            <UserIcon size={14} color={COLORS.textSecondary} />
                            <Text style={styles.doctorName}>Dr. {appointment.doctorName}</Text>
                        </View>
                    )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                    <View style={[styles.detailIcon, { backgroundColor: '#E0F2FE' }]}>
                        <Calendar size={14} color={COLORS.primary} />
                    </View>
                    <Text style={styles.detailText}>{dateStr}</Text>
                </View>
                <View style={styles.detailItem}>
                    <View style={[styles.detailIcon, { backgroundColor: '#F1F5F9' }]}>
                        <Clock size={14} color={COLORS.textSecondary} />
                    </View>
                    <Text style={styles.detailText}>{timeStr}</Text>
                </View>
            </View>

            {appointment.type && (
                <View style={styles.typeTag}>
                    <Text style={styles.typeTagText}>{appointment.type.replace('_', ' ')}</Text>
                </View>
            )}
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
    headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
    filterRow: { flexDirection: 'row', gap: 10 },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    filterTabActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterTabText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
    filterTabTextActive: { color: COLORS.white },
    scrollContent: { padding: 20, paddingBottom: 100 },
    appointmentCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    aptTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
    doctorInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    doctorName: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    cardDetails: { flexDirection: 'row', gap: 16, marginBottom: 14 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    detailText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
    typeTag: { alignSelf: 'flex-start', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    typeTagText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
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
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    typeChipActive: {
        backgroundColor: '#E0F2FE',
        borderColor: COLORS.primary
    },
    typeChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    typeChipActiveText: { color: COLORS.primary, fontWeight: '700' },
    row: { flexDirection: 'row', gap: 16 },
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
