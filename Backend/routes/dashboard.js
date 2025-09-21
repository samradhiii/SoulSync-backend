const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const Mood = require('../models/Mood');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total entries count
    const totalEntries = await JournalEntry.countDocuments({
      user: userId,
      isDeleted: false
    });

    // Get entries from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEntries = await JournalEntry.countDocuments({
      user: userId,
      isDeleted: false,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get mood distribution
    const moodDistribution = await JournalEntry.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$mood.detected',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent entries
    const recentJournalEntries = await JournalEntry.find({
      user: userId,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title content mood createdAt tags');

    // Get current mood from recent entries
    const recentMoods = await Mood.find({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(10);

    let currentMood = { mood: 'neutral', recommendation: 'Start journaling to track your mood patterns!' };
    
    if (recentMoods.length > 0) {
      const moodCounts = {};
      let totalIntensity = 0;

      recentMoods.forEach(mood => {
        const moodType = mood.manualMood || mood.detectedMood;
        moodCounts[moodType] = (moodCounts[moodType] || 0) + 1;
        totalIntensity += mood.intensity;
      });

      const mostFrequentMood = Object.keys(moodCounts).reduce((a, b) => 
        moodCounts[a] > moodCounts[b] ? a : b
      );

      const recommendations = {
        happy: 'Keep up the positive energy! Consider sharing your joy with others.',
        sad: 'It\'s okay to feel sad. Consider reaching out to friends or doing something you enjoy.',
        angry: 'Take some deep breaths. Physical activity or meditation might help.',
        anxious: 'Try some relaxation techniques like deep breathing or mindfulness.',
        excited: 'Channel this energy into something productive or creative!',
        calm: 'This peaceful state is perfect for reflection and planning.',
        grateful: 'Gratitude is powerful! Consider writing down what you\'re thankful for.',
        lonely: 'Reach out to friends or family. You\'re not alone.',
        confused: 'Take time to process your thoughts. Journaling can help clarify things.',
        neutral: 'A balanced state. Perfect time for self-reflection.'
      };

      currentMood = {
        mood: mostFrequentMood,
        intensity: totalIntensity / recentMoods.length,
        recommendation: recommendations[mostFrequentMood] || recommendations.neutral
      };
    }

    // Calculate streak
    const user = await User.findById(userId).select('stats');
    const currentStreak = user.stats.currentStreak || 0;
    const longestStreak = user.stats.longestStreak || 0;

    // Update user stats
    user.stats.totalEntries = totalEntries;
    await user.save();

    res.json({
      status: 'success',
      data: {
        totalEntries,
        recentEntries,
        currentStreak,
        longestStreak,
        currentMood,
        moodDistribution: moodDistribution.reduce((acc, item) => {
          acc[item._id || 'neutral'] = item.count;
          return acc;
        }, {}),
        recentJournalEntries: recentJournalEntries.map(entry => ({
          id: entry._id,
          title: entry.title,
          content: entry.content.substring(0, 150) + (entry.content.length > 150 ? '...' : ''),
          mood: entry.mood?.detected || entry.mood?.manual || 'neutral',
          createdAt: entry.createdAt,
          tags: entry.tags
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

module.exports = router;
