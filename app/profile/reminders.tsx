import { useRouter } from 'expo-router';
import { Bell, Calendar, ChevronLeft, Droplets, Pill, Scan, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui';
import { lightImpact } from '../../src/lib/haptics';
import theme from '../../src/lib/theme';

type ReminderType = 'appointments' | 'medications' | 'vitamins' | 'water' | 'scans';

export default function RemindersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [reminders, setReminders] = useState({
        appointments: true,
        medications: true,
        vitamins: true,
        water: false,
        scans: true,
    });

    const toggleReminder = (key: ReminderType) => {
        lightImpact();
        setReminders(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity
                    onPress={() => {
                        lightImpact();
                        router.back();
                    }}
                    style={styles.backButton}
                >
                    <ChevronLeft size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Smart Reminders</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.topInfo}>
                    <View style={styles.infoIconWrapper}>
                        <Bell size={32} color={theme.colors.primary[500]} />
                    </View>
                    <Text style={styles.infoTitle}>Stay on Track ⏰</Text>
                    <Text style={styles.infoSubtitle}>
                        Get timely alerts for your prenatal care. You can turn them on or off anytime.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>CORE CARE</Text>
                    <ReminderItem
                        icon={<Calendar size={22} color={theme.colors.primary[500]} />}
                        title="Doctor Appointments"
                        description="Alerts for upcoming consultations"
                        enabled={reminders.appointments}
                        onToggle={() => toggleReminder('appointments')}
                    />
                    <ReminderItem
                        icon={<Pill size={22} color={theme.colors.danger[500]} />}
                        title="Medications & Vitamins"
                        description="Daily reminders for your prescriptions"
                        enabled={reminders.medications}
                        onToggle={() => toggleReminder('medications')}
                    />
                    <ReminderItem
                        icon={<Scan size={22} color={theme.colors.success[500]} />}
                        title="Scan Schedules"
                        description="Reminders for important ultrasounds"
                        enabled={reminders.scans}
                        onToggle={() => toggleReminder('scans')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DAILY HABITS</Text>
                    <ReminderItem
                        icon={<Droplets size={22} color={theme.colors.secondary[500]} />}
                        title="Water Intake"
                        description="Remind me to stay hydrated"
                        enabled={reminders.water}
                        onToggle={() => toggleReminder('water')}
                    />
                </View>

                <Card variant="outlined" padding="lg" style={styles.privacyNote}>
                    <View style={styles.privacyHeader}>
                        <ShieldCheck size={20} color={theme.colors.success[600]} />
                        <Text style={styles.privacyTitle}>Your Privacy</Text>
                    </View>
                    <Text style={styles.privacyText}>
                        Reminders are scheduled locally on your device. We respect your peace—no spam, just care.
                    </Text>
                </Card>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function ReminderItem({ icon, title, description, enabled, onToggle }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <Card variant="elevated" padding="md" style={styles.reminderCard}>
            <View style={styles.reminderIconWrapper}>
                {icon}
            </View>
            <View style={styles.reminderContent}>
                <Text style={styles.reminderTitle}>{title}</Text>
                <Text style={styles.reminderDescription}>{description}</Text>
            </View>
            <Switch
                value={enabled}
                onValueChange={onToggle}
                trackColor={{ false: theme.colors.gray[200], true: theme.colors.primary[500] }}
                ios_backgroundColor={theme.colors.gray[200]}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: theme.colors.white,
        ...theme.shadows.sm,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    content: { flex: 1, paddingHorizontal: 20 },
    topInfo: {
        alignItems: 'center',
        marginVertical: 32,
        paddingHorizontal: 20,
    },
    infoIconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 8,
    },
    infoSubtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    section: { marginBottom: 24 },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: theme.colors.text.tertiary,
        marginBottom: 12,
        letterSpacing: 1,
    },
    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 0,
    },
    reminderIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.gray[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    reminderContent: { flex: 1, paddingRight: 8 },
    reminderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    reminderDescription: {
        fontSize: 13,
        color: theme.colors.text.secondary,
    },
    privacyNote: {
        backgroundColor: theme.colors.success[50],
        borderColor: theme.colors.success[100],
        marginTop: 8,
    },
    privacyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    privacyTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: theme.colors.success[700],
    },
    privacyText: {
        fontSize: 13,
        color: theme.colors.success[600],
        lineHeight: 18,
    },
});
