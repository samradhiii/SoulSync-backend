const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const Mood = require('../models/Mood');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get comprehensive analytics dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get journal statistics
    const journalStats = await JournalEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          isDeleted: false,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          avgWordsPerEntry: { $avg: '$wordCount' },
          totalReadingTime: { $sum: '$readingTime' },
          entriesByDay: {
            $push: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              words: '$wordCount'
            }
          }
        }
      }
    ]);

    // Get mood analytics
    const moodStats = await Mood.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$detectedMood',
          count: { $sum: 1 },
          avgIntensity: { $avg: '$intensity' },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get mood trend over time
    const moodTrend = await Mood.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            mood: '$detectedMood'
          },
          count: { $sum: 1 },
          avgIntensity: { $avg: '$intensity' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get writing patterns
    const writingPatterns = await JournalEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          isDeleted: false,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            dayOfWeek: { $dayOfWeek: '$createdAt' }
          },
          count: { $sum: 1 },
          avgWords: { $avg: '$wordCount' }
        }
      }
    ]);

    // Get tag analytics
    const tagStats = await JournalEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          isDeleted: false,
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get streak information
    const streakInfo = await User.findById(req.user._id).select('stats');

    res.json({
      status: 'success',
      data: {
        period: `${days} days`,
        journal: {
          totalEntries: journalStats[0]?.totalEntries || 0,
          totalWords: journalStats[0]?.totalWords || 0,
          avgWordsPerEntry: Math.round(journalStats[0]?.avgWordsPerEntry || 0),
          totalReadingTime: journalStats[0]?.totalReadingTime || 0,
          entriesByDay: journalStats[0]?.entriesByDay || []
        },
        mood: {
          distribution: moodStats,
          trend: moodTrend,
          dominantMood: moodStats[0]?._id || 'neutral'
        },
        patterns: {
          writing: writingPatterns,
          tags: tagStats
        },
        streaks: {
          current: streakInfo?.stats?.currentStreak || 0,
          longest: streakInfo?.stats?.longestStreak || 0,
          total: streakInfo?.stats?.totalEntries || 0
        }
      }
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching analytics'
    });
  }
});

