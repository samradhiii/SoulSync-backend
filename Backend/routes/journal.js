const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const Mood = require('../models/Mood');
const { protect } = require('../middleware/auth');
const { validateJournalEntry } = require('../middleware/validation');
const moodDetectionService = require('../services/moodDetection');

const router = express.Router();

// @route   POST /api/journal/entries
// @desc    Create a new journal entry
// @access  Private
router.post('/entries', protect, validateJournalEntry, async (req, res) => {
  try {
    const { title, content, tags, isPrivate, mood, intensity } = req.body;

    // Detect mood from content using AI/NLP (with fallback)
    let moodDetection;
    try {
      moodDetection = moodDetectionService.detectMood(content, mood);
    } catch (error) {
      console.log('Mood detection service unavailable, using fallback');
      moodDetection = {
        detected: mood || 'neutral',
        confidence: 0.5,
        manual: mood || 'neutral',
        selfHarmDetected: false,
        analysis: 'Basic mood detection'
      };
    }

    // Create journal entry
    const entry = new JournalEntry({
      user: req.user._id,
      title,
      content,
      tags: tags || [],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      mood: {
        detected: moodDetection.detected,
        confidence: moodDetection.confidence,
        manual: moodDetection.manual
      }
    });

    // Check for self-harm content
    const hasSelfHarm = moodDetection.selfHarmDetected;

    await entry.save();

    // Create mood record
    const moodRecord = new Mood({
      user: req.user._id,
      entry: entry._id,
      detectedMood: moodDetection.detected,
      confidence: moodDetection.confidence,
      manualMood: moodDetection.manual,
      intensity: intensity || 5,
      analysis: moodDetection.analysis
    });

    await moodRecord.save();

    // Update user stats
    await req.user.updateStreak();

    // Mark account active on first journal entry without modifying auth flow
    if (!req.user.isActive) {
      req.user.isActive = true;
      await req.user.save();
    }

    // Prepare response
    const response = {
      status: 'success',
      message: 'Journal entry created successfully',
      data: {
        entry: entry.getPublicEntry(),
        mood: moodRecord,
        securityAlert: hasSelfHarm ? {
          hasSelfHarmContent: true,
          message: 'We noticed some concerning content in your entry. Please remember that help is available.',
          helpline: moodDetectionService.getHelplineInfo()
        } : null
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating journal entry'
    });
  }
});

// @route   GET /api/journal/entries
// @desc    Get all journal entries for user
// @access  Private
router.get('/entries', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, mood, tag, search, sort = 'createdAt' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      user: req.user._id,
      isDeleted: false
    };

    if (mood) {
      query['mood.detected'] = mood;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sortObj = {};
    if (sort === 'createdAt') {
      sortObj.createdAt = -1;
    } else if (sort === 'updatedAt') {
      sortObj.updatedAt = -1;
    } else if (sort === 'title') {
      sortObj.title = 1;
    }

    const entries = await JournalEntry.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('mood');

    const total = await JournalEntry.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        entries: entries.map(entry => entry.getPublicEntry()),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching journal entries'
    });
  }
});

// @route   GET /api/journal/entries/:id
// @desc    Get a specific journal entry
// @access  Private
router.get('/entries/:id', protect, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    }).populate('mood');

    if (!entry) {
      return res.status(404).json({
        status: 'error',
        message: 'Journal entry not found'
      });
    }

    // Update view count
    entry.analytics.views += 1;
    entry.analytics.lastViewed = new Date();
    await entry.save();

    res.json({
      status: 'success',
      data: {
        entry: entry.getPublicEntry()
      }
    });

  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching journal entry'
    });
  }
});

