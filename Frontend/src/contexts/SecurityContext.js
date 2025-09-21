import React, { createContext, useContext, useState, useCallback } from 'react';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// Self-harm detection patterns
const selfHarmPatterns = [
  // Direct self-harm statements
  'hurt myself', 'kill myself', 'end it all', 'not worth living',
  'want to die', 'suicide', 'self harm', 'cut myself', 'harm myself',
  'end my life', 'take my life', 'give up', 'no point', 'hopeless',
  'worthless', 'better off dead', 'burden', 'everyone would be better',
  'no one cares', 'no one would miss me', 'disappear', 'fade away',
  
  // Methods
  'overdose', 'jump off', 'hang myself', 'poison myself', 'drown myself',
  'shoot myself', 'stab myself', 'burn myself', 'starve myself',
  
  // Emotional indicators
  'can\'t go on', 'can\'t take it anymore', 'tired of living',
  'life is meaningless', 'nothing matters', 'pointless existence',
  'wish I was dead', 'want to disappear', 'end the pain',
  
  // Crisis language
  'final goodbye', 'last time', 'never see me again', 'goodbye forever',
  'this is it', 'final decision', 'no turning back'
];

// Helpline information by country
const helplineInfo = {
  US: {
    primary: {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      text: 'Text HOME to 741741',
      website: 'https://suicidepreventionlifeline.org'
    },
    secondary: {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      website: 'https://www.crisistextline.org'
    }
  },
  UK: {
    primary: {
      name: 'Samaritans',
      number: '116 123',
      text: 'Text SHOUT to 85258',
      website: 'https://www.samaritans.org'
    }
  },
  CA: {
    primary: {
      name: 'Crisis Services Canada',
      number: '1-833-456-4566',
      text: 'Text 45645',
      website: 'https://suicideprevention.ca'
    }
  },
  AU: {
    primary: {
      name: 'Lifeline Australia',
      number: '13 11 14',
      text: 'Text 0477 13 11 14',
      website: 'https://www.lifeline.org.au'
    }
  },
  IN: {
    primary: {
      name: 'AASRA',
      number: '91-22-27546669',
      text: 'Text 9152987821',
      website: 'https://www.aasra.info'
    }
  }
};

export const SecurityProvider = ({ children }) => {
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [userCountry, setUserCountry] = useState('US'); // Default to US

  // Detect self-harm content in text
  const detectSelfHarm = useCallback((text) => {
    if (!text || !isMonitoring) {
      return { detected: false, confidence: 0, flaggedWords: [] };
    }

    const lowerText = text.toLowerCase();
    const flaggedWords = [];
    let confidence = 0;

    // Check for self-harm patterns
    selfHarmPatterns.forEach(pattern => {
      if (lowerText.includes(pattern)) {
        flaggedWords.push(pattern);
        confidence += 1;
      }
    });

    // Check for multiple concerning words
    const concerningWords = ['die', 'death', 'kill', 'hurt', 'pain', 'suffer', 'hopeless', 'worthless'];
    const wordCount = concerningWords.filter(word => lowerText.includes(word)).length;
    
    if (wordCount >= 3) {
      confidence += 0.5;
    }

    // Check for emotional intensity indicators
    const intensityWords = ['never', 'always', 'forever', 'completely', 'totally', 'absolutely'];
    const intensityCount = intensityWords.filter(word => lowerText.includes(word)).length;
    
    if (intensityCount >= 2) {
      confidence += 0.3;
    }

    // Normalize confidence (0-1 scale)
    confidence = Math.min(confidence / 3, 1);

    return {
      detected: confidence > 0.3,
      confidence: Math.round(confidence * 100) / 100,
      flaggedWords: [...new Set(flaggedWords)],
      severity: confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low'
    };
  }, [isMonitoring]);

  // Create security alert
  const createSecurityAlert = useCallback((type, data) => {
    const alert = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    setSecurityAlerts(prev => [...prev, alert]);
    return alert;
  }, []);

  // Acknowledge security alert
  const acknowledgeAlert = useCallback((alertId) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setSecurityAlerts([]);
  }, []);

  // Get helpline information
  const getHelplineInfo = useCallback((country = userCountry) => {
    return helplineInfo[country] || helplineInfo.US;
  }, [userCountry]);

  // Monitor text input for self-harm content
  const monitorText = useCallback((text, onAlert) => {
    const detection = detectSelfHarm(text);
    
    if (detection.detected) {
      const alert = createSecurityAlert('self_harm', {
        text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        detection,
        helpline: getHelplineInfo()
      });
      
      if (onAlert) {
        onAlert(alert);
      }
      
      return alert;
    }
    
    return null;
  }, [detectSelfHarm, createSecurityAlert, getHelplineInfo]);

  // Get security statistics
  const getSecurityStats = useCallback(() => {
    const totalAlerts = securityAlerts.length;
    const acknowledgedAlerts = securityAlerts.filter(alert => alert.acknowledged).length;
    const highSeverityAlerts = securityAlerts.filter(
      alert => alert.data?.detection?.severity === 'high'
    ).length;

    return {
      totalAlerts,
      acknowledgedAlerts,
      pendingAlerts: totalAlerts - acknowledgedAlerts,
      highSeverityAlerts,
      alertRate: totalAlerts > 0 ? (acknowledgedAlerts / totalAlerts) * 100 : 0
    };
  }, [securityAlerts]);

  // Export security data (for user's own records)
  const exportSecurityData = useCallback(() => {
    return {
      alerts: securityAlerts,
      settings: {
        isMonitoring,
        userCountry
      },
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }, [securityAlerts, isMonitoring, userCountry]);

  // Import security data
  const importSecurityData = useCallback((data) => {
    if (data.alerts) {
      setSecurityAlerts(data.alerts);
    }
    if (data.settings) {
      setIsMonitoring(data.settings.isMonitoring);
      setUserCountry(data.settings.userCountry);
    }
  }, []);

  // Reset security settings
  const resetSecuritySettings = useCallback(() => {
    setIsMonitoring(true);
    setUserCountry('US');
    setSecurityAlerts([]);
  }, []);

  const value = {
    // State
    securityAlerts,
    isMonitoring,
    userCountry,
    
    // Actions
    detectSelfHarm,
    monitorText,
    createSecurityAlert,
    acknowledgeAlert,
    clearAlerts,
    
    // Settings
    setIsMonitoring,
    setUserCountry,
    
    // Utilities
    getHelplineInfo,
    getSecurityStats,
    exportSecurityData,
    importSecurityData,
    resetSecuritySettings
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityContext;

