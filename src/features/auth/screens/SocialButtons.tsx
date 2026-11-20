import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { authService, SocialProvider } from '../../../api/auth';
import { useAuth } from '../AuthContext';
import { Button, Icon, Sheet, s } from '../ui';
import { brand } from '../../../theme';

const LABEL: Record<SocialProvider, string> = { google: 'Google', facebook: 'Facebook', apple: 'Apple' };

/**
 * Google + Facebook match the backend's existing /api/social-login.
 * Sign in with Apple is shown on iOS because Apple requires it whenever
 * other social logins are offered (needs a backend endpoint later).
 */
export function SocialButtons({ verb = 'Continue' }: { verb?: 'Continue' | 'Sign up' }) {
  const { signIn } = useAuth();
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [busy, setBusy] = useState(false);
  const providers: SocialProvider[] = Platform.OS === 'ios' ? ['apple', 'google', 'facebook'] : ['google', 'facebook'];

  const pick = async () => {
    if (!provider) return;
    setBusy(true);
    const session = await authService.socialLogin(provider);
    setBusy(false); setProvider(null);
    signIn(session);
  };

  return <View style={{ gap: 12 }}>
    {providers.map(p => <Button
      key={p} variant="outline" label={`${verb} with ${LABEL[p]}`} onPress={() => setProvider(p)}
      icon={<Icon name={p === 'google' ? 'logo-google' : p === 'facebook' ? 'logo-facebook' : 'logo-apple'} size={20}
        color={p === 'google' ? '#DB4437' : p === 'facebook' ? '#1877F2' : brand.ink} />} />)}

    <Sheet visible={!!provider} onClose={() => !busy && setProvider(null)}>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={s.h3}>{verb} with {provider ? LABEL[provider] : ''}</Text>
        <Text style={[s.sub, { fontSize: 14, textAlign: 'center' }]}>Demo only — no real {provider ? LABEL[provider] : ''} sign-in happens.</Text>
      </View>
      <Pressable onPress={pick} disabled={busy} accessibilityRole="button"
        style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: brand.line }, pressed && { backgroundColor: brand.bg }]}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: brand.navy, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: brand.white, fontWeight: '800' }}>AC</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: brand.ink }}>Aye Chan</Text>
          <Text style={{ fontSize: 14, color: brand.muted }}>ayechan@example.com</Text>
        </View>
        {busy ? <Text style={s.link}>Signing in…</Text> : <Icon name="chevron-forward" color={brand.muted} />}
      </Pressable>
      <Button variant="ghost" label="Cancel" onPress={() => setProvider(null)} disabled={busy} />
    </Sheet>
  </View>;
}
