import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../src/lib/api';

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading appointments...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={{ backgroundColor: 'white', paddingHorizontal: 24, paddingTop: Math.max(insets.top, 16), paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Appointments</Text>

                {/* Filter Tabs */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <FilterTab label="Upcoming" active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
                    <FilterTab label="Past" active={filter === 'past'} onPress={() => setFilter('past')} />
                    <FilterTab label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={{ padding: 24 }}>
                    {filteredAppointments.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>📅</Text>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 }}>No appointments</Text>
                            <Text style={{ color: '#6B7280', textAlign: 'center' }}>
                                {filter === 'upcoming' ? 'You have no upcoming appointments' : 'No appointments found'}
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
                style={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    backgroundColor: '#3B82F6',
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

            {/* Create Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Schedule Appointment</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Text style={{ fontSize: 20 }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ gap: 16, paddingBottom: 40 }}>
                                <FormInput label="Title" value={formData.title} onChangeText={(t: string) => setFormData(p => ({ ...p, title: t }))} placeholder="Routine Checkup" />

                                <View style={{ gap: 8 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Type</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {['ROUTINE_CHECKUP', 'ULTRASOUND', 'LAB_TEST', 'CONSULTATION'].map(type => (
                                            <TouchableOpacity
                                                key={type}
                                                onPress={() => setFormData(p => ({ ...p, type }))}
                                                style={{
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    borderRadius: 8,
                                                    backgroundColor: formData.type === type ? '#3B82F6' : '#F3F4F6'
                                                }}
                                            >
                                                <Text style={{ fontSize: 12, color: formData.type === type ? 'white' : '#6B7280' }}>{type.replace('_', ' ')}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Date" value={formData.date} onChangeText={(t: string) => setFormData(p => ({ ...p, date: t }))} placeholder="YYYY-MM-DD" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FormInput label="Time" value={formData.time} onChangeText={(t: string) => setFormData(p => ({ ...p, time: t }))} placeholder="HH:mm" />
                                    </View>
                                </View>

                                <FormInput label="Doctor Name" value={formData.doctorName} onChangeText={(t: string) => setFormData(p => ({ ...p, doctorName: t }))} placeholder="Dr. Smith" />
                                <FormInput label="Location" value={formData.location} onChangeText={(t: string) => setFormData(p => ({ ...p, location: t }))} placeholder="Main Clinic" />
                                <FormInput label="Notes" value={formData.notes} onChangeText={(t: string) => setFormData(p => ({ ...p, notes: t }))} placeholder="Add any notes..." multiline />

                                <TouchableOpacity
                                    onPress={handleCreate}
                                    style={{ backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Schedule Appointment</Text>
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

function FilterTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: active ? '#3B82F6' : '#F3F4F6',
            }}
        >
            <Text style={{ color: active ? 'white' : '#6B7280', fontWeight: '500' }}>{label}</Text>
        </TouchableOpacity>
    );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
    const date = new Date(appointment.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = appointment.time || date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const statusColors = {
        SCHEDULED: { bg: '#DBEAFE', text: '#1E40AF' },
        CONFIRMED: { bg: '#D1FAE5', text: '#065F46' },
        COMPLETED: { bg: '#E5E7EB', text: '#374151' },
        CANCELLED: { bg: '#FEE2E2', text: '#991B1B' },
    };

    const colors = statusColors[appointment.status] || statusColors.SCHEDULED;

    return (
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 }}>{appointment.title}</Text>
                    {appointment.doctorName && (
                        <Text style={{ color: '#6B7280', fontSize: 14 }}>Dr. {appointment.doctorName}</Text>
                    )}
                </View>
                <View style={{ backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '500' }}>{appointment.status}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, marginRight: 6 }}>📅</Text>
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>{dateStr}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, marginRight: 6 }}>🕐</Text>
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>{timeStr}</Text>
                </View>
            </View>

            {appointment.type && (
                <View style={{ marginTop: 8 }}>
                    <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Type: {appointment.type}</Text>
                </View>
            )}
        </View>
    );
}
