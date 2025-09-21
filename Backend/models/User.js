const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const encryptionService = require('../services/encryption');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      dataSharing: {
        type: Boolean,
        default: false
      },
      analytics: {
        type: Boolean,
        default: true
      }
    }
  },
  encryption: {
    key: {
      type: String,
      required: false
    },
    keyDerivationSalt: {
      type: String,
      required: false
    },
    isEncryptionEnabled: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalEntries: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastEntryDate: {
      type: Date,
      default: null
    },
    badges: [{
      type: String,
      enum: [
        'first_entry', 'week_streak', 'month_streak', 'year_streak',
        'mood_tracker', 'reflection_master', 'consistency_king',
        'early_bird', 'night_owl', 'weekend_warrior'
      ]
    }]
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully for user:', this.email);
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result for', this.email, ':', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email,
      username: this.username 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Get user profile (without sensitive data)
userSchema.methods.getProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    avatar: this.avatar,
    preferences: this.preferences,
    stats: this.stats,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
};

// Update streak logic
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If last entry was yesterday, increment streak
  if (this.stats.lastEntryDate && 
      this.stats.lastEntryDate.toDateString() === yesterday.toDateString()) {
    this.stats.currentStreak += 1;
  } 
  // If last entry was today, keep current streak
  else if (this.stats.lastEntryDate && 
           this.stats.lastEntryDate.toDateString() === today.toDateString()) {
    // Streak remains the same
  } 
  // If last entry was more than 1 day ago, reset streak
  else {
    this.stats.currentStreak = 1;
  }
  
  // Update longest streak if current is longer
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  this.stats.lastEntryDate = today;
  this.stats.totalEntries += 1;

  // Award badges based on achievements
  const newBadges = [];
  
  // First entry badge
  if (this.stats.totalEntries >= 1 && !this.stats.badges.includes('first_entry')) {
    newBadges.push('first_entry');
  }
  
  // Week streak badge
  if (this.stats.currentStreak >= 7 && !this.stats.badges.includes('week_streak')) {
    newBadges.push('week_streak');
  }
  
  // Month streak badge
  if (this.stats.currentStreak >= 30 && !this.stats.badges.includes('month_streak')) {
    newBadges.push('month_streak');
  }
  
  // Year streak badge
  if (this.stats.currentStreak >= 365 && !this.stats.badges.includes('year_streak')) {
    newBadges.push('year_streak');
  }
  
  // Mood tracker badge
  if (this.stats.totalEntries >= 10 && !this.stats.badges.includes('mood_tracker')) {
    newBadges.push('mood_tracker');
  }
  
  // Reflection master badge
  if (this.stats.totalEntries >= 50 && !this.stats.badges.includes('reflection_master')) {
    newBadges.push('reflection_master');
  }
  
  // Consistency king badge
  if (this.stats.totalEntries >= 100 && !this.stats.badges.includes('consistency_king')) {
    newBadges.push('consistency_king');
  }
  
  // Add new badges to user
  if (newBadges.length > 0) {
    this.stats.badges.push(...newBadges);
  }
  
  return this.save();
};

// Generate encryption key for new user
userSchema.methods.generateEncryptionKey = function(password) {
  const salt = encryptionService.generateRandomString(32);
  const key = encryptionService.deriveKey(password, salt);
  
  this.encryption.key = key;
  this.encryption.keyDerivationSalt = salt;
  this.encryption.isEncryptionEnabled = true;
  
  return this;
};

// Verify encryption key
userSchema.methods.verifyEncryptionKey = function(password) {
  const derivedKey = encryptionService.deriveKey(password, this.encryption.keyDerivationSalt);
  return derivedKey === this.encryption.key;
};

// Get encryption key (for internal use only)
userSchema.methods.getEncryptionKey = function() {
  return this.encryption.key;
};

// Encrypt user data
userSchema.methods.encryptData = function(data) {
  if (!this.encryption.isEncryptionEnabled) {
    return data;
  }
  return encryptionService.encryptUserData(data, this.encryption.key);
};

// Decrypt user data
userSchema.methods.decryptData = function(encryptedData) {
  if (!this.encryption.isEncryptionEnabled) {
    return encryptedData;
  }
  return encryptionService.decryptUserData(
    encryptedData.data, 
    encryptedData.iv, 
    this.encryption.key
  );
};

// Create encrypted backup
userSchema.methods.createBackup = function() {
  const userData = {
    profile: this.getProfile(),
    preferences: this.preferences,
    stats: this.stats
  };
  
  return encryptionService.createEncryptedBackup(userData, this.encryption.key);
};

// Restore from backup
userSchema.methods.restoreFromBackup = function(encryptedBackup) {
  const backupData = encryptionService.restoreFromBackup(encryptedBackup, this.encryption.key);
  
  // Update user data from backup
  if (backupData.data) {
    this.preferences = backupData.data.preferences || this.preferences;
    this.stats = backupData.data.stats || this.stats;
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
