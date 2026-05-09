/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '../../store/editorStore';
import { loadState } from '../../store/persistenceMiddleware';
import { setTotalDuration } from '../../store/slices/timelineSlice';
import { addResource } from '../../store/slices/uiSlice';
import { getFileFromDB } from '../../utils/mediaDb';

export default function StateSyncProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      if (savedState.timeline?.totalDuration) {
        dispatch(setTotalDuration(savedState.timeline.totalDuration));
      }
      
      if (savedState.ui?.resources) {
        savedState.ui.resources.forEach(async (res: any) => {
          // Restore Blob URLs from IndexedDB
          const file = await getFileFromDB(res.id);
          if (file) {
            const newUrl = URL.createObjectURL(file);
            dispatch(addResource({ 
              ...res, 
              url: newUrl, 
              thumbnail: res.type === 'image' ? newUrl : res.thumbnail 
            }));
          } else {
            // Fallback for missing files
            dispatch(addResource(res));
          }
        });
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}
