import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

import './App.css';

function App() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const [videoSrc, setVideoSrc] = useState('');
  const ffmpeg = createFFmpeg({
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
  });

  let currentSource = null
  window.addEventListener('message', (evt) => {
    currentSource = evt.source
    if (!videoSrc) {
      doTranscode(evt.data)
    }
  }, false);

  const doTranscode = async (images) => {
    if (images.length) {
      try {
        const fileName = params?.filename || 'Paper_Wallet__QRCode'
        await ffmpeg.load();
        for (let i = 0; i < images.length; i += 1) {
          ffmpeg.FS('writeFile', `img00${i}.png`, await fetchFile(images[i]));
        }
        const last = images.length - 1;
        ffmpeg.FS('writeFile', `img00${last + 1}.png`, await fetchFile(images[last]));
        await ffmpeg.run('-pattern_type', 'glob', '-r', '1/2', '-i', '*.png', '-c:v', 'libx264', '-r', '2', '-pix_fmt', 'yuv420p', `${fileName}.mp4`);
  
        const data = ffmpeg.FS('readFile', `${fileName}.mp4`);
        for (let i = 0; i < images.length; i += 1) {
          ffmpeg.FS('unlink', `img00${i}.png`);
        }
        ffmpeg.FS('unlink', `img00${last + 1}.png`);
        const videoUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        setVideoSrc(videoUrl);
        currentSource.postMessage({
          videoUrl,
          error: null
        } , "*");
      } catch {
        currentSource.postMessage({
          videoUrl: '',
          error: 'error creating video'
        } , "*");
      }
    }
  }

  return <div className="App">Creating QR Code Video</div>;
}

export default App;
