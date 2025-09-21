# SoulSync - Your Digital Companion 🌟

A comprehensive digital diary application built with the MERN stack, featuring AI-powered mood detection, adaptive themes, and secure end-to-end encryption.

## ✨ Features

### Core Features
- **Secure User Authentication** - JWT-based authentication with email verification
- **End-to-End Encrypted Journaling** - Your thoughts are protected with AES-256 encryption
- **Rich Text & Voice Editor** - Write with rich formatting and voice recording capabilities
- **AI/NLP Mood Detection** - Automatic mood analysis from your journal entries
- **Mood-Adaptive Themes** - App automatically changes colors and animations based on your mood
- **Micro-Reflection Prompts** - Context-based tips and reflection questions
- **Mood Analytics Dashboard** - Visual insights into your emotional patterns
- **Offline-First & Sync** - Write anywhere, sync everywhere
- **Journaling Streaks & Badges** - Gamification to encourage consistent journaling
- **Data Export & Backup** - Export your data in multiple formats
- **Real-time Security Alerts** - Self-harm detection with helpline information

### Technical Features
- **MERN Stack** - MongoDB, Express.js, React, Node.js
- **Responsive Design** - Beautiful UI that works on all devices
- **Progressive Web App** - Install as a native app
- **Real-time Updates** - Live mood and theme changes
- **Advanced Security** - Rate limiting, CORS, helmet, input validation
- **Modern UI/UX** - Framer Motion animations, styled-components, modern design

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "SoulSync (P1)"
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the Backend directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/soulsync
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Encryption
   ENCRYPTION_KEY=your_32_character_encryption_key_here
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the Application**
   
   **Backend (Terminal 1):**
   ```bash
   cd Backend
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd Frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
SoulSync (P1)/
├── Backend/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── server.js         # Express server
│   └── package.json
├── Frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── styles/       # Global styles
│   │   └── App.js        # Main app component
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-email` - Verify email

### Journal
- `GET /api/journal/entries` - Get journal entries
- `POST /api/journal/entries` - Create journal entry
- `GET /api/journal/entries/:id` - Get specific entry
- `PUT /api/journal/entries/:id` - Update entry
- `DELETE /api/journal/entries/:id` - Delete entry
- `GET /api/journal/stats` - Get journal statistics

### Mood
- `GET /api/mood/current` - Get current mood
- `GET /api/mood/trend` - Get mood trend
- `GET /api/mood/stats` - Get mood statistics
- `PUT /api/mood/:id` - Update mood

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/mood-insights` - Get mood insights
- `GET /api/analytics/export` - Export user data

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password
- `GET /api/user/stats` - Get user statistics

## 🎨 Theme System

SoulSync features a dynamic theme system that adapts to your mood:

- **Light Theme** - Clean and bright for positive moods
- **Dark Theme** - Easy on the eyes for evening use
- **Mood Themes** - Automatically change based on detected emotions:
  - Happy (Gold/Yellow)
  - Sad (Blue)
  - Angry (Red)
  - Anxious (Orange)
  - Calm (Green)
  - And more...

## 🔒 Security Features

- **End-to-End Encryption** - All journal entries are encrypted
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Comprehensive input sanitization
- **CORS Protection** - Cross-origin request security
- **Helmet Security** - Additional security headers
- **Self-Harm Detection** - AI-powered content monitoring

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables
3. Deploy with Git

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the build folder

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update MONGODB_URI in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Voice-to-text transcription
- [ ] Advanced AI mood analysis
- [ ] Social features (optional sharing)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Integration with health apps
- [ ] Multi-language support

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database
- All open-source contributors
- The mental health community for inspiration

---

**SoulSync** - Your journey of self-reflection and growth starts here. 🌟

