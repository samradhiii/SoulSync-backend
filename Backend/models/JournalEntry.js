const mongoose = require('mongoose');
const encryptionService = require('../services/encryption');
const crypto = require('crypto');

const journalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [50000, 'Content cannot exceed 50,000 characters']
  },
  encryptedContent: {
    data: String,
    iv: String,
    algorithm: {
      type: String,
      default: 'AES-256-CBC'
    }
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  mood: {
    detected: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'anxious', 'excited', 'calm', 'grateful', 'lonely', 'confused', 'neutral'],
      default: 'neutral'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    manual: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'anxious', 'excited', 'calm', 'grateful', 'lonely', 'confused', 'neutral'],
      default: null
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'audio', 'document'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  voiceNote: {
    filename: String,
    duration: Number, // in seconds
    transcription: String,
    url: String
  },
  reflection: {
    prompt: String,
    response: String,
    category: {
      type: String,
      enum: ['gratitude', 'growth', 'challenge', 'achievement', 'relationship', 'health', 'work', 'general']
    }
  },
  securityFlags: {
    hasSelfHarmContent: {
      type: Boolean,
      default: false
    },
    hasSensitiveContent: {
      type: Boolean,
      default: false
    },
    flaggedWords: [String],
    helplineShown: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date,
      default: null
    },
    editCount: {
      type: Number,
      default: 0
    },
    lastEdited: {
      type: Date,
      default: null
    }
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
journalEntrySchema.index({ user: 1, createdAt: -1 });
journalEntrySchema.index({ user: 1, 'mood.detected': 1 });
journalEntrySchema.index({ user: 1, tags: 1 });
journalEntrySchema.index({ user: 1, isArchived: 1, isDeleted: 1 });
journalEntrySchema.index({ createdAt: -1 });

// Text search index
journalEntrySchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Virtual for formatted date
journalEntrySchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
});

// Virtual for reading time calculation
journalEntrySchema.virtual('estimatedReadingTime').get(function() {
  const wordsPerMinute = 200;
  return Math.ceil(this.wordCount / wordsPerMinute);
});

// Pre-save middleware
journalEntrySchema.pre('save', function(next) {
  // Calculate word count
  this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate reading time
  this.readingTime = Math.ceil(this.wordCount / 200); // 200 words per minute
  
  // Encrypt content if not already encrypted
  if (this.isEncrypted && !this.encryptedContent) {
    this.encryptedContent = this.encryptContent(this.content);
  }
  
  next();
});

// Encrypt content using user's encryption key
journalEntrySchema.methods.encryptContent = function(content, userKey) {
  if (!userKey) {
    throw new Error('User encryption key is required');
  }
  
  const encrypted = encryptionService.encryptJournalEntry(content, userKey);
  this.encryptedContent = encrypted;
  this.isEncrypted = true;
  this.content = ''; // Clear unencrypted content
  
  return encrypted;
};

// Decrypt content using user's encryption key
journalEntrySchema.methods.decryptContent = function(userKey) {
  if (!this.isEncrypted || !this.encryptedContent) {
    return this.content;
  }
  
  if (!userKey) {
    throw new Error('User encryption key is required');
  }
  
  try {
    const decrypted = encryptionService.decryptJournalEntry(
      this.encryptedContent.data,
      this.encryptedContent.iv,
      userKey
    );
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt content');
  }
};

// Get decrypted content for display
journalEntrySchema.methods.getDecryptedContent = function(userKey) {
  if (this.isEncrypted) {
    return this.decryptContent(userKey);
  }
  return this.content;
};

// Method to check for self-harm content
journalEntrySchema.methods.checkForSelfHarm = function() {
  const selfHarmKeywords = [
    'suicide', 'kill myself', 'end it all', 'not worth living',
    'hurt myself', 'self harm', 'cut myself', 'overdose',
    'jump off', 'hang myself', 'poison myself'
  ];
  
  const content = this.content.toLowerCase();
  const flaggedWords = [];
  
  selfHarmKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      flaggedWords.push(keyword);
    }
  });
  
  this.securityFlags.hasSelfHarmContent = flaggedWords.length > 0;
  this.securityFlags.flaggedWords = flaggedWords;
  
  return this.securityFlags.hasSelfHarmContent;
};

// Method to get public entry (without sensitive data)
journalEntrySchema.methods.getPublicEntry = function(userKey = null) {
  return {
    id: this._id,
    title: this.title,
    content: userKey ? this.getDecryptedContent(userKey) : this.content,
    mood: this.mood,
    tags: this.tags,
    wordCount: this.wordCount,
    readingTime: this.readingTime,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    formattedDate: this.formattedDate,
    isEncrypted: this.isEncrypted
  };
};

// Soft delete method
journalEntrySchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
journalEntrySchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
