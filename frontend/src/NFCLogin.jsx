import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '@/lib/apiService';
import { toast } from 'sonner';
import { Loader2, Smartphone, UserPlus, CheckCircle } from 'lucide-react';

export default function NFCLogin() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('CHECKING'); // CHECKING, OTP_REQUIRED, REGISTER_REQUIRED
    const [message, setMessage] = useState('Authenticating...');
    const [otp, setOtp] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');

    // Registration Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const token = searchParams.get('token');

    // Force clear old cached URLs on mount (iOS fix)
    useEffect(() => {
        const genomicsApiUrl = localStorage.getItem('genomicsApiUrl');
        if (genomicsApiUrl && (genomicsApiUrl.includes('192.168') || genomicsApiUrl.includes('localhost') || genomicsApiUrl.startsWith('http://'))) {
            console.log('[NFC] Clearing cached API URL:', genomicsApiUrl);
            localStorage.removeItem('genomicsApiUrl');
            // Force reload apiService
            window.location.reload();
        }
    }, []);

    useEffect(() => {
        const checkToken = async () => {
            if (!token) {
                setMessage('Invalid link. No token provided.');
                toast.error('Invalid NFC link');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                // Use direct fetch instead of apiService to avoid caching issues on iOS
                const apiUrl = '/api/auth/nfc-login';
                console.log('NFC Login: Attempting to connect to:', apiUrl);

                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const data = await response.json();

                if (data.status === 'OTP_SENT') {
                    setStatus('OTP_REQUIRED');
                    setMaskedEmail(data.email);
                    setMessage(`Enter the code sent to ${data.email}`);
                } else if (data.status === 'REGISTER_REQUIRED') {
                    setStatus('REGISTER_REQUIRED');
                    setMessage('New NFC Card Detected');
                } else {
                    toast.error(data.message || 'Authentication failed');
                    setMessage(data.message || 'Failed');
                    setTimeout(() => navigate('/login'), 2000);
                }
            } catch (error) {
                console.error('NFC Login Error:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);

                let errorMessage = 'Unable to connect to server. Please check your internet connection.';
                if (error.name === 'AbortError') {
                    errorMessage = 'Connection timeout. Please try again.';
                }

                setStatus('ERROR');
                setMessage(errorMessage);
                toast.error('Connection failed. Please try again.');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        if (status === 'CHECKING') {
            checkToken();
        }
    }, [token, navigate]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/verify-nfc-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, otp })
            });
            const data = await response.json();

            if (response.ok) {
                apiService.setToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success(`Welcome back, ${data.user.first_name || 'User'}!`);

                // Redirect to home/chat with replace to avoid history issues
                setTimeout(() => {
                    window.location.replace('/');
                }, 500);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/register-nfc-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, nfcToken: token })
            });
            const data = await response.json();

            if (response.ok) {
                apiService.setToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Account created successfully!');
                toast.info('Password sent to your email.');
                // Navigate to root and reload so App.jsx can detect auth state
                window.location.href = '/';
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">

                {status === 'CHECKING' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse mb-6">
                            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800">Verifying NFC Card...</h2>
                    </div>
                )}



                {status === 'OTP_REQUIRED' && (
                    <form onSubmit={handleVerifyOTP} className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <Smartphone className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Security Check</h2>
                        <p className="text-slate-600 mb-6 text-sm">{message}</p>

                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            className="w-full p-3 border rounded-lg mb-4 text-center text-2xl tracking-widest"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                            Verify Login
                        </button>
                    </form>
                )}

                {status === 'REGISTER_REQUIRED' && (
                    <form onSubmit={handleRegister} className="flex flex-col items-center w-full">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                            <UserPlus className="h-8 w-8 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">New Card Detected</h2>
                        <p className="text-slate-600 mb-6 text-sm">Create an account to link this card.</p>

                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full p-3 border rounded-lg mb-3"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full p-3 border rounded-lg mb-3"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            className="w-full p-3 border rounded-lg mb-6"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                        <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition">
                            Create Account
                        </button>
                        <p className="text-xs text-slate-500 mt-4">
                            A secure password will be sent to your email.
                        </p>
                    </form>
                )}

                {status === 'ERROR' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
                        <p className="text-slate-600 mb-4 text-sm">{message}</p>
                        <p className="text-xs text-slate-500">Redirecting to login...</p>
                    </div>
                )}

            </div>
        </div>
    );
}
