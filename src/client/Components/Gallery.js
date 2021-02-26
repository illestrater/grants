import React, { useState, useEffect } from 'react';
import { usePromise } from 'promise-hook';
import { useStoreState } from 'easy-peasy';
import { Link } from 'react-router-dom';
import '@appnest/masonry-layout';

import { apiUrl } from '../baseUrl';

import '../styles.scss';
import FounderGallery from '../FounderGallery.json';
import GalleryBlock from './GalleryBlock';

export default function Gallery() {
  const auth = useStoreState(state => state.user.auth);

  const { isLoading, data } = usePromise(() => getGalleryData(), {
    resolve: true,
    resolveCondition: []
  });

  const showData = FounderGallery ? FounderGallery : null;

  const resize = () => {
    setResizer(true);
  }

  const [listener, setListener] = useState(false);
  useEffect(() => {
    if (!listener) {
      window.addEventListener('resize', resize);
      setListener(true);
    }
  }, [listener]);

  const [resizing, setResizer] = useState(false);

  let initCols;
  if (window.innerWidth <= 450) initCols = '1';
  else if (window.innerWidth > 450 && window.innerWidth <= 700) initCols = '2';
  else if (window.innerWidth > 700 && window.innerWidth <= 1000) initCols = '3'
  else initCols = '4';

  const [cols, setCols] = useState(initCols);
  useEffect(() => {
    if (resizing) {
      if (window.innerWidth <= 450) setCols('1');
      else if (window.innerWidth > 450 && window.innerWidth <= 700) setCols('2');
      else if (window.innerWidth > 700 && window.innerWidth <= 1000) setCols('3')
      else setCols('4');
      setResizer(false);
    }
  }, [resizing]);

  return (
    <div className='content-block'>
      <div className='text-l flex'>
        Sevens Genesis Grant
        <div className='flex-full' />
        { auth.committee && <div className='text-s flex'>
          <div className='flex-full' />
            <Link to='/curation' className='text-grey pointer'>Committee Curation</Link>
          </div>
        }
      </div>
      <div className='text-s margin-top-s text-desc'>
        Curating, educating, and funding artists' first digital signature
      </div>
      <div className='text-s margin-top-s text-desc'>
        <em>Grant recipients will be highlighted below - temporary gallery of founder's favorite NFTs</em>
      </div>
      <div className='cols'>
        { isLoading ?
          <div className='gallery-container margin-top'>
            <div className='margin-top-l'>
              <div className="loading"><div></div><div></div></div>
            </div>
          </div>
          :
          <div className='margin-top'>
            <masonry-layout cols={ cols } >
              {
                showData && showData.map((item, index)=>{
                  return (
                    <GalleryBlock item={ item } key={ index } />
                  );
                })
              }
            </masonry-layout>
          </div>
        }
      </div>
    </div>
  );
}

const getGalleryData = () => {
  return fetch(`${ apiUrl() }/galleryData`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then(res => res.json());
}