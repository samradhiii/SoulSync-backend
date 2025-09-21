import { useState, useEffect, useCallback } from 'react';
import offlineSyncService from '../services/offlineSync';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending changes on mount
    checkPendingChanges();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingChanges = useCallback(async () => {
    try {
      const syncQueue = await offlineSyncService.getAllFromStore('syncQueue');
      setPendingChanges(syncQueue.length);
    } catch (error) {
      console.error('Failed to check pending changes:', error);
    }
  }, []);

  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || syncStatus === 'syncing') {
      return;
    }

    setSyncStatus('syncing');
    
    try {
      await offlineSyncService.syncPendingChanges();
      setSyncStatus('idle');
      setLastSync(new Date());
      await checkPendingChanges();
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  }, [isOnline, syncStatus, checkPendingChanges]);

  const saveJournalEntry = useCallback(async (entry) => {
    try {
      const savedEntry = await offlineSyncService.saveJournalEntry(entry);
      await checkPendingChanges();
      return savedEntry;
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      throw error;
    }
  }, [checkPendingChanges]);

  const updateJournalEntry = useCallback(async (entryId, updates) => {
    try {
      const updatedEntry = await offlineSyncService.updateJournalEntry(entryId, updates);
      await checkPendingChanges();
      return updatedEntry;
    } catch (error) {
      console.error('Failed to update journal entry:', error);
      throw error;
    }
  }, [checkPendingChanges]);

  const deleteJournalEntry = useCallback(async (entryId) => {
    try {
      await offlineSyncService.deleteJournalEntry(entryId);
      await checkPendingChanges();
      return true;
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      throw error;
    }
  }, [checkPendingChanges]);

  const getJournalEntries = useCallback(async (userId) => {
    try {
      return await offlineSyncService.getJournalEntries(userId);
    } catch (error) {
      console.error('Failed to get journal entries:', error);
      return [];
    }
  }, []);

  const getJournalEntry = useCallback(async (entryId) => {
    try {
      return await offlineSyncService.getJournalEntry(entryId);
    } catch (error) {
      console.error('Failed to get journal entry:', error);
      return null;
    }
  }, []);

  const saveMood = useCallback(async (mood) => {
    try {
      const savedMood = await offlineSyncService.saveMood(mood);
      await checkPendingChanges();
      return savedMood;
    } catch (error) {
      console.error('Failed to save mood:', error);
      throw error;
    }
  }, [checkPendingChanges]);

  const saveUserData = useCallback(async (userData) => {
    try {
      return await offlineSyncService.saveUserData(userData);
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }, []);

  const getUserData = useCallback(async () => {
    try {
      return await offlineSyncService.getUserData();
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await offlineSyncService.clearCache();
      setPendingChanges(0);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }, []);

  const getCacheSize = useCallback(async () => {
    try {
      return await offlineSyncService.getCacheSize();
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return { entries: 0, moods: 0, syncQueue: 0, totalSize: 0 };
    }
  }, []);

  const exportData = useCallback(async () => {
    try {
      return await offlineSyncService.exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, []);

  const importData = useCallback(async (data) => {
    try {
      await offlineSyncService.importData(data);
      await checkPendingChanges();
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }, [checkPendingChanges]);

  return {
    // Status
    isOnline,
    syncStatus,
    pendingChanges,
    lastSync,
    
    // Actions
    syncPendingChanges,
    checkPendingChanges,
    
    // Journal Operations
    saveJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    getJournalEntries,
    getJournalEntry,
    
    // Mood Operations
    saveMood,
    
    // User Data Operations
    saveUserData,
    getUserData,
    
    // Cache Management
    clearCache,
    getCacheSize,
    exportData,
    importData
  };
};

export default useOfflineSync;

