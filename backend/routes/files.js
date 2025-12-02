const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
    fileFilter: (req, file, cb) => {
        // Allow PDF, Text, JSON, Images
        const allowedTypes = ['application/pdf', 'text/plain', 'application/json', 'image/png', 'image/jpeg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Upload File
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { session_id, description } = req.body;
        const user_id = req.user.id;
        const file_path = req.file.path;

        const [result] = await pool.query(
            'INSERT INTO file_uploads (user_id, session_id, file_name, file_path, file_type, file_size, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, session_id || null, req.file.originalname, file_path, req.file.mimetype, req.file.size, description]
        );

        res.status(201).json({
            message: 'File uploaded successfully',
            file_id: result.insertId,
            file_name: req.file.originalname,
            file_size: req.file.size
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Files
router.get('/', auth, async (req, res) => {
    try {
        const user_id = req.user.id;
        const [files] = await pool.query('SELECT * FROM file_uploads WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
        res.json({ files });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Download File
router.get('/:fileId/download', auth, async (req, res) => {
    try {
        const { fileId } = req.params;
        const user_id = req.user.id;

        const [files] = await pool.query('SELECT * FROM file_uploads WHERE id = ? AND user_id = ?', [fileId, user_id]);
        if (files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = files[0];
        res.download(file.file_path, file.file_name);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete File
router.delete('/:fileId', auth, async (req, res) => {
    try {
        const { fileId } = req.params;
        const user_id = req.user.id;

        const [files] = await pool.query('SELECT * FROM file_uploads WHERE id = ? AND user_id = ?', [fileId, user_id]);
        if (files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = files[0];

        // Delete from filesystem
        if (fs.existsSync(file.file_path)) {
            fs.unlinkSync(file.file_path);
        }

        // Delete from DB
        await pool.query('DELETE FROM file_uploads WHERE id = ?', [fileId]);

        res.json({ message: 'File deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
