import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Theme configurations
const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#4A90E2',
      primaryDark: '#357ABD',
      primaryLight: '#6BA3E8',
      secondary: '#7B68EE',
      accent: '#FF6B6B',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      surfaceVariant: '#E9ECEF',
      text: '#212529',
      textSecondary: '#6C757D',
      textMuted: '#ADB5BD',
      border: '#DEE2E6',
      borderLight: '#E9ECEF',
      success: '#28A745',
      warning: '#FFC107',
      error: '#DC3545',
      info: '#17A2B8',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowDark: 'rgba(0, 0, 0, 0.2)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%)',
      secondary: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#5BA0F2',
      primaryDark: '#4A90E2',
      primaryLight: '#7BB3F5',
      secondary: '#8B7CF0',
      accent: '#FF7B7B',
      background: '#1A1A1A',
      surface: '#2D2D2D',
      surfaceVariant: '#3A3A3A',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      textMuted: '#808080',
      border: '#404040',
      borderLight: '#4A4A4A',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowDark: 'rgba(0, 0, 0, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #5BA0F2 0%, #8B7CF0 100%)',
      secondary: 'linear-gradient(135deg, #FF7B7B 0%, #FF9E73 100%)',
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
    },
  },
  // Mood-based themes
  happy: {
    name: 'happy',
    colors: {
      primary: '#FFD700',
      primaryDark: '#FFC107',
      primaryLight: '#FFE082',
      secondary: '#FF9800',
      accent: '#FF5722',
      background: '#FFF8E1',
      surface: '#FFFDE7',
      surfaceVariant: '#FFF9C4',
      text: '#E65100',
      textSecondary: '#FF8F00',
      textMuted: '#FFB74D',
      border: '#FFE0B2',
      borderLight: '#FFF3E0',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(255, 193, 7, 0.3)',
      shadowDark: 'rgba(255, 193, 7, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #FFD700 0%, #FF9800 100%)',
      secondary: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
      background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)',
    },
  },
  sad: {
    name: 'sad',
    colors: {
      primary: '#4169E1',
      primaryDark: '#1E3A8A',
      primaryLight: '#60A5FA',
      secondary: '#6366F1',
      accent: '#8B5CF6',
      background: '#F0F4FF',
      surface: '#F8FAFF',
      surfaceVariant: '#E0E7FF',
      text: '#1E3A8A',
      textSecondary: '#3B82F6',
      textMuted: '#93C5FD',
      border: '#C7D2FE',
      borderLight: '#E0E7FF',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(65, 105, 225, 0.3)',
      shadowDark: 'rgba(65, 105, 225, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4169E1 0%, #6366F1 100%)',
      secondary: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
      background: 'linear-gradient(135deg, #F0F4FF 0%, #F8FAFF 100%)',
    },
  },
  calm: {
    name: 'calm',
    colors: {
      primary: '#20B2AA',
      primaryDark: '#0F766E',
      primaryLight: '#5EEAD4',
      secondary: '#10B981',
      accent: '#059669',
      background: '#F0FDFA',
      surface: '#F7FEFC',
      surfaceVariant: '#CCFBF1',
      text: '#0F766E',
      textSecondary: '#0D9488',
      textMuted: '#5EEAD4',
      border: '#99F6E4',
      borderLight: '#CCFBF1',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(32, 178, 170, 0.3)',
      shadowDark: 'rgba(32, 178, 170, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #20B2AA 0%, #10B981 100%)',
      secondary: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      background: 'linear-gradient(135deg, #F0FDFA 0%, #F7FEFC 100%)',
    },
  },
  anxious: {
    name: 'anxious',
    colors: {
      primary: '#FF8C00',
      primaryDark: '#E65100',
      primaryLight: '#FFB74D',
      secondary: '#FF5722',
      accent: '#D84315',
      background: '#FFF3E0',
      surface: '#FFF8E1',
      surfaceVariant: '#FFE0B2',
      text: '#E65100',
      textSecondary: '#FF8F00',
      textMuted: '#FFB74D',
      border: '#FFCC80',
      borderLight: '#FFE0B2',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(255, 140, 0, 0.3)',
      shadowDark: 'rgba(255, 140, 0, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #FF8C00 0%, #FF5722 100%)',
      secondary: 'linear-gradient(135deg, #D84315 0%, #FF5722 100%)',
      background: 'linear-gradient(135deg, #FFF3E0 0%, #FFF8E1 100%)',
    },
  },
  angry: {
    name: 'angry',
    colors: {
      primary: '#DC143C',
      primaryDark: '#B91C1C',
      primaryLight: '#F87171',
      secondary: '#EF4444',
      accent: '#991B1B',
      background: '#FEF2F2',
      surface: '#FFF5F5',
      surfaceVariant: '#FECACA',
      text: '#991B1B',
      textSecondary: '#DC2626',
      textMuted: '#F87171',
      border: '#FCA5A5',
      borderLight: '#FECACA',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(220, 20, 60, 0.3)',
      shadowDark: 'rgba(220, 20, 60, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #DC143C 0%, #EF4444 100%)',
      secondary: 'linear-gradient(135deg, #991B1B 0%, #EF4444 100%)',
      background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)',
    },
  },
  excited: {
    name: 'excited',
    colors: {
      primary: '#FF1493',
      primaryDark: '#E91E63',
      primaryLight: '#F48FB1',
      secondary: '#FF6B35',
      accent: '#FF4081',
      background: '#FFF0F5',
      surface: '#FFF8FA',
      surfaceVariant: '#FCE4EC',
      text: '#AD1457',
      textSecondary: '#E91E63',
      textMuted: '#F48FB1',
      border: '#F8BBD9',
      borderLight: '#FCE4EC',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(255, 20, 147, 0.3)',
      shadowDark: 'rgba(255, 20, 147, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #FF1493 0%, #FF6B35 100%)',
      secondary: 'linear-gradient(135deg, #FF4081 0%, #FF6B35 100%)',
      background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF8FA 100%)',
    },
  },
  grateful: {
    name: 'grateful',
    colors: {
      primary: '#9C27B0',
      primaryDark: '#7B1FA2',
      primaryLight: '#CE93D8',
      secondary: '#673AB7',
      accent: '#8E24AA',
      background: '#F3E5F5',
      surface: '#F8F5F8',
      surfaceVariant: '#E1BEE7',
      text: '#4A148C',
      textSecondary: '#7B1FA2',
      textMuted: '#CE93D8',
      border: '#D1C4E9',
      borderLight: '#E1BEE7',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(156, 39, 176, 0.3)',
      shadowDark: 'rgba(156, 39, 176, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
      secondary: 'linear-gradient(135deg, #8E24AA 0%, #673AB7 100%)',
      background: 'linear-gradient(135deg, #F3E5F5 0%, #F8F5F8 100%)',
    },
  },
  lonely: {
    name: 'lonely',
    colors: {
      primary: '#607D8B',
      primaryDark: '#455A64',
      primaryLight: '#90A4AE',
      secondary: '#546E7A',
      accent: '#37474F',
      background: '#ECEFF1',
      surface: '#F5F5F5',
      surfaceVariant: '#CFD8DC',
      text: '#263238',
      textSecondary: '#455A64',
      textMuted: '#90A4AE',
      border: '#B0BEC5',
      borderLight: '#CFD8DC',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(96, 125, 139, 0.3)',
      shadowDark: 'rgba(96, 125, 139, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #607D8B 0%, #546E7A 100%)',
      secondary: 'linear-gradient(135deg, #37474F 0%, #546E7A 100%)',
      background: 'linear-gradient(135deg, #ECEFF1 0%, #F5F5F5 100%)',
    },
  },
  confused: {
    name: 'confused',
    colors: {
      primary: '#795548',
      primaryDark: '#5D4037',
      primaryLight: '#A1887F',
      secondary: '#8D6E63',
      accent: '#6D4C41',
      background: '#EFEBE9',
      surface: '#F5F5F5',
      surfaceVariant: '#D7CCC8',
      text: '#3E2723',
      textSecondary: '#5D4037',
      textMuted: '#A1887F',
      border: '#BCAAA4',
      borderLight: '#D7CCC8',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      shadow: 'rgba(121, 85, 72, 0.3)',
      shadowDark: 'rgba(121, 85, 72, 0.5)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #795548 0%, #8D6E63 100%)',
      secondary: 'linear-gradient(135deg, #6D4C41 0%, #8D6E63 100%)',
      background: 'linear-gradient(135deg, #EFEBE9 0%, #F5F5F5 100%)',
    },
  },
};

