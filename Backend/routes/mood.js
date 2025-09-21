const express = require('express');
const Mood = require('../models/Mood');
const JournalEntry = require('../models/JournalEntry');
const { protect } = require('../middleware/auth');
const { validateMood } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/mood/trend
// @desc    Get mood trend for user
// @access  Private
router.get('/trend', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trend = await Mood.getMoodTrend(req.user._id, parseInt(days));

    res.json({
      status: 'success',
      data: {
        trend,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Get mood trend error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching mood trend'
    });
  }
});

// @route   GET /api/mood/stats
// @desc    Get mood statistics for user
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await Mood.getMoodStats(req.user._id, parseInt(days));

    res.json({
      status: 'success',
      data: {
        stats,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching mood statistics'
    });
  }
});

// @route   GET /api/mood/patterns
// @desc    Get mood patterns for user
// @access  Private
router.get('/patterns', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const patterns = await Mood.getMoodPatterns(req.user._id, parseInt(days));

    res.json({
      status: 'success',
      data: {
        patterns,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Get mood patterns error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching mood patterns'
    });
  }
});

// @route   PUT /api/mood/:id
// @desc    Update mood for a journal entry
// @access  Private
router.put('/:id', protect, validateMood, async (req, res) => {
  try {
    const { mood, intensity } = req.body;

    // Find mood record
    const moodRecord = await Mood.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!moodRecord) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood record not found'
      });
    }

    // Update mood
    moodRecord.manualMood = mood;
    moodRecord.intensity = intensity || moodRecord.intensity;
    moodRecord.isVerified = true;
    moodRecord.verifiedAt = new Date();

    await moodRecord.save();

    // Update journal entry mood
    await JournalEntry.findByIdAndUpdate(moodRecord.entry, {
      'mood.manual': mood
    });

    res.json({
      status: 'success',
      message: 'Mood updated successfully',
      data: {
        mood: moodRecord
      }
    });

  } catch (error) {
    console.error('Update mood error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating mood'
    });
  }
});

// @route   GET /api/mood/current
// @desc    Get current mood based on recent entries
// @access  Private
router.get('/current', protect, async (req, res) => {
  try {
    // Get mood from last 7 days
    const recentMoods = await Mood.find({
      user: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(10);

    if (recentMoods.length === 0) {
      return res.json({
        status: 'success',
        data: {
          currentMood: 'neutral',
          confidence: 0,
          trend: 'stable',
          recommendation: 'Start journaling to track your mood patterns!'
        }
      });
    }

    // Calculate average mood
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

    const avgIntensity = totalIntensity / recentMoods.length;

    // Determine trend
    const firstHalf = recentMoods.slice(0, Math.ceil(recentMoods.length / 2));
    const secondHalf = recentMoods.slice(Math.ceil(recentMoods.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, mood) => sum + mood.intensity, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, mood) => sum + mood.intensity, 0) / secondHalf.length;

    let trend = 'stable';
    if (secondHalfAvg > firstHalfAvg + 1) trend = 'improving';
    else if (secondHalfAvg < firstHalfAvg - 1) trend = 'declining';

    // Generate recommendation
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

    res.json({
      status: 'success',
      data: {
        currentMood: mostFrequentMood,
        confidence: moodCounts[mostFrequentMood] / recentMoods.length,
        intensity: avgIntensity,
        trend,
        recommendation: recommendations[mostFrequentMood],
        recentMoods: recentMoods.slice(0, 5).map(mood => ({
          mood: mood.manualMood || mood.detectedMood,
          intensity: mood.intensity,
          date: mood.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get current mood error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching current mood'
    });
  }
});

module.exports = router;

