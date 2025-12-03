const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Create Session
router.post('/sessions', auth, async (req, res) => {
    try {
        const { session_title, language } = req.body;
        const user_id = req.user.id;

        const [result] = await pool.query(
            'INSERT INTO chat_sessions (user_id, session_title, language) VALUES (?, ?, ?)',
            [user_id, session_title, language]
        );

        res.status(201).json({ message: 'Session created', session_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Sessions
router.get('/sessions', auth, async (req, res) => {
    try {
        const user_id = req.user.id;
        const [sessions] = await pool.query(
            'SELECT * FROM chat_sessions WHERE user_id = ? AND is_archived = FALSE ORDER BY created_at DESC',
            [user_id]
        );
        res.json({ sessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Session Messages
router.get('/sessions/:sessionId/messages', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const user_id = req.user.id;

        // Verify ownership
        const [session] = await pool.query('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, user_id]);
        if (session.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const [messages] = await pool.query(
            'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
            [sessionId]
        );

        res.json({ messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Save Message
router.post('/messages', auth, async (req, res) => {
    try {
        const { session_id, message_text, sender_type, message_type } = req.body;
        const user_id = req.user.id;

        // Verify session ownership
        const [session] = await pool.query('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [session_id, user_id]);
        if (session.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const [result] = await pool.query(
            'INSERT INTO chat_messages (session_id, user_id, message_text, sender_type, message_type) VALUES (?, ?, ?, ?, ?)',
            [session_id, user_id, message_text, sender_type, message_type]
        );

        // Update last_message_at in session
        await pool.query('UPDATE chat_sessions SET last_message_at = NOW() WHERE id = ?', [session_id]);

        res.status(201).json({ message: 'Message saved', message_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Feedback
router.put('/messages/:messageId/feedback', auth, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { liked, disliked, feedback_text } = req.body;
        const user_id = req.user.id;

        // Verify message ownership via session
        // This is a bit complex with just messageId, but let's assume we can update if it belongs to user
        // Ideally: JOIN chat_sessions ON chat_messages.session_id = chat_sessions.id WHERE chat_messages.id = ? AND chat_sessions.user_id = ?

        const [result] = await pool.query(
            `UPDATE chat_messages 
       JOIN chat_sessions ON chat_messages.session_id = chat_sessions.id
       SET chat_messages.liked = ?, chat_messages.disliked = ?, chat_messages.feedback_text = ?
       WHERE chat_messages.id = ? AND chat_sessions.user_id = ?`,
            [liked, disliked, feedback_text, messageId, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Message not found or unauthorized' });
        }

        res.json({ message: 'Feedback saved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Rename Session
router.put('/sessions/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { session_title } = req.body;
        const user_id = req.user.id;

        // Verify ownership
        const [session] = await pool.query('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, user_id]);
        if (session.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        await pool.query('UPDATE chat_sessions SET session_title = ? WHERE id = ?', [session_title, sessionId]);
        res.json({ message: 'Session renamed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Session
router.delete('/sessions/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const user_id = req.user.id;

        // Verify ownership
        const [session] = await pool.query('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, user_id]);
        if (session.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Delete session (CASCADE will handle messages)
        await pool.query('DELETE FROM chat_sessions WHERE id = ?', [sessionId]);
        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
