import React, { useState, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

import './App.css';


function App() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const fileName = params?.filename || 'Paper_Wallet__QRCode'
  const [videoSrc, setVideoSrc] = useState('');
  const ffmpeg = createFFmpeg({
    log: process.env.NODE_ENV === 'development',
    corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
  });

  useEffect(() => {
    if (!videoSrc) {
      doTranscode()
    }
  })

  const doTranscode = async () => {
    let images = []
    if (window.frameElement) {
      images = window.frameElement.attributes["data-images"].value
      images = JSON.parse(images)
    }
    if (images.length) {
      const frameSpeed = images.length * 32;
      await ffmpeg.load();
      for (let i = 0; i < images.length; i += 1) {
        ffmpeg.FS('writeFile', `img00${i}.png`, await fetchFile(images[i]));
      }
  
      await ffmpeg.run('-framerate', '60', '-pattern_type', 'glob', '-i', '*.png', '-vf', `setpts=${frameSpeed}*PTS`, '-c:a', 'copy', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${fileName}.mp4`);
  
      const data = ffmpeg.FS('readFile', `${fileName}.mp4`);
      for (let i = 0; i < images.length; i += 1) {
        ffmpeg.FS('unlink', `img00${i}.png`);
      }
      
      const videoUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      setVideoSrc(videoUrl);
    }
  }

  return (
    <div className="App">
      <div id="videourl">
      {videoSrc || 'inprocess'}
      </div>
      <div id="videotag">
        <video width="320" height="240" src={videoSrc} controls />
      </div>
    </div>
  );
}

export default App;
