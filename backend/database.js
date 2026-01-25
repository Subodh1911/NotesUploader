const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
const initDatabase = () => {
    db.serialize(() => {
        // Channel Info
        db.run(`CREATE TABLE IF NOT EXISTS channel_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            logo TEXT,
            youtube_channel TEXT
        )`);

        // Subjects
        db.run(`CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Chapters
        db.run(`CREATE TABLE IF NOT EXISTS chapters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject_id INTEGER NOT NULL,
            \`order\` INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )`);

        // Videos
        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            youtube_url TEXT NOT NULL,
            drive_file_id TEXT NOT NULL,
            subject_id INTEGER NOT NULL,
            chapter_id INTEGER NOT NULL,
            thumbnail TEXT,
            view_count INTEGER DEFAULT 0,
            is_featured INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        )`);

        // View Logs
        db.run(`CREATE TABLE IF NOT EXISTS view_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id INTEGER NOT NULL,
            viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
        )`);

        console.log('Database schema initialized');
    });
};

// Seed initial data
const seedData = () => {
    db.get('SELECT COUNT(*) as count FROM channel_info', (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO channel_info (name, description, logo, youtube_channel) 
                    VALUES (?, ?, ?, ?)`,
                ['Educational Channel', 'Welcome to our educational channel', '', 'https://youtube.com/@channel']);
        }
    });

    db.get('SELECT COUNT(*) as count FROM subjects', (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO subjects (name, description, icon) VALUES (?, ?, ?)`,
                ['Mathematics', 'Learn mathematics concepts', '📐'], function() {
                    const mathId = this.lastID;
                    db.run(`INSERT INTO chapters (name, subject_id, \`order\`) VALUES (?, ?, ?)`,
                        ['Algebra', mathId, 1]);
                    db.run(`INSERT INTO chapters (name, subject_id, \`order\`) VALUES (?, ?, ?)`,
                        ['Geometry', mathId, 2]);
                });

            db.run(`INSERT INTO subjects (name, description, icon) VALUES (?, ?, ?)`,
                ['Physics', 'Explore physics principles', '⚛️'], function() {
                    const physicsId = this.lastID;
                    db.run(`INSERT INTO chapters (name, subject_id, \`order\`) VALUES (?, ?, ?)`,
                        ['Mechanics', physicsId, 1]);
                });
        }
    });

    console.log('Seed data added');
};

