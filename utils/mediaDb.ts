/* eslint-disable @typescript-eslint/no-explicit-any */
export const saveFileToDB = async (id: string, file: File | Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedStore();
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      store.put({ id, file });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject();
    };
  });
};

export const getFileFromDB = async (id: string): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const request = indexedStore();
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction(['media'], 'readonly');
      const store = transaction.objectStore('media');
      const getReq = store.get(id);
      getReq.onsuccess = () => resolve(getReq.result?.file || null);
      getReq.onerror = () => resolve(null);
    };
  });
};

const indexedStore = () => {
  const request = indexedDB.open('VideoCreatorDB', 1);
  request.onupgradeneeded = (e: any) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('media')) {
      db.createObjectStore('media', { keyPath: 'id' });
    }
  };
  return request;
};
