# Educational Video Notes Website

A full-stack web application for managing and sharing educational video notes with YouTube integration and Google Drive PDF hosting.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js + Express.js
- **Database**: SQLite
- **Hosting**: Render (Free Tier)
- **External Services**: YouTube (videos), Google Drive (PDF hosting)

---

## Features

### Public Features

#### 1. Home Page
- Channel information (logo, name, description, YouTube channel link)
- Statistics overview (total videos, subjects, total views)
- Trending section (top 5 videos from last 30 days)
- Popular section (top 5 all-time most viewed videos)
- Browse subjects grid with icons

#### 2. Browse Videos Page
- Grid layout of all videos
- Search functionality (by title/description)
- Filter by subject and chapter (dropdowns)
- Video cards display:
  - YouTube thumbnail (auto-fetched)
  - Title
  - Subject/Chapter tags
  - View count
  - Watch on YouTube button
  - View Notes button

#### 3. Subject Page
- Subject name, description, and icon
- Expandable/collapsible chapters list
- Videos grouped under each chapter
- Subject-level statistics (total videos, total views)

#### 4. PDF Viewer Page
- Embedded Google Drive PDF viewer
- Video information (title, subject, chapter)
- Watch on YouTube button
- Related videos section (3-5 videos from same chapter/subject)
- Auto-increment view count on page load

#### 5. Analytics Dashboard
- Total views across all videos
- Most popular subject (by views)
- Most popular chapter (by views)
- Top 10 videos by views
- Subject-wise view breakdown with visual charts

### Admin Features

#### 6. Admin Panel (Password Protected)

**Channel Settings Tab**
- Edit channel name
- Edit description
- Update logo URL
- Update YouTube channel URL

**Manage Subjects Tab**
- View all subjects in table
- Add new subject (name, description, icon URL)
- Edit existing subjects
- Delete subjects

**Manage Chapters Tab**
- Select subject from dropdown
- View chapters under selected subject
- Add new chapter (name, order)
- Edit/Delete chapters
- Reorder chapters

**Manage Videos Tab**
- View all videos in table with search/filter
- Add new video form:
  - Title
  - Description
  - YouTube URL (auto-fetch thumbnail)
  - Google Drive PDF link
  - Select subject (dropdown)
  - Select chapter (dropdown)
  - Optional custom thumbnail URL
- Edit existing videos
- Delete videos
- View count display (read-only)

**Analytics Overview Tab**
- Quick stats dashboard
- Same data as public analytics page

---

## Database Schema

### Tables

**channel_info**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- logo (TEXT)
- youtube_channel (TEXT)

**subjects**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- icon (TEXT)
- created_at (DATETIME)

**chapters**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- subject_id (INTEGER, FOREIGN KEY)
- order (INTEGER)
- created_at (DATETIME)

**videos**
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- youtube_url (TEXT)
- drive_file_id (TEXT)
- subject_id (INTEGER, FOREIGN KEY)
- chapter_id (INTEGER, FOREIGN KEY)
- thumbnail (TEXT)
- view_count (INTEGER DEFAULT 0)
- created_at (DATETIME)

**view_logs**
- id (INTEGER PRIMARY KEY)
- video_id (INTEGER, FOREIGN KEY)
- viewed_at (DATETIME)

---

## API Endpoints

### Public APIs

- `GET /api/channel-info` - Get channel information
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject with chapters and videos
- `GET /api/videos` - Get all videos (supports filters: subject, chapter, search)
- `GET /api/videos/:id` - Get single video details
- `GET /api/videos/:id/related` - Get related videos
- `GET /api/trending` - Get trending videos (last 30 days)
- `GET /api/popular` - Get popular videos (all-time)
- `GET /api/analytics` - Get analytics data
- `POST /api/videos/:id/view` - Increment view count

### Admin APIs (Password Protected)

**Authentication**
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout

**Channel Management**
- `PUT /api/admin/channel-info` - Update channel info

**Subject Management**
- `POST /api/admin/subjects` - Create subject
- `PUT /api/admin/subjects/:id` - Update subject
- `DELETE /api/admin/subjects/:id` - Delete subject

**Chapter Management**
- `POST /api/admin/chapters` - Create chapter
- `PUT /api/admin/chapters/:id` - Update chapter
- `DELETE /api/admin/chapters/:id` - Delete chapter

**Video Management**
- `POST /api/admin/videos` - Create video
- `PUT /api/admin/videos/:id` - Update video
- `DELETE /api/admin/videos/:id` - Delete video

---

## Project Structure

