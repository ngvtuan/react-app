import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import QRCode from 'qrcode.react';

import { splitStringIntoChunks } from '../../common/utils'

import './styles.css';

function DownloadVideo() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const [videoSrc, setVideoSrc] = useState('');
  const ffmpeg = createFFmpeg({
    log: process.env.NODE_ENV === 'development',
    corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
  });

  const doTranscode = async () => {
    const fileName = params?.filename || 'Paper_Wallet__QRCode'
    const canvas = document.querySelectorAll('.qrcode')
    const images = []
    for (let i = 0; i < canvas.length; i++) {
      var img = canvas[i].toDataURL("image/png");
      images.push(img)
    }
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

    if (params?.view !== 'video') {
      const downloadLink = document.createElement('a')
      downloadLink.href = videoUrl
      downloadLink.download = `${fileName}.mp4`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  };

  let qrcode = []
  if (params?.val) {
    qrcode = splitStringIntoChunks(params.val, parseInt(params.chunks) || 1000)
  }

  const renderContent = () => {
    if (params?.view === 'video') {
      if (!videoSrc) {
        <div>Loading...</div>
      }

      return (
        <video src={videoSrc} controls autoPlay className="video"></video>
      )
    }

    return (
      <button onClick={doTranscode} className="btnDownload">Download QR Code Video</button>
    )
  }
  const totalQRCode = qrcode.length;
  return (
    <div className="download-video">
      {renderContent()}
      <div className="qrcode-container">
        {qrcode?.map((qr, idx) => (
          <QRCode value={`${idx}::${totalQRCode}::${qr}`} key={idx} size={1024} className="qrcode" />
        ))}
      </div>
    </div>
  );
}

export default DownloadVideo;
