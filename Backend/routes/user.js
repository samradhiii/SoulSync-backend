const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  validateProfileUpdate,
  validatePasswordChange
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, (req, res) => {
  res.json({
    status: 'success',
    data: {
      user: req.user.getProfile()
    }
  });
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, async (req, res) => {
  try {
    const { firstName, lastName, username, preferences } = req.body;
    const user = req.user;

    // Check if username is already taken (if changed)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Username is already taken'
        });
      }
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (username) user.username = username;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: user.getProfile()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/user/password
// @desc    Change user password
// @access  Private
router.put('/password', protect, validatePasswordChange, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while changing password'
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const password = (req.body && req.body.password)
      || (req.query && req.query.password)
      || req.headers['x-account-password'];

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Incorrect password'
      });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    // Make email valid by appending "+deleted<shortTs>" to local-part
    try {
      const [local, domain] = user.email.split('@');
      const shortTs = Date.now().toString().slice(-6);
      const newLocal = `${local}+deleted${shortTs}`;
      user.email = `${newLocal}@${domain}`;
    } catch (_) {
      user.email = `deleted+${Date.now()}@example.com`;
    }
    // Keep username under 30 chars
    const unamePrefix = `deleted_`;
    const ts = Date.now().toString().slice(-6);
    user.username = `${unamePrefix}${ts}`; // compact, guaranteed < 30
    await user.save();

    res.json({
      status: 'success',
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting account'
    });
  }
});

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('stats createdAt');
    const JournalEntry = require('../models/JournalEntry');

    // Get actual entry count from database
    const actualEntryCount = await JournalEntry.countDocuments({
      user: req.user._id,
      isDeleted: false
    });

    // Update user stats if they don't match
    if (user.stats.totalEntries !== actualEntryCount) {
      user.stats.totalEntries = actualEntryCount;
      await user.save();
    }

    // Recalculate streaks based on actual entries
    const entries = await JournalEntry.find({
      user: req.user._id,
      isDeleted: false
    }).sort({ createdAt: -1 }).select('createdAt');

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (entries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if there's an entry today or yesterday to start counting
      const latestEntry = new Date(entries[0].createdAt);
      latestEntry.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - latestEntry) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) { // Entry today or yesterday
        const entryDates = new Set();
        entries.forEach(entry => {
          const entryDate = new Date(entry.createdAt);
          entryDate.setHours(0, 0, 0, 0);
          entryDates.add(entryDate.getTime());
        });
        
        const sortedDates = Array.from(entryDates).sort((a, b) => b - a);
        
        // Calculate current streak
        let checkDate = new Date(today);
        if (daysDiff === 1) checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday if no entry today
        
        for (let i = 0; i < sortedDates.length; i++) {
          if (sortedDates[i] === checkDate.getTime()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        // Calculate longest streak
        tempStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = sortedDates[i-1];
          const currDate = sortedDates[i];
          const daysBetween = (prevDate - currDate) / (1000 * 60 * 60 * 24);
          
          if (daysBetween === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }
    }

    // Update streaks in database
    user.stats.currentStreak = currentStreak;
    user.stats.longestStreak = Math.max(longestStreak, user.stats.longestStreak);

    // Award badges based on achievements
    const newBadges = [];
    
    // First entry badge
    if (user.stats.totalEntries >= 1 && !user.stats.badges.includes('first_entry')) {
      newBadges.push('first_entry');
    }
    
    // Week streak badge
    if (user.stats.currentStreak >= 7 && !user.stats.badges.includes('week_streak')) {
      newBadges.push('week_streak');
    }
    
    // Month streak badge
    if (user.stats.currentStreak >= 30 && !user.stats.badges.includes('month_streak')) {
      newBadges.push('month_streak');
    }
    
    // Year streak badge
    if (user.stats.currentStreak >= 365 && !user.stats.badges.includes('year_streak')) {
      newBadges.push('year_streak');
    }
    
    // Mood tracker badge
    if (user.stats.totalEntries >= 10 && !user.stats.badges.includes('mood_tracker')) {
      newBadges.push('mood_tracker');
    }
    
    // Reflection master badge
    if (user.stats.totalEntries >= 50 && !user.stats.badges.includes('reflection_master')) {
      newBadges.push('reflection_master');
    }
    
    // Consistency king badge
    if (user.stats.totalEntries >= 100 && !user.stats.badges.includes('consistency_king')) {
      newBadges.push('consistency_king');
    }
    
    // Add new badges to user
    if (newBadges.length > 0) {
      user.stats.badges.push(...newBadges);
    }

    await user.save();

    // Calculate additional stats
    const daysSinceJoined = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const consistency = user.stats.totalEntries > 0 
      ? Math.round((user.stats.totalEntries / Math.max(daysSinceJoined, 1)) * 100) / 100
      : 0;

    res.json({
      status: 'success',
      data: {
        totalEntries: user.stats.totalEntries,
        currentStreak: user.stats.currentStreak,
        longestStreak: user.stats.longestStreak,
        badges: user.stats.badges,
        additional: {
          daysSinceJoined,
          consistency,
          averageEntriesPerDay: consistency
        }
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user statistics'
    });
  }
});

