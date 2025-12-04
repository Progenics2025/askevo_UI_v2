import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Dna, Mail } from 'lucide-react';
import { apiService } from './lib/apiService';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email && password) {
      if (!otpVerified) {
        toast.error('Please verify OTP to continue');
        return;
      }
      setIsLoading(true);
      try {
        const data = await apiService.login(email, password);
        // Token is automatically saved by apiService
        onLogin(email);
        toast.success(`Welcome back, ${data.user.username}!`);
      } catch (error) {
        console.error('Login failed:', error);
        toast.error(error.message || 'Failed to login. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please enter email and password');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter email address');
      return;
    }
    setOtpLoading(true);
    try {
      // Call API to send OTP
      const response = await apiService.sendOtp(email);
      setOtpSent(true);
      setOtpVerified(false);

      if (response.otp) {
        setOtp(response.otp);
        toast.success(`OTP sent! Your code is: ${response.otp}`);
      } else {
        setOtp('');
        toast.success('OTP sent to your email');
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }
    setOtpLoading(true);
    try {
      // Call API to verify OTP
      await apiService.verifyOtp(email, otp);
      setOtpVerified(true);
      toast.success('OTP verified successfully');
    } catch (error) {
      console.error('OTP verification failed:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
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
      {/* Top Left */}
      <div className="absolute top-20 left-20 opacity-30 animate-float">
        <Dna className="h-32 w-32 text-cyan-400" />
      </div>
      {/* Bottom Right */}
      <div className="absolute bottom-20 right-20 opacity-30 animate-float" style={{ animationDelay: '1s' }}>
        <Dna className="h-24 w-24 text-violet-400" />
      </div>
      {/* Top Right Large */}
      <div className="absolute top-1/2 right-40 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
        <Dna className="h-40 w-40 text-fuchsia-400" />
      </div>
      {/* Left Middle */}
      <div className="absolute left-10 top-1/3 opacity-25 animate-float" style={{ animationDelay: '0.5s' }}>
        <Dna className="h-28 w-28 text-blue-400" />
      </div>
      {/* Right Upper */}
      <div className="absolute right-10 top-1/4 opacity-25 animate-float" style={{ animationDelay: '1.5s' }}>
        <Dna className="h-20 w-20 text-purple-400" />
      </div>
      {/* Bottom Left */}
      <div className="absolute bottom-10 left-1/4 opacity-25 animate-float" style={{ animationDelay: '2.5s' }}>
        <Dna className="h-24 w-24 text-pink-400" />
      </div>
      {/* Center Top */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-20 animate-float" style={{ animationDelay: '3s' }}>
        <Dna className="h-36 w-36 text-cyan-300" />
      </div>
      {/* Bottom Right Secondary */}
      <div className="absolute bottom-1/4 right-1/4 opacity-22 animate-float" style={{ animationDelay: '1.2s' }}>
        <Dna className="h-20 w-20 text-violet-500" />
      </div>
      {/* Top Left Secondary */}
      <div className="absolute top-1/3 left-1/3 opacity-22 animate-float" style={{ animationDelay: '3.5s' }}>
        <Dna className="h-16 w-16 text-fuchsia-500" />
      </div>
      {/* Far Right Bottom */}
      <div className="absolute bottom-1/3 right-5 opacity-20 animate-float" style={{ animationDelay: '2.2s' }}>
        <Dna className="h-28 w-28 text-cyan-500" />
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
          <img src="/askevo-logo.png" alt="askEVO" className="h-24 mb-3" style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }} />
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
                : 'Enter your credentials and verify OTP to access askEVO'}
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
                    disabled={otpSent && !showForgotPassword}
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
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="font-semibold">
                      {otpVerified ? '✓ OTP Verified' : 'One Time Password (OTP)'}
                    </Label>
                    <div className="relative flex gap-2">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        data-testid="login-otp-input"
                        className={`h-12 border-2 flex-1 transition-colors ${otpVerified
                          ? 'border-green-500 focus:border-green-600 bg-green-50'
                          : 'border-slate-200 focus:border-cyan-500'
                          }`}
                        disabled={!otpSent || otpVerified}
                        maxLength="6"
                      />
                      {!otpSent ? (
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading || !email}
                          className="h-12 px-4 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white font-semibold shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                          data-testid="send-otp-button"
                        >
                          <Mail size={18} />
                          Get OTP
                        </Button>
                      ) : !otpVerified ? (
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading || !otp}
                          className="h-12 px-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          data-testid="verify-otp-button"
                        >
                          {otpLoading ? 'Verifying...' : 'Verify'}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled
                          className="h-12 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-md whitespace-nowrap"
                          data-testid="otp-verified-button"
                        >
                          ✓ Verified
                        </Button>
                      )}
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
                  disabled={isLoading || !otpVerified}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-600 hover:via-violet-600 hover:to-fuchsia-600 text-white font-bold shadow-xl text-base transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="login-submit-button"
                >
                  {isLoading ? 'Signing in...' : (showForgotPassword ? 'Send Reset Link' : 'Sign In')}
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
