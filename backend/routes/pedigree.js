const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Save Pedigree
router.post('/save', auth, async (req, res) => {
    try {
        const { case_number, data } = req.body;
        const user_id = req.user.id;

        if (!case_number || !data) {
            return res.status(400).json({ message: 'Case number and data are required' });
        }

        // Check if case exists for user
        const [existing] = await pool.query(
            'SELECT id FROM pedigrees WHERE user_id = ? AND case_number = ?',
            [user_id, case_number]
        );

        if (existing.length > 0) {
            // Update
            await pool.query(
                'UPDATE pedigrees SET data = ? WHERE id = ?',
                [JSON.stringify(data), existing[0].id]
            );
            res.json({ message: 'Pedigree updated successfully', id: existing[0].id });
        } else {
            // Insert
            const [result] = await pool.query(
                'INSERT INTO pedigrees (user_id, case_number, data) VALUES (?, ?, ?)',
                [user_id, case_number, JSON.stringify(data)]
            );
            res.status(201).json({ message: 'Pedigree saved successfully', id: result.insertId });
        }
    } catch (error) {
        console.error('Save pedigree error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// List Pedigrees
router.get('/list', auth, async (req, res) => {
    try {
        const user_id = req.user.id;
        const [rows] = await pool.query(
            'SELECT id, case_number, created_at, updated_at FROM pedigrees WHERE user_id = ? ORDER BY updated_at DESC',
            [user_id]
        );
        res.json(rows);
    } catch (error) {
        console.error('List pedigrees error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Pedigree
router.get('/:case_number', auth, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { case_number } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM pedigrees WHERE user_id = ? AND case_number = ?',
            [user_id, case_number]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pedigree not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Get pedigree error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
