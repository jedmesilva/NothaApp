import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useArea } from '@/contexts/AreaContext';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';

export default function GlobalHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { area, setArea } = useArea();

  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const switchArea = (tab: 'credito' | 'investir') => {
    setArea(tab);
    if (tab === 'investir') {
      router.navigate('/carteira' as any);
    } else {
      router.navigate('/');
    }
  };

  return (
    <View style={[s.header, { paddingTop: topPad }]}>
        {/* Avatar */}
        <TouchableOpacity style={s.avatar} onPress={() => router.push('/conta' as any)} activeOpacity={0.8}>
          <Text style={s.avatarText}>R</Text>
        </TouchableOpacity>

        {/* Crédito / Investir toggle */}
        <View style={s.tabWrap}>
          <TouchableOpacity
            style={[s.tabBtn, area === 'credito' && s.tabBtnActive]}
            onPress={() => switchArea('credito')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabLabel, { color: area === 'credito' ? '#fff' : C.inkSoft }]}>
              Crédito
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabBtn, area === 'investir' && s.tabBtnActive]}
            onPress={() => switchArea('investir')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabLabel, { color: area === 'investir' ? '#fff' : C.inkSoft }]}>
              Investir
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bell */}
        <View style={s.bellWrap}>
          <Ionicons name="notifications-outline" size={19} color={C.ink} />
          <View style={s.notifDot} />
        </View>
      </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[2],
    backgroundColor: C.bg,
  },
  avatar: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: fonts.display, fontSize: fontSize.xl },
  tabWrap: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: radii.full,
    padding: 4,
    marginHorizontal: 14,
    maxWidth: 240,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radii.full },
  tabBtnActive: { backgroundColor: C.dark },
  tabLabel: { fontSize: fontSize['base+'], fontFamily: fonts.semibold },
  bellWrap: {
    width: 40, height: 40,
    borderRadius: radii.xl,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8, right: 9,
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: C.ink,
    borderWidth: 1.5, borderColor: C.card,
  },
});
