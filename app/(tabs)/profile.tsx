import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, ChevronRight, Headset, Info, LogOut, LucideIcon, Scale, Shield, User as UserIcon } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';

const COLORS = {
    primary: '#3A86FF',
    background: '#F2F6FC',
    cardBackground: '#FFFFFF',
    textPrimary: '#0B132A',
    textSecondary: '#64748B',
    danger: '#FF4D4D',
    white: '#FFFFFF',
    border: '#F1F5F9',
};

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, signOut } = useAuth();

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header / Profile Info */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <View style={styles.avatarWrapper}>
                    <UserIcon size={40} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.userName}>{user?.name || 'User Profile'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'patient@example.com'}</Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{user?.role?.toUpperCase() || 'PATIENT'}</Text>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.menuGroup}>
                    <ProfileMenuItem icon={UserIcon} title="Personal Information" color="#3A86FF" href="/profile/personal-info" />
                    <ProfileMenuItem icon={Bell} title="Smart Reminders" color="#FCA311" href="/profile/reminders" />
                    <ProfileMenuItem icon={Shield} title="Security" color="#10B981" href="/profile/security" />
                    <ProfileMenuItem icon={Headset} title="Help & Support" color="#8B5CF6" href="/profile/support" isLast />
                </View>

                <View style={styles.menuGroup}>
                    <ProfileMenuItem icon={Info} title="About PrenatalPlus" color="#64748B" />
                    <ProfileMenuItem icon={Scale} title="Terms & Conditions" color="#64748B" isLast />
                </View>

                <TouchableOpacity
                    onPress={signOut}
                    activeOpacity={0.7}
                    style={styles.signOutButton}
                >
                    <Text style={styles.signOutText}>Sign Out</Text>
                    <LogOut size={20} color={COLORS.danger} />
                </TouchableOpacity>

                <Text style={styles.versionText}>
                    Version 1.0.0 (Beta)
                </Text>
            </ScrollView>
        </View>
    );
}

function ProfileMenuItem({ icon: Icon, title, color, isLast, href }: { icon: LucideIcon; title: string; color: string; isLast?: boolean; href?: string }) {
    const router = useRouter();
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
            onPress={() => href && router.push(href as any)}
        >
            <View style={[styles.menuIconWrapper, { backgroundColor: `${color}15` }]}>
                <Icon size={20} color={color} />
            </View>
            <Text style={styles.menuTitle}>{title}</Text>
            <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 24,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    avatarWrapper: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: COLORS.background,
    },
    userName: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
    userEmail: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
    badge: {
        marginTop: 14,
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12
    },
    badgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    menuGroup: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border
    },
    menuIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    menuTitle: { flex: 1, fontSize: 16, color: COLORS.textPrimary, fontWeight: '600' },
    signOutButton: {
        backgroundColor: '#FFE4E6',
        padding: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 24
    },
    signOutText: { color: COLORS.danger, fontWeight: '800', fontSize: 17, marginRight: 10 },
    versionText: { textAlign: 'center', color: '#94A3B8', fontSize: 13, fontWeight: '500' },
});
