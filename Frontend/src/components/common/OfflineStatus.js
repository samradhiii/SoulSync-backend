import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineSync } from '../../hooks/useOfflineSync';

const StatusContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
`;

const OnlineStatus = styled(StatusContainer)`
  background: rgba(34, 197, 94, 0.9);
  color: white;
  border: 1px solid rgba(34, 197, 94, 0.3);
`;

const OfflineStatusStyled = styled(StatusContainer)`
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
`;

const SyncingStatus = styled(StatusContainer)`
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border: 1px solid rgba(59, 130, 246, 0.3);
`;

const PendingStatus = styled(StatusContainer)`
  background: rgba(245, 158, 11, 0.9);
  color: white;
  border: 1px solid rgba(245, 158, 11, 0.3);
`;

const StatusIcon = styled.div`
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const StatusText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatusLabel = styled.div`
  font-weight: var(--font-weight-semibold);
`;

const StatusSubtext = styled.div`
  font-size: var(--font-size-xs);
  opacity: 0.8;
`;

const SyncButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const OfflineStatus = () => {
  const { 
    isOnline, 
    syncStatus, 
    pendingChanges, 
    lastSync, 
    syncPendingChanges 
  } = useOfflineSync();

  const formatLastSync = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleSync = () => {
    if (isOnline && syncStatus !== 'syncing') {
      syncPendingChanges();
    }
  };

  if (isOnline && syncStatus === 'idle' && pendingChanges === 0) {
    return (
      <AnimatePresence>
        <OnlineStatus
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          <StatusIcon>🌐</StatusIcon>
          <StatusText>
            <StatusLabel>Online</StatusLabel>
            <StatusSubtext>All synced</StatusSubtext>
          </StatusText>
        </OnlineStatus>
      </AnimatePresence>
    );
  }

  if (isOnline && syncStatus === 'syncing') {
    return (
      <SyncingStatus
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
      >
        <StatusIcon>
          <Spinner />
        </StatusIcon>
        <StatusText>
          <StatusLabel>Syncing...</StatusLabel>
          <StatusSubtext>Updating data</StatusSubtext>
        </StatusText>
      </SyncingStatus>
    );
  }

  if (isOnline && pendingChanges > 0) {
    return (
      <PendingStatus
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
      >
        <StatusIcon>⏳</StatusIcon>
        <StatusText>
          <StatusLabel>{pendingChanges} pending</StatusLabel>
          <StatusSubtext>Last sync: {formatLastSync(lastSync)}</StatusSubtext>
        </StatusText>
        <SyncButton onClick={handleSync} disabled={syncStatus === 'syncing'}>
          Sync
        </SyncButton>
      </PendingStatus>
    );
  }

  if (!isOnline) {
    return (
      <OfflineStatusStyled
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
      >
        <StatusIcon>📱</StatusIcon>
        <StatusText>
          <StatusLabel>Offline</StatusLabel>
          <StatusSubtext>
            {pendingChanges > 0 
              ? `${pendingChanges} changes pending` 
              : 'Working offline'
            }
          </StatusSubtext>
        </StatusText>
      </OfflineStatusStyled>
    );
  }

  return null;
};

export default OfflineStatus;
