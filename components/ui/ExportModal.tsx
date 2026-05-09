/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useRef } from 'react';
import { X, Download, Video, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { setExportModalOpen } from '../../store/slices/uiSlice';
import { setCurrentTime } from '../../store/slices/timelineSlice';
import { toJpeg } from 'html-to-image';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function ExportModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(s => s.ui.isExportModalOpen);
  const elements = useAppSelector(s => s.elements.elements);
  const pages = useAppSelector(s => s.pages.pages);
  const totalDuration = useAppSelector(s => s.timeline.totalDuration);
  
  const [status, setStatus] = useState<'idle' | 'rendering' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const startExport = async () => {
    try {
      setStatus('rendering');
      setProgress(0);
      
      const ffmpeg = await loadFFmpeg();

      const fps = 30;
      const totalFrames = Math.ceil(totalDuration * fps);
      const container = document.getElementById('canvas-frame-container');
      
      if (!container) {
        throw new Error('Canvas container not found');
      }

      // Hide cursor/selection during export
      const originalOutline = container.style.outline;
      container.style.outline = 'none';

      for (let i = 0; i < totalFrames; i++) {
        const time = i / fps;
        
        // Update playhead
        dispatch(setCurrentTime(time));
        
        // Check if any video elements are active at this time to determine wait duration
        const hasVideo = elements.some(el => 
          el.type === 'video' && 
          time >= el.startTime && 
          time <= (el.startTime + el.duration)
        );

        // Wait for rendering and seeking
        // Videos need more time to seek (90ms), static elements are faster (40ms)
        await new Promise(resolve => setTimeout(resolve, hasVideo ? 90 : 40));

        // Capture frame with optimized settings
        const dataUrl = await toJpeg(container, {
          quality: 0.85,
          width: 1280,
          height: 720,
          // Optimization: skip features we don't need
          cacheBust: false,
          includeQueryParams: false,
          // Fix for SecurityError: ignore external font CSS rules
          skipFonts: true,
          fontEmbedCSS: '',
          filter: (node: any) => {
            // Completely ignore Google Fonts and external stylesheets during capture
            if (node.tagName === 'LINK' && node.href?.includes('fonts.googleapis.com')) return false;
            if (node.tagName === 'STYLE' && node.innerHTML?.includes('fonts.googleapis.com')) return false;
            return true;
          },
        });

        const frameData = await fetchFile(dataUrl);
        await ffmpeg.writeFile(`frame_${i.toString().padStart(5, '0')}.jpg`, frameData);
        
        // Update progress more frequently
        if (i % 5 === 0) {
          setProgress((i / totalFrames) * 90);
        }
      }

      // Handle Audio (Muxing)
      const audioElements = elements.filter(el => el.type === 'audio');
      let hasAudio = false;

      if (audioElements.length > 0) {
        try {
          // For now, we take the primary background audio (first one)
          // In a full implementation, we would mix all audio tracks using ffmpeg filters
          const mainAudio = audioElements[0];
          const audioData = await fetchFile(mainAudio.url);
          await ffmpeg.writeFile('input_audio.mp3', audioData);
          hasAudio = true;
        } catch (audioErr) {
          console.warn('Failed to load audio for export:', audioErr);
        }
      }

      // Run FFmpeg command with faster preset
      const ffmpegArgs = [
        '-framerate', `${fps}`,
        '-i', 'frame_%05d.jpg',
      ];

      if (hasAudio) {
        ffmpegArgs.push('-i', 'input_audio.mp3');
      }

      ffmpegArgs.push(
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p'
      );

      if (hasAudio) {
        ffmpegArgs.push('-c:a', 'aac', '-shortest');
      }

      ffmpegArgs.push('output.mp4');

      await ffmpeg.exec(ffmpegArgs);

      const data = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([data as any], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      
      setExportUrl(url);
      setStatus('completed');
      setProgress(100);
      
      // Reset outline
      container.style.outline = originalOutline;

    } catch (err: any) {
      console.error('Export Error:', err);
      setErrorMessage(err.message || 'An error occurred during export');
      setStatus('error');
    }
  };

  const downloadProjectFile = () => {
    const projectData = { version: '1.0', pages, elements };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    // If rendering, we might want to stop FFmpeg, but for now we just close
    setStatus('idle');
    setExportUrl(null);
    setProgress(0);
    dispatch(setExportModalOpen(false));
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: 520, background: 'var(--bg-panel)', borderRadius: 16,
          border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Video size={20} color="var(--accent-blue)" /> Finalize & Export
          </h2>
          <button className="btn-icon" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 32 }}>
          {status === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: 'rgba(59,130,246,0.05)', padding: 20, borderRadius: 12, border: '1px dashed var(--accent-blue)' }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Our <strong>High-Performance Render Engine</strong> will now compile your timeline into a professional MP4 video. This process ensures frame-perfect quality for your images, videos, and animations.
                </p>
              </div>
              <button className="btn-primary" style={{ height: 48, justifyContent: 'center', fontSize: 15 }} onClick={startExport}>
                <Download size={20} /> Export as MP4
              </button>
            </div>
          )}

          {status === 'rendering' && (
            <div style={{ textAlign: 'center' }}>
              <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 20px', color: 'var(--accent-blue)' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Compiling your Masterpiece</h3>
              <div style={{ width: '100%', height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', transition: 'width 0.4s ease' }} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rendering frame {Math.round(progress * 10)}... Please wait.</p>
            </div>
          )}

          {status === 'completed' && (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={64} color="var(--accent-green)" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Export Ready!</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>Your video has been rendered and is ready for your file manager.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href={exportUrl!} download="final-video.mp4" className="btn-primary" style={{ flex: 1, height: 48, justifyContent: 'center', background: 'var(--accent-green)' }}>
                  <Download size={20} /> Download MP4
                </a>
                <button className="btn-ghost" onClick={downloadProjectFile} style={{ border: '1px solid var(--border-color)' }}>
                  Save .json
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center' }}>
              <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Export Failed</h3>
              <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 24 }}>{errorMessage}</p>
              <button className="btn-primary" onClick={() => setStatus('idle')}>Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
