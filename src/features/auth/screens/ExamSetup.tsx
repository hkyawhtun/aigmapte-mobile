import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExamType, useAuth } from '../AuthContext';
import { AuthScreen, Button, Icon, Title } from '../ui';
import { brand, radius } from '../../../theme';

const EXAMS: { id: ExamType; title: string; text: string; tags: string[]; icon: 'book-outline' | 'compass-outline' }[] = [
  { id: 'academic', title: 'PTE Academic', text: 'For university admission and visas in Australia, New Zealand and the UK.', tags: ['Study', 'Migration', 'Visa'], icon: 'book-outline' },
  { id: 'core', title: 'PTE Core', text: 'General English test accepted for Canadian economic immigration.', tags: ['Canada', 'Work', 'PR'], icon: 'compass-outline' },
];
const TARGETS = [50, 58, 65, 79];
const WHEN = ['In 2 weeks', 'In about a month', 'In 2–3 months', 'Not booked yet'];

const Step = ({ n }: { n: number }) => <View style={o.step}><Text style={o.stepText}>Step {n} of 2</Text></View>;

/** Shown once after the first sign-in, before the main app. */
export function ExamSetup() {
  const { completeSetup, user } = useAuth();
  const [exam, setExam] = useState<ExamType>('academic');
  const [target, setTarget] = useState(65);
  const [when, setWhen] = useState(1);
  const first = user?.name.split(' ')[0];

  return <AuthScreen footer={<Button label="Start learning" icon="arrow-forward" onPress={() => completeSetup({ exam, target, examWhen: when })} />}>
    <View style={{ gap: 8 }}>
      <Step n={1} />
      <Title title={first ? `Hi ${first}, which test are you taking?` : 'Which test are you taking?'} sub="We’ll tailor question types, mock tests and courses to your exam." />
    </View>
    <View style={{ gap: 12 }}>
      {EXAMS.map(e => {
        const on = exam === e.id;
        return <Pressable key={e.id} onPress={() => setExam(e.id)} accessibilityRole="radio" accessibilityState={{ selected: on }}
          style={[o.card, on && o.cardOn]}>
          <View style={[o.tile, { backgroundColor: on ? brand.primary : brand.bg }]}><Icon name={e.icon} color={on ? brand.white : brand.ink2} /></View>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={o.between}><Text style={o.cardTitle}>{e.title}</Text><View style={[o.radio, on && o.radioOn]}>{on && <View style={o.radioDot} />}</View></View>
            <Text style={o.cardText}>{e.text}</Text>
            <View style={o.tags}>{e.tags.map(t => <View key={t} style={o.tag}><Text style={o.tagText}>{t}</Text></View>)}</View>
          </View>
        </Pressable>;
      })}
    </View>

    <View style={{ gap: 8 }}><Step n={2} /><Text style={o.h3}>Target overall score</Text></View>
    <View style={{ gap: 8 }}>
      <View style={o.grid}>{TARGETS.map(v => <Pressable key={v} onPress={() => setTarget(v)} accessibilityRole="radio" accessibilityState={{ selected: target === v }}
        style={[o.chip, o.targetChip, target === v && o.chipOn]}><Text style={[o.targetText, target === v && { color: brand.white }]}>{v}</Text></Pressable>)}</View>
      <Text style={o.hint}>65 = Proficient English · 79 = Superior English (Australia)</Text>
    </View>

    <View style={{ gap: 12 }}>
      <Text style={o.h3}>When is your exam?</Text>
      <View style={o.tags}>{WHEN.map((l, k) => <Pressable key={l} onPress={() => setWhen(k)} accessibilityRole="radio" accessibilityState={{ selected: when === k }}
        style={[o.chip, when === k && o.chipOn]}><Text style={[o.chipText, when === k && { color: brand.white }]}>{l}</Text></Pressable>)}</View>
    </View>
  </AuthScreen>;
}

const o = StyleSheet.create({
  step: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: brand.primary50 },
  stepText: { fontSize: 12, fontWeight: '700', color: brand.primary },
  h3: { fontSize: 18, fontWeight: '800', color: brand.ink },
  card: { flexDirection: 'row', gap: 14, padding: 16, borderRadius: radius.lg, borderWidth: 1.5, borderColor: brand.line, backgroundColor: brand.white },
  cardOn: { borderColor: brand.primary, backgroundColor: '#F7FAFE' },
  tile: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 17, fontWeight: '800', color: brand.ink },
  cardText: { fontSize: 14, lineHeight: 20, color: brand.ink2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: brand.line2, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: brand.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: brand.primary },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: brand.bg },
  tagText: { fontSize: 12, fontWeight: '600', color: brand.ink2 },
  grid: { flexDirection: 'row', gap: 10 },
  chip: { paddingHorizontal: 14, height: 40, borderRadius: radius.pill, borderWidth: 1.5, borderColor: brand.line2, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.white },
  chipOn: { backgroundColor: brand.primary, borderColor: brand.primary },
  chipText: { fontSize: 14, fontWeight: '700', color: brand.ink2 },
  targetChip: { flex: 1, height: 52, borderRadius: radius.md },
  targetText: { fontSize: 17, fontWeight: '800', color: brand.ink },
  hint: { fontSize: 12, color: brand.muted },
});
