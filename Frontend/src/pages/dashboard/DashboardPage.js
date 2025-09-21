import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useMood } from '../../contexts/MoodContext';
import StreakTracker from '../../components/gamification/StreakTracker';
import BadgeSystem from '../../components/gamification/BadgeSystem';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled(motion.section)`
  background: var(--gradient-primary);
  color: white;
  padding: var(--spacing-8);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-8);
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-heading);
`;

const WelcomeSubtitle = styled.p`
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin-bottom: var(--spacing-6);
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-6);
`;

const QuickActionButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
`;

const StatCard = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  text-align: center;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto var(--spacing-4);
  color: white;
`;

const StatValue = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-2);
`;

const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
`;

const MoodSection = styled(motion.section)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-8);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-heading);
`;

const MoodCard = styled.div`
  background: ${props => props.moodColor || 'var(--color-surface-variant)'};
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
`;

const MoodEmoji = styled.div`
  font-size: 32px;
`;

const MoodInfo = styled.div`
  flex: 1;
`;

const MoodType = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-1);
`;

const MoodDescription = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const RecentEntries = styled(motion.section)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
`;

const EntryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const EntryItem = styled.div`
  background: var(--color-surface-variant);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  border-left: 4px solid var(--color-primary);
`;

const EntryTitle = styled.h3`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-2);
`;

const EntryDate = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
`;

const DashboardPage = () => {
  const { user } = useAuth();
  const { currentMood, getMoodColor, getMoodEmoji, getMoodDescription, fetchCurrentMood } = useMood();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [recentEntries, setRecentEntries] = useState([]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery(
    ['dashboard-stats'],
    async () => {
      const response = await axios.get('/api/dashboard/stats');
      return response.data.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  useEffect(() => {
    if (dashboardData?.recentJournalEntries) {
      setRecentEntries(dashboardData.recentJournalEntries);
    }
  }, [dashboardData]);

  // Fetch current mood when dashboard loads and refresh periodically
  useEffect(() => {
    if (user) {
      fetchCurrentMood();
      // Refresh mood data every 30 seconds to get latest updates
      const interval = setInterval(() => {
        fetchCurrentMood();
        queryClient.invalidateQueries(['current-mood']);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, fetchCurrentMood, queryClient]);

  // Derive display mood, preferring the most recent journal entry's mood
  const latestEntryMood = (dashboardData?.recentJournalEntries && dashboardData.recentJournalEntries[0]?.mood) || null;
  const contextMood = (typeof currentMood === 'string' ? currentMood : currentMood?.currentMood) || null;
  const statsMood = dashboardData?.currentMood?.mood || null;
  const displayMood = latestEntryMood || contextMood || statsMood || 'neutral';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'new-entry':
        // Navigate to journal page with new entry mode
        navigate('/journal?new=true');
        break;
      case 'mood-check':
        navigate('/mood');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        break;
    }
  };

  const createQuickEntry = async (title, content) => {
    try {
      const response = await axios.post('/api/journal/entries', {
        title,
        content,
        tags: [],
        mood: 'neutral',
        intensity: 5
      });
      
      if (response.data.status === 'success') {
        toast.success('Entry created successfully!');
        // Refresh dashboard data
        queryClient.invalidateQueries(['dashboard-stats']);
      }
    } catch (error) {
      toast.error('Failed to create entry');
      console.error('Quick entry creation error:', error);
    }
  };

  return (
    <DashboardContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WelcomeTitle>
          {getGreeting()}, {user?.firstName}! 👋
        </WelcomeTitle>
        <WelcomeSubtitle>
          Welcome back to your digital companion. How are you feeling today?
        </WelcomeSubtitle>
        
        <QuickActions>
          <QuickActionButton
            onClick={() => handleQuickAction('new-entry')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✍️ New Entry
          </QuickActionButton>
          <QuickActionButton
            onClick={() => handleQuickAction('mood-check')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            😊 Mood Check
          </QuickActionButton>
          <QuickActionButton
            onClick={() => handleQuickAction('analytics')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📊 View Analytics
          </QuickActionButton>
        </QuickActions>
      </WelcomeSection>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatIcon>📝</StatIcon>
          <StatValue>{dashboardData?.totalEntries || 0}</StatValue>
          <StatLabel>Total Entries</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatIcon>🔥</StatIcon>
          <StatValue>{dashboardData?.currentStreak || 0}</StatValue>
          <StatLabel>Current Streak</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatIcon>🏆</StatIcon>
          <StatValue>{dashboardData?.longestStreak || 0}</StatValue>
          <StatLabel>Longest Streak</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <StatIcon>🎯</StatIcon>
          <StatValue>{dashboardData?.recentEntries || 0}</StatValue>
          <StatLabel>Recent Entries</StatLabel>
        </StatCard>
      </StatsGrid>

      <MoodSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <SectionTitle>Current Mood</SectionTitle>
        <MoodCard moodColor={getMoodColor(displayMood)}>
          <MoodEmoji>{getMoodEmoji(displayMood)}</MoodEmoji>
          <MoodInfo>
            <MoodType>
              {displayMood?.charAt(0).toUpperCase() + displayMood?.slice(1)}
            </MoodType>
            <MoodDescription>
              {(typeof currentMood === 'object' ? currentMood?.recommendation : null) || 
               dashboardData?.currentMood?.recommendation || 
               getMoodDescription(displayMood)}
            </MoodDescription>
          </MoodInfo>
        </MoodCard>
      </MoodSection>

      <RecentEntries
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <SectionTitle>Recent Entries</SectionTitle>
        <EntryList>
          {recentEntries && recentEntries.length > 0 ? (
            recentEntries.map((entry) => (
              <EntryItem key={entry.id}>
                <EntryTitle>{entry.title}</EntryTitle>
                <EntryDate>{new Date(entry.createdAt).toLocaleDateString()}</EntryDate>
              </EntryItem>
            ))
          ) : (
            <EmptyState>
              <EmptyIcon>📖</EmptyIcon>
              <h3>No entries yet</h3>
              <p>Start your journaling journey by creating your first entry!</p>
            </EmptyState>
          )}
        </EntryList>
      </RecentEntries>

      <StreakTracker />

      <BadgeSystem />
    </DashboardContainer>
  );
};

export default DashboardPage;
