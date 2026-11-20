/**
 * Authentication service — DEMO implementation (no network).
 *
 * Every method mirrors an existing AIGMA backend endpoint so the real
 * implementation can replace the demo bodies without changing any screen:
 *
 *   login              POST /api/login
 *   register           POST /api/register
 *   resendCode         POST /api/resend-verification-code
 *   verifyCode         POST /api/email-verify | /api/otp-confirm | /api/reset-otp-confirm
 *   requestReset       POST /api/reset-password-sent
 *   resetPassword      POST /api/reset-password
 *   socialLogin        POST /api/social-login
 *   logout             POST /api/logout          (auth:customer-api)
 *
 * Demo rules (so every UI state can be seen):
 *   - password "wrong"            → invalid credentials
 *   - email "taken@example.com"   → email already registered
 *   - verification code           → 123456
 */

export const DEMO_CODE = '123456';

export type User = { id: string; name: string; email: string; phone?: string };
export type Session = { user: User; token: string };
export type CodePurpose = 'register' | 'reset';
export type SocialProvider = 'google' | 'facebook' | 'apple';

export type AuthErrorCode = 'invalid_credentials' | 'email_taken' | 'invalid_code' | 'unknown';
export class AuthError extends Error {
  constructor(public code: AuthErrorCode, message: string) { super(message); }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const demoToken = () => `demo-${Math.random().toString(36).slice(2)}`;
const nameFromEmail = (email: string) => {
  const local = email.split('@')[0] ?? 'Student';
  return local.split(/[._-]/).filter(Boolean).map(w => w[0]!.toUpperCase() + w.slice(1)).join(' ') || 'Student';
};

// Pending registrations held in memory until the code is verified (demo only).
const pending = new Map<string, Omit<User, 'id'>>();

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    await wait(900);
    if (password.toLowerCase() === 'wrong') throw new AuthError('invalid_credentials', 'Incorrect email or password. Please try again.');
    return { user: { id: 'demo-user', name: nameFromEmail(email), email }, token: demoToken() };
  },

  async register(input: { name: string; email: string; phone?: string; password: string }): Promise<{ email: string }> {
    await wait(800);
    if (input.email.toLowerCase() === 'taken@example.com') throw new AuthError('email_taken', 'An account with this email already exists. Try signing in instead.');
    pending.set(input.email, { name: input.name, email: input.email, phone: input.phone });
    return { email: input.email };
  },

  async resendCode(_email: string, _purpose: CodePurpose): Promise<void> {
    await wait(500);
  },

  /** register → returns a session; reset → returns a one-time reset token. */
  async verifyCode(email: string, code: string, purpose: CodePurpose): Promise<{ session?: Session; resetToken?: string }> {
    await wait(700);
    if (code !== DEMO_CODE) throw new AuthError('invalid_code', `That code is incorrect. Use ${DEMO_CODE} in this demo.`);
    if (purpose === 'reset') return { resetToken: demoToken() };
    const p = pending.get(email);
    pending.delete(email);
    return { session: { user: { id: 'demo-user', name: p?.name ?? nameFromEmail(email), email, phone: p?.phone }, token: demoToken() } };
  },

  async requestReset(_email: string): Promise<void> {
    await wait(700);
  },

  async resetPassword(_resetToken: string, _password: string): Promise<void> {
    await wait(700);
  },

  async socialLogin(provider: SocialProvider): Promise<Session> {
    await wait(700);
    return { user: { id: `demo-${provider}`, name: 'Aye Chan', email: 'ayechan@example.com' }, token: demoToken() };
  },

  async logout(): Promise<void> {
    await wait(200);
  },
};
