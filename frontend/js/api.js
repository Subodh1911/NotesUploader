const API_BASE = '/api';

const api = {
    // Channel Info
    getChannelInfo: async () => {
        const response = await fetch(`${API_BASE}/channel-info`);
        return response.json();
    },

    // Subjects
    getSubjects: async () => {
        const response = await fetch(`${API_BASE}/subjects`);
        return response.json();
    },

    getSubject: async (id) => {
        const response = await fetch(`${API_BASE}/subjects/${id}`);
        return response.json();
    },

    // Videos
    getVideos: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE}/videos?${params}`);
        return response.json();
    },

    getVideo: async (id) => {
        const response = await fetch(`${API_BASE}/videos/${id}`);
        return response.json();
    },

    getRelatedVideos: async (id) => {
        const response = await fetch(`${API_BASE}/videos/${id}/related`);
        return response.json();
    },

    getTrending: async () => {
        const response = await fetch(`${API_BASE}/videos/trending`);
        return response.json();
    },

    getPopular: async () => {
        const response = await fetch(`${API_BASE}/videos/popular`);
        return response.json();
    },

    trackView: async (id) => {
        await fetch(`${API_BASE}/videos/${id}/view`, { method: 'POST' });
    },

    // Analytics
    getAnalytics: async () => {
        const response = await fetch(`${API_BASE}/analytics`);
        return response.json();
    },

    // Featured
    getFeatured: async () => {
        const response = await fetch(`${API_BASE}/featured`);
        return response.json();
    }
};

// Helper functions
const getYouTubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : '';
};

const getDriveEmbedUrl = (driveFileId) => {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
};
