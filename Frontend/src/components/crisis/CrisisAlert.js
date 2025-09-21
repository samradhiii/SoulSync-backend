import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AlertContainer = styled(motion.div)`
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
  margin: var(--spacing-4) 0;
  border: 2px solid #ff5252;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
`;

const AlertIcon = styled.div`
  font-size: 24px;
`;

const AlertTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
`;

const AlertMessage = styled.p`
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-4);
  opacity: 0.95;
`;

const HelplineInfo = styled.div`
  background: rgba(255, 255, 255, 0.15);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
`;

const HelplineTitle = styled.h4`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2);
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &.primary {
    background: white;
    color: #ff5252;
    border-color: white;

    &:hover {
      background: #f5f5f5;
    }
  }
`;

const CrisisAlert = ({ helplineInfo, onDismiss, onGetHelp }) => {
  const defaultHelplines = {
    US: {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      text: 'Text HOME to 741741',
      website: 'https://suicidepreventionlifeline.org'
    },
    IN: {
      name: 'AASRA (India)',
      number: '91-22-27546669',
      text: 'Text 9152987821',
      website: 'https://www.aasra.info'
    },
    UK: {
      name: 'Samaritans',
      number: '116 123',
      text: 'Text SHOUT to 85258',
      website: 'https://www.samaritans.org'
    }
  };

  const helplines = helplineInfo || defaultHelplines;


  return (
    <AlertContainer
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <AlertHeader>
        <AlertIcon>🆘</AlertIcon>
        <AlertTitle>Crisis Support Available</AlertTitle>
      </AlertHeader>

      <AlertMessage>
        We noticed some concerning content in your entry. Please remember that you're not alone, 
        and help is available. If you're having thoughts of self-harm, please reach out for support immediately.
      </AlertMessage>

      {Object.entries(helplines).map(([country, helpline]) => (
        <HelplineInfo key={country}>
          <HelplineTitle>{helpline.name} ({country})</HelplineTitle>
          <ContactInfo>
            <ContactItem>
              <span>📞</span>
              <span>Call: {helpline.number}</span>
            </ContactItem>
            <ContactItem>
              <span>💬</span>
              <span>{helpline.text}</span>
            </ContactItem>
            <ContactItem>
              <span>🌐</span>
              <span>Visit: {helpline.website}</span>
            </ContactItem>
          </ContactInfo>
        </HelplineInfo>
      ))}

      <AlertMessage>
        <strong>Remember:</strong> You are valued and your life has meaning. Crisis feelings are temporary, but suicide is permanent. Professional help is available and effective.
      </AlertMessage>

      <ActionButtons>
        <ActionButton className="primary" onClick={() => window.open('tel:988', '_self')}>
          📞 Call Crisis Line
        </ActionButton>
        <ActionButton onClick={() => window.open('https://suicidepreventionlifeline.org', '_blank')}>
          🌐 Get Online Help
        </ActionButton>
        <ActionButton onClick={onDismiss}>
          I Understand
        </ActionButton>
      </ActionButtons>
    </AlertContainer>
  );
};

export default CrisisAlert;
