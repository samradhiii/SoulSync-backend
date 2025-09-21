import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

// Mood-based animations
const happyFloat = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const sadSway = keyframes`
  0%, 100% { transform: translateX(0px); }
  50% { transform: translateX(-5px); }
`;

const angryShake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
`;

const anxiousPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const excitedBounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-7px); }
`;

const calmWave = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

const gratefulGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(50, 205, 50, 0.3); }
  50% { box-shadow: 0 0 20px rgba(50, 205, 50, 0.6); }
`;

const lonelyFade = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const confusedRotate = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
`;

const BackgroundAnimation = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
`;

const FloatingElement = styled.div`
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: ${props => {
    switch (props.mood) {
      case 'happy': return happyFloat;
      case 'sad': return sadSway;
      case 'angry': return angryShake;
      case 'anxious': return anxiousPulse;
      case 'excited': return excitedBounce;
      case 'calm': return calmWave;
      case 'grateful': return gratefulGlow;
      case 'lonely': return lonelyFade;
      case 'confused': return confusedRotate;
      default: return calmWave;
    }
  }} ${props => props.duration || '6s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  background: ${props => props.color || 'var(--color-primary)'};
  width: ${props => props.size || '20px'};
  height: ${props => props.size || '20px'};
  top: ${props => props.top || '10%'};
  left: ${props => props.left || '10%'};
`;

const ParticleSystem = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Particle = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${props => props.color || 'var(--color-primary)'};
  border-radius: 50%;
  opacity: 0.3;
  animation: ${props => {
    switch (props.mood) {
      case 'happy': return happyFloat;
      case 'sad': return sadSway;
      case 'angry': return angryShake;
      case 'anxious': return anxiousPulse;
      case 'excited': return excitedBounce;
      case 'calm': return calmWave;
      case 'grateful': return gratefulGlow;
      case 'lonely': return lonelyFade;
      case 'confused': return confusedRotate;
      default: return calmWave;
    }
  }} ${props => props.duration || '8s'} linear infinite;
  animation-delay: ${props => props.delay || '0s'};
  top: ${props => props.top || '0%'};
  left: ${props => props.left || '0%'};
`;

const ThemeAnimations = () => {
  const { theme, moodTheme } = useTheme();
  const [particles, setParticles] = useState([]);

  const currentMood = moodTheme || 'neutral';

  useEffect(() => {
    // Generate random particles for mood-based animations
    const generateParticles = () => {
      const newParticles = [];
      const particleCount = currentMood === 'excited' ? 20 : 
                           currentMood === 'happy' ? 15 : 
                           currentMood === 'calm' ? 8 : 10;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          delay: Math.random() * 5 + 's',
          duration: (Math.random() * 4 + 4) + 's',
          size: Math.random() * 3 + 2 + 'px'
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, [currentMood]);

  // Don't show animations for neutral or light/dark themes
  if (!moodTheme || moodTheme === 'neutral') {
    return null;
  }

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#FFD700',
      sad: '#4169E1',
      angry: '#DC143C',
      anxious: '#FF8C00',
      excited: '#FF1493',
      calm: '#20B2AA',
      grateful: '#32CD32',
      lonely: '#708090',
      confused: '#9370DB'
    };
    return colors[mood] || colors.calm;
  };

  const moodColor = getMoodColor(currentMood);

  return (
    <BackgroundAnimation>
      {/* Floating elements */}
      <FloatingElement
        mood={currentMood}
        color={moodColor}
        size="40px"
        top="20%"
        left="15%"
        duration="8s"
        delay="0s"
      />
      <FloatingElement
        mood={currentMood}
        color={moodColor}
        size="25px"
        top="60%"
        left="80%"
        duration="6s"
        delay="2s"
      />
      <FloatingElement
        mood={currentMood}
        color={moodColor}
        size="30px"
        top="80%"
        left="20%"
        duration="10s"
        delay="4s"
      />
      <FloatingElement
        mood={currentMood}
        color={moodColor}
        size="20px"
        top="30%"
        left="70%"
        duration="7s"
        delay="1s"
      />

      {/* Particle system */}
      <ParticleSystem>
        {particles.map(particle => (
          <Particle
            key={particle.id}
            mood={currentMood}
            color={moodColor}
            top={particle.top}
            left={particle.left}
            delay={particle.delay}
            duration={particle.duration}
            size={particle.size}
          />
        ))}
      </ParticleSystem>
    </BackgroundAnimation>
  );
};

export default ThemeAnimations;

