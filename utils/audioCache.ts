export class AudioCache {
  private dbName = 'sindhi-audio-cache';
  private storeName = 'audio-blobs';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get(key: string): Promise<Blob | null> {
    if (typeof window === 'undefined') return null;
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      } catch (error) {
        resolve(null);
      }
    });
  }

  async set(key: string, blob: Blob): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(blob, key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      } catch (error) {
        resolve();
      }
    });
  }
}

export const audioCache = new AudioCache();
