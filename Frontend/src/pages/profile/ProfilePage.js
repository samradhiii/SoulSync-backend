import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useMood } from '../../contexts/MoodContext';
import axios from 'axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
`;

const Title = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-6);
  font-family: var(--font-family-heading);
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-6);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled(motion.div)`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  font-weight: var(--font-weight-bold);
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-1);
`;

const UserEmail = styled.p`
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-2);
`;

const JoinDate = styled.p`
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
`;

const StatCard = styled.div`
  text-align: center;
  padding: var(--spacing-4);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
`;

const StatValue = styled.div`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-1);
`;

const StatLabel = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Section = styled.div`
  margin-bottom: var(--spacing-6);
`;

const SectionTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--color-border);
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
`;

const InfoValue = styled.span`
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
`;

const Badge = styled.span`
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  margin-right: var(--spacing-2);
  margin-bottom: var(--spacing-2);
`;

const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
`;

const MoodChart = styled.div`
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border);
`;

const MoodBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-3);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MoodLabel = styled.span`
  width: 80px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: capitalize;
`;

const MoodProgress = styled.div`
  flex: 1;
  height: 8px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin: 0 var(--spacing-3);
  overflow: hidden;
`;

const MoodFill = styled.div`
  height: 100%;
  background: ${props => props.color || 'var(--color-primary)'};
  width: ${props => props.percentage}%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
`;

const MoodCount = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  min-width: 30px;
  text-align: right;
`;

const ProfilePage = () => {
  const { user } = useAuth();
  const { moodHistory } = useMood();

  // Fetch user stats with auto-refresh
  const { data: stats, isLoading: loading, refetch } = useQuery(
    ['user-stats'],
    async () => {
      const response = await axios.get('/api/user/stats');
      return response.data.data;
    },
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0,
      cacheTime: 0,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Force refetch when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMoodDistribution = () => {
    if (!moodHistory || moodHistory.length === 0) return {};
    
    const distribution = {};
    moodHistory.forEach(entry => {
      const mood = entry.mood || 'neutral';
      distribution[mood] = (distribution[mood] || 0) + 1;
    });
    
    return distribution;
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#10B981',
      sad: '#6366F1',
      angry: '#EF4444',
      anxious: '#F59E0B',
      excited: '#EC4899',
      calm: '#06B6D4',
      grateful: '#8B5CF6',
      lonely: '#6B7280',
      confused: '#F97316',
      neutral: '#9CA3AF'
    };
    return colors[mood] || colors.neutral;
  };

  if (loading) {
    return (
      <Container>
        <Title>Profile</Title>
        <div>Loading...</div>
      </Container>
    );
  }

  const moodDistribution = getMoodDistribution();
  const totalMoods = Object.values(moodDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <Container>
      <Title>Profile</Title>
      
      <ProfileGrid>
        <ProfileCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProfileHeader>
            <Avatar>{getUserInitials()}</Avatar>
            <UserInfo>
              <UserName>{user?.firstName} {user?.lastName}</UserName>
              <UserEmail>{user?.email}</UserEmail>
              <JoinDate>Joined {formatDate(user?.createdAt)}</JoinDate>
            </UserInfo>
          </ProfileHeader>

          <Section>
            <SectionTitle>Account Information</SectionTitle>
            <InfoItem>
              <InfoLabel>Username</InfoLabel>
              <InfoValue>{user?.username}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Last Login</InfoLabel>
              <InfoValue>{formatDate(user?.lastLogin)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Account Status</InfoLabel>
              <InfoValue>{user?.isActive ? 'Active' : 'Inactive'}</InfoValue>
            </InfoItem>
          </Section>

          <Section>
            <SectionTitle>Achievements</SectionTitle>
            <BadgesContainer>
              {loading ? (
                <InfoValue>Loading badges...</InfoValue>
              ) : stats?.badges?.length > 0 ? (
                stats.badges.map((badge, index) => (
                  <Badge key={index}>{badge.replace('_', ' ').toUpperCase()}</Badge>
                ))
              ) : (
                <InfoValue>No badges earned yet</InfoValue>
              )}
            </BadgesContainer>
          </Section>
        </ProfileCard>

        <ProfileCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Section>
            <SectionTitle>Journal Statistics</SectionTitle>
            <StatsGrid>
              <StatCard>
                <StatValue>{loading ? '...' : (stats?.totalEntries ?? 0)}</StatValue>
                <StatLabel>Total Entries</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{loading ? '...' : (stats?.currentStreak ?? 0)}</StatValue>
                <StatLabel>Current Streak</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{loading ? '...' : (stats?.longestStreak ?? 0)}</StatValue>
                <StatLabel>Longest Streak</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{Object.keys(moodDistribution).length}</StatValue>
                <StatLabel>Mood Types</StatLabel>
              </StatCard>
            </StatsGrid>
          </Section>

          <Section>
            <SectionTitle>Mood Distribution</SectionTitle>
            <MoodChart>
              {Object.entries(moodDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([mood, count]) => (
                  <MoodBar key={mood}>
                    <MoodLabel>{mood}</MoodLabel>
                    <MoodProgress>
                      <MoodFill 
                        color={getMoodColor(mood)}
                        percentage={(count / totalMoods) * 100}
                      />
                    </MoodProgress>
                    <MoodCount>{count}</MoodCount>
                  </MoodBar>
                ))}
              {totalMoods === 0 && (
                <InfoValue>No mood data available yet</InfoValue>
              )}
            </MoodChart>
          </Section>
        </ProfileCard>
      </ProfileGrid>
    </Container>
  );
};

export default ProfilePage;

