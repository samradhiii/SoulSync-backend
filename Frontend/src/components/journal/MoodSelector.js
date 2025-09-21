import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
 

const MoodSelectorContainer = styled.div`
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

const MoodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
`;

const MoodOption = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border: 2px solid ${props => props.selected ? props.color : 'var(--color-border)'};
  background: ${props => props.selected ? `${props.color}15` : 'var(--color-background)'};
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: ${props => props.color};
    background: ${props => `${props.color}10`};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.color};
    opacity: ${props => props.selected ? 0.1 : 0};
    transition: opacity var(--transition-fast);
  }
`;

const MoodEmoji = styled.div`
  font-size: 32px;
  z-index: 1;
`;

const MoodLabel = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  z-index: 1;
`;

const IntensitySlider = styled.div`
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
`;

const IntensityLabel = styled.label`
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: var(--spacing-2);
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const Slider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    cursor: pointer;
    border: none;
    box-shadow: var(--shadow-sm);
  }
`;

const IntensityValue = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  min-width: 30px;
  text-align: center;
`;

const IntensityLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
`;

const SelectedMoodDisplay = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-surface-variant);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-4);
`;

const SelectedMoodInfo = styled.div`
  flex: 1;
`;

const SelectedMoodName = styled.div`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
`;

const SelectedMoodDescription = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const moods = [
  {
    id: 'happy',
    emoji: '😊',
    label: 'Happy',
    color: '#FFD700',
    description: 'Feeling joyful and positive'
  },
  {
    id: 'sad',
    emoji: '😢',
    label: 'Sad',
    color: '#4169E1',
    description: 'Feeling down or melancholy'
  },
  {
    id: 'angry',
    emoji: '😠',
    label: 'Angry',
    color: '#DC143C',
    description: 'Feeling frustrated or irritated'
  },
  {
    id: 'anxious',
    emoji: '😰',
    label: 'Anxious',
    color: '#FF8C00',
    description: 'Feeling worried or nervous'
  },
  {
    id: 'excited',
    emoji: '🤩',
    label: 'Excited',
    color: '#FF1493',
    description: 'Feeling enthusiastic and energetic'
  },
  {
    id: 'calm',
    emoji: '😌',
    label: 'Calm',
    color: '#20B2AA',
    description: 'Feeling peaceful and relaxed'
  },
  {
    id: 'grateful',
    emoji: '🙏',
    label: 'Grateful',
    color: '#32CD32',
    description: 'Feeling thankful and appreciative'
  },
  {
    id: 'lonely',
    emoji: '😔',
    label: 'Lonely',
    color: '#708090',
    description: 'Feeling isolated or disconnected'
  },
  {
    id: 'confused',
    emoji: '😕',
    label: 'Confused',
    color: '#9370DB',
    description: 'Feeling uncertain or puzzled'
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    color: '#808080',
    description: 'Feeling balanced and stable'
  }
];

const MoodSelector = ({ 
  selectedMood, 
  onMoodChange, 
  intensity = 5, 
  onIntensityChange,
  showIntensity = true,
  title = "How are you feeling?"
}) => {
 
  const [localMood, setLocalMood] = useState(selectedMood || 'neutral');
  const [localIntensity, setLocalIntensity] = useState(intensity);

  const handleMoodSelect = (moodId) => {
    setLocalMood(moodId);
    if (onMoodChange) {
      onMoodChange(moodId);
    }
  };

  const handleIntensityChange = (e) => {
    const value = parseInt(e.target.value);
    setLocalIntensity(value);
    if (onIntensityChange) {
      onIntensityChange(value);
    }
  };

  const selectedMoodData = moods.find(mood => mood.id === localMood);

  return (
    <MoodSelectorContainer>
      <Title>{title}</Title>
      
      <MoodGrid>
        {moods.map((mood) => (
          <MoodOption
            key={mood.id}
            selected={localMood === mood.id}
            color={mood.color}
            onClick={() => handleMoodSelect(mood.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoodEmoji>{mood.emoji}</MoodEmoji>
            <MoodLabel>{mood.label}</MoodLabel>
          </MoodOption>
        ))}
      </MoodGrid>

      {showIntensity && (
        <IntensitySlider>
          <IntensityLabel>
            Intensity: {localIntensity}/10
          </IntensityLabel>
          <SliderContainer>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>1</span>
            <Slider
              type="range"
              min="1"
              max="10"
              value={localIntensity}
              onChange={handleIntensityChange}
            />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>10</span>
          </SliderContainer>
          <IntensityLabels>
            <span>Low</span>
            <span>High</span>
          </IntensityLabels>
        </IntensitySlider>
      )}

      <AnimatePresence>
        {selectedMoodData && (
          <SelectedMoodDisplay
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <MoodEmoji style={{ fontSize: '24px' }}>
              {selectedMoodData.emoji}
            </MoodEmoji>
            <SelectedMoodInfo>
              <SelectedMoodName>{selectedMoodData.label}</SelectedMoodName>
              <SelectedMoodDescription>{selectedMoodData.description}</SelectedMoodDescription>
            </SelectedMoodInfo>
            {showIntensity && (
              <IntensityValue>{localIntensity}</IntensityValue>
            )}
          </SelectedMoodDisplay>
        )}
      </AnimatePresence>
    </MoodSelectorContainer>
  );
};

export default MoodSelector;

