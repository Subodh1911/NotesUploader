const params = new URLSearchParams(window.location.search);
const videoId = params.get('id');

if (!videoId) {
    window.location.href = 'index.html';
}

// Track view
api.trackView(videoId);

// Load video details
api.getVideo(videoId).then(video => {
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoName').textContent = video.title;
    document.getElementById('videoDescription').textContent = video.description || '';
    document.getElementById('youtubeButton').href = video.youtube_url;
    
    // Embed PDF
    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.src = getDriveEmbedUrl(video.drive_file_id);
});

// Load related videos
api.getRelatedVideos(videoId).then(videos => {
    const container = document.getElementById('relatedVideos');
    
    if (videos.length === 0) {
        container.innerHTML = '<p style="color: #999;">No related videos</p>';
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
