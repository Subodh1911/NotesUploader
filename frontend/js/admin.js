let isLoggedIn = false;
let allSubjects = [];
let allChapters = [];

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName === 'chapters') loadChapters();
    if (tabName === 'videos') loadVideosTab();
    if (tabName === 'analytics') loadAnalyticsTab();
}

// Show alert
function showAlert(message, type = 'success', containerId = 'adminAlert') {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 3000);
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            isLoggedIn = true;
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminSection').style.display = 'block';
            document.getElementById('logoutBtn').style.display = 'block';
            loadChannelSettings();
            loadSubjects();
        } else {
            showAlert(data.error || 'Invalid password', 'error', 'loginAlert');
        }
    } catch (error) {
        showAlert('Login failed', 'error', 'loginAlert');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    location.reload();
});

// Channel Settings
async function loadChannelSettings() {
    const channel = await api.getChannelInfo();
    document.getElementById('channelName').value = channel.name || '';
    document.getElementById('channelDescription').value = channel.description || '';
    document.getElementById('channelLogo').value = channel.logo || '';
    document.getElementById('channelYoutube').value = channel.youtube_channel || '';
}

document.getElementById('channelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/admin/channel-info', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('channelName').value,
                description: document.getElementById('channelDescription').value,
                logo: document.getElementById('channelLogo').value,
                youtube_channel: document.getElementById('channelYoutube').value
            })
        });
        
        if (response.ok) {
            showAlert('Channel settings updated successfully');
        } else {
            showAlert('Failed to update settings', 'error');
        }
    } catch (error) {
        showAlert('Error updating settings', 'error');
    }
});

// Subjects Management
async function loadSubjects() {
    allSubjects = await api.getSubjects();
    const tbody = document.getElementById('subjectsList');
    
    tbody.innerHTML = allSubjects.map(subject => `
        <tr>
            <td>${subject.icon}</td>
            <td>${subject.name}</td>
            <td>${subject.description || ''}</td>
            <td>
                <button class="btn-edit" onclick="editSubject(${subject.id})">Edit</button>
                <button class="btn-delete" onclick="deleteSubject(${subject.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    
    // Update dropdowns
    updateSubjectDropdowns();
}

function updateSubjectDropdowns() {
    const selects = [document.getElementById('chapterSubject'), document.getElementById('videoSubject')];
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Subject</option>' + 
            allSubjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    });
}

document.getElementById('subjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('subjectEditId').value;
    const data = {
        name: document.getElementById('subjectName').value,
        description: document.getElementById('subjectDescription').value,
        icon: document.getElementById('subjectIcon').value
    };
    
    try {
        const url = id ? `/api/admin/subjects/${id}` : '/api/admin/subjects';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert(id ? 'Subject updated' : 'Subject added');
            document.getElementById('subjectForm').reset();
            document.getElementById('subjectEditId').value = '';
            document.getElementById('cancelSubjectEdit').style.display = 'none';
            loadSubjects();
        } else {
            showAlert('Operation failed', 'error');
        }
    } catch (error) {
        showAlert('Error', 'error');
    }
});

function editSubject(id) {
    const subject = allSubjects.find(s => s.id === id);
    document.getElementById('subjectName').value = subject.name;
    document.getElementById('subjectDescription').value = subject.description || '';
    document.getElementById('subjectIcon').value = subject.icon || '';
    document.getElementById('subjectEditId').value = id;
    document.getElementById('cancelSubjectEdit').style.display = 'inline-block';
}

document.getElementById('cancelSubjectEdit').addEventListener('click', () => {
    document.getElementById('subjectForm').reset();
    document.getElementById('subjectEditId').value = '';
    document.getElementById('cancelSubjectEdit').style.display = 'none';
});

async function deleteSubject(id) {
    if (!confirm('Delete this subject? All chapters and videos will be deleted.')) return;
    
    try {
        const response = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Subject deleted');
            loadSubjects();
        }
    } catch (error) {
        showAlert('Delete failed', 'error');
    }
}

// Chapters Management
async function loadChapters() {
    const subjects = await api.getSubjects();
    allChapters = [];
    
    for (const subject of subjects) {
        const subjectData = await api.getSubject(subject.id);
        if (subjectData.chapters) {
            allChapters.push(...subjectData.chapters.map(c => ({ ...c, subject_name: subject.name })));
        }
    }
    
    const tbody = document.getElementById('chaptersList');
    tbody.innerHTML = allChapters.map(chapter => `
        <tr>
            <td>${chapter.subject_name}</td>
            <td>${chapter.name}</td>
            <td>${chapter.order}</td>
            <td>
                <button class="btn-edit" onclick="editChapter(${chapter.id})">Edit</button>
                <button class="btn-delete" onclick="deleteChapter(${chapter.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('chapterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('chapterEditId').value;
    const data = {
        name: document.getElementById('chapterName').value,
        subject_id: document.getElementById('chapterSubject').value,
        order: document.getElementById('chapterOrder').value
    };
    
    try {
        const url = id ? `/api/admin/chapters/${id}` : '/api/admin/chapters';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert(id ? 'Chapter updated' : 'Chapter added');
            document.getElementById('chapterForm').reset();
            document.getElementById('chapterEditId').value = '';
            document.getElementById('cancelChapterEdit').style.display = 'none';
            loadChapters();
        }
    } catch (error) {
        showAlert('Error', 'error');
    }
});

