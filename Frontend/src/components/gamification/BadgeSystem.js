import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const BadgeContainer = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
`;

const Title = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-heading);
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-4);
`;

const Badge = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border: 2px solid ${props => props.earned ? '#6366f1' : 'var(--color-border)'};
  background: ${props => props.earned ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'var(--color-background)'};
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.earned ? '0 4px 15px rgba(99, 102, 241, 0.25)' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.earned ? '0 6px 20px rgba(99, 102, 241, 0.35)' : 'var(--shadow-md)'};
  }

  &.earned {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border-color: #6366f1;
  }

  &.earned::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
    animation: shine 3s infinite;
  }

  &.earned::after {
    content: '✓';
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(255, 255, 255, 0.9);
    color: #6366f1;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const BadgeIcon = styled.div`
  font-size: 32px;
  opacity: ${props => props.earned ? 1 : 0.3};
  filter: ${props => props.earned ? 'none' : 'grayscale(100%)'};
`;

const BadgeName = styled.div`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-align: center;
  color: ${props => props.earned ? 'white' : 'var(--color-text-secondary)'};
`;

const BadgeDescription = styled.div`
  font-size: var(--font-size-xs);
  color: ${props => props.earned ? 'rgba(255, 255, 255, 0.8)' : 'var(--color-text-muted)'};
  text-align: center;
  margin-top: var(--spacing-1);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--spacing-2);
`;

const ProgressFill = styled.div`
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
  width: ${props => props.progress}%;
`;

const BadgeModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
`;

const ModalContent = styled(motion.div)`
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-8);
  max-width: 400px;
  width: 100%;
  text-align: center;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);

  &:hover {
    background: var(--color-surface-variant);
  }
`;

const ModalIcon = styled.div`
  font-size: 64px;
  margin-bottom: var(--spacing-4);
`;

const ModalTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-2);
  font-family: var(--font-family-heading);
`;

const ModalDescription = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-4);
`;

const ModalProgress = styled.div`
  background: var(--color-surface-variant);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-4);
`;

const ProgressText = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2);
`;

const BadgeSystem = () => {
  const { user } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Fetch user badges (result not directly used; triggers refetching and cache)
  useQuery(
    'user-badges',
    async () => {
      const response = await axios.get('/api/user/badges');
      return response.data.data;
    },
    {
      enabled: !!user
    }
  );

  const badges = [
    {
      id: 'first_entry',
      name: 'First Steps',
      icon: '📝',
      description: 'Write your first journal entry',
      requirement: 1,
      category: 'milestone'
    },
    {
      id: 'week_streak',
      name: 'Week Warrior',
      icon: '🔥',
      description: 'Maintain a 7-day writing streak',
      requirement: 7,
      category: 'streak'
    },
    {
      id: 'month_streak',
      name: 'Monthly Master',
      icon: '🏆',
      description: 'Maintain a 30-day writing streak',
      requirement: 30,
      category: 'streak'
    },
    {
      id: 'year_streak',
      name: 'Year Champion',
      icon: '👑',
      description: 'Maintain a 365-day writing streak',
      requirement: 365,
      category: 'streak'
    },
    {
      id: 'mood_tracker',
      name: 'Mood Master',
      icon: '😊',
      description: 'Track your mood for 10 entries',
      requirement: 10,
      category: 'mood'
    },
    {
      id: 'reflection_master',
      name: 'Reflection Master',
      icon: '🧠',
      description: 'Write 50 reflective entries',
      requirement: 50,
      category: 'milestone'
    },
    {
      id: 'consistency_king',
      name: 'Consistency King',
      icon: '📅',
      description: 'Write consistently for 100 days',
      requirement: 100,
      category: 'consistency'
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      icon: '🌅',
      description: 'Write 10 entries before 8 AM',
      requirement: 10,
      category: 'time'
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      icon: '🦉',
      description: 'Write 10 entries after 10 PM',
      requirement: 10,
      category: 'time'
    },
    {
      id: 'weekend_warrior',
      name: 'Weekend Warrior',
      icon: '🎯',
      description: 'Write 20 entries on weekends',
      requirement: 20,
      category: 'time'
    }
  ];

  const getBadgeProgress = (badgeId) => {
    if (!user?.stats) return 0;
    
    switch (badgeId) {
      case 'first_entry':
        return user.stats.totalEntries >= 1 ? 100 : 0;
      case 'week_streak':
        return Math.min((user.stats.currentStreak / 7) * 100, 100);
      case 'month_streak':
        return Math.min((user.stats.currentStreak / 30) * 100, 100);
      case 'year_streak':
        return Math.min((user.stats.currentStreak / 365) * 100, 100);
      case 'mood_tracker':
        return Math.min((user.stats.totalEntries / 10) * 100, 100);
      case 'reflection_master':
        return Math.min((user.stats.totalEntries / 50) * 100, 100);
      case 'consistency_king':
        return Math.min((user.stats.totalEntries / 100) * 100, 100);
      default:
        return 0;
    }
  };

  const isBadgeEarned = (badgeId) => {
    // Check if badge is earned based on progress
    const progress = getBadgeProgress(badgeId);
    return progress >= 100;
  };

  // helper removed (unused): getBadgeById

  return (
    <BadgeContainer>
      <Title>Achievements & Badges</Title>
      <BadgeGrid>
        {badges.map((badge) => {
          const earned = isBadgeEarned(badge.id);
          const progress = getBadgeProgress(badge.id);
          
          return (
            <Badge
              key={badge.id}
              earned={earned}
              className={earned ? 'earned' : ''}
              onClick={() => setSelectedBadge(badge)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BadgeIcon earned={earned}>{badge.icon}</BadgeIcon>
              <BadgeName earned={earned}>{badge.name}</BadgeName>
              <BadgeDescription earned={earned}>
                {badge.description}
              </BadgeDescription>
              {!earned && (
                <ProgressBar>
                  <ProgressFill progress={progress} />
                </ProgressBar>
              )}
            </Badge>
          );
        })}
      </BadgeGrid>

      <AnimatePresence>
        {selectedBadge && (
          <BadgeModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton onClick={() => setSelectedBadge(null)}>
                ×
              </CloseButton>
              
              <ModalIcon>{selectedBadge.icon}</ModalIcon>
              <ModalTitle>{selectedBadge.name}</ModalTitle>
              <ModalDescription>{selectedBadge.description}</ModalDescription>
              
              {!isBadgeEarned(selectedBadge.id) && (
                <ModalProgress>
                  <ProgressText>
                    Progress: {Math.round(getBadgeProgress(selectedBadge.id))}%
                  </ProgressText>
                  <ProgressBar>
                    <ProgressFill progress={getBadgeProgress(selectedBadge.id)} />
                  </ProgressBar>
                </ModalProgress>
              )}
            </ModalContent>
          </BadgeModal>
        )}
      </AnimatePresence>
    </BadgeContainer>
  );
};

export default BadgeSystem;

