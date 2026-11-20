import type { CodePurpose } from '../../api/auth';

export type AuthRoute =
  | { name: 'onboarding' }
  | { name: 'login'; email?: string }
  | { name: 'register' }
  | { name: 'forgot'; email?: string }
  | { name: 'otp'; email: string; purpose: CodePurpose }
  | { name: 'newPassword'; resetToken: string };

export type AuthNav = {
  push: (r: AuthRoute) => void;
  replace: (r: AuthRoute) => void;
  reset: (r: AuthRoute) => void;
  back: () => void;
  canGoBack: boolean;
};
