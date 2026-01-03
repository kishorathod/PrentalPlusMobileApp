import { LinearGradient } from 'expo-linear-gradient';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Baby, Bell, Calendar, CheckCircle2, ChevronRight, ClipboardList, FileText, Heart, Pill, User as UserIcon, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Card, LoadingSkeleton, ProgressBar, SkeletonGroup } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';
import { lightImpact, mediumImpact } from '../../src/lib/haptics';
import { BABY_SIZES, WEEKLY_INSIGHTS } from '../../src/lib/pregnancy-data';
import { formatDueDate, getPregnancyProgress } from '../../src/lib/pregnancy-utils';
import theme from '../../src/lib/theme';

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

// Insight Detail Modal Component
function InsightDetailModal({ visible, onClose, insight }: { visible: boolean; onClose: () => void; insight: any }) {
  if (!insight) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={modalStyles.overlay}>
        <Animated.View entering={FadeInDown.springify()} style={modalStyles.detailedContent}>
          <View style={modalStyles.header}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconWrapper, { backgroundColor: theme.colors.primary[50] }]}>
                {insight.icon}
              </View>
              <Text style={modalStyles.title}>Weekly Insight</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <X size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.detailSection}>
              <Text style={modalStyles.detailLabel}>WHAT'S HAPPENING</Text>
              <Text style={modalStyles.detailText}>{insight.text}</Text>
            </View>

            {insight.whyItMatters && (
              <View style={modalStyles.detailSection}>
                <Text style={modalStyles.detailLabel}>WHY IT MATTERS</Text>
                <Text style={[modalStyles.detailText, { fontStyle: 'italic', color: theme.colors.text.secondary }]}>
                  {insight.whyItMatters}
                </Text>
              </View>
            )}

            {insight.checklist && insight.checklist.length > 0 && (
              <View style={modalStyles.detailSection}>
                <Text style={modalStyles.detailLabel}>THIS WEEK'S TASKS</Text>
                <View style={[styles.insightChecklist, { marginTop: 8 }]}>
                  {insight.checklist.map((item: string, idx: number) => (
                    <View key={idx} style={[styles.insightChecklistItem, { marginBottom: 12 }]}>
                      <CheckCircle2 size={18} color={theme.colors.primary[500]} />
                      <Text style={[styles.insightChecklistText, { fontSize: 14, flex: 1 }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Insight Card Component
function InsightCard({ title, text, icon, color, onPress }: { title: string; text: string; icon: React.ReactNode; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => { lightImpact(); onPress(); }}>
      <Card variant="elevated" padding="md" style={[styles.insightCard, { backgroundColor: color }]}>
        <View style={styles.insightHeader}>
          <View style={styles.insightIconWrapper}>{icon}</View>
          <Text style={styles.insightTitle}>{title}</Text>
        </View>
        <Text style={[styles.insightText, { lineHeight: 20 }]} numberOfLines={4}>{text}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.readMoreText}>Tap to learn more →</Text>
      </Card>
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [isInsightModalVisible, setIsInsightModalVisible] = useState(false);
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
    lightImpact();
    fetchData();
  };

  const activePregnancy = data?.pregnancy;
  const stats = data?.stats;

  const progress = activePregnancy ? getPregnancyProgress(activePregnancy.dueDate) : null;
  const currentWeek = progress?.currentWeek || 0;
  const babySize = progress ? BABY_SIZES.find(s => s.week === currentWeek) : null;
  const weekProgress = progress ? (currentWeek / 40) * 100 : 0;

  const insets = useSafeAreaInsets();

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={theme.gradients.background}
          style={StyleSheet.absoluteFill}
        />
        <SkeletonGroup style={{ width: '90%' }}>
          <LoadingSkeleton height={120} borderRadius={theme.borderRadius.xl} />
          <LoadingSkeleton height={80} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <LoadingSkeleton height={100} width="30%" />
            <LoadingSkeleton height={100} width="30%" />
            <LoadingSkeleton height={100} width="30%" />
          </View>
        </SkeletonGroup>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradients.background}
      style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}
    >
      <StatusBar style="dark" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.welcomeText}>Welcome back 👋</Text>
          <Text style={styles.userNameText} numberOfLines={1}>{user?.name || 'Patient'}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => {
              lightImpact();
              router.push('/profile/notifications-list');
            }}
          >
            <Bell size={22} color={theme.colors.text.secondary} />
            {data?.recent?.notifications?.some(n => !n.read) && (
              <Badge variant="danger" dot size="sm" style={styles.notificationDot} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              lightImpact();
              router.push('/(tabs)/profile');
            }}
            style={styles.headerIconBtn}
          >
            <UserIcon size={22} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary[500]} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Pregnancy Status Card */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
            {activePregnancy ? (
              <Card variant="gradient" gradientColors={theme.gradients.pregnancy} padding="lg" style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statusLabel}>CURRENT STATUS</Text>
                    <Text style={styles.statusWeek}>
                      Week {currentWeek}
                      <Text style={styles.statusWeekTotal}> · {progress?.trimesterName}</Text>
                    </Text>
                    <Text style={styles.statusHint}>
                      Due {formatDueDate(activePregnancy.dueDate)} · {progress?.daysRemaining} days left
                    </Text>
                  </View>
                  <View style={styles.trimesterBadge}>
                    <Text style={styles.trimesterValue}>{progress?.trimesterName.split(' ')[0]}</Text>
                    <Text style={styles.trimesterLabel}>Trimester</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.progressLabel}>Pregnancy Progress</Text>
                    <Text style={[styles.progressLabel, { fontWeight: '800' }]}>{currentWeek} / 40 wks</Text>
                  </View>
                  <ProgressBar
                    progress={weekProgress}
                    height={8}
                    gradient
                    gradientColors={['#FFFFFF', '#F0F9FF']}
                    backgroundColor="rgba(255,255,255,0.2)"
                  />
                </View>

                {/* Baby Growth Preview */}
                <TouchableOpacity
                  onPress={() => {
                    mediumImpact();
                    router.push('/growth/baby-growth');
                  }}
                  activeOpacity={0.8}
                  style={styles.babySizeCard}
                >
                  <View style={styles.babySizeInner}>
                    <Text style={styles.babySizeEmoji}>{babySize?.icon || '🌱'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.babySizeLabel}>Your baby is the size of a</Text>
                      <Text style={styles.babySizeValue}>{babySize?.object || 'Poppy Seed'}</Text>
                      <View style={styles.babyStatsRow}>
                        <Text style={styles.babyStatText}>📏 {babySize?.length || '--'}</Text>
                        <View style={styles.statDot} />
                        <Text style={styles.babyStatText}>⚖️ {babySize?.weight || '--'}</Text>
                      </View>
                    </View>
                    <View style={styles.milestoneMiniBadge}>
                      <ChevronRight size={18} color={theme.colors.primary[500]} />
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            ) : (
              <Card variant="gradient" gradientColors={[theme.colors.gray[600], theme.colors.gray[700]]} padding="lg">
                <Text style={styles.statusLabel}>CURRENT STATUS</Text>
                <Text style={styles.statusWeek}>No Active Pregnancy</Text>
                <TouchableOpacity
                  onPress={() => {
                    mediumImpact();
                    setIsModalVisible(true);
                  }}
                  style={styles.startButton}
                >
                  <Text style={styles.startButtonText}>Start Tracking</Text>
                </TouchableOpacity>
              </Card>
            )}
          </Animated.View>

          {/* Weekly Insights */}
          {activePregnancy && (
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Weekly Insights</Text>
                <Badge size="sm">Week {currentWeek}</Badge>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.insightsScroll}
                snapToInterval={280 + theme.spacing.md}
                decelerationRate="fast"
              >
                {(() => {
                  const insight = WEEKLY_INSIGHTS.find(i => i.week === currentWeek);
                  return (
                    <>
                      <InsightCard
                        title="Your Baby This Week"
                        text={insight?.baby || "Your baby is continuing to grow and develop amazing new features."}
                        icon={<Baby size={20} color={theme.colors.primary[600]} />}
                        color={theme.colors.primary[50]}
                        onPress={() => {
                          setSelectedInsight({
                            title: "Your Baby This Week",
                            text: insight?.baby || "Your baby is continuing to grow and develop amazing new features.",
                            icon: <Baby size={20} color={theme.colors.primary[600]} />,
                            whyItMatters: insight?.whyItMatters,
                            checklist: insight?.checklist
                          });
                          setIsInsightModalVisible(true);
                        }}
                      />
                      <InsightCard
                        title="Your Body This Week"
                        text={insight?.mother || "You might feel some new changes as your body supports this journey."}
                        icon={<UserIcon size={20} color={theme.colors.secondary[600]} />}
                        color={theme.colors.secondary[50]}
                        onPress={() => {
                          setSelectedInsight({
                            title: "Your Body This Week",
                            text: insight?.mother || "You might feel some new changes as your body supports this journey.",
                            icon: <UserIcon size={20} color={theme.colors.secondary[600]} />,
                            whyItMatters: "Supporting a new life requires significant energy and adjustment.",
                            checklist: ["Stay hydrated", "Get extra rest"]
                          });
                          setIsInsightModalVisible(true);
                        }}
                      />
                      <InsightCard
                        title="Care Tips This Week"
                        text={insight?.tip || "Focus on small, daily habits that help you feel your best."}
                        icon={<Pill size={20} color={theme.colors.success[600]} />}
                        color={theme.colors.success[50]}
                        onPress={() => {
                          setSelectedInsight({
                            title: "Care Tips This Week",
                            text: insight?.tip || "Focus on small, daily habits that help you feel your best.",
                            icon: <Pill size={20} color={theme.colors.success[600]} />,
                            whyItMatters: "Consistent self-care is the best foundation for a healthy pregnancy.",
                            checklist: ["Healthy snacks", "Mindful breathing"]
                          });
                          setIsInsightModalVisible(true);
                        }}
                      />
                    </>
                  );
                })()}
              </ScrollView>
            </Animated.View>
          )}

          {/* Stats Overview */}
          {stats && (
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
              <Text style={styles.sectionHeader}>Daily Overview</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  icon={<Calendar size={20} color={theme.colors.primary[500]} />}
                  label="Appts"
                  value={stats.upcomingAppointments}
                  subtext={stats.upcomingAppointments > 0 ? "Next at 4 PM" : "None today"}
                  color={theme.colors.primary[100]}
                  delay={250}
                  href="/appointments"
                />
                <StatCard
                  icon={<Heart size={20} color={theme.colors.danger[500]} />}
                  label="Vitals"
                  value={stats.totalVitals}
                  subtext="Updated today"
                  color={theme.colors.danger[100]}
                  delay={300}
                  href="/vitals"
                />
                <StatCard
                  icon={<FileText size={20} color={theme.colors.success[500]} />}
                  label="Reports"
                  value={stats.totalReports}
                  subtext="1 New"
                  color={theme.colors.success[100]}
                  delay={350}
                  href="/reports"
                />
              </View>
            </Animated.View>
          )}

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <ActionCard
                title="Add Vitals"
                icon={<Heart size={26} color={theme.colors.primary[600]} />}
                bgColor={theme.colors.primary[50]}
                href="/(tabs)/vitals"
                delay={450}
              />
              <ActionCard
                title="Baby Growth"
                icon={<Baby size={26} color={theme.colors.secondary[600]} />}
                bgColor={theme.colors.secondary[50]}
                href="/growth/baby-growth"
                delay={500}
              />
            </View>
            <View style={[styles.actionsGrid, { marginTop: 12 }]}>
              <ActionCard
                title="Medications"
                icon={<Pill size={26} color={theme.colors.success[600]} />}
                bgColor={theme.colors.success[50]}
                href="/medications/list"
                delay={550}
              />
              <ActionCard
                title="Checklist"
                icon={<ClipboardList size={26} color={theme.colors.warning[600]} />}
                bgColor={theme.colors.warning[50]}
                href="/checklist"
                delay={600}
              />
            </View>
          </Animated.View>

          {/* Health Tip */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.section}>
            <Card variant="elevated" padding="lg" style={styles.tipCard}>
              <View style={styles.tipIconWrapper}>
                <Text style={{ fontSize: 28 }}>💡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>{data?.healthTip?.title || 'Daily Health Tip'}</Text>
                <Text style={styles.tipText}>{data?.healthTip?.message || 'Stay hydrated! Drinking enough water helps maintain amniotic fluid levels. 👶'}</Text>
              </View>
            </Card>
          </Animated.View>

          {/* Recent Notifications */}
          {data?.recent?.notifications && data.recent.notifications.length > 0 && (
            <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Recent Updates</Text>
                <TouchableOpacity onPress={() => {
                  lightImpact();
                  router.push('/profile/notifications-list');
                }}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <Card variant="default" padding="sm">
                {data.recent.notifications.slice(0, 3).map((notif: any, index) => (
                  <NotificationItem key={notif.id} notification={notif} isLast={index === Math.min(2, data.recent.notifications.length - 1)} />
                ))}
              </Card>
            </Animated.View>
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

      <InsightDetailModal
        visible={isInsightModalVisible}
        onClose={() => setIsInsightModalVisible(false)}
        insight={selectedInsight}
      />
    </LinearGradient>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, subtext, color, delay, href }: { icon: React.ReactNode; label: string; value: number; subtext?: string; color: string; delay: number; href?: string }) {
  const content = (
    <Card variant="elevated" padding="md" style={styles.statCard}>
      <View style={[styles.statIconWrapper, { backgroundColor: color }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    </Card>
  );

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      {href ? (
        <Link href={href as any} asChild>
          <TouchableOpacity activeOpacity={0.7} onPress={() => lightImpact()}>
            {content}
          </TouchableOpacity>
        </Link>
      ) : content}
    </Animated.View>
  );
}

// Action Card Component
function ActionCard({ title, icon, bgColor, href, delay }: { title: string; icon: React.ReactNode; bgColor: string; href?: string; delay: number }) {
  const content = (
    <Card variant="elevated" padding="md" style={styles.actionCard}>
      <View style={[styles.actionIconWrapper, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      {!href && <Text style={styles.comingSoonText}>Soon</Text>}
    </Card>
  );

  if (href) {
    return (
      <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
        <Link href={href as any} asChild>
          <TouchableOpacity activeOpacity={0.7} onPress={() => lightImpact()}>
            {content}
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      {content}
    </Animated.View>
  );
}

// Notification Item Component
function NotificationItem({ notification, isLast }: { notification: any; isLast: boolean }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'VITAL_REMINDER': return <Heart size={18} color={theme.colors.danger[500]} />;
      case 'APPOINTMENT_REMINDER': return <Calendar size={18} color={theme.colors.primary[500]} />;
      case 'HEALTH_ALERT': return <Baby size={18} color={theme.colors.secondary[500]} />;
      case 'REPORT_UPLOADED': return <FileText size={18} color={theme.colors.success[500]} />;
      default: return <Bell size={18} color={theme.colors.gray[500]} />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'VITAL_REMINDER': return theme.colors.danger[50];
      case 'APPOINTMENT_REMINDER': return theme.colors.primary[50];
      case 'HEALTH_ALERT': return theme.colors.secondary[50];
      case 'REPORT_UPLOADED': return theme.colors.success[50];
      default: return theme.colors.gray[50];
    }
  };

  return (
    <View style={[styles.notificationItem, !isLast && styles.notificationBorder]}>
      <View style={[styles.notificationIcon, { backgroundColor: getBgColor() }]}>
        {getIcon()}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={1}>{notification.message}</Text>
      </View>
      {!notification.read && <Badge variant="primary" dot size="sm" />}
    </View>
  );
}

// Start Pregnancy Modal Component (keeping the existing implementation)
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
      mediumImpact();
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
              <X size={24} color={theme.colors.text.secondary} />
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
                    onPress={() => {
                      lightImpact();
                      setBloodType(type);
                    }}
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
                    onPress={() => {
                      lightImpact();
                      setRhFactor(factor);
                    }}
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
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerTitleContainer: { flex: 1, paddingRight: theme.spacing.md },
  welcomeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium
  },
  userNameText: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs
  },
  headerIcons: { flexDirection: 'row', gap: theme.spacing.sm },
  headerIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.sm,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm
  },
  section: {
    marginBottom: theme.spacing.xl + theme.spacing.sm, // Increase spacing for better breathing room
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  sectionHeader: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.bold
  },
  statusCard: {
    ...theme.shadows.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 1
  },
  statusWeek: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs
  },
  statusWeekTotal: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    opacity: 0.8,
  },
  statusHint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold
  },
  daysBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minWidth: 80,
  },
  daysValue: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold
  },
  daysLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase'
  },
  progressContainer: {
    marginVertical: theme.spacing.md,
  },
  babySizeCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  babySizeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  babySizeEmoji: {
    fontSize: 32,
    backgroundColor: theme.colors.primary[50],
    width: 60,
    height: 60,
    borderRadius: 30,
    textAlign: 'center',
    lineHeight: 60,
  },
  babySizeLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    fontWeight: '600',
  },
  babySizeValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  babyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  babyStatText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.gray[300],
  },
  milestoneMiniBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsScroll: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.xl,
  },
  insightCard: {
    width: 280,
    height: 180,
    borderWidth: 0,
    ...theme.shadows.sm,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  insightIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  insightText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  insightChecklistText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary[600],
    marginTop: theme.spacing.sm,
    letterSpacing: 0.3,
  },
  trimesterBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minWidth: 80,
  },
  trimesterValue: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold
  },
  trimesterLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase'
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  startButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.md
  },
  startButtonText: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.extrabold,
    fontSize: theme.typography.fontSize.base
  },
  statsGrid: { flexDirection: 'row', gap: theme.spacing.md },
  statCard: {
    alignItems: 'center',
  },
  statIconWrapper: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs
  },
  statLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  statSubtext: {
    color: theme.colors.text.tertiary,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  actionsGrid: { flexDirection: 'row', gap: theme.spacing.md },
  actionCard: {
    alignItems: 'center',
  },
  actionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm
  },
  actionTitle: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center'
  },
  comingSoonText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs
  },
  tipCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.primary[50],
  },
  tipIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  tipTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  tipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  notificationBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md
  },
  notificationContent: { flex: 1 },
  notificationTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 2
  },
  notificationMessage: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary
  },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '90%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary
  },
  closeBtn: { padding: theme.spacing.sm },
  form: { marginBottom: theme.spacing.md },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm
  },
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[100],
    borderWidth: 1,
    borderColor: theme.colors.gray[100]
  },
  chipActive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[500]
  },
  chipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold
  },
  chipActiveText: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.bold
  },
  row: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md },
  saveButton: {
    backgroundColor: theme.colors.primary[500],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    ...theme.shadows.colored(theme.colors.primary[500]),
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.extrabold,
    fontSize: theme.typography.fontSize.lg
  },
  detailedContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '85%',
    width: '100%',
  },
  detailSection: {
    marginBottom: theme.spacing.xl,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
});
