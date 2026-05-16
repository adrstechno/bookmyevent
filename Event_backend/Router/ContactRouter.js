import express from 'express';
import emailService from '../Services/emailService.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    try {
        await emailService.sendContactEmail({ name, email, phone, subject, message });
        res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Contact form email error:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

export default router;
