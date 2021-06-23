import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import QRCode from 'qrcode.react';

import './App.css';

function App() {
  const [videoSrc, setVideoSrc] = useState('');
  const [img, setImg] = useState('');
  const [message, setMessage] = useState('Click Start to transcode');
  const ffmpeg = createFFmpeg({
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
  });

  const splitStringIntoChunks = (str, chunkQuantity) => {
    const numChunks = Math.ceil(str.length / chunkQuantity)
    const chunks = new Array(numChunks)

    for (let i = 0, o = 0; i < numChunks; ++i, o += chunkQuantity) {
      chunks[i] = str.substr(o, chunkQuantity)
    }

    return chunks
  }


  const doTranscode = async () => {
    const svgs = document.querySelectorAll('.qrcode')
    const images = ["a", "b", "c", "d"]
    // for (let i = 0; i < svgs.length; i++) {
    //   const str = new XMLSerializer().serializeToString(svgs[i])
    //   images.push(window.btoa(str))
    // }
    const frameSpeed = images.length * 32;

    setImg(images[0])
    await ffmpeg.load();
    setMessage('Loading ffmpeg-core.js');
    setMessage('Start transcoding');

    for (let i = 0; i < images.length; i += 1) {
      ffmpeg.FS('writeFile', `img00${i}.png`, await fetchFile(`./assets/qrcode/img00${i}.png`));
    }

    await ffmpeg.run('-framerate', '60', '-pattern_type', 'glob', '-i', '*.png', '-vf', `setpts=${frameSpeed}*PTS`, '-c:a', 'copy', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'out.mp4');
    setMessage('Complete transcoding');
    const data = ffmpeg.FS('readFile', 'out.mp4');
    for (let i = 0; i < images.length; i += 1) {
      ffmpeg.FS('unlink', `img00${i}.png`);;
    }
    setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })));
  };
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  let qrcode = []
  if (params?.val) {
    qrcode = splitStringIntoChunks(params.val, 300)
  }

  return (
    <div className="App">
      <p/>
      {videoSrc ? <><video src={videoSrc} controls style={{ width: '150px', height: "150px" }}></video><br/><a href={videoSrc} target="_blank" rel="noopener noreferrer">Download</a><br/></> : null}
      <button onClick={doTranscode}>Start</button>
      <p>{message}</p>
      {qrcode?.map((qr, idx) => (
        <QRCode value={qr} key={idx} renderAs="svg" className="qrcode" style={{ marginBottom: '20px',marginRight: '20px', width: '1px', height: '1px' }} />
      ))}
      <div style={{ marginTop: '20px' }}>
        <img src={`data:image/svg+xml;base64,${img}`} alt="" />
      </div>
    </div>
  );
}

export default App;