// @route   GET /api/analytics/mood-insights
// @desc    Get detailed mood insights and recommendations
// @access  Private
router.get('/mood-insights', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get mood patterns by time of day
    const timePatterns = await Mood.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' }
          },
          moods: { $push: '$detectedMood' },
          avgIntensity: { $avg: '$intensity' }
        }
      },
      {
        $sort: { '_id.hour': 1 }
      }
    ]);

    // Get mood patterns by day of week
    const dayPatterns = await Mood.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$createdAt' }
          },
          moods: { $push: '$detectedMood' },
          avgIntensity: { $avg: '$intensity' }
        }
      }
    ]);

    // Get mood triggers
    const triggers = await Mood.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$triggers'
      },
      {
        $group: {
          _id: '$triggers',
          count: { $sum: 1 },
          moods: { $push: '$detectedMood' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Generate insights
    const insights = [];
    
    // Time-based insights
    if (timePatterns.length > 0) {
      const bestTime = timePatterns.reduce((best, current) => 
        current.avgIntensity > best.avgIntensity ? current : best
      );
      insights.push({
        type: 'time',
        title: 'Best Writing Time',
        description: `You tend to feel most intense emotions around ${bestTime._id.hour}:00`,
        recommendation: 'Consider journaling during this time for deeper insights'
      });
    }

    // Mood trend insights
    const recentMoods = await Mood.find({
      user: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 }).limit(7);

    if (recentMoods.length >= 3) {
      const positiveMoods = ['happy', 'excited', 'calm', 'grateful'];
      const recentPositive = recentMoods.filter(mood => 
        positiveMoods.includes(mood.detectedMood)
      ).length;
      
      if (recentPositive / recentMoods.length > 0.6) {
        insights.push({
          type: 'trend',
          title: 'Positive Trend',
          description: 'You\'ve been experiencing mostly positive emotions recently',
          recommendation: 'Keep up the great work! Consider what\'s contributing to this positivity'
        });
      } else if (recentPositive / recentMoods.length < 0.3) {
        insights.push({
          type: 'trend',
          title: 'Challenging Period',
          description: 'You\'ve been going through a difficult time recently',
          recommendation: 'Consider reaching out to friends, family, or a professional for support'
        });
      }
    }

    res.json({
      status: 'success',
      data: {
        period: `${days} days`,
        patterns: {
          time: timePatterns,
          dayOfWeek: dayPatterns,
          triggers
        },
        insights,
        recommendations: [
          'Try journaling at different times to see when you feel most reflective',
          'Pay attention to what triggers different moods',
          'Consider setting up mood check-ins throughout the day',
          'Use tags to identify patterns in your entries'
        ]
      }
    });

  } catch (error) {
    console.error('Mood insights error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching mood insights'
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export user data for backup
// @access  Private
router.get('/export', protect, async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    // Get all user data
    const user = await User.findById(req.user._id).select('-password');
    const entries = await JournalEntry.find({
      user: req.user._id,
      isDeleted: false
    }).sort({ createdAt: -1 });
    const moods = await Mood.find({ user: req.user._id }).sort({ createdAt: -1 });

    const exportData = {
      user: user.getProfile(),
      entries: entries.map(entry => entry.getPublicEntry()),
      moods,
      exportDate: new Date().toISOString(),
      totalEntries: entries.length,
      totalMoods: moods.length
    };

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="soulsync-export-${timestamp}.json"`);
      res.json(exportData);
    } else if (format === 'csv') {
      // Generate CSV format
      let csvContent = 'Date,Title,Content,Mood,Intensity,Tags,Word Count\n';
      
      entries.forEach(entry => {
        const date = new Date(entry.createdAt).toISOString().split('T')[0];
        const title = `"${(entry.title || '').replace(/"/g, '""')}"`;
        const content = `"${(entry.content || '').replace(/"/g, '""').substring(0, 200)}..."`;
        const mood = entry.mood?.detected || entry.mood?.manual || 'neutral';
        const intensity = entry.mood?.intensity || 0;
        const tags = `"${(entry.tags || []).join(', ')}"`;
        const wordCount = entry.wordCount || 0;
        
        csvContent += `${date},${title},${content},${mood},${intensity},${tags},${wordCount}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="soulsync-export-${timestamp}.csv"`);
      res.send(csvContent);
    } else if (format === 'pdf') {
      // Generate PDF format
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="soulsync-export-${timestamp}.pdf"`);
      
      doc.pipe(res);
      
      // PDF Header
      doc.fontSize(20).text('SoulSync Data Export', 50, 50);
      doc.fontSize(12).text(`Export Date: ${new Date().toLocaleDateString()}`, 50, 80);
      doc.text(`Total Entries: ${entries.length}`, 50, 95);
      doc.text(`Total Moods: ${moods.length}`, 50, 110);
      
      let yPosition = 140;
      
      // User Profile
      doc.fontSize(16).text('User Profile', 50, yPosition);
      yPosition += 25;
      doc.fontSize(10).text(`Name: ${user.firstName} ${user.lastName}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Email: ${user.email}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Username: ${user.username}`, 50, yPosition);
      yPosition += 30;
      
      // Journal Entries
      doc.fontSize(16).text('Journal Entries', 50, yPosition);
      yPosition += 25;
      
      entries.slice(0, 20).forEach((entry, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fontSize(12).text(`Entry ${index + 1}`, 50, yPosition);
        yPosition += 15;
        doc.fontSize(10).text(`Date: ${new Date(entry.createdAt).toLocaleDateString()}`, 50, yPosition);
        yPosition += 12;
        doc.text(`Title: ${entry.title || 'Untitled'}`, 50, yPosition);
        yPosition += 12;
        doc.text(`Mood: ${entry.mood?.detected || entry.mood?.manual || 'neutral'}`, 50, yPosition);
        yPosition += 12;
        doc.text(`Content: ${(entry.content || '').substring(0, 200)}...`, 50, yPosition, {
          width: 500,
          align: 'left'
        });
        yPosition += 40;
      });
      
      if (entries.length > 20) {
        doc.text(`... and ${entries.length - 20} more entries`, 50, yPosition);
      }
      
      doc.end();
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Unsupported export format. Use "json", "csv", or "pdf"'
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while exporting data'
    });
  }
});

module.exports = router;

