import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const StreakContainer = styled.div`
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  color: white;
  margin-bottom: var(--spacing-6);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    animation: shine 3s infinite;
  }

  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const StreakHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
`;

const StreakIcon = styled.div`
  font-size: 32px;
  animation: ${props => props.isActive ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const StreakTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-heading);
`;

const StreakStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-4);
`;

const StatItem = styled(motion.div)`
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  backdrop-filter: blur(10px);
`;

const StatValue = styled.div`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-1);
`;

const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  opacity: 0.9;
`;

const StreakMessage = styled.div`
  margin-top: var(--spacing-4);
  padding: var(--spacing-3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  text-align: center;
  backdrop-filter: blur(10px);
`;

const MotivationalMessage = styled.div`
  font-size: var(--font-size-sm);
  font-style: italic;
  opacity: 0.9;
  margin-top: var(--spacing-2);
`;

const StreakTracker = () => {
  const { user } = useAuth();

  const currentStreak = user?.stats?.currentStreak || 0;
  const longestStreak = user?.stats?.longestStreak || 0;
  const totalEntries = user?.stats?.totalEntries || 0;

  const getStreakMessage = (streak) => {
    if (streak === 0) {
      return "Start your journaling journey today!";
    } else if (streak === 1) {
      return "Great start! Keep it going!";
    } else if (streak < 7) {
      return "You're building momentum!";
    } else if (streak < 30) {
      return "Amazing consistency!";
    } else if (streak < 100) {
      return "You're a journaling champion!";
    } else {
      return "Legendary dedication!";
    }
  };

  const getMotivationalMessage = (streak) => {
    const messages = [
      "Every entry is a step towards self-discovery",
      "Your thoughts matter - keep writing them down",
      "Consistency is the key to growth",
      "You're building a beautiful habit",
      "Your future self will thank you",
      "Every word you write is progress",
      "Journaling is self-care in action",
      "You're creating a legacy of reflection"
    ];
    
    return messages[streak % messages.length];
  };

  const getStreakIcon = (streak) => {
    if (streak === 0) return '📝';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🔥🔥';
    if (streak < 30) return '🔥🔥🔥';
    if (streak < 100) return '🏆';
    return '👑';
  };

  const isStreakActive = currentStreak > 0;

  return (
    <StreakContainer>
      <StreakHeader>
        <StreakIcon isActive={isStreakActive}>
          {getStreakIcon(currentStreak)}
        </StreakIcon>
        <StreakTitle>Writing Streak</StreakTitle>
      </StreakHeader>

      <StreakStats>
        <StatItem
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatValue>{currentStreak}</StatValue>
          <StatLabel>Current Streak</StatLabel>
        </StatItem>

        <StatItem
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatValue>{longestStreak}</StatValue>
          <StatLabel>Longest Streak</StatLabel>
        </StatItem>

        <StatItem
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatValue>{totalEntries}</StatValue>
          <StatLabel>Total Entries</StatLabel>
        </StatItem>
      </StreakStats>

      <StreakMessage>
        {getStreakMessage(currentStreak)}
        <MotivationalMessage>
          {getMotivationalMessage(currentStreak)}
        </MotivationalMessage>
      </StreakMessage>
    </StreakContainer>
  );
};

export default StreakTracker;

