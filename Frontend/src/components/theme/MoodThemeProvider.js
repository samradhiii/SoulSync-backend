import React, { useEffect } from 'react';
import { useMood } from '../../contexts/MoodContext';
import { useTheme } from '../../contexts/ThemeContext';

const MoodThemeProvider = ({ children }) => {
  const { currentMood } = useMood();
  const { setMoodTheme, clearMoodTheme, moodTheme } = useTheme();

  useEffect(() => {
    if (currentMood?.currentMood) {
      // Apply mood-based theme for all moods including neutral
      setMoodTheme(currentMood.currentMood);
    } else if (moodTheme) {
      // Clear mood theme if mood is not available
      clearMoodTheme();
    }
  }, [currentMood?.currentMood, setMoodTheme, clearMoodTheme, moodTheme]);

  return children;
};

export default MoodThemeProvider;