function editChapter(id) {
    const chapter = allChapters.find(c => c.id === id);
    document.getElementById('chapterName').value = chapter.name;
    document.getElementById('chapterSubject').value = chapter.subject_id;
    document.getElementById('chapterOrder').value = chapter.order;
    document.getElementById('chapterEditId').value = id;
    document.getElementById('cancelChapterEdit').style.display = 'inline-block';
}

document.getElementById('cancelChapterEdit').addEventListener('click', () => {
    document.getElementById('chapterForm').reset();
    document.getElementById('chapterEditId').value = '';
    document.getElementById('cancelChapterEdit').style.display = 'none';
});

async function deleteChapter(id) {
    if (!confirm('Delete this chapter? All videos will be deleted.')) return;
    
    try {
        const response = await fetch(`/api/admin/chapters/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Chapter deleted');
            loadChapters();
        }
    } catch (error) {
        showAlert('Delete failed', 'error');
    }
}

// Videos Management
async function loadVideosTab() {
    const videos = await api.getVideos();
    const tbody = document.getElementById('videosList');
    
    tbody.innerHTML = videos.map(video => `
        <tr>
            <td>${video.title}</td>
            <td>${allSubjects.find(s => s.id === video.subject_id)?.name || ''}</td>
            <td>${allChapters.find(c => c.id === video.chapter_id)?.name || ''}</td>
            <td>${video.is_featured ? '⭐ Yes' : 'No'}</td>
            <td>${video.view_count}</td>
            <td>
                <button class="btn-edit" onclick="editVideo(${video.id})">Edit</button>
                <button class="btn-delete" onclick="deleteVideo(${video.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update chapter dropdown when subject changes
document.getElementById('videoSubject').addEventListener('change', async (e) => {
    const subjectId = e.target.value;
    const chapterSelect = document.getElementById('videoChapter');
    
    if (!subjectId) {
        chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
        return;
    }
    
    const subject = await api.getSubject(subjectId);
    chapterSelect.innerHTML = '<option value="">Select Chapter</option>' +
        (subject.chapters || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
});

document.getElementById('videoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('videoEditId').value;
    const data = {
        title: document.getElementById('videoTitle').value,
        description: document.getElementById('videoDescription').value,
        youtube_url: document.getElementById('videoYoutubeUrl').value,
        drive_file_id: document.getElementById('videoDriveId').value,
        subject_id: document.getElementById('videoSubject').value,
        chapter_id: document.getElementById('videoChapter').value,
        thumbnail: document.getElementById('videoThumbnail').value,
        is_featured: document.getElementById('videoFeatured').checked ? 1 : 0
    };
    
    try {
        const url = id ? `/api/admin/videos/${id}` : '/api/admin/videos';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert(id ? 'Video updated' : 'Video added');
            document.getElementById('videoForm').reset();
            document.getElementById('videoEditId').value = '';
            document.getElementById('cancelVideoEdit').style.display = 'none';
            loadVideosTab();
        }
    } catch (error) {
        showAlert('Error', 'error');
    }
});

async function editVideo(id) {
    const video = await api.getVideo(id);
    document.getElementById('videoTitle').value = video.title;
    document.getElementById('videoDescription').value = video.description || '';
    document.getElementById('videoYoutubeUrl').value = video.youtube_url;
    document.getElementById('videoDriveId').value = video.drive_file_id;
    document.getElementById('videoSubject').value = video.subject_id;
    
    // Load chapters for selected subject
    const subject = await api.getSubject(video.subject_id);
    const chapterSelect = document.getElementById('videoChapter');
    chapterSelect.innerHTML = (subject.chapters || []).map(c => 
        `<option value="${c.id}">${c.name}</option>`
    ).join('');
    chapterSelect.value = video.chapter_id;
    
    document.getElementById('videoThumbnail').value = video.thumbnail || '';
    document.getElementById('videoFeatured').checked = video.is_featured === 1;
    document.getElementById('videoEditId').value = id;
    document.getElementById('cancelVideoEdit').style.display = 'inline-block';
}

document.getElementById('cancelVideoEdit').addEventListener('click', () => {
    document.getElementById('videoForm').reset();
    document.getElementById('videoEditId').value = '';
    document.getElementById('cancelVideoEdit').style.display = 'none';
});

async function deleteVideo(id) {
    if (!confirm('Delete this video?')) return;
    
    try {
        const response = await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Video deleted');
            loadVideosTab();
        }
    } catch (error) {
        showAlert('Delete failed', 'error');
    }
}

// Analytics Tab
async function loadAnalyticsTab() {
    const analytics = await api.getAnalytics();
    document.getElementById('adminTotalViews').textContent = analytics.total_views || 0;
    document.getElementById('adminTotalVideos').textContent = analytics.total_videos || 0;
    
    const content = document.getElementById('adminAnalyticsContent');
    content.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 2rem;">
            <h3>Top Videos</h3>
            ${analytics.top_videos && analytics.top_videos.length > 0 ? 
                analytics.top_videos.slice(0, 5).map((v, i) => `
                    <div style="padding: 0.8rem; border-bottom: 1px solid #eee;">
                        <strong>#${i + 1}</strong> ${v.title} - ${v.view_count} views
                    </div>
                `).join('') : '<p>No data</p>'
            }
        </div>
    `;
}
