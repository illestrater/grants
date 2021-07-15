import React, { useState, useEffect, useRef } from 'react';
import ReactModal from 'react-modal';
import ReactAutolinker from 'react-autolinker';

import MinScreen from '../../assets/minscreen.png';
import Twitter from '../../assets/twitter.png';
import Instagram from '../../assets/instagram.png';
import Web from '../../assets/website.png';
import '../../styles.scss';

function openLink(page)
{
  page = page.replace('@', '');
  let win = window.open(page, '_blank');
  win.focus();
}

export default function DecidedBlock({ nft, undo, type, blind, metrics, user, finalScore, data, index, width }) {
  nft = data;
  undo = nft.undo;
  type = nft.type;
  blind = nft.blind;
  metrics = nft.metrics;
  user = nft.me;
  finalScore = nft.finalScore;

  const [loaded, didLoad] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const imageType = nft.artWeb.split('.')[1];
  const video = useRef();

  const [isFullScreen, setFullScreen] = useState(false);
  function fullScreen() {
    if (!(imageType === 'mp4' || imageType === 'mov')) {
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
    }

    setFullScreen(!isFullScreen);
  }

  const [score, setScore] = useState(0);
  useEffect(() => {
    if (metrics && nft && nft.scores && nft.scores.length) {
      const foundScore = nft.scores.find(e => e.user === user);
      let totalScore = 0
      metrics.forEach(item => {
        totalScore += foundScore.score[item.metric.toLowerCase().replace(/\s+/g, '')] * item.weight / 100
      })
      totalScore = (totalScore / metrics.length).toFixed(2);
      setScore(totalScore);
    }

    document.addEventListener('webkitfullscreenchange', (event) => {
      if (!document.webkitIsFullScreen) {
        setFullScreen(false);
      }
    });

    return () => {
      document.removeEventListener('fullscreenchange', () => {});
    }
  }, [])

  useEffect(() => {
    if (isFullScreen && (imageType === 'mp4' || imageType === 'mov')) {
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
    }
  }, [isFullScreen])

  useEffect(() => {
    if (loaded && video.current) {
      video.current.addEventListener('pause', (e) => {
        video.current.play();
      });
    }
  }, [loaded])

  return (
    <div className='margin-top-minus'>
      <ReactModal
        isOpen={ infoOpen }
        style={{ content: { margin: 'auto', width: '80%', height: '80%' } }}
        onRequestClose={ () => setInfoOpen(false) }
        shouldCloseOnOverlayClick={ true }
        ariaHideApp={ false }
      >
        <div className='white-space center'>
          <div className='text-s'>
            <div className='gallery-plate metal linear'>
              { !blind ?
                <div className='text-s'>
                  <strong>{ nft.user.artistName }</strong><br />
                  { nft.user.country } { nft.user.birthYear && `(b. ${ nft.user.birthYear })` }
                </div>
              :
                <div className='text-s'>
                  <strong>Artist Info Hidden</strong><br />
                </div>
              }
              <div className='margin-top-s text-s text-b'>
                <strong><i>{ nft.title || 'Untitled' }</i></strong>, 2021<br />
                { nft.canvas ?
                  <div className='text-xs'>{ nft.canvas }</div>
                  :
                  <div>{ imageType.toUpperCase() } as NFT</div>
                }
              </div>
              <div className='margin-top-s text-xs'>
                { nft.description }
              </div>
            </div>
          </div>
          { !blind &&
            <div className='flex margin-top-s center'>
              { nft.user.website && <div><img src={ Web } className='account-social-web pointer' style={{ marginTop: '0.2rem' }} alt='Website' onClick={ () => openLink(nft.user.website) } /></div> }
              { nft.user.twitter && <div><img src={ Twitter } className='account-social pointer' alt='Twitter' onClick={ () => openLink(`https://twitter.com/${ nft.user.twitter }`) } /></div> }
              { nft.user.instagram && <div><img src={ Instagram } className='account-social pointer' alt='Instagram' onClick={ () => openLink(`https://instagram.com/${ nft.user.instagram }`) } /></div> }
            </div>
          }
          { nft.statement &&
            <div className='margin-top-s text-s'>
              <div className='text-m'>Statement of Intent</div>
              <ReactAutolinker text={ nft.statement } />
            </div>
          }
          { nft.additional &&
            <div className='margin-top-s text-s'>
              <div className='text-m'>Additional Info</div>
              <ReactAutolinker text={ nft.additional } />
            </div>
          }
        </div>
      </ReactModal>
      { (isFullScreen && !(imageType === 'mp4' || imageType === 'mov')) &&
        <div className='fullscreen-container'>
          <img src={ MinScreen } className='frame-exit pointer' onClick={ () => fullScreen() } />
          <img className='gallery-art-fullscreen' src={ `https://cdn.grants.art/${ nft.art }` } />
        </div>
      }
      <div className='gallery-block'>
        { (!loaded) && <div className='block-loading'><div className='loading'><div></div><div></div></div></div> }
        { imageType === 'mp4' || imageType === 'mov' ?
          <video muted loop autoPlay webkit-playsinline='true' playsInline preload='none' className='block-art-image' onCanPlay={ () => didLoad(true) }>
            <source src={ `https://cdn.grants.art/${ nft.artWeb }` }
                    type="video/mp4" />
            Sorry, your browser doesn't support embedded videos.
          </video>
          :
          <img src={ `https://cdn.grants.art/${ nft.artWeb }` } className='block-art-image' onLoad={ () => didLoad(true) } />
        }
      </div>
      { score ?
        <div className='text-s margin-top-xs'>
          My Score: { score || 0 }
        </div>
        :
        <></>
      }
      { finalScore ?
        <div className='text-s margin-top-xs'>
          Average Score: { nft.score || 0 }
        </div>
        :
        <></>
      }
      <div className='flex margin-top-xs'>
        { undo &&
          <div className='small-button flex-full' onClick={ () => undo(nft.id, type) }>
            Undo
          </div>
        }
        { undo && <div className='small-space' /> }
        <div className='small-button flex-full' onClick={ () => setInfoOpen(true) }>
          View Info
        </div>
        <div className='small-space' />
        <div className='small-button flex-full' onClick={ () => fullScreen() }>
          Full Screen
        </div>
      </div>
      <div className='margin-top-s' />
      { (isFullScreen && (imageType === 'mp4' || imageType === 'mov')) &&
        <video muted loop autoPlay webkit-playsinline='true' playsInline preload='none' className={ `block-art-image ${ !isFullScreen ? 'hidden' : '' }` } onCanPlay={ () => didLoad(true) } ref={ video }>
          <source src={ `https://cdn.grants.art/${ nft.art }` }
                  type="video/mp4" />
          Sorry, your browser doesn't support embedded videos.
        </video>
      }
    </div>
  );
}