```
notes_uploader/
├── frontend/
│   ├── index.html              # Home page
│   ├── videos.html             # Browse videos
│   ├── subject.html            # Subject page
│   ├── viewer.html             # PDF viewer
│   ├── analytics.html          # Analytics dashboard
│   ├── admin.html              # Admin panel
│   ├── css/
│   │   └── style.css           # Global styles
│   └── js/
│       ├── api.js              # API helper functions
│       ├── home.js             # Home page logic
│       ├── videos.js           # Videos page logic
│       ├── subject.js          # Subject page logic
│       ├── viewer.js           # Viewer page logic
│       ├── analytics.js        # Analytics page logic
│       └── admin.js            # Admin panel logic
├── backend/
│   ├── server.js               # Express server
│   ├── database.js             # SQLite setup and queries
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── routes/
│   │   ├── videos.js           # Video routes
│   │   ├── subjects.js         # Subject routes
│   │   ├── chapters.js         # Chapter routes
│   │   ├── analytics.js        # Analytics routes
│   │   ├── channelInfo.js      # Channel info routes
│   │   └── admin.js            # Admin routes
│   └── database.sqlite         # SQLite database file
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## Development Plan

### Phase 1: Backend Setup
1. Initialize Node.js project
2. Install dependencies (express, sqlite3, cors, dotenv, express-session)
3. Create basic Express server
4. Setup SQLite database connection
5. Create database schema and tables
6. Add seed data for testing

### Phase 2: Backend API Development
1. Create database helper functions (CRUD operations)
2. Implement public API routes:
   - Channel info
   - Subjects
   - Videos (with filters)
   - Trending and popular
   - Analytics
   - View tracking
3. Test all public APIs

### Phase 3: Admin Backend
1. Implement authentication middleware
2. Create admin API routes:
   - Login/Logout
   - Channel management
   - Subject management
   - Chapter management
   - Video management
3. Test all admin APIs

### Phase 4: Frontend - Public Pages
1. Create base HTML structure and CSS
2. Create API helper (api.js)
3. Build Home page:
   - Fetch and display channel info
   - Display trending and popular sections
   - Display subjects grid
4. Build Videos page:
   - Display all videos
   - Implement search
   - Implement filters
5. Build Subject page:
   - Display subject details
   - Display chapters and videos
6. Build Viewer page:
   - Embed Google Drive PDF
   - Display video info
   - Show related videos
   - Track view count
7. Build Analytics page:
   - Fetch and display analytics data
   - Add visual charts

### Phase 5: Frontend - Admin Panel
1. Create admin login page
2. Build admin dashboard layout with tabs
3. Implement Channel Settings tab
4. Implement Manage Subjects tab
5. Implement Manage Chapters tab
6. Implement Manage Videos tab
7. Implement Analytics Overview tab
8. Add form validations and error handling

### Phase 6: Integration & Testing
1. Test all frontend-backend integrations
2. Test admin workflows (add/edit/delete)
3. Test view tracking
4. Test analytics calculations
5. Fix bugs and edge cases

### Phase 7: Deployment
1. Setup GitHub repository
2. Configure environment variables
3. Create Render account
4. Deploy to Render
5. Test production deployment
6. Setup custom domain (optional)

### Phase 8: Documentation & Handoff
1. Create admin user guide
2. Document API endpoints
3. Add deployment instructions
4. Create backup/restore guide

---

## Admin Workflow

1. Admin uploads PDF to Google Drive
2. Sets PDF sharing to "Anyone with the link can view"
3. Copies shareable Drive link
4. Logs into Admin Panel
5. Navigates to "Manage Videos" tab
6. Fills in video form:
   - Title and description
   - YouTube URL
   - Google Drive PDF link
   - Selects subject and chapter
7. Clicks "Add Video"
8. Video appears on website immediately

---

## Security

- Admin password stored in environment variable (.env)
- Session-based authentication
- Admin routes protected with middleware
- CORS configured for security
- SQL injection prevention with parameterized queries
- Input validation on all forms

---

## Deployment on Render

**Requirements:**
- GitHub repository
- Render account (free)

**Steps:**
1. Push code to GitHub
2. Connect Render to repository
3. Set environment variables (ADMIN_PASSWORD, SESSION_SECRET)
4. Build command: `npm install`
5. Start command: `node backend/server.js`
6. Deploy

**Free Tier Limits:**
- 750 hours/month
- Auto-sleep after 15 minutes of inactivity
- HTTPS included

---

## Future Enhancements

- User authentication for personalized experience
- Comments/feedback system
- Video ratings
- Email notifications for new videos
- Mobile app
- Offline PDF download
- Video progress tracking
- Bookmarks/favorites
- Dark mode

---

## License

MIT License

---

## Contact

For support or queries, contact the channel owner.
