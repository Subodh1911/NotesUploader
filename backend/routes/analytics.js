const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

router.get('/', async (req, res) => {
    try {
        const analytics = await dbHelpers.getAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
