import React, { useEffect, useReducer, useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useParams, useLocation, useHistory } from "react-router-dom";
import { useStoreState } from 'easy-peasy';
import { Link } from "react-router-dom";
import GenesisNFT from './ExhibitionNFT.js';
import WalletConnect from './WalletConnect.js';
import Resizer from './Tools/Resizer.js';
import { apiUrl } from '../baseUrl';

import '../styles.scss';

const NFT = React.memo(GenesisNFT);

export default function Exhibition() {
  const history = useHistory();
  const small = useStoreState(state => state.app.small);
  const { url, id } = useParams();
  const order = Number(id);
  const location = useLocation().pathname.split('/');

  const [gallery, setGallery] = useState(null);
  const [exhibition, setExhibition] = useState({});
  useEffect(() => {
    console.log('GETTING', url);
    fetch(`${ apiUrl() }/program/getGallery`, {
      method: 'POST',
      body: JSON.stringify({ program: url }),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json())
    .then(json => {
      if (json && json.gallery) setGallery(json.gallery)
      if (json && json.name) setExhibition({ ...json, gallery: undefined });
    });
  }, [])

  const [preload, dispatch] = useReducer((preload, { type, value }) => {
    if (type === 'add') {
      return [...preload, value];
    } else if (type === 'update') {
      const index = preload.findIndex(e => Number(e.order) === value.order);
      if (index) {
        const updated = preload[index];
        if (updated) {
          updated.image = value.image;
          return [
            ...preload.slice(0, index),
            updated,
            ...preload.slice(index + 1)
          ];
        }
      }
    } else if (type === 'remove') {
      return preload.filter(e => Number(e.order) !== value.order);
    }

    return preload;
  }, []);

  useEffect(() => {
    if (gallery && gallery.length && !preload.length) {
      const index = order;
      let before = index - 4;
      if (before <= 0) before = 1;
      let after = index + 4;
      if (after >= gallery.length) after = gallery.length;
      for (let i = before; i <= after; i++) {
        const imageType = gallery[i - 1].art.split('.')[1]
        if (imageType === 'mp4' || imageType === 'mov') {
          dispatch({ type: 'add', value: { order: i, image: null, isVideo: true } });
          fetch(`https://cdn.grants.art/${ gallery[i - 1].art }`).then(async (res) => {
            const blob = await res.blob();
            const image = window.URL.createObjectURL(blob);
            dispatch({ type: 'update', value: { order: i, image } });
          });
        } else {
          let image;
          image = new Image();
          image.src = `https://cdn.grants.art/${ gallery[i - 1].art }`;
          dispatch({ type: 'add', value: { order: i, image } });
        }
      }
    }
  }, [gallery])

  function updatePreload(direction, currentToken) {
    let inc;
    if (direction === 'next') {
      dispatch({ type: 'remove', value: { order: currentToken - 4 }});
      inc = 5;
    } else if (direction === 'previous') {
      dispatch({ type: 'remove', value: { order: currentToken + 4 }});
      inc = -5;
    }

    const newLoad = gallery[currentToken - 1 + inc];
    let imageType
    if (newLoad) imageType = newLoad.art.split('.')[1];

    if (newLoad && (imageType === 'mp4' || imageType === 'mov')) {
      dispatch({ type: 'add', value: { order: currentToken + inc, image: null, isVideo: true } });
      fetch(`https://cdn.grants.art/${ newLoad.art }`).then(async (res) => {
        const blob = await res.blob();
        const image = window.URL.createObjectURL(blob);
        dispatch({ type: 'update', value: { order: currentToken + inc, image } });
      });
    } else if (newLoad) {
      const image = new Image();
      image.src = `https://cdn.grants.art/${ newLoad.art }`;
      dispatch({ type: 'add', value: { order: currentToken + inc, image } });
    }
  }

  function switchPage(direction) {
    if (id === '1' && direction === 'previous') return id;
    else if (gallery && direction === 'next' && Number(id) === gallery.length) return id;
    else if (direction === 'next') return Number(id) + 1;
    else return Number(id) - 1;
  }

  let foundSrc, src1, src2, src3;
  if (preload && preload.length) {
    foundSrc = preload.find(e => { return (e.isVideo && e.order === (order - 1)) });
    src1 = foundSrc ? foundSrc.image : null;

    foundSrc = preload.find(e => { return (e.isVideo && e.order === (order)) });
    src2 = foundSrc ? foundSrc.image : null;

    foundSrc = preload.find(e => { return (e.isVideo && e.order === (order + 1)) });
    src3 = foundSrc ? foundSrc.image : null;
  }

  const handlers = useSwipeable({
    onSwipedRight: (eventData) => { updatePreload('previous', order); history.push(`/${ url }/${ switchPage('previous') }`) },
    onSwipedLeft: (eventData) => { updatePreload('next', order); history.push(`/${ url }/${ switchPage('next') }`) },
    preventDefaultTouchmoveEvent: true,
  });

  const [provider, setProvider] = useState(null);
  const [seaport, setSeaport] = useState(null);
  async function connectWallet() {
    console.log('CONNECTING');
    if (window.ethereum) {
      const createdProvider = window.web3.currentProvider;
      if (!createdProvider.selectedAddress) window.ethereum.enable();
      else {
        const createdSeaport = new OpenSeaPort(createdProvider, {
          networkName: Network.Main
        })

        setProvider(createdProvider);
        setSeaport(createdSeaport);
        getBalance(createdProvider.selectedAddress, createdSeaport);
      }
    }
  }

  return (
    <div className='content-block' { ...handlers }>
      <Resizer />
      <WalletConnect />
      <div className='flex'>
        <Link to={ `/${ url }/${ switchPage('previous') }` } className='relative margin-top-s' onClick={ () => updatePreload('previous', order) }>
          <div className='round'>
            <div id='cta'>
              <span className='arrow-left segunda previous'></span>
              <span className='arrow-left primera previous'></span>
            </div>
          </div>
        </Link>
        <div className='flex-full'>
          <div className='center text-m text-b margin-top-minus'>
            { exhibition.organizer &&
              <Link to={ `/curator/${ exhibition.organizerUrl }` } className='text-rainbow text-s margin-top-minus'>
                <strong>{ exhibition.organizer }</strong>
              </Link>
            }
            { exhibition.name && <div><strong>{ exhibition.name } Exhibition</strong></div> }
          </div>
        </div>
        <Link to={ `/${ url }/${ switchPage('next') }` } className='relative margin-top-s' onClick={ () => updatePreload('next', order) }>
          <div className='round arrow-right'>
            <div id='cta'>
              <span className='arrow primera next'></span>
              <span className='arrow segunda next'></span>
            </div>
          </div>
        </Link>
      </div>
      { (gallery && gallery.length) ?
        <div className='gallery-min-height'>
          <NFT key={ order - 2 } small={ small } nft={ gallery[order - 2] } src={ src1 } contract={ exhibition.contract } important hidden />
          <NFT key={ order - 1} small={ small } nft={ gallery[order - 1] } src={ src2 } contract={ exhibition.contract } important />
          <NFT key={ order } small={ small } nft={ gallery[order] } src={ src3 } contract={ exhibition.contract } important hidden />
        </div>
        :
        <div className='flex center'>
          { gallery ? 
            <div className='margin-top-l'>
              <div>There are no art pieces in this exhibition yet</div>
              <Link to={ `/apply/${ url } ` } className='margin-top text-grey'>You may submit your artwork here!</Link>
            </div>
          :
            <div className='block-loading'><div className='loading'><div></div><div></div></div></div>
          }
        </div>
      }
      <div className='margin-top-l' />
    </div>
  );
}