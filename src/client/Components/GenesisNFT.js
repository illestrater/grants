import React, { useEffect, useState, useRef } from 'react';
import OpenMarket from './OpenMarket.js';

import FullScreen from '../assets/fullscreen.png';
import MinScreen from '../assets/minscreen.png';
import Muted from '../assets/muted.png';
import Unmuted from '../assets/unmuted.png';

import '../styles.scss';

const contractAddress = '0xc0b4777897a2a373da8cb1730135062e77b7baec';
const nomineeAddress = '0xf6e716ba2a2f4acb3073d79b1fc8f1424758c2aa';

const GenesisNFT = ({ small, nft, src, important, hidden }) => {
  const [loaded, setLoaded] = useState(false);
  const video = useRef();

  useEffect(() => {
    if (src) { setLoaded(true); console.log('LOADED', src) }
  }, [src])

  const [isFullScreen, setFullScreen] = useState(false);
  function fullScreen() {
    console.log
    if (video.current) {
      video.current.muted = false;
      video.current.webkitRequestFullScreen();
      setMuted(false);
    } else {
      if (!isFullScreen) document.documentElement.webkitRequestFullScreen();
      else document.webkitExitFullscreen();
      setFullScreen(!isFullScreen);
    }
  }

  useEffect(() => {
    document.addEventListener('webkitfullscreenchange', (event) => {
      if (!document.webkitIsFullScreen) setFullScreen(false);
      else setFullScreen(true);
    });

    return () => {
      document.removeEventListener('fullscreenchange', () => {});
    }
  }, [])

  const [muted, setMuted] = useState(true);
  function toggleAudio() {
    video.current.muted = !video.current.muted;
    if (video.current.muted) setMuted(true)
    else setMuted(false);
  }

  useEffect(() => {
    if (hidden && video.current) {
      video.current.muted = true;
      setMuted(true);
    }

    if (!hidden && video.current) {
      video.current.currentTime = 0;
    }
  }, [hidden])

  return (
    <div className={ `margin-top flex full-width ${ !small && 'side-space' }` } style={ { display: hidden && 'none' } }>
      { nft ?
        <div className='margin-top-l gallery-container full-width'>
          { (!isFullScreen && !small) &&
            <div className={ `gallery-description` }>
              <div className='text-s'>
                <div className='gallery-plate metal linear'>
                  <div className='text-s'>
                    <strong>{ nft.artist }</strong><br />
                    { nft.country } { nft.year && `(b. ${ nft.year })` }
                  </div>
                  <div className='margin-top-s text-s text-b'>
                    <strong><i>{ nft.name || 'Untitled' }</i></strong>, 2021<br />
                    { nft.imageType.toUpperCase() } as NFT
                  </div>
                  <div className='margin-top-s text-xs'>
                    { nft.description }
                  </div>
                </div>
              </div>
              {/* { !small && <OpenMarket asset={ asset } /> } */}
            </div>
          }
          <div className={ `flex-full center ${ small ? 'gallery-frame-container-small' : 'gallery-frame-container' }` }>
            <div className='frame gallery-art-container'>
              <div className='frame-shadow'>
                { (nft.imageType === 'mp4')  &&
                  <video muted loop autoPlay webkit-playsinline='true' playsInline key={ `${ src }-1` } className={ `gallery-art ${ !loaded && 'hidden'}` } onCanPlay={ () => setLoaded(true) } ref={ video }>
                    <source src={ src } />
                    Sorry, your browser doesn't support embedded videos.
                  </video>
                }
                { (nft.imageType === 'mp4' && !nft.thumbnailType) &&
                  <video muted loop autoPlay webkit-playsinline='true' playsInline key={ `${ src }-2` } className={ `gallery-art ${ loaded && 'hidden'}` }>
                    <source src={ `https://cdn.grants.art/${ nft.imageWeb }` } />
                    Sorry, your browser doesn't support embedded videos.
                  </video>
                }
                { (nft.imageType !== 'mp4') &&
                  <img className={ `gallery-art ${ !loaded && 'hidden'}` } key={ `${ nft.image }` } src={ nft.image } onLoad={ () => setLoaded(true) } />
                }
                { (nft.imageType !== 'mp4' || nft.thumbnailType) &&
                  <img className={ `gallery-art ${ loaded && 'hidden '}` } key={ `${ nft.imageWeb }` } src={ `https://cdn.grants.art/${ nft.imageWeb }` } />
                }
              </div>
            </div>
            { (isFullScreen && !video.current) &&
              <div className='fullscreen-container'>
                <img src={ MinScreen } className='frame-exit pointer' onClick={ () => fullScreen() } />
                <img className='gallery-art-fullscreen' src={ nft.image } />
              </div>
            }
            { !loaded ?
              <div className='loader margin-top-l'>
                <div className='loaderBar'></div>
              </div>
              :
              <div className='controls flex margin-top-s'>
                <div className='flex-full' />
                { video && video.current &&
                  <div onClick={ () => toggleAudio() }>
                    { muted ?
                      <img src={ Muted } className='frame-control' />
                      :
                      <img src={ Unmuted } className='frame-control' />
                    }
                  </div>
                }
                <div onClick={ () => fullScreen() }>
                  <img src={ FullScreen } className='margin-left-s frame-control' />
                </div>
              </div>
            }
            <div className='margin-top' />
          </div>
          { (!isFullScreen && small) &&
            <div className={ `gallery-description` }>
              <div className='text-s'>
                <div className='gallery-plate metal linear'>
                  <div className='text-s'>
                    <strong>{ nft.artist }</strong><br />
                    { nft.country } { nft.year && `(b. ${ nft.year })` }
                  </div>
                  <div className='margin-top-s text-s text-b'>
                    <strong><i>{ nft.name || 'Untitled' }</i></strong>, 2021<br />
                    { nft.imageType.toUpperCase() } as NFT
                  </div>
                  <div className='margin-top-s text-xs'>
                    { nft.description }
                  </div>
                </div>
              </div>
              {/* { !small && <OpenMarket asset={ asset } /> } */}
            </div>
          }
        </div>
        :
        <div className='margin-top'>
          This NFT does not seem to exist...
          <div className='margin-top' />
        </div>
      }
    </div>
  );
}

export default GenesisNFT;