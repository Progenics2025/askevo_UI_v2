const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const nodemailer = require('nodemailer');

// Configure Nodemailer with robust settings
const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: isSecure, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    // Connection pool settings
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Socket timeout settings
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 60000, // 60 seconds for sending
    // TLS options for better compatibility
    tls: {
        rejectUnauthorized: false, // Allow self-signed certs if needed
        minVersion: 'TLSv1.2'
    },
    // Debug logging (enable for troubleshooting)
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Connection Error:', error.message);
        console.error('Please check your SMTP settings:');
        console.error('  - SMTP_HOST:', process.env.SMTP_HOST || '(not set)');
        console.error('  - SMTP_PORT:', smtpPort, '(secure:', isSecure, ')');
        console.error('  - SMTP_USER:', process.env.SMTP_USER ? '(set)' : '(not set)');
    } else {
        console.log('✓ SMTP Server is ready to send emails');
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            first_name,
            last_name,
            profession,
            organization,
            phone_number,
            primary_use_case
        } = req.body;

        // Check if user exists
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, profession, organization, phone_number, primary_use_case) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, first_name, last_name, profession, organization, phone_number, primary_use_case]
        );

        res.status(201).json({ message: 'User registered successfully', user_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// OTP Store (In-memory for demo purposes)
const otpStore = new Map();

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email, type } = req.body; // type: 'login' or 'register'

        // Check user existence based on type
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (type === 'register') {
            if (users.length > 0) {
                return res.status(400).json({ message: 'Email already registered' });
            }
        } else {
            // Default to login check
            if (users.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP (expires in 5 minutes)
        otpStore.set(email, {
            code: otp,
            expires: Date.now() + 5 * 60 * 1000
        });

        // Send Email
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Your askEVO Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0891b2;">askEVO Verification</h2>
                    <p>Your verification code is:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #7c3aed;">${otp}</h1>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log(`OTP sent to ${email}`);

        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please check email configuration.' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ message: 'OTP not requested or expired' });
        }

        if (Date.now() > storedData.expires) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (storedData.code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP verified
        otpStore.delete(email);

        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// NFC Login Step 1: Check Token & Send OTP
router.post('/nfc-login', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token required' });

        const [users] = await pool.query('SELECT * FROM users WHERE nfc_token = ?', [token]);

        // Case 1: Token not linked -> Require Registration
        if (users.length === 0) {
            return res.json({ status: 'REGISTER_REQUIRED', token });
        }

        // Case 2: Token linked -> Send OTP
        const user = users[0];
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins

        await pool.query('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [otp, expiresAt, user.id]);

        // Send Email
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: user.email,
            subject: 'Progenics AI - Login OTP',
            text: `Your login OTP is: ${otp}. It expires in 5 minutes.`
        };
        await transporter.sendMail(mailOptions);

        // Mask email for privacy
        const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

        res.json({
            status: 'OTP_SENT',
            email: maskedEmail,
            message: `OTP sent to ${maskedEmail}`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// NFC Login Step 2: Verify OTP
router.post('/verify-nfc-otp', async (req, res) => {
    try {
        const { token, otp } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE nfc_token = ?', [token]);

        if (users.length === 0) return res.status(401).json({ message: 'Invalid token' });
        const user = users[0];

        if (user.otp_code !== otp || new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP
        await pool.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [user.id]);

        // Generate JWT
        const jwtToken = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            token: jwtToken,
            user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// NFC Auto-Registration
router.post('/register-nfc-user', async (req, res) => {
    try {
        const { name, email, phone, nfcToken } = req.body;

        // Check if user exists
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered. Please link card instead.' });
        }

        // Auto-generate password
        const crypto = require('crypto');
        const rawPassword = crypto.randomBytes(8).toString('hex'); // 16 char password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(rawPassword, salt);

        // Create User
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash, first_name, phone_number, nfc_token) VALUES (?, ?, ?, ?, ?, ?)',
            [email.split('@')[0], email, passwordHash, name, phone, nfcToken]
        );

        const userId = result.insertId;

        // Send Email with Password
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Welcome to Progenics AI - Your Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome to Progenics AI!</h2>
                    <p>Your account has been created via NFC Registration.</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> ${rawPassword}</p>
                    <p>Please change your password after logging in.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);

        // Generate JWT
        const jwtToken = jwt.sign(
            { id: userId, username: email.split('@')[0], email: email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            token: jwtToken,
            user: { id: userId, email: email, first_name: name },
            message: 'Account created! Password sent to email.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