// @route   GET /api/user/badges
// @desc    Get user badges and achievements
// @access  Private
router.get('/badges', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('stats createdAt');

    const allBadges = [
      {
        id: 'first_entry',
        name: 'First Steps',
        description: 'Write your first journal entry',
        icon: '📝',
        earned: user.stats.badges.includes('first_entry'),
        earnedAt: user.stats.totalEntries > 0 ? user.createdAt : null
      },
      {
        id: 'week_streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day writing streak',
        icon: '🔥',
        earned: user.stats.badges.includes('week_streak'),
        earnedAt: user.stats.currentStreak >= 7 ? new Date() : null
      },
      {
        id: 'month_streak',
        name: 'Monthly Master',
        description: 'Maintain a 30-day writing streak',
        icon: '🏆',
        earned: user.stats.badges.includes('month_streak'),
        earnedAt: user.stats.currentStreak >= 30 ? new Date() : null
      },
      {
        id: 'year_streak',
        name: 'Year Champion',
        description: 'Maintain a 365-day writing streak',
        icon: '👑',
        earned: user.stats.badges.includes('year_streak'),
        earnedAt: user.stats.currentStreak >= 365 ? new Date() : null
      },
      {
        id: 'mood_tracker',
        name: 'Mood Master',
        description: 'Track your mood for 10 entries',
        icon: '😊',
        earned: user.stats.badges.includes('mood_tracker'),
        earnedAt: user.stats.totalEntries >= 10 ? new Date() : null
      },
      {
        id: 'reflection_master',
        name: 'Reflection Master',
        description: 'Write 50 reflective entries',
        icon: '🧠',
        earned: user.stats.badges.includes('reflection_master'),
        earnedAt: user.stats.totalEntries >= 50 ? new Date() : null
      },
      {
        id: 'consistency_king',
        name: 'Consistency King',
        description: 'Write consistently for 100 days',
        icon: '📅',
        earned: user.stats.badges.includes('consistency_king'),
        earnedAt: user.stats.totalEntries >= 100 ? new Date() : null
      }
    ];

    const earnedBadges = allBadges.filter(badge => badge.earned);
    const availableBadges = allBadges.filter(badge => !badge.earned);

    res.json({
      status: 'success',
      data: {
        earned: earnedBadges,
        available: availableBadges,
        totalEarned: earnedBadges.length,
        totalAvailable: allBadges.length
      }
    });

  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching badges'
    });
  }
});

// @route   POST /api/user/avatar
// @desc    Update user avatar
// @access  Private
router.post('/avatar', protect, async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Avatar URL is required'
      });
    }

    // Basic URL validation
    try {
      new URL(avatarUrl);
    } catch {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid avatar URL'
      });
    }

    const user = req.user;
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      status: 'success',
      message: 'Avatar updated successfully',
      data: {
        user: user.getProfile()
      }
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating avatar'
    });
  }
});

module.exports = router;

