import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight, Headset, HelpCircle, Mail, MessageSquare, Phone, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
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
};

export default function SupportScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [message, setMessage] = useState('');

    const handleSendMessage = () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter a message before sending.');
            return;
        }
        Alert.alert('Success', 'Your message has been sent. Our support team will get back to you soon.');
        setMessage('');
    };

    const handleCall = () => {
        Linking.openURL('tel:+1234567890').catch(() => {
            Alert.alert('Error', 'Phone calls are not supported on this device.');
        });
    };

    const handleEmail = () => {
        Linking.openURL('mailto:support@prenatalplus.com').catch(() => {
            Alert.alert('Error', 'Email is not configured on this device.');
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={styles.heroIconWrapper}>
                        <Headset size={40} color="white" />
                    </View>
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>We're here to support you 24/7</Text>
                </View>

                <View style={styles.contactCards}>
                    <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
                        <View style={[styles.contactIconWrapper, { backgroundColor: '#E0F2FE' }]}>
                            <Phone size={24} color="#0EA5E9" />
                        </View>
                        <Text style={styles.contactLabel}>Call Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
                        <View style={[styles.contactIconWrapper, { backgroundColor: '#F0FDF4' }]}>
                            <Mail size={24} color="#22C55E" />
                        </View>
                        <Text style={styles.contactLabel}>Email Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard}>
                        <View style={[styles.contactIconWrapper, { backgroundColor: '#FEF2F2' }]}>
                            <MessageSquare size={24} color="#EF4444" />
                        </View>
                        <Text style={styles.contactLabel}>Live Chat</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
                <View style={styles.card}>
                    <FAQItem question="How do I track my baby's kicks?" />
                    <FAQItem question="Can I share reports with my doctor?" />
                    <FAQItem question="What should I do in an emergency?" isLast />
                </View>

                <Text style={styles.sectionHeader}>Send us a Message</Text>
                <View style={styles.card}>
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Write your message here..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={4}
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendMessage}
                    >
                        <Send size={18} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.sendButtonText}>Send Message</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

function FAQItem({ question, isLast }: { question: string, isLast?: boolean }) {
    return (
        <TouchableOpacity style={[styles.faqRow, isLast && { borderBottomWidth: 0 }]}>
            <HelpCircle size={18} color="#94A3B8" style={{ marginRight: 12 }} />
            <Text style={styles.faqText}>{question}</Text>
            <ChevronRight size={18} color="#CBD5E1" />
        </TouchableOpacity>
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
    heroSection: { alignItems: 'center', marginBottom: 32 },
    heroIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    heroTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
    heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
    contactCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    contactCard: {
        backgroundColor: COLORS.white,
        width: '30%',
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    contactIconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    contactLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
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
    faqRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    faqText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
    messageInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        borderRadius: 16,
        padding: 16,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 15,
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
    },
    sendButtonText: { color: 'white', fontWeight: '800', fontSize: 16 },
});
