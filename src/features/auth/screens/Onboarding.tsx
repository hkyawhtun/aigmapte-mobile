import React, { useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../AuthContext';
import { Button, Icon, Logo, s } from '../ui';
import type { AuthNav } from '../nav';
import { brand, radius } from '../../../theme';

type IconName = React.ComponentProps<typeof Icon>['name'];
const SKILL: Record<string, { icon: IconName; color: string; bg: string }> = {
  speaking: { icon: 'mic', color: brand.speaking, bg: brand.speaking50 },
  writing: { icon: 'create', color: brand.writing, bg: brand.writing50 },
  reading: { icon: 'book', color: brand.reading, bg: brand.reading50 },
  listening: { icon: 'headset', color: brand.listening, bg: brand.listening50 },
};

const Card = ({ style, children }: { style?: object; children: React.ReactNode }) => <View style={[o.card, style]}>{children}</View>;
const SkillTile = ({ k }: { k: keyof typeof SKILL }) => <View style={[o.tile, { backgroundColor: SKILL[k]!.bg }]}><Icon name={SKILL[k]!.icon} size={18} color={SKILL[k]!.color} /></View>;
const Ring = ({ value, color = brand.primary }: { value: string; color?: string }) =>
  <View style={[o.ring, { borderColor: color }]}><Text style={o.ringText}>{value}</Text></View>;
const TaskCard = ({ k, title, sub, style }: { k: keyof typeof SKILL; title: string; sub: string; style: object }) =>
  <Card style={style}><SkillTile k={k} /><View><Text style={o.cardTitle}>{title}</Text><Text style={o.cardSub}>{sub}</Text></View></Card>;

const SLIDES: { title: string; text: string; art: () => React.ReactNode }[] = [
  {
    title: 'Your personal AI-powered PTE coach',
    text: 'Practise every PTE Academic and PTE Core task with a question bank that is updated regularly.',
    art: () => <>
      <Image source={require('../../../../assets/icon.png')} style={{ width: 76, height: 76, opacity: 0.95 }} />
      <TaskCard k="speaking" title="Read Aloud" sub="Speaking" style={{ top: 24, left: 14 }} />
      <TaskCard k="writing" title="Write Essay" sub="Writing" style={{ top: 92, right: 10 }} />
      <TaskCard k="reading" title="Reorder Paragraphs" sub="Reading" style={{ bottom: 92, left: 20 }} />
      <TaskCard k="listening" title="Write from Dictation" sub="Listening" style={{ bottom: 24, right: 16 }} />
    </>,
  },
  {
    title: 'Practise smarter with instant AI feedback',
    text: 'Record your answer and see your content, pronunciation and fluency scores in seconds.',
    art: () => <>
      <Card style={{ top: 28, width: 260, flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
        <View style={o.between}><Text style={o.cardTitle}>Read Aloud</Text>
          <View style={o.aiChip}><Icon name="sparkles" size={13} color={brand.primary} /><Text style={o.aiChipText}>AI score</Text></View></View>
        <View style={o.wave}>{Array.from({ length: 26 }, (_, k) =>
          <View key={k} style={[o.bar, { height: 8 + Math.abs(Math.sin(k * 1.7)) * 26 }]} />)}</View>
      </Card>
      <Card style={{ bottom: 40, left: 16 }}><Ring value="4/5" color={brand.green} /><View><Text style={o.cardTitle}>Pronunciation</Text><Text style={o.cardSub}>Clear and natural</Text></View></Card>
      <Card style={{ bottom: 116, right: 14 }}><Ring value="72" /><View><Text style={o.cardTitle}>Overall</Text><Text style={[o.cardSub, { color: brand.green, fontWeight: '700' }]}>+6 from last try</Text></View></Card>
    </>,
  },
  {
    title: 'Score higher with real exam mock tests',
    text: 'Take full and sectional mock tests that feel like the real exam, then get a complete score report.',
    art: () => <>
      <Card style={{ top: 34, width: 262, flexDirection: 'column', alignItems: 'stretch', gap: 12, padding: 16 }}>
        <View style={o.between}><Text style={o.cardTitle}>Full Mock Test 3</Text>
          <View style={[o.aiChip, { backgroundColor: brand.red50 }]}><Icon name="time-outline" size={13} color={brand.red600} /><Text style={[o.aiChipText, { color: brand.red600 }]}>18:42</Text></View></View>
        <View style={o.track}><View style={[o.fill, { width: '62%' }]} /></View>
        <View style={o.between}>{(['S', 'W', 'R', 'L'] as const).map((l, k) =>
          <View key={l} style={{ alignItems: 'center', flex: 1 }}><Text style={{ fontSize: 18, fontWeight: '800', color: brand.ink }}>{[64, 58, 66, 61][k]}</Text><Text style={o.cardSub}>{l}</Text></View>)}</View>
      </Card>
      <Card style={{ bottom: 40 }}><Icon name="trophy" size={24} color="#D98200" /><View><Text style={o.cardTitle}>Target 65 reached in practice</Text><Text style={o.cardSub}>Keep the streak going</Text></View></Card>
    </>,
  },
];

export function Onboarding({ nav }: { nav: AuthNav }) {
  const { completeOnboarding } = useAuth();
  const { width, height } = useWindowDimensions();
  const list = useRef<FlatList>(null);
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;

  const finish = (to: 'register' | 'login') => { completeOnboarding(); nav.reset({ name: to }); };
  const next = () => { if (last) return finish('register'); list.current?.scrollToIndex({ index: i + 1 }); setI(i + 1); };

  return <SafeAreaView style={s.screen}>
    <StatusBar style="dark" />
    <View style={o.top}>
      <Logo height={30} />
      {!last && <Button variant="ghost" label="Skip" onPress={() => finish('register')} />}
    </View>
    <FlatList
      ref={list} data={SLIDES} horizontal pagingEnabled showsHorizontalScrollIndicator={false} bounces={false}
      keyExtractor={x => x.title}
      scrollEventThrottle={32}
      onScroll={e => { const k = Math.round(e.nativeEvent.contentOffset.x / width); if (k !== i && k >= 0 && k < SLIDES.length) setI(k); }}
      getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      renderItem={({ item }) => <View style={{ width, paddingHorizontal: 24, paddingTop: 12 }}>
        <View style={[o.illo, { height: Math.max(300, Math.min(400, height * 0.44)) }]}>{item.art()}</View>
        <View style={{ gap: 8, paddingHorizontal: 4, marginTop: 26 }}>
          <Text style={s.h1}>{item.title}</Text>
          <Text style={[s.sub, { color: brand.ink2 }]}>{item.text}</Text>
        </View>
      </View>} />
    <View style={o.footer}>
      <View style={o.dots} accessibilityLabel={`Slide ${i + 1} of ${SLIDES.length}`}>
        {SLIDES.map((_, k) => <View key={k} style={[o.dot, k === i && o.dotOn]} />)}
      </View>
      <Button label={last ? 'Get started' : 'Next'} icon="arrow-forward" onPress={next} />
      <Button variant="ghost" label="I already have an account" onPress={() => finish('login')} />
    </View>
  </SafeAreaView>;
}

const o = StyleSheet.create({
  top: { height: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  illo: { height: 340, borderRadius: radius.xl, backgroundColor: brand.primary50, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  card: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: brand.white, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12,
    shadowColor: '#10234A', shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  tile: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: brand.ink },
  cardSub: { fontSize: 12, fontWeight: '600', color: brand.muted },
  ring: { width: 46, height: 46, borderRadius: 23, borderWidth: 5, alignItems: 'center', justifyContent: 'center' },
  ringText: { fontSize: 13, fontWeight: '800', color: brand.ink },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: brand.primary50 },
  aiChipText: { fontSize: 12, fontWeight: '700', color: brand.primary },
  wave: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bar: { width: 4, borderRadius: 2, backgroundColor: brand.primary },
  track: { height: 8, borderRadius: 4, backgroundColor: brand.line },
  fill: { height: 8, borderRadius: 4, backgroundColor: brand.primary },
  footer: { paddingHorizontal: 24, paddingBottom: 8, gap: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: brand.line2 },
  dotOn: { width: 24, backgroundColor: brand.primary },
});
