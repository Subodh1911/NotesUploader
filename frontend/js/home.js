// Load channel info
api.getChannelInfo().then(channel => {
    if (channel.name) {
        document.getElementById('channelName').textContent = channel.name;
        document.getElementById('heroTitle').textContent = channel.name;
        document.getElementById('footerChannelName').textContent = channel.name;
    }
    if (channel.description) {
        document.getElementById('heroDescription').textContent = channel.description;
    }
    if (channel.youtube_channel) {
        const link = document.getElementById('youtubeLink');
        link.href = channel.youtube_channel;
        link.style.display = 'inline-block';
    }
});

// Load stats
Promise.all([
    api.getVideos(),
    api.getSubjects(),
    api.getAnalytics()
]).then(([videos, subjects, analytics]) => {
    document.getElementById('totalVideos').textContent = videos.length;
    document.getElementById('totalSubjects').textContent = subjects.length;
    document.getElementById('totalViews').textContent = analytics.total_views || 0;
    
    // Footer stats
    document.getElementById('footerTotalVideos').textContent = videos.length;
    document.getElementById('footerTotalSubjects').textContent = subjects.length;
    document.getElementById('footerTotalViews').textContent = analytics.total_views || 0;
});

// Load trending videos
api.getTrending().then(videos => {
    const container = document.getElementById('trendingVideos');
    if (videos.length === 0) {
        container.innerHTML = '<p style="color: #999;">No trending videos yet</p>';
        return;
    }
    container.innerHTML = videos.map(video => `
        <div class="video-card">
            <img src="${video.thumbnail || getYouTubeThumbnail(video.youtube_url)}" 
                 alt="${video.title}" class="video-thumbnail">
            <div class="video-content">
                <h3>${video.title}</h3>
                <p>${video.description || ''}</p>
                <div class="video-meta">
                    <span>👁️ ${video.view_count} views</span>
                </div>
                <div class="video-actions">
                    <a href="${video.youtube_url}" target="_blank" class="btn btn-youtube">▶ YouTube</a>
                    <a href="viewer.html?id=${video.id}" class="btn btn-notes">📄 Notes</a>
                </div>
            </div>
        </div>
    `).join('');
});

// Load popular videos
api.getPopular().then(videos => {
    const container = document.getElementById('popularVideos');
    if (videos.length === 0) {
        container.innerHTML = '<p style="color: #999;">No popular videos yet</p>';
        return;
    }
    container.innerHTML = videos.map(video => `
        <div class="video-card">
            <img src="${video.thumbnail || getYouTubeThumbnail(video.youtube_url)}" 
                 alt="${video.title}" class="video-thumbnail">
            <div class="video-content">
                <h3>${video.title}</h3>
                <p>${video.description || ''}</p>
                <div class="video-meta">
                    <span>👁️ ${video.view_count} views</span>
                </div>
                <div class="video-actions">
                    <a href="${video.youtube_url}" target="_blank" class="btn btn-youtube">▶ YouTube</a>
                    <a href="viewer.html?id=${video.id}" class="btn btn-notes">📄 Notes</a>
                </div>
            </div>
        </div>
    `).join('');
});

// Load subjects
api.getSubjects().then(subjects => {
    const container = document.getElementById('subjects');
    container.innerHTML = subjects.map(subject => `
        <a href="subject.html?id=${subject.id}" class="subject-card" style="text-decoration: none; color: inherit;">
            <div class="subject-content">
                <h3>${subject.icon} ${subject.name}</h3>
                <p>${subject.description || ''}</p>
            </div>
        </a>
    `).join('');
});

// Load featured videos
api.getFeatured().then(videos => {
    const container = document.getElementById('featuredVideos');
    if (videos.length === 0) {
        container.innerHTML = '<p style="color: #999;">No featured videos yet</p>';
        return;
    }
    container.innerHTML = videos.map(video => `
        <div class="video-card">
            <img src="${video.thumbnail || getYouTubeThumbnail(video.youtube_url)}" 
                 alt="${video.title}" class="video-thumbnail">
            <div class="video-content">
                <h3>${video.title}</h3>
                <p>${video.description || ''}</p>
                <div class="video-meta">
                    <span>👁️ ${video.view_count} views</span>
                </div>
                <div class="video-actions">
                    <a href="${video.youtube_url}" target="_blank" class="btn btn-youtube">▶ YouTube</a>
                    <a href="viewer.html?id=${video.id}" class="btn btn-notes">📄 Notes</a>
                </div>
            </div>
        </div>
    `).join('');
});
