const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
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

module.exports = router;
