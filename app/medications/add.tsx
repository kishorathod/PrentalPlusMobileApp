import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, ChevronLeft, Clock, Plus, Save, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/lib/api';

const COLORS = {
    primary: '#3A86FF',
    secondary: '#8B5CF6',
    background: '#F8FAFC',
    white: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
};

const QUICK_SUPPLEMENTS = [
    { name: 'Folic Acid', dosage: '400mcg' },
    { name: 'Iron', dosage: '27mg' },
    { name: 'Vitamin D', dosage: '600IU' },
    { name: 'Calcium', dosage: '1000mg' },
    { name: 'Prenatal Multi', dosage: '1 Tablet' },
];

const FREQUENCIES = [
    { id: 'DAILY', label: 'Daily' },
    { id: 'TWICE_DAILY', label: '2x Daily' },
    { id: 'THREE_TIMES_DAILY', label: '3x Daily' },
];

export default function AddMedicationScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: 'DAILY',
        timeOfDay: ['08:00'],
    });

    const handleQuickSelect = (sup: typeof QUICK_SUPPLEMENTS[0]) => {
        setFormData(prev => ({ ...prev, name: sup.name, dosage: sup.dosage }));
    };

    const handleAddTimeSlot = () => {
        if (formData.timeOfDay.length >= 3) return;
        setFormData(prev => ({ ...prev, timeOfDay: [...prev.timeOfDay, '12:00'] }));
    };

    const handleRemoveTimeSlot = (index: number) => {
        if (formData.timeOfDay.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            timeOfDay: prev.timeOfDay.filter((_, i) => i !== index)
        }));
    };

    const updateTimeSlot = (index: number, time: string) => {
        setFormData(prev => ({
            ...prev,
            timeOfDay: prev.timeOfDay.map((t, i) => i === index ? time : t)
        }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.dosage) {
            Alert.alert('Error', 'Please fill in the name and dosage');
            return;
        }

        try {
            setLoading(true);
            await api.post('/mobile-medications', formData);
            Alert.alert('Success', 'Medication reminder added! 🎉');
            router.back();
        } catch (error: any) {
            console.error('[AddMedication] Save error:', error);
            const errorDetail = error.response?.data?.details || error.response?.data?.error || error.response?.data?.message || 'Unknown error';
            Alert.alert('Error', `Failed to save medication reminder\n\n${typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Medication</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveButtonHeader}>
                    {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Save size={24} color={COLORS.primary} />}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Quick Selection */}
                <Text style={styles.label}>Quick Select</Text>
                <View style={styles.quickSelectGrid}>
                    {QUICK_SUPPLEMENTS.map((sup, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.quickChip, formData.name === sup.name && styles.quickChipActive]}
                            onPress={() => handleQuickSelect(sup)}
                        >
                            <Text style={[styles.quickChipText, formData.name === sup.name && styles.quickChipTextActive]}>
                                {sup.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Form Fields */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Medication Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Folic Acid"
                        value={formData.name}
                        onChangeText={text => setFormData(p => ({ ...p, name: text }))}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Dosage</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 400mcg or 1 tablet"
                        value={formData.dosage}
                        onChangeText={text => setFormData(p => ({ ...p, dosage: text }))}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Frequency</Text>
                    <View style={styles.frequencyRow}>
                        {FREQUENCIES.map(freq => (
                            <TouchableOpacity
                                key={freq.id}
                                onPress={() => setFormData(p => ({ ...p, frequency: freq.id }))}
                                style={[styles.freqChip, formData.frequency === freq.id && styles.freqChipActive]}
                            >
                                <Text style={[styles.freqText, formData.frequency === freq.id && styles.freqTextActive]}>
                                    {freq.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <View style={styles.timeHeader}>
                        <Text style={styles.label}>Reminder Times</Text>
                        {formData.timeOfDay.length < 3 && (
                            <TouchableOpacity onPress={handleAddTimeSlot} style={styles.addTimeBtn}>
                                <Plus size={16} color={COLORS.primary} />
                                <Text style={styles.addTimeText}>Add Time</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {formData.timeOfDay.map((time, index) => (
                        <View key={index} style={styles.timeInputRow}>
                            <View style={styles.timeIconWrapper}>
                                <Clock size={18} color={COLORS.textSecondary} />
                            </View>
                            <TextInput
                                style={styles.timeInput}
                                placeholder="08:00"
                                value={time}
                                onChangeText={text => updateTimeSlot(index, text)}
                                maxLength={5}
                            />
                            {formData.timeOfDay.length > 1 && (
                                <TouchableOpacity onPress={() => handleRemoveTimeSlot(index)} style={styles.removeTimeBtn}>
                                    <X size={18} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    <Text style={styles.helperText}>Use 24-hour format (HH:MM)</Text>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    style={[styles.mainSaveButton, loading && { opacity: 0.7 }]}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Text style={styles.mainSaveText}>Save Reminder</Text>
                            <Bell size={20} color={COLORS.white} />
                        </>
                    )}
                </TouchableOpacity>

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
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    saveButtonHeader: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
    scrollContent: { padding: 24, paddingBottom: 60 },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12 },
    quickSelectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
    quickChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#F1F5F9' },
    quickChipActive: { backgroundColor: '#DBEAFE', borderColor: COLORS.primary },
    quickChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    quickChipTextActive: { color: COLORS.primary, fontWeight: '700' },
    formGroup: { marginBottom: 24 },
    input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, fontSize: 16, color: COLORS.textPrimary },
    frequencyRow: { flexDirection: 'row', gap: 8 },
    freqChip: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    freqChipActive: { backgroundColor: '#DBEAFE', borderColor: COLORS.primary },
    freqText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
    freqTextActive: { color: COLORS.primary, fontWeight: '700' },
    timeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    addTimeBtn: { flexDirection: 'row', alignItems: 'center' },
    addTimeText: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginLeft: 4 },
    timeInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingHorizontal: 16, marginBottom: 10 },
    timeIconWrapper: { marginRight: 12 },
    timeInput: { flex: 1, height: 50, fontSize: 16, color: COLORS.textPrimary, fontWeight: '600' },
    removeTimeBtn: { padding: 8 },
    helperText: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 4 },
    mainSaveButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 18,
        borderRadius: 20,
        marginTop: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    mainSaveText: { color: COLORS.white, fontWeight: '800', fontSize: 17 },
});
