import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Dna, Mail } from 'lucide-react';
import { apiService } from './lib/apiService';

// Interactive DNA Strand Component
function InteractiveDnaStrand({ baseX, baseY, dnaIndex, mouseX, mouseY }) {
  const [position, setPosition] = useState({ x: baseX, y: baseY });
  const dnaRef = useRef(null);

  useEffect(() => {
    if (mouseX === null || mouseY === null) {
      setPosition({ x: baseX, y: baseY });
      return;
    }

    const dx = mouseX - baseX;
    const dy = mouseY - baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Repel from mouse when too close
    if (distance < 300) {
      const angle = Math.atan2(dy, dx);
      const repelDistance = Math.max(0, 300 - distance) * 0.3;
      const newX = baseX - Math.cos(angle) * repelDistance;
      const newY = baseY - Math.sin(angle) * repelDistance;
      setPosition({ x: newX, y: newY });
    } else {
      setPosition({ x: baseX, y: baseY });
    }
  }, [mouseX, mouseY, baseX, baseY]);

  const rotation = (dnaIndex * 45) % 360;
  const colorMap = {
    0: '#06B6D4', // cyan-400
    1: '#A78BFA', // violet-400
    2: '#EC4899', // fuchsia-400
    3: '#3B82F6', // blue-400
    4: '#A855F7', // purple-400
    5: '#F472B6', // pink-400
  };
  const color = colorMap[dnaIndex % 6];
  const size = 24 + (dnaIndex % 3) * 8;

  return (
    <div
      ref={dnaRef}
      className={`absolute transition-all duration-300 ease-out animate-float`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        animationDelay: `${(dnaIndex * 0.3) % 4}s`,
      }}
    >
      <Dna 
        size={size}
        color={color}
        style={{
          opacity: 0.6,
          filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.4))',
        }}
      />
    </div>
  );
}

