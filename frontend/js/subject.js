const params = new URLSearchParams(window.location.search);
const subjectId = params.get('id');

if (!subjectId) {
    window.location.href = 'index.html';
}

api.getSubject(subjectId).then(subject => {
    document.getElementById('subjectName').textContent = subject.name;
    document.getElementById('subjectTitle').textContent = `${subject.icon} ${subject.name}`;
    document.getElementById('subjectDescription').textContent = subject.description || '';
    
    const chaptersContainer = document.getElementById('chapters');
    
    if (!subject.chapters || subject.chapters.length === 0) {
        chaptersContainer.innerHTML = '<p style="color: #999; text-align: center;">No chapters available</p>';
        return;
    }
    
    chaptersContainer.innerHTML = subject.chapters.map(chapter => `
        <div class="chapter-section">
            <div class="chapter-header" onclick="toggleChapter(${chapter.id})">
                <h3>${chapter.name}</h3>
                <span id="toggle-${chapter.id}">▼</span>
            </div>
            <div id="chapter-${chapter.id}" class="chapter-videos" style="display: block;">
                ${chapter.videos && chapter.videos.length > 0 ? `
                    <div class="video-grid">
                        ${chapter.videos.map(video => `
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
                        `).join('')}
                    </div>
                ` : '<p style="color: #999;">No videos in this chapter</p>'}
            </div>
        </div>
    `).join('');
});

function toggleChapter(chapterId) {
    const content = document.getElementById(`chapter-${chapterId}`);
    const toggle = document.getElementById(`toggle-${chapterId}`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        content.style.display = 'none';
        toggle.textContent = '▶';
    }
}
