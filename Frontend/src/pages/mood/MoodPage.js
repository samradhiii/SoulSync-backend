import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useMood } from '../../contexts/MoodContext';
import { useAuth } from '../../contexts/AuthContext';

const MoodContainer = styled.div`
  padding: var(--spacing-6);
  max-width: 800px;
  margin: 0 auto;
`;

const MoodHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-6);
`;

const MoodTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
`;

const MoodSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-4);
`;

const CurrentMoodCard = styled(motion.div)`
  background: var(--surface-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-md);
  text-align: center;
`;

const MoodEmoji = styled.div`
  font-size: 4rem;
  margin-bottom: var(--spacing-3);
`;

const MoodName = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
  text-transform: capitalize;
`;

const MoodDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-4);
`;

const MoodIntensity = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
`;

const IntensityBar = styled.div`
  width: 200px;
  height: 8px;
  background: var(--surface-secondary);
  border-radius: 4px;
  overflow: hidden;
`;

const IntensityFill = styled.div`
  height: 100%;
  background: ${props => props.color || 'var(--primary-500)'};
  width: ${props => props.intensity * 10}%;
  transition: width 0.3s ease;
`;

const MoodActions = styled.div`
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  padding: var(--spacing-3) var(--spacing-4);
  border: none;
  border-radius: var(--border-radius-md);
  background: var(--primary-500);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-600);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MoodHistorySection = styled.div`
  margin-top: var(--spacing-6);
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-4);
`;

const MoodHistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-4);
`;

const MoodHistoryCard = styled(motion.div)`
  background: var(--surface-primary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-sm);
`;

const HistoryDate = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2);
`;

const HistoryMood = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-weight: 500;
  color: var(--text-primary);
  text-transform: capitalize;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: var(--spacing-6);
  color: var(--text-secondary);
`;

const MoodPage = () => {
  const { user } = useAuth();
  const { currentMood, getMoodColor, getMoodEmoji, getMoodDescription } = useMood();
  const queryClient = useQueryClient();

  // Fetch current mood
  const { data: currentMoodData, isLoading: moodLoading } = useQuery(
    ['current-mood'],
    async () => {
      const response = await axios.get('/api/mood/current');
      return response.data.data;
    },
    {
      enabled: !!user,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch dashboard stats to access most recent journal entry mood (for freshness)
  const { data: dashboardData } = useQuery(
    ['dashboard-stats'],
    async () => {
      const response = await axios.get('/api/dashboard/stats');
      return response.data.data;
    },
    {
      enabled: !!user,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch mood history
  const { data: moodHistory, isLoading: historyLoading } = useQuery(
    ['mood-history'],
    async () => {
      const response = await axios.get('/api/mood/trend?days=7');
      return response.data.data.trend;
    },
    {
      enabled: !!user,
      refetchOnWindowFocus: false,
    }
  );

  const handleMoodCheck = () => {
    toast.success('Mood check initiated! Write a journal entry to detect your current mood.');
    // Navigate to journal page or show mood input
    window.location.href = '/journal';
  };

  const handleViewAnalytics = () => {
    window.location.href = '/analytics';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (moodLoading) {
    return (
      <MoodContainer>
        <LoadingState>Loading your mood data...</LoadingState>
      </MoodContainer>
    );
  }

  const latestEntryMood = dashboardData?.recentJournalEntries?.[0]?.mood || null;
  const displayMood = latestEntryMood || currentMoodData?.currentMood || currentMood || 'neutral';
  const intensity = currentMoodData?.intensity || 5;
  const moodColor = getMoodColor(displayMood);

  return (
    <MoodContainer>
      <MoodHeader>
        <MoodTitle>Your Mood Journey</MoodTitle>
        <MoodSubtitle>
          Track and understand your emotional patterns over time
        </MoodSubtitle>
      </MoodHeader>

      <CurrentMoodCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MoodEmoji>{getMoodEmoji(displayMood)}</MoodEmoji>
        <MoodName>{displayMood}</MoodName>
        <MoodDescription>
          {currentMoodData?.recommendation || getMoodDescription(displayMood)}
        </MoodDescription>
        
        <MoodIntensity>
          <span>Intensity:</span>
          <IntensityBar>
            <IntensityFill intensity={intensity} color={moodColor} />
          </IntensityBar>
          <span>{intensity}/10</span>
        </MoodIntensity>

        <MoodActions>
          <ActionButton
            onClick={handleMoodCheck}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📝 New Mood Check
          </ActionButton>
          <ActionButton
            onClick={handleViewAnalytics}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📊 View Analytics
          </ActionButton>
        </MoodActions>
      </CurrentMoodCard>

      <MoodHistorySection>
        <SectionTitle>Recent Mood History</SectionTitle>
        
        {historyLoading ? (
          <LoadingState>Loading mood history...</LoadingState>
        ) : moodHistory && moodHistory.length > 0 ? (
          <MoodHistoryGrid>
            {moodHistory.slice(0, 6).map((entry, index) => (
              <MoodHistoryCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <HistoryDate>{formatDate(entry.date)}</HistoryDate>
                <HistoryMood>
                  <span>{getMoodEmoji(entry.mood)}</span>
                  <span>{entry.mood}</span>
                </HistoryMood>
              </MoodHistoryCard>
            ))}
          </MoodHistoryGrid>
        ) : (
          <LoadingState>
            No mood history yet. Start journaling to track your moods!
          </LoadingState>
        )}
      </MoodHistorySection>
    </MoodContainer>
  );
};

export default MoodPage;