export default function LoginPage({ onLogin }) {
  const [mouseX, setMouseX] = useState(null);
  const [mouseY, setMouseY] = useState(null);
  const containerRef = useRef(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [organization, setOrganization] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [primaryUseCase, setPrimaryUseCase] = useState('');

  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // DNA strand positions for interactive effect
  const dnaStrands = [
    { baseX: 80, baseY: 80, index: 0 },
    { baseX: window.innerWidth - 80, baseY: 80, index: 1 },
    { baseX: window.innerWidth - 160, baseY: window.innerHeight / 2, index: 2 },
    { baseX: 40, baseY: window.innerHeight / 3, index: 3 },
    { baseX: window.innerWidth - 40, baseY: window.innerHeight / 4, index: 4 },
    { baseX: window.innerWidth / 4, baseY: window.innerHeight - 40, index: 5 },
    { baseX: window.innerWidth / 2, baseY: window.innerHeight - 128, index: 6 },
    { baseX: window.innerWidth - 120, baseY: window.innerHeight / 2 + 80, index: 7 },
    { baseX: window.innerWidth / 3, baseY: window.innerHeight / 3, index: 8 },
    { baseX: window.innerWidth - 20, baseY: window.innerHeight / 3, index: 9 },
  ];

  // Handle mouse movement for interactive DNA
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    const handleMouseLeave = () => {
      setMouseX(null);
      setMouseY(null);
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    if (isRegistering) {
      if (!username || !firstName || !lastName || !profession || !organization || !phoneNumber) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (phoneNumber.length < 10) {
        toast.error('Phone number must be at least 10 digits');
        return;
      }
    }

    if (!otpVerified) {
      toast.error('Please verify OTP to continue');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        // Register first
        const userData = {
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          profession,
          organization,
          phone_number: phoneNumber,
          primary_use_case: primaryUseCase
        };

        await apiService.register(userData);
        toast.success('Registration successful! Logging in...');

        // Then login
        const data = await apiService.login(email, password);
        onLogin(email);
        toast.success(`Welcome, ${data.user.username}!`);
      } else {
        // Login
        const data = await apiService.login(email, password);
        onLogin(email);
        toast.success(`Welcome back, ${data.user.username}!`);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
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
      // Call API to send OTP with type
      const type = isRegistering ? 'register' : 'login';
      await apiService.sendOtp(email, type);
      setOtpSent(true);
      setOtpVerified(false);

      toast.success('OTP sent to your email');
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

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    // Keep email if entered
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>

      {/* Interactive Floating DNA Strands */}
      {dnaStrands.map((strand) => (
        <InteractiveDnaStrand
          key={strand.index}
          baseX={strand.baseX}
          baseY={strand.baseY}
          dnaIndex={strand.index}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}

      {/* Glow effect that follows mouse */}
      {mouseX && mouseY && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${mouseX}px`,
            top: `${mouseY}px`,
            width: '150px',
            height: '150px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, rgba(34, 211, 238, 0) 70%)',
            filter: 'blur(30px)',
            zIndex: 5,
          }}
        />
      )}

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <img src="/askEVO_logo.png" alt="askEVO" className="h-40 w-auto" style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))' }} />
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-300">Powered by</span>
            <span className="font-bold text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text" data-testid="powered-by-progenics">Progenics</span>
          </div>
        </div>

        <Card className="border-0 shadow-2xl glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {showForgotPassword ? 'Reset Password' : (isRegistering ? 'Create Account' : 'Welcome Back')}
            </CardTitle>
            <CardDescription>
              {showForgotPassword
                ? 'Enter your email to receive a password reset link'
                : (isRegistering
                  ? 'Sign up to access askEVO genomics platform'
                  : 'Enter your credentials and verify OTP to access askEVO')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={showForgotPassword ? handleForgotPassword : handleAuth}>
              <div className="space-y-4">

                {/* Registration Fields */}
                {isRegistering && !showForgotPassword && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="font-semibold">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-10 border-2 focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="font-semibold">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-10 border-2 focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession" className="font-semibold">Profession</Label>
                      <Select value={profession} onValueChange={setProfession}>
                        <SelectTrigger className="h-10 border-2 focus:border-cyan-500">
                          <SelectValue placeholder="Select your profession" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="doctor">Doctor / Clinician</SelectItem>
                          <SelectItem value="genetic_counselor">Genetic Counselor</SelectItem>
                          <SelectItem value="researcher">Researcher</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization" className="font-semibold">Organization/Institution</Label>
                      <Input
                        id="organization"
                        placeholder="Hospital, University, etc."
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="h-10 border-2 focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="font-semibold">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+1 234 567 8900"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-10 border-2 focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="font-semibold">Username</Label>
                      <Input
                        id="username"
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-10 border-2 focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryUseCase" className="font-semibold">Primary Use Case (Optional)</Label>
                      <Input
                        id="primaryUseCase"
                        placeholder="Clinical diagnosis, research, etc."
                        value={primaryUseCase}
                        onChange={(e) => setPrimaryUseCase(e.target.value)}
                        className="h-10 border-2 focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">Professional Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@institution.org"
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

                {!showForgotPassword && !isRegistering && (
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
                  disabled={isLoading || (!showForgotPassword && !otpVerified)}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-600 hover:via-violet-600 hover:to-fuchsia-600 text-white font-bold shadow-xl text-base transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="login-submit-button"
                >
                  {isLoading
                    ? (isRegistering ? 'Creating Account...' : 'Signing in...')
                    : (showForgotPassword ? 'Send Reset Link' : (isRegistering ? 'Create Account' : 'Sign In'))}
                </Button>

                {!showForgotPassword && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-slate-600">
                      {isRegistering ? "Already have an account?" : "Don't have an account?"}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="ml-1 font-bold text-transparent bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text hover:underline"
                      >
                        {isRegistering ? 'Sign In' : 'Sign Up'}
                      </button>
                    </p>
                  </div>
                )}

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
