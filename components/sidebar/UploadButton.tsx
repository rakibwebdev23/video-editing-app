'use client';
import React, { useRef } from 'react';
import { CloudUpload } from 'lucide-react';
import { useAppDispatch } from '../../store/editorStore';
import { addResource } from '../../store/slices/uiSlice';
import { MediaResource } from '../../types/editor.types';
import { saveFileToDB } from '../../utils/mediaDb';

export default function UploadButton() {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

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
    console.log("Handling files:", files.length);
    try {
      for (const file of Array.from(files)) {
        console.log("Processing file:", file.name, file.type);
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video');
        const isAudio = file.type.startsWith('audio');
        const isImage = file.type.startsWith('image');
        
        const type: MediaResource['type'] = isImage ? 'image' : isVideo ? 'video' : 'audio';
        
        let duration = 0;
        if (isVideo || isAudio) {
          duration = await getMediaDuration(file);
        }

        const resource: MediaResource = {
          id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name.length > 20 ? file.name.slice(0, 18) + '...' : file.name,
          type,
          url,
          thumbnail: isImage ? url : undefined,
          size: file.size,
          duration: duration > 0 ? duration : undefined,
        };
        
        // Save to permanent DB for persistence across reloads
        await saveFileToDB(resource.id, file);
        
        console.log("Adding resource:", resource);
        dispatch(addResource(resource));
        console.log("Resource dispatched successfully");
      }
    } catch (err) {
      console.error("Upload process error:", err);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
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
        Upload
      </label>
    </div>
  );
}
