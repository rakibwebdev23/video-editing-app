/* eslint-disable @typescript-eslint/no-explicit-any */
export const saveFileToDB = async (id: string, file: File | Blob, thumbnail?: Blob): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      const request = store.put({ id, file, thumbnail });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    } catch (err) {
      reject(err);
    }
  });
};

export const getFileFromDB = async (id: string): Promise<{ file: Blob; thumbnail?: Blob } | null> => {
  const db = await openDB();
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(['media'], 'readonly');
      const store = transaction.objectStore('media');
      const getReq = store.get(id);
      
      getReq.onsuccess = () => {
        if (!getReq.result) return resolve(null);
        resolve({
          file: getReq.result.file,
          thumbnail: getReq.result.thumbnail
        });
      };
      getReq.onerror = () => resolve(null);
    } catch (err) {
      console.error('IndexedDB get error:', err);
      resolve(null);
    }
  });
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VideoCreatorDB', 1);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id' });
      }
    };
    request.onsuccess = (event: Event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event: Event) => reject((event.target as IDBOpenDBRequest).error);
  });
};
