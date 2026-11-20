import React, { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { AuthError, authService } from '../../../api/auth';
import { isValidEmail, passwordScore } from '../AuthContext';
import { AuthScreen, Bold, Button, Checkbox, Divider, ErrorBanner, Field, LinkText, StrengthMeter, Title, s } from '../ui';
import { SocialButtons } from './SocialButtons';
import type { AuthNav } from '../nav';

type Errors = { name?: string; email?: string; password?: string; terms?: string; form?: string };

export function Register({ nav }: { nav: AuthNav }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);
  const edit = (k: keyof Errors, set: (v: string) => void) => (v: string) => { set(v); setErrors(e => ({ ...e, [k]: undefined, form: undefined })); };

  const submit = async () => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Enter your full name';
    if (!isValidEmail(email.trim())) e.email = 'Enter a valid email address';
    if (password.length < 8) e.password = 'Use at least 8 characters';
    if (!terms) e.terms = 'Please accept the terms to continue';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const res = await authService.register({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, password });
      setBusy(false);
      nav.push({ name: 'otp', email: res.email, purpose: 'register' });
    } catch (err) {
      setBusy(false);
      setErrors({ form: err instanceof AuthError ? err.message : 'Something went wrong. Please try again.' });
    }
  };

  return <AuthScreen onBack={nav.canGoBack ? nav.back : undefined}>
    <Title title="Create your account" sub={<>Get <Bold>5 free AI speaking tokens</Bold> and free practice for every other section.</>} />
    <ErrorBanner msg={errors.form} />
    <View style={{ gap: 16 }}>
      <Field label="Full name" icon="person-outline" value={name} onChangeText={edit('name', setName)} error={errors.name}
        placeholder="e.g. Aye Chan" autoComplete="name" textContentType="name" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} />
      <Field ref={emailRef} label="Email" icon="mail-outline" value={email} onChangeText={edit('email', setEmail)} error={errors.email}
        placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email"
        textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} />
      <Field ref={phoneRef} label="Phone (optional)" icon="call-outline" value={phone} onChangeText={setPhone}
        placeholder="+95 9 …" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber"
        returnKeyType="next" onSubmitEditing={() => pwRef.current?.focus()} />
      <Field ref={pwRef} label="Password" icon="lock-closed-outline" password value={password} onChangeText={edit('password', setPassword)}
        error={errors.password} placeholder="At least 8 characters" autoComplete="new-password" textContentType="newPassword"
        footer={<StrengthMeter score={passwordScore(password)} visible={!!password} />} />
      <Checkbox checked={terms} onChange={v => { setTerms(v); setErrors(e => ({ ...e, terms: undefined })); }} error={errors.terms}>
        I agree to the <LinkText label="Terms & Privacy Policy" onPress={() => {}} />
      </Checkbox>
      <Button label="Create account" busy={busy} busyLabel="Creating account…" onPress={submit} />
    </View>
    <Divider label="or" />
    <SocialButtons verb="Sign up" />
    <Text style={s.center}>Already have an account? <LinkText label="Sign in" onPress={() => nav.reset({ name: 'login', email: email.trim() })} /></Text>
  </AuthScreen>;
}
