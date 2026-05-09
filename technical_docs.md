# Video Creator — Technical Project Documentation

This document provides a comprehensive overview of the **Video Creator** application, a professional-grade browser-based video editing suite built with Next.js, FFmpeg.wasm, and GSAP.

## 1. Core Technology Stack (Industry Standards)

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Framework** | Next.js (React 19) | Server-side rendering safety with client-side interactivity. |
| **Video Engine** | FFmpeg.wasm | On-device high-fidelity H.264 video encoding. |
| **Motion Engine** | GSAP (GreenSock) | Hardware-accelerated animations and timeline transitions. |
| **State Management** | Redux Toolkit | Centralized project state (Timeline, Elements, UI). |
| **Persistence** | IndexedDB & LocalStorage | Permanent storage for project data and large media files. |
| **Rendering** | html-to-image | High-speed canvas frame capture for export. |
| **Icons** | Lucide React | Professional, accessible UI iconography. |

---

## 2. Architecture Overview

The project follows a **Modular Component Architecture**, ensuring scalability and performance:

### A. The State Engine (Redux)
- **Timeline Slice**: Manages playhead position (`currentTime`), FPS, and total project duration.
- **Pages Slice**: Handles "Scenes" or "Pages," including backgrounds, layout choices, and transitions.
- **Elements Slice**: Manages individual media objects (Images, Videos, Text), their coordinates, sizes, and animations.
- **UI Slice**: Handles the media library resources and modal states.

### B. The Persistence Layer
- **Media Vault (IndexedDB)**: Large files (Video/Audio) are stored in a persistent browser database.
- **Project State (LocalStorage)**: The JSON structure of the timeline is saved to LocalStorage, ensuring work is never lost.
- **StateSyncProvider**: A custom React component that safely rehydrates the project data on startup without causing hydration mismatches.

---

## 3. How the Video Editor Works

### 🎞️ Workflow 1: Media Management
1. **Upload**: Files are processed using `URL.createObjectURL` for instant preview and simultaneously saved to **IndexedDB** for permanence.
2. **Library**: Resources are listed in the sidebar with dynamic metadata (duration, type).
3. **Smart Layout**: When adding media, the engine detects available slots in the current page layout (e.g., Split Screen) and snaps the media into place automatically.

### 🎬 Workflow 2: Editing & Timeline
1. **Playhead Logic**: A global interval (30 FPS) updates the `currentTime`. Elements listen to this time and toggle visibility or trigger GSAP animations based on their `startTime` and `duration`.
2. **Animation Layer**: GSAP is used to apply professional entry (Fade, Pop, Slide) and exit effects to elements.
3. **Canvas Engine**: A responsive container that maintains a fixed 1280x720 (720p) internal coordinate system, regardless of the user's screen size.

### 📤 Workflow 3: Professional Export
1. **Frame Capture**: The app loops through the timeline and uses `html-to-image` to capture each second as a series of high-quality JPEG frames.
2. **WASM Muxing**: `FFmpeg.wasm` (running in a dedicated Worker) picks up these frames and the background audio.
3. **Encoding**: It encodes the frames into an **MP4 (H.264/AAC)** file at the specified framerate.
4. **Muxing**: It merges the audio track into the video and provides a final download URL.

---

## 4. Production-Level Implementation Rules

To ensure this project meets industry standards for production, we follow these strict rules:

- **Strict Client-Side WASM**: FFmpeg and large media libraries are strictly initialized on the client to avoid 500 errors during Next.js SSR.
- **Accessibility (A11y)**: All interactive elements have descriptive IDs and ARIA-compliant names (e.g., `ImageIcon` instead of `Image` for decorative icons).
- **Security (COOP/COEP)**: Configured headers to allow SharedArrayBuffer, enabling multi-threaded high-speed video encoding.
- **Performance**: Optimized rendering using `React.memo` and hardware-accelerated CSS/GSAP to ensure the editor feels "snappy" even with 4K assets.

---

## 5. Development Guide

### Prerequisites
- Node.js 20+
- Modern Browser (Chrome/Edge/Brave) for WASM support.

### Setup Command
```bash
# Install dependencies
npm install

# Run locally
npm run dev
```

### Building for Production
```bash
# Create production bundle
npm run build

# Start production server
npm run start
```
