const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

router.get('/', async (req, res) => {
    try {
        const channelInfo = await dbHelpers.getChannelInfo();
        res.json(channelInfo || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
