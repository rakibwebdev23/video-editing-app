import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoading = false;

const CORE_VERSION = '0.12.10';
const BASE_URL = `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/umd`;

/**
 * Loads and returns the FFmpeg instance (singleton)
 */
export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;
  
  if (isLoading) {
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (ffmpeg && ffmpeg.loaded) return ffmpeg;
  }

  isLoading = true;
  try {
    const ff = new FFmpeg();
    
    ff.on('log', ({ message }) => {
      console.log('[FFmpeg Log]', message);
    });

    await ff.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.worker.js`, 'text/javascript'),
    });

    ffmpeg = ff;
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw error;
  } finally {
    isLoading = false;
  }
}

/**
 * Generates a thumbnail for a video file
 */
export async function generateVideoThumbnail(videoUrl: string, timeSeconds: number = 1): Promise<string> {
  const ff = await getFFmpeg();
  
  const inputName = 'input.mp4';
  const outputName = 'thumb.jpg';

  try {
    // Write video to virtual FS
    const fileData = await fetchFile(videoUrl);
    await ff.writeFile(inputName, fileData);

    // Run ffmpeg command to extract one frame
    await ff.exec([
      '-ss', timeSeconds.toString(),
      '-i', inputName,
      '-frames:v', '1',
      '-q:v', '2',
      outputName
    ]);

    // Read result
    const data = await ff.readFile(outputName);
    // Safe conversion: data is a Uint8Array (possibly with a SharedArrayBuffer)
    // We create a copy to ensure it's a standard Uint8Array for Blob creation
    const uint8Data = new Uint8Array(data as Uint8Array);
    const blob = new Blob([uint8Data], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch (err) {
    const error = err as Error;
    console.error('FFmpeg Thumbnail Error:', error);
    
    // If it's a memory error, reset the singleton so it reloads next time
    if (error.message?.includes('memory access out of bounds') || error.message?.includes('out of memory')) {
      console.warn('Resetting FFmpeg due to memory error...');
      ffmpeg = null;
    }
    
    return '';
  } finally {
    // Clean up virtual FS
    try {
      await ff.deleteFile(inputName);
      await ff.deleteFile(outputName);
    } catch (e) {}
  }
}

/**
 * Muxes a list of frames and an audio file into an MP4
 */
export async function muxVideo(
  fps: number,
  frameCount: number,
  audioUrl?: string,
  onLog?: (msg: string) => void
): Promise<string> {
  const ff = await getFFmpeg();
  
  if (onLog) {
    ff.on('log', ({ message }) => onLog(message));
  }

  const args = [
    '-framerate', fps.toString(),
    '-i', 'frame_%05d.jpg',
  ];

  if (audioUrl) {
    await ff.writeFile('input_audio.mp3', await fetchFile(audioUrl));
    args.push('-i', 'input_audio.mp3');
  }

  args.push(
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p'
  );

  if (audioUrl) {
    args.push('-c:a', 'aac', '-shortest');
  }

  args.push('output.mp4');

  try {
    await ff.exec(args);

    const data = await ff.readFile('output.mp4');
    const uint8Data = new Uint8Array(data as Uint8Array);
    const blob = new Blob([uint8Data], { type: 'video/mp4' });
    return URL.createObjectURL(blob);
  } finally {
    // Clean up frames and audio
    try {
      if (audioUrl) await ff.deleteFile('input_audio.mp3');
      await ff.deleteFile('output.mp4');
      for (let i = 0; i < frameCount; i++) {
        await ff.deleteFile(`frame_${i.toString().padStart(5, '0')}.jpg`);
      }
    } catch (e) {}
  }
}
