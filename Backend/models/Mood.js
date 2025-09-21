const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry',
    required: true
  },
  detectedMood: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'anxious', 'excited', 'calm', 'grateful', 'lonely', 'confused', 'neutral'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  manualMood: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'anxious', 'excited', 'calm', 'grateful', 'lonely', 'confused', 'neutral'],
    default: null
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  emotions: [{
    emotion: {
      type: String,
      enum: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation', 'love', 'guilt', 'shame', 'pride', 'envy', 'contempt']
    },
    intensity: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  triggers: [{
    type: String,
    enum: ['work', 'relationships', 'health', 'family', 'money', 'weather', 'social_media', 'news', 'achievements', 'challenges', 'other']
  }],
  context: {
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    weather: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy']
    },
    location: {
      type: String,
      enum: ['home', 'work', 'school', 'outdoors', 'travel', 'social', 'other']
    }
  },
  aiAnalysis: {
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1
    },
    emotionalComplexity: {
      type: Number,
      min: 0,
      max: 1
    },
    keyPhrases: [String],
    themes: [String]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
moodSchema.index({ user: 1, createdAt: -1 });
moodSchema.index({ user: 1, detectedMood: 1 });
moodSchema.index({ user: 1, 'context.timeOfDay': 1 });
moodSchema.index({ user: 1, 'context.dayOfWeek': 1 });

// Virtual for mood color mapping
moodSchema.virtual('moodColor').get(function() {
  const colorMap = {
    happy: '#FFD700',      // Gold
    sad: '#4169E1',        // Royal Blue
    angry: '#DC143C',      // Crimson
    anxious: '#FF8C00',    // Dark Orange
    excited: '#FF1493',    // Deep Pink
    calm: '#20B2AA',       // Light Sea Green
    grateful: '#32CD32',   // Lime Green
    lonely: '#708090',     // Slate Gray
    confused: '#9370DB',   // Medium Purple
    neutral: '#808080'     // Gray
  };
  return colorMap[this.detectedMood] || '#808080';
});

// Virtual for mood emoji
moodSchema.virtual('moodEmoji').get(function() {
  const emojiMap = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    excited: '🤩',
    calm: '😌',
    grateful: '🙏',
    lonely: '😔',
    confused: '😕',
    neutral: '😐'
  };
  return emojiMap[this.detectedMood] || '😐';
});

// Method to get mood trend
moodSchema.statics.getMoodTrend = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const moods = await this.find({
    user: userId,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });
  
  return moods.map(mood => ({
    date: mood.createdAt,
    mood: mood.detectedMood,
    confidence: mood.confidence,
    intensity: mood.intensity,
    color: mood.moodColor,
    emoji: mood.moodEmoji
  }));
};

// Method to get mood statistics
moodSchema.statics.getMoodStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$detectedMood',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' },
        avgIntensity: { $avg: '$intensity' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  return stats;
};

// Method to get mood patterns
moodSchema.statics.getMoodPatterns = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const patterns = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          dayOfWeek: '$context.dayOfWeek',
          timeOfDay: '$context.timeOfDay'
        },
        moods: { $push: '$detectedMood' },
        avgIntensity: { $avg: '$intensity' }
      }
    }
  ]);
  
  return patterns;
};

module.exports = mongoose.model('Mood', moodSchema);