// @route   PUT /api/journal/entries/:id
// @desc    Update a journal entry
// @access  Private
router.put('/entries/:id', protect, validateJournalEntry, async (req, res) => {
  try {
    const { title, content, tags, isPrivate, mood, intensity } = req.body;
    const entryId = req.params.id;
    
    console.log('Updating entry with ID:', entryId, 'for user:', req.user._id);
    
    // Validate ObjectId format - but be more lenient
    if (!entryId || entryId === 'undefined' || entryId === 'null') {
      console.log('Invalid entry ID format:', entryId);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid entry ID format'
      });
    }
    
    const entry = await JournalEntry.findOne({
      _id: entryId,
      user: req.user._id,
      isDeleted: false
    });

    if (!entry) {
      console.log('Entry not found for ID:', entryId);
      return res.status(404).json({
        status: 'error',
        message: 'Journal entry not found'
      });
    }

    // Update entry
    entry.title = title;
    entry.content = content;
    entry.tags = tags || [];
    entry.isPrivate = isPrivate !== undefined ? isPrivate : entry.isPrivate;
    
    // Initialize analytics if it doesn't exist
    if (!entry.analytics) {
      entry.analytics = {
        views: 0,
        editCount: 0,
        lastViewed: null,
        lastEdited: null
      };
    }
    
    entry.analytics.editCount += 1;
    entry.analytics.lastEdited = new Date();

    // Recompute mood based on updated content while preserving manual mood if explicitly provided
    let moodDetection;
    try {
      moodDetection = moodDetectionService.detectMood(content, mood || entry.mood?.manual || null);
    } catch (error) {
      // Fallback in unlikely failure
      moodDetection = {
        detected: mood || entry.mood?.detected || 'neutral',
        confidence: 0.5,
        manual: mood || entry.mood?.manual || null
      };
    }

    entry.mood = {
      detected: moodDetection.detected,
      confidence: moodDetection.confidence,
      manual: moodDetection.manual || null
    };

    if (intensity) {
      entry.intensity = intensity;
    }

    await entry.save();

    // Update or create associated Mood record
    try {
      const existingMood = await Mood.findOne({ user: req.user._id, entry: entry._id });
      if (existingMood) {
        existingMood.detectedMood = moodDetection.detected;
        existingMood.confidence = moodDetection.confidence;
        existingMood.manualMood = moodDetection.manual || null;
        if (intensity) existingMood.intensity = intensity;
        await existingMood.save();
      } else {
        await new Mood({
          user: req.user._id,
          entry: entry._id,
          detectedMood: moodDetection.detected,
          confidence: moodDetection.confidence,
          manualMood: moodDetection.manual || null,
          intensity: intensity || 5
        }).save();
      }
    } catch (moodError) {
      console.warn('Mood record update failed (non-fatal):', moodError.message);
    }

    res.json({
      status: 'success',
      message: 'Journal entry updated successfully',
      data: {
        entry: entry.getPublicEntry()
      }
    });

  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating journal entry'
    });
  }
});

// @route   DELETE /api/journal/entries/:id
// @desc    Delete a journal entry (soft delete)
// @access  Private
router.delete('/entries/:id', protect, async (req, res) => {
  try {
    const entryId = req.params.id;
    
    console.log('Delete request for entry ID:', entryId);
    console.log('User ID:', req.user._id);

    // Validate ObjectId format - but be more lenient
    if (!entryId || entryId === 'undefined' || entryId === 'null') {
      console.log('Invalid entry ID format:', entryId);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid entry ID format'
      });
    }

    const entry = await JournalEntry.findOne({
      _id: entryId,
      user: req.user._id,
      isDeleted: false
    });

    console.log('Found entry:', entry ? 'Yes' : 'No');

    if (!entry) {
      return res.status(404).json({
        status: 'error',
        message: 'Journal entry not found'
      });
    }

    // Soft delete
    entry.isDeleted = true;
    entry.deletedAt = new Date();
    await entry.save();

    // Also delete associated mood record
    await Mood.deleteOne({ entry: entry._id });

    console.log('Entry soft deleted successfully');

    res.json({
      status: 'success',
      message: 'Journal entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete entry error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting journal entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/journal/entries/:id/restore
// @desc    Restore a deleted journal entry
// @access  Private
router.get('/entries/:id/restore', protect, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: true
    });

    if (!entry) {
      return res.status(404).json({
        status: 'error',
        message: 'Deleted journal entry not found'
      });
    }

    await entry.restore();

    res.json({
      status: 'success',
      message: 'Journal entry restored successfully',
      data: {
        entry: entry.getPublicEntry()
      }
    });

  } catch (error) {
    console.error('Restore entry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while restoring journal entry'
    });
  }
});

// @route   GET /api/journal/stats
// @desc    Get journal statistics for user
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await JournalEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          avgWordsPerEntry: { $avg: '$wordCount' },
          totalReadingTime: { $sum: '$readingTime' },
          moodDistribution: {
            $push: '$mood.detected'
          }
        }
      }
    ]);

    const moodStats = await Mood.aggregate([
      {
        $match: {
          user: req.user._id
        }
      },
      {
        $group: {
          _id: '$detectedMood',
          count: { $sum: 1 },
          avgIntensity: { $avg: '$intensity' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        journal: stats[0] || {
          totalEntries: 0,
          totalWords: 0,
          avgWordsPerEntry: 0,
          totalReadingTime: 0
        },
        moodDistribution: moodStats
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/journal/search
// @desc    Search journal entries
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const entries = await JournalEntry.find({
      user: req.user._id,
      isDeleted: false,
      $text: { $search: q }
    })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await JournalEntry.countDocuments({
      user: req.user._id,
      isDeleted: false,
      $text: { $search: q }
    });

    res.json({
      status: 'success',
      data: {
        entries: entries.map(entry => entry.getPublicEntry()),
        query: q,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while searching entries'
    });
  }
});

module.exports = router;
