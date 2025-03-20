import { LocalDataConfig } from './types';
import { AppError, ErrorType, handleError } from './errorHandler';

// Default configuration
const defaultConfig: LocalDataConfig = {
  storageType: 'indexedDB',
  databaseName: 'crewai-local-db',
  collections: ['agents', 'crews', 'tasks', 'flows'],
  autoBackup: true,
  backupInterval: 1000 * 60 * 60, // 1 hour
};

class LocalDatabase {
  private db: IDBDatabase | null = null;
  private config: LocalDataConfig;
  private backupTimer: number | null = null;

  constructor(config: Partial<LocalDataConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.initialize();
  }

  private initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.databaseName, 1);

      request.onerror = (event) => {
        const error = new AppError(`Failed to open database: ${this.config.databaseName}`, ErrorType.DATABASE, event);
        console.error(error);
        reject(error);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Database opened successfully');
        
        if (this.config.autoBackup && this.config.backupInterval) {
          this.startBackupTimer();
        }
        
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for each collection
        this.config.collections.forEach(collection => {
          if (!db.objectStoreNames.contains(collection)) {
            db.createObjectStore(collection, { keyPath: 'id' });
            console.log(`Created object store: ${collection}`);
          }
        });
      };
    });
  }

  private startBackupTimer(): void {
    if (this.backupTimer) {
      window.clearInterval(this.backupTimer);
    }
    
    this.backupTimer = window.setInterval(() => {
      this.backup();
    }, this.config.backupInterval);
  }

  public async getCollection<T>(collection: string): Promise<T[]> {
    try {
      if (!this.db) await this.initialize();
      
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new AppError('Database not initialized', ErrorType.DATABASE));
          return;
        }
        
        const transaction = this.db.transaction(collection, 'readonly');
        const store = transaction.objectStore(collection);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          reject(new AppError(`Failed to get collection ${collection}`, ErrorType.DATABASE, event));
        };
      });
    } catch (error) {
      throw handleError(error, false);
    }
  }

  public async getItem<T>(collection: string, id: string): Promise<T | null> {
    try {
      if (!this.db) await this.initialize();
      
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new AppError('Database not initialized', ErrorType.DATABASE));
          return;
        }
        
        const transaction = this.db.transaction(collection, 'readonly');
        const store = transaction.objectStore(collection);
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = (event) => {
          reject(new AppError(`Failed to get item ${id} from ${collection}`, ErrorType.DATABASE, event));
        };
      });
    } catch (error) {
      throw handleError(error, false);
    }
  }

  public async addItem<T>(collection: string, item: T): Promise<T> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new AppError('Database not initialized', ErrorType.DATABASE));
        return;
      }
      
      const transaction = this.db.transaction(collection, 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.add(item);
      
      request.onsuccess = () => {
        resolve(item);
      };
      
      request.onerror = (event) => {
        console.error(`Error adding item to ${collection}:`, event);
        reject(new AppError(`Failed to add item to ${collection}`, ErrorType.DATABASE, event));
      };
    });
  }

  public async updateItem<T>(collection: string, item: T): Promise<T> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new AppError('Database not initialized', ErrorType.DATABASE));
        return;
      }
      
      const transaction = this.db.transaction(collection, 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.put(item);
      
      request.onsuccess = () => {
        resolve(item);
      };
      
      request.onerror = (event) => {
        console.error(`Error updating item in ${collection}:`, event);
        reject(new AppError(`Failed to update item in ${collection}`, ErrorType.DATABASE, event));
      };
    });
  }

  public async deleteItem(collection: string, id: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new AppError('Database not initialized', ErrorType.DATABASE));
        return;
      }
      
      const transaction = this.db.transaction(collection, 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error deleting item ${id} from ${collection}:`, event);
        reject(new AppError(`Failed to delete item ${id} from ${collection}`, ErrorType.DATABASE, event));
      };
    });
  }

  public async backup(): Promise<void> {
    try {
      const data: Record<string, any[]> = {};
      
      for (const collection of this.config.collections) {
        data[collection] = await this.getCollection(collection);
      }
      
      // Save to localStorage as a fallback
      localStorage.setItem('crewai-db-backup', JSON.stringify({
        timestamp: new Date().toISOString(),
        data
      }));
      
      console.log('Database backup created');
    } catch (error) {
      console.error('Error creating database backup:', error);
      throw handleError(error, false);
    }
  }

  public async restore(backupData?: string): Promise<void> {
    try {
      const backup = backupData || localStorage.getItem('crewai-db-backup');
      if (!backup) {
        throw new AppError('No backup found', ErrorType.DATABASE);
      }
      
      const { data } = JSON.parse(backup);
      
      for (const collection of this.config.collections) {
        if (data[collection]) {
          const transaction = this.db!.transaction(collection, 'readwrite');
          const store = transaction.objectStore(collection);
          
          // Clear existing data
          store.clear();
          
          // Add backup data
          for (const item of data[collection]) {
            store.add(item);
          }
        }
      }
      
      console.log('Database restored from backup');
    } catch (error) {
      console.error('Error restoring database from backup:', error);
      throw handleError(error, false);
    }
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    if (this.backupTimer) {
      window.clearInterval(this.backupTimer);
      this.backupTimer = null;
    }
  }
}

// Export a singleton instance
export const localDB = new LocalDatabase();

// Export utility functions for common operations
export async function saveAgent(agent: any): Promise<any> {
  return localDB.updateItem('agents', agent);
}

export async function saveCrew(crew: any): Promise<any> {
  return localDB.updateItem('crews', crew);
}

export async function saveFlow(flow: any): Promise<any> {
  return localDB.updateItem('flows', flow);
}

export async function saveTask(task: any): Promise<any> {
  return localDB.updateItem('tasks', task);
}

export async function getAgents(): Promise<any[]> {
  return localDB.getCollection('agents');
}

export async function getCrews(): Promise<any[]> {
  return localDB.getCollection('crews');
}

export async function getFlows(): Promise<any[]> {
  return localDB.getCollection('flows');
}

export async function getTasks(): Promise<any[]> {
  return localDB.getCollection('tasks');
}
