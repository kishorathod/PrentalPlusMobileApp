import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Eye, EyeOff, Fingerprint, Key, Lock, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
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
    success: '#10B981',
};

export default function SecurityScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleUpdatePassword = () => {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            Alert.alert('Error', 'Please fill in all password fields.');
            return;
        }
        if (passwordData.new !== passwordData.confirm) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        Alert.alert('Success', 'Password has been updated successfully.');
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Shield size={24} color={COLORS.success} style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                        Manage your account security and authentication preferences.
                    </Text>
                </View>

                <Text style={styles.sectionHeader}>Authentication</Text>
                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
                            <Fingerprint size={20} color="#0EA5E9" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.settingTitle}>FaceID / Fingerprint</Text>
                            <Text style={styles.settingDescription}>Use biometrics for faster login.</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
                            thumbColor={biometricEnabled ? '#FFFFFF' : '#F1F5F9'}
                            onValueChange={() => setBiometricEnabled(!biometricEnabled)}
                            value={biometricEnabled}
                        />
                    </View>
                    <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                        <View style={[styles.iconWrapper, { backgroundColor: '#F5F3FF' }]}>
                            <Lock size={20} color="#8B5CF6" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.settingTitle}>Two-Factor Auth</Text>
                            <Text style={styles.settingDescription}>Secure your account with 2FA.</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
                            thumbColor={twoFactorEnabled ? '#FFFFFF' : '#F1F5F9'}
                            onValueChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            value={twoFactorEnabled}
                        />
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Update Password</Text>
                <View style={styles.card}>
                    <PasswordInput
                        label="Current Password"
                        value={passwordData.current}
                        onChange={(t) => setPasswordData({ ...passwordData, current: t })}
                        show={showPasswords.current}
                        toggleShow={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    />
                    <PasswordInput
                        label="New Password"
                        value={passwordData.new}
                        onChange={(t) => setPasswordData({ ...passwordData, new: t })}
                        show={showPasswords.new}
                        toggleShow={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    />
                    <PasswordInput
                        label="Confirm New Password"
                        value={passwordData.confirm}
                        onChange={(t) => setPasswordData({ ...passwordData, confirm: t })}
                        show={showPasswords.confirm}
                        toggleShow={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        isLast
                    />

                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdatePassword}
                    >
                        <Key size={18} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.updateButtonText}>Update Password</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

function PasswordInput({
    label,
    value,
    onChange,
    show,
    toggleShow,
    isLast
}: {
    label: string,
    value: string,
    onChange: (t: string) => void,
    show: boolean,
    toggleShow: () => void,
    isLast?: boolean
}) {
    return (
        <View style={[styles.inputGroup, isLast && { marginBottom: 20 }]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!show}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity onPress={toggleShow} style={styles.eyeIcon}>
                    {show ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                </TouchableOpacity>
            </View>
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
        backgroundColor: '#DCFCE7',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        alignItems: 'center',
    },
    infoIcon: { marginRight: 12 },
    infoText: { flex: 1, fontSize: 13, color: COLORS.success, fontWeight: '600', lineHeight: 18 },
    sectionHeader: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16, marginLeft: 4 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        marginBottom: 24,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    textContainer: { flex: 1, marginRight: 8 },
    settingTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
    settingDescription: { fontSize: 12, color: COLORS.textSecondary },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    eyeIcon: { padding: 4 },
    updateButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        marginTop: 8,
    },
    updateButtonText: { color: 'white', fontWeight: '800', fontSize: 16 },
});
