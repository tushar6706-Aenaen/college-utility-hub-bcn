# College Utility Hub - Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend folder with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college-utility-hub
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. Make sure MongoDB is running locally.

4. Seed the default admin account:
```bash
npm run seed
```

5. Start the server:
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## Default Admin Credentials
- Email: admin@college.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new student
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)

### Notices
- `GET /api/notices` - Get all active notices
- `GET /api/notices/:id` - Get single notice
- `POST /api/notices` - Create notice (admin only)
- `PUT /api/notices/:id` - Update notice (admin only)
- `DELETE /api/notices/:id` - Delete notice (admin only)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Lost & Found
- `GET /api/lostfound` - Get all approved posts
- `GET /api/lostfound/all` - Get all posts (admin only)
- `GET /api/lostfound/my-posts` - Get user's posts (protected)
- `GET /api/lostfound/:id` - Get single post
- `POST /api/lostfound` - Create post (protected)
- `PUT /api/lostfound/:id` - Update post (owner only)
- `DELETE /api/lostfound/:id` - Delete post (owner/admin)
- `PATCH /api/lostfound/:id/approve` - Approve post (admin only)
- `PATCH /api/lostfound/:id/reject` - Reject post (admin only)
- `PATCH /api/lostfound/:id/claim` - Mark as claimed (owner/admin)

### Feedback
- `GET /api/feedback` - Get all feedback (admin only)
- `GET /api/feedback/stats` - Get feedback statistics (admin only)
- `POST /api/feedback` - Submit feedback (protected)
- `PATCH /api/feedback/:id/resolve` - Mark as resolved (admin only)

### Statistics
- `GET /api/stats` - Get dashboard statistics (protected)
- `GET /api/stats/activity` - Get recent activity (admin only)

