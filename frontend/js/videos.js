let allVideos = [];
let allSubjects = [];

// Load subjects for filter
api.getSubjects().then(subjects => {
    allSubjects = subjects;
    const subjectFilter = document.getElementById('subjectFilter');
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        subjectFilter.appendChild(option);
    });
});

// Load all videos
const loadVideos = async () => {
    const filters = {
        subject_id: document.getElementById('subjectFilter').value,
        chapter_id: document.getElementById('chapterFilter').value,
        search: document.getElementById('searchInput').value
    };
    
    const videos = await api.getVideos(filters);
    allVideos = videos;
    displayVideos(videos);
};

const displayVideos = (videos) => {
    const container = document.getElementById('videosList');
    const noResults = document.getElementById('noResults');
    
    if (videos.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
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
};

// Event listeners
document.getElementById('searchInput').addEventListener('input', loadVideos);
document.getElementById('subjectFilter').addEventListener('change', loadVideos);
document.getElementById('chapterFilter').addEventListener('change', loadVideos);

// Initial load
loadVideos();
