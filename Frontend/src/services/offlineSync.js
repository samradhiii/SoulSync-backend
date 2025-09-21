class OfflineSyncService {
  constructor() {
    this.dbName = 'SoulSyncDB';
    this.version = 1;
    this.db = null;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    this.init();
    this.setupEventListeners();
  }

  async init() {
    try {
      this.db = await this.openDatabase();
      await this.createTables();
      console.log('Offline database initialized');
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
    }
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create journal entries store
        if (!db.objectStoreNames.contains('journalEntries')) {
          const entriesStore = db.createObjectStore('journalEntries', { keyPath: 'id' });
          entriesStore.createIndex('userId', 'userId', { unique: false });
          entriesStore.createIndex('createdAt', 'createdAt', { unique: false });
          entriesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        
        // Create moods store
        if (!db.objectStoreNames.contains('moods')) {
          const moodsStore = db.createObjectStore('moods', { keyPath: 'id' });
          moodsStore.createIndex('userId', 'userId', { unique: false });
          moodsStore.createIndex('entryId', 'entryId', { unique: false });
        }
        
        // Create sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create user data store
        if (!db.objectStoreNames.contains('userData')) {
          const userStore = db.createObjectStore('userData', { keyPath: 'id' });
        }
      };
    });
  }

  async createTables() {
    // Tables are created in onupgradeneeded
    return Promise.resolve();
  }

  setupEventListeners() {
    // Online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Connection restored');
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Connection lost');
    });

    // Visibility change (when user comes back to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncPendingChanges();
      }
    });

    // Periodic sync (every 5 minutes when online)
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingChanges();
      }
    }, 5 * 60 * 1000);
  }

  // Journal Entries Operations
  async saveJournalEntry(entry) {
    const entryData = {
      ...entry,
      id: entry.id || this.generateId(),
      userId: entry.userId || 'current-user',
      syncStatus: this.isOnline ? 'synced' : 'pending',
      lastModified: new Date().toISOString(),
      createdAt: entry.createdAt || new Date().toISOString()
    };

    try {
      await this.addToStore('journalEntries', entryData);
      
      if (!this.isOnline) {
        await this.addToSyncQueue('CREATE_ENTRY', entryData);
      }
      
      return entryData;
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      throw error;
    }
  }

  async updateJournalEntry(entryId, updates) {
    const entryData = {
      ...updates,
      id: entryId,
      lastModified: new Date().toISOString(),
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };

    try {
      await this.updateInStore('journalEntries', entryData);
      
      if (!this.isOnline) {
        await this.addToSyncQueue('UPDATE_ENTRY', entryData);
      }
      
      return entryData;
    } catch (error) {
      console.error('Failed to update journal entry:', error);
      throw error;
    }
  }

  async deleteJournalEntry(entryId) {
    try {
      await this.deleteFromStore('journalEntries', entryId);
      
      if (!this.isOnline) {
        await this.addToSyncQueue('DELETE_ENTRY', { id: entryId });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      throw error;
    }
  }

  async getJournalEntries(userId = 'current-user') {
    try {
      const entries = await this.getAllFromStore('journalEntries');
      return entries.filter(entry => entry.userId === userId);
    } catch (error) {
      console.error('Failed to get journal entries:', error);
      return [];
    }
  }

  async getJournalEntry(entryId) {
    try {
      return await this.getFromStore('journalEntries', entryId);
    } catch (error) {
      console.error('Failed to get journal entry:', error);
      return null;
    }
  }

  // Mood Operations
  async saveMood(mood) {
    const moodData = {
      ...mood,
      id: mood.id || this.generateId(),
      userId: mood.userId || 'current-user',
      syncStatus: this.isOnline ? 'synced' : 'pending',
      lastModified: new Date().toISOString()
    };

    try {
      await this.addToStore('moods', moodData);
      
      if (!this.isOnline) {
        await this.addToSyncQueue('CREATE_MOOD', moodData);
      }
      
      return moodData;
    } catch (error) {
      console.error('Failed to save mood:', error);
      throw error;
    }
  }

  // User Data Operations
  async saveUserData(userData) {
    const data = {
      ...userData,
      id: 'current-user',
      lastModified: new Date().toISOString()
    };

    try {
      await this.addToStore('userData', data);
      return data;
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  async getUserData() {
    try {
      return await this.getFromStore('userData', 'current-user');
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  // Sync Operations
  async addToSyncQueue(type, data) {
    const syncItem = {
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    try {
      await this.addToStore('syncQueue', syncItem);
      console.log(`Added to sync queue: ${type}`);
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  async syncPendingChanges() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('Starting sync...');

    try {
      const syncItems = await this.getAllFromStore('syncQueue');
      
      for (const item of syncItems) {
        try {
          await this.syncItem(item);
          await this.deleteFromStore('syncQueue', item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          item.retryCount++;
          
          if (item.retryCount < 3) {
            await this.updateInStore('syncQueue', item);
          } else {
            console.error(`Max retries reached for item ${item.id}`);
            await this.deleteFromStore('syncQueue', item.id);
          }
        }
      }
      
      console.log('Sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncItem(item) {
    const { type, data } = item;
    
    switch (type) {
      case 'CREATE_ENTRY':
        return await this.syncCreateEntry(data);
      case 'UPDATE_ENTRY':
        return await this.syncUpdateEntry(data);
      case 'DELETE_ENTRY':
        return await this.syncDeleteEntry(data);
      case 'CREATE_MOOD':
        return await this.syncCreateMood(data);
      default:
        console.warn(`Unknown sync type: ${type}`);
    }
  }

  async syncCreateEntry(data) {
    // Simulate API call
    const response = await fetch('/api/journal/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create entry: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Update local entry with server response
    await this.updateInStore('journalEntries', {
      ...data,
      id: result.data.entry.id,
      syncStatus: 'synced'
    });

    return result;
  }

  async syncUpdateEntry(data) {
    const response = await fetch(`/api/journal/entries/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update entry: ${response.statusText}`);
    }

    await this.updateInStore('journalEntries', {
      ...data,
      syncStatus: 'synced'
    });

    return await response.json();
  }

  async syncDeleteEntry(data) {
    const response = await fetch(`/api/journal/entries/${data.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete entry: ${response.statusText}`);
    }

    return await response.json();
  }

  async syncCreateMood(data) {
    const response = await fetch('/api/mood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create mood: ${response.statusText}`);
    }

    await this.updateInStore('moods', {
      ...data,
      syncStatus: 'synced'
    });

    return await response.json();
  }

  // Generic IndexedDB Operations
  async addToStore(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateInStore(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFromStore(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllFromStore(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFromStore(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Utility Methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Cache Management
  async clearCache() {
    try {
      const storeNames = ['journalEntries', 'moods', 'syncQueue', 'userData'];
      
      for (const storeName of storeNames) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.clear();
      }
      
      console.log('Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheSize() {
    try {
      const entries = await this.getAllFromStore('journalEntries');
      const moods = await this.getAllFromStore('moods');
      const syncQueue = await this.getAllFromStore('syncQueue');
      
      return {
        entries: entries.length,
        moods: moods.length,
        syncQueue: syncQueue.length,
        totalSize: JSON.stringify({ entries, moods, syncQueue }).length
      };
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return { entries: 0, moods: 0, syncQueue: 0, totalSize: 0 };
    }
  }

  // Export/Import
  async exportData() {
    try {
      const entries = await this.getAllFromStore('journalEntries');
      const moods = await this.getAllFromStore('moods');
      const userData = await this.getUserData();
      
      return {
        entries,
        moods,
        userData,
        exportDate: new Date().toISOString(),
        version: this.version
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async importData(data) {
    try {
      if (data.entries) {
        for (const entry of data.entries) {
          await this.addToStore('journalEntries', entry);
        }
      }
      
      if (data.moods) {
        for (const mood of data.moods) {
          await this.addToStore('moods', mood);
        }
      }
      
      if (data.userData) {
        await this.addToStore('userData', data.userData);
      }
      
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const offlineSyncService = new OfflineSyncService();

export default offlineSyncService;

