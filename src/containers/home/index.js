import React from 'react';

let dataImage = " iframe data";

if (window.frameElement) {
   dataImage += window.frameElement.attributes["data-image"].value
}

export default function HomePage() {
  return (
    <div>Home page {dataImage} <div id="videoURL" data-videourl="https://www.w3schools.com/html/mov_bbb.mp4">https://www.w3schools.com/html/mov_bbb.mp4</div></div>
  )
}