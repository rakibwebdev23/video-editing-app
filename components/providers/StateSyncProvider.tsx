'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '../../store/editorStore';
import { loadState } from '../../store/persistenceMiddleware';
import { setTotalDuration } from '../../store/slices/timelineSlice';
import { addResource } from '../../store/slices/uiSlice';
import { getFileFromDB } from '../../utils/mediaDb';
import { MediaResource } from '../../types/editor.types';

export default function StateSyncProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      if (savedState.timeline?.totalDuration) {
        dispatch(setTotalDuration(savedState.timeline.totalDuration));
      }

      if (savedState.ui?.resources) {
        const restoreAll = async () => {
          for (const res of savedState.ui.resources as MediaResource[]) {
            // Restore Blob URLs from IndexedDB sequentially
            const dbResult = await getFileFromDB(res.id);
            if (dbResult) {
              const newUrl = URL.createObjectURL(dbResult.file);
              let newThumb = res.thumbnail;
              
              if (dbResult.thumbnail) {
                newThumb = URL.createObjectURL(dbResult.thumbnail);
              } else if (res.type === 'image') {
                newThumb = newUrl;
              }

              dispatch(addResource({
                ...res,
                url: newUrl,
                thumbnail: newThumb
              }));
            } else {
              dispatch(addResource(res));
            }
          }
        };
        restoreAll();
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}
