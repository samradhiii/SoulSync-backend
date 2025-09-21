import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import DataExport from '../../components/backup/DataExport';

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

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--spacing-6);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`;

const SettingsSection = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-heading);
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: var(--spacing-1);
`;

const SettingDescription = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: var(--color-primary);
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border);
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

const ThemeSelector = styled.div`
  display: flex;
  gap: var(--spacing-2);
`;

const ThemeButton = styled.button`
  padding: var(--spacing-2) var(--spacing-4);
  border: 2px solid ${props => props.active ? 'var(--color-primary)' : 'var(--color-border)'};
  background: ${props => props.active ? 'var(--color-primary)' : 'var(--color-background)'};
  color: ${props => props.active ? 'white' : 'var(--color-text)'};
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
  }
`;

const DangerZone = styled(motion.div)`
  background: var(--color-surface);
  border: 2px solid var(--color-error);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  margin-top: var(--spacing-6);
`;

const DangerTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-error);
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-heading);
`;

const DangerButton = styled.button`
  background: var(--color-error);
  color: white;
  border: none;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: #c82333;
    transform: translateY(-1px);
  }
`;

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, animations, toggleAnimations } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  // Fetch journal statistics for total entries
  const { data: stats } = useQuery(
    'journal-stats',
    async () => {
      const response = await axios.get('/api/journal/stats');
      return response.data.data;
    },
    {
      enabled: !!user,
      refetchOnWindowFocus: false
    }
  );

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    const password = window.prompt('Please confirm your password to delete your account:');
    if (!password) return;
    try {
      // Backend expects password in the body for DELETE. Axios supports `data` key.
      await axios.delete('/api/user/account', { data: { password } });
      alert('Your account has been deleted successfully.');
      await logout();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete account. Please check your password and try again.';
      alert(msg);
    }
  };

  return (
    <Container>
      <Title>Settings</Title>
      
      <SettingsGrid>
        <MainContent>
          <SettingsSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionTitle>Appearance</SectionTitle>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Theme</SettingLabel>
                <SettingDescription>Choose your preferred color scheme</SettingDescription>
              </SettingInfo>
              <ThemeSelector>
                <ThemeButton
                  active={theme === 'light'}
                  onClick={() => setTheme('light')}
                >
                  Light
                </ThemeButton>
                <ThemeButton
                  active={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </ThemeButton>
                <ThemeButton
                  active={theme === 'auto'}
                  onClick={() => setTheme('auto')}
                >
                  Auto
                </ThemeButton>
              </ThemeSelector>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Animations</SettingLabel>
                <SettingDescription>Enable or disable UI animations</SettingDescription>
              </SettingInfo>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={animations}
                  onChange={toggleAnimations}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </SettingItem>
          </SettingsSection>

          <SettingsSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SectionTitle>Notifications</SectionTitle>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Push Notifications</SettingLabel>
                <SettingDescription>Receive notifications for reminders and updates</SettingDescription>
              </SettingInfo>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Email Updates</SettingLabel>
                <SettingDescription>Receive email notifications and updates</SettingDescription>
              </SettingInfo>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={(e) => setEmailUpdates(e.target.checked)}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </SettingItem>
          </SettingsSection>

          <DataExport />

          <DangerZone
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <DangerTitle>Danger Zone</DangerTitle>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
              These actions are permanent and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
              <DangerButton onClick={handleLogout}>
                Sign Out
              </DangerButton>
              <DangerButton onClick={handleDeleteAccount}>
                Delete Account
              </DangerButton>
            </div>
          </DangerZone>
        </MainContent>

        <Sidebar>
          <SettingsSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SectionTitle>Account Info</SectionTitle>
            <div style={{ padding: 'var(--spacing-4) 0' }}>
              <div style={{ marginBottom: 'var(--spacing-2)' }}>
                <strong>Name:</strong> {user?.firstName} {user?.lastName}
              </div>
              <div style={{ marginBottom: 'var(--spacing-2)' }}>
                <strong>Email:</strong> {user?.email}
              </div>
              <div style={{ marginBottom: 'var(--spacing-2)' }}>
                <strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}
              </div>
              <div>
                <strong>Total entries:</strong> {stats?.journal?.totalEntries || 0}
              </div>
            </div>
          </SettingsSection>
        </Sidebar>
      </SettingsGrid>
    </Container>
  );
};

export default SettingsPage;
