api.getAnalytics().then(analytics => {
    // Total stats
    document.getElementById('totalViews').textContent = analytics.total_views || 0;
    document.getElementById('totalVideos').textContent = analytics.total_videos || 0;
    
    // Popular subject
    const popularSubject = document.getElementById('popularSubject');
    if (analytics.popular_subject && analytics.popular_subject.name) {
        popularSubject.innerHTML = `
            <p style="font-size: 1.2rem; color: #2c3e50; margin: 0.5rem 0;">
                <strong>${analytics.popular_subject.name}</strong>
            </p>
            <p style="color: #666;">${analytics.popular_subject.total_views || 0} views</p>
        `;
    } else {
        popularSubject.innerHTML = '<p style="color: #999;">No data</p>';
    }
    
    // Popular chapter
    const popularChapter = document.getElementById('popularChapter');
    if (analytics.popular_chapter && analytics.popular_chapter.name) {
        popularChapter.innerHTML = `
            <p style="font-size: 1.2rem; color: #2c3e50; margin: 0.5rem 0;">
                <strong>${analytics.popular_chapter.name}</strong>
            </p>
            <p style="color: #666;">${analytics.popular_chapter.subject_name || ''}</p>
            <p style="color: #666;">${analytics.popular_chapter.total_views || 0} views</p>
        `;
    } else {
        popularChapter.innerHTML = '<p style="color: #999;">No data</p>';
    }
    
    // Top 10 videos
    const topVideos = document.getElementById('topVideos');
    if (analytics.top_videos && analytics.top_videos.length > 0) {
        topVideos.innerHTML = analytics.top_videos.map((video, index) => `
            <div style="padding: 0.8rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-weight: bold; color: #e74c3c; margin-right: 0.5rem;">#${index + 1}</span>
                    <span>${video.title}</span>
                </div>
                <span style="color: #666;">${video.view_count} views</span>
            </div>
        `).join('');
    } else {
        topVideos.innerHTML = '<p style="color: #999;">No videos yet</p>';
    }
    
    // Subject breakdown chart
    const subjectBreakdown = document.getElementById('subjectBreakdown');
    if (analytics.subject_breakdown && analytics.subject_breakdown.length > 0) {
        const maxViews = Math.max(...analytics.subject_breakdown.map(s => s.total_views || 0));
        
        subjectBreakdown.innerHTML = analytics.subject_breakdown.map(subject => {
            const views = subject.total_views || 0;
            const percentage = maxViews > 0 ? (views / maxViews) * 100 : 0;
            
            return `
                <div class="chart-bar">
                    <div class="chart-label">${subject.name}</div>
                    <div class="chart-value" style="width: ${percentage}%;"></div>
                    <div class="chart-count">${views}</div>
                </div>
            `;
        }).join('');
    } else {
        subjectBreakdown.innerHTML = '<p style="color: #999;">No data</p>';
    }
});
