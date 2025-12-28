import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Baby, Bell, Calendar, FileText, Heart, Pill, User as UserIcon, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';
import { getBabySize, getDaysUntilDue } from '../../src/lib/pregnancy-utils';

const COLORS = {
  primary: '#3A86FF',
  primaryDark: '#0077B6',
  secondary: '#FF8FA3',
  background: '#F2F6FC', // Refined Soft Blue Mist
  cardBackground: '#FFFFFF',
  textPrimary: '#0B132A',
  textSecondary: '#64748B',
  danger: '#FF4D4D',
  success: '#00C853',
  white: '#FFFFFF',
  border: '#E2E8F0',
};

type DashboardData = {
  stats: {
    totalAppointments: number;
    upcomingAppointments: number;
    totalVitals: number;
    totalReports: number;
    hasActivePregnancy: boolean;
  };
  pregnancy: {
    id: string;
    currentWeek: number;
    dueDate: string;
    startDate: string;
    riskLevel: string | null;
    babySize?: string | null;
  } | null;
  recent: {
    appointments: any[];
    vitals: any[];
    notifications: any[];
  };
  healthTip?: {
    title: string;
    message: string;
  };
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/mobile-dashboard');
      setData(res.data);
    } catch (error: any) {
      console.error('[Dashboard] Failed to fetch:', error.response?.status, error.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const activePregnancy = data?.pregnancy;
  const stats = data?.stats;
  const babySize = activePregnancy ? getBabySize(activePregnancy.currentWeek) : null;
  const daysUntilDue = activePregnancy ? getDaysUntilDue(activePregnancy.dueDate) : null;

  const insets = useSafeAreaInsets();

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#F9FBFF', '#FFFFFF']}
      style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}
    >
      <StatusBar style="dark" />

      {/* 1. Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.welcomeText}>Welcome back 👋</Text>
          <Text style={styles.userNameText} numberOfLines={1}>{user?.name || 'Patient'}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push('/profile/notifications-list')}>
            <Bell size={24} color={COLORS.textSecondary} />
            {data?.recent?.notifications?.some(n => !n.read) && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.headerIconBtn}>
            <UserIcon size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          {/* 2. Top Status Card */}
          <View style={styles.section}>
            {activePregnancy ? (
              <LinearGradient
                colors={[COLORS.primary, '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statusCard}
              >
                <View style={styles.statusHeader}>
                  <View>
                    <Text style={styles.statusLabel}>CURRENT STATUS</Text>
                    <Text style={styles.statusWeek}>Week {activePregnancy.currentWeek || '?'}</Text>
                    <Text style={styles.statusHint}>
                      {activePregnancy.currentWeek < 13 ? 'First Trimester' : activePregnancy.currentWeek < 27 ? 'Second Trimester' : 'Third Trimester'} 🌟
                    </Text>
                  </View>
                  <View style={styles.daysLeftBadge}>
                    <Text style={styles.daysLeftText}>{Math.max(0, 280 - (activePregnancy.currentWeek * 7))} days left</Text>
                  </View>
                </View>

                {/* New Baby Growth Preview */}
                <TouchableOpacity
                  onPress={() => router.push('/growth/baby-growth')}
                  activeOpacity={0.8}
                  style={styles.babySizeContainer}
                >
                  <View style={styles.babySizeTextContainer}>
                    <Text style={styles.babySizeText}>
                      Your baby is the size of a <Text style={styles.babySizeHighlight}>{activePregnancy.babySize || '...'}</Text>
                    </Text>
                    <Text style={styles.babySizeSubtext}>Tap to see development milestones →</Text>
                  </View>
                  <View style={styles.babyIconCircle}>
                    <Baby size={24} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={['#64748B', '#475569']}
                style={styles.statusCard}
              >
                <Text style={styles.statusLabel}>CURRENT STATUS</Text>
                <Text style={styles.statusWeek}>No Active Pregnancy</Text>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(true)}
                  style={styles.startButton}
                >
                  <Text style={styles.startButtonText}>Start Tracking</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>

          {/* 3. Overview Cards Grid */}
          {stats && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Daily Overview</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  icon={<Calendar size={24} color={COLORS.primary} />}
                  label="Appts"
                  value={stats.upcomingAppointments}
                />
                <StatCard
                  icon={<Heart size={24} color="#EF4444" />}
                  label="Vitals"
                  value={stats.totalVitals}
                />
                <StatCard
                  icon={<FileText size={24} color="#10B981" />}
                  label="Reports"
                  value={stats.totalReports}
                />
              </View>
            </View>
          )}

          {/* 4. Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <ActionCard
                title="Add Vitals"
                icon={<Heart size={26} color="#3A86FF" />}
                bgColor="#EFF6FF"
                href="/(tabs)/vitals"
              />
              <ActionCard
                title="Baby Growth"
                icon={<Baby size={26} color="#EC4899" />}
                bgColor="#FDF2F8"
                href="/growth/baby-growth"
              />
              <ActionCard
                title="Meds"
                icon={<Pill size={26} color="#10B981" />}
                bgColor="#ECFDF5"
                href="/medications/list"
              />
            </View>
          </View>

          {/* 5. Health Tip Card */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#E0F2FE', '#F0F9FF']}
              style={styles.tipCard}
            >
              <View style={styles.tipIconWrapper}>
                <Text style={{ fontSize: 24 }}>💡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>{data?.healthTip?.title || 'Daily Health Tip'}</Text>
                <Text style={styles.tipText}>{data?.healthTip?.message || 'Stay hydrated! Drinking enough water helps maintain amniotic fluid levels. 👶'}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* 6. Recent Notifications */}
          {data?.recent?.notifications && data.recent.notifications.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Recent Updates</Text>
                <TouchableOpacity onPress={() => router.push('/profile/notifications-list')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.notificationsList}>
                {data.recent.notifications.map((notif: any) => (
                  <NotificationItem key={notif.id} notification={notif} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <StartPregnancyModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          fetchData();
        }}
      />
    </LinearGradient>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrapper}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function NotificationItem({ notification }: { notification: any }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'VITAL_REMINDER': return <Heart size={18} color="#FF4D4D" />;
      case 'APPOINTMENT_REMINDER': return <Calendar size={18} color="#3A86FF" />;
      case 'HEALTH_ALERT': return <Baby size={18} color="#FF8FA3" />;
      case 'REPORT_UPLOADED': return <FileText size={18} color="#10B981" />;
      default: return <Bell size={18} color="#64748B" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'VITAL_REMINDER': return '#FFE4E6';
      case 'APPOINTMENT_REMINDER': return '#E0F2FE';
      case 'HEALTH_ALERT': return '#FFF1F2';
      case 'REPORT_UPLOADED': return '#F0FDF4';
      default: return '#F1F5F9';
    }
  };

  return (
    <View style={[styles.notificationItem, !notification.read && styles.unreadNotification]}>
      <View style={[styles.notificationIcon, { backgroundColor: getBgColor() }]}>
        {getIcon()}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={1}>{notification.message}</Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </View>
  );
}

import { Link } from 'expo-router';

function ActionCard({ title, icon, bgColor, href }: { title: string; icon: React.ReactNode; bgColor: string; href?: string }) {
  const isLocked = !href;
  const content = (
    <View style={[styles.actionCard, { backgroundColor: '#FFFFFFEE' }]}>
      <View style={[styles.actionIconWrapper, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <Text style={[styles.actionTitle, isLocked && { color: COLORS.textSecondary }]}>{title}</Text>
      {isLocked && <Text style={styles.coming_soonText}>Coming Soon</Text>}
    </View>
  );

  if (href) {
    return <Link href={href as any} asChild><TouchableOpacity activeOpacity={0.7}>{content}</TouchableOpacity></Link>;
  }
  return content;
}

// --- Start Pregnancy Modal Component ---

const BLOOD_TYPES = ['A', 'B', 'AB', 'O'];
const RH_FACTORS = ['Positive', 'Negative'];

function StartPregnancyModal({ visible, onClose, onSuccess }: { visible: boolean; onClose: () => void; onSuccess: () => void }) {
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 280 * 24 * 60 * 60 * 1000));
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [rhFactor, setRhFactor] = useState<string | null>(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateDueDate = (lmpDate: Date) => {
    const calculated = new Date(lmpDate);
    calculated.setDate(calculated.getDate() + 280);
    setDueDate(calculated);
  };

  const calculateLMPFromDueDate = (dd: Date) => {
    const calculated = new Date(dd);
    calculated.setDate(calculated.getDate() - 280);
    setStartDate(calculated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.post('/mobile-pregnancies', {
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
        bloodType: bloodType || undefined,
        rhFactor: rhFactor || undefined,
        height: height ? parseFloat(height) : undefined,
        prePregnancyWeight: weight ? parseFloat(weight) : undefined,
      });
      Alert.alert('Success', 'Pregnancy tracking started! 🎉');
      onSuccess();
    } catch (error: any) {
      console.error('[StartPregnancy] Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to start pregnancy tracking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Start Pregnancy 🤰</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.form} showsVerticalScrollIndicator={false}>
            <Text style={modalStyles.label}>Last Menstrual Period (LMP) *</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="YYYY-MM-DD"
              value={startDate.toISOString().split('T')[0]}
              onChangeText={(text) => {
                const d = new Date(text);
                if (!isNaN(d.getTime()) && text.length === 10) {
                  setStartDate(d);
                  calculateDueDate(d);
                }
              }}
            />

            <Text style={modalStyles.label}>Expected Due Date *</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="YYYY-MM-DD"
              value={dueDate.toISOString().split('T')[0]}
              onChangeText={(text) => {
                const d = new Date(text);
                if (!isNaN(d.getTime()) && text.length === 10) {
                  setDueDate(d);
                  calculateLMPFromDueDate(d);
                }
              }}
            />

            <View style={{ marginTop: 16 }}>
              <Text style={modalStyles.label}>Blood Type</Text>
              <View style={modalStyles.chipContainer}>
                {BLOOD_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setBloodType(type)}
                    style={[modalStyles.chip, bloodType === type && modalStyles.chipActive]}
                  >
                    <Text style={[modalStyles.chipText, bloodType === type && modalStyles.chipActiveText]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={modalStyles.label}>Rh Factor</Text>
              <View style={modalStyles.chipContainer}>
                {RH_FACTORS.map(factor => (
                  <TouchableOpacity
                    key={factor}
                    onPress={() => setRhFactor(factor)}
                    style={[modalStyles.chip, rhFactor === factor && modalStyles.chipActive]}
                  >
                    <Text style={[modalStyles.chipText, rhFactor === factor && modalStyles.chipActiveText]}>{factor}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={modalStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Height (cm)</Text>
                <TextInput style={modalStyles.input} keyboardType="numeric" value={height} onChangeText={setHeight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Weight (kg)</Text>
                <TextInput style={modalStyles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} />
              </View>
            </View>

            <TouchableOpacity
              style={[modalStyles.saveButton, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={modalStyles.saveButtonText}>Save & Start Tracking</Text>}
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // Removed fixed bg color
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: 16, color: COLORS.textSecondary, fontSize: 16 },
  header: {
    // backgroundColor: 'rgba(255,255,255,0.8)', // Optional: transparent
    paddingHorizontal: 20,
    paddingBottom: 16, // Decreased padding
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleContainer: { flex: 1, paddingRight: 12 },
  welcomeText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },
  userNameText: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 0 },
  headerIcons: { flexDirection: 'row', gap: 12 },
  headerIconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 22 }, // Added bg
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.danger, borderWidth: 2, borderColor: COLORS.white },
  statusCardWrapper: { marginBottom: 32 },
  statusCard: {
    padding: 24,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  statusLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  statusWeek: { color: COLORS.white, fontSize: 34, fontWeight: '800', marginTop: 0 },
  statusHint: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4, fontWeight: '500' },
  daysLeftBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  daysLeftText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  babySizeContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20
  },
  babySizeTextContainer: { flex: 1 },
  babySizeText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  babySizeSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2, fontWeight: '500' },
  babySizeHighlight: { fontWeight: '800' },
  babyIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: 28 }, // Refined spacing
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sectionHeader: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
  seeAllText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    width: '31%',
    backgroundColor: '#FFFFFFEE', // Refined
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, // Reduced
    shadowRadius: 8,
    elevation: 2
  },
  statIconWrapper: { marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, // Reduced
    shadowRadius: 10,
    elevation: 2
  },
  actionIconWrapper: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionTitle: { fontWeight: '700', color: COLORS.textPrimary, fontSize: 12, textAlign: 'center' },
  coming_soonText: { fontSize: 8, color: COLORS.textSecondary, marginTop: 2 },
  startButton: { backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 16, alignSelf: 'flex-start', marginTop: 16 },
  startButtonText: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 15 },
  tipCard: {
    padding: 24,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: "#3A86FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  tipIconWrapper: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  tipTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  tipText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  notificationsList: { backgroundColor: '#FFFFFFEE', borderRadius: 24, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  notificationItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  unreadNotification: { backgroundColor: '#F8FAFC' },
  notificationIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  notificationMessage: { fontSize: 12, color: COLORS.textSecondary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 8 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  content: { backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  closeBtn: { padding: 8 },
  form: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, fontSize: 16, color: COLORS.textPrimary, marginBottom: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#DBEAFE', borderColor: COLORS.primary },
  chipText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  chipActiveText: { color: COLORS.primary, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 16, marginTop: 16 },
  saveButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 32, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10 },
  saveButtonText: { color: COLORS.white, fontWeight: '800', fontSize: 17 },
});
