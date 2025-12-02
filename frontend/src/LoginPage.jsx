import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Dna } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
      toast.success('Login successful!');
    } else {
      toast.error('Please enter email and password');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Password reset link sent to ' + email);
      setShowForgotPassword(false);
    } else {
      toast.error('Please enter your email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-violet-50 to-fuchsia-50"></div>
      
      {/* Floating DNA Strands */}
      <div className="absolute top-20 left-20 opacity-20 animate-float">
        <Dna className="h-32 w-32 text-cyan-600" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        <Dna className="h-24 w-24 text-violet-600" />
      </div>
      <div className="absolute top-1/2 right-40 opacity-10 animate-float" style={{ animationDelay: '2s' }}>
        <Dna className="h-40 w-40 text-fuchsia-600" />
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 rounded-3xl mb-6 shadow-2xl relative animate-pulse">
            <div className="absolute inset-1 bg-white rounded-3xl flex items-center justify-center">
              <Dna className="h-12 w-12 text-transparent bg-gradient-to-br from-cyan-500 to-violet-600" style={{ stroke: 'url(#gradient)' }} />
            </div>
            <svg width="0" height="0">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-3 gradient-text" style={{ fontFamily: 'Bricolage Grotesque' }}>askEVO</h1>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-600">Powered by</span>
            <span className="font-bold text-transparent bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text" data-testid="powered-by-progenics">Progenics</span>
          </div>
        </div>

        <Card className="border-0 shadow-2xl glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {showForgotPassword
                ? 'Enter your email to receive a password reset link'
                : 'Enter your credentials to access askEVO'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={showForgotPassword ? handleForgotPassword : handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="login-email-input"
                    className="h-12 border-2 focus:border-cyan-500 transition-colors"
                  />
                </div>

                {!showForgotPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-semibold">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        data-testid="login-password-input"
                        className="h-12 pr-10 border-2 focus:border-cyan-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-600 transition-colors"
                        data-testid="toggle-password-visibility"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                {!showForgotPassword && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm font-semibold text-transparent bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text hover:from-cyan-700 hover:to-violet-700"
                      data-testid="forgot-password-link"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-600 hover:via-violet-600 hover:to-fuchsia-600 text-white font-bold shadow-xl text-base transition-all hover:scale-[1.02]"
                  data-testid="login-submit-button"
                >
                  {showForgotPassword ? 'Send Reset Link' : 'Sign In'}
                </Button>

                {showForgotPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full font-semibold"
                    data-testid="back-to-login-button"
                  >
                    Back to Login
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600 mt-6 font-medium">
          Advanced genomics analysis powered by AI
        </p>
      </div>
    </div>
  );
}
