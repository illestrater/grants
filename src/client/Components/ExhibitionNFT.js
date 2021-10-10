import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated } from 'react-spring'
import { Link } from "react-router-dom";
import OpenMarket from './Market/OpenMarket.js';

import Secure from '../assets/secure.png';
import FullScreen from '../assets/fullscreen.png';
import Tile from '../assets/tile.png';
import MinScreen from '../assets/minscreen.png';
import Muted from '../assets/muted.png';
import Unmuted from '../assets/unmuted.png';
import Twitter from '../assets/twitter.png';
import Instagram from '../assets/instagram.png';
import Web from '../assets/website.png';

import '../styles.scss';

function openLink(page)
{
  page = page.replace('@', '');
  let win = window.open(page, '_blank');
  win.focus();
}

const ExhibitionNFT = ({ small, nft, src, important, hidden, contract, setHeight, order, ethPrice, audio, setAudio, url }) => {
  const [loaded, setLoaded] = useState(false);
  const video = useRef();
  const nftRef = useRef();
  const containerRef= useRef();

  const resizeContainer = () => {
    if (!hidden && nftRef && nftRef.current) setHeight(nftRef.current.clientHeight);
  }

  useEffect(() => {
    resizeContainer();
  }, [hidden, nftRef])

  useEffect(() => {
    if (src) {
      setLoaded(true);
    }
  }, [src])

  const [isFullScreen, setFullScreen] = useState(false);
  function fullScreen() {
    if (video.current) {
      video.current.muted = false;
      if (video.current.requestFullScreen) {
        video.current.requestFullScreen();
      } else if (video.current.webkitRequestFullScreen) {
        video.current.webkitRequestFullScreen();
      } else if (video.current.mozRequestFullScreen) {
        video.current.mozRequestFullScreen();
      } else if (video.current.msRequestFullscreen) {
        video.current.msRequestFullscreen();
      } else if (video.current.webkitEnterFullscreen) {
        video.current.webkitEnterFullscreen(); //for iphone this code worked
      }

      setMuted(false);
    } else {
      if (document.documentElement.requestFullScreen) {
        if (isFullScreen) document.exitFullscreen();
        else document.documentElement.requestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
        if (isFullScreen) document.webkitExitFullscreen();
        else document.documentElement.webkitRequestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        if (isFullScreen) document.mozExitFullscreen();
        else document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.msRequestFullscreen) {
        if (isFullScreen) document.msExitFullscreen();
        else document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.webkitEnterFullscreen) {
        if (isFullScreen) document.webkitExitFullscreen();
        else document.documentElement.webkitEnterFullscreen()
      }

      setFullScreen(!isFullScreen);
    }
  }

  const [start, setStart] = useState(null);
  useEffect(() => {
    document.addEventListener('webkitfullscreenchange', (event) => {
      if (!document.webkitIsFullScreen) {
        setFullScreen(false);
        if (video.current) {
          setTimeout(() => {
            video.current.play();
          });
        }
      } else setFullScreen(true);
    });

    return () => {
      document.removeEventListener('fullscreenchange', () => {});
    }
  }, [])

  const [muted, setMuted] = useState(true);
  function toggleAudio() {
    video.current.muted = !video.current.muted;
    setAudio(!video.current.muted)
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
      if (audio) {
        video.current.muted = false;
        setMuted(false);
      }
    }
  }, [hidden])

  useEffect(() => {
    if (loaded && video.current) {
      video.current.addEventListener('pause', (e) => {
        video.current.play();
      });
    }
  }, [loaded])

  const contentProps = useSpring({
    opacity: order !== 2 ? 0 : 1,
    marginLeft: order === 2 ? 0 : (order < 2 ? -2000 : 2000),
    config: { duration: 500 }
  });

  if (nft && nft.art) nft.imageType = nft.art.split('.')[1];
  let website, twitter, instagram;
  if (nft && nft.user && nft.user.website) website = nft.user.website;
  if (nft && nft.user && nft.user.twitter) twitter = nft.user.twitter;
  if (nft && nft.user && nft.user.instagram) instagram = nft.user.instagram;

  return (
    <div style={{ position: 'relative' }} ref={ containerRef }>
      <animated.div
        className={ `margin-top flex full-width` }
        style={{
          position: 'absolute',
          ...contentProps }}
        ref={ nftRef }
      >
        { nft ?
          <div className='gallery-container full-width'>
            { (!isFullScreen && !small) &&
              <div className={ `gallery-description` }>
                <div className='text-s'>
                  <div className='gallery-plate metal linear'>
                    <div className='text-s'>
                      <strong>{ nft.user.artistName }</strong><br />
                      { nft.user.country } { nft.user.birthYear && `(b. ${ nft.user.birthYear })` }
                    </div>
                    <div className='margin-top-s text-s text-b'>
                      <strong><i>{ nft.title || 'Untitled' }</i></strong>, 2021<br />
                      { nft.canvas ?
                        <div className='text-xs'>{ nft.canvas }</div>
                        :
                        <div>{ nft.imageType.toUpperCase() } as NFT</div>
                      }
                    </div>
                    <div className='margin-top-s text-xs'>
                      { nft.description.trim() }
                    </div>
                  </div>
                </div>
                <div className='flex margin-top-s center'>
                  { website && <div><img src={ Web } className='account-social-web pointer' alt='Website' onClick={ () => openLink(website) } /></div> }
                  { twitter && <div><img src={ Twitter } className='account-social pointer' alt='Twitter' onClick={ () => openLink(twitter.substring(0, 4) === 'http' || twitter.substring(0, 3) === 'www' ? twitter : `https://twitter.com/${ twitter }`) } /></div> }
                  { instagram && <div><img src={ Instagram } className='account-social pointer' alt='Instagram' onClick={ () => openLink(instagram.substring(0, 4) === 'http' || instagram.substring(0, 3) === 'www' ? instagram : `https://instagram.com/${ instagram }`) } /></div> }
                </div>
                { (!small && !hidden) && <OpenMarket tokenId={ nft.remint || nft.order } contract={ contract } resizeContainer={ resizeContainer } ethPrice={ ethPrice } artistWallet={ nft.user.wallet } /> }
              </div>
            }
            <div className={ `flex-full center ${ small ? 'gallery-frame-container-small' : 'gallery-frame-container' }` }>
              <div className='frame gallery-art-container'>
                <div className='frame-shadow'>
                  { (nft.imageType === 'mp4' || nft.imageType === 'mov')  &&
                    <video muted loop autoPlay webkit-playsinline='true' playsInline key={ `${ src }-1` } className={ `gallery-art ${ !loaded && 'hidden'}` } onCanPlay={ () => setLoaded(true) } onCanPlayThrough={ () => setLoaded(true) } ref={ video }>
                      <source src={ src } type={ `video/${ nft.imageType }` } />
                      Sorry, your browser doesn't support embedded videos.
                    </video>
                  }
                  { (nft.imageType === 'mp4' || nft.imageType === 'mov') &&
                    <video muted loop autoPlay webkit-playsinline='true' playsInline key={ `${ src }-2` } className={ `gallery-art ${ loaded && 'hidden'}` }>
                      <source src={ `https://cdn.grants.art/${ nft.artWeb }` } type={ `video/${ nft.imageType }` } />
                      Sorry, your browser doesn't support embedded videos.
                    </video>
                  }
                  { (nft.imageType !== 'mp4' && nft.imageType !== 'mov') &&
                    <img className={ `gallery-art ${ !loaded && 'hidden'}` } key={ `${ nft.art }` } src={ `https://cdn.grants.art/${ nft.art }` } onLoad={ () => setLoaded(true) } />
                  }
                  { (nft.imageType !== 'mp4' && nft.imageType !== 'mov') &&
                    <img className={ `gallery-art ${ loaded && 'hidden '}` } key={ `${ nft.artWeb }` } src={ `https://cdn.grants.art/${ nft.artWeb }` } />
                  }
                </div>
              </div>
              { (isFullScreen && !video.current) &&
                <div className='fullscreen-container'>
                  <img src={ MinScreen } className='frame-exit pointer' onClick={ () => fullScreen() } />
                  <img className='gallery-art-fullscreen' src={ `https://cdn.grants.art/${ nft.art }` } />
                </div>
              }
              { !loaded ?
                <div className='loader margin-top-l'>
                  <div className='loaderBar'></div>
                </div>
                :
                <div className='flex margin-top-s'>
                  <Link to={ `/${ url }/all` } className='pointer'>
                    <img src={ Tile } className='frame-control' />
                  </Link>
                  <img src={ Secure } className='margin-left-s margin-top-xs frame-control pointer' onClick={ () => openLink(`https://arweave.net/${ nft.arweave }`) } />
                  <div className='flex-full' />
                  { video && video.current &&
                    <div onClick={ () => toggleAudio() } className='pointer'>
                      { muted ?
                        <img src={ Muted } className='frame-control' />
                        :
                        <img src={ Unmuted } className='frame-control' />
                      }
                    </div>
                  }
                  <div onClick={ () => fullScreen() } className='pointer'>
                    <img src={ FullScreen } className='margin-left-s frame-control' />
                  </div>
                </div>
              }
              <div className='margin-top-s' />
            </div>
            { (!isFullScreen && small) &&
              <div className={ `gallery-description` }>
                <div className='text-s'>
                  <div className='gallery-plate metal linear'>
                    <div className='text-s'>
                      <strong>{ nft.user.artistName }</strong><br />
                      { nft.user.country } { nft.user.birthYear && `(b. ${ nft.user.birthYear })` }
                    </div>
                    <div className='margin-top-s text-s text-b'>
                      <strong><i>{ nft.title || 'Untitled' }</i></strong>, 2021<br />
                      { nft.canvas ?
                        <div className='text-xs'>{ nft.canvas }</div>
                        :
                        <div>{ nft.imageType.toUpperCase() } as NFT</div>
                      }
                    </div>
                    <div className='margin-top-s text-xs'>
                      { nft.description.trim() }
                    </div>
                  </div>
                </div>
                <div className='flex margin-top-s center'>
                  { website && <div><img src={ Web } className='account-social-web pointer' alt='Website' onClick={ () => openLink(website) } /></div> }
                  { twitter && <div><img src={ Twitter } className='account-social pointer' alt='Twitter' onClick={ () => openLink(twitter.substring(0, 4) === 'http' || twitter.substring(0, 3) === 'www' ? twitter : `https://twitter.com/${ twitter }`) } /></div> }
                  { instagram && <div><img src={ Instagram } className='account-social pointer' alt='Instagram' onClick={ () => openLink(instagram.substring(0, 4) === 'http' || instagram.substring(0, 3) === 'www' ? instagram : `https://instagram.com/${ instagram }`) } /></div> }
                </div>
                { (small && !hidden) && <OpenMarket tokenId={ nft.remint || nft.order } contract={ contract } resizeContainer={ resizeContainer } ethPrice={ ethPrice } artistWallet={ nft.user.wallet } /> }
              </div>
            }
          </div>
          :
          <div className='margin-top'>
            This NFT does not seem to exist...
            <div className='margin-top' />
          </div>
        }
      </animated.div>
    </div>
  );
}

export default ExhibitionNFT;