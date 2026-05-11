'use client';
import React, { useRef } from 'react';
import { CloudUpload } from 'lucide-react';
import { useAppDispatch } from '../../store/editorStore';
import { addResource } from '../../store/slices/uiSlice';
import { MediaResource } from '../../types/editor.types';
import { saveFileToDB } from '../../utils/mediaDb';
import { generateVideoThumbnail } from '../../utils/ffmpeg';
import { useState } from 'react';

export default function UploadButton() {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const isVideo = file.type.startsWith('video');
      const element = document.createElement(isVideo ? 'video' : 'audio');
      
      const timeout = setTimeout(() => {
        console.warn("Metadata load timeout for:", file.name);
        resolve(10);
      }, 3000);

      element.onloadedmetadata = () => {
        clearTimeout(timeout);
        resolve(element.duration || 10);
      };
      
      element.onerror = () => {
        clearTimeout(timeout);
        console.error("Metadata load error for:", file.name);
        resolve(10);
      };
      
      element.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      for (const file of Array.from(files)) {
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video');
        const isAudio = file.type.startsWith('audio');
        const isImage = file.type.startsWith('image');
        const type: MediaResource['type'] = isImage ? 'image' : isVideo ? 'video' : 'audio';
        
        // Initial resource object (with placeholder thumbnail)
        const resourceId = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const resource: MediaResource = {
          id: resourceId,
          name: file.name.length > 24 ? file.name.slice(0, 22) + '...' : file.name,
          type,
          url,
          thumbnail: isImage ? url : undefined,
          size: file.size,
        };

        // Add to state immediately so user sees it in the sidebar
        dispatch(addResource(resource));

        // Background processing for metadata and thumbnails
        (async () => {
          try {
            let duration = 0;
            let thumbnail = resource.thumbnail;

            if (isVideo || isAudio) {
              duration = await getMediaDuration(file);
            }

            if (isVideo) {
              try {
                const generatedThumb = await generateVideoThumbnail(url);
                if (generatedThumb) thumbnail = generatedThumb;
              } catch (e) {
                console.warn("Background thumbnail generation failed:", e);
              }
            }

            // Update resource in state and DB once processing is done
            const updatedResource = { ...resource, duration: duration > 0 ? duration : undefined, thumbnail };
            
            let thumbBlob: Blob | undefined;
            if (thumbnail && thumbnail.startsWith('blob:')) {
              thumbBlob = await fetch(thumbnail).then(r => r.blob()).catch(() => undefined);
            }
            
            await saveFileToDB(resourceId, file, thumbBlob);
            dispatch(addResource(updatedResource)); // addResource is idempotent, it will update existing
          } catch (processErr) {
            console.error("Background file processing error:", processErr);
            // Still save the basic file so it's not lost
            await saveFileToDB(resourceId, file).catch(() => {});
          }
        })();
      }
    } catch (err) {
      console.error("Upload handler error:", err);
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const inputId = `upload-input-field`;

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        style={{
          position: 'absolute',
          width: 0, height: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
        onChange={e => {
          console.log("Input onChange triggered:", e.target.files?.length);
          if (e.target.files) handleFiles(e.target.files);
        }}
      />
      <label
        htmlFor={inputId}
        className="btn-primary"
        style={{ fontSize: 12, padding: '6px 12px', display: 'flex', cursor: 'pointer', alignItems: 'center', gap: 6 }}
        onClick={() => console.log("Upload label/button clicked")}
      >
        <CloudUpload size={14} />
        {isProcessing ? 'Processing...' : 'Upload'}
      </label>
    </div>
  );
}
