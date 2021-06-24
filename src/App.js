import React from 'react';

import HomePage from './containers/home';
import DownloadVideo from './containers/downloadVideo'

import './App.css';

function App() {
  const renderPage = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (params) {
      switch(params?.page) {
        case 'download-video':
          return <DownloadVideo />
        default:
          return <HomePage />
      }
    }


    return <HomePage />
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