// Database helper functions
const dbHelpers = {
    // Channel Info
    getChannelInfo: () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM channel_info LIMIT 1', (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Subjects
    getAllSubjects: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM subjects ORDER BY created_at DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getSubjectById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM subjects WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Chapters
    getChaptersBySubject: (subjectId) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM chapters WHERE subject_id = ? ORDER BY `order`', [subjectId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Videos
    getAllVideos: (filters = {}) => {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM videos WHERE 1=1';
            const params = [];

            if (filters.subject_id) {
                query += ' AND subject_id = ?';
                params.push(filters.subject_id);
            }
            if (filters.chapter_id) {
                query += ' AND chapter_id = ?';
                params.push(filters.chapter_id);
            }
            if (filters.search) {
                query += ' AND (title LIKE ? OR description LIKE ?)';
                params.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            query += ' ORDER BY created_at DESC';

            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getVideoById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM videos WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    getVideosByChapter: (chapterId) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM videos WHERE chapter_id = ? ORDER BY created_at DESC', [chapterId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getRelatedVideos: (videoId, chapterId, subjectId, limit = 5) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM videos 
                    WHERE id != ? AND (chapter_id = ? OR subject_id = ?) 
                    ORDER BY 
                        CASE WHEN chapter_id = ? THEN 0 ELSE 1 END,
                        created_at DESC 
                    LIMIT ?`,
                [videoId, chapterId, subjectId, chapterId, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // View tracking
    incrementViewCount: (videoId) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE videos SET view_count = view_count + 1 WHERE id = ?', [videoId], function(err) {
                if (err) reject(err);
                else {
                    db.run('INSERT INTO view_logs (video_id) VALUES (?)', [videoId], (err) => {
                        if (err) reject(err);
                        else resolve({ changes: this.changes });
                    });
                }
            });
        });
    },

    // Trending (last 30 days)
    getTrendingVideos: (limit = 5) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT v.*, COUNT(vl.id) as recent_views 
                    FROM videos v
                    LEFT JOIN view_logs vl ON v.id = vl.video_id 
                        AND vl.viewed_at >= datetime('now', '-30 days')
                    GROUP BY v.id
                    ORDER BY recent_views DESC
                    LIMIT ?`,
                [limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Popular (all-time)
    getPopularVideos: (limit = 5) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM videos ORDER BY view_count DESC LIMIT ?', [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Analytics
    getAnalytics: () => {
        return new Promise((resolve, reject) => {
            const analytics = {};

            // Total views
            db.get('SELECT SUM(view_count) as total_views FROM videos', (err, row) => {
                if (err) return reject(err);
                analytics.total_views = row.total_views || 0;

                // Total videos
                db.get('SELECT COUNT(*) as total_videos FROM videos', (err, row) => {
                    if (err) return reject(err);
                    analytics.total_videos = row.total_videos || 0;

                    // Most popular subject
                    db.get(`SELECT s.id, s.name, SUM(v.view_count) as total_views
                            FROM subjects s
                            LEFT JOIN videos v ON s.id = v.subject_id
                            GROUP BY s.id
                            ORDER BY total_views DESC
                            LIMIT 1`,
                        (err, row) => {
                            if (err) return reject(err);
                            analytics.popular_subject = row;

                            // Most popular chapter
                            db.get(`SELECT c.id, c.name, s.name as subject_name, SUM(v.view_count) as total_views
                                    FROM chapters c
                                    LEFT JOIN videos v ON c.id = v.chapter_id
                                    LEFT JOIN subjects s ON c.subject_id = s.id
                                    GROUP BY c.id
                                    ORDER BY total_views DESC
                                    LIMIT 1`,
                                (err, row) => {
                                    if (err) return reject(err);
                                    analytics.popular_chapter = row;

                                    // Top 10 videos
                                    db.all('SELECT * FROM videos ORDER BY view_count DESC LIMIT 10', (err, rows) => {
                                        if (err) return reject(err);
                                        analytics.top_videos = rows;

                                        // Subject-wise breakdown
                                        db.all(`SELECT s.name, SUM(v.view_count) as total_views
                                                FROM subjects s
                                                LEFT JOIN videos v ON s.id = v.subject_id
                                                GROUP BY s.id`,
                                            (err, rows) => {
                                                if (err) return reject(err);
                                                analytics.subject_breakdown = rows;
                                                resolve(analytics);
                                            }
                                        );
                                    });
                                }
                            );
                        }
                    );
                });
            });
        });
    },

    // Admin - Channel Info
    updateChannelInfo: (name, description, logo, youtube_channel) => {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE channel_info SET name = ?, description = ?, logo = ?, youtube_channel = ? WHERE id = 1`,
                [name, description, logo, youtube_channel],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    },

    // Admin - Subjects
    createSubject: (name, description, icon) => {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO subjects (name, description, icon) VALUES (?, ?, ?)`,
                [name, description, icon],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    },

    updateSubject: (id, name, description, icon) => {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE subjects SET name = ?, description = ?, icon = ? WHERE id = ?`,
                [name, description, icon, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    },

    deleteSubject: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM subjects WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    // Admin - Chapters
    createChapter: (name, subject_id, order) => {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO chapters (name, subject_id, \`order\`) VALUES (?, ?, ?)`,
                [name, subject_id, order],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    },

    updateChapter: (id, name, subject_id, order) => {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE chapters SET name = ?, subject_id = ?, \`order\` = ? WHERE id = ?`,
                [name, subject_id, order, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    },

    deleteChapter: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM chapters WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    // Admin - Videos
    createVideo: (title, description, youtube_url, drive_file_id, subject_id, chapter_id, thumbnail, is_featured = 0) => {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO videos (title, description, youtube_url, drive_file_id, subject_id, chapter_id, thumbnail, is_featured) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, description, youtube_url, drive_file_id, subject_id, chapter_id, thumbnail, is_featured],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    },

    updateVideo: (id, title, description, youtube_url, drive_file_id, subject_id, chapter_id, thumbnail, is_featured = 0) => {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE videos SET title = ?, description = ?, youtube_url = ?, drive_file_id = ?, 
                    subject_id = ?, chapter_id = ?, thumbnail = ?, is_featured = ? WHERE id = ?`,
                [title, description, youtube_url, drive_file_id, subject_id, chapter_id, thumbnail, is_featured, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    },

    deleteVideo: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM videos WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    // Featured videos
    getFeaturedVideos: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM videos WHERE is_featured = 1 ORDER BY created_at DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = { db, initDatabase, seedData, dbHelpers };
