const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

router.get('/', async (req, res) => {
    try {
        const subjects = await dbHelpers.getAllSubjects();
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const subject = await dbHelpers.getSubjectById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        
        const chapters = await dbHelpers.getChaptersBySubject(req.params.id);
        
        const chaptersWithVideos = await Promise.all(
            chapters.map(async (chapter) => {
                const videos = await dbHelpers.getVideosByChapter(chapter.id);
                return { ...chapter, videos };
            })
        );
        
        res.json({ ...subject, chapters: chaptersWithVideos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