// Initial state
const initialState = {
  currentTheme: 'light',
  userPreference: localStorage.getItem('theme') || 'auto',
  moodTheme: null,
  animations: true,
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_USER_PREFERENCE: 'SET_USER_PREFERENCE',
  SET_MOOD_THEME: 'SET_MOOD_THEME',
  CLEAR_MOOD_THEME: 'CLEAR_MOOD_THEME',
  TOGGLE_ANIMATIONS: 'TOGGLE_ANIMATIONS',
};

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        currentTheme: action.payload,
      };
    case THEME_ACTIONS.SET_USER_PREFERENCE:
      return {
        ...state,
        userPreference: action.payload,
      };
    case THEME_ACTIONS.SET_MOOD_THEME:
      return {
        ...state,
        moodTheme: action.payload,
        currentTheme: action.payload,
      };
    case THEME_ACTIONS.CLEAR_MOOD_THEME:
      return {
        ...state,
        moodTheme: null,
        currentTheme: state.userPreference === 'auto' ? 'light' : state.userPreference,
      };
    case THEME_ACTIONS.TOGGLE_ANIMATIONS:
      return {
        ...state,
        animations: !state.animations,
      };
    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Apply theme to document
  useEffect(() => {
    console.log('ThemeContext: Applying theme:', state.currentTheme);
    const root = document.documentElement;
    const theme = themes[state.currentTheme] || themes.light;
    
    if (theme && theme.colors) {
      console.log('ThemeContext: Applying colors for theme:', state.currentTheme);
      // Apply color variables with proper CSS variable names
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVar, value);
        console.log(`Setting ${cssVar} to ${value}`);
      });
      
      // Also set common CSS variables that components expect
      root.style.setProperty('--primary-500', theme.colors.primary);
      root.style.setProperty('--surface-primary', theme.colors.surface);
      root.style.setProperty('--text-primary', theme.colors.text);
      root.style.setProperty('--background-primary', theme.colors.background);
      
      // Set theme class and force re-render
      root.className = `theme-${state.currentTheme}`;
      console.log('ThemeContext: Applied theme class:', `theme-${state.currentTheme}`);
      
      // Force a style recalculation
      document.body.style.display = 'none';
      /* eslint-disable-next-line no-unused-vars */
      const _forceReflow = document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
    }
  }, [state.currentTheme]);

  // Save user preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', state.userPreference);
  }, [state.userPreference]);

  // Set theme based on user preference
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      dispatch({ type: THEME_ACTIONS.SET_THEME, payload: themeName });
      dispatch({ type: THEME_ACTIONS.SET_USER_PREFERENCE, payload: themeName });
    }
  };

  // Set mood-based theme
  const setMoodTheme = (mood) => {
    console.log('ThemeContext: Setting mood theme to:', mood);
    console.log('Available themes:', Object.keys(themes));
    if (themes[mood]) {
      console.log('ThemeContext: Mood theme found, applying:', mood);
      dispatch({ type: THEME_ACTIONS.SET_MOOD_THEME, payload: mood });
    } else {
      console.log('ThemeContext: No theme found for mood:', mood);
    }
  };

  // Clear mood theme and return to user preference
  const clearMoodTheme = () => {
    dispatch({ type: THEME_ACTIONS.CLEAR_MOOD_THEME });
  };

  // Toggle animations
  const toggleAnimations = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_ANIMATIONS });
  };

  // Get current theme object
  const getCurrentTheme = () => {
    return themes[state.currentTheme] || themes.light;
  };

  // Get all available themes
  const getAvailableThemes = () => {
    return Object.keys(themes).filter(theme => !['happy', 'sad', 'calm', 'anxious', 'angry', 'excited', 'grateful', 'lonely', 'confused'].includes(theme));
  };

  // Get mood themes
  const getMoodThemes = () => {
    return ['happy', 'sad', 'calm', 'anxious', 'angry', 'excited', 'grateful', 'lonely', 'confused'];
  };

  const value = {
    theme: state.currentTheme,
    userPreference: state.userPreference,
    moodTheme: state.moodTheme,
    animations: state.animations,
    setTheme,
    setMoodTheme,
    clearMoodTheme,
    toggleAnimations,
    getCurrentTheme,
    getAvailableThemes,
    getMoodThemes,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

