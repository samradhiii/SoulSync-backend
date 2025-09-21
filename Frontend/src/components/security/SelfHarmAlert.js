import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const AlertOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
`;

const AlertContainer = styled(motion.div)`
  background: var(--color-surface);
  border: 2px solid var(--color-error);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-8);
  max-width: 500px;
  width: 100%;
  text-align: center;
  position: relative;
  box-shadow: var(--shadow-2xl);
`;

const AlertIcon = styled.div`
  font-size: 64px;
  margin-bottom: var(--spacing-4);
  color: var(--color-error);
`;

const AlertTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-heading);
`;

const AlertMessage = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-6);
`;

const HelplineSection = styled.div`
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  max-height: 300px;
  overflow-y: auto;
`;

const HelplineTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-heading);
`;

const HelplineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`;

const HelplineItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
`;

const HelplineIcon = styled.div`
  font-size: 24px;
  color: var(--color-primary);
`;

const HelplineInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const HelplineName = styled.div`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-1);
`;

const HelplineDetails = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const HelplineNumber = styled.a`
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  
  &:hover {
    text-decoration: underline;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
`;

const Button = styled.button`
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const PrimaryButton = styled(Button)`
  background: var(--color-primary);
  color: white;

  &:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(Button)`
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);

  &:hover {
    background: var(--color-surface-variant);
  }
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

const SelfHarmAlert = ({ isOpen, onClose, onContinue }) => {
  const [helplines, setHelplines] = useState([]);

  useEffect(() => {
    // Load helpline information
    const loadHelplines = async () => {
      try {
        // Indian crisis helplines
        const mockHelplines = [
          {
            name: 'AASRA - Suicide Prevention Helpline',
            number: '91-9820466726',
            text: 'WhatsApp: +91-9820466726',
            website: 'https://www.aasra.info',
            country: 'IN'
          },
          {
            name: 'Vandrevala Foundation',
            number: '1860-2662-345',
            text: '1860-2662-345',
            website: 'https://www.vandrevalafoundation.com',
            country: 'IN'
          },
          {
            name: 'iCall - Psychosocial Helpline',
            number: '022-25521111',
            text: 'Email: icall@tiss.edu',
            website: 'https://icallhelpline.org',
            country: 'IN'
          },
          {
            name: 'Sneha India Foundation',
            number: '044-24640050',
            text: 'Chennai: 044-24640050',
            website: 'https://snehaindia.org',
            country: 'IN'
          },
          {
            name: 'Sumaitri - Delhi',
            number: '011-23389090',
            text: 'Delhi: 011-23389090',
            website: 'https://www.sumaitri.net',
            country: 'IN'
          },
          {
            name: 'Parivarthan - Bangalore',
            number: '076760-30003',
            text: 'Bangalore: 076760-30003',
            website: 'https://parivarthan.org',
            country: 'IN'
          }
        ];
        setHelplines(mockHelplines);
      } catch (error) {
        console.error('Failed to load helplines:', error);
      }
    };

    if (isOpen) {
      loadHelplines();
    }
  }, [isOpen]);

  const handleCall = (number) => {
    window.open(`tel:${number}`, '_self');
  };

  const handleText = (textNumber) => {
    window.open(`sms:${textNumber}`, '_self');
  };

  const handleWebsite = (url) => {
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <AlertOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <AlertContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={onClose}>×</CloseButton>
          
          <AlertIcon>🤝</AlertIcon>
          <AlertTitle>We're Here to Help</AlertTitle>
          <AlertMessage>
            We noticed some concerning content in your entry. Please remember that you're not alone, 
            and there are people who care about you and want to help. Your mental health matters.
          </AlertMessage>

          <HelplineSection>
            <HelplineTitle>Get Help Now</HelplineTitle>
            <HelplineList>
              {helplines.map((helpline, index) => (
                <HelplineItem key={index}>
                  <HelplineIcon>📞</HelplineIcon>
                  <HelplineInfo>
                    <HelplineName>{helpline.name}</HelplineName>
                    <HelplineDetails>
                      {helpline.number && (
                        <HelplineNumber 
                          href={`tel:${helpline.number}`}
                          onClick={() => handleCall(helpline.number)}
                        >
                          {helpline.number}
                        </HelplineNumber>
                      )}
                      {helpline.text && (
                        <div style={{ marginTop: 'var(--spacing-1)' }}>
                          Text: <HelplineNumber 
                            href={`sms:${helpline.text.split(' ')[2]}`}
                            onClick={() => handleText(helpline.text.split(' ')[2])}
                          >
                            {helpline.text}
                          </HelplineNumber>
                        </div>
                      )}
                      <div style={{ marginTop: 'var(--spacing-1)' }}>
                        <HelplineNumber 
                          href={helpline.website}
                          onClick={() => handleWebsite(helpline.website)}
                        >
                          Visit Website
                        </HelplineNumber>
                      </div>
                    </HelplineDetails>
                  </HelplineInfo>
                </HelplineItem>
              ))}
            </HelplineList>
          </HelplineSection>

          <ActionButtons>
            <SecondaryButton onClick={onContinue}>
              I'm Safe
            </SecondaryButton>
            <PrimaryButton onClick={onClose}>
              Continue Writing
            </PrimaryButton>
          </ActionButtons>
        </AlertContainer>
      </AlertOverlay>
    </AnimatePresence>
  );
};

export default SelfHarmAlert;

