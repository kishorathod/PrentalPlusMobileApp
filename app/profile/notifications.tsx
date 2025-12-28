import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, Calendar, ChevronLeft, Heart, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    primary: '#3A86FF',
    background: '#F2F6FC',
    cardBackground: '#FFFFFF',
    textPrimary: '#0B132A',
    textSecondary: '#64748B',
    white: '#FFFFFF',
    border: '#E2E8F0',
};

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [settings, setSettings] = useState({
        appointments: true,
        healthTips: true,
        vitalReminders: false,
        securityAlerts: true,
        promotions: false,
    });

    const toggleSwitch = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Bell size={24} color={COLORS.primary} style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                        Choose the types of notifications you'd like to receive on your device.
                    </Text>
                </View>

                <View style={styles.card}>
                    <NotificationToggle
                        icon={Calendar}
                        title="Appointment Reminders"
                        description="Get notified about your upcoming doctor visits."
                        value={settings.appointments}
                        onToggle={() => toggleSwitch('appointments')}
                        color="#3A86FF"
                    />
                    <NotificationToggle
                        icon={Heart}
                        title="Daily Health Tips"
                        description="Receive helpful advice for your pregnancy journey."
                        value={settings.healthTips}
                        onToggle={() => toggleSwitch('healthTips')}
                        color="#FF8FA3"
                    />
                    <NotificationToggle
                        icon={Bell}
                        title="Vital Log Reminders"
                        description="Reminders to record your health measurements."
                        value={settings.vitalReminders}
                        onToggle={() => toggleSwitch('vitalReminders')}
                        color="#8B5CF6"
                    />
                    <NotificationToggle
                        icon={Shield}
                        title="Security Alerts"
                        description="Notifications about login attempts and account changes."
                        value={settings.securityAlerts}
                        onToggle={() => toggleSwitch('securityAlerts')}
                        color="#10B981"
                        isLast
                    />
                </View>

                <Text style={styles.sectionHeader}>Email Notifications</Text>
                <View style={styles.card}>
                    <NotificationToggle
                        icon={Mail}
                        title="Newsletter & Updates"
                        description="Stay updated with PrenatalPlus news and features."
                        value={settings.promotions}
                        onToggle={() => toggleSwitch('promotions')}
                        color="#64748B"
                        isLast
                    />
                </View>
            </ScrollView>
        </View>
    );
}

import { Mail } from 'lucide-react-native';

function NotificationToggle({
    icon: Icon,
    title,
    description,
    value,
    onToggle,
    color,
    isLast
}: {
    icon: any;
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    color: string;
    isLast?: boolean;
}) {
    return (
        <View style={[styles.toggleContainer, isLast && { borderBottomWidth: 0 }]}>
            <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
                <Icon size={20} color={color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.toggleTitle}>{title}</Text>
                <Text style={styles.toggleDescription}>{description}</Text>
            </View>
            <Switch
                trackColor={{ false: '#E2E8F0', true: '#3A86FF' }}
                thumbColor={value ? '#FFFFFF' : '#F1F5F9'}
                ios_backgroundColor="#E2E8F0"
                onValueChange={onToggle}
                value={value}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
    scrollContent: { padding: 24, paddingBottom: 40 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EBF3FF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        alignItems: 'center',
    },
    infoIcon: { marginRight: 12 },
    infoText: { flex: 1, fontSize: 13, color: '#3A86FF', fontWeight: '600', lineHeight: 18 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 16,
        marginLeft: 4,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: { flex: 1, marginRight: 8 },
    toggleTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
    toggleDescription: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
});
